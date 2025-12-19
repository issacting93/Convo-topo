#!/usr/bin/env python3
"""
Extract conversations from emo.md and convert to project JSON format.

Groups conversations by emotion for different terrain cards.
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Any

def parse_emo_file(file_path: Path) -> List[Dict[str, Any]]:
    """Parse the malformed CSV-like emo.md file using a simpler approach."""
    rows = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Skip header
    if lines:
        lines = lines[1:]
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        # Check if this looks like a new row (starts with a number)
        if re.match(r'^\d+,', line):
            row_data = {}
            
            # Parse the first line: index,situation,emotion,"dialogue_start
            # Pattern: number, "situation", emotion, "Customer :... Agent :"
            match = re.match(r'^(\d+),', line)
            if not match:
                i += 1
                continue
            
            row_data['index'] = match.group(1)
            remaining = line[len(match.group(0)):]
            
            # Extract situation (quoted field)
            if remaining.startswith('"'):
                # Find closing quote
                quote_end = remaining.find('",', 1)
                if quote_end == -1:
                    quote_end = remaining.find('"', 1)
                if quote_end > 0:
                    row_data['situation'] = remaining[1:quote_end]
                    remaining = remaining[quote_end + 2:].lstrip()
                else:
                    row_data['situation'] = ''
            else:
                # Unquoted situation
                comma_pos = remaining.find(',')
                if comma_pos > 0:
                    row_data['situation'] = remaining[:comma_pos].strip()
                    remaining = remaining[comma_pos + 1:].lstrip()
                else:
                    row_data['situation'] = remaining.strip()
                    remaining = ''
            
            # Extract emotion (until next comma or quote)
            if remaining.startswith('"'):
                # Emotion might be quoted
                quote_end = remaining.find('",', 1)
                if quote_end > 0:
                    row_data['emotion'] = remaining[1:quote_end]
                    remaining = remaining[quote_end + 2:].lstrip()
                else:
                    row_data['emotion'] = remaining.strip().strip('"')
                    remaining = ''
            else:
                comma_pos = remaining.find(',')
                if comma_pos > 0:
                    row_data['emotion'] = remaining[:comma_pos].strip()
                    remaining = remaining[comma_pos + 1:].lstrip()
                else:
                    row_data['emotion'] = remaining.strip()
                    remaining = ''
            
            # Extract dialogue - may span multiple lines
            dialogue_parts = []
            labels = ''
            
            if remaining.startswith('"'):
                # Remove opening quote
                remaining = remaining[1:]
                dialogue_parts.append(remaining)
                
                # Continue reading until we find closing quote
                i += 1
                found_closing = False
                while i < len(lines):
                    next_line = lines[i]
                    if '"' in next_line:
                        # Found closing quote
                        quote_pos = next_line.index('"')
                        dialogue_parts.append(next_line[:quote_pos])
                        # The labels field comes after the closing quote
                        labels_remaining = next_line[quote_pos + 1:].lstrip()
                        if labels_remaining.startswith(','):
                            labels_remaining = labels_remaining[1:].lstrip()
                            # Extract labels (may be quoted)
                            if labels_remaining.startswith('"'):
                                labels = labels_remaining[1:].rstrip('",').strip()
                            else:
                                # Unquoted labels - take until next comma
                                comma_pos = labels_remaining.find(',')
                                if comma_pos > 0:
                                    labels = labels_remaining[:comma_pos].strip().rstrip(',')
                                else:
                                    labels = labels_remaining.strip().rstrip(',').strip()
                        found_closing = True
                        break
                    else:
                        dialogue_parts.append(next_line.rstrip('\n'))
                        i += 1
                
                row_data['dialogue'] = '\n'.join(dialogue_parts).strip()
                row_data['labels'] = labels.strip()
                if not found_closing:
                    i -= 1  # Back up if we didn't find closing quote
            else:
                # Unquoted dialogue
                row_data['dialogue'] = remaining.strip()
                row_data['labels'] = ''
            
            rows.append(row_data)
        
        i += 1
    
    return rows

def extract_dialogue_turns(dialogue_text: str) -> List[Dict[str, str]]:
    """Extract Customer/Agent turns from dialogue text."""
    turns = []
    
    if not dialogue_text or not dialogue_text.strip():
        return turns
    
    # The dialogue format is: "Customer :text\nAgent :text" 
    # Normalize newlines
    dialogue_text = dialogue_text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Split by lines and process
    lines = dialogue_text.split('\n')
    current_role = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line starts with Customer or Agent marker
        if re.match(r'^Customer\s*:', line, re.IGNORECASE):
            # Save previous turn
            if current_role and current_content:
                content = ' '.join(current_content).strip()
                if content:
                    turns.append({
                        'role': current_role,
                        'content': content
                    })
            current_role = 'user'
            current_content = []
            # Extract content after "Customer :"
            content = re.sub(r'^Customer\s*:\s*', '', line, flags=re.IGNORECASE).strip()
            if content:
                current_content.append(content)
        elif re.match(r'^Agent\s*:', line, re.IGNORECASE):
            # Save previous turn
            if current_role and current_content:
                content = ' '.join(current_content).strip()
                if content:
                    turns.append({
                        'role': current_role,
                        'content': content
                    })
            current_role = 'assistant'
            current_content = []
            # Extract content after "Agent :"
            content = re.sub(r'^Agent\s*:\s*', '', line, flags=re.IGNORECASE).strip()
            if content:
                current_content.append(content)
        else:
            # Continuation of current role's content
            if current_role:
                if line:
                    current_content.append(line)
    
    # Add last turn
    if current_role and current_content:
        content = ' '.join(current_content).strip()
        if content:
            turns.append({
                'role': current_role,
                'content': content
            })
    
    return turns

def group_conversations_by_emotion(rows: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group conversation rows by emotion and situation."""
    grouped = defaultdict(list)
    
    for row in rows:
        emotion = row.get('emotion', 'unknown').strip()
        situation = row.get('situation', '').strip()
        
        # Create a key from emotion and situation
        key = f"{emotion}_{situation[:50]}"  # Limit situation length for key
        
        grouped[key].append(row)
    
    return grouped

