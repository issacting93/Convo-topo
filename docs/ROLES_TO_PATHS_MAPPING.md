# How Roles Relate to Paths: The Complete Mapping

## Overview

Roles determine **where conversations drift** in the 3D terrain. The path trajectory is calculated from role distributions, creating a visual representation of how relational positioning unfolds over time.

---

## The Core Relationship

**Roles → Target Position → Path Drift → Visual Trajectory**

1. **Role distributions** determine the **target position** (where conversation should end up)
2. **Path starts at center** (0.5, 0.5) and **drifts toward target**
3. **Each message** contributes to the drift
4. **Final path** shows the trajectory from origin to target

---

## X-Axis: Functional ↔ Social

### How Human Roles Map to X-Position

**X-axis represents:** Functional (task-oriented) ↔ Social (relationship-focused)

**Mapping formula:**
```typescript
roleBasedX = 
  (challenger × 0.1) +     // Very functional - critical analysis
  (director × 0.2) +       // Very functional - giving commands
  (seeker × 0.4) +         // Somewhat functional - asking questions
  (learner × 0.5) +        // Neutral - testing understanding
  (collaborator × 0.7) +   // Social - co-creation
  (sharer × 0.95);         // Very social - personal expression
```

### Role-to-X Mapping Table

| Human Role | X-Value | Position | Interpretation |
|------------|---------|----------|----------------|
| **Challenger** | 0.1 | Far left (functional) | Critical analysis, pushback |
| **Director** | 0.2 | Left (functional) | Task commands, specifications |
| **Seeker** | 0.4 | Center-left | Information requests (most common) |
| **Learner** | 0.5 | Center | Testing understanding |
| **Collaborator** | 0.7 | Right (social) | Co-creation, brainstorming |
| **Sharer** | 0.95 | Far right (social) | Personal expression, storytelling |

### What This Means for Paths

**81.2% seeker→expert conversations:**
- Human role: **Seeker** (0.4) → X ≈ 0.3-0.4 (functional)
- Path drifts **left** (toward functional space)
- Most conversations cluster in **bottom-left quadrant** (functional + structured)

**2.6% relational conversations:**
- Human role: **Sharer/Collaborator** (0.7-0.95) → X ≈ 0.7-0.95 (social)
- Path drifts **right** (toward social space)
- These are the **rare patterns** in top-right quadrant

---

## Y-Axis: Structured ↔ Emergent

### How AI Roles Map to Y-Position

**Y-axis represents:** Structured (predictable) ↔ Emergent (dynamic)

**Mapping formula:**
```typescript
roleBasedY = 
  (advisor × 0.2) +       // Very structured - prescriptive
  (expert × 0.3) +        // Structured - authoritative teaching
  (affiliative × 0.5) +   // Neutral - social warmth
  (reflector × 0.6) +     // Somewhat emergent - validating
  (facilitator × 0.7) +   // Emergent - guiding exploration
  (peer × 0.8);           // Very emergent - equal collaboration
```

### Role-to-Y Mapping Table

| AI Role | Y-Value | Position | Interpretation |
|---------|---------|----------|----------------|
| **Advisor** | 0.2 | Bottom (structured) | Prescriptive, "do X then Y" |
| **Expert** | 0.3 | Bottom (structured) | Authoritative teaching (most common) |
| **Affiliative** | 0.5 | Center | Social warmth, rapport |
| **Reflector** | 0.6 | Center-top | Validating, mirroring |
| **Facilitator** | 0.7 | Top (emergent) | Guiding via questions |
| **Peer** | 0.8 | Top (emergent) | Equal collaboration |

### What This Means for Paths

**84.6% expert AI conversations:**
- AI role: **Expert** (0.3) → Y ≈ 0.2-0.3 (structured)
- Path drifts **down** (toward structured space)
- Most conversations cluster in **bottom-left quadrant** (functional + structured)

**2.6% emergent AI conversations:**
- AI role: **Peer/Facilitator** (0.7-0.8) → Y ≈ 0.7-0.8 (emergent)
- Path drifts **up** (toward emergent space)
- These are the **rare patterns** in top quadrants

---

## Path Generation Process

### Step 1: Calculate Target Position

