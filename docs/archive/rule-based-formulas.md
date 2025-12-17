# Mathematical Formulas for Metadata Calculation

## Overview

This document provides the complete mathematical foundation for calculating all 10 metadata dimensions. Each formula, threshold, and decision rule is documented with examples.

---

## Input Variables

### Base Measurements

```typescript
n = total number of messages in conversation
n_user = number of user messages
n_ai = number of AI messages

// Existing metadata from dataset
CF_i = communicationFunction for message i (0.0 to 1.0)
CS_i = conversationStructure for message i (0.0 to 1.0)

// Derived measurements
L_i = character length of message i
Q = total question marks in conversation
```

---

## 1. Interaction Pattern

**Function**: `analyzeInteractionPattern(messages)`
**Returns**: One of 6 categories
**Method**: Rule-based classification using averages and thresholds

### Step 1: Calculate Aggregates

```
Q = Σ(1 if '?' in message_i.content else 0)

avgCF = (Σ CF_i) / n

avgCS = (Σ CS_i) / n

questionRatio = Q / n
```

### Step 2: Apply Decision Rules (Priority Order)

```
IF questionRatio ≥ 0.6:
    RETURN 'question-answer'

ELSE IF avgCF > 0.5 AND avgCS > 0.6:
    RETURN 'storytelling'

ELSE IF avgCF < 0.35 AND avgCS < 0.5:
    RETURN 'advisory'

ELSE IF avgCF > 0.45 AND avgCS < 0.5:
    RETURN 'debate'

ELSE IF avgCS > 0.65:
    RETURN 'collaborative'

ELSE:
    RETURN 'casual-chat'
```

### Threshold Summary

| Rule | Condition | Category |
|------|-----------|----------|
| R1 | Q/n ≥ 0.6 | question-answer |
| R2 | avgCF > 0.5 ∧ avgCS > 0.6 | storytelling |
| R3 | avgCF < 0.35 ∧ avgCS < 0.5 | advisory |
| R4 | avgCF > 0.45 ∧ avgCS < 0.5 | debate |
| R5 | avgCS > 0.65 | collaborative |
| R6 | default | casual-chat |

### Example Calculation

```
Messages: [
  {CF: 0.25, CS: 0.53, content: "hi how are you?"},
  {CF: 0.3, CS: 0.56, content: "I'm good thanks"}
]

Q = 1 (one question mark)
n = 2
avgCF = (0.25 + 0.3) / 2 = 0.275
avgCS = (0.53 + 0.56) / 2 = 0.545

questionRatio = 1/2 = 0.5

Evaluation:
- R1: 0.5 ≥ 0.6? NO
- R2: 0.275 > 0.5 AND 0.545 > 0.6? NO
- R3: 0.275 < 0.35 AND 0.545 < 0.5? NO
- R4: 0.275 > 0.45 AND 0.545 < 0.5? NO
- R5: 0.545 > 0.65? NO
- R6: DEFAULT → 'casual-chat'
```

---

## 2. Power Dynamics

**Function**: `analyzePowerDynamics(messages)`
**Returns**: One of 4 categories
**Method**: Length ratio and question comparison

### Step 1: Partition Messages

```
M_user = {m | m.role === 'user'}
M_ai = {m | m.role === 'assistant'}

n_user = |M_user|
n_ai = |M_ai|
```

### Step 2: Calculate Average Lengths

```
L_user_avg = (Σ L_i for i in M_user) / n_user

L_ai_avg = (Σ L_i for i in M_ai) / n_ai

ratio = L_user_avg / L_ai_avg
```

### Step 3: Count Questions by Role

```
Q_user = Σ(1 if '?' in m.content for m in M_user)

Q_ai = Σ(1 if '?' in m.content for m in M_ai)
```

### Step 4: Apply Decision Rules (Priority Order)

```
IF Q_user > 2 × Q_ai:
    RETURN 'human-led'

ELSE IF Q_ai > 2 × Q_user:
    RETURN 'ai-led'

ELSE IF ratio > 1.3 OR ratio < 0.7:
    RETURN 'alternating'

ELSE:
    RETURN 'balanced'
```

