# Terrain Height Meaning

The terrain height now represents meaningful conversation characteristics, not just random noise.

## Height Mapping

### **Primary: Topic Depth** 🏔️

Terrain height is primarily determined by **topic depth** classification:

| Topic Depth | Height Range | Visual Result |
|-------------|-------------|---------------|
| **Surface** | 0.2 - 0.5 | Low, flat terrain - gentle hills |
| **Moderate** | 0.3 - 0.7 | Medium terrain - rolling hills |
| **Deep** | 0.5 - 1.0 | High peaks - dramatic mountains |

**Metaphor:** Deeper conversations create "higher ground" - more elevation, more prominent features.

### **Secondary: Average Confidence** 📊

The **average confidence** across all classification dimensions affects terrain **variation**:

- **High confidence (0.8-1.0)**: More defined features, sharper peaks and valleys
- **Low confidence (0.3-0.5)**: Smoother, more uniform terrain

**Metaphor:** Higher confidence = clearer conversation patterns = more distinct terrain features.

### **Tertiary: Emotional Intensity** 💫

**Emotional intensity** (derived from tone and engagement) affects **peak height**:

- **High intensity** (playful, supportive, empathetic): Taller peaks (multiplier 0.8-1.2)
- **Low intensity** (neutral, professional): Lower peaks

**Metaphor:** More emotional conversations create more dramatic peaks.

## How It Works

```typescript
// 1. Extract classification data
const topicDepth = classification.topicDepth.category; // 'surface' | 'moderate' | 'deep'
const avgConfidence = average(all confidence scores);
const emotionalIntensity = calculateFrom(tone, engagement);

// 2. Map to terrain parameters
const depthRange = {
  'surface': { min: 0.2, max: 0.5, base: 0.35 },
  'moderate': { min: 0.3, max: 0.7, base: 0.5 },
  'deep': { min: 0.5, max: 1.0, base: 0.75 }
};

// 3. Generate heightmap with these parameters
generateHeightmap(size, seed, {
  topicDepth,
  avgConfidence,
  emotionalIntensity
});
```

## Visual Examples

### Surface Conversation
- **Classification:** Topic depth = "surface"
- **Terrain:** Low, flat landscape
- **Height range:** 0.2 - 0.5
- **Appearance:** Gentle rolling hills, minimal elevation

### Moderate Conversation  
- **Classification:** Topic depth = "moderate"
- **Terrain:** Medium elevation
- **Height range:** 0.3 - 0.7
- **Appearance:** Rolling hills with some peaks

### Deep Conversation
- **Classification:** Topic depth = "deep"
- **Terrain:** High peaks
- **Height range:** 0.5 - 1.0
- **Appearance:** Mountainous terrain with dramatic peaks

## Combined Effects

A **deep, high-confidence, emotional** conversation will have:
- High base elevation (deep = 0.75 base)
- Sharp, defined features (high confidence = more variation)
- Tall peaks (high emotional intensity = peak multiplier)

A **surface, low-confidence, neutral** conversation will have:
- Low base elevation (surface = 0.35 base)
- Smooth, uniform terrain (low confidence = less variation)
- Gentle hills (low emotional intensity = lower peaks)

## Message Height

Messages "sit on" the terrain at their (X, Y) position:
- **Message height** = Terrain height at that position
- Messages on peaks = higher elevation
- Messages in valleys = lower elevation

This creates a visual metaphor where:
- **Deep conversations** = messages sit on higher ground
- **Surface conversations** = messages sit on lower ground
- **Message position** = conversation meaning (X/Y)
- **Message height** = terrain elevation at that position

## Benefits

1. **Meaningful visualization** - Height represents actual conversation characteristics
2. **Visual distinction** - Different conversation types create visibly different terrains
3. **Intuitive metaphor** - "Deep" conversations literally have more depth/height
4. **Data-driven** - Every aspect of terrain comes from classification data

