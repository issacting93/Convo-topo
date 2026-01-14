#!/usr/bin/env python3
"""
Compare Local LLM (Ollama) vs OpenAI GPT-4o-mini Classifications

This script analyzes:
- Success rates
- Role distributions
- Ambiguity levels
- Confidence scores
- Agreement/disagreement
"""

import json
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List, Tuple

def load_classifications(output_dir: Path) -> Tuple[List[Dict], List[Dict]]:
    """Load conversations classified by local vs OpenAI"""
    json_files = [f for f in output_dir.glob("*.json") if f.name != "manifest.json"]
    
    local_convs = []
    openai_convs = []
    
    for json_file in json_files:
        try:
            with open(json_file) as f:
                conv = json.load(f)
            
            cls = conv.get('classification', {})
            if not cls:
                continue
            
            metadata = cls.get('classificationMetadata', {})
            model = metadata.get('model', '').lower()
            version = metadata.get('version', '').lower()
            
            # Identify source
            # Check model name first
            is_local = 'qwen2.5' in model or 'ollama' in model
            is_openai = 'gpt' in model or 'openai' in model
            
            # If no model metadata, check role structure and timestamp
            if not is_local and not is_openai:
                human_role = cls.get('humanRole', {})
                if human_role:
                    dist = human_role.get('distribution', {})
                    # New taxonomy uses these role names
                    if 'information-seeker' in dist or 'social-expressor' in dist or 'co-constructor' in dist:
                        # Check timestamp - very recent likely OpenAI (classification just started)
                        timestamp = metadata.get('timestamp', '')
                        if timestamp and '2026-01-08' in timestamp:
                            # Check hour - OpenAI classification started around 12:17
                            try:
                                hour = int(timestamp.split('T')[1].split(':')[0])
                                if hour >= 12:  # After noon today
                                    is_openai = True
                            except:
                                pass
                        # If no timestamp but has new roles, assume OpenAI (more recent)
                        elif not timestamp:
                            is_openai = True
            
            if is_local:
                local_convs.append(conv)
            elif is_openai:
                openai_convs.append(conv)
        except Exception as e:
            print(f"⚠️  Error loading {json_file.name}: {e}")
            continue
    
    return local_convs, openai_convs


def calculate_ambiguity(conversations: List[Dict]) -> Dict:
    """Calculate ambiguity metrics"""
    ambiguous_human = 0
    ambiguous_ai = 0
    high_conf_human = []
    high_conf_ai = []
    all_conf_human = []
    all_conf_ai = []
    
    for conv in conversations:
        cls = conv.get('classification', {})
        
        human_role = cls.get('humanRole', {})
        ai_role = cls.get('aiRole', {})
        
        if human_role and 'distribution' in human_role:
            dist = human_role.get('distribution', {})
            if dist:
                max_prob = max(dist.values())
                conf = human_role.get('confidence', max_prob)
                all_conf_human.append(conf)
                if max_prob < 0.6:
                    ambiguous_human += 1
                else:
                    high_conf_human.append(max_prob)
        
        if ai_role and 'distribution' in ai_role:
            dist = ai_role.get('distribution', {})
            if dist:
                max_prob = max(dist.values())
                conf = ai_role.get('confidence', max_prob)
                all_conf_ai.append(conf)
                if max_prob < 0.6:
                    ambiguous_ai += 1
                else:
                    high_conf_ai.append(max_prob)
    
    total = len(conversations)
    
    return {
        'human': {
            'ambiguous': ambiguous_human,
            'ambiguous_pct': ambiguous_human / total * 100 if total > 0 else 0,
            'high_confidence': len(high_conf_human),
            'high_confidence_pct': len(high_conf_human) / total * 100 if total > 0 else 0,
            'avg_confidence': sum(all_conf_human) / len(all_conf_human) if all_conf_human else 0,
            'avg_max_prob': sum(high_conf_human) / len(high_conf_human) if high_conf_human else 0
        },
        'ai': {
            'ambiguous': ambiguous_ai,
            'ambiguous_pct': ambiguous_ai / total * 100 if total > 0 else 0,
            'high_confidence': len(high_conf_ai),
            'high_confidence_pct': len(high_conf_ai) / total * 100 if total > 0 else 0,
            'avg_confidence': sum(all_conf_ai) / len(all_conf_ai) if all_conf_ai else 0,
            'avg_max_prob': sum(high_conf_ai) / len(high_conf_ai) if high_conf_ai else 0
        }
    }


