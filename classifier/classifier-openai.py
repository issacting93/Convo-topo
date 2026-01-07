#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.1 (OpenAI Version)

Adapted from classifier-v1.1.py to use OpenAI's API instead of Anthropic.

Usage:
    python classifier-openai.py conversations.json output.json
    python classifier-openai.py conversations.json output.json --windowed --validation 30
"""

import json
import sys
import time
import os
from pathlib import Path
from datetime import datetime
from typing import Optional

# Load .env file if it exists
def load_env_file():
    """Load environment variables from .env file"""
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    # Remove 'export ' prefix if present
                    key = key.replace("export ", "").strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value

# Load .env before importing OpenAI
load_env_file()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# ============================================================================
# PROMPT (Same as v1.1)
# ============================================================================

CLASSIFICATION_PROMPT = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- If confidence < 0.6, you MUST name one plausible alternative category.
- Evidence quotes must be EXACT excerpts from the conversation.

## TASK
Classify the conversation across 10 dimensions:
- Dimensions 1–8: choose ONE category
- Dimensions 9–10: output a PROBABILITY DISTRIBUTION over roles (values must sum to 1.0)

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

### 7. TOPIC DEPTH
| Category | Definition |
|----------|------------|
| surface | Brief, shallow, or introductory |
| moderate | Some exploration but not exhaustive |
| deep | Thorough, nuanced, detailed exploration |

### 8. TURN TAKING
| Category | Definition |
|----------|------------|
| user-dominant | Human messages substantially longer/more |
| assistant-dominant | AI messages substantially longer/more |
| balanced | Roughly equal message lengths |

---

### 9. HUMAN ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| seeker | Requests information/clarification; primarily questions |
| learner | Tests understanding, applies, verifies ("so if…, then…", "does that mean…?") |
| director | Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text") |
| collaborator | Proposes alternatives/tradeoffs; co-builds iteratively |
| sharer | Personal narrative/context mainly for expression/relational framing |
| challenger | Critiques/stress-tests claims; explicit pushback |

**Tie-breakers:**
- seeker vs learner: learner shows checking/applying; seeker is request-only
- director vs seeker: director specifies deliverable/format constraints
- director vs collaborator: collaborator contributes options/tradeoffs; director mainly commands
- sharer vs collaborator: sharer is personal/relational; collaborator is task input
- challenger overrides if dominant move is pushback

### 10. AI ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| expert | Explains/teaches/frames concepts; definitions; examples |
| advisor | Prescribes steps/recommendations ("do X then Y") |
| facilitator | Guides via questions/scaffolding/options rather than prescribing |
| reflector | Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…") |
| peer | Brainstorms alongside with low-authority tone ("we could…") |
| affiliative | Warmth/encouragement/rapport not required for task completion |

**Tie-breakers:**
- expert vs advisor: expert explains concepts; advisor prescribes actions
- facilitator vs reflector: facilitator offers structure/options; reflector mirrors/validates
- peer vs facilitator: peer is speculative/equal; facilitator guides with intent
- affiliative is additive—can co-occur with others but only dominant if warmth > task content

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
  "topicDepth": {"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null},
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


# ============================================================================
# UTILITIES (Same as original)
# ============================================================================

def normalize_dist(dist: dict) -> dict:
    """Normalize distribution to sum to 1.0"""
    total = sum(dist.values())
    if total <= 0:
        return dist
    return {k: round(v / total, 3) for k, v in dist.items()}


def argmax_dist(dist: dict) -> str:
    """Get key with maximum value"""
    return max(dist.items(), key=lambda x: x[1])[0]


def create_windows(messages: list, window_size: int = 6, stride: int = 2) -> list:
    """Create overlapping windows of messages"""
    if len(messages) <= window_size:
        return [{"start": 0, "end": len(messages) - 1, "messages": messages}]
    
    windows = []
    for i in range(0, len(messages) - window_size + 1, stride):
        end = min(i + window_size, len(messages))
        windows.append({
            "start": i,
            "end": end - 1,
            "messages": messages[i:end]
        })
    
    if windows and windows[-1]["end"] < len(messages) - 1:
        windows.append({
            "start": len(messages) - window_size,
            "end": len(messages) - 1,
            "messages": messages[-window_size:]
        })
    
    return windows


def format_conversation(messages: list) -> str:
    """Format messages for prompt"""
    lines = []
    for i, m in enumerate(messages, 1):
        role = "HUMAN" if m["role"] == "user" else "AI"
        lines.append(f"[{i}] {role}: {m['content']}")
    return "\n\n".join(lines)


def extract_json(text: str) -> str:
    """Extract JSON from response, handling markdown fences"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def validate_classification(data: dict) -> dict:
    """Validate and fix classification output"""
    if "humanRole" in data and "distribution" in data["humanRole"]:
        data["humanRole"]["distribution"] = normalize_dist(data["humanRole"]["distribution"])
    if "aiRole" in data and "distribution" in data["aiRole"]:
        data["aiRole"]["distribution"] = normalize_dist(data["aiRole"]["distribution"])
    
    dims = ["interactionPattern", "powerDynamics", "emotionalTone", "engagementStyle",
            "knowledgeExchange", "conversationPurpose", "topicDepth", "turnTaking"]
    
    for dim in dims:
        if dim in data:
            d = data[dim]
            if d.get("confidence", 1.0) < 0.6 and not d.get("alternative"):
                print(f"Warning: {dim} has low confidence but no alternative")
    
    return data


