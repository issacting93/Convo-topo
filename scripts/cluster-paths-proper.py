#!/usr/bin/env python3
"""
Proper path clustering analysis using actual clustering algorithms.
Addresses methodological concerns:
- Uses k-means/hierarchical clustering with proper distance metrics
- Extracts meaningful trajectory features
- Defines "drift" theoretically
- Identifies genuine clusters, not just outliers

Fixes applied:
- Feature name mismatches corrected (human_collaborator, all pattern/tone/purpose/role features)
- Quadrant excluded from clustering (categorical, redundant with final_x/final_y)
- Drift angle encoded as sin/cos to avoid discontinuity at ±π
- Combined score weighting documented and parameterized
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from collections import defaultdict
import statistics
import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# THEORETICAL FRAMEWORK: Defining "Drift"
# ============================================================================

"""
DRIFT DEFINITION (from terrain.ts generatePathPoints):

Drift = cumulative movement through relational-affective space over time.

All conversations start at origin (0.5, 0.5) and drift toward a target position
determined by:
1. Conversation-level classification (communicationFunction, conversationStructure)
2. Message-level characteristics (expressive scores, alignment scores)
3. Role-based adjustments (user vs. assistant positioning)
4. Temporal progression (more drift as conversation progresses)

Drift is NOT random movement - it's systematic positioning based on:
- X-axis: Functional (0.0-0.4) ↔ Social (0.6-1.0) - Watzlawick's content/relationship
- Y-axis: Structured (0.0-0.4) ↔ Emergent (0.6-1.0) - Linguistic alignment/convergence

