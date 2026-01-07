# Role Definitions: Human and AI Roles

## Overview

Roles are **interactional configurations observable in text**, not identities or relationships. They describe **how** participants position themselves in conversation, not **who** they are.

**Key principle:** Roles are output as **probability distributions** (values sum to 1.0), allowing for mixed roles. A person can be 60% seeker and 40% learner simultaneously.

---

## Human Roles

### 1. **Seeker** (Information-Oriented)
**Definition:** Requests information/clarification; primarily questions

**Signals:**
- "what is", "can you explain", "tell me about"
- Question-heavy, receptive communication
- Information requests without testing understanding

**Example:**
- "Can you explain what the security dilemma is?"
- "What does this mean?"
- "Tell me about X"

**Pairs with:** Expert AI, information-seeking purpose

**Distinction from learner:** Seeker is request-only; learner shows checking/applying

---

### 2. **Learner** (Information-Oriented)
**Definition:** Tests understanding, applies, verifies ("so if…, then…", "does that mean…?")

**Signals:**
- "so if…, then…", "does that mean…?", "let me try"
- Progressive inquiry, building knowledge
- Checking understanding, applying concepts

**Example:**
- "So if I understand correctly, X means Y?"
- "Does that mean I should do Z?"
- "Let me try applying this..."

**Pairs with:** Expert or facilitator AI

**Distinction from seeker:** Learner shows checking/applying; seeker is request-only

---

### 3. **Director** (Leadership-Oriented)
**Definition:** Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text")

**Signals:**
- "write a…", "make it…", "I need you to"
- Format specifications, constraints
- Directive, specifying communication

**Example:**
- "Write a document in markdown format"
- "I need you to create a summary"
- "Make it concise and professional"

**Pairs with:** Advisor or expert AI

**Distinction from seeker:** Director specifies deliverable/format constraints
**Distinction from collaborator:** Collaborator contributes options/tradeoffs; director mainly commands

---

### 4. **Collaborator** (Leadership-Oriented)
**Definition:** Proposes alternatives/tradeoffs; co-builds iteratively

**Signals:**
- "what if we", "another option", building on AI's output
- "We" statements, integrative communication
- Contributing options, iterating together

**Example:**
- "What if we tried X instead?"
- "Building on that, we could also..."
- "Another option might be..."

**Pairs with:** Peer or facilitator AI, collaborative pattern

**Distinction from director:** Collaborator contributes options/tradeoffs; director mainly commands
**Distinction from sharer:** Sharer is personal/relational; collaborator is task input

---

### 5. **Sharer** (Expression-Oriented)
**Definition:** Personal narrative/context mainly for expression/relational framing

**Signals:**
- Life stories, "I feel", personal context not task-required
- "I" statements, narrative communication
- Personal sharing for expression, not task completion

**Example:**
- "I love hiking in the mountains"
- "When I was young, I used to..."
- "I feel like this is important because..."

**Pairs with:** Reflector or affiliative AI

**Distinction from collaborator:** Sharer is personal/relational; collaborator is task input

---

### 6. **Challenger** (Critical-Oriented)
**Definition:** Critiques/stress-tests claims; explicit pushback

**Signals:**
- "but what about", "I disagree", "that's not right"
- Critical, questioning communication
- Explicit pushback, testing claims

**Example:**
- "But what about edge cases?"
- "I disagree because..."
- "That's not quite right, actually..."

**Pairs with:** Expert or facilitator AI

**Note:** Challenger overrides if dominant move is explicit pushback

---

## AI Roles

### 1. **Expert** (Knowledge-Oriented)
**Definition:** Explains/teaches/frames concepts; definitions; examples

**Signals:**
- Definitions, "this means", comprehensive explanations
- Declarative, informative communication
- Teaching, framing concepts

**Example:**
- "The answer is..."
- "This works by..."
- "This concept means..."

**Pairs with:** Seeker or learner human, information-seeking purpose

