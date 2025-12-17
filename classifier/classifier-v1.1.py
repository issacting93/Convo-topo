#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.1 (Python)

Changes from v1.0:
- Roles (dim 9-10) output probability distributions
- All dimensions require evidence quotes  
- Alternative label required when confidence < 0.6
- Windowed classification for temporal dynamics

Usage:
    python classifier-v1.1.py conversations.json output.json
    python classifier-v1.1.py conversations.json output.json --windowed --validation 30
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime
from typing import Optional

import anthropic

# ============================================================================
# PROMPT v1.1
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
# UTILITIES
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
    
    # Ensure final messages captured
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
    # Normalize role distributions
    if "humanRole" in data and "distribution" in data["humanRole"]:
        data["humanRole"]["distribution"] = normalize_dist(data["humanRole"]["distribution"])
    if "aiRole" in data and "distribution" in data["aiRole"]:
        data["aiRole"]["distribution"] = normalize_dist(data["aiRole"]["distribution"])
    
    # Check for missing alternatives on low confidence
    dims = ["interactionPattern", "powerDynamics", "emotionalTone", "engagementStyle",
            "knowledgeExchange", "conversationPurpose", "topicDepth", "turnTaking"]
    
    for dim in dims:
        if dim in data:
            d = data[dim]
            if d.get("confidence", 1.0) < 0.6 and not d.get("alternative"):
                print(f"Warning: {dim} has low confidence but no alternative")
    
    return data


# ============================================================================
# CLASSIFIER
# ============================================================================

