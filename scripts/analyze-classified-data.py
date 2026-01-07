#!/usr/bin/env python3
"""
Deep Dive Analysis of Classified Conversation Data

Analyzes all classified conversations in public/output/ to provide:
- Data completeness statistics
- Classification distribution patterns
- Classifier performance metrics
- Data quality issues
- Correlation analysis
- PAD data analysis
"""

import json
import os
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import statistics

# Configuration
OUTPUT_DIR = Path("public/output")
REQUIRED_DIMENSIONS = [
    "interactionPattern",
    "powerDynamics",
    "emotionalTone",
    "engagementStyle",
    "knowledgeExchange",
    "conversationPurpose",
    "topicDepth",
    "turnTaking",
    "humanRole",
    "aiRole"
]

HUMAN_ROLES = ["seeker", "learner", "director", "collaborator", "sharer", "challenger"]
AI_ROLES = ["expert", "advisor", "facilitator", "reflector", "peer", "affiliative"]


def load_all_conversations() -> List[Dict]:
    """Load all conversation files from output directory"""
    conversations = []
    
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        return conversations
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    # Exclude manifest.json
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"📂 Found {len(json_files)} JSON files in {OUTPUT_DIR}")
    
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data['_source_file'] = file_path.name
                conversations.append(data)
        except json.JSONDecodeError as e:
            print(f"⚠️  JSON decode error in {file_path.name}: {e}")
        except Exception as e:
            print(f"⚠️  Error loading {file_path.name}: {e}")
    
    return conversations


def analyze_completeness(conversations: List[Dict]) -> Dict:
    """Analyze data completeness"""
    stats = {
        'total': len(conversations),
        'has_classification': 0,
        'has_messages': 0,
        'has_pad': 0,
        'complete_classifications': 0,
        'missing_dimensions': defaultdict(int),
        'missing_pad_count': 0,
        'missing_roles': {
            'humanRole': 0,
            'aiRole': 0,
            'both': 0
        },
        'unknown_dimensions': defaultdict(int)
    }
    
    for conv in conversations:
        # Check classification
        if conv.get('classification'):
            stats['has_classification'] += 1
            classification = conv['classification']
            
            # Check each dimension
            missing_dims = []
            unknown_dims = []
            
            for dim in REQUIRED_DIMENSIONS:
                if dim not in classification:
                    missing_dims.append(dim)
                else:
                    dim_data = classification[dim]
                    if isinstance(dim_data, dict):
                        # For role dimensions, check distribution instead of category
                        if dim in ['humanRole', 'aiRole']:
                            dist = dim_data.get('distribution', {})
                            if not dist or all(v == 0 for v in dist.values()):
                                unknown_dims.append(dim)
                        else:
                            # For other dimensions, check category
                            category = dim_data.get('category', '')
                            if category == 'unknown' or not category:
                                unknown_dims.append(dim)
            
            # Check roles
            has_human_role = (
                'humanRole' in classification and
                classification['humanRole'].get('distribution') and
                any(v > 0 for v in classification['humanRole']['distribution'].values())
            )
            has_ai_role = (
                'aiRole' in classification and
                classification['aiRole'].get('distribution') and
                any(v > 0 for v in classification['aiRole']['distribution'].values())
            )
            
            if not has_human_role:
                stats['missing_roles']['humanRole'] += 1
            if not has_ai_role:
                stats['missing_roles']['aiRole'] += 1
            if not has_human_role and not has_ai_role:
                stats['missing_roles']['both'] += 1
            
            # Count missing/unknown
            for dim in missing_dims:
                stats['missing_dimensions'][dim] += 1
            for dim in unknown_dims:
                stats['unknown_dimensions'][dim] += 1
            
            # Check if complete
            if (len(missing_dims) == 0 and len(unknown_dims) == 0 and 
                has_human_role and has_ai_role):
                stats['complete_classifications'] += 1
        
        # Check messages
        if conv.get('messages') and len(conv.get('messages', [])) > 0:
            stats['has_messages'] += 1
            
            # Check PAD
            messages_with_pad = [
                msg for msg in conv['messages']
                if msg.get('pad') and msg['pad'].get('emotionalIntensity') is not None
            ]
            if messages_with_pad:
                stats['has_pad'] += 1
            else:
                stats['missing_pad_count'] += 1
    
    return stats


