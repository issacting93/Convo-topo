#!/usr/bin/env python3
"""
Analyze all conversations to identify clusters of similar paths.
Identifies path patterns based on trajectory characteristics.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import statistics

# Path characteristics to analyze
class PathCharacteristics:
    def __init__(self, conversation_id: str, messages: List[Dict], classification: Optional[Dict] = None):
        self.id = conversation_id
        self.message_count = len(messages)
        
        # Calculate basic path metrics
        self.x_values = []
        self.y_values = []
        self.z_values = []
        self.drift_x = 0
        self.drift_y = 0
        self.drift_z = 0
        self.total_distance = 0
        self.avg_intensity = 0
        self.max_intensity = 0
        self.min_intensity = 0
        self.intensity_variance = 0
        self.peak_count = 0
        self.valley_count = 0
        
        # Classification data
        self.pattern = None
        self.tone = None
        self.purpose = None
        self.human_role = None
        self.ai_role = None
        
        # Path shape characteristics
        self.is_stable = False
        self.is_drifting = False
        self.is_volatile = False
        self.has_peaks = False
        self.has_valleys = False
        self.drift_direction = None  # 'functional', 'social', 'structured', 'emergent', 'mixed'
        
        # Analyze messages
        self._analyze(messages, classification)
    
    def _analyze(self, messages: List[Dict], classification: Optional[Dict] = None):
        """Analyze conversation messages to extract path characteristics."""
        if not messages:
            return
        
        # Extract PAD values and calculate positions
        intensities = []
        x_positions = []
        y_positions = []
        
        # Get conversation-level X/Y coordinates from classification
        # These represent the target position for the conversation
        conv_x = 0.5  # Default center
        conv_y = 0.5  # Default center
        
        if classification:
            # Estimate X from human role or purpose
            human_role_dist = classification.get('humanRole', {}).get('distribution', {})
            purpose = classification.get('conversationPurpose', {}).get('category')
            
            # X-axis: Functional (0.0-0.4) ↔ Social (0.6-1.0)
            if purpose == 'information-seeking' or purpose == 'problem-solving':
                conv_x = 0.3  # More functional
            elif purpose == 'entertainment' or purpose == 'relationship-building':
                conv_x = 0.7  # More social
            elif human_role_dist:
                # Estimate from role distribution
                seeker = human_role_dist.get('seeker', 0)
                sharer = human_role_dist.get('sharer', 0)
                if seeker > 0.5:
                    conv_x = 0.3
                elif sharer > 0.5:
                    conv_x = 0.7
            
            # Y-axis: Structured (0.0-0.4) ↔ Emergent (0.6-1.0)
            pattern = classification.get('interactionPattern', {}).get('category')
            ai_role_dist = classification.get('aiRole', {}).get('distribution', {})
            
            if pattern == 'question-answer' or pattern == 'advisory':
                conv_y = 0.3  # More structured
            elif pattern == 'collaborative' or pattern == 'casual-chat':
                conv_y = 0.7  # More emergent
            elif ai_role_dist:
                expert = ai_role_dist.get('expert', 0)
                peer = ai_role_dist.get('peer', 0)
                if expert > 0.5:
                    conv_y = 0.3
                elif peer > 0.5:
                    conv_y = 0.7
        
        # Calculate path as drift from center (0.5, 0.5) toward target (conv_x, conv_y)
        # Path starts at center and drifts toward target
        start_x, start_y = 0.5, 0.5
        target_x, target_y = conv_x, conv_y
        
        for i, msg in enumerate(messages):
            # Get PAD emotional intensity
            if msg.get('pad') and msg['pad'].get('emotionalIntensity') is not None:
                intensity = msg['pad']['emotionalIntensity']
                intensities.append(intensity)
                self.z_values.append(intensity)
            else:
                # Estimate intensity if not available
                intensity = 0.5
                intensities.append(intensity)
                self.z_values.append(intensity)
            
            # Calculate X/Y position as progressive drift from start to target
            # Messages gradually move from center toward target
            progress = (i + 1) / len(messages) if len(messages) > 0 else 0
            x_pos = start_x + (target_x - start_x) * progress
            y_pos = start_y + (target_y - start_y) * progress
            
            x_positions.append(x_pos)
            y_positions.append(y_pos)
            self.x_values.append(x_pos)
            self.y_values.append(y_pos)
        
        # Calculate drift
        if len(x_positions) > 1:
            self.drift_x = x_positions[-1] - x_positions[0]
            self.drift_y = y_positions[-1] - y_positions[0]
            self.drift_z = intensities[-1] - intensities[0] if intensities else 0
            
            # Calculate total distance traveled
            for i in range(1, len(x_positions)):
                dx = x_positions[i] - x_positions[i-1]
                dy = y_positions[i] - y_positions[i-1]
                dz = intensities[i] - intensities[i-1] if intensities else 0
                self.total_distance += (dx**2 + dy**2 + dz**2)**0.5
        
        # Calculate intensity statistics
        if intensities:
            self.avg_intensity = statistics.mean(intensities)
            self.max_intensity = max(intensities)
            self.min_intensity = min(intensities)
            self.intensity_variance = statistics.variance(intensities) if len(intensities) > 1 else 0
            
            # Count peaks (local maxima > 0.7)
            for i in range(1, len(intensities) - 1):
                if intensities[i] > 0.7 and intensities[i] > intensities[i-1] and intensities[i] > intensities[i+1]:
                    self.peak_count += 1
                    self.has_peaks = True
            
            # Count valleys (local minima < 0.3)
            for i in range(1, len(intensities) - 1):
                if intensities[i] < 0.3 and intensities[i] < intensities[i-1] and intensities[i] < intensities[i+1]:
                    self.valley_count += 1
                    self.has_valleys = True
        
        # Determine path characteristics
        if self.intensity_variance < 0.05:
            self.is_stable = True
        elif self.intensity_variance > 0.15:
            self.is_volatile = True
        
        # Determine drift direction
        if abs(self.drift_x) > 0.1:
            if self.drift_x < 0:
                self.drift_direction = 'functional'
            else:
                self.drift_direction = 'social'
        if abs(self.drift_y) > 0.1:
            if self.drift_y < 0:
                if not self.drift_direction:
                    self.drift_direction = 'structured'
                else:
                    self.drift_direction = 'mixed'
            else:
                if not self.drift_direction:
                    self.drift_direction = 'emergent'
                else:
                    self.drift_direction = 'mixed'
        
        if abs(self.drift_x) > 0.05 or abs(self.drift_y) > 0.05:
            self.is_drifting = True
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'message_count': self.message_count,
            'avg_intensity': self.avg_intensity,
            'max_intensity': self.max_intensity,
            'min_intensity': self.min_intensity,
            'intensity_variance': self.intensity_variance,
            'peak_count': self.peak_count,
            'valley_count': self.valley_count,
            'is_stable': self.is_stable,
            'is_volatile': self.is_volatile,
            'has_peaks': self.has_peaks,
            'has_valleys': self.has_valleys,
            'pattern': self.pattern,
            'tone': self.tone,
            'purpose': self.purpose,
            'human_role': self.human_role,
            'ai_role': self.ai_role
        }


def load_conversation(file_path: Path) -> Optional[Dict]:
    """Load a conversation JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None