def classify_messages(client: anthropic.Anthropic, messages: list, 
                     model: str = "claude-sonnet-4-20250514") -> dict:
    """Classify a single message sequence"""
    formatted = format_conversation(messages)
    prompt = CLASSIFICATION_PROMPT + formatted
    
    response = client.messages.create(
        model=model,
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    text = response.content[0].text
    json_text = extract_json(text)
    data = json.loads(json_text)
    return validate_classification(data)


def classify_conversation(client: anthropic.Anthropic, conversation: dict,
                         model: str = "claude-sonnet-4-20250514",
                         windowed: bool = False,
                         window_size: int = 6,
                         window_stride: int = 2) -> dict:
    """Classify a full conversation, optionally with windows"""
    start_time = time.time()
    
    # Full conversation classification
    classification = classify_messages(client, conversation["messages"], model)
    
    result = {
        **conversation,
        "classification": classification,
        "classificationMetadata": {
            "model": model,
            "timestamp": datetime.now().isoformat(),
            "promptVersion": "1.1.0",
            "processingTimeMs": int((time.time() - start_time) * 1000),
            "windowed": windowed
        }
    }
    
    # Windowed classification
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
                time.sleep(0.3)  # Rate limit
            except Exception as e:
                print(f"\nError on window {i}: {e}")
        
        result["windowedClassifications"] = windowed_results
        result["classificationMetadata"]["windowSize"] = window_size
        result["classificationMetadata"]["windowStride"] = window_stride
    
    return result


def classify_batch(conversations: list, model: str = "claude-sonnet-4-20250514",
                  windowed: bool = False, window_size: int = 6, 
                  window_stride: int = 2, delay_ms: int = 600) -> list:
    """Classify multiple conversations"""
    client = anthropic.Anthropic()
    results = []
    total = len(conversations)
    
    for i, convo in enumerate(conversations):
        try:
            result = classify_conversation(
                client, convo, model, windowed, window_size, window_stride
            )
            results.append(result)
        except Exception as e:
            print(f"\nError on {convo.get('id', i)}: {e}")
            results.append({
                **convo,
                "classification": None,
                "classificationError": str(e),
                "classificationMetadata": {
                    "model": model,
                    "timestamp": datetime.now().isoformat(),
                    "promptVersion": "1.1.0",
                    "processingTimeMs": 0,
                    "windowed": windowed
                }
            })
        
        pct = int((i + 1) / total * 100)
        print(f"\rProgress: {i + 1}/{total} ({pct}%)", end="", flush=True)
        
        if i < total - 1:
            time.sleep(delay_ms / 1000)
    
    print()
    return results


# ============================================================================
# SUMMARY STATS
# ============================================================================

def generate_summary(results: list) -> dict:
    """Generate summary statistics"""
    categorical_dims = [
        "interactionPattern", "powerDynamics", "emotionalTone", "engagementStyle",
        "knowledgeExchange", "conversationPurpose", "topicDepth", "turnTaking"
    ]
    
    summary = {
        "totalConversations": len(results),
        "successfulClassifications": sum(1 for r in results if r.get("classification")),
        "failedClassifications": sum(1 for r in results if not r.get("classification")),
        "abstainedClassifications": sum(1 for r in results 
                                        if r.get("classification", {}).get("abstain")),
        "promptVersion": "1.1.0",
        "categoricalDimensions": {},
        "roleDimensions": {}
    }
    
    # Categorical dimensions
    for dim in categorical_dims:
        valid = [r for r in results if r.get("classification", {}).get(dim)]
        
        categories = {}
        confidences = []
        low_conf = {"count": 0, "withAlternative": 0}
        
        for r in valid:
            d = r["classification"][dim]
            cat = d["category"]
            categories[cat] = categories.get(cat, 0) + 1
            confidences.append(d["confidence"])
            if d["confidence"] < 0.6:
                low_conf["count"] += 1
                if d.get("alternative"):
                    low_conf["withAlternative"] += 1
        
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        summary["categoricalDimensions"][dim] = {
            "distribution": categories,
            "avgConfidence": round(avg_conf, 2),
            "lowConfidenceCount": low_conf["count"],
            "lowConfidenceWithAlternative": low_conf["withAlternative"]
        }
    
    # Role dimensions
    role_dims = {
        "humanRole": ["seeker", "learner", "director", "collaborator", "sharer", "challenger"],
        "aiRole": ["expert", "advisor", "facilitator", "reflector", "peer", "affiliative"]
    }
    
    for dim, roles in role_dims.items():
        valid = [r for r in results 
                 if r.get("classification", {}).get(dim, {}).get("distribution")]
        
        mean_dist = {role: 0 for role in roles}
        dominant_counts = {role: 0 for role in roles}
        confidences = []
        
        for r in valid:
            d = r["classification"][dim]
            confidences.append(d["confidence"])
            
            for role in roles:
                mean_dist[role] += d["distribution"].get(role, 0)
            
            dominant = argmax_dist(d["distribution"])
            dominant_counts[dominant] = dominant_counts.get(dominant, 0) + 1
        
        if valid:
            mean_dist = {k: round(v / len(valid), 3) for k, v in mean_dist.items()}
        
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        summary["roleDimensions"][dim] = {
            "meanDistribution": mean_dist,
            "dominantRoleCounts": dominant_counts,
            "avgConfidence": round(avg_conf, 2)
        }
    
    # Windowed stats
    windowed = [r for r in results if r.get("windowedClassifications")]
    if windowed:
        summary["windowedStats"] = {
            "conversationsWithWindows": len(windowed),
            "avgWindowsPerConversation": round(
                sum(len(r["windowedClassifications"]) for r in windowed) / len(windowed), 1
            )
        }
    
    return summary


# ============================================================================
# VALIDATION EXPORT
# ============================================================================

def export_validation(results: list, n: int = 30) -> list:
    """Export stratified sample for validation"""
    valid = [r for r in results if r.get("classification")]
    
    # Sort by role confidence
    def avg_role_conf(r):
        hc = r["classification"].get("humanRole", {}).get("confidence", 0.5)
        ac = r["classification"].get("aiRole", {}).get("confidence", 0.5)
        return (hc + ac) / 2
    
    sorted_results = sorted(valid, key=avg_role_conf)
    
    third = len(sorted_results) // 3
    n_each = n // 3 + 1
    
    sample = (
        sorted_results[:n_each] +
        sorted_results[third:third + n_each] +
        sorted_results[-n_each:]
    )[:n]
    
    return [
        {
            "id": r.get("id", ""),
            "messages": [
                {"role": m["role"], "content": m["content"][:600] + ("..." if len(m["content"]) > 600 else "")}
                for m in r["messages"]
            ],
            "llmClassification": {
                **r["classification"],
                "_humanRoleDominant": argmax_dist(r["classification"]["humanRole"]["distribution"]),
                "_aiRoleDominant": argmax_dist(r["classification"]["aiRole"]["distribution"])
            },
            "humanAnnotation": {
                "interactionPattern": {"category": "", "notes": ""},
                "powerDynamics": {"category": "", "notes": ""},
                "emotionalTone": {"category": "", "notes": ""},
                "engagementStyle": {"category": "", "notes": ""},
                "knowledgeExchange": {"category": "", "notes": ""},
                "conversationPurpose": {"category": "", "notes": ""},
                "topicDepth": {"category": "", "notes": ""},
                "turnTaking": {"category": "", "notes": ""},
                "humanRole": {"dominantRole": "", "secondaryRole": "", "confidence": None, "notes": ""},
                "aiRole": {"dominantRole": "", "secondaryRole": "", "confidence": None, "notes": ""},
                "overallNotes": ""
            },
            "annotatorId": "",
            "annotationDate": ""
        }
        for r in sample
    ]


# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    
    # Parse args
    windowed = "--windowed" in sys.argv
    validation_n = 0
    if "--validation" in sys.argv:
        idx = sys.argv.index("--validation")
        validation_n = int(sys.argv[idx + 1])
    
    model = "claude-sonnet-4-20250514"
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
    
    # Load
    print(f"Loading from {input_path}...")
    with open(input_path) as f:
        conversations = json.load(f)
    print(f"Found {len(conversations)} conversations")
    
    if windowed:
        print(f"Windowed mode: size={window_size}, stride={window_stride}")
    
    # Classify
    print(f"\nClassifying with {model}...\n")
    results = classify_batch(
        conversations, model, windowed, window_size, window_stride
    )
    
    # Save
    print(f"\nWriting to {output_path}...")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    # Summary
    summary = generate_summary(results)
    summary_path = output_path.with_name(output_path.stem + "-summary.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Summary: {summary_path}")
    
    # Validation
    if validation_n > 0:
        validation_data = export_validation(results, validation_n)
        validation_path = output_path.with_name(output_path.stem + "-validation.json")
        with open(validation_path, "w") as f:
            json.dump(validation_data, f, indent=2)
        print(f"Validation: {validation_path}")
    
    print("\n=== Summary ===\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
