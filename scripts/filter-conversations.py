#!/usr/bin/env python3
"""
Filter conversations before classification.
Removes low-quality, too-short, or problematic conversations.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

# Filtering criteria
MIN_MESSAGES = 10  # Minimum number of messages for meaningful analysis
MIN_MESSAGE_LENGTH = 10  # Minimum characters per message (excluding whitespace)
MAX_MESSAGE_LENGTH = 10000  # Maximum characters per message (filter out extremely long)
MIN_CONVERSATION_LENGTH = 500  # Minimum total characters in conversation
REQUIRE_ENGLISH = True  # Filter to English-only conversations (basic check)
MIN_EXCHANGES = 3  # Minimum back-and-forth exchanges (user->assistant->user)

def is_mostly_english(text: str, threshold: 0.7 = 0.7) -> bool:
    """Basic check if text is mostly English characters."""
    if not text:
        return False
    
    # Count ASCII letters (English alphabet)
    ascii_letters = sum(1 for c in text if c.isascii() and (c.isalpha() or c.isspace() or c in ".,!?;:'\"-"))
    total_chars = len([c for c in text if c.isalnum() or c.isspace() or c in ".,!?;:'\"-"])
    
    if total_chars == 0:
        return False
    
    return (ascii_letters / total_chars) >= threshold

def clean_message_content(content: str) -> str:
    """Clean and validate message content."""
    if not content:
        return ""
    
    # Strip whitespace
    content = content.strip()
    
    # Remove messages that are just punctuation or whitespace
    if not content or len(content) < MIN_MESSAGE_LENGTH:
        return ""
    
    return content

def count_exchanges(messages: List[Dict[str, str]]) -> int:
    """Count actual back-and-forth exchanges."""
    exchanges = 0
    last_role = None
    
    for msg in messages:
        role = msg.get('role', '')
        if role and role != last_role:
            if last_role is not None:
                exchanges += 1
            last_role = role
    
    return exchanges

def filter_conversation(conversation: Dict[str, Any]) -> tuple[bool, str]:
    """
    Filter a single conversation.
    Returns (passes_filter, reason_if_failed)
    """
    messages = conversation.get('messages', [])
    
    # Check minimum message count
    if len(messages) < MIN_MESSAGES:
        return False, f"Too few messages: {len(messages)} < {MIN_MESSAGES}"
    
    # Clean and validate messages
    cleaned_messages = []
    total_length = 0
    
    for msg in messages:
        content = msg.get('content', '')
        cleaned = clean_message_content(content)
        
        if not cleaned:
            continue
        
        # Check individual message length
        if len(cleaned) > MAX_MESSAGE_LENGTH:
            return False, f"Message too long: {len(cleaned)} > {MAX_MESSAGE_LENGTH}"
        
        cleaned_messages.append({
            'role': msg.get('role', 'user'),
            'content': cleaned
        })
        total_length += len(cleaned)
    
    # Check we still have enough messages after cleaning
    if len(cleaned_messages) < MIN_MESSAGES:
        return False, f"Too few valid messages after cleaning: {len(cleaned_messages)} < {MIN_MESSAGES}"
    
    # Check minimum conversation length
    if total_length < MIN_CONVERSATION_LENGTH:
        return False, f"Conversation too short: {total_length} < {MIN_CONVERSATION_LENGTH}"
    
    # Check minimum exchanges
    exchanges = count_exchanges(cleaned_messages)
    if exchanges < MIN_EXCHANGES:
        return False, f"Too few exchanges: {exchanges} < {MIN_EXCHANGES}"
    
    # Check English (if required)
    if REQUIRE_ENGLISH:
        all_text = ' '.join(msg['content'] for msg in cleaned_messages)
        if not is_mostly_english(all_text):
            return False, "Not mostly English"
    
    # Check for valid role distribution (need both user and assistant)
    roles = {msg['role'] for msg in cleaned_messages}
    if 'user' not in roles or 'assistant' not in roles:
        return False, f"Missing roles: only found {roles}"
    
    return True, ""

def filter_conversations(
    input_dir: Path,
    output_dir: Path,
    pattern: str = "chatbot_arena_*.json"
) -> Dict[str, Any]:
    """Filter all conversations matching pattern."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Find all conversation files
    conversation_files = list(input_path.glob(pattern))
    
    if not conversation_files:
        print(f"❌ No files found matching pattern: {pattern}")
        return {"total": 0, "passed": 0, "failed": 0}
    
    print(f"📋 Found {len(conversation_files)} conversation files")
    print(f"   Filtering criteria:")
    print(f"   - Minimum messages: {MIN_MESSAGES}")
    print(f"   - Minimum message length: {MIN_MESSAGE_LENGTH} chars")
    print(f"   - Minimum conversation length: {MIN_CONVERSATION_LENGTH} chars")
    print(f"   - Minimum exchanges: {MIN_EXCHANGES}")
    print(f"   - English only: {REQUIRE_ENGLISH}")
    print()
    
    passed = []
    failed = []
    
    for i, file_path in enumerate(conversation_files, 1):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                conversation = json.load(f)
            
            passes, reason = filter_conversation(conversation)
            
            if passes:
                # Save cleaned conversation
                conversation['messages'] = [
                    {'role': msg['role'], 'content': msg['content'].strip()}
                    for msg in conversation['messages']
                    if clean_message_content(msg.get('content', ''))
                ]
                
                output_file = output_path / file_path.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(conversation, f, indent=2, ensure_ascii=False)
                
                passed.append(file_path.name)
            else:
                failed.append((file_path.name, reason))
            
            if i % 50 == 0:
                print(f"  Processed {i}/{len(conversation_files)}... (passed: {len(passed)}, failed: {len(failed)})")
        
        except Exception as e:
            failed.append((file_path.name, f"Error: {str(e)}"))
            print(f"  ⚠️  Error processing {file_path.name}: {e}")
    
    # Summary
    print()
    print(f"✅ Filtering complete!")
    print(f"   Passed: {len(passed)} conversations")
    print(f"   Failed: {len(failed)} conversations")
    print(f"   Pass rate: {len(passed)/len(conversation_files)*100:.1f}%")
    
    # Save filtered list
    filtered_list_file = output_path / "filtered_conversations.json"
    with open(filtered_list_file, 'w', encoding='utf-8') as f:
        json.dump({
            "passed": passed,
            "failed": failed,
            "criteria": {
                "min_messages": MIN_MESSAGES,
                "min_message_length": MIN_MESSAGE_LENGTH,
                "min_conversation_length": MIN_CONVERSATION_LENGTH,
                "min_exchanges": MIN_EXCHANGES,
                "require_english": REQUIRE_ENGLISH
            }
        }, f, indent=2)
    
    print(f"   Filtered list saved to: {filtered_list_file}")
    
    # Show sample failure reasons
    if failed:
        print()
        print("Sample failure reasons:")
        reason_counts = {}
        for _, reason in failed[:20]:  # First 20 failures
            reason_counts[reason] = reason_counts.get(reason, 0) + 1
        
        for reason, count in sorted(reason_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"   - {reason}: {count}")
    
    return {
        "total": len(conversation_files),
        "passed": len(passed),
        "failed": len(failed),
        "passed_files": passed
    }

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Filter conversations before classification")
    parser.add_argument(
        "--input",
        default="conversations-raw",
        help="Input directory with conversations"
    )
    parser.add_argument(
        "--output",
        default="conversations-filtered",
        help="Output directory for filtered conversations"
    )
    parser.add_argument(
        "--pattern",
        default="chatbot_arena_*.json",
        help="File pattern to match (default: chatbot_arena_*.json)"
    )
    parser.add_argument(
        "--min-messages",
        type=int,
        default=10,
        help="Minimum messages per conversation (default: 10)"
    )
    parser.add_argument(
        "--min-length",
        type=int,
        default=500,
        help="Minimum total conversation length (default: 500)"
    )
    parser.add_argument(
        "--min-exchanges",
        type=int,
        default=3,
        help="Minimum exchanges (default: 3)"
    )
    parser.add_argument(
        "--no-english-filter",
        action="store_true",
        help="Don't filter by English (allow all languages)"
    )
    
    args = parser.parse_args()
    
    # Update global criteria from args
    global MIN_MESSAGES, MIN_CONVERSATION_LENGTH, MIN_EXCHANGES, REQUIRE_ENGLISH
    MIN_MESSAGES = args.min_messages
    MIN_CONVERSATION_LENGTH = args.min_length
    MIN_EXCHANGES = args.min_exchanges
    REQUIRE_ENGLISH = not args.no_english_filter
    
    result = filter_conversations(
        Path(args.input),
        Path(args.output),
        args.pattern
    )
    
    print()
    print(f"📊 Summary:")
    print(f"   Total processed: {result['total']}")
    print(f"   Passed filter: {result['passed']}")
    print(f"   Failed filter: {result['failed']}")
    
    return 0 if result['passed'] > 0 else 1

if __name__ == "__main__":
    sys.exit(main())

