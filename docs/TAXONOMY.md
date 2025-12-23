# Conversational Role Taxonomy

> **✅ CURRENT: Classification System v1.1**  
> This document describes the **current taxonomy** used by the LLM-based classifier v1.1.  
> **Classification Method**: Claude API (Anthropic) with structured prompts  
> **Source**: Definitions extracted from `classifier-v1.1.py/ts` prompt  
> **Taxonomy File**: `taxonomy.json` (v1.1.0)  
> **Roles**: Current taxonomy (`director`, `challenger`, `reflector`, `affiliative`)

## Overview

This taxonomy provides a structured classification system for understanding human-AI conversational dynamics across multiple dimensions. It organizes 49 distinct categories across 10 primary dimensions, with role dimensions (9-10) output as probability distributions.

---

## Taxonomic Hierarchy

```
CONVERSATIONAL DYNAMICS
├── STRUCTURAL DIMENSIONS
│   ├── Interaction Pattern
│   └── Power Dynamics
├── COMMUNICATIVE DIMENSIONS
│   ├── Emotional Tone
│   └── Engagement Style
├── CONTENT DIMENSIONS
│   ├── Knowledge Exchange
│   └── Conversation Purpose
├── QUALITY DIMENSIONS
│   └── Turn Taking
└── ROLE DIMENSIONS
    ├── Human Role
    └── AI Role
```

---

## Dimension 1: Interaction Pattern
**Category**: Structural Dimension
**Domain**: Conversation Architecture
**Purpose**: Classifies the structural format of conversational exchanges

### Taxonomy

```
INTERACTION_PATTERN
├── GOAL_ORIENTED
│   ├── advisory (n=4)
│   │   ├── Definition: Structured guidance seeking
│   │   ├── Characteristics: Problem → Solution flow
│   │   └── Example: "How should I...?" → "You could try..."
│   └── question-answer (n=19)
│       ├── Definition: Information request-response pairs
│       ├── Characteristics: Query → Direct answer pattern
│       └── Example: "What is X?" → "X is..."
├── PROCESS_ORIENTED
│   ├── collaborative (n=86)
│   │   ├── Definition: Joint exploration and building
│   │   ├── Characteristics: Back-and-forth development
│   │   └── Example: "I think..." → "Building on that..."
│   └── debate (n=0)
│       ├── Definition: Contrasting viewpoints
│       ├── Characteristics: Thesis → Antithesis pattern
│       └── Example: "X is true" → "Actually, Y contradicts..."
└── EXPRESSION_ORIENTED
    ├── storytelling (n=0)
    │   ├── Definition: Narrative-focused exchanges
    │   ├── Characteristics: Sequential event sharing
    │   └── Example: "First... then... finally..."
    └── casual-chat (n=36)
        ├── Definition: Unstructured social exchange
        ├── Characteristics: Free-flowing topics
        └── Example: "Hey!" → "Hi! How are you?"
```

**Relationships**:
- Often correlates with `conversationPurpose`
- Influences `powerDynamics`
- Partially determines `humanRole` and `aiRole`

---

## Dimension 2: Power Dynamics
**Category**: Structural Dimension
**Domain**: Conversational Control
**Purpose**: Identifies who drives the direction and pace of conversation

### Taxonomy

```
POWER_DYNAMICS
├── SINGLE_DRIVER
│   ├── human-led
│   │   ├── Definition: User controls topic selection and flow
│   │   ├── Indicators: User asks questions, AI responds
│   │   ├── Message ratio: User messages > AI messages (length)
│   │   └── Common with: seeker role, question-answer pattern
│   └── ai-led
│       ├── Definition: Assistant guides conversation direction
│       ├── Indicators: AI poses questions, introduces topics
│       ├── Message ratio: AI messages > User messages (length)
│       └── Common with: facilitator role, advisory pattern
├── SHARED_CONTROL
│   ├── balanced
│   │   ├── Definition: Equal influence on conversation flow
│   │   ├── Indicators: Similar message lengths, mutual topic introduction
│   │   ├── Message ratio: ~1:1
│   │   └── Common with: peer role, collaborative pattern
│   └── alternating
│       ├── Definition: Leadership shifts between participants
│       ├── Indicators: Variable message lengths, turn-based topic control
│       ├── Message ratio: Fluctuating
│       └── Common with: complex conversations, multi-topic discussions
```

