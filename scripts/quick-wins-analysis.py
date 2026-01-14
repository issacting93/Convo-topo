#!/usr/bin/env python3
"""
Quick Wins Analysis Script
Generates insights from classified conversation data:
1. Role Transition Matrix
2. Average Conversation Lifecycle (PAD curves)
3. Message Length Distribution
4. Confidence Score Distribution
5. Top 20 Most Typical Conversations
6. Top 20 Most Unusual Conversations
"""

import json
import glob
import numpy as np
from collections import defaultdict, Counter
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Tuple

def load_all_conversations() -> List[Dict[str, Any]]:
    """Load all classified conversations from output directories."""
    conversations = []

    # Load Chatbot Arena conversations
    arena_files = glob.glob('public/output/chatbot_arena_*.json')
    for file_path in arena_files:
        try:
            with open(file_path, 'r') as f:
                conv = json.load(f)
                conv['source'] = 'chatbot_arena'
                conversations.append(conv)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    # Load WildChat conversations
    wildchat_files = glob.glob('public/output-wildchat/wildchat_*.json')
    for file_path in wildchat_files:
        try:
            with open(file_path, 'r') as f:
                conv = json.load(f)
                conv['source'] = 'wildchat'
                conversations.append(conv)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    print(f"✅ Loaded {len(conversations)} conversations")
    print(f"   - Chatbot Arena: {len(arena_files)}")
    print(f"   - WildChat: {len(wildchat_files)}")

    return conversations

def get_dominant_role(role_dist: Dict[str, float]) -> str:
    """Get the dominant role from a distribution."""
    if not role_dist:
        return 'unknown'
    return max(role_dist.items(), key=lambda x: x[1])[0]

