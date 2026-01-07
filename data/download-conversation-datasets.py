#!/usr/bin/env python3
"""
Download and process conversation datasets for the Cartography project.
"""

import json
import os
from pathlib import Path

try:
    from datasets import load_dataset
    DATASETS_AVAILABLE = True
except ImportError:
    DATASETS_AVAILABLE = False
    print("⚠️  HuggingFace datasets not installed. Install with: pip install datasets")

def download_sharegpt(output_dir="conversations-raw", limit=None):
    """Download ShareGPT conversations (real human-AI dialogues)."""
    if not DATASETS_AVAILABLE:
        print("❌ Cannot download ShareGPT: datasets library not installed")
        return []
    
    print("📥 Downloading ShareGPT dataset...")
    
    # Try multiple ShareGPT dataset variants
    sharegpt_datasets = [
        "anon8231489123/ShareGPT_Vicuna_unfiltered",
        "RyokoAI/ShareGPT52K",
        "liuhaotian/ShareGPT4V"
    ]
    
    dataset = None
    for dataset_name in sharegpt_datasets:
        try:
            print(f"  Trying {dataset_name}...")
            dataset = load_dataset(dataset_name, split="train")
            print(f"  ✅ Successfully loaded {dataset_name}")
            break
        except Exception as e:
            print(f"  ⚠️  Failed to load {dataset_name}: {e}")
            continue
    
    if dataset is None:
        print("❌ Could not load any ShareGPT dataset variant")
        return []
    
    try:
        
        conversations = []
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        count = 0
        for item in dataset:
            if limit and count >= limit:
                break
            
            # ShareGPT format: conversations are in 'conversations' field
            if 'conversations' in item:
                conv = item['conversations']
                # Convert to our format
                messages = []
                for msg in conv:
                    role = msg.get('from', 'user')
                    content = msg.get('value', '')
                    
                    # Map roles to our format
                    if role == 'human' or role == 'user':
                        messages.append({"role": "user", "content": content})
                    elif role == 'gpt' or role == 'assistant' or role == 'chatgpt':
                        messages.append({"role": "assistant", "content": content})
                
                if len(messages) >= 2:  # At least one exchange
                    conv_id = f"sharegpt-{count}"
                    conversation = {
                        "id": conv_id,
                        "messages": messages
                    }
                    conversations.append(conversation)
                    
                    # Save individual file
                    with open(output_path / f"{conv_id}.json", 'w') as f:
                        json.dump(conversation, f, indent=2)
                    
                    count += 1
                    if count % 100 == 0:
                        print(f"  Processed {count} conversations...")
        
        print(f"✅ Downloaded {len(conversations)} ShareGPT conversations")
        return conversations
        
    except Exception as e:
        print(f"❌ Error downloading ShareGPT: {e}")
        return []

def download_openassistant(output_dir="conversations-raw", limit=None):
    """Download OpenAssistant conversations."""
    if not DATASETS_AVAILABLE:
        print("❌ Cannot download OpenAssistant: datasets library not installed")
        return []
    
    print("📥 Downloading OpenAssistant dataset...")
    try:
        dataset = load_dataset("OpenAssistant/oasst1", split="train")
        
        conversations = []
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Group messages by conversation tree
        conversation_trees = {}
        
        count = 0
        for item in dataset:
            if limit and count >= limit:
                break
            
            message_id = item.get('message_id')
            parent_id = item.get('parent_id')
            text = item.get('text', '')
            role = item.get('role', 'user')
            
            # Map roles
            if role == 'prompter':
                role = 'user'
            elif role == 'assistant':
                role = 'assistant'
            
            # Build conversation tree
            if parent_id is None:
                # Root message - start new conversation
                conv_id = f"oasst-{len(conversation_trees)}"
                conversation_trees[conv_id] = {
                    "id": conv_id,
                    "messages": [{"role": role, "content": text}]
                }
            else:
                # Find parent conversation
                for conv_id, conv in conversation_trees.items():
                    # Simple approach: add to first matching conversation
                    # (In reality, you'd need to track message IDs properly)
                    if len(conv['messages']) < 50:  # Limit conversation length
                        conv['messages'].append({"role": role, "content": text})
                        break
            
            count += 1
            if count % 1000 == 0:
                print(f"  Processed {count} messages...")
        
        # Save conversations
        for conv_id, conv in list(conversation_trees.items())[:limit or len(conversation_trees)]:
            if len(conv['messages']) >= 2:
                with open(output_path / f"{conv_id}.json", 'w') as f:
                    json.dump(conv, f, indent=2)
                conversations.append(conv)
        
        print(f"✅ Downloaded {len(conversations)} OpenAssistant conversations")
        return conversations
        
    except Exception as e:
        print(f"❌ Error downloading OpenAssistant: {e}")
        return []

