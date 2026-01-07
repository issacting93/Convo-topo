#!/usr/bin/env python3
"""
Download more high-quality conversations from multiple sources.
Focuses on getting conversations with 10+ messages.
"""

import json
from pathlib import Path
from datasets import load_dataset

def download_chatbot_arena_more(start_idx=2000, limit=2000, output_dir="conversations-raw"):
    """Download more Chatbot Arena conversations, skipping ones we already have."""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print(f"📥 Downloading Chatbot Arena conversations (starting from index {start_idx})...")
    dataset = load_dataset("lmsys/chatbot_arena_conversations", split="train")
    
    conversations = []
    count = 0
    skipped = 0
    
    print(f"Processing conversations (limit: {limit}, starting from {start_idx})...")
    for idx, item in enumerate(dataset):
        if idx < start_idx:
            continue
        if count >= limit:
            break
        
        messages = []
        
        # Chatbot Arena format
        conv = None
        if 'conversation_a' in item and item['conversation_a']:
            conv = item['conversation_a']
        elif 'conversation_b' in item and item['conversation_b']:
            conv = item['conversation_b']
        
        if conv and isinstance(conv, list):
            for turn in conv:
                if isinstance(turn, dict):
                    role = turn.get('role', '')
                    content = turn.get('content', '') or turn.get('text', '') or str(turn.get('value', ''))
                    
                    if role in ['user', 'human', 'prompter']:
                        messages.append({"role": "user", "content": content})
                    elif role in ['assistant', 'model', 'gpt', 'assistant-model']:
                        messages.append({"role": "assistant", "content": content})
        
        # Only save if 6+ messages (will filter later for 10+)
        if len(messages) >= 6:
            conv_id = f"chatbot_arena_{idx:05d}"
            
            # Check if file already exists
            if (output_path / f"{conv_id}.json").exists():
                skipped += 1
                continue
            
            conversation = {
                "id": conv_id,
                "messages": messages
            }
            conversations.append(conversation)
            
            # Save individual file
            with open(output_path / f"{conv_id}.json", 'w', encoding='utf-8') as f:
                json.dump(conversation, f, indent=2, ensure_ascii=False)
            
            count += 1
            if count % 100 == 0:
                print(f"  ✅ Processed {count} conversations... (skipped {skipped} existing)")
    
    print(f"✅ Downloaded {len(conversations)} new Chatbot Arena conversations")
    print(f"   Skipped {skipped} already existing")
    return conversations

def download_openassistant_improved(limit=500, output_dir="conversations-raw"):
    """Download OpenAssistant conversations with better tree flattening."""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print("📥 Downloading OpenAssistant dataset (improved processing)...")
    try:
        dataset = load_dataset("OpenAssistant/oasst1", split="train")
        
        # Build conversation trees properly
        conversations_by_id = {}
        root_messages = {}
        
        # First pass: collect all messages and build tree structure
        for item in dataset:
            msg_id = item.get('message_id')
            parent_id = item.get('parent_id')
            text = item.get('text', '').strip()
            role = item.get('role', 'prompter')
            lang = item.get('lang', 'en')
            
            # Only process English for now
            if lang != 'en' and lang != 'English':
                continue
            
            if not text or len(text) < 10:
                continue
            
            # Map roles
            mapped_role = 'user' if role == 'prompter' else 'assistant'
            
            message = {
                'message_id': msg_id,
                'parent_id': parent_id,
                'role': mapped_role,
                'content': text
            }
            
            if parent_id is None:
                # Root message - start new conversation
                conv_id = f"oasst-{msg_id}"
                root_messages[msg_id] = conv_id
                conversations_by_id[conv_id] = {
                    'id': conv_id,
                    'messages': [{'role': mapped_role, 'content': text}],
                    'message_map': {msg_id: 0}  # Track message positions
                }
            else:
                # Find parent conversation
                for conv_id, conv in conversations_by_id.items():
                    if parent_id in conv.get('message_map', {}):
                        conv['messages'].append({'role': mapped_role, 'content': text})
                        conv['message_map'][msg_id] = len(conv['messages']) - 1
                        break
        
        # Filter for long conversations and save
        saved = 0
        for conv_id, conv in list(conversations_by_id.items()):
            if len(conv['messages']) >= 10:  # Only save 10+ message conversations
                # Clean up internal structure
                del conv['message_map']
                
                conv_id_file = f"{conv_id}_{saved:04d}"
                conv['id'] = conv_id_file
                
                output_file = output_path / f"{conv_id_file}.json"
                if output_file.exists():
                    continue
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(conv, f, indent=2, ensure_ascii=False)
                
                saved += 1
                if saved >= limit:
                    break
                
                if saved % 10 == 0:
                    print(f"  ✅ Saved {saved} long conversations...")
        
        print(f"✅ Downloaded {saved} OpenAssistant conversations (10+ messages)")
        return saved
        
    except Exception as e:
        print(f"❌ Error downloading OpenAssistant: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == "__main__":
    import sys
    
    print("🚀 Downloading more high-quality conversations...\n")
    
    # Download more Chatbot Arena
    chatbot_convos = download_chatbot_arena_more(start_idx=2000, limit=2000)
    
    print()
    
    # Try OpenAssistant (may have longer conversations)
    oasst_count = download_openassistant_improved(limit=100)
    
    print()
    print(f"📊 Summary:")
    print(f"   New Chatbot Arena: {len(chatbot_convos)} conversations")
    print(f"   OpenAssistant: {oasst_count} conversations")
    print()
    print("Next step: Run filter script to select 10+ message conversations")

