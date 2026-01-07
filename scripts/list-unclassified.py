#!/usr/bin/env python3
"""
List Unclassified Conversations

Finds conversations that exist but haven't been classified yet.

Usage:
    python3 scripts/list-unclassified.py [--selected] [--filtered] [--all]
"""

import json
import os
import sys
from pathlib import Path

def get_classified_ids():
    """Get set of all classified conversation IDs"""
    classified_dir = Path('public/output')
    classified_ids = set()
    classified_files = {}
    
    if not classified_dir.exists():
        return classified_ids, classified_files
    
    for f in classified_dir.glob('*.json'):
        if f.name == 'manifest.json':
            continue
        try:
            conv = json.load(open(f))
            conv_id = conv.get('id', f.stem)
            if 'classification' in conv:
                classified_ids.add(conv_id)
                classified_files[conv_id] = f.name
                # Also match by filename
                classified_ids.add(f.stem)
                classified_files[f.stem] = f.name
        except:
            pass
    
    return classified_ids, classified_files

def check_directory(dir_path, classified_ids, classified_files):
    """Check a directory for unclassified conversations"""
    if not os.path.exists(dir_path):
        return []
    
    unclassified = []
    files = sorted([f for f in os.listdir(dir_path) if f.endswith('.json') and not f.startswith('filtered_')])
    
    for filename in files:
        filepath = Path(dir_path) / filename
        try:
            conv = json.load(open(filepath))
            conv_id = conv.get('id', filename.replace('.json', ''))
            msg_count = len(conv.get('messages', []))
            
            # Check if classified by ID or filename
            is_classified = (
                conv_id in classified_ids or
                filename.replace('.json', '') in classified_ids or
                filename in classified_files.values()
            )
            
            if not is_classified:
                unclassified.append({
                    'file': filename,
                    'path': str(filepath),
                    'id': conv_id,
                    'messages': msg_count
                })
        except Exception as e:
            print(f"⚠️  Error reading {filename}: {e}", file=sys.stderr)
    
    return unclassified

def main():
    check_selected = '--selected' in sys.argv or '--all' in sys.argv or len(sys.argv) == 1
    check_filtered = '--filtered' in sys.argv or '--all' in sys.argv
    check_raw = '--raw' in sys.argv or '--all' in sys.argv
    
    print("=" * 60)
    print("Unclassified Conversations Finder")
    print("=" * 60)
    print()
    
    # Get classified IDs
    print("Loading classified conversations...")
    classified_ids, classified_files = get_classified_ids()
    print(f"✅ Found {len(classified_ids)} classified conversations\n")
    
    all_unclassified = []
    
    # Check conversations-selected
    if check_selected:
        print("📁 Checking conversations-selected/...")
        unclassified = check_directory('conversations-selected', classified_ids, classified_files)
        if unclassified:
            print(f"   ❌ Found {len(unclassified)} unclassified conversations:")
            for item in unclassified:
                print(f"      - {item['file']} ({item['messages']} messages, id: {item['id']})")
            all_unclassified.extend(unclassified)
        else:
            print("   ✅ All classified")
        print()
    
    # Check conversations-filtered
    if check_filtered:
        print("📁 Checking conversations-filtered/...")
        unclassified = check_directory('conversations-filtered', classified_ids, classified_files)
        if unclassified:
            print(f"   ❌ Found {len(unclassified)} unclassified conversations")
            print(f"   (Showing first 20)")
            for item in unclassified[:20]:
                print(f"      - {item['file']} ({item['messages']} messages, id: {item['id']})")
            if len(unclassified) > 20:
                print(f"      ... and {len(unclassified) - 20} more")
            all_unclassified.extend(unclassified)
        else:
            print("   ✅ All classified")
        print()
    
    # Check conversations-raw
    if check_raw:
        print("📁 Checking conversations-raw/...")
        unclassified = check_directory('conversations-raw', classified_ids, classified_files)
        if unclassified:
            print(f"   ❌ Found {len(unclassified)} unclassified conversations")
            print(f"   (Showing first 20)")
            for item in unclassified[:20]:
                print(f"      - {item['file']} ({item['messages']} messages, id: {item['id']})")
            if len(unclassified) > 20:
                print(f"      ... and {len(unclassified) - 20} more")
            all_unclassified.extend(unclassified)
        else:
            print("   ✅ All classified")
        print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total unclassified: {len(all_unclassified)}")
    print()
    
    if all_unclassified:
        print("To classify these conversations:")
        print()
        print("# Using OpenAI:")
        print("python3 classifier/classifier-openai.py conversations-selected/file.json output.json --individual --output-dir public/output/")
        print()
        print("# Using Ollama:")
        print("python3 classifier/classifier-ollama.py conversations-selected/file.json output.json --individual --output-dir public/output/ --model llama2")
        print()
        
        # Create list file
        list_file = Path('unclassified-conversations.txt')
        with open(list_file, 'w') as f:
            for item in all_unclassified:
                f.write(f"{item['path']}\n")
        print(f"📝 List saved to: {list_file}")

if __name__ == '__main__':
    main()

