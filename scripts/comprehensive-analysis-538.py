#!/usr/bin/env python3
"""
Comprehensive Analysis: 538 Conversations (New Taxonomy)

This script performs all missing analyses on the 538 conversations with new taxonomy:
1. Spatial/trajectory analysis (variance ratios, path generation)
2. Cluster analysis on full 538
3. Trajectory feature importance
4. Comparative analysis (538 vs 345 validated corpus)
5. Advanced statistics (PAD, message length, source-specific)
"""

import json
import statistics
import numpy as np
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Optional
import sys

# Import trajectory analysis modules
sys.path.insert(0, str(Path(__file__).parent))
try:
    import importlib.util
    spec = importlib.util.spec_from_file_location("analyze_path_clusters", Path(__file__).parent / "analyze-path-clusters.py")
    analyze_path_clusters = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(analyze_path_clusters)
    PathCharacteristics = analyze_path_clusters.PathCharacteristics
except ImportError as e:
    print(f"⚠️  Warning: analyze_path_clusters module not found: {e}")
    PathCharacteristics = None

try:
    spec2 = importlib.util.spec_from_file_location("cluster_paths_proper", Path(__file__).parent / "cluster-paths-proper.py")
    cluster_paths_proper = importlib.util.module_from_spec(spec2)
    spec2.loader.exec_module(cluster_paths_proper)
    PathTrajectoryFeatures = cluster_paths_proper.PathTrajectoryFeatures
    load_conversations = cluster_paths_proper.load_conversations
    extract_features = cluster_paths_proper.extract_features
except ImportError as e:
    print(f"⚠️  Warning: cluster_paths_proper module not found: {e}")
    PathTrajectoryFeatures = None
    load_conversations = None
    extract_features = None

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier

OUTPUT_DIR = Path("public/output")
REPORTS_DIR = Path("reports")

def load_filtered_conversations() -> List[Dict]:
    """Load conversations filtered to only new taxonomy (GPT-5.2 + 2.0-social-role-theory)"""
    conversations = []
    
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        return conversations
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"📂 Loading and filtering conversations...")
    
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

def calculate_variance_ratios(conversations: List[Dict]) -> Dict:
    """Calculate variance ratios for intensity trajectories."""
    if not PathCharacteristics:
        return {'error': 'PathCharacteristics not available'}
    
    path_chars = []
    variances = []
    
    for conv in conversations:
        messages = conv.get('messages', [])
        if not messages:
            continue
        
        try:
            pc = PathCharacteristics(conv.get('_conversation_id', ''), messages, conv.get('classification'))
            path_chars.append(pc)
            if pc.intensity_variance > 0:
                variances.append(pc.intensity_variance)
        except Exception as e:
            pass
    
    if not variances:
        return {'error': 'No variance data available'}
    
    variances_sorted = sorted(variances)
    min_var = min(variances)
    max_var = max(variances)
    
    # Calculate ratio
    variance_ratio = max_var / min_var if min_var > 0 else 0
    
    # Find conversations with min/max variance
    min_conv = None
    max_conv = None
    for pc in path_chars:
        if pc.intensity_variance == min_var:
            min_conv = pc.id
        if pc.intensity_variance == max_var:
            max_conv = pc.id
    
    return {
        'total_conversations': len(path_chars),
        'with_variance': len(variances),
        'min_variance': float(min_var),
        'max_variance': float(max_var),
        'variance_ratio': float(variance_ratio),
        'mean_variance': float(statistics.mean(variances)),
        'median_variance': float(statistics.median(variances)),
        'min_variance_conversation': min_conv,
        'max_variance_conversation': max_conv,
        'variance_distribution': {
            'q25': float(np.percentile(variances, 25)),
            'q50': float(np.percentile(variances, 50)),
            'q75': float(np.percentile(variances, 75)),
            'q90': float(np.percentile(variances, 90)),
            'q95': float(np.percentile(variances, 95))
        }
    }

def analyze_pad_distributions(conversations: List[Dict]) -> Dict:
    """Analyze PAD (Pleasure-Arousal-Dominance) score distributions."""
    all_pad = {'pleasure': [], 'arousal': [], 'dominance': []}
    
    for conv in conversations:
        messages = conv.get('messages', [])
        for msg in messages:
            pad = msg.get('pad', {})
            if pad:
                if 'pleasure' in pad:
                    all_pad['pleasure'].append(pad['pleasure'])
                if 'arousal' in pad:
                    all_pad['arousal'].append(pad['arousal'])
                if 'dominance' in pad:
                    all_pad['dominance'].append(pad['dominance'])
    
    results = {}
    for dimension, values in all_pad.items():
        if values:
            results[dimension] = {
                'count': len(values),
                'mean': float(statistics.mean(values)),
                'median': float(statistics.median(values)),
                'std': float(statistics.stdev(values)) if len(values) > 1 else 0.0,
                'min': float(min(values)),
                'max': float(max(values)),
                'q25': float(np.percentile(values, 25)),
                'q75': float(np.percentile(values, 75))
            }
    
    return results

