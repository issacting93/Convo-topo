#!/usr/bin/env python3
"""
Backfill missing classification metadata with defaults.

This adds default metadata to conversations that are missing it.
Note: This uses placeholder values. For accurate metadata, re-classify conversations.

Usage:
    # Dry run
    python3 scripts/backfill-metadata.py --dry-run
    
    # Actually backfill
    python3 scripts/backfill-metadata.py
"""

import json
import argparse
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path("public/output")
ISSUES_DIR = Path("reports/data-quality-issues")

def load_issue_list(filename: str) -> list:
    """Load an issue list JSON file"""
    file_path = ISSUES_DIR / filename
    if not file_path.exists():
        return []
    with open(file_path, 'r') as f:
        return json.load(f)

def load_conversation(filename: str) -> dict:
    """Load a conversation file"""
    file_path = OUTPUT_DIR / filename
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_conversation(conversation: dict, filename: str):
    """Save a conversation file"""
    file_path = OUTPUT_DIR / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(conversation, f, indent=2, ensure_ascii=False)

def infer_provider_from_file(conversation: dict, filename: str) -> tuple:
    """Try to infer provider/model from conversation data"""
    # Check if there are any hints in the classification
    classification = conversation.get('classification', {})
    
    # Check file name patterns
    if 'oasst' in filename.lower():
        return 'openassistant', 'unknown'
    elif 'chatbot_arena' in filename.lower():
        return 'unknown', 'unknown'  # Could be various sources
    
    # Default
    return 'unknown', 'unknown'

def main():
    parser = argparse.ArgumentParser(description='Backfill missing classification metadata')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fixed without making changes')
    args = parser.parse_args()
    
    print("=" * 80)
    print("BACKFILL MISSING METADATA")
    print("=" * 80)
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    print("")
    print("⚠️  Note: This adds placeholder metadata (provider='unknown', model='unknown')")
    print("   For accurate metadata, re-classify conversations.")
    print("")
    
    # Load issue list
    missing_metadata = load_issue_list("missing-metadata.json")
    
    print(f"Found {len(missing_metadata)} conversations missing metadata")
    print("")
    
    results = {
        'total': len(missing_metadata),
        'fixed': 0,
        'skipped': 0
    }
    
    for item in missing_metadata:
        filename = item['file']
        conv_id = item['id']
        
        try:
            conversation = load_conversation(filename)
            
            # Check if already has metadata
            if conversation.get('classificationMetadata'):
                results['skipped'] += 1
                continue
            
            # Infer provider/model
            provider, model = infer_provider_from_file(conversation, filename)
            
            # Create default metadata
            metadata = {
                "model": model,
                "provider": provider,
                "timestamp": datetime.now().isoformat() + "Z",
                "promptVersion": "v1.1",
                "processingTimeMs": 0,
                "backfilled": True  # Flag to indicate this was backfilled
            }
            
            if args.dry_run:
                print(f"  [DRY RUN] Would add metadata to: {filename}")
                print(f"            provider={provider}, model={model}")
                results['fixed'] += 1
            else:
                conversation['classificationMetadata'] = metadata
                save_conversation(conversation, filename)
                print(f"  ✅ Added metadata: {filename}")
                results['fixed'] += 1
        
        except Exception as e:
            print(f"  ❌ Error processing {filename}: {e}")
    
    print("")
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total: {results['total']}")
    print(f"Fixed: {results['fixed']}")
    print(f"Skipped: {results['skipped']}")
    
    if args.dry_run:
        print("\n🔍 This was a dry run. Run without --dry-run to apply fixes.")
    else:
        print("\n✅ Done! Re-run identify-data-quality-issues.py to verify.")

if __name__ == "__main__":
    main()

