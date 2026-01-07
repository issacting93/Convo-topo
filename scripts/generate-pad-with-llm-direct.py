#!/usr/bin/env python3
"""
Generate PAD values and/or re-classify conversations using OpenAI GPT-4o-mini

This script uses GPT-4o-mini to:
1. Generate PAD (Pleasure-Arousal-Dominance) values for each message
2. Re-classify conversations across 9 dimensions (optional)

The LLM processes entire conversations in batches, maintaining context across messages.

Usage:
    # Generate PAD values only (default)
    python3 scripts/generate-pad-with-llm-direct.py --file chatbot_arena_01.json
    python3 scripts/generate-pad-with-llm-direct.py --all
    
    # Re-classify chatbot_arena conversations only (20 files)
    python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify-only
    
    # Both PAD and classification for chatbot_arena
    python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify
    
    # Dry-run to preview
    python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify-only --dry-run

Options:
    --file filename      Process a single file
    --all                Process all files in public/output/
    --dry-run            Preview changes without writing files
    --force              Recalculate PAD even if already present
    --classify           Also re-classify conversations
    --classify-only      Only re-classify, skip PAD generation
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables from .env if it exists
def load_env_file():
    """Load environment variables from .env file"""
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    key = key.replace("export ", "").strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value

load_env_file()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# Configuration
MODEL = "gpt-4o-mini"  # High performance, low cost for batching
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "output"


def get_openai_client() -> OpenAI:
    """Get OpenAI client, checking for API key"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not set")
        print("   Set it with: export OPENAI_API_KEY=sk-your-key-here")
        print("   Or add to .env file: OPENAI_API_KEY=sk-your-key-here")
        sys.exit(1)
    return OpenAI(api_key=api_key)


