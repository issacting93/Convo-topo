#!/usr/bin/env python3
"""
Find and analyze conversations from sparse spatial regions (social/divergent)

Identifies conversations that occupy rare relational positions to understand
what makes them different from the dominant functional-aligned patterns.
"""

import json
from pathlib import Path
from typing import Dict, List, Tuple
import statistics

def calculate_destination(classification):
    """Calculate destination coordinates from role classification"""
    x_mappings = {
        'information-seeker': -0.8, 'provider': -0.6,
        'creative-collaborator': 0.0, 'playful-explorer': 0.2,
        'social-expressor': 0.6, 'relational-peer': 0.8,
        'explainer': -0.7, 'advisor': -0.5,
        'generator': 0.0, 'brainstormer': 0.3,
        'empathizer': 0.5, 'companion': 0.9
    }

    y_mappings = {
        'information-seeker': 0.8, 'provider': 0.7,
        'creative-collaborator': 0.5, 'playful-explorer': 0.3,
        'social-expressor': -0.2, 'relational-peer': -0.5,
        'explainer': 0.8, 'advisor': 0.6,
        'generator': 0.4, 'brainstormer': 0.2,
        'empathizer': -0.3, 'companion': -0.6
    }

    # Get role distributions
    human_role_dist = classification.get('humanRole', {}).get('distribution', {})
    ai_role_dist = classification.get('aiRole', {}).get('distribution', {})

    if not human_role_dist or not ai_role_dist:
        return None, None

    # Calculate weighted position
    human_x = sum(x_mappings.get(role, 0) * weight
                  for role, weight in human_role_dist.items())
    ai_x = sum(x_mappings.get(role, 0) * weight
               for role, weight in ai_role_dist.items())
    human_y = sum(y_mappings.get(role, 0) * weight
                  for role, weight in human_role_dist.items())
    ai_y = sum(y_mappings.get(role, 0) * weight
               for role, weight in ai_role_dist.items())

    dest_x = (human_x + ai_x) / 2
    dest_y = (human_y + ai_y) / 2

    return dest_x, dest_y

def classify_region(x, y):
    """Classify into region"""
    if x < 0 and y > 0:
        return 'Functional-Aligned'
    elif x > 0 and y > 0:
        return 'Social-Aligned'
    elif x < 0 and y < 0:
        return 'Functional-Divergent'
    else:
        return 'Social-Divergent'

def load_and_classify():
    """Load all conversations and classify by region"""
    regions = {
        'Functional-Aligned': [],
        'Social-Aligned': [],
        'Functional-Divergent': [],
        'Social-Divergent': []
    }

    # Load from public/output
    output_dir = Path('public/output')
    for file in output_dir.glob('*.json'):
        try:
            with open(file) as f:
                data = json.load(f)

            # Skip if invalid
            if not data.get('classification') or not data.get('messages'):
                continue

            # Check for complete PAD data
            messages_with_pad = [m for m in data['messages']
                                if m.get('pad') and m['pad'].get('emotionalIntensity') is not None]
            if len(messages_with_pad) < len(data['messages']) * 0.8:
                continue

            x, y = calculate_destination(data['classification'])
            if x is None:
                continue

            region = classify_region(x, y)

            # Calculate emotional intensity
            intensities = [m['pad']['emotionalIntensity'] for m in messages_with_pad]
            avg_intensity = statistics.mean(intensities) if intensities else 0

            regions[region].append({
                'id': data['id'],
                'file': file.name,
                'x': x,
                'y': y,
                'z': avg_intensity,
                'classification': data['classification'],
                'message_count': len(data['messages']),
                'messages': data['messages']
            })

        except Exception as e:
            continue

    # Load from public/output-wildchat
    wildchat_dir = Path('public/output-wildchat')
    if wildchat_dir.exists():
        for file in wildchat_dir.glob('wildchat_*.json'):
            try:
                with open(file) as f:
                    data = json.load(f)

                # Skip if invalid
                if not data.get('classification') or not data.get('messages'):
                    continue

                # Check for complete PAD data
                messages_with_pad = [m for m in data['messages']
                                    if m.get('pad') and m['pad'].get('emotionalIntensity') is not None]
                if len(messages_with_pad) < len(data['messages']) * 0.8:
                    continue

                x, y = calculate_destination(data['classification'])
                if x is None:
                    continue

                region = classify_region(x, y)

                # Calculate emotional intensity
                intensities = [m['pad']['emotionalIntensity'] for m in messages_with_pad]
                avg_intensity = statistics.mean(intensities) if intensities else 0

                regions[region].append({
                    'id': data['id'],
                    'file': file.name,
                    'x': x,
                    'y': y,
                    'z': avg_intensity,
                    'classification': data['classification'],
                    'message_count': len(data['messages']),
                    'messages': data['messages']
                })

            except Exception as e:
                continue

    return regions

