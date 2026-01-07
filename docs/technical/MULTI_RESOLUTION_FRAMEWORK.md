# Multi-Resolution Analysis Framework

## Overview

The Cartography system uses a **multi-resolution analytical pipeline** for modeling human–AI interaction as dynamic relational positioning rather than static role assignment.

## Levels of Analysis

### Level 1 — Micro (Utterance-Level Signals)

**Unit of analysis:** Sentence / turn  
**Status:** Not yet implemented  
**What would be observable:**
- Linguistic markers (hedging, boosting, imperatives)
- Politeness strategies
- Self-disclosure
- Alignment cues
- Syntactic/stylistic features
- PAD-like affective estimates

**What this level can support:**
- Weak hypotheses about stance (tentative vs assertive)
- Directional movement (toward/away from social or functional)

**What it cannot support:**
- Stable roles
- Personality claims

> Interpretation at this level must be treated as **local and provisional**.

---

### Level 2 — Meso (Interactional Patterns)

**Unit of analysis:** Short conversational segments (3–10 turns)  
**Status:** Not yet implemented  
**What would emerge:**
- Turn-taking symmetry/asymmetry
- Linguistic convergence or divergence
- Power dynamics (directive vs affiliative drift)
- Task framing style (exploratory vs instrumental)

**What this level can support:**
- Interactional modes (coaching, troubleshooting, affiliative support)
- Transitional roles ("becoming advisor", "slipping into confessional")

**Key point:** Roles here are **trajectory-based**, not labels.

---

### Level 3 — Macro (Task & Resolution) ⭐ **CURRENT CLASSIFIER**

**Unit of analysis:** Whole interaction / episode (ONE conversation at a time)  
**Status:** ✅ **Implemented**  
**What is analyzed:**
- Task intent
- How it was communicated
- Whether and how it resolved
- Emotional aftertaste (confidence, relief, frustration)
- Interaction patterns across the **entire conversation** (not segments)
- Power dynamics across the whole episode
- Role distributions with confidence scores

**What this level supports:**
- Role attribution with confidence bounds
- Analysis of complete conversational episodes
- Stable role claims (minimum resolution for this)