def analyze_message_lengths(conversations: List[Dict]) -> Dict:
    """Analyze message length statistics."""
    lengths = []
    conv_lengths = []
    
    for conv in conversations:
        messages = conv.get('messages', [])
        conv_len = len(messages)
        conv_lengths.append(conv_len)
        
        for msg in messages:
            content = msg.get('content', '')
            if content:
                lengths.append(len(content))
    
    if not lengths:
        return {}
    
    return {
        'total_messages': len(lengths),
        'message_length': {
            'mean': float(statistics.mean(lengths)),
            'median': float(statistics.median(lengths)),
            'std': float(statistics.stdev(lengths)) if len(lengths) > 1 else 0.0,
            'min': int(min(lengths)),
            'max': int(max(lengths))
        },
        'conversation_length': {
            'mean': float(statistics.mean(conv_lengths)),
            'median': float(statistics.median(conv_lengths)),
            'std': float(statistics.stdev(conv_lengths)) if len(conv_lengths) > 1 else 0.0,
            'min': int(min(conv_lengths)),
            'max': int(max(conv_lengths))
        }
    }

def analyze_by_source_patterns(conversations: List[Dict]) -> Dict:
    """Analyze patterns by source (Chatbot Arena, WildChat, OASST)."""
    sources = defaultdict(list)
    
    for conv in conversations:
        filename = conv.get('_source_file', '')
        if filename.startswith('chatbot_arena_'):
            sources['chatbot_arena'].append(conv)
        elif filename.startswith('wildchat_'):
            sources['wildchat'].append(conv)
        elif filename.startswith('oasst-'):
            sources['oasst'].append(conv)
    
    results = {}
    for source, convs in sources.items():
        # Role distributions
        human_roles = Counter()
        ai_roles = Counter()
        role_pairs = Counter()
        
        for conv in convs:
            cls = conv.get('classification', {})
            h_role = cls.get('humanRole', {}).get('distribution', {})
            a_role = cls.get('aiRole', {}).get('distribution', {})
            
            h_max = max(h_role.items(), key=lambda x: x[1])[0] if h_role else None
            a_max = max(a_role.items(), key=lambda x: x[1])[0] if a_role else None
            
            if h_max:
                human_roles[h_max] += 1
            if a_max:
                ai_roles[a_max] += 1
            if h_max and a_max:
                role_pairs[f"{h_max}→{a_max}"] += 1
        
        # Message lengths
        msg_lengths = []
        for conv in convs:
            for msg in conv.get('messages', []):
                content = msg.get('content', '')
                if content:
                    msg_lengths.append(len(content))
        
        results[source] = {
            'count': len(convs),
            'human_roles': dict(human_roles.most_common()),
            'ai_roles': dict(ai_roles.most_common()),
            'top_role_pairs': dict(role_pairs.most_common(10)),
            'avg_message_length': float(statistics.mean(msg_lengths)) if msg_lengths else 0.0,
            'avg_conversation_length': float(statistics.mean([len(c.get('messages', [])) for c in convs])) if convs else 0.0
        }
    
    return results

def cluster_analysis(conversations: List[Dict]) -> Dict:
    """Perform cluster analysis on full 538 dataset."""
    if not PathTrajectoryFeatures or not extract_features:
        return {'error': 'Clustering module not available'}
    
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
            return {'error': f'Not enough feature vectors ({len(feature_vectors)}) for clustering'}
        
        feature_vectors = np.array(feature_vectors)
        
        # Scale features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(feature_vectors)
        
        # K-means clustering (7 clusters, matching 345 analysis)
        print("  Running K-means clustering (k=7)...")
        kmeans = KMeans(n_clusters=7, random_state=42, n_init=10)
        labels = kmeans.fit_predict(scaled_features)
        
        # Calculate silhouette score
        silhouette = silhouette_score(scaled_features, labels)
        
        # Cluster sizes
        cluster_sizes = Counter(labels)
        
        # Feature importance (using random forest)
        print("  Calculating feature importance...")
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(scaled_features, labels)
        feature_importance = rf.feature_importances_
        
        # Identify trajectory features (first 21 features based on PathTrajectoryFeatures)
        trajectory_feature_indices = list(range(21))  # Emotional intensity (10) + Spatial trajectory (11)
        trajectory_importance = np.sum(feature_importance[trajectory_feature_indices])
        total_importance = np.sum(feature_importance)
        trajectory_feature_percentage = (trajectory_importance / total_importance * 100) if total_importance > 0 else 0
        
        return {
            'n_clusters': 7,
            'n_conversations': len(feature_vectors),
            'silhouette_score': float(silhouette),
            'cluster_sizes': {int(k): int(v) for k, v in cluster_sizes.items()},
            'trajectory_feature_importance': float(trajectory_feature_percentage),
            'cluster_labels': labels.tolist(),
            'feature_importance': feature_importance.tolist()
        }
    except Exception as e:
        return {'error': str(e)}

