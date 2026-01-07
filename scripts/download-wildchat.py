#!/usr/bin/env python3
"""
Download and process conversations from WildChat-1M dataset.
WildChat contains 838k conversations from ChatGPT interactions in the wild.

This addresses dataset bias by adding organic conversations (not evaluation context).
"""

import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from datasets import load_dataset
import random

def load_wildchat_dataset(split: str = 'train', max_conversations: Optional[int] = None):
    """Load WildChat dataset from HuggingFace."""
    print(f"Loading WildChat dataset (split: {split})...")
    try:
        dataset = load_dataset("allenai/WildChat-1M", split=split)
        print(f"Loaded {len(dataset)} conversations")
        
        if max_conversations:
            # Sample randomly if limiting
            if len(dataset) > max_conversations:
                indices = random.sample(range(len(dataset)), max_conversations)
                dataset = dataset.select(indices)
                print(f"Sampled {max_conversations} conversations")
        
        return dataset
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Make sure datasets library is installed: pip install datasets")
        return None

def convert_wildchat_to_our_format(wildchat_conv: Dict) -> Optional[Dict]:
    """Convert WildChat conversation format to our format."""
    try:
        conversation = wildchat_conv.get('conversation', [])
        if not conversation or len(conversation) < 2:
            return None
        
        # Extract messages
        messages = []
        for turn in conversation:
            role = turn.get('role', '')
            content = turn.get('content', '')
            
            if role in ['user', 'assistant'] and content:
                messages.append({
                    'role': role,
                    'content': content
                })
        
        if len(messages) < 2:
            return None
        
        # Generate ID from hash
        conv_hash = wildchat_conv.get('conversation_hash', '')
        if not conv_hash:
            # Create hash from content
            content_str = ''.join([m.get('content', '') for m in messages])
            conv_hash = hashlib.md5(content_str.encode()).hexdigest()[:16]
        
        # Create conversation in our format
        timestamp = wildchat_conv.get('timestamp', None)
        if timestamp and hasattr(timestamp, 'isoformat'):
            timestamp = timestamp.isoformat()
        
        our_conv = {
            'id': f'wildchat_{conv_hash}',
            'source': 'wildchat',
            'messages': messages,
            'metadata': {
                'model': wildchat_conv.get('model', 'unknown'),
                'timestamp': timestamp,
                'turn_count': wildchat_conv.get('turn', len(messages)),
                'language': wildchat_conv.get('language', 'unknown'),
                'country': wildchat_conv.get('country', None),
                'state': wildchat_conv.get('state', None),
                'toxic': wildchat_conv.get('toxic', False),
                'redacted': wildchat_conv.get('redacted', False)
            }
        }
        
        return our_conv
    
    except Exception as e:
        print(f"Error converting conversation: {e}")
        return None

def filter_conversations(conversations: List[Dict], 
                        min_messages: int = 3,
                        max_messages: int = 50,
                        exclude_toxic: bool = True,
                        languages: Optional[List[str]] = None) -> List[Dict]:
    """Filter conversations based on criteria."""
    filtered = []
    
    for conv in conversations:
        if not conv:
            continue
        
        messages = conv.get('messages', [])
        metadata = conv.get('metadata', {})
        
        # Message count filter
        if len(messages) < min_messages or len(messages) > max_messages:
            continue
        
        # Toxic filter
        if exclude_toxic and metadata.get('toxic', False):
            continue
        
        # Language filter (more flexible - check if language starts with 'en' or is in list)
        if languages:
            conv_lang = metadata.get('language', 'unknown')
            # Normalize language names (e.g., 'English' -> 'en', 'Chinese' -> 'zh')
            lang_normalized = conv_lang.lower()
            lang_map = {
                'english': 'en', 'chinese': 'zh', 'spanish': 'es', 'french': 'fr',
                'german': 'de', 'japanese': 'ja', 'korean': 'ko', 'russian': 'ru'
            }
            if lang_normalized in lang_map:
                lang_normalized = lang_map[lang_normalized]
            
            # Check if language matches (either exact match or starts with)
            lang_match = any(
                lang_normalized.startswith(lang.lower()) or 
                lang_normalized == lang.lower() or
                conv_lang.lower() == lang.lower() or
                conv_lang.lower().startswith(lang.lower())
                for lang in languages
            )
            if not lang_match:
                continue
        
        filtered.append(conv)
    
    return filtered

def save_conversations(conversations: List[Dict], output_dir: Path):
    """Save conversations to individual JSON files."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    saved = 0
    for conv in conversations:
        conv_id = conv.get('id', 'unknown')
        output_file = output_dir / f"{conv_id}.json"
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(conv, f, indent=2, ensure_ascii=False)
            saved += 1
        except Exception as e:
            print(f"Error saving {conv_id}: {e}")
    
    return saved

def main():
    """Main download function."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Configuration
    max_conversations = 500  # Start with 500 to test
    min_messages = 3
    max_messages = 50
    exclude_toxic = True
    languages = ['en', 'English']  # English only (can be None for all languages)
    
    output_dir = project_root / 'public' / 'output-wildchat'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("WildChat Dataset Downloader")
    print("=" * 60)
    print(f"Max conversations: {max_conversations}")
    print(f"Message range: {min_messages}-{max_messages}")
    print(f"Exclude toxic: {exclude_toxic}")
    print(f"Languages: {languages}")
    print(f"Output directory: {output_dir}")
    print()
    
    # Load dataset
    dataset = load_wildchat_dataset(split='train', max_conversations=max_conversations * 2)  # Load more to account for filtering
    if not dataset:
        return
    
    # Convert to our format
    print("\nConverting conversations to our format...")
    our_conversations = []
    for i, wildchat_conv in enumerate(dataset):
        if i % 100 == 0:
            print(f"  Processed {i}/{len(dataset)}...")
        
        our_conv = convert_wildchat_to_our_format(wildchat_conv)
        if our_conv:
            our_conversations.append(our_conv)
    
    print(f"\nConverted {len(our_conversations)} conversations")
    
    # Filter
    print("\nFiltering conversations...")
    filtered = filter_conversations(
        our_conversations,
        min_messages=min_messages,
        max_messages=max_messages,
        exclude_toxic=exclude_toxic,
        languages=languages
    )
    print(f"Filtered to {len(filtered)} conversations")
    
    # Limit to max_conversations
    if len(filtered) > max_conversations:
        filtered = random.sample(filtered, max_conversations)
        print(f"Sampled {max_conversations} conversations")
    
    # Save
    print(f"\nSaving conversations to {output_dir}...")
    saved = save_conversations(filtered, output_dir)
    print(f"Saved {saved} conversations")
    
    # Generate summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total conversations downloaded: {saved}")
    
    if saved > 0:
        # Calculate statistics
        message_counts = [len(c.get('messages', [])) for c in filtered]
        models = [c.get('metadata', {}).get('model', 'unknown') for c in filtered]
        
        print(f"Average message count: {sum(message_counts) / len(message_counts):.1f}")
        print(f"Message count range: {min(message_counts)} - {max(message_counts)}")
        print(f"Models: {set(models)}")
        
        print(f"\n✅ Conversations saved to: {output_dir}")
        print(f"\nNext steps:")
        print(f"1. Classify conversations: python scripts/batch-classify-unclassified.py")
        print(f"2. Run clustering on expanded dataset")
        print(f"3. Compare cluster structure with Chatbot Arena results")

if __name__ == '__main__':
    main()

