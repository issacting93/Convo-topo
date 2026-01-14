#!/usr/bin/env python3
"""
Human-Human Conversation Classifier (Social Role Theory-Based)

Classification for human-human dialogues (not human-AI).
Uses Social Role Theory framework adapted for human-human interaction.

Usage:
    python classifier-openai-human-human.py conversations.json output.json \
        --model gpt-5.2
"""

import json
import sys
import time
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

# Load .env file if it exists
def load_env_file():
    """Load environment variables from .env file"""
    possible_paths = [
        Path(".env"),
        Path("../.env"),
    ]
    
    try:
        script_dir = Path(__file__).parent
        possible_paths.append(script_dir.parent / ".env")
    except NameError:
        pass
    
    env_path = None
    for path in possible_paths:
        if path.exists():
            env_path = path
            break
    
    if env_path and env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    if line.startswith("export "):
                        line = line[7:]
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip().strip('"').strip("'")
                        os.environ[key] = value

load_env_file()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# ============================================================================
# PROMPT TEMPLATE (Human-Human Social Role Theory Framework)
# ============================================================================

CLASSIFICATION_PROMPT_TEMPLATE = """You are an academic conversation coder analyzing human-human dialogues for research on conversational dynamics using Social Role Theory.

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- If confidence < 0.6, you MUST name one plausible alternative category.
- Evidence quotes must be EXACT excerpts from the conversation.
- Both participants are humans (not AI), so roles are symmetric.

## TASK
Classify the conversation across 10 dimensions:
- Dimensions 1–8: choose ONE category
- Dimensions 9–10: output a PROBABILITY DISTRIBUTION over roles for each participant (values must sum to 1.0)

## CONFIDENCE CALIBRATION
- 0.9–1.0: Unambiguous, clear signals, no reasonable alternative
- 0.7–0.9: Strong fit, minor ambiguity or mixed signals
- 0.5–0.7: Moderate fit, could reasonably be another category
- 0.3–0.5: Weak fit, defaulting due to lack of better option / short conversation
- <0.3: Highly uncertain, conversation may be too short or ambiguous

## EDGE CASES
- If conversation is 1–2 turns: set confidence <= 0.5 for most dimensions
- If you cannot justify with quotes: set confidence <= 0.5
- Set "abstain": true if too short/ambiguous to meaningfully classify (still provide best-effort)

## HUMAN-HUMAN ROLE TAXONOMY (Social Role Theory)

Both participants can take on any role. Roles are symmetric.

### Participant 1 Roles (6 roles):
1. **Information-Seeker** (Instrumental, Low Authority)
   - Asks questions, seeks information, requests explanations
   - Signals: "What is...?", "How do I...?", "Can you explain...?"

2. **Information-Provider** (Instrumental, High Authority)
   - Provides information, answers questions, shares knowledge
   - Signals: Direct answers, definitions, explanations, "X is..."

3. **Director** (Instrumental, High Authority)
   - Commands, specifies actions, controls task flow
   - Signals: "Do this...", "Let's...", "We should...", directives

4. **Collaborator** (Instrumental, Equal Authority)
   - Co-builds, proposes alternatives, joint problem-solving
   - Signals: "What if we...?", "We could...", builds on partner's ideas

5. **Social-Expressor** (Expressive, Low Authority)
   - Personal narrative, emotional expression, sharing feelings
   - Signals: "I feel...", personal stories, emotional sharing

6. **Relational-Peer** (Expressive, Equal Authority)
   - Equal partner, social bonding, casual conversation
   - Signals: Casual chat, "how are you?", rapport-building, friendly banter

### Participant 2 Roles (Same 6 roles):
Same taxonomy applies to both participants. Each participant gets a probability distribution.

## DIMENSIONS

### 1. Interaction Pattern
Categories: question-answer, storytelling, collaborative, advisory, debate, casual-chat, other
- **question-answer**: One asks, other answers (information exchange)
- **storytelling**: Narrative sharing, personal stories
- **collaborative**: Joint problem-solving, co-creation
- **advisory**: One gives advice/recommendations to other
- **debate**: Disagreement, argumentation, different viewpoints
- **casual-chat**: Light conversation, small talk, rapport-building
- **other**: Doesn't fit above categories

### 2. Power Dynamics
Categories: participant1-dominant, balanced, participant2-dominant
- **participant1-dominant**: Participant 1 controls flow, directs, has more authority
- **balanced**: Equal participation, shared control
- **participant2-dominant**: Participant 2 controls flow, directs, has more authority

### 3. Emotional Tone
Categories: neutral, frustrated, playful, supportive, serious, empathetic, other
- **neutral**: No strong emotional content
- **frustrated**: Tension, irritation, conflict
- **playful**: Humor, lighthearted, joking
- **supportive**: Encouraging, validating, helpful
- **serious**: Formal, focused, no-nonsense
- **empathetic**: Understanding, compassionate, emotionally attuned
- **other**: Other emotional tone

### 4. Engagement Style
Categories: questioning, directing, affirming, sharing, listening, other
- **questioning**: Asks questions, probes, seeks information
- **directing**: Commands, instructs, guides
- **affirming**: Validates, agrees, supports
- **sharing**: Offers information, tells stories, expresses
- **listening**: Receives, acknowledges, minimal response
- **other**: Other engagement style

### 5. Knowledge Exchange
Categories: factual-info, problem-solving, emotional-processing, storytelling, other
- **factual-info**: Exchanging facts, information, knowledge
- **problem-solving**: Working together to solve problems
- **emotional-processing**: Processing feelings, emotional support
- **storytelling**: Sharing narratives, personal experiences
- **other**: Other type of exchange

### 6. Conversation Purpose
Categories: information-seeking, task-completion, relationship-building, emotional-support, entertainment, exploration, other
- **information-seeking**: Seeking knowledge, answers, explanations
- **task-completion**: Working toward a specific goal
- **relationship-building**: Building rapport, connection
- **emotional-support**: Providing emotional comfort, validation
- **entertainment**: Fun, enjoyment, amusement
- **exploration**: Exploring ideas, possibilities
- **other**: Other purpose

### 7. Turn Taking
Categories: balanced, participant1-heavy, participant2-heavy, alternating
- **balanced**: Equal participation from both
- **participant1-heavy**: Participant 1 speaks more
- **participant2-heavy**: Participant 2 speaks more
- **alternating**: Clear back-and-forth pattern

### 8. Conversation Structure
Categories: structured, emergent, mixed
- **structured**: Clear organization, goal-oriented, planned
- **emergent**: Organic flow, topic-hopping, spontaneous
- **mixed**: Combination of structured and emergent

### 9. Participant 1 Role Distribution
Probability distribution over 6 roles (must sum to 1.0):
- information-seeker
- information-provider
- director
- collaborator
- social-expressor
- relational-peer

### 10. Participant 2 Role Distribution
Probability distribution over 6 roles (must sum to 1.0):
- information-seeker
- information-provider
- director
- collaborator
- social-expressor
- relational-peer

## OUTPUT FORMAT

Return valid JSON only, no markdown, no explanation:

{{
  "interactionPattern": {{
    "category": "question-answer",
    "confidence": 0.85,
    "evidence": ["quote1", "quote2"]
  }},
  "powerDynamics": {{
    "category": "balanced",
    "confidence": 0.8,
    "evidence": ["quote1"]
  }},
  "emotionalTone": {{
    "category": "neutral",
    "confidence": 0.75,
    "evidence": ["quote1"]
  }},
  "engagementStyle": {{
    "category": "questioning",
    "confidence": 0.8,
    "evidence": ["quote1"]
  }},
  "knowledgeExchange": {{
    "category": "factual-info",
    "confidence": 0.85,
    "evidence": ["quote1"]
  }},
  "conversationPurpose": {{
    "category": "information-seeking",
    "confidence": 0.8,
    "evidence": ["quote1"]
  }},
  "turnTaking": {{
    "category": "balanced",
    "confidence": 0.75,
    "evidence": ["quote1"]
  }},
  "conversationStructure": {{
    "category": "structured",
    "confidence": 0.8,
    "evidence": ["quote1"]
  }},
  "participant1Role": {{
    "distribution": {{
      "information-seeker": 0.6,
      "information-provider": 0.2,
      "director": 0.0,
      "collaborator": 0.1,
      "social-expressor": 0.05,
      "relational-peer": 0.05
    }},
    "confidence": 0.8,
    "evidence": ["quote1", "quote2"]
  }},
  "participant2Role": {{
    "distribution": {{
      "information-seeker": 0.1,
      "information-provider": 0.7,
      "director": 0.0,
      "collaborator": 0.1,
      "social-expressor": 0.05,
      "relational-peer": 0.05
    }},
    "confidence": 0.8,
    "evidence": ["quote1", "quote2"]
  }},
  "abstain": false
}}

## CONVERSATION TO CLASSIFY

{conversation_text}

Classify this human-human conversation:
"""

