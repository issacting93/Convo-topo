# Data Accuracy Verification Report
## Cluster Terrain Visualization

**Date**: 2026-01-11
**Component**: `/cluster-terrain` visualization

## Executive Summary

✅ **PAD Values**: Correctly calculated and stored in JSON files
✅ **Role Distribution**: Properly read from classification data
⚠️ **Coordinate Calculation**: Correct but has potential calibration issues
✅ **Cluster Assignment**: Multi-source approach working correctly
⚠️ **Heightmap Generation**: Uses average PAD per grid cell (may lose detail)

---

## 1. PAD (Pleasure-Arousal-Dominance) Values

### Data Source
- **Storage**: Pre-calculated in `/public/output/*.json` files
- **Script**: `scripts/calculate-pad-values.cjs`
- **Coverage**: 508 files updated, 3,161 messages with PAD data

### Verification
**Sample from `chatbot_arena_0001.json`:**
```json
{
  "pleasure": 0.5,
  "arousal": 0.5,
  "dominance": 0.6,
  "emotionalIntensity": 0.11547005383792514
}
```

### Calculation Method
**File**: `scripts/calculate-pad-values.cjs`

```javascript
// PAD Formula
pleasure = baseline(tone) + modifiers(text_analysis)
arousal = baseline(engagement) + modifiers(text_analysis)
dominance = role_based (user=0.6, assistant=0.4)

emotionalIntensity = sqrt(
  (pleasure - 0.5)^2 +
  (arousal - 0.5)^2 +
  (dominance - 0.5)^2
) / sqrt(0.75)  // Normalized to 0-1
```

**Text Analysis Markers:**
- Frustration: /frustrat|annoying|irritat|damn/i
- Satisfaction: /thank|great|perfect|excellent/i
- Urgency: /urgent|asap|immediately/i
- Apology: /sorry|apologi|my bad/i

### Usage in Terrain
**File**: `ClusterTerrainVisualizationPage.tsx:101-107`

```typescript
// Calculate average emotional intensity for Z-axis
const intensities = conv.messages
  .map(msg => msg.pad?.emotionalIntensity || 0.4)
  .filter(v => v > 0);
const avgIntensity = intensities.length > 0
  ? intensities.reduce((a, b) => a + b, 0) / intensities.length
  : 0.4;
```

### ✅ Status: ACCURATE
- Values properly calculated from text markers
- Role-based dominance applied correctly
- EmotionalIntensity formula matches documentation
- Fallback to 0.4 for missing values is reasonable

### ⚠️ Potential Issue: Averaging Loss
**Current**: Averages all PAD values per conversation → single point on grid
**Result**: Loses per-message variation in terrain heightmap
**Impact**: Terrain shows average emotion, not peaks/valleys within conversation

**Individual paths DO use per-message PAD** (correct), but terrain heightmap uses averages.

---

## 2. Role Distribution

### Data Source
**File**: `public/output/chatbot_arena_0001.json`

```json
"humanRole": {
  "distribution": {
    "information-seeker": 0.25,
    "provider": 0.55,
    "director": 0.2,
    "collaborator": 0,
    "social-expressor": 0,
    "relational-peer": 0
  },
  "confidence": 0.62
}
```

```json
"aiRole": {
  "distribution": {
    "expert-system": 0.75,
    "learning-facilitator": 0,
    "advisor": 0.1,
    "co-constructor": 0,
    "social-facilitator": 0,
    "relational-peer": 0.15
  },
  "confidence": 0.7
}
```

### Usage in Coordinates
**File**: `src/utils/coordinates.ts:22-37`

```typescript
// X-axis: Functional ↔ Social (role-based)
const roleBasedX =
  // Instrumental roles (Functional, left: 0.1-0.4)
  (humanRole['director'] || 0) * 0.1 +
  (humanRole['information-seeker'] || 0) * 0.2 +
  (humanRole['provider'] || 0) * 0.3 +
  (humanRole['collaborator'] || 0) * 0.4 +
  // Expressive roles (Social, right: 0.8-0.95)
  (humanRole['social-expressor'] || 0) * 0.95 +
  (humanRole['relational-peer'] || 0) * 0.85;

const maxRoleValue = Math.max(...Object.values(humanRole));
if (maxRoleValue > 0.3) {
  return roleBasedX;  // Weighted sum
}
```

### ✅ Status: ACCURATE
- Distribution values properly read from JSON
- Weighted positioning formula correct
- Confidence threshold (0.3) prevents weak signals
- Fallback to purpose/knowledge exchange if roles ambiguous

