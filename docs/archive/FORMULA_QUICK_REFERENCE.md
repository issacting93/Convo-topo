# Formula Quick Reference

> **⚠️ ARCHIVED: Rule-Based System**  
> This document describes an **algorithmic/rule-based approach** to classification that is **NOT currently implemented**.  
> **Current System**: LLM-based classifier v1.1 (see `classifier-v1.1.py/ts` and `README-v1.1.md`)  
> **Role Taxonomy**: This document uses old role names (`initiator`, `responder`, `listener`, `companion`)  
> **Current Taxonomy**: See `taxonomy.json` for v1.1 role definitions (`director`, `challenger`, `reflector`, `affiliative`)

A visual, condensed reference for all metadata calculations using rule-based formulas.

---

## 📐 Core Formulas

### Averages

```
avgCF = Σ(CF_i) / n
avgCS = Σ(CS_i) / n
avgLength = Σ(L_i) / n
```

### Ratios

```
questionRatio = Q / n
userQuestionRatio = Q_user / n_user
aiQuestionRatio = Q_ai / n_ai
lengthRatio = L_user_avg / L_ai_avg
```

### Keyword Counting

```
count_keyword = |matches of regex pattern in text|
```

---

## 🎯 Dimension Formulas

### 1. Interaction Pattern

```
                      ┌──────────────────┐
                      │  Q/n ≥ 0.6?      │
                      └────┬──────┬──────┘
                          YES    NO
                           │      │
                    question-   ┌─┴────────────────────────┐
                     answer     │ avgCF>0.5 ∧ avgCS>0.6?   │
                                └────┬──────┬──────────────┘
                                    YES    NO
                                     │      │
                              storytelling ├─ avgCF<0.35 ∧ avgCS<0.5? → advisory
                                            ├─ avgCF>0.45 ∧ avgCS<0.5? → debate
                                            ├─ avgCS>0.65? → collaborative
                                            └─ default → casual-chat
```

**Formula**: `f(avgCF, avgCS, Q/n) → {collaborative, advisory, storytelling, Q&A, casual-chat, debate}`

---

### 2. Power Dynamics

```
ratio = L_user_avg / L_ai_avg

                ┌──────────────────────┐
                │  Q_user > 2×Q_ai?    │
                └──┬─────────┬─────────┘
                  YES       NO
                   │         │
              human-led  ┌───┴────────────────────┐
                         │  Q_ai > 2×Q_user?      │
                         └──┬──────────┬──────────┘
                           YES        NO
                            │          │
                        ai-led    ┌────┴────────────────────┐
                                  │ ratio>1.3 ∨ ratio<0.7? │
                                  └──┬──────────┬───────────┘
                                    YES        NO
                                     │          │
                                alternating  balanced
```

**Formula**: `f(Q_user, Q_ai, lengthRatio) → {human-led, ai-led, balanced, alternating}`

**Thresholds**: `question_dominance = 2×`, `length_bounds = [0.7, 1.3]`

---

### 3. Emotional Tone

```
scores = {
    supportive: count(good|great|help|love|hope|...),
    playful: count(lol|fun|cool|awesome|...),
    serious: count(important|concern|problem|...),
    empathetic: count(understand|feel|sorry|...),
    professional: count(work|job|career|...),
    neutral: 0
}

result = argmax(scores)
```

**Formula**: `f(keyword_frequencies) → argmax{supportive, playful, serious, empathetic, professional, neutral}`

**Method**: Winner-takes-all from keyword frequency

---

### 4. Engagement Style

```
                ┌─────────────────┐
                │  Q/n > 0.4?     │
                └──┬──────┬───────┘
                  YES    NO
                   │      │
              questioning └─ count_challenge = max? → challenging
                            ├─ count_explore = max? → exploring
                            ├─ count_affirm > 3? → affirming
                            └─ default → reactive
```