**From role distributions:**
```typescript
// X-axis target (from human roles)
targetX = 
  (challenger × 0.1) +
  (director × 0.2) +
  (seeker × 0.4) +
  (learner × 0.5) +
  (collaborator × 0.7) +
  (sharer × 0.95);

// Y-axis target (from AI roles)
targetY = 
  (advisor × 0.2) +
  (expert × 0.3) +
  (affiliative × 0.5) +
  (reflector × 0.6) +
  (facilitator × 0.7) +
  (peer × 0.8);
```

**Example: Seeker→Expert (81.2% of conversations)**
- Human: Seeker (0.4) → targetX ≈ 0.3
- AI: Expert (0.3) → targetY ≈ 0.2
- **Target position: (0.3, 0.2)** - Bottom-left quadrant (functional + structured)

### Step 2: Start at Origin

**All paths start at center:**
- Start position: **(0.5, 0.5)** - The origin point
- This represents "neutral" relational positioning

### Step 3: Drift Toward Target

**Each message contributes to drift:**
```typescript
// Base drift toward conversation target
targetDriftX = (targetX - 0.5) * 1.2;
targetDriftY = (targetY - 0.5) * 1.2;

// Message-level adjustments
messageDriftX = (expressiveScore - 0.5) * 0.5;
messageDriftY = (alignmentScore - 0.5) * 0.5;

// Role-based adjustments
roleDriftX = (user ? -0.06 : 0.06);
roleDriftY = (user ? 0.06 : -0.06);

// Progressive drift (increases over time)
driftFactor = 0.08 + (progress × 0.32);
```

**Drift accumulates:**
- Early messages: Small drift (exploring)
- Later messages: Larger drift (committing to position)
- Final position: Close to target (role-determined)

### Step 4: Visual Trajectory

**The path shows:**
- **Starting point:** Center (0.5, 0.5)
- **Trajectory:** Movement toward target
- **Final position:** Near target (role-determined)
- **Path shape:** Straight (stable roles) vs. meandering (dynamic roles)

---

## Role Combinations → Path Patterns

### Pattern 1: Seeker→Expert (81.2% of conversations)

**Roles:**
- Human: Seeker (0.4)
- AI: Expert (0.3)

**Target position:**
- X: 0.3 (functional)
- Y: 0.2 (structured)

**Path characteristics:**
- **Drift:** Left and down (toward functional/structured)
- **Shape:** Straight (stable roles)
- **Final position:** Bottom-left quadrant
- **Cluster:** StraightPath_Stable_FunctionalStructured_QA_InfoSeeking

**Visual:**
```
Start (0.5, 0.5)
    ↓
    ↓ (drift left & down)
    ↓
Target (0.3, 0.2) ← Functional + Structured
```

---

### Pattern 2: Sharer→Reflector (0.6% of conversations)

**Roles:**
- Human: Sharer (0.95)
- AI: Reflector (0.6)

**Target position:**
- X: 0.95 (social)
- Y: 0.6 (emergent)

**Path characteristics:**
- **Drift:** Right and up (toward social/emergent)
- **Shape:** Meandering (dynamic roles)
- **Final position:** Top-right quadrant
- **Cluster:** SocialEmergent_Narrative_Entertainment

**Visual:**
```
Start (0.5, 0.5)
    ↘
      ↘ (drift right & up)
        ↘
Target (0.95, 0.6) ← Social + Emergent
```

---

### Pattern 3: Director→Peer (2.3% of conversations)

**Roles:**
- Human: Director (0.2)
- AI: Peer (0.8)

**Target position:**
- X: 0.2 (functional)
- Y: 0.8 (emergent)

**Path characteristics:**
- **Drift:** Left and up (functional but emergent)
- **Shape:** Variable (mixed roles)
- **Final position:** Top-left quadrant
- **Cluster:** SocialEmergent_Narrative_InfoSeeking

**Visual:**
```
Start (0.5, 0.5)
    ↖
      ↖ (drift left & up)
        ↖
Target (0.2, 0.8) ← Functional + Emergent
```

---

## Why 81.2% Cluster in Bottom-Left

**The role distribution explains the clustering:**

1. **89.3% seeker** (human) → X ≈ 0.3-0.4 (functional)
2. **84.6% expert** (AI) → Y ≈ 0.2-0.3 (structured)
3. **81.2% seeker→expert** → Target: (0.3, 0.2)

**Result:**
- Most paths drift to **bottom-left quadrant**
- Creates the **StraightPath cluster** (87.2%)
- Explains why most conversations look similar

