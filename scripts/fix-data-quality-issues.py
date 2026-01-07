#!/usr/bin/env python3
"""
Fix data quality issues in classified conversations:
1. Re-classify conversations missing roles
2. Add metadata to conversations missing it (where possible)
3. Re-classify Ollama conversations with quality issues

Usage:
    # Dry run (show what would be fixed)
    python3 scripts/fix-data-quality-issues.py --dry-run
    
    # Fix missing roles only
    python3 scripts/fix-data-quality-issues.py --fix-roles
    
    # Fix missing metadata only
    python3 scripts/fix-data-quality-issues.py --fix-metadata
    
    # Re-classify Ollama conversations
    python3 scripts/fix-data-quality-issues.py --fix-ollama
    
    # Fix all issues
    python3 scripts/fix-data-quality-issues.py --fix-all
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional
import argparse

# Add classifier directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "classifier"))

OUTPUT_DIR = Path("public/output")
ISSUES_DIR = Path("reports/data-quality-issues")

def load_issue_lists() -> Dict[str, List[Dict]]:
    """Load issue lists from JSON files"""
    issues = {
        'missing_metadata': [],
        'missing_humanRole': [],
        'missing_aiRole': [],
        'ollama': []
    }
    
    if ISSUES_DIR.exists():
        for key, filename in [
            ('missing_metadata', 'missing-metadata.json'),
            ('missing_humanRole', 'missing-humanRole.json'),
            ('missing_aiRole', 'missing-aiRole.json'),
            ('ollama', 'ollama-conversations.json')
        ]:
            file_path = ISSUES_DIR / filename
            if file_path.exists():
                with open(file_path, 'r') as f:
                    issues[key] = json.load(f)
    
    return issues

def load_conversation(filename: str) -> Optional[Dict]:
    """Load a conversation file"""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error loading {filename}: {e}")
        return None

def save_conversation(conversation: Dict, filename: str):
    """Save a conversation file"""
    file_path = OUTPUT_DIR / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(conversation, f, indent=2, ensure_ascii=False)

def backfill_metadata(conversation: Dict, provider: str = "unknown", model: str = "unknown") -> bool:
    """Attempt to backfill metadata from file or defaults"""
    if conversation.get('classificationMetadata'):
        return False  # Already has metadata
    
    # Try to infer from classification
    classification = conversation.get('classification', {})
    
    # Check if we can infer provider/model from existing data
    # (This is limited - mostly for documentation)
    
    metadata = {
        "model": model,
        "provider": provider,
        "timestamp": conversation.get('_last_modified', '2025-01-01T00:00:00Z'),
        "promptVersion": "v1.1",
        "processingTimeMs": 0  # Unknown
    }
    
    conversation['classificationMetadata'] = metadata
    return True

def classify_conversation(conversation: Dict, use_openai: bool = True) -> Optional[Dict]:
    """Re-classify a conversation using OpenAI or Claude"""
    try:
        if use_openai:
            from classifier.classifier_openai import classify_conversation_openai
            return classify_conversation_openai(conversation)
        else:
            from classifier.classifier_v1_1 import classify_conversation
            return classify_conversation(conversation)
    except ImportError:
        print("⚠️  Classifier modules not available. Run from project root.")
        return None
    except Exception as e:
        print(f"⚠️  Classification error: {e}")
        return None

def fix_missing_roles(conversations: List[Dict], dry_run: bool = False) -> Dict:
    """Fix conversations missing role distributions"""
    results = {
        'total': len(conversations),
        'fixed': 0,
        'failed': 0,
        'skipped': 0
    }
    
    print(f"\n🔧 Fixing missing roles for {len(conversations)} conversations...")
    
    for conv_info in conversations:
        filename = conv_info['file']
        conv_id = conv_info['id']
        
        conversation = load_conversation(filename)
        if not conversation:
            results['skipped'] += 1
            continue
        
        classification = conversation.get('classification', {})
        if not classification:
            results['skipped'] += 1
            continue
        
        # Check what's missing
        missing_human = not classification.get('humanRole', {}).get('distribution') or \
                       all(v == 0 for v in classification.get('humanRole', {}).get('distribution', {}).values())
        missing_ai = not classification.get('aiRole', {}).get('distribution') or \
                    all(v == 0 for v in classification.get('aiRole', {}).get('distribution', {}).values())
        
        if not missing_human and not missing_ai:
            results['skipped'] += 1
            continue
        
        if dry_run:
            print(f"  [DRY RUN] Would re-classify: {filename} (missing: humanRole={missing_human}, aiRole={missing_ai})")
            results['fixed'] += 1
        else:
            print(f"  Re-classifying: {filename}...")
            try:
                # Re-classify using OpenAI
                updated = classify_conversation(conversation, use_openai=True)
                if updated and updated.get('classification'):
                    # Check if roles are now present
                    new_class = updated['classification']
                    has_human = new_class.get('humanRole', {}).get('distribution') and \
                               any(v > 0 for v in new_class.get('humanRole', {}).get('distribution', {}).values())
                    has_ai = new_class.get('aiRole', {}).get('distribution') and \
                            any(v > 0 for v in new_class.get('aiRole', {}).get('distribution', {}).values())
                    
                    if has_human and has_ai:
                        save_conversation(updated, filename)
                        print(f"    ✅ Fixed: {filename}")
                        results['fixed'] += 1
                    else:
                        print(f"    ⚠️  Still missing roles: {filename}")
                        results['failed'] += 1
                else:
                    print(f"    ❌ Classification failed: {filename}")
                    results['failed'] += 1
            except Exception as e:
                print(f"    ❌ Error: {filename} - {e}")
                results['failed'] += 1
    
    return results

def fix_missing_metadata(conversations: List[Dict], dry_run: bool = False) -> Dict:
    """Fix conversations missing metadata"""
    results = {
        'total': len(conversations),
        'fixed': 0,
        'skipped': 0
    }
    
    print(f"\n🔧 Fixing missing metadata for {len(conversations)} conversations...")
    print("   Note: Can only backfill with defaults (provider='unknown', model='unknown')")
    print("   For accurate metadata, re-classify conversations.")
    
    for conv_info in conversations:
        filename = conv_info['file']
        conversation = load_conversation(filename)
        if not conversation:
            results['skipped'] += 1
            continue
        
        if conversation.get('classificationMetadata'):
            results['skipped'] += 1
            continue
        
        if dry_run:
            print(f"  [DRY RUN] Would add metadata: {filename}")
            results['fixed'] += 1
        else:
            # Backfill with defaults
            if backfill_metadata(conversation):
                save_conversation(conversation, filename)
                print(f"  ✅ Added metadata: {filename}")
                results['fixed'] += 1
            else:
                results['skipped'] += 1
    
    return results

def fix_ollama_conversations(conversations: List[Dict], dry_run: bool = False) -> Dict:
    """Re-classify Ollama conversations with quality issues"""
    results = {
        'total': len(conversations),
        'fixed': 0,
        'failed': 0,
        'skipped': 0
    }
    
    print(f"\n🔧 Re-classifying {len(conversations)} Ollama conversations...")
    print("   This will use OpenAI GPT-4 for better quality.")
    
    for conv_info in conversations:
        filename = conv_info['file']
        conversation = load_conversation(filename)
        if not conversation:
            results['skipped'] += 1
            continue
        
        if dry_run:
            print(f"  [DRY RUN] Would re-classify: {filename}")
            results['fixed'] += 1
        else:
            print(f"  Re-classifying: {filename}...")
            try:
                updated = classify_conversation(conversation, use_openai=True)
                if updated and updated.get('classification'):
                    save_conversation(updated, filename)
                    print(f"    ✅ Re-classified: {filename}")
                    results['fixed'] += 1
                else:
                    print(f"    ❌ Classification failed: {filename}")
                    results['failed'] += 1
            except Exception as e:
                print(f"    ❌ Error: {filename} - {e}")
                results['failed'] += 1
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Fix data quality issues in classified conversations')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fixed without making changes')
    parser.add_argument('--fix-roles', action='store_true', help='Fix missing role distributions')
    parser.add_argument('--fix-metadata', action='store_true', help='Fix missing metadata')
    parser.add_argument('--fix-ollama', action='store_true', help='Re-classify Ollama conversations')
    parser.add_argument('--fix-all', action='store_true', help='Fix all issues')
    
    args = parser.parse_args()
    
    if not any([args.fix_roles, args.fix_metadata, args.fix_ollama, args.fix_all]):
        parser.print_help()
        print("\n⚠️  No action specified. Use --fix-roles, --fix-metadata, --fix-ollama, or --fix-all")
        return
    
    print("=" * 80)
    print("DATA QUALITY FIX SCRIPT")
    print("=" * 80)
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    print("")
    
    # Load issue lists
    issues = load_issue_lists()
    
    if not issues['missing_metadata'] and not issues['missing_humanRole'] and not issues['missing_aiRole']:
        print("⚠️  No issue lists found. Run identify-data-quality-issues.py first.")
        return
    
    # Combine missing roles
    missing_roles = []
    missing_roles_ids = set()
    for item in issues['missing_humanRole']:
        if item['id'] not in missing_roles_ids:
            missing_roles.append(item)
            missing_roles_ids.add(item['id'])
    for item in issues['missing_aiRole']:
        if item['id'] not in missing_roles_ids:
            missing_roles.append(item)
            missing_roles_ids.add(item['id'])
    
    total_fixed = 0
    total_failed = 0
    
    # Fix missing roles
    if args.fix_roles or args.fix_all:
        results = fix_missing_roles(missing_roles, dry_run=args.dry_run)
        total_fixed += results['fixed']
        total_failed += results['failed']
        print(f"\n✅ Fixed: {results['fixed']}, Failed: {results['failed']}, Skipped: {results['skipped']}")
    
    # Fix missing metadata
    if args.fix_metadata or args.fix_all:
        results = fix_missing_metadata(issues['missing_metadata'], dry_run=args.dry_run)
        total_fixed += results['fixed']
        print(f"\n✅ Fixed: {results['fixed']}, Skipped: {results['skipped']}")
    
    # Fix Ollama conversations
    if args.fix_ollama or args.fix_all:
        results = fix_ollama_conversations(issues['ollama'], dry_run=args.dry_run)
        total_fixed += results['fixed']
        total_failed += results['failed']
        print(f"\n✅ Fixed: {results['fixed']}, Failed: {results['failed']}, Skipped: {results['skipped']}")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total fixed: {total_fixed}")
    print(f"Total failed: {total_failed}")
    
    if args.dry_run:
        print("\n🔍 This was a dry run. Run without --dry-run to apply fixes.")
    else:
        print("\n✅ Fixes applied. Re-run identify-data-quality-issues.py to verify.")

if __name__ == "__main__":
    main()