def analyze_classifier_performance(conversations: List[Dict]) -> Dict:
    """Analyze classifier performance and metadata"""
    stats = {
        'by_provider': defaultdict(lambda: {
            'count': 0,
            'complete': 0,
            'incomplete': 0,
            'missing_pad': 0,
            'avg_confidence': [],
            'models': Counter()
        }),
        'by_model': defaultdict(lambda: {
            'count': 0,
            'complete': 0,
            'incomplete': 0
        }),
        'no_metadata': 0,
        'processing_times': []
    }
    
    for conv in conversations:
        metadata = conv.get('classificationMetadata', {})
        
        if not metadata:
            stats['no_metadata'] += 1
            provider = 'unknown'
            model = 'unknown'
        else:
            provider = metadata.get('provider', 'unknown')
            model = metadata.get('model', 'unknown')
            
            if metadata.get('processingTimeMs'):
                stats['processing_times'].append(metadata['processingTimeMs'])
        
        # Check completeness
        classification = conv.get('classification', {})
        is_complete = (
            classification and
            all(dim in classification for dim in REQUIRED_DIMENSIONS) and
            classification.get('humanRole', {}).get('distribution') and
            classification.get('aiRole', {}).get('distribution')
        )
        
        # Check PAD
        has_pad = False
        if conv.get('messages'):
            has_pad = any(
                msg.get('pad', {}).get('emotionalIntensity') is not None
                for msg in conv['messages']
            )
        
        # Update stats
        stats['by_provider'][provider]['count'] += 1
        stats['by_model'][model]['count'] += 1
        stats['by_provider'][provider]['models'][model] += 1
        
        if is_complete:
            stats['by_provider'][provider]['complete'] += 1
            stats['by_model'][model]['complete'] += 1
        else:
            stats['by_provider'][provider]['incomplete'] += 1
            stats['by_model'][model]['incomplete'] += 1
        
        if not has_pad:
            stats['by_provider'][provider]['missing_pad'] += 1
        
        # Confidence
        if classification:
            confidences = []
            for dim in REQUIRED_DIMENSIONS:
                if dim in classification:
                    conf = classification[dim].get('confidence')
                    if conf is not None:
                        confidences.append(conf)
            if confidences:
                avg_conf = sum(confidences) / len(confidences)
                stats['by_provider'][provider]['avg_confidence'].append(avg_conf)
    
    # Calculate averages
    for provider in stats['by_provider']:
        confs = stats['by_provider'][provider]['avg_confidence']
        if confs:
            stats['by_provider'][provider]['avg_confidence'] = statistics.mean(confs)
        else:
            stats['by_provider'][provider]['avg_confidence'] = None
    
    if stats['processing_times']:
        stats['avg_processing_time'] = statistics.mean(stats['processing_times'])
        stats['median_processing_time'] = statistics.median(stats['processing_times'])
    else:
        stats['avg_processing_time'] = None
        stats['median_processing_time'] = None
    
    return stats


def analyze_classification_distributions(conversations: List[Dict]) -> Dict:
    """Analyze distribution of classification categories"""
    distributions = {
        'interactionPattern': Counter(),
        'powerDynamics': Counter(),
        'emotionalTone': Counter(),
        'engagementStyle': Counter(),
        'knowledgeExchange': Counter(),
        'conversationPurpose': Counter(),
        'topicDepth': Counter(),
        'turnTaking': Counter(),
        'humanRole': defaultdict(float),
        'aiRole': defaultdict(float),
        'confidence_distributions': {
            dim: [] for dim in REQUIRED_DIMENSIONS
        }
    }
    
    for conv in conversations:
        classification = conv.get('classification', {})
        if not classification:
            continue
        
        # Categorical dimensions
        for dim in ['interactionPattern', 'powerDynamics', 'emotionalTone', 
                    'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
                    'topicDepth', 'turnTaking']:
            if dim in classification:
                category = classification[dim].get('category', 'unknown')
                distributions[dim][category] += 1
                
                conf = classification[dim].get('confidence')
                if conf is not None:
                    distributions['confidence_distributions'][dim].append(conf)
        
        # Role distributions
        for role_type in ['humanRole', 'aiRole']:
            if role_type in classification:
                role_dist = classification[role_type].get('distribution', {})
                if role_dist:
                    for role, value in role_dist.items():
                        distributions[role_type][role] += value
        
        # Confidence for roles
        for role_type in ['humanRole', 'aiRole']:
            if role_type in classification:
                conf = classification[role_type].get('confidence')
                if conf is not None:
                    distributions['confidence_distributions'][role_type].append(conf)
    
    # Calculate confidence statistics
    distributions['confidence_stats'] = {}
    for dim in distributions['confidence_distributions']:
        confs = distributions['confidence_distributions'][dim]
        if confs:
            distributions['confidence_stats'][dim] = {
                'mean': statistics.mean(confs),
                'median': statistics.median(confs),
                'min': min(confs),
                'max': max(confs),
                'stdev': statistics.stdev(confs) if len(confs) > 1 else 0
            }
        else:
            distributions['confidence_stats'][dim] = None
    
    return distributions


