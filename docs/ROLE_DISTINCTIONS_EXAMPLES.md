# Role Distinctions: Collaborator vs Director vs Sharer

**Analysis Date:** 2026-01-XX  
**Dataset:** 345 conversations  
**Purpose:** Explain why these three roles are categorized differently

---

## Quick Summary

| Role | Orientation | Key Distinction | Example Pattern |
|------|-------------|-----------------|-----------------|
| **Collaborator** | Leadership-Oriented | Co-builds iteratively, proposes alternatives, uses "we" language | "What if we tried X?" "Building on that..." |
| **Director** | Leadership-Oriented | Commands, specifies deliverables/constraints/formats | "Write a...", "Make it...", "I need you to..." |
| **Sharer** | Expression-Oriented | Personal narrative, relational framing, "I" statements | "I feel...", "When I was...", personal stories |

---

## Detailed Analysis

### 1. COLLABORATOR (Leadership-Oriented)

**Definition:** Proposes alternatives/tradeoffs; co-builds iteratively

**Key Signals:**
- "what if we", "another option", "building on that"
- "We" statements, integrative communication
- Contributing options, iterating together
- Co-creation language

**Why Leadership-Oriented?**
- Takes initiative in shaping the work
- Proposes alternatives and tradeoffs
- Actively contributes to building the solution
- But does so collaboratively, not commandingly

---

#### Example 1: Creative Co-Building
**File:** `wildchat_2ba2c0531ff1950d39dccd6a160fc98d`

**Role Distribution:** Collaborator (0.6), Sharer (0.4)  
**AI Role:** Facilitator (0.5), Reflector (0.5)

**Conversation Excerpt:**
```
User: Write dialogue from a scene from the animated teen "Jane", where 14 year old Jane, 
      Jane's 14 year old girlfriend Sam, Jane's 14 year old friend and neighbor...

Assistant: [Provides dialogue scene]

User: Continue, Julia tells everyone her two favourite SCPs (which are SCP-173 and SCP-529)...

Assistant: [Continues with Julia's dialogue about SCPs]

User: You're definitely cool in our book.
```

**Why Collaborator?**
- **Co-building:** User builds on AI's output ("Continue, Julia tells...")
- **Iterative:** Extends the scene collaboratively
- **Integrative:** "You're definitely cool in our book" - relational but also co-creative
- **Not directive:** Doesn't command format/constraints
- **Not just sharing:** The personal element ("our book") serves the co-creation, not pure expression

**Evidence Quote:** "You're definitely cool in our book" - collaborative acknowledgment

---

#### Example 2: Problem-Solving Collaboration
**File:** `chatbot_arena_29429`

**Role Distribution:** Director (0.65), Collaborator (0.55) - **Mixed role**  
**AI Role:** Expert (0.4), Facilitator (0.3), Advisor (0.2)

**Conversation Excerpt:**
```
User: This is a riddle question... You are in competition with another LLM...

Assistant: [Provides solution]

User: Both of you gave the wrong answer. So you get a second try...

Assistant: [Revises solution]

User: One of you was very close... (I call you modelA). But applied it wrongly overall. 
      Model A, please tell me again step by step...
```

**Why Collaborator (despite also being Director)?**
- **Iterative refinement:** User provides feedback and asks for revision
- **Co-building understanding:** "One of you was very close" - acknowledges AI's contribution
- **Collaborative problem-solving:** Works together to solve the riddle
- **But also Director:** "Model A, please tell me again step by step" - directive element

**Key Distinction:** The collaborator aspect shows in the iterative, feedback-driven approach. The director aspect shows in the explicit commands.

---

#### Example 3: Scenario Co-Creation
**File:** `wildchat_0120c934837e9254a3605de3a2c1d28a`

**Role Distribution:** Collaborator (0.6), Tester (0.2)  
**AI Role:** Facilitator (0.5), Peer (0.5)

**Conversation Excerpt:**
```
User: Chuck E. Cheese (In Full Potential and Serious Mode with -Extreme confidence
      -Full Saiyan DNA -100% Saiyan will power -COMPLETE DNA Infusion...

Assistant: [Describes Chuck E. Cheese's power]

User: How would it go down...

Assistant: [Describes the battle scenario]

User: What if Saiyan SpongeBob's Crew and Chuck E. Cheese Crew were in Greek Mythology...

Assistant: [Expands the scenario into Greek mythology]
```

**Why Collaborator?**
- **"What if" language:** Classic collaborator signal
- **Co-building scenarios:** Each turn expands the creative world
- **Iterative development:** Builds on previous exchanges
- **Peer-like interaction:** AI responds as creative partner, not just executor