### Threshold Summary

| Metric | Threshold | Category |
|--------|-----------|----------|
| Question dominance | Q_user > 2×Q_ai | human-led |
| Question dominance | Q_ai > 2×Q_user | ai-led |
| Length ratio | ratio > 1.3 ∨ ratio < 0.7 | alternating |
| Default | 0.7 ≤ ratio ≤ 1.3 | balanced |

### Example Calculation

```
User messages: ["How are you?" (12 chars), "Tell me more" (12 chars)]
AI messages: ["I'm doing well, thanks for asking!" (34 chars)]

L_user_avg = (12 + 12) / 2 = 12
L_ai_avg = 34 / 1 = 34
ratio = 12 / 34 = 0.353

Q_user = 1
Q_ai = 0

Evaluation:
- Q_user > 2×Q_ai? 1 > 0? YES → 'human-led'
```

---

## 3. Emotional Tone

**Function**: `analyzeEmotionalTone(messages)`
**Returns**: One of 6 categories
**Method**: Keyword frequency counting with winner-takes-all

### Step 1: Concatenate and Normalize

```
text = LOWERCASE(JOIN(message_i.content for all i, separator=' '))
```

### Step 2: Define Keyword Patterns (Regex)

```
supportive = /(good|great|wonderful|help|support|care|love|hope|wish|nice)/g
playful = /(lol|haha|fun|cool|awesome|neat|wow)/g
serious = /(important|serious|concern|worry|problem|issue|difficult)/g
empathetic = /(understand|feel|sorry|empathize|relate|know how)/g
professional = /(work|job|career|business|professional|company)/g
```

### Step 3: Count Matches

```
count_supportive = COUNT_MATCHES(text, supportive)
count_playful = COUNT_MATCHES(text, playful)
count_serious = COUNT_MATCHES(text, serious)
count_empathetic = COUNT_MATCHES(text, empathetic)
count_professional = COUNT_MATCHES(text, professional)
```

### Step 4: Select Winner

```
scores = {
    supportive: count_supportive,
    playful: count_playful,
    serious: count_serious,
    empathetic: count_empathetic,
    professional: count_professional,
    neutral: 0
}

max_score = MAX(scores.values)

IF max_score == 0:
    RETURN 'neutral'
ELSE:
    RETURN key where scores[key] == max_score (first match)
```

### Example Calculation

```
Messages: [
  "I love this!",
  "That's great and wonderful!"
]

text = "i love this! that's great and wonderful!"

Matches:
- supportive: "love" (1), "great" (1), "wonderful" (1) → 3
- playful: 0
- serious: 0
- empathetic: 0
- professional: 0

scores = {supportive: 3, playful: 0, serious: 0, empathetic: 0, professional: 0, neutral: 0}
max_score = 3

RETURN 'supportive'
```

---

## 4. Engagement Style

**Function**: `analyzeEngagementStyle(messages)`
**Returns**: One of 5 categories
**Method**: Question ratio and keyword frequency comparison

### Step 1: Calculate Question Ratio

```
Q = Σ(1 if '?' in m.content for m in messages)
questionRatio = Q / n
```

### Step 2: Count Engagement Keywords

```
text = LOWERCASE(JOIN(message_i.content, separator=' '))

affirming = /(yes|yeah|right|exactly|agree|sure|definitely|absolutely)/g
challenging = /(but|however|although|actually|disagree|wrong|no)/g
exploring = /(maybe|perhaps|could|might|wonder|think|consider|interesting)/g

count_affirm = COUNT_MATCHES(text, affirming)
count_challenge = COUNT_MATCHES(text, challenging)
count_explore = COUNT_MATCHES(text, exploring)
```

### Step 3: Apply Decision Rules (Priority Order)

```
IF questionRatio > 0.4:
    RETURN 'questioning'

ELSE IF count_challenge > count_affirm AND count_challenge > count_explore:
    RETURN 'challenging'

ELSE IF count_explore > count_affirm AND count_explore > count_challenge:
    RETURN 'exploring'

ELSE IF count_affirm > 3:
    RETURN 'affirming'

ELSE:
    RETURN 'reactive'
```

