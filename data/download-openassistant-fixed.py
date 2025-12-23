#!/usr/bin/env python3
"""
Improved OpenAssistant downloader that properly builds conversation trees
and filters for long conversations (30+ messages).
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    from datasets import load_dataset
    DATASETS_AVAILABLE = True
except ImportError:
    DATASETS_AVAILABLE = False
    print("❌ Cannot download OpenAssistant: datasets library not installed")
    print("   Install with: pip install datasets")
    sys.exit(1)


def build_conversation_trees(dataset, min_messages: int = 30, max_conversations: Optional[int] = None):
    """
    Properly build conversation trees from OpenAssistant dataset.
    Returns only conversations with min_messages+ messages.
    """
    # Track all messages by their ID
    messages_by_id: Dict[str, Dict[str, Any]] = {}
    
    # Build parent-child relationships
    print("  Building message tree...")
    for item in dataset:
        message_id = item.get('message_id')
        parent_id = item.get('parent_id')
        text = item.get('text', '').strip()
        role = item.get('role', 'user')
        
        # Skip empty messages
        if not text or not message_id:
            continue
        
        # Map roles
        if role == 'prompter':
            role = 'user'
        elif role == 'assistant':
            role = 'assistant'
        else:
            continue  # Skip other roles
        
        messages_by_id[message_id] = {
            'id': message_id,
            'parent_id': parent_id,
            'text': text,
            'role': role,
            'children': []
        }
    
    # Build parent-child links
    for msg_id, msg in messages_by_id.items():
        if msg['parent_id'] and msg['parent_id'] in messages_by_id:
            messages_by_id[msg['parent_id']]['children'].append(msg_id)
    
    # Find root messages (no parent)
    root_messages = [msg for msg in messages_by_id.values() if not msg['parent_id']]
    print(f"  Found {len(root_messages)} root messages")
    
    def traverse_tree(msg_id: str, conversation: List[Dict]) -> List[Dict]:
        """Recursively traverse conversation tree."""
        if msg_id not in messages_by_id:
            return conversation
        
        msg = messages_by_id[msg_id]
        conversation.append({
            'role': msg['role'],
            'content': msg['text']
        })
        
        # Traverse children (in order if available)
        for child_id in msg['children']:
            conversation = traverse_tree(child_id, conversation)
        
        return conversation
    
    # Build conversations from root messages
    conversations = []
    for root_msg in root_messages:
        messages = traverse_tree(root_msg['id'], [])
        
        # Only include long conversations
        if len(messages) >= min_messages:
            conversations.append(messages)
            
            if max_conversations and len(conversations) >= max_conversations:
                break
    
    return conversations


def download_openassistant_fixed(
    output_dir: str = "conversations-raw",
    limit: Optional[int] = None,
    min_messages: int = 30
):
    """
    Download OpenAssistant conversations, properly building conversation trees
    and filtering for long conversations.
    """
    if not DATASETS_AVAILABLE:
        print("❌ Cannot download OpenAssistant: datasets library not installed")
        return []
    
    print("📥 Downloading OpenAssistant dataset...")
    print(f"   Filtering for conversations with {min_messages}+ messages")
    
    try:
        # Load dataset (may take a while)
        print("  Loading dataset (this may take a few minutes)...")
        dataset = load_dataset("OpenAssistant/oasst1", split="train")
        
        # Build conversation trees
        conversations_list = build_conversation_trees(
            dataset,
            min_messages=min_messages,
            max_conversations=limit
        )
        
        # Save conversations
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        saved_conversations = []
        for i, messages in enumerate(conversations_list):
            conv_id = f"oasst-long-{i}"
            conversation = {
                "id": conv_id,
                "source": "OpenAssistant (oasst1)",
                "messages": messages
            }
            
            file_path = output_path / f"{conv_id}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(conversation, f, indent=2, ensure_ascii=False)
            
            saved_conversations.append(conversation)
            print(f"  ✓ Saved {conv_id}: {len(messages)} messages")
        
        print(f"\n✅ Downloaded {len(saved_conversations)} OpenAssistant conversations ({min_messages}+ messages)")
        return saved_conversations
        
    except Exception as e:
        print(f"❌ Error downloading OpenAssistant: {e}")
        import traceback
        traceback.print_exc()
        return []


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Download long OpenAssistant conversations")
    parser.add_argument("--limit", type=int, help="Maximum number of conversations to download")
    parser.add_argument("--min-messages", type=int, default=30, help="Minimum messages per conversation (default: 30)")
    parser.add_argument("--output", default="conversations-raw", help="Output directory")
    
    args = parser.parse_args()
    
    conversations = download_openassistant_fixed(
        output_dir=args.output,
        limit=args.limit,
        min_messages=args.min_messages
    )
    
    print(f"\n📊 Total: {len(conversations)} conversations saved to {args.output}/")