Drift direction indicates relational positioning:
- Functional drift: Conversation moves toward task-oriented positioning
- Social drift: Conversation moves toward relationship-focused positioning
- Structured drift: Conversation moves toward predictable patterns
- Emergent drift: Conversation moves toward dynamic role negotiation
"""

# ============================================================================
# Feature Extraction
# ============================================================================

class PathTrajectoryFeatures:
    """Extract meaningful features from conversation path trajectories."""
    
    def __init__(self, conversation_id: str, messages: List[Dict], classification: Optional[Dict] = None):
        self.id = conversation_id
        self.message_count = len(messages)
        self.classification = classification or {}
        
        # Extract features
        self.features = self._extract_features(messages)
    
    def _extract_features(self, messages: List[Dict]) -> Dict[str, float]:
        """Extract trajectory features that capture path characteristics."""
        features = {}
        
        if not messages:
            return self._default_features()
        
        # ====================================================================
        # Feature 1: Emotional Intensity Trajectory
        # ====================================================================
        intensities = []
        for msg in messages:
            if msg.get('pad') and msg['pad'].get('emotionalIntensity') is not None:
                intensities.append(msg['pad']['emotionalIntensity'])
            else:
                intensities.append(0.5)  # Default
        
        if intensities:
            features['avg_intensity'] = statistics.mean(intensities)
            features['max_intensity'] = max(intensities)
            features['min_intensity'] = min(intensities)
            features['intensity_range'] = max(intensities) - min(intensities)
            features['intensity_variance'] = statistics.variance(intensities) if len(intensities) > 1 else 0
            features['intensity_trend'] = self._calculate_trend(intensities)  # Slope of intensity over time
            
            # Peak/valley features
            features['peak_count'] = self._count_peaks(intensities)
            features['valley_count'] = self._count_valleys(intensities)
            features['peak_density'] = features['peak_count'] / len(intensities) if intensities else 0
            features['valley_density'] = features['valley_count'] / len(intensities) if intensities else 0
        else:
            features.update({
                'avg_intensity': 0.5,
                'max_intensity': 0.5,
                'min_intensity': 0.5,
                'intensity_range': 0,
                'intensity_variance': 0,
                'intensity_trend': 0,
                'peak_count': 0,
                'valley_count': 0,
                'peak_density': 0,
                'valley_density': 0
            })
        
        # ====================================================================
        # Feature 2: Spatial Trajectory (X/Y drift)
        # ====================================================================
        # Calculate target position from classification
        target_x, target_y = self._get_target_position()
        start_x, start_y = 0.5, 0.5  # Origin
        
        # Calculate actual path trajectory
        x_positions, y_positions = self._calculate_path_trajectory(messages, target_x, target_y)
        
        if x_positions and y_positions:
            features['final_x'] = x_positions[-1]
            features['final_y'] = y_positions[-1]
            features['drift_x'] = x_positions[-1] - start_x
            features['drift_y'] = y_positions[-1] - start_y
            features['drift_magnitude'] = np.sqrt(features['drift_x']**2 + features['drift_y']**2)
            # Encode drift angle as sin/cos to avoid discontinuity at ±π
            drift_angle = np.arctan2(features['drift_y'], features['drift_x'])
            features['drift_angle_sin'] = np.sin(drift_angle)
            features['drift_angle_cos'] = np.cos(drift_angle)
            
            # Trajectory characteristics
            features['x_variance'] = statistics.variance(x_positions) if len(x_positions) > 1 else 0
            features['y_variance'] = statistics.variance(y_positions) if len(y_positions) > 1 else 0
            features['path_length'] = self._calculate_path_length(x_positions, y_positions, intensities)
            features['path_straightness'] = features['drift_magnitude'] / features['path_length'] if features['path_length'] > 0 else 1.0
            
            # Position quadrant (for interpretability/reporting only, not used in clustering)
            # We use final_x and final_y instead, which capture position continuously
            if features['final_x'] < 0.4 and features['final_y'] < 0.4:
                features['quadrant'] = 0  # Functional-Structured
            elif features['final_x'] < 0.4 and features['final_y'] >= 0.6:
                features['quadrant'] = 1  # Functional-Emergent
            elif features['final_x'] >= 0.6 and features['final_y'] < 0.4:
                features['quadrant'] = 2  # Social-Structured
            else:
                features['quadrant'] = 3  # Social-Emergent
        else:
            features.update({
                'final_x': 0.5, 'final_y': 0.5,
                'drift_x': 0, 'drift_y': 0, 'drift_magnitude': 0,
                'drift_angle_sin': 0, 'drift_angle_cos': 1,
                'x_variance': 0, 'y_variance': 0, 'path_length': 0, 'path_straightness': 1.0,
                'quadrant': -1
            })
        
        # ====================================================================
        # Feature 3: Classification-based features
        # ====================================================================
        pattern = self.classification.get('interactionPattern', {}).get('category')
        tone = self.classification.get('emotionalTone', {}).get('category')
        purpose = self.classification.get('conversationPurpose', {}).get('category')
        
        # Encode categorical features
        features['pattern_qa'] = 1.0 if pattern == 'question-answer' else 0.0
        features['pattern_collaborative'] = 1.0 if pattern == 'collaborative' else 0.0
        features['pattern_storytelling'] = 1.0 if pattern == 'storytelling' else 0.0
        features['pattern_advisory'] = 1.0 if pattern == 'advisory' else 0.0
        features['pattern_casual'] = 1.0 if pattern == 'casual-chat' else 0.0
        
        features['tone_playful'] = 1.0 if tone == 'playful' else 0.0
        features['tone_neutral'] = 1.0 if tone == 'neutral' else 0.0
        features['tone_serious'] = 1.0 if tone == 'serious' else 0.0
        features['tone_supportive'] = 1.0 if tone == 'supportive' else 0.0
        
        features['purpose_info'] = 1.0 if purpose == 'information-seeking' else 0.0
        features['purpose_entertainment'] = 1.0 if purpose == 'entertainment' else 0.0
        features['purpose_relationship'] = 1.0 if purpose == 'relationship-building' else 0.0
        features['purpose_self_expression'] = 1.0 if purpose == 'self-expression' else 0.0
        
        # ====================================================================
        # Feature 4: Role dynamics
        # ====================================================================
        human_role_dist = self.classification.get('humanRole', {}).get('distribution', {})
        ai_role_dist = self.classification.get('aiRole', {}).get('distribution', {})
        
        features['human_seeker'] = human_role_dist.get('seeker', 0.0)
        features['human_collaborator'] = human_role_dist.get('collaborator', 0.0)
        features['human_sharer'] = human_role_dist.get('sharer', 0.0)
        features['human_director'] = human_role_dist.get('director', 0.0)
        
        features['ai_expert'] = ai_role_dist.get('expert', 0.0)
        features['ai_peer'] = ai_role_dist.get('peer', 0.0)
        features['ai_affiliative'] = ai_role_dist.get('affiliative', 0.0)
        features['ai_advisor'] = ai_role_dist.get('advisor', 0.0)
        
        # ====================================================================
        # Feature 5: Conversation structure
        # ====================================================================
        features['message_count'] = self.message_count
        features['message_count_log'] = np.log(self.message_count + 1)
        
        return features
    
    def _get_target_position(self) -> Tuple[float, float]:
        """Get target X/Y position from classification (where conversation drifts toward)."""
        # Estimate from classification data
        human_role_dist = self.classification.get('humanRole', {}).get('distribution', {})
        ai_role_dist = self.classification.get('aiRole', {}).get('distribution', {})
        purpose = self.classification.get('conversationPurpose', {}).get('category')
        pattern = self.classification.get('interactionPattern', {}).get('category')
        
        # X-axis: Functional (0.0-0.4) ↔ Social (0.6-1.0)
        target_x = 0.5  # Default center
        if purpose == 'information-seeking' or purpose == 'problem-solving':
            target_x = 0.3  # Functional
        elif purpose == 'entertainment' or purpose == 'relationship-building':
            target_x = 0.7  # Social
        elif human_role_dist:
            seeker = human_role_dist.get('seeker', 0)
            sharer = human_role_dist.get('sharer', 0)
            if seeker > 0.5:
                target_x = 0.3
            elif sharer > 0.5:
                target_x = 0.7
        
        # Y-axis: Structured (0.0-0.4) ↔ Emergent (0.6-1.0)
        target_y = 0.5  # Default center
        if pattern == 'question-answer' or pattern == 'advisory':
            target_y = 0.3  # Structured
        elif pattern == 'collaborative' or pattern == 'casual-chat':
            target_y = 0.7  # Emergent
        elif ai_role_dist:
            expert = ai_role_dist.get('expert', 0)
            peer = ai_role_dist.get('peer', 0)
            if expert > 0.5:
                target_y = 0.3
            elif peer > 0.5:
                target_y = 0.7
        
        return target_x, target_y
    
    def _calculate_path_trajectory(self, messages: List[Dict], target_x: float, target_y: float) -> Tuple[List[float], List[float]]:
        """Calculate actual path trajectory (simplified version of generatePathPoints logic)."""
        x_positions = []
        y_positions = []
        
        start_x, start_y = 0.5, 0.5
        current_x, current_y = start_x, start_y
        
        for i, msg in enumerate(messages):
            progress = i / max(len(messages) - 1, 1)
            
            # Simplified drift calculation
            # Drift toward target with progressive factor
            drift_factor = 0.1 + (progress * 0.2)  # Progressive drift
            target_drift_x = (target_x - start_x) * drift_factor
            target_drift_y = (target_y - start_y) * drift_factor
            
            current_x += target_drift_x
            current_y += target_drift_y
            
            # Clamp to valid range
            current_x = max(0.05, min(0.95, current_x))
            current_y = max(0.05, min(0.95, current_y))
            
            x_positions.append(current_x)
            y_positions.append(current_y)
        
        return x_positions, y_positions
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate linear trend (slope) of values over time."""
        if len(values) < 2:
            return 0.0
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        return float(slope)
    
    def _count_peaks(self, intensities: List[float], threshold: float = 0.7) -> int:
        """Count local maxima above threshold."""
        if len(intensities) < 3:
            return 0
        count = 0
        for i in range(1, len(intensities) - 1):
            if intensities[i] >= threshold and intensities[i] > intensities[i-1] and intensities[i] > intensities[i+1]:
                count += 1
        return count
    
    def _count_valleys(self, intensities: List[float], threshold: float = 0.3) -> int:
        """Count local minima below threshold."""
        if len(intensities) < 3:
            return 0
        count = 0
        for i in range(1, len(intensities) - 1):
            if intensities[i] <= threshold and intensities[i] < intensities[i-1] and intensities[i] < intensities[i+1]:
                count += 1
        return count
    
    def _calculate_path_length(self, x_pos: List[float], y_pos: List[float], z_pos: List[float]) -> float:
        """Calculate total 3D path length."""
        if len(x_pos) < 2:
            return 0.0
        total = 0.0
        for i in range(1, len(x_pos)):
            dx = x_pos[i] - x_pos[i-1]
            dy = y_pos[i] - y_pos[i-1]
            dz = z_pos[i] - z_pos[i-1] if i < len(z_pos) else 0
            total += np.sqrt(dx**2 + dy**2 + dz**2)
        return float(total)
    
    def _default_features(self) -> Dict[str, float]:
        """Return default feature values for empty conversations."""
        return {
            'avg_intensity': 0.5, 'max_intensity': 0.5, 'min_intensity': 0.5,
            'intensity_range': 0, 'intensity_variance': 0, 'intensity_trend': 0,
            'peak_count': 0, 'valley_count': 0, 'peak_density': 0, 'valley_density': 0,
            'final_x': 0.5, 'final_y': 0.5, 'drift_x': 0, 'drift_y': 0,
            'drift_magnitude': 0, 'drift_angle': 0, 'x_variance': 0, 'y_variance': 0,
            'path_length': 0, 'path_straightness': 1.0, 'quadrant': -1,
            'pattern_qa': 0, 'pattern_collaborative': 0, 'pattern_storytelling': 0,
            'pattern_advisory': 0, 'pattern_casual': 0,
            'tone_playful': 0, 'tone_neutral': 0, 'tone_serious': 0, 'tone_supportive': 0,
            'purpose_info': 0, 'purpose_entertainment': 0, 'purpose_relationship': 0,
            'purpose_self_expression': 0,
            'human_seeker': 0, 'human_collaborator': 0, 'human_sharer': 0, 'human_director': 0,
            'ai_expert': 0, 'ai_peer': 0, 'ai_affiliative': 0, 'ai_advisor': 0,
            'message_count': 0, 'message_count_log': 0
        }
    
    def get_feature_vector(self) -> np.ndarray:
        """Get feature vector as numpy array for clustering.
        
        Note: Quadrant is excluded (categorical, redundant with final_x/final_y).
        Drift angle encoded as sin/cos to avoid discontinuity at ±π.
        """
        feature_order = [
            # Emotional intensity trajectory (10 features)
            'avg_intensity', 'max_intensity', 'min_intensity', 'intensity_range',
            'intensity_variance', 'intensity_trend', 'peak_count', 'valley_count',
            'peak_density', 'valley_density',
            # Spatial trajectory (11 features: x/y positions, drift, path characteristics)
            'final_x', 'final_y', 'drift_x', 'drift_y', 'drift_magnitude',
            'drift_angle_sin', 'drift_angle_cos',  # Angle encoded as sin/cos
            'x_variance', 'y_variance', 'path_length', 'path_straightness',
            # Classification patterns (8 features)
            'pattern_qa', 'pattern_collaborative', 'pattern_storytelling', 'pattern_advisory', 'pattern_casual',
            'tone_playful', 'tone_neutral', 'tone_serious', 'tone_supportive',
            # Conversation purposes (4 features)
            'purpose_info', 'purpose_entertainment', 'purpose_relationship', 'purpose_self_expression',
            # Role dynamics (8 features)
            'human_seeker', 'human_collaborator', 'human_sharer', 'human_director',
            'ai_expert', 'ai_peer', 'ai_affiliative', 'ai_advisor',
            # Structure (1 feature)
            'message_count_log'
        ]
        return np.array([self.features.get(k, 0.0) for k in feature_order])


