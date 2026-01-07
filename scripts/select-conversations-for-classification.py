#!/usr/bin/env python3
"""
Select a diverse set of conversations for classification.
Prioritizes variety in length, source, and quality.
"""

import json
import random
from pathlib import Path
from collections import defaultdict

def select_diverse_conversations(
    input_dir: Path,
    output_dir: Path,
    count: int = 20,
    seed: int = 42
):
    """Select diverse conversations for classification."""
    random.seed(seed)  # Reproducible selection
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Find all conversation files
    chatbot_files = list(input_path.glob("chatbot_arena_*.json"))
    oasst_files = list(input_path.glob("oasst-*.json"))
    all_files = chatbot_files + oasst_files
    
    if len(all_files) == 0:
        print(f"❌ No conversation files found in {input_dir}")
        return []
    
    print(f"📋 Found {len(all_files)} total conversations")
    print(f"   Chatbot Arena: {len(chatbot_files)}")
    print(f"   OpenAssistant: {len(oasst_files)}")
    print()
    
    # Analyze all conversations
    conversations_with_metadata = []
    
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                conv = json.load(f)
            
            messages = conv.get('messages', [])
            msg_count = len(messages)
            
            # Calculate total length
            total_length = sum(len(msg.get('content', '')) for msg in messages)
            
            # Count exchanges
            exchanges = 0
            last_role = None
            for msg in messages:
                role = msg.get('role', '')
                if role and role != last_role:
                    if last_role is not None:
                        exchanges += 1
                    last_role = role
            
            source = "chatbot_arena" if "chatbot_arena" in file_path.name else "openassistant"
            
            conversations_with_metadata.append({
                'file': file_path,
                'id': conv.get('id', file_path.stem),
                'source': source,
                'message_count': msg_count,
                'total_length': total_length,
                'exchanges': exchanges
            })
        except Exception as e:
            print(f"  ⚠️  Error reading {file_path.name}: {e}")
            continue
    
    print(f"✅ Analyzed {len(conversations_with_metadata)} conversations")
    print()
    
    # Group by message count ranges for diversity
    by_length = defaultdict(list)
    for conv in conversations_with_metadata:
        if conv['message_count'] < 12:
            by_length['short'].append(conv)
        elif conv['message_count'] < 18:
            by_length['medium'].append(conv)
        else:
            by_length['long'].append(conv)
    
    # Group by source
    by_source = defaultdict(list)
    for conv in conversations_with_metadata:
        by_source[conv['source']].append(conv)
    
    print(f"📊 Distribution:")
    print(f"   Short (10-11 msgs): {len(by_length['short'])}")
    print(f"   Medium (12-17 msgs): {len(by_length['medium'])}")
    print(f"   Long (18+ msgs): {len(by_length['long'])}")
    print()
    
    # Select diverse set
    selected = []
    
    # Strategy: Select from different length categories and sources
    # Target: ~30% short, ~50% medium, ~20% long
    # Mix of both sources
    
    short_count = max(1, int(count * 0.3))
    medium_count = max(1, int(count * 0.5))
    long_count = count - short_count - medium_count
    
    # Select short conversations (mix of sources)
    if len(by_length['short']) > 0:
        short_chatbot = [c for c in by_length['short'] if c['source'] == 'chatbot_arena']
        short_oasst = [c for c in by_length['short'] if c['source'] == 'openassistant']
        short_selected = random.sample(short_chatbot, min(short_count // 2, len(short_chatbot)))
        if short_oasst and len(short_selected) < short_count:
            short_selected.extend(random.sample(short_oasst, min(short_count - len(short_selected), len(short_oasst))))
        selected.extend(short_selected[:short_count])
    
    # Select medium conversations (mix of sources)
    if len(by_length['medium']) > 0:
        medium_chatbot = [c for c in by_length['medium'] if c['source'] == 'chatbot_arena']
        medium_oasst = [c for c in by_length['medium'] if c['source'] == 'openassistant']
        medium_selected = random.sample(medium_chatbot, min(medium_count // 2, len(medium_chatbot)))
        if medium_oasst and len(medium_selected) < medium_count:
            medium_selected.extend(random.sample(medium_oasst, min(medium_count - len(medium_selected), len(medium_oasst))))
        selected.extend(medium_selected[:medium_count])
    
    # Select long conversations (mix of sources)
    if len(by_length['long']) > 0:
        long_chatbot = [c for c in by_length['long'] if c['source'] == 'chatbot_arena']
        long_oasst = [c for c in by_length['long'] if c['source'] == 'openassistant']
        long_selected = random.sample(long_chatbot, min(long_count // 2, len(long_chatbot)))
        if long_oasst and len(long_selected) < long_count:
            long_selected.extend(random.sample(long_oasst, min(long_count - len(long_selected), len(long_oasst))))
        selected.extend(long_selected[:long_count])
    
    # If we don't have enough, fill from remaining (prioritize longer)
    remaining_needed = count - len(selected)
    if remaining_needed > 0:
        remaining = [c for c in conversations_with_metadata if c not in selected]
        remaining_sorted = sorted(remaining, key=lambda x: x['message_count'], reverse=True)
        selected.extend(remaining_sorted[:remaining_needed])
    
    # Ensure exactly count (take first count)
    selected = selected[:count]
    
    print(f"✅ Selected {len(selected)} conversations:")
    print()
    
    # Copy selected conversations to output directory
    selected_files = []
    for conv in selected:
        source_file = conv['file']
        dest_file = output_path / source_file.name
        
        # Copy file
        import shutil
        shutil.copy2(source_file, dest_file)
        
        selected_files.append({
            'file': dest_file.name,
            'source': conv['source'],
            'messages': conv['message_count'],
            'length': conv['total_length'],
            'exchanges': conv['exchanges']
        })
        
        print(f"  {dest_file.name:40s} | {conv['source']:15s} | {conv['message_count']:2d} msgs | {conv['total_length']:5d} chars")
    
    print()
    print(f"📊 Selection Summary:")
    by_selected_source = defaultdict(int)
    by_selected_length = {'short': 0, 'medium': 0, 'long': 0}
    
    for conv in selected:
        by_selected_source[conv['source']] += 1
        if conv['message_count'] < 12:
            by_selected_length['short'] += 1
        elif conv['message_count'] < 18:
            by_selected_length['medium'] += 1
        else:
            by_selected_length['long'] += 1
    
    print(f"   By source:")
    for source, count in by_selected_source.items():
        print(f"     {source}: {count}")
    print(f"   By length:")
    for length, count in by_selected_length.items():
        print(f"     {length} (10-11/12-17/18+): {count}")
    print()
    print(f"   Average messages: {sum(c['message_count'] for c in selected) / len(selected):.1f}")
    print(f"   Average length: {sum(c['total_length'] for c in selected) / len(selected):.0f} chars")
    print()
    print(f"✅ Copied {len(selected)} conversations to: {output_path}/")
    
    # Save selection list
    selection_manifest = output_path / "selected_conversations_manifest.json"
    with open(selection_manifest, 'w', encoding='utf-8') as f:
        json.dump({
            'total_selected': len(selected),
            'selection_criteria': {
                'target_count': count,
                'strategy': 'diverse_by_length_and_source'
            },
            'conversations': selected_files
        }, f, indent=2)
    
    print(f"   Selection manifest: {selection_manifest}")
    
    return selected

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Select diverse conversations for classification")
    parser.add_argument(
        "--input",
        default="conversations-filtered",
        help="Input directory with filtered conversations"
    )
    parser.add_argument(
        "--output",
        default="conversations-selected",
        help="Output directory for selected conversations"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of conversations to select (default: 20)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)"
    )
    
    args = parser.parse_args()
    
    select_diverse_conversations(
        Path(args.input),
        Path(args.output),
        count=args.count,
        seed=args.seed
    )

