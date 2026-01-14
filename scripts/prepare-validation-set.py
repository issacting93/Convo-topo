#!/usr/bin/env python3
"""
Prepare Validation Set for Role Taxonomy Redesign

Selects representative conversations for human annotation to create few-shot examples.

Usage:
    python scripts/prepare-validation-set.py public/output/manifest.json validation-set.json
    python scripts/prepare-validation-set.py public/output/manifest.json validation-set.json --size 30
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from collections import Counter, defaultdict

def load_conversation(file_path: Path) -> Dict:
    """Load a single conversation file"""
    with open(file_path) as f:
        return json.load(f)

def get_dominant_roles(conversation: Dict) -> tuple:
    """Get dominant human and AI roles"""
    classification = conversation.get('classification', {})
    
    human_role = None
    human_dist = classification.get('humanRole', {}).get('distribution', {})
    if human_dist:
        human_role = max(human_dist.items(), key=lambda x: x[1])[0]
    
    ai_role = None
    ai_dist = classification.get('aiRole', {}).get('distribution', {})
    if ai_dist:
        ai_role = max(ai_dist.items(), key=lambda x: x[1])[0]
    
    return (human_role, ai_role)

def get_pattern(conversation: Dict) -> str:
    """Get interaction pattern"""
    classification = conversation.get('classification', {})
    return classification.get('interactionPattern', {}).get('category', 'unknown')

def get_purpose(conversation: Dict) -> str:
    """Get conversation purpose"""
    classification = conversation.get('classification', {})
    return classification.get('conversationPurpose', {}).get('category', 'unknown')

def get_message_count(conversation: Dict) -> int:
    """Get number of messages"""
    return len(conversation.get('messages', []))

def categorize_by_length(messages: int) -> str:
    """Categorize conversation by length"""
    if messages < 10:
        return 'short'
    elif messages < 20:
        return 'medium'
    else:
        return 'long'

def select_validation_set(conversations: List[Dict], target_size: int = 30) -> List[Dict]:
    """
    Select diverse set of conversations for validation
    
    Strategy:
    1. Ensure coverage of all interaction patterns
    2. Include both seeker→expert and non-seeker→expert
    3. Mix of conversation lengths
    4. Include edge cases (breakdowns, role inversions)
    """
    selected = []
    used_ids = set()
    
    # Categorize conversations
    by_pattern = defaultdict(list)
    by_role_pair = defaultdict(list)
    by_length = defaultdict(list)
    seeker_expert = []
    non_seeker_expert = []
    
    for conv in conversations:
        conv_id = conv.get('id', '')
        if conv_id in used_ids:
            continue
            
        pattern = get_pattern(conv)
        human_role, ai_role = get_dominant_roles(conv)
        role_pair = f"{human_role}→{ai_role}" if human_role and ai_role else "unknown"
        length = categorize_by_length(get_message_count(conv))
        
        by_pattern[pattern].append(conv)
        by_role_pair[role_pair].append(conv)
        by_length[length].append(conv)
        
        if role_pair == "seeker→expert":
            seeker_expert.append(conv)
        else:
            non_seeker_expert.append(conv)
    
    # Selection strategy
    print(f"Total conversations: {len(conversations)}")
    print(f"Seeker→Expert: {len(seeker_expert)} ({len(seeker_expert)/len(conversations)*100:.1f}%)")
    print(f"Non-Seeker→Expert: {len(non_seeker_expert)} ({len(non_seeker_expert)/len(conversations)*100:.1f}%)")
    print(f"\nPatterns: {dict(Counter(get_pattern(c) for c in conversations))}")
    print(f"\nRole pairs: {dict(Counter(get_dominant_roles(c) for c in conversations if get_dominant_roles(c)[0]))}")
    
    # 1. Select from each pattern (at least 2-3 per pattern)
    patterns_to_cover = ['question-answer', 'advisory', 'collaborative', 'storytelling', 'casual-chat']
    for pattern in patterns_to_cover:
        if pattern in by_pattern and len(by_pattern[pattern]) > 0:
            # Prefer non-seeker→expert if available
            candidates = [c for c in by_pattern[pattern] if get_dominant_roles(c) != ('seeker', 'expert')]
            if not candidates:
                candidates = by_pattern[pattern]
            
            # Select 2-3 diverse examples
            selected_count = min(3, len(candidates), target_size - len(selected))
            for conv in candidates[:selected_count]:
                if conv.get('id') not in used_ids:
                    selected.append(conv)
                    used_ids.add(conv.get('id'))
                    print(f"Selected: {conv.get('id')} - {pattern} - {get_dominant_roles(conv)}")
    
    # 2. Select diverse seeker→expert examples (different trajectories)
    # Look for seeker→expert with different patterns, lengths, purposes
    seeker_expert_diverse = []
    seen_combinations = set()
    
    for conv in seeker_expert:
        if conv.get('id') in used_ids:
            continue
        pattern = get_pattern(conv)
        purpose = get_purpose(conv)
        length = categorize_by_length(get_message_count(conv))
        combo = (pattern, purpose, length)
        
        if combo not in seen_combinations:
            seeker_expert_diverse.append(conv)
            seen_combinations.add(combo)
    
    # Select 5-8 diverse seeker→expert examples
    seeker_expert_count = min(8, len(seeker_expert_diverse), target_size - len(selected))
    for conv in seeker_expert_diverse[:seeker_expert_count]:
        if conv.get('id') not in used_ids:
            selected.append(conv)
            used_ids.add(conv.get('id'))
            print(f"Selected: {conv.get('id')} - seeker→expert - {get_pattern(conv)}/{get_purpose(conv)}")
    
    # 3. Select non-seeker→expert examples (at least 5-10)
    non_seeker_expert_count = min(10, len(non_seeker_expert), target_size - len(selected))
    for conv in non_seeker_expert[:non_seeker_expert_count]:
        if conv.get('id') not in used_ids:
            selected.append(conv)
            used_ids.add(conv.get('id'))
            print(f"Selected: {conv.get('id')} - {get_dominant_roles(conv)} - {get_pattern(conv)}")
    
    # 4. Fill remaining slots with edge cases (breakdowns, role inversions)
    # Look for high emotional intensity, unable-to-engage, etc.
    edge_cases = []
    for conv in conversations:
        if conv.get('id') in used_ids:
            continue
        
        # Check for breakdown indicators
        ai_role, _ = get_dominant_roles(conv)
        if ai_role == 'unable-to-engage':
            edge_cases.append(conv)
        
        # Check for high emotional intensity
        messages = conv.get('messages', [])
        pad_scores = [m.get('pad', {}) for m in messages if m.get('pad')]
        if pad_scores:
            avg_intensity = sum(p.get('emotionalIntensity', 0) for p in pad_scores) / len(pad_scores)
            if avg_intensity > 0.7:
                edge_cases.append(conv)
    
    edge_case_count = min(5, len(edge_cases), target_size - len(selected))
    for conv in edge_cases[:edge_case_count]:
        if conv.get('id') not in used_ids:
            selected.append(conv)
            used_ids.add(conv.get('id'))
            print(f"Selected: {conv.get('id')} - EDGE CASE")
    
    return selected

def format_for_annotation(conversation: Dict) -> Dict:
    """Format conversation for annotation tool"""
    return {
        'id': conversation.get('id'),
        'source': conversation.get('source'),
        'messages': conversation.get('messages', []),
        'existingClassification': {
            'interactionPattern': conversation.get('classification', {}).get('interactionPattern', {}),
            'powerDynamics': conversation.get('classification', {}).get('powerDynamics', {}),
            'emotionalTone': conversation.get('classification', {}).get('emotionalTone', {}),
            'engagementStyle': conversation.get('classification', {}).get('engagementStyle', {}),
            'knowledgeExchange': conversation.get('classification', {}).get('knowledgeExchange', {}),
            'conversationPurpose': conversation.get('classification', {}).get('conversationPurpose', {}),
            'topicDepth': conversation.get('classification', {}).get('topicDepth', {}),
            'turnTaking': conversation.get('classification', {}).get('turnTaking', {}),
        },
        'currentRoles': {
            'humanRole': conversation.get('classification', {}).get('humanRole', {}),
            'aiRole': conversation.get('classification', {}).get('aiRole', {}),
        },
        'metadata': {
            'messageCount': len(conversation.get('messages', [])),
            'avgEmotionalIntensity': calculate_avg_intensity(conversation),
        }
    }

def calculate_avg_intensity(conversation: Dict) -> float:
    """Calculate average emotional intensity"""
    messages = conversation.get('messages', [])
    pad_scores = [m.get('pad', {}) for m in messages if m.get('pad')]
    if not pad_scores:
        return 0.0
    return sum(p.get('emotionalIntensity', 0) for p in pad_scores) / len(pad_scores)

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    manifest_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    
    target_size = 30
    if '--size' in sys.argv:
        idx = sys.argv.index('--size')
        target_size = int(sys.argv[idx + 1])
    
    # Load manifest
    print(f"Loading manifest from {manifest_path}...")
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    conversations = []
    output_dir = manifest_path.parent / 'output'
    
    # Load all conversations
    for conv_id in manifest.get('conversations', []):
        conv_file = output_dir / f"{conv_id}.json"
        if conv_file.exists():
            try:
                conv = load_conversation(conv_file)
                conversations.append(conv)
            except Exception as e:
                print(f"Error loading {conv_id}: {e}")
    
    print(f"\nLoaded {len(conversations)} conversations")
    
    # Select validation set
    print(f"\nSelecting {target_size} conversations for validation...")
    selected = select_validation_set(conversations, target_size)
    
    # Format for annotation
    formatted = [format_for_annotation(conv) for conv in selected]
    
    # Save
    print(f"\nSaving {len(formatted)} conversations to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump({
            'metadata': {
                'totalSelected': len(formatted),
                'targetSize': target_size,
                'selectionDate': str(Path.cwd()),
            },
            'conversations': formatted
        }, f, indent=2)
    
    # Print summary
    print(f"\n✅ Validation set created:")
    print(f"   - Total: {len(formatted)} conversations")
    print(f"   - Patterns: {dict(Counter(get_pattern(c) for c in selected))}")
    print(f"   - Role pairs: {dict(Counter(get_dominant_roles(c) for c in selected if get_dominant_roles(c)[0]))}")
    print(f"   - Lengths: {dict(Counter(categorize_by_length(get_message_count(c)) for c in selected))}")

if __name__ == "__main__":
    main()

