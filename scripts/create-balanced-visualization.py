#!/usr/bin/env python3
"""
Create balanced 30-30-30 visualization for fair cross-dataset comparison
"""

import json
import random
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from pathlib import Path
from collections import defaultdict
import statistics

# Set random seed for reproducibility
random.seed(42)

def load_conversations_by_dataset():
    """Load all valid conversations classified by dataset"""
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

            if not data.get('classification') or not data.get('messages'):
                continue

            # Check for PAD data
            messages_with_pad = [m for m in data['messages']
                                if m.get('pad') and m['pad'].get('emotionalIntensity') is not None]
            if len(messages_with_pad) < len(data['messages']) * 0.5:
                continue

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

                if not data.get('classification') or not data.get('messages'):
                    continue

                messages_with_pad = [m for m in data['messages']
                                    if m.get('pad') and m['pad'].get('emotionalIntensity') is not None]
                if len(messages_with_pad) < len(data['messages']) * 0.5:
                    continue

                datasets['WildChat'].append(data)

            except Exception as e:
                continue

    return datasets

def extract_spatial_features(conversation):
    """Extract spatial features matching cluster-paths-proper.py"""
    messages = conversation['messages']
    classification = conversation['classification']

    # Get purpose (affects X axis)
    purpose_cat = classification.get('conversationPurpose', {})
    if isinstance(purpose_cat, dict):
        purpose = purpose_cat.get('category', 'information-seeking')
    else:
        purpose = 'information-seeking'

    # X-axis mapping
    x_map = {
        'information-seeking': 0.2,
        'problem-solving': 0.25,
        'capability-exploration': 0.35,
        'creative-collaboration': 0.5,
        'entertainment': 0.7,
        'relationship-building': 0.75,
        'self-expression': 0.8,
        'emotional-processing': 0.65
    }
    final_x = x_map.get(purpose, 0.3)

    # Get pattern (affects Y axis)
    pattern_cat = classification.get('interactionPattern', {})
    if isinstance(pattern_cat, dict):
        pattern = pattern_cat.get('category', 'question-answer')
    else:
        pattern = 'question-answer'

    # Y-axis mapping
    y_map = {
        'question-answer': 0.8,
        'iterative-refinement': 0.7,
        'advisory': 0.75,
        'exploratory': 0.5,
        'capability-exploration': 0.4,
        'storytelling': 0.3,
        'casual-chat': 0.4,
        'structured-qa': 0.9
    }
    final_y = y_map.get(pattern, 0.6)

    # Z-axis: Average emotional intensity
    intensities = []
    for msg in messages:
        if msg.get('pad') and msg['pad'].get('emotionalIntensity') is not None:
            intensities.append(msg['pad']['emotionalIntensity'])

    avg_intensity = statistics.mean(intensities) if intensities else 0.5

    return final_x, final_y, avg_intensity

