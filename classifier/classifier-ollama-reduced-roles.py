#!/usr/bin/env python3
"""
Reduced Role Taxonomy Classifier (Ollama)
Classification using 6 roles: 3 human, 3 AI

Based on academic foundations:
- CSCW role theory
- Conversation Analysis
- HCI interaction modeling

Roles:
HUMAN: Information-Seeker, Social-Expressor, Co-Constructor
AI: Facilitator, Expert System, Relational Peer
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Optional, Any
import requests
import time

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
# FEW-SHOT EXAMPLE FORMATTING
# ============================================================================

def format_few_shot_example(example: Dict) -> str:
    """Format a single few-shot example for inclusion in the prompt"""
    transcript = example.get('transcript', '')
    classification = example.get('classification', {})
    
    # Format dimensions 1-8
    dims_text = []
    for dim_name in ['interactionPattern', 'powerDynamics', 'emotionalTone', 'engagementStyle', 
                     'knowledgeExchange', 'conversationPurpose', 'topicDepth', 'turnTaking']:
        dim_data = classification.get(dim_name, {})
        category = dim_data.get('category', 'unknown')
        confidence = dim_data.get('confidence', 0)
        evidence = dim_data.get('evidence', [])[:1]
        dims_text.append(f"  {dim_name}: {category} (confidence: {confidence:.2f}, evidence: {evidence[0] if evidence else 'N/A'})")
    
    # Format role distributions
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
    if not file_path.exists():
        return ""
    
    with open(file_path) as f:
        data = json.load(f)
    
    examples = data.get('examples', [])
    if not examples:
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

def normalize_dist(dist: dict, epsilon: float = 1e-6) -> dict:
    """Normalize a probability distribution to sum to 1.0"""
    total = sum(dist.values())
    if total < epsilon:
        # If all zeros, distribute equally
        n = len(dist)
        return {k: 1.0 / n for k in dist}
    return {k: v / total for k, v in dist.items()}


def extract_json(text: str) -> Optional[Dict]:
    """Extract JSON from potentially malformed response"""
    # Try to find JSON block
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        json_str = json_match.group(0)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass
    
    # Try to fix common issues
    # Remove markdown code fences
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    
    # Try parsing again
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def format_conversation(messages: List[Dict]) -> str:
    """Format conversation messages for prompt"""
    formatted = []
    for msg in messages:
        role = msg.get('role', 'unknown').upper()
        content = msg.get('content', '')
        formatted.append(f"{role}: {content}")
    return "\n".join(formatted)


# ============================================================================
# OLLAMA API
# ============================================================================

def classify_messages_ollama(
    messages: List[Dict],
    few_shot_examples: str = "",
    model: str = "qwen2.5:7b",
    max_retries: int = 2,
    ollama_url: str = "http://localhost:11434"
) -> Dict:
    """Classify a conversation using Ollama"""
    
    # Format conversation
    conv_text = format_conversation(messages)
    
    # Build prompt
    prompt = CLASSIFICATION_PROMPT_TEMPLATE.format(few_shot_examples=few_shot_examples) + conv_text
    
    # Prepare request
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # Lower temperature for more consistent classification
            "num_predict": 4000,  # Allow longer responses
        }
    }
    
    # Make request with retries
    for attempt in range(max_retries + 1):
        try:
            response = requests.post(
                f"{ollama_url}/api/generate",
                json=payload,
                timeout=300
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract response text
            response_text = result.get('response', '')
            
            # Parse JSON
            classification = extract_json(response_text)
            
            if classification:
                # Normalize distributions
                if 'humanRole' in classification and 'distribution' in classification['humanRole']:
                    classification['humanRole']['distribution'] = normalize_dist(
                        classification['humanRole']['distribution']
                    )
                
                if 'aiRole' in classification and 'distribution' in classification['aiRole']:
                    classification['aiRole']['distribution'] = normalize_dist(
                        classification['aiRole']['distribution']
                    )
                
                return classification
            else:
                # If JSON parsing failed, retry with higher temperature
                if attempt < max_retries:
                    payload['options']['temperature'] = 0.5
                    time.sleep(1)
                    continue
                else:
                    raise ValueError(f"Failed to parse JSON after {max_retries + 1} attempts")
        
        except requests.exceptions.RequestException as e:
            if attempt < max_retries:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise
    
    raise ValueError("Failed to classify after all retries")


def classify_conversation_ollama(
    conversation: Dict,
    few_shot_examples: str = "",
    model: str = "qwen2.5:7b",
    ollama_url: str = "http://localhost:11434",
    max_retries: int = 2
) -> Dict:
    """Classify a single conversation file"""
    messages = conversation.get('messages', [])
    
    if not messages:
        raise ValueError("No messages found in conversation")
    
    classification = classify_messages_ollama(messages, few_shot_examples, model, max_retries, ollama_url)
    
    # Add metadata
    classification['classificationMetadata'] = {
        'model': model,
        'provider': 'ollama',
        'version': 'reduced-roles-v1.0',
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return classification


def classify_batch_ollama(
    input_file: Path,
    output_file: Path,
    few_shot_examples_file: Optional[Path] = None,
    model: str = "qwen2.5:7b",
    ollama_url: str = "http://localhost:11434"
):
    """Classify a batch of conversations"""
    
    # Load conversations
    with open(input_file) as f:
        conversations = json.load(f)
    
    # Load few-shot examples
    few_shot_examples = ""
    if few_shot_examples_file and few_shot_examples_file.exists():
        few_shot_examples = load_few_shot_examples(few_shot_examples_file)
    
    print(f"Classifying {len(conversations)} conversations using model: {model}")
    print(f"Few-shot examples: {'Yes' if few_shot_examples else 'No'}")
    print()
    
    results = []
    for i, conv in enumerate(conversations, 1):
        conv_id = conv.get('id', f'conv-{i}')
        print(f"[{i}/{len(conversations)}] Classifying {conv_id}...", end=" ", flush=True)
        
        try:
            classification = classify_conversation_ollama(
                conv,
                few_shot_examples,
                model,
                ollama_url
            )
            
            # Add classification to conversation
            result = conv.copy()
            result['classification'] = classification
            
            results.append(result)
            print("✓")
        
        except Exception as e:
            print(f"✗ Error: {e}")
            # Continue with next conversation
            continue
    
    # Save results
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Saved {len(results)} classifications to {output_file}")
    return results


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python classifier-ollama-reduced-roles.py <input.json> <output.json> [--few-shot-examples <examples.json>] [--model <model_name>]")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    
    # Parse optional arguments
    few_shot_examples_file = None
    model = "qwen2.5:7b"
    
    if "--few-shot-examples" in sys.argv:
        idx = sys.argv.index("--few-shot-examples")
        few_shot_examples_file = Path(sys.argv[idx + 1])
    
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model = sys.argv[idx + 1]
    
    classify_batch_ollama(input_file, output_file, few_shot_examples_file, model)

