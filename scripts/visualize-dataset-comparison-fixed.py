#!/usr/bin/env python3
"""
Create accurate cross-dataset visualizations using actual path endpoints

Uses the final position from generated paths (matching the UI logic)
"""

import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from collections import defaultdict

# Set style
plt.style.use('dark_background')
sns.set_palette("husl")

def load_conversations_with_paths():
    """Load conversations and extract final path positions"""
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

            # Check for valid path data
            if not data.get('path') or len(data['path']) == 0:
                continue

            # Get final position from path
            final_point = data['path'][-1]
            x = final_point['x']
            y = final_point['y']
            z = final_point.get('z', 0)

            # Classify by source
            filename = file.name
            if filename.startswith('oasst'):
                datasets['OASST'].append({'x': x, 'y': y, 'z': z, 'file': filename})
            elif filename.startswith('chatbot_arena'):
                datasets['Chatbot Arena'].append({'x': x, 'y': y, 'z': z, 'file': filename})

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

                # Check for valid path data
                if not data.get('path') or len(data['path']) == 0:
                    continue

                # Get final position from path
                final_point = data['path'][-1]
                x = final_point['x']
                y = final_point['y']
                z = final_point.get('z', 0)

                datasets['WildChat'].append({'x': x, 'y': y, 'z': z, 'file': file.name})

            except Exception as e:
                continue

    return datasets

