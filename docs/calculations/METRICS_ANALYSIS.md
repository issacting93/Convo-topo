# Conversation Metrics Analysis

## Current Metrics: Overview

### X-Axis: FUNCTIONAL ↔ SOCIAL

**Label**: "COMMUNICATION FUNCTION"  
**Range**: 0.0 (functional) ↔ 1.0 (social)  
**Definition**:
- **Functional (0.0-0.4)**: Task-oriented, instrumental, problem-solving conversations
- **Social (0.6-1.0)**: Relational, expressive, emotion-focused conversations

**Mapping**: Uses priority-based fallback system:
1. Human role distribution (primary)
2. Conversation purpose (fallback)
3. Knowledge exchange type (fallback)

See `docs/DIMENSION_MAPPING.md` for detailed mapping logic.

---

### Y-Axis: STRUCTURED ↔ EMERGENT

**Label**: "CONVERSATION STRUCTURE"  
**Range**: 0.0 (structured) ↔ 1.0 (emergent)  
**Definition**:
- **Structured (0.0-0.4)**: Directive, prescriptive, predictable conversation patterns
- **Emergent (0.6-1.0)**: Exploratory, spontaneous, open-ended conversation patterns

**Mapping**: Uses priority-based fallback system:
1. AI role distribution (primary)
2. Interaction pattern (fallback)
3. Engagement style (fallback)

See `docs/DIMENSION_MAPPING.md` for detailed mapping logic.

---

### Z-Axis: AFFECTIVE/EVALUATIVE LENS (PAD Model)

**Label**: "AFFECTIVE/EVALUATIVE LENS (PAD)"  
**Range**: 0.0 (low intensity) ↔ 1.0 (high intensity)  
**Definition**: Emotional intensity based on PAD (Pleasure-Arousal-Dominance) model

**Formula**: `emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4`

**Components**:
- **Pleasure (P)**: 0-1, valence (0 = frustration, 1 = satisfaction)
- **Arousal (A)**: 0-1, activation level (0 = calm, 1 = agitated)
- **Dominance (D)**: 0-1, sense of control (0 = passive, 1 = in control) - *calculated but not used in intensity formula*

**Visualization**: Controls marker heights on the terrain
- High intensity (frustration) = peaks
- Low intensity (satisfaction/affiliation) = valleys

**Generation**: 
- **Current**: Rule-based pattern matching (`scripts/add-pad-to-data.js`)
- **Available**: LLM-based analysis via `scripts/generate-pad-with-llm-direct.py` (see `docs/API_OPTIONS.md`)

**Data Location**: Stored in each message as `messages[].pad` object

See `docs/research/Z_AXIS_IMPLEMENTATION_PLAN.md` and `docs/API_OPTIONS.md` for details.

### Recommended Improvements

## 1. Better Metric Names

### Option A: Communication Theory Framework
- **X-Axis**: `taskOrientation` or `communicativeMode`
  - Labels: **INFORMATIONAL ↔ INTERPERSONAL**
  - 0 = Informational (task-focused, factual, goal-oriented)
  - 1 = Interpersonal (relational, social bonding, emotional)

- **Z-Axis**: `conversationalStructure` or `discourseMode`
  - Labels: **EXPLORATORY ↔ DIRECTIVE**
  - 0 = Exploratory (open-ended, questioning, discovery)
  - 1 = Directive (declarative, commanding, structured)

### Option B: Discourse Analysis Framework
- **X-Axis**: `purpose`
  - Labels: **TASK ↔ SOCIAL**
  - More direct than current "tension"

- **Z-Axis**: `initiative`
  - Labels: **REACTIVE ↔ PROACTIVE**
  - 0 = Reactive (responding, following up)
  - 1 = Proactive (initiating, driving conversation)

### Option C: Conversational AI Framework (Recommended)
- **X-Axis**: `modality`
  - Labels: **FUNCTIONAL ↔ RELATIONAL**
  - Keep functional, but use "relational" instead of "social"
  - 0 = Functional (task completion, information exchange)
  - 1 = Relational (social connection, rapport building)

- **Z-Axis**: `discoursePattern`
  - Labels: **EXPLORATORY ↔ DIRECTIVE**
  - 0 = Exploratory (questions, open-ended, discovery)
  - 1 = Directive (statements, commands, structured)

## 2. Better Analysis Methods

### Current Limitations:
1. Simple keyword matching is limited
2. Doesn't account for context
3. Doesn't use linguistic features effectively
4. No consideration of conversation history semantics

### Improved Analysis Approaches:

