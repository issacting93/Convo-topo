#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.3 (Ollama Version with Few-Shot Examples)

Local classification using Ollama with few-shot learning for better accuracy.

Features:
- Classifies conversations across 10 dimensions (8 categorical + 2 role distributions)
- Uses few-shot examples for improved accuracy
- Robust error handling with automatic retries
- Validates role distributions sum to 1.0
- Supports streaming progress updates
- Individual file output for large batches

Requirements:
    pip install requests
    ollama serve  # Run Ollama server locally
    ollama pull qwen2.5:7b  # Or llama2, llama3.2, mistral, etc.

Usage:
    # Basic usage with few-shot examples
    python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json

    # Use specific model
    python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json --model qwen2.5

    # Save individual files (recommended for large batches)
    python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json --individual

    # With retry logic (default 2 retries)
    python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json --max-retries 3
"""

import json
import sys
import time
import os
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict

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
                    key = key.replace("export ", "").strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value

load_env_file()

# ============================================================================
# PROMPT TEMPLATE (Same as OpenAI few-shot version)
# ============================================================================

CLASSIFICATION_PROMPT_TEMPLATE = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

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

## CONFIDENCE
- 0.9–1.0: Clear, unambiguous
- 0.7–0.9: Strong fit, minor ambiguity
- 0.5–0.7: Moderate fit, could be another category
- 0.3–0.5: Weak fit, short conversation
- <0.3: Highly uncertain

**Short conversations (1–2 turns):** Set confidence <= 0.5

---

## FEW-SHOT EXAMPLES

{few_shot_examples}

---

## DIMENSIONS (1-8) - Choose ONE category per dimension

**1. INTERACTION PATTERN:** question-answer, storytelling, advisory, debate, collaborative, casual-chat, philosophical-dialogue, artistic-expression

**2. POWER DYNAMICS:** human-led, ai-led, balanced, alternating

**3. EMOTIONAL TONE:** supportive, playful, serious, empathetic, professional, neutral

**4. ENGAGEMENT STYLE:** questioning, challenging, exploring, affirming, reactive, directive-iterative

**5. KNOWLEDGE EXCHANGE:** personal-sharing, skill-sharing, opinion-exchange, factual-info, experience-sharing, meaning-making

**6. CONVERSATION PURPOSE:** information-seeking, problem-solving, entertainment, relationship-building, self-expression, emotional-processing, collaborative-refinement, capability-exploration

**7. TOPIC DEPTH:** surface, moderate, deep

**8. TURN TAKING:** user-dominant, assistant-dominant, balanced

---

## ROLES (9-10) - Probability distributions (must sum to 1.0)

**9. HUMAN ROLE:** seeker, learner, director, collaborator, sharer, challenger, teacher-evaluator, philosophical-explorer, artist, tester

**10. AI ROLE:** expert, advisor, facilitator, reflector, peer, affiliative, learner, creative-partner, unable-to-engage

**Key distinctions:**
- seeker vs learner: learner tests/applies; seeker only requests
- director vs collaborator: director commands; collaborator proposes alternatives
- expert vs advisor: expert explains; advisor prescribes actions
- facilitator vs reflector: facilitator guides; reflector mirrors

---

## OUTPUT FORMAT
**CRITICAL: You MUST return ONLY valid JSON. No markdown, no code fences, no explanations before or after.**

**JSON Requirements:**
1. Start with {{ and end with }}
2. All role distributions must sum to exactly 1.0
3. All confidence values must be between 0.0 and 1.0
4. Use null (not "null" as string) for alternative when confidence >= 0.6
5. Include ALL required fields below

**Complete JSON Template:**
{{
  "abstain": false,
  "interactionPattern": {{"category": "question-answer", "confidence": 0.8, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "powerDynamics": {{"category": "human-led", "confidence": 0.7, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "emotionalTone": {{"category": "neutral", "confidence": 0.6, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "engagementStyle": {{"category": "questioning", "confidence": 0.8, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "knowledgeExchange": {{"category": "factual-info", "confidence": 0.7, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "conversationPurpose": {{"category": "information-seeking", "confidence": 0.8, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "topicDepth": {{"category": "moderate", "confidence": 0.6, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "turnTaking": {{"category": "balanced", "confidence": 0.7, "evidence": ["exact quote"], "rationale": "brief explanation", "alternative": null}},
  "humanRole": {{
    "distribution": {{"seeker": 0.7, "learner": 0.2, "director": 0.1, "collaborator": 0.0, "sharer": 0.0, "challenger": 0.0, "teacher-evaluator": 0.0, "philosophical-explorer": 0.0, "artist": 0.0, "tester": 0.0}},
    "confidence": 0.8,
    "evidence": [{{"role": "seeker", "quote": "exact quote"}}],
    "rationale": "brief explanation",
    "alternative": null
  }},
  "aiRole": {{
    "distribution": {{"expert": 0.8, "advisor": 0.2, "facilitator": 0.0, "reflector": 0.0, "peer": 0.0, "affiliative": 0.0, "learner": 0.0, "creative-partner": 0.0, "unable-to-engage": 0.0}},
    "confidence": 0.8,
    "evidence": [{{"role": "expert", "quote": "exact quote"}}],
    "rationale": "brief explanation",
    "alternative": null
  }}
}}

**IMPORTANT:**
- Return ONLY the JSON object above
- Do NOT include markdown code fences (```json or ```)
- Do NOT include any text before or after the JSON
- Ensure all distributions sum to 1.0
- Use exact quotes from the conversation for evidence

---

## CONVERSATION TO ANALYZE

"""