def create_quadrant_background(ax):
    """Add quadrant labels and grid"""
    ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)
    ax.axvline(x=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)

    # Add quadrant labels
    ax.text(0.25, 0.75, 'Functional\nAligned', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(0.75, 0.75, 'Social\nAligned', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(0.25, 0.25, 'Functional\nDivergent', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(0.75, 0.25, 'Social\nDivergent', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')

def visualize_density_heatmap(datasets_data, output_dir):
    """Create 2D density heatmaps for each dataset"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.suptitle('Spatial Density Comparison: OASST vs WildChat vs Chatbot Arena',
                 fontsize=14, y=1.02)

    colors = ['#FF6B6B', '#4ECDC4', '#95E1D3']
    dataset_names = ['OASST', 'WildChat', 'Chatbot Arena']

    for idx, (dataset, data_list) in enumerate(datasets_data.items()):
        ax = axes[idx]

        if len(data_list) > 0:
            coords = np.array([[d['x'], d['y']] for d in data_list])

            # Create 2D histogram
            heatmap, xedges, yedges = np.histogram2d(
                coords[:, 0], coords[:, 1],
                bins=30, range=[[0, 1], [0, 1]]
            )

            # Plot heatmap
            extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]
            im = ax.imshow(heatmap.T, origin='lower', extent=extent,
                          cmap='hot', aspect='auto', alpha=0.7)

            # Add scatter plot
            ax.scatter(coords[:, 0], coords[:, 1],
                      c=colors[idx], s=20, alpha=0.4,
                      edgecolors='white', linewidths=0.5)

            plt.colorbar(im, ax=ax, label='Density')

        create_quadrant_background(ax)

        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_xlabel('Functional ← X → Social', fontsize=10)
        ax.set_ylabel('Aligned ← Y → Divergent', fontsize=10)
        ax.set_title(f'{dataset_names[idx]}\n(n={len(data_list)})', fontsize=11)

    plt.tight_layout()
    output_file = output_dir / 'dataset-density-heatmaps-fixed.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def visualize_overlay(datasets_data, output_dir):
    """Create overlay visualization showing all three datasets"""
    fig, ax = plt.subplots(figsize=(10, 10))

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}
    alphas = {'OASST': 0.6, 'WildChat': 0.6, 'Chatbot Arena': 0.3}
    sizes = {'OASST': 60, 'WildChat': 40, 'Chatbot Arena': 20}

    # Plot in reverse order so OASST is on top
    for dataset in ['Chatbot Arena', 'WildChat', 'OASST']:
        data_list = datasets_data[dataset]
        if len(data_list) > 0:
            coords = np.array([[d['x'], d['y']] for d in data_list])
            ax.scatter(coords[:, 0], coords[:, 1],
                      c=colors[dataset], s=sizes[dataset],
                      alpha=alphas[dataset], label=f'{dataset} (n={len(data_list)})',
                      edgecolors='white', linewidths=0.5)

    create_quadrant_background(ax)

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xlabel('Functional ← X → Social', fontsize=12)
    ax.set_ylabel('Aligned ← Y → Divergent', fontsize=12)
    ax.set_title('Cross-Dataset Spatial Distribution Overlay', fontsize=14)
    ax.legend(loc='upper right', fontsize=10, framealpha=0.9)

    plt.tight_layout()
    output_file = output_dir / 'dataset-overlay-fixed.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def classify_quadrant(x, y):
    """Classify point into quadrant"""
    if x < 0.5 and y > 0.5:
        return 'Functional-Aligned'
    elif x > 0.5 and y > 0.5:
        return 'Social-Aligned'
    elif x < 0.5 and y < 0.5:
        return 'Functional-Divergent'
    else:
        return 'Social-Divergent'

def visualize_quadrant_distribution(datasets_data, output_dir):
    """Create bar chart comparing quadrant distributions"""
    # Calculate quadrant distributions
    quadrant_data = {}
    for dataset, data_list in datasets_data.items():
        quadrants = defaultdict(int)
        for point in data_list:
            q = classify_quadrant(point['x'], point['y'])
            quadrants[q] += 1

        total = len(data_list)
        quadrant_data[dataset] = {
            q: (count / total * 100) if total > 0 else 0
            for q, count in quadrants.items()
        }

    fig, ax = plt.subplots(figsize=(12, 6))

    datasets = list(datasets_data.keys())
    quadrants = ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']
    colors_map = {
        'Functional-Aligned': '#4ECDC4',
        'Social-Aligned': '#FFE66D',
        'Functional-Divergent': '#FF6B6B',
        'Social-Divergent': '#95E1D3'
    }

    x = np.arange(len(datasets))
    width = 0.2

    for idx, quadrant in enumerate(quadrants):
        values = [quadrant_data[ds].get(quadrant, 0) for ds in datasets]
        offset = (idx - 1.5) * width
        ax.bar(x + offset, values, width, label=quadrant, color=colors_map[quadrant])

    ax.set_xlabel('Dataset', fontsize=12)
    ax.set_ylabel('Percentage of Conversations', fontsize=12)
    ax.set_title('Quadrant Distribution Across Datasets', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(datasets)
    ax.legend(loc='upper right')
    ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    output_file = output_dir / 'quadrant-distribution-fixed.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

    return quadrant_data

def main():
    print("Loading conversations with path data...")
    datasets = load_conversations_with_paths()

    print(f"\nDataset counts:")
    for name, data in datasets.items():
        print(f"  {name}: {len(data)} conversations")

    if all(len(data) == 0 for data in datasets.values()):
        print("\n❌ Error: No conversations with path data found!")
        print("   The UI may need to regenerate path data.")
        print("   Path data is stored in the 'path' field of each conversation JSON.")
        return

    output_dir = Path('reports/visualizations')
    output_dir.mkdir(exist_ok=True)

    print("\nGenerating visualizations...")
    visualize_density_heatmap(datasets, output_dir)
    visualize_overlay(datasets, output_dir)
    quadrant_data = visualize_quadrant_distribution(datasets, output_dir)

    print(f"\n✅ Complete! Visualizations saved to {output_dir}/")

    # Print quadrant summary
    print("\nQuadrant Distribution Summary:")
    for dataset, quads in quadrant_data.items():
        print(f"\n{dataset}:")
        for quad, pct in sorted(quads.items()):
            print(f"  {quad}: {pct:.1f}%")

if __name__ == '__main__':
    main()
