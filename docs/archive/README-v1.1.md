# Conversation Metadata Classifier v1.1

LLM-based classification of human-AI conversations across 10 dimensions for the Conversational Topography thesis project.

## What's New in v1.1

| Feature | v1.0 | v1.1 |
|---------|------|------|
| Role dimensions | Single category | **Probability distributions** |
| Evidence | None | **Required quotes per dimension** |
| Uncertainty | Confidence only | **Alternative labels when conf < 0.6** |
| Temporal dynamics | None | **Windowed classification** |
| Validation | JSON schema | **Zod runtime validation** |
| Role taxonomy | 6 human, 6 AI | **Revised: reduced overlap** |

### Taxonomy Changes

**Human Role** (renamed for clarity):
- `initiator` → `director` (specifies deliverables/constraints)
- Added explicit tie-breaker rules

**AI Role** (reduced anthropomorphism):
- `listener` → `reflector` (paraphrases/validates)
- `companion` → `affiliative` (warmth beyond task)

---

## Quick Start

### Python

```bash
pip install anthropic
export ANTHROPIC_API_KEY=your-key

# Basic classification
python classifier-v1.1.py conversations.json output.json

# With windowed analysis (for role drift visualization)
python classifier-v1.1.py conversations.json output.json --windowed

# With validation export
python classifier-v1.1.py conversations.json output.json --windowed --validation 30
```

### TypeScript

```bash
npm install @anthropic-ai/sdk zod typescript ts-node
export ANTHROPIC_API_KEY=your-key

npx ts-node classifier-v1.1.ts conversations.json output.json --windowed --validation 30
```

---

## Output Schema v1.1

### Categorical Dimensions (1-8)

```json
{
  "interactionPattern": {
    "category": "question-answer",
    "confidence": 0.85,
    "evidence": ["What does X mean?", "Can you explain Y?"],
    "rationale": "Human asks 5 questions, AI provides detailed answers",
    "alternative": null
  }
}
```

### Distribution-Based Roles (9-10)

```json
{
  "humanRole": {
    "distribution": {
      "seeker": 0.55,
      "learner": 0.25,
      "director": 0.10,
      "collaborator": 0.05,
      "sharer": 0.0,
      "challenger": 0.05
    },
    "confidence": 0.75,
    "evidence": [
      {"role": "seeker", "quote": "What is the difference between X and Y?"},
      {"role": "learner", "quote": "So if I use X, then Y happens?"}
    ],
    "rationale": "Primarily information-seeking with verification behavior",
    "alternative": null
  }
}
```

### Windowed Output

When using `--windowed`, each conversation includes temporal segments:

```json
{
  "windowedClassifications": [
    {
      "windowIndex": 0,
      "startMessage": 0,
      "endMessage": 5,
      "classification": { /* full classification for messages 0-5 */ }
    },
    {
      "windowIndex": 1,
      "startMessage": 2,
      "endMessage": 7,
      "classification": { /* full classification for messages 2-7 */ }
    }
  ]
}
```

This enables visualization of how roles shift during conversation—critical for your "topography" framing.

---

## Windowed Classification for Role Drift

The windowed approach is especially powerful for Conversational Topography because it captures **how roles evolve**:

```
Window 0 [msg 0-5]:  human=seeker(0.8), ai=expert(0.7)
Window 1 [msg 2-7]:  human=seeker(0.6)+learner(0.3), ai=expert(0.5)+advisor(0.3)
Window 2 [msg 4-9]:  human=director(0.5)+collaborator(0.4), ai=advisor(0.6)
Window 3 [msg 6-11]: human=collaborator(0.7), ai=peer(0.5)+advisor(0.3)
```

This progression tells a story: user starts seeking information, begins learning, then takes directive control, and finally enters collaborative mode.

### Using Windowed Data for Terrain

```typescript
// Map role distributions to terrain parameters
function windowToTerrain(window: WindowedClassification): TerrainParams {
  const hr = window.classification.humanRole.distribution;
  const ar = window.classification.aiRole.distribution;
  
  return {
    elevation: hr.director + hr.challenger,  // Human control → height
    roughness: ar.expert + ar.advisor,       // AI authority → texture
    flow: hr.collaborator + ar.peer,         // Mutual engagement → smoothness
    // etc.
  };
}
```

---

## Validation Workflow

### 1. Generate Stratified Sample

```bash
python classifier-v1.1.py data.json output.json --validation 30
```

Creates `output-validation.json` with:
- 10 low-confidence cases (hardest to classify)
- 10 medium-confidence cases  
- 10 high-confidence cases

### 2. Annotation Template

Each validation item includes:

