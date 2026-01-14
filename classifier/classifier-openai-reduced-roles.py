#!/usr/bin/env python3
"""
Reduced Role Taxonomy Classifier (OpenAI)
Classification using 6 roles: 3 human, 3 AI

Based on academic foundations:
- CSCW role theory
- Conversation Analysis
- HCI interaction modeling

Roles:
HUMAN: Information-Seeker, Social-Expressor, Co-Constructor
AI: Facilitator, Expert System, Relational Peer

Usage:
    python classifier-openai-reduced-roles.py conversations.json output.json
    python classifier-openai-reduced-roles.py conversations.json output.json --individual --output-dir public/output
    python classifier-openai-reduced-roles.py conversations.json output.json --model gpt-4o-mini
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Optional, Any
import time
from datetime import datetime

# Load environment variables
def load_env_file():
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
# REDUCED ROLE TAXONOMY PROMPT
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

### 9. HUMAN ROLE (Distribution Required)

Three roles representing interactional stances:

#### Information-Seeker
**Definition:** A human interactional stance oriented toward reducing uncertainty or knowledge gaps, where the user expects the system to help clarify, explain, or make sense of something not yet understood.

**Key Properties:**
- **Intent:** Epistemic (knowing, understanding)
- **Agency:** User-initiated, AI-responsive
- **Typical behaviors:** Asking questions, requesting explanations, testing knowledge

**Decision Rules:**
- Expects answers, explanations, or knowledge transfer
- One-way information request (human → AI)
- Questions like "What is X?", "How do I do Y?", "Can you explain Z?"

**Distinction from Co-Constructor:** Does human build on AI's previous output? No → Information-Seeker, Yes → Co-Constructor

**Distinction from Social-Expressor:** Is the primary goal knowledge acquisition? Yes → Information-Seeker, No (expects validation/listening) → Social-Expressor

#### Social-Expressor
**Definition:** A human stance oriented toward expression, narration, emotional articulation, or social presence, where communication itself is the primary goal rather than task completion.

**Key Properties:**
- **Intent:** Expressive / relational
- **Agency:** User-driven disclosure
- **Typical behaviors:** Personal narrative, emotional expression, sharing for its own sake

**Decision Rules:**
- Expects acknowledgment, validation, or witnessing (not answers)
- Communication itself is the goal (not task completion)
- Personal narrative, emotional expression, creative sharing

**Distinction from Information-Seeker:** Expects answer or validation? Answer → Information-Seeker, Validation → Social-Expressor

**Distinction from Co-Constructor:** Is there a tangible outcome being constructed? Yes → Co-Constructor, No → Social-Expressor

#### Co-Constructor
**Definition:** A human stance where agency is shared with the AI to jointly develop ideas, artifacts, or understanding through iterative dialogue.

**Key Properties:**
- **Intent:** Generative / constructive
- **Agency:** Distributed
- **Typical behaviors:** Building on AI's output, proposing alternatives, iterative refinement

**Decision Rules:**
- Two-way idea exchange (human ↔ AI)
- Does human build on AI's previous output? Yes
- Joint development of ideas/artifacts (task-oriented)

**Distinction from Information-Seeker:** One-way or two-way? One-way → Information-Seeker, Two-way → Co-Constructor

**Distinction from Social-Expressor:** Task-oriented or relational? Task-oriented → Co-Constructor, Relational → Social-Expressor

---

### 10. AI ROLE (Distribution Required)

Three roles representing interactional stances:

#### Facilitator
**Definition:** An AI stance focused on supporting the user's process—structuring thinking, prompting reflection, and maintaining conversational flow—without asserting epistemic authority.

**Key Properties:**
- **Authority:** Low
- **Function:** Scaffolding, guiding, reframing
- **Typical behaviors:** Questions, summaries, prompts, offering options

**Decision Rules:**
- Structures thinking, guides discovery
- Asks questions or offers frameworks (not direct answers)
- Supports process without asserting authority

**Distinction from Expert System:** Who provides the information? AI directly → Expert System, AI asks/structures → Facilitator

**Distinction from Relational Peer:** Does AI impose structure? Yes → Facilitator, No (affirms/mirrors only) → Relational Peer

#### Expert System
**Definition:** An AI stance that asserts epistemic authority, providing direct answers, evaluations, or prescriptions with minimal negotiation.

**Key Properties:**
- **Authority:** High
- **Function:** Instruction, diagnosis, optimization
- **Typical behaviors:** Direct answers, definitions, prescriptions, evaluations

**Decision Rules:**
- Provides direct answers or evaluations
- Asserts epistemic authority
- Task-focused, correctness-oriented

**Distinction from Facilitator:** Provides answers or asks questions? Provides answers → Expert System, Asks questions → Facilitator

**Distinction from Relational Peer:** Is authority asserted? Yes → Expert System, No → Relational Peer

#### Relational Peer
**Definition:** An AI stance that positions itself as a socially aligned, non-hierarchical conversational partner, emphasizing rapport, empathy, and mutual engagement.

**Key Properties:**
- **Authority:** Intentionally flattened
- **Function:** Emotional alignment, trust-building
- **Typical behaviors:** Affirmation, mirroring, casual tone, warmth

**Decision Rules:**
- Affirms, mirrors, validates (relational)
- Flattened authority, relationship-focused
- Emotional alignment over task completion

**Distinction from Facilitator:** Imposes structure or affirms? Imposes structure → Facilitator, Affirms/mirrors only → Relational Peer

**Distinction from Expert System:** Authority asserted or flattened? Asserted → Expert System, Flattened → Relational Peer

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
    "distribution": {{"information-seeker": 0.7, "social-expressor": 0.2, "co-constructor": 0.1}},
    "confidence": 0.8,
    "evidence": [{{"role": "information-seeker", "quote": "exact quote"}}],
    "rationale": "brief explanation",
    "alternative": null
  }},
  "aiRole": {{
    "distribution": {{"facilitator": 0.8, "expert-system": 0.2, "relational-peer": 0.0}},
    "confidence": 0.8,
    "evidence": [{{"role": "facilitator", "quote": "exact quote"}}],
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
- Role names must be: "information-seeker", "social-expressor", "co-constructor" for human; "facilitator", "expert-system", "relational-peer" for AI

---

## CONVERSATION TO ANALYZE

"""