### Threshold Summary

| Priority | Condition | Category |
|----------|-----------|----------|
| 1 | Q/n > 0.4 | questioning |
| 2 | count_challenge is max | challenging |
| 3 | count_explore is max | exploring |
| 4 | count_affirm > 3 | affirming |
| 5 | default | reactive |

### Example Calculation

```
Messages: [
  "What do you think?",
  "How about this?",
  "Tell me more?"
]

Q = 3
n = 3
questionRatio = 3/3 = 1.0

Evaluation:
- questionRatio > 0.4? 1.0 > 0.4? YES → 'questioning'
```

---

## 5. Knowledge Exchange

**Function**: `analyzeKnowledgeExchange(messages)`
**Returns**: One of 5 categories
**Method**: Keyword frequency with weighted composite score

### Step 1: Count Keyword Matches

```
text = LOWERCASE(JOIN(message_i.content, separator=' '))

personal = /(i|me|my|myself|mine)/g
skill = /(how to|learn|teach|show|practice|skill|technique)/g
opinion = /(think|believe|opinion|feel|view|perspective)/g
factual = /(is|are|was|were|fact|data|number|percent)/g

count_personal = COUNT_MATCHES(text, personal)
count_skill = COUNT_MATCHES(text, skill)
count_opinion = COUNT_MATCHES(text, opinion)
count_factual = COUNT_MATCHES(text, factual)
```

### Step 2: Calculate Composite Scores

```
scores = {
    'personal-sharing': count_personal,
    'skill-sharing': count_skill,
    'opinion-exchange': count_opinion,
    'factual-info': count_factual,
    'experience-sharing': count_personal × 0.8 + count_skill × 0.5
}
```

**Note**: `experience-sharing` is a weighted combination:
- 80% weight on personal pronouns
- 50% weight on skill keywords
- This captures narratives about personal learning/doing

### Step 3: Select Winner

```
max_score = MAX(scores.values)
RETURN key where scores[key] == max_score (first match)

IF no match:
    RETURN 'personal-sharing' (default)
```

### Example Calculation

```
Messages: [
  "I learned how to code",
  "My teacher showed me the technique"
]

text = "i learned how to code my teacher showed me the technique"

Matches:
- personal: "i" (1), "my" (1), "me" (1) → 3
- skill: "how to" (1), "learned" (1), "showed" (1), "technique" (1) → 4
- opinion: 0
- factual: 0

scores = {
    'personal-sharing': 3,
    'skill-sharing': 4,
    'opinion-exchange': 0,
    'factual-info': 0,
    'experience-sharing': 3×0.8 + 4×0.5 = 2.4 + 2.0 = 4.4
}

max_score = 4.4
RETURN 'experience-sharing'
```

---

## 6. Conversation Purpose

**Function**: `analyzeConversationPurpose(messages, interactionPattern)`
**Returns**: One of 5 categories
**Method**: Pattern-based override + keyword frequency + weighted scoring

### Step 1: Check Pattern Override

```
IF interactionPattern == 'storytelling':
    RETURN 'entertainment'

ELSE IF interactionPattern == 'question-answer':
    RETURN 'information-seeking'

ELSE IF interactionPattern == 'advisory':
    RETURN 'problem-solving'
```

### Step 2: Count Purpose Keywords (if no override)

```
text = LOWERCASE(JOIN(message_i.content, separator=' '))

relationship = /(friend|like|love|enjoy|share|together|connect)/g
info_seeking = /(what|how|why|when|where|who|tell me|explain)/g
entertainment = /(fun|play|game|joke|laugh|story|interesting)/g
problem_solving = /(help|solve|fix|issue|problem|solution|advice)/g

count_relationship = COUNT_MATCHES(text, relationship)
count_info = COUNT_MATCHES(text, info_seeking)
count_entertainment = COUNT_MATCHES(text, entertainment)
count_problem = COUNT_MATCHES(text, problem_solving)
```

### Step 3: Calculate Composite Scores

```
scores = {
    'relationship-building': count_relationship,
    'information-seeking': count_info,
    'entertainment': count_entertainment,
    'problem-solving': count_problem,
    'self-expression': count_relationship × 0.7
}
```

