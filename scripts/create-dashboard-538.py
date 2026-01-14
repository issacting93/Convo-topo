#!/usr/bin/env python3
"""
Create Dashboard Visualizations for 538 Conversations (New Taxonomy)

Generates cluster dashboard visualizations using the 538 conversations with new taxonomy.
Extracts cluster assignments from comprehensive analysis and generates visualizations.
"""

import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from pathlib import Path
from typing import Dict, List
from collections import defaultdict
import pandas as pd
import sys

# Import dashboard creation functions - copy from create-cluster-dashboard.py
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
    
    df_sorted = df.sort_values('size', ascending=True)
    colors = plt.cm.Set3(np.linspace(0, 1, len(df_sorted)))
    
    bars = ax1.barh(range(len(df_sorted)), df_sorted['size'], color=colors)
    ax1.set_yticks(range(len(df_sorted)))
    ax1.set_yticklabels([name[:40] + '...' if len(name) > 40 else name 
                         for name in df_sorted['cluster_name']], fontsize=9)
    ax1.set_xlabel('Number of Conversations', fontsize=11, fontweight='bold')
    ax1.set_title('Cluster Size Distribution (538 Conversations)', fontsize=13, fontweight='bold')
    ax1.grid(axis='x', alpha=0.3)
    
    for i, (idx, row) in enumerate(df_sorted.iterrows()):
        ax1.text(row['size'] + 1, i, f"{row['size']} ({row['size_pct']:.1f}%)",
                va='center', fontsize=9)
    
    ax2.pie(df_sorted['size'], labels=[name[:25] + '...' if len(name) > 25 else name 
                                      for name in df_sorted['cluster_name']],
           autopct='%1.1f%%', startangle=90, colors=colors, textprops={'fontsize': 9})
    ax2.set_title('Cluster Proportion (538 Conversations)', fontsize=13, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"✅ Cluster distribution chart saved to: {output_path}")

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
        values = df_sorted[feat].values if feat in df_sorted.columns else [0]*len(df_sorted)
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
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"✅ Trajectory comparison chart saved to: {output_path}")

def create_relational_positioning_map(df: pd.DataFrame, output_path: Path):
    """Create 2D relational positioning map."""
    fig, ax = plt.subplots(figsize=(12, 10))
    
    colors = plt.cm.Set3(np.linspace(0, 1, len(df)))
    
    for idx, row in df.iterrows():
        x = row.get('final_x_mean', 0.5) if 'final_x_mean' in df.columns else 0.5
        y = row.get('final_y_mean', 0.5) if 'final_y_mean' in df.columns else 0.5
        size = row['size'] * 10
        name = row['cluster_name']
        
        ax.scatter(x, y, s=size, c=[colors[idx]], alpha=0.6, edgecolors='black', linewidth=2)
        ax.annotate(name[:30] + '...' if len(name) > 30 else name,
                   (x, y), xytext=(5, 5), textcoords='offset points',
                   fontsize=9, bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7))
    
    ax.axvline(x=0.5, color='gray', linestyle='--', alpha=0.5)
    ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5)
    
    ax.text(0.25, 0.9, 'Functional', fontsize=12, fontweight='bold', ha='center')
    ax.text(0.75, 0.9, 'Social', fontsize=12, fontweight='bold', ha='center')
    ax.text(0.05, 0.25, 'Structured', fontsize=12, fontweight='bold', rotation=90, va='center')
    ax.text(0.05, 0.75, 'Emergent', fontsize=12, fontweight='bold', rotation=90, va='center')
    
    ax.set_xlabel('X-Axis: Functional ↔ Social', fontsize=12, fontweight='bold')
    ax.set_ylabel('Y-Axis: Structured ↔ Emergent', fontsize=12, fontweight='bold')
    ax.set_title('Relational Positioning Map: Cluster Locations (538 Conversations)', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"✅ Relational positioning map saved to: {output_path}")

