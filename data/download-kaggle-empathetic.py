#!/usr/bin/env python3
"""
Download empathetic dialogues from Kaggle using kagglehub.

Install dependencies:
    pip install kagglehub[pandas-datasets]

Usage:
    python3 download-kaggle-empathetic.py [--limit N] [--output-dir DIR]
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    KAGGLEHUB_AVAILABLE = True
except ImportError:
    KAGGLEHUB_AVAILABLE = False
    print("❌ kagglehub not installed. Install with: pip install kagglehub[pandas-datasets]")
    sys.exit(1)


def download_empathetic_dialogues(
    output_dir: str = "conversations-raw",
    limit: int = None,
    min_messages: int = 2
) -> List[Dict[str, Any]]:
    """
    Download empathetic dialogues from Kaggle.
    
    Args:
        output_dir: Directory to save conversations
        limit: Maximum number of conversations to download (None for all)
        min_messages: Minimum number of messages per conversation
    
    Returns:
        List of conversation dictionaries
    """
    print("📥 Downloading Empathetic Dialogues from Kaggle...")
    print("   Dataset: atharvjairath/empathetic-dialogues-facebook-ai")
    print("")
    
    try:
        # Load the dataset
        # The dataset typically has a CSV file with columns like:
        # conv_id, utterance_idx, context, prompt, speaker_idx, emotion, etc.
        # Try common file names
        file_paths = ["train.csv", "test.csv", "val.csv", "train.tsv", "test.tsv", "val.tsv"]
        df = None
        
        for file_path in file_paths:
            try:
                print(f"   Trying {file_path}...")
                df = kagglehub.load_dataset(
                    KaggleDatasetAdapter.PANDAS,
                    "atharvjairath/empathetic-dialogues-facebook-ai",
                    file_path,
                )
                print(f"✅ Loaded {file_path}")
                break
            except Exception as e:
                continue
        
        if df is None:
            # Try to list files in the dataset
            print("   Attempting to list dataset files...")
            try:
                # Use dataset_download to get the path, then list files
                import kagglehub
                dataset_path = kagglehub.dataset_download("atharvjairath/empathetic-dialogues-facebook-ai")
                print(f"   Dataset downloaded to: {dataset_path}")
                from pathlib import Path
                dataset_dir = Path(dataset_path)
                files = list(dataset_dir.glob("*"))
                print(f"   Available files: {[f.name for f in files]}")
                
                # Try to load the first CSV/TSV file found
                for file_path in files:
                    if file_path.suffix in ['.csv', '.tsv']:
                        print(f"   Loading {file_path.name}...")
                        import pandas as pd
                        if file_path.suffix == '.csv':
                            df = pd.read_csv(file_path)
                        else:
                            df = pd.read_csv(file_path, sep='\t')
                        print(f"✅ Loaded {file_path.name}")
                        break
            except Exception as e:
                print(f"   Error listing files: {e}")
        
        if df is None:
            raise ValueError("Could not find or load dataset file. Please check the dataset structure.")
        
        print(f"✅ Loaded dataset with {len(df)} rows")
        print(f"   Columns: {list(df.columns)}")
        print("")
        
        # Check if empathetic_dialogues column exists (contains full conversations)
        if 'empathetic_dialogues' in df.columns:
            print("   Found 'empathetic_dialogues' column - parsing conversations...")
            return _parse_empathetic_dialogues_column(df, output_dir, limit, min_messages)
        
        # Try to find conversation ID column for grouping
        conv_id_col = None
        text_col = None
        speaker_col = None
        
        # Try to find conversation ID column
        for col in ['conv_id', 'conversation_id', 'convId', 'conversationId', 'id']:
            if col in df.columns:
                conv_id_col = col
                break
        
        # Try to find text column
        for col in ['utterance', 'text', 'prompt', 'context', 'response', 'message']:
            if col in df.columns:
                text_col = col
                break
        
        # Try to find speaker column
        for col in ['speaker_idx', 'speaker', 'role', 'speakerId']:
            if col in df.columns:
                speaker_col = col
                break
        
        if not conv_id_col:
            print("⚠️  Could not find conversation ID column. Available columns:")
            print(f"   {list(df.columns)}")
            print("")
            print("Trying to infer conversation structure...")
            # Fallback: assume each row is a message and group sequentially
            return _process_sequential_messages(df, output_dir, limit, min_messages, text_col, speaker_col)
        
        print(f"   Using columns: conv_id={conv_id_col}, text={text_col}, speaker={speaker_col}")
        print("")
        
        # Group messages by conversation
        conversations_dict = {}
        conversations = []
        
        for idx, row in df.iterrows():
            conv_id = str(row[conv_id_col])
            text = str(row[text_col]) if text_col else ""
            
            # Determine speaker role
            if speaker_col and speaker_col in row:
                speaker_val = row[speaker_col]
                # Map speaker to role (typically 0=user, 1=assistant or vice versa)
                if speaker_val == 0 or speaker_val == '0' or str(speaker_val).lower() in ['user', 'customer', 'human']:
                    role = "user"
                elif speaker_val == 1 or speaker_val == '1' or str(speaker_val).lower() in ['assistant', 'agent', 'ai']:
                    role = "assistant"
                else:
                    # Try to infer from position in conversation
                    role = "user" if len(conversations_dict.get(conv_id, {}).get('messages', [])) % 2 == 0 else "assistant"
            else:
                # No speaker column - alternate between user and assistant
                if conv_id not in conversations_dict:
                    role = "user"
                else:
                    prev_messages = conversations_dict[conv_id].get('messages', [])
                    role = "assistant" if len(prev_messages) % 2 == 0 else "user"
            
            # Skip empty messages
            if not text or text.strip() == "" or text.lower() == "nan":
                continue
            
            # Initialize conversation if needed
            if conv_id not in conversations_dict:
                conversations_dict[conv_id] = {
                    "id": f"kaggle-emo-{len(conversations_dict)}",
                    "messages": [],
                    "emotion": row.get('emotion', 'unknown') if 'emotion' in df.columns else None,
                    "situation": row.get('context', '') if 'context' in df.columns else None,
                }
            
            # Add message
            conversations_dict[conv_id]["messages"].append({
                "role": role,
                "content": text.strip()
            })
        
        # Convert to list and filter
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        count = 0
        for conv_id, conv in conversations_dict.items():
            if len(conv["messages"]) < min_messages:
                continue
            
            if limit and count >= limit:
                break
            
            # Save individual file
            conv_file = output_path / f"{conv['id']}.json"
            with open(conv_file, 'w', encoding='utf-8') as f:
                json.dump(conv, f, indent=2, ensure_ascii=False)
            
            conversations.append(conv)
            count += 1
            
            if count % 100 == 0:
                print(f"  Processed {count} conversations...")
        
        print(f"✅ Downloaded {len(conversations)} conversations")
        return conversations
        
    except Exception as e:
        print(f"❌ Error downloading from Kaggle: {e}")
        import traceback
        traceback.print_exc()
        return []


def _parse_empathetic_dialogues_column(
    df: Any,
    output_dir: str,
    limit: int,
    min_messages: int
) -> List[Dict[str, Any]]:
    """Parse conversations from empathetic_dialogues column (Customer/Agent format)."""
    import re
    
    conversations = []
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for idx, row in df.iterrows():
        if limit and count >= limit:
            break
        
        dialogue_text = str(row.get('empathetic_dialogues', ''))
        if not dialogue_text or dialogue_text.lower() == 'nan':
            continue
        
        # Parse Customer/Agent format
        # Pattern: "Customer :... Agent :..." or "Customer: ... Agent: ..."
        messages = []
        
        # Split by Customer/Agent markers
        parts = re.split(r'(?:Customer|Agent)\s*:', dialogue_text, flags=re.IGNORECASE)
        
        # First part might be empty or situation, skip it
        for i, part in enumerate(parts[1:], 1):
            if not part.strip():
                continue
            
            # Determine role based on which marker came before
            # Find the marker before this part
            marker_pos = dialogue_text.lower().find(parts[i-1].lower() + ('customer' if i % 2 == 1 else 'agent'))
            if marker_pos == -1:
                # Try to infer from position
                role = "user" if i % 2 == 1 else "assistant"
            else:
                # Check what marker is before this part
                before_text = dialogue_text[:marker_pos].lower()
                if 'customer' in before_text[-20:]:  # Check last 20 chars
                    role = "user"
                elif 'agent' in before_text[-20:]:
                    role = "assistant"
                else:
                    role = "user" if i % 2 == 1 else "assistant"
            
            content = part.strip()
            # Remove any trailing Agent/Customer markers that might have been included
            content = re.sub(r'\s*(?:Agent|Customer)\s*:.*$', '', content, flags=re.IGNORECASE)
            
            if content:
                messages.append({
                    "role": role,
                    "content": content
                })
        
        # If parsing failed, try simpler approach: split by lines and alternate
        if len(messages) < min_messages:
            lines = dialogue_text.split('\n')
            messages = []
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check for explicit markers
                if re.match(r'^\s*(?:Customer|User)\s*:', line, re.IGNORECASE):
                    content = re.sub(r'^\s*(?:Customer|User)\s*:\s*', '', line, flags=re.IGNORECASE)
                    messages.append({"role": "user", "content": content})
                elif re.match(r'^\s*(?:Agent|Assistant)\s*:', line, re.IGNORECASE):
                    content = re.sub(r'^\s*(?:Agent|Assistant)\s*:\s*', '', line, flags=re.IGNORECASE)
                    messages.append({"role": "assistant", "content": content})
                else:
                    # Alternate if no marker
                    role = "user" if len(messages) % 2 == 0 else "assistant"
                    messages.append({"role": role, "content": line})
        
        if len(messages) >= min_messages:
            conv_id = f"kaggle-emo-{count}"
            conversation = {
                "id": conv_id,
                "messages": messages,
                "emotion": str(row.get('emotion', 'unknown')) if 'emotion' in df.columns else None,
                "situation": str(row.get('Situation', '')) if 'Situation' in df.columns else None,
            }
            
            # Save individual file
            conv_file = output_path / f"{conv_id}.json"
            with open(conv_file, 'w', encoding='utf-8') as f:
                json.dump(conversation, f, indent=2, ensure_ascii=False)
            
            conversations.append(conversation)
            count += 1
            
            if count % 10 == 0:
                print(f"  Processed {count} conversations...")
    
    print(f"✅ Parsed {len(conversations)} conversations from empathetic_dialogues column")
    return conversations


def _process_sequential_messages(
    df: Any,
    output_dir: str,
    limit: int,
    min_messages: int,
    text_col: str,
    speaker_col: str
) -> List[Dict[str, Any]]:
    """Fallback: process messages sequentially when conversation grouping isn't clear."""
    print("   Processing messages sequentially...")
    
    conversations = []
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    current_conv = {
        "id": f"kaggle-emo-{len(conversations)}",
        "messages": []
    }
    
    count = 0
    for idx, row in df.iterrows():
        if limit and count >= limit:
            break
        
        text = str(row[text_col]) if text_col else str(row.iloc[0]) if len(row) > 0 else ""
        
        if not text or text.strip() == "" or text.lower() == "nan":
            continue
        
        # Alternate roles
        role = "user" if len(current_conv["messages"]) % 2 == 0 else "assistant"
        
        current_conv["messages"].append({
            "role": role,
            "content": text.strip()
        })
        
        # Start new conversation every 4-8 messages (simulate conversation boundaries)
        if len(current_conv["messages"]) >= 6:
            if len(current_conv["messages"]) >= min_messages:
                # Save conversation
                conv_file = output_path / f"{current_conv['id']}.json"
                with open(conv_file, 'w', encoding='utf-8') as f:
                    json.dump(current_conv, f, indent=2, ensure_ascii=False)
                
                conversations.append(current_conv)
                count += 1
                
                if count % 100 == 0:
                    print(f"  Processed {count} conversations...")
            
            # Start new conversation
            current_conv = {
                "id": f"kaggle-emo-{len(conversations)}",
                "messages": []
            }
    
    # Save last conversation if it has enough messages
    if len(current_conv["messages"]) >= min_messages:
        conv_file = output_path / f"{current_conv['id']}.json"
        with open(conv_file, 'w', encoding='utf-8') as f:
            json.dump(current_conv, f, indent=2, ensure_ascii=False)
        conversations.append(current_conv)
    
    print(f"✅ Processed {len(conversations)} conversations")
    return conversations


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Download empathetic dialogues from Kaggle",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download first 100 conversations
  python3 download-kaggle-empathetic.py --limit 100
  
  # Download all conversations
  python3 download-kaggle-empathetic.py
  
  # Save to custom directory
  python3 download-kaggle-empathetic.py --output-dir my-conversations
        """
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Maximum number of conversations to download (default: all)"
    )
    parser.add_argument(
        "--output-dir",
        default="conversations-raw",
        help="Output directory (default: conversations-raw)"
    )
    parser.add_argument(
        "--min-messages",
        type=int,
        default=2,
        help="Minimum number of messages per conversation (default: 2)"
    )
    
    args = parser.parse_args()
    
    conversations = download_empathetic_dialogues(
        output_dir=args.output_dir,
        limit=args.limit,
        min_messages=args.min_messages
    )
    
    # Create combined file
    if conversations:
        combined_file = Path(args.output_dir) / "all-conversations.json"
        
        # Load existing conversations if file exists
        existing_convs = []
        if combined_file.exists():
            try:
                with open(combined_file, 'r', encoding='utf-8') as f:
                    existing_convs = json.load(f)
            except:
                pass
        
        # Merge and save
        all_conversations = existing_convs + conversations
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(all_conversations, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Total: {len(all_conversations)} conversations in {combined_file}")
        print(f"   New conversations: {len(conversations)}")
        print(f"   Saved to: {args.output_dir}/")
        print("")
        print("Next steps:")
        print("1. Review the conversations in conversations-raw/")
        print("2. Classify them: cd classifier && ./classify.sh")
        print("")


if __name__ == "__main__":
    main()