# ============================================================================
# FEW-SHOT EXAMPLE FORMATTING
# ============================================================================

def format_few_shot_example(example: Dict) -> str:
    """
    Format a single few-shot example for inclusion in the prompt

    Args:
        example: Example dict with 'transcript', 'classification', and 'rationale'

    Returns:
        Formatted example string showing conversation and classification

    Example structure:
        {
            "transcript": "HUMAN: ... AI: ...",
            "classification": {
                "dimensions1to8": {...},
                "humanRole": {"distribution": {...}, "evidence": [...]},
                "aiRole": {"distribution": {...}, "evidence": [...]}
            },
            "rationale": "Explanation of classification choices"
        }
    """
    transcript = example.get('transcript', '')
    classification = example.get('classification', {})

    # Format dimensions 1-8 (categorical classifications)
    dims = classification.get('dimensions1to8', {})
    dims_text = []
    for dim_name, dim_data in dims.items():
        category = dim_data.get('category', 'unknown')
        confidence = dim_data.get('confidence', 0)
        evidence = dim_data.get('evidence', [])[:1]  # Top evidence quote
        dims_text.append(f"  {dim_name}: {category} (confidence: {confidence:.2f}, evidence: {evidence[0] if evidence else 'N/A'})")

    # Format role distributions (dimensions 9-10)
    human_role = classification.get('humanRole', {})
    ai_role = classification.get('aiRole', {})

    human_dist = human_role.get('distribution', {})
    ai_dist = ai_role.get('distribution', {})

    human_evidence = human_role.get('evidence', [])[:2]  # Top 2 evidence quotes
    ai_evidence = ai_role.get('evidence', [])[:2]

    return f"""Example Conversation:
{transcript}

Classification:
Dimensions 1-8:
{chr(10).join(dims_text)}

Human Role Distribution: {json.dumps(human_dist, indent=2)}
AI Role Distribution: {json.dumps(ai_dist, indent=2)}

Evidence:
- Human: {human_evidence}
- AI: {ai_evidence}

Rationale: {example.get('rationale', 'N/A')}
"""


