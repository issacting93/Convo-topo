#!/usr/bin/env python3
"""
Sensitivity analysis for cluster structure.
Tests different combined score weightings to see how cluster structure changes.
"""

import json
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import sys

# Import functions directly (avoiding hyphen in module name)
import importlib.util
spec = importlib.util.spec_from_file_location("cluster_paths_proper", 
    Path(__file__).parent / "cluster-paths-proper.py")
cluster_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cluster_module)

load_conversations = cluster_module.load_conversations
extract_features = cluster_module.extract_features
name_cluster = cluster_module.name_cluster

def test_weightings(features_list, feature_vectors, 
                    weightings: List[Tuple[float, float]],
                    k_values: List[int] = [3, 4, 5, 6, 7]) -> Dict:
    """Test different weightings and return results."""
    results = {}
    
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    for sil_weight, bal_weight in weightings:
        key = f"{sil_weight:.1f}_{bal_weight:.1f}"
        results[key] = {
            'weighting': (sil_weight, bal_weight),
            'clusters': {}
        }
        
        print(f"\nTesting weighting: {sil_weight:.1f} silhouette, {bal_weight:.1f} balance")
        
        best_result = None
        best_score = -1
        
        for k in k_values:
            # Perform clustering
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(scaled_features)
            
            # Group by cluster
            clusters = defaultdict(list)
            for i, label in enumerate(labels):
                clusters[label].append(features_list[i])
            clusters = dict(clusters)
            
            # Calculate scores
            cluster_sizes = [len(convs) for convs in clusters.values()]
            max_size = max(cluster_sizes) if cluster_sizes else 0
            total_size = sum(cluster_sizes)
            balance_score = 1.0 - (max_size / total_size) if total_size > 0 else 0
            
            singleton_penalty = sum(1 for s in cluster_sizes if s == 1) * 0.1
            balance_score -= singleton_penalty
            
            sil_score = silhouette_score(scaled_features, labels) if len(set(labels)) > 1 else -1
            combined_score = (sil_score * sil_weight) + (balance_score * bal_weight)
            
            results[key]['clusters'][k] = {
                'silhouette': float(sil_score),
                'balance': float(balance_score),
                'combined': float(combined_score),
                'cluster_sizes': cluster_sizes,
                'n_clusters': k
            }
            
            if combined_score > best_score:
                best_score = combined_score
                best_result = (k, clusters, labels, sil_score, balance_score)
        
        if best_result:
            k, clusters, labels, sil_score, balance_score = best_result
            results[key]['best_k'] = k
            results[key]['best_silhouette'] = float(sil_score)
            results[key]['best_balance'] = float(balance_score)
            results[key]['best_combined'] = float(best_score)
            
            # Generate cluster names
            cluster_names = {cid: name_cluster(convs, cid) for cid, convs in clusters.items()}
            results[key]['cluster_names'] = {
                str(cid): name for cid, name in cluster_names.items()
            }
            results[key]['cluster_sizes'] = {
                str(cid): len(convs) for cid, convs in clusters.items()
            }
            
            print(f"  Best k: {k}, silhouette: {sil_score:.3f}, balance: {balance_score:.3f}, combined: {best_score:.3f}")
    
    return results