def extract_classification_data(conversation: Dict) -> Dict:
    """Extract classification data from conversation."""
    classification = conversation.get('classification', {})
    
    return {
        'pattern': classification.get('interactionPattern', {}).get('category'),
        'tone': classification.get('emotionalTone', {}).get('category'),
        'purpose': classification.get('conversationPurpose', {}).get('category'),
        'human_role': _get_dominant_role(classification.get('humanRole', {}).get('distribution', {})),
        'ai_role': _get_dominant_role(classification.get('aiRole', {}).get('distribution', {}))
    }


def _get_dominant_role(distribution: Dict) -> Optional[str]:
    """Get the dominant role from a role distribution."""
    if not distribution:
        return None
    return max(distribution.items(), key=lambda x: x[1])[0] if distribution else None


def analyze_all_conversations(data_dir: Path) -> List[PathCharacteristics]:
    """Analyze all conversations in the directory."""
    characteristics = []
    
    # Get all JSON files
    json_files = sorted(data_dir.glob('*.json'))
    
    print(f"Analyzing {len(json_files)} conversation files...")
    
    for file_path in json_files:
        # Skip manifest files
        if 'manifest' in file_path.name.lower():
            continue
        
        conversation = load_conversation(file_path)
        if not conversation:
            continue
        
        # Extract characteristics with classification
        classification = conversation.get('classification', {})
        path_char = PathCharacteristics(conversation.get('id', file_path.stem), 
                                        conversation.get('messages', []),
                                        classification)
        
        # Add classification data
        class_data = extract_classification_data(conversation)
        path_char.pattern = class_data['pattern']
        path_char.tone = class_data['tone']
        path_char.purpose = class_data['purpose']
        path_char.human_role = class_data['human_role']
        path_char.ai_role = class_data['ai_role']
        
        characteristics.append(path_char)
    
    return characteristics


