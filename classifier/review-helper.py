#!/usr/bin/env python3
"""
Interactive helper for reviewing conversations.
Shows each conversation and helps you fill in the manualReview section.
"""

import json
import sys
from pathlib import Path

def get_conversation_display(conv):
    """Format conversation for easy reading"""
    messages = conv['conversation']['messages']
    display = []
    for msg in messages:
        role = msg['role'].upper()
        content = msg['content']
        # Truncate very long messages
        if len(content) > 500:
            content = content[:500] + "... (truncated)"
        display.append(f"[{role}]: {content}")
    return "\n".join(display)

def get_role_decision():
    """Get user's judgment on role"""
    print("\n" + "="*60)
    print("What is the correct AI role?")
    print("1. expert - AI provides direct answers/explanations")
    print("2. facilitator - AI guides with questions/scaffolding")
    print("3. peer/affiliative - Casual peer conversation, relationship-focused")
    print("4. mixed - Genuinely both expert and facilitator")
    print("5. unclear - Too ambiguous to decide")
    print("6. skip - Skip this conversation")
    print("="*60)
    
    choice = input("\nEnter choice (1-6): ").strip()
    
    mapping = {
        "1": {"correctClassification": "expert", "shouldBeExpert": True, "shouldBeFacilitator": False},
        "2": {"correctClassification": "facilitator", "shouldBeExpert": False, "shouldBeFacilitator": True},
        "3": {"correctClassification": "affiliative", "shouldBeExpert": False, "shouldBeFacilitator": False},
        "4": {"correctClassification": "mixed", "shouldBeExpert": None, "shouldBeFacilitator": None},
        "5": {"correctClassification": "unclear", "shouldBeExpert": None, "shouldBeFacilitator": None},
        "6": {"correctClassification": None, "shouldBeExpert": None, "shouldBeFacilitator": None, "skip": True}
    }
    
    if choice not in mapping:
        print("Invalid choice, skipping...")
        return {"correctClassification": None, "shouldBeExpert": None, "shouldBeFacilitator": None, "skip": True}
    
    result = mapping[choice].copy()
    
    # Get notes
    if not result.get("skip"):
        notes = input("\nOptional notes (press Enter to skip): ").strip()
        result["notes"] = notes if notes else ""
        result["reviewed"] = True
    else:
        result["reviewed"] = False
    
    return result

def review_conversations(filename):
    """Interactive review of conversations"""
    with open(filename, 'r') as f:
        data = json.load(f)
    
    print(f"\n📊 Found {len(data)} conversations to review")
    print(f"Model classified all as: facilitator\n")
    
    reviewed_count = 0
    for i, conv in enumerate(data, 1):
        if conv.get('manualReview', {}).get('reviewed', False):
            print(f"\n⏭️  Conversation {i}/{len(data)} already reviewed, skipping...")
            reviewed_count += 1
            continue
        
        print(f"\n{'='*70}")
        print(f"CONVERSATION {i}/{len(data)}")
        print(f"ID: {conv['id']}")
        print(f"{'='*70}")
        print(f"\nModel Classification: {conv['classification']['aiRole']['dominant_role']} "
              f"(confidence: {conv['classification']['aiRole']['confidence']})")
        
        print("\n" + "-"*70)
        print("CONVERSATION:")
        print("-"*70)
        print(get_conversation_display(conv))
        print("-"*70)
        
        decision = get_role_decision()
        
        if decision.get("skip"):
            print("⏭️  Skipping this conversation...\n")
            continue
        
        # Update the conversation
        conv['manualReview'] = decision
        reviewed_count += 1
        
        print(f"\n✅ Reviewed {reviewed_count}/{len(data)} conversations\n")
        
        # Ask if continue
        if i < len(data):
            cont = input("Continue to next conversation? (y/n, default: y): ").strip().lower()
            if cont == 'n':
                break
    
    # Save the updated data
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✅ Saved {reviewed_count} reviews to {filename}")
    print(f"\nRun analysis with:")
    print(f"  python3 sample-for-review.py {filename} --analyze")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        filename = 'manual-review-sample-complete.json'
        print(f"No file specified, using: {filename}")
    else:
        filename = sys.argv[1]
    
    if not Path(filename).exists():
        print(f"❌ File not found: {filename}")
        sys.exit(1)
    
    review_conversations(filename)

