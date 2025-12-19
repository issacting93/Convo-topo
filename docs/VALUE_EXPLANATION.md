# Understanding Communication Function and Conversation Structure Values

This document explains what the numeric values mean and how they're determined for different data sources.

## Value Ranges

### Communication Function (X-Axis)
- **0.0 - 0.4**: **Functional** (task-oriented, instrumental, problem-solving)
- **0.4 - 0.6**: **Mixed/Neutral** (somewhat balanced)
- **0.6 - 1.0**: **Social** (relational, expressive, emotion-focused)

### Conversation Structure (Y-Axis)
- **0.0 - 0.4**: **Structured** (directive, prescribed, rule-governed, predictable)
- **0.4 - 0.6**: **Mixed/Neutral** (somewhat balanced)
- **0.6 - 1.0**: **Emergent** (exploratory, spontaneous, open-ended, unpredictable)

---

## How Values Are Calculated

### For PersonaChat Messages (personaChatMessages.json)

PersonaChat uses **per-message heuristics** - each message is analyzed individually using keyword matching and simple rules.

#### Communication Function Calculation

```javascript
// Looks for keywords in the message text
instrumentalIndicators = ['what', 'how', 'when', 'where', 'why', 'can you', 
                          'do you', 'tell me', 'explain', 'help', 'need', 'want to']
expressiveIndicators = ['love', 'like', 'enjoy', 'feel', 'happy', 'excited', 
                        'wonderful', 'nice', 'great', 'awesome', 'sorry', 'hope', 'wish']

// Default: 0.3 (slightly functional)
// If expressive keywords > instrumental keywords: 0.4 + (expressiveCount × 0.1)
// If instrumental keywords > expressive keywords: 0.2 + (instrumentalCount × 0.05)
// Range: 0.1 to 0.9
```

**Example from your conversation:**
- `"hi , how are you doing today ?"` 
  - Contains "how" (instrumental) → **0.25** (functional)
- `"i really enjoy free diving"`
  - Contains "enjoy" (expressive) → **0.6** (social)

#### Conversation Structure Calculation

```javascript
// Checks message type
isQuestion = content.endsWith('?')
isCommand = startsWith('do', 'tell', 'help')
isStatement = !isQuestion && length > 20

// Default: 0.5 (middle)
// If question: 0.7 - (historyLength × 0.05) → Higher = more emergent
// If command: 0.3 → Lower = structured
// If statement: 0.5 - (historyLength × 0.03) → Lower = structured
// Range: 0.1 to 0.9
```

**Example from your conversation:**
- `"hi , how are you doing today ?"` 
  - Ends with "?" → **0.85** (emergent - questions are exploratory)
- `"i am spending time with my 4 sisters what are you up to"`
  - Contains "what are you" (question-like) → **0.83** (emergent)
- `"tell me more about yourself"`
  - Starts with "tell" (command) → **0.7** (less emergent, more structured)

---

## Why Your Conversation Shows High Emergent Values (0.83-0.86)

Looking at your selected conversation:

```
"hi , how are you doing today ?"                    → 0.85 (question)
"i am spending time with my 4 sisters what are you up to" → 0.83 (question-like)
"wow , four sisters . just watching game of thrones ."   → 0.83 (statement)
"that is a good show i watch that while drinking iced tea" → 0.83 (statement)
"i agree . what do you do for a living ?"          → 0.85 (question)
"tell me more about yourself"                      → 0.7  (command - lower!)
"i really enjoy free diving , how about you , have any hobbies ?" → 0.85 (question)
```

**Why so high?**
1. **Many questions** - Questions are marked as emergent (0.7+) because they open exploration
2. **Casual conversation** - Personal sharing and open-ended exchanges
3. **No strict structure** - Not following a rigid Q&A pattern or task completion

**The one exception:**
- `"tell me more about yourself"` → **0.7** (lower) because it's a **command** ("tell me"), which is more directive/structured

---

## Structured vs Emergent: What It Means

### Structured (0.0-0.4)
- **Predictable patterns**: Q&A, instructions, task completion
- **Clear roles**: One person asks, other answers
- **Goal-oriented**: Working toward a specific outcome
- **Examples**: 
  - "How do I install Python?" → Answer → "What version?" → Answer
  - "Write a function that..." → Result → "Now modify it to..." → Result

### Emergent (0.6-1.0)
- **Exploratory**: Open-ended questions, brainstorming
- **Spontaneous**: Topics shift naturally
- **Co-created**: Both parties contribute to direction
- **Examples**:
  - "How are you?" → "Good, watching TV" → "What show?" → "Game of Thrones" → "I love that show!"
  - "Tell me about yourself" → Personal sharing → "That's interesting, I also..."

---

## Different Data Sources Use Different Methods

### 1. PersonaChat (personaChatMessages.json)
- **Method**: Per-message keyword heuristics
- **Values**: Calculated individually for each message
- **Limitation**: Simple keyword matching, may not capture nuance
- **Your values**: 0.25-0.3 (functional), 0.83-0.86 (emergent)

### 2. Classified Conversations (conv-*.json, emo-*.json)
- **Method**: LLM-based classification of entire conversation
- **Values**: Calculated at conversation level, then applied to all messages
- **Advantage**: Considers context, roles, patterns across entire conversation
- **Uses**: Role distributions, interaction patterns, engagement styles

---

## Visual Mapping

```
                    SOCIAL (1.0)
                        ↑
                        |
    EMERGENT (1.0) ←────┼────→ STRUCTURED (0.0)
                        |
                        ↓
                  FUNCTIONAL (0.0)
```

**Your conversation's position:**
- **X (Communication Function)**: ~0.25-0.3 → **Functional** (left side)
  - Mostly informational questions, casual but task-oriented
- **Y (Conversation Structure)**: ~0.83-0.86 → **Emergent** (top)
  - Many questions, exploratory, open-ended

**Result**: Top-left quadrant = **Functional but Emergent**
- Like brainstorming solutions or exploring ideas together
- Not rigidly structured, but still somewhat task-focused

---

## Quick Reference

| Value Range | Meaning | Example |
|------------|---------|---------|
| **Communication Function** |
| 0.0-0.4 | Functional | "How do I install Python?" |
| 0.4-0.6 | Mixed | "I like Python, how do I install it?" |
| 0.6-1.0 | Social | "I love programming! What do you enjoy?" |
| **Conversation Structure** |
| 0.0-0.4 | Structured | "What is X?" → "X is..." → "Thanks" |
| 0.4-0.6 | Mixed | Some questions, some statements |
| 0.6-1.0 | Emergent | "How are you?" → "Good! You?" → "Great! I'm..." |

---

## Why Your Values Make Sense

Your conversation shows:
- **Low communicationFunction (0.25-0.3)**: Mostly informational questions, not deeply emotional
- **High conversationStructure (0.83-0.86)**: Many questions create exploratory, emergent flow

This is a **casual informational exchange** - functional (getting to know each other) but emergent (open-ended questions, natural flow).

