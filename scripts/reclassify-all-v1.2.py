#!/usr/bin/env python3
"""
Reclassify All Conversations with v1.2

This script reclassifies all conversations in public/output using the enhanced
v1.2 classifier with corrections.

Usage:
    # Reclassify all (with safety backup)
    python3 scripts/reclassify-all-v1.2.py --all

    # Dry run (show what would be done)
    python3 scripts/reclassify-all-v1.2.py --all --dry-run

    # Reclassify only conversations with specific patterns
    python3 scripts/reclassify-all-v1.2.py --pattern pseudo-problem-solving

    # Reclassify specific conversations by ID
    python3 scripts/reclassify-all-v1.2.py --ids chatbot_arena_16515 chatbot_arena_1882

    # Use different model
    python3 scripts/reclassify-all-v1.2.py --all --model gpt-4o-mini

    # Test on sample first
    python3 scripts/reclassify-all-v1.2.py --all --limit 10
"""

import json
import os
import sys
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set

def backup_output_directory(output_dir: Path, backup_dir: Path, auto_yes: bool = False):
    """Create safety backup of output directory"""
    if backup_dir.exists():
        print(f"⚠️  Backup already exists: {backup_dir}")
        if not auto_yes:
            response = input("Overwrite existing backup? (yes/no): ").strip().lower()
            if response not in ['yes', 'y']:
                print("❌ Cancelled")
                sys.exit(1)
        else:
            print("✅ Auto-overwriting backup (--yes flag)")
        shutil.rmtree(backup_dir)

    print(f"📦 Creating backup: {output_dir} → {backup_dir}")
    shutil.copytree(output_dir, backup_dir)
    print(f"✅ Backup created: {backup_dir}")

def get_all_conversation_files(output_dir: Path) -> List[Path]:
    """Get all conversation JSON files"""
    files = []
    for f in output_dir.glob('*.json'):
        if f.name == 'manifest.json':
            continue
        if not f.name.endswith('-error.json'):  # Skip error files
            files.append(f)
    return sorted(files)

def detect_pattern_in_conversation(conv_path: Path, pattern: str) -> bool:
    """
    Detect if conversation matches a specific misclassification pattern
    without full reclassification
    """
    try:
        with open(conv_path) as f:
            conv = json.load(f)

        messages = conv.get('messages', [])
        classification = conv.get('classification', {})

        if pattern == 'pseudo-problem-solving':
            # Check for high questions + high arousal + seeker-heavy
            user_messages = [m for m in messages if m.get('role') == 'user']
            questions = sum(1 for m in user_messages if '?' in m.get('content', ''))

            user_pad = [m.get('pad', {}) for m in user_messages if 'pad' in m]
            if not user_pad:
                return False
            avg_arousal = sum(p.get('arousal', 0) for p in user_pad) / len(user_pad)

            human_roles = classification.get('humanRole', {}).get('distribution', {})
            seeker_pct = human_roles.get('seeker', 0)

            return questions >= 3 and avg_arousal > 0.5 and seeker_pct > 0.5

        elif pattern == 'seeker-heavy':
            # Seeker > 50%
            human_roles = classification.get('humanRole', {}).get('distribution', {})
            return human_roles.get('seeker', 0) > 0.5

        elif pattern == 'collaboration':
            # Look for feedback keywords
            user_messages = [m for m in messages if m.get('role') == 'user']
            feedback_keywords = ['improve', 'better', 'issues', 'problems', 'fix', 'change']
            feedback_count = 0
            for msg in user_messages:
                content = msg.get('content', '').lower()
                feedback_count += sum(1 for kw in feedback_keywords if kw in content)
            return feedback_count >= 2

        elif pattern == 'emotional-context':
            # High arousal but low affiliative
            user_messages = [m for m in messages if m.get('role') == 'user']
            user_pad = [m.get('pad', {}) for m in user_messages if 'pad' in m]
            if not user_pad:
                return False
            avg_arousal = sum(p.get('arousal', 0) for p in user_pad) / len(user_pad)

            ai_roles = classification.get('aiRole', {}).get('distribution', {})
            affiliative_pct = ai_roles.get('affiliative', 0)

            return avg_arousal > 0.5 and affiliative_pct < 0.15

        return False

    except Exception as e:
        print(f"⚠️  Error checking pattern in {conv_path.name}: {e}")
        return False

