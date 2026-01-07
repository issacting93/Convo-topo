#!/usr/bin/env python3
"""
Test Classifier v1.2 vs v1.1

Compares classifications from both versions on sample conversations
to verify improvements
"""

import json
import sys
from pathlib import Path

def compare_role_distributions(old: dict, new: dict, role_type: str) -> dict:
    """Compare role distributions between old and new"""
    old_dist = old.get(f'{role_type}Role', {}).get('distribution', {})
    new_dist = new.get(f'{role_type}Role', {}).get('distribution', {})

    changes = {}
    for role in set(list(old_dist.keys()) + list(new_dist.keys())):
        old_val = old_dist.get(role, 0)
        new_val = new_dist.get(role, 0)
        if abs(new_val - old_val) > 0.05:  # 5% threshold
            changes[role] = {
                'old': old_val,
                'new': new_val,
                'delta': new_val - old_val
            }

    return changes

def analyze_conversation(conv_id: str, output_dir: Path):
    """Analyze a single conversation"""
    file_path = output_dir / f"{conv_id}.json"

    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return

    with open(file_path) as f:
        conv = json.load(f)

    classification = conv.get('classification', {})
    metadata = conv.get('classificationMetadata', {})

    print(f"\n{'='*80}")
    print(f"Conversation: {conv_id}")
    print(f"{'='*80}")
    print(f"Version: {metadata.get('promptVersion', 'unknown')}")
    print(f"Corrections Applied: {metadata.get('correctionsApplied', False)}")

    if classification.get('correctionsApplied'):
        print(f"\nPatterns Detected:")
        for pattern in classification.get('correctionsApplied', []):
            print(f"  - {pattern}")

    print(f"\nPurpose: {classification.get('conversationPurpose', {}).get('category', 'unknown')}")
    print(f"Confidence: {classification.get('conversationPurpose', {}).get('confidence', 0):.2f}")

    alt_purpose = classification.get('conversationPurpose', {}).get('alternativePurpose')
    if alt_purpose:
        print(f"Alternative Purpose: {alt_purpose}")

    print(f"\nHuman Roles:")
    human_roles = classification.get('humanRole', {}).get('distribution', {})
    for role, pct in sorted(human_roles.items(), key=lambda x: x[1], reverse=True):
        if pct > 0.05:  # Show roles > 5%
            print(f"  {role:20s}: {pct:.2%}")

    print(f"\nAI Roles:")
    ai_roles = classification.get('aiRole', {}).get('distribution', {})
    for role, pct in sorted(ai_roles.items(), key=lambda x: x[1], reverse=True):
        if pct > 0.05:
            print(f"  {role:20s}: {pct:.2%}")

def compare_conversations(conv_id: str, old_dir: Path, new_dir: Path):
    """Compare old vs new classification"""
    old_file = old_dir / f"{conv_id}.json"
    new_file = new_dir / f"{conv_id}.json"

    if not old_file.exists() or not new_file.exists():
        print(f"❌ Cannot compare {conv_id}: missing file")
        return

    with open(old_file) as f:
        old_conv = json.load(f)
    with open(new_file) as f:
        new_conv = json.load(f)

    old_class = old_conv.get('classification', {})
    new_class = new_conv.get('classification', {})

    print(f"\n{'='*80}")
    print(f"COMPARISON: {conv_id}")
    print(f"{'='*80}")

    # Purpose comparison
    old_purpose = old_class.get('conversationPurpose', {}).get('category')
    new_purpose = new_class.get('conversationPurpose', {}).get('category')

    if old_purpose != new_purpose:
        print(f"\n📍 Purpose Changed:")
        print(f"  Old: {old_purpose}")
        print(f"  New: {new_purpose}")

    # Human role changes
    human_changes = compare_role_distributions(old_class, new_class, 'human')
    if human_changes:
        print(f"\n👤 Human Role Changes:")
        for role, change in sorted(human_changes.items(), key=lambda x: abs(x[1]['delta']), reverse=True):
            delta = change['delta']
            symbol = '↑' if delta > 0 else '↓'
            print(f"  {role:20s}: {change['old']:.2%} → {change['new']:.2%} ({symbol}{abs(delta):.2%})")

    # AI role changes
    ai_changes = compare_role_distributions(old_class, new_class, 'ai')
    if ai_changes:
        print(f"\n🤖 AI Role Changes:")
        for role, change in sorted(ai_changes.items(), key=lambda x: abs(x[1]['delta']), reverse=True):
            delta = change['delta']
            symbol = '↑' if delta > 0 else '↓'
            print(f"  {role:20s}: {change['old']:.2%} → {change['new']:.2%} ({symbol}{abs(delta):.2%})")

    # Corrections applied
    corrections = new_class.get('correctionsApplied', [])
    if corrections:
        print(f"\n✅ Corrections Applied:")
        for correction in corrections:
            print(f"  - {correction}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  # Analyze single conversation from output")
        print("  python3 scripts/test-classifier-v1.2.py analyze <conv_id>")
        print()
        print("  # Compare old vs new (requires both directories)")
        print("  python3 scripts/test-classifier-v1.2.py compare <conv_id> <old_dir> <new_dir>")
        print()
        print("Example:")
        print("  python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515")
        print("  python3 scripts/test-classifier-v1.2.py compare chatbot_arena_16515 public/output public/output-v1.2")
        sys.exit(1)

    command = sys.argv[1]

    if command == "analyze":
        if len(sys.argv) < 3:
            print("Error: Please provide conversation ID")
            sys.exit(1)
        conv_id = sys.argv[2]
        output_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("public/output")
        analyze_conversation(conv_id, output_dir)

    elif command == "compare":
        if len(sys.argv) < 5:
            print("Error: Please provide conv_id, old_dir, and new_dir")
            sys.exit(1)
        conv_id = sys.argv[2]
        old_dir = Path(sys.argv[3])
        new_dir = Path(sys.argv[4])
        compare_conversations(conv_id, old_dir, new_dir)

    else:
        print(f"Unknown command: {command}")
        print("Use 'analyze' or 'compare'")
        sys.exit(1)

if __name__ == "__main__":
    main()
