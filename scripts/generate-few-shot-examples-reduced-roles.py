#!/usr/bin/env python3
"""
Generate Few-Shot Examples for Reduced Role Taxonomy

Selects diverse, high-confidence examples from newly classified conversations
to use as few-shot examples for improved classification accuracy.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List

def load_classified_conversations(directory: Path) -> List[Dict]:
    """Load conversations classified with new taxonomy"""
    conversations = []
    
    json_files = [f for f in directory.glob("*.json") if f.name != "manifest.json"]
    
    for json_file in json_files:
        try:
            with open(json_file) as f:
                conv = json.load(f)
            
            cls = conv.get('classification', {})
            if not cls:
                continue
            
            metadata = cls.get('classificationMetadata', {})
            if 'reduced-roles' not in metadata.get('version', ''):
                continue
            
            conversations.append(conv)
        except:
            continue
    
    return conversations


def format_conversation_for_example(conv: Dict) -> str:
    """Format conversation messages as transcript"""
    messages = conv.get('messages', [])
    formatted = []
    
    for msg in messages:
        role = msg.get('role', 'unknown').upper()
        content = msg.get('content', '')
        formatted.append(f"{role}: {content}")
    
    return "\n".join(formatted)


def get_dominant_role(dist: Dict[str, float]) -> tuple:
    """Get dominant role and probability"""
    if not dist:
        return None, 0.0
    max_role = max(dist.items(), key=lambda x: x[1])
    return max_role[0], max_role[1]


def select_diverse_examples(conversations: List[Dict], target_count: int = 5) -> List[Dict]:
    """Select diverse examples covering different role pairs"""
    
    # Group by role pair
    role_pairs = {}
    
    for conv in conversations:
        cls = conv.get('classification', {})
        human_role = cls.get('humanRole', {})
        ai_role = cls.get('aiRole', {})
        
        h_dist = human_role.get('distribution', {})
        a_dist = ai_role.get('distribution', {})
        
        h_role, h_prob = get_dominant_role(h_dist)
        a_role, a_prob = get_dominant_role(a_dist)
        
        if h_role and a_role and h_prob >= 0.7 and a_prob >= 0.7:
            pair = f"{h_role}→{a_role}"
            if pair not in role_pairs:
                role_pairs[pair] = []
            role_pairs[pair].append({
                'conv': conv,
                'h_prob': h_prob,
                'a_prob': a_prob,
                'pair': pair
            })
    
    # Select best example from each pair
    selected = []
    
    # Priority pairs to cover
    priority_pairs = [
        'information-seeker→facilitator',
        'information-seeker→expert-system',
        'co-constructor→facilitator',
        'social-expressor→relational-peer',
        'co-constructor→relational-peer'
    ]
    
    for pair in priority_pairs:
        if pair in role_pairs:
            # Select highest confidence example
            examples = sorted(role_pairs[pair], key=lambda x: x['h_prob'] + x['a_prob'], reverse=True)
            if examples:
                selected.append(examples[0]['conv'])
    
    # Fill remaining slots with other diverse pairs
    for pair, examples in role_pairs.items():
        if pair not in priority_pairs and len(selected) < target_count:
            examples = sorted(examples, key=lambda x: x['h_prob'] + x['a_prob'], reverse=True)
            if examples:
                selected.append(examples[0]['conv'])
    
    return selected[:target_count]


def format_few_shot_example(conv: Dict, index: int) -> Dict:
    """Format a conversation as a few-shot example"""
    cls = conv.get('classification', {})
    
    # Format transcript
    transcript = format_conversation_for_example(conv)
    
    # Format classification
    example = {
        'transcript': transcript,
        'classification': {
            'interactionPattern': cls.get('interactionPattern', {}),
            'powerDynamics': cls.get('powerDynamics', {}),
            'emotionalTone': cls.get('emotionalTone', {}),
            'engagementStyle': cls.get('engagementStyle', {}),
            'knowledgeExchange': cls.get('knowledgeExchange', {}),
            'conversationPurpose': cls.get('conversationPurpose', {}),
            'topicDepth': cls.get('topicDepth', {}),
            'turnTaking': cls.get('turnTaking', {}),
            'humanRole': cls.get('humanRole', {}),
            'aiRole': cls.get('aiRole', {})
        },
        'rationale': f"Example {index}: Clear {cls.get('humanRole', {}).get('distribution', {})} → {cls.get('aiRole', {}).get('distribution', {})} pattern"
    }
    
    return example


def main():
    output_dir = Path('public/output')
    
    print("🔍 Loading classified conversations with new taxonomy...")
    conversations = load_classified_conversations(output_dir)
    
    print(f"   Found {len(conversations)} conversations with new taxonomy")
    
    if len(conversations) < 5:
        print(f"❌ Need at least 5 classified conversations, found {len(conversations)}")
        print("   Please classify more conversations first")
        sys.exit(1)
    
    print("\n📊 Selecting diverse examples...")
    selected = select_diverse_examples(conversations, target_count=5)
    
    print(f"   Selected {len(selected)} examples")
    
    # Format examples
    examples = []
    for i, conv in enumerate(selected, 1):
        example = format_few_shot_example(conv, i)
        examples.append(example)
        
        h_role = conv.get('classification', {}).get('humanRole', {}).get('distribution', {})
        a_role = conv.get('classification', {}).get('aiRole', {}).get('distribution', {})
        h_dom = max(h_role.items(), key=lambda x: x[1])[0] if h_role else 'unknown'
        a_dom = max(a_role.items(), key=lambda x: x[1])[0] if a_role else 'unknown'
        print(f"   Example {i}: {h_dom} → {a_dom}")
    
    # Save to file
    output_file = Path('classifier/few-shot-examples-reduced-roles.json')
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump({'examples': examples}, f, indent=2)
    
    print(f"\n✅ Saved {len(examples)} few-shot examples to {output_file}")
    print(f"\n📝 Usage:")
    print(f"   python3 scripts/classify-public-output-reduced-roles.py public/output \\")
    print(f"     --few-shot-examples {output_file} \\")
    print(f"     --model qwen2.5:7b")


if __name__ == "__main__":
    main()