def analyze_pad_data(conversations: List[Dict]) -> Dict:
    """Analyze PAD (Pleasure-Arousal-Dominance) data"""
    stats = {
        'conversations_with_pad': 0,
        'total_messages_with_pad': 0,
        'total_messages': 0,
        'pad_coverage': 0.0,
        'pleasure_stats': [],
        'arousal_stats': [],
        'dominance_stats': [],
        'emotional_intensity_stats': [],
        'pad_by_message_index': defaultdict(list)
    }
    
    for conv in conversations:
        messages = conv.get('messages', [])
        if not messages:
            continue
        
        stats['total_messages'] += len(messages)
        has_pad = False
        
        for i, msg in enumerate(messages):
            pad = msg.get('pad')
            if pad:
                has_pad = True
                stats['total_messages_with_pad'] += 1
                
                if pad.get('pleasure') is not None:
                    stats['pleasure_stats'].append(pad['pleasure'])
                if pad.get('arousal') is not None:
                    stats['arousal_stats'].append(pad['arousal'])
                if pad.get('dominance') is not None:
                    stats['dominance_stats'].append(pad['dominance'])
                if pad.get('emotionalIntensity') is not None:
                    stats['emotional_intensity_stats'].append(pad['emotionalIntensity'])
                    stats['pad_by_message_index'][i].append(pad['emotionalIntensity'])
        
        if has_pad:
            stats['conversations_with_pad'] += 1
    
    # Calculate coverage
    if stats['total_messages'] > 0:
        stats['pad_coverage'] = stats['total_messages_with_pad'] / stats['total_messages']
    
    # Calculate statistics for each PAD dimension
    for dim in ['pleasure_stats', 'arousal_stats', 'dominance_stats', 'emotional_intensity_stats']:
        values = stats[dim]
        if values:
            stats[dim.replace('_stats', '_summary')] = {
                'mean': statistics.mean(values),
                'median': statistics.median(values),
                'min': min(values),
                'max': max(values),
                'stdev': statistics.stdev(values) if len(values) > 1 else 0
            }
        else:
            stats[dim.replace('_stats', '_summary')] = None
    
    return stats


def analyze_message_statistics(conversations: List[Dict]) -> Dict:
    """Analyze message-level statistics"""
    stats = {
        'message_counts': [],
        'avg_messages_per_conversation': 0,
        'conversations_by_length': defaultdict(int),
        'role_distribution': Counter(),
        'messages_with_content': 0,
        'total_characters': 0,
        'avg_message_length': 0
    }
    
    for conv in conversations:
        messages = conv.get('messages', [])
        if not messages:
            continue
        
        msg_count = len(messages)
        stats['message_counts'].append(msg_count)
        
        # Categorize by length
        if msg_count <= 5:
            stats['conversations_by_length']['very_short'] += 1
        elif msg_count <= 10:
            stats['conversations_by_length']['short'] += 1
        elif msg_count <= 20:
            stats['conversations_by_length']['medium'] += 1
        elif msg_count <= 50:
            stats['conversations_by_length']['long'] += 1
        else:
            stats['conversations_by_length']['very_long'] += 1
        
        # Analyze messages
        for msg in messages:
            role = msg.get('role', 'unknown')
            stats['role_distribution'][role] += 1
            
            content = msg.get('content', '')
            if content:
                stats['messages_with_content'] += 1
                stats['total_characters'] += len(content)
    
    if stats['message_counts']:
        stats['avg_messages_per_conversation'] = statistics.mean(stats['message_counts'])
        stats['median_messages_per_conversation'] = statistics.median(stats['message_counts'])
        stats['min_messages'] = min(stats['message_counts'])
        stats['max_messages'] = max(stats['message_counts'])
    
    if stats['messages_with_content'] > 0:
        stats['avg_message_length'] = stats['total_characters'] / stats['messages_with_content']
    
    return stats