def create_conversation_from_group(
    emotion: str,
    situation: str,
    rows: List[Dict[str, Any]],
    conv_index: int
) -> Dict[str, Any]:
    """Create a conversation JSON from grouped rows."""
    messages = []
    
    # Collect all dialogue turns
    for row in rows:
        dialogue_text = row.get('dialogue', '')
        labels = row.get('labels', '').strip()
        
        # The dialogue field has Customer turn and "Agent :" marker (possibly empty)
        # The labels field has the Agent response
        if dialogue_text:
            # Combine dialogue with labels (Agent response)
            if labels:
                # Clean up labels - remove trailing quotes and commas
                labels = labels.strip().rstrip('",').strip()
                if labels:
                    # If dialogue ends with "Agent :" or "Agent:", add the labels
                    if re.search(r'Agent\s*:\s*$', dialogue_text, re.IGNORECASE):
                        # Replace empty Agent marker with actual response
                        dialogue_text = re.sub(r'Agent\s*:\s*$', f'Agent :{labels}', dialogue_text, flags=re.IGNORECASE)
                    elif 'Agent :' not in dialogue_text and 'Agent:' not in dialogue_text:
                        # Add Agent turn if completely missing
                        dialogue_text += f'\nAgent :{labels}'
                    else:
                        # Agent marker exists but might have content - append labels
                        dialogue_text += f'\n{labels}'
            
            turns = extract_dialogue_turns(dialogue_text)
            messages.extend(turns)
    
    # Remove duplicates and empty messages
    seen = set()
    unique_messages = []
    for msg in messages:
        content = msg['content'].strip()
        if content and content not in seen:
            seen.add(content)
            unique_messages.append({
                'role': msg['role'],
                'content': content
            })
    
    # Ensure we have at least 2 messages
    if len(unique_messages) < 2:
        return None
    
    # Create conversation ID
    emotion_clean = emotion.lower().replace(' ', '-')
    conv_id = f"emo-{emotion_clean}-{conv_index}"
    
    conversation = {
        "id": conv_id,
        "messages": unique_messages,
        "emotion": emotion,
        "situation": situation,
        "source": "empathetic_dialogues"
    }
    
    return conversation

def main():
    """Main extraction function."""
    data_dir = Path(__file__).parent
    emo_file = data_dir / 'emo.md'
    output_dir = Path(__file__).parent.parent / 'output'
    public_output_dir = Path(__file__).parent.parent / 'public' / 'output'
    
    if not emo_file.exists():
        print(f"Error: {emo_file} not found!")
        return
    
    print("Parsing emo.md...")
    rows = parse_emo_file(emo_file)
    print(f"Parsed {len(rows)} rows")
    
    # Group by emotion and situation
    print("Grouping conversations...")
    grouped = group_conversations_by_emotion(rows)
    print(f"Found {len(grouped)} conversation groups")
    
    # Create conversations
    all_conversations = []
    emotion_counts = defaultdict(int)
    
    for key, group_rows in grouped.items():
        if not group_rows:
            continue
        
        # Extract emotion and situation from first row
        first_row = group_rows[0]
        emotion = first_row.get('emotion', 'unknown').strip()
        situation = first_row.get('situation', '').strip()
        
        emotion_counts[emotion] += 1
        conv_index = emotion_counts[emotion]
        
        conversation = create_conversation_from_group(
            emotion, situation, group_rows, conv_index
        )
        
        if conversation:
            all_conversations.append(conversation)
    
    print(f"\nCreated {len(all_conversations)} conversations")
    print("\nEmotion distribution:")
    for emotion, count in sorted(emotion_counts.items()):
        print(f"  {emotion}: {count}")
    
    # Save individual conversation files
    output_dir.mkdir(parents=True, exist_ok=True)
    public_output_dir.mkdir(parents=True, exist_ok=True)
    
    saved_count = 0
    for conv in all_conversations:
        # Save to output/
        output_file = output_dir / f"{conv['id']}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(conv, f, indent=2, ensure_ascii=False)
        
        # Save to public/output/
        public_file = public_output_dir / f"{conv['id']}.json"
        with open(public_file, 'w', encoding='utf-8') as f:
            json.dump(conv, f, indent=2, ensure_ascii=False)
        
        saved_count += 1
    
    print(f"\n✅ Saved {saved_count} conversations to:")
    print(f"   - {output_dir}/")
    print(f"   - {public_output_dir}/")
    
    # Also create a combined file for classification
    combined_file = data_dir / 'empathetic_dialogues_sample.json'
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(all_conversations, f, indent=2, ensure_ascii=False)
    print(f"   - {combined_file} (combined file for classification)")
    
    print(f"\nNote: These conversations need classification to be fully usable.")
    print(f"Run the classifier with:")
    print(f"  python3 classifier/classifier-openai.py {combined_file} output/classified-emo.json --individual")

if __name__ == '__main__':
    main()