**Evidence Quote:** "What if Saiyan SpongeBob's Crew and Chuck E. Cheese Crew were in Greek Mythology..." - proposing alternatives/expansions

---

### 2. DIRECTOR (Leadership-Oriented)

**Definition:** Specifies deliverables/constraints/formats/next actions

**Key Signals:**
- "write a...", "make it...", "I need you to"
- Format specifications, constraints
- Directive, specifying communication
- Task-oriented commands

**Why Leadership-Oriented?**
- Takes control of the interaction
- Specifies what needs to be done
- Sets constraints and formats
- Commands rather than collaborates

---

#### Example 1: Academic Writing Task
**File:** `wildchat_62818bf205d2dc155170a370b60ae9a0`

**Role Distribution:** Director (0.65), Seeker (0.3), Learner (0.2)  
**AI Role:** Expert (0.6), Advisor (0.4)

**Conversation Excerpt:**
```
User: Below is a paragraph from an academic paper.
      Polish the writing to meet the academic style, improve the spelling, grammar, 
      clarity, concision and overall quality.

Assistant: [Provides polished paragraph]

User: Below is a paragraph from an academic paper.
      Polish the writing to meet the academic style, improve the spelling, grammar, 
      clarity, concision and overall quality.

Assistant: [Provides another polished paragraph]

User: Below is a paragraph from an academic paper.
      Polish the writing to meet the academic style, improve the spelling, grammar, 
      clarity, concision and overall quality.
```

**Why Director?**
- **Explicit command:** "Polish the writing to meet the academic style"
- **Format specification:** "academic style" - sets constraints
- **Repeated directive:** Same command structure repeated
- **Task-oriented:** Clear deliverable (polished text)
- **No collaboration:** Doesn't propose alternatives or build together
- **No personal sharing:** Pure task execution

**Evidence Quote:** "Polish the writing to meet the academic style" - directive with constraints

**Key Distinction from Collaborator:**
- Director: "Do this, in this format" (command)
- Collaborator: "What if we tried this?" (proposal)

---

#### Example 2: Riddle Evaluation (Mixed with Collaborator)
**File:** `chatbot_arena_29429`

**Role Distribution:** Director (0.65), Collaborator (0.55) - **Mixed role**  
**AI Role:** Expert (0.4), Facilitator (0.3)

**Conversation Excerpt:**
```
User: This is a riddle question... You are in competition with another LLM...

Assistant: [Provides solution]

User: Both of you gave the wrong answer. So you get a second try...

User: One of you was very close... (I call you modelA). But applied it wrongly overall. 
      Model A, please tell me again step by step...
```

**Why Director (in this context)?**
- **"Model A, please tell me again step by step"** - explicit directive
- **Evaluation context:** User is testing/commanding the AI
- **Step-by-step specification:** Sets format for response
- **Control:** User directs how the AI should respond

**Key Distinction:** The director aspect is in the explicit commands ("tell me again step by step"). The collaborator aspect is in the iterative feedback and acknowledgment.

---

#### Example 3: Translation Task
**File:** `wildchat_1a72c94e30644769cc40f4f8b7147773`

**Role Distribution:** Director (0.7), Teacher-Evaluator (0.3)  
**AI Role:** Expert (0.5), Advisor (0.3), Facilitator (0.2)

**Conversation Excerpt:**
```
User: Below is a paragraph from an academic paper. Polish the writing to meet the 
      academic style, improve the spelling, grammar, clarity, concision and overall quality.

Assistant: [Provides polished text]

User: Below is a paragraph from an academic paper. Polish the writing...

User: I want you to act as a scientific Chinese-English translator, I will provide you 
      with some paragraphs in one language and your task is to accurately and fluently 
      translate them into the other language...
```

**Why Director?**
- **Role assignment:** "I want you to act as a scientific Chinese-English translator"
- **Task specification:** "your task is to accurately and fluently translate"
- **Format constraints:** "scientific" - sets domain/style
- **Directive language:** "I want you to", "your task is"
- **No collaboration:** Pure task assignment

**Evidence Quote:** "I want you to act as a scientific Chinese-English translator" - explicit role/task directive

---

### 3. SHARER (Expression-Oriented)

**Definition:** Personal narrative/context mainly for expression/relational framing

**Key Signals:**
- Life stories, "I feel", personal context not task-required
- "I" statements, narrative communication
- Personal sharing for expression, not task completion
- Relational framing

**Why Expression-Oriented?**
- Focuses on personal expression
- Relational/emotional content
- Not task-oriented
- Not collaborative problem-solving

---

