#!/usr/bin/env python3
"""
Conversation Metadata Classifier v2.0 (Social Role Theory-Based)

Classification using OpenAI GPT-4o with Social Role Theory framework.
6 Human Roles + 6 AI Roles based on Instrumental/Expressive distinction.

Usage:
    python classifier-openai-social-role-theory.py conversations.json output.json \
        --few-shot-examples few-shot-examples-social-role-theory.json \
        --model gpt-4o
    python classifier-openai-social-role-theory.py conversations.json output.json \
        --few-shot-examples few-shot-examples-social-role-theory.json \
        --model gpt-4o --individual --output-dir public/output
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
    """Load environment variables from .env file (checks current dir and parent)"""
    # Try multiple locations
    possible_paths = [
        Path(".env"),  # Current directory
        Path("../.env"),  # Parent directory
    ]
    
    # Try to find script location for absolute path
    try:
        script_dir = Path(__file__).parent
        possible_paths.append(script_dir.parent / ".env")  # Parent of script dir
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
                    # Handle "export KEY=VALUE" format
                    if line.startswith("export "):
                        line = line[7:]  # Remove "export "
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip().strip('"').strip("'")
                        # Always set (override existing) to ensure it's loaded
                        os.environ[key] = value

load_env_file()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# ============================================================================
# PROMPT TEMPLATE (Social Role Theory Framework)
# ============================================================================

CLASSIFICATION_PROMPT_TEMPLATE = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics using Social Role Theory.

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

## SOCIAL ROLE THEORY FRAMEWORK

Roles are organized along two dimensions:

1. **Instrumental ↔ Expressive**
   - **Instrumental**: Task-oriented, goal-directed, functional (maps to Functional/Social X-axis)
   - **Expressive**: Relationship-oriented, emotional, communal (maps to Social side of X-axis)

2. **Authority Level** (maps to Y-axis: Structured ↔ Emergent)
   - **High Authority**: Asserts knowledge/control (structured, bottom)
   - **Low Authority**: Seeks information or guides (emergent, top)
   - **Equal Authority**: Collaborative partnership (balanced, middle)

### Key Distinctions:

**Learning-Facilitator (Instrumental) vs Social-Facilitator (Expressive):**
- **Learning-Facilitator**: Scaffolds understanding, guides discovery (task-oriented, educational)
  - Signals: "What do you think would happen if...?", "Let's explore...", structured questions for learning
  - Goal: Help user discover/learn something
- **Social-Facilitator**: Maintains conversation, builds rapport (relationship-oriented, casual)
  - Signals: "How are you?", "What do you do for a career?", casual questions for social bonding
  - Goal: Keep conversation going, build relationship

**Provider (Human, Instrumental, Low Authority) vs Expert-System (AI, Instrumental, High Authority):**
- **Provider** (Human): Seeks information (asks questions, low authority)
- **Expert-System** (AI): Provides information (gives answers, high authority)
- These are complementary roles in the same interaction

---

## FEW-SHOT EXAMPLES

{few_shot_examples}

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

| Role | Instrumental/Expressive | Authority | Definition | Signals |
|------|----------------------|-----------|------------|---------|
| **information-seeker** | Instrumental | Low (seeking) | Requests information, asks questions to fill knowledge gaps | "What is...?", "How do I...?", "Can you explain...?" |
| **provider** | Instrumental | Low (seeking) | Seeks information from AI, asks questions expecting answers | "What is X?", "Tell me about Y", expects answers |
| **director** | Instrumental | High | Commands, specifies deliverables, controls task | "Do this...", "Make it...", "I want...", specifies constraints |
| **collaborator** | Instrumental | Equal | Co-builds, proposes alternatives, joint problem-solving | "What if we...?", "We could...", builds on AI output, iterative |
| **social-expressor** | Expressive | Low | Personal narrative, emotional expression, sharing | "I feel...", personal stories, emotional sharing, expects validation |
| **relational-peer** | Expressive | Equal | Equal partner, social bonding, casual conversation | Casual chat, "how are you?", rapport-building, peer-to-peer |

**Tie-breakers:**
- information-seeker vs provider: Both instrumental and low authority; provider specifically seeks from AI (asking questions)
- information-seeker vs collaborator: One-way (seeker) vs two-way (collaborator builds on AI output)
- director vs collaborator: Commands (director) vs proposes alternatives (collaborator)
- social-expressor vs relational-peer: Personal expression (expressor) vs casual peer conversation (peer)

---

### 10. AI ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Instrumental/Expressive | Authority | Definition | Signals |
|------|----------------------|-----------|------------|---------|
| **expert-system** | Instrumental | High | Provides direct answers, asserts epistemic authority | "X is...", "This means...", comprehensive explanations, direct answers |
| **learning-facilitator** | Instrumental | Low | Scaffolds learning, guides discovery through structured questions | "What do you think would happen if...?", "Let's explore...", Socratic method, educational |
| **advisor** | Instrumental | High | Prescribes actions, gives recommendations | "You should...", "I recommend...", step-by-step guidance, prescriptive |
| **co-constructor** | Instrumental | Equal | Joint problem-solving, co-creates with user | "We could...", "Let's try...", proposes alternatives, iterative building |
| **social-facilitator** | Expressive | Low | Maintains conversation flow, social bonding | "How are you?", "What do you do for a career?", keeps chat going, casual questions |
| **relational-peer** | Expressive | Equal | Equal social partner, casual conversation | "Cool!", "I like that too!", peer-to-peer chat, social alignment |

**Tie-breakers:**
- learning-facilitator vs social-facilitator: **KEY DISTINCTION** - Learning (instrumental, scaffolds understanding) vs Social (expressive, builds rapport)
- expert-system vs advisor: Explains concepts (expert) vs prescribes actions (advisor)
- learning-facilitator vs co-constructor: Guides discovery (facilitator) vs co-builds (co-constructor)
- social-facilitator vs relational-peer: Maintains conversation (facilitator) vs equal peer chat (peer)

---

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown fences). Role distributions must sum to 1.0.

{{
  "abstain": false,
  "interactionPattern": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "powerDynamics": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "emotionalTone": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "engagementStyle": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "knowledgeExchange": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "conversationPurpose": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "topicDepth": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "turnTaking": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "humanRole": {{
    "distribution": {{
      "information-seeker": 0,
      "provider": 0,
      "director": 0,
      "collaborator": 0,
      "social-expressor": 0,
      "relational-peer": 0
    }},
    "confidence": 0.0,
    "evidence": [{{"role": "information-seeker", "quote": "..."}}],
    "rationale": "...",
    "alternative": null
  }},
  "aiRole": {{
    "distribution": {{
      "expert-system": 0,
      "learning-facilitator": 0,
      "advisor": 0,
      "co-constructor": 0,
      "social-facilitator": 0,
      "relational-peer": 0
    }},
    "confidence": 0.0,
    "evidence": [{{"role": "expert-system", "quote": "..."}}],
    "rationale": "...",
    "alternative": null
  }}
}}

---

## CONVERSATION TO ANALYZE

"""