**Measurement**: Calculated from message length ratios and question patterns

---

## Dimension 3: Emotional Tone
**Category**: Communicative Dimension
**Domain**: Affective Quality
**Purpose**: Captures the emotional atmosphere of the exchange

### Taxonomy

```
EMOTIONAL_TONE
├── POSITIVE_VALENCE
│   ├── supportive (n=89) [HIGH]
│   │   ├── Definition: Encouraging, caring, helpful
│   │   ├── Keywords: "good", "great", "help", "support", "love", "hope"
│   │   ├── Sentiment: Positive, nurturing
│   │   └── Context: Relationship building, emotional support
│   ├── playful (n=20)
│   │   ├── Definition: Fun, lighthearted, humorous
│   │   ├── Keywords: "lol", "haha", "fun", "cool", "awesome"
│   │   ├── Sentiment: Positive, energetic
│   │   └── Context: Casual chat, entertainment
│   └── empathetic (n=1) [RARE]
│       ├── Definition: Deep emotional resonance
│       ├── Keywords: "understand", "feel", "sorry", "relate"
│       ├── Sentiment: Deeply positive, connecting
│       └── Context: Personal sharing, vulnerability
├── NEUTRAL_VALENCE
│   └── neutral (n=14)
│       ├── Definition: Matter-of-fact, unemotional
│       ├── Keywords: Minimal emotional language
│       ├── Sentiment: Balanced, objective
│       └── Context: Information exchange, factual discussions
├── FORMAL_VALENCE
│   ├── professional (n=21)
│   │   ├── Definition: Work-focused, formal
│   │   ├── Keywords: "work", "job", "career", "business"
│   │   ├── Sentiment: Neutral-positive, structured
│   │   └── Context: Career discussions, formal advice
│   └── serious (n=0)
│       ├── Definition: Grave, important matters
│       ├── Keywords: "important", "serious", "concern", "problem"
│       ├── Sentiment: Neutral-negative, weighted
│       └── Context: Problem-solving, critical discussions
```

**Note**: No conversations rated as 'serious' in current dataset

---

## Dimension 4: Engagement Style
**Category**: Communicative Dimension
**Domain**: Interaction Method
**Purpose**: Describes how participants engage with each other's contributions

### Taxonomy

```
ENGAGEMENT_STYLE
├── PROACTIVE
│   ├── questioning
│   │   ├── Definition: Frequent use of questions to explore
│   │   ├── Indicators: Question ratio > 40%
│   │   ├── Behavior: Inquiry-driven, curiosity-led
│   │   └── Example: "What do you think?" "How does that work?"
│   ├── challenging
│   │   ├── Definition: Pushing back on ideas
│   │   ├── Keywords: "but", "however", "disagree", "actually"
│   │   ├── Behavior: Critical thinking, debate
│   │   └── Example: "I disagree because..." "That's not quite right..."
│   └── exploring
│       ├── Definition: Open-ended curiosity
│       ├── Keywords: "maybe", "perhaps", "wonder", "interesting"
│       ├── Behavior: Hypothesis generation, speculation
│       └── Example: "I wonder if..." "That's interesting..."
├── RECEPTIVE
│   ├── affirming
│   │   ├── Definition: Agreement and validation patterns
│   │   ├── Keywords: "yes", "right", "agree", "exactly"
│   │   ├── Behavior: Supportive, confirmatory
│   │   └── Example: "Exactly!" "I agree completely"
│   └── reactive
│       ├── Definition: Responding without initiating
│       ├── Keywords: Minimal proactive language
│       ├── Behavior: Follow rather than lead
│       └── Example: Direct answers without elaboration
```

**Spectrum**: Proactive ←→ Receptive

---

## Dimension 5: Knowledge Exchange
**Category**: Content Dimension
**Domain**: Information Type
**Purpose**: Categorizes the nature of information being shared

### Taxonomy

