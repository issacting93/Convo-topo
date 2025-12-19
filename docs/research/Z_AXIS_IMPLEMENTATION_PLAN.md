# Z-Axis Implementation Plan: Affective/Evaluative Lens

## Current State Analysis

### What Works Now
1. ✅ **Terrain heightmap generation** - Uses conversation-level `emotionalIntensity` to modulate terrain shape
2. ✅ **Path point positioning** - X/Y coordinates based on relational positioning (communicationFunction, conversationStructure)
3. ✅ **Message markers** - Positioned at terrain height (`point.height * terrainHeight`)

### What Needs to Change
1. ❌ **PAD scores are conversation-level** - Should be **per-message** to show temporal affective changes
2. ❌ **Z-height is terrain-based** - Should reflect **message-specific affective state** (PAD model)
3. ❌ **No PAD data in messages** - Messages don't have P/A/D scores
4. ❌ **Single emotionalIntensity value** - Can't show peaks/valleys per message

---

## Implementation Strategy

### Option 1: Message-Level PAD Calculation (Recommended)
**Approach**: Calculate PAD scores for each message, use for Z-height

**Pros:**
- Shows temporal affective changes (frustration building, affiliation moments)
- Matches theoretical framework (PAD per message)
- Enables peaks/valleys visualization

**Cons:**
- Requires message-level analysis (currently only conversation-level classification)
- More complex data structure

### Option 2: Conversation-Level PAD with Message Modulation
**Approach**: Use conversation-level PAD as base, modulate per-message based on content

**Pros:**
- Easier to implement (uses existing conversation classification)
- Can approximate message-level variation

**Cons:**
- Less theoretically accurate
- May miss message-specific affective shifts

### Option 3: Hybrid (Conversation-Level Base + Message Analysis)
**Approach**: Start with conversation-level PAD, enhance with per-message text analysis

**Pros:**
- Best of both worlds
- Uses existing classification + adds message-level detail
- Practical for current data availability

**Cons:**
- Most complex implementation

---

## Recommended Implementation: Option 3 (Hybrid)

### Phase 1: Data Structure Changes

#### 1.1 Add PAD to Message Interface
```typescript
// src/App.tsx or src/utils/conversationToTerrain.ts
interface MessageWithPAD {
  role: 'user' | 'assistant';
  content: string;
  communicationFunction: number;
  conversationStructure: number;
  humanRole?: string;
  aiRole?: string;
  roleConfidence?: number;
  
  // NEW: PAD scores for this message
  pad?: {
    pleasure: number;    // 0-1, low = frustration, high = satisfaction
    arousal: number;     // 0-1, low = calm, high = agitation
    dominance: number;   // 0-1, low = passive, high = control
    emotionalIntensity: number; // Derived: (1 - pleasure) + arousal
  };
}
```

#### 1.2 Update PathPoint Interface
```typescript
// src/utils/terrain.ts
export interface PathPoint {
  x: number;
  y: number;
  height: number; // Keep terrain height
  padHeight?: number; // NEW: PAD-based height override
  role: 'user' | 'assistant';
  communicationFunction: number;
  conversationStructure: number;
  humanRole?: string;
  aiRole?: string;
  roleConfidence?: number;
  
  // NEW: PAD scores
  pad?: {
    pleasure: number;
    arousal: number;
    dominance: number;
    emotionalIntensity: number;
  };
}
```

### Phase 2: PAD Calculation Functions