# ============================================================================
# Clustering Implementation
# ============================================================================

def load_conversations(data_dir: Path) -> List[Tuple[str, Dict]]:
    """Load all conversations from directory."""
    conversations = []
    json_files = sorted(data_dir.glob('*.json'))
    
    for file_path in json_files:
        if 'manifest' in file_path.name.lower():
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                conv = json.load(f)
                conversations.append((conv.get('id', file_path.stem), conv))
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return conversations


def extract_features(conversations: List[Tuple[str, Dict]]) -> Tuple[List[PathTrajectoryFeatures], np.ndarray]:
    """Extract features from all conversations."""
    features_list = []
    
    for conv_id, conversation in conversations:
        messages = conversation.get('messages', [])
        classification = conversation.get('classification', {})
        
        path_features = PathTrajectoryFeatures(conv_id, messages, classification)
        features_list.append(path_features)
    
    # Build feature matrix
    feature_vectors = np.array([f.get_feature_vector() for f in features_list])
    
    return features_list, feature_vectors


def find_optimal_clusters(feature_vectors: np.ndarray, max_k: int = 10) -> Tuple[int, Dict[int, float]]:
    """Find optimal number of clusters using silhouette score."""
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    best_k = 2
    best_score = -1
    scores = {}
    
    for k in range(2, min(max_k + 1, len(feature_vectors))):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(scaled_features)
        
        if len(set(labels)) > 1:  # Need at least 2 clusters
            score = silhouette_score(scaled_features, labels)
            scores[k] = score
            if score > best_score:
                best_score = score
                best_k = k
    
    return best_k, scores


