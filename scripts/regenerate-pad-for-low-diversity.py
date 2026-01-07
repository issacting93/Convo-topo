#!/usr/bin/env python3
"""
Regenerate PAD values using LLM for conversations with low PAD diversity

This script:
1. Identifies conversations with low PAD diversity (< 30% unique combinations)
2. Regenerates PAD values using LLM-based generation for more nuanced scores
3. Updates the conversation files with new PAD values

Usage:
    # Identify and regenerate PAD for low-diversity conversations
    python3 scripts/regenerate-pad-for-low-diversity.py
    
    # Dry-run to preview which conversations will be updated
    python3 scripts/regenerate-pad-for-low-diversity.py --dry-run
    
    # Set custom diversity threshold (default: 0.3 = 30%)
    python3 scripts/regenerate-pad-for-low-diversity.py --threshold 0.2
    
    # Process specific files
    python3 scripts/regenerate-pad-for-low-diversity.py --files chatbot_arena_29078.json chatbot_arena_19.json
"""

import json
import sys
import argparse
import importlib.util
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import Counter

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import OpenAI
try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# Import the LLM PAD generation functions from the existing script
spec = importlib.util.spec_from_file_location(
    "generate_pad_with_llm_direct",
    Path(__file__).parent / "generate-pad-with-llm-direct.py"
)
pad_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pad_module)

get_openai_client = pad_module.get_openai_client
generate_pad_batch = pad_module.generate_pad_batch

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "output"
DEFAULT_DIVERSITY_THRESHOLD = 0.3  # 30% unique PAD combinations


def calculate_pad_diversity(conversation: Dict) -> Tuple[int, int, float]:
    """
    Calculate PAD diversity for a conversation.
    
    Returns:
        (unique_pads, total_messages, diversity_ratio)
    """
    messages = conversation.get("messages", [])
    if not messages:
        return (0, 0, 0.0)
    
    pad_scores = []
    for msg in messages:
        if "pad" in msg:
            pad = msg["pad"]
            # Round to 2 decimal places to account for floating point precision
            pleasure = round(pad.get("pleasure", 0.5), 2)
            arousal = round(pad.get("arousal", 0.5), 2)
            dominance = round(pad.get("dominance", 0.5), 2)
            pad_scores.append((pleasure, arousal, dominance))
    
    unique_pads = len(set(pad_scores))
    total_messages = len(messages)
    diversity_ratio = unique_pads / total_messages if total_messages > 0 else 0.0
    
    return (unique_pads, total_messages, diversity_ratio)


def identify_low_diversity_conversations(
    output_dir: Path,
    threshold: float = DEFAULT_DIVERSITY_THRESHOLD,
    min_messages: int = 5
) -> List[Dict]:
    """
    Identify conversations with low PAD diversity.
    
    Args:
        output_dir: Directory containing conversation JSON files
        threshold: Minimum diversity ratio (default: 0.3 = 30%)
        min_messages: Minimum number of messages to check (default: 5)
    
    Returns:
        List of conversation info dicts with low diversity
    """
    low_diversity = []
    
    json_files = list(output_dir.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"🔍 Analyzing {len(json_files)} conversations for PAD diversity...\n")
    
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                conversation = json.load(f)
        except Exception as e:
            print(f"⚠️  Error reading {file_path.name}: {e}")
            continue
        
        unique_pads, total_messages, diversity_ratio = calculate_pad_diversity(conversation)
        
        # Only flag if:
        # 1. Has enough messages to be meaningful
        # 2. Diversity is below threshold
        if total_messages >= min_messages and diversity_ratio < threshold:
            low_diversity.append({
                "file": file_path.name,
                "id": conversation.get("id", file_path.stem),
                "unique_pads": unique_pads,
                "total_messages": total_messages,
                "diversity_ratio": diversity_ratio,
                "conversation": conversation,
                "file_path": file_path
            })
    
    # Sort by diversity ratio (lowest first)
    low_diversity.sort(key=lambda x: x["diversity_ratio"])
    
    return low_diversity


