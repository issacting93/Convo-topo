#!/usr/bin/env python3
"""
Create visualizations comparing OASST, WildChat, and Chatbot Arena distributions

Generates:
1. 2D density heatmaps for each dataset
2. Quadrant distribution bar charts
3. Variance comparison charts
4. Combined overlay visualization
"""

import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from matplotlib.patches import Rectangle
from scipy.stats import gaussian_kde

# Set style
plt.style.use('dark_background')
sns.set_palette("husl")

def load_data():
    """Load the analysis results"""
    with open('reports/cross-dataset-analysis.json') as f:
        return json.load(f)

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

def extract_coordinates(conversations):
    """Extract coordinates from conversations"""
    coords = []
    for conv in conversations:
        x, y = calculate_destination(conv['classification'])
        if x is not None:
            coords.append((x, y))
    return np.array(coords) if coords else np.array([])

def create_quadrant_background(ax):
    """Add quadrant labels and grid"""
    ax.axhline(y=0, color='gray', linestyle='--', alpha=0.3, linewidth=1)
    ax.axvline(x=0, color='gray', linestyle='--', alpha=0.3, linewidth=1)

    # Add quadrant labels
    ax.text(-0.7, 0.7, 'Functional\nAligned', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(0.7, 0.7, 'Social\nAligned', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(-0.7, -0.7, 'Functional\nDivergent', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')
    ax.text(0.7, -0.7, 'Social\nDivergent', ha='center', va='center',
            fontsize=9, alpha=0.4, style='italic')

def visualize_density_heatmap(datasets_coords, output_dir):
    """Create 2D density heatmaps for each dataset"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.suptitle('Spatial Density Comparison: OASST vs WildChat vs Chatbot Arena', fontsize=14, y=1.02)

    colors = ['#FF6B6B', '#4ECDC4', '#95E1D3']
    dataset_names = ['OASST', 'WildChat', 'Chatbot Arena']

    for idx, (dataset, coords) in enumerate(datasets_coords.items()):
        ax = axes[idx]

        if len(coords) > 0:
            # Create 2D histogram
            heatmap, xedges, yedges = np.histogram2d(
                coords[:, 0], coords[:, 1],
                bins=20, range=[[-1, 1], [-1, 1]]
            )

            # Plot heatmap
            extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]
            im = ax.imshow(heatmap.T, origin='lower', extent=extent,
                          cmap='hot', aspect='auto', alpha=0.7)

            # Add scatter plot
            ax.scatter(coords[:, 0], coords[:, 1],
                      c=colors[idx], s=20, alpha=0.4, edgecolors='white', linewidths=0.5)

            plt.colorbar(im, ax=ax, label='Density')

        create_quadrant_background(ax)

        ax.set_xlim(-1, 1)
        ax.set_ylim(-1, 1)
        ax.set_xlabel('Functional ← X → Social', fontsize=10)
        ax.set_ylabel('Aligned ← Y → Divergent', fontsize=10)
        ax.set_title(f'{dataset_names[idx]}\n(n={len(coords)})', fontsize=11)

    plt.tight_layout()
    output_file = output_dir / 'dataset-density-heatmaps.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def visualize_quadrant_distribution(data, output_dir):
    """Create bar chart comparing quadrant distributions"""
    fig, ax = plt.subplots(figsize=(12, 6))

    datasets = list(data['datasets'].keys())
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
        values = [data['datasets'][ds]['quadrant_distribution'].get(quadrant, 0)
                 for ds in datasets]
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
    output_file = output_dir / 'quadrant-distribution-comparison.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def visualize_variance_comparison(data, output_dir):
    """Create bar chart comparing spatial variance"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    datasets = list(data['datasets'].keys())

    # Panel 1: Individual dimension variances
    ax = axes[0]
    dimensions = ['X (Func↔Social)', 'Y (Align↔Diverg)', 'Z (Intensity)']
    variance_keys = ['variance_x', 'variance_y', 'variance_z']
    colors = ['#FF6B6B', '#4ECDC4', '#95E1D3']

    x = np.arange(len(datasets))
    width = 0.25

    for idx, (dim_name, var_key) in enumerate(zip(dimensions, variance_keys)):
        values = [data['datasets'][ds]['stats'].get(var_key, 0) for ds in datasets]
        offset = (idx - 1) * width
        ax.bar(x + offset, values, width, label=dim_name, color=colors[idx])

    ax.set_xlabel('Dataset', fontsize=11)
    ax.set_ylabel('Variance', fontsize=11)
    ax.set_title('Dimensional Variance Comparison', fontsize=12)
    ax.set_xticks(x)
    ax.set_xticklabels(datasets, fontsize=10)
    ax.legend(fontsize=9)
    ax.grid(axis='y', alpha=0.3)

    # Panel 2: Total variance
    ax = axes[1]
    total_variances = [
        data['datasets'][ds]['stats']['variance_x'] +
        data['datasets'][ds]['stats']['variance_y'] +
        data['datasets'][ds]['stats']['variance_z']
        for ds in datasets
    ]

    colors_dataset = ['#FF6B6B', '#4ECDC4', '#FFE66D']
    bars = ax.bar(datasets, total_variances, color=colors_dataset, edgecolor='white', linewidth=1.5)

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
               f'{height:.4f}',
               ha='center', va='bottom', fontsize=10)

    ax.set_ylabel('Total Spatial Variance', fontsize=11)
    ax.set_title('Total Spatial Variance (X + Y + Z)', fontsize=12)
    ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    output_file = output_dir / 'variance-comparison.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def visualize_overlay(datasets_coords, output_dir):
    """Create overlay visualization showing all three datasets"""
    fig, ax = plt.subplots(figsize=(10, 10))

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}
    alphas = {'OASST': 0.6, 'WildChat': 0.6, 'Chatbot Arena': 0.3}
    sizes = {'OASST': 60, 'WildChat': 40, 'Chatbot Arena': 20}

    # Plot in reverse order so OASST is on top
    for dataset in ['Chatbot Arena', 'WildChat', 'OASST']:
        coords = datasets_coords[dataset]
        if len(coords) > 0:
            ax.scatter(coords[:, 0], coords[:, 1],
                      c=colors[dataset], s=sizes[dataset],
                      alpha=alphas[dataset], label=f'{dataset} (n={len(coords)})',
                      edgecolors='white', linewidths=0.5)

    create_quadrant_background(ax)

    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    ax.set_xlabel('Functional ← X → Social', fontsize=12)
    ax.set_ylabel('Aligned ← Y → Divergent', fontsize=12)
    ax.set_title('Cross-Dataset Spatial Distribution Overlay', fontsize=14)
    ax.legend(loc='upper right', fontsize=10, framealpha=0.9)

    plt.tight_layout()
    output_file = output_dir / 'dataset-overlay.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def visualize_mean_positions(data, output_dir):
    """Create visualization showing mean position of each dataset"""
    fig, ax = plt.subplots(figsize=(10, 10))

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}

    for dataset, info in data['datasets'].items():
        mean_x = info['stats']['mean_x']
        mean_y = info['stats']['mean_y']
        std_x = info['stats']['std_x']
        std_y = info['stats']['std_y']

        # Plot mean with error ellipse
        ax.scatter(mean_x, mean_y, c=colors[dataset], s=300,
                  edgecolors='white', linewidths=2, label=dataset, zorder=10)

        # Add error ellipse (1 std dev)
        from matplotlib.patches import Ellipse
        ellipse = Ellipse((mean_x, mean_y), std_x*2, std_y*2,
                         facecolor=colors[dataset], alpha=0.2,
                         edgecolor=colors[dataset], linewidth=2)
        ax.add_patch(ellipse)

        # Add label
        ax.text(mean_x, mean_y - 0.15, dataset,
               ha='center', va='top', fontsize=10, fontweight='bold')

    create_quadrant_background(ax)

    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    ax.set_xlabel('Functional ← X → Social', fontsize=12)
    ax.set_ylabel('Aligned ← Y → Divergent', fontsize=12)
    ax.set_title('Dataset Mean Positions (with 1σ ellipses)', fontsize=14)
    ax.legend(loc='upper right', fontsize=10)

    plt.tight_layout()
    output_file = output_dir / 'dataset-means.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    print(f"   Saved: {output_file}")
    plt.close()

def main():
    print("Loading data...")
    data = load_data()
    conversations = load_conversations()

    print(f"Dataset counts:")
    for name, convs in conversations.items():
        print(f"  {name}: {len(convs)}")

    # Extract coordinates
    datasets_coords = {
        name: extract_coordinates(convs)
        for name, convs in conversations.items()
    }

    output_dir = Path('reports/visualizations')
    output_dir.mkdir(exist_ok=True)

    print("\nGenerating visualizations...")
    visualize_density_heatmap(datasets_coords, output_dir)
    visualize_quadrant_distribution(data, output_dir)
    visualize_variance_comparison(data, output_dir)
    visualize_overlay(datasets_coords, output_dir)
    visualize_mean_positions(data, output_dir)

    print(f"\n✅ Complete! Visualizations saved to {output_dir}/")

if __name__ == '__main__':
    main()