**Note**: `self-expression` weighted at 70% of relationship words

### Step 4: Select Winner

```
max_score = MAX(scores.values)

IF max_score == 0:
    RETURN 'self-expression' (default)
ELSE:
    RETURN key where scores[key] == max_score
```

### Example Calculation

```
interactionPattern = 'collaborative'

Messages: [
  "I enjoy talking with you",
  "Let's share our thoughts"
]

No override (not storytelling/question-answer/advisory)

text = "i enjoy talking with you let's share our thoughts"

Matches:
- relationship: "enjoy" (1), "share" (1) → 2
- info_seeking: 0
- entertainment: 0
- problem_solving: 0

scores = {
    'relationship-building': 2,
    'information-seeking': 0,
    'entertainment': 0,
    'problem-solving': 0,
    'self-expression': 2 × 0.7 = 1.4
}

max_score = 2
RETURN 'relationship-building'
```

---

## 7. Topic Depth

**Function**: `analyzeTopicDepth(messages)`
**Returns**: One of 3 categories
**Method**: Message count + average length + structure score

### Step 1: Check Message Count Boundaries

```
n = number of messages

IF n ≤ 2:
    RETURN 'surface'

ELSE IF n ≥ 6:
    RETURN 'deep'
```

### Step 2: Calculate Averages (for 3 ≤ n ≤ 5)

```
avgLength = (Σ L_i) / n

avgCS = (Σ CS_i) / n
```

### Step 3: Apply Rules

```
IF avgLength > 60 AND avgCS > 0.6:
    RETURN 'deep'

ELSE IF avgLength < 40 AND avgCS < 0.5:
    RETURN 'surface'

ELSE:
    RETURN 'moderate'
```

### Decision Tree

```
                    n ≤ 2?
                   /      \
                YES        NO
                 ↓          ↓
             surface     n ≥ 6?
                        /      \
                      YES      NO
                       ↓        ↓
                     deep   avgL>60 ∧ avgCS>0.6?
                            /              \
                          YES              NO
                           ↓                ↓
                         deep    avgL<40 ∧ avgCS<0.5?
                                 /              \
                               YES              NO
                                ↓                ↓
                            surface          moderate
```

### Example Calculation

```
Messages: 4 messages
Lengths: [45, 52, 48, 55]
CS values: [0.53, 0.59, 0.55, 0.61]

n = 4 (not ≤2, not ≥6)
avgLength = (45+52+48+55)/4 = 200/4 = 50
avgCS = (0.53+0.59+0.55+0.61)/4 = 2.28/4 = 0.57

Evaluation:
- avgLength > 60 AND avgCS > 0.6? 50>60 AND 0.57>0.6? NO
- avgLength < 40 AND avgCS < 0.5? 50<40 AND 0.57<0.5? NO
→ RETURN 'moderate'
```

---

## 8. Turn Taking

**Function**: `analyzeTurnTaking(messages)`
**Returns**: One of 3 categories
**Method**: Average message length ratio

### Formula

```
M_user = {m | m.role === 'user'}
M_ai = {m | m.role === 'assistant'}

L_user_avg = (Σ L_i for i in M_user) / |M_user|

L_ai_avg = (Σ L_i for i in M_ai) / |M_ai|

ratio = L_user_avg / L_ai_avg


IF ratio > 1.4:
    RETURN 'user-dominant'

ELSE IF ratio < 0.7:
    RETURN 'assistant-dominant'

ELSE:
    RETURN 'balanced'
```

### Threshold Regions

```
ratio < 0.7         →  assistant-dominant
0.7 ≤ ratio ≤ 1.4   →  balanced
ratio > 1.4         →  user-dominant
```

### Visual Representation

```
AI Dominant    Balanced        User Dominant
    ←──────────|──────────────|──────────→
              0.7            1.4
```

### Example Calculation

```
User messages: [50 chars, 60 chars, 40 chars]
AI messages: [80 chars, 90 chars]

L_user_avg = (50+60+40)/3 = 150/3 = 50
L_ai_avg = (80+90)/2 = 170/2 = 85
ratio = 50/85 = 0.588

Evaluation:
- ratio < 0.7? 0.588 < 0.7? YES → 'assistant-dominant'
```

