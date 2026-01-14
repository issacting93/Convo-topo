#!/usr/bin/env python3
"""
Compare spatial distributions across OASST, WildChat, and Chatbot Arena datasets

Generates quantitative metrics for cross-dataset comparison:
- Quadrant distributions
- Spatial variance and spread
- Density analysis
- Statistical tests
"""

import json
import numpy as np
from pathlib import Path
from collections import defaultdict
from scipy import stats
from sklearn.metrics import pairwise_distances

# Load all conversations
def load_conversations():
    """Load conversations from all three datasets"""
    datasets = {
        'OASST': [],
        'WildChat': [],
        'Chatbot Arena': []
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

            # Classify by source
            filename = file.name
            if filename.startswith('oasst'):
                datasets['OASST'].append(data)
            elif filename.startswith('chatbot_arena'):
                datasets['Chatbot Arena'].append(data)

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

                datasets['WildChat'].append(data)

            except Exception as e:
                continue

    return datasets

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

    # Get roles
    human_roles = classification.get('humanRole', [])
    ai_roles = classification.get('aiRole', [])

    if not human_roles or not ai_roles:
        return None, None

    # Calculate weighted average
    human_x = np.mean([x_mappings.get(r, 0) for r in human_roles])
    ai_x = np.mean([x_mappings.get(r, 0) for r in ai_roles])
    human_y = np.mean([y_mappings.get(r, 0) for r in human_roles])
    ai_y = np.mean([y_mappings.get(r, 0) for r in ai_roles])

    dest_x = (human_x + ai_x) / 2
    dest_y = (human_y + ai_y) / 2

    return dest_x, dest_y

def get_avg_emotional_intensity(messages):
    """Calculate average emotional intensity"""
    intensities = [m['pad']['emotionalIntensity'] for m in messages
                  if m.get('pad') and m['pad'].get('emotionalIntensity') is not None]
    return np.mean(intensities) if intensities else 0

def classify_quadrant(x, y):
    """Classify point into quadrant"""
    if x < 0 and y > 0:
        return 'Functional-Aligned'
    elif x > 0 and y > 0:
        return 'Social-Aligned'
    elif x < 0 and y < 0:
        return 'Functional-Divergent'
    else:
        return 'Social-Divergent'

def analyze_dataset(conversations, dataset_name):
    """Analyze spatial distribution for a dataset"""
    results = {
        'name': dataset_name,
        'count': len(conversations),
        'coordinates': [],
        'intensities': [],
        'quadrants': defaultdict(int)
    }

    for conv in conversations:
        x, y = calculate_destination(conv['classification'])
        if x is None:
            continue

        z = get_avg_emotional_intensity(conv['messages'])

        results['coordinates'].append((x, y, z))
        results['intensities'].append(z)

        quadrant = classify_quadrant(x, y)
        results['quadrants'][quadrant] += 1

    # Calculate statistics
    if results['coordinates']:
        coords = np.array(results['coordinates'])
        results['stats'] = {
            'mean_x': float(np.mean(coords[:, 0])),
            'mean_y': float(np.mean(coords[:, 1])),
            'mean_z': float(np.mean(coords[:, 2])),
            'std_x': float(np.std(coords[:, 0])),
            'std_y': float(np.std(coords[:, 1])),
            'std_z': float(np.std(coords[:, 2])),
            'variance_x': float(np.var(coords[:, 0])),
            'variance_y': float(np.var(coords[:, 1])),
            'variance_z': float(np.var(coords[:, 2])),
            'total_variance': float(np.var(coords[:, 0]) + np.var(coords[:, 1]) + np.var(coords[:, 2])),
            'range_x': float(np.ptp(coords[:, 0])),
            'range_y': float(np.ptp(coords[:, 1])),
            'range_z': float(np.ptp(coords[:, 2])),
        }

        # Calculate density (average distance to nearest neighbors)
        if len(coords) > 10:
            # Sample 100 points for efficiency
            sample_size = min(100, len(coords))
            sample_idx = np.random.choice(len(coords), sample_size, replace=False)
            sample_coords = coords[sample_idx]

            distances = pairwise_distances(sample_coords)
            # Get distance to nearest neighbor (excluding self)
            np.fill_diagonal(distances, np.inf)
            nearest_distances = np.min(distances, axis=1)

            results['stats']['avg_nearest_neighbor_distance'] = float(np.mean(nearest_distances))
            results['stats']['median_nearest_neighbor_distance'] = float(np.median(nearest_distances))

        # Convert quadrant counts to percentages
        total = sum(results['quadrants'].values())
        results['quadrant_percentages'] = {
            k: (v / total * 100) for k, v in results['quadrants'].items()
        }

    return results

def compare_datasets(results):
    """Compare datasets statistically"""
    comparisons = []

    datasets = list(results.keys())
    for i, ds1 in enumerate(datasets):
        for ds2 in datasets[i+1:]:
            comparison = {
                'dataset1': ds1,
                'dataset2': ds2,
                'tests': {}
            }

            # Get coordinates
            coords1 = np.array(results[ds1]['coordinates'])
            coords2 = np.array(results[ds2]['coordinates'])

            if len(coords1) > 0 and len(coords2) > 0:
                # T-test for each dimension
                for dim, label in enumerate(['x', 'y', 'z']):
                    t_stat, p_value = stats.ttest_ind(coords1[:, dim], coords2[:, dim])
                    comparison['tests'][f'{label}_dimension'] = {
                        't_statistic': float(t_stat),
                        'p_value': float(p_value),
                        'significant': bool(p_value < 0.001)
                    }

                # KS test for distribution similarity
                for dim, label in enumerate(['x', 'y', 'z']):
                    ks_stat, p_value = stats.ks_2samp(coords1[:, dim], coords2[:, dim])
                    comparison['tests'][f'{label}_ks_test'] = {
                        'ks_statistic': float(ks_stat),
                        'p_value': float(p_value),
                        'significant': bool(p_value < 0.001)
                    }

            comparisons.append(comparison)

    return comparisons

def generate_report(results, comparisons):
    """Generate markdown report"""
    report = []
    report.append("# Cross-Dataset Distribution Analysis\n")
    report.append("**Date:** January 13, 2026\n")
    report.append("**Datasets:** OASST, WildChat, Chatbot Arena\n\n")
    report.append("---\n\n")

    report.append("## Dataset Statistics\n\n")

    for dataset, data in results.items():
        report.append(f"### {dataset}\n\n")
        report.append(f"**Conversations:** {data['count']}\n\n")

        if 'stats' in data:
            stats = data['stats']
            report.append("#### Spatial Distribution\n\n")
            report.append("| Dimension | Mean | Std Dev | Variance | Range |\n")
            report.append("|-----------|------|---------|----------|-------|\n")
            report.append(f"| X (Functional↔Social) | {stats['mean_x']:.3f} | {stats['std_x']:.3f} | {stats['variance_x']:.4f} | {stats['range_x']:.3f} |\n")
            report.append(f"| Y (Aligned↔Divergent) | {stats['mean_y']:.3f} | {stats['std_y']:.3f} | {stats['variance_y']:.4f} | {stats['range_y']:.3f} |\n")
            report.append(f"| Z (Emotional Intensity) | {stats['mean_z']:.3f} | {stats['std_z']:.3f} | {stats['variance_z']:.4f} | {stats['range_z']:.3f} |\n\n")
            report.append(f"**Total Spatial Variance:** {stats['total_variance']:.4f}\n\n")

            if 'avg_nearest_neighbor_distance' in stats:
                report.append(f"**Average Density (NN Distance):** {stats['avg_nearest_neighbor_distance']:.3f}\n\n")

        if 'quadrant_percentages' in data:
            report.append("#### Quadrant Distribution\n\n")
            report.append("| Quadrant | Count | Percentage |\n")
            report.append("|----------|-------|------------|\n")
            for quadrant in ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']:
                count = data['quadrants'].get(quadrant, 0)
                pct = data['quadrant_percentages'].get(quadrant, 0)
                report.append(f"| {quadrant} | {count} | {pct:.1f}% |\n")
            report.append("\n")

    report.append("---\n\n")
    report.append("## Statistical Comparisons\n\n")

    for comp in comparisons:
        report.append(f"### {comp['dataset1']} vs {comp['dataset2']}\n\n")

        report.append("#### T-Tests (Mean Differences)\n\n")
        report.append("| Dimension | t-statistic | p-value | Significant? |\n")
        report.append("|-----------|-------------|---------|-------------|\n")

        for dim in ['x', 'y', 'z']:
            test = comp['tests'].get(f'{dim}_dimension', {})
            if test:
                sig = "✅ Yes" if test['significant'] else "❌ No"
                report.append(f"| {dim.upper()} | {test['t_statistic']:.3f} | {test['p_value']:.6f} | {sig} |\n")
        report.append("\n")

        report.append("#### KS Tests (Distribution Similarity)\n\n")
        report.append("| Dimension | KS-statistic | p-value | Different? |\n")
        report.append("|-----------|--------------|---------|------------|\n")

        for dim in ['x', 'y', 'z']:
            test = comp['tests'].get(f'{dim}_ks_test', {})
            if test:
                sig = "✅ Yes" if test['significant'] else "❌ No"
                report.append(f"| {dim.upper()} | {test['ks_statistic']:.3f} | {test['p_value']:.6f} | {sig} |\n")
        report.append("\n")

    return ''.join(report)

def main():
    print("Loading conversations from all datasets...")
    datasets = load_conversations()

    print(f"\nDataset counts:")
    for name, convs in datasets.items():
        print(f"  {name}: {len(convs)} conversations")

    print("\nAnalyzing spatial distributions...")
    results = {}
    for name, convs in datasets.items():
        if convs:
            print(f"  Analyzing {name}...")
            results[name] = analyze_dataset(convs, name)

    print("\nComparing datasets statistically...")
    comparisons = compare_datasets(results)

    print("\nGenerating report...")
    report = generate_report(results, comparisons)

    # Save report
    output_file = Path('reports/CROSS_DATASET_DISTRIBUTION_ANALYSIS.md')
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, 'w') as f:
        f.write(report)

    # Save JSON data
    json_output = {
        'datasets': {name: {
            'count': data['count'],
            'stats': data.get('stats', {}),
            'quadrant_distribution': data.get('quadrant_percentages', {})
        } for name, data in results.items()},
        'comparisons': comparisons
    }

    json_file = Path('reports/cross-dataset-analysis.json')
    with open(json_file, 'w') as f:
        json.dump(json_output, f, indent=2)

    print(f"\n✅ Complete!")
    print(f"   Report: {output_file}")
    print(f"   Data: {json_file}")

if __name__ == '__main__':
    main()
