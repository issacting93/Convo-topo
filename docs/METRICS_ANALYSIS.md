# Conversation Metrics Analysis

## Current Metrics: Issues & Improvements

### Current Implementation

**X-Axis: FUNCTIONAL ↔ SOCIAL** (currently called "tension")
- Current name: "tension" (0 = functional, 1 = social)
- Problem: "Tension" implies conflict/stress, but the metric actually measures task-oriented vs relational communication
- Current analysis: Simple keyword matching (functional vs social indicators)

**Z-Axis: EMERGENT ↔ PRESCRIBED** (currently called "delegation")
- Current name: "delegation" (0 = emergent, 1 = prescribed)
- Problem: "Delegation" implies authority transfer, not conversation structure
- Current analysis: Based on question vs statement patterns

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

## 3. Recommendations

### Immediate Improvements:
1. **Rename metrics** to clearer terms:
   - `tension` → `modality` or `taskOrientation`
   - `delegation` → `discoursePattern` or `conversationalStructure`

2. **Improve analysis function** with:
   - Better regex patterns
   - Context awareness (conversation history)
   - Multiple linguistic features
   - Normalization and smoothing

3. **Update UI labels**:
   - "MODALITY" instead of using tension directly
   - "DISCOURSE PATTERN" or "CONVERSATION STRUCTURE" instead of "EMERGENCE FACTOR"

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

