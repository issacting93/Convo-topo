#!/usr/bin/env python3
"""
Calculate silhouette scores and inter-cluster distances for cluster analysis.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict
from sklearn.metrics import silhouette_score, silhouette_samples
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from scipy.spatial.distance import cdist
import sys

# Import from cluster-paths-proper
sys.path.insert(0, str(Path(__file__).parent))
import importlib.util
spec = importlib.util.spec_from_file_location("cluster_paths_proper", 
    Path(__file__).parent / "cluster-paths-proper.py")
cluster_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cluster_module)

load_conversations = cluster_module.load_conversations
extract_features = cluster_module.extract_features

def calculate_inter_cluster_distances(feature_vectors: np.ndarray, labels: np.ndarray) -> Dict:
    """Calculate distances between cluster centroids."""
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    unique_labels = sorted(set(labels))
    n_clusters = len(unique_labels)
    
    # Calculate cluster centroids
    centroids = []
    for label in unique_labels:
        mask = labels == label
        centroid = np.mean(scaled_features[mask], axis=0)
        centroids.append(centroid)
    centroids = np.array(centroids)
    
    # Calculate pairwise distances
    distances = cdist(centroids, centroids, metric='euclidean')
    
    # Calculate intra-cluster distances (average distance within each cluster)
    intra_distances = {}
    for i, label in enumerate(unique_labels):
        mask = labels == label
        cluster_points = scaled_features[mask]
        if len(cluster_points) > 1:
            intra_dist = np.mean([np.linalg.norm(p - centroids[i]) for p in cluster_points])
            intra_distances[label] = float(intra_dist)
        else:
            intra_distances[label] = 0.0
    
    # Calculate inter-cluster distances (distance between centroids)
    inter_distances = {}
    for i in range(n_clusters):
        for j in range(i+1, n_clusters):
            inter_distances[(unique_labels[i], unique_labels[j])] = float(distances[i, j])
    
    # Calculate minimum inter-cluster distance
    min_inter = min(inter_distances.values()) if inter_distances else 0
    max_inter = max(inter_distances.values()) if inter_distances else 0
    avg_inter = np.mean(list(inter_distances.values())) if inter_distances else 0
    
    # Calculate average intra-cluster distance
    avg_intra = np.mean(list(intra_distances.values())) if intra_distances else 0
    
    return {
        'centroids': centroids.tolist(),
        'intra_cluster_distances': intra_distances,
        'inter_cluster_distances': inter_distances,
        'min_inter_cluster_distance': float(min_inter),
        'max_inter_cluster_distance': float(max_inter),
        'avg_inter_cluster_distance': float(avg_inter),
        'avg_intra_cluster_distance': float(avg_intra),
        'separation_ratio': float(avg_inter / avg_intra) if avg_intra > 0 else 0
    }

def calculate_silhouette_metrics(feature_vectors: np.ndarray, labels: np.ndarray) -> Dict:
    """Calculate detailed silhouette metrics."""
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    # Overall silhouette score
    overall_silhouette = silhouette_score(scaled_features, labels)
    
    # Per-sample silhouette scores
    sample_silhouettes = silhouette_samples(scaled_features, labels)
    
    # Per-cluster silhouette scores
    unique_labels = sorted(set(labels))
    cluster_silhouettes = {}
    for label in unique_labels:
        mask = labels == label
        cluster_silhouettes[label] = {
            'mean': float(np.mean(sample_silhouettes[mask])),
            'std': float(np.std(sample_silhouettes[mask])),
            'min': float(np.min(sample_silhouettes[mask])),
            'max': float(np.max(sample_silhouettes[mask]))
        }
    
    return {
        'overall_silhouette_score': float(overall_silhouette),
        'per_cluster_silhouette': cluster_silhouettes,
        'sample_silhouettes': sample_silhouettes.tolist()
    }

def generate_separation_report(silhouette_metrics: Dict, distance_metrics: Dict, output_path: Path):
    """Generate separation metrics report."""
    report = []
    report.append("# Cluster Separation Metrics\n\n")
    report.append("This report provides detailed metrics on cluster separation and quality.\n\n")
    report.append("---\n\n")
    
    # Silhouette scores
    report.append("## Silhouette Scores\n\n")
    report.append("Silhouette score measures how well-separated clusters are. Range: -1 to 1.\n")
    report.append("- **>0.5:** Strong separation\n")
    report.append("- **0.3-0.5:** Moderate separation\n")
    report.append("- **<0.3:** Weak separation (overlapping clusters)\n\n")
    
    overall_sil = silhouette_metrics.get('overall_silhouette_score', 0)
    report.append(f"### Overall Silhouette Score: **{overall_sil:.3f}**\n\n")
    
    if overall_sil < 0.3:
        report.append("⚠️ **Interpretation:** Weak separation. Clusters show significant overlap, suggesting continuous variation rather than discrete types.\n\n")
    elif overall_sil < 0.5:
        report.append("⚠️ **Interpretation:** Moderate separation. Clusters are distinguishable but with some overlap.\n\n")
    else:
        report.append("✅ **Interpretation:** Strong separation. Clusters are well-separated.\n\n")
    
    # Per-cluster silhouette
    report.append("### Per-Cluster Silhouette Scores\n\n")
    report.append("| Cluster | Mean | Std | Min | Max |\n")
    report.append("|---------|------|-----|-----|-----|\n")
    
    for label, metrics in sorted(silhouette_metrics.get('per_cluster_silhouette', {}).items()):
        report.append(f"| {label} | {metrics['mean']:.3f} | {metrics['std']:.3f} | {metrics['min']:.3f} | {metrics['max']:.3f} |\n")
    
    report.append("\n---\n\n")
    
    # Inter-cluster distances
    report.append("## Inter-Cluster Distances\n\n")
    report.append("Distances between cluster centroids in feature space.\n\n")
    
    min_inter = distance_metrics.get('min_inter_cluster_distance', 0)
    max_inter = distance_metrics.get('max_inter_cluster_distance', 0)
    avg_inter = distance_metrics.get('avg_inter_cluster_distance', 0)
    avg_intra = distance_metrics.get('avg_intra_cluster_distance', 0)
    separation_ratio = distance_metrics.get('separation_ratio', 0)
    
    report.append(f"- **Minimum Inter-Cluster Distance:** {min_inter:.3f}\n")
    report.append(f"- **Maximum Inter-Cluster Distance:** {max_inter:.3f}\n")
    report.append(f"- **Average Inter-Cluster Distance:** {avg_inter:.3f}\n")
    report.append(f"- **Average Intra-Cluster Distance:** {avg_intra:.3f}\n")
    report.append(f"- **Separation Ratio (Inter/Intra):** {separation_ratio:.3f}\n\n")
    
    if separation_ratio > 2.0:
        report.append("✅ **Interpretation:** Strong separation (inter-cluster distance > 2x intra-cluster distance)\n\n")
    elif separation_ratio > 1.5:
        report.append("⚠️ **Interpretation:** Moderate separation\n\n")
    else:
        report.append("⚠️ **Interpretation:** Weak separation (clusters are close relative to their internal spread)\n\n")
    
    # Pairwise distances
    report.append("### Pairwise Cluster Distances\n\n")
    report.append("| Cluster A | Cluster B | Distance |\n")
    report.append("|-----------|-----------|----------|\n")
    
    inter_dists = distance_metrics.get('inter_cluster_distances', {})
    for (label_a, label_b), dist in sorted(inter_dists.items(), key=lambda x: x[1]):
        report.append(f"| {label_a} | {label_b} | {dist:.3f} |\n")
    
    report.append("\n---\n\n")
    
    # Summary
    report.append("## Summary\n\n")
    report.append(f"**Overall Silhouette Score:** {overall_sil:.3f}\n")
    report.append(f"**Separation Ratio:** {separation_ratio:.3f}\n\n")
    
    if overall_sil < 0.3 and separation_ratio < 1.5:
        report.append("**Conclusion:** Clusters show weak separation, indicating significant overlap. ")
        report.append("This suggests the data may represent continuous variation rather than discrete types. ")
        report.append("Clusters should be interpreted as 'archetypes' or 'tendencies' rather than distinct categories.\n")
    elif overall_sil >= 0.3 and separation_ratio >= 1.5:
        report.append("**Conclusion:** Clusters show moderate to strong separation, supporting their interpretation as distinct types.\n")
    else:
        report.append("**Conclusion:** Mixed separation metrics. Clusters are distinguishable but with some overlap.\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(''.join(report))
    
    print(f"Separation metrics report saved to: {output_path}")

def main():
    """Main calculation function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'public' / 'output'
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        return
    
    print("Loading conversations...")
    conversations = load_conversations(data_dir)
    print(f"Loaded {len(conversations)} conversations")
    
    print("\nExtracting features...")
    features_list, feature_vectors = extract_features(conversations)
    print(f"Extracted {feature_vectors.shape[1]} features")
    
    # Perform clustering (same as main analysis)
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    kmeans = KMeans(n_clusters=7, random_state=42, n_init=10)
    labels = kmeans.fit_predict(scaled_features)
    
    print("\nCalculating silhouette metrics...")
    silhouette_metrics = calculate_silhouette_metrics(feature_vectors, labels)
    
    print("Calculating inter-cluster distances...")
    distance_metrics = calculate_inter_cluster_distances(feature_vectors, labels)
    
    # Generate report
    output_file = project_root / 'docs' / 'CLUSTER_SEPARATION_METRICS.md'
    generate_separation_report(silhouette_metrics, distance_metrics, output_file)
    
    # Save raw metrics (convert numpy types to native Python types)
    def convert_numpy(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {str(k): convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(item) for item in obj]
        return obj
    
    json_output = project_root / 'reports' / 'cluster-separation-metrics.json'
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump({
            'silhouette_metrics': convert_numpy(silhouette_metrics),
            'distance_metrics': convert_numpy(distance_metrics)
        }, f, indent=2)
    
    print(f"\nRaw metrics saved to: {json_output}")
    print(f"\nOverall Silhouette Score: {silhouette_metrics['overall_silhouette_score']:.3f}")
    print(f"Separation Ratio: {distance_metrics['separation_ratio']:.3f}")

if __name__ == '__main__':
    main()