def create_comparison_matrix(df: pd.DataFrame, output_path: Path):
    """Create comparison matrix showing differences between clusters."""
    comparison_features = [
        'avg_intensity_mean', 'path_straightness_mean', 'drift_magnitude_mean',
        'intensity_variance_mean', 'valley_density_mean', 'peak_density_mean'
    ]
    
    comparison_df = df[['cluster_name'] + [f for f in comparison_features if f in df.columns]].copy()
    comparison_df = comparison_df.set_index('cluster_name')
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    normalized_df = comparison_df.copy()
    for col in comparison_features:
        if col in normalized_df.columns:
            col_min = normalized_df[col].min()
            col_max = normalized_df[col].max()
            if col_max > col_min:
                normalized_df[col] = (normalized_df[col] - col_min) / (col_max - col_min)
    
    im = ax.imshow(normalized_df.values, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
    
    ax.set_xticks(np.arange(len(comparison_features)))
    ax.set_yticks(np.arange(len(comparison_df)))
    ax.set_xticklabels([f.replace('_mean', '').replace('_', ' ').title() 
                       for f in comparison_features if f in comparison_df.columns], rotation=45, ha='right')
    ax.set_yticklabels([name[:40] + '...' if len(name) > 40 else name 
                       for name in comparison_df.index], fontsize=9)
    
    for i in range(len(comparison_df)):
        for j in range(len([f for f in comparison_features if f in comparison_df.columns])):
            value = comparison_df.iloc[i, j] if j < len(comparison_df.columns) else 0
            text = ax.text(j, i, f'{value:.3f}', ha="center", va="center", 
                          color="black" if normalized_df.iloc[i, j] > 0.5 else "white",
                          fontsize=8)
    
    ax.set_title('Cluster Comparison Matrix: Trajectory Features (538 Conversations)', fontsize=14, fontweight='bold')
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"✅ Comparison matrix saved to: {output_path}")

def create_statistics_table(df: pd.DataFrame, output_path: Path):
    """Create comprehensive statistics table."""
    stats_cols = [
        'cluster_name', 'size', 'size_pct',
    ]
    
    # Add available feature columns
    for feat in ['avg_intensity_mean', 'path_straightness_mean', 'drift_magnitude_mean',
                 'intensity_variance_mean', 'valley_density_mean', 'peak_density_mean',
                 'final_x_mean', 'final_y_mean']:
        if feat in df.columns:
            stats_cols.append(feat)
    
    if 'most_common_pattern' in df.columns:
        stats_cols.extend(['most_common_pattern', 'pattern_qa_pct'])
    if 'most_common_purpose' in df.columns:
        stats_cols.extend(['most_common_purpose', 'purpose_info_pct'])
    
    stats_df = df[[c for c in stats_cols if c in df.columns]].copy()
    stats_df = stats_df.sort_values('size', ascending=False)
    
    # Format percentages
    if 'size_pct' in stats_df.columns:
        stats_df['size_pct'] = stats_df['size_pct'].apply(lambda x: f"{x:.1f}%")
    
    # Save as CSV
    csv_path = output_path.with_suffix('.csv')
    stats_df.to_csv(csv_path, index=False)
    print(f"✅ Statistics CSV saved to: {csv_path}")
    
    # Also save as markdown (manually create table)
    md_content = "# Cluster Statistics (538 Conversations)\n\n"
    md_content += "| " + " | ".join(stats_df.columns.tolist()) + " |\n"
    md_content += "|" + "|".join(["---"] * len(stats_df.columns)) + "|\n"
    for _, row in stats_df.iterrows():
        md_content += "| " + " | ".join([str(val) for val in row.values]) + " |\n"
    with open(output_path, 'w') as f:
        f.write(md_content)
    print(f"✅ Statistics table saved to: {output_path}")

