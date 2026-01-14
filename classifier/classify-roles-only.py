#!/usr/bin/env python3
"""
Role-Only Classifier (OpenAI Version)

Classifies ONLY human and AI roles (dimensions 9-10), skipping all other dimensions.
Useful for reclassifying roles without re-running full classification.

Usage:
    python classify-roles-only.py conversations.json output.json
    python classify-roles-only.py conversations.json output.json --individual --output-dir public/output
    python classify-roles-only.py conversations.json output.json --preserve-existing
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

# ============================================================================
# ROLE-ONLY PROMPT
# ============================================================================

ROLE_CLASSIFICATION_PROMPT = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

## TASK
Classify ONLY the human and AI roles (dimensions 9-10). Output a PROBABILITY DISTRIBUTION over roles (values must sum to 1.0).

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- Evidence quotes must be EXACT excerpts from the conversation.
- Mixed roles are expected—distribute probability across multiple roles.

## CONFIDENCE CALIBRATION
- 0.9–1.0: Unambiguous, clear signals, no reasonable alternative
- 0.7–0.9: Strong fit, minor ambiguity or mixed signals
- 0.5–0.7: Moderate fit, could reasonably be another category
- 0.3–0.5: Weak fit, defaulting due to lack of better option / short conversation
- <0.3: Highly uncertain, conversation may be too short or ambiguous

## EDGE CASES
- If conversation is 1–2 turns: set confidence <= 0.5
- If you cannot justify with quotes: set confidence <= 0.5

---

## HUMAN ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| seeker | Requests information/clarification; primarily questions |
| learner | Tests understanding, applies, verifies ("so if…, then…", "does that mean…?") |
| director | Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text") |
| collaborator | Proposes alternatives/tradeoffs; co-builds iteratively |
| sharer | Personal narrative/context mainly for expression/relational framing |
| challenger | Critiques/stress-tests claims; explicit pushback |
| teacher-evaluator | Provides feedback to improve AI's responses |
| philosophical-explorer | Explores meaning, worldview, existence questions |
| artist | Shares creative work (poetry, lyrics, art) |
| tester | Tests AI capabilities, probes boundaries |

**Tie-breakers:**
- seeker vs learner: learner shows checking/applying; seeker is request-only
- director vs seeker: director specifies deliverable/format constraints
- director vs collaborator: collaborator contributes options/tradeoffs; director mainly commands
- sharer vs collaborator: sharer is personal/relational; collaborator is task input
- challenger overrides if dominant move is pushback
- teacher-evaluator: Provides critique with expectation of improvement
- philosophical-explorer: Deep meaning-making, not just sharing opinions
- artist: Primary content is creative expression
- tester: Explicitly testing AI limits or capabilities

## AI ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition |
|------|------------|
| expert | Explains/teaches/frames concepts; definitions; examples |
| advisor | Prescribes steps/recommendations ("do X then Y") |
| facilitator | Guides via questions/scaffolding/options rather than prescribing |
| reflector | Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…") |
| peer | Brainstorms alongside with low-authority tone ("we could…") |
| affiliative | Warmth/encouragement/rapport not required for task completion |
| learner | Acknowledges mistakes, adapts based on feedback |
| creative-partner | Co-creates artistic or playful content |
| unable-to-engage | Cannot understand or respond appropriately (confusion, repeated "I don't understand") |

**Tie-breakers:**
- expert vs advisor: expert explains concepts; advisor prescribes actions
- facilitator vs reflector: facilitator offers structure/options; reflector mirrors/validates
- peer vs facilitator: peer is speculative/equal; facilitator guides with intent
- affiliative is additive—can co-occur with others but only dominant if warmth > task content
- learner: AI explicitly acknowledges mistakes and improves
- creative-partner: Engages in playful or creative iteration
- unable-to-engage: Repeated confusion or inability to process input

---

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown fences). Role distributions must sum to 1.0.

{
  "humanRole": {
    "distribution": {"seeker": 0, "learner": 0, "director": 0, "collaborator": 0, "sharer": 0, "challenger": 0, "teacher-evaluator": 0, "philosophical-explorer": 0, "artist": 0, "tester": 0},
    "confidence": 0.0,
    "evidence": [{"role": "seeker", "quote": "..."}],
    "rationale": "...",
    "alternative": null
  },
  "aiRole": {
    "distribution": {"expert": 0, "advisor": 0, "facilitator": 0, "reflector": 0, "peer": 0, "affiliative": 0, "learner": 0, "creative-partner": 0, "unable-to-engage": 0},
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
# UTILITIES
# ============================================================================

def normalize_dist(dist: dict) -> dict:
    """Normalize distribution to sum to 1.0"""
    total = sum(dist.values())
    if total <= 0:
        return dist
    return {k: round(v / total, 3) for k, v in dist.items()}


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


def validate_role_classification(data: dict) -> dict:
    """Validate and fix role classification output"""
    if "humanRole" in data and "distribution" in data["humanRole"]:
        data["humanRole"]["distribution"] = normalize_dist(data["humanRole"]["distribution"])
    if "aiRole" in data and "distribution" in data["aiRole"]:
        data["aiRole"]["distribution"] = normalize_dist(data["aiRole"]["distribution"])
    return data


# ============================================================================
# CLASSIFIER
# ============================================================================

def format_existing_classification(classification: dict) -> str:
    """Format existing dimensions 1-8 as context for role classification"""
    if not classification:
        return ""
    
    context_parts = []
    
    if classification.get('interactionPattern', {}).get('category'):
        context_parts.append(f"Interaction Pattern: {classification['interactionPattern']['category']}")
    if classification.get('powerDynamics', {}).get('category'):
        context_parts.append(f"Power Dynamics: {classification['powerDynamics']['category']}")
    if classification.get('emotionalTone', {}).get('category'):
        context_parts.append(f"Emotional Tone: {classification['emotionalTone']['category']}")
    if classification.get('engagementStyle', {}).get('category'):
        context_parts.append(f"Engagement Style: {classification['engagementStyle']['category']}")
    if classification.get('knowledgeExchange', {}).get('category'):
        context_parts.append(f"Knowledge Exchange: {classification['knowledgeExchange']['category']}")
    if classification.get('conversationPurpose', {}).get('category'):
        context_parts.append(f"Conversation Purpose: {classification['conversationPurpose']['category']}")
    if classification.get('topicDepth', {}).get('category'):
        context_parts.append(f"Topic Depth: {classification['topicDepth']['category']}")
    if classification.get('turnTaking', {}).get('category'):
        context_parts.append(f"Turn Taking: {classification['turnTaking']['category']}")
    
    if context_parts:
        return "\n\n## EXISTING CLASSIFICATION CONTEXT\n" + "\n".join(context_parts) + "\n\nUse these dimensions to inform your role classifications. For example:\n- question-answer pattern suggests seeker→expert roles\n- challenging engagement style suggests challenger role\n- entertainment purpose suggests artist/creative-partner roles\n\n"
    
    return ""


def classify_roles_only(client: OpenAI, messages: list, existing_classification: dict = None, model: str = "gpt-4o-mini") -> dict:
    """Classify only human and AI roles using OpenAI, optionally with existing classification context"""
    formatted = format_conversation(messages)
    context = format_existing_classification(existing_classification) if existing_classification else ""
    prompt = ROLE_CLASSIFICATION_PROMPT + context + formatted

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert conversation analyst. Return only valid JSON with humanRole and aiRole."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2000
    )

    text = response.choices[0].message.content
    json_text = extract_json(text)
    data = json.loads(json_text)
    return validate_role_classification(data)


def classify_conversation_roles(client: OpenAI, conversation: dict,
                                model: str = "gpt-4o-mini",
                                preserve_existing: bool = False,
                                use_existing_context: bool = True) -> dict:
    """Classify roles only, optionally preserving existing classification"""
    start_time = time.time()

    # Get existing classification for context (if available and requested)
    existing_classification = None
    if use_existing_context and "classification" in conversation:
        existing_classification = conversation["classification"]

    # Classify roles (with context from dimensions 1-8 if available)
    role_classification = classify_roles_only(client, conversation["messages"], existing_classification, model)

    # Merge with existing classification if preserving
    if preserve_existing and "classification" in conversation:
        existing = conversation["classification"]
        existing["humanRole"] = role_classification["humanRole"]
        existing["aiRole"] = role_classification["aiRole"]
        classification = existing
    else:
        # Create minimal classification with only roles
        classification = {
            "humanRole": role_classification["humanRole"],
            "aiRole": role_classification["aiRole"]
        }

    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "provider": "openai",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "roles-only-1.0",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "rolesOnly": True,
            "preserveExisting": preserve_existing
        }
    }

    return result


def classify_batch_roles(conversations: list, model: str = "gpt-4o-mini",
                        preserve_existing: bool = False,
                        use_existing_context: bool = True,
                        delay_ms: int = 300,
                        output_dir: Optional[Path] = None,
                        save_individual: bool = False) -> list:
    """Classify roles for multiple conversations"""
    client = OpenAI()
    results = []
    total = len(conversations)

    if save_individual and output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)

    for i, convo in enumerate(conversations):
        try:
            result = classify_conversation_roles(
                client, convo, model, preserve_existing, use_existing_context
            )
            results.append(result)

            if save_individual and output_dir:
                convo_id = convo.get('id', f'conversation-{i}')
                safe_id = "".join(c for c in str(convo_id) if c.isalnum() or c in ('-', '_'))
                output_file = output_dir / f"{safe_id}.json"
                with open(output_file, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"\n✅ Saved: {output_file.name}")

        except Exception as e:
            print(f"\n❌ Error on {convo.get('id', i)}: {e}")
            error_result = {
                **convo,
                "classification": convo.get("classification", {}),
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "provider": "openai",
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "roles-only-1.0",
                    "processingTimeMs": 0,
                    "rolesOnly": True,
                    "preserveExisting": preserve_existing
                }
            }
            results.append(error_result)

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
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        print("\nOptions:")
        print("  --model MODEL           OpenAI model to use (default: gpt-4o-mini)")
        print("  --limit N              Process only first N conversations")
        print("  --individual           Save each conversation to separate file")
        print("  --output-dir DIR        Directory for individual files (default: output/)")
        print("  --preserve-existing     Keep existing classification, only update roles")
        print("  --no-context            Don't use existing dimensions 1-8 as context for roles")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    model = "gpt-4o-mini"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]

    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        limit = int(sys.argv[idx + 1])

    save_individual = "--individual" in sys.argv
    output_dir = None
    if save_individual:
        if "--output-dir" in sys.argv:
            idx = sys.argv.index("--output-dir")
            output_dir = Path(sys.argv[idx + 1])
        else:
            output_dir = Path("output")

    preserve_existing = "--preserve-existing" in sys.argv
    use_existing_context = "--no-context" not in sys.argv

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

    preserve_msg = "preserving existing classifications" if preserve_existing else "roles only"
    context_msg = "using existing dimensions 1-8 as context" if use_existing_context else "without context from dimensions 1-8"
    print(f"\nClassifying roles with {model} (OpenAI) - {preserve_msg}, {context_msg}...\n")

    results = classify_batch_roles(
        conversations, model, preserve_existing, use_existing_context,
        output_dir=output_dir, save_individual=save_individual
    )

    if not save_individual or "--combined" in sys.argv:
        print(f"\nWriting to {output_path}...")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"✅ Combined results saved to {output_path}")

    if save_individual:
        print(f"✅ Individual files saved to {output_dir}/")

    print(f"✅ Role classification complete! Processed {len(results)} conversations")


if __name__ == "__main__":
    main()

