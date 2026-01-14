#!/usr/bin/env python3
"""
Generate Few-Shot Examples for Role Classification

Selects high-confidence, diverse examples from existing classifications to use as few-shot examples.

Usage:
    python scripts/generate-few-shot-examples.py public/output/manifest.json few-shot-examples.json
    python scripts/generate-few-shot-examples.py public/output/manifest.json few-shot-examples.json --count 8
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
        human_confidence = classification.get('humanRole', {}).get('confidence', 0)
    
    ai_role = None
    ai_dist = classification.get('aiRole', {}).get('distribution', {})
    if ai_dist:
        ai_role = max(ai_dist.items(), key=lambda x: x[1])[0]
        ai_confidence = classification.get('aiRole', {}).get('confidence', 0)
    
    return (human_role, ai_role, human_confidence, ai_confidence)

def get_pattern(conversation: Dict) -> str:
    """Get interaction pattern"""
    classification = conversation.get('classification', {})
    return classification.get('interactionPattern', {}).get('category', 'unknown')

def format_conversation_for_example(conversation: Dict, max_messages: int = 10) -> str:
    """Format conversation transcript for few-shot example"""
    messages = conversation.get('messages', [])[:max_messages]
    lines = []
    for i, m in enumerate(messages, 1):
        role = "HUMAN" if m.get('role') == 'user' else "AI"
        content = m.get('content', '')[:200]  # Truncate long messages
        if len(m.get('content', '')) > 200:
            content += "..."
        lines.append(f"[{i}] {role}: {content}")
    return "\n".join(lines)

def format_classification_for_example(conversation: Dict) -> Dict:
    """Format classification for few-shot example"""
    classification = conversation.get('classification', {})
    
    # Get dimensions 1-8
    dims_1_8 = {}
    for dim in ['interactionPattern', 'powerDynamics', 'emotionalTone', 
                'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
                'topicDepth', 'turnTaking']:
        if dim in classification:
            dims_1_8[dim] = {
                'category': classification[dim].get('category'),
                'confidence': classification[dim].get('confidence', 0),
                'evidence': classification[dim].get('evidence', [])[:2]  # Top 2 evidence quotes
            }
    
    # Get roles (9-10)
    human_role = classification.get('humanRole', {})
    ai_role = classification.get('aiRole', {})
    
    return {
        'dimensions1to8': dims_1_8,
        'humanRole': {
            'distribution': human_role.get('distribution', {}),
            'confidence': human_role.get('confidence', 0),
            'evidence': human_role.get('evidence', [])[:3]  # Top 3 role evidence
        },
        'aiRole': {
            'distribution': ai_role.get('distribution', {}),
            'confidence': ai_role.get('confidence', 0),
            'evidence': ai_role.get('evidence', [])[:3]
        }
    }

def create_few_shot_example(conversation: Dict) -> Dict:
    """Create a formatted few-shot example"""
    classification = conversation.get('classification', {})
    
    # Format conversation (truncate if too long)
    messages = conversation.get('messages', [])
    transcript = format_conversation_for_example(conversation, max_messages=min(12, len(messages)))
    
    # Format classification
    classification_formatted = format_classification_for_example(conversation)
    
    return {
        'conversationId': conversation.get('id'),
        'transcript': transcript,
        'messageCount': len(messages),
        'classification': classification_formatted,
        'rationale': f"Pattern: {get_pattern(conversation)}, Roles: {get_dominant_roles(conversation)[0]}→{get_dominant_roles(conversation)[1]}"
    }

def select_few_shot_examples(conversations: List[Dict], target_count: int = 8) -> List[Dict]:
    """
    Select diverse, high-confidence examples for few-shot learning
    
    Strategy:
    1. Filter for high confidence (role confidence > 0.7)
    2. Ensure diversity: different patterns, different role pairs
    3. Prefer clear, unambiguous examples
    4. Include both common and rare patterns
    """
    # Filter for high confidence
    high_confidence = []
    for conv in conversations:
        human_role, ai_role, human_conf, ai_conf = get_dominant_roles(conv)
        if human_role and ai_role and human_conf > 0.7 and ai_conf > 0.7:
            high_confidence.append(conv)
    
    print(f"High-confidence conversations: {len(high_confidence)}/{len(conversations)}")
    
    # Categorize by role pair and pattern
    by_role_pair = defaultdict(list)
    by_pattern = defaultdict(list)
    
    for conv in high_confidence:
        human_role, ai_role, _, _ = get_dominant_roles(conv)
        role_pair = f"{human_role}→{ai_role}"
        pattern = get_pattern(conv)
        
        by_role_pair[role_pair].append(conv)
        by_pattern[pattern].append(conv)
    
    selected = []
    used_ids = set()
    
    # Priority 1: Diverse role pairs (at least one of each common pair)
    role_pairs_priority = [
        'seeker→expert',
        'director→expert',
        'collaborator→facilitator',
        'collaborator→expert',
        'sharer→reflector',
        'director→peer',
        'tester→expert',
        'seeker→unable-to-engage'  # Edge case
    ]
    
    for role_pair in role_pairs_priority:
        if role_pair in by_role_pair and len(selected) < target_count:
            # Select highest confidence example
            candidates = sorted(by_role_pair[role_pair], 
                              key=lambda c: get_dominant_roles(c)[2] + get_dominant_roles(c)[3],
                              reverse=True)
            for conv in candidates:
                if conv.get('id') not in used_ids:
                    selected.append(conv)
                    used_ids.add(conv.get('id'))
                    print(f"Selected: {conv.get('id')} - {role_pair} (conf: {get_dominant_roles(conv)[2]:.2f}/{get_dominant_roles(conv)[3]:.2f})")
                    break
    
    # Priority 2: Diverse patterns (if we need more)
    patterns_priority = ['question-answer', 'advisory', 'collaborative', 'storytelling', 'casual-chat']
    for pattern in patterns_priority:
        if len(selected) >= target_count:
            break
        if pattern in by_pattern:
            candidates = [c for c in by_pattern[pattern] if c.get('id') not in used_ids]
            if candidates:
                # Select highest confidence
                best = max(candidates, key=lambda c: get_dominant_roles(c)[2] + get_dominant_roles(c)[3])
                selected.append(best)
                used_ids.add(best.get('id'))
                print(f"Selected: {best.get('id')} - {pattern} (conf: {get_dominant_roles(best)[2]:.2f}/{get_dominant_roles(best)[3]:.2f})")
    
    # Priority 3: Fill remaining with highest confidence overall
    remaining = [c for c in high_confidence if c.get('id') not in used_ids]
    remaining.sort(key=lambda c: get_dominant_roles(c)[2] + get_dominant_roles(c)[3], reverse=True)
    
    for conv in remaining[:target_count - len(selected)]:
        selected.append(conv)
        used_ids.add(conv.get('id'))
        human_role, ai_role, h_conf, a_conf = get_dominant_roles(conv)
        print(f"Selected: {conv.get('id')} - {human_role}→{ai_role} (conf: {h_conf:.2f}/{a_conf:.2f})")
    
    return selected

def format_few_shot_for_prompt(examples: List[Dict]) -> str:
    """Format few-shot examples for inclusion in prompt"""
    formatted_examples = []
    
    for i, example in enumerate(examples, 1):
        conv_id = example['conversationId']
        transcript = example['transcript']
        classification = example['classification']
        
        # Format dimensions 1-8
        dims_text = []
        for dim_name, dim_data in classification['dimensions1to8'].items():
            dims_text.append(f"  {dim_name}: {dim_data['category']} (confidence: {dim_data['confidence']:.2f})")
        
        # Format roles
        human_dist = classification['humanRole']['distribution']
        ai_dist = classification['aiRole']['distribution']
        
        human_top = max(human_dist.items(), key=lambda x: x[1]) if human_dist else None
        ai_top = max(ai_dist.items(), key=lambda x: x[1]) if ai_dist else None
        
        example_text = f"""Example {i}:
