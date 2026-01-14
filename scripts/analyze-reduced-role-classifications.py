#!/usr/bin/env python3
"""
Analyze Reduced Role Taxonomy Classifications

After all conversations are classified with the new 6-role taxonomy, this script:
1. Calculates role distributions
2. Compares ambiguity (old vs new)
3. Validates the reduction worked
4. Generates comprehensive report
"""

import json
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List

def load_all_classifications(directory: Path) -> tuple:
    """Load all classifications, separating new and old taxonomy"""
    new_taxonomy = []
    old_taxonomy = []
    no_classification = []
    
    json_files = [f for f in directory.glob("*.json") if f.name != "manifest.json"]
    
    for json_file in json_files:
        try:
            with open(json_file) as f:
                conv = json.load(f)
            
            cls = conv.get('classification', {})
            if not cls:
                no_classification.append(conv.get('id', 'unknown'))
                continue
            
            metadata = cls.get('classificationMetadata', {})
            version = metadata.get('version', 'unknown')
            
            if 'reduced-roles' in version:
                new_taxonomy.append(conv)
            else:
                old_taxonomy.append(conv)
        except Exception as e:
            no_classification.append(json_file.name)
    
    return new_taxonomy, old_taxonomy, no_classification


def calculate_ambiguity(conversations: List[Dict]) -> Dict:
    """Calculate ambiguity metrics (max probability < 0.6)"""
    ambiguous_human = []
    ambiguous_ai = []
    high_confidence_human = []
    high_confidence_ai = []
    
    for conv in conversations:
        cls = conv.get('classification', {})
        
        human_role = cls.get('humanRole', {})
        ai_role = cls.get('aiRole', {})
        
        if human_role and 'distribution' in human_role:
            dist = human_role.get('distribution', {})
            if dist:
                max_prob = max(dist.values()) if dist else 0
                if max_prob < 0.6:
                    ambiguous_human.append({
                        'id': conv.get('id'),
                        'max': max_prob,
                        'roles': {k: v for k, v in dist.items() if v > 0.1}
                    })
                else:
                    high_confidence_human.append(max_prob)
        
        if ai_role and 'distribution' in ai_role:
            dist = ai_role.get('distribution', {})
            if dist:
                max_prob = max(dist.values()) if dist else 0
                if max_prob < 0.6:
                    ambiguous_ai.append({
                        'id': conv.get('id'),
                        'max': max_prob,
                        'roles': {k: v for k, v in dist.items() if v > 0.1}
                    })
                else:
                    high_confidence_ai.append(max_prob)
    
    total = len(conversations)
    
    return {
        'human': {
            'ambiguous': len(ambiguous_human),
            'ambiguous_pct': len(ambiguous_human) / total * 100 if total > 0 else 0,
            'high_confidence': len(high_confidence_human),
            'high_confidence_pct': len(high_confidence_human) / total * 100 if total > 0 else 0,
            'avg_confidence': sum(high_confidence_human) / len(high_confidence_human) if high_confidence_human else 0,
            'examples': ambiguous_human[:5]
        },
        'ai': {
            'ambiguous': len(ambiguous_ai),
            'ambiguous_pct': len(ambiguous_ai) / total * 100 if total > 0 else 0,
            'high_confidence': len(high_confidence_ai),
            'high_confidence_pct': len(high_confidence_ai) / total * 100 if total > 0 else 0,
            'avg_confidence': sum(high_confidence_ai) / len(high_confidence_ai) if high_confidence_ai else 0,
            'examples': ambiguous_ai[:5]
        }
    }


def calculate_role_distributions(conversations: List[Dict]) -> Dict:
    """Calculate average probabilities and dominant counts for roles"""
    human_roles = defaultdict(float)
    ai_roles = defaultdict(float)
    human_dominant = Counter()
    ai_dominant = Counter()
    role_pairs = Counter()
    
    for conv in conversations:
        cls = conv.get('classification', {})
        
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
                role_pairs[f"{h_max}→{a_max}"] += 1
    
    total = len(conversations)
    
    return {
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
        'pairs_pct': {pair: count / total * 100 for pair, count in role_pairs.items()}
    }


