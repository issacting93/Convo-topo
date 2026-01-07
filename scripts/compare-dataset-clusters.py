#!/usr/bin/env python3
"""
Compare cluster structures between Chatbot Arena and WildChat datasets
"""

import json
from pathlib import Path
from collections import Counter, defaultdict

def load_cluster_assignments():
    """Load cluster assignments from JSON file"""
    cluster_file = Path('reports/path-clusters-hierarchical.json')
    if not cluster_file.exists():
        print("❌ Cluster file not found. Run clustering first.")
        return None
    
    with open(cluster_file) as f:
        return json.load(f)

def analyze_dataset_clusters():
    """Analyze how conversations from different datasets cluster"""
    clusters = load_cluster_assignments()
    if not clusters:
        return
    
    # Separate by dataset
    chatbot_arena = defaultdict(list)
    wildchat = defaultdict(list)
    oasst = defaultdict(list)
    other = defaultdict(list)
    
    for conv_id, cluster_id in clusters.items():
        # Convert cluster_id to string if it's not already
        cluster_key = str(cluster_id) if not isinstance(cluster_id, (str, int)) else cluster_id
        if isinstance(cluster_key, list):
            cluster_key = str(cluster_key[0]) if cluster_key else "unknown"
        
        if conv_id.startswith('chatbot_arena_'):
            chatbot_arena[cluster_key].append(conv_id)
        elif conv_id.startswith('wildchat_'):
            wildchat[cluster_key].append(conv_id)
        elif conv_id.startswith('oasst-'):
            oasst[cluster_key].append(conv_id)
        else:
            other[cluster_key].append(conv_id)
    
    # Load cluster names
    cluster_names = {}
    analysis_file = Path('docs/PATH_CLUSTER_ANALYSIS_HIERARCHICAL.md')
    if analysis_file.exists():
        with open(analysis_file) as f:
            content = f.read()
            import re
            for match in re.finditer(r'## Cluster \d+: (.+?)\n', content):
                cluster_num = int(match.group(0).split()[1].rstrip(':'))
                cluster_name = match.group(1)
                cluster_names[cluster_num] = cluster_name
    
    print("=" * 80)
    print("Dataset Cluster Comparison")
    print("=" * 80)
    print()
    
    # Overall statistics
    total_arena = sum(len(v) for v in chatbot_arena.values())
    total_wildchat = sum(len(v) for v in wildchat.values())
    total_oasst = sum(len(v) for v in oasst.values())
    
    print(f"📊 Dataset Distribution:")
    print(f"  Chatbot Arena: {total_arena} conversations")
    print(f"  WildChat: {total_wildchat} conversations")
    print(f"  OASST: {total_oasst} conversations")
    print()
    
    # Per-cluster breakdown
    all_clusters = set(chatbot_arena.keys()) | set(wildchat.keys()) | set(oasst.keys())
    
    print("=" * 80)
    print("Cluster Distribution by Dataset")
    print("=" * 80)
    print()
    
    for cluster_id in sorted(all_clusters):
        cluster_name = cluster_names.get(int(cluster_id), f"Cluster {cluster_id}")
        arena_count = len(chatbot_arena.get(cluster_id, []))
        wildchat_count = len(wildchat.get(cluster_id, []))
        oasst_count = len(oasst.get(cluster_id, []))
        total = arena_count + wildchat_count + oasst_count
        
        if total == 0:
            continue
        
        arena_pct = (arena_count / total * 100) if total > 0 else 0
        wildchat_pct = (wildchat_count / total * 100) if total > 0 else 0
        oasst_pct = (oasst_count / total * 100) if total > 0 else 0
        
        print(f"**{cluster_name}** (n={total})")
        print(f"  Chatbot Arena: {arena_count} ({arena_pct:.1f}%)")
        print(f"  WildChat: {wildchat_count} ({wildchat_pct:.1f}%)")
        print(f"  OASST: {oasst_count} ({oasst_pct:.1f}%)")
        print()
    
    # Dataset-specific patterns
    print("=" * 80)
    print("Dataset-Specific Patterns")
    print("=" * 80)
    print()
    
    # Chatbot Arena dominant clusters
    arena_clusters = {k: len(v) for k, v in chatbot_arena.items()}
    if arena_clusters:
        print("**Chatbot Arena Top Clusters:**")
        for cluster_id, count in sorted(arena_clusters.items(), key=lambda x: x[1], reverse=True)[:5]:
            cluster_name = cluster_names.get(int(cluster_id), f"Cluster {cluster_id}")
            pct = (count / total_arena * 100) if total_arena > 0 else 0
            print(f"  {cluster_name}: {count} ({pct:.1f}%)")
        print()
    
    # WildChat dominant clusters
    wildchat_clusters = {k: len(v) for k, v in wildchat.items()}
    if wildchat_clusters:
        print("**WildChat Top Clusters:**")
        for cluster_id, count in sorted(wildchat_clusters.items(), key=lambda x: x[1], reverse=True)[:5]:
            cluster_name = cluster_names.get(int(cluster_id), f"Cluster {cluster_id}")
            pct = (count / total_wildchat * 100) if total_wildchat > 0 else 0
            print(f"  {cluster_name}: {count} ({pct:.1f}%)")
        print()
    
    # Clusters unique to or dominated by each dataset
    print("=" * 80)
    print("Cross-Dataset Insights")
    print("=" * 80)
    print()
    
    # Find clusters where one dataset dominates (>70%)
    for cluster_id in sorted(all_clusters):
        arena_count = len(chatbot_arena.get(cluster_id, []))
        wildchat_count = len(wildchat.get(cluster_id, []))
        oasst_count = len(oasst.get(cluster_id, []))
        total = arena_count + wildchat_count + oasst_count
        
        if total < 5:  # Skip small clusters
            continue
        
        arena_pct = (arena_count / total * 100) if total > 0 else 0
        wildchat_pct = (wildchat_count / total * 100) if total > 0 else 0
        
        cluster_name = cluster_names.get(int(cluster_id), f"Cluster {cluster_id}")
        
        if arena_pct > 70:
            print(f"**{cluster_name}**: Chatbot Arena dominated ({arena_pct:.1f}% Arena)")
        elif wildchat_pct > 70:
            print(f"**{cluster_name}**: WildChat dominated ({wildchat_pct:.1f}% WildChat)")
        elif arena_pct > 50 and wildchat_pct > 20:
            print(f"**{cluster_name}**: Mixed (Arena {arena_pct:.1f}%, WildChat {wildchat_pct:.1f}%)")
    
    # Save detailed report
    report = {
        "summary": {
            "total_arena": total_arena,
            "total_wildchat": total_wildchat,
            "total_oasst": total_oasst
        },
        "clusters": {}
    }
    
    for cluster_id in sorted(all_clusters):
        cluster_name = cluster_names.get(int(cluster_id), f"Cluster {cluster_id}")
        report["clusters"][cluster_id] = {
            "name": cluster_name,
            "chatbot_arena": len(chatbot_arena.get(cluster_id, [])),
            "wildchat": len(wildchat.get(cluster_id, [])),
            "oasst": len(oasst.get(cluster_id, []))
        }
    
    report_file = Path('reports/dataset-cluster-comparison.json')
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print()
    print(f"✅ Detailed report saved to: {report_file}")

if __name__ == '__main__':
    analyze_dataset_clusters()