def load_few_shot_examples(file_path: Path) -> str:
    """
    Load and format few-shot examples from JSON file

    Args:
        file_path: Path to JSON file containing examples

    Returns:
        Formatted string with all examples ready for prompt insertion

    Expected JSON structure:
        {
            "examples": [
                {
                    "transcript": "...",
                    "classification": {...},
                    "rationale": "..."
                },
                ...
            ]
        }

    Or pre-formatted:
        {
            "promptFormat": "### Example 1\n..."
        }
    """
    with open(file_path) as f:
        data = json.load(f)

    examples = data.get('examples', [])
    if not examples:
        # Try loading prompt format directly (pre-formatted examples)
        if 'promptFormat' in data:
            return data['promptFormat']
        return ""

    # Format each example with header
    formatted = []
    for i, example in enumerate(examples, 1):
        formatted.append(f"### Example {i}\n{format_few_shot_example(example)}")

    return "\n---\n\n".join(formatted)


# ============================================================================
# UTILITIES
# ============================================================================

def normalize_dist(dist: dict, epsilon: float = 1e-6) -> dict:
    """
    Normalize distribution to sum to 1.0

    Args:
        dist: Dictionary of role probabilities
        epsilon: Minimum threshold for total sum

    Returns:
        Normalized distribution with values summing to 1.0
    """
    if not dist:
        return dist

    total = sum(dist.values())
    if total <= epsilon:
        # If all zeros or negative, return uniform distribution
        n = len(dist)
        return {k: round(1.0 / n, 3) for k in dist.keys()}

    # Normalize and round to 3 decimal places
    normalized = {k: round(v / total, 3) for k, v in dist.items()}

    # Fix rounding errors by adjusting largest value
    diff = 1.0 - sum(normalized.values())
    if abs(diff) > epsilon:
        max_key = max(normalized, key=normalized.get)
        normalized[max_key] = round(normalized[max_key] + diff, 3)

    return normalized


def format_conversation(messages: list) -> str:
    """
    Format messages for prompt

    Args:
        messages: List of message dicts with 'role' and 'content'

    Returns:
        Formatted conversation string
    """
    lines = []
    for i, m in enumerate(messages, 1):
        role = "HUMAN" if m.get("role") == "user" else "AI"
        content = m.get("content", "").strip()
        lines.append(f"[{i}] {role}: {content}")
    return "\n\n".join(lines)


def extract_json(text: str) -> str:
    """
    Extract JSON from response, handling markdown fences and extra text

    Args:
        text: Raw text response from model

    Returns:
        Cleaned JSON string
    """
    text = text.strip()

    # Remove markdown code fences
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

    # Try to extract JSON object from text
    # Look for first { and last }
    start = text.find("{")
    end = text.rfind("}")

    if start >= 0 and end > start:
        text = text[start:end+1]

    return text


def validate_classification(data: dict, strict: bool = False) -> dict:
    """
    Validate and fix classification output

    Args:
        data: Classification result dictionary
        strict: If True, raise errors for invalid data; if False, fix automatically

    Returns:
        Validated and corrected classification data

    Raises:
        ValueError: If strict=True and validation fails
    """
    # Validate role distributions
    for role_key in ["humanRole", "aiRole"]:
        if role_key in data and "distribution" in data[role_key]:
            dist = data[role_key]["distribution"]

            # Check all values are numbers
            for k, v in dist.items():
                if not isinstance(v, (int, float)):
                    if strict:
                        raise ValueError(f"{role_key} distribution contains non-numeric value: {k}={v}")
                    dist[k] = 0.0

            # Normalize distribution
            data[role_key]["distribution"] = normalize_dist(dist)

            # Verify sum is close to 1.0
            total = sum(data[role_key]["distribution"].values())
            if abs(total - 1.0) > 0.01:
                if strict:
                    raise ValueError(f"{role_key} distribution sums to {total}, not 1.0")
                # Re-normalize to fix
                data[role_key]["distribution"] = normalize_dist(data[role_key]["distribution"])

    # Ensure required fields exist
    if "abstain" not in data:
        data["abstain"] = False

    return data


# ============================================================================
# POST-PROCESSING CORRECTIONS (Simplified - import from v1.2 if needed)
# ============================================================================

