#!/usr/bin/env python3
"""
Remove duplicate conversations from conversations-filtered directory.

For each group of duplicates, keeps the file with the lowest numeric ID
and removes the others.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

def find_duplicates(directory: Path):
    """Find duplicate conversations by message content."""
    content_hash = defaultdict(list)
    
    for f in directory.glob("chatbot_arena_*.json"):
        try:
            with open(f, 'r') as file:
                data = json.load(file)
                messages = data.get('messages', [])
                # Create hash from message content (ignore ID)
                msg_str = json.dumps(messages, sort_keys=True)
                content_hash[msg_str].append(f)
        except Exception as e:
            print(f"⚠️  Error reading {f}: {e}", file=sys.stderr)
    
    # Find duplicates
    duplicates = {k: v for k, v in content_hash.items() if len(v) > 1}
    return duplicates

def extract_id_number(filename: Path):
    """Extract numeric ID from filename like 'chatbot_arena_1650.json' -> 1650"""
    try:
        # Remove extension and prefix
        name = filename.stem  # 'chatbot_arena_1650'
        num_str = name.replace('chatbot_arena_', '')
        return int(num_str)
    except:
        return float('inf')  # Put non-numeric IDs last

def main():
    filtered_dir = Path("conversations-filtered")
    raw_dir = Path("conversations-raw")
    
    if not filtered_dir.exists():
        print(f"❌ Directory not found: {filtered_dir}")
        return 1
    
    print("Finding duplicate conversations...\n")
    duplicates = find_duplicates(filtered_dir)
    
    if not duplicates:
        print("✅ No duplicates found!")
        return 0
    
    print(f"Found {len(duplicates)} duplicate groups\n")
    print("="*60)
    
    # Collect files to remove
    files_to_remove = []
    files_to_keep = []
    
    for i, (content, files) in enumerate(duplicates.items(), 1):
        # Sort by numeric ID
        sorted_files = sorted(files, key=extract_id_number)
        keep_file = sorted_files[0]
        remove_files = sorted_files[1:]
        
        files_to_keep.append(keep_file)
        files_to_remove.extend(remove_files)
        
        print(f"\nGroup {i}: {len(files)} duplicates")
        print(f"  ✅ Keep: {keep_file.name} (lowest ID)")
        for f in remove_files:
            print(f"  ❌ Remove: {f.name}")
    
    print("\n" + "="*60)
    print(f"\nSummary:")
    print(f"  Keep: {len(files_to_keep)} files")
    print(f"  Remove: {len(files_to_remove)} files")
    
    # Ask for confirmation
    if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        print("\n🔍 DRY RUN - No files will be deleted")
        print("\nTo actually remove duplicates, run without --dry-run:")
        print(f"  python3 {sys.argv[0]}")
        return 0
    
    response = input("\n⚠️  Remove these duplicate files? (yes/no): ")
    if response.lower() != 'yes':
        print("Cancelled.")
        return 0
    
    # Remove duplicates from filtered directory
    removed_count = 0
    for f in files_to_remove:
        try:
            f.unlink()
            removed_count += 1
            print(f"✅ Removed: {f.name}")
        except Exception as e:
            print(f"❌ Error removing {f.name}: {e}", file=sys.stderr)
    
    # Also remove from raw directory if they exist
    print("\nChecking raw directory...")
    raw_removed = 0
    for f in files_to_remove:
        raw_file = raw_dir / f.name
        if raw_file.exists():
            try:
                raw_file.unlink()
                raw_removed += 1
                print(f"✅ Removed from raw: {raw_file.name}")
            except Exception as e:
                print(f"❌ Error removing {raw_file.name}: {e}", file=sys.stderr)
    
    print("\n" + "="*60)
    print(f"✅ Cleanup complete!")
    print(f"  Removed from filtered: {removed_count} files")
    print(f"  Removed from raw: {raw_removed} files")
    print(f"  Kept: {len(files_to_keep)} unique conversations")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