Conversation ID: {conv_id}

Transcript:
{transcript}

Dimensions 1-8:
{chr(10).join(dims_text)}

Human Role Distribution:
{json.dumps(human_dist, indent=2)}

AI Role Distribution:
{json.dumps(ai_dist, indent=2)}

Evidence:
Human: {classification['humanRole'].get('evidence', [])[:2]}
AI: {classification['aiRole'].get('evidence', [])[:2]}

Rationale: {example['rationale']}
"""
        formatted_examples.append(example_text)
    
    return "\n---\n\n".join(formatted_examples)

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    manifest_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    
    count = 8
    if '--count' in sys.argv:
        idx = sys.argv.index('--count')
        count = int(sys.argv[idx + 1])
    
    # Load conversations from directory
    print(f"Loading conversations from {manifest_path.parent}...")
    conversations = []
    output_dir = manifest_path.parent
    
    # Load all JSON files in the directory (skip manifest.json)
    for conv_file in output_dir.glob("*.json"):
        if conv_file.name == "manifest.json":
            continue
        try:
            conv = load_conversation(conv_file)
            if conv.get('classification'):  # Only classified conversations
                conversations.append(conv)
        except Exception as e:
            print(f"Error loading {conv_file.name}: {e}")
    
    print(f"\nLoaded {len(conversations)} classified conversations")
    
    # Select few-shot examples
    print(f"\nSelecting {count} diverse, high-confidence examples...")
    selected = select_few_shot_examples(conversations, count)
    
    # Format examples
    formatted = [create_few_shot_example(conv) for conv in selected]
    
    # Format for prompt
    prompt_format = format_few_shot_for_prompt(formatted)
    
    # Save both formats
    output_data = {
        'metadata': {
            'totalExamples': len(formatted),
            'targetCount': count,
            'selectionCriteria': 'high-confidence, diverse role pairs and patterns'
        },
        'examples': formatted,
        'promptFormat': prompt_format
    }
    
    print(f"\nSaving to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    # Also save prompt-ready format
    prompt_path = output_path.parent / f"{output_path.stem}-prompt.txt"
    with open(prompt_path, 'w') as f:
        f.write(prompt_format)
    
    print(f"\n✅ Few-shot examples created:")
    print(f"   - Total: {len(formatted)} examples")
    print(f"   - JSON: {output_path}")
    print(f"   - Prompt format: {prompt_path}")
    print(f"\nRole pairs selected:")
    for ex in formatted:
        conv_id = ex['conversationId']
        # Extract role pair from rationale
        roles = ex['rationale'].split('Roles: ')[1] if 'Roles: ' in ex['rationale'] else 'unknown'
        print(f"   - {conv_id}: {roles}")

if __name__ == "__main__":
    main()