def generate_pad_batch(client: OpenAI, conversation: Dict) -> Optional[List[Dict]]:
    """
    Sends the entire conversation to the LLM to get a sequence of PAD values.
    Uses GPT-4o-mini for cost-effective batch processing.
    """
    conv_id = conversation.get('id', 'unknown')
    messages = conversation.get('messages', [])
    
    if not messages:
        return None
    
    # Extract existing classification as context baseline
    classification = conversation.get('classification', {})
    tone = classification.get('emotionalTone', {}).get('category', 'neutral')
    style = classification.get('engagementStyle', {}).get('category', 'reactive')

    # Prepare the message text for the prompt
    formatted_history = ""
    for idx, msg in enumerate(messages):
        role = msg.get('role', 'user').upper()
        content = msg.get('content', '')
        formatted_history += f"[{idx}] {role}: {content}\n"

    system_prompt = f"""You are an expert behavioral psychologist specializing in the PAD (Pleasure-Arousal-Dominance) emotional model.
Analyze the following conversation and provide PAD scores (0.0 to 1.0) for EVERY message.

CONTEXT:
Overall Tone: {tone}
Engagement Style: {style}

DIMENSIONS:
- Pleasure (P): Valence. 0=Unhappy/Frustrated/Negative, 1=Happy/Satisfied/Positive.
- Arousal (A): Activation. 0=Sleepy/Calm/Passive, 1=Excited/Agitated/Activated.
- Dominance (D): Influence. 0=Submissive/Led/Passive, 1=Dominant/Leading/Assertive.

CRITICAL DETECTION RULES:

1. SARCASM/FRUSTRATION:
   - Markers: "yeah cool", "like I haven't been...", "seriously?", "ugh", "come on", "that's not what", "what?", "huh?"
   - Pattern: Lower pleasure (0.2-0.4), Higher arousal (0.6-0.8), Maintain or increase dominance (0.5-0.7)
   - Example: "Uhm, yeah cool, now explain that like I haven't been studying for 20 years"
     → p=0.3, a=0.7, d=0.6 (frustrated, agitated, asserting)

2. APOLOGIES:
   - Markers: "sorry", "apologize", "apology", "my mistake", "I apologize", "I'm sorry"
   - Pattern: Lower pleasure (0.3-0.5), Moderate arousal (0.4-0.6), Lower dominance (0.2-0.4)
   - Example: "I apologize if I offended you"
     → p=0.4, a=0.5, d=0.3 (acknowledging mistake, concerned, submissive)

3. MISUNDERSTANDINGS:
   - When a question is asked but the answer doesn't address it, or when there's clear confusion
   - Pattern: Lower pleasure (0.3-0.5), Higher arousal (0.5-0.7), Lower dominance (0.3-0.5)
   - Example: User asks "what is X?" but AI gives unrelated answer
     → AI response: p=0.4, a=0.6, d=0.3 (confused, uncertain)

4. TASK COMPLETION/SUCCESS:
   - Markers: "perfect", "thanks", "that works", "exactly", "got it", "that's great"
   - Pattern: Higher pleasure (0.7-0.9), Moderate arousal (0.4-0.6), Maintain dominance (0.5-0.7)
   - Example: "Perfect! That's exactly what I needed"
     → p=0.8, a=0.5, d=0.6 (satisfied, content, in control)

5. EMOTIONAL VARIATION REQUIREMENT:
   - For conversations with 5+ messages, ensure emotional intensity range ≥ 0.2
   - At least 30% of messages should have unique PAD combinations
   - Reflect emotional dynamics: frustration → resolution, confusion → clarity, etc.
   - Do NOT make all messages have similar PAD values

CONTEXT AWARENESS:
- Consider the conversation flow and previous messages
- A short "Okay" might be:
  - High pleasure (0.7) after helpful advice
  - Low pleasure (0.3), High arousal (0.7) after repeated error
- Detect topic shifts and reflect in arousal (slight increase)
- Track emotional arcs: frustration → apology → resolution
- If previous message was a question and current doesn't answer it → Lower pleasure, Higher arousal
- Messages in non-English languages should be analyzed based on emotional content, not just keywords

IMPORTANT:
- Vary scores across messages to reflect emotional changes throughout the conversation
- CRITICAL: You MUST provide exactly ONE PAD score for EACH message in the conversation. The array length must match the message count exactly.

OUTPUT FORMAT:
Return a JSON object with a "pad_scores" array. The array MUST contain exactly {len(messages)} objects (one for each message).
Each object in the array should have "p", "a", and "d" fields.
Example for {len(messages)} messages: {{"pad_scores": [{{"p": 0.5, "a": 0.3, "d": 0.5}}, {{"p": 0.7, "a": 0.2, "d": 0.6}}, ...]}} with exactly {len(messages)} entries.
"""

    user_prompt = f"Analyze these {len(messages)} messages and return the PAD array:\n\n{formatted_history}"

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},  # Ensures valid JSON
            temperature=0.3  # Lower temperature for more consistent results
        )
        
        # Parse result
        raw_output = json.loads(response.choices[0].message.content)
        
        # Handle cases where LLM wraps the array in a key like "pad_scores"
        if isinstance(raw_output, dict) and 'pad_scores' in raw_output:
            pad_array = raw_output['pad_scores']
        elif isinstance(raw_output, list):
            pad_array = raw_output
        else:
            # Try to find any array in the response
            pad_array = None
            for key, value in raw_output.items():
                if isinstance(value, list):
                    pad_array = value
                    break
            
            if pad_array is None:
                print(f"⚠️  Warning: Could not parse PAD scores from response for {conv_id}")
                return None
        
        # Validate array length matches message count
        if len(pad_array) != len(messages):
            print(f"⚠️  Warning: PAD array length ({len(pad_array)}) doesn't match message count ({len(messages)}) for {conv_id}")
            # Pad with default values if shorter (use last value as fallback for better continuity)
            if len(pad_array) < len(messages):
                missing_count = len(messages) - len(pad_array)
                # Use the last PAD value as a reasonable default (better than 0.5,0.5,0.5)
                last_pad = pad_array[-1] if pad_array else {"p": 0.5, "a": 0.5, "d": 0.5}
                pad_array.extend([last_pad.copy() for _ in range(missing_count)])
                print(f"   ⚠️  Padded {missing_count} missing entries with last PAD value: {last_pad}")
            else:
                pad_array = pad_array[:len(messages)]
                print(f"   ⚠️  Truncated array from {len(pad_array) + (len(pad_array) - len(messages))} to {len(messages)} entries")
        
        return pad_array

    except Exception as e:
        print(f"❌ Error processing {conv_id}: {e}")
        import traceback
        traceback.print_exc()
        return None


