#!/usr/bin/env python3
"""
Extract 5 conversations from Empathetic Dialogues dataset

Usage:
1. Download the dataset from: https://www.kaggle.com/datasets/atharvjairath/empathetic-dialogues-facebook-ai
2. Extract the CSV file (usually named 'train.csv' or similar)
3. Run: python3 data/extract_empathetic_dialogues.py path/to/train.csv

Or place the CSV in data/ directory and it will auto-detect.
"""

import json
import sys
import random
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Installing pandas...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "--quiet"])
    import pandas as pd

def find_csv_file():
    """Try to find CSV file in data directory"""
    data_dir = Path('data')
    csv_files = list(data_dir.glob('*.csv'))
    if csv_files:
        return csv_files[0]
    return None

def extract_conversations(csv_path, num_conversations=5):
    """Extract conversations from the CSV and convert to project format"""
    print(f"Reading CSV file: {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return []
    
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # The Empathetic Dialogues dataset typically has these columns:
    # conv_id, utterance_idx, context, prompt, speaker_idx, utterance, emotion, etc.
    
    # Find conversation ID column
    conv_id_col = None
    for col in ['conv_id', 'conversation_id', 'dialogue_id', 'id']:
        if col in df.columns:
            conv_id_col = col
            break
    
    if not conv_id_col:
        print("ERROR: Could not find conversation ID column")
        print(f"Available columns: {df.columns.tolist()}")
        return []
    
    # Get unique conversation IDs
    unique_conv_ids = df[conv_id_col].unique()
    print(f"Found {len(unique_conv_ids)} unique conversations")
    
    # Select 5 random conversations
    selected_ids = random.sample(list(unique_conv_ids), min(num_conversations, len(unique_conv_ids)))
    
    conversations = []
    
    for i, conv_id in enumerate(selected_ids):
        conv_data = df[df[conv_id_col] == conv_id].copy()
        
        # Sort by utterance index if available
        if 'utterance_idx' in conv_data.columns:
            conv_data = conv_data.sort_values('utterance_idx')
        elif 'index' in conv_data.columns:
            conv_data = conv_data.sort_values('index')
        
        messages = []
        
        # Check for prompt column (first message is often the prompt)
        if 'prompt' in conv_data.columns:
            prompt_row = conv_data.iloc[0]
            if pd.notna(prompt_row.get('prompt', '')):
                prompt_text = str(prompt_row.get('prompt', '')).strip()
                if prompt_text and prompt_text != 'nan':
                    messages.append({
                        "role": "user",
                        "content": prompt_text
                    })
        
        # Process utterances
        utterance_col = None
        for col in ['utterance', 'text', 'message', 'response']:
            if col in conv_data.columns:
                utterance_col = col
                break
        
        if not utterance_col:
            print(f"WARNING: Could not find utterance column in conversation {conv_id}")
            continue
        
        # Determine speaker/role
        speaker_col = None
        for col in ['speaker_idx', 'speaker_id', 'speaker', 'role']:
            if col in conv_data.columns:
                speaker_col = col
                break
        
        for idx, row in conv_data.iterrows():
            utterance = str(row.get(utterance_col, '')).strip()
            if not utterance or utterance == 'nan' or utterance == '':
                continue
            
            # Skip if this is the prompt (already added)
            if 'prompt' in conv_data.columns and row.get('prompt', '') == utterance:
                continue
            
            # Determine role
            if speaker_col and speaker_col in row:
                speaker_val = row[speaker_col]
                # In Empathetic Dialogues: 0 or 'listener' = AI agent (assistant), 1 or 'speaker' = human customer (user)
                if isinstance(speaker_val, (int, float)):
                    role = "assistant" if speaker_val == 0 else "user"
                else:
                    speaker_str = str(speaker_val).lower()
                    role = "assistant" if 'listener' in speaker_str or speaker_str == '0' else "user"
            else:
                # Alternating pattern: customer speaks first (user), then agent responds (assistant)
                role = "user" if len(messages) % 2 == 0 else "assistant"
            
            messages.append({
                "role": role,
                "content": utterance
            })
        
        # Skip if conversation is too short
        if len(messages) < 2:
            print(f"Skipping conversation {conv_id}: too short ({len(messages)} messages)")
            continue
        
        # Get emotion if available
        emotion = 'unknown'
        if 'emotion' in conv_data.columns:
            emotion_val = conv_data.iloc[0].get('emotion', 'unknown')
            if pd.notna(emotion_val):
                emotion = str(emotion_val)
        
        conversation = {
            "id": f"empathetic-{i}",
            "messages": messages,
            "emotion": emotion,
            "source": "empathetic_dialogues"
        }
        
        conversations.append(conversation)
        print(f"✓ Extracted conversation {i+1}: {len(messages)} messages, emotion: {emotion}")
    
    return conversations

def main():
    print("=" * 60)
    print("Extracting 5 conversations from Empathetic Dialogues dataset")
    print("=" * 60)
    
    # Get CSV path from command line or find it
    if len(sys.argv) > 1:
        csv_path = Path(sys.argv[1])
    else:
        csv_path = find_csv_file()
    
    if not csv_path or not csv_path.exists():
        print("\nERROR: CSV file not found!")
        print("\nPlease:")
        print("1. Download the dataset from:")
        print("   https://www.kaggle.com/datasets/atharvjairath/empathetic-dialogues-facebook-ai")
        print("2. Extract the CSV file (usually 'train.csv')")
        print("3. Run this script with the path:")
        print("   python3 data/extract_empathetic_dialogues.py path/to/train.csv")
        print("\nOr place the CSV file in the data/ directory and run:")
        print("   python3 data/extract_empathetic_dialogues.py")
        return
    
    print(f"\nUsing CSV file: {csv_path}")
    
    # Extract conversations
    conversations = extract_conversations(csv_path, num_conversations=5)
    
    if not conversations:
        print("\nERROR: Could not extract conversations")
        return
    
    # Save to JSON file
    output_path = Path('data/empathetic_dialogues_sample.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(conversations, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully extracted {len(conversations)} conversations")
    print(f"Saved to: {output_path}")
    print(f"\nYou can now use these conversations in your project!")

if __name__ == '__main__':
    main()