def cluster_conversations(features_list: List[PathTrajectoryFeatures], 
                         feature_vectors: np.ndarray,
                         method: str = 'kmeans',
                         n_clusters: Optional[int] = None) -> Tuple[Dict[int, List[PathTrajectoryFeatures]], np.ndarray, int]:
    """Cluster conversations using specified method."""
    
    # Scale features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    # Determine number of clusters
    if n_clusters is None:
        n_clusters, scores = find_optimal_clusters(feature_vectors)
        print(f"Optimal number of clusters (silhouette): {n_clusters}")
        print(f"Silhouette scores by k: {scores}")
    
    # Perform clustering
    if method == 'kmeans':
        clusterer = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = clusterer.fit_predict(scaled_features)
    elif method == 'hierarchical':
        clusterer = AgglomerativeClustering(n_clusters=n_clusters)
        labels = clusterer.fit_predict(scaled_features)
    elif method == 'dbscan':
        clusterer = DBSCAN(eps=0.5, min_samples=3)
        labels = clusterer.fit_predict(scaled_features)
        # DBSCAN may create noise cluster (-1)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    else:
        raise ValueError(f"Unknown clustering method: {method}")
    
    # Group by cluster
    clusters = defaultdict(list)
    for i, label in enumerate(labels):
        if label != -1:  # Skip noise points in DBSCAN
            clusters[label].append(features_list[i])
    
    return dict(clusters), labels, n_clusters


