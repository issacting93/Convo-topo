#!/usr/bin/env python3
"""
Create 3D visualizations of dataset distributions

Uses the same feature extraction as cluster-paths-proper.py
to get accurate spatial positions
"""

import json
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from pathlib import Path
from collections import defaultdict
import statistics

def load_conversations_by_dataset():
    """Load all conversations classified by dataset"""
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

    # Get final X/Y from classification
    classification = conversation['classification']

    # Get purpose (affects X axis)
    purpose_cat = classification.get('conversationPurpose', {})
    if isinstance(purpose_cat, dict):
        purpose = purpose_cat.get('category', 'information-seeking')
    else:
        purpose = 'information-seeking'

    # X-axis: Functional (0.0-0.4) ↔ Social (0.6-1.0)
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

    # Y-axis: from interaction pattern (affects alignment)
    pattern_cat = classification.get('interactionPattern', {})
    if isinstance(pattern_cat, dict):
        pattern = pattern_cat.get('category', 'question-answer')
    else:
        pattern = 'question-answer'

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

def create_3d_visualization(datasets_data, output_dir):
    """Create 3-panel 3D visualization"""
    fig = plt.figure(figsize=(20, 6))
    fig.patch.set_facecolor('#1a1a1a')

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}

    for idx, (dataset_name, conversations) in enumerate(datasets_data.items(), 1):
        ax = fig.add_subplot(1, 3, idx, projection='3d')
        ax.set_facecolor('#1a1a1a')

        if not conversations:
            continue

        # Extract coordinates
        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        # Plot points
        ax.scatter(coords[:, 0], coords[:, 1], coords[:, 2],
                  c=colors[dataset_name], s=30, alpha=0.6,
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

        # Add quadrant labels at appropriate positions
        ax.text(0.2, 0.8, 0.1, 'Functional\nAligned', color='gray',
               fontsize=7, alpha=0.5, ha='center')
        ax.text(0.8, 0.8, 0.1, 'Social\nAligned', color='gray',
               fontsize=7, alpha=0.5, ha='center')

    plt.suptitle('Spatial Distribution Comparison: OASST vs WildChat vs Chatbot Arena',
                color='white', fontsize=14, y=0.98)

    plt.tight_layout()
    output_file = output_dir / 'dataset-3d-comparison.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight',
               facecolor='#1a1a1a', edgecolor='none')
    print(f"   Saved: {output_file}")
    plt.close()

def create_2d_projections(datasets_data, output_dir):
    """Create 2D projections (top-down view)"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.patch.set_facecolor('#1a1a1a')

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}

    for idx, (dataset_name, conversations) in enumerate(datasets_data.items()):
        ax = axes[idx]
        ax.set_facecolor('#1a1a1a')

        if not conversations:
            continue

        # Extract coordinates
        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        # Create 2D histogram for density
        heatmap, xedges, yedges = np.histogram2d(
            coords[:, 0], coords[:, 1],
            bins=25, range=[[0, 1], [0, 1]]
        )

        # Plot heatmap
        extent = [0, 1, 0, 1]
        im = ax.imshow(heatmap.T, origin='lower', extent=extent,
                      cmap='hot', aspect='auto', alpha=0.6, interpolation='gaussian')

        # Overlay scatter
        scatter = ax.scatter(coords[:, 0], coords[:, 1],
                           c=coords[:, 2], cmap='viridis',
                           s=30, alpha=0.7, edgecolors='white', linewidths=0.5)

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

    plt.suptitle('2D Spatial Distribution (X-Y Projection with Intensity Color)',
                color='white', fontsize=14)
    plt.tight_layout()

    output_file = output_dir / 'dataset-2d-projections.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight',
               facecolor='#1a1a1a', edgecolor='none')
    print(f"   Saved: {output_file}")
    plt.close()

def create_overlay_comparison(datasets_data, output_dir):
    """Create overlay of all three datasets"""
    fig = plt.figure(figsize=(12, 10))
    fig.patch.set_facecolor('#1a1a1a')
    ax = fig.add_subplot(111, projection='3d')
    ax.set_facecolor('#1a1a1a')

    colors = {'OASST': '#FF6B6B', 'WildChat': '#4ECDC4', 'Chatbot Arena': '#FFE66D'}
    sizes = {'OASST': 80, 'WildChat': 50, 'Chatbot Arena': 25}
    alphas = {'OASST': 0.8, 'WildChat': 0.6, 'Chatbot Arena': 0.4}

    # Plot in reverse order (largest dataset first, smallest on top)
    for dataset_name in ['Chatbot Arena', 'WildChat', 'OASST']:
        conversations = datasets_data[dataset_name]
        if not conversations:
            continue

        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        ax.scatter(coords[:, 0], coords[:, 1], coords[:, 2],
                  c=colors[dataset_name], s=sizes[dataset_name],
                  alpha=alphas[dataset_name],
                  label=f'{dataset_name} (n={len(conversations)})',
                  edgecolors='white', linewidths=0.5)

    ax.set_xlabel('Functional ← → Social', color='white', fontsize=11)
    ax.set_ylabel('Aligned ← → Divergent', color='white', fontsize=11)
    ax.set_zlabel('Emotional Intensity', color='white', fontsize=11)
    ax.set_title('Cross-Dataset Overlay Comparison',
                color='white', fontsize=14, pad=20)

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_zlim(0, 1)

    ax.tick_params(colors='gray', labelsize=9)
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor('#333333')
    ax.yaxis.pane.set_edgecolor('#333333')
    ax.zaxis.pane.set_edgecolor('#333333')
    ax.grid(color='#333333', linestyle='--', linewidth=0.5, alpha=0.3)

    ax.legend(loc='upper right', fontsize=10, framealpha=0.9,
             facecolor='#2a2a2a', edgecolor='gray')

    plt.tight_layout()
    output_file = output_dir / 'dataset-overlay-3d.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight',
               facecolor='#1a1a1a', edgecolor='none')
    print(f"   Saved: {output_file}")
    plt.close()

def analyze_distribution(datasets_data):
    """Print distribution statistics"""
    print("\n=== Spatial Distribution Statistics ===\n")

    for dataset_name, conversations in datasets_data.items():
        if not conversations:
            print(f"{dataset_name}: No data\n")
            continue

        coords = []
        for conv in conversations:
            x, y, z = extract_spatial_features(conv)
            coords.append([x, y, z])

        coords = np.array(coords)

        print(f"{dataset_name} (n={len(conversations)}):")
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
            pct = (count / len(coords) * 100)
            print(f"    {q}: {count} ({pct:.1f}%)")
        print()

def main():
    print("Loading conversations...")
    datasets = load_conversations_by_dataset()

    print("\nDataset counts:")
    for name, convs in datasets.items():
        print(f"  {name}: {len(convs)} conversations")

    if all(len(convs) == 0 for convs in datasets.values()):
        print("\n❌ No valid conversations found!")
        return

    output_dir = Path('reports/visualizations')
    output_dir.mkdir(exist_ok=True)

    print("\nGenerating visualizations...")
    create_3d_visualization(datasets, output_dir)
    create_2d_projections(datasets, output_dir)
    create_overlay_comparison(datasets, output_dir)

    analyze_distribution(datasets)

    print(f"\n✅ Complete! Visualizations saved to {output_dir}/")

if __name__ == '__main__':
    main()