# ============================================================================
# FEW-SHOT EXAMPLE FORMATTING
# ============================================================================

def format_few_shot_example(example: Dict) -> str:
    """Format a single few-shot example for the prompt"""
    conv_id = example.get('conversationId', 'unknown')
    transcript = example.get('transcript', '')
    classification = example.get('classification', {})
    
    # Format dimensions 1-8
    dims = classification.get('dimensions1to8', {})
    dims_text = []
    for dim_name, dim_data in dims.items():
        category = dim_data.get('category', 'unknown')
        confidence = dim_data.get('confidence', 0)
        evidence = dim_data.get('evidence', [])[:1]  # Top evidence quote
        dims_text.append(f"  {dim_name}: {category} (confidence: {confidence:.2f}, evidence: {evidence[0] if evidence else 'N/A'})")
    
    # Format roles
    human_role = classification.get('humanRole', {})
    ai_role = classification.get('aiRole', {})
    
    human_dist = human_role.get('distribution', {})
    ai_dist = ai_role.get('distribution', {})
    
    human_evidence = human_role.get('evidence', [])[:2]
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
    """Load and format few-shot examples from JSON file"""
    with open(file_path) as f:
        data = json.load(f)
    
    examples = data.get('examples', [])
    if not examples:
        # Try loading prompt format directly
        if 'promptFormat' in data:
            return data['promptFormat']
        return ""
    
    formatted = []
    for i, example in enumerate(examples, 1):
        formatted.append(f"### Example {i}\n{format_few_shot_example(example)}")
    
    return "\n---\n\n".join(formatted)


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


def validate_classification(data: dict) -> dict:
    """Validate and fix classification output"""
    # Ensure all 6 human roles are present
    human_roles = ["information-seeker", "provider", "director", "collaborator", "social-expressor", "relational-peer"]
    ai_roles = ["expert-system", "learning-facilitator", "advisor", "co-constructor", "social-facilitator", "relational-peer"]
    
    if "humanRole" in data and "distribution" in data["humanRole"]:
        dist = data["humanRole"]["distribution"]
        # Add missing roles with 0
        for role in human_roles:
            if role not in dist:
                dist[role] = 0.0
        # Remove any old role names
        dist = {k: v for k, v in dist.items() if k in human_roles}
        data["humanRole"]["distribution"] = normalize_dist(dist)
    
    if "aiRole" in data and "distribution" in data["aiRole"]:
        dist = data["aiRole"]["distribution"]
        # Add missing roles with 0
        for role in ai_roles:
            if role not in dist:
                dist[role] = 0.0
        # Remove any old role names
        dist = {k: v for k, v in dist.items() if k in ai_roles}
        data["aiRole"]["distribution"] = normalize_dist(dist)
    
    return data