# ============================================================================
# MAIN CLASSIFICATION FUNCTION
# ============================================================================

def classify_conversation(client: OpenAI, conversation: Dict, model: str = "gpt-5.2") -> Dict:
    """Classify a single conversation using GPT model."""
    
    # Format conversation for prompt
    messages_text = []
    for msg in conversation.get("messages", []):
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        # Map user/assistant to Participant 1/Participant 2 for clarity
        if role == "user":
            participant = "Participant 1"
        elif role == "assistant":
            participant = "Participant 2"
        else:
            participant = role
        
        messages_text.append(f"{participant}: {content}")
    
    conversation_text = "\n".join(messages_text)
    
    # Build prompt
    prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(conversation_text=conversation_text)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a conversation analyst using Social Role Theory. Return only valid JSON, no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result_text = response.choices[0].message.content
        classification = json.loads(result_text)
        
        # Add metadata
        classification["classificationMetadata"] = {
            "model": model,
            "provider": "openai",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "human-human-1.0.0",
            "conversationType": "human-human"
        }
        
        return classification
        
    except Exception as e:
        print(f"Error classifying conversation {conversation.get('id', 'unknown')}: {e}")
        return None

# ============================================================================
# MAIN SCRIPT
# ============================================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Classify human-human conversations")
    parser.add_argument("input", help="Input JSON file (conversation or list of conversations)")
    parser.add_argument("output", help="Output JSON file")
    parser.add_argument("--model", default="gpt-5.2", help="OpenAI model to use")
    parser.add_argument("--individual", action="store_true", help="Process as individual files")
    parser.add_argument("--output-dir", default="public/output", help="Output directory for individual mode")
    
    args = parser.parse_args()
    
    # Initialize OpenAI client
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found in environment")
        sys.exit(1)
    
    client = OpenAI(api_key=api_key)
    
    # Load input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle list of conversations or single conversation
    if isinstance(data, list):
        conversations = data
    else:
        conversations = [data]
    
    # Process conversations
    results = []
    output_dir = Path(args.output_dir) if args.individual else None
    
    if output_dir and args.individual:
        output_dir.mkdir(parents=True, exist_ok=True)
    
    for i, conv in enumerate(conversations):
        conv_id = conv.get("id", f"conversation-{i}")
        print(f"Classifying {conv_id}... ({i+1}/{len(conversations)})")
        
        classification = classify_conversation(client, conv, args.model)
        
        if classification:
            # Merge classification into conversation
            conv["classification"] = classification
            
            if args.individual:
                # Save individual file
                output_file = output_dir / f"{conv_id}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(conv, f, indent=2, ensure_ascii=False)
                print(f"  ✅ Saved to {output_file}")
            else:
                results.append(conv)
            
            # Rate limiting
            time.sleep(0.5)
        else:
            print(f"  ❌ Failed to classify {conv_id}")
    
    # Save combined output if not individual mode
    if not args.individual and results:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Classified {len(results)} conversations, saved to {args.output}")
    elif args.individual:
        print(f"\n✅ Classified {len(conversations)} conversations individually")

if __name__ == "__main__":
    main()