def compare_345_vs_538() -> Dict:
    """Compare 345 validated corpus vs 538 new taxonomy."""
    # Load existing analysis
    existing_345_path = REPORTS_DIR / "path-clusters-kmeans.json"
    new_538_path = REPORTS_DIR / "new-taxonomy-analysis.json"
    
    comparison = {
        'note': 'Comparison requires 345 validated corpus analysis. This is a placeholder.'
    }
    
    if new_538_path.exists():
        with open(new_538_path, 'r') as f:
            data_538 = json.load(f)
        comparison['dataset_538'] = {
            'total': data_538.get('total_conversations', 0),
            'source_breakdown': data_538.get('source_breakdown', {})
        }
    
    return comparison

def main():
    print("="*70)
    print("🔍 COMPREHENSIVE ANALYSIS: 538 Conversations (New Taxonomy)")
    print("="*70)
    print()
    
    # Load conversations
    conversations = load_filtered_conversations()
    print(f"✅ Loaded {len(conversations)} conversations with new taxonomy")
    print()
    
    if not conversations:
        print("❌ No conversations found")
        return
    
    results = {
        'date': str(Path(__file__).stat().st_mtime),
        'total_conversations': len(conversations),
        'filter': {
            'model': 'gpt-5.2',
            'prompt_version': '2.0-social-role-theory'
        }
    }
    
    # 1. Variance Ratios
    print("📊 1. Calculating variance ratios...")
    try:
        results['variance_ratios'] = calculate_variance_ratios(conversations)
        print(f"   ✅ Variance ratio: {results['variance_ratios'].get('variance_ratio', 'N/A'):.1f}x")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['variance_ratios'] = {'error': str(e)}
    
    # 2. PAD Distributions
    print("📊 2. Analyzing PAD distributions...")
    try:
        results['pad_distributions'] = analyze_pad_distributions(conversations)
        print(f"   ✅ Analyzed {sum(len(v) for v in results['pad_distributions'].values())} PAD scores")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['pad_distributions'] = {'error': str(e)}
    
    # 3. Message Lengths
    print("📊 3. Analyzing message lengths...")
    try:
        results['message_lengths'] = analyze_message_lengths(conversations)
        print(f"   ✅ Analyzed {results['message_lengths'].get('total_messages', 0)} messages")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['message_lengths'] = {'error': str(e)}
    
    # 4. Source-Specific Patterns
    print("📊 4. Analyzing source-specific patterns...")
    try:
        results['source_patterns'] = analyze_by_source_patterns(conversations)
        print(f"   ✅ Analyzed {len(results['source_patterns'])} sources")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['source_patterns'] = {'error': str(e)}
    
    # 5. Cluster Analysis
    print("📊 5. Running cluster analysis...")
    try:
        results['cluster_analysis'] = cluster_analysis(conversations)
        if 'error' not in results['cluster_analysis']:
            print(f"   ✅ Silhouette score: {results['cluster_analysis'].get('silhouette_score', 0):.3f}")
            print(f"   ✅ Trajectory feature importance: {results['cluster_analysis'].get('trajectory_feature_importance', 0):.1f}%")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['cluster_analysis'] = {'error': str(e)}
    
    # 6. Comparative Analysis
    print("📊 6. Comparative analysis (538 vs 345)...")
    try:
        results['comparison'] = compare_345_vs_538()
        print(f"   ✅ Comparison prepared")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        results['comparison'] = {'error': str(e)}
    
    # Save results
    output_file = REPORTS_DIR / "comprehensive-analysis-538.json"
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)
    
    print()
    print("="*70)
    print(f"✅ Comprehensive analysis saved to: {output_file}")
    print("="*70)
    
    # Print summary
    print()
    print("📊 SUMMARY")
    print("-"*70)
    print(f"Total conversations analyzed: {len(conversations)}")
    if 'variance_ratios' in results and 'variance_ratio' in results['variance_ratios']:
        print(f"Variance ratio: {results['variance_ratios']['variance_ratio']:.1f}x")
    if 'cluster_analysis' in results and 'trajectory_feature_importance' in results['cluster_analysis']:
        print(f"Trajectory feature importance: {results['cluster_analysis']['trajectory_feature_importance']:.1f}%")
    if 'cluster_analysis' in results and 'silhouette_score' in results['cluster_analysis']:
        print(f"Cluster silhouette score: {results['cluster_analysis']['silhouette_score']:.3f}")

if __name__ == "__main__":
    main()

