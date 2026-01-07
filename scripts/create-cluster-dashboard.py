#!/usr/bin/env python3
"""
Create comprehensive visual dashboard and statistics for cluster analysis.
Generates charts, comparisons, and statistics.
"""

import json
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pathlib import Path
from typing import Dict, List
from collections import defaultdict
import pandas as pd

# Set style
try:
    plt.style.use('seaborn-v0_8-darkgrid')
except:
    plt.style.use('seaborn-darkgrid')
matplotlib.rcParams['figure.dpi'] = 300
matplotlib.rcParams['savefig.dpi'] = 300

def load_cluster_data(cluster_file: Path) -> Dict:
    """Load cluster data."""
    with open(cluster_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_cluster_statistics(cluster_data: Dict) -> pd.DataFrame:
    """Extract statistics for each cluster."""
    stats = []
    
    for cluster_name, conversations in cluster_data.items():
        if not conversations:
            continue
        
        # Extract features
        features_list = [c.get('features', {}) for c in conversations]
        
        # Calculate statistics
        cluster_stats = {
            'cluster_name': cluster_name,
            'size': len(conversations),
            'size_pct': len(conversations) / sum(len(v) for v in cluster_data.values()) * 100,
        }
        
        # Trajectory features
        for feat in ['avg_intensity', 'intensity_variance', 'path_straightness', 
                     'drift_magnitude', 'valley_density', 'peak_density',
                     'final_x', 'final_y', 'path_length']:
            values = [f.get(feat, 0) for f in features_list]
            if values:
                cluster_stats[f'{feat}_mean'] = np.mean(values)
                cluster_stats[f'{feat}_std'] = np.std(values)
        
        # Classification features
        patterns = [c.get('classification', {}).get('interactionPattern', {}).get('category') 
                   for c in conversations if c.get('classification')]
        purposes = [c.get('classification', {}).get('conversationPurpose', {}).get('category')
                   for c in conversations if c.get('classification')]
        
        if patterns:
            pattern_counts = defaultdict(int)
            for p in patterns:
                pattern_counts[p] += 1
            cluster_stats['most_common_pattern'] = max(pattern_counts.items(), key=lambda x: x[1])[0]
            cluster_stats['pattern_qa_pct'] = pattern_counts.get('question-answer', 0) / len(patterns) * 100
            cluster_stats['pattern_storytelling_pct'] = pattern_counts.get('storytelling', 0) / len(patterns) * 100
        
        if purposes:
            purpose_counts = defaultdict(int)
            for p in purposes:
                purpose_counts[p] += 1
            cluster_stats['most_common_purpose'] = max(purpose_counts.items(), key=lambda x: x[1])[0]
            cluster_stats['purpose_info_pct'] = purpose_counts.get('information-seeking', 0) / len(purposes) * 100
        
        stats.append(cluster_stats)
    
    return pd.DataFrame(stats)

def create_cluster_distribution_chart(df: pd.DataFrame, output_path: Path):
    """Create cluster size distribution chart."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Sort by size
    df_sorted = df.sort_values('size', ascending=True)
    
    # Bar chart
    colors = plt.cm.Set3(np.linspace(0, 1, len(df_sorted)))
    bars = ax1.barh(range(len(df_sorted)), df_sorted['size'], color=colors)
    ax1.set_yticks(range(len(df_sorted)))
    ax1.set_yticklabels([name[:40] + '...' if len(name) > 40 else name 
                         for name in df_sorted['cluster_name']], fontsize=9)
    ax1.set_xlabel('Number of Conversations', fontsize=11, fontweight='bold')
    ax1.set_title('Cluster Size Distribution', fontsize=13, fontweight='bold')
    ax1.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, (idx, row) in enumerate(df_sorted.iterrows()):
        ax1.text(row['size'] + 1, i, f"{row['size']} ({row['size_pct']:.1f}%)",
                va='center', fontsize=9)
    
    # Pie chart
    ax2.pie(df_sorted['size'], labels=[name[:25] + '...' if len(name) > 25 else name 
                                      for name in df_sorted['cluster_name']],
           autopct='%1.1f%%', startangle=90, colors=colors, textprops={'fontsize': 9})
    ax2.set_title('Cluster Proportion', fontsize=13, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"Cluster distribution chart saved to: {output_path}")

def create_trajectory_comparison(df: pd.DataFrame, output_path: Path):
    """Create trajectory characteristics comparison."""
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    axes = axes.flatten()
    
    features = [
        ('avg_intensity_mean', 'Average Emotional Intensity', 'Intensity'),
        ('path_straightness_mean', 'Path Straightness', 'Straightness'),
        ('drift_magnitude_mean', 'Drift Magnitude', 'Magnitude'),
        ('intensity_variance_mean', 'Intensity Variance', 'Variance'),
        ('valley_density_mean', 'Valley Density', 'Density'),
        ('peak_density_mean', 'Peak Density', 'Density')
    ]
    
    df_sorted = df.sort_values('size', ascending=False)
    colors = plt.cm.Set3(np.linspace(0, 1, len(df_sorted)))
    
    for idx, (feat, title, ylabel) in enumerate(features):
        ax = axes[idx]
        x_pos = np.arange(len(df_sorted))
        values = df_sorted[feat].values
        stds = df_sorted.get(f'{feat.replace("_mean", "_std")}', pd.Series([0]*len(df_sorted))).values
        
        bars = ax.bar(x_pos, values, yerr=stds, color=colors, alpha=0.8, capsize=5)
        ax.set_xticks(x_pos)
        ax.set_xticklabels([name[:20] + '...' if len(name) > 20 else name 
                           for name in df_sorted['cluster_name']],
                          rotation=45, ha='right', fontsize=8)
        ax.set_ylabel(ylabel, fontsize=10, fontweight='bold')
        ax.set_title(title, fontsize=11, fontweight='bold')
        ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"Trajectory comparison chart saved to: {output_path}")

def create_relational_positioning_map(df: pd.DataFrame, output_path: Path):
    """Create 2D relational positioning map."""
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Create scatter plot
    colors = plt.cm.Set3(np.linspace(0, 1, len(df)))
    
    for idx, row in df.iterrows():
        x = row['final_x_mean']
        y = row['final_y_mean']
        size = row['size'] * 10  # Scale for visibility
        name = row['cluster_name']
        
        ax.scatter(x, y, s=size, c=[colors[idx]], alpha=0.6, edgecolors='black', linewidth=2)
        ax.annotate(name[:30] + '...' if len(name) > 30 else name,
                   (x, y), xytext=(5, 5), textcoords='offset points',
                   fontsize=9, bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7))
    
    # Add quadrant labels
    ax.axvline(x=0.5, color='gray', linestyle='--', alpha=0.5)
    ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5)
    
    ax.text(0.25, 0.9, 'Functional', fontsize=12, fontweight='bold', ha='center')
    ax.text(0.75, 0.9, 'Social', fontsize=12, fontweight='bold', ha='center')
    ax.text(0.05, 0.5, 'Structured', fontsize=12, fontweight='bold', rotation=90, va='center')
    ax.text(0.05, 0.5, 'Emergent', fontsize=12, fontweight='bold', rotation=90, va='center')
    ax.text(0.95, 0.5, 'Emergent', fontsize=12, fontweight='bold', rotation=90, va='center')
    
    ax.set_xlabel('X-Axis: Functional ↔ Social', fontsize=12, fontweight='bold')
    ax.set_ylabel('Y-Axis: Structured ↔ Emergent', fontsize=12, fontweight='bold')
    ax.set_title('Relational Positioning Map: Cluster Locations', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"Relational positioning map saved to: {output_path}")

def create_feature_importance_chart(importance_file: Path, output_path: Path):
    """Create feature importance visualization."""
    with open(importance_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse feature importance from markdown
    features = []
    importances = []
    
    for line in content.split('\n'):
        if '|' in line and '`' in line and 'Importance' not in line and 'Rank' not in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 4:
                try:
                    rank = int(parts[1])
                    feature = parts[2].strip('`')
                    importance = float(parts[3])
                    features.append(feature)
                    importances.append(importance)
                except:
                    continue
    
    if not features:
        print(f"Could not parse feature importance from {importance_file}")
        return
    
    # Take top 15
    top_features = features[:15]
    top_importances = importances[:15]
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    y_pos = np.arange(len(top_features))
    bars = ax.barh(y_pos, top_importances, color=plt.cm.viridis(np.linspace(0, 1, len(top_features))))
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(top_features, fontsize=10)
    ax.set_xlabel('Importance Score', fontsize=12, fontweight='bold')
    ax.set_title('Top 15 Most Discriminative Features', fontsize=14, fontweight='bold')
    ax.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, (feat, imp) in enumerate(zip(top_features, top_importances)):
        ax.text(imp + 0.001, i, f'{imp:.4f}', va='center', fontsize=9)
    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"Feature importance chart saved to: {output_path}")

def create_statistics_table(df: pd.DataFrame, output_path: Path):
    """Create comprehensive statistics table."""
    # Select key statistics
    stats_cols = [
        'cluster_name', 'size', 'size_pct',
        'avg_intensity_mean', 'path_straightness_mean', 'drift_magnitude_mean',
        'intensity_variance_mean', 'valley_density_mean', 'peak_density_mean',
        'final_x_mean', 'final_y_mean',
        'most_common_pattern', 'most_common_purpose',
        'pattern_qa_pct', 'purpose_info_pct'
    ]
    
    # Create formatted table
    stats_df = df[stats_cols].copy()
    stats_df = stats_df.sort_values('size', ascending=False)
    
    # Format percentages
    stats_df['size_pct'] = stats_df['size_pct'].apply(lambda x: f"{x:.1f}%")
    stats_df['pattern_qa_pct'] = stats_df['pattern_qa_pct'].apply(lambda x: f"{x:.1f}%" if pd.notna(x) else "N/A")
    stats_df['purpose_info_pct'] = stats_df['purpose_info_pct'].apply(lambda x: f"{x:.1f}%" if pd.notna(x) else "N/A")
    
    # Format numeric columns
    numeric_cols = ['avg_intensity_mean', 'path_straightness_mean', 'drift_magnitude_mean',
                   'intensity_variance_mean', 'valley_density_mean', 'peak_density_mean',
                   'final_x_mean', 'final_y_mean']
    for col in numeric_cols:
        if col in stats_df.columns:
            stats_df[col] = stats_df[col].apply(lambda x: f"{x:.3f}" if pd.notna(x) else "N/A")
    
    # Rename columns for readability
    stats_df.columns = [
        'Cluster Name', 'Size', 'Size %',
        'Avg Intensity', 'Path Straightness', 'Drift Magnitude',
        'Intensity Variance', 'Valley Density', 'Peak Density',
        'Final X', 'Final Y',
        'Most Common Pattern', 'Most Common Purpose',
        'Q&A Pattern %', 'Info-Seeking Purpose %'
    ]
    
    # Save as markdown table (manual creation)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Cluster Statistics Summary\n\n")
        
        # Create markdown table header
        headers = list(stats_df.columns)
        f.write("| " + " | ".join(headers) + " |\n")
        f.write("|" + "|".join(["---"] * len(headers)) + "|\n")
        
        # Add rows
        for _, row in stats_df.iterrows():
            f.write("| " + " | ".join([str(val) for val in row.values]) + " |\n")
        
        f.write("\n\n")
    
    # Also save as CSV
    csv_path = output_path.with_suffix('.csv')
    stats_df.to_csv(csv_path, index=False)
    
    print(f"Statistics table saved to: {output_path}")
    print(f"Statistics CSV saved to: {csv_path}")

def create_comparison_matrix(df: pd.DataFrame, output_path: Path):
    """Create comparison matrix showing differences between clusters."""
    # Select key features for comparison
    comparison_features = [
        'avg_intensity_mean', 'path_straightness_mean', 'drift_magnitude_mean',
        'intensity_variance_mean', 'valley_density_mean', 'peak_density_mean'
    ]
    
    # Normalize features for comparison
    comparison_df = df[['cluster_name'] + comparison_features].copy()
    comparison_df = comparison_df.set_index('cluster_name')
    
    # Create heatmap
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Normalize each feature to 0-1 scale for visualization
    normalized_df = comparison_df.copy()
    for col in comparison_features:
        col_min = normalized_df[col].min()
        col_max = normalized_df[col].max()
        if col_max > col_min:
            normalized_df[col] = (normalized_df[col] - col_min) / (col_max - col_min)
    
    im = ax.imshow(normalized_df.values, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
    
    # Set ticks
    ax.set_xticks(np.arange(len(comparison_features)))
    ax.set_yticks(np.arange(len(comparison_df)))
    ax.set_xticklabels([f.replace('_mean', '').replace('_', ' ').title() 
                       for f in comparison_features], rotation=45, ha='right')
    ax.set_yticklabels([name[:40] + '...' if len(name) > 40 else name 
                       for name in comparison_df.index], fontsize=9)
    
    # Add text annotations
    for i in range(len(comparison_df)):
        for j in range(len(comparison_features)):
            value = comparison_df.iloc[i, j]
            text = ax.text(j, i, f'{value:.3f}', ha="center", va="center", 
                          color="black" if normalized_df.iloc[i, j] > 0.5 else "white",
                          fontsize=8)
    
    ax.set_title('Cluster Comparison Matrix: Trajectory Features', fontsize=14, fontweight='bold')
    plt.colorbar(im, ax=ax, label='Normalized Value (0=Low, 1=High)')
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"Comparison matrix saved to: {output_path}")

def main():
    """Main dashboard generation function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Load cluster data
    cluster_file = project_root / 'reports' / 'path-clusters-kmeans.json'
    if not cluster_file.exists():
        print(f"Error: Cluster file not found: {cluster_file}")
        return
    
    print("Loading cluster data...")
    cluster_data = load_cluster_data(cluster_file)
    
    print("Extracting statistics...")
    df = extract_cluster_statistics(cluster_data)
    
    # Create output directory
    output_dir = project_root / 'docs' / 'dashboard'
    output_dir.mkdir(exist_ok=True)
    
    print("\nGenerating visualizations...")
    
    # 1. Cluster distribution
    create_cluster_distribution_chart(df, output_dir / 'cluster-distribution.png')
    
    # 2. Trajectory comparison
    create_trajectory_comparison(df, output_dir / 'trajectory-comparison.png')
    
    # 3. Relational positioning map
    create_relational_positioning_map(df, output_dir / 'relational-positioning-map.png')
    
    # 4. Feature importance
    # Check both possible locations (root and cluster-analysis folder)
    importance_file = project_root / 'docs' / 'cluster-analysis' / 'FEATURE_IMPORTANCE_ANALYSIS.md'
    if not importance_file.exists():
        importance_file = project_root / 'docs' / 'FEATURE_IMPORTANCE_KMEANS.md'
    if importance_file.exists():
        create_feature_importance_chart(importance_file, output_dir / 'feature-importance.png')
    
    # 5. Statistics table
    create_statistics_table(df, output_dir / 'statistics-table.md')
    
    # 6. Comparison matrix
    create_comparison_matrix(df, output_dir / 'comparison-matrix.png')
    
    print(f"\n✅ Dashboard generated in: {output_dir}")
    print(f"\nGenerated files:")
    for file in sorted(output_dir.glob('*')):
        print(f"  - {file.name}")

if __name__ == '__main__':
    main()