def calculate_role_transitions(conversations: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
    """
    Calculate role transition matrix.
    For conversations with multiple turns, track when human role changes.
    """
    transitions = defaultdict(lambda: defaultdict(int))

    for conv in conversations:
        messages = conv.get('messages', [])
        if len(messages) < 4:  # Need at least 2 user messages for transition
            continue

        # Use classification if available, otherwise skip
        classification = conv.get('classification')
        if not classification:
            continue

        human_role_data = classification.get('humanRole')
        ai_role_data = classification.get('aiRole')

        if not human_role_data or not ai_role_data:
            continue

        # For now, we'll count role pair transitions
        # (This is a simplified version - in reality, roles don't often change mid-conversation)
        human_role = get_dominant_role(human_role_data.get('distribution', {}))
        ai_role = get_dominant_role(ai_role_data.get('distribution', {}))

        if human_role == 'unknown' or ai_role == 'unknown':
            continue

        # Count this as a "stable" transition (no change)
        transitions[human_role][human_role] += 1

    return dict(transitions)

def calculate_average_pad_lifecycle(conversations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate average PAD values across conversation lifecycle.
    Normalize all conversations to 10 "phases" and aggregate.
    """
    # Collect PAD values at normalized positions
    normalized_pads = {
        'pleasure': [[] for _ in range(10)],
        'arousal': [[] for _ in range(10)],
        'dominance': [[] for _ in range(10)],
        'emotionalIntensity': [[] for _ in range(10)]
    }

    for conv in conversations:
        messages = conv.get('messages', [])
        if len(messages) < 2:
            continue

        # Extract PAD values
        pad_values = []
        for msg in messages:
            if 'pad' in msg:
                pad_values.append(msg['pad'])

        if not pad_values:
            continue

        # Normalize to 10 phases
        num_messages = len(pad_values)
        for i, pad in enumerate(pad_values):
            # Map message index to phase (0-9)
            phase = min(9, int((i / num_messages) * 10))

            normalized_pads['pleasure'][phase].append(pad.get('pleasure', 0.5))
            normalized_pads['arousal'][phase].append(pad.get('arousal', 0.5))
            normalized_pads['dominance'][phase].append(pad.get('dominance', 0.5))
            normalized_pads['emotionalIntensity'][phase].append(pad.get('emotionalIntensity', 0.5))

    # Calculate averages
    lifecycle = {
        'phases': list(range(10)),
        'pleasure': [float(np.mean(vals)) if vals else 0.5 for vals in normalized_pads['pleasure']],
        'arousal': [float(np.mean(vals)) if vals else 0.5 for vals in normalized_pads['arousal']],
        'dominance': [float(np.mean(vals)) if vals else 0.5 for vals in normalized_pads['dominance']],
        'emotionalIntensity': [float(np.mean(vals)) if vals else 0.5 for vals in normalized_pads['emotionalIntensity']],
        'sample_sizes': [len(vals) for vals in normalized_pads['pleasure']]
    }

    return lifecycle

def calculate_message_length_distribution(conversations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate message length statistics."""
    user_lengths = []
    assistant_lengths = []

    for conv in conversations:
        for msg in conv.get('messages', []):
            content = msg.get('content', '')
            length = len(content)

            if msg.get('role') == 'user':
                user_lengths.append(length)
            elif msg.get('role') == 'assistant':
                assistant_lengths.append(length)

    return {
        'user': {
            'mean': float(np.mean(user_lengths)),
            'median': float(np.median(user_lengths)),
            'std': float(np.std(user_lengths)),
            'min': int(np.min(user_lengths)),
            'max': int(np.max(user_lengths)),
            'count': len(user_lengths),
            'histogram': [int(x) for x in np.histogram(user_lengths, bins=20)[0]],
            'bins': [float(x) for x in np.histogram(user_lengths, bins=20)[1]]
        },
        'assistant': {
            'mean': float(np.mean(assistant_lengths)),
            'median': float(np.median(assistant_lengths)),
            'std': float(np.std(assistant_lengths)),
            'min': int(np.min(assistant_lengths)),
            'max': int(np.max(assistant_lengths)),
            'count': len(assistant_lengths),
            'histogram': [int(x) for x in np.histogram(assistant_lengths, bins=20)[0]],
            'bins': [float(x) for x in np.histogram(assistant_lengths, bins=20)[1]]
        },
        'ratio': float(np.mean(assistant_lengths) / np.mean(user_lengths)) if user_lengths else 0
    }

def calculate_confidence_distribution(conversations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze classification confidence scores."""
    confidences = defaultdict(list)

    for conv in conversations:
        classification = conv.get('classification')
        if not classification:
            continue

        # Collect confidence scores from different dimensions
        for dimension in ['interactionPattern', 'powerDynamics', 'emotionalTone',
                         'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
                         'topicDepth', 'turnTaking', 'humanRole', 'aiRole']:
            if dimension in classification and classification[dimension]:
                conf = classification[dimension].get('confidence', 0)
                if conf > 0:  # Only include valid confidence scores
                    confidences[dimension].append(conf)

    # Calculate statistics
    all_confidences = []
    for vals in confidences.values():
        all_confidences.extend(vals)

    return {
        'overall': {
            'mean': float(np.mean(all_confidences)) if all_confidences else 0,
            'median': float(np.median(all_confidences)) if all_confidences else 0,
            'std': float(np.std(all_confidences)) if all_confidences else 0,
            'histogram': [int(x) for x in np.histogram(all_confidences, bins=10, range=(0, 1))[0]],
            'bins': [float(x) for x in np.histogram(all_confidences, bins=10, range=(0, 1))[1]]
        },
        'by_dimension': {
            dim: {
                'mean': float(np.mean(vals)),
                'median': float(np.median(vals)),
                'std': float(np.std(vals))
            }
            for dim, vals in confidences.items()
        }
    }

def calculate_conversation_typicality(conversations: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict]]:
    """
    Find most typical and most unusual conversations.
    Typicality based on distance from median PAD values and role distributions.
    """
    # Calculate median PAD values
    all_pleasure = []
    all_arousal = []
    all_dominance = []

    for conv in conversations:
        for msg in conv.get('messages', []):
            if 'pad' in msg:
                all_pleasure.append(msg['pad'].get('pleasure', 0.5))
                all_arousal.append(msg['pad'].get('arousal', 0.5))
                all_dominance.append(msg['pad'].get('dominance', 0.5))

    median_pleasure = np.median(all_pleasure)
    median_arousal = np.median(all_arousal)
    median_dominance = np.median(all_dominance)

    # Calculate distance from median for each conversation
    scored_conversations = []

    for conv in conversations:
        messages = conv.get('messages', [])
        pad_values = [msg.get('pad') for msg in messages if 'pad' in msg]

        if not pad_values:
            continue

        # Average PAD for this conversation
        avg_pleasure = np.mean([p.get('pleasure', 0.5) for p in pad_values])
        avg_arousal = np.mean([p.get('arousal', 0.5) for p in pad_values])
        avg_dominance = np.mean([p.get('dominance', 0.5) for p in pad_values])

        # Euclidean distance from median
        distance = np.sqrt(
            (avg_pleasure - median_pleasure) ** 2 +
            (avg_arousal - median_arousal) ** 2 +
            (avg_dominance - median_dominance) ** 2
        )

        # Get roles safely
        classification = conv.get('classification', {})
        human_role_data = classification.get('humanRole', {}) if classification else {}
        ai_role_data = classification.get('aiRole', {}) if classification else {}

        human_role = get_dominant_role(human_role_data.get('distribution', {}))
        ai_role = get_dominant_role(ai_role_data.get('distribution', {}))

        scored_conversations.append({
            'id': conv.get('id'),
            'source': conv.get('source'),
            'distance': distance,
            'avg_pleasure': avg_pleasure,
            'avg_arousal': avg_arousal,
            'avg_dominance': avg_dominance,
            'message_count': len(messages),
            'human_role': human_role,
            'ai_role': ai_role,
            'first_message': messages[0].get('content', '')[:100] if messages else ''
        })

    # Sort by distance
    scored_conversations.sort(key=lambda x: x['distance'])

    # Top 20 most typical (closest to median)
    typical = scored_conversations[:20]

    # Top 20 most unusual (furthest from median)
    unusual = scored_conversations[-20:]
    unusual.reverse()  # Most unusual first

    return typical, unusual

def main():
    print("🚀 Starting Quick Wins Analysis...")
    print("=" * 60)

    # Load data
    conversations = load_all_conversations()

    if not conversations:
        print("❌ No conversations found!")
        return

    results = {
        'metadata': {
            'analysis_date': datetime.now().isoformat(),
            'total_conversations': len(conversations),
            'sources': {
                'chatbot_arena': len([c for c in conversations if c.get('source') == 'chatbot_arena']),
                'wildchat': len([c for c in conversations if c.get('source') == 'wildchat'])
            }
        }
    }

    # 1. Role Transition Matrix
    print("\n📊 1. Calculating Role Transition Matrix...")
    results['role_transitions'] = calculate_role_transitions(conversations)
    print(f"   Found {len(results['role_transitions'])} role patterns")

    # 2. Average Conversation Lifecycle
    print("\n📈 2. Calculating Average PAD Lifecycle...")
    results['pad_lifecycle'] = calculate_average_pad_lifecycle(conversations)
    print(f"   Analyzed {sum(results['pad_lifecycle']['sample_sizes'])} message positions")

    # 3. Message Length Distribution
    print("\n📏 3. Analyzing Message Length Distribution...")
    results['message_lengths'] = calculate_message_length_distribution(conversations)
    print(f"   User avg: {results['message_lengths']['user']['mean']:.0f} chars")
    print(f"   Assistant avg: {results['message_lengths']['assistant']['mean']:.0f} chars")
    print(f"   Ratio: {results['message_lengths']['ratio']:.2f}x")

    # 4. Confidence Score Distribution
    print("\n🎯 4. Analyzing Confidence Scores...")
    results['confidence'] = calculate_confidence_distribution(conversations)
    print(f"   Mean confidence: {results['confidence']['overall']['mean']:.3f}")

    # 5 & 6. Typical and Unusual Conversations
    print("\n🔍 5-6. Finding Typical and Unusual Conversations...")
    typical, unusual = calculate_conversation_typicality(conversations)
    results['typical_conversations'] = typical
    results['unusual_conversations'] = unusual
    print(f"   Most typical: {typical[0]['id']} (distance: {typical[0]['distance']:.4f})")
    print(f"   Most unusual: {unusual[0]['id']} (distance: {unusual[0]['distance']:.4f})")

    # Save results
    output_path = 'reports/quick-wins-analysis.json'
    Path('reports').mkdir(exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Analysis complete! Results saved to {output_path}")
    print("=" * 60)

    # Print summary
    print("\n📋 SUMMARY:")
    print(f"  Total Conversations: {results['metadata']['total_conversations']}")
    print(f"  Average Message Ratio (AI/User): {results['message_lengths']['ratio']:.2f}x")
    print(f"  Mean Classification Confidence: {results['confidence']['overall']['mean']:.1%}")
    print(f"  PAD Lifecycle Phases: {len(results['pad_lifecycle']['phases'])}")
    print(f"  Most Typical Conversation: {typical[0]['id']}")
    print(f"    - Role Pair: {typical[0]['human_role']} → {typical[0]['ai_role']}")
    print(f"  Most Unusual Conversation: {unusual[0]['id']}")
    print(f"    - Role Pair: {unusual[0]['human_role']} → {unusual[0]['ai_role']}")

if __name__ == '__main__':
    main()
