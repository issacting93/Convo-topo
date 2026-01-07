# Axis Values Explained: Simple Guide

## Quick Overview

Your conversations are positioned in a **3D space** with three axes. Each axis goes from **0.0 to 1.0**.

> **Important:** These axes represent *relative conversational positioning*, not objective psychological states or user traits. They describe interactional configurations observable in text, not fixed identities or relationships.

```
     Z (Height)
     ↑
     |
     |
     +----→ X (Left/Right)
    /
   /
  Y (Depth/Forward-Back)
```

---

## X-Axis: Functional ↔ Social (Left ↔ Right)

**Range**: 0.0 (Functional) ↔ 1.0 (Social)

### What It Means:
- **0.0 - 0.4 (Left side)**: **Functional** - Task-oriented, getting things done
  - Examples: "Write me code", "How do I fix this?", "What is X?"
  - Goal: Completing a task or getting information
  
- **0.6 - 1.0 (Right side)**: **Social** - Relationship-focused, personal
  - Examples: "How are you?", "I'm feeling stressed", "Tell me a story"
  - Goal: Building connection, expressing feelings, entertainment

- **0.4 - 0.6 (Middle)**: Mixed - Some task, some social

### How It's Calculated:
1. **Primary**: Analyzes actual message text for task vs. social language
2. **Secondary signal**: When linguistic evidence is weak or sparse, role distributions provide a coarse positioning estimate
   - Director/Challenger roles → Lower X (functional)
   - Sharer/Collaborator roles → Higher X (social)
   - Seeker/Learner → Middle range

### Visual:
```
Functional (0.0) ←───────────────→ Social (1.0)
   [Task]                          [Relationship]
```

---

## Y-Axis: Aligned ↔ Divergent (Front ↔ Back)

**Range**: 0.0 (Aligned) ↔ 1.0 (Divergent)

### What It Means:
- **0.0 - 0.4 (Front)**: **Aligned** - Human and AI use similar language styles
  - Both formal, or both casual
  - Linguistic convergence - matching each other's style
  
- **0.6 - 1.0 (Back)**: **Divergent** - Human and AI maintain different linguistic styles
  - One formal, one casual
  - Linguistic divergence - different styles
  - **Note**: This does *not* imply failure or conflict — divergence can reflect expertise, role separation, or intentional contrast.

- **0.4 - 0.6 (Middle)**: Partially aligned

### How It's Calculated:
1. **Primary**: Compares linguistic features between human and AI messages
   - 7 features: Formality, politeness, certainty, structure, question-asking, inclusive language, register
   - Uses cosine similarity to measure how similar/different the styles are
2. **Fallback**: When messages unavailable, approximated from AI role distribution
   - Expert/Advisor roles → Lower Y (more aligned)
   - Peer/Facilitator roles → Higher Y (more divergent)

### Visual:
```
Aligned (0.0) ←───────────────→ Divergent (1.0)
[Similar]                       [Different]
```

---

## Z-Axis: Low ↔ High Emotional Intensity (Low ↔ High)

**Range**: 0.0 (Low Intensity) ↔ 1.0 (High Intensity)

### What It Means:
- **0.0 - 0.4 (Low/Valleys)**: **Low Intensity** - Calm, relaxed, steady
  - Low emotional intensity
  - Stable, predictable interactions
  
- **0.6 - 1.0 (High/Peaks)**: **High Intensity** - Emotionally charged, urgent, or intense
  - High emotional intensity
  - May reflect frustration, urgency, excitement, or emotionally charged engagement — not only negative affect

- **0.4 - 0.6 (Middle)**: Moderate intensity

### How It's Calculated:
Uses **PAD model** (Pleasure-Arousal-Dominance):

```
emotionalIntensity = (1 - pleasure) × 0.6 + arousal × 0.4
```

- **Pleasure**: 0 = frustrated, 1 = satisfied
- **Arousal**: 0 = calm, 1 = agitated
- **Dominance**: Calculated but not used in formula

### Visual:
```
Low Intensity (0.0) ←───────────────→ High Intensity (1.0)
[Valleys]                              [Peaks]
```

---

## How to Read a Conversation's Position

### Example 1: Technical Q&A
- **X = 0.3** (Functional) - Task-oriented
- **Y = 0.2** (Aligned) - Both using similar technical language
- **Z = 0.3** (Low Intensity) - Straightforward, steady interaction
- **Position**: Front-left, low height (functional, aligned, low intensity)

### Example 2: Personal Storytelling
- **X = 0.8** (Social) - Relationship-focused
- **Y = 0.7** (Divergent) - Human casual, AI formal
- **Z = 0.4** (Moderate) - Some emotional content
- **Position**: Back-right, medium height (social, divergent, moderate)

### Example 3: High-Intensity Interaction
- **X = 0.4** (Mixed) - Some task, some emotion
- **Y = 0.6** (Divergent) - User and AI maintain different styles
- **Z = 0.8** (High Intensity) - Emotionally charged (could be frustration, urgency, or high engagement)
- **Position**: Back-middle, high peak (mixed, divergent, high intensity)

---

## The 3D Space

```
                    Social (1.0)
                        ↑
                        |
        Divergent (1.0) │
            ←───────────┼───────────→ Aligned (0.0)
                        │
                        ↓
                  Functional (0.0)

Z-axis (height): Calm (low) ↔ Agitated (high)
```

### Quadrants (X-Y plane):
- **Front-Left (Aligned + Functional)**: Structured task work
- **Front-Right (Aligned + Social)**: Harmonious social interaction
- **Back-Left (Divergent + Functional)**: Mismatched task interaction
- **Back-Right (Divergent + Social)**: Stylistically different social exchange

---

## Common Questions

### Q: Why do some conversations have the same X/Y but different Z?
**A**: X and Y measure **what** is being discussed and **how** it's structured. Z measures **emotional intensity**. Two conversations can be functionally identical but have very different emotional tones.

### Q: What if a conversation is exactly 0.5 on an axis?
**A**: That means it's in the middle - neither clearly functional nor social, or neither clearly aligned nor divergent. This is common for mixed conversations.

### Q: Can a conversation be at (0.0, 0.0, 0.0)?
**A**: Yes! That would be: Functional, Aligned, and Low Intensity - like a very straightforward, steady task completion.

### Q: What does it mean if Z is high but X is social?
**A**: High emotional intensity in a social context - could be intense personal sharing, emotional support, excitement, or relationship conflict. High Z doesn't necessarily mean negative - it measures intensity, not valence.

---

## Where These Values Come From

1. **Classification** (Level 3 - Macro analysis):
   - Analyzes the whole conversation
   - Produces role distributions, interaction patterns, etc.

2. **Linguistic Analysis**:
   - Analyzes actual message text
   - Compares human vs. AI language features

3. **PAD Calculation**:
   - Analyzes emotional content per message
   - Calculates pleasure, arousal, dominance

---

## In the Visualization

- **X-axis**: Left/Right position on terrain
- **Y-axis**: Forward/Back position on terrain (depth)
- **Z-axis**: Height of markers (peaks = high intensity, valleys = low intensity)

The terrain itself is generated from the classification, but individual messages are positioned using these X/Y/Z coordinates.

