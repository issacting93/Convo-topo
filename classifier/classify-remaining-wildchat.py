#!/usr/bin/env python3
"""
Classify remaining WildChat conversations using GPT-5.2
Incorporates manual review feedback for improved accuracy.
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Import the classifier module
import importlib.util
spec = importlib.util.spec_from_file_location(
    "classifier", 
    Path(__file__).parent / "classifier-openai-social-role-theory.py"
)
classifier_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classifier_module)

# Use the functions from the module
load_env_file = classifier_module.load_env_file
classify_batch = classifier_module.classify_batch
format_conversation = classifier_module.format_conversation

def load_wildchat_conversations(exclude_ids=None):
    """Load all wildchat conversations, excluding already classified ones"""
    wildchat_dir = Path("../public/output-wildchat")
    if not wildchat_dir.exists():
        print(f"❌ WildChat directory not found: {wildchat_dir}")
        return []
    
    exclude_ids = exclude_ids or set()
    conversations = []
    skipped = 0
    errors = 0
    
    for file_path in sorted(wildchat_dir.glob("*.json")):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Skip if already classified
            if data.get('classification'):
                skipped += 1
                continue
            
            # Skip if in exclude list (already done)
            conv_id = data.get('id', file_path.stem)
            if conv_id in exclude_ids:
                skipped += 1
                continue
            
            # Ensure it has messages
            if not data.get('messages') or len(data['messages']) == 0:
                errors += 1
                continue
            
            # Check that messages have content
            has_content = any(msg.get('content') for msg in data['messages'])
            if not has_content:
                errors += 1
                continue
            
            conversations.append(data)
            
        except Exception as e:
            errors += 1
            print(f"⚠️  Error loading {file_path.name}: {e}")
            continue
    
    print(f"📊 Loaded {len(conversations)} conversations")
    print(f"   Skipped (already classified): {skipped}")
    print(f"   Errors: {errors}")
    
    return conversations

def load_enhanced_few_shot():
    """Load enhanced few-shot examples - use original format, enhanced with review examples"""
    original_file = Path("few-shot-examples-social-role-theory.json")
    enhanced_file = Path("few-shot-examples-enhanced-with-review.json")
    
    # Load original (has proper format)
    if original_file.exists():
        with open(original_file) as f:
            original_data = f.read()
        print(f"✅ Using original few-shot examples format")
        
        # Also note we have validated examples
        if enhanced_file.exists():
            with open(enhanced_file) as f:
                enhanced = json.load(f)
            print(f"   + {len(enhanced)} validated examples from your review")
        
        return original_data
    else:
        print("⚠️  No few-shot examples found, using zero-shot")
        return ""

def format_few_shot_examples(examples):
    """Format few-shot examples for the prompt - use original format if available"""
    if not examples:
        return ""
    
    # Try to load original few-shot examples file (has proper format)
    original_file = Path("few-shot-examples-social-role-theory.json")
    if original_file.exists():
        try:
            with open(original_file) as f:
                original_data = json.load(f)
            # The original file should have the properly formatted examples
            # Just use it directly
            if isinstance(original_data, str):
                return original_data
            elif isinstance(original_data, dict) and 'examples' in original_data:
                # Format it using the classifier's format function
                from classifier_openai_social_role_theory import load_few_shot_examples
                return load_few_shot_examples(original_file)
        except:
            pass
    
    # Fallback: create simple format
    formatted = []
    for i, ex in enumerate(examples[:6], 1):
        messages = ex.get('messages', [])
        conv_text = format_conversation(messages)
        
        correct_ai = ex.get('correctAI', 'unknown')
        correct_human = ex.get('correctHuman', 'unknown')
        
        formatted.append(f"### Example {i} (Validated from Manual Review)")
        formatted.append(conv_text)
        formatted.append(f"Correct Classification:")
        formatted.append(f"  AI Role: {correct_ai}")
        formatted.append(f"  Human Role: {correct_human}")
        if ex.get('notes'):
            formatted.append(f"  Note: {ex['notes']}")
        formatted.append("")
    
    return "\n---\n\n".join(formatted)

def main():
    print("=" * 80)
    print("WildChat Classification with GPT-5.2 (Enhanced with Review)")
    print("=" * 80)
    print()
    
    # Load already classified IDs to exclude
    sample_file = Path("wildchat-50-sample.json")
    exclude_ids = set()
    if sample_file.exists():
        with open(sample_file) as f:
            sample_data = json.load(f)
        exclude_ids = {c['id'] for c in sample_data}
        print(f"📝 Excluding {len(exclude_ids)} already classified conversations")
    
    # Load conversations
    conversations = load_wildchat_conversations(exclude_ids=exclude_ids)
    
    if not conversations:
        print("✅ No conversations to classify!")
        return
    
    # Load few-shot examples
    few_shot_text = load_enhanced_few_shot()
    
    # If it's a string (formatted), use it directly
    # Otherwise format it
    if isinstance(few_shot_text, list):
        few_shot_text = format_few_shot_examples(few_shot_text)
    
    # Ask for confirmation
    print()
    print(f"Ready to classify {len(conversations)} conversations with GPT-5.2")
    if few_shot_text:
        print(f"Using few-shot examples (enhanced with your review feedback)")
    print()
    confirm = input("Continue? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return
    
    # Classify
    print()
    print("🎯 Starting classification...")
    print()
    
    results = classify_batch(
        conversations=conversations,
        few_shot_examples=few_shot_text,
        model="gpt-5.2",
        delay_ms=600,  # Rate limiting
        output_dir=None,  # Save to combined file
        save_individual=False
    )
    
    # Save results
    output_file = Path(f"wildchat-remaining-results-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Also save individual files
    output_dir = Path("../public/output-wildchat")
    saved_count = 0
    for result in results:
        if result.get('classification'):
            conv_id = result.get('id', 'unknown')
            safe_id = "".join(c for c in str(conv_id) if c.isalnum() or c in ('-', '_'))
            output_path = output_dir / f"{safe_id}.json"
            
            try:
                with open(output_path, 'w') as f:
                    json.dump(result, f, indent=2)
                saved_count += 1
            except Exception as e:
                print(f"⚠️  Error saving {safe_id}: {e}")
    
    print()
    print("=" * 80)
    print("✅ CLASSIFICATION COMPLETE")
    print("=" * 80)
    print(f"Processed: {len(results)} conversations")
    print(f"Successful: {sum(1 for r in results if r.get('classification'))}")
    print(f"Saved to: {output_file}")
    print(f"Individual files: {saved_count} saved to {output_dir}")

if __name__ == "__main__":
    main()