def name_cluster(cluster: List[PathTrajectoryFeatures], cluster_id: int = None) -> str:
    """Generate theoretically-grounded cluster name based on characteristics.
    
    Incorporates trajectory characteristics (path_straightness, drift_magnitude, valley_density)
    to differentiate clusters with similar patterns.
    """
    if not cluster:
        return "unknown"
    
    # Calculate cluster averages for trajectory characteristics
    avg_intensity = statistics.mean([f.features['avg_intensity'] for f in cluster])
    avg_drift_mag = statistics.mean([f.features['drift_magnitude'] for f in cluster])
    avg_peak_density = statistics.mean([f.features['peak_density'] for f in cluster])
    avg_valley_density = statistics.mean([f.features['valley_density'] for f in cluster])
    avg_path_straightness = statistics.mean([f.features['path_straightness'] for f in cluster])
    avg_intensity_variance = statistics.mean([f.features['intensity_variance'] for f in cluster])
    
    # Most common pattern
    patterns = [f.classification.get('interactionPattern', {}).get('category') for f in cluster if f.classification]
    most_common_pattern = max(set(patterns), key=patterns.count) if patterns else None
    
    # Most common purpose
    purposes = [f.classification.get('conversationPurpose', {}).get('category') for f in cluster if f.classification]
    most_common_purpose = max(set(purposes), key=purposes.count) if purposes else None
    
    # Quadrant distribution
    quadrants = [f.features['quadrant'] for f in cluster if f.features['quadrant'] >= 0]
    most_common_quadrant = max(set(quadrants), key=quadrants.count) if quadrants else -1
    
    # Generate name based on characteristics
    name_parts = []
    
    # Trajectory characteristics (to differentiate similar clusters)
    if avg_path_straightness > 0.75:
        name_parts.append("StraightPath")
    elif avg_path_straightness < 0.4:
        name_parts.append("MeanderingPath")
    
    # Intensity characteristics
    if avg_peak_density > 0.05:
        name_parts.append("Peak")
    elif avg_valley_density > 0.12:
        name_parts.append("Valley")
    elif avg_intensity < 0.35:
        name_parts.append("Calm")
    elif avg_intensity > 0.65:
        name_parts.append("Intense")
    
    # Stability/variance
    if avg_intensity_variance < 0.002:
        name_parts.append("Stable")
    elif avg_intensity_variance > 0.01:
        name_parts.append("Volatile")
    
    # Drift characteristics
    if avg_drift_mag > 0.15:
        if most_common_quadrant == 0:
            name_parts.append("FunctionalStructured")
        elif most_common_quadrant == 1:
            name_parts.append("FunctionalEmergent")
        elif most_common_quadrant == 2:
            name_parts.append("SocialStructured")
        elif most_common_quadrant == 3:
            name_parts.append("SocialEmergent")
        else:
            name_parts.append("Drift")
    elif avg_drift_mag < 0.1:
        name_parts.append("MinimalDrift")
    
    # Pattern/purpose
    if most_common_pattern:
        if most_common_pattern == 'question-answer':
            name_parts.append("QA")
        elif most_common_pattern == 'collaborative':
            name_parts.append("Collaborative")
        elif most_common_pattern == 'storytelling':
            name_parts.append("Narrative")
        elif most_common_pattern == 'advisory':
            name_parts.append("Advisory")
        elif most_common_pattern == 'casual-chat':
            name_parts.append("Casual")
    
    if most_common_purpose:
        if most_common_purpose == 'information-seeking':
            name_parts.append("InfoSeeking")
        elif most_common_purpose == 'relationship-building':
            name_parts.append("Relational")
        elif most_common_purpose == 'self-expression':
            name_parts.append("SelfExpression")
        elif most_common_purpose == 'entertainment':
            name_parts.append("Entertainment")
        elif most_common_purpose == 'problem-solving':
            name_parts.append("ProblemSolving")
    
    # If still no name parts, use basic characteristics
    if not name_parts:
        if avg_drift_mag > 0.5:
            name_parts.append("HighDrift")
        else:
            name_parts.append("LowDrift")
        if cluster_id is not None:
            name_parts.append(f"C{cluster_id}")
    
    return "_".join(name_parts) if name_parts else "Unnamed"