**Formula**: `f(Q/n, keyword_counts) → {questioning, affirming, challenging, exploring, reactive}`

**Priority**: `Q/n > challenge > explore > affirm > default`

---

### 5. Knowledge Exchange

```
scores = {
    personal-sharing: count(i|me|my|...),
    skill-sharing: count(how to|learn|teach|...),
    opinion-exchange: count(think|believe|opinion|...),
    factual-info: count(is|are|fact|data|...),
    experience-sharing: count_personal × 0.8 + count_skill × 0.5
}

result = argmax(scores)
```

**Formula**: `f(keyword_counts, composite_score) → argmax{personal, skill, opinion, factual, experience}`

**Composite**: `experience = 0.8×personal + 0.5×skill`

---

### 6. Conversation Purpose

```
OVERRIDE_RULES:
    storytelling → entertainment
    question-answer → information-seeking
    advisory → problem-solving

IF no override:
    scores = {
        relationship-building: count(friend|love|enjoy|...),
        information-seeking: count(what|how|why|...),
        entertainment: count(fun|play|game|...),
        problem-solving: count(help|solve|fix|...),
        self-expression: count_relationship × 0.7
    }
    result = argmax(scores) OR default='self-expression'
```

**Formula**: `f(interactionPattern, keyword_counts) → {relationship, info-seeking, entertainment, problem-solving, self-expression}`

**Composite**: `self-expression = 0.7×relationship`

---

### 7. Topic Depth

```
                  ┌────────────┐
                  │  n ≤ 2?    │
                  └──┬──┬──────┘
                    YES NO
                     │   │
                 surface │
                      ┌──┴─────────┐
                      │  n ≥ 6?    │
                      └──┬──┬──────┘
                        YES NO
                         │   │
                       deep  └─ avgL>60 ∧ avgCS>0.6? → deep
                              ├─ avgL<40 ∧ avgCS<0.5? → surface
                              └─ default → moderate
```

**Formula**: `f(n, avgLength, avgCS) → {surface, moderate, deep}`

**Boundaries**: `n: [≤2, 3-5, ≥6]`, `L: [<40, 40-60, >60]`, `CS: [<0.5, 0.5-0.6, >0.6]`

---

### 8. Turn Taking

```
ratio = L_user_avg / L_ai_avg

    ←───────────────|─────────────|───────────────→
  AI-dominant    Balanced    User-dominant
    ratio<0.7    0.7≤ratio≤1.4    ratio>1.4
```

**Formula**: `f(lengthRatio) → {user-dominant, assistant-dominant, balanced}`

**Thresholds**: `[0.7, 1.4]`

---

### 9. Human Role

```
PRIORITY:
    1. purpose='information-seeking' → seeker
    2. purpose IN ['self-expression','relationship'] → sharer
    3. userQuestionRatio > 0.5 → learner
    4. userInitiates ∧ userQuestionRatio < 0.3 → initiator
    5. ¬userInitiates → responder
    6. default → collaborator
```

**Formula**: `f(purpose, Q_user/n_user, initiates) → {seeker, sharer, learner, initiator, responder, collaborator}`

**Dependencies**: Requires `conversationPurpose`

---

### 10. AI Role

```
PRIORITY:
    1. purpose='problem-solving' → advisor
    2. humanRole='sharer' ∧ aiQuestionRatio > 0.3 → listener
    3. humanRole='seeker' → expert
    4. aiQuestionRatio > 0.4 → facilitator
    5. purpose='relationship-building' → companion
    6. default → peer
```

**Formula**: `f(purpose, humanRole, Q_ai/n_ai) → {expert, advisor, listener, companion, facilitator, peer}`

**Dependencies**: Requires `conversationPurpose` and `humanRole`

---

## 📊 Threshold Reference Table