def process_cornell_movie_dialogs(input_dir="temp-samantha/dataset", output_dir="conversations-raw", limit=50):
    """Process Cornell Movie-Dialogs Corpus (already downloaded)."""
    print("📥 Processing Cornell Movie-Dialogs Corpus...")
    
    conversations_file = Path(input_dir) / "movie_conversations.txt"
    lines_file = Path(input_dir) / "movie_lines.txt"
    
    if not conversations_file.exists() or not lines_file.exists():
        print(f"❌ Cornell Movie-Dialogs files not found in {input_dir}")
        return []
    
    # Load all lines
    lines_dict = {}
    print("  Loading dialogue lines...")
    with open(lines_file, 'r', encoding='iso-8859-1') as f:
        for line in f:
            parts = line.strip().split(' +++$+++ ')
            if len(parts) >= 5:
                line_id = parts[0]
                text = parts[4]
                lines_dict[line_id] = text
    
    # Process conversations
    conversations = []
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print("  Processing conversations...")
    with open(conversations_file, 'r', encoding='iso-8859-1') as f:
        count = 0
        for line in f:
            if limit and count >= limit:
                break
            
            parts = line.strip().split(' +++$+++ ')
            if len(parts) >= 4:
                # Parse line IDs
                line_ids_str = parts[3].strip("[]'")
                line_ids = [lid.strip().strip("'\"") for lid in line_ids_str.split(',')]
                
                # Build conversation
                messages = []
                for i, line_id in enumerate(line_ids):
                    if line_id in lines_dict:
                        # Alternate between user and assistant (simplified)
                        role = "user" if i % 2 == 0 else "assistant"
                        messages.append({
                            "role": role,
                            "content": lines_dict[line_id]
                        })
                
                if len(messages) >= 2:
                    conv_id = f"cornell-{count}"
                    conversation = {
                        "id": conv_id,
                        "messages": messages
                    }
                    conversations.append(conversation)
                    
                    # Save individual file
                    with open(output_path / f"{conv_id}.json", 'w') as f:
                        json.dump(conversation, f, indent=2)
                    
                    count += 1
                    if count % 10 == 0:
                        print(f"  Processed {count} conversations...")
    
    print(f"✅ Processed {len(conversations)} Cornell Movie-Dialogs conversations")
    return conversations

def download_kaggle_empathetic(output_dir="conversations-raw", limit=None):
    """Download empathetic dialogues from Kaggle using kagglehub."""
    try:
        # Import the kaggle downloader
        import sys
        from pathlib import Path
        script_dir = Path(__file__).parent
        sys.path.insert(0, str(script_dir))
        
        from download_kaggle_empathetic import download_empathetic_dialogues
        return download_empathetic_dialogues(output_dir=output_dir, limit=limit)
    except ImportError:
        print("⚠️  Kaggle downloader not available. Use download-kaggle-empathetic.py directly.")
        print("   Install: pip install kagglehub[pandas-datasets]")
        return []
    except Exception as e:
        print(f"❌ Error downloading from Kaggle: {e}")
        return []

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Download conversation datasets")
    parser.add_argument("--source", choices=["sharegpt", "openassistant", "cornell", "kaggle", "all"], 
                       default="cornell", help="Dataset to download")
    parser.add_argument("--limit", type=int, help="Limit number of conversations")
    parser.add_argument("--output", default="conversations-raw", help="Output directory")
    
    args = parser.parse_args()
    
    all_conversations = []
    
    if args.source in ["cornell", "all"]:
        convs = process_cornell_movie_dialogs(output_dir=args.output, limit=args.limit)
        all_conversations.extend(convs)
    
    if args.source in ["sharegpt", "all"]:
        convs = download_sharegpt(output_dir=args.output, limit=args.limit)
        all_conversations.extend(convs)
    
    if args.source in ["openassistant", "all"]:
        convs = download_openassistant(output_dir=args.output, limit=args.limit)
        all_conversations.extend(convs)
    
    if args.source in ["kaggle", "all"]:
        convs = download_kaggle_empathetic(output_dir=args.output, limit=args.limit)
        all_conversations.extend(convs)
    
    # Create combined file
    if all_conversations:
        combined_file = Path(args.output) / "all-conversations.json"
        
        # Load existing conversations if file exists
        existing_convs = []
        if combined_file.exists():
            try:
                with open(combined_file, 'r', encoding='utf-8') as f:
                    existing_convs = json.load(f)
            except:
                pass
        
        # Merge and save
        all_conversations = existing_convs + all_conversations
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(all_conversations, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Total: {len(all_conversations)} conversations saved to {args.output}/")
        print(f"   Combined file: {combined_file}")

if __name__ == "__main__":
    main()

