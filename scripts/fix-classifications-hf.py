#!/usr/bin/env python3
"""
Fix Classification Mismatches using Hugging Face Models

This script identifies and fixes classification issues in conversations by
re-classifying them using a Hugging Face model.

Usage:
    # Fix all conversations
    python scripts/fix-classifications-hf.py --model microsoft/Phi-3-mini-4k-instruct
    
    # Fix specific conversations matching a pattern
    python scripts/fix-classifications-hf.py --pattern "storytelling" --model microsoft/Phi-3-mini-4k-instruct
    
    # Dry run (just identify issues, don't fix)
    python scripts/fix-classifications-hf.py --dry-run
"""

import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional

# Import from classifier module
import importlib.util
classifier_path = Path(__file__).parent.parent / "classifier" / "classifier-huggingface.py"
spec = importlib.util.spec_from_file_location("classifier_huggingface", classifier_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
HuggingFaceClassifier = module.HuggingFaceClassifier
classify_conversation_hf = module.classify_conversation_hf


def detect_mismatches(conversation: Dict) -> List[str]:
    """Detect potential classification mismatches"""
    issues = []
    
    if not conversation.get("classification"):
        return ["No classification found"]
    
    classification = conversation["classification"]
    messages = conversation.get("messages", [])
    
    if not messages:
        return ["No messages found"]
    
    # Check interaction pattern
    pattern = classification.get("interactionPattern", {}).get("category", "")
    
    # Count questions in user messages
    user_messages = [m for m in messages if m.get("role") == "user"]
    user_questions = sum(1 for m in user_messages if "?" in m.get("content", ""))
    question_ratio = user_questions / len(user_messages) if user_messages else 0
    
    # Heuristic: If >40% of user messages are questions, should be question-answer
    if question_ratio > 0.4 and pattern == "storytelling":
        issues.append(f"Pattern mismatch: {pattern} but {user_questions}/{len(user_messages)} user messages are questions")
    
    # Check power dynamics
    power = classification.get("powerDynamics", {}).get("category", "")
    ai_questions = sum(1 for m in messages if m.get("role") == "assistant" and "?" in m.get("content", ""))
    
    if power == "human-led" and ai_questions > user_questions:
        issues.append(f"Power mismatch: {power} but AI asks more questions than human")
    
    # Check confidence levels
    for dim_name, dim_data in classification.items():
        if isinstance(dim_data, dict) and "confidence" in dim_data:
            conf = dim_data.get("confidence", 1.0)
            if conf < 0.5:
                issues.append(f"Low confidence in {dim_name}: {conf:.2f}")
    
    return issues


def fix_conversation(
    conversation: Dict,
    classifier: HuggingFaceClassifier,
    dry_run: bool = False
) -> Dict:
    """Fix a single conversation's classification"""
    issues = detect_mismatches(conversation)
    
    if not issues:
        return conversation
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Fixing: {conversation.get('id', 'unknown')}")
    print(f"  Issues detected: {len(issues)}")
    for issue in issues:
        print(f"    - {issue}")
    
    if dry_run:
        return conversation
    
    # Re-classify
    try:
        classification = classify_conversation_hf(classifier, conversation)
        conversation["classification"] = classification
        
        # Mark as fixed
        if "classificationMetadata" not in classification:
            classification["classificationMetadata"] = {}
        classification["classificationMetadata"]["fixed"] = True
        classification["classificationMetadata"]["previousIssues"] = issues
        
        print(f"  ✅ Re-classified")
        return conversation
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return conversation


def main():
    parser = argparse.ArgumentParser(description="Fix classification mismatches")
    parser.add_argument(
        "--input-dir",
        type=str,
        default="public/output",
        help="Directory containing conversations (default: public/output)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Output directory (default: overwrite input files)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="microsoft/Phi-3-mini-4k-instruct",
        help="Hugging Face model to use (default: microsoft/Phi-3-mini-4k-instruct)"
    )
    parser.add_argument(
        "--pattern",
        type=str,
        default=None,
        help="Only fix conversations with this interaction pattern (e.g., 'storytelling')"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only detect issues, don't fix them"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of conversations to process"
    )
    
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir) if args.output_dir else input_dir
    
    if not input_dir.exists():
        print(f"❌ Error: Input directory not found: {input_dir}")
        sys.exit(1)
    
    # Find all JSON files
    json_files = list(input_dir.glob("*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {input_dir}")
        sys.exit(1)
    
    print(f"📋 Found {len(json_files)} conversations in {input_dir}")
    
    # Load conversations
    conversations = []
    for json_file in json_files:
        try:
            with open(json_file) as f:
                conv = json.load(f)
                conv["_filepath"] = json_file  # Store original file path
            
            # Filter by pattern if specified
            if args.pattern:
                current_pattern = conv.get("classification", {}).get("interactionPattern", {}).get("category", "")
                if args.pattern.lower() not in current_pattern.lower():
                    continue
            
            conversations.append(conv)
        except Exception as e:
            print(f"⚠️  Error loading {json_file}: {e}")
            continue
    
    if args.limit:
        conversations = conversations[:args.limit]
    
    print(f"📊 Processing {len(conversations)} conversations")
    
    if args.pattern:
        print(f"🔍 Filtered by pattern: {args.pattern}")
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made\n")
    else:
        print(f"🤖 Using model: {args.model}")
        classifier = HuggingFaceClassifier(args.model)
        print()
    
    # Process conversations
    fixed_count = 0
    issue_count = 0
    
    for i, conversation in enumerate(conversations, 1):
        issues = detect_mismatches(conversation)
        
        if issues:
            issue_count += 1
            
            if not args.dry_run:
                conversation = fix_conversation(conversation, classifier, dry_run=False)
                fixed_count += 1
                
                # Save fixed conversation
                original_path = conversation.pop("_filepath")
                if output_dir != input_dir:
                    output_path = output_dir / original_path.name
                else:
                    output_path = original_path
                
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, "w") as f:
                    json.dump(conversation, f, indent=2)
        
        print(f"\rProgress: {i}/{len(conversations)}", end="", flush=True)
    
    print()
    print(f"\n✅ Complete!")
    print(f"   Conversations with issues: {issue_count}/{len(conversations)}")
    if not args.dry_run:
        print(f"   Fixed: {fixed_count}")


if __name__ == "__main__":
    main()