# Classification prompt (same structure as classifier-openai.py, simplified for GPT-4o-mini)
CLASSIFICATION_PROMPT = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- If confidence < 0.6, you MUST name one plausible alternative category.
- Evidence quotes must be EXACT excerpts from the conversation.

## TASK
Classify the conversation across 9 dimensions:
- Dimensions 1–8: choose ONE category
- Dimensions 9–10: output a PROBABILITY DISTRIBUTION over roles (values must sum to 1.0)

Note: Some older classifications may have included "topicDepth" (dimension 7), but this is now deprecated. Do not include topicDepth in your output.

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

---

## DIMENSION DEFINITIONS

### 1. INTERACTION PATTERN
| Category | Definition |
|----------|------------|
| question-answer | One party primarily asks questions, other provides answers |
| storytelling | Extended narrative, explanation, or sequential account |
| advisory | Guidance, recommendations, or counsel being given |
| debate | Argumentation, persuasion, or position defense |
| collaborative | Joint problem-solving, brainstorming, or co-creation |
| casual-chat | Social exchange without specific instrumental goal |

### 2. POWER DYNAMICS
| Category | Definition |
|----------|------------|
| human-led | Human sets agenda, asks most questions, steers topics |
| ai-led | AI drives conversation through questions or topic shifts |
| balanced | Roughly equal contribution to direction |
| alternating | Control shifts noticeably between parties |

### 3. EMOTIONAL TONE
| Category | Definition |
|----------|------------|
| supportive | Warm, encouraging, affirming |
| playful | Light, humorous, fun |
| serious | Grave, weighty, consequential |
| empathetic | Understanding, compassionate, validating feelings |
| professional | Formal, business-like, task-focused |
| neutral | No strong emotional coloring |

### 4. ENGAGEMENT STYLE
| Category | Definition |
|----------|------------|
| questioning | Frequent questions driving exploration |
| challenging | Pushback, critique, or devil's advocate |
| exploring | Open-ended wondering, brainstorming |
| affirming | Agreement, validation, building on ideas |
| reactive | Responding without strong direction |

### 5. KNOWLEDGE EXCHANGE
| Category | Definition |
|----------|------------|
| personal-sharing | Private experiences, feelings, life details |
| skill-sharing | How-to knowledge, techniques, methods |
| opinion-exchange | Views, beliefs, interpretations |
| factual-info | Data, facts, definitions, specifications |
| experience-sharing | Narratives about learning or doing something |

### 6. CONVERSATION PURPOSE
| Category | Definition |
|----------|------------|
| information-seeking | Obtaining specific knowledge or answers |
| problem-solving | Resolving an issue or challenge |
| entertainment | Fun, amusement, passing time |
| relationship-building | Social bonding, rapport, connection |
| self-expression | Processing thoughts, venting, journaling |

### 7. TURN TAKING
| Category | Definition |
|----------|------------|
| user-dominant | Human messages substantially longer/more |
| assistant-dominant | AI messages substantially longer/more |
| balanced | Roughly equal message lengths |

---