#### 2.1 Message-Level PAD Calculation
```typescript
// src/utils/conversationToTerrain.ts

/**
 * Calculate PAD scores for a single message
 * Uses conversation-level classification as base, 
 * then analyzes message content for variations
 */
function calculateMessagePAD(
  message: { role: string; content: string },
  conversationClassification: Classification,
  messageIndex: number,
  totalMessages: number
): { pleasure: number; arousal: number; dominance: number; emotionalIntensity: number } {
  // Base PAD from conversation-level classification
  const convTone = conversationClassification.emotionalTone?.category || 'neutral';
  const convEngagement = conversationClassification.engagementStyle?.category || 'reactive';
  
  // Calculate base Pleasure (P) from conversation tone
  let basePleasure = 
    (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
    (convTone === 'serious') ? 0.3 :
    (convTone === 'neutral') ? 0.5 : 0.5;
  
  // Calculate base Arousal (A) from conversation engagement
  let baseArousal = 
    (convEngagement === 'challenging' || convEngagement === 'questioning') ? 0.7 :
    (convEngagement === 'reactive') ? 0.3 :
    (convEngagement === 'affirming') ? 0.5 : 0.5;
  
  // Message-level adjustments based on content analysis
  const content = message.content.toLowerCase();
  
  // Detect frustration markers (low pleasure, high arousal)
  const frustrationMarkers = [
    'wrong', 'incorrect', 'no that\'s', 'actually', 'but', 
    'however', 'no,', 'not quite', 'error', 'mistake',
    'doesn\'t work', 'failed', 'broken', 'issue', 'problem'
  ];
  const hasFrustration = frustrationMarkers.some(marker => content.includes(marker));
  
  // Detect satisfaction markers (high pleasure)
  const satisfactionMarkers = [
    'perfect', 'exactly', 'great', 'thanks', 'thank you',
    'that works', 'yes', 'correct', 'right', 'good',
    'awesome', 'brilliant', 'excellent'
  ];
  const hasSatisfaction = satisfactionMarkers.some(marker => content.includes(marker));
  
  // Detect urgency/agitation (high arousal)
  const urgencyMarkers = [
    'urgent', 'asap', 'quickly', 'now', 'immediately',
    'help', 'please', 'need', 'important', 'critical'
  ];
  const hasUrgency = urgencyMarkers.some(marker => content.includes(marker));
  
  // Adjust PAD based on message content
  if (hasFrustration) {
    basePleasure = Math.max(0.1, basePleasure - 0.3); // Lower pleasure
    baseArousal = Math.min(1.0, baseArousal + 0.2);   // Higher arousal
  }
  
  if (hasSatisfaction) {
    basePleasure = Math.min(1.0, basePleasure + 0.2); // Higher pleasure
    baseArousal = Math.max(0.1, baseArousal - 0.1);   // Lower arousal (calm)
  }
  
  if (hasUrgency) {
    baseArousal = Math.min(1.0, baseArousal + 0.15); // Higher arousal
  }
  
  // Calculate Dominance (D) from message structure
  // Questions = lower dominance (seeking), commands = higher dominance
  const isQuestion = content.includes('?');
  const isCommand = content.match(/^(please|can you|could you|do|make|write|create)/i);
  const baseDominance = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);
  
  // Emotional intensity: High Arousal + Low Pleasure = Peaks (frustration)
  const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;
  
  return {
    pleasure: Math.max(0, Math.min(1, basePleasure)),
    arousal: Math.max(0, Math.min(1, baseArousal)),
    dominance: Math.max(0, Math.min(1, baseDominance)),
    emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity))
  };
}
```

#### 2.2 Update processConversationMessages
```typescript
// src/App.tsx
function processConversationMessages(
  conversation: ClassifiedConversation | null, 
  maxMessages: number
) {
  if (!conversation || !conversation.messages) {
    return [];
  }

  const commFunc = getCommunicationFunction(conversation);
  const convStruct = getConversationStructure(conversation);
  const dominantHumanRole = getDominantHumanRole(conversation);
  const dominantAiRole = getDominantAiRole(conversation);

  return conversation.messages
    .slice(0, maxMessages)
    .map((msg, index) => {
      // Calculate PAD for this message
      const pad = conversation.classification 
        ? calculateMessagePAD(
            msg,
            conversation.classification,
            index,
            conversation.messages.length
          )
        : undefined;
      
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        communicationFunction: commFunc,
        conversationStructure: convStruct,
        humanRole: dominantHumanRole?.role,
        aiRole: dominantAiRole?.role,
        roleConfidence: msg.role === 'user'
          ? dominantHumanRole?.value
          : dominantAiRole?.value,
        pad // NEW: Add PAD scores
      };
    });
}
```

### Phase 3: Update Path Point Generation

#### 3.1 Modify generatePathPoints
```typescript
// src/utils/terrain.ts
export function generatePathPoints(
  heightmap: Float32Array,
  size: number,
  count: number,
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
    humanRole?: string;
    aiRole?: string;
    roleConfidence?: number;
    pad?: { // NEW
      pleasure: number;
      arousal: number;
      dominance: number;
      emotionalIntensity: number;
    };
  }>
): PathPoint[] {
  // ... existing X/Y positioning code ...
  
  for (let i = 0; i < count; i++) {
    const message = messages[i % messages.length];
    // ... existing X/Y calculation ...
    
    // Get terrain height at this position
    const terrainHeight = heightmap[ty * size + tx] ?? 0;
    
    // NEW: Calculate PAD-based height
    // If message has PAD, use it for Z-height (frustration peaks)
    // Otherwise fall back to terrain height
    let padHeight: number | undefined;
    if (message.pad) {
      // High emotional intensity (frustration/agitation) = higher peaks
      // Low emotional intensity (affiliation) = valleys
      // Scale: 0 = valley, 1 = peak (above terrain)
      padHeight = message.pad.emotionalIntensity;
    }
    
    points.push({
      x: currentX,
      y: currentY,
      height: terrainHeight, // Keep terrain height as base
      padHeight, // NEW: PAD-based height override
      role: message.role,
      communicationFunction: message.communicationFunction,
      conversationStructure: message.conversationStructure,
      humanRole: message.humanRole,
      aiRole: message.aiRole,
      roleConfidence: message.roleConfidence,
      pad: message.pad // NEW: Store PAD scores
    });
  }
  
  return points;
}
```

### Phase 4: Update Visualization

