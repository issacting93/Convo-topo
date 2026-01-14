#!/usr/bin/env python3
"""
Render Density Map for 538 Conversations (New Taxonomy)

Creates a 2D density map showing where conversations cluster in relational-affective space:
- X-axis: Functional ↔ Social (Communication Function)
- Y-axis: Aligned ↔ Divergent (Conversation Structure)
"""

import json
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from scipy.stats import gaussian_kde
from pathlib import Path
from typing import Dict, List, Optional
import statistics

OUTPUT_DIR = Path("public/output")
REPORTS_DIR = Path("reports")

def calculate_functional_social_score(classification: Dict) -> float:
    """Calculate X-axis position: Functional (0.0) ↔ Social (1.0)
    
    Matches logic from src/utils/coordinates.ts getCommunicationFunction()
    """
    if not classification:
        return 0.5
    
    # Priority 1: Role-based positioning (Social Role Theory)
    human_role = classification.get('humanRole', {}).get('distribution', {})
    if human_role:
        # Instrumental roles (Functional, left: 0.1-0.4)
        role_x = (
            (human_role.get('director', 0) + human_role.get('challenger', 0)) * 0.1 +
            (human_role.get('information-seeker', 0) + human_role.get('seeker', 0)) * 0.2 +
            (human_role.get('provider', 0) + human_role.get('learner', 0)) * 0.3 +
            (human_role.get('collaborator', 0) + human_role.get('co-constructor', 0)) * 0.4 +
            # Expressive roles (Social, right: 0.8-0.95)
            (human_role.get('social-expressor', 0) + human_role.get('sharer', 0)) * 0.95 +
            human_role.get('relational-peer', 0) * 0.85
        )
        
        max_role = max(human_role.values()) if human_role else 0
        if max_role > 0.3:
            return max(0.0, min(1.0, role_x))
    
    # Priority 2: Purpose-based
    purpose = classification.get('conversationPurpose', {}).get('category', '')
    if purpose in ['information-seeking', 'problem-solving']:
        return 0.3  # Functional
    elif purpose in ['entertainment', 'relationship-building']:
        return 0.7  # Social
    
    # Fallback
    return 0.5

def calculate_conversation_structure(classification: Dict, messages: List[Dict]) -> float:
    """Calculate Y-axis position: Aligned (0.0) ↔ Divergent (1.0)
    
    Simplified version - full version uses linguistic alignment analysis
    Matches logic from src/utils/coordinates.ts getConversationStructure()
    """
    if not classification:
        return 0.5
    
    # Priority 1: Pattern-based (most reliable)
    pattern = classification.get('interactionPattern', {}).get('category', '')
    confidence = classification.get('interactionPattern', {}).get('confidence', 0.5)
    strength = 0.3 * confidence
    
    if pattern == 'question-answer':
        return 0.5 + (0.15 * confidence)  # ~0.5-0.65 (Balanced to Divergent)
    elif pattern == 'advisory':
        return 0.5 + 0.2 + strength  # ~0.8-0.9 (Divergent)
    elif pattern in ['collaborative', 'casual-chat', 'storytelling']:
        return 0.5 - 0.2 - strength  # ~0.1-0.2 (Aligned)
    
    # Priority 2: Role-based fallback
    ai_role = classification.get('aiRole', {}).get('distribution', {})
    if ai_role:
        expert = ai_role.get('expert-system', 0) + ai_role.get('expert', 0)
        peer = ai_role.get('relational-peer', 0) + ai_role.get('peer', 0)
        
        if expert > 0.5:
            return 0.3  # Structured (Divergent roles - one-way advice)
        elif peer > 0.5:
            return 0.7  # Emergent (Aligned roles - peer interaction)
    
    # Fallback
    return 0.5

def load_conversations() -> List[Dict]:
    """Load 538 conversations with new taxonomy."""
    conversations = []
    
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        return conversations
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"📂 Loading conversations...")
    
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
                conversations.append(data)
                
        except Exception as e:
            pass
    
    return conversations

