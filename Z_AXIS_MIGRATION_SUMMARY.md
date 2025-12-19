# Z-Axis Migration Summary: Implementing PAD-Based Affective/Evaluative Lens

## Quick Overview

**Current Problem**: 
- Z-height is currently terrain-based (single conversation-level `emotionalIntensity`)
- Can't show per-message affective peaks (frustration) and valleys (affiliation)
- No temporal affective tracking

**Solution**: 
- Calculate PAD scores **per message** (not just conversation-level)
- Use PAD scores to set marker Z-heights
- Show peaks for frustration (high Arousal + low Pleasure) and valleys for affiliation

---

## Key Changes Required

### 1. **Data Structure Updates** ⚠️ Breaking Changes

**Add PAD to PathPoint interface:**
```typescript
// src/utils/terrain.ts
export interface PathPoint {
  // ... existing fields ...
  pad?: {
    pleasure: number;    // 0-1
    arousal: number;     // 0-1  
    dominance: number;   // 0-1
    emotionalIntensity: number; // Derived: (1 - pleasure) + arousal
  };
  padHeight?: number; // PAD-based height override for Z-axis
}
```

**Add PAD to message processing:**
```typescript
// src/App.tsx - processConversationMessages()
// Return type needs PAD scores for each message
```

### 2. **New Function: calculateMessagePAD()**

Create function that:
- Takes message content + conversation classification
- Returns PAD scores (Pleasure, Arousal, Dominance)
- Detects frustration markers ("wrong", "error", "failed")
- Detects satisfaction markers ("perfect", "thanks", "exactly")
- Detects urgency markers ("urgent", "asap", "help")

**Location**: `src/utils/conversationToTerrain.ts`

### 3. **Update processConversationMessages()**

Add PAD calculation for each message:
```typescript
.map((msg, index) => {
  const pad = calculateMessagePAD(msg, conversation.classification, index, total);
  return {
    // ... existing fields ...
    pad // NEW
  };
})
```

### 4. **Update generatePathPoints()**

Modify to include PAD-based height:
```typescript
points.push({
  // ... existing fields ...
  pad: message.pad,
  padHeight: message.pad?.emotionalIntensity // NEW: for Z-height
});
```

### 5. **Update Marker Visualization**

Use `padHeight` instead of terrain height:
```typescript
// src/components/ThreeScene.tsx - createMarkerGroup()
const worldY = point.padHeight !== undefined
  ? (point.height * terrainHeight) + ((point.padHeight - 0.5) * terrainHeight * 0.8)
  : point.height * terrainHeight;
```

### 6. **Update HUD Display**

Show PAD scores when marker is selected:
```typescript
// src/components/HUDOverlay.tsx
{activePoint?.pad && (
  <div>
    <div>AFFECTIVE STATE (PAD)</div>
    <div>Pleasure: {activePoint.pad.pleasure}</div>
    <div>Arousal: {activePoint.pad.arousal}</div>
    <div>Intensity: {activePoint.pad.emotionalIntensity}</div>
  </div>
)}
```

---

## Implementation Order

### Phase 1: Data & Calculation (No Visual Changes Yet)
1. ✅ Add `calculateMessagePAD()` function
2. ✅ Update `processConversationMessages()` to include PAD
3. ✅ Update `PathPoint` interface to include PAD fields
4. ✅ Update `generatePathPoints()` to store PAD scores
5. ✅ Test: Verify PAD scores are calculated correctly

### Phase 2: Visualization
6. ✅ Update `createMarkerGroup()` to use `padHeight`
7. ✅ Update path line to use PAD heights
8. ✅ Test: Verify markers show peaks/valleys correctly

### Phase 3: UI/UX
9. ✅ Add PAD display to HUD
10. ✅ Test: Verify PAD scores display correctly
11. ✅ Visual testing: Do peaks correspond to frustration?

---

## Files to Modify

1. **src/utils/conversationToTerrain.ts**
   - Add `calculateMessagePAD()` function
   - Update `processConversationMessages()` return type (via App.tsx)

2. **src/App.tsx**
   - Update `processConversationMessages()` to call `calculateMessagePAD()`
   - Pass PAD data through message processing

3. **src/utils/terrain.ts**
   - Update `PathPoint` interface (add `pad?` and `padHeight?`)
   - Update `generatePathPoints()` to calculate/store PAD heights

4. **src/components/ThreeScene.tsx**
   - Update `createMarkerGroup()` to use `padHeight`
   - Update path line height calculation

5. **src/components/HUDOverlay.tsx**
   - Add PAD display section

---

## Testing Checklist

- [ ] PAD scores calculate correctly per message
- [ ] Frustration messages show high intensity (peaks)
- [ ] Satisfaction messages show low intensity (valleys)
- [ ] Markers positioned at correct Z-heights
- [ ] Path line follows PAD heights smoothly
- [ ] HUD shows PAD scores correctly
- [ ] Fallback works when PAD unavailable
- [ ] Visual verification: peaks = frustration, valleys = affiliation

---

## Quick Start: Minimal Implementation

**Fastest path to working version:**

1. Add `calculateMessagePAD()` with simple text analysis
2. Add PAD to `PathPoint` interface
3. Update marker height to use `emotionalIntensity` directly
4. Test with one conversation to verify peaks/valleys

This gives you the core functionality; refinement can come later.

---

## Notes

- **Text-based for now**: Current implementation uses text analysis (no multimodal)
- **Hybrid approach**: Uses conversation-level classification as base + message-level adjustments
- **Performance**: PAD calculation is lightweight (text analysis only)
- **Future**: Can enhance with better NLP models or multimodal fusion