def generate_cluster_report(clusters: Dict[int, List[PathTrajectoryFeatures]], 
                           cluster_names: Dict[int, str],
                           method: str,
                           n_clusters: int) -> str:
    """Generate detailed cluster analysis report."""
    report = []
    report.append("# Path Cluster Analysis: Proper Clustering Methodology\n")
    report.append("**Analysis Method:** " + method.upper() + "\n")
    report.append(f"**Number of Clusters:** {n_clusters}\n")
    report.append(f"**Total Conversations:** {sum(len(v) for v in clusters.values())}\n")
    report.append("\n---\n\n")
    
    report.append("## Clustering Methodology\n\n")
    report.append("### What is 'Drift'?\n\n")
    report.append("**Drift** = cumulative movement through relational-affective space over time.\n\n")
    report.append("All conversations start at origin (0.5, 0.5) and systematically drift toward a target position determined by:\n")
    report.append("1. **Conversation-level classification** (communicationFunction, conversationStructure)\n")
    report.append("2. **Message-level characteristics** (expressive scores, alignment scores)\n")
    report.append("3. **Role-based adjustments** (user vs. assistant positioning)\n")
    report.append("4. **Temporal progression** (more drift as conversation progresses)\n\n")
    report.append("Drift is NOT random movement—it's systematic positioning based on:\n")
    report.append("- **X-axis:** Functional (0.0-0.4) ↔ Social (0.6-1.0) - Watzlawick's content/relationship distinction\n")
    report.append("- **Y-axis:** Structured (0.0-0.4) ↔ Emergent (0.6-1.0) - Linguistic alignment/convergence\n\n")
    report.append("**Drift direction indicates relational positioning:**\n")
    report.append("- **Functional drift:** Conversation moves toward task-oriented positioning\n")
    report.append("- **Social drift:** Conversation moves toward relationship-focused positioning\n")
    report.append("- **Structured drift:** Conversation moves toward predictable patterns\n")
    report.append("- **Emergent drift:** Conversation moves toward dynamic role negotiation\n\n")
    report.append("---\n\n")
    
    # Sort clusters by size
    sorted_clusters = sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)
    
    for cluster_id, conversations in sorted_clusters:
        cluster_name = cluster_names.get(cluster_id, f"Cluster_{cluster_id}")
        report.append(f"## Cluster {cluster_id}: {cluster_name}\n")
        report.append(f"**Size:** {len(conversations)} conversations ({len(conversations)/sum(len(v) for v in clusters.values())*100:.1f}%)\n\n")
        
        # Calculate cluster statistics
        features_to_analyze = [
            'avg_intensity', 'intensity_variance', 'peak_density', 'valley_density',
            'drift_magnitude', 'drift_angle_sin', 'drift_angle_cos', 'final_x', 'final_y',
            'path_straightness', 'quadrant'  # quadrant for reporting only
        ]
        
        report.append("### Trajectory Characteristics\n\n")
        for feat in features_to_analyze:
            values = [c.features.get(feat, 0) for c in conversations]
            if values:
                avg = statistics.mean(values)
                std = statistics.stdev(values) if len(values) > 1 else 0
                report.append(f"- **{feat.replace('_', ' ').title()}:** {avg:.3f} (±{std:.3f})\n")
        
        # Classification distribution
        patterns = [c.classification.get('interactionPattern', {}).get('category') for c in conversations if c.classification]
        tones = [c.classification.get('emotionalTone', {}).get('category') for c in conversations if c.classification]
        purposes = [c.classification.get('conversationPurpose', {}).get('category') for c in conversations if c.classification]
        
        if patterns:
            pattern_counts = defaultdict(int)
            for p in patterns:
                pattern_counts[p] += 1
            report.append("\n### Interaction Patterns\n\n")
            for pattern, count in sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True):
                report.append(f"- **{pattern}:** {count} ({count/len(patterns)*100:.1f}%)\n")
        
        if purposes:
            purpose_counts = defaultdict(int)
            for p in purposes:
                purpose_counts[p] += 1
            report.append("\n### Conversation Purposes\n\n")
            for purpose, count in sorted(purpose_counts.items(), key=lambda x: x[1], reverse=True):
                report.append(f"- **{purpose}:** {count} ({count/len(purposes)*100:.1f}%)\n")
        
        # Example conversations
        report.append(f"\n### Example Conversations ({min(10, len(conversations))} of {len(conversations)})\n\n")
        for conv in conversations[:10]:
            report.append(f"- `{conv.id}`\n")
        
        report.append("\n---\n\n")
    
    return ''.join(report)