# ============================================================================
# CLASSIFIER
# ============================================================================

def classify_messages(client: OpenAI, messages: list, few_shot_examples: str = "", model: str = "gpt-4o") -> dict:
    """Classify a single message sequence using OpenAI with few-shot examples"""
    formatted = format_conversation(messages)
    
    # Build prompt with few-shot examples
    if few_shot_examples:
        prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples=few_shot_examples) + formatted
    else:
        # Fallback to zero-shot if no examples provided
        prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples="(No examples provided - using zero-shot)") + formatted

    # GPT-5.x models use max_completion_tokens instead of max_tokens
    use_max_completion = model.startswith("gpt-5") or "5." in model
    
    request_params = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are an expert conversation analyst using Social Role Theory. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
    }
    
    if use_max_completion:
        request_params["max_completion_tokens"] = 3000
    else:
        request_params["max_tokens"] = 3000
    
    response = client.chat.completions.create(**request_params)

    text = response.choices[0].message.content
    json_text = extract_json(text)
    data = json.loads(json_text)
    return validate_classification(data)


def classify_conversation(client: OpenAI, conversation: dict,
                         few_shot_examples: str = "",
                         model: str = "gpt-4o",
                         apply_corrections_flag: bool = False) -> dict:
    """Classify a full conversation with few-shot examples"""
    start_time = time.time()

    classification = classify_messages(client, conversation["messages"], few_shot_examples, model)

    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "provider": "openai",
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "2.0-social-role-theory",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "fewShotExamples": "yes" if few_shot_examples else "no"
        }
    }

    return result


def classify_batch(conversations: list, few_shot_examples: str = "",
                  model: str = "gpt-4o",
                  delay_ms: int = 600,
                  output_dir: Optional[Path] = None,
                  save_individual: bool = False) -> list:
    """Classify multiple conversations with few-shot examples"""
    # Ensure API key is loaded
    load_env_file()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment. Please check your .env file.")
    client = OpenAI(api_key=api_key)
    results = []
    total = len(conversations)

    if save_individual and output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)

    for i, convo in enumerate(conversations):
        try:
            result = classify_conversation(
                client, convo, few_shot_examples, model
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
            import traceback
            traceback.print_exc()
            error_result = {
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "provider": "openai",
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "2.0-social-role-theory",
                    "processingTimeMs": 0,
                    "fewShotExamples": "yes" if few_shot_examples else "no"
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
        print("\nUsage:")
        print("  python classifier-openai-social-role-theory.py INPUT.json OUTPUT.json --few-shot-examples FILE --model gpt-4o")
        print("\nOptions:")
        print("  --few-shot-examples FILE    JSON file with few-shot examples (required)")
        print("  --model MODEL              OpenAI model to use (default: gpt-4o)")
        print("  --limit N                 Process only first N conversations")
        print("  --individual               Save each conversation to separate file")
        print("  --output-dir DIR            Directory for individual files (default: output/)")
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
        print("Usage: python classifier-openai-social-role-theory.py INPUT.json OUTPUT.json --few-shot-examples FILE --model gpt-4o")
        sys.exit(1)

    if not few_shot_file.exists():
        print(f"Error: Few-shot examples file not found: {few_shot_file}")
        sys.exit(1)

    print(f"Loading few-shot examples from {few_shot_file}...")
    few_shot_examples = load_few_shot_examples(few_shot_file)
    print(f"✅ Loaded few-shot examples ({len(few_shot_examples)} characters)")

    model = "gpt-4o"
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

    print(f"\n🎯 Classifying with {model} (OpenAI) using Social Role Theory framework...\n")

    results = classify_batch(
        conversations, few_shot_examples, model,
        output_dir=output_dir, save_individual=save_individual
    )

    if not save_individual or "--combined" in sys.argv:
        print(f"\nWriting to {output_path}...")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"✅ Combined results saved to {output_path}")

    if save_individual:
        print(f"✅ Individual files saved to {output_dir}/")

    successful = sum(1 for r in results if r.get('classification') is not None)
    print(f"\n✅ Classification complete! Processed {successful}/{len(results)} conversations successfully")


if __name__ == "__main__":
    main()