# ============================================================================
# CLASSIFIER (OpenAI Version)
# ============================================================================

def classify_messages(client: OpenAI, messages: list, 
                     model: str = "gpt-4") -> dict:
    """Classify a single message sequence using OpenAI"""
    formatted = format_conversation(messages)
    prompt = CLASSIFICATION_PROMPT + formatted
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert conversation analyst. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,  # Lower temperature for more consistent results
        max_tokens=3000
    )
    
    text = response.choices[0].message.content
    json_text = extract_json(text)
    data = json.loads(json_text)
    return validate_classification(data)


def classify_conversation(client: OpenAI, conversation: dict,
                         model: str = "gpt-4",
                         windowed: bool = False,
                         window_size: int = 6,
                         window_stride: int = 2) -> dict:
    """Classify a full conversation, optionally with windows"""
    start_time = time.time()
    
    classification = classify_messages(client, conversation["messages"], model)
    
    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "provider": "openai",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "1.1.0",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "windowed": windowed
        }
    }
    
    if windowed and len(conversation["messages"]) > window_size:
        windows = create_windows(conversation["messages"], window_size, window_stride)
        windowed_results = []
        
        for i, win in enumerate(windows):
            try:
                win_class = classify_messages(client, win["messages"], model)
                windowed_results.append({
                    "windowIndex": i,
                    "startMessage": win["start"],
                    "endMessage": win["end"],
                    "classification": win_class
                })
                time.sleep(0.3)
            except Exception as e:
                print(f"\nError on window {i}: {e}")
        
        result["windowedClassifications"] = windowed_results
        result["classificationMetadata"]["windowSize"] = window_size
        result["classificationMetadata"]["windowStride"] = window_stride
    
    return result