| Threshold | Value | Used In | Purpose |
|-----------|-------|---------|---------|
| **Question ratios** ||||
| Low question | 0.3 | aiRole, initiator | Minimal questioning |
| Moderate question | 0.4 | engagementStyle, aiRole | Active questioning |
| High question | 0.5 | humanRole | Dominant questioning |
| Very high question | 0.6 | interactionPattern | Q&A pattern |
| **Communication function** ||||
| Low CF | 0.35 | interactionPattern | Instrumental |
| Moderate CF | 0.45 | interactionPattern | Expressive threshold |
| High CF | 0.5 | interactionPattern | Expressive |
| **Conversation structure** ||||
| Low CS | 0.5 | interactionPattern, topicDepth | Structured |
| Moderate CS | 0.6 | interactionPattern, topicDepth | Emergent threshold |
| High CS | 0.65 | interactionPattern | Collaborative |
| **Length ratios** ||||
| AI dominance | 0.7 | powerDynamics, turnTaking | AI longer |
| Balance range | [0.7, 1.4] | powerDynamics, turnTaking | Balanced |
| User dominance | 1.4 | powerDynamics, turnTaking | User longer |
| Alternating | <0.7 or >1.3 | powerDynamics | Variable |
| **Composite weights** ||||
| Self-expression | 0.7 | conversationPurpose | Relationship weight |
| Experience (personal) | 0.8 | knowledgeExchange | Personal weight |
| Experience (skill) | 0.5 | knowledgeExchange | Skill weight |
| **Multipliers** ||||
| Question dominance | 2× | powerDynamics | 2:1 ratio |
| **Absolute thresholds** ||||
| Affirming count | 3 | engagementStyle | Minimum occurrences |
| Surface length | 40 chars | topicDepth | Short messages |
| Deep length | 60 chars | topicDepth | Long messages |
| Surface messages | 2 | topicDepth | Few exchanges |
| Deep messages | 6 | topicDepth | Many exchanges |

---

## 🔗 Dependency Graph

```
Level 0 (Independent):
├─ interactionPattern ← (messages)
├─ powerDynamics ← (messages)
├─ emotionalTone ← (messages)
├─ engagementStyle ← (messages)
├─ knowledgeExchange ← (messages)
├─ topicDepth ← (messages)
└─ turnTaking ← (messages)

Level 1 (Depends on Level 0):
└─ conversationPurpose ← (messages, interactionPattern)

Level 2 (Depends on Level 1):
└─ humanRole ← (messages, conversationPurpose)

Level 3 (Depends on Level 2):
└─ aiRole ← (messages, conversationPurpose, humanRole)
```

**Calculation Order**: Must compute Level 0 → Level 1 → Level 2 → Level 3

---

## 🎨 Pattern Matching Reference

### Supportive Keywords (10)
`good, great, wonderful, help, support, care, love, hope, wish, nice`

### Playful Keywords (7)
`lol, haha, fun, cool, awesome, neat, wow`

### Serious Keywords (7)
`important, serious, concern, worry, problem, issue, difficult`

### Empathetic Keywords (6)
`understand, feel, sorry, empathize, relate, know how`

### Professional Keywords (6)
`work, job, career, business, professional, company`

### Affirming Keywords (8)
`yes, yeah, right, exactly, agree, sure, definitely, absolutely`

### Challenging Keywords (7)
`but, however, although, actually, disagree, wrong, no`

### Exploring Keywords (8)
`maybe, perhaps, could, might, wonder, think, consider, interesting`

### Personal Keywords (5)
`i, me, my, myself, mine`

### Skill Keywords (7)
`how to, learn, teach, show, practice, skill, technique`

### Opinion Keywords (6)
`think, believe, opinion, feel, view, perspective`

### Factual Keywords (6)
`is, are, was, were, fact, data, number, percent`

### Relationship Keywords (7)
`friend, like, love, enjoy, share, together, connect`

### Info-seeking Keywords (8)
`what, how, why, when, where, who, tell me, explain`

