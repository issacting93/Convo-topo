#!/usr/bin/env python3
"""
Deep analysis of Cluster 5 (MeanderingPath_Narrative_SelfExpression).
Examines the 6 conversations to understand why they stay near origin.
"""

import json
from pathlib import Path
from typing import Dict, List

def load_cluster_5_conversations(cluster_file: Path, data_dir: Path) -> List[Dict]:
    """Load full conversations from Cluster 5."""
    with open(cluster_file, 'r', encoding='utf-8') as f:
        cluster_data = json.load(f)
    
    cluster_5_name = None
    for name in cluster_data.keys():
        if 'MeanderingPath' in name and 'SelfExpression' in name:
            cluster_5_name = name
            break
    
    if not cluster_5_name:
        print("Cluster 5 not found")
        return []
    
    conversations = []
    for conv_data in cluster_data[cluster_5_name]:
        conv_id = conv_data.get('id', '')
        conv_file = data_dir / f"{conv_id}.json"
        
        if conv_file.exists():
            with open(conv_file, 'r', encoding='utf-8') as f:
                conv = json.load(f)
                conv['cluster_features'] = conv_data.get('features', {})
                conversations.append(conv)
    
    return conversations

def analyze_conversation(conv: Dict) -> Dict:
    """Analyze a single conversation for relational positioning."""
    messages = conv.get('messages', [])
    classification = conv.get('classification', {})
    features = conv.get('cluster_features', {})
    
    analysis = {
        'id': conv.get('id', 'unknown'),
        'message_count': len(messages),
        'pattern': classification.get('interactionPattern', {}).get('category', 'unknown'),
        'purpose': classification.get('conversationPurpose', {}).get('category', 'unknown'),
        'tone': classification.get('emotionalTone', {}).get('category', 'unknown'),
        'drift_magnitude': features.get('drift_magnitude', 0),
        'path_straightness': features.get('path_straightness', 0),
        'final_x': features.get('final_x', 0.5),
        'final_y': features.get('final_y', 0.5),
        'avg_intensity': features.get('avg_intensity', 0.5),
    }
    
    # Analyze message content
    if messages:
        first_msg = messages[0].get('content', '')[:200]
        last_msg = messages[-1].get('content', '')[:200]
        analysis['first_message'] = first_msg
        analysis['last_message'] = last_msg
        
        # Check for relational positioning language
        relational_keywords = ['feel', 'think', 'believe', 'experience', 'relationship', 'connect', 'understand']
        functional_keywords = ['how', 'what', 'when', 'where', 'why', 'explain', 'help', 'information']
        
        all_text = ' '.join([m.get('content', '') for m in messages]).lower()
        analysis['relational_keyword_count'] = sum(1 for kw in relational_keywords if kw in all_text)
        analysis['functional_keyword_count'] = sum(1 for kw in functional_keywords if kw in all_text)
    
    return analysis