def generate_sensitivity_report(results: Dict, output_path: Path):
    """Generate sensitivity analysis report."""
    report = []
    report.append("# Sensitivity Analysis: Combined Score Weighting\n\n")
    report.append("This analysis tests how cluster structure changes with different weightings\n")
    report.append("of silhouette score (cluster quality) vs. balance score (distribution).\n\n")
    report.append("---\n\n")
    
    # Summary table
    report.append("## Summary: Best k for Each Weighting\n\n")
    report.append("| Weighting (Sil/Bal) | Best k | Silhouette | Balance | Combined Score |\n")
    report.append("|---------------------|--------|------------|---------|----------------|\n")
    
    for key, data in sorted(results.items()):
        sil_w, bal_w = data['weighting']
        best_k = data.get('best_k', 'N/A')
        sil = data.get('best_silhouette', 0)
        bal = data.get('best_balance', 0)
        comb = data.get('best_combined', 0)
        report.append(f"| {sil_w:.1f}/{bal_w:.1f} | {best_k} | {sil:.3f} | {bal:.3f} | {comb:.3f} |\n")
    
    report.append("\n---\n\n")
    
    # Detailed results for each weighting
    for key, data in sorted(results.items()):
        sil_w, bal_w = data['weighting']
        report.append(f"## Weighting: {sil_w:.1f} Silhouette / {bal_w:.1f} Balance\n\n")
        
        best_k = data.get('best_k', None)
        if best_k:
            report.append(f"**Best k:** {best_k}\n")
            report.append(f"**Silhouette Score:** {data.get('best_silhouette', 0):.3f}\n")
            report.append(f"**Balance Score:** {data.get('best_balance', 0):.3f}\n")
            report.append(f"**Combined Score:** {data.get('best_combined', 0):.3f}\n\n")
            
            # Cluster distribution
            cluster_names = data.get('cluster_names', {})
            cluster_sizes = data.get('cluster_sizes', {})
            
            if cluster_names and cluster_sizes:
                report.append("### Cluster Distribution\n\n")
                sorted_clusters = sorted(
                    [(cid, name, size) for cid, (name, size) in 
                     zip(cluster_names.keys(), zip(cluster_names.values(), cluster_sizes.values()))],
                    key=lambda x: x[2], reverse=True
                )
                
                total = sum(cluster_sizes.values())
                for cid, name, size in sorted_clusters:
                    pct = (size / total * 100) if total > 0 else 0
                    report.append(f"- **{name}**: {size} conversations ({pct:.1f}%)\n")
                report.append("\n")
        
        # Show how k selection changes
        report.append("### k Selection Across Weightings\n\n")
        report.append("| k | Silhouette | Balance | Combined | Cluster Sizes |\n")
        report.append("|---|------------|---------|----------|---------------|\n")
        
        for k, k_data in sorted(data.get('clusters', {}).items()):
            sil = k_data.get('silhouette', 0)
            bal = k_data.get('balance', 0)
            comb = k_data.get('combined', 0)
            sizes = k_data.get('cluster_sizes', [])
            sizes_str = ', '.join(map(str, sorted(sizes, reverse=True)))
            report.append(f"| {k} | {sil:.3f} | {bal:.3f} | {comb:.3f} | {sizes_str} |\n")
        
        report.append("\n---\n\n")
    
    # Insights
    report.append("## Insights\n\n")
    
    # Check if best k is stable
    best_ks = [data.get('best_k') for data in results.values() if data.get('best_k')]
    if best_ks:
        most_common_k = max(set(best_ks), key=best_ks.count)
        report.append(f"### Stability of k Selection\n\n")
        report.append(f"- **Most common best k:** {most_common_k} (appears in {best_ks.count(most_common_k)}/{len(best_ks)} weightings)\n")
        report.append(f"- **k range:** {min(best_ks)} - {max(best_ks)}\n\n")
        
        if len(set(best_ks)) == 1:
            report.append("✅ **Stable:** All weightings select the same k, indicating robust cluster structure.\n\n")
        elif len(set(best_ks)) <= 2:
            report.append("⚠️ **Moderately stable:** Most weightings select similar k values.\n\n")
        else:
            report.append("⚠️ **Unstable:** k selection varies significantly with weighting, indicating sensitivity.\n\n")
    
    # Check cluster name consistency
    report.append("### Cluster Name Consistency\n\n")
    all_cluster_names = []
    for data in results.values():
        names = list(data.get('cluster_names', {}).values())
        all_cluster_names.extend(names)
    
    if all_cluster_names:
        name_counts = defaultdict(int)
        for name in all_cluster_names:
            # Extract base name (before trajectory modifiers)
            base_name = '_'.join(name.split('_')[-3:])  # Last 3 parts
            name_counts[base_name] += 1
        
        report.append("Most common cluster patterns across weightings:\n\n")
        for name, count in sorted(name_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            report.append(f"- **{name}**: appears {count} times\n")
        report.append("\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(''.join(report))
    
    print(f"Sensitivity analysis report saved to: {output_path}")

def main():
    """Main sensitivity analysis function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'public' / 'output'
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        return
    
    print("Loading conversations...")
    conversations = load_conversations(data_dir)
    print(f"Loaded {len(conversations)} conversations")
    
    print("\nExtracting trajectory features...")
    features_list, feature_vectors = extract_features(conversations)
    print(f"Extracted {feature_vectors.shape[1]} features")
    
    # Test different weightings
    weightings = [
        (0.5, 0.5),  # Equal weighting
        (0.6, 0.4),  # Current (default)
        (0.7, 0.3),  # Favor silhouette
        (0.4, 0.6),  # Favor balance
        (0.8, 0.2),  # Strongly favor silhouette
        (0.3, 0.7),  # Strongly favor balance
    ]
    
    print(f"\nTesting {len(weightings)} different weightings...")
    results = test_weightings(features_list, feature_vectors, weightings)
    
    # Generate report
    output_file = project_root / 'docs' / 'SENSITIVITY_ANALYSIS.md'
    generate_sensitivity_report(results, output_file)
    
    # Save raw results
    json_output = project_root / 'reports' / 'sensitivity-analysis.json'
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nRaw results saved to: {json_output}")

if __name__ == '__main__':
    main()