**Distinction from advisor:** Expert explains concepts; advisor prescribes actions

---

### 2. **Advisor** (Knowledge-Oriented)
**Definition:** Prescribes steps/recommendations ("do X then Y")

**Signals:**
- "I suggest", "you should", "try doing X then Y"
- Prescriptive, suggestive communication
- Action-oriented guidance

**Example:**
- "You might consider..."
- "I'd recommend doing X, then Y..."
- "Try this approach..."

**Pairs with:** Seeker or director human, problem-solving purpose

**Distinction from expert:** Expert explains concepts; advisor prescribes actions

---

### 3. **Facilitator** (Collaborative-Oriented)
**Definition:** Guides via questions/scaffolding/options rather than prescribing

**Signals:**
- "what do you think about", "have you considered", offering choices
- Inquiry-based, supportive communication
- Guiding through questions, not direct answers

**Example:**
- "What do you think?"
- "Have you considered...?"
- "Here are some options..."

**Pairs with:** Learner or collaborator human, problem-solving

**Distinction from reflector:** Facilitator offers structure/options; reflector mirrors/validates
**Distinction from peer:** Peer is speculative/equal; facilitator guides with intent

---

### 4. **Reflector** (Support-Oriented)
**Definition:** Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…")

**Signals:**
- "it sounds like…", "that makes sense…", "tell me more"
- Empathetic, responsive communication
- Mirroring, validating, inviting more

**Example:**
- "It sounds like you're feeling..."
- "That makes sense. Tell me more..."
- "I hear you saying..."

**Pairs with:** Sharer human, self-expression purpose

**Distinction from facilitator:** Facilitator offers structure/options; reflector mirrors/validates

---

### 5. **Peer** (Collaborative-Oriented)
**Definition:** Brainstorms alongside with low-authority tone ("we could…")

**Signals:**
- "we could…", "maybe…", collaborative speculation
- Balanced, reciprocal, low-authority communication
- Equal partnership, brainstorming together

**Example:**
- "We could try..."
- "Maybe we could explore..."
- "I see it this way..."

**Pairs with:** Collaborator or director human

**Distinction from facilitator:** Peer is speculative/equal; facilitator guides with intent

---

### 6. **Affiliative** (Support-Oriented)
**Definition:** Warmth/encouragement/rapport not required for task completion

**Signals:**
- "great job!", personal warmth, social pleasantries beyond task
- Personal, warm, supportive communication
- Relationship-building beyond task needs

**Example:**
- "That sounds wonderful!"
- "I'm so glad to hear that!"
- "You're doing great!"

**Pairs with:** Sharer human, relationship-building

**Note:** Affiliative is additive—can co-occur with others but only dominant if warmth > task content

---

## Key Distinctions

### Human Role Tie-Breakers

1. **seeker vs learner:**
   - Learner shows checking/applying; seeker is request-only
   - "What is X?" → seeker
   - "So if X, then Y?" → learner

2. **director vs seeker:**
   - Director specifies deliverable/format constraints
   - "What is X?" → seeker
   - "Write X in Y format" → director

3. **director vs collaborator:**
   - Collaborator contributes options/tradeoffs; director mainly commands
   - "Do X" → director
   - "What if we did X or Y?" → collaborator

4. **sharer vs collaborator:**
   - Sharer is personal/relational; collaborator is task input
   - "I love hiking" → sharer
   - "We could try approach X" → collaborator

5. **challenger:**
   - Overrides if dominant move is explicit pushback
   - "I disagree because..." → challenger

### AI Role Tie-Breakers

1. **expert vs advisor:**
   - Expert explains concepts; advisor prescribes actions
   - "X means Y" → expert
   - "Do X then Y" → advisor

2. **facilitator vs reflector:**
   - Facilitator offers structure/options; reflector mirrors/validates
   - "Have you considered X?" → facilitator
   - "It sounds like you're saying X" → reflector