def generate_analysis_report(conversations: List[Dict], output_path: Path):
    """Generate detailed analysis report."""
    report = []
    report.append("# Deep Analysis: Cluster 5 (MeanderingPath_Narrative_SelfExpression)\n\n")
    report.append("**Question:** Why do these conversations stay near origin (minimal drift)?\n")
    report.append("**Hypothesis:** Low drift might indicate deliberate relational stance—refusing to commit to functional or social orientation.\n\n")
    report.append("---\n\n")
    
    # Overall statistics
    report.append("## Cluster Characteristics\n\n")
    report.append(f"**Size:** {len(conversations)} conversations\n")
    
    if conversations:
        avg_drift = sum(c.get('cluster_features', {}).get('drift_magnitude', 0) for c in conversations) / len(conversations)
        avg_straightness = sum(c.get('cluster_features', {}).get('path_straightness', 0) for c in conversations) / len(conversations)
        report.append(f"**Average Drift Magnitude:** {avg_drift:.3f} (very low - stays near origin)\n")
        report.append(f"**Average Path Straightness:** {avg_straightness:.3f} (very low - meandering)\n")
        report.append(f"**Average Final Position:** X={sum(c.get('cluster_features', {}).get('final_x', 0.5) for c in conversations)/len(conversations):.3f}, Y={sum(c.get('cluster_features', {}).get('final_y', 0.5) for c in conversations)/len(conversations):.3f} (near origin)\n\n")
    
    # Individual conversation analysis
    report.append("## Individual Conversation Analysis\n\n")
    
    analyses = [analyze_conversation(c) for c in conversations]
    
    for i, analysis in enumerate(analyses, 1):
        report.append(f"### {i}. `{analysis['id']}`\n\n")
        report.append(f"- **Message Count:** {analysis['message_count']}\n")
        report.append(f"- **Pattern:** {analysis['pattern']}\n")
        report.append(f"- **Purpose:** {analysis['purpose']}\n")
        report.append(f"- **Tone:** {analysis['tone']}\n")
        report.append(f"- **Drift Magnitude:** {analysis['drift_magnitude']:.3f}\n")
        report.append(f"- **Path Straightness:** {analysis['path_straightness']:.3f}\n")
        report.append(f"- **Final Position:** ({analysis['final_x']:.3f}, {analysis['final_y']:.3f})\n")
        report.append(f"- **Avg Intensity:** {analysis['avg_intensity']:.3f}\n")
        
        if 'relational_keyword_count' in analysis:
            report.append(f"- **Relational Keywords:** {analysis['relational_keyword_count']}\n")
            report.append(f"- **Functional Keywords:** {analysis['functional_keyword_count']}\n")
        
        if 'first_message' in analysis:
            report.append(f"\n**First Message:** {analysis['first_message']}...\n")
            report.append(f"\n**Last Message:** {analysis['last_message']}...\n")
        
        report.append("\n")
    
    # Thematic analysis
    report.append("## Thematic Analysis\n\n")
    
    # Check for patterns
    all_purposes = [a['purpose'] for a in analyses]
    all_patterns = [a['pattern'] for a in analyses]
    
    report.append("### Purpose Distribution\n\n")
    purpose_counts = {}
    for p in all_purposes:
        purpose_counts[p] = purpose_counts.get(p, 0) + 1
    for purpose, count in purpose_counts.items():
        report.append(f"- **{purpose}:** {count} ({count/len(analyses)*100:.1f}%)\n")
    
    report.append("\n### Pattern Distribution\n\n")
    pattern_counts = {}
    for p in all_patterns:
        pattern_counts[p] = pattern_counts.get(p, 0) + 1
    for pattern, count in pattern_counts.items():
        report.append(f"- **{pattern}:** {count} ({count/len(analyses)*100:.1f}%)\n")
    
    # Keyword analysis
    if analyses and 'relational_keyword_count' in analyses[0]:
        avg_relational = sum(a['relational_keyword_count'] for a in analyses) / len(analyses)
        avg_functional = sum(a['functional_keyword_count'] for a in analyses) / len(analyses)
        
        report.append("\n### Language Analysis\n\n")
        report.append(f"- **Average Relational Keywords:** {avg_relational:.1f}\n")
        report.append(f"- **Average Functional Keywords:** {avg_functional:.1f}\n")
        
        if avg_relational > avg_functional:
            report.append("\n**Interpretation:** Conversations use more relational language, suggesting relationship-focused communication despite minimal drift.\n")
        elif avg_functional > avg_relational:
            report.append("\n**Interpretation:** Conversations use more functional language, but still don't drift toward functional space.\n")
        else:
            report.append("\n**Interpretation:** Balanced language use, neither strongly functional nor relational.\n")
    
    # Theoretical interpretation
    report.append("\n## Theoretical Interpretation\n\n")
    report.append("### Possible Explanations for Low Drift\n\n")
    report.append("1. **Deliberate Ambivalence:** Refusing to commit to either functional or social orientation\n")
    report.append("2. **Resistance to Positioning:** Actively resisting relational categorization\n")
    report.append("3. **Self-Focused Communication:** Conversation is about the self, not the relationship\n")
    report.append("4. **Exploratory Stance:** Testing boundaries without committing to a position\n")
    report.append("5. **Meta-Conversation:** Conversation about conversation itself, not positioned in relational space\n\n")
    
    report.append("### Watzlawick Framework\n\n")
    report.append("In Watzlawick's terms, these conversations may represent:\n")
    report.append("- **Content level:** Self-expression (the self is the content)\n")
    report.append("- **Relationship level:** Unclear or deliberately ambiguous\n")
    report.append("- **Relational frame:** Refusing to establish a clear relational positioning\n\n")
    
    report.append("### Implications\n\n")
    report.append("If low drift represents deliberate relational stance rather than absence of positioning:\n")
    report.append("- This cluster represents a **fourth relational archetype**: Ambivalent/Resistant\n")
    report.append("- Challenges the assumption that all conversations must position themselves\n")
    report.append("- Suggests some conversations actively resist relational categorization\n")
    report.append("- May indicate meta-awareness of relational dynamics\n\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(''.join(report))
    
    print(f"Cluster 5 analysis saved to: {output_path}")

def main():
    """Main analysis function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    cluster_file = project_root / 'reports' / 'path-clusters-kmeans.json'
    data_dir = project_root / 'public' / 'output'
    
    if not cluster_file.exists():
        print(f"Error: Cluster file not found: {cluster_file}")
        return
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        return
    
    print("Loading Cluster 5 conversations...")
    conversations = load_cluster_5_conversations(cluster_file, data_dir)
    print(f"Loaded {len(conversations)} conversations")
    
    if conversations:
        output_file = project_root / 'docs' / 'CLUSTER_5_DEEP_ANALYSIS.md'
        generate_analysis_report(conversations, output_file)
    else:
        print("No Cluster 5 conversations found")

if __name__ == '__main__':
    main()

