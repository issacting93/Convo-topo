#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.2 (OpenAI Version with Corrections)

Enhanced version with fixes for systematic misclassification patterns:
- PAD value integration for emotional context
- Seeker-Sharer rebalancing
- Collaboration detection
- Pseudo-problem-solving detection
- X-axis spatial correction

Usage:
    python classifier-openai-v1.2.py conversations.json output.json
    python classifier-openai-v1.2.py conversations.json output.json --individual --output-dir public/output
"""

import json
import sys
import time
import os
import re
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
# PROMPT (Enhanced v1.2 with new roles and categories)
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
| philosophical-dialogue | Meaning-making, worldview exchange, existential exploration |
| artistic-expression | Creative sharing (poetry, lyrics, art description) |

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
| directive-iterative | Commands with iterative refinement cycles |

### 5. KNOWLEDGE EXCHANGE
| Category | Definition |
|----------|------------|
| personal-sharing | Private experiences, feelings, life details |
| skill-sharing | How-to knowledge, techniques, methods |
| opinion-exchange | Views, beliefs, interpretations |
| factual-info | Data, facts, definitions, specifications |
| experience-sharing | Narratives about learning or doing something |
| meaning-making | Philosophical exploration, worldview construction |

### 6. CONVERSATION PURPOSE
| Category | Definition |
|----------|------------|
| information-seeking | Obtaining specific knowledge or answers |
| problem-solving | Resolving an issue or challenge |
| entertainment | Fun, amusement, passing time |
| relationship-building | Social bonding, rapport, connection |
| self-expression | Processing thoughts, venting, journaling |
| emotional-processing | Working through feelings despite lack of solutions |
| collaborative-refinement | Iterative improvement through feedback |
| capability-exploration | Testing AI abilities, probing limitations |

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
# POST-PROCESSING CORRECTIONS
# ============================================================================

def detect_pseudo_problem_solving(conversation: dict) -> Optional[dict]:
    """
    Detect emotional processing disguised as questions
    Returns correction dict if pattern detected
    """
    messages = conversation.get('messages', [])
    if len(messages) < 6:
        return None

    # Count questions
    user_messages = [m for m in messages if m.get('role') == 'user']
    questions = [m for m in user_messages if '?' in m.get('content', '')]
    question_count = len(questions)

    if question_count < 3:
        return None

    # Calculate emotional intensity
    user_pad_values = [m.get('pad', {}) for m in user_messages if 'pad' in m]
    if not user_pad_values:
        return None

    avg_arousal = sum(p.get('arousal', 0.3) for p in user_pad_values) / len(user_pad_values)
    avg_intensity = sum(p.get('emotionalIntensity', 0.4) for p in user_pad_values) / len(user_pad_values)

    # Measure AI helpfulness (check for repetitive/generic responses)
    ai_messages = [m for m in messages if m.get('role') == 'assistant']
    if len(ai_messages) < 2:
        return None

    # Count generic phrases
    generic_phrases = [
        "i don't have",
        "as an ai",
        "i cannot",
        "it's important to",
        "you should",
        "i'm sorry",
        "i understand"
    ]

    generic_count = 0
    for ai_msg in ai_messages:
        content = ai_msg.get('content', '').lower()
        generic_count += sum(1 for phrase in generic_phrases if phrase in content)

    ai_helpfulness = max(0, 1 - (generic_count / max(1, len(ai_messages))))

    # Detection logic
    if question_count >= 3 and avg_arousal > 0.5 and ai_helpfulness < 0.4:
        return {
            'detected': True,
            'confidence': min(0.9, question_count / 6 * avg_arousal * 2),
            'corrections': {
                'purpose': 'emotional-processing',
                'human_sharer_boost': 0.25,
                'ai_affiliative_boost': 0.20
            },
            'evidence': {
                'question_count': question_count,
                'avg_arousal': avg_arousal,
                'ai_helpfulness': ai_helpfulness
            }
        }

    return None


def detect_collaboration(conversation: dict) -> Optional[dict]:
    """
    Detect iterative collaborative refinement
    Returns correction dict if pattern detected
    """
    messages = conversation.get('messages', [])
    if len(messages) < 6:
        return None

    user_messages = [m for m in messages if m.get('role') == 'user']

    # Feedback keywords
    feedback_keywords = [
        'improve', 'better', 'issues', 'problems', 'wrong',
        'change', 'fix', 'modify', 'adjust', 'revise'
    ]

    directive_keywords = [
        'rewrite', 'redo', 'try again', 'make it',
        'add', 'remove', 'include', 'exclude'
    ]

    feedback_count = 0
    directive_count = 0

    for msg in user_messages:
        content = msg.get('content', '').lower()
        feedback_count += sum(1 for kw in feedback_keywords if kw in content)
        directive_count += sum(1 for kw in directive_keywords if kw in content)

    # Count refinement cycles (AI -> User feedback -> AI revision)
    refinement_cycles = 0
    for i in range(2, len(messages)):
        if (messages[i-2].get('role') == 'assistant' and
            messages[i-1].get('role') == 'user' and
            messages[i].get('role') == 'assistant'):

            user_content = messages[i-1].get('content', '').lower()
            if any(kw in user_content for kw in feedback_keywords + directive_keywords):
                refinement_cycles += 1

    if (feedback_count >= 2 or directive_count >= 3) and refinement_cycles >= 2:
        return {
            'detected': True,
            'confidence': min(0.95, (feedback_count + directive_count) / 8 + refinement_cycles / 5),
            'corrections': {
                'purpose': 'collaborative-refinement',
                'human_collaborator_boost': 0.25,
                'human_director_boost': 0.15,
                'ai_learner_boost': 0.20
            },
            'evidence': {
                'feedback_count': feedback_count,
                'directive_count': directive_count,
                'refinement_cycles': refinement_cycles
            }
        }

    return None


def rebalance_roles(conversation: dict, classification: dict) -> dict:
    """
    Adjust role distributions based on PAD values and content patterns
    """
    messages = conversation.get('messages', [])
    user_messages = [m for m in messages if m.get('role') == 'user']

    if not user_messages:
        return classification

    # Extract PAD metrics
    user_pad_values = [m.get('pad', {}) for m in user_messages if 'pad' in m]
    if not user_pad_values:
        return classification

    avg_arousal = sum(p.get('arousal', 0.3) for p in user_pad_values) / len(user_pad_values)

    # Count personal disclosures
    personal_keywords = ['i feel', 'i think', 'my ', 'i am', 'i was', "i'm "]
    personal_count = 0
    for msg in user_messages:
        content = msg.get('content', '').lower()
        personal_count += sum(1 for kw in personal_keywords if kw in content)

    # Count questions
    question_count = sum(1 for m in user_messages if '?' in m.get('content', ''))

    # Get current roles
    human_roles = classification.get('humanRole', {}).get('distribution', {})
    ai_roles = classification.get('aiRole', {}).get('distribution', {})

    corrections = {}

    # Seeker-Sharer rebalancing
    if human_roles.get('seeker', 0) > 0.5 and personal_count >= 2:
        sharer_boost = min(0.30, personal_count * 0.08 + avg_arousal * 0.20)
        corrections['human_sharer'] = sharer_boost
        corrections['human_seeker'] = -sharer_boost

    # Affiliative boost for emotional content
    if avg_arousal > 0.5 and ai_roles.get('affiliative', 0) < 0.15:
        affiliative_boost = min(0.25, (avg_arousal - 0.5) * 0.5)
        corrections['ai_affiliative'] = affiliative_boost
        corrections['ai_expert'] = -affiliative_boost * 0.6
        corrections['ai_advisor'] = -affiliative_boost * 0.4

    # Apply corrections
    if corrections:
        for role, adjustment in corrections.items():
            if role.startswith('human_'):
                role_name = role.replace('human_', '')
                if role_name in human_roles:
                    human_roles[role_name] = max(0, human_roles[role_name] + adjustment)
            elif role.startswith('ai_'):
                role_name = role.replace('ai_', '')
                if role_name in ai_roles:
                    ai_roles[role_name] = max(0, ai_roles[role_name] + adjustment)

        # Renormalize
        human_total = sum(human_roles.values())
        if human_total > 0:
            human_roles = {k: v / human_total for k, v in human_roles.items()}

        ai_total = sum(ai_roles.values())
        if ai_total > 0:
            ai_roles = {k: v / ai_total for k, v in ai_roles.items()}

        classification['humanRole']['distribution'] = human_roles
        classification['aiRole']['distribution'] = ai_roles

    return classification


def apply_corrections(conversation: dict, classification: dict) -> dict:
    """
    Apply all post-processing corrections
    """
    corrections_applied = []

    # Detect patterns
    pseudo = detect_pseudo_problem_solving(conversation)
    collab = detect_collaboration(conversation)

    # Apply pseudo-problem-solving corrections
    if pseudo and pseudo['detected']:
        corrections_applied.append('pseudo-problem-solving')

        # Update purpose
        classification['conversationPurpose']['category'] = pseudo['corrections']['purpose']
        classification['conversationPurpose']['confidence'] = pseudo['confidence']

        # Boost roles
        human_roles = classification.get('humanRole', {}).get('distribution', {})
        ai_roles = classification.get('aiRole', {}).get('distribution', {})

        if 'sharer' in human_roles:
            human_roles['sharer'] = min(1.0, human_roles.get('sharer', 0) + pseudo['corrections']['human_sharer_boost'])
            human_roles['seeker'] = max(0, human_roles.get('seeker', 0) - pseudo['corrections']['human_sharer_boost'])

        if 'affiliative' in ai_roles:
            ai_roles['affiliative'] = min(1.0, ai_roles.get('affiliative', 0) + pseudo['corrections']['ai_affiliative_boost'])
            ai_roles['expert'] = max(0, ai_roles.get('expert', 0) - pseudo['corrections']['ai_affiliative_boost'] * 0.6)

    # Apply collaboration corrections
    if collab and collab['detected']:
        corrections_applied.append('collaboration')

        # Update purpose (could be secondary)
        classification['conversationPurpose']['alternativePurpose'] = collab['corrections']['purpose']

        # Boost roles
        human_roles = classification.get('humanRole', {}).get('distribution', {})
        ai_roles = classification.get('aiRole', {}).get('distribution', {})

        if 'collaborator' in human_roles:
            human_roles['collaborator'] = min(1.0, human_roles.get('collaborator', 0) + collab['corrections']['human_collaborator_boost'])
        if 'director' in human_roles:
            human_roles['director'] = min(1.0, human_roles.get('director', 0) + collab['corrections']['human_director_boost'])
        if 'learner' in ai_roles:
            ai_roles['learner'] = min(1.0, ai_roles.get('learner', 0) + collab['corrections']['ai_learner_boost'])

    # Rebalance roles based on PAD
    classification = rebalance_roles(conversation, classification)

    # Add metadata about corrections
    if corrections_applied:
        classification['correctionsApplied'] = corrections_applied

    return classification


# ============================================================================
# UTILITIES (Same as v1.1 but with corrections)
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


def validate_classification(data: dict) -> dict:
    """Validate and fix classification output"""
    if "humanRole" in data and "distribution" in data["humanRole"]:
        data["humanRole"]["distribution"] = normalize_dist(data["humanRole"]["distribution"])
    if "aiRole" in data and "distribution" in data["aiRole"]:
        data["aiRole"]["distribution"] = normalize_dist(data["aiRole"]["distribution"])

    return data


# ============================================================================
# CLASSIFIER (OpenAI Version with Corrections)
# ============================================================================

def classify_messages(client: OpenAI, messages: list, model: str = "gpt-4") -> dict:
    """Classify a single message sequence using OpenAI"""
    formatted = format_conversation(messages)
    prompt = CLASSIFICATION_PROMPT + formatted

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert conversation analyst. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=3000
    )

    text = response.choices[0].message.content
    json_text = extract_json(text)
    data = json.loads(json_text)
    return validate_classification(data)


def classify_conversation(client: OpenAI, conversation: dict,
                         model: str = "gpt-4",
                         apply_corrections_flag: bool = True) -> dict:
    """Classify a full conversation with optional corrections"""
    start_time = time.time()

    classification = classify_messages(client, conversation["messages"], model)

    # Apply post-processing corrections
    if apply_corrections_flag:
        classification = apply_corrections(conversation, classification)

    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "provider": "openai",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "1.2.0",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "correctionsApplied": apply_corrections_flag
        }
    }

    return result


def classify_batch(conversations: list, model: str = "gpt-4",
                  apply_corrections_flag: bool = True,
                  delay_ms: int = 600,
                  output_dir: Optional[Path] = None,
                  save_individual: bool = False) -> list:
    """Classify multiple conversations"""
    client = OpenAI()
    results = []
    total = len(conversations)

    if save_individual and output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)

    for i, convo in enumerate(conversations):
        try:
            result = classify_conversation(
                client, convo, model, apply_corrections_flag
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
            print(f"\nError on {convo.get('id', i)}: {e}")
            error_result = {
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "provider": "openai",
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "1.2.0",
                    "processingTimeMs": 0,
                    "correctionsApplied": apply_corrections_flag
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
        print("  --model MODEL           OpenAI model to use (default: gpt-4)")
        print("  --limit N              Process only first N conversations")
        print("  --individual           Save each conversation to separate file")
        print("  --output-dir DIR        Directory for individual files (default: output/)")
        print("  --no-corrections       Disable post-processing corrections")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    model = "gpt-4"
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
    print(f"\nClassifying with {model} (OpenAI) {corrections_msg}...\n")

    results = classify_batch(
        conversations, model, apply_corrections_flag,
        output_dir=output_dir, save_individual=save_individual
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