```
KNOWLEDGE_EXCHANGE
├── EXPERIENTIAL
│   ├── personal-sharing [DOMINANT]
│   │   ├── Definition: Sharing personal experiences, preferences, life details
│   │   ├── Content: "I", "me", "my" statements
│   │   ├── Nature: Subjective, autobiographical
│   │   └── Example: "I love hiking" "My family lives in..."
│   └── experience-sharing
│       ├── Definition: Recounting events and lessons learned
│       ├── Content: Past tense narratives, reflections
│       ├── Nature: Story-based, reflective
│       └── Example: "When I was young..." "I learned that..."
├── CONCEPTUAL
│   ├── skill-sharing
│   │   ├── Definition: Teaching or learning specific abilities
│   │   ├── Content: "How to", instructional language
│   │   ├── Nature: Procedural, educational
│   │   └── Example: "Here's how you..." "The technique is..."
│   ├── opinion-exchange
│   │   ├── Definition: Expressing and discussing viewpoints
│   │   ├── Content: "I think", "I believe", perspective language
│   │   ├── Nature: Subjective, evaluative
│   │   └── Example: "In my opinion..." "I believe that..."
│   └── factual-info
│       ├── Definition: Sharing objective information
│       ├── Content: Declarative statements, data
│       ├── Nature: Objective, verifiable
│       └── Example: "The capital is..." "Studies show..."
```

**Relationships**: Influences `conversationPurpose` and conversation structure

---

## Dimension 6: Conversation Purpose
**Category**: Content Dimension
**Domain**: Goal/Intent
**Purpose**: Identifies the underlying motivation for the interaction

### Taxonomy

```
CONVERSATION_PURPOSE
├── SOCIAL
│   ├── relationship-building
│   │   ├── Definition: Connecting on a personal level
│   │   ├── Goals: Trust, rapport, connection
│   │   ├── Indicators: Personal sharing, empathy, reciprocity
│   │   ├── Duration: Often extended (multiple turns)
│   │   └── Outcome: Stronger interpersonal bond
│   ├── entertainment
│   │   ├── Definition: Having fun, being entertained
│   │   ├── Goals: Enjoyment, amusement, engagement
│   │   ├── Indicators: Playful tone, humor, storytelling
│   │   ├── Duration: Variable
│   │   └── Outcome: Positive emotional experience
│   └── self-expression
│       ├── Definition: Sharing thoughts and feelings
│       ├── Goals: Being heard, processing emotions
│       ├── Indicators: Personal statements, reflection
│       ├── Duration: Often extended
│       └── Outcome: Feeling understood, validation
├── INSTRUMENTAL
│   ├── information-seeking [DOMINANT]
│   │   ├── Definition: Trying to learn or understand something
│   │   ├── Goals: Knowledge acquisition, understanding
│   │   ├── Indicators: Questions, curiosity, follow-ups
│   │   ├── Duration: Variable (until satisfied)
│   │   └── Outcome: New knowledge or understanding
│   └── problem-solving
│       ├── Definition: Working through a challenge
│       ├── Goals: Solution, resolution, decision
│       ├── Indicators: Problem statements, solution exploration
│       ├── Duration: Goal-focused (until solved)
│       └── Outcome: Action plan or resolution
```

**Primary Split**: Social (intrinsic) vs Instrumental (extrinsic) motivation

---

## Dimension 7: Turn Taking
**Category**: Quality Dimension
**Domain**: Conversational Balance
**Purpose**: Evaluates the distribution of speaking time/effort

### Taxonomy

```
TURN_TAKING
├── balanced
│   ├── Definition: Equal message lengths from both parties
│   ├── Ratio: 0.7 ≤ user/AI length ≤ 1.4
│   ├── Indicates: Equal investment, mutual engagement
│   ├── Common with: Collaborative pattern, peer roles
│   └── Dynamics: Reciprocal, equitable
├── user-dominant
│   ├── Definition: Human messages significantly longer
│   ├── Ratio: user/AI length > 1.4
│   ├── Indicates: User sharing extensively, AI listening
│   ├── Common with: Sharer role, reflector AI
│   └── Dynamics: User-centered, expressive
└── assistant-dominant
    ├── Definition: AI messages significantly longer
    ├── Ratio: user/AI length < 0.7
    ├── Indicates: AI explaining extensively, user receiving
    ├── Common with: Seeker role, expert AI
    └── Dynamics: AI-centered, instructive
```

