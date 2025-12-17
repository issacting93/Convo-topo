# How Terrain Height is Determined

## Answer: Height is NOT Stored - It's Computed Dynamically

The terrain height is **not stored** in the output JSON files. Instead, it's **computed in real-time** from the classification data that IS stored.

## What IS Stored in Output Files

Looking at `output/conv-*.json`, each file contains:

```json
{
  "id": "conv-0",
  "messages": [...],
  "classification": {
    "topicDepth": {
      "category": "surface",  // ← Used for height
      "confidence": 0.3       // ← Used for height
    },
    "emotionalTone": {
      "category": "neutral",  // ← Used for height
      "confidence": 0.9       // ← Used for height
    },
    "engagementStyle": {
      "category": "questioning", // ← Used for height
      "confidence": 0.8         // ← Used for height
    },
    // ... other dimensions with confidence scores
  }
}
```

## How Height is Computed

### Step 1: Extract Parameters from Classification

The `getTerrainParams()` function extracts three parameters:

1. **Topic Depth** (Primary - directly from classification)
   ```typescript
   topicDepth = classification.topicDepth.category  // "surface" | "moderate" | "deep"
   ```

2. **Average Confidence** (Secondary - computed from all confidence scores)
   ```typescript
   avgConfidence = average([
     interactionPattern.confidence,
     powerDynamics.confidence,
     emotionalTone.confidence,
     engagementStyle.confidence,
     knowledgeExchange.confidence,
     conversationPurpose.confidence,
     topicDepth.confidence,
     turnTaking.confidence,
     humanRole.confidence,
     aiRole.confidence
   ])
   ```

3. **Emotional Intensity** (Tertiary - computed from tone + engagement)
   ```typescript
   emotionalIntensity = 
     (tone === 'playful' || 'supportive' || 'empathetic' ? 0.7 : 0.3) +
     (engagement === 'affirming' || 'challenging' ? 0.2 : 0)
   ```

### Step 2: Map to Height Ranges

```typescript
const depthRanges = {
  'surface': { min: 0.3, max: 0.6, base: 0.45 },
  'moderate': { min: 0.4, max: 0.8, base: 0.6 },
  'deep': { min: 0.6, max: 1.0, base: 0.8 }
};
```

### Step 3: Generate Heightmap

The `generateHeightmap()` function:
1. Uses a **seed** (derived from classification categories)
2. Generates **fractal noise** (procedural terrain)
3. Applies **topic depth range** (sets base height)
4. Applies **confidence variation** (affects terrain roughness)
5. Applies **emotional intensity multiplier** (affects peak height)

## Example: From JSON to Height

### Input (from `output/sample-deep-discussion.json`):
```json
{
  "topicDepth": { "category": "deep", "confidence": 0.7 },
  "emotionalTone": { "category": "neutral", "confidence": 0.9 },
  "engagementStyle": { "category": "questioning", "confidence": 0.8 },
  // ... other dimensions
}
```

### Computation:
1. `topicDepth = "deep"` → base height range: 0.6-1.0, base: 0.8
2. `avgConfidence = 0.75` (average of all confidences) → variation: 0.725
3. `emotionalIntensity = 0.3` (neutral tone) → peak multiplier: 1.09

### Result:
- **Terrain height**: 0.6-1.0 range (high peaks)
- **Terrain variation**: Moderate (0.725)
- **Peak height**: Slightly above base (1.09x multiplier)

## Why Not Store Height?

1. **Deterministic**: Same classification = same height (computed the same way)
2. **Flexible**: Can adjust height calculation without regenerating data
3. **Efficient**: Heightmap is 64×64 = 4,096 floats (would bloat JSON files)
4. **Procedural**: Terrain is generated from seed + parameters, not stored

## What This Means

- ✅ **Classification data IS stored** (topicDepth, confidences, etc.)
- ❌ **Heightmap is NOT stored** (computed on-the-fly)
- ✅ **Height is deterministic** (same classification = same terrain)
- ✅ **All data needed is in the JSON files**

## Current Data Flow

```
output/conv-0.json
  ↓
classification.topicDepth.category = "surface"
classification.topicDepth.confidence = 0.3
classification.emotionalTone.category = "neutral"
classification.emotionalTone.confidence = 0.9
... (all other dimensions)
  ↓
getTerrainParams() extracts:
  - topicDepth: "surface"
  - avgConfidence: 0.45 (computed)
  - emotionalIntensity: 0.3 (computed)
  ↓
generateHeightmap(64, seed, {
  topicDepth: "surface",
  avgConfidence: 0.45,
  emotionalIntensity: 0.3
})
  ↓
Float32Array[4096] heightmap values
  ↓
3D terrain visualization
```

## Summary

**Height is determined by:**
1. `topicDepth.category` (stored) → Primary height range
2. Average of all `confidence` scores (computed from stored values) → Terrain variation
3. `emotionalTone` + `engagementStyle` (stored) → Peak multiplier

**All required data IS in the output files** - height is just computed from it rather than stored.