def create_2d_projections(balanced_datasets, output_dir):
    """Create 2D projections (top-down view)"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.patch.set_facecolor('#1a1a1a')

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}

    for idx, (dataset_name, conversations) in enumerate(balanced_datasets.items()):
        ax = axes[idx]
        ax.set_facecolor('#1a1a1a')

        # Extract coordinates
        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        # Create 2D histogram for density
        heatmap, xedges, yedges = np.histogram2d(
            coords[:, 0], coords[:, 1],
            bins=20, range=[[0, 1], [0, 1]]
        )

        # Plot heatmap
        im = ax.imshow(heatmap.T, origin='lower', extent=[0, 1, 0, 1],
                      cmap='hot', aspect='auto', alpha=0.6, interpolation='gaussian')

        # Overlay scatter
        scatter = ax.scatter(coords[:, 0], coords[:, 1],
                           c=coords[:, 2], cmap='viridis',
                           s=50, alpha=0.8, edgecolors='white', linewidths=0.5)

        # Quadrant lines
        ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)
        ax.axvline(x=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)

        # Labels
        ax.text(0.25, 0.75, 'Functional\nAligned', ha='center', va='center',
               fontsize=9, alpha=0.4, color='white', style='italic')
        ax.text(0.75, 0.75, 'Social\nAligned', ha='center', va='center',
               fontsize=9, alpha=0.4, color='white', style='italic')
        ax.text(0.25, 0.25, 'Functional\nDivergent', ha='center', va='center',
               fontsize=9, alpha=0.4, color='white', style='italic')
        ax.text(0.75, 0.25, 'Social\nDivergent', ha='center', va='center',
               fontsize=9, alpha=0.4, color='white', style='italic')

        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_xlabel('Functional ← X → Social', fontsize=10, color='white')
        ax.set_ylabel('Aligned ← Y → Divergent', fontsize=10, color='white')
        ax.set_title(f'{dataset_name}\n(n={len(conversations)})',
                    fontsize=11, color='white')
        ax.tick_params(colors='gray', labelsize=8)

        # Colorbar for intensity
        cbar = plt.colorbar(scatter, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label('Emotional Intensity', color='white', fontsize=8)
        cbar.ax.tick_params(colors='gray', labelsize=7)

    plt.suptitle('Balanced Cross-Dataset Comparison (n=30 each)',
                color='white', fontsize=14)
    plt.tight_layout()

    output_file = output_dir / 'balanced-30-30-30-comparison.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight',
               facecolor='#1a1a1a', edgecolor='none')
    print(f"   Saved: {output_file}")
    plt.close()

def create_3d_visualization(balanced_datasets, output_dir):
    """Create 3-panel 3D visualization"""
    fig = plt.figure(figsize=(20, 6))
    fig.patch.set_facecolor('#1a1a1a')

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}

    for idx, (dataset_name, conversations) in enumerate(balanced_datasets.items(), 1):
        ax = fig.add_subplot(1, 3, idx, projection='3d')
        ax.set_facecolor('#1a1a1a')

        # Extract coordinates
        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        # Plot points
        ax.scatter(coords[:, 0], coords[:, 1], coords[:, 2],
                  c=colors[dataset_name], s=40, alpha=0.7,
                  edgecolors='white', linewidths=0.5)

        # Labels
        ax.set_xlabel('Functional ← → Social', color='white', fontsize=9)
        ax.set_ylabel('Aligned ← → Divergent', color='white', fontsize=9)
        ax.set_zlabel('Emotional Intensity', color='white', fontsize=9)
        ax.set_title(f'{dataset_name}\n(n={len(conversations)})',
                    color='white', fontsize=11, pad=10)

        # Set limits
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_zlim(0, 1)

        # Style
        ax.tick_params(colors='gray', labelsize=7)
        ax.xaxis.pane.fill = False
        ax.yaxis.pane.fill = False
        ax.zaxis.pane.fill = False
        ax.xaxis.pane.set_edgecolor('#333333')
        ax.yaxis.pane.set_edgecolor('#333333')
        ax.zaxis.pane.set_edgecolor('#333333')
        ax.grid(color='#333333', linestyle='--', linewidth=0.5, alpha=0.3)

    plt.suptitle('Balanced 3D Comparison: OASST vs WildChat vs Chatbot Arena (n=30 each)',
                color='white', fontsize=14, y=0.98)

    plt.tight_layout()
    output_file = output_dir / 'balanced-30-30-30-3d.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight',
               facecolor='#1a1a1a', edgecolor='none')
    print(f"   Saved: {output_file}")
    plt.close()

def analyze_distribution(balanced_datasets):
    """Print distribution statistics"""
    print("\n=== Balanced Sample Statistics (n=30 each) ===\n")

    all_stats = {}

    for dataset_name, conversations in balanced_datasets.items():
        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        print(f"{dataset_name}:")
        print(f"  X: mean={np.mean(coords[:, 0]):.3f}, std={np.std(coords[:, 0]):.3f}, range=[{np.min(coords[:, 0]):.3f}, {np.max(coords[:, 0]):.3f}]")
        print(f"  Y: mean={np.mean(coords[:, 1]):.3f}, std={np.std(coords[:, 1]):.3f}, range=[{np.min(coords[:, 1]):.3f}, {np.max(coords[:, 1]):.3f}]")
        print(f"  Z: mean={np.mean(coords[:, 2]):.3f}, std={np.std(coords[:, 2]):.3f}, range=[{np.min(coords[:, 2]):.3f}, {np.max(coords[:, 2]):.3f}]")

        # Quadrant counts
        quadrants = defaultdict(int)
        for x, y, z in coords:
            if x < 0.5 and y > 0.5:
                quadrants['Functional-Aligned'] += 1
            elif x > 0.5 and y > 0.5:
                quadrants['Social-Aligned'] += 1
            elif x < 0.5 and y < 0.5:
                quadrants['Functional-Divergent'] += 1
            else:
                quadrants['Social-Divergent'] += 1

        print("  Quadrants:")
        for q in ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']:
            count = quadrants[q]
            pct = (count / 30 * 100)
            print(f"    {q}: {count} ({pct:.1f}%)")

        all_stats[dataset_name] = {
            'coords': coords,
            'quadrants': dict(quadrants)
        }
        print()

    return all_stats

def main():
    print("Loading all valid conversations...")
    all_datasets = load_conversations_by_dataset()

    print("\nAvailable conversations:")
    for name, convs in all_datasets.items():
        print(f"  {name}: {len(convs)} conversations")

    # Create balanced sample of 30 from each
    print("\nCreating balanced sample (n=30 each)...")
    balanced_datasets = {}

    for dataset_name, conversations in all_datasets.items():
        if len(conversations) >= 30:
            balanced_datasets[dataset_name] = random.sample(conversations, 30)
            print(f"  {dataset_name}: Randomly sampled 30 from {len(conversations)}")
        else:
            balanced_datasets[dataset_name] = conversations
            print(f"  {dataset_name}: Using all {len(conversations)} (less than 30)")

    output_dir = Path('reports/visualizations')
    output_dir.mkdir(exist_ok=True)

    print("\nGenerating balanced visualizations...")
    create_2d_projections(balanced_datasets, output_dir)
    create_3d_visualization(balanced_datasets, output_dir)

    stats = analyze_distribution(balanced_datasets)

    # Calculate averages across datasets
    print("\n=== Cross-Dataset Averages ===\n")
    all_quadrants = defaultdict(list)
    for dataset_name, data in stats.items():
        for quad, count in data['quadrants'].items():
            all_quadrants[quad].append(count)

    for quad in ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']:
        avg = np.mean(all_quadrants[quad])
        std = np.std(all_quadrants[quad])
        print(f"{quad}: {avg:.1f} ± {std:.1f} ({avg/30*100:.1f}%)")

    # Save balanced sample info
    sample_info = {
        dataset_name: [conv.get('id', 'unknown') for conv in convs]
        for dataset_name, convs in balanced_datasets.items()
    }

    info_file = output_dir / 'balanced-sample-ids.json'
    with open(info_file, 'w') as f:
        json.dump(sample_info, f, indent=2)

    print(f"\n✅ Complete! Balanced visualizations saved to {output_dir}/")
    print(f"   Sample IDs saved to: {info_file}")

if __name__ == '__main__':
    main()