### 8. HUMAN ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| seeker | Requests information/clarification; primarily questions |
| learner | Tests understanding, applies, verifies ("so if…, then…", "does that mean…?") |
| director | Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text") |
| collaborator | Proposes alternatives/tradeoffs; co-builds iteratively |
| sharer | Personal narrative/context mainly for expression/relational framing |
| challenger | Critiques/stress-tests claims; explicit pushback |

### 9. AI ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| expert | Explains/teaches/frames concepts; definitions; examples |
| advisor | Prescribes steps/recommendations ("do X then Y") |
| facilitator | Guides via questions/scaffolding/options rather than prescribing |
| reflector | Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…") |
| peer | Brainstorms alongside with low-authority tone ("we could…") |
| affiliative | Warmth/encouragement/rapport not required for task completion |

---

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown fences). Role distributions must sum to 1.0.

{
  "abstain": false,
  "interactionPattern": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "powerDynamics": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "emotionalTone": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "engagementStyle": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "knowledgeExchange": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "conversationPurpose": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "turnTaking": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
  "humanRole": {
    "distribution": {"seeker": 0, "learner": 0, "director": 0, "collaborator": 0, "sharer": 0, "challenger": 0},
    "confidence": 0.0,
    "evidence": [{"role": "seeker", "quote": "..."}],
    "rationale": "...",
    "alternative": null
  },
  "aiRole": {
    "distribution": {"expert": 0, "advisor": 0, "facilitator": 0, "reflector": 0, "peer": 0, "affiliative": 0},
    "confidence": 0.0,
    "evidence": [{"role": "expert", "quote": "..."}],
    "rationale": "...",
    "alternative": null
  }
}

---

## CONVERSATION TO ANALYZE