def reclassify_file(file_path: Path, model: str = "gpt-4o-mini", output_dir: Path = None) -> bool:
    """Reclassify a single conversation file using v1.2 classifier"""
    classifier_script = Path('classifier/classifier-openai-v1.2.py')

    if not classifier_script.exists():
        print(f"❌ Classifier script not found: {classifier_script}")
        return False

    if output_dir is None:
        output_dir = file_path.parent

    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        'python3',
        str(classifier_script),
        str(file_path),
        'output.json',  # Dummy (we use --individual)
        '--individual',
        '--output-dir',
        str(output_dir),
        '--model',
        model
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode == 0:
            # Verify output
            output_file = output_dir / file_path.name
            if output_file.exists():
                try:
                    with open(output_file) as f:
                        output_conv = json.load(f)
                    if 'classification' in output_conv and output_conv['classification']:
                        return True
                except:
                    pass
            return False
        else:
            if "quota" in result.stdout.lower() or "429" in result.stdout:
                print(f"\n❌ API quota exceeded - please wait or use different key")
                return False
            return False

    except subprocess.TimeoutExpired:
        print(f"\n⏱️  Timeout: {file_path.name}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Reclassify conversations with v1.2')
    parser.add_argument('--all', action='store_true', help='Reclassify all conversations')
    parser.add_argument('--ids', nargs='+', help='Specific conversation IDs to reclassify')
    parser.add_argument('--pattern', choices=['pseudo-problem-solving', 'seeker-heavy', 'collaboration', 'emotional-context'],
                       help='Reclassify only conversations matching this pattern')
    parser.add_argument('--limit', type=int, help='Limit number of conversations')
    parser.add_argument('--model', type=str, default='gpt-4o-mini', help='OpenAI model (default: gpt-4o-mini)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')
    parser.add_argument('--no-backup', action='store_true', help='Skip backup creation')
    parser.add_argument('--yes', '-y', action='store_true', help='Skip confirmation')
    parser.add_argument('--output-dir', type=str, default='public/output', help='Output directory')
    parser.add_argument('--backup-dir', type=str, default='public/output-backup-v1.1', help='Backup directory')

    args = parser.parse_args()

    if not args.all and not args.ids and not args.pattern:
        parser.print_help()
        print("\n⚠️  Please specify --all, --ids, or --pattern")
        sys.exit(1)

    output_dir = Path(args.output_dir)
    backup_dir = Path(args.backup_dir)

    print("=" * 80)
    print("Reclassification Script v1.2")
    print("=" * 80)
    print()

    # Get files to reclassify
    if args.ids:
        # Specific IDs
        files = []
        for conv_id in args.ids:
            file_path = output_dir / f"{conv_id}.json"
            if file_path.exists():
                files.append(file_path)
            else:
                print(f"⚠️  File not found: {file_path}")
        if not files:
            print("❌ No valid files found")
            sys.exit(1)

    elif args.pattern:
        # Pattern matching
        print(f"🔍 Scanning for pattern: {args.pattern}")
        all_files = get_all_conversation_files(output_dir)
        files = []
        for f in all_files:
            if detect_pattern_in_conversation(f, args.pattern):
                files.append(f)
        print(f"✅ Found {len(files)} conversations matching pattern")

    else:
        # All files
        files = get_all_conversation_files(output_dir)

    if args.limit:
        files = files[:args.limit]

    if not files:
        print("❌ No files to reclassify")
        sys.exit(1)

    print(f"\n📊 Files to reclassify: {len(files)}")
    print(f"🤖 Model: {args.model}")
    print(f"💰 Estimated cost: ${len(files) * 0.02:.2f} (at ~$0.02/conv)")
    print()

    # Show sample
    print("Sample files:")
    for i, f in enumerate(files[:10], 1):
        print(f"  {i}. {f.name}")
    if len(files) > 10:
        print(f"  ... and {len(files) - 10} more")
    print()

    if args.dry_run:
        print("🔍 DRY RUN - No files will be modified")
        return

    # Create backup unless skipped
    if not args.no_backup:
        backup_output_directory(output_dir, backup_dir, auto_yes=args.yes)
        print()

    # Confirmation
    if not args.yes:
        print(f"⚠️  This will reclassify {len(files)} conversations")
        print(f"   Backup created at: {backup_dir}")
        print(f"   Model: {args.model}")
        print()
        try:
            response = input("Continue? (yes/no): ").strip().lower()
            if response not in ['yes', 'y']:
                print("❌ Cancelled")
                return
        except (EOFError, KeyboardInterrupt):
            print("\n❌ Cancelled")
            return

    # Reclassify
    print()
    print("=" * 80)
    print("Reclassifying...")
    print("=" * 80)
    print()

    successful = 0
    failed = 0
    start_time = datetime.now()

    for i, file_path in enumerate(files, 1):
        print(f"[{i}/{len(files)}] {file_path.name}...", end=" ", flush=True)

        success = reclassify_file(file_path, args.model, output_dir)

        if success:
            successful += 1
            print("✅")
        else:
            failed += 1
            print("❌")

        # Small delay between requests
        if i < len(files):
            time.sleep(0.3)

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # Summary
    print()
    print("=" * 80)
    print("Summary")
    print("=" * 80)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success rate: {(successful/len(files)*100):.1f}%")
    print(f"⏱️  Duration: {int(duration // 60)}m {int(duration % 60)}s")
    print()

    if not args.no_backup:
        print(f"💾 Backup saved at: {backup_dir}")
        print(f"   (to restore: rm -rf {output_dir} && mv {backup_dir} {output_dir})")
        print()

    if successful > 0:
        print("🔄 Regenerating manifest...")
        try:
            result = subprocess.run(
                ['node', 'scripts/generate-manifest.js'],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                print("✅ Manifest updated")
            else:
                print("⚠️  Manifest update failed (run manually: node scripts/generate-manifest.js)")
        except:
            print("⚠️  Could not update manifest (run manually: node scripts/generate-manifest.js)")
        print()

    print("✅ Reclassification complete!")

if __name__ == '__main__':
    import time
    main()
