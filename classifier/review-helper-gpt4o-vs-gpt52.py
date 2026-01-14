#!/usr/bin/env python3
"""
Interactive helper for reviewing conversations with GPT-4o vs GPT-5.2 classifications.
Shows each conversation and both model classifications side by side.
"""

import json
import sys
from pathlib import Path

def format_messages(messages, max_length=None):
    """Format conversation messages for display"""
    display = []
    for i, msg in enumerate(messages):
        role = msg['role'].upper()
        content = msg.get('content', '')
        if max_length and len(content) > max_length:
            # Show first part, then indicate truncation
            truncated = content[:max_length]
            remaining = len(content) - max_length
            content = f"{truncated}\n... [TRUNCATED: {remaining} more characters] ...\n{content[-200:]}"  # Show last 200 chars too
        display.append(f"[{role}]: {content}")
    return "\n".join(display)

def display_classification(model_name, classification):
    """Display a model's classification"""
    ai_role = classification['aiRole']
    human_role = classification['humanRole']
    
    print(f"\n{model_name}:")
    print(f"  AI Role: {ai_role['dominant']} (confidence: {ai_role['confidence']:.2f})")
    print(f"  Human Role: {human_role['dominant']} (confidence: {human_role['confidence']:.2f})")
    print(f"  Interaction Pattern: {classification.get('interactionPattern', 'N/A')}")
    print(f"  Purpose: {classification.get('conversationPurpose', 'N/A')}")

def get_user_judgment(conv):
    """Get user's judgment on which model is correct"""
    print("\n" + "="*80)
    print("YOUR JUDGMENT:")
    print("="*80)
    print("1. GPT-4o is correct (AI role)")
    print("2. GPT-5.2 is correct (AI role)")
    print("3. Both are wrong - enter correct role")
    print("4. Both are partially right - it's ambiguous")
    print("5. Skip this conversation")
    print("="*80)
    
    choice = input("\nEnter choice (1-5): ").strip()
    
    result = {
        'agreeWithGPT4o': None,
        'agreeWithGPT52': None,
        'correctAI': None,
        'correctHuman': None,
        'notes': ''
    }
    
    if choice == "1":
        result['agreeWithGPT4o'] = True
        result['agreeWithGPT52'] = False
        result['correctAI'] = conv['gpt4o']['aiRole']['dominant']
        result['correctHuman'] = conv['gpt4o']['humanRole']['dominant']
    elif choice == "2":
        result['agreeWithGPT4o'] = False
        result['agreeWithGPT52'] = True
        result['correctAI'] = conv['gpt52']['aiRole']['dominant']
        result['correctHuman'] = conv['gpt52']['humanRole']['dominant']
    elif choice == "3":
        result['agreeWithGPT4o'] = False
        result['agreeWithGPT52'] = False
        print("\nAvailable AI roles:")
        print("  - expert-system")
        print("  - learning-facilitator")
        print("  - advisor")
        print("  - co-constructor")
        print("  - social-facilitator")
        print("  - relational-peer")
        correct_ai = input("Enter correct AI role: ").strip()
        result['correctAI'] = correct_ai if correct_ai else None
        
        print("\nAvailable Human roles:")
        print("  - information-seeker")
        print("  - provider")
        print("  - director")
        print("  - collaborator")
        print("  - social-expressor")
        print("  - relational-peer")
        correct_human = input("Enter correct Human role: ").strip()
        result['correctHuman'] = correct_human if correct_human else None
    elif choice == "4":
        result['agreeWithGPT4o'] = None  # Ambiguous
        result['agreeWithGPT52'] = None
        result['correctAI'] = "ambiguous"
        result['correctHuman'] = "ambiguous"
    elif choice == "5":
        return None  # Skip
    
    notes = input("\nOptional notes: ").strip()
    if notes:
        result['notes'] = notes
    
    return result

def main():
    review_file = Path("manual-review-20-conversations.json")
    
    if not review_file.exists():
        print(f"Error: {review_file} not found")
        sys.exit(1)
    
    with open(review_file) as f:
        conversations = json.load(f)
    
    reviewed_count = sum(1 for c in conversations if c['manualReview'].get('reviewed'))
    total = len(conversations)
    
    print(f"\n{'='*80}")
    print(f"MANUAL REVIEW: GPT-4o vs GPT-5.2 Classifications")
    print(f"{'='*80}")
    print(f"Progress: {reviewed_count}/{total} reviewed")
    print(f"{'='*80}\n")
    
    for i, conv in enumerate(conversations, 1):
        if conv['manualReview'].get('reviewed'):
            print(f"\n[{i}/{total}] Conversation {conv['id']} - ALREADY REVIEWED")
            continue
        
        print(f"\n{'='*80}")
        print(f"[{i}/{total}] Conversation: {conv['id']}")
        print(f"{'='*80}")
        
        # Show agreement status
        if not conv['agreement']['aiRole']:
            print("⚠️  MODELS DISAGREE on AI role")
        else:
            print("✅ MODELS AGREE on AI role")
        
        # Show conversation
        print("\nCONVERSATION:")
        print("-" * 80)
        # Show full conversation (no truncation)
        full_conversation = format_messages(conv['messages'], max_length=None)
        print(full_conversation)
        print("-" * 80)
        
        # Show message count and total length
        total_chars = sum(len(msg.get('content', '')) for msg in conv['messages'])
        print(f"\n📊 Stats: {len(conv['messages'])} messages, {total_chars:,} total characters")
        
        # Show both classifications
        display_classification("GPT-4o", conv['gpt4o'])
        display_classification("GPT-5.2", conv['gpt52'])
        
        # Get user judgment
        judgment = get_user_judgment(conv)
        
        if judgment is None:
            print("Skipped.")
            continue
        
        # Save judgment
        conv['manualReview'].update(judgment)
        conv['manualReview']['reviewed'] = True
        
        # Save progress
        with open(review_file, 'w') as f:
            json.dump(conversations, f, indent=2)
        
        print(f"\n✅ Saved review for {conv['id']}")
        
        # Ask if continue
        if i < total:
            cont = input("\nContinue to next conversation? (y/n): ").strip().lower()
            if cont != 'y':
                break
    
    # Final summary
    reviewed = [c for c in conversations if c['manualReview'].get('reviewed')]
    print(f"\n{'='*80}")
    print("REVIEW SUMMARY")
    print(f"{'='*80}")
    print(f"Reviewed: {len(reviewed)}/{total}")
    
    if reviewed:
        agree_4o = sum(1 for c in reviewed if c['manualReview'].get('agreeWithGPT4o') == True)
        agree_52 = sum(1 for c in reviewed if c['manualReview'].get('agreeWithGPT52') == True)
        both_wrong = sum(1 for c in reviewed if c['manualReview'].get('agreeWithGPT4o') == False and 
                        c['manualReview'].get('agreeWithGPT52') == False)
        ambiguous = sum(1 for c in reviewed if c['manualReview'].get('correctAI') == 'ambiguous')
        
        print(f"\nAgreement with GPT-4o: {agree_4o}/{len(reviewed)} ({agree_4o/len(reviewed)*100:.1f}%)")
        print(f"Agreement with GPT-5.2: {agree_52}/{len(reviewed)} ({agree_52/len(reviewed)*100:.1f}%)")
        print(f"Both wrong: {both_wrong}/{len(reviewed)} ({both_wrong/len(reviewed)*100:.1f}%)")
        print(f"Ambiguous: {ambiguous}/{len(reviewed)} ({ambiguous/len(reviewed)*100:.1f}%)")
    
    print(f"\n✅ Review saved to {review_file}")

if __name__ == "__main__":
    main()

