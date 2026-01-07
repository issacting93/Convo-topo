#!/usr/bin/env python3
"""
Fix conversations missing role distributions by re-classifying them.

Usage:
    # Dry run (see what would be fixed)
    python3 scripts/fix-missing-roles.py --dry-run
    
    # Actually fix (requires OPENAI_API_KEY)
    export OPENAI_API_KEY=your-key-here
    python3 scripts/fix-missing-roles.py
"""

import json
import sys
import os
import argparse
from pathlib import Path
from datetime import datetime

# Add classifier to path
sys.path.insert(0, str(Path(__file__).parent.parent))

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

def has_valid_role_distribution(role_data: dict) -> bool:
    """Check if role has valid distribution"""
    if not role_data:
        return False
    dist = role_data.get('distribution', {})
    if not dist:
        return False
    return any(v > 0 for v in dist.values())

def main():
    parser = argparse.ArgumentParser(description='Fix conversations missing role distributions')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fixed without making changes')
    parser.add_argument('--limit', type=int, help='Limit number of conversations to fix (for testing)')
    args = parser.parse_args()
    
    print("=" * 80)
    print("FIX MISSING ROLES")
    print("=" * 80)
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    print("")
    
    # Load issue lists
    missing_human = load_issue_list("missing-humanRole.json")
    missing_ai = load_issue_list("missing-aiRole.json")
    
    # Combine and deduplicate
    all_missing = {}
    for item in missing_human + missing_ai:
        conv_id = item['id']
        if conv_id not in all_missing:
            all_missing[conv_id] = item
    
    missing_list = list(all_missing.values())
    
    if args.limit:
        missing_list = missing_list[:args.limit]
        print(f"⚠️  Limited to first {args.limit} conversations")
    
    print(f"Found {len(missing_list)} conversations with missing roles")
    print("")
    
    if not args.dry_run:
        # Check for API key
        if not os.getenv('OPENAI_API_KEY'):
            print("❌ OPENAI_API_KEY not set")
            print("   Set it with: export OPENAI_API_KEY=your-key-here")
            return
        
        # Import classifier
        try:
            sys.path.insert(0, str(Path(__file__).parent.parent / "classifier"))
            import importlib.util
            spec = importlib.util.spec_from_file_location("classifier_openai",
                Path(__file__).parent.parent / "classifier" / "classifier-openai.py")
            classifier_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(classifier_module)
            classify_conversation = classifier_module.classify_conversation
        except ImportError as e:
            print(f"❌ Error importing classifier: {e}")
            print("   Make sure you're running from project root")
            return
    
    results = {
        'total': len(missing_list),
        'fixed': 0,
        'failed': 0,
        'skipped': 0,
        'already_fixed': 0
    }
    
    for item in missing_list:
        filename = item['file']
        conv_id = item['id']
        
        print(f"Processing: {filename}...")
        
        try:
            conversation = load_conversation(filename)
            
            # Check current state
            classification = conversation.get('classification', {})
            if not classification:
                print(f"  ⚠️  No classification found, skipping")
                results['skipped'] += 1
                continue
            
            human_role = classification.get('humanRole', {})
            ai_role = classification.get('aiRole', {})
            
            has_human = has_valid_role_distribution(human_role)
            has_ai = has_valid_role_distribution(ai_role)
            
            if has_human and has_ai:
                print(f"  ✅ Already has roles, skipping")
                results['already_fixed'] += 1
                continue
            
            if args.dry_run:
                print(f"  [DRY RUN] Would re-classify (missing: humanRole={not has_human}, aiRole={not has_ai})")
                results['fixed'] += 1
            else:
                print(f"  Re-classifying...")
                
                # Re-classify
                from openai import OpenAI
                client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
                
                # Prepare conversation for classification
                messages = conversation.get('messages', [])
                if not messages:
                    print(f"  ⚠️  No messages found, skipping")
                    results['skipped'] += 1
                    continue
                
                # Call classifier
                try:
                    updated = classify_conversation(client, conversation)
                    
                    if updated and updated.get('classification'):
                        new_class = updated['classification']
                        new_has_human = has_valid_role_distribution(new_class.get('humanRole', {}))
                        new_has_ai = has_valid_role_distribution(new_class.get('aiRole', {}))
                        
                        if new_has_human and new_has_ai:
                            # Preserve existing PAD data
                            if conversation.get('messages'):
                                for i, msg in enumerate(conversation['messages']):
                                    if i < len(updated.get('messages', [])):
                                        if msg.get('pad'):
                                            updated['messages'][i]['pad'] = msg['pad']
                            
                            save_conversation(updated, filename)
                            print(f"  ✅ Fixed: {filename}")
                            results['fixed'] += 1
                        else:
                            print(f"  ⚠️  Still missing roles after classification")
                            print(f"      humanRole: {new_has_human}, aiRole: {new_has_ai}")
                            results['failed'] += 1
                    else:
                        print(f"  ❌ Classification returned no data")
                        results['failed'] += 1
                except Exception as e:
                    print(f"  ❌ Error during classification: {e}")
                    results['failed'] += 1
        
        except Exception as e:
            print(f"  ❌ Error processing {filename}: {e}")
            results['failed'] += 1
    
    print("")
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total: {results['total']}")
    print(f"Fixed: {results['fixed']}")
    print(f"Failed: {results['failed']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Already fixed: {results['already_fixed']}")
    
    if args.dry_run:
        print("\n🔍 This was a dry run. Run without --dry-run to apply fixes.")
    else:
        print("\n✅ Done! Re-run identify-data-quality-issues.py to verify.")

if __name__ == "__main__":
    main()