### ⚠️ Potential Issue: Weighted Sum vs Max
**Current Formula**: `sum(role[i] * position[i])`
**With example**: `0.25*0.2 + 0.55*0.3 + 0.2*0.1 = 0.235`

This is **weighted average**, which is correct! Not a concern.

---

## 3. Coordinate Calculation (X, Y Axes)

### X-Axis: Communication Function (Functional ↔ Social)
**File**: `src/utils/coordinates.ts:61-79`

**Method**: Hybrid approach
1. **Metadata baseline** (role distribution, purpose, knowledge exchange)
2. **Linguistic score** (from message text analysis)
3. **Blending**: Confidence-based interpolation

```typescript
const dist = Math.abs(linguisticX - 0.5);
const confidence = Math.min(1, dist * 3.5);
return (linguisticX * confidence) + (metadataX * (1 - confidence));
```

**Interpretation**:
- If linguistic score is confident (near 0 or 1), use it
- If linguistic score is ambiguous (near 0.5), trust metadata
- Good approach!

### Y-Axis: Conversation Structure (Aligned ↔ Divergent)
**File**: `src/utils/coordinates.ts:86-141`

**Priority 1**: Linguistic alignment analysis
```typescript
let alignmentScore = calculateConversationAlignment(conv.messages);

// CALIBRATION: Amplify signal
const spread = 2.0;
alignmentScore = midpoint + (alignmentScore - midpoint) * spread;
```

**Priority 2**: Classification-based fallback

### ✅ Status: ACCURATE BUT CALIBRATED
- Calculation logic correct
- **Amplification factor (2.0)** manually tuned
- Falls back gracefully when linguistic data unavailable

### ⚠️ Potential Issue: Over-amplification?
**Current**: Spreads alignment from 0.25-0.75 → 0.0-1.0
**Risk**: May push values to extremes artificially
**Recommendation**: Verify against actual cluster analysis results

---

## 4. Cluster Assignment

### Method: Multi-Source Approach
**File**: `src/utils/determineCluster.ts:176-191`

```typescript
export function determineCluster(conversation: Conversation) {
  // 1. Try metadata first
  const fromMetadata = getClusterFromMetadata(conversation);
  if (fromMetadata) return fromMetadata;

  // 2. Try loaded assignments (from cluster analysis)
  const fromAssignments = getClusterFromAssignments(conversation.id);
  if (fromAssignments) return fromAssignments;

  // 3. Fallback to heuristic computation
  return computeClusterFromCharacteristics(conversation);
}
```

### Heuristic Computation
**File**: `src/utils/determineCluster.ts:73-170`

Uses:
- PAD variance and peaks
- Interaction pattern
- Conversation purpose
- Role distributions

**Example**: Peak_Volatile detection
```typescript
if (intensityVariance > 0.01 &&
    peakDensity > 0.05 &&
    pattern === 'question-answer' &&
    isFunctional) {
  return 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking';
}
```

### ✅ Status: ACCURATE
- Prioritizes actual cluster assignments when available
- Heuristic fallback uses reasonable rules
- Matches cluster characteristics from analysis

---

## 5. Heightmap Generation

### Current Implementation
**File**: `ClusterTerrainVisualizationPage.tsx:90-157`

```typescript
const heightmap = useMemo(() => {
  const size = 128;
  const densityMap = new Float32Array(size * size).fill(0);
  const countMap = new Float32Array(size * size).fill(0);

  conversations.forEach(conv => {
    const x = getCommunicationFunction(conv);
    const y = getConversationStructure(conv);

    // Average PAD for this conversation
    const avgIntensity = /* ... */;

    // Add to grid cell
    const gridX = Math.floor(x * (size - 1));
    const gridY = Math.floor(y * (size - 1));
    densityMap[idx] += avgIntensity;
    countMap[idx] += 1;

    // Gaussian spread to neighbors
    for (radius 3) {
      const weight = exp(-(dist^2) / (2 * radius^2));
      densityMap[neighborIdx] += avgIntensity * weight * 0.5;
    }
  });

  // Normalize by count
  densityMap[i] /= countMap[i];

  // Smooth with 2-pixel radius
  // ...
});
```

### ✅ Status: MATHEMATICALLY CORRECT

**Steps**:
1. Maps each conversation to (x, y) grid position
2. Uses average PAD emotionalIntensity as height
3. Applies Gaussian blur (radius 3) for smooth distribution
4. Normalizes by conversation count per cell
5. Additional smoothing pass (radius 2)

### ⚠️ Potential Issues

**Issue 1: Double Smoothing**
- Gaussian spread (radius 3) + smoothing (radius 2)
- May over-blur terrain features
- Result: Flatter, less distinctive terrain