---

## 9. Human Role

**Function**: `analyzeHumanRole(messages, conversationPurpose)`
**Returns**: One of 6 categories
**Method**: Purpose-based classification + question ratio + initiation

### Step 1: Calculate User Question Ratio

```
M_user = {m | m.role === 'user'}
Q_user = Σ(1 if '?' in m.content for m in M_user)
userQuestionRatio = Q_user / |M_user|
```

### Step 2: Check Initiation

```
firstMessage = messages[0]
userInitiates = (firstMessage.role === 'user')
```

### Step 3: Apply Decision Rules (Priority Order)

```
IF conversationPurpose == 'information-seeking':
    RETURN 'seeker'

ELSE IF conversationPurpose IN ['self-expression', 'relationship-building']:
    RETURN 'sharer'

ELSE IF userQuestionRatio > 0.5:
    RETURN 'learner'

ELSE IF userInitiates AND userQuestionRatio < 0.3:
    RETURN 'initiator'

ELSE IF NOT userInitiates:
    RETURN 'responder'

ELSE:
    RETURN 'collaborator'
```

### Decision Hierarchy

```
1. Purpose == 'information-seeking' → seeker
2. Purpose IN ['self-expression', 'relationship-building'] → sharer
3. userQuestionRatio > 0.5 → learner
4. userInitiates ∧ userQuestionRatio < 0.3 → initiator
5. ¬userInitiates → responder
6. default → collaborator
```

### Example Calculation

```
conversationPurpose = 'entertainment'
User messages: ["Let's play!", "This is fun!", "What's next?"]

Q_user = 1
|M_user| = 3
userQuestionRatio = 1/3 = 0.333

firstMessage.role = 'user'
userInitiates = true

Evaluation:
1. Purpose == 'information-seeking'? NO
2. Purpose IN ['self-expression', 'relationship-building']? NO
3. userQuestionRatio > 0.5? 0.333 > 0.5? NO
4. userInitiates AND userQuestionRatio < 0.3? true AND false? NO
5. NOT userInitiates? false? NO
6. default → 'collaborator'
```

---

## 10. AI Role

**Function**: `analyzeAIRole(messages, conversationPurpose, humanRole)`
**Returns**: One of 6 categories
**Method**: Purpose and human role dependencies + AI question ratio

### Step 1: Calculate AI Question Ratio

```
M_ai = {m | m.role === 'assistant'}
Q_ai = Σ(1 if '?' in m.content for m in M_ai)
aiQuestionRatio = Q_ai / |M_ai|
```

### Step 2: Apply Decision Rules (Priority Order)

```
IF conversationPurpose == 'problem-solving':
    RETURN 'advisor'

ELSE IF humanRole == 'sharer' AND aiQuestionRatio > 0.3:
    RETURN 'listener'

ELSE IF humanRole == 'seeker':
    RETURN 'expert'

ELSE IF aiQuestionRatio > 0.4:
    RETURN 'facilitator'

ELSE IF conversationPurpose == 'relationship-building':
    RETURN 'companion'

ELSE:
    RETURN 'peer'
```

### Decision Hierarchy

```
1. Purpose == 'problem-solving' → advisor
2. humanRole == 'sharer' ∧ aiQuestionRatio > 0.3 → listener
3. humanRole == 'seeker' → expert
4. aiQuestionRatio > 0.4 → facilitator
5. Purpose == 'relationship-building' → companion
6. default → peer
```

### Example Calculation

```
conversationPurpose = 'information-seeking'
humanRole = 'seeker'
AI messages: ["The answer is...", "That works by..."]

Q_ai = 0
|M_ai| = 2
aiQuestionRatio = 0/2 = 0

Evaluation:
1. Purpose == 'problem-solving'? NO
2. humanRole == 'sharer' AND aiQuestionRatio > 0.3? NO
3. humanRole == 'seeker'? YES → 'expert'
```

---

## Calculation Order (Dependency Graph)