def generate_report(new_convs: List[Dict], old_convs: List[Dict], output_file: Path):
    """Generate comprehensive analysis report"""
    
    print(f"📊 Analyzing {len(new_convs)} new taxonomy classifications...")
    
    # Calculate metrics
    new_ambiguity = calculate_ambiguity(new_convs)
    new_distributions = calculate_role_distributions(new_convs)
    
    if old_convs:
        old_ambiguity = calculate_ambiguity(old_convs)
        old_distributions = calculate_role_distributions(old_convs)
    else:
        old_ambiguity = None
        old_distributions = None
    
    # Generate markdown report
    human_improvement = (old_ambiguity['human']['ambiguous_pct'] - new_ambiguity['human']['ambiguous_pct']) if old_ambiguity else 0
    ai_improvement = (old_ambiguity['ai']['ambiguous_pct'] - new_ambiguity['ai']['ambiguous_pct']) if old_ambiguity else 0
    
    report = f"""# Reduced Role Taxonomy Analysis Report

**Date:** {Path(__file__).stat().st_mtime}
**Dataset:** {len(new_convs)} conversations with new taxonomy

---

## 🎯 Ambiguity Reduction (Primary Goal)

### Human Roles

| Metric | New Taxonomy | Old Taxonomy | Improvement |
|--------|--------------|--------------|-------------|
| Ambiguous (<0.6) | {new_ambiguity['human']['ambiguous']} ({new_ambiguity['human']['ambiguous_pct']:.1f}%) | {old_ambiguity['human']['ambiguous'] if old_ambiguity else 'N/A'} ({old_ambiguity['human']['ambiguous_pct']:.1f}% if old_ambiguity else 'N/A') | {human_improvement:.1f}% reduction if old_ambiguity else 'N/A'} |
| High Confidence (≥0.6) | {new_ambiguity['human']['high_confidence']} ({new_ambiguity['human']['high_confidence_pct']:.1f}%) | {old_ambiguity['human']['high_confidence'] if old_ambiguity else 'N/A'} ({old_ambiguity['human']['high_confidence_pct']:.1f}% if old_ambiguity else 'N/A') | |
| Avg Confidence | {new_ambiguity['human']['avg_confidence']:.2f} | {old_ambiguity['human']['avg_confidence']:.2f if old_ambiguity else 'N/A'} | |

**Target:** <30% ambiguous (was 58.9% with old taxonomy)
**Achieved:** {new_ambiguity['human']['ambiguous_pct']:.1f}% ambiguous {'✅' if new_ambiguity['human']['ambiguous_pct'] < 30 else '❌'}

### AI Roles

| Metric | New Taxonomy | Old Taxonomy | Improvement |
|--------|--------------|--------------|-------------|
| Ambiguous (<0.6) | {new_ambiguity['ai']['ambiguous']} ({new_ambiguity['ai']['ambiguous_pct']:.1f}%) | {old_ambiguity['ai']['ambiguous'] if old_ambiguity else 'N/A'} ({old_ambiguity['ai']['ambiguous_pct']:.1f}% if old_ambiguity else 'N/A') | {ai_improvement:.1f}% reduction if old_ambiguity else 'N/A'} |
| High Confidence (≥0.6) | {new_ambiguity['ai']['high_confidence']} ({new_ambiguity['ai']['high_confidence_pct']:.1f}%) | {old_ambiguity['ai']['high_confidence'] if old_ambiguity else 'N/A'} ({old_ambiguity['ai']['high_confidence_pct']:.1f}% if old_ambiguity else 'N/A') | |
| Avg Confidence | {new_ambiguity['ai']['avg_confidence']:.2f} | {old_ambiguity['ai']['avg_confidence']:.2f if old_ambiguity else 'N/A'} | |

**Target:** <15% ambiguous (was 25.7% with old taxonomy)
**Achieved:** {new_ambiguity['ai']['ambiguous_pct']:.1f}% ambiguous {'✅' if new_ambiguity['ai']['ambiguous_pct'] < 15 else '❌'}

---

## 📊 Role Distributions

### Human Roles - Average Probabilities

"""
    
    # Add human role averages
    for role, prob in sorted(new_distributions['human']['average'].items(), key=lambda x: x[1], reverse=True):
        report += f"- **{role}**: {prob:.3f} ({prob*100:.1f}%)\n"
    
    report += f"\n### Human Roles - Dominant Counts\n\n"
    for role, count in sorted(new_distributions['human']['dominant'].items(), key=lambda x: x[1], reverse=True):
        pct = new_distributions['human']['dominant_pct'][role]
        report += f"- **{role}**: {count} ({pct:.1f}%)\n"
    
    report += f"\n### AI Roles - Average Probabilities\n\n"
    for role, prob in sorted(new_distributions['ai']['average'].items(), key=lambda x: x[1], reverse=True):
        report += f"- **{role}**: {prob:.3f} ({prob*100:.1f}%)\n"
    
    report += f"\n### AI Roles - Dominant Counts\n\n"
    for role, count in sorted(new_distributions['ai']['dominant'].items(), key=lambda x: x[1], reverse=True):
        pct = new_distributions['ai']['dominant_pct'][role]
        report += f"- **{role}**: {count} ({pct:.1f}%)\n"
    
    report += f"\n## 🔗 Dominant Role Pairs\n\n"
    for pair, count in sorted(new_distributions['pairs'].items(), key=lambda x: x[1], reverse=True)[:10]:
        pct = new_distributions['pairs_pct'][pair]
        report += f"- **{pair}**: {count} ({pct:.1f}%)\n"
    
    report += f"\n---\n\n## ✅ Validation Results\n\n"
    
    # Check if targets met
    human_target_met = new_ambiguity['human']['ambiguous_pct'] < 30
    ai_target_met = new_ambiguity['ai']['ambiguous_pct'] < 15
    
    report += f"- Human role ambiguity target (<30%): {'✅ PASSED' if human_target_met else '❌ FAILED'} ({new_ambiguity['human']['ambiguous_pct']:.1f}%)\n"
    report += f"- AI role ambiguity target (<15%): {'✅ PASSED' if ai_target_met else '❌ FAILED'} ({new_ambiguity['ai']['ambiguous_pct']:.1f}%)\n"
    report += f"- Total conversations classified: {len(new_convs)}\n"
    
    if old_ambiguity:
        human_improvement = old_ambiguity['human']['ambiguous_pct'] - new_ambiguity['human']['ambiguous_pct']
        ai_improvement = old_ambiguity['ai']['ambiguous_pct'] - new_ambiguity['ai']['ambiguous_pct']
        report += f"- Human ambiguity reduction: {human_improvement:.1f}% (from {old_ambiguity['human']['ambiguous_pct']:.1f}% to {new_ambiguity['human']['ambiguous_pct']:.1f}%)\n"
        report += f"- AI ambiguity reduction: {ai_improvement:.1f}% (from {old_ambiguity['ai']['ambiguous_pct']:.1f}% to {new_ambiguity['ai']['ambiguous_pct']:.1f}%)\n"
    
    # Save report
    with open(output_file, 'w') as f:
        f.write(report)
    
    print(f"\n✅ Report saved to {output_file}")
    return report


def main():
    output_dir = Path('public/output')
    output_file = Path('classifier/REDUCED_ROLE_ANALYSIS_REPORT.md')
    
    print("=" * 70)
    print("REDUCED ROLE TAXONOMY ANALYSIS")
    print("=" * 70)
    print()
    
    # Load classifications
    new_convs, old_convs, no_cls = load_all_classifications(output_dir)
    
    print(f"📊 Classification Status:")
    print(f"   ✅ New taxonomy: {len(new_convs)}")
    print(f"   ⏳ Old taxonomy: {len(old_convs)}")
    print(f"   ⚪ No classification: {len(no_cls)}")
    print()
    
    if len(new_convs) == 0:
        print("❌ No conversations with new taxonomy found!")
        print("   Please complete classification first.")
        return
    
    # Generate report
    report = generate_report(new_convs, old_convs, output_file)
    
    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(report.split("## ✅ Validation Results")[-1])


if __name__ == "__main__":
    main()

