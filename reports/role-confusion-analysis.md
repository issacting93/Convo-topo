# Role Confusion Analysis: Empathetic Dialogues Dataset

## The Issue

The Empathetic Dialogues dataset contains **human-to-human** empathetic conversations, NOT human-AI conversations.

### Dataset Structure
- **"Customer"** (speaker_idx=1): Person experiencing emotion, sharing their situation
- **"Agent"** (speaker_idx=0): Person providing empathetic listening/responses

**Both participants are HUMANS**

### Current Mapping in Code
```json
{
  "role": "user",      // ← Customer/Speaker (HUMAN)
  "role": "assistant"  // ← Agent/Listener (ALSO HUMAN!)
}
```

### Classification System Assumption
The classification prompt (`src/data/prompt.ts`) analyzes conversations assuming:
- `"user"` = human participant
- `"assistant"` = AI participant

Therefore:
- `humanRole` → Analyzes "user" messages (Customer/Speaker) ✓ Correct
- `aiRole` → Analyzes "assistant" messages (Agent/Listener) ✗ **INCORRECT - this is a human!**

## Impact on Dimension Mapping

### Y-Axis (Structured ↔ Emergent)
Currently uses `aiRole` distribution (lines 281-295 in conversationToTerrain.ts):

```typescript
const roleBasedY =
  (aiRole.expert || 0) * 0.3 +
  (aiRole.advisor || 0) * 0.2 +
  (aiRole.facilitator || 0) * 0.7 +
  (aiRole.peer || 0) * 0.8 +
  (aiRole.reflector || 0) * 0.6 +
  (aiRole.affiliative || 0) * 0.5;
```

### Example: emo-afraid-1
```
Customer: "it feels like hitting to blank wall when i see the darkness"
Agent: "Oh ya? I don't really see how"
```

**Current Classification:**
- `humanRole`: {sharer: 1.0} → Customer sharing fear
- `aiRole`: {reflector: 1.0} → **Agent's empathetic listening classified as AI behavior**

**Mapping Result:**
- X-axis: 0.80 (very social) - using `sharer=1.0` weight
- Y-axis: 0.60 (emergent) - using `reflector=1.0` weight

**The Problem:**
The "reflector" classification is correct for the empathetic listener's behavior, BUT the weights (0.6) are calibrated for AI reflective behavior, not human empathetic listening.

## Implications

### 1. Semantic Mismatch
- AI roles (expert, advisor, facilitator, peer, reflector, affiliative) describe AI conversational strategies
- Human empathetic listeners may exhibit similar behaviors but with different intentions/context
- The role weights were designed for AI-human dynamics, not human-human dynamics

### 2. Y-Axis Interpretation
For Empathetic Dialogues conversations:
- Current Y-axis measures "How structured/emergent is the AI response?"
- Should measure "How structured/emergent is the conversation pattern?"

### 3. Mixed Dataset Issues
The project has THREE types of conversations:
1. **Synthetic AI conversations** (`sample-*.json`): Human-AI, roles correct
2. **Empathetic Dialogues** (`emo-*.json`): Human-Human, roles incorrect
3. **Other datasets**: Need to check each source

## Potential Solutions

### Option 1: Separate Classification for Human-Human Conversations
- Create `secondHumanRole` field for human-human conversations
- Adjust mapping logic to handle both AI and human second participants
- Requires updating prompt and classification system

### Option 2: Reinterpret Roles as "Participant Roles"
- Rename `aiRole` → `respondentRole` or `listenerRole`
- Update documentation to clarify these roles apply to ANY conversation participant
- Keep same mapping weights but change semantic interpretation

### Option 3: Dataset-Specific Mapping
- Detect conversation source (empathetic_dialogues vs others)
- Use different mapping logic for human-human vs human-AI conversations
- More complex but preserves semantic accuracy

### Option 4: Relabel Empathetic Dialogues Data
- Re-extract with both participants labeled as humans
- Don't use "user"/"assistant" roles for human-human conversations
- Update classification to analyze both as human participants

## Recommendation

**Option 2 (Reinterpret Roles)** seems most practical:

1. **Rename conceptually** (documentation only):
   - `humanRole` → `initiatorRole` or `primaryRole`
   - `aiRole` → `respondentRole` or `secondaryRole`

2. **Update DIMENSION_MAPPING.md** to clarify:
   - X-axis based on PRIMARY participant behavior (regardless of human/AI)
   - Y-axis based on SECONDARY participant behavior (regardless of human/AI)

3. **Advantages:**
   - No code changes required
   - Mapping logic remains valid
   - Handles mixed datasets
   - Role behaviors (expert, reflector, etc.) still meaningful

4. **Trade-off:**
   - Loses AI-specific semantic meaning
   - But gains generalizability to all conversation types

## Code Locations Affected

1. `src/data/prompt.ts` - Classification prompt (mentions "AI" explicitly)
2. `docs/DIMENSION_MAPPING.md` - Documentation uses "humanRole" and "aiRole"
3. `docs/SOCIOLINGUISTIC_TERMS.md` - Defines roles in AI-specific context
4. `src/utils/conversationToTerrain.ts` - Mapping implementation (variable names)

## Questions to Resolve

1. Is the project specifically about **AI conversations**, or **conversations in general**?
2. Should Empathetic Dialogues data be included, or only AI conversation data?
3. Do the role weights (0.2-0.8) still make sense for human-human conversations?
4. Should Y-axis measure "AI behavior" or "conversation structure" more generally?