def identify_clusters(characteristics: List[PathCharacteristics]) -> Dict[str, List[PathCharacteristics]]:
    """Identify clusters of similar paths based on characteristics."""
    clusters = defaultdict(list)
    
    for char in characteristics:
        # Cluster by multiple criteria
        cluster_key = _determine_cluster(char)
        clusters[cluster_key].append(char)
    
    return dict(clusters)


def _determine_cluster(char: PathCharacteristics) -> str:
    """Determine which cluster a conversation belongs to."""
    
    # Primary clustering by emotional intensity patterns
    if char.has_peaks and char.peak_count >= 2:
        if char.avg_intensity > 0.65:
            if char.pattern == 'question-answer' or char.purpose == 'information-seeking':
                return 'frustration_peaks_qa'
            else:
                return 'high_intensity_peaks'
        else:
            return 'moderate_peaks'
    
    if char.has_valleys and char.valley_count >= 2:
        if char.avg_intensity < 0.35:
            if char.pattern == 'collaborative' or char.purpose == 'relationship-building':
                return 'affiliation_valleys'
            elif char.pattern == 'casual-chat':
                return 'calm_casual_valleys'
            else:
                return 'low_intensity_valleys'
    
    # Drift-based clustering
    if char.is_drifting:
        if char.drift_direction == 'functional':
            if char.has_peaks:
                return 'functional_drift_with_peaks'
            else:
                return 'functional_drift'
        elif char.drift_direction == 'social':
            if char.has_valleys:
                return 'social_drift_with_valleys'
            else:
                return 'social_drift'
        elif char.drift_direction == 'emergent':
            return 'emergent_drift'
        elif char.drift_direction == 'structured':
            return 'structured_drift'
        elif char.drift_direction == 'mixed':
            return 'mixed_drift'
    
    # Pattern-based clustering with intensity
    if char.pattern == 'question-answer':
        if char.avg_intensity > 0.6:
            return 'intense_question_answer'
        elif char.avg_intensity < 0.4:
            return 'calm_question_answer'
        else:
            return 'moderate_question_answer'
    
    if char.pattern == 'collaborative':
        if char.has_valleys:
            return 'collaborative_affiliation'
        elif char.is_stable:
            return 'stable_collaborative'
        else:
            return 'collaborative_exploration'
    
    if char.pattern == 'casual-chat':
        if char.is_stable and char.avg_intensity < 0.4:
            return 'flat_casual'
        elif char.has_valleys:
            return 'casual_affiliation'
        else:
            return 'casual_social'
    
    if char.pattern == 'advisory':
        if char.avg_intensity > 0.6:
            return 'intense_advisory'
        else:
            return 'calm_advisory'
    
    if char.pattern == 'storytelling':
        if char.is_stable:
            return 'stable_narrative'
        else:
            return 'narrative_storytelling'
    
    # Purpose-based clustering
    if char.purpose == 'information-seeking':
        if char.avg_intensity < 0.4:
            return 'calm_information_seeking'
        else:
            return 'information_seeking'
    
    if char.purpose == 'entertainment':
        if char.has_valleys:
            return 'playful_entertainment'
        else:
            return 'entertainment_playful'
    
    if char.purpose == 'problem-solving':
        if char.has_peaks:
            return 'problem_solving_with_frustration'
        else:
            return 'problem_solving'
    
    if char.purpose == 'relationship-building':
        if char.has_valleys:
            return 'relationship_building_affiliation'
        else:
            return 'relationship_building'
    
    # Stability-based clustering
    if char.is_stable:
        if char.avg_intensity < 0.4:
            return 'stable_calm'
        elif char.avg_intensity > 0.6:
            return 'stable_intense'
        else:
            return 'stable_moderate'
    
    if char.is_volatile:
        return 'volatile_emotional'
    
    # Default
    return 'other_patterns'


