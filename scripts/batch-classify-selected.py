#!/usr/bin/env python3
"""
Batch classify the 20 selected conversations.
Reads from conversations-selected/ and outputs to public/output/
"""

import json
import sys
from pathlib import Path
import subprocess
import time

def classify_conversation(input_file: Path, output_dir: Path) -> tuple[bool, str]:
    """Classify a single conversation file."""
    try:
        # Check if already classified
        output_file = output_dir / input_file.name
        if output_file.exists():
            # Check if it has classification
            try:
                with open(output_file, 'r') as f:
                    data = json.load(f)
                    if data.get('classification'):
                        return True, "Already classified"
            except:
                pass
        
        # Load conversation and wrap in array (classifier expects array)
        with open(input_file, 'r') as f:
            conversation = json.load(f)
        
        # Create temporary file with array format
        import tempfile
        temp_dir = Path("temp_classify")
        temp_dir.mkdir(exist_ok=True)
        temp_input = temp_dir / f"temp_{input_file.name}"
        with open(temp_input, 'w') as f:
            json.dump([conversation], f, indent=2)
        
        try:
            # Run classifier
            cmd = [
                sys.executable,
                "classifier/classifier-openai.py",
                str(temp_input),
                "temp_output.json",
                "--individual",
                "--output-dir",
                str(output_dir)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout per conversation
            )
            
            if result.returncode == 0:
                # Clean up temp file
                temp_input.unlink()
                return True, "Success"
            else:
                # Clean up temp file
                temp_input.unlink()
                return False, f"Error: {result.stderr[:200]}"
        finally:
            # Ensure temp file is cleaned up
            if temp_input.exists():
                temp_input.unlink()
            
    except subprocess.TimeoutExpired:
        return False, "Timeout"
    except Exception as e:
        return False, str(e)[:200]

def main():
    selected_dir = Path("conversations-selected")
    output_dir = Path("public/output")
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load manifest
    manifest_file = selected_dir / "selected_conversations_manifest.json"
    if not manifest_file.exists():
        print(f"❌ Manifest not found: {manifest_file}")
        return 1
    
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    conversations = manifest.get('conversations', [])
    
    if not conversations:
        print("❌ No conversations found in manifest")
        return 1
    
    print(f"🚀 Classifying {len(conversations)} selected conversations...")
    print(f"   Input: {selected_dir}")
    print(f"   Output: {output_dir}")
    print()
    
    results = {
        'success': [],
        'failed': [],
        'skipped': []
    }
    
    start_time = time.time()
    
    for i, conv_info in enumerate(conversations, 1):
        filename = conv_info['file']
        input_file = selected_dir / filename
        
        if not input_file.exists():
            print(f"  ⚠️  [{i}/{len(conversations)}] {filename} - File not found")
            results['failed'].append({'file': filename, 'reason': 'File not found'})
            continue
        
        print(f"  [{i}/{len(conversations)}] Classifying {filename}...", end=' ', flush=True)
        
        success, message = classify_conversation(input_file, output_dir)
        
        if success:
            if message == "Already classified":
                print(f"✅ Already classified")
                results['skipped'].append({'file': filename, 'reason': message})
            else:
                print(f"✅ Done")
                results['success'].append({'file': filename})
        else:
            print(f"❌ Failed: {message}")
            results['failed'].append({'file': filename, 'reason': message})
        
        # Small delay to avoid rate limiting
        if i < len(conversations):
            time.sleep(1)
    
    elapsed = time.time() - start_time
    
    print()
    print(f"✅ Classification complete!")
    print(f"   Success: {len(results['success'])}")
    print(f"   Skipped (already classified): {len(results['skipped'])}")
    print(f"   Failed: {len(results['failed'])}")
    print(f"   Time: {elapsed/60:.1f} minutes")
    print()
    
    # Save results
    results_file = output_dir / "classification_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            'summary': {
                'total': len(conversations),
                'success': len(results['success']),
                'skipped': len(results['skipped']),
                'failed': len(results['failed']),
                'elapsed_seconds': elapsed
            },
            'results': results
        }, f, indent=2)
    
    print(f"   Results saved to: {results_file}")
    
    if results['failed']:
        print()
        print("Failed conversations:")
        for fail in results['failed']:
            print(f"   - {fail['file']}: {fail['reason']}")
    
    return 0 if len(results['success']) > 0 else 1

if __name__ == "__main__":
    sys.exit(main())

