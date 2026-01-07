#!/usr/bin/env python3
"""
Batch Classify Unclassified Conversations

This script classifies unclassified conversations from conversations-selected/ and/or conversations-filtered/.

Usage:
    # Classify all unclassified in conversations-selected/
    python3 scripts/batch-classify-unclassified.py --selected

    # Classify unclassified in conversations-filtered/ (limit to N)
    python3 scripts/batch-classify-unclassified.py --filtered --limit 20

    # Use Ollama instead of OpenAI
    python3 scripts/batch-classify-unclassified.py --selected --ollama --model llama2

    # Dry run (show what would be classified)
    python3 scripts/batch-classify-unclassified.py --selected --dry-run
"""

import json
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Dict

def get_classified_ids():
    """Get set of all classified conversation IDs"""
    classified_ids = set()
    classified_dir = Path('public/output')
    
    if not classified_dir.exists():
        return classified_ids
    
    for f in classified_dir.glob('*.json'):
        if f.name == 'manifest.json':
            continue
        try:
            conv = json.load(open(f))
            conv_id = conv.get('id', f.stem)
            if 'classification' in conv:
                classified_ids.add(conv_id)
                classified_ids.add(f.stem)
        except:
            pass
    
    return classified_ids

def find_unclassified_in_directory(directory: str, classified_ids: set, limit: int = None) -> List[Dict]:
    """Find unclassified conversations in a directory"""
    if not os.path.exists(directory):
        return []
    
    unclassified = []
    files = sorted([f for f in os.listdir(directory) 
                   if f.endswith('.json') and not f.startswith('filtered_') and not f.startswith('selected_')])
    
    for filename in files:
        if limit and len(unclassified) >= limit:
            break
            
        filepath = Path(directory) / filename
        try:
            conv = json.load(open(filepath))
            conv_id = conv.get('id', filename.replace('.json', ''))
            msg_count = len(conv.get('messages', []))
            
            # Skip if no messages
            if msg_count == 0:
                continue
            
            # Check if already classified
            # Check by ID, filename stem, and if file exists in output
            filename_stem = filename.replace('.json', '')
            output_dir = Path('public/output')
            
            # Check if file exists (normal or -error version)
            file_exists_normal = (output_dir / filename).exists()
            file_exists_error = (output_dir / f"{filename_stem}-error.json").exists()
            
            # If error file exists, check if it has a valid classification
            if file_exists_error:
                try:
                    error_conv = json.load(open(output_dir / f"{filename_stem}-error.json"))
                    if 'classification' in error_conv:
                        c = error_conv['classification']
                        # Check if classification is valid (not null, and has at least interactionPattern or humanRole)
                        is_valid = (
                            c is not None and
                            isinstance(c, dict) and 
                            ('interactionPattern' in c or 'humanRole' in c)
                        )
                        is_classified = is_valid
                        # If there's a classificationError, it's not successfully classified
                        if error_conv.get('classificationError'):
                            is_classified = False
                    else:
                        is_classified = False
                except:
                    is_classified = False
            elif file_exists_normal:
                try:
                    normal_conv = json.load(open(output_dir / filename))
                    if 'classification' in normal_conv:
                        is_classified = True
                    else:
                        is_classified = False
                except:
                    is_classified = False
            else:
                # File doesn't exist, check by ID
                is_classified = (
                    conv_id in classified_ids or
                    filename_stem in classified_ids
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

def classify_file(filepath: str, use_ollama: bool = False, model: str = "llama2", openai_model: str = "gpt-4o-mini") -> bool:
    """Classify a single conversation file"""
    filepath_obj = Path(filepath)
    filename = filepath_obj.name
    
    # Determine classifier script
    if use_ollama:
        classifier_script = Path('classifier/classifier-ollama.py')
        model_flag = f'--model {model}'
    else:
        classifier_script = Path('classifier/classifier-openai.py')
        model_flag = f'--model {openai_model}'
    
    if not classifier_script.exists():
        print(f"❌ Classifier script not found: {classifier_script}")
        return False
    
    # Output will be saved to public/output/{filename}
    output_dir = Path('public/output')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Build command
    cmd = [
        'python3',
        str(classifier_script),
        filepath,
        'output.json',  # Dummy output file (we use --individual)
        '--individual',
        '--output-dir',
        str(output_dir)
    ]
    
    # Add model flag for both Ollama and OpenAI
    if use_ollama:
        cmd.extend(['--model', model])
    else:
        # Use specified OpenAI model (defaults to gpt-4o-mini for higher context limit)
        cmd.extend(['--model', openai_model])
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout per file
        )
        
        if result.returncode == 0:
            # Verify output was created (check both normal and error filename)
            output_file = output_dir / filename
            error_output_file = output_dir / f"{Path(filename).stem}-error.json"
            
            # Check which file was created
            if output_file.exists():
                check_file = output_file
            elif error_output_file.exists():
                check_file = error_output_file
                # If error file exists, we might want to keep it or replace it
                # For now, check if it has a valid classification
            else:
                print(f"⚠️  Output file not created: {filename}")
                return False
            
            # Verify classification exists and is valid
            if output_file.exists():
                try:
                    output_conv = json.load(open(output_file))
                    if 'classification' in output_conv and output_conv['classification'] is not None:
                        # Check if it's a valid classification (not just null)
                        c = output_conv['classification']
                        if isinstance(c, dict) and ('interactionPattern' in c or 'humanRole' in c):
                            return True
                    # If classification is null or invalid, consider it failed
                    if output_conv.get('classificationError'):
                        print(f"⚠️  Classification error in output: {filename}")
                    return False
                except:
                    print(f"⚠️  Could not verify output: {filename}")
                    return False
        else:
            print(f"❌ Classification failed: {filename}")
            if result.stderr:
                # Show more of the error message, especially API errors
                error_text = result.stderr
                if len(error_text) > 500:
                    error_text = error_text[:500] + "..."
                print(f"   Error: {error_text}")
            if result.stdout:
                # Sometimes errors are in stdout
                if "quota" in result.stdout.lower() or "429" in result.stdout:
                    print(f"   Note: API quota exceeded - consider using Ollama")
                elif "insufficient_quota" in result.stdout.lower():
                    print(f"   Note: OpenAI quota exceeded - consider using Ollama")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏱️  Timeout: {filename} (exceeded 5 minutes)")
        return False
    except Exception as e:
        print(f"❌ Error classifying {filename}: {e}")
        return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch classify unclassified conversations')
    parser.add_argument('--selected', action='store_true', help='Classify unclassified in conversations-selected/')
    parser.add_argument('--filtered', action='store_true', help='Classify unclassified in conversations-filtered/')
    parser.add_argument('--directory', type=str, help='Custom directory to classify (e.g., public/output-wildchat)')
    parser.add_argument('--limit', type=int, help='Limit number of conversations to classify')
    parser.add_argument('--ollama', action='store_true', help='Use Ollama instead of OpenAI')
    parser.add_argument('--model', type=str, default='llama2', help='Model name (default: llama2 for Ollama, gpt-4 for OpenAI)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be classified without actually classifying')
    parser.add_argument('--skip-existing', action='store_true', help='Skip files that already exist in output')
    parser.add_argument('--yes', '-y', action='store_true', help='Skip confirmation prompt')
    
    args = parser.parse_args()
    
    if not args.selected and not args.filtered and not args.directory:
        parser.print_help()
        print("\n⚠️  Please specify --selected, --filtered, and/or --directory")
        sys.exit(1)
    
    print("=" * 60)
    print("Batch Classification Script")
    print("=" * 60)
    print()
    
    # Get classified IDs
    print("Loading classified conversations...")
    classified_ids = get_classified_ids()
    print(f"✅ Found {len(classified_ids)} already classified\n")
    
    # Find unclassified
    to_classify = []
    
    if args.selected:
        print("📁 Checking conversations-selected/...")
        unclassified = find_unclassified_in_directory('conversations-selected', classified_ids)
        to_classify.extend(unclassified)
        print(f"   Found {len(unclassified)} unclassified conversations")
        print()
    
    if args.filtered:
        print("📁 Checking conversations-filtered/...")
        unclassified = find_unclassified_in_directory('conversations-filtered', classified_ids, limit=args.limit)
        to_classify.extend(unclassified)
        print(f"   Found {len(unclassified)} unclassified conversations")
        print()
    
    if args.directory:
        print(f"📁 Checking {args.directory}/...")
        unclassified = find_unclassified_in_directory(args.directory, classified_ids, limit=args.limit)
        to_classify.extend(unclassified)
        print(f"   Found {len(unclassified)} unclassified conversations")
        print()
    
    if not to_classify:
        print("✅ No unclassified conversations found!")
        return
    
    # Apply limit
    if args.limit:
        to_classify = to_classify[:args.limit]
    
    # Filter out existing files if requested
    if args.skip_existing:
        output_dir = Path('public/output')
        existing_files = set(f.name for f in output_dir.glob('*.json') if f.name != 'manifest.json')
        original_count = len(to_classify)
        to_classify = [item for item in to_classify if item['file'] not in existing_files]
        skipped = original_count - len(to_classify)
        if skipped > 0:
            print(f"⏭️  Skipping {skipped} files that already exist in output/")
            print()
    
    # Show what will be classified
    print("=" * 60)
    print(f"Found {len(to_classify)} conversations to classify")
    print("=" * 60)
    print()
    
    provider = "Ollama" if args.ollama else "OpenAI"
    # Use gpt-4o-mini by default (higher context limit, cheaper than gpt-4)
    # User can override with --model flag
    if args.ollama:
        model_name = args.model
    else:
        model_name = args.model if args.model != 'llama2' else 'gpt-4o-mini'
    print(f"Provider: {provider}")
    print(f"Model: {model_name}")
    print()
    
    for i, item in enumerate(to_classify[:20], 1):
        print(f"  {i}. {item['file']} ({item['messages']} messages, id: {item['id']})")
    
    if len(to_classify) > 20:
        print(f"  ... and {len(to_classify) - 20} more")
    
    print()
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No files will be classified")
        print()
        print("To actually classify, run without --dry-run:")
        cmd = ' '.join(sys.argv).replace('--dry-run', '')
        print(f"   {cmd}")
        return
    
    # Confirm (unless --yes flag is set)
    if not args.yes:
        print(f"⚠️  This will classify {len(to_classify)} conversations using {provider} ({model_name})")
        if args.ollama:
            print("   (Using Ollama - free but may take longer)")
        else:
            print("   (Using OpenAI - costs ~$0.01-0.03 per conversation)")
        print()
        try:
            response = input("Continue? (yes/no): ").strip().lower()
            if response not in ['yes', 'y']:
                print("❌ Cancelled")
                return
        except (EOFError, KeyboardInterrupt):
            print("\n❌ Cancelled (use --yes to skip confirmation)")
            return
    
    # Classify
    print()
    print("=" * 60)
    print("Classifying Conversations")
    print("=" * 60)
    print()
    
    successful = 0
    failed = 0
    
    for i, item in enumerate(to_classify, 1):
        print(f"[{i}/{len(to_classify)}] {item['file']}...", end=" ", flush=True)
        
        # Determine OpenAI model to use
        if args.ollama:
            openai_model = "gpt-4o-mini"  # Not used for Ollama
        else:
            openai_model = args.model if args.model != 'llama2' else 'gpt-4o-mini'
        
        success = classify_file(item['path'], args.ollama, args.model, openai_model)
        
        if success:
            successful += 1
            print("✅")
        else:
            failed += 1
            print("❌")
        
        # Small delay between requests
        if i < len(to_classify):
            time.sleep(0.5 if args.ollama else 0.2)
    
    # Summary
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success rate: {(successful/len(to_classify)*100):.1f}%")
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
                print("⚠️  Manifest update failed (you may need to run manually)")
                print("   node scripts/generate-manifest.js")
        except:
            print("⚠️  Could not update manifest (you may need to run manually)")
            print("   node scripts/generate-manifest.js")
        print()

if __name__ == '__main__':
    import time
    main()