```json
{
  "humanAnnotation": {
    "interactionPattern": {"category": "", "notes": ""},
    "humanRole": {
      "dominantRole": "",      // Primary role
      "secondaryRole": "",     // Secondary if mixed
      "confidence": null,      // Annotator confidence
      "notes": ""
    },
    "aiRole": {
      "dominantRole": "",
      "secondaryRole": "",
      "confidence": null,
      "notes": ""
    },
    "overallNotes": ""
  }
}
```

### 3. Calculate Agreement

```python
from sklearn.metrics import cohen_kappa_score

# For categorical dimensions
human_labels = [item["humanAnnotation"]["interactionPattern"]["category"] 
                for item in validation_data]
llm_labels = [item["llmClassification"]["interactionPattern"]["category"] 
              for item in validation_data]

kappa = cohen_kappa_score(human_labels, llm_labels)
print(f"Interaction Pattern κ: {kappa:.2f}")

# For role dimensions (compare dominant roles)
human_dom = [item["humanAnnotation"]["humanRole"]["dominantRole"] 
             for item in validation_data]
llm_dom = [item["llmClassification"]["_humanRoleDominant"] 
           for item in validation_data]

kappa_role = cohen_kappa_score(human_dom, llm_dom)
print(f"Human Role (dominant) κ: {kappa_role:.2f}")
```

---

## For Your DIS Paper

### Methodology Paragraph (Drop-in)

> **Conversation Classification**
> 
> We developed a structured classification system for 10 conversational dimensions, operationalized through LLM-based coding. Dimensions 1–8 (interaction pattern, power dynamics, emotional tone, engagement style, knowledge exchange, conversation purpose, topic depth, turn taking) were classified as single categorical labels. Dimensions 9–10 (human role, AI role) were classified as probability distributions across six role categories each, reflecting the mixed nature of interactional positioning.
>
> Classification was performed using Claude 3.5 Sonnet with a structured prompt requiring (a) category selection with confidence scores, (b) verbatim evidence quotes from the conversation, and (c) alternative category identification when confidence fell below 0.6. The prompt included explicit category definitions, decision signals, and tie-breaking rules to ensure consistent operationalization (see Supplementary Materials).
>
> To capture conversational dynamics, we employed windowed classification: conversations were segmented into overlapping 6-message windows (stride 2), with each window independently classified. This enabled tracking of role distribution shifts across conversation phases.
>
> **Validation**: Two researchers independently coded 30 conversations (stratified by LLM confidence). Inter-rater reliability was κ = X.XX for categorical dimensions and κ = X.XX for dominant role identification. LLM-human agreement was κ = X.XX, comparable to human-human agreement, supporting the validity of automated classification.

### Transparency Checklist

For your supplementary materials:

- [ ] Complete classification prompt (v1.1)
- [ ] All category definitions with signals
- [ ] Tie-breaker rules for ambiguous cases
- [ ] Raw confidence score distributions
- [ ] Validation sample with human annotations
- [ ] Inter-rater reliability calculations

---

## Cost Estimate

| Configuration | API Calls | Est. Cost |
|--------------|-----------|-----------|
| 145 convos, no windows | 145 | ~$1.00 |
| 145 convos, windowed (avg 4 windows) | ~725 | ~$5.00 |
| + 30 validation samples | +30 | ~$0.20 |

*Using Claude 3.5 Sonnet pricing*

---

## Troubleshooting

### JSON Parse Errors

The classifier handles markdown fences, but if you get parse errors:

```python
# Debug: print raw response
response = client.messages.create(...)
print(response.content[0].text)  # Check format
```

### Distribution Not Summing to 1.0

The classifier auto-normalizes, but warns if drift > 0.05:

```
Warning: humanRole distribution did not sum to 1, normalized
```

This is usually fine—minor floating point drift.

### Low Confidence Across Board

If most classifications are < 0.6 confidence:

1. Conversations may be genuinely ambiguous
2. Check conversation length (< 4 messages = low signal)
3. Review evidence quotes—are they meaningful?

### Rate Limiting

For large batches or windowed mode:

```bash
# Reduce concurrency
npx ts-node classifier-v1.1.ts data.json out.json --concurrency 1
```

---

## Files

| File | Description |
|------|-------------|
| `classifier-v1.1.py` | Python classifier with windowing |
| `classifier-v1.1.ts` | TypeScript classifier with Zod validation |
| `classifier.py` | v1.0 Python (simpler, single-label roles) |
| `conversation-classifier.ts` | v1.0 TypeScript |
| `metadata-formulas-revised.md` | Full methodology documentation |

---

## Citation

If you use this classifier:

```bibtex
@software{conversational_topography_classifier,
  title = {Conversation Metadata Classifier},
  author = {[Your Name]},
  year = {2024},
  version = {1.1.0},
  note = {LLM-based classification system for human-AI conversational dynamics}
}
```
