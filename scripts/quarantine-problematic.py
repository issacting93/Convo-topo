#!/usr/bin/env python3
"""
Quarantine or Remove Problematic Conversations

Moves problematic conversations to a quarantine directory or removes them.
"""

import json
import shutil
import sys
import subprocess
from pathlib import Path

def quarantine_conversations(
    source_dir: str = 'public/output',
    quarantine_dir: str = 'public/output-quarantine',
    dry_run: bool = False
):
    """Move problematic conversations to quarantine directory"""
    
    # Scan for problematic conversations using the detection script
    print("Scanning for problematic conversations...")
    problematic = []
    
    try:
        # First try loading the report JSON
        report_file = Path(__file__).parent.parent / 'docs/PROBLEMATIC_CONVERSATIONS_REPORT.json'
        if report_file.exists():
            with open(report_file) as f:
                report_data = json.load(f)
            problematic = report_data.get('problematic', [])
        else:
            # Run detection if report doesn't exist
            print("Running detection...")
            result = subprocess.run(
                ['python3', 'scripts/detect-problematic-conversations.py', '--directory', source_dir],
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent.parent
            )
            
            # Try loading report again
            if report_file.exists():
                with open(report_file) as f:
                    report_data = json.load(f)
                problematic = report_data.get('problematic', [])
    except Exception as e:
        print(f"⚠️  Error: {e}")
        print("Please run detection manually first:")
        print("  python3 scripts/detect-problematic-conversations.py")
        return
    
    if not problematic:
        print("✅ No problematic conversations found.")
        return
    
    print(f"\nFound {len(problematic)} problematic conversations.")
    
    if dry_run:
        print("\n🔍 DRY RUN - No files will be moved")
        print("\nFiles that would be quarantined:")
        for item in problematic:
            print(f"  - {item['file']}")
        return
    
    # Create quarantine directory
    quarantine_path = Path(quarantine_dir)
    quarantine_path.mkdir(parents=True, exist_ok=True)
    
    # Move files
    source_path = Path(source_dir)
    moved_count = 0
    
    for item in problematic:
        source_file = source_path / item['file']
        if source_file.exists():
            dest_file = quarantine_path / item['file']
            shutil.move(str(source_file), str(dest_file))
            moved_count += 1
            print(f"✅ Moved: {item['file']}")
        else:
            print(f"⚠️  File not found: {item['file']}")
    
    print(f"\n✅ Quarantined {moved_count} conversations to {quarantine_dir}")
    
    # Update manifest if it exists
    manifest_file = source_path / 'manifest.json'
    if manifest_file.exists():
        print("\n⚠️  Manifest file exists - you should regenerate it:")
        print(f"   node scripts/generate-manifest.js")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Quarantine problematic conversations')
    parser.add_argument('--source', '-s', default='public/output',
                       help='Source directory (default: public/output)')
    parser.add_argument('--quarantine', '-q', default='public/output-quarantine',
                       help='Quarantine directory (default: public/output-quarantine)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be quarantined without moving files')
    parser.add_argument('--remove', action='store_true',
                       help='Remove files instead of quarantining (destructive!)')
    
    args = parser.parse_args()
    
    if args.remove:
        print("⚠️  WARNING: This will DELETE problematic conversations!")
        response = input("Type 'yes' to confirm: ")
        if response.lower() != 'yes':
            print("❌ Cancelled")
            return
        
        # Scan and remove
        results = scan_directory(args.source)
        source_path = Path(args.source)
        removed = 0
        
        for item in results.get('problematic', []):
            file_path = source_path / item['file']
            if file_path.exists():
                file_path.unlink()
                removed += 1
                print(f"🗑️  Removed: {item['file']}")
        
        print(f"\n✅ Removed {removed} problematic conversations")
    else:
        quarantine_conversations(args.source, args.quarantine, args.dry_run)

if __name__ == '__main__':
    main()

