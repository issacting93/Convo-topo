#!/bin/bash
# Download Chatbot Arena conversations from HuggingFace

echo "📥 Downloading Chatbot Arena conversations..."

# Install datasets if needed
python3 -m pip install datasets --quiet

# Download script
python3 << 'EOF'
from datasets import load_dataset
import json
from pathlib import Path

output_dir = Path("conversations-raw")
output_dir.mkdir(exist_ok=True)

print("Loading Chatbot Arena dataset...")
dataset = load_dataset("lmsys/chatbot_arena_conversations", split="train")

conversations = []
count = 0
limit = 500

print(f"Processing conversations (limit: {limit})...")
for item in dataset:
    if count >= limit:
        break
    
    # Extract conversation
    messages = []
    
    # Chatbot Arena format: conversations are typically in 'conversation' field
    if 'conversation' in item:
        conv = item['conversation']
        for turn in conv:
            role = turn.get('role', '')
            content = turn.get('content', '')
            if role == 'user' or role == 'human':
                messages.append({"role": "user", "content": content})
            elif role == 'assistant' or role == 'model':
                messages.append({"role": "assistant", "content": content})
    
    # Alternative format: direct messages
    elif 'messages' in item:
        for msg in item['messages']:
            role = msg.get('role', '')
            content = msg.get('content', '')
            if role == 'user' or role == 'human':
                messages.append({"role": "user", "content": content})
            elif role == 'assistant' or role == 'model':
                messages.append({"role": "assistant", "content": content})
    
    if len(messages) >= 4:  # At least 2 exchanges
        conv_id = f"chatbot_arena_{count}"
        conversation = {
            "id": conv_id,
            "messages": messages
        }
        conversations.append(conversation)
        
        # Save individual file
        with open(output_dir / f"{conv_id}.json", 'w') as f:
            json.dump(conversation, f, indent=2, ensure_ascii=False)
        
        count += 1
        if count % 50 == 0:
            print(f"  Processed {count} conversations...")

print(f"✅ Downloaded {len(conversations)} Chatbot Arena conversations")
print(f"   Saved to: {output_dir}/")

EOF

echo "✅ Done!"

