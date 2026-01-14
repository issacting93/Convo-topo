#!/usr/bin/env python3
"""
Batch Classify All Conversations in public/output with Reduced Role Taxonomy

This script:
1. Loads all conversations from public/output directory
2. Classifies them using the new 6-role taxonomy (3 human + 3 AI)
3. Saves updated classifications back to the files
"""

import json
import sys
import time
import importlib.util
from pathlib import Path
from typing import Dict, List

# Import the classifier module directly
classifier_path = Path(__file__).parent.parent / "classifier" / "classifier-ollama-reduced-roles.py"
spec = importlib.util.spec_from_file_location("classifier_ollama_reduced_roles", classifier_path)
classifier_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classifier_module)

classify_conversation_ollama = classifier_module.classify_conversation_ollama
load_few_shot_examples = classifier_module.load_few_shot_examples


def load_conversations_from_directory(directory: Path) -> List[Dict]:
    """Load all JSON conversations from directory"""
    conversations = []
    
    # Get all JSON files except manifest.json
    json_files = [f for f in directory.glob("*.json") if f.name != "manifest.json"]
    
    print(f"📂 Loading conversations from {directory}...")
    
    for json_file in sorted(json_files):
        try:
            with open(json_file, 'r') as f:
                conv = json.load(f)
                
            # Ensure messages are present
            if 'messages' not in conv or not conv['messages']:
                print(f"  ⚠️  Skipping {json_file.name}: No messages")
                continue
            
            conversations.append(conv)
            
        except Exception as e:
            print(f"  ❌ Error loading {json_file.name}: {e}")
            continue
    
    print(f"  ✅ Loaded {len(conversations)} conversations\n")
    return conversations


def classify_all_conversations(
    conversations: List[Dict],
    output_dir: Path,
    few_shot_examples_file: Path = None,
    model: str = "qwen2.5:7b",
    batch_size: int = 10,
    save_progress: bool = True,
    ollama_url: str = "http://localhost:11434"
) -> Dict:
    """Classify all conversations and save results"""
    
    # Load few-shot examples if provided
    few_shot_examples = ""
    if few_shot_examples_file and few_shot_examples_file.exists():
        few_shot_examples = load_few_shot_examples(few_shot_examples_file)
        print(f"📝 Loaded few-shot examples from {few_shot_examples_file}")
    else:
        print("📝 No few-shot examples provided (using zero-shot)")
    
    print(f"🤖 Using model: {model}")
    print(f"🔗 Ollama URL: {ollama_url}\n")
    
    results = {
        'success': [],
        'failed': [],
        'skipped': []
    }
    
    total = len(conversations)
    
    for i, conv in enumerate(conversations, 1):
        conv_id = conv.get('id', f'conv-{i}')
        
        # Find original filename to preserve it
        # If conv has a source filename, use that; otherwise use ID
        output_path = output_dir / f"{conv_id}.json"
        
        print(f"[{i}/{total}] Classifying {conv_id}...", end=" ", flush=True)
        
        try:
            # Classify conversation (pass ollama_url)
            classification = classify_conversation_ollama(
                conv,
                few_shot_examples,
                model,
                ollama_url
            )
            
            # Update conversation with new classification
            conv['classification'] = classification
            
            # Save updated conversation
            with open(output_path, 'w') as f:
                json.dump(conv, f, indent=2)
            
            results['success'].append(conv_id)
            print("✅")
            
            # Save progress every N conversations
            if save_progress and i % batch_size == 0:
                print(f"  💾 Progress saved ({i}/{total} complete)")
                time.sleep(0.5)  # Brief pause to avoid rate limits
        
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
            print(f"  Progress: {i-1}/{total} conversations processed")
            print(f"  Success: {len(results['success'])}")
            print(f"  Failed: {len(results['failed'])}")
            sys.exit(0)
        
        except Exception as e:
            error_msg = str(e)[:100]
            print(f"❌ Error: {error_msg}")
            results['failed'].append({
                'id': conv_id,
                'error': error_msg
            })
            continue
    
    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python classify-public-output-reduced-roles.py <output_directory> [options]")
        print("\nOptions:")
        print("  --few-shot-examples <file>  Path to few-shot examples JSON")
        print("  --model <model_name>        Ollama model name (default: qwen2.5:7b)")
        print("  --batch-size <N>            Save progress every N conversations (default: 10)")
        print("\nExample:")
        print("  python classify-public-output-reduced-roles.py public/output \\")
        print("    --few-shot-examples classifier/few-shot-examples-reduced.json \\")
        print("    --model qwen2.5:7b")
        sys.exit(1)
    
    # Parse arguments
    output_dir = Path(sys.argv[1])
    
    if not output_dir.exists():
        print(f"❌ Error: Directory not found: {output_dir}")
        sys.exit(1)
    
    few_shot_examples_file = None
    model = "qwen2.5:7b"
    batch_size = 10
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--few-shot-examples" and i + 1 < len(sys.argv):
            few_shot_examples_file = Path(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--model" and i + 1 < len(sys.argv):
            model = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--batch-size" and i + 1 < len(sys.argv):
            batch_size = int(sys.argv[i + 1])
            i += 2
        else:
            i += 1
    
    print("=" * 70)
    print("REDUCED ROLE TAXONOMY CLASSIFICATION")
    print("6 Roles: 3 Human (Information-Seeker, Social-Expressor, Co-Constructor)")
    print("         3 AI (Facilitator, Expert System, Relational Peer)")
    print("=" * 70)
    print()
    
    # Load conversations
    conversations = load_conversations_from_directory(output_dir)
    
    if not conversations:
        print("❌ No conversations found to classify")
        sys.exit(1)
    
    print(f"🚀 Starting classification of {len(conversations)} conversations...\n")
    
    start_time = time.time()
    
    # Classify all conversations
    results = classify_all_conversations(
        conversations,
        output_dir,
        few_shot_examples_file,
        model,
        batch_size,
        ollama_url="http://localhost:11434"
    )
    
    elapsed = time.time() - start_time
    
    # Print summary
    print("\n" + "=" * 70)
    print("CLASSIFICATION COMPLETE")
    print("=" * 70)
    print(f"✅ Success: {len(results['success'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    print(f"⏭️  Skipped: {len(results['skipped'])}")
    print(f"⏱️  Time: {elapsed:.1f}s ({elapsed/len(conversations):.1f}s per conversation)")
    
    if results['failed']:
        print(f"\n❌ Failed conversations ({len(results['failed'])}):")
        for failure in results['failed'][:10]:  # Show first 10
            print(f"  - {failure['id']}: {failure['error']}")
        if len(results['failed']) > 10:
            print(f"  ... and {len(results['failed']) - 10} more")
    
    print(f"\n📁 Updated files saved to: {output_dir}")
    print()


if __name__ == "__main__":
    main()

