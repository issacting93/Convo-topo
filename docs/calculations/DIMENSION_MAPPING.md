# Dimension Mapping: How Structured/Emergent and Functional/Social Are Determined

This document explains how the visualization system maps classification data to the two primary dimensions used for positioning conversations on the terrain.

## Overview

The system uses a **priority-based fallback system** to map 10-dimensional classification data to 2 visualization dimensions:

1. **X-Axis: Functional ↔ Social** (0.0 = functional, 1.0 = social)
2. **Y-Axis: Structured ↔ Emergent** (0.0 = structured, 1.0 = emergent)

---

## X-Axis: Functional ↔ Social

**Definition:**
- **Functional (0.0-0.4)**: Task-oriented, instrumental, problem-solving conversations
- **Social (0.6-1.0)**: Relational, expressive, emotion-focused conversations

### Priority 1: Role-Based Positioning (Primary Method)

Uses the **human role distribution** from classification (Dimension 9):

```typescript
// Weighted calculation based on human role probabilities
roleBasedX = 
  (director × 0.2) +      // Very functional - giving commands
  (challenger × 0.3) +    // Functional - critical analysis
  (sharer × 0.8) +        // Very social - personal expression
  (collaborator × 0.7) +  // Social - co-creation
  (seeker × 0.4) +        // Somewhat functional - asking questions
  (learner × 0.5);        // Neutral - testing understanding
```

**Used when:** Maximum role probability > 0.3 (meaningful role data exists)

**Rationale:**
- **Director/Challenger** → Lower X (functional): Task-focused, directive behavior
- **Sharer/Collaborator** → Higher X (social): Relational, expressive behavior
- **Seeker/Learner** → Middle range: Can be either depending on context

### Fallback 2: Purpose-Based Mapping

If role data is insufficient, uses **conversation purpose** (Dimension 6):

| Purpose Category | X-Value Range | Rationale |
|-----------------|---------------|-----------|
| `entertainment`, `relationship-building`, `self-expression` | 0.7 - 0.9 | Social purposes → high X |
| `information-seeking`, `problem-solving` | 0.1 - 0.3 | Functional purposes → low X |

**Formula:**
- Social purposes: `0.7 + (confidence × 0.2)` → ranges 0.7-0.9
- Functional purposes: `0.1 + (confidence × 0.2)` → ranges 0.1-0.3

### Fallback 3: Knowledge Exchange

If purpose is unclear, uses **knowledge exchange type** (Dimension 5):

| Knowledge Type | X-Value | Rationale |
|---------------|---------|-----------|
| `personal-sharing`, `experience-sharing` | 0.6 | Personal/relational content |
| `factual-info`, `skill-sharing` | 0.3 | Task-oriented content |

### Default

If none of the above apply: **0.5** (middle of the spectrum)

---

## Y-Axis: Structured ↔ Emergent

**Definition:**
- **Structured (0.0-0.4)**: Directive, prescriptive, predictable conversation patterns
- **Emergent (0.6-1.0)**: Exploratory, spontaneous, open-ended conversation patterns

### Priority 1: Role-Based Positioning (Primary Method)

Uses the **AI role distribution** from classification (Dimension 10):

```typescript
// Weighted calculation based on AI role probabilities
roleBasedY = 
  (expert × 0.3) +        // Structured - authoritative teaching
  (advisor × 0.2) +      // Very structured - prescriptive
  (facilitator × 0.7) +  // Emergent - guiding exploration
  (peer × 0.8) +         // Very emergent - equal collaboration
  (reflector × 0.6) +    // Somewhat emergent - validating/exploring
  (affiliative × 0.5);   // Neutral - social warmth
```

**Used when:** Maximum role probability > 0.3 (meaningful role data exists)

**Rationale:**
- **Expert/Advisor** → Lower Y (structured): Prescriptive, authoritative responses
- **Peer/Facilitator** → Higher Y (emergent): Exploratory, collaborative responses
- **Reflector** → Middle-high: Validates and invites elaboration (somewhat emergent)

### Fallback 2: Pattern-Based Mapping

If role data is insufficient, uses **interaction pattern** (Dimension 1):

| Pattern Category | Y-Value Range | Rationale |
|------------------|---------------|-----------|
| `collaborative`, `casual-chat`, `storytelling` | 0.7 - 0.9 | Emergent patterns → high Y |
| `question-answer`, `advisory` | 0.1 - 0.3 | Structured patterns → low Y |

**Formula:**
- Emergent patterns: `0.7 + (confidence × 0.2)` → ranges 0.7-0.9
- Structured patterns: `0.1 + (confidence × 0.2)` → ranges 0.1-0.3

### Fallback 3: Engagement Style

If pattern is unclear, uses **engagement style** (Dimension 4):

| Engagement Style | Y-Value | Rationale |
|------------------|---------|-----------|
| `exploring`, `questioning` | 0.7 | Open-ended exploration |
| `reactive`, `affirming` | 0.4 | Following structure |

### Default

If none of the above apply: **0.5** (middle of the spectrum)

---

## Visual Summary

```
                    SOCIAL (1.0)
                        ↑
                        |
    EMERGENT (1.0) ←────┼────→ STRUCTURED (0.0)
                        |
                        ↓
                  FUNCTIONAL (0.0)
```

**Quadrants:**
- **Top-Left (Social + Emergent)**: Personal storytelling, open exploration
- **Top-Right (Social + Structured)**: Relationship-building with clear structure
- **Bottom-Left (Functional + Emergent)**: Collaborative problem-solving
- **Bottom-Right (Functional + Structured)**: Task-oriented Q&A, instructions

---

## Example Mappings

### Example 1: Technical Q&A
- **Human Role**: `{seeker: 0.8, learner: 0.2}` → X ≈ 0.4 (functional)
- **AI Role**: `{expert: 0.9, advisor: 0.1}` → Y ≈ 0.3 (structured)
- **Result**: Bottom-right quadrant (Functional + Structured)

### Example 2: Personal Storytelling
- **Human Role**: `{sharer: 0.9, collaborator: 0.1}` → X ≈ 0.8 (social)
- **AI Role**: `{reflector: 0.7, facilitator: 0.3}` → Y ≈ 0.65 (emergent)
- **Result**: Top-left quadrant (Social + Emergent)

### Example 3: Collaborative Brainstorming
- **Human Role**: `{collaborator: 0.6, director: 0.4}` → X ≈ 0.5 (middle)
- **AI Role**: `{peer: 0.8, facilitator: 0.2}` → Y ≈ 0.8 (emergent)
- **Result**: Top-middle (Emergent, balanced functional/social)

---

## Why This Approach?

1. **Role-based positioning is prioritized** because roles capture interactional dynamics more directly than categorical labels
2. **Fallback system ensures robustness** - even if some classification dimensions are missing, the system can still position conversations
3. **Weighted calculations** allow for mixed roles (conversations often have multiple roles simultaneously)
4. **Confidence scores** adjust the positioning - higher confidence moves values toward category extremes

---

## Code Location

The mapping logic is implemented in:
- `src/utils/conversationToTerrain.ts`
  - `getCommunicationFunction()` - X-axis calculation
  - `getConversationStructure()` - Y-axis calculation

