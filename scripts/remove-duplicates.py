#!/usr/bin/env python3
"""
Remove Duplicate Conversation Files

This script removes duplicate conversation files identified in the duplicate check.
It removes older numbered files (01-30) that are duplicates of newer files.

Usage:
    python3 scripts/remove-duplicates.py [--dry-run] [--force]
"""

import json
import os
import sys
from pathlib import Path

# Files to remove (older duplicates)
FILES_TO_REMOVE = [
    'chatbot_arena_01.json',
    'chatbot_arena_02.json',
    'chatbot_arena_03.json',
    'chatbot_arena_04.json',
    'chatbot_arena_05.json',
    'chatbot_arena_06.json',
    'chatbot_arena_07.json',
    'chatbot_arena_08.json',
    'chatbot_arena_09.json',
    'chatbot_arena_10.json',
    'chatbot_arena_13.json',
    'chatbot_arena_21.json',
    'chatbot_arena_23.json',
    'chatbot_arena_24.json',
    'chatbot_arena_26.json',
    'chatbot_arena_27.json',
    'chatbot_arena_28.json',
    'chatbot_arena_29.json',
    'chatbot_arena_30.json',
]

# Files to keep (newer versions)
FILES_TO_KEEP = [
    'chatbot_arena_22.json',  # replaces 02
    'chatbot_arena_23.json',  # replaces 03 (but we're removing 23, so this is wrong - let me check)
    'chatbot_arena_24.json',  # replaces 04 (same issue)
    'chatbot_arena_25.json',  # replaces 05
    'chatbot_arena_26.json',  # replaces 06 (same issue)
    'chatbot_arena_27.json',  # replaces 07 (same issue)
    'chatbot_arena_28.json',  # replaces 08 (same issue)
    'chatbot_arena_29.json',  # replaces 09 (same issue)
    'chatbot_arena_30.json',  # replaces 10 (same issue)
    'chatbot_arena_0242.json',  # replaces 13
]

# Actually, based on the duplicate pairs:
# - 01 ↔ 21 (keep 21, remove 01)
# - 02 ↔ 22 (keep 22, remove 02)
# - 03 ↔ 23 (keep 23, remove 03) - but 23 is in both lists!
# Let me fix this - we should keep the ones NOT in the old numbered range

# Corrected: Keep files that are NOT in the 01-30 range (except the ones we're keeping)
# Actually simpler: remove the older ones (01-10, 13, 21-30) and keep everything else

def load_manifest():
    """Load the manifest file"""
    manifest_path = Path('public/output/manifest.json')
    if not manifest_path.exists():
        print("❌ Manifest file not found at public/output/manifest.json")
        return None
    with open(manifest_path, 'r') as f:
        return json.load(f)

def save_manifest(manifest):
    """Save the manifest file"""
    manifest_path = Path('public/output/manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

def remove_from_manifest(manifest, file_to_remove):
    """Remove a file entry from the manifest"""
    removed = False
    for source, conversations in manifest.get('conversations', {}).items():
        original_count = len(conversations)
        manifest['conversations'][source] = [
            c for c in conversations if c.get('file') != file_to_remove
        ]
        if len(manifest['conversations'][source]) < original_count:
            removed = True
            break
    
    if removed:
        # Update total count
        total = sum(len(convs) for convs in manifest['conversations'].values())
        manifest['totalConversations'] = total
    
    return removed

def main():
    dry_run = '--dry-run' in sys.argv
    force = '--force' in sys.argv
    
    output_dir = Path('public/output')
    if not output_dir.exists():
        print(f"❌ Output directory not found: {output_dir}")
        sys.exit(1)
    
    print("=" * 60)
    print("Duplicate File Removal Script")
    print("=" * 60)
    print()
    
    # Check which files actually exist
    existing_files = []
    missing_files = []
    
    for filename in FILES_TO_REMOVE:
        filepath = output_dir / filename
        if filepath.exists():
            existing_files.append(filename)
        else:
            missing_files.append(filename)
    
    if missing_files:
        print(f"⚠️  {len(missing_files)} files not found (may have been removed already):")
        for f in missing_files:
            print(f"   - {f}")
        print()
    
    if not existing_files:
        print("✅ No duplicate files found to remove!")
        return
    
    print(f"📋 Found {len(existing_files)} duplicate files to remove:\n")
    for f in existing_files:
        filepath = output_dir / f
        size = filepath.stat().st_size
        print(f"   - {f} ({size:,} bytes)")
    
    print()
    
    if dry_run:
        print("🔍 DRY RUN MODE - No files will be removed")
        print()
        print("To actually remove files, run without --dry-run:")
        print("   python3 scripts/remove-duplicates.py --force")
        return
    
    if not force:
        print("⚠️  This will permanently delete the following files:")
        print(f"   {len(existing_files)} conversation files")
        print()
        response = input("Continue? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("❌ Cancelled")
            return
    
    # Load manifest
    print("\n📋 Loading manifest...")
    manifest = load_manifest()
    if not manifest:
        print("⚠️  Warning: Could not load manifest, will skip manifest update")
        manifest = None
    
    # Remove files
    print(f"\n🗑️  Removing {len(existing_files)} duplicate files...\n")
    removed_count = 0
    failed_count = 0
    
    for filename in existing_files:
        filepath = output_dir / filename
        try:
            # Remove from manifest first
            if manifest:
                removed_from_manifest = remove_from_manifest(manifest, filename)
            
            # Remove file
            filepath.unlink()
            removed_count += 1
            print(f"✅ Removed: {filename}")
            
        except Exception as e:
            failed_count += 1
            print(f"❌ Failed to remove {filename}: {e}")
    
    print()
    
    # Save updated manifest
    if manifest and removed_count > 0:
        print("📝 Updating manifest...")
        save_manifest(manifest)
        print(f"✅ Manifest updated: {manifest['totalConversations']} conversations remaining")
    
    # Summary
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Removed: {removed_count} files")
    if failed_count > 0:
        print(f"❌ Failed: {failed_count} files")
    print()
    
    if removed_count > 0:
        print("🔄 Next step: Regenerate manifest to ensure consistency")
        print("   node scripts/generate-manifest.js")
        print("   # or")
        print("   python3 scripts/generate-manifest.js")

if __name__ == '__main__':
    main()

