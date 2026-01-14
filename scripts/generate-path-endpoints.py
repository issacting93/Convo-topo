#!/usr/bin/env python3
"""
Generate conversation path endpoints using the same logic as the UI

Ports terrain.ts calculation to Python to get accurate spatial positions
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Tuple

def to_visualization_space(value: float) -> float:
    """Convert 0-1 value to 0-1 space (identity function)"""
    return max(0.0, min(1.0, value))

def analyze_message(msg: Dict) -> Dict:
    """Simplified message analysis - returns basic metrics"""
    content = msg.get('content', '')
    return {
        'expressiveScore': 0.5,  # Neutral default
        'alignmentScore': 0.5,   # Will be updated
        'length': len(content)
    }

def calculate_alignment_scores(messages: List[Dict]) -> List[float]:
    """Calculate alignment scores (simplified version)"""
    # For now, return neutral scores - full implementation would analyze linguistic alignment
    return [0.5] * len(messages)

def generate_path_endpoint(messages: List[Dict]) -> Tuple[float, float, float]:
    """
    Generate the final endpoint of a conversation path

    Matches the logic in terrain.ts generatePathPoints()
    Returns (x, y, z) where:
    - x: 0 (functional) to 1 (social)
    - y: 0 (divergent) to 1 (aligned)
    - z: emotional intensity
    """

    if not messages or len(messages) == 0:
        return (0.5, 0.5, 0.5)

    # All conversations start at center
    start_x = 0.5
    start_y = 0.5

    # Get conversation-level target from first message
    first_msg = messages[0]

    # communicationFunction: 0 (functional) to 1 (social)
    comm_func = first_msg.get('communicationFunction', 0.5)
    target_x = to_visualization_space(comm_func)

    # conversationStructure: 0 (emergent) to 1 (structured)
    # We need to invert this to match Y axis (0 = divergent, 1 = aligned)
    conv_struct = first_msg.get('conversationStructure', 0.5)
    target_y = to_visualization_space(conv_struct)

    # Calculate drift for each message
    current_x = start_x
    current_y = start_y

    alignment_scores = calculate_alignment_scores(messages)

    for i, msg in enumerate(messages):
        analysis = analyze_message(msg)
        analysis['alignmentScore'] = alignment_scores[i]

        # Role-based drift adjustment
        role = msg.get('role', 'user')
        is_user = (role == 'user')

        # Progress through conversation (0 to 1)
        progress = (i + 1) / len(messages)

        # Drift strength increases with progress
        drift_strength = 0.15 * progress

        # Calculate drift direction toward target
        dx = (target_x - current_x) * drift_strength
        dy = (target_y - current_y) * drift_strength

        # Add message-specific adjustments
        # Expressive messages drift more toward social
        expressive_drift = (analysis['expressiveScore'] - 0.5) * 0.05
        dx += expressive_drift

        # Alignment affects Y axis
        alignment_drift = (analysis['alignmentScore'] - 0.5) * 0.05
        dy += alignment_drift

        # User vs AI positioning
        if is_user:
            # User messages drift slightly more social
            dx += 0.02
        else:
            # AI messages drift slightly more functional
            dx -= 0.02

        # Update position
        current_x = max(0.0, min(1.0, current_x + dx))
        current_y = max(0.0, min(1.0, current_y + dy))

    # Calculate average emotional intensity
    intensities = []
    for msg in messages:
        if msg.get('pad') and msg['pad'].get('emotionalIntensity') is not None:
            intensities.append(msg['pad']['emotionalIntensity'])

    avg_intensity = sum(intensities) / len(intensities) if intensities else 0.5

    return (current_x, current_y, avg_intensity)

def process_all_conversations():
    """Process all conversations and generate endpoints"""
    results = {
        'OASST': [],
        'WildChat': [],
        'Chatbot Arena': []
    }

    # Process public/output
    output_dir = Path('public/output')
    print(f"Processing {output_dir}...")

    for file in output_dir.glob('*.json'):
        try:
            with open(file) as f:
                data = json.load(f)

            if not data.get('messages') or len(data['messages']) == 0:
                continue

            # Generate endpoint
            x, y, z = generate_path_endpoint(data['messages'])

            # Classify by source
            filename = file.name
            if filename.startswith('oasst'):
                dataset = 'OASST'
            elif filename.startswith('chatbot_arena'):
                dataset = 'Chatbot Arena'
            else:
                continue

            results[dataset].append({
                'id': data.get('id', filename),
                'file': filename,
                'x': x,
                'y': y,
                'z': z
            })

        except Exception as e:
            print(f"  Error processing {file.name}: {e}")
            continue

    # Process public/output-wildchat
    wildchat_dir = Path('public/output-wildchat')
    if wildchat_dir.exists():
        print(f"Processing {wildchat_dir}...")

        for file in wildchat_dir.glob('wildchat_*.json'):
            try:
                with open(file) as f:
                    data = json.load(f)

                if not data.get('messages') or len(data['messages']) == 0:
                    continue

                # Generate endpoint
                x, y, z = generate_path_endpoint(data['messages'])

                results['WildChat'].append({
                    'id': data.get('id', file.name),
                    'file': file.name,
                    'x': x,
                    'y': y,
                    'z': z
                })

            except Exception as e:
                print(f"  Error processing {file.name}: {e}")
                continue

    return results

def classify_quadrant(x: float, y: float) -> str:
    """Classify position into quadrant"""
    if x < 0.5 and y > 0.5:
        return 'Functional-Aligned'
    elif x > 0.5 and y > 0.5:
        return 'Social-Aligned'
    elif x < 0.5 and y < 0.5:
        return 'Functional-Divergent'
    else:
        return 'Social-Divergent'

def analyze_distribution(results: Dict):
    """Analyze spatial distribution"""
    print("\n=== Spatial Distribution Analysis ===\n")

    for dataset, points in results.items():
        if not points:
            print(f"{dataset}: No data")
            continue

        print(f"{dataset} (n={len(points)}):")

        # Calculate statistics
        xs = [p['x'] for p in points]
        ys = [p['y'] for p in points]
        zs = [p['z'] for p in points]

        print(f"  X: mean={sum(xs)/len(xs):.3f}, range=[{min(xs):.3f}, {max(xs):.3f}]")
        print(f"  Y: mean={sum(ys)/len(ys):.3f}, range=[{min(ys):.3f}, {max(ys):.3f}]")
        print(f"  Z: mean={sum(zs)/len(zs):.3f}, range=[{min(zs):.3f}, {max(zs):.3f}]")

        # Quadrant distribution
        quadrants = {}
        for point in points:
            q = classify_quadrant(point['x'], point['y'])
            quadrants[q] = quadrants.get(q, 0) + 1

        print("  Quadrants:")
        for q in ['Functional-Aligned', 'Social-Aligned', 'Functional-Divergent', 'Social-Divergent']:
            count = quadrants.get(q, 0)
            pct = (count / len(points) * 100) if len(points) > 0 else 0
            print(f"    {q}: {count} ({pct:.1f}%)")

        print()

def main():
    print("Generating conversation path endpoints...")
    print("(Using simplified terrain calculation logic)\n")

    results = process_all_conversations()

    # Print summary
    print("\n=== Dataset Counts ===")
    for dataset, points in results.items():
        print(f"{dataset}: {len(points)} conversations")

    # Analyze distribution
    analyze_distribution(results)

    # Save results
    output_file = Path('reports/conversation-endpoints.json')
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Saved: {output_file}")
    print("   Use this data for visualization")

if __name__ == '__main__':
    main()
