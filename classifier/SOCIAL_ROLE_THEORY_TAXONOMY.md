# Social Role Theory-Based Taxonomy Redesign

**Date:** 2026-01-07  
**Theoretical Foundation:** Social Role Theory (Parsons, Bales, Eagly)  
**Problem:** Current taxonomy conflates "social facilitation" with "learning facilitation"

---

## 🎯 Core Insight from Social Role Theory

**Social Role Theory distinguishes:**
- **Instrumental Roles** (Task-oriented, goal-directed, agentic)
  - Focus: Task completion, problem-solving, information exchange
  - Characteristics: Direct, efficient, authoritative when needed
  - Examples: Expert, Provider, Director

- **Expressive Roles** (Relationship-oriented, emotional, communal)
  - Focus: Social bonding, emotional support, rapport-building
  - Characteristics: Affiliative, validating, relationship-maintaining
  - Examples: Peer, Affiliative, Social Facilitator

**This maps perfectly to your X-axis:** Functional (Instrumental) ↔ Social (Expressive)

---

## 🔍 The Current Problem

**Your review findings revealed:**
- Local model classifies casual chat as "facilitator"
- But these are **expressive/social facilitation** (keeping conversation going)
- Not **instrumental/learning facilitation** (guiding discovery)

**The taxonomy needs to distinguish:**
- **Instrumental Facilitator:** Scaffolds learning, guides problem-solving (task-oriented)
- **Expressive Facilitator:** Maintains social connection, keeps conversation flowing (relationship-oriented)

---

## 📊 Proposed Taxonomy: Social Role Theory Framework

### Two-Dimensional Role Space

**Dimension 1: Instrumental ↔ Expressive** (Maps to your X-axis)
- **Instrumental:** Task-oriented, goal-directed
- **Expressive:** Relationship-oriented, emotional

**Dimension 2: Authority Level** (Maps to your Y-axis)
- **High Authority:** Asserts knowledge/control
- **Low Authority:** Equal partnership, collaborative

---

## 🎭 Unified Role Taxonomy (Social Role Theory-Based)

### Human Roles (6 roles)

| Role | Instrumental/Expressive | Authority | Definition | Signals |
|------|----------------------|-----------|------------|---------|
| **Information-Seeker** | Instrumental | Low (seeking) | Requests information, asks questions to fill knowledge gaps | "What is...?", "How do I...?", "Can you explain...?" |
| **Provider** | Instrumental | High | Gives information, answers questions directly | Direct answers, definitions, explanations |
| **Director** | Instrumental | High | Commands, specifies deliverables, controls task | "Do this...", "Make it...", "I want..." |
| **Collaborator** | Instrumental | Equal | Co-builds, proposes alternatives, joint problem-solving | "What if we...?", "We could...", builds on AI output |
| **Social-Expressor** | Expressive | Low | Personal narrative, emotional expression, sharing | "I feel...", personal stories, emotional sharing |
| **Relational-Peer** | Expressive | Equal | Equal partner, social bonding, casual conversation | Casual chat, "how are you?", rapport-building |

### AI Roles (6 roles)

| Role | Instrumental/Expressive | Authority | Definition | Signals |
|------|----------------------|-----------|------------|---------|
| **Expert-System** | Instrumental | High | Provides direct answers, asserts epistemic authority | "X is...", "This means...", comprehensive explanations |
| **Learning-Facilitator** | Instrumental | Low | Scaffolds learning, guides discovery through questions | "What do you think?", "Have you considered?", Socratic method |
| **Advisor** | Instrumental | High | Prescribes actions, gives recommendations | "You should...", "I recommend...", step-by-step guidance |
| **Co-Constructor** | Instrumental | Equal | Joint problem-solving, co-creates with user | "We could...", "Let's try...", iterative building |
| **Social-Facilitator** | Expressive | Low | Maintains conversation flow, social bonding | "How are you?", "That's interesting!", keeps chat going |
| **Relational-Peer** | Expressive | Equal | Equal social partner, casual conversation | "Cool!", "I like that too!", peer-to-peer chat |

---

## 🔄 Key Distinctions

### 1. Learning-Facilitator vs Social-Facilitator

**Learning-Facilitator (Instrumental):**
- Goal: Help user discover/learn something
- Method: Structured questions, scaffolding understanding
- Context: Educational, problem-solving
- Example: "What do you think would happen if we tried X? Let's explore that..."

**Social-Facilitator (Expressive):**
- Goal: Keep conversation going, build rapport
- Method: Casual questions, validation, interest
- Context: Relationship-building, casual chat
- Example: "How are you doing today? What do you do for a career?"

**This solves your classification problem!** The model was calling social facilitation "facilitator" - now they're distinct.

---

### 2. Provider vs Expert-System

**Provider (Human):**
- Seeks information from AI
- Asks questions expecting answers
- Low authority (seeking)

**Expert-System (AI):**
- Provides information to human
- Gives direct answers
- High authority (providing)

**Note:** These are complementary roles in the same interaction.

---

### 3. Relational-Peer (Expressive) vs Co-Constructor (Instrumental)

**Relational-Peer:**
- Focus: Social bonding, relationship
- Content: Personal sharing, casual chat
- Goal: Connection, rapport

**Co-Constructor:**
- Focus: Task completion, problem-solving
- Content: Ideas, solutions, artifacts
- Goal: Create something together

---

## 📐 Mapping to Your Terrain Coordinates

### X-Axis: Functional ↔ Social (Instrumental ↔ Expressive)