def classify_batch(conversations: list, model: str = "gpt-4",
                  windowed: bool = False, window_size: int = 6, 
                  window_stride: int = 2, delay_ms: int = 600,
                  output_dir: Optional[Path] = None, save_individual: bool = False) -> list:
    """Classify multiple conversations"""
    client = OpenAI()  # Uses OPENAI_API_KEY from environment
    results = []
    total = len(conversations)
    
    # Create output directory if saving individual files
    if save_individual and output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
    
    for i, convo in enumerate(conversations):
        try:
            result = classify_conversation(
                client, convo, model, windowed, window_size, window_stride
            )
            results.append(result)
            
            # Save individual file if requested
            if save_individual and output_dir:
                convo_id = convo.get('id', f'conversation-{i}')
                # Sanitize filename
                safe_id = "".join(c for c in str(convo_id) if c.isalnum() or c in ('-', '_'))
                output_file = output_dir / f"{safe_id}.json"
                with open(output_file, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"\n✅ Saved: {output_file.name}")
            
        except Exception as e:
            print(f"\nError on {convo.get('id', i)}: {e}")
            error_result = {
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "provider": "openai",
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "1.1.0",
                    "processingTimeMs": 0,
                    "windowed": windowed
                }
            }
            results.append(error_result)
            
            # Save error result too if saving individual files
            if save_individual and output_dir:
                convo_id = convo.get('id', f'conversation-{i}')
                safe_id = "".join(c for c in str(convo_id) if c.isalnum() or c in ('-', '_'))
                output_file = output_dir / f"{safe_id}-error.json"
                with open(output_file, 'w') as f:
                    json.dump(error_result, f, indent=2)
        
        pct = int((i + 1) / total * 100)
        print(f"\rProgress: {i + 1}/{total} ({pct}%)", end="", flush=True)
        
        if i < total - 1:
            time.sleep(delay_ms / 1000)
    
    print()
    return results


# ============================================================================
# MAIN (Same structure as original)
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("\nAdditional options:")
        print("  --limit N          Process only first N conversations")
        print("  --individual       Save each conversation to separate file")
        print("  --output-dir DIR    Directory for individual files (default: output/)")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    
    windowed = "--windowed" in sys.argv
    validation_n = 0
    if "--validation" in sys.argv:
        idx = sys.argv.index("--validation")
        validation_n = int(sys.argv[idx + 1])
    
    model = "gpt-4"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]
    
    window_size = 6
    if "--window-size" in sys.argv:
        idx = sys.argv.index("--window-size")
        window_size = int(sys.argv[idx + 1])
    
    window_stride = 2
    if "--window-stride" in sys.argv:
        idx = sys.argv.index("--window-stride")
        window_stride = int(sys.argv[idx + 1])
    
    # Limit number of conversations
    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        limit = int(sys.argv[idx + 1])
    
    # Individual file output
    save_individual = "--individual" in sys.argv
    output_dir = None
    if save_individual:
        if "--output-dir" in sys.argv:
            idx = sys.argv.index("--output-dir")
            output_dir = Path(sys.argv[idx + 1])
        else:
            output_dir = Path("output")
    
    print(f"Loading from {input_path}...")
    with open(input_path) as f:
        data = json.load(f)
    
    # Handle both single conversation (dict) and list of conversations
    if isinstance(data, dict):
        # Single conversation object
        conversations = [data]
    elif isinstance(data, list):
        # List of conversations
        conversations = data
    else:
        raise ValueError(f"Unexpected data type: {type(data)}. Expected dict or list.")
    
    print(f"Found {len(conversations)} conversations")
    
    # Apply limit
    if limit:
        conversations = conversations[:limit]
        print(f"Processing first {limit} conversations")
    
    if windowed:
        print(f"Windowed mode: size={window_size}, stride={window_stride}")
    
    if save_individual:
        print(f"Individual files will be saved to: {output_dir}")
    
    print(f"\nClassifying with {model} (OpenAI)...\n")
    results = classify_batch(
        conversations, model, windowed, window_size, window_stride,
        output_dir=output_dir, save_individual=save_individual
    )
    
    # Still save combined output unless only individual files are wanted
    if not save_individual or "--combined" in sys.argv:
        print(f"\nWriting to {output_path}...")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"✅ Combined results saved to {output_path}")
    
    if save_individual:
        print(f"✅ Individual files saved to {output_dir}/")
    
    print(f"✅ Classification complete! Processed {len(results)} conversations")


if __name__ == "__main__":
    main()

