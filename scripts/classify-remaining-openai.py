#!/usr/bin/env python3
"""
Classify remaining conversations using OpenAI API with reduced role taxonomy

This script:
1. Finds conversations in public/output that haven't been classified with the new taxonomy
2. Classifies them using OpenAI API
3. Saves results back to public/output
"""

import json
import sys
from pathlib import Path

# Add classifier to path
classifier_dir = Path(__file__).parent.parent / "classifier"
sys.path.insert(0, str(classifier_dir))

# Import the classifier module
import importlib.util
spec = importlib.util.spec_from_file_location("classifier_openai_reduced_roles", classifier_dir / "classifier-openai-reduced-roles.py")
classifier_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classifier_module)

classify_batch_openai = classifier_module.classify_batch_openai
load_few_shot_examples = classifier_module.load_few_shot_examples

def main():
    output_dir = Path("public/output")
    
    # Find unclassified conversations
    json_files = [f for f in output_dir.glob("*.json") if f.name != "manifest.json"]
    
    conversations = []
    for json_file in json_files:
        try:
            with open(json_file) as f:
                conv = json.load(f)
            
            # Check if already classified with new taxonomy
            cls = conv.get('classification', {})
            if cls:
                metadata = cls.get('classificationMetadata', {})
                version = metadata.get('version', '')
                if 'reduced-roles' in version:
                    continue  # Already classified
            
            conversations.append(conv)
        except Exception as e:
            print(f"⚠️  Error loading {json_file.name}: {e}")
            continue
    
    if not conversations:
        print("✅ All conversations already classified with new taxonomy!")
        return
    
    print(f"📊 Found {len(conversations)} conversations to classify")
    print(f"   Using OpenAI API (gpt-4o-mini)")
    print()
    
    # Load few-shot examples (optional)
    few_shot_file = Path("classifier/few-shot-examples-reduced-roles.json")
    few_shot_examples = load_few_shot_examples(few_shot_file) if few_shot_file.exists() else ""
    
    if few_shot_examples:
        print("   Using few-shot examples")
    else:
        print("   Using zero-shot (no few-shot examples)")
    print()
    
    # Classify
    results = classify_batch_openai(
        conversations,
        few_shot_examples,
        model="gpt-4o-mini",
        output_file=None,  # We'll save individually
        individual=True,
        output_dir=output_dir
    )
    
    # Summary
    successful = sum(1 for r in results if r.get('classification'))
    failed = len(results) - successful
    
    print(f"\n✅ Classification complete!")
    print(f"   Successful: {successful}")
    print(f"   Failed: {failed}")
    print(f"   Success rate: {successful/len(results)*100:.1f}%")
    
    if failed > 0:
        print(f"\n⚠️  Failed conversations:")
        for r in results:
            if not r.get('classification'):
                print(f"   - {r.get('id', 'unknown')}: {r.get('classificationError', 'Unknown error')}")

if __name__ == "__main__":
    main()