def apply_corrections(conversation: dict, classification: dict) -> dict:
    """Apply post-processing corrections (simplified version)"""
    # For now, just return classification as-is
    # Full corrections can be imported from classifier-openai-v1.2.py if needed
    return classification

# ============================================================================
# OLLAMA API
# ============================================================================

# Ollama server URL (configurable via environment variable)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

def check_ollama_connection() -> bool:
    """
    Check if Ollama server is running and accessible

    Returns:
        True if Ollama server is reachable, False otherwise
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_available_models() -> list:
    """
    Get list of available Ollama models

    Returns:
        List of model names (e.g., ['llama3.2', 'qwen2.5', ...])
        Empty list if unable to retrieve models
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model['name'] for model in data.get('models', [])]
    except:
        pass
    return []

def classify_messages_ollama(messages: list, few_shot_examples: str = "",
                            model: str = "qwen2.5:7b", max_retries: int = 2) -> dict:
    """
    Classify a single message sequence using Ollama with few-shot examples

    Args:
        messages: List of conversation messages
        few_shot_examples: Pre-formatted few-shot examples string
        model: Ollama model name
        max_retries: Maximum number of retry attempts on failure

    Returns:
        Classification dictionary with validated distributions

    Raises:
        Exception: If all retry attempts fail
    """
    formatted = format_conversation(messages)

    # Build prompt with few-shot examples
    if few_shot_examples:
        prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples=few_shot_examples) + formatted
    else:
        prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples="(No examples provided)") + formatted

    # Ollama API endpoint
    url = f"{OLLAMA_BASE_URL}/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 4000,  # Increased for complete JSON responses
        }
    }

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()

            data = response.json()
            text = data.get("response", "")

            if not text:
                raise ValueError("Empty response from Ollama")

            json_text = extract_json(text)
            result = json.loads(json_text)

            # Validate and fix classification
            validated = validate_classification(result, strict=False)

            # Success!
            return validated

        except requests.exceptions.Timeout as e:
            last_error = f"Request timeout (attempt {attempt+1}/{max_retries+1})"
            if attempt < max_retries:
                print(f"\n⚠️  {last_error}, retrying...")
                time.sleep(2 ** attempt)  # Exponential backoff
                continue

        except requests.exceptions.RequestException as e:
            last_error = f"API error: {e}"
            if attempt < max_retries:
                print(f"\n⚠️  {last_error}, retrying...")
                time.sleep(2 ** attempt)
                continue

        except json.JSONDecodeError as e:
            last_error = f"JSON parse error: {e}"
            if attempt < max_retries:
                print(f"\n⚠️  {last_error}, retrying...")
                # Try with higher temperature for next attempt
                payload["options"]["temperature"] = min(0.5, payload["options"]["temperature"] + 0.1)
                time.sleep(1)
                continue
            else:
                # On final attempt, print debug info
                print(f"\n❌ Failed to parse JSON after {max_retries+1} attempts")
                print(f"Error: {e}")
                if 'text' in locals() and text:
                    print(f"Response length: {len(text)} characters")
                    print(f"Response preview (first 1000 chars):\n{text[:1000]}")
                    print(f"\nResponse preview (last 500 chars):\n{text[-500:]}")
                else:
                    print("No response text available")

        except Exception as e:
            last_error = f"Unexpected error: {e}"
            if attempt < max_retries:
                print(f"\n⚠️  {last_error}, retrying...")
                time.sleep(2 ** attempt)
                continue

    # All retries failed
    raise Exception(f"Classification failed after {max_retries+1} attempts. Last error: {last_error}")