def regenerate_pad_for_conversation(
    client: OpenAI,
    conversation: Dict,
    file_path: Path,
    dry_run: bool = False
) -> bool:
    """
    Regenerate PAD values for a single conversation using LLM.
    
    Returns:
        True if successful, False otherwise
    """
    conv_id = conversation.get("id", file_path.stem)
    
    try:
        # Generate new PAD values using LLM
        new_pad_values = generate_pad_batch(client, conversation)
        
        if not new_pad_values:
            print(f"  ❌ Failed to generate PAD values for {conv_id}")
            return False
        
        # Update messages with new PAD values
        messages = conversation.get("messages", [])
        if len(new_pad_values) != len(messages):
            print(f"  ⚠️  PAD count mismatch: {len(new_pad_values)} PAD values for {len(messages)} messages")
            # Continue anyway, update what we can
        
        updated_count = 0
        for i, msg in enumerate(messages):
            if i < len(new_pad_values):
                msg["pad"] = new_pad_values[i]
                updated_count += 1
        
        if dry_run:
            print(f"  [DRY RUN] Would update {updated_count} messages with LLM-generated PAD")
            return True
        
        # Save updated conversation
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(conversation, f, indent=2)
        
        # Verify new diversity
        unique_pads, total_messages, new_diversity = calculate_pad_diversity(conversation)
        print(f"  ✅ Updated {updated_count} messages. New diversity: {unique_pads}/{total_messages} ({new_diversity:.1%})")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error regenerating PAD for {conv_id}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Regenerate PAD values using LLM for conversations with low PAD diversity"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=DEFAULT_DIVERSITY_THRESHOLD,
        help=f"Minimum diversity ratio threshold (default: {DEFAULT_DIVERSITY_THRESHOLD})"
    )
    parser.add_argument(
        "--min-messages",
        type=int,
        default=5,
        help="Minimum number of messages to check (default: 5)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing files"
    )
    parser.add_argument(
        "--files",
        nargs="+",
        help="Process specific files instead of auto-detecting"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=OUTPUT_DIR,
        help=f"Directory containing conversation files (default: {OUTPUT_DIR})"
    )
    
    args = parser.parse_args()
    
    # Get OpenAI client
    if not args.dry_run:
        client = get_openai_client()
    else:
        client = None
    
    # Identify low-diversity conversations
    if args.files:
        # Process specific files
        low_diversity = []
        for file_name in args.files:
            file_path = args.output_dir / file_name
            if not file_path.exists():
                print(f"⚠️  File not found: {file_path}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    conversation = json.load(f)
            except Exception as e:
                print(f"⚠️  Error reading {file_name}: {e}")
                continue
            
            unique_pads, total_messages, diversity_ratio = calculate_pad_diversity(conversation)
            low_diversity.append({
                "file": file_name,
                "id": conversation.get("id", file_path.stem),
                "unique_pads": unique_pads,
                "total_messages": total_messages,
                "diversity_ratio": diversity_ratio,
                "conversation": conversation,
                "file_path": file_path
            })
    else:
        # Auto-detect low-diversity conversations
        low_diversity = identify_low_diversity_conversations(
            args.output_dir,
            threshold=args.threshold,
            min_messages=args.min_messages
        )
    
    if not low_diversity:
        print(f"✅ No conversations found with PAD diversity < {args.threshold:.1%}")
        return 0
    
    # Print summary
    print("=" * 80)
    print("LOW PAD DIVERSITY CONVERSATIONS")
    print("=" * 80)
    print(f"Found {len(low_diversity)} conversations with diversity < {args.threshold:.1%}\n")
    
    print("Conversations to update:")
    for item in low_diversity:
        print(f"  {item['file']:40} {item['unique_pads']:2}/{item['total_messages']:2} messages ({item['diversity_ratio']:.1%} diversity)")
    print()
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No files will be modified")
        print(f"   Would regenerate PAD for {len(low_diversity)} conversations")
        return 0
    
    # Confirm before proceeding
    print(f"⚠️  About to regenerate PAD values for {len(low_diversity)} conversations using LLM")
    print(f"   Estimated cost: ~${len(low_diversity) * 0.001:.2f} (GPT-4o-mini)")
    response = input("   Continue? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Cancelled")
        return 1
    
    # Regenerate PAD for each conversation
    print("\n" + "=" * 80)
    print("REGENERATING PAD VALUES")
    print("=" * 80)
    print()
    
    success_count = 0
    fail_count = 0
    
    for i, item in enumerate(low_diversity, 1):
        print(f"[{i}/{len(low_diversity)}] Processing {item['file']}...")
        print(f"  Current diversity: {item['unique_pads']}/{item['total_messages']} ({item['diversity_ratio']:.1%})")
        
        if regenerate_pad_for_conversation(
            client,
            item['conversation'],
            item['file_path'],
            dry_run=False
        ):
            success_count += 1
        else:
            fail_count += 1
        
        print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total processed: {len(low_diversity)}")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    
    if success_count > 0:
        print(f"\n✅ Successfully regenerated PAD for {success_count} conversations!")
        print("   Run validation again to verify improved diversity:")
        print("   python3 scripts/validate-data-quality.py")
    
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

