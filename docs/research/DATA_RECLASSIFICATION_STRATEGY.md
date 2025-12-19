# Data Reclassification Strategy for PAD-Based Z-Axis

## Current Classification State

### What We Have
- **Conversation-level classification** (9 dimensions)
- Classification output includes: emotionalTone, engagementStyle, roles, etc.
- All conversations in `/public/output/` already classified
- Windowed classification capability exists (but still conversation-level per window)

### What We Need for PAD Model
- **Per-message PAD scores** (Pleasure, Arousal, Dominance)
- Temporal tracking of affective changes across the conversation
- Message-level affective intensity (not just conversation-level)

---

## Options for Reclassification

### Option 1: Post-Processing Approach (Recommended) ✅

**Strategy**: Keep existing classifications, add per-message PAD analysis as post-processing step

**How it works:**
1. Load existing classified conversations (no re-classification needed)
2. For each message in conversation:
   - Use conversation-level classification as base (emotionalTone, engagementStyle)
   - Analyze message content for PAD markers
   - Calculate PAD scores (can be done in app, no API calls)

**Pros:**
- ✅ No re-classification needed (uses existing data)
- ✅ No additional API costs
- ✅ Fast (client-side processing)
- ✅ Backward compatible (old conversations still work)
- ✅ Can refine algorithm without re-running classifiers

**Cons:**
- ⚠️ Less accurate than LLM-based per-message analysis
- ⚠️ Relies on text pattern matching

**Implementation:**
- Create `calculateMessagePAD()` function in TypeScript
- Run during message processing (in `processConversationMessages`)
- No changes to classification pipeline needed

**When to use:** Default approach - works immediately with existing data

---

### Option 2: Add Message-Level Classification to Classifier

**Strategy**: Modify classifier prompt to output PAD scores for each message

**How it works:**
1. Update classifier prompt to include per-message PAD analysis
2. Re-run classifier on all conversations
3. New output format includes `messagePAD` array alongside conversation classification

**New Output Format:**
```json
{
  "id": "conv-0",
  "messages": [...],
  "classification": {
    // ... existing conversation-level classification ...
  },
  "messagePAD": [
    {
      "messageIndex": 0,
      "role": "user",
      "content": "...",
      "pad": {
        "pleasure": 0.8,
        "arousal": 0.3,
        "dominance": 0.5,
        "emotionalIntensity": 0.35,
        "evidence": ["exact quote"],
        "rationale": "Brief explanation"
      }
    },
    // ... for each message
  ]
}
```

**Pros:**
- ✅ More accurate (LLM analyzes each message)
- ✅ Includes evidence and rationale
- ✅ Theoretically grounded (PAD from expert analysis)
- ✅ Can catch nuanced affective shifts

**Cons:**
- ❌ Requires re-running all classifiers (time + cost)
- ❌ Significant API costs (N messages × conversations)
- ❌ Breaking change (new data format)
- ❌ Longer processing time

**Cost Estimate:**
- ~50 conversations × 30 messages average = 1,500 API calls
- ~$0.01-0.03 per call = $15-45 per reclassification run

**When to use:** When you need high accuracy and have budget/time for reclassification

---

### Option 3: Hybrid Two-Pass Approach

**Strategy**: Conversation-level classification (existing) + selective per-message PAD for interesting conversations

**How it works:**
1. Keep existing conversation-level classifications
2. For conversations where affective tracking matters most:
   - Run second pass: per-message PAD analysis
   - Store in separate field: `messagePAD` (optional)
3. App falls back to post-processing if `messagePAD` not available

**Pros:**
- ✅ Selective accuracy where needed
- ✅ Cost-effective (only analyze important conversations)
- ✅ Backward compatible (works with or without messagePAD)
- ✅ Can iterate on which conversations need deep analysis