```
1. interactionPattern ← (messages)
2. powerDynamics ← (messages)
3. emotionalTone ← (messages)
4. engagementStyle ← (messages)
5. knowledgeExchange ← (messages)
6. conversationPurpose ← (messages, interactionPattern)
7. topicDepth ← (messages)
8. turnTaking ← (messages)
9. humanRole ← (messages, conversationPurpose)
10. aiRole ← (messages, conversationPurpose, humanRole)
```

**Dependencies**:
- Most dimensions are independent (1-5, 7-8)
- `conversationPurpose` depends on `interactionPattern`
- `humanRole` depends on `conversationPurpose`
- `aiRole` depends on both `conversationPurpose` and `humanRole`

---

## Summary Statistics

### Aggregation Functions Used

| Function | Usage Count | Dimensions |
|----------|-------------|------------|
| Mean (average) | 8 | CF, CS, message length, ratios |
| Count | 10 | All keyword matching |
| Ratio | 5 | Questions, lengths, dominance |
| Max | 5 | Winner selection |
| Filter | 10 | Role partitioning, keyword detection |

### Thresholds Used

| Value | Context | Purpose |
|-------|---------|---------|
| 0.3 | Question ratios, tone triggers | Low threshold |
| 0.35 | avgCF for advisory | Function boundary |
| 0.4 | Question ratio, AI questions | Moderate threshold |
| 0.45 | avgCF for debate | Function boundary |
| 0.5 | CS thresholds, question ratio | Midpoint |
| 0.6 | Question ratio, CS for depth/storytelling | High threshold |
| 0.65 | avgCS for collaborative | Structural boundary |
| 0.7 | Length ratio, composite weight | Balance threshold |
| 0.8 | Experience sharing weight | Dominant weight |
| 1.3 | Length ratio upper bound | Alternating threshold |
| 1.4 | Length ratio dominance | Dominance threshold |
| 2.0 | Question dominance multiplier | Strong dominance |
| 3 | Minimum affirming count | Absolute threshold |
| 40 | Message length (chars) | Surface depth boundary |
| 60 | Message length (chars) | Deep depth boundary |

### Regular Expression Patterns

**Total Patterns**: 18
**Total Keywords**: 89 unique words

| Pattern Set | Word Count | Purpose |
|-------------|------------|---------|
| Supportive | 10 | Emotional tone |
| Playful | 7 | Emotional tone |
| Serious | 7 | Emotional tone |
| Empathetic | 6 | Emotional tone |
| Professional | 6 | Emotional tone |
| Affirming | 8 | Engagement style |
| Challenging | 7 | Engagement style |
| Exploring | 8 | Engagement style |
| Personal | 5 | Knowledge exchange |
| Skill | 7 | Knowledge exchange |
| Opinion | 6 | Knowledge exchange |
| Factual | 6 | Knowledge exchange |
| Relationship | 7 | Conversation purpose |
| Info-seeking | 8 | Conversation purpose |
| Entertainment | 7 | Conversation purpose |
| Problem-solving | 7 | Conversation purpose |

---

## Computational Complexity

### Time Complexity per Conversation

```
n = number of messages
L = average message length

Dimension 1 (Interaction Pattern): O(n)
Dimension 2 (Power Dynamics): O(n)
Dimension 3 (Emotional Tone): O(n × L)  // Regex matching
Dimension 4 (Engagement Style): O(n × L)
Dimension 5 (Knowledge Exchange): O(n × L)
Dimension 6 (Conversation Purpose): O(n × L)
Dimension 7 (Topic Depth): O(n)
Dimension 8 (Turn Taking): O(n)
Dimension 9 (Human Role): O(n)
Dimension 10 (AI Role): O(n)

Total: O(n × L)  // Dominated by regex operations
```

### Space Complexity

```
O(n × L)  // Storing concatenated text for regex matching
```

### Performance

For 145 conversations with ~8.3 messages each:
- **Total messages**: ~1,206
- **Processing time**: ~1-2 seconds
- **Average per conversation**: ~7-14ms

---

This comprehensive mathematical foundation ensures consistent, reproducible metadata generation across all conversations! 🔢