def analyze_feature_importance(features_list: List[PathTrajectoryFeatures],
                               feature_vectors: np.ndarray,
                               labels: np.ndarray) -> Dict[str, float]:
    """Analyze which features are most important for cluster separation."""
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    # Use Random Forest to get feature importance
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(scaled_features, labels)
    
    # Get feature names
    feature_order = [
        'avg_intensity', 'max_intensity', 'min_intensity', 'intensity_range',
        'intensity_variance', 'intensity_trend', 'peak_count', 'valley_count',
        'peak_density', 'valley_density',
        'final_x', 'final_y', 'drift_x', 'drift_y', 'drift_magnitude',
        'drift_angle_sin', 'drift_angle_cos',
        'x_variance', 'y_variance', 'path_length', 'path_straightness',
        'pattern_qa', 'pattern_collaborative', 'pattern_storytelling', 'pattern_advisory', 'pattern_casual',
        'tone_playful', 'tone_neutral', 'tone_serious', 'tone_supportive',
        'purpose_info', 'purpose_entertainment', 'purpose_relationship', 'purpose_self_expression',
        'human_seeker', 'human_collaborator', 'human_sharer', 'human_director',
        'ai_expert', 'ai_peer', 'ai_affiliative', 'ai_advisor',
        'message_count_log'
    ]
    
    # Get importance scores
    importances = rf.feature_importances_
    feature_importance = dict(zip(feature_order, importances))
    
    # Sort by importance
    sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    return dict(sorted_importance)


def create_tsne_visualization(feature_vectors: np.ndarray,
                              labels: np.ndarray,
                              cluster_names: Dict[int, str],
                              output_path: Path,
                              method: str):
    """Create t-SNE visualization of clusters in 2D."""
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(feature_vectors)
    
    # Perform t-SNE
    print(f"\nComputing t-SNE for {method}...")
    tsne = TSNE(n_components=2, random_state=42, perplexity=30, n_iter=1000)
    tsne_results = tsne.fit_transform(scaled_features)
    
    # Create visualization
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Get unique clusters
    unique_labels = sorted(set(labels))
    colors = plt.cm.tab10(np.linspace(0, 1, len(unique_labels)))
    
    for i, label in enumerate(unique_labels):
        mask = labels == label
        cluster_name = cluster_names.get(label, f"Cluster_{label}")
        ax.scatter(tsne_results[mask, 0], tsne_results[mask, 1],
                  c=[colors[i]], label=cluster_name, alpha=0.6, s=50)
    
    ax.set_xlabel('t-SNE Component 1', fontsize=12)
    ax.set_ylabel('t-SNE Component 2', fontsize=12)
    ax.set_title(f't-SNE Visualization of Conversation Clusters ({method.upper()})', fontsize=14)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=9)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"t-SNE visualization saved to: {output_path}")


