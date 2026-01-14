# How Conversation Paths Are Generated

## Overview

Conversation paths are generated using a **drift-based algorithm** that creates a 3D trajectory for each conversation. The path represents how the conversation evolves over time, starting at a neutral center point and drifting toward a target position based on the conversation's classification and message content.

---

## Path Generation Process

### 1. **Initial Setup** (`generatePathPoints` in `src/utils/terrain.ts`)

#### Starting Position
- **All conversations start at the center**: `(0.5, 0.5)`
- This represents a neutral state (neither functional nor social, neither aligned nor divergent)

#### Conversation-Level Target
- **Target X**: `0.1 + communicationFunction * 0.8`
  - `communicationFunction` ranges from 0 (Functional) to 1 (Social)
  - Target X ranges from 0.1 (Functional) to 0.9 (Social)
  
- **Target Y**: `0.1 + conversationStructure * 0.8`
  - `conversationStructure` ranges from 0 (Aligned) to 1 (Divergent)
  - Target Y ranges from 0.1 (Aligned) to 0.9 (Divergent)

**This target represents where the conversation "wants" to go based on its overall classification.**

---

### 2. **Conversation-Level Coordinates** (`getCommunicationFunction` and `getConversationStructure` in `src/utils/coordinates.ts`)

#### X-Axis: Communication Function (Functional ↔ Social)

**Calculation Priority:**
1. **Linguistic Analysis** (if messages available):
   - Uses `calculateFunctionalSocialScore()` to analyze message content
   - Detects functional vs. social language markers
   
2. **Hybrid Blending**:
   - If linguistic score is confident (near 0 or 1), use it
   - If linguistic score is ambiguous (near 0.5), trust metadata
   - Formula: `(linguisticX * confidence) + (metadataX * (1 - confidence))`

3. **Metadata Baseline** (fallback):
   - **Role-based positioning** (Strongest signal):
     - Instrumental roles → Functional (0.1-0.4):
       - `director`/`challenger`: 0.1 (Instrumental, High Authority)
       - `information-seeker`/`seeker`: 0.2 (Instrumental, Low Authority)
       - `provider`/`learner`: 0.3 (Instrumental, Low Authority)
       - `collaborator`/`co-constructor`: 0.4 (Instrumental, Equal Authority)
     - Expressive roles → Social (0.8-0.95):
       - `social-expressor`/`sharer`: 0.95 (Expressive, Low Authority)
       - `relational-peer`: 0.85 (Expressive, Equal Authority)
   - **Purpose-based**: Task-oriented → Functional, Personal → Social
   - **Pattern-based**: Question-answer/Advisory → Functional, Casual-chat/Storytelling → Social

#### Y-Axis: Conversation Structure (Aligned ↔ Divergent)

**Calculation Priority:**
1. **Linguistic Alignment** (if messages available):
   - Uses `calculateConversationAlignment()` to analyze message similarity
   - Measures how well user and AI messages align linguistically
   - Amplified: `midpoint + (alignmentScore - midpoint) * 2.0`

2. **Classification-Based** (fallback):
   - **Pattern-based**:
     - `question-answer`/`advisory`: ~0.8-0.9 (Divergent roles)
     - `collaborative`/`casual-chat`/`storytelling`: ~0.1-0.2 (Aligned)
   - **Role-based** (Authority Level):
     - High Authority roles (`expert-system`, `advisor`): 0.2 (Structured, bottom)
     - Low Authority roles (`learning-facilitator`, `social-facilitator`): 0.8 (Emergent, top)
     - Equal Authority roles (`relational-peer`, `co-constructor`): 0.5 (Balanced, middle)

---

### 3. **Message-Level Analysis** (`analyzeMessage` in `src/utils/terrain.ts`)

For each message, the system calculates:

#### Expressive Score (0-1)
- **Indicators**: Personal pronouns (`i`, `my`, `me`), emotional words (`feel`, `like`, `love`, `hate`, `wow`, `awesome`, etc.), contractions (`'`)
- **Formula**: `(expressiveWordCount * 0.2) + (hasContractions ? 0.3 : 0) + (length > 50 ? 0.2 : 0)`
- Higher scores indicate more social/expressive language

#### Alignment Score (0-1)
- Calculated using `calculateMessageAlignmentScores()`
- For each message, calculates alignment up to that point in the conversation
- Measures linguistic similarity between user and AI messages using cosine similarity
- Higher scores indicate better alignment (more similar linguistic patterns)

---

### 4. **Path Drift Calculation** (Per-Message Iteration)

For each message `i` in the conversation:

#### Step 1: Calculate Progress
```javascript
progress = i / Math.max(count - 1, 1)  // 0 to 1
```

#### Step 2: Scale by Conversation Length
```javascript
lengthScale = Math.min(1.5, 1.0 + (conversationLength - 10) / 50)
// Longer conversations get slightly more drift per message
```

#### Step 3: Calculate Progress Factor
```javascript
progressFactor = 1.0 + Math.sin(progress * Math.PI) * 0.5
// Creates slight acceleration in the middle of the conversation
```

#### Step 4: Calculate Step Size
```javascript
stepSize = 1.0 / Math.max(conversationLength, 1)
// Normalizes drift to prevent overshoot
```