"""


def format_conversation_for_classification(messages: List[Dict]) -> str:
    """Format conversation messages for classification prompt"""
    formatted = ""
    for msg in messages:
        role = msg.get('role', 'user').upper()
        content = msg.get('content', '')
        formatted += f"{role}: {content}\n"
    return formatted


def normalize_dist(dist: dict) -> dict:
    """Normalize distribution to sum to 1.0"""
    total = sum(dist.values())
    if total <= 0:
        return dist
    return {k: round(v / total, 3) for k, v in dist.items()}


def convert_classification_format(raw_classification: Dict) -> Dict:
    """
    Convert classification from any format to the app-expected format.
    Handles both snake_case and camelCase, and converts structure as needed.
    """
    converted = {}
    
    # Mapping from snake_case to camelCase
    field_mapping = {
        'interaction_pattern': 'interactionPattern',
        'power_dynamics': 'powerDynamics',
        'emotional_tone': 'emotionalTone',
        'engagement_style': 'engagementStyle',
        'knowledge_exchange': 'knowledgeExchange',
        'conversation_purpose': 'conversationPurpose',
        'topic_depth': 'topicDepth',
        'turn_taking': 'turnTaking',
        'human_role_distribution': 'humanRole',
        'ai_role_distribution': 'aiRole'
    }
    
    for old_key, new_key in field_mapping.items():
        # Check both snake_case and camelCase
        source_key = old_key if old_key in raw_classification else new_key
        if source_key not in raw_classification:
            continue
        
        value = raw_classification[source_key]
        
        # Handle role distributions specially
        if old_key in ['human_role_distribution', 'ai_role_distribution']:
            # Convert flat distribution to nested structure
            if isinstance(value, dict):
                # Check if already in correct format (has 'distribution' key)
                if 'distribution' in value:
                    converted[new_key] = value.copy()
                else:
                    # It's a flat distribution, convert to nested
                    distribution = {}
                    confidence = 0.5
                    evidence = []
                    rationale = ""
                    
                    # Extract distribution values (filter out metadata)
                    for k, v in value.items():
                        if k in ['seeker', 'learner', 'director', 'collaborator', 'sharer', 'challenger']:
                            distribution[k] = float(v)
                        elif k in ['expert', 'advisor', 'facilitator', 'reflector', 'peer', 'affiliative']:
                            distribution[k] = float(v)
                        elif k == 'confidence':
                            confidence = float(v)
                        elif k == 'evidence':
                            evidence = value[k] if isinstance(value[k], list) else []
                        elif k == 'rationale':
                            rationale = str(value[k])
                    
                    # Normalize distribution
                    distribution = normalize_dist(distribution)
                    
                    converted[new_key] = {
                        'distribution': distribution,
                        'confidence': confidence,
                        'evidence': evidence,
                        'rationale': rationale,
                        'alternative': None
                    }
        else:
            # Handle regular dimensions
            if isinstance(value, dict):
                converted_dim = value.copy()
                
                # Convert 'value' to 'category' if needed
                if 'value' in converted_dim and 'category' not in converted_dim:
                    converted_dim['category'] = converted_dim.pop('value')
                
                # Ensure required fields exist
                if 'category' not in converted_dim:
                    continue
                if 'confidence' not in converted_dim:
                    converted_dim['confidence'] = 0.5
                if 'evidence' not in converted_dim:
                    converted_dim['evidence'] = []
                if 'rationale' not in converted_dim:
                    converted_dim['rationale'] = ""
                if 'alternative' not in converted_dim:
                    converted_dim['alternative'] = None
                
                converted[new_key] = converted_dim
    
    # Copy abstain if present
    if 'abstain' in raw_classification:
        converted['abstain'] = raw_classification['abstain']
    
    return converted


def classify_conversation(client: OpenAI, conversation: Dict) -> Optional[Dict]:
    """
    Classify a conversation using GPT-4o-mini.
    Returns classification dictionary in the app-expected format (camelCase with category fields).
    """
    conv_id = conversation.get('id', 'unknown')
    messages = conversation.get('messages', [])
    
    if not messages:
        return None
    
    formatted_conv = format_conversation_for_classification(messages)
    prompt = CLASSIFICATION_PROMPT + formatted_conv
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert conversation analyst. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        raw_output = json.loads(response.choices[0].message.content)
        
        # Convert to app-expected format
        converted = convert_classification_format(raw_output)
        
        # Normalize role distributions
        if 'humanRole' in converted and 'distribution' in converted['humanRole']:
            converted['humanRole']['distribution'] = normalize_dist(converted['humanRole']['distribution'])
        if 'aiRole' in converted and 'distribution' in converted['aiRole']:
            converted['aiRole']['distribution'] = normalize_dist(converted['aiRole']['distribution'])
        
        return converted
        
    except Exception as e:
        print(f"❌ Error classifying {conv_id}: {e}")
        import traceback
        traceback.print_exc()
        return None


def apply_pad_and_calculate_intensity(conversation: Dict, pad_scores: List[Dict]) -> Dict:
    """
    Updates the conversation object with PAD values and the calculated Z-axis (Intensity).
    Formula: emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4
    """
    for i, msg in enumerate(conversation['messages']):
        if i < len(pad_scores):
            pad_entry = pad_scores[i]
            p = float(pad_entry.get('p', pad_entry.get('pleasure', 0.5)))
            a = float(pad_entry.get('a', pad_entry.get('arousal', 0.5)))
            d = float(pad_entry.get('d', pad_entry.get('dominance', 0.5)))
            
            # Clamp values to 0-1 range
            p = max(0.0, min(1.0, p))
            a = max(0.0, min(1.0, a))
            d = max(0.0, min(1.0, d))
            
            # Calculate Intensity for the Topographical Z-Axis
            # Formula: (1 - Pleasure) * 0.6 + Arousal * 0.4
            intensity = round(((1 - p) * 0.6) + (a * 0.4), 3)
            
            msg['pad'] = {
                "pleasure": round(p, 3),
                "arousal": round(a, 3),
                "dominance": round(d, 3),
                "emotionalIntensity": intensity
            }
    return conversation


def process_file(file_path: Path, client: OpenAI, dry_run: bool = False, force: bool = False, 
                 do_classify: bool = False, classify_only: bool = False) -> Dict:
    """
    Process a single conversation file to add PAD values.
    Returns a result dictionary with status information.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        conv_id = data.get('id', file_path.stem)
        
        # Skip if no messages
        if not data.get('messages'):
            return {
                'file': file_path.name,
                'status': 'skipped',
                'reason': 'No messages'
            }
        
        # Check if existing classification needs format conversion
        existing_classification = data.get('classification', {})
        needs_conversion = False
        if existing_classification and isinstance(existing_classification, dict):
            # Check for snake_case keys
            if any('_' in key for key in existing_classification.keys() if isinstance(key, str)):
                needs_conversion = True
            # Check for 'value' instead of 'category'
            elif any(isinstance(v, dict) and 'value' in v and 'category' not in v 
                    for v in existing_classification.values()):
                needs_conversion = True
            # Check for flat role distributions
            elif 'human_role_distribution' in existing_classification or 'ai_role_distribution' in existing_classification:
                needs_conversion = True
        
        classification_updated = False
        
        # Classification step (if requested OR if format needs conversion)
        if do_classify or classify_only:
            # Generate new classification
            classification_result = classify_conversation(client, data)
            if classification_result:
                data['classification'] = classification_result
                data['classificationMetadata'] = {
                    'model': MODEL,
                    'provider': 'openai',
                    'timestamp': datetime.now().isoformat(),
                    'promptVersion': '1.1.0',
                    'processingTimeMs': 0
                }
                classification_updated = True
            elif classify_only:
                return {
                    'file': file_path.name,
                    'status': 'error',
                    'reason': 'Failed to classify conversation'
                }
        elif needs_conversion:
            # Convert existing classification format (no LLM call needed)
            classification_result = convert_classification_format(existing_classification)
            if classification_result:
                data['classification'] = classification_result
                classification_updated = True
        
        # Skip PAD generation if classify-only mode
        if classify_only:
            if not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.write('\n')
            return {
                'file': file_path.name,
                'status': 'success',
                'classification': classification_result is not None,
                'dry_run': dry_run
            }
        
        # Check if classification exists (needed for PAD generation context)
        if not data.get('classification'):
            return {
                'file': file_path.name,
                'status': 'skipped',
                'reason': 'No classification (needed for PAD context). Use --classify to add classification first.'
            }
        
        # Check if PAD already exists (skip unless force mode)
        if not force and data['messages'] and data['messages'][0].get('pad'):
            return {
                'file': file_path.name,
                'status': 'skipped',
                'reason': 'Already has PAD values (use --force to recalculate)',
                'classification': classification_result is not None if do_classify else None
            }
        
        # Generate PAD scores
        pad_scores = generate_pad_batch(client, data)
        
        if pad_scores is None:
            return {
                'file': file_path.name,
                'status': 'error',
                'reason': 'Failed to generate PAD scores',
                'classification': classification_result is not None if do_classify else None
            }
        
        # Apply PAD values
        updated_data = apply_pad_and_calculate_intensity(data, pad_scores)
        
        # Calculate statistics
        intensities = [msg['pad']['emotionalIntensity'] for msg in updated_data['messages'] if msg.get('pad')]
        min_intensity = min(intensities) if intensities else 0
        max_intensity = max(intensities) if intensities else 0
        avg_intensity = sum(intensities) / len(intensities) if intensities else 0
        
        # Save file if not dry-run
        if not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(updated_data, f, indent=2, ensure_ascii=False)
                f.write('\n')
        
        return {
            'file': file_path.name,
            'status': 'success',
            'message_count': len(updated_data['messages']),
            'intensity_range': (min_intensity, max_intensity),
            'avg_intensity': avg_intensity,
            'classification': classification_result is not None if do_classify else None,
            'dry_run': dry_run
        }
        
    except Exception as e:
        return {
            'file': file_path.name,
            'status': 'error',
            'reason': str(e)
        }