def create_density_map(conversations: List[Dict], output_path: Path):
    """Create 2D density map of conversations."""
    # Extract coordinates
    x_coords = []
    y_coords = []
    sources = []
    
    for conv in conversations:
        classification = conv.get('classification', {})
        messages = conv.get('messages', [])
        
        x = calculate_functional_social_score(classification)
        y = calculate_conversation_structure(classification, messages)
        
        x_coords.append(x)
        y_coords.append(y)
        
        # Track source for coloring
        filename = conv.get('_source_file', '')
        if filename.startswith('chatbot_arena_'):
            sources.append('Chatbot Arena')
        elif filename.startswith('wildchat_'):
            sources.append('WildChat')
        elif filename.startswith('oasst-'):
            sources.append('OASST')
        else:
            sources.append('Other')
    
    if not x_coords:
        print("❌ No coordinates to plot")
        return
    
    x_coords = np.array(x_coords)
    y_coords = np.array(y_coords)
    
    # Create figure with two subplots: scatter + density
    fig = plt.figure(figsize=(16, 8))
    
    # Left: Scatter plot with source colors
    ax1 = fig.add_subplot(121)
    
    source_colors = {
        'Chatbot Arena': '#1f77b4',
        'WildChat': '#ff7f0e',
        'OASST': '#2ca02c',
        'Other': '#d62728'
    }
    
    for source in set(sources):
        mask = np.array(sources) == source
        ax1.scatter(x_coords[mask], y_coords[mask], 
                   c=source_colors.get(source, '#666666'), 
                   alpha=0.6, s=30, label=source, edgecolors='none')
    
    ax1.axvline(x=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)
    ax1.axhline(y=0.5, color='gray', linestyle='--', alpha=0.3, linewidth=1)
    
    ax1.set_xlabel('X-Axis: Functional ↔ Social', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Y-Axis: Aligned ↔ Divergent', fontsize=12, fontweight='bold')
    ax1.set_title('538 Conversations: Spatial Distribution by Source', fontsize=14, fontweight='bold')
    ax1.set_xlim(0, 1)
    ax1.set_ylim(0, 1)
    ax1.grid(True, alpha=0.2)
    ax1.legend(loc='upper right', framealpha=0.9)
    
    # Add quadrant labels
    ax1.text(0.25, 0.95, 'Functional', fontsize=10, ha='center', alpha=0.7)
    ax1.text(0.75, 0.95, 'Social', fontsize=10, ha='center', alpha=0.7)
    ax1.text(0.02, 0.75, 'Emergent', fontsize=10, rotation=90, va='center', alpha=0.7)
    ax1.text(0.02, 0.25, 'Structured', fontsize=10, rotation=90, va='center', alpha=0.7)
    
    # Right: Density heatmap
    ax2 = fig.add_subplot(122)
    
    # Create 2D histogram/density
    try:
        # Use Gaussian KDE for smooth density estimation
        xy = np.vstack([x_coords, y_coords])
        kde = gaussian_kde(xy)
        
        # Create grid
        x_grid = np.linspace(0, 1, 100)
        y_grid = np.linspace(0, 1, 100)
        X_grid, Y_grid = np.meshgrid(x_grid, y_grid)
        positions = np.vstack([X_grid.ravel(), Y_grid.ravel()])
        
        # Calculate density
        density = kde(positions).reshape(X_grid.shape)
        
        # Plot density map
        im = ax2.imshow(density, extent=[0, 1, 0, 1], origin='lower',
                       cmap='YlOrRd', alpha=0.8, aspect='auto', interpolation='bilinear')
        ax2.contour(X_grid, Y_grid, density, levels=8, colors='black', alpha=0.3, linewidths=0.5)
        
    except Exception as e:
        # Fallback to 2D histogram if KDE fails
        print(f"⚠️  KDE failed, using histogram: {e}")
        H, x_edges, y_edges = np.histogram2d(x_coords, y_coords, bins=50, range=[[0, 1], [0, 1]])
        H = H.T  # Transpose for correct orientation
        im = ax2.imshow(H, extent=[0, 1, 0, 1], origin='lower',
                       cmap='YlOrRd', alpha=0.8, aspect='auto', interpolation='bilinear')
    
    ax2.axvline(x=0.5, color='white', linestyle='--', alpha=0.5, linewidth=1.5)
    ax2.axhline(y=0.5, color='white', linestyle='--', alpha=0.5, linewidth=1.5)
    
    ax2.set_xlabel('X-Axis: Functional ↔ Social', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Y-Axis: Aligned ↔ Divergent', fontsize=12, fontweight='bold')
    ax2.set_title('538 Conversations: Density Heatmap', fontsize=14, fontweight='bold')
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    
    # Add colorbar
    cbar = plt.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)
    cbar.set_label('Conversation Density', fontsize=10, fontweight='bold')
    
    # Add quadrant labels
    ax2.text(0.25, 0.95, 'Functional', fontsize=10, ha='center', color='white', 
             bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.5))
    ax2.text(0.75, 0.95, 'Social', fontsize=10, ha='center', color='white',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.5))
    ax2.text(0.02, 0.75, 'Emergent', fontsize=10, rotation=90, va='center', color='white',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.5))
    ax2.text(0.02, 0.25, 'Structured', fontsize=10, rotation=90, va='center', color='white',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.5))
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    print(f"✅ Density map saved to: {output_path}")

def main():
    print("="*70)
    print("🗺️  RENDERING DENSITY MAP: 538 Conversations")
    print("="*70)
    print()
    
    # Load conversations
    conversations = load_conversations()
    print(f"✅ Loaded {len(conversations)} conversations with new taxonomy")
    
    if not conversations:
        print("❌ No conversations found")
        return
    
    # Create output directory
    output_dir = REPORTS_DIR / "visualizations"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate density map
    output_path = output_dir / "density-map-538.png"
    print(f"\n📊 Generating density map...")
    create_density_map(conversations, output_path)
    
    # Calculate statistics
    x_coords = []
    y_coords = []
    for conv in conversations:
        classification = conv.get('classification', {})
        messages = conv.get('messages', [])
        x_coords.append(calculate_functional_social_score(classification))
        y_coords.append(calculate_conversation_structure(classification, messages))
    
    print(f"\n📊 STATISTICS:")
    print(f"   X-axis (Functional ↔ Social):")
    print(f"      Mean: {statistics.mean(x_coords):.3f}")
    print(f"      Median: {statistics.median(x_coords):.3f}")
    print(f"      Std: {statistics.stdev(x_coords):.3f}")
    print(f"   Y-axis (Aligned ↔ Divergent):")
    print(f"      Mean: {statistics.mean(y_coords):.3f}")
    print(f"      Median: {statistics.median(y_coords):.3f}")
    print(f"      Std: {statistics.stdev(y_coords):.3f}")
    
    print(f"\n✅ Density map rendered successfully!")
    print(f"   File: {output_path}")
    print("="*70)

if __name__ == "__main__":
    main()

