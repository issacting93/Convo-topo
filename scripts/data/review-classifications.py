#!/usr/bin/env python3
"""
Comprehensive review of classified conversation data
"""

import json
import os
from collections import defaultdict
from pathlib import Path

def analyze_classification(data):
    """Analyze a single classification"""
    c = data.get('classification', {})

    issues = []

    # Check if classification exists
    if not c:
        return {'has_classification': False, 'issues': ['No classification data']}

    # Check abstain flag
    abstain = c.get('abstain', False)

    # Get all dimensions
    dimensions = {
        'interactionPattern': c.get('interactionPattern'),
        'powerDynamics': c.get('powerDynamics'),
        'emotionalTone': c.get('emotionalTone'),
        'engagementStyle': c.get('engagementStyle'),
        'knowledgeExchange': c.get('knowledgeExchange'),
        'conversationPurpose': c.get('conversationPurpose'),
        'topicDepth': c.get('topicDepth'),
        'turnTaking': c.get('turnTaking'),
        'humanRole': c.get('humanRole'),
        'aiRole': c.get('aiRole')
    }

    # Check for missing dimensions
    missing_dims = [name for name, val in dimensions.items() if val is None]
    if missing_dims:
        issues.append(f"Missing dimensions: {', '.join(missing_dims)}")

    # Check role distributions
    human_role = c.get('humanRole', {})
    ai_role = c.get('aiRole', {})

    if human_role and human_role.get('distribution'):
        dist = human_role['distribution']
        total = sum(dist.values())
        if abs(total - 1.0) > 0.01 and total > 0:  # Allow small floating point errors
            issues.append(f"Human role distribution doesn't sum to 1.0: {total:.2f}")
        max_role = max(dist.values()) if dist else 0
        if max_role == 0:
            issues.append("All human roles are 0")

    if ai_role and ai_role.get('distribution'):
        dist = ai_role['distribution']
        total = sum(dist.values())
        if abs(total - 1.0) > 0.01 and total > 0:
            issues.append(f"AI role distribution doesn't sum to 1.0: {total:.2f}")
        max_role = max(dist.values()) if dist else 0
        if max_role == 0:
            issues.append("All AI roles are 0")

    # Check confidence values
    low_confidence_dims = []
    for name, dim in dimensions.items():
        if dim and isinstance(dim, dict):
            conf = dim.get('confidence', 0)
            if conf < 0.4:
                low_confidence_dims.append(f"{name}={conf:.2f}")

    return {
        'has_classification': True,
        'abstain': abstain,
        'missing_dimensions': missing_dims,
        'human_role_dist': human_role.get('distribution', {}),
        'ai_role_dist': ai_role.get('distribution', {}),
        'low_confidence': low_confidence_dims,
        'issues': issues
    }

def main():
    output_dir = Path('public/output')
    files = sorted([f for f in output_dir.glob('*.json')])

    print("=" * 80)
    print("CLASSIFICATION DATA REVIEW")
    print("=" * 80)
    print(f"\nTotal files: {len(files)}\n")

    # Statistics
    stats = {
        'total': len(files),
        'with_classification': 0,
        'without_classification': 0,
        'abstain_true': 0,
        'abstain_false': 0,
        'has_issues': 0,
        'role_distribution_issues': 0,
        'low_confidence': 0
    }

    # Category counts
    human_roles = defaultdict(int)
    ai_roles = defaultdict(int)
    patterns = defaultdict(int)
    purposes = defaultdict(int)
    depths = defaultdict(int)

    # Detailed issues
    files_with_issues = []

    for file in files:
        with open(file, 'r') as f:
            data = json.load(f)

        analysis = analyze_classification(data)

        if not analysis['has_classification']:
            stats['without_classification'] += 1
            continue

        stats['with_classification'] += 1

        if analysis['abstain']:
            stats['abstain_true'] += 1
        else:
            stats['abstain_false'] += 1

        if analysis['issues']:
            stats['has_issues'] += 1
            files_with_issues.append({
                'file': file.name,
                'issues': analysis['issues']
            })
            if any('role distribution' in issue for issue in analysis['issues']):
                stats['role_distribution_issues'] += 1

        if analysis['low_confidence']:
            stats['low_confidence'] += 1

        # Count dominant roles
        if analysis['human_role_dist']:
            max_role = max(analysis['human_role_dist'].items(), key=lambda x: x[1])
            if max_role[1] > 0.3:  # Only count if significant
                human_roles[max_role[0]] += 1

        if analysis['ai_role_dist']:
            max_role = max(analysis['ai_role_dist'].items(), key=lambda x: x[1])
            if max_role[1] > 0.3:
                ai_roles[max_role[0]] += 1

        # Count categories
        c = data.get('classification', {})
        if c.get('interactionPattern'):
            patterns[c['interactionPattern']['category']] += 1
        if c.get('conversationPurpose'):
            purposes[c['conversationPurpose']['category']] += 1
        if c.get('topicDepth'):
            depths[c['topicDepth']['category']] += 1

    # Print statistics
    print("CLASSIFICATION STATISTICS:")
    print(f"  With classification: {stats['with_classification']}")
    print(f"  Without classification: {stats['without_classification']}")
    print(f"  Abstain=true: {stats['abstain_true']}")
    print(f"  Abstain=false: {stats['abstain_false']}")
    print()

    print("DATA QUALITY:")
    print(f"  Files with issues: {stats['has_issues']}")
    print(f"  Role distribution issues: {stats['role_distribution_issues']}")
    print(f"  Low confidence classifications: {stats['low_confidence']}")
    print()

    # Print role distributions
    print("HUMAN ROLE DISTRIBUTION:")
    for role, count in sorted(human_roles.items(), key=lambda x: x[1], reverse=True):
        pct = (count / stats['with_classification']) * 100
        print(f"  {role:12s}: {count:3d} ({pct:5.1f}%)")
    print()

    print("AI ROLE DISTRIBUTION:")
    for role, count in sorted(ai_roles.items(), key=lambda x: x[1], reverse=True):
        pct = (count / stats['with_classification']) * 100
        print(f"  {role:12s}: {count:3d} ({pct:5.1f}%)")
    print()

    print("INTERACTION PATTERNS:")
    for pattern, count in sorted(patterns.items(), key=lambda x: x[1], reverse=True):
        pct = (count / stats['with_classification']) * 100
        print(f"  {pattern:20s}: {count:3d} ({pct:5.1f}%)")
    print()

    print("CONVERSATION PURPOSES:")
    for purpose, count in sorted(purposes.items(), key=lambda x: x[1], reverse=True):
        pct = (count / stats['with_classification']) * 100
        print(f"  {purpose:20s}: {count:3d} ({pct:5.1f}%)")
    print()

    print("TOPIC DEPTHS:")
    for depth, count in sorted(depths.items(), key=lambda x: x[1], reverse=True):
        pct = (count / stats['with_classification']) * 100
        print(f"  {depth:12s}: {count:3d} ({pct:5.1f}%)")
    print()

    # Print issues
    if files_with_issues:
        print("=" * 80)
        print("FILES WITH ISSUES:")
        print("=" * 80)
        for item in files_with_issues[:10]:  # Show first 10
            print(f"\n{item['file']}:")
            for issue in item['issues']:
                print(f"  - {issue}")
        if len(files_with_issues) > 10:
            print(f"\n... and {len(files_with_issues) - 10} more files with issues")

    print("\n" + "=" * 80)
    print("REVIEW COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