def main():
    parser = argparse.ArgumentParser(
        description='Generate PAD values using OpenAI GPT-4o-mini'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Process a single file (filename in public/output/)'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Process all JSON files in public/output/'
    )
    parser.add_argument(
        '--chatbot-arena',
        action='store_true',
        help='Process only chatbot_arena_*.json files (20 conversations)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without writing files'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Recalculate PAD even if already present'
    )
    parser.add_argument(
        '--classify',
        action='store_true',
        help='Also re-classify conversations'
    )
    parser.add_argument(
        '--classify-only',
        action='store_true',
        help='Only re-classify, skip PAD generation'
    )
    
    args = parser.parse_args()
    
    if not args.file and not args.all and not args.chatbot_arena:
        parser.print_help()
        print("\n❌ Error: Must specify --file, --all, or --chatbot-arena")
        sys.exit(1)
    
    # Initialize OpenAI client
    client = get_openai_client()
    
    # Get list of files to process
    files_to_process = []
    
    if args.file:
        file_path = OUTPUT_DIR / args.file
        if not file_path.exists():
            print(f"❌ Error: File not found: {file_path}")
            sys.exit(1)
        files_to_process = [file_path]
    elif args.chatbot_arena:
        # Process only chatbot_arena files
        files_to_process = sorted(OUTPUT_DIR.glob("chatbot_arena_*.json"))
        if not files_to_process:
            print(f"❌ No chatbot_arena files found in {OUTPUT_DIR}")
            sys.exit(1)
    elif args.all:
        files_to_process = sorted(OUTPUT_DIR.glob("*.json"))
        # Filter out manifest.json if it exists
        files_to_process = [f for f in files_to_process if f.name != "manifest.json"]
    
    if not files_to_process:
        print(f"❌ No files found in {OUTPUT_DIR}")
        sys.exit(1)
    
    mode = "Classification" if args.classify_only else ("PAD + Classification" if args.classify else "PAD Generation")
    print(f"🤖 LLM-Based {mode} (GPT-4o-mini)\n")
    if args.dry_run:
        print("🔍 DRY RUN MODE - No files will be modified\n")
    if args.force:
        print("🔄 FORCE MODE - Will recalculate PAD even if already present\n")
    if args.classify or args.classify_only:
        print("📊 CLASSIFICATION MODE - Will re-classify conversations\n")
    print(f"📁 Processing {len(files_to_process)} file(s)...\n")
    
    # Process files
    results = {
        'success': 0,
        'skipped': 0,
        'error': 0
    }
    
    for file_path in files_to_process:
        result = process_file(file_path, client, args.dry_run, args.force, args.classify, args.classify_only)
        
        if result['status'] == 'success':
            if args.classify_only:
                print(f"✅ {result['file']}: Classified")
            else:
                print(f"✅ {result['file']}: {result.get('message_count', 0)} messages")
                if result.get('intensity_range'):
                    min_i, max_i = result['intensity_range']
                    print(f"   Intensity range: {min_i:.3f} - {max_i:.3f}, avg: {result.get('avg_intensity', 0):.3f}")
                if result.get('classification'):
                    print(f"   ✓ Also re-classified")
            results['success'] += 1
        elif result['status'] == 'skipped':
            print(f"⏭️  {result['file']}: {result['reason']}")
            results['skipped'] += 1
        else:
            print(f"❌ {result['file']}: {result['reason']}")
            results['error'] += 1
    
    # Summary
    print(f"\n📊 Summary:")
    print(f"   ✅ Success: {results['success']}")
    print(f"   ⏭️  Skipped: {results['skipped']}")
    print(f"   ❌ Errors: {results['error']}")
    
    if not args.dry_run and results['success'] > 0:
        print(f"\n💡 Next steps:")
        print(f"   1. Review updated PAD values in the visualization")
        print(f"   2. Check that intensity ranges match expected emotional patterns")


if __name__ == "__main__":
    main()

