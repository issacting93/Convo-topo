#!/usr/bin/env python3
"""Download Chatbot Arena conversations from HuggingFace"""

from datasets import load_dataset
import json
from pathlib import Path

output_dir = Path("conversations-raw")
output_dir.mkdir(exist_ok=True)

print("📥 Loading Chatbot Arena dataset...")
try:
    dataset = load_dataset("lmsys/chatbot_arena_conversations", split="train")
    
    conversations = []
    count = 0
    limit = 2000  # Download more to get better high-quality selection
    
    print(f"Processing conversations (limit: {limit})...")
    for item in dataset:
        if count >= limit:
            break
        
        messages = []
        
        # Chatbot Arena format: has conversation_a and conversation_b (comparison)
        # We'll use conversation_a (or conversation_b if a is empty)
        conv = None
        if 'conversation_a' in item and item['conversation_a']:
            conv = item['conversation_a']
        elif 'conversation_b' in item and item['conversation_b']:
            conv = item['conversation_b']
        elif 'conversation' in item:
            conv = item['conversation']
        
        if conv and isinstance(conv, list):
            for turn in conv:
                if isinstance(turn, dict):
                    role = turn.get('role', '')
                    content = turn.get('content', '') or turn.get('text', '') or str(turn.get('value', ''))
                    
                    # Map roles
                    if role in ['user', 'human', 'prompter']:
                        messages.append({"role": "user", "content": content})
                    elif role in ['assistant', 'model', 'gpt', 'assistant-model']:
                        messages.append({"role": "assistant", "content": content})
                elif isinstance(turn, str):
                    # Simple string format - alternate user/assistant
                    messages.append({
                        "role": "user" if len(messages) % 2 == 0 else "assistant",
                        "content": turn
                    })
        
        # Filter: need at least 4 messages (2 exchanges)
        if len(messages) >= 4:
            conv_id = f"chatbot_arena_{count:04d}"
            conversation = {
                "id": conv_id,
                "messages": messages
            }
            conversations.append(conversation)
            
            # Save individual file
            with open(output_dir / f"{conv_id}.json", 'w', encoding='utf-8') as f:
                json.dump(conversation, f, indent=2, ensure_ascii=False)
            
            count += 1
            if count % 50 == 0:
                print(f"  ✅ Processed {count} conversations...")
    
    print(f"\n✅ Downloaded {len(conversations)} Chatbot Arena conversations")
    print(f"   Saved to: {output_dir}/")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