def classify_conversation_ollama(conversation: dict, few_shot_examples: str = "",
                                 model: str = "qwen2.5:7b",
                                 apply_corrections_flag: bool = True,
                                 max_retries: int = 2) -> dict:
    """
    Classify a conversation using Ollama with few-shot examples

    Args:
        conversation: Conversation dict with 'messages' list
        few_shot_examples: Pre-formatted few-shot examples string
        model: Ollama model name
        apply_corrections_flag: Whether to apply post-processing corrections
        max_retries: Maximum retry attempts on failure

    Returns:
        Conversation dict with added 'classification' and 'classificationMetadata' fields
    """
    start_time = time.time()
    messages = conversation.get("messages", [])

    if not messages:
        raise ValueError("Conversation has no messages")

    classification = classify_messages_ollama(messages, few_shot_examples, model, max_retries)

    # Apply post-processing corrections
    if apply_corrections_flag:
        classification = apply_corrections(conversation, classification)

    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "provider": "ollama",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "1.3-fewshot",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "correctionsApplied": apply_corrections_flag,
            "fewShotExamples": "yes" if few_shot_examples else "no",
            "maxRetries": max_retries
        }
    }

    return result

def classify_batch_ollama(conversations: list, few_shot_examples: str = "",
                          model: str = "qwen2.5:7b",
                          apply_corrections_flag: bool = True,
                          delay_ms: int = 200,
                          output_dir: Optional[Path] = None,
                          save_individual: bool = False,
                          max_retries: int = 2) -> list:
    """
    Classify a batch of conversations using Ollama with few-shot examples

    Args:
        conversations: List of conversation dicts
        few_shot_examples: Pre-formatted few-shot examples string
        model: Ollama model name
        apply_corrections_flag: Whether to apply post-processing corrections
        delay_ms: Delay between requests in milliseconds (rate limiting)
        output_dir: Directory for individual output files
        save_individual: Whether to save each conversation to separate file
        max_retries: Maximum retry attempts per conversation

    Returns:
        List of classified conversations (with errors marked)
    """

    # Check Ollama connection
    if not check_ollama_connection():
        print("❌ Error: Ollama server not reachable")
        print(f"   Make sure Ollama is running: ollama serve")
        print(f"   Or set OLLAMA_BASE_URL environment variable")
        sys.exit(1)

    # Check if model is available
    available = get_available_models()
    if available:
        model_found = any(model in m for m in available)
        if not model_found:
            print(f"⚠️  Warning: Model '{model}' not found in Ollama")
            print(f"   Available models: {', '.join(available)}")
            print(f"   Install with: ollama pull {model}")
    else:
        print("⚠️  Warning: Could not check available models")
        print("   Install a model with: ollama pull llama3.2")

    print(f"✅ Using Ollama model: {model}")
    if few_shot_examples:
        print(f"✅ Few-shot examples loaded ({len(few_shot_examples)} characters)")
    print(f"✅ Max retries per conversation: {max_retries}")

    results = []
    total = len(conversations)
    success_count = 0
    error_count = 0

    if save_individual and output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)

    start_time = time.time()

    for i, convo in enumerate(conversations):
        try:
            classified = classify_conversation_ollama(
                convo, few_shot_examples, model, apply_corrections_flag, max_retries
            )
            results.append(classified)
            success_count += 1

            if save_individual and output_dir:
                convo_id = convo.get('id', f'conversation-{i}')
                safe_id = "".join(c for c in str(convo_id) if c.isalnum() or c in ('-', '_'))
                output_file = output_dir / f"{safe_id}.json"
                with open(output_file, 'w') as f:
                    json.dump(classified, f, indent=2)

        except Exception as e:
            error_count += 1
            print(f"\n❌ Error on conversation {convo.get('id', i)}: {e}")

            error_result = {
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "provider": "ollama",
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "1.3-fewshot",
                    "processingTimeMs": 0,
                    "correctionsApplied": apply_corrections_flag,
                    "fewShotExamples": "yes" if few_shot_examples else "no",
                    "maxRetries": max_retries
                }
            }
            results.append(error_result)

            if save_individual and output_dir:
                convo_id = convo.get('id', f'conversation-{i}')
                safe_id = "".join(c for c in str(convo_id) if c.isalnum() or c in ('-', '_'))
                output_file = output_dir / f"{safe_id}-error.json"
                with open(output_file, 'w') as f:
                    json.dump(error_result, f, indent=2)

        # Progress indicator
        pct = int((i + 1) / total * 100)
        elapsed = time.time() - start_time
        rate = (i + 1) / elapsed if elapsed > 0 else 0
        eta = (total - i - 1) / rate if rate > 0 else 0
        print(f"\rProgress: {i + 1}/{total} ({pct}%) | Success: {success_count} | Errors: {error_count} | ETA: {int(eta)}s", end="", flush=True)

        # Rate limiting (Ollama can handle more requests, but be nice)
        if i < total - 1:
            time.sleep(delay_ms / 1000)

    elapsed_total = time.time() - start_time
    print(f"\n\n✅ Batch complete!")
    print(f"   Total: {total} | Success: {success_count} | Errors: {error_count}")
    print(f"   Time: {int(elapsed_total)}s ({elapsed_total/total:.1f}s per conversation)")

    return results


# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("\nOptions:")
        print("  --few-shot-examples FILE    JSON file with few-shot examples (required)")
        print("  --model MODEL               Ollama model name (default: qwen2.5:7b)")
        print("  --limit N                   Process only first N conversations")
        print("  --individual                Save each conversation to separate file")
        print("  --output-dir DIR            Directory for individual files (default: output/)")
        print("  --no-corrections            Disable post-processing corrections")
        print("  --max-retries N             Maximum retry attempts per conversation (default: 2)")
        print("  --delay-ms N                Delay between requests in ms (default: 200)")
        print("\nExamples:")
        print("  python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json")
        print("  python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json --model qwen2.5")
        print("  python classifier-ollama-fewshot.py conversations.json output.json --few-shot-examples few-shot-examples.json --max-retries 3")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    # Load few-shot examples
    few_shot_file = None
    if "--few-shot-examples" in sys.argv:
        idx = sys.argv.index("--few-shot-examples")
        few_shot_file = Path(sys.argv[idx + 1])
    else:
        print("Error: --few-shot-examples FILE is required")
        print("Generate examples first: python scripts/generate-few-shot-examples.py ...")
        sys.exit(1)

    if not few_shot_file.exists():
        print(f"Error: Few-shot examples file not found: {few_shot_file}")
        sys.exit(1)

    print(f"Loading few-shot examples from {few_shot_file}...")
    few_shot_examples = load_few_shot_examples(few_shot_file)
    print(f"Loaded few-shot examples ({len(few_shot_examples)} characters)")

    model = "qwen2.5:7b"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]

    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        limit = int(sys.argv[idx + 1])

    max_retries = 2
    if "--max-retries" in sys.argv:
        idx = sys.argv.index("--max-retries")
        max_retries = int(sys.argv[idx + 1])

    delay_ms = 200
    if "--delay-ms" in sys.argv:
        idx = sys.argv.index("--delay-ms")
        delay_ms = int(sys.argv[idx + 1])

    save_individual = "--individual" in sys.argv
    output_dir = None
    if save_individual:
        if "--output-dir" in sys.argv:
            idx = sys.argv.index("--output-dir")
            output_dir = Path(sys.argv[idx + 1])
        else:
            output_dir = Path("output")

    apply_corrections_flag = "--no-corrections" not in sys.argv

    print(f"Loading from {input_path}...")
    with open(input_path) as f:
        data = json.load(f)

    if isinstance(data, dict):
        conversations = [data]
    elif isinstance(data, list):
        conversations = data
    else:
        raise ValueError(f"Unexpected data type: {type(data)}")

    print(f"Found {len(conversations)} conversations")

    if limit:
        conversations = conversations[:limit]
        print(f"Processing first {limit} conversations")

    if save_individual:
        print(f"Individual files will be saved to: {output_dir}")

    corrections_msg = "WITH corrections" if apply_corrections_flag else "WITHOUT corrections"
    print(f"\nClassifying with {model} (Ollama) FEW-SHOT {corrections_msg}...\n")

    results = classify_batch_ollama(
        conversations, few_shot_examples, model, apply_corrections_flag,
        delay_ms=delay_ms,
        output_dir=output_dir,
        save_individual=save_individual,
        max_retries=max_retries
    )

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