#### Example 1: Abstract/Philosophical Sharing
**File:** `chatbot_arena_17370`

**Role Distribution:** Sharer (0.6), Philosophical-Explorer (0.4)  
**AI Role:** Unable-to-Engage (1.0) - AI doesn't understand

**Conversation Excerpt:**
```
User: To invoke the hive-mind representing chaos....

Assistant: What do you mean by "invoke the hive-mind representing chaos"?

User: Invoking the feeling of chaos....

Assistant: How do you mean?

User: Without order....

Assistant: What do you mean without order?
```

**Why Sharer?**
- **Abstract expression:** "invoke the hive-mind representing chaos"
- **Personal/poetic language:** Not task-oriented
- **Relational framing:** Trying to share a feeling/concept
- **Not directive:** Not asking for a deliverable
- **Not collaborative:** Not co-building something
- **Expression-focused:** Sharing an idea/feeling, not solving a problem

**Evidence Quote:** "To invoke the hive-mind representing chaos" - abstract, expressive sharing

**Key Distinction:**
- Sharer: "I want to express/share this feeling" (expression)
- Director: "Do this task" (command)
- Collaborator: "What if we built this?" (co-creation)

---

#### Example 2: Personal Narrative Sharing
**File:** `wildchat_2fbf4014e45e0be01ca4052f4857ab80`

**Role Distribution:** Sharer (1.0) - Pure sharer  
**AI Role:** Creative-Partner (1.0)

**Conversation Excerpt:**
```
User: Write a story about me having on Megan Olivi, the format set for her consisted of 
      having a conversation and play truth or dare with cards. She wore a...

Assistant: [Writes the story]

User: continue the story, Describe step by step how Megan completed the dare...
```

**Why Sharer?**
- **Personal narrative:** "Write a story about me having on Megan Olivi"
- **Relational context:** Personal scenario/fantasy
- **Expression-oriented:** Sharing a personal scenario, not task completion
- **"I" focus:** Story is about the user's personal experience
- **Not directive in task sense:** While it asks for a story, the content is personal/relational

**Evidence Quote:** "Write a story about me having on Megan Olivi" - personal narrative sharing

**Key Distinction from Director:**
- Director: "Write a document in markdown format" (task + format)
- Sharer: "Write a story about me..." (personal content, relational)

---

#### Example 3: Personal Experience Sharing (Korean)
**File:** `wildchat_30a57cc31a432eeb85a97d34417414ba`

**Role Distribution:** Sharer (0.6), Tester (0.4)  
**AI Role:** Reflector (0.5), Peer (0.5)

**Conversation Excerpt:**
```
User: [Korean text about soccer/football story]

Assistant: [Translates and continues]

User: continue...

User: [More Korean text about personal soccer experience]
      '축구장에서 뛰어다닐 수 있다는 것 자체만으로 행복했기 때문에.'
      (Translation: 'Just being able to run around on the soccer field made me happy.')

User: '와···. 메날두는 항상 이런 느낌이려나.'
      (Translation: 'Wow... Is this how Messi always feels?')
```

**Why Sharer?**
- **Personal experience:** Sharing feelings about soccer
- **Emotional expression:** "Just being able to run around... made me happy"
- **Relational reflection:** "Is this how Messi always feels?" - personal connection
- **"I" statements:** Personal feelings and experiences
- **Not task-oriented:** Not asking for information or a deliverable
- **Not collaborative:** Not co-building something

**Evidence Quote:** "'축구장에서 뛰어다닐 수 있다는 것 자체만으로 행복했기 때문에.'" - personal emotional sharing

---

## Key Distinctions Summary

### Collaborator vs Director

**Both are Leadership-Oriented, but:**

| Aspect | Collaborator | Director |
|--------|--------------|----------|
| **Language** | "What if we...", "Building on that..." | "Write a...", "Make it...", "I need you to..." |
| **Approach** | Proposes alternatives, co-builds | Commands, specifies constraints |
| **Relationship** | Peer-like, iterative | Hierarchical, directive |
| **Example** | "What if we tried X instead?" | "Polish the writing to meet academic style" |

**Key Test:** Does the user propose alternatives and build together? → Collaborator  
Does the user command with specific constraints? → Director

---

### Collaborator vs Sharer

**Different orientations entirely:**

| Aspect | Collaborator | Sharer |
|--------|-------------|--------|
| **Orientation** | Leadership-Oriented | Expression-Oriented |
| **Focus** | Task/co-creation | Personal expression |
| **Language** | "We", "What if we...", task-focused | "I", personal stories, feelings |
| **Purpose** | Build something together | Express/share personal content |
| **Example** | "What if we added Greek mythology?" | "I feel happy when I play soccer" |