def get_top_roles(distribution, n=2):
    """Get top N roles from distribution"""
    if not distribution:
        return []
    sorted_roles = sorted(distribution.items(), key=lambda x: x[1], reverse=True)
    return [role for role, _ in sorted_roles[:n] if _ > 0]

def analyze_sparse_conversations(regions):
    """Analyze conversations in sparse regions"""
    report = []
    report.append("# Sparse Region Conversation Analysis\n")
    report.append("**Date:** January 13, 2026\n\n")
    report.append("Analysis of conversations in under-represented relational positions.\n\n")
    report.append("---\n\n")

    # Report region counts
    report.append("## Region Distribution\n\n")
    total = sum(len(convs) for convs in regions.values())
    report.append(f"**Total conversations:** {total}\n\n")
    report.append("| Region | Count | Percentage |\n")
    report.append("|--------|-------|------------|\n")

    for region in ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']:
        count = len(regions[region])
        pct = (count / total * 100) if total > 0 else 0
        report.append(f"| {region} | {count} | {pct:.1f}% |\n")

    report.append("\n---\n\n")

    # Analyze each sparse region
    sparse_regions = ['Social-Aligned', 'Functional-Divergent', 'Social-Divergent']

    for region in sparse_regions:
        convs = regions[region]

        if not convs:
            report.append(f"## {region}\n\n")
            report.append("**No conversations found in this region.**\n\n")
            continue

        report.append(f"## {region} (n={len(convs)})\n\n")

        # Sort by distance from origin (most extreme)
        convs_sorted = sorted(convs, key=lambda c: abs(c['x']) + abs(c['y']), reverse=True)

        # Show top 5
        report.append(f"### Top 5 Most Distinct Conversations\n\n")

        for idx, conv in enumerate(convs_sorted[:5], 1):
            report.append(f"#### {idx}. {conv['file']}\n\n")
            report.append(f"**Position:** ({conv['x']:.3f}, {conv['y']:.3f}, {conv['z']:.3f})\n")
            report.append(f"**Messages:** {conv['message_count']}\n\n")

            # Roles
            human_roles = get_top_roles(conv['classification'].get('humanRole', {}).get('distribution', {}))
            ai_roles = get_top_roles(conv['classification'].get('aiRole', {}).get('distribution', {}))

            report.append(f"**Human roles:** {', '.join(human_roles) if human_roles else 'None'}\n")
            report.append(f"**AI roles:** {', '.join(ai_roles) if ai_roles else 'None'}\n\n")

            # Purpose
            purpose = conv['classification'].get('conversationPurpose', {}).get('category', 'unknown')
            report.append(f"**Purpose:** {purpose}\n\n")

            # Pattern
            pattern = conv['classification'].get('interactionPattern', {}).get('category', 'unknown')
            report.append(f"**Pattern:** {pattern}\n\n")

            # Show first 3 message exchanges
            report.append("**Conversation excerpt:**\n```\n")
            for msg_idx, msg in enumerate(conv['messages'][:6]):
                role = "Human" if msg.get('role') == 'user' else "AI"
                content = msg.get('content', '')[:100].replace('\n', ' ')
                if len(msg.get('content', '')) > 100:
                    content += '...'
                report.append(f"{role}: {content}\n")
            report.append("```\n\n")

            report.append("---\n\n")

    return ''.join(report)

def main():
    print("Loading and classifying conversations...")
    regions = load_and_classify()

    print("\nRegion distribution:")
    total = sum(len(convs) for convs in regions.values())
    for region, convs in regions.items():
        pct = (len(convs) / total * 100) if total > 0 else 0
        print(f"  {region}: {len(convs)} ({pct:.1f}%)")

    print("\nAnalyzing sparse regions...")
    report = analyze_sparse_conversations(regions)

    # Save report
    output_file = Path('reports/SPARSE_REGION_ANALYSIS.md')
    with open(output_file, 'w') as f:
        f.write(report)

    print(f"\n✅ Report saved: {output_file}")

    # Save JSON data
    json_data = {
        region: [{
            'id': c['id'],
            'file': c['file'],
            'x': c['x'],
            'y': c['y'],
            'z': c['z'],
            'message_count': c['message_count'],
            'human_roles': get_top_roles(c['classification'].get('humanRole', {}).get('distribution', {})),
            'ai_roles': get_top_roles(c['classification'].get('aiRole', {}).get('distribution', {})),
            'purpose': c['classification'].get('conversationPurpose', {}).get('category'),
            'pattern': c['classification'].get('interactionPattern', {}).get('category')
        } for c in convs]
        for region, convs in regions.items()
    }

    json_file = Path('reports/sparse-region-conversations.json')
    with open(json_file, 'w') as f:
        json.dump(json_data, f, indent=2)

    print(f"   Data saved: {json_file}")

if __name__ == '__main__':
    main()