def generate_cluster_report(clusters: Dict[str, List[PathCharacteristics]]) -> str:
    """Generate a detailed report of path clusters."""
    report = []
    report.append("# Path Cluster Analysis: Identified Conversation Patterns\n")
    report.append("This document identifies clusters of similar conversation paths based on trajectory characteristics, emotional patterns, and interaction styles.\n")
    report.append(f"**Total Conversations Analyzed:** {sum(len(v) for v in clusters.values())}\n")
    report.append(f"**Number of Clusters Identified:** {len(clusters)}\n")
    report.append("---\n\n")
    
    # Sort clusters by size
    sorted_clusters = sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)
    
    for cluster_name, conversations in sorted_clusters:
        report.append(f"## Cluster: {cluster_name.replace('_', ' ').title()}\n")
        report.append(f"**Size:** {len(conversations)} conversations\n")
        
        # Calculate cluster statistics
        avg_intensity = statistics.mean([c.avg_intensity for c in conversations])
        avg_message_count = statistics.mean([c.message_count for c in conversations])
        patterns = [c.pattern for c in conversations if c.pattern]
        tones = [c.tone for c in conversations if c.tone]
        purposes = [c.purpose for c in conversations if c.purpose]
        
        report.append("### Characteristics\n")
        report.append(f"- **Average Emotional Intensity:** {avg_intensity:.3f}\n")
        report.append(f"- **Average Message Count:** {avg_message_count:.1f}\n")
        
        if patterns:
            pattern_counts = defaultdict(int)
            for p in patterns:
                pattern_counts[p] += 1
            most_common_pattern = max(pattern_counts.items(), key=lambda x: x[1])
            report.append(f"- **Most Common Pattern:** {most_common_pattern[0]} ({most_common_pattern[1]}/{len(patterns)} conversations)\n")
        
        if tones:
            tone_counts = defaultdict(int)
            for t in tones:
                tone_counts[t] += 1
            most_common_tone = max(tone_counts.items(), key=lambda x: x[1])
            report.append(f"- **Most Common Tone:** {most_common_tone[0]} ({most_common_tone[1]}/{len(tones)} conversations)\n")
        
        if purposes:
            purpose_counts = defaultdict(int)
            for p in purposes:
                purpose_counts[p] += 1
            most_common_purpose = max(purpose_counts.items(), key=lambda x: x[1])
            report.append(f"- **Most Common Purpose:** {most_common_purpose[0]} ({most_common_purpose[1]}/{len(purposes)} conversations)\n")
        
        # Path characteristics
        has_peaks_count = sum(1 for c in conversations if c.has_peaks)
        has_valleys_count = sum(1 for c in conversations if c.has_valleys)
        stable_count = sum(1 for c in conversations if c.is_stable)
        volatile_count = sum(1 for c in conversations if c.is_volatile)
        
        report.append("\n### Path Characteristics\n")
        if has_peaks_count > 0:
            report.append(f"- **Conversations with Peaks:** {has_peaks_count} ({has_peaks_count/len(conversations)*100:.1f}%)\n")
        if has_valleys_count > 0:
            report.append(f"- **Conversations with Valleys:** {has_valleys_count} ({has_valleys_count/len(conversations)*100:.1f}%)\n")
        if stable_count > 0:
            report.append(f"- **Stable Paths:** {stable_count} ({stable_count/len(conversations)*100:.1f}%)\n")
        if volatile_count > 0:
            report.append(f"- **Volatile Paths:** {volatile_count} ({volatile_count/len(conversations)*100:.1f}%)\n")
        
        # Example conversations
        report.append("\n### Example Conversations\n")
        example_ids = [c.id for c in conversations[:10]]  # First 10
        for conv_id in example_ids:
            report.append(f"- `{conv_id}`\n")
        
        report.append("\n---\n\n")
    
    return ''.join(report)


def main():
    """Main analysis function."""
    # Determine data directory - use classified conversations
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'public' / 'output'
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        return
    
    # Analyze all conversations
    characteristics = analyze_all_conversations(data_dir)
    
    if not characteristics:
        print("No conversations found to analyze.")
        return
    
    print(f"\nAnalyzed {len(characteristics)} conversations")
    
    # Identify clusters
    clusters = identify_clusters(characteristics)
    
    print(f"\nIdentified {len(clusters)} clusters:")
    for name, convs in sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"  {name}: {len(convs)} conversations")
    
    # Generate report
    report = generate_cluster_report(clusters)
    
    # Save report
    output_file = project_root / 'docs' / 'PATH_CLUSTER_ANALYSIS.md'
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {output_file}")
    
    # Also save cluster data as JSON
    cluster_data = {
        cluster_name: [char.to_dict() for char in conversations]
        for cluster_name, conversations in clusters.items()
    }
    
    json_output = project_root / 'reports' / 'path-clusters.json'
    json_output.parent.mkdir(exist_ok=True)
    
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(cluster_data, f, indent=2)
    
    print(f"Cluster data saved to: {json_output}")


if __name__ == '__main__':
    main()

