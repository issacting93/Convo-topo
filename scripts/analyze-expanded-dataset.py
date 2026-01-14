#!/usr/bin/env python3
"""
Analyze Expanded Dataset (563 conversations)

Calculates updated statistics for role distributions, percentages, and key findings.
"""

import json
import os
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List

OUTPUT_DIR = Path("public/output")

def load_all_conversations() -> List[Dict]:
    """Load all conversation files"""
    conversations = []
    
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        return conversations
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"📂 Loading {len(json_files)} conversations...")
    
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data['_source_file'] = file_path.name
                conversations.append(data)
        except Exception as e:
            print(f"⚠️  Error loading {file_path.name}: {e}")
    
    return conversations


def calculate_role_distributions(conversations: List[Dict]) -> Dict:
    """Calculate role distributions and dominant role pairs"""
    human_roles = defaultdict(float)
    ai_roles = defaultdict(float)
    human_dominant = Counter()
    ai_dominant = Counter()
    role_pairs = Counter()
    
    # Track static vs dynamic conversations
    static_conversations = 0
    seeker_expert_static = 0
    information_seeker_facilitator = 0
    
    for conv in conversations:
        cls = conv.get('classification')
        if not cls:
            continue
        
        human_role = cls.get('humanRole', {})
        ai_role = cls.get('aiRole', {})
        
        if human_role and 'distribution' in human_role:
            dist = human_role.get('distribution', {})
            for role, prob in dist.items():
                human_roles[role] += prob
            
            max_role = max(dist.items(), key=lambda x: x[1])[0] if dist else None
            if max_role:
                human_dominant[max_role] += 1
        
        if ai_role and 'distribution' in ai_role:
            dist = ai_role.get('distribution', {})
            for role, prob in dist.items():
                ai_roles[role] += prob
            
            max_role = max(dist.items(), key=lambda x: x[1])[0] if dist else None
            if max_role:
                ai_dominant[max_role] += 1
        
        # Role pairs
        if human_role and ai_role:
            h_dist = human_role.get('distribution', {})
            a_dist = ai_role.get('distribution', {})
            h_max = max(h_dist.items(), key=lambda x: x[1])[0] if h_dist else None
            a_max = max(a_dist.items(), key=lambda x: x[1])[0] if a_dist else None
            
            if h_max and a_max:
                pair = f"{h_max}→{a_max}"
                role_pairs[pair] += 1
                
                # Track specific pairs (handle different naming conventions)
                h_lower = h_max.lower()
                a_lower = a_max.lower()
                
                if ("information-seeker" in h_lower or "seeker" in h_lower) and "facilitator" in a_lower:
                    information_seeker_facilitator += 1
                if ("information-seeker" in h_lower or "seeker" in h_lower) and ("expert-system" in a_lower or "expert" in a_lower):
                    seeker_expert_static += 1
                
                # Check if static (high confidence in dominant pair)
                h_conf = human_role.get('confidence', 0)
                a_conf = ai_role.get('confidence', 0)
                if h_conf > 0.8 and a_conf > 0.8:
                    static_conversations += 1
    
    total = len(conversations)
    
    # Calculate non-seeker→expert count
    non_seeker_expert = 0
    for pair, count in role_pairs.items():
        if not (pair.startswith("Seeker→Expert") or pair.startswith("Information-Seeker→Expert")):
            non_seeker_expert += count
    
    return {
        'total': total,
        'human': {
            'average': {role: prob / total for role, prob in human_roles.items()},
            'dominant': dict(human_dominant),
            'dominant_pct': {role: count / total * 100 for role, count in human_dominant.items()}
        },
        'ai': {
            'average': {role: prob / total for role, prob in ai_roles.items()},
            'dominant': dict(ai_dominant),
            'dominant_pct': {role: count / total * 100 for role, count in ai_dominant.items()}
        },
        'pairs': dict(role_pairs),
        'pairs_pct': {pair: count / total * 100 for pair, count in role_pairs.items()},
        'static_conversations': static_conversations,
        'static_pct': (static_conversations / total * 100) if total > 0 else 0,
        'seeker_expert_static': seeker_expert_static,
        'seeker_expert_pct': (seeker_expert_static / total * 100) if total > 0 else 0,
        'information_seeker_facilitator': information_seeker_facilitator,
        'information_seeker_facilitator_pct': (information_seeker_facilitator / total * 100) if total > 0 else 0,
        'non_seeker_expert': non_seeker_expert,
        'non_seeker_expert_pct': (non_seeker_expert / total * 100) if total > 0 else 0
    }