**Key Test:** Is the user contributing to building something? → Collaborator  
Is the user sharing personal feelings/stories? → Sharer

---

### Director vs Sharer

**Completely different orientations:**

| Aspect | Director | Sharer |
|--------|----------|--------|
| **Orientation** | Leadership-Oriented | Expression-Oriented |
| **Focus** | Task completion | Personal expression |
| **Language** | Commands, constraints | "I" statements, stories |
| **Purpose** | Get a deliverable | Express/share |
| **Example** | "Write a document in markdown" | "I love hiking in the mountains" |

**Key Test:** Is the user commanding a task? → Director  
Is the user sharing personal content? → Sharer

---

## Why These Categorizations Matter

### 1. **Relational Positioning**

- **Collaborator:** Positions as peer/co-creator → Collaborative relationship
- **Director:** Positions as commander → Hierarchical relationship
- **Sharer:** Positions as expresser → Relational/affiliative relationship

### 2. **Terrain Mapping**

- **Collaborator:** Tends toward Social/Emergent (co-creation, relational work)
- **Director:** Tends toward Functional/Structured (task-oriented, directive)
- **Sharer:** Tends toward Social/Emergent (expression, relational framing)

### 3. **AI Role Pairing**

- **Collaborator** → Facilitator, Peer (collaborative AI roles)
- **Director** → Expert, Advisor (knowledge-providing AI roles)
- **Sharer** → Reflector, Affiliative (supportive AI roles)

### 4. **Dataset Distribution**

- **Collaborator:** 32 conversations (9.3%) - Rare but distinct
- **Director:** 18 conversations (5.2%) - Less common
- **Sharer:** 9 conversations (2.6%) - Very rare

**Why rare?** Chatbot Arena dataset is evaluation-focused, so most conversations are seeker→expert (information-seeking). These roles represent different relational configurations that are less common in evaluation contexts.

---

## Conclusion

These three roles are categorized differently because they represent **fundamentally different ways of positioning oneself in conversation**:

1. **Collaborator** (Leadership-Oriented): Co-builds, proposes, iterates → **"We build together"**
2. **Director** (Leadership-Oriented): Commands, specifies, controls → **"You do this"**
3. **Sharer** (Expression-Oriented): Expresses, shares, relates → **"I feel/share this"**

The distinctions are observable in language patterns, relationship dynamics, and interaction purposes. The terrain visualization makes these different relational configurations visible, even when they're rare in the dataset.

---

## Additional Examples

### Collaborator Examples

See detailed collaborator examples in the sections above. Key patterns:
- Iterative co-creation (building on previous output)
- Proposing alternatives ("what if we", "another option")
- Active participation (not just requesting, but doing together)
- Collaborative constraints (specifying requirements collaboratively)
- "We" statements (integrative communication)

**Example conversations:**
- `chatbot_arena_0440` - Co-creating jokes (iterative modifications)
- `chatbot_arena_21435` - Game collaboration (active participation)
- `wildchat_e54cb69a68f7f5d2173a6131641351ab` - Creative content collaboration (constraints)
- `wildchat_a1d0d6eb652ceed256cfdb704b731ab6` - ⚠️ **MISCLASSIFIED:** Classified as collaborator (1.0) but content shows director behavior ("Write a forum conversation where...", "Write a follow up where..."). Should be director, not collaborator.
- `chatbot_arena_30088` - Problem-solving collaboration (complex analysis)

### Director Examples

See detailed director examples in the sections above. Key patterns:
- Explicit instructions ("I want you to...", "Do this...")
- Format specifications ("in markdown format", "in less than 100 words")
- Constraints and rules ("do not...", "only...", "when necessary...")
- Repeated commands (multiple similar directives)
- Task-oriented (clear deliverables and specifications)

**Example conversations:**
- `chatbot_arena_0141` - Pure director (100% director, terminal emulation)
- `wildchat_1a72c94e30644769cc40f4f8b7147773` - Content rewriting director (academic polishing)
- `wildchat_1250880a2e4b49fa2b138933af8774c6` - Rewrite director (blog style)
- `wildchat_62818bf205d2dc155170a370b60ae9a0` - Academic writing director (repeated directives)

**Key distinction:** Director gives commands with specifications, not proposals (collaborator).

---

## Files Referenced

- **Role Definitions:** `docs/ROLE_DEFINITIONS.md`
- **Conversation Data:** `public/output/*.json`
- **Role Metadata:** `docs/ROLE_METADATA.md`
- **Role Relationships:** `docs/ROLE_RELATIONSHIP_MAPPING.md`