**Cons:**
- ⚠️ Inconsistent data (some have messagePAD, some don't)
- ⚠️ Need criteria for selecting conversations

**When to use:** When you want to prioritize specific conversations or test the approach before full reclassification

---

### Option 4: Windowed Analysis for Temporal Patterns

**Strategy**: Use existing windowed classification capability to track PAD changes over time

**How it works:**
1. Use classifier's `--windowed` flag (already supported)
2. Extract PAD from each window's classification
3. Interpolate PAD scores per message based on window membership

**Current Windowed Output:**
```json
{
  "classification": { /* overall */ },
  "windowedClassifications": [
    {
      "windowIndex": 0,
      "startMessage": 0,
      "endMessage": 5,
      "classification": { /* for messages 0-5 */ }
    },
    // ... overlapping windows
  ]
}
```

**Pros:**
- ✅ Uses existing classifier capability
- ✅ Shows temporal patterns (affective shifts)
- ✅ Only need to re-run with `--windowed` flag

**Cons:**
- ⚠️ Still approximate (windows, not per-message)
- ⚠️ PAD derived from window classification (not direct)
- ⚠️ Need to interpolate between windows

**When to use:** If you want temporal patterns but can't do full per-message classification

---

## Recommended Approach: Option 1 (Post-Processing) + Option 4 (Selective Enhancement)

### Phase 1: Immediate Implementation (Post-Processing)

**Action**: Implement `calculateMessagePAD()` in TypeScript
- Uses existing conversation classification
- Analyzes message content for PAD markers
- Works with all existing data immediately
- No reclassification needed

**Timeline**: Can implement today, works immediately

### Phase 2: Selective Enhancement (When Needed)

**Action**: For key conversations or research purposes:
- Run Option 2 (per-message PAD) on selected conversations
- Store in `messagePAD` field (optional)
- App prioritizes LLM-derived PAD if available, falls back to post-processing

**Timeline**: On-demand, when you need higher accuracy

---

## Implementation: Post-Processing Approach

### Step 1: Create Message PAD Calculator

**File**: `src/utils/conversationToTerrain.ts` (or new file `src/utils/padAnalysis.ts`)

```typescript
interface MessagePAD {
  pleasure: number;      // 0-1
  arousal: number;       // 0-1
  dominance: number;     // 0-1
  emotionalIntensity: number; // Derived: (1 - pleasure) + arousal
}

function calculateMessagePAD(
  message: { role: string; content: string },
  conversationClassification: Classification,
  messageIndex: number,
  totalMessages: number
): MessagePAD {
  // Implementation from Z_AXIS_IMPLEMENTATION_PLAN.md
  // Uses conversation classification + message content analysis
}
```

### Step 2: Update Data Processing

**File**: `src/App.tsx`

```typescript
function processConversationMessages(conversation: ClassifiedConversation | null, maxMessages: number) {
  // ... existing code ...
  
  return conversation.messages
    .slice(0, maxMessages)
    .map((msg, index) => {
      const pad = conversation.classification
        ? calculateMessagePAD(msg, conversation.classification, index, conversation.messages.length)
        : undefined;
      
      return {
        // ... existing fields ...
        pad // NEW
      };
    });
}
```

### Step 3: No Changes Needed to Classifiers

- Existing classified conversations work as-is
- No need to re-run classifiers
- PAD calculated on-the-fly during app runtime

---

## Alternative: Add PAD to Classifier (If You Want LLM-Generated PAD)

### Modified Prompt Addition

Add to `CLASSIFICATION_PROMPT`:

```
## DIMENSION 11: MESSAGE-LEVEL PAD SCORES (Optional)

For each message in the conversation, analyze its affective state using the PAD (Pleasure-Arousal-Dominance) model:

- **Pleasure (P)**: 0 = frustration/negative, 1 = satisfaction/positive
- **Arousal (A)**: 0 = calm, 1 = agitated/activated
- **Dominance (D)**: 0 = passive/receiving, 1 = controlling/directing

Output format:
{
  "messagePAD": [
    {
      "messageIndex": 0,
      "pad": {
        "pleasure": 0.7,
        "arousal": 0.4,
        "dominance": 0.5
      },
      "evidence": ["quote"],
      "rationale": "Brief explanation"
    },
    // ... for each message
  ]
}
```

### Modified Classifier Script

**New function**: `classify_with_message_pad()`
- Calls classifier for conversation-level
- For each message, calls LLM for PAD analysis (or batch process)
- Combines results

**Cost consideration**: 
- Full per-message: 50 conversations × 30 messages = 1,500 calls
- Batched approach: Group messages, reduce calls
- Estimated: $15-45 per full reclassification

---

## Decision Matrix

| Approach | Accuracy | Cost | Time | Compatibility | Recommended For |
|----------|----------|------|------|---------------|-----------------|
| **Post-Processing** | Medium | $0 | Immediate | ✅ Full | **Default/Start** |
| Per-Message LLM | High | $$$ | Hours | ⚠️ New format | Research/Key conversations |
| Hybrid | High | $$ | Selective | ✅ Compatible | **Selective enhancement** |
| Windowed | Medium-High | $ | Moderate | ✅ Compatible | Temporal patterns |

---

## Recommendation

### Start with: Post-Processing (Option 1)
- **Why**: Works immediately with existing data, no cost, no breaking changes
- **When**: Implement now, test with existing conversations
- **Then**: Evaluate if accuracy is sufficient

### Enhance with: Selective Per-Message (Option 2)
- **Why**: Higher accuracy for important conversations
- **When**: For key research conversations or DIS demo conversations
- **How**: Run classifier with PAD enhancement on selected subset

### Future: Full Reclassification (If Needed)
- **When**: If post-processing accuracy proves insufficient
- **How**: Modify classifier prompt, re-run on all conversations
- **Consideration**: Cost vs. accuracy trade-off

---

## Implementation Priority

1. **Week 1**: Implement post-processing PAD calculation ✅ Fast, works now
2. **Week 2**: Test accuracy with existing conversations
3. **Week 3**: If needed, enhance 5-10 key conversations with LLM-derived PAD
4. **Future**: Consider full reclassification if research needs demand it

---

## Migration Path (If Reclassifying)

### Option A: New Field (Non-Breaking)

Keep existing structure, add optional field:
```json
{
  "classification": { /* existing */ },
  "messagePAD": [ /* optional, new */ ]
}
```

**Pros**: Backward compatible, existing code still works

### Option B: Versioned Output

Create new classifier version (v1.2):
- `classifier-v1.2-pad.py`
- Outputs include messagePAD
- Can run alongside v1.1

**Pros**: Clear versioning, can compare old vs new

### Option C: Separate PAD File

Store PAD scores separately:
- `conv-0.json` (existing)
- `conv-0-pad.json` (new, just PAD scores)

**Pros**: No changes to existing files, easy to add/remove

---

## Conclusion

**Best approach for now**: 
1. **Start with post-processing** (Option 1) - immediate, cost-free, compatible
2. **Test and validate** - see if accuracy meets needs
3. **Enhance selectively** (Option 3) - add LLM-derived PAD for key conversations if needed
4. **Full reclassification later** (Option 2) - only if research demands it

This gives you:
- ✅ Working PAD-based Z-axis immediately
- ✅ No breaking changes
- ✅ No additional costs initially
- ✅ Room to enhance accuracy later
- ✅ Research flexibility