# ============================================================================
# UTILITIES
# ============================================================================

def extract_json(text: str) -> str:
    """Extract JSON from text, handling markdown code fences"""
    # Remove markdown code fences
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Try to find JSON object
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json_match.group(0)
    
    return text


def format_conversation(messages: List[Dict]) -> str:
    """Format conversation messages for prompt"""
    formatted = []
    for msg in messages:
        role = msg.get('role', 'unknown').upper()
        content = msg.get('content', '')
        formatted.append(f"{role}: {content}")
    return "\n".join(formatted)


def load_few_shot_examples(examples_file: Optional[Path] = None) -> str:
    """Load few-shot examples from JSON file"""
    if examples_file is None:
        examples_file = Path("classifier/few-shot-examples-reduced-roles.json")
    
    if not examples_file.exists():
        return ""
    
    try:
        with open(examples_file) as f:
            data = json.load(f)
        
        examples = data.get('examples', [])
        if not examples:
            return ""
        
        formatted_examples = []
        for ex in examples:
            transcript = ex.get('transcript', '')
            classification = ex.get('classification', {})
            
            # Format example
            example_text = f"Example:\n{transcript}\n\nClassification:\n{json.dumps(classification, indent=2)}\n"
            formatted_examples.append(example_text)
        
        return "\n---\n\n".join(formatted_examples)
    except Exception as e:
        print(f"Warning: Could not load few-shot examples: {e}")
        return ""


def validate_classification(data: dict) -> dict:
    """Validate and normalize classification data"""
    # Ensure role distributions sum to 1.0
    if 'humanRole' in data and 'distribution' in data['humanRole']:
        dist = data['humanRole']['distribution']
        total = sum(dist.values())
        if total > 0:
            data['humanRole']['distribution'] = {k: v / total for k, v in dist.items()}
    
    if 'aiRole' in data and 'distribution' in data['aiRole']:
        dist = data['aiRole']['distribution']
        total = sum(dist.values())
        if total > 0:
            data['aiRole']['distribution'] = {k: v / total for k, v in dist.items()}
    
    return data


# ============================================================================
# OPENAI API
# ============================================================================

def classify_messages_openai(
    client: OpenAI,
    messages: List[Dict],
    few_shot_examples: str = "",
    model: str = "gpt-4o-mini",
    max_retries: int = 2
) -> Dict:
    """Classify a conversation using OpenAI API"""
    
    # Format conversation
    conv_text = format_conversation(messages)
    
    # Build prompt
    prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples=few_shot_examples) + conv_text
    
    # Make request with retries
    for attempt in range(max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert conversation analyst. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"}  # Force JSON output
            )
            
            text = response.choices[0].message.content
            json_text = extract_json(text)
            data = json.loads(json_text)
            return validate_classification(data)
            
        except json.JSONDecodeError as e:
            if attempt < max_retries:
                print(f"  ⚠️  JSON parse error (attempt {attempt + 1}/{max_retries + 1}), retrying...")
                time.sleep(1)
                continue
            else:
                print(f"  ❌ Failed to parse JSON after {max_retries + 1} attempts")
                raise
        except Exception as e:
            if attempt < max_retries:
                print(f"  ⚠️  Error (attempt {attempt + 1}/{max_retries + 1}): {e}, retrying...")
                time.sleep(1)
                continue
            else:
                raise


