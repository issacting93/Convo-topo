#!/usr/bin/env python3
"""
Download conversations from Chatbot Arena (LMSYS) dataset on HuggingFace.

Dataset: lmsys/chatbot_arena_conversations
Source: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations

Install dependencies:
    pip install datasets

Note: This dataset requires login and accepting terms on HuggingFace.
You may need to authenticate: huggingface-cli login
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from datasets import load_dataset
    DATASETS_AVAILABLE = True
except ImportError:
    DATASETS_AVAILABLE = False
    print("❌ datasets library not installed. Install with: pip install datasets")
    sys.exit(1)


def download_chatbot_arena(
    output_dir: str = "conversations-raw",
    limit: Optional[int] = None,
    start_from: int = 0,
    min_messages: int = 2
) -> List[Dict[str, Any]]:
    """
    Download conversations from Chatbot Arena dataset.
    
    Args:
        output_dir: Directory to save conversations
        limit: Maximum number of conversations to download (None for all)
        start_from: Start from this index (useful for resuming)
        min_messages: Minimum number of messages per conversation
    
    Returns:
        List of conversation dictionaries
    """
    print("📥 Downloading Chatbot Arena conversations...")
    print("   Dataset: lmsys/chatbot_arena_conversations")
    print("   Source: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations")
    print("")
    print("   Note: This dataset requires HuggingFace login and accepting terms.")
    print("   Run: huggingface-cli login")
    print("")
    
    try:
        # Load dataset
        print("  Loading dataset (this may take a few minutes)...")
        print("  Note: If this fails, you may need to:")
        print("    1. Login: huggingface-cli login")
        print("    2. Accept terms on HuggingFace website")
        
        dataset = load_dataset("lmsys/chatbot_arena_conversations", split="train")
        
        conversations = []
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Check existing files to avoid duplicates and find max number
        existing_ids = set()
        max_num = 0
        for check_dir in [output_path, Path("output"), Path("public/output")]:
            if check_dir.exists():
                for file in check_dir.glob("chatbot_arena_*.json"):
                    try:
                        with open(file, 'r') as f:
                            data = json.load(f)
                            existing_ids.add(data.get('id', ''))
                            # Extract number from ID
                            match = re.search(r'chatbot_arena_(\d+)', data.get('id', ''))
                            if match:
                                max_num = max(max_num, int(match.group(1)))
                    except:
                        pass
        
        count = 0
        skipped = 0
        
        print(f"\n  Processing dataset (starting from index {start_from})...")
        
        for idx, item in enumerate(dataset):
            if idx < start_from:
                continue
                
            if limit and count >= limit:
                break
            
            # Chatbot Arena format: conversations are in 'conversation_a' and 'conversation_b' fields
            # Each item has: question_id, model_a, model_b, conversation_a, conversation_b, winner, etc.
            # conversation_a and conversation_b are the same user prompt but different model responses
            # We'll use conversation_a (they should be similar length)
            conversation_data = item.get('conversation_a', [])
            
            # If conversation_a is empty, try conversation_b
            if not conversation_data:
                conversation_data = item.get('conversation_b', [])
            
            if not conversation_data:
                skipped += 1
                continue
            
            # Filter by minimum messages BEFORE processing
            if len(conversation_data) < min_messages:
                skipped += 1
                continue
            
            # Convert to our format
            messages = []
            for msg in conversation_data:
                if not isinstance(msg, dict):
                    continue
                    
                role = msg.get('role', '').lower()
                content = msg.get('content', '').strip()
                
                if not content:
                    continue
                
                # Map roles to our format
                if role == 'user' or role == 'human':
                    messages.append({"role": "user", "content": content})
                elif role == 'assistant' or role == 'model':
                    messages.append({"role": "assistant", "content": content})
            
            # Double-check we have enough messages after filtering
            if len(messages) < min_messages:
                skipped += 1
                continue
            
            # Create conversation ID (incrementing from max_num)
            next_num = max_num + 1 + count
            conv_id = f"chatbot_arena_{next_num:02d}"
            
            # Skip if already exists
            if conv_id in existing_ids:
                skipped += 1
                continue
            
            conversation = {
                "id": conv_id,
                "source": "Chatbot Arena (lmsys/chatbot_arena_conversations)",
                "messages": messages
            }
            
            # Add metadata if available
            if 'model_a' in item:
                conversation['model_a'] = item['model_a']
            if 'model_b' in item:
                conversation['model_b'] = item['model_b']
            if 'winner' in item:
                conversation['winner'] = item['winner']
            
            conversations.append(conversation)
            
            # Save individual file
            file_path = output_path / f"{conv_id}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(conversation, f, indent=2, ensure_ascii=False)
            
            count += 1
            if count % 10 == 0:
                print(f"  Processed {count} conversations... (skipped {skipped})")
        
        print(f"\n✅ Downloaded {len(conversations)} Chatbot Arena conversations")
        print(f"   Skipped {skipped} (duplicates or too short)")
        print(f"   Saved to: {output_path}/")
        
        return conversations
        
    except Exception as e:
        print(f"❌ Error downloading Chatbot Arena: {e}")
        print("\nTroubleshooting:")
        print("  1. Make sure you're logged in: huggingface-cli login")
        print("  2. Accept terms on: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations")
        print("  3. Check your internet connection")
        import traceback
        traceback.print_exc()
        return []


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download Chatbot Arena conversations")
    parser.add_argument("--limit", type=int, help="Maximum number of conversations to download")
    parser.add_argument("--output", default="conversations-raw", help="Output directory")
    parser.add_argument("--start-from", type=int, default=0, help="Start from this index")
    parser.add_argument("--min-messages", type=int, default=2, help="Minimum messages per conversation")
    
    args = parser.parse_args()
    
    conversations = download_chatbot_arena(
        output_dir=args.output,
        limit=args.limit,
        start_from=args.start_from,
        min_messages=args.min_messages
    )
    
    if conversations:
        print(f"\n📋 Next steps:")
        print(f"   1. Copy to output: cp {args.output}/chatbot_arena_*.json output/")
        print(f"   2. Classify: python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify")
        print(f"   3. Generate PAD: python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena")
        print(f"   4. Update manifest: node scripts/generate-manifest.js")