def analyze_by_source(conversations: List[Dict]) -> Dict:
    """Analyze breakdown by data source"""
    sources = defaultdict(list)
    
    for conv in conversations:
        filename = conv.get('_source_file', '')
        if filename.startswith('chatbot_arena_'):
            sources['chatbot_arena'].append(conv)
        elif filename.startswith('wildchat_'):
            sources['wildchat'].append(conv)
        elif filename.startswith('oasst-'):
            sources['oasst'].append(conv)
        elif filename.startswith('cornell-'):
            sources['cornell'].append(conv)
        elif filename.startswith('kaggle-emo-'):
            sources['kaggle'].append(conv)
    
    return {source: len(convs) for source, convs in sources.items()}


def main():
    print("🔍 Analyzing Expanded Dataset\n")
    
    conversations = load_all_conversations()
    
    if not conversations:
        print("❌ No conversations found")
        return
    
    print(f"✅ Loaded {len(conversations)} conversations\n")
    
    # Calculate role distributions
    print("📊 Calculating role distributions...")
    distributions = calculate_role_distributions(conversations)
    
    # Analyze by source
    source_breakdown = analyze_by_source(conversations)
    
    # Print summary
    print("\n" + "="*70)
    print("📈 EXPANDED DATASET ANALYSIS")
    print("="*70)
    
    print(f"\n📋 Dataset Size: {distributions['total']} conversations")
    print("\nSource Breakdown:")
    for source, count in sorted(source_breakdown.items(), key=lambda x: -x[1]):
        print(f"  - {source}: {count} ({count/distributions['total']*100:.1f}%)")
    
    print("\n" + "-"*70)
    print("👤 HUMAN ROLE DISTRIBUTION (Dominant Roles)")
    print("-"*70)
    for role, count in sorted(distributions['human']['dominant'].items(), key=lambda x: -x[1])[:10]:
        pct = distributions['human']['dominant_pct'][role]
        print(f"  {role:30s}: {count:4d} ({pct:5.2f}%)")
    
    print("\n" + "-"*70)
    print("🤖 AI ROLE DISTRIBUTION (Dominant Roles)")
    print("-"*70)
    for role, count in sorted(distributions['ai']['dominant'].items(), key=lambda x: -x[1])[:10]:
        pct = distributions['ai']['dominant_pct'][role]
        print(f"  {role:30s}: {count:4d} ({pct:5.2f}%)")
    
    print("\n" + "-"*70)
    print("🔗 TOP ROLE PAIRS")
    print("-"*70)
    for pair, count in sorted(distributions['pairs'].items(), key=lambda x: -x[1])[:15]:
        pct = distributions['pairs_pct'][pair]
        print(f"  {pair:40s}: {count:4d} ({pct:5.2f}%)")
    
    print("\n" + "-"*70)
    print("📊 KEY STATISTICS")
    print("-"*70)
    print(f"  Information-Seeker→Facilitator: {distributions['information_seeker_facilitator']} ({distributions['information_seeker_facilitator_pct']:.2f}%)")
    print(f"  Seeker/Information-Seeker→Expert: {distributions['seeker_expert_static']} ({distributions['seeker_expert_pct']:.2f}%)")
    print(f"  Non-Seeker→Expert pairs: {distributions['non_seeker_expert']} ({distributions['non_seeker_expert_pct']:.2f}%)")
    print(f"  Static conversations (high confidence): {distributions['static_conversations']} ({distributions['static_pct']:.2f}%)")
    
    # Save to file
    output_file = Path("reports/expanded-dataset-analysis.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    report = {
        'date': str(Path(__file__).stat().st_mtime),
        'total_conversations': distributions['total'],
        'source_breakdown': source_breakdown,
        'role_distributions': {
            'human': {
                'dominant': distributions['human']['dominant'],
                'dominant_pct': distributions['human']['dominant_pct']
            },
            'ai': {
                'dominant': distributions['ai']['dominant'],
                'dominant_pct': distributions['ai']['dominant_pct']
            }
        },
        'role_pairs': distributions['pairs'],
        'role_pairs_pct': distributions['pairs_pct'],
        'key_statistics': {
            'information_seeker_facilitator': {
                'count': distributions['information_seeker_facilitator'],
                'percentage': distributions['information_seeker_facilitator_pct']
            },
            'seeker_expert_static': {
                'count': distributions['seeker_expert_static'],
                'percentage': distributions['seeker_expert_pct']
            },
            'non_seeker_expert': {
                'count': distributions['non_seeker_expert'],
                'percentage': distributions['non_seeker_expert_pct']
            },
            'static_conversations': {
                'count': distributions['static_conversations'],
                'percentage': distributions['static_pct']
            }
        }
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Analysis saved to: {output_file}")
    print("\n" + "="*70)


if __name__ == "__main__":
    main()