# Import trajectory feature extraction
try:
    import importlib.util
    spec = importlib.util.spec_from_file_location("cluster_paths_proper", 
        Path(__file__).parent / "cluster-paths-proper.py")
    cluster_paths_proper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(cluster_paths_proper)
    PathTrajectoryFeatures = cluster_paths_proper.PathTrajectoryFeatures
    load_conversations = cluster_paths_proper.load_conversations
    extract_features = cluster_paths_proper.extract_features
except Exception as e:
    print(f"⚠️  Warning: Could not import cluster_paths_proper: {e}")
    PathTrajectoryFeatures = None
    load_conversations = None
    extract_features = None

OUTPUT_DIR = Path("public/output")
REPORTS_DIR = Path("reports")

def load_538_conversations() -> List[Dict]:
    """Load 538 conversations with new taxonomy."""
    conversations = []
    
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        return conversations
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    for file_path in json_files:
        # Skip human-human
        if file_path.name.startswith(('cornell-', 'kaggle-emo-')):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            classification = data.get('classification')
            if not classification:
                continue
            
            metadata = classification.get('metadata', {}) or data.get('classificationMetadata', {})
            if not metadata:
                continue
            
            model = metadata.get('model', '').lower().strip()
            prompt_version = metadata.get('promptVersion', '').strip()
            
            if model == 'gpt-5.2' and prompt_version == '2.0-social-role-theory':
                data['_source_file'] = file_path.name
                data['_conversation_id'] = file_path.stem
                conversations.append(data)
                
        except Exception as e:
            pass
    
    return conversations

def create_cluster_data_from_labels(conversations: List[Dict], cluster_labels: List[int]) -> Dict:
    """Create cluster data structure from conversations and cluster labels."""
    if not PathTrajectoryFeatures:
        return {}
    
    # Group conversations by cluster
    clusters = defaultdict(list)
    
    for i, (conv, label) in enumerate(zip(conversations, cluster_labels)):
        messages = conv.get('messages', [])
        if not messages:
            continue
        
        try:
            # Extract features
            pc = PathTrajectoryFeatures(
                conv.get('_conversation_id', ''),
                messages,
                conv.get('classification')
            )
            features = pc.features
            
            # Create conversation entry with features
            conv_entry = {
                'id': conv.get('_conversation_id', ''),
                'features': features,
                'classification': conv.get('classification', {})
            }
            
            clusters[label].append(conv_entry)
        except Exception as e:
            pass
    
    # Create named clusters based on characteristics
    cluster_names = {}
    cluster_data = {}
    
    # Analyze each cluster to generate meaningful names
    for label, convs in sorted(clusters.items(), key=lambda x: -len(x[1])):
        if not convs:
            continue
        
        # Extract features for analysis
        features_list = [c.get('features', {}) for c in convs]
        
        # Calculate averages
        avg_path_straightness = np.mean([f.get('path_straightness', 0.5) for f in features_list])
        avg_drift_mag = np.mean([f.get('drift_magnitude', 0) for f in features_list])
        avg_intensity_var = np.mean([f.get('intensity_variance', 0) for f in features_list])
        avg_valley_density = np.mean([f.get('valley_density', 0) for f in features_list])
        avg_final_x = np.mean([f.get('final_x', 0.5) for f in features_list])
        avg_final_y = np.mean([f.get('final_y', 0.5) for f in features_list])
        
        # Most common pattern
        patterns = [c.get('classification', {}).get('interactionPattern', {}).get('category') 
                   for c in convs if c.get('classification')]
        most_common_pattern = max(set(patterns), key=patterns.count) if patterns else None
        
        # Most common purpose
        purposes = [c.get('classification', {}).get('conversationPurpose', {}).get('category')
                   for c in convs if c.get('classification')]
        most_common_purpose = max(set(purposes), key=purposes.count) if purposes else None
        
        # Generate name parts
        name_parts = []
        
        # Path characteristics
        if avg_path_straightness > 0.9:
            name_parts.append("StraightPath")
        elif avg_path_straightness < 0.6:
            name_parts.append("MeanderingPath")
        
        # Stability/variance
        if avg_intensity_var < 0.001:
            name_parts.append("Stable")
        elif avg_intensity_var > 0.005:
            name_parts.append("Volatile")
        
        # Drift characteristics (to differentiate similar clusters)
        if avg_drift_mag > 0.5:
            name_parts.append("HighDrift")
        elif avg_drift_mag < 0.3:
            name_parts.append("LowDrift")
        
        # Position quadrant
        if avg_final_x < 0.4 and avg_final_y < 0.4:
            name_parts.append("FunctionalStructured")
        elif avg_final_x < 0.4 and avg_final_y >= 0.4:
            name_parts.append("FunctionalEmergent")
        elif avg_final_x >= 0.4 and avg_final_y < 0.4:
            name_parts.append("SocialStructured")
        elif avg_final_x >= 0.4 and avg_final_y >= 0.4:
            name_parts.append("SocialEmergent")
        
        # Pattern
        if most_common_pattern == 'question-answer':
            name_parts.append("QA")
        elif most_common_pattern == 'collaborative':
            name_parts.append("Collaborative")
        elif most_common_pattern == 'advisory':
            name_parts.append("Advisory")
        elif most_common_pattern == 'casual-chat':
            name_parts.append("Casual")
        elif most_common_pattern == 'storytelling':
            name_parts.append("Narrative")
        
        # Purpose
        if most_common_purpose == 'information-seeking':
            name_parts.append("InfoSeeking")
        elif most_common_purpose == 'problem-solving':
            name_parts.append("ProblemSolving")
        elif most_common_purpose == 'capability-exploration':
            name_parts.append("CapabilityExploration")
        elif most_common_purpose == 'entertainment':
            name_parts.append("Entertainment")
        elif most_common_purpose == 'relationship-building':
            name_parts.append("Relational")
        
        # If no meaningful name generated, use fallback
        if not name_parts:
            name_parts.append(f"Cluster{label}")
        
        cluster_name = "_".join(name_parts)
        
        # Ensure unique names by appending cluster ID if duplicate
        if cluster_name in cluster_data:
            cluster_name = f"{cluster_name}_C{label}"
        
        cluster_data[cluster_name] = convs
    
    return cluster_data