def generate_feature_importance_report(feature_importance: Dict[str, float],
                                      output_path: Path):
    """Generate a report of feature importance."""
    report = []
    report.append("# Feature Importance Analysis\n\n")
    report.append("This analysis identifies which features are most discriminative for cluster separation.\n\n")
    report.append("## Top 20 Most Important Features\n\n")
    report.append("| Rank | Feature | Importance | Category |\n")
    report.append("|------|---------|------------|----------|\n")
    
    # Categorize features
    categories = {
        'Emotional Intensity': ['avg_intensity', 'max_intensity', 'min_intensity', 'intensity_range',
                               'intensity_variance', 'intensity_trend', 'peak_count', 'valley_count',
                               'peak_density', 'valley_density'],
        'Spatial Trajectory': ['final_x', 'final_y', 'drift_x', 'drift_y', 'drift_magnitude',
                              'drift_angle_sin', 'drift_angle_cos', 'x_variance', 'y_variance',
                              'path_length', 'path_straightness'],
        'Pattern': ['pattern_qa', 'pattern_collaborative', 'pattern_storytelling', 'pattern_advisory', 'pattern_casual'],
        'Tone': ['tone_playful', 'tone_neutral', 'tone_serious', 'tone_supportive'],
        'Purpose': ['purpose_info', 'purpose_entertainment', 'purpose_relationship', 'purpose_self_expression'],
        'Human Role': ['human_seeker', 'human_collaborator', 'human_sharer', 'human_director'],
        'AI Role': ['ai_expert', 'ai_peer', 'ai_affiliative', 'ai_advisor'],
        'Structure': ['message_count_log']
    }
    
    def get_category(feature_name):
        for cat, features in categories.items():
            if feature_name in features:
                return cat
        return 'Unknown'
    
    top_features = list(feature_importance.items())[:20]
    for rank, (feature, importance) in enumerate(top_features, 1):
        category = get_category(feature)
        report.append(f"| {rank} | `{feature}` | {importance:.4f} | {category} |\n")
    
    report.append("\n## Insights\n\n")
    report.append("### Most Discriminative Feature Categories:\n\n")
    
    # Calculate category totals
    category_totals = defaultdict(float)
    for feature, importance in feature_importance.items():
        category_totals[get_category(feature)] += importance
    
    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    for category, total in sorted_categories:
        report.append(f"- **{category}**: {total:.4f} ({(total/sum(category_totals.values())*100):.1f}%)\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(''.join(report))
    
    print(f"Feature importance report saved to: {output_path}")


def main():
    """Main analysis function."""
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
    print(f"Extracted {feature_vectors.shape[1]} features from {len(features_list)} conversations")
    
    # Try different clustering methods and k values
    methods = ['kmeans', 'hierarchical']
    k_values_to_try = [3, 4, 5, 6, 7]  # Force exploration of more clusters
    
    for method in methods:
        print(f"\n{'='*60}")
        print(f"Clustering with {method.upper()}")
        print(f"{'='*60}")
        
        # First, find optimal k
        optimal_k, scores = find_optimal_clusters(feature_vectors)
        print(f"\nOptimal k (silhouette): {optimal_k}")
        print(f"Silhouette scores by k: {scores}")
        
        # Try multiple k values
        best_result = None
        best_balance_score = -1
        
        for k in [optimal_k] + [k for k in k_values_to_try if k != optimal_k]:
            clusters, labels, _ = cluster_conversations(
                features_list, feature_vectors, method=method, n_clusters=k
            )
            
            # Calculate balance score (penalize imbalanced clusters)
            cluster_sizes = [len(convs) for convs in clusters.values()]
            if cluster_sizes:
                max_size = max(cluster_sizes)
                total_size = sum(cluster_sizes)
                balance_score = 1.0 - (max_size / total_size)  # Higher = more balanced
                
                # Also check for singleton clusters
                singleton_penalty = sum(1 for s in cluster_sizes if s == 1) * 0.1
                balance_score -= singleton_penalty
                
                # Calculate silhouette
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(feature_vectors)
                sil_score = silhouette_score(scaled_features, labels) if len(set(labels)) > 1 and -1 not in labels else -1
                
                # Combined score: 60% silhouette (cluster quality), 40% balance (distribution)
                # This weighting prioritizes cluster separation while penalizing extreme imbalance.
                # Alternative weightings (e.g., 0.7/0.3 or 0.5/0.5) can be explored for sensitivity analysis.
                SILHOUETTE_WEIGHT = 0.6
                BALANCE_WEIGHT = 0.4
                combined_score = (sil_score * SILHOUETTE_WEIGHT) + (balance_score * BALANCE_WEIGHT)
                
                print(f"\n  k={k}: silhouette={sil_score:.3f}, balance={balance_score:.3f}, combined={combined_score:.3f}")
                print(f"    Cluster sizes: {sorted(cluster_sizes, reverse=True)}")
                
                if combined_score > best_balance_score:
                    best_balance_score = combined_score
                    best_result = (clusters, labels, k, sil_score)
        
        if best_result:
            clusters, labels, n_clusters, sil_score = best_result
            print(f"\nSelected k={n_clusters} (combined score: {best_balance_score:.3f})")
            
            # Generate cluster names (pass cluster_id to help differentiate)
            cluster_names = {cid: name_cluster(convs, cid) for cid, convs in clusters.items()}
            
            print(f"\nFound {n_clusters} clusters:")
            for cid, convs in sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True):
                name = cluster_names.get(cid, f"Cluster_{cid}")
                pct = len(convs) / sum(len(v) for v in clusters.values()) * 100
                print(f"  {name}: {len(convs)} conversations ({pct:.1f}%)")
            
            print(f"\nSilhouette Score: {sil_score:.3f}")
            
            # Generate report
            report = generate_cluster_report(clusters, cluster_names, method, n_clusters)
            
            output_file = project_root / 'docs' / f'PATH_CLUSTER_ANALYSIS_{method.upper()}.md'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            
            print(f"\nReport saved to: {output_file}")
            
            # Save cluster data
            cluster_data = {
                cluster_names.get(cid, f"cluster_{cid}"): [
                    {
                        'id': conv.id,
                        'features': conv.features,
                        'classification': conv.classification
                    }
                    for conv in convs
                ]
                for cid, convs in clusters.items()
            }
            
            json_output = project_root / 'reports' / f'path-clusters-{method}.json'
            with open(json_output, 'w', encoding='utf-8') as f:
                json.dump(cluster_data, f, indent=2, default=str)
            
            print(f"Cluster data saved to: {json_output}")
            
            # Feature importance analysis
            print(f"\nAnalyzing feature importance for {method}...")
            feature_importance = analyze_feature_importance(features_list, feature_vectors, labels)
            
            importance_report = project_root / 'docs' / f'FEATURE_IMPORTANCE_{method.upper()}.md'
            generate_feature_importance_report(feature_importance, importance_report)
            
            # t-SNE visualization
            tsne_output = project_root / 'docs' / f'tsne-clusters-{method.lower()}.png'
            create_tsne_visualization(feature_vectors, labels, cluster_names, tsne_output, method)


if __name__ == '__main__':
    main()