**This is not a bug—it's revealing:**
- Shows how evaluation contexts produce specific relational positioning
- Makes visible what becomes invisible in evaluation contexts
- The rare patterns (2.6%) reveal what's missing

---

## Path Characteristics from Roles

### Path Straightness

**Straight paths (high straightness):**
- **Stable roles:** Seeker→Expert throughout
- **No role shifts:** Same positioning from start to finish
- **Predictable:** Minimal relational negotiation

**Meandering paths (low straightness):**
- **Dynamic roles:** Roles shift during conversation
- **Relational negotiation:** Participants adjust positioning
- **Unpredictable:** More exploratory

### Path Length

**Short paths:**
- **Quick positioning:** Roles established early
- **Minimal drift:** Conversation doesn't explore space

**Long paths:**
- **Extended exploration:** Roles negotiated over time
- **More drift:** Conversation explores relational space

### Path Direction

**Direction determined by role combination:**

| Human Role | AI Role | Direction | Quadrant |
|------------|---------|-----------|----------|
| Seeker | Expert | ↓← (down-left) | Bottom-left |
| Sharer | Reflector | ↑→ (up-right) | Top-right |
| Director | Peer | ↑← (up-left) | Top-left |
| Collaborator | Facilitator | ↑→ (up-right) | Top-right |

---

## Role Changes During Conversation

### Static Roles (Most Common)

**81.2% of conversations:**
- Roles remain constant (seeker→expert throughout)
- Path is **straight** (minimal drift)
- Final position = target position
- **No relational negotiation**

### Dynamic Roles (Rare)

**2.6% of conversations:**
- Roles shift during conversation
- Path is **meandering** (more drift)
- Final position may differ from initial target
- **Relational negotiation visible**

**Example:**
- Starts: Seeker→Expert (target: 0.3, 0.2)
- Shifts: Sharer→Reflector (target: 0.95, 0.6)
- Path shows the transition

---

## Z-Axis: Emotional Intensity (PAD)

**Roles don't directly determine Z-axis (height), but they correlate:**

### Role-Intensity Correlations

**High intensity (peaks):**
- **Challenger** → Frustration, pushback
- **Director** → Urgency, task pressure
- **Expert** → Information overload

**Low intensity (valleys):**
- **Sharer** → Affiliation, rapport
- **Reflector** → Validation, calm
- **Affiliative** → Warmth, connection

**Moderate intensity:**
- **Seeker→Expert** → Stable, predictable (most common)

---

## Summary: The Complete Relationship

### Roles → Positions → Paths → Clusters

1. **Role distributions** determine **target positions**
   - Human roles → X-axis (functional ↔ social)
   - AI roles → Y-axis (structured ↔ emergent)

2. **Target positions** determine **path drift**
   - Path starts at center (0.5, 0.5)
   - Drifts toward target over time
   - Final position near target

3. **Path trajectories** create **spatial clusters**
   - Similar roles → Similar targets → Similar paths → Clusters
   - 81.2% seeker→expert → Bottom-left cluster
   - 2.6% relational → Top-right clusters

4. **Clusters reveal** relational positioning patterns
   - Not "what conversations are"
   - But "how roles position conversations spatially"

---

## Implications for Your Hypothesis

### What This Reveals

**The role distribution explains the clustering:**
- 81.2% seeker→expert → 87.2% in StraightPath cluster
- Role skew creates spatial clustering
- Rare patterns (2.6%) are the small clusters

**For critical design:**
- The extreme role skew is **revealing**, not limiting
- Shows how evaluation contexts produce specific positioning
- Makes visible what becomes invisible in evaluation contexts

**The relationship is:**
- **Roles determine paths** (not just correlate)
- **Path clustering reflects role distribution** (not independent discovery)
- **Spatial encoding privileges certain patterns** (role-based positioning)

---

## Code References

**Key files:**
- `src/utils/conversationToTerrain.ts` - Role-to-position mapping
- `src/utils/terrain.ts` - Path generation with drift
- `docs/calculations/DIMENSION_MAPPING.md` - Detailed mapping formulas

**Key functions:**
- `getCommunicationFunction()` - Maps human roles to X-axis
- `getConversationStructure()` - Maps AI roles to Y-axis
- `generatePathPoints()` - Creates path trajectory with drift