#### A. Linguistic Feature Analysis
```javascript
function analyzeModality(content) {
  // Task-oriented indicators
  const taskMarkers = {
    questions: /\b(what|how|when|where|why|which|who)\b/i,
    imperatives: /\b(do|make|create|build|find|get|show|tell|explain)\b/i,
    goalWords: /\b(need|want|must|should|have to|goal|objective|target)\b/i,
  };
  
  // Relational indicators
  const relationalMarkers = {
    emotions: /\b(feel|love|like|enjoy|excited|happy|sad|worry|hope|wish)\b/i,
    personal: /\b(I|me|my|myself|personal|myself)\b/i,
    social: /\b(friend|family|together|share|connect|bond)\b/i,
    politeness: /\b(please|thanks|thank|appreciate|sorry)\b/i,
  };
  
  // Calculate scores
  let taskScore = 0;
  let relationalScore = 0;
  
  Object.values(taskMarkers).forEach(pattern => {
    if (pattern.test(content)) taskScore++;
  });
  
  Object.values(relationalMarkers).forEach(pattern => {
    if (pattern.test(content)) relationalScore++;
  });
  
  // Normalize to 0-1 range
  const total = taskScore + relationalScore;
  const modality = total > 0 ? relationalScore / total : 0.5;
  
  return Math.max(0, Math.min(1, modality));
}
```

#### B. Conversation Structure Analysis
```javascript
function analyzeDiscoursePattern(content, history) {
  const isQuestion = content.trim().endsWith('?');
  const isCommand = /^(do|make|create|tell|show|help|give)/i.test(content.trim());
  const isStatement = !isQuestion && content.length > 10;
  
  // Sentence type analysis
  let exploratoryScore = 0;
  let directiveScore = 0;
  
  if (isQuestion) {
    exploratoryScore = 0.7;
    // Wh-questions are more exploratory
    if (/^(what|how|why|when|where)/i.test(content)) {
      exploratoryScore = 0.9;
    }
  }
  
  if (isCommand || isStatement) {
    directiveScore = 0.6;
    // Longer statements are more directive
    if (content.length > 30) directiveScore += 0.2;
  }
  
  // Consider conversation context
  // Early in conversation = more exploratory
  const contextFactor = Math.max(0, 1 - (history.length * 0.1));
  exploratoryScore *= contextFactor;
  
  // Normalize
  const total = exploratoryScore + directiveScore;
  const discoursePattern = total > 0 ? directiveScore / total : 0.5;
  
  return Math.max(0, Math.min(1, discoursePattern));
}
```

#### C. Sentiment & Emotion Analysis
Could add a third dimension or enrich existing metrics:
- **Sentiment**: Negative ↔ Positive
- **Arousal**: Calm ↔ Excited
- **Valence**: Unpleasant ↔ Pleasant

#### D. Conversational Turn Analysis
- **Initiative**: Who's driving the conversation?
- **Turn-taking patterns**: Balanced ↔ Dominated
- **Topic shift**: Stable ↔ Dynamic

## Current Implementation Status

### ✅ Implemented

1. **X/Y Axis Mapping**: Uses classification-based mapping (see `docs/DIMENSION_MAPPING.md`)
   - Role distributions (primary method)
   - Fallback to categorical classifications
   - Confidence-weighted positioning

2. **Z-Axis (PAD)**: Uses PAD model for emotional intensity
   - Stored in message `pad` objects
   - Formula: `(1 - pleasure) * 0.6 + arousal * 0.4`
   - Controls marker heights in 3D visualization

3. **UI Labels**: 
   - X-axis: "COMMUNICATION FUNCTION"
   - Y-axis: "CONVERSATION STRUCTURE"
   - Z-axis: "AFFECTIVE/EVALUATIVE LENS (PAD)"

---

## Recommendations for Future Improvements

### PAD Generation (High Priority)

1. **LLM-Based PAD Generation** (available via `scripts/generate-pad-with-llm-direct.py`, see `docs/API_OPTIONS.md`)
   - Better multilingual support
   - Context-aware emotional analysis
   - More nuanced frustration/satisfaction detection

2. **PAD Formula Refinement**
   - Consider renaming "emotionalIntensity" to "emotionalFriction" or "frustrationIntensity" (current formula is frustration-focused)
   - Document why dominance is calculated but unused
   - Consider alternative formulas for positive intensity (excitement, satisfaction)

### X/Y Axis Mapping (Lower Priority)

Current implementation is working well, but potential improvements:
- More sophisticated role-based weighting
- Consider conversation-level confidence scores in positioning
- A/B testing different mapping algorithms

### Long-term Improvements:
1. **Use NLP libraries** (if adding to bundle is acceptable):
   - `compromise` or `natural` for better text analysis
   - Sentiment analysis libraries
   
2. **Machine learning approach**:
   - Train a simple classifier on labeled conversation data
   - Use embeddings for semantic similarity

3. **Consider additional dimensions**:
   - Formality level
   - Topic coherence
   - Engagement level

## 4. Alternative Metrics to Consider

### Conversation Dynamics:
- **Turn dominance**: Who talks more?
- **Topic coherence**: How related are topics?
- **Response time**: Fast ↔ Slow (if available)

### Content Analysis:
- **Specificity**: General ↔ Specific
- **Certainty**: Uncertain ↔ Certain
- **Polite**: Informal ↔ Formal

### Social Dynamics:
- **Power**: Equal ↔ Hierarchical
- **Intimacy**: Distant ↔ Close
- **Conflict**: Agreeable ↔ Disputational