def calculate_role_distributions(conversations: List[Dict]) -> Dict:
    """Calculate role distributions"""
    human_roles_avg = defaultdict(float)
    ai_roles_avg = defaultdict(float)
    human_roles_dominant = Counter()
    ai_roles_dominant = Counter()
    role_pairs = Counter()
    
    for conv in conversations:
        cls = conv.get('classification', {})
        
        human_role = cls.get('humanRole', {})
        ai_role = cls.get('aiRole', {})
        
        # Human roles
        if human_role and 'distribution' in human_role:
            dist = human_role.get('distribution', {})
            for role, prob in dist.items():
                # Normalize role names
                normalized_role = role.replace('_', '-').lower()
                if normalized_role in ['information-seeker', 'social-expressor', 'co-constructor']:
                    human_roles_avg[normalized_role] += prob
            
            if dist:
                max_role = max(dist.items(), key=lambda x: x[1])[0]
                normalized_max = max_role.replace('_', '-').lower()
                if normalized_max in ['information-seeker', 'social-expressor', 'co-constructor']:
                    human_roles_dominant[normalized_max] += 1
        
        # AI roles
        if ai_role and 'distribution' in ai_role:
            dist = ai_role.get('distribution', {})
            for role, prob in dist.items():
                normalized_role = role.replace('_', '-').lower()
                if normalized_role in ['facilitator', 'expert-system', 'relational-peer']:
                    ai_roles_avg[normalized_role] += prob
            
            if dist:
                max_role = max(dist.items(), key=lambda x: x[1])[0]
                normalized_max = max_role.replace('_', '-').lower()
                if normalized_max in ['facilitator', 'expert-system', 'relational-peer']:
                    ai_roles_dominant[normalized_max] += 1
        
        # Role pairs
        if human_role and ai_role:
            h_dist = human_role.get('distribution', {})
            a_dist = ai_role.get('distribution', {})
            if h_dist and a_dist:
                h_max = max(h_dist.items(), key=lambda x: x[1])[0]
                a_max = max(a_dist.items(), key=lambda x: x[1])[0]
                h_normalized = h_max.replace('_', '-').lower()
                a_normalized = a_max.replace('_', '-').lower()
                if h_normalized in ['information-seeker', 'social-expressor', 'co-constructor'] and \
                   a_normalized in ['facilitator', 'expert-system', 'relational-peer']:
                    role_pairs[f"{h_normalized}→{a_normalized}"] += 1
    
    total = len(conversations)
    
    return {
        'human': {
            'average': {role: prob / total for role, prob in human_roles_avg.items()},
            'dominant': dict(human_roles_dominant),
            'dominant_pct': {role: count / total * 100 for role, count in human_roles_dominant.items()}
        },
        'ai': {
            'average': {role: prob / total for role, prob in ai_roles_avg.items()},
            'dominant': dict(ai_roles_dominant),
            'dominant_pct': {role: count / total * 100 for role, count in ai_roles_dominant.items()}
        },
        'pairs': dict(role_pairs),
        'pairs_pct': {pair: count / total * 100 for pair, count in role_pairs.items()}
    }


