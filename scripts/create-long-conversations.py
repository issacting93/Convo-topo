#!/usr/bin/env python3
"""
Create longer conversations by combining or extending existing ones.

Since downloading long conversations is difficult, this script creates
longer conversations by combining multiple shorter ones or extending
existing conversations.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any
import random

def combine_conversations(
    conversations: List[Dict[str, Any]],
    target_count: int = 10,
    min_messages: int = 20
) -> List[Dict[str, Any]]:
    """
    Combine multiple short conversations into longer ones.
    """
    if not conversations:
        return []
    
    combined = []
    used_indices = set()
    
    for i in range(target_count):
        # Try to find conversations to combine
        candidates = [c for idx, c in enumerate(conversations) if idx not in used_indices]
        
        if len(candidates) < 2:
            break
        
        # Combine 2-3 conversations
        num_to_combine = random.randint(2, min(3, len(candidates)))
        selected = random.sample(candidates, num_to_combine)
        
        # Combine messages with a separator message
        all_messages = []
        for conv in selected:
            all_messages.extend(conv.get('messages', []))
            # Add a brief transition message
            all_messages.append({
                "role": "assistant",
                "content": "..."
            })
        
        # Remove the last separator
        if all_messages and all_messages[-1]['content'] == "...":
            all_messages.pop()
        
        if len(all_messages) >= min_messages:
            combined.append({
                "id": f"combined-long-{i+1:02d}",
                "source": "Combined from multiple conversations",
                "messages": all_messages
            })
            
            # Mark conversations as used
            for conv in selected:
                for idx, c in enumerate(conversations):
                    if c == conv:
                        used_indices.add(idx)
                        break
    
    return combined


def extend_conversation(
    conversation: Dict[str, Any],
    target_messages: int = 25
) -> Dict[str, Any]:
    """
    Extend a conversation by repeating/cycling through messages with variations.
    """
    messages = conversation.get('messages', [])
    if len(messages) >= target_messages:
        return conversation
    
    extended = messages.copy()
    
    # Cycle through original messages, adding slight variations
    cycle_count = 0
    while len(extended) < target_messages and cycle_count < 10:
        for msg in messages:
            if len(extended) >= target_messages:
                break
            
            # Create variation
            new_msg = {
                "role": msg['role'],
                "content": msg['content']  # Keep original for now
            }
            extended.append(new_msg)
        
        cycle_count += 1
    
    return {
        "id": conversation.get('id', 'extended'),
        "source": conversation.get('source', 'Extended conversation'),
        "messages": extended[:target_messages]
    }


def create_from_existing(
    source_dir: str = "public/output",
    output_dir: str = "public/output",
    limit: int = 10,
    min_messages: int = 20,
    strategy: str = "combine"
) -> List[Dict[str, Any]]:
    """
    Create long conversations from existing ones.
    """
    source_path = Path(source_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Load all existing conversations
    json_files = list(source_path.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    conversations = []
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                conv = json.load(f)
                if isinstance(conv, dict) and 'messages' in conv:
                    conversations.append(conv)
        except:
            continue
    
    if not conversations:
        print(f"❌ No conversations found in {source_dir}")
        return []
    
    print(f"📥 Found {len(conversations)} existing conversations")
    
    if strategy == "combine":
        long_conversations = combine_conversations(conversations, target_count=limit, min_messages=min_messages)
    elif strategy == "extend":
        # Find longest conversations and extend them
        sorted_conv = sorted(conversations, key=lambda c: len(c.get('messages', [])), reverse=True)
        long_conversations = []
        for i, conv in enumerate(sorted_conv[:limit]):
            extended = extend_conversation(conv, target_messages=min_messages)
            extended['id'] = f"extended-{i+1:02d}"
            long_conversations.append(extended)
    else:
        print(f"❌ Unknown strategy: {strategy}")
        return []
    
    # Save long conversations
    for conv in long_conversations:
        file_path = output_path / f"{conv['id']}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(conv, f, indent=2, ensure_ascii=False)
            f.write('\n')
        print(f"  ✓ Created {conv['id']}: {len(conv['messages'])} messages")
    
    if long_conversations:
        message_counts = [len(c['messages']) for c in long_conversations]
        print(f"\n✅ Created {len(long_conversations)} long conversations")
        print(f"   Min messages: {min(message_counts)}")
        print(f"   Max messages: {max(message_counts)}")
        print(f"   Average: {sum(message_counts) / len(message_counts):.1f}")
    
    return long_conversations


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create longer conversations")
    parser.add_argument("--limit", type=int, default=10, help="Number of conversations to create (default: 10)")
    parser.add_argument("--min-messages", type=int, default=20, help="Minimum messages (default: 20)")
    parser.add_argument("--source-dir", default="public/output", help="Source directory")
    parser.add_argument("--output-dir", default="public/output", help="Output directory")
    parser.add_argument("--strategy", choices=["combine", "extend"], default="combine", 
                       help="Strategy: combine (merge multiple) or extend (repeat messages)")
    
    args = parser.parse_args()
    
    conversations = create_from_existing(
        source_dir=args.source_dir,
        output_dir=args.output_dir,
        limit=args.limit,
        min_messages=args.min_messages,
        strategy=args.strategy
    )
    
    if conversations:
        print(f"\n📋 Next steps:")
        print(f"   1. Classify conversations:")
        print(f"      python3 scripts/generate-pad-with-llm-direct.py --all --classify --force")
        print(f"   2. Generate PAD values:")
        print(f"      python3 scripts/generate-pad-with-llm-direct.py --all --force")
        print(f"   3. Update manifest:")
        print(f"      node scripts/generate-manifest.js")


if __name__ == "__main__":
    main()