3. **peer vs facilitator:**
   - Peer is speculative/equal; facilitator guides with intent
   - "We could try X" → peer
   - "What do you think about X?" → facilitator

4. **affiliative:**
   - Additive—can co-occur with others but only dominant if warmth > task content
   - "Great job! Here's the answer: X" → expert (task > warmth)
   - "That sounds wonderful! Tell me more!" → affiliative (warmth > task)

---

## Common Role Pairings

| Human Role | AI Role | Typical Pattern | Purpose |
|------------|---------|-----------------|---------|
| **Seeker** | **Expert** | Question → Answer | Information-seeking |
| Seeker | Advisor | Question → Guidance | Problem-solving |
| Learner | Facilitator | Question → Scaffolding | Learning |
| Director | Advisor | Directive → Guidance | Problem-solving |
| Director | Peer | Directive → Collaboration | Co-creation |
| Collaborator | Peer | Idea → Build | Collaborative |
| Sharer | Reflector | Story → Acknowledgment | Self-expression |
| Sharer | Affiliative | Experience → Shared experience | Relationship-building |
| Challenger | Expert | Pushback → Explanation | Critical inquiry |

---

## How Roles Are Determined

### Classification Method
Roles are classified by **LLM-based analysis** (GPT-4o-mini) which:
- Analyzes conversation text for role signals
- Outputs probability distributions (allows mixed roles)
- Provides evidence quotes for each role
- Assigns confidence scores

### Evidence-Based
- Roles must be **observable in text**
- No inference of private intent or internal emotion
- Evidence quotes must be exact excerpts from conversation
- Confidence scores reflect how clear the signals are

### Distribution Format
Roles are output as probability distributions that sum to 1.0:

```json
{
  "humanRole": {
    "distribution": {
      "seeker": 0.7,
      "learner": 0.2,
      "director": 0.1,
      "collaborator": 0.0,
      "sharer": 0.0,
      "challenger": 0.0
    },
    "confidence": 0.8
  }
}
```

This allows for **mixed roles** - a person can be primarily a seeker (0.7) but also show learner behavior (0.2).

---

## Role Hierarchies

### Human Roles by Orientation

**Information-Oriented:**
- Seeker (requests)
- Learner (verifies)

**Expression-Oriented:**
- Sharer (personal narrative)

**Leadership-Oriented:**
- Director (commands)
- Collaborator (co-builds)

**Critical-Oriented:**
- Challenger (pushback)

### AI Roles by Orientation

**Knowledge-Oriented:**
- Expert (explains)
- Advisor (prescribes)

**Support-Oriented:**
- Reflector (mirrors)
- Affiliative (warmth)

**Collaborative-Oriented:**
- Facilitator (guides)
- Peer (equal partner)

---

## Role Distribution in Your Dataset

Based on 345 conversations:

**Human Roles (dominant):**
- Seeker: 89.3% (information-seeking)
- Director: 7.8% (task-oriented)
- Learner: 1.2% (verification)
- Sharer: 0.9% (relational)
- Collaborator: 0.6% (co-creation)
- Challenger: 0.3% (critical)

**AI Roles (dominant):**
- Expert: 84.6% (explaining)
- Advisor: 8.7% (prescribing)
- Affiliative: 2.6% (warmth)
- Peer: 2.6% (equal)
- Facilitator: 0.9% (guiding)
- Reflector: 0.6% (mirroring)

**Most Common Pairing:**
- Seeker → Expert: 81.2% (classic information-seeking)

---

## Summary

Roles describe **interactional configurations** - how participants position themselves in conversation. They are:

- **Observable in text** (not inferred)
- **Probability distributions** (allows mixed roles)
- **Context-dependent** (same person can have different roles)
- **Evidence-based** (requires quotes from conversation)

The extreme skew toward **seeker → expert** (81.2%) in your dataset reveals the evaluation context (Chatbot Arena) where users test models rather than genuinely seeking help.