def load_cluster_labels_from_analysis() -> tuple[List[int], Dict]:
    """Load cluster labels from comprehensive analysis."""
    comp_analysis = REPORTS_DIR / "comprehensive-analysis-538.json"
    
    if not comp_analysis.exists():
        print(f"❌ Comprehensive analysis not found: {comp_analysis}")
        return [], {}
    
    with open(comp_analysis, 'r') as f:
        data = json.load(f)
    
    cluster_analysis = data.get('cluster_analysis', {})
    if 'error' in cluster_analysis:
        print(f"❌ Cluster analysis error: {cluster_analysis['error']}")
        return [], {}
    
    labels = cluster_analysis.get('cluster_labels', [])
    cluster_sizes = cluster_analysis.get('cluster_sizes', {})
    
    return labels, cluster_sizes

def main():
    print("="*70)
    print("📊 CREATING DASHBOARD: 538 Conversations (New Taxonomy)")
    print("="*70)
    print()
    
    # Load conversations
    print("📂 Loading 538 conversations...")
    conversations = load_538_conversations()
    print(f"✅ Loaded {len(conversations)} conversations with new taxonomy")
    
    if not conversations:
        print("❌ No conversations found")
        return
    
    # Load cluster labels
    print("\n📂 Loading cluster labels from comprehensive analysis...")
    cluster_labels, cluster_sizes = load_cluster_labels_from_analysis()
    
    if not cluster_labels:
        print("❌ No cluster labels found. Need to run cluster analysis first.")
        print("   Running cluster analysis now...")
        
        # Run cluster analysis
        if not PathTrajectoryFeatures:
            print("❌ Cannot run cluster analysis: PathTrajectoryFeatures not available")
            return
        
        try:
            # Extract features
            print("  Extracting trajectory features...")
            feature_vectors = []
            conv_ids = []
            
            for conv in conversations:
                messages = conv.get('messages', [])
                if not messages:
                    continue
                
                try:
                    pc = PathTrajectoryFeatures(
                        conv.get('_conversation_id', ''),
                        messages,
                        conv.get('classification')
                    )
                    features = pc.get_feature_vector()
                    feature_vectors.append(features)
                    conv_ids.append(conv.get('_conversation_id', ''))
                except Exception as e:
                    pass
            
            if len(feature_vectors) < 7:
                print(f"❌ Not enough feature vectors ({len(feature_vectors)}) for clustering")
                return
            
            feature_vectors = np.array(feature_vectors)
            
            # Scale features
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(feature_vectors)
            
            # K-means clustering (7 clusters)
            print("  Running K-means clustering (k=7)...")
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=7, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(scaled_features).tolist()
            
            print(f"✅ Cluster analysis complete: {len(cluster_labels)} conversations clustered")
            
        except Exception as e:
            print(f"❌ Error running cluster analysis: {e}")
            return
    
    # Match conversations to cluster labels
    print(f"\n📊 Matching {len(conversations)} conversations to {len(cluster_labels)} cluster labels...")
    
    # Filter conversations that have features extracted
    conversations_with_features = []
    labels_for_convs = []
    
    for i, conv in enumerate(conversations):
        messages = conv.get('messages', [])
        if not messages:
            continue
        
        if i < len(cluster_labels):
            conversations_with_features.append(conv)
            labels_for_convs.append(cluster_labels[i])
    
    print(f"✅ Matched {len(conversations_with_features)} conversations with cluster labels")
    
    # Create cluster data structure
    print("\n📊 Creating cluster data structure...")
    cluster_data = create_cluster_data_from_labels(conversations_with_features, labels_for_convs)
    
    if not cluster_data:
        print("❌ Could not create cluster data structure")
        return
    
    print(f"✅ Created {len(cluster_data)} clusters")
    for name, convs in sorted(cluster_data.items(), key=lambda x: -len(x[1])):
        print(f"   - {name}: {len(convs)} conversations")
    
    # Extract statistics
    print("\n📊 Extracting cluster statistics...")
    df = extract_cluster_statistics(cluster_data)
    print(f"✅ Extracted statistics for {len(df)} clusters")
    
    # Create output directory
    output_dir = Path("reports/visualizations/dashboard-538")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📊 Generating visualizations...")
    
    # 1. Cluster distribution
    print("  1. Cluster distribution chart...")
    create_cluster_distribution_chart(df, output_dir / 'cluster-distribution.png')
    
    # 2. Trajectory comparison
    print("  2. Trajectory comparison chart...")
    create_trajectory_comparison(df, output_dir / 'trajectory-comparison.png')
    
    # 3. Relational positioning map
    print("  3. Relational positioning map...")
    create_relational_positioning_map(df, output_dir / 'relational-positioning-map.png')
    
    # 4. Comparison matrix
    print("  4. Comparison matrix...")
    create_comparison_matrix(df, output_dir / 'comparison-matrix.png')
    
    # 5. Statistics table
    print("  5. Statistics table...")
    create_statistics_table(df, output_dir / 'statistics-table.md')
    
    print(f"\n✅ Dashboard generated in: {output_dir}")
    print(f"\n📁 Generated files:")
    for file in sorted(output_dir.glob('*')):
        size_kb = file.stat().st_size / 1024 if file.is_file() else 0
        print(f"   - {file.name} ({size_kb:.1f} KB)")
    
    print("\n" + "="*70)
    print("✅ Dashboard visualizations updated for 538 conversations!")
    print("="*70)

if __name__ == '__main__':
    main()