### Entertainment Keywords (7)
`fun, play, game, joke, laugh, story, interesting`

### Problem-solving Keywords (7)
`help, solve, fix, issue, problem, solution, advice`

---

## ⚡ Performance Metrics

| Metric | Value |
|--------|-------|
| **Dimensions** | 10 |
| **Total calculations per conversation** | ~40-50 operations |
| **Regex patterns** | 18 |
| **Keyword set size** | 89 unique words |
| **Thresholds used** | 24 distinct values |
| **Time complexity** | O(n × L) |
| **Space complexity** | O(n × L) |
| **Average processing time** | 7-14ms per conversation |
| **Total processing time (145 conversations)** | 1-2 seconds |

---

## 🧮 Example: Full Calculation

**Input Conversation**:
```
User: "Hi! How are you doing? I love hiking."
AI: "That sounds wonderful! I enjoy outdoor activities too."
```

### Step-by-Step

**Messages**: n=2, n_user=1, n_ai=1

**Lengths**:
- User: 43 chars
- AI: 53 chars

**Existing metadata**:
- CF_user = 0.25, CF_ai = 0.30
- CS_user = 0.53, CS_ai = 0.56

---

**1. Interaction Pattern**:
```
Q = 1 (one '?')
avgCF = (0.25 + 0.30)/2 = 0.275
avgCS = (0.53 + 0.56)/2 = 0.545
Q/n = 1/2 = 0.5

0.5 < 0.6 → not Q&A
0.275 ≤ 0.5 → not storytelling
0.275 ≥ 0.35 → not advisory
0.545 ≥ 0.5 → not debate
0.545 < 0.65 → not collaborative
→ casual-chat ✓
```

**2. Power Dynamics**:
```
L_user_avg = 43
L_ai_avg = 53
ratio = 43/53 = 0.811

Q_user = 1, Q_ai = 0
1 > 2×0 → human-led ✓
```

**3. Emotional Tone**:
```
text = "hi how are you doing i love hiking that sounds wonderful i enjoy outdoor activities too"

supportive: "love"(1), "wonderful"(1) → 2
playful: 0
serious: 0
empathetic: 0
professional: 0

max = 2 → supportive ✓
```

**4. Engagement Style**:
```
Q/n = 1/2 = 0.5
0.5 > 0.4 → questioning ✓
```

**5. Knowledge Exchange**:
```
personal: "i"(2), "you"(implicit) → 2
skill: 0
opinion: 0
factual: 0
experience: 2×0.8 + 0×0.5 = 1.6

max = 2 → personal-sharing ✓
```

**6. Conversation Purpose**:
```
pattern = casual-chat (no override)

relationship: "love"(1), "enjoy"(1) → 2
info_seeking: "how"(1) → 1
entertainment: 0
problem_solving: 0
self_expression: 2×0.7 = 1.4

max = 2 → relationship-building ✓
```

**7. Topic Depth**:
```
n = 2
2 ≤ 2 → surface ✓
```

**8. Turn Taking**:
```
ratio = 43/53 = 0.811
0.7 ≤ 0.811 ≤ 1.4 → balanced ✓
```

**9. Human Role**:
```
purpose = relationship-building
→ sharer ✓
```

**10. AI Role**:
```
purpose = relationship-building
humanRole = sharer
Q_ai/n_ai = 0/1 = 0
0 ≤ 0.3 → not listener
→ companion ✓
```

---

**Final Metadata**:
```json
{
  "interactionPattern": "casual-chat",
  "powerDynamics": "human-led",
  "emotionalTone": "supportive",
  "engagementStyle": "questioning",
  "knowledgeExchange": "personal-sharing",
  "conversationPurpose": "relationship-building",
  "topicDepth": "surface",
  "turnTaking": "balanced",
  "humanRole": "sharer",
  "aiRole": "companion"
}
```

---

Quick reference complete! Use this for rapid lookup of formulas and thresholds. 🚀