#### Step 5: Calculate Message-Level Drift
```javascript
messageDriftX = (expressiveScore - 0.5) * 0.5 * lengthScale
// Positive if expressive (moves toward social), negative if functional

messageDriftY = (alignmentScore - 0.5) * 0.5 * lengthScale
// Positive if aligned (moves toward aligned), negative if divergent
```

#### Step 6: Combine Base Drift + Message Drift
```javascript
// Base drift: pulls toward conversation target
baseDriftX = (targetX - startX) * stepSize * progressFactor
baseDriftY = (targetY - startY) * stepSize * progressFactor

// Message drift: adds local variation based on content
messageVariationX = messageDriftX * stepSize * 5.0
messageVariationY = messageDriftY * stepSize * 5.0

// Total drift per step
driftX = baseDriftX + messageVariationX
driftY = baseDriftY + messageVariationY
```

#### Step 7: Update Position (Cumulative)
```javascript
currentX += driftX
currentY += driftY

// Clamp to safe range
margin = conversationLength > 30 ? 0.03 : 0.05
currentX = Math.max(margin, Math.min(1.0 - margin, currentX))
currentY = Math.max(margin, Math.min(1.0 - margin, currentY))
```

---

### 5. **Z-Height (Elevation)** 

The Z-height of each path point represents **emotional intensity**:

#### Option 1: PAD-Based Height (Preferred)
```javascript
padHeight = message.pad?.emotionalIntensity
// Range: 0 (calm) to 1 (agitated/frustrated)
// High = frustration peaks, Low = affiliation valleys
```

#### Option 2: Terrain Height (Fallback)
```javascript
height = heightmap[ty * size + tx]
// Uses static terrain heightmap if PAD data unavailable
```

**Note**: The Z-height is what makes paths "float" above the terrain. High emotional intensity creates taller paths (frustration peaks), while low intensity creates shorter paths (affiliation valleys).

---

## Key Algorithm Features

### 1. **Dual-Layer Drift**
- **Base drift**: Pulls conversation toward its classification-based target (long-term trend)
- **Message drift**: Adds local variation based on individual message content (short-term fluctuations)

### 2. **Temporal Progression**
- **Progress factor**: Creates slight acceleration in the middle of conversations (sinusoidal curve)
- **Length scaling**: Longer conversations get slightly more drift per message to prevent compression

### 3. **Normalization**
- **Step size**: Normalizes drift by conversation length to prevent overshoot
- **Clamping**: Keeps paths within safe bounds (with margins for longer conversations)

### 4. **Message Analysis**
- **Expressive score**: Detects social vs. functional language at message level
- **Alignment score**: Measures linguistic similarity between user and AI messages incrementally

---

## Example: Path Generation for a Conversation

**Conversation Classification:**
- Human Role: `information-seeker` (70%) → Functional side
- AI Role: `learning-facilitator` (60%) → Low authority
- Pattern: `question-answer` → Divergent

**Calculated Coordinates:**
- `communicationFunction`: ~0.2 (Functional)
- `conversationStructure`: ~0.8 (Divergent)
- **Target**: `(0.26, 0.74)`

**Path Generation:**
1. **Start**: `(0.5, 0.5)` - Center point
2. **Message 1**: 
   - Expressive score: 0.1 (low - very functional)
   - Alignment score: 0.5 (neutral - first message)
   - Drift: Small movement toward target `(0.26, 0.74)`
   - New position: `(0.49, 0.50)`
3. **Message 2**:
   - Expressive score: 0.2 (still functional)
   - Alignment score: 0.4 (slight divergence)
   - Drift: Continues toward target with message variation
   - New position: `(0.47, 0.51)`
4. **... continues for all messages ...**
5. **Final position**: Approaches `(0.26, 0.74)` with path variations based on individual messages

**Result**: A path that starts at center, drifts toward Functional/Divergent region (bottom-left), with local variations based on each message's characteristics.

---

## How New Data Affects Paths

### Yes, New Data DOES Affect Paths

When new WildChat conversations are added:

1. **Different Classifications**: New conversations may have different role distributions, patterns, and tones than old data
   - This creates different **target positions**
   - Paths appear in different regions of the terrain

2. **Different Message Content**: New conversations have different message content
   - This creates different **message-level drift**
   - Paths have different shapes and trajectories

3. **Different PAD Scores**: New conversations may have different emotional intensities
   - This creates different **Z-heights** (elevation)
   - Paths float at different heights above terrain

### Visual Impact

- **Old data**: Paths cluster in certain regions based on Arena/OASST conversation patterns
- **New data**: Paths cluster in potentially different regions based on WildChat patterns
- **Comparison**: Side-by-side, you can see differences in:
  - Spatial distribution (where paths cluster)
  - Path shapes (how they drift)
  - Elevation patterns (emotional intensity)

---

## Summary

**Path Generation = Classification Target + Message Content Variation**

1. **Classification** determines the **target position** (where conversation wants to go)
2. **Message content** determines **local drift** (how it gets there)
3. **PAD scores** determine **elevation** (emotional intensity)
4. **Cumulative drift** creates the **path trajectory** (the actual path)

The algorithm balances:
- **Long-term trend** (classification-based target)
- **Short-term variation** (message-level content)
- **Temporal progression** (accelerated middle)
- **Normalization** (prevent overshoot)