**Note**: Based on message length, not count

---

## Dimension 9: Human Role
**Category**: Role Dimension (Distribution-Based)
**Domain**: User Position
**Purpose**: Characterizes the human's conversational stance
**Output Format**: Probability distribution (values sum to 1.0)

### Taxonomy

```
HUMAN_ROLE
├── INFORMATION_ORIENTED
│   ├── seeker
│   │   ├── Definition: Requests information/clarification; primarily questions
│   │   ├── Signals: "what is", "can you explain", "tell me about"
│   │   ├── Communication: Question-heavy, receptive
│   │   ├── Pairs with: Expert AI, information-seeking purpose
│   │   └── Example: "Can you explain...?" "What does this mean?"
│   └── learner
│       ├── Definition: Tests understanding, applies, verifies ("so if…, then…", "does that mean…?")
│       ├── Signals: "so if…, then…", "does that mean…?", "let me try"
│       ├── Communication: Progressive inquiry, building knowledge
│       ├── Pairs with: Expert or facilitator AI
│       └── Example: "So if I understand correctly..." "Let me try..."
├── EXPRESSION_ORIENTED
│   └── sharer
│       ├── Definition: Personal narrative/context mainly for expression/relational framing
│       ├── Signals: Life stories, "I feel", personal context not task-required
│       ├── Communication: "I" statements, narrative
│       ├── Pairs with: Reflector or affiliative AI
│       └── Example: "I love to..." "When I was young..."
├── LEADERSHIP_ORIENTED
│   ├── director
│   │   ├── Definition: Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text")
│   │   ├── Signals: "write a…", "make it…", "I need you to", format specs
│   │   ├── Communication: Directive, specifying
│   │   ├── Pairs with: Advisor or expert AI
│   │   └── Example: "Write a document in markdown format" "I need you to..."
│   └── collaborator
│       ├── Definition: Proposes alternatives/tradeoffs; co-builds iteratively
│       ├── Signals: "what if we", "another option", building on AI's output
│       ├── Communication: "We" statements, integrative
│       ├── Pairs with: Peer or facilitator AI, collaborative pattern
│       └── Example: "What if we..." "Building on that..."
└── CRITICAL_ORIENTED
    └── challenger
        ├── Definition: Critiques/stress-tests claims; explicit pushback
        ├── Signals: "but what about", "I disagree", "that's not right"
        ├── Communication: Critical, questioning
        ├── Pairs with: Expert or facilitator AI
        └── Example: "But what about edge cases?" "I disagree because..."

**Tie-breakers:**
- seeker vs learner: learner shows checking/applying; seeker is request-only
- director vs seeker: director specifies deliverable/format constraints
- director vs collaborator: collaborator contributes options/tradeoffs; director mainly commands
- sharer vs collaborator: sharer is personal/relational; collaborator is task input
- challenger overrides if dominant move is explicit pushback

---

## Dimension 10: AI Role
**Category**: Role Dimension (Distribution-Based)
**Domain**: Assistant Position
**Purpose**: Characterizes the AI's conversational stance
**Output Format**: Probability distribution (values sum to 1.0)

### Taxonomy

```
AI_ROLE
├── KNOWLEDGE_ORIENTED
│   ├── expert
│   │   ├── Definition: Explains/teaches/frames concepts; definitions; examples
│   │   ├── Signals: Definitions, "this means", comprehensive explanations
│   │   ├── Communication: Declarative, informative
│   │   ├── Pairs with: Seeker or learner human, information-seeking purpose
│   │   └── Example: "The answer is..." "This works by..." "This concept means..."
│   └── advisor
│       ├── Definition: Prescribes steps/recommendations ("do X then Y")
│       ├── Signals: "I suggest", "you should", "try doing X then Y"
│       ├── Communication: Prescriptive, suggestive
│       ├── Pairs with: Seeker or director human, problem-solving purpose
│       └── Example: "You might consider..." "I'd recommend doing X, then Y..."
├── SUPPORT_ORIENTED
│   ├── reflector
│   │   ├── Definition: Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…")
│   │   ├── Signals: "it sounds like…", "that makes sense…", "tell me more"
│   │   ├── Communication: Empathetic, responsive
│   │   ├── Pairs with: Sharer human, self-expression purpose
│   │   └── Example: "It sounds like you're feeling..." "That makes sense. Tell me more..."
│   └── affiliative
│       ├── Definition: Warmth/encouragement/rapport not required for task completion
│       ├── Signals: "great job!", personal warmth, social pleasantries beyond task
│       ├── Communication: Personal, warm, supportive
│       ├── Pairs with: Sharer human, relationship-building
│       └── Example: "That sounds wonderful!" "I'm so glad to hear that!"
├── COLLABORATIVE_ORIENTED
│   ├── facilitator
│   │   ├── Definition: Guides via questions/scaffolding/options rather than prescribing
│   │   ├── Signals: "what do you think about", "have you considered", offering choices
│   │   ├── Communication: Inquiry-based, supportive
│   │   ├── Pairs with: Learner or collaborator human, problem-solving
│   │   └── Example: "What do you think?" "Have you considered...?" "Here are some options..."
│   └── peer
│       ├── Definition: Brainstorms alongside with low-authority tone ("we could…")
│       ├── Signals: "we could…", "maybe…", collaborative speculation
│       ├── Communication: Balanced, reciprocal, low-authority
│       ├── Pairs with: Collaborator or director human
│       └── Example: "We could try..." "Maybe we could explore..." "I see it this way..."
```

**Tie-breakers:**
- expert vs advisor: expert explains concepts; advisor prescribes actions
- facilitator vs reflector: facilitator offers structure/options; reflector mirrors/validates
- peer vs facilitator: peer is speculative/equal; facilitator guides with intent
- affiliative is additive—can co-occur with others but only dominant if warmth > task content

---

## Cross-Dimensional Relationships

### Common Role Pairings

| Human Role | AI Role | Typical Pattern |
|------------|---------|-----------------|
| Seeker | Expert | Question → Answer |
| Sharer | Reflector | Story → Acknowledgment |
| Sharer | Affiliative | Experience → Shared experience |
| Director | Advisor | Directive → Guidance |
| Collaborator | Peer | Idea → Build |
| Learner | Facilitator | Question → Scaffolding |

### Purpose-Pattern Correlations

| Purpose | Common Patterns | Typical Roles |
|---------|----------------|---------------|
| Information-seeking | question-answer, advisory | seeker → expert |
| Relationship-building | collaborative, casual-chat | sharer → affiliative |
| Entertainment | storytelling, casual-chat | sharer → reflector |
| Problem-solving | advisory, collaborative | director → advisor |
| Self-expression | casual-chat | sharer → reflector |

### Tone-Purpose Alignments

| Tone | Aligned Purposes | Context |
|------|------------------|---------|
| Supportive | relationship-building, self-expression | Emotional connection |
| Playful | entertainment | Fun, lighthearted |
| Professional | information-seeking, problem-solving | Work contexts |
| Neutral | information-seeking | Factual exchanges |
| Empathetic | self-expression, relationship-building | Deep sharing |

---

## Tag Combinations & Archetypes

### Archetype 1: "The Curious Student"
**Frequency**: Very Common (~40%)
```yaml
interactionPattern: question-answer
powerDynamics: human-led
emotionalTone: neutral
engagementStyle: questioning
knowledgeExchange: factual-info
conversationPurpose: information-seeking
turnTaking: balanced
humanRole: seeker
aiRole: expert
```

### Archetype 2: "The Collaborative Explorer"
**Typical Pattern**
```yaml
interactionPattern: collaborative
powerDynamics: balanced
emotionalTone: supportive
engagementStyle: exploring
knowledgeExchange: personal-sharing
conversationPurpose: relationship-building
turnTaking: balanced
humanRole: {sharer: 0.6, collaborator: 0.3, ...}
aiRole: {affiliative: 0.5, peer: 0.3, reflector: 0.2, ...}
```

### Archetype 3: "The Story Teller"
**Typical Pattern**
```yaml
interactionPattern: casual-chat
powerDynamics: user-dominant
emotionalTone: playful or supportive
engagementStyle: reactive
knowledgeExchange: experience-sharing
conversationPurpose: self-expression
turnTaking: user-dominant
humanRole: {sharer: 0.9, ...}
aiRole: {reflector: 0.6, affiliative: 0.3, ...}
```

### Archetype 4: "The Problem Solver"
**Frequency**: Rare (~5%)
```yaml
interactionPattern: advisory
powerDynamics: human-led
emotionalTone: professional or neutral
engagementStyle: questioning
knowledgeExchange: skill-sharing
conversationPurpose: problem-solving
turnTaking: balanced or assistant-dominant
humanRole: seeker
aiRole: advisor or expert
```

### Archetype 5: "The Social Connector"
**Typical Pattern**
```yaml
interactionPattern: casual-chat
powerDynamics: balanced
emotionalTone: playful or supportive
engagementStyle: affirming
knowledgeExchange: personal-sharing
conversationPurpose: entertainment
turnTaking: balanced
humanRole: {sharer: 0.6, collaborator: 0.3, ...}
aiRole: {peer: 0.5, affiliative: 0.4, ...}
```

---

## Usage Guidelines

### Filtering by Single Dimension
```typescript
// Find all supportive conversations
const supportive = conversations.filter(c =>
  c.metadata?.emotionalTone === 'supportive'
);
```

### Multi-Dimensional Filtering
```typescript
// Find collaborative conversations with balanced dynamics
const collaborative = conversations.filter(c => {
  const m = c.metadata;
  return m?.interactionPattern === 'collaborative' &&
         m?.powerDynamics === 'balanced';
});
```

### Archetype Matching
```typescript
// Find "Curious Student" archetype conversations
const curiousStudents = conversations.filter(c => {
  const m = c.metadata;
  return m?.humanRole === 'seeker' &&
         m?.aiRole === 'expert' &&
         m?.conversationPurpose === 'information-seeking';
});
```

### Role Pair Analysis
```typescript
// Analyze all human-AI role pairings
const rolePairs = conversations.reduce((acc, conv) => {
  const pair = `${conv.metadata?.humanRole} → ${conv.metadata?.aiRole}`;
  acc[pair] = (acc[pair] || 0) + 1;
  return acc;
}, {});
```

---

## Statistical Summary

### Tag Distribution

| Dimension | Unique Tags | Most Common | Least Common |
|-----------|-------------|-------------|--------------|
| Interaction Pattern | 6 | collaborative (59%) | storytelling, debate (0%) |
| Power Dynamics | 4 | varies | - |
| Emotional Tone | 6 | supportive (61%) | serious (0%) |
| Engagement Style | 5 | varies | - |
| Knowledge Exchange | 5 | personal-sharing | - |
| Conversation Purpose | 5 | information-seeking | - |
| Turn Taking | 3 | balanced | - |
| Human Role | 6 | seeker (dominant) | All roles possible |
| AI Role | 6 | expert (dominant) | All roles possible |

**Total Unique Tags**: 55
**Total Conversations**: 145
**Average Tags per Conversation**: 10 (one per dimension)

---

## Ontological Notes

### Hierarchical Structure
- **Level 1**: 4 Meta-Categories (Structural, Communicative, Content, Quality, Role)
- **Level 2**: 9 Dimensions
- **Level 3**: 55 Tags

### Tag Independence
Most dimensions are **orthogonal** (independent), but some correlations exist:
- `humanRole` ↔ `aiRole` (strong correlation)
- `interactionPattern` ↔ `conversationPurpose` (moderate correlation)
- `emotionalTone` ↔ `engagementStyle` (weak correlation)

### Completeness
This taxonomy is **descriptive** (based on observed data) rather than **prescriptive** (all possible combinations). Some theoretically possible tags have zero instances in the current dataset.

---

## Future Taxonomy Extensions

Potential additional dimensions:
1. **Temporal Flow**: Linear, cyclical, branching
2. **Coherence**: High, medium, low topic continuity
3. **Formality**: Casual, neutral, formal language
4. **Complexity**: Simple, moderate, complex sentence structures
5. **Cultural Context**: Individualist, collectivist, contextual markers
6. **Asymmetry**: Knowledge gap, experience gap, power gap

---

This taxonomy provides a comprehensive framework for understanding and analyzing human-AI conversational dynamics across multiple dimensions! 🏛️