def compare_classifications(local_convs: List[Dict], openai_convs: List[Dict]) -> str:
    """Generate comparison report"""
    
    report = []
    report.append("=" * 70)
    report.append("LOCAL LLM vs OPENAI GPT-4o-mini CLASSIFICATION COMPARISON")
    report.append("=" * 70)
    report.append("")
    
    # Basic stats
    report.append(f"📊 Dataset Size:")
    report.append(f"   Local (Ollama qwen2.5:7b): {len(local_convs)} conversations")
    report.append(f"   OpenAI (GPT-4o-mini): {len(openai_convs)} conversations")
    report.append("")
    
    # Ambiguity comparison
    local_ambiguity = calculate_ambiguity(local_convs)
    openai_ambiguity = calculate_ambiguity(openai_convs)
    
    report.append("=" * 70)
    report.append("AMBIGUITY COMPARISON")
    report.append("=" * 70)
    report.append("")
    
    report.append("👤 Human Roles:")
    report.append(f"   Local:  {local_ambiguity['human']['ambiguous']:3d} ambiguous ({local_ambiguity['human']['ambiguous_pct']:5.1f}%)")
    report.append(f"   OpenAI: {openai_ambiguity['human']['ambiguous']:3d} ambiguous ({openai_ambiguity['human']['ambiguous_pct']:5.1f}%)")
    report.append(f"   Difference: {openai_ambiguity['human']['ambiguous_pct'] - local_ambiguity['human']['ambiguous_pct']:+.1f}%")
    report.append("")
    
    report.append("🤖 AI Roles:")
    report.append(f"   Local:  {local_ambiguity['ai']['ambiguous']:3d} ambiguous ({local_ambiguity['ai']['ambiguous_pct']:5.1f}%)")
    report.append(f"   OpenAI: {openai_ambiguity['ai']['ambiguous']:3d} ambiguous ({openai_ambiguity['ai']['ambiguous_pct']:5.1f}%)")
    report.append(f"   Difference: {openai_ambiguity['ai']['ambiguous_pct'] - local_ambiguity['ai']['ambiguous_pct']:+.1f}%")
    report.append("")
    
    # Confidence comparison
    report.append("=" * 70)
    report.append("CONFIDENCE SCORES")
    report.append("=" * 70)
    report.append("")
    
    report.append("👤 Human Roles:")
    report.append(f"   Local:  Avg confidence: {local_ambiguity['human']['avg_confidence']:.3f}, Avg max prob: {local_ambiguity['human']['avg_max_prob']:.3f}")
    report.append(f"   OpenAI: Avg confidence: {openai_ambiguity['human']['avg_confidence']:.3f}, Avg max prob: {openai_ambiguity['human']['avg_max_prob']:.3f}")
    report.append("")
    
    report.append("🤖 AI Roles:")
    report.append(f"   Local:  Avg confidence: {local_ambiguity['ai']['avg_confidence']:.3f}, Avg max prob: {local_ambiguity['ai']['avg_max_prob']:.3f}")
    report.append(f"   OpenAI: Avg confidence: {openai_ambiguity['ai']['avg_confidence']:.3f}, Avg max prob: {openai_ambiguity['ai']['avg_max_prob']:.3f}")
    report.append("")
    
    # Role distributions
    local_dist = calculate_role_distributions(local_convs)
    openai_dist = calculate_role_distributions(openai_convs)
    
    report.append("=" * 70)
    report.append("ROLE DISTRIBUTIONS")
    report.append("=" * 70)
    report.append("")
    
    report.append("👤 Human Roles - Average Probabilities:")
    for role in ['information-seeker', 'social-expressor', 'co-constructor']:
        local_avg = local_dist['human']['average'].get(role, 0)
        openai_avg = openai_dist['human']['average'].get(role, 0)
        diff = openai_avg - local_avg
        report.append(f"   {role:25s} Local: {local_avg:.3f}  OpenAI: {openai_avg:.3f}  Diff: {diff:+.3f}")
    report.append("")
    
    report.append("👤 Human Roles - Dominant Counts:")
    for role in ['information-seeker', 'social-expressor', 'co-constructor']:
        local_count = local_dist['human']['dominant'].get(role, 0)
        openai_count = openai_dist['human']['dominant'].get(role, 0)
        local_pct = local_dist['human']['dominant_pct'].get(role, 0)
        openai_pct = openai_dist['human']['dominant_pct'].get(role, 0)
        report.append(f"   {role:25s} Local: {local_count:3d} ({local_pct:5.1f}%)  OpenAI: {openai_count:3d} ({openai_pct:5.1f}%)")
    report.append("")
    
    report.append("🤖 AI Roles - Average Probabilities:")
    for role in ['facilitator', 'expert-system', 'relational-peer']:
        local_avg = local_dist['ai']['average'].get(role, 0)
        openai_avg = openai_dist['ai']['average'].get(role, 0)
        diff = openai_avg - local_avg
        report.append(f"   {role:25s} Local: {local_avg:.3f}  OpenAI: {openai_avg:.3f}  Diff: {diff:+.3f}")
    report.append("")
    
    report.append("🤖 AI Roles - Dominant Counts:")
    for role in ['facilitator', 'expert-system', 'relational-peer']:
        local_count = local_dist['ai']['dominant'].get(role, 0)
        openai_count = openai_dist['ai']['dominant'].get(role, 0)
        local_pct = local_dist['ai']['dominant_pct'].get(role, 0)
        openai_pct = openai_dist['ai']['dominant_pct'].get(role, 0)
        report.append(f"   {role:25s} Local: {local_count:3d} ({local_pct:5.1f}%)  OpenAI: {openai_count:3d} ({openai_pct:5.1f}%)")
    report.append("")
    
    # Role pairs
    report.append("=" * 70)
    report.append("ROLE PAIRS (Human → AI)")
    report.append("=" * 70)
    report.append("")
    
    all_pairs = set(local_dist['pairs'].keys()) | set(openai_dist['pairs'].keys())
    for pair in sorted(all_pairs, key=lambda x: openai_dist['pairs'].get(x, 0), reverse=True)[:10]:
        local_count = local_dist['pairs'].get(pair, 0)
        openai_count = openai_dist['pairs'].get(pair, 0)
        local_pct = local_dist['pairs_pct'].get(pair, 0)
        openai_pct = openai_dist['pairs_pct'].get(pair, 0)
        report.append(f"   {pair:40s} Local: {local_count:3d} ({local_pct:5.1f}%)  OpenAI: {openai_count:3d} ({openai_pct:5.1f}%)")
    report.append("")
    
    # Summary
    report.append("=" * 70)
    report.append("SUMMARY")
    report.append("=" * 70)
    report.append("")
    
    report.append("✅ Key Findings:")
    
    # Ambiguity
    if openai_ambiguity['human']['ambiguous_pct'] < local_ambiguity['human']['ambiguous_pct']:
        report.append(f"   ✅ OpenAI has lower human role ambiguity ({openai_ambiguity['human']['ambiguous_pct']:.1f}% vs {local_ambiguity['human']['ambiguous_pct']:.1f}%)")
    else:
        report.append(f"   ⚠️  Local has lower human role ambiguity ({local_ambiguity['human']['ambiguous_pct']:.1f}% vs {openai_ambiguity['human']['ambiguous_pct']:.1f}%)")
    
    if openai_ambiguity['ai']['ambiguous_pct'] < local_ambiguity['ai']['ambiguous_pct']:
        report.append(f"   ✅ OpenAI has lower AI role ambiguity ({openai_ambiguity['ai']['ambiguous_pct']:.1f}% vs {local_ambiguity['ai']['ambiguous_pct']:.1f}%)")
    else:
        report.append(f"   ⚠️  Local has lower AI role ambiguity ({local_ambiguity['ai']['ambiguous_pct']:.1f}% vs {openai_ambiguity['ai']['ambiguous_pct']:.1f}%)")
    
    # Confidence
    if openai_ambiguity['human']['avg_confidence'] > local_ambiguity['human']['avg_confidence']:
        report.append(f"   ✅ OpenAI has higher human role confidence ({openai_ambiguity['human']['avg_confidence']:.3f} vs {local_ambiguity['human']['avg_confidence']:.3f})")
    else:
        report.append(f"   ⚠️  Local has higher human role confidence ({local_ambiguity['human']['avg_confidence']:.3f} vs {openai_ambiguity['human']['avg_confidence']:.3f})")
    
    if openai_ambiguity['ai']['avg_confidence'] > local_ambiguity['ai']['avg_confidence']:
        report.append(f"   ✅ OpenAI has higher AI role confidence ({openai_ambiguity['ai']['avg_confidence']:.3f} vs {local_ambiguity['ai']['avg_confidence']:.3f})")
    else:
        report.append(f"   ⚠️  Local has higher AI role confidence ({local_ambiguity['ai']['avg_confidence']:.3f} vs {openai_ambiguity['ai']['avg_confidence']:.3f})")
    
    # Dominant pair
    local_top_pair = max(local_dist['pairs'].items(), key=lambda x: x[1])[0] if local_dist['pairs'] else "N/A"
    openai_top_pair = max(openai_dist['pairs'].items(), key=lambda x: x[1])[0] if openai_dist['pairs'] else "N/A"
    report.append(f"   📊 Dominant pair - Local: {local_top_pair}, OpenAI: {openai_top_pair}")
    
    return "\n".join(report)


def main():
    output_dir = Path("public/output")
    
    print("📊 Loading classifications...")
    local_convs, openai_convs = load_classifications(output_dir)
    
    if not local_convs and not openai_convs:
        print("❌ No classifications found!")
        return
    
    print(f"   Local: {len(local_convs)} conversations")
    print(f"   OpenAI: {len(openai_convs)} conversations")
    print()
    
    # Generate comparison
    report = compare_classifications(local_convs, openai_convs)
    print(report)
    
    # Save report
    output_file = Path("classifier/LOCAL_VS_OPENAI_COMPARISON.md")
    with open(output_file, 'w') as f:
        f.write(report)
    
    print(f"\n💾 Report saved to: {output_file}")


if __name__ == "__main__":
    main()