**Mapping:**
```typescript
// Instrumental roles → Functional (left, X ~0.1-0.4)
information-seeker: 0.3
provider: 0.2
director: 0.1
collaborator: 0.4
learning-facilitator: 0.3
expert-system: 0.1
advisor: 0.2
co-constructor: 0.4

// Expressive roles → Social (right, X ~0.7-0.95)
social-expressor: 0.95
relational-peer: 0.85
social-facilitator: 0.8
```

### Y-Axis: Structured ↔ Emergent (Authority Level)

**Mapping:**
```typescript
// High Authority → Structured (bottom, Y ~0.1-0.3)
expert-system: 0.1
advisor: 0.2
provider: 0.2
director: 0.1

// Low Authority → Emergent (top, Y ~0.7-0.9)
learning-facilitator: 0.8
social-facilitator: 0.7
information-seeker: 0.7

// Equal Authority → Middle (Y ~0.5-0.6)
collaborator: 0.5
co-constructor: 0.5
relational-peer: 0.6
```

---

## 🎯 Benefits of This Taxonomy

### 1. Solves the Classification Problem

**Before:**
- "Facilitator" conflated learning and social facilitation
- Casual chat misclassified as learning facilitator

**After:**
- **Learning-Facilitator** (instrumental, task-oriented)
- **Social-Facilitator** (expressive, relationship-oriented)
- Clear distinction based on social role theory

### 2. Aligns with Theoretical Framework

**Social Role Theory provides:**
- Clear instrumental/expressive distinction
- Authority level as second dimension
- Grounded in established sociological theory
- Maps to your X/Y axes naturally

### 3. Reduces Role Count

**Current:** 3 human + 3 AI = 6 roles (reduced taxonomy)
**Proposed:** 6 human + 6 AI = 12 roles total

**But:** More nuanced, theoretically grounded, solves classification problems

**Alternative:** Could reduce to 4 human + 4 AI = 8 roles:
- Human: Information-Seeker, Provider, Collaborator, Social-Expressor
- AI: Expert-System, Learning-Facilitator, Co-Constructor, Social-Facilitator

### 4. Better Few-Shot Examples

**Can provide clear examples:**
- Learning-Facilitator: "What do you think would happen if...?" (educational)
- Social-Facilitator: "How are you doing today?" (casual chat)

---

## 📝 Implementation Plan

### Phase 1: Taxonomy Definition

1. **Finalize role set** (6+6 or 4+4)
2. **Write clear definitions** with instrumental/expressive distinction
3. **Create mapping** from old → new roles
4. **Update terrain position mappings**

### Phase 2: Update Classifier Prompt

**Add to prompt:**
```
## SOCIAL ROLE THEORY FRAMEWORK

Roles are organized along two dimensions:

1. **Instrumental ↔ Expressive**
   - Instrumental: Task-oriented, goal-directed (functional)
   - Expressive: Relationship-oriented, emotional (social)

2. **Authority Level**
   - High: Asserts knowledge/control (structured)
   - Low: Seeks information or guides (emergent)
   - Equal: Collaborative partnership (balanced)

### Key Distinctions:

**Learning-Facilitator (Instrumental) vs Social-Facilitator (Expressive):**
- Learning-Facilitator: Scaffolds understanding, guides discovery (task-oriented)
- Social-Facilitator: Maintains conversation, builds rapport (relationship-oriented)

**Provider (Human, Instrumental, Low Authority) vs Expert-System (AI, Instrumental, High Authority):**
- Provider: Seeks information (asks questions)
- Expert-System: Provides information (gives answers)
```

### Phase 3: Create Few-Shot Examples

**Examples should show:**
1. Learning-Facilitator (instrumental): Educational scaffolding
2. Social-Facilitator (expressive): Casual chat, rapport-building
3. Expert-System (instrumental, high authority): Direct answers
4. Relational-Peer (expressive, equal): Casual peer conversation
5. Co-Constructor (instrumental, equal): Joint problem-solving

### Phase 4: Test and Validate

1. **Reclassify sample** (20-30 conversations)
2. **Check:** Does it distinguish learning vs social facilitation?
3. **Validate:** Do classifications align with instrumental/expressive?
4. **Iterate** on definitions if needed

---

## 🔬 Academic Foundation

**Social Role Theory References:**
- Parsons, T. (1951). *The Social System*
- Bales, R. F. (1950). *Interaction Process Analysis*
- Eagly, A. H. (1987). *Sex Differences in Social Behavior: A Social-Role Interpretation*

**Key Concepts:**
- **Instrumental roles:** Task-oriented, goal-directed, agentic
- **Expressive roles:** Relationship-oriented, emotional, communal
- **Role expectations:** What behaviors are expected in each role
- **Role performance:** How roles are actually enacted

**Application to AI:**
- AI can take on different social roles
- Roles shape interaction patterns
- Instrumental vs expressive distinction maps to functional vs social

---

## ✅ Next Steps

1. **Review this taxonomy proposal**
2. **Decide:** 6+6 roles or 4+4 roles?
3. **Create mapping** from current taxonomy to new
4. **Update classifier prompt** with social role theory framework
5. **Create few-shot examples** showing key distinctions
6. **Test on sample conversations** (especially the casual chat ones that were misclassified)

---

## 💡 Key Insight

**Social Role Theory solves your classification problem:**

The model was calling casual chat "facilitator" because it conflated:
- **Social facilitation** (expressive, relationship-oriented)
- **Learning facilitation** (instrumental, task-oriented)

**By distinguishing these based on social role theory, you get:**
- Clearer classifications
- Better alignment with your X-axis (Functional ↔ Social)
- Theoretically grounded taxonomy
- Solves the misclassification issue you found in reviews