def classify_conversation_openai(
    client: OpenAI,
    conversation: dict,
    few_shot_examples: str = "",
    model: str = "gpt-4o-mini"
) -> dict:
    """Classify a full conversation"""
    start_time = time.time()
    
    try:
        classification = classify_messages_openai(
            client,
            conversation.get("messages", []),
            few_shot_examples,
            model
        )
        
        result = {
            **conversation,
            "classification": classification,
            "classificationMetadata": {
                "model": model,
                "version": "reduced-roles-v1.0",
                "timestamp": datetime.now().isoformat(),
                "promptVersion": "reduced-roles-v1.0",
                "processingTimeMs": int((time.time() - start_time) * 1000)
            }
        }
        
        return result
    except Exception as e:
        return {
            **conversation,
            "classification": None,
            "classificationError": str(e),
            "classificationMetadata": {
                "model": model,
                "version": "reduced-roles-v1.0",
                "timestamp": datetime.now().isoformat(),
                "promptVersion": "reduced-roles-v1.0",
                "processingTimeMs": int((time.time() - start_time) * 1000)
            }
        }


def classify_batch_openai(
    conversations: list,
    few_shot_examples: str = "",
    model: str = "gpt-4o-mini",
    output_file: Optional[Path] = None,
    individual: bool = False,
    output_dir: Optional[Path] = None
) -> list:
    """Classify multiple conversations"""
    
    client = OpenAI()
    results = []
    total = len(conversations)
    
    for i, convo in enumerate(conversations):
        conv_id = convo.get('id', f'conv-{i}')
        print(f"[{i+1}/{total}] Classifying {conv_id}...", end=" ", flush=True)
        
        try:
            result = classify_conversation_openai(
                client, convo, few_shot_examples, model
            )
            
            if result.get('classification'):
                print("✅")
                results.append(result)
                
                # Save individual file if requested
                if individual and output_dir:
                    output_dir.mkdir(parents=True, exist_ok=True)
                    output_path = output_dir / f"{conv_id}.json"
                    with open(output_path, 'w') as f:
                        json.dump(result, f, indent=2)
            else:
                print("❌ Error:", result.get('classificationError', 'Unknown error'))
                results.append(result)
                
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "version": "reduced-roles-v1.0",
                    "timestamp": datetime.now().isoformat()
                }
            })
        
        # Save progress periodically
        if output_file and (i + 1) % 10 == 0:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"  💾 Progress saved ({i+1}/{total} complete)")
    
    # Final save
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
    
    return results


# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print("Usage: python classifier-openai-reduced-roles.py <input.json> <output.json> [options]")
        print("\nOptions:")
        print("  --individual              Save individual files")
        print("  --output-dir <dir>        Directory for individual files")
        print("  --few-shot-examples <file> Path to few-shot examples JSON")
        print("  --model <model>          OpenAI model (default: gpt-4o-mini)")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    
    # Parse options
    individual = "--individual" in sys.argv
    output_dir = None
    if "--output-dir" in sys.argv:
        idx = sys.argv.index("--output-dir")
        output_dir = Path(sys.argv[idx + 1])
    
    few_shot_file = None
    if "--few-shot-examples" in sys.argv:
        idx = sys.argv.index("--few-shot-examples")
        few_shot_file = Path(sys.argv[idx + 1])
    
    model = "gpt-4o-mini"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]
    
    # Load conversations
    with open(input_file) as f:
        conversations = json.load(f)
    
    if not isinstance(conversations, list):
        conversations = [conversations]
    
    # Load few-shot examples
    few_shot_examples = load_few_shot_examples(few_shot_file)
    
    print(f"📊 Classifying {len(conversations)} conversations using {model}")
    if few_shot_examples:
        print("   Using few-shot examples")
    print()
    
    # Classify
    results = classify_batch_openai(
        conversations,
        few_shot_examples,
        model,
        output_file,
        individual,
        output_dir
    )
    
    # Summary
    successful = sum(1 for r in results if r.get('classification'))
    failed = len(results) - successful
    
    print(f"\n✅ Classification complete!")
    print(f"   Successful: {successful}")
    print(f"   Failed: {failed}")
    print(f"   Output: {output_file}")


if __name__ == "__main__":
    main()