def generate_report(conversations: List[Dict]) -> str:
    """Generate comprehensive analysis report"""
    report = []
    report.append("=" * 80)
    report.append("CLASSIFIED DATA DEEP DIVE ANALYSIS")
    report.append("=" * 80)
    report.append(f"Generated: {datetime.now().isoformat()}")
    report.append("")
    
    # Completeness analysis
    report.append("=" * 80)
    report.append("1. DATA COMPLETENESS")
    report.append("=" * 80)
    completeness = analyze_completeness(conversations)
    report.append(f"Total conversations: {completeness['total']}")
    report.append(f"With classification: {completeness['has_classification']} ({completeness['has_classification']/completeness['total']*100:.1f}%)")
    report.append(f"With messages: {completeness['has_messages']} ({completeness['has_messages']/completeness['total']*100:.1f}%)")
    report.append(f"With PAD data: {completeness['has_pad']} ({completeness['has_pad']/completeness['total']*100:.1f}%)")
    report.append(f"Complete classifications: {completeness['complete_classifications']} ({completeness['complete_classifications']/completeness['total']*100:.1f}%)")
    report.append("")
    report.append("Missing dimensions:")
    for dim, count in sorted(completeness['missing_dimensions'].items(), key=lambda x: -x[1]):
        report.append(f"  - {dim}: {count} conversations")
    report.append("")
    report.append("Unknown dimensions:")
    for dim, count in sorted(completeness['unknown_dimensions'].items(), key=lambda x: -x[1]):
        report.append(f"  - {dim}: {count} conversations")
    report.append("")
    report.append(f"Missing PAD: {completeness['missing_pad_count']} conversations")
    report.append(f"Missing humanRole: {completeness['missing_roles']['humanRole']} conversations")
    report.append(f"Missing aiRole: {completeness['missing_roles']['aiRole']} conversations")
    report.append(f"Missing both roles: {completeness['missing_roles']['both']} conversations")
    report.append("")
    
    # Classifier performance
    report.append("=" * 80)
    report.append("2. CLASSIFIER PERFORMANCE")
    report.append("=" * 80)
    perf = analyze_classifier_performance(conversations)
    report.append(f"Conversations without metadata: {perf['no_metadata']}")
    if perf['processing_times']:
        report.append(f"Average processing time: {perf['avg_processing_time']:.0f}ms")
        report.append(f"Median processing time: {perf['median_processing_time']:.0f}ms")
    report.append("")
    report.append("By Provider:")
    for provider, data in sorted(perf['by_provider'].items(), key=lambda x: -x[1]['count']):
        complete_pct = (data['complete'] / data['count'] * 100) if data['count'] > 0 else 0
        report.append(f"  {provider}:")
        report.append(f"    Total: {data['count']}")
        report.append(f"    Complete: {data['complete']} ({complete_pct:.1f}%)")
        report.append(f"    Incomplete: {data['incomplete']}")
        report.append(f"    Missing PAD: {data['missing_pad']}")
        if data['avg_confidence']:
            report.append(f"    Avg confidence: {data['avg_confidence']:.3f}")
        if data['models']:
            report.append(f"    Models: {dict(data['models'])}")
    report.append("")
    report.append("By Model:")
    for model, data in sorted(perf['by_model'].items(), key=lambda x: -x[1]['count']):
        complete_pct = (data['complete'] / data['count'] * 100) if data['count'] > 0 else 0
        report.append(f"  {model}: {data['count']} conversations ({complete_pct:.1f}% complete)")
    report.append("")
    
    # Classification distributions
    report.append("=" * 80)
    report.append("3. CLASSIFICATION DISTRIBUTIONS")
    report.append("=" * 80)
    dists = analyze_classification_distributions(conversations)
    for dim in ['interactionPattern', 'powerDynamics', 'emotionalTone', 
                'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
                'topicDepth', 'turnTaking']:
        if dists[dim]:
            report.append(f"\n{dim}:")
            for category, count in dists[dim].most_common():
                pct = (count / completeness['has_classification'] * 100) if completeness['has_classification'] > 0 else 0
                report.append(f"  {category}: {count} ({pct:.1f}%)")
    report.append("")
    report.append("Human Role Distribution (average probabilities):")
    for role in HUMAN_ROLES:
        if role in dists['humanRole']:
            avg = dists['humanRole'][role] / completeness['has_classification'] if completeness['has_classification'] > 0 else 0
            report.append(f"  {role}: {avg:.3f}")
    report.append("")
    report.append("AI Role Distribution (average probabilities):")
    for role in AI_ROLES:
        if role in dists['aiRole']:
            avg = dists['aiRole'][role] / completeness['has_classification'] if completeness['has_classification'] > 0 else 0
            report.append(f"  {role}: {avg:.3f}")
    report.append("")
    
    # PAD analysis
    report.append("=" * 80)
    report.append("4. PAD (PLEASURE-AROUSAL-DOMINANCE) ANALYSIS")
    report.append("=" * 80)
    pad = analyze_pad_data(conversations)
    report.append(f"Conversations with PAD: {pad['conversations_with_pad']}")
    report.append(f"Total messages: {pad['total_messages']}")
    report.append(f"Messages with PAD: {pad['total_messages_with_pad']}")
    report.append(f"PAD coverage: {pad['pad_coverage']*100:.1f}%")
    report.append("")
    for dim in ['pleasure', 'arousal', 'dominance', 'emotional_intensity']:
        summary = pad.get(f'{dim}_summary')
        if summary:
            report.append(f"{dim.capitalize()}:")
            report.append(f"  Mean: {summary['mean']:.3f}")
            report.append(f"  Median: {summary['median']:.3f}")
            report.append(f"  Range: [{summary['min']:.3f}, {summary['max']:.3f}]")
            report.append(f"  StdDev: {summary['stdev']:.3f}")
    report.append("")
    
    # Message statistics
    report.append("=" * 80)
    report.append("5. MESSAGE STATISTICS")
    report.append("=" * 80)
    msg_stats = analyze_message_statistics(conversations)
    report.append(f"Average messages per conversation: {msg_stats['avg_messages_per_conversation']:.1f}")
    report.append(f"Median messages per conversation: {msg_stats['median_messages_per_conversation']:.1f}")
    report.append(f"Message count range: [{msg_stats['min_messages']}, {msg_stats['max_messages']}]")
    report.append("")
    report.append("Conversations by length:")
    for length, count in msg_stats['conversations_by_length'].items():
        report.append(f"  {length}: {count}")
    report.append("")
    report.append("Role distribution:")
    for role, count in msg_stats['role_distribution'].most_common():
        report.append(f"  {role}: {count}")
    report.append("")
    report.append(f"Average message length: {msg_stats['avg_message_length']:.0f} characters")
    report.append("")
    
    # Data quality issues
    report.append("=" * 80)
    report.append("6. DATA QUALITY ISSUES")
    report.append("=" * 80)
    issues = []
    if completeness['missing_pad_count'] > 0:
        issues.append(f"⚠️  {completeness['missing_pad_count']} conversations missing PAD data")
    if completeness['missing_roles']['humanRole'] > 0:
        issues.append(f"⚠️  {completeness['missing_roles']['humanRole']} conversations missing humanRole")
    if completeness['missing_roles']['aiRole'] > 0:
        issues.append(f"⚠️  {completeness['missing_roles']['aiRole']} conversations missing aiRole")
    if perf['no_metadata'] > 0:
        issues.append(f"⚠️  {perf['no_metadata']} conversations missing classification metadata")
    if completeness['complete_classifications'] < completeness['has_classification'] * 0.5:
        issues.append(f"⚠️  Only {completeness['complete_classifications']/completeness['has_classification']*100:.1f}% of classifications are complete")
    
    if issues:
        for issue in issues:
            report.append(issue)
    else:
        report.append("✅ No major data quality issues detected")
    report.append("")
    
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    return "\n".join(report)


def main():
    print("🔍 Loading classified conversations...")
    conversations = load_all_conversations()
    
    if not conversations:
        print("❌ No conversations found!")
        return
    
    print(f"✅ Loaded {len(conversations)} conversations")
    print("")
    
    print("📊 Generating analysis report...")
    report = generate_report(conversations)
    
    # Print to console
    print(report)
    
    # Save to file
    output_file = Path("reports/CLASSIFIED_DATA_ANALYSIS.md")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ Report saved to: {output_file}")


if __name__ == "__main__":
    main()