**Issue 2: Averaging loses variation**
- Uses average PAD per conversation
- Doesn't show peaks/valleys within single conversation
- Terrain shows "average emotion of conversations in area"

**Issue 3: Grid resolution**
- 128x128 grid for 494 conversations
- ~0.03 conversations per cell on average
- Most cells will be empty or have 1-2 conversations
- Gaussian spread helps, but may create artificial features

---

## 6. Path Generation

### Implementation
**File**: `src/utils/terrain.ts:367-476`

```typescript
export function generatePathPoints(heightmap, size, count, messages) {
  // Starts at center (0.5, 0.5)
  // Drifts toward target based on classification
  // Per-message variation from content analysis

  for each message {
    // Calculate drift
    const driftX = (targetX - startX) * stepSize * progressFactor
                 + (messageDriftX * stepSize * 5.0);

    // Update position
    currentX += driftX;

    // Sample heightmap at position
    const height = heightmap[ty * size + tx];

    // BUT: Store PAD-based height override
    const padHeight = message.pad?.emotionalIntensity;

    points.push({ x, y, height, padHeight, ... });
  }
}
```

### ✅ Status: ACCURATE

**Correctly**:
- Stores both terrain height and PAD height
- Path drifts from center toward conversation target
- Per-message PAD preserved (not averaged)
- Uses linguistic alignment scores for drift

### Rendering
**File**: `src/components/ThreeScene.tsx:905-911`

```typescript
let yPosition: number;
if (p.pad?.emotionalIntensity !== undefined) {
  yPosition = p.pad.emotionalIntensity * terrainHeight + OFFSET;
} else if (p.padHeight !== undefined) {
  yPosition = p.padHeight * terrainHeight + OFFSET;
} else {
  yPosition = p.height * terrainHeight + OFFSET;
}
```

**Priority**: pad.emotionalIntensity > padHeight > terrain height

### ✅ Status: CORRECT
- Paths use per-message PAD (not averaged)
- Terrain height is fallback only
- Z-axis accurately represents emotional intensity variation

---

## 7. Summary of Findings

### ✅ Accurate Components
1. **PAD calculation** - Formula correct, markers appropriate
2. **Role distribution** - Properly weighted and applied
3. **Coordinate hybrid blending** - Smart confidence-based approach
4. **Cluster assignment** - Multi-source with good fallbacks
5. **Path Z-heights** - Uses per-message PAD correctly

### ⚠️ Areas of Concern

#### Medium Priority
1. **Heightmap over-smoothing**
   - **Issue**: Double smoothing (Gaussian + 2-pass blur)
   - **Impact**: Terrain may lack distinctive features
   - **Fix**: Reduce smoothing radius or remove second pass

2. **Heightmap resolution**
   - **Issue**: 128x128 for 494 conversations = sparse
   - **Impact**: Empty cells, artificial Gaussian peaks
   - **Fix**: Reduce grid size to 64x64 or 96x96

#### Low Priority
3. **Y-axis amplification**
   - **Issue**: 2.0x spread factor is manual tuning
   - **Impact**: May push values to extremes
   - **Fix**: Validate against actual cluster positions

4. **Heightmap averaging**
   - **Issue**: Averages PAD per conversation (not per message)
   - **Impact**: Terrain doesn't show intra-conversation variation
   - **Note**: This is intentional design (terrain = aggregate view)

---

## 8. Recommendations

### Quick Wins
1. **Reduce smoothing** in heightmap:
   ```typescript
   // Option A: Reduce Gaussian radius
   const radius = 2;  // was 3

   // Option B: Remove second smoothing pass
   // const smoothed = densityMap;  // Skip smoothing
   ```

2. **Reduce grid size** for better density:
   ```typescript
   const size = 96;  // was 128
   ```

### Future Enhancements
1. **Add visualization toggle**: Show "per-message PAD terrain" vs "average PAD terrain"
2. **Add validation overlay**: Color-code cells by conversation count
3. **Add PAD histogram**: Show distribution of emotional intensity
4. **Add coordinate validation**: Overlay actual cluster centers from analysis

---

## 9. Conclusion

**Overall Data Accuracy: ✅ HIGH**

The terrain visualization is using accurate data from multiple sources:
- PAD values are correctly calculated and stored
- Role distributions are properly weighted
- Coordinates use smart hybrid approach
- Paths preserve per-message detail

The main concerns are presentation-level (smoothing, grid resolution) rather than data accuracy issues. The underlying calculations are mathematically sound and match the documented methodology.
