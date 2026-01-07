#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.1 (Ollama Version)

Adapted from classifier-openai.py to use Ollama's local API instead of OpenAI.

Requirements:
    pip install requests
    ollama serve  # Run Ollama server locally

Usage:
    python classifier-ollama.py conversations.json output.json
    python classifier-ollama.py conversations.json output.json --model llama2
    python classifier-ollama.py conversations.json output.json --model llama3.2 --individual
"""

import json
import sys
import time
import os
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional

# ============================================================================
# PROMPT (Same as OpenAI version)
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

---

## OUTPUT FORMAT
IMPORTANT: You MUST return ONLY valid JSON, nothing else. No explanations, no markdown, no text before or after. Start with { and end with }. Role distributions must sum to 1.0.

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
# UTILITY FUNCTIONS
# ============================================================================

def format_conversation(messages):
    """Format messages for prompt"""
    lines = []
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        lines.append(f"{role.upper()}: {content}")
    return "\n".join(lines)

def extract_json(text):
    """Extract JSON from response, handling markdown fences"""
    text = text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Skip first line (```json or ```) and last line (```)
        if len(lines) > 2:
            text = "\n".join(lines[1:-1])
        elif len(lines) == 2:
            text = lines[1]
    # Try to find JSON object
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        return text[start:end]
    return text

def validate_classification(data: dict) -> dict:
    """Validate and normalize classification data"""
    # Ensure all required fields exist
    required = ["interactionPattern", "powerDynamics", "emotionalTone", 
               "engagementStyle", "knowledgeExchange", "conversationPurpose",
               "turnTaking", "humanRole", "aiRole"]
    
    for key in required:
        if key not in data:
            if key in ["humanRole", "aiRole"]:
                data[key] = {
                    "distribution": {},
                    "confidence": 0.5,
                    "evidence": [],
                    "rationale": "Missing",
                    "alternative": None
                }
            else:
                data[key] = {"category": "unknown", "confidence": 0.5, "evidence": [], "rationale": "Missing", "alternative": None}
    
    # Normalize role distributions to sum to 1.0
    for role_key in ["humanRole", "aiRole"]:
        if "distribution" in data.get(role_key, {}):
            dist = data[role_key]["distribution"]
            total = sum(dist.values())
            if total > 0:
                data[role_key]["distribution"] = {
                    k: v / total for k, v in dist.items()
                }
            else:
                # Set uniform distribution if all zeros
                keys = list(dist.keys())
                uniform = 1.0 / len(keys) if keys else 1.0
                data[role_key]["distribution"] = {k: uniform for k in keys}
    
    return data

# ============================================================================
# CLASSIFIER (Ollama Version)
# ============================================================================

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

def check_ollama_connection():
    """Check if Ollama server is running"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_available_models():
    """Get list of available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
    except:
        pass
    return []

def classify_messages_ollama(messages: list, model: str = "llama2") -> dict:
    """Classify a single message sequence using Ollama"""
    formatted = format_conversation(messages)
    prompt = CLASSIFICATION_PROMPT + formatted
    
    # Ollama API endpoint
    url = f"{OLLAMA_BASE_URL}/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # Lower temperature for more consistent results
            "top_p": 0.9,
            "num_predict": 3000  # Max tokens
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        text = result.get("response", "")
        
        json_text = extract_json(text)
        data = json.loads(json_text)
        return validate_classification(data)
    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama API: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print(f"Response text: {text[:500]}")
        raise

def classify_conversation_ollama(conversation: dict, model: str = "llama2",
                                 windowed: bool = False,
                                 window_size: int = 6,
                                 window_stride: int = 2) -> dict:
    """Classify a conversation using Ollama"""
    messages = conversation.get("messages", [])
    
    if not messages:
        return {
            "abstain": True,
            "interactionPattern": {"category": "casual-chat", "confidence": 0.3},
            # ... other defaults
        }
    
    classification = classify_messages_ollama(messages, model)
    
    # Add metadata
    classification["classificationMetadata"] = {
        "model": model,
        "provider": "ollama",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "promptVersion": "v1.1",
        "processingTimeMs": 0  # Will be updated by caller
    }
    
    # Windowed classification (optional)
    if windowed and len(messages) > window_size:
        windows = []
        for i in range(0, len(messages) - window_size + 1, window_stride):
            win = messages[i:i + window_size]
            win_class = classify_messages_ollama(win, model)
            windows.append(win_class)
        classification["windows"] = windows
    
    return classification

def classify_batch_ollama(conversations: list, model: str = "llama2",
                          windowed: bool = False,
                          window_size: int = 6,
                          window_stride: int = 2,
                          output_dir: Optional[str] = None) -> list:
    """Classify a batch of conversations using Ollama"""
    
    # Check Ollama connection
    if not check_ollama_connection():
        print("❌ Error: Ollama server not reachable")
        print(f"   Make sure Ollama is running: ollama serve")
        print(f"   Or set OLLAMA_BASE_URL environment variable")
        sys.exit(1)
    
    # Check if model is available
    available_models = get_available_models()
    if model not in available_models:
        print(f"⚠️  Warning: Model '{model}' not found in Ollama")
        print(f"   Available models: {', '.join(available_models)}")
        print(f"   Install with: ollama pull {model}")
        if available_models:
            print(f"   Using first available model: {available_models[0]}")
            model = available_models[0]
        else:
            print("   No models available. Install one with: ollama pull llama2")
            sys.exit(1)
    
    print(f"✅ Using Ollama model: {model}")
    print(f"📋 Classifying {len(conversations)} conversations...\n")
    
    results = []
    start_time = time.time()
    
    for i, conversation in enumerate(conversations, 1):
        conv_id = conversation.get("id", f"conv-{i}")
        print(f"[{i}/{len(conversations)}] Processing {conv_id}...", end=" ", flush=True)
        
        conv_start = time.time()
        
        try:
            classified = classify_conversation_ollama(
                conversation, model, windowed, window_size, window_stride
            )
            
            # Update processing time
            processing_time = int((time.time() - conv_start) * 1000)
            if "classificationMetadata" in classified:
                classified["classificationMetadata"]["processingTimeMs"] = processing_time
            
            # Add classification to conversation
            conversation["classification"] = classified
            
            results.append(conversation)
            
            # Save individual file if output_dir specified
            if output_dir:
                output_path = Path(output_dir)
                output_path.mkdir(parents=True, exist_ok=True)
                filename = f"{conv_id}.json"
                filepath = output_path / filename
                with open(filepath, "w") as f:
                    json.dump(conversation, f, indent=2)
                print(f"✅ Saved to {filepath}")
            else:
                print(f"✅ ({processing_time}ms)")
            
            # Rate limiting (Ollama can handle more requests, but be nice)
            time.sleep(0.1)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            continue
    
    total_time = time.time() - start_time
    print(f"\n✅ Completed {len(results)}/{len(conversations)} conversations in {total_time:.1f}s")
    
    return results

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python classifier-ollama.py input.json output.json [options]")
        print("\nOptions:")
        print("  --model MODEL       Ollama model name (default: llama2)")
        print("  --windowed          Enable windowed classification")
        print("  --window-size N     Window size (default: 6)")
        print("  --window-stride N   Window stride (default: 2)")
        print("  --individual        Save each conversation as separate file")
        print("  --output-dir DIR    Output directory for --individual")
        print("\nExamples:")
        print("  python classifier-ollama.py conversations.json output.json")
        print("  python classifier-ollama.py conversations.json output.json --model llama3.2")
        print("  python classifier-ollama.py conversations.json output.json --model llama3.2 --individual --output-dir output/")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Parse options
    model = "llama2"
    windowed = "--windowed" in sys.argv
    window_size = 6
    window_stride = 2
    individual = "--individual" in sys.argv
    output_dir = None
    
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]
    
    if "--window-size" in sys.argv:
        idx = sys.argv.index("--window-size")
        window_size = int(sys.argv[idx + 1])
    
    if "--window-stride" in sys.argv:
        idx = sys.argv.index("--window-stride")
        window_stride = int(sys.argv[idx + 1])
    
    if "--output-dir" in sys.argv:
        idx = sys.argv.index("--output-dir")
        output_dir = sys.argv[idx + 1]
    elif individual:
        output_dir = "output"
    
    # Load conversations
    with open(input_file, "r") as f:
        if input_file.endswith(".json"):
            data = json.load(f)
            if isinstance(data, list):
                conversations = data
            else:
                conversations = [data]
        else:
            print("Error: Input file must be JSON")
            sys.exit(1)
    
    print(f"\nClassifying with {model} (Ollama)...\n")
    
    # Classify
    results = classify_batch_ollama(
        conversations, model, windowed, window_size, window_stride, output_dir
    )
    
    # Save output (if not using --individual)
    if not individual:
        with open(output_file, "w") as f:
            if len(results) == 1:
                json.dump(results[0], f, indent=2)
            else:
                json.dump(results, f, indent=2)
        print(f"\n✅ Saved {len(results)} conversations to {output_file}")