**What it does NOT do:**
- Does NOT analyze segments within conversations (that's Meso)
- Does NOT compare across multiple conversations (that's Meta)
- Analyzes ONE conversation at a time, but as a complete whole

This is the **minimum level** at which stable role claims become defensible.

**Current Implementation:**
- `classifier-huggingface.py` - Analyzes whole conversations
- `classifier-openai.py` - Alternative implementation
- Outputs 10-dimensional classification with confidence scores
- Role distributions (humanRole, aiRole) with probability weights

---

### Level 4 — Meta (Cross-Conversation Patterns)

**Unit of analysis:** Corpus of conversations (MANY conversations together)  
**Status:** Future work  
**What would emerge:**
- Recurring conversational forms
- Topic–role correlations
- Drift patterns across domains (e.g. work vs intimacy)
- Statistical regularities across episodes

**Key distinction from Macro:**
- Macro: Analyzes ONE conversation as a whole
- Meta: Analyzes MANY conversations together to find patterns

This is where the **"atlas"** becomes meaningful.

---

## Summary Table

| Level | Resolution | Status | Supports | Cannot Support |
|-------|------------|--------|----------|----------------|
| Micro | Sentence | 🔴 Not implemented | Stance, tone | Roles, personality |
| Meso | Segment (3-10 turns) | 🔴 Not implemented | Interaction modes | Stable identity |
| Macro | **Whole episode** (one conversation) | ✅ **Implemented** | Role hypotheses with confidence | Cross-conversation patterns |
| Meta | **Corpus** (many conversations) | 🔴 Not implemented | Patterns, typologies | Individual truth |

---

## Current Classifier Output (Level 3 - Macro)

The current classifier operates at **Level 3 (Macro)** and produces:

### Dimensions Analyzed

1. **Interaction Pattern** - Overall conversational structure
2. **Power Dynamics** - Who leads the conversation
3. **Emotional Tone** - Affective quality
4. **Engagement Style** - How parties engage
5. **Knowledge Exchange** - Type of information shared
6. **Conversation Purpose** - Primary goal
7. **Topic Depth** - Depth of exploration
8. **Turn Taking** - Message length balance
9. **Human Role Distribution** - Probabilistic role assignment
10. **AI Role Distribution** - Probabilistic role assignment

### Key Features

- **Confidence scores** for each dimension (0.0-1.0)
- **Evidence quotes** from the conversation
- **Rationale** for each classification
- **Alternative categories** when confidence < 0.6
- **Role distributions** that sum to exactly 1.0

### Output Format

```json
{
  "abstain": false,
  "interactionPattern": {
    "category": "question-answer",
    "confidence": 0.85,
    "evidence": ["..."],
    "rationale": "...",
    "alternative": null
  },
  "humanRole": {
    "distribution": {
      "seeker": 0.6,
      "learner": 0.3,
      "director": 0.1,
      ...
    },
    "confidence": 0.8,
    "evidence": [...],
    "rationale": "..."
  },
  ...
}
```

---

## Visual Grammar Principles

### 1. Roles are Regions, Not Points
- No single dot = "advisor"
- Instead: **probabilistic regions** in space
- Current implementation: Role distributions encode this

### 2. Confidence is Visible
- Low confidence → diffuse, translucent forms
- High confidence → tighter contours
- Current implementation: Confidence scores (0.0-1.0) for each dimension

### 3. Function ↔ Social Axis
- Conversations trace **paths**, not states
- Current implementation: Captured in interaction patterns and engagement styles

### 4. Resolution Slider (Future)
- Micro → Meso → Macro → Meta
- As resolution increases: noise collapses, patterns stabilize
- Current implementation: Fixed at Macro level

---

## Methods Section

### Step 1 — Data Segmentation ✅
- Conversations analyzed as whole episodes (Macro level)

### Step 2 — Linguistic Marker Extraction 🔴
- Not yet implemented (would be Micro level)

### Step 3 — Temporal Alignment Analysis 🔴
- Not yet implemented (would be Meso level)

### Step 4 — Episode-Level Synthesis ✅
- **Current classifier implements this**
- Integrates:
  - Task framing
  - Outcome/resolution
  - Generates role hypotheses with confidence scores

### Step 5 — Cross-Conversation Clustering 🔴
- Not yet implemented (would be Meta level)

---

## Validation Strategy

### Current Approach
- Classification with confidence bounds
- Evidence quotes for traceability
- Alternative categories when uncertain
- Abstain option for ambiguous cases

### Future Validation
- Human annotation at multiple resolutions
- Inter-rater agreement on:
  - Directional movement
  - Role confidence (not role name)
- Stress-test single-message attribution (expected to fail)

---

## What This System Is

**Not:**
- A role taxonomy
- A personality detector

**Is:**
- A **cognitive tool for seeing how roles are inferred**
- A system that treats **uncertainty as first-class**
- A reframing of human–AI interaction from identity → positioning

---

## Next Steps

### Immediate (Level 3 - Macro)
- ✅ Classifier implementation
- ✅ Confidence scoring
- ✅ Role distributions
- 🔄 Improve JSON reliability with local models
- 🔄 Visual representation of confidence regions

### Future Work

**Level 1 (Micro):**
- Linguistic marker extraction
- Utterance-level PAD estimates
- Stance detection

**Level 2 (Meso):**
- Segment-based analysis (3-10 turn windows)
- Trajectory tracking
- Transitional role detection

**Level 4 (Meta):**
- Cross-conversation clustering
- Pattern recognition
- Typology generation

---

## References

This framework aligns with:
- Discourse Interaction Studies (DIS)
- Pictorial representation of uncertainty
- Dynamic relational positioning theory
- Multi-resolution analysis in computational linguistics