#### 4.1 Modify Marker Height Calculation
```typescript
// src/components/ThreeScene.tsx
function createMarkerGroup(
  point: PathPoint,
  idx: number,
  terrainSize: number,
  terrainHeight: number
) {
  // ... existing code ...
  
  const worldX = (point.x - 0.5) * terrainSize;
  const worldZ = (point.y - 0.5) * terrainSize;
  
  // NEW: Use PAD height if available, otherwise terrain height
  let worldY: number;
  if (point.padHeight !== undefined) {
    // PAD-based height: emotionalIntensity determines height above terrain
    // Scale: 0 (affiliation valley) to 1 (frustration peak)
    // Map to height: valley = terrain level, peak = 2x terrain height
    const baseTerrainY = point.height * terrainHeight;
    const padOffset = (point.padHeight - 0.5) * terrainHeight * 0.8; // -0.4 to +0.4 range
    worldY = baseTerrainY + padOffset;
  } else {
    // Fallback: use terrain height
    worldY = point.height * terrainHeight;
  }
  
  // ... rest of marker creation ...
}
```

#### 4.2 Update Path Line Height
```typescript
// src/components/ThreeScene.tsx (in marker/path creation effect)
const pathPositions = visiblePoints.flatMap(p => [
  (p.x - 0.5) * terrainSize,
  // Use PAD height if available
  (p.padHeight !== undefined 
    ? (p.height * terrainHeight) + ((p.padHeight - 0.5) * terrainHeight * 0.8)
    : p.height * terrainHeight) + MARKER_CONFIG.PATH_Y_OFFSET,
  (p.y - 0.5) * terrainSize
]);
```

### Phase 5: Update HUD to Show PAD Scores

#### 5.1 Add PAD Display to HUD
```typescript
// src/components/HUDOverlay.tsx
{activePoint?.pad && (
  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.borderRgba(0.15)}` }}>
    <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 6 }}>
      AFFECTIVE STATE (PAD)
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>Pleasure: {Math.round(activePoint.pad.pleasure * 100)}%</div>
        <div style={{ 
          height: 4, 
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${activePoint.pad.pleasure * 100}%`,
            background: activePoint.pad.pleasure > 0.6 ? '#4ade80' : '#f97316'
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>Arousal: {Math.round(activePoint.pad.arousal * 100)}%</div>
        <div style={{ 
          height: 4, 
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${activePoint.pad.arousal * 100}%`,
            background: '#7b68ee'
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          Intensity: {Math.round(activePoint.pad.emotionalIntensity * 100)}%
          {activePoint.pad.emotionalIntensity > 0.6 && (
            <span style={{ color: '#f97316', marginLeft: 6 }}>Peak (Frustration)</span>
          )}
          {activePoint.pad.emotionalIntensity < 0.4 && (
            <span style={{ color: '#4ade80', marginLeft: 6 }}>Valley (Affiliation)</span>
          )}
        </div>
      </div>
    </div>
  </div>
)}
```

---

## Data Flow Summary

```
Conversation Classification
  ↓
Message Array
  ↓
calculateMessagePAD() [NEW]
  ↓ (for each message)
PAD scores (pleasure, arousal, dominance, emotionalIntensity)
  ↓
processConversationMessages() [UPDATED]
  ↓
Messages with PAD scores
  ↓
generatePathPoints() [UPDATED]
  ↓
PathPoints with padHeight [NEW]
  ↓
createMarkerGroup() [UPDATED]
  ↓
3D Markers with PAD-based Z-height
  ↓
Visualization: Peaks = Frustration, Valleys = Affiliation
```

---

## Testing Checklist

- [ ] PAD scores calculated correctly per message
- [ ] Frustration markers detected (low pleasure, high arousal)
- [ ] Satisfaction markers detected (high pleasure, low arousal)
- [ ] Markers show correct heights (peaks for frustration, valleys for affiliation)
- [ ] Path line follows PAD heights
- [ ] HUD displays PAD scores correctly
- [ ] Fallback works when PAD not available (uses terrain height)
- [ ] Visual peaks correspond to frustrating messages
- [ ] Visual valleys correspond to affiliative messages

---

## Future Enhancements

1. **Multimodal Fusion** (envisioned):
   - Face analysis (webcam/recording)
   - Voice analysis (pitch, volume, stress)
   - Enhanced sentiment analysis

2. **Classifier Enhancement**:
   - Option to output PAD scores in classification JSON
   - Windowed PAD analysis for temporal patterns

3. **Visual Enhancements**:
   - Color-code markers by emotional intensity
   - Animate peaks/valleys based on PAD transitions
   - Show PAD trajectory over time

---

## Migration Path

1. **Phase 1** (Week 1): Data structure changes, PAD calculation function
2. **Phase 2** (Week 1): Update path point generation
3. **Phase 3** (Week 2): Update visualization (markers, path)
4. **Phase 4** (Week 2): HUD updates, testing
5. **Phase 5** (Week 3): Refinement, documentation

---

## Notes

- Current implementation uses text-based approximation
- Fully multimodal PAD requires additional infrastructure (webcam, microphone, processing)
- PAD scores can be refined with better NLP models (sentiment, emotion detection)
- Consider caching PAD calculations for performance

