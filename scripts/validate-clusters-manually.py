#!/usr/bin/env python3
"""
Manual cluster validation script.
Samples conversations from each cluster and displays key characteristics
for manual review to verify clusters make sense.
"""

import json
import random
from pathlib import Path
from typing import Dict, List
from collections import defaultdict

def load_cluster_data(cluster_file: Path) -> Dict[str, List[Dict]]:
    """Load cluster data from JSON file."""
    with open(cluster_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_conversation(conv_id: str, data_dir: Path) -> Dict:
    """Load a conversation file."""
    conv_file = data_dir / f"{conv_id}.json"
    if not conv_file.exists():
        return None
    with open(conv_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def sample_conversations(cluster_data: Dict[str, List[Dict]], 
                        samples_per_cluster: int = 5,
                        data_dir: Path = None) -> Dict[str, List[Dict]]:
    """Sample conversations from each cluster."""
    samples = {}
    
    for cluster_name, conversations in cluster_data.items():
        # Sample up to samples_per_cluster conversations
        sample_size = min(samples_per_cluster, len(conversations))
        sampled = random.sample(conversations, sample_size)
        
        # Load full conversation data if data_dir provided
        if data_dir:
            full_convs = []
            for conv in sampled:
                conv_id = conv.get('id', '')
                full_conv = load_conversation(conv_id, data_dir)
                if full_conv:
                    full_conv['cluster_features'] = conv.get('features', {})
                    full_convs.append(full_conv)
            samples[cluster_name] = full_convs
        else:
            samples[cluster_name] = sampled
    
    return samples

def generate_validation_report(samples: Dict[str, List[Dict]]) -> str:
    """Generate a validation report for manual review."""
    report = []
    report.append("# Manual Cluster Validation Report\n\n")
    report.append("This report samples conversations from each cluster for manual review.\n")
    report.append("Review each cluster to verify that conversations share similar characteristics.\n\n")
    report.append("---\n\n")
    
    for cluster_name, conversations in samples.items():
        report.append(f"## Cluster: {cluster_name}\n\n")
        report.append(f"**Sample Size:** {len(conversations)} conversations\n\n")
        
        # Calculate cluster statistics
        if conversations and 'cluster_features' in conversations[0]:
            features_to_check = [
                'avg_intensity', 'intensity_variance', 'path_straightness',
                'drift_magnitude', 'valley_density', 'peak_density'
            ]
            
            report.append("### Cluster Statistics (from sampled conversations)\n\n")
            for feat in features_to_check:
                values = [c.get('cluster_features', {}).get(feat, 0) for c in conversations if 'cluster_features' in c]
                if values:
                    avg = sum(values) / len(values)
                    min_val = min(values)
                    max_val = max(values)
                    report.append(f"- **{feat.replace('_', ' ').title()}:** {avg:.3f} (range: {min_val:.3f} - {max_val:.3f})\n")
            report.append("\n")
        
        # Show conversation details
        report.append("### Sampled Conversations\n\n")
        for i, conv in enumerate(conversations, 1):
            conv_id = conv.get('id', 'unknown')
            messages = conv.get('messages', [])
            classification = conv.get('classification', {})
            
            pattern = classification.get('interactionPattern', {}).get('category', 'unknown')
            tone = classification.get('emotionalTone', {}).get('category', 'unknown')
            purpose = classification.get('conversationPurpose', {}).get('category', 'unknown')
            
            # Get first and last message snippets
            first_msg = messages[0].get('content', '')[:100] if messages else 'No messages'
            last_msg = messages[-1].get('content', '')[:100] if messages else 'No messages'
            
            report.append(f"#### {i}. `{conv_id}`\n\n")
            report.append(f"- **Message Count:** {len(messages)}\n")
            report.append(f"- **Pattern:** {pattern}\n")
            report.append(f"- **Tone:** {tone}\n")
            report.append(f"- **Purpose:** {purpose}\n")
            
            if 'cluster_features' in conv:
                features = conv['cluster_features']
                report.append(f"- **Avg Intensity:** {features.get('avg_intensity', 0):.3f}\n")
                report.append(f"- **Path Straightness:** {features.get('path_straightness', 0):.3f}\n")
                report.append(f"- **Drift Magnitude:** {features.get('drift_magnitude', 0):.3f}\n")
            
            report.append(f"- **First Message:** {first_msg}...\n")
            report.append(f"- **Last Message:** {last_msg}...\n")
            report.append("\n")
        
        report.append("---\n\n")
    
    # Add validation checklist
    report.append("## Validation Checklist\n\n")
    report.append("For each cluster, verify:\n\n")
    report.append("- [ ] Conversations share similar interaction patterns\n")
    report.append("- [ ] Conversations have similar purposes\n")
    report.append("- [ ] Trajectory characteristics (intensity, drift, path) are consistent\n")
    report.append("- [ ] Conversations feel like they belong together\n")
    report.append("- [ ] No obvious outliers that don't fit the cluster\n")
    report.append("- [ ] Cluster name accurately describes the conversations\n\n")
    
    return ''.join(report)

def main():
    """Main validation function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Load cluster data
    cluster_file = project_root / 'reports' / 'path-clusters-kmeans.json'
    if not cluster_file.exists():
        print(f"Error: Cluster file not found: {cluster_file}")
        return
    
    print("Loading cluster data...")
    cluster_data = load_cluster_data(cluster_file)
    print(f"Loaded {len(cluster_data)} clusters")
    
    # Set random seed for reproducibility
    random.seed(42)
    
    # Sample conversations
    data_dir = project_root / 'public' / 'output'
    print(f"\nSampling conversations from each cluster...")
    samples = sample_conversations(cluster_data, samples_per_cluster=5, data_dir=data_dir)
    
    # Generate report
    print("Generating validation report...")
    report = generate_validation_report(samples)
    
    # Save report
    output_file = project_root / 'docs' / 'CLUSTER_VALIDATION_MANUAL.md'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nValidation report saved to: {output_file}")
    print(f"\nReview the report to verify clusters make sense together.")

if __name__ == '__main__':
    main()

