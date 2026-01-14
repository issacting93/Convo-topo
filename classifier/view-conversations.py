#!/usr/bin/env python3
"""
View full conversations from the review file in a readable format.
Can display in terminal or save to a text file.
"""

import json
import sys
from pathlib import Path

def format_conversation_full(conv):
    """Format a full conversation for display"""
    lines = []
    lines.append("=" * 80)
    lines.append(f"Conversation ID: {conv['id']}")
    lines.append("=" * 80)
    lines.append("")
    
    # Show classifications
    lines.append("CLASSIFICATIONS:")
    lines.append("-" * 80)
    lines.append(f"GPT-4o:")
    lines.append(f"  AI Role: {conv['gpt4o']['aiRole']['dominant']} (confidence: {conv['gpt4o']['aiRole']['confidence']:.2f})")
    lines.append(f"  Human Role: {conv['gpt4o']['humanRole']['dominant']} (confidence: {conv['gpt4o']['humanRole']['confidence']:.2f})")
    lines.append(f"  Pattern: {conv['gpt4o'].get('interactionPattern', 'N/A')}")
    lines.append(f"  Purpose: {conv['gpt4o'].get('conversationPurpose', 'N/A')}")
    lines.append("")
    lines.append(f"GPT-5.2:")
    lines.append(f"  AI Role: {conv['gpt52']['aiRole']['dominant']} (confidence: {conv['gpt52']['aiRole']['confidence']:.2f})")
    lines.append(f"  Human Role: {conv['gpt52']['humanRole']['dominant']} (confidence: {conv['gpt52']['humanRole']['confidence']:.2f})")
    lines.append(f"  Pattern: {conv['gpt52'].get('interactionPattern', 'N/A')}")
    lines.append(f"  Purpose: {conv['gpt52'].get('conversationPurpose', 'N/A')}")
    lines.append("")
    
    if not conv['agreement']['aiRole']:
        lines.append("⚠️  MODELS DISAGREE on AI role")
    else:
        lines.append("✅ MODELS AGREE on AI role")
    lines.append("")
    lines.append("-" * 80)
    lines.append("")
    
    # Show full conversation
    lines.append("FULL CONVERSATION:")
    lines.append("-" * 80)
    for i, msg in enumerate(conv['messages'], 1):
        role = msg['role'].upper()
        content = msg.get('content', '')
        lines.append(f"\n[{i}] {role}:")
        lines.append("-" * 40)
        lines.append(content)
        lines.append("")
    
    lines.append("=" * 80)
    lines.append("")
    
    return "\n".join(lines)

def main():
    review_file = Path("manual-review-20-conversations.json")
    
    if not review_file.exists():
        print(f"Error: {review_file} not found")
        sys.exit(1)
    
    with open(review_file) as f:
        conversations = json.load(f)
    
    if len(sys.argv) > 1:
        # Save to file
        output_file = sys.argv[1]
        with open(output_file, 'w') as f:
            for i, conv in enumerate(conversations, 1):
                f.write(f"\n\n{'='*80}\n")
                f.write(f"CONVERSATION {i}/{len(conversations)}\n")
                f.write(f"{'='*80}\n")
                f.write(format_conversation_full(conv))
        
        print(f"✅ Saved all {len(conversations)} conversations to {output_file}")
    else:
        # Interactive mode - show one at a time
        print(f"\n{'='*80}")
        print(f"Viewing {len(conversations)} conversations")
        print(f"{'='*80}")
        print("\nCommands:")
        print("  - Enter number (1-20) to view that conversation")
        print("  - Enter 'all' to save all to a file")
        print("  - Enter 'q' to quit")
        print()
        
        while True:
            choice = input("Enter choice: ").strip().lower()
            
            if choice == 'q':
                break
            elif choice == 'all':
                output_file = input("Enter output filename (e.g., conversations-full.txt): ").strip()
                if not output_file:
                    output_file = "conversations-full.txt"
                
                with open(output_file, 'w') as f:
                    for i, conv in enumerate(conversations, 1):
                        f.write(f"\n\n{'='*80}\n")
                        f.write(f"CONVERSATION {i}/{len(conversations)}\n")
                        f.write(f"{'='*80}\n")
                        f.write(format_conversation_full(conv))
                
                print(f"✅ Saved all conversations to {output_file}")
                break
            elif choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(conversations):
                    print("\n" + format_conversation_full(conversations[idx]))
                    input("\nPress Enter to continue...")
                else:
                    print(f"Invalid number. Enter 1-{len(conversations)}")
            else:
                print("Invalid choice")

if __name__ == "__main__":
    main()

