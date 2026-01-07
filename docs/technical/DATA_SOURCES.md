# Data Sources Used in Conversational Topography

This document describes all data sources used in the visualization system.

## Primary Data Sources

### 1. **Classified Conversations** (Primary - Currently Active) ✅

**Location:** `output/conv-*.json` → `public/output/conv-*.json`

**Source:** OpenAI GPT-4 classifier processing conversations

**Count:** 160 conversations (as of 2025-01-03)
- **Chatbot Arena:** 128 conversations (80%)
- **OpenAssistant (OASST):** 32 conversations (20%)
- **WildChat:** 589 conversations downloaded (integration in progress)

**Size:** ~1.2MB total (estimated)

**Structure:**
```json
{
  "id": "conv-0",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "classification": {
    "interactionPattern": {"category": "casual-chat", "confidence": 0.7, ...},
    "powerDynamics": {"category": "balanced", ...},
    "emotionalTone": {"category": "playful", ...},
    "engagementStyle": {...},
    "knowledgeExchange": {...},
    "conversationPurpose": {...},
    "topicDepth": {...},
    "turnTaking": {...},
    "humanRole": {"distribution": {"seeker": 0.5, "sharer": 0.5, ...}},
    "aiRole": {"distribution": {"reflector": 0.8, ...}}
  },
  "classificationMetadata": {
    "model": "gpt-4",
    "provider": "openai",
    "timestamp": "...",
    "processingTimeMs": 38429
  }
}
```

**How It's Used:**
- **Terrain Generation:** Classification → deterministic seed → heightmap
- **Message Positioning:** Classification → X/Y coordinates (communicationFunction, conversationStructure)
- **Terrain Cards:** Classification → name, description, seed
- **Visualization:** Messages from conversation → 3D markers on terrain

**Status:** ✅ Active (default mode)

---

### 2. **PersonaChat Dataset** (Alternative - Available)

**Location:** `src/data/personaChatMessages.json`

**Source:** Pre-processed conversation dataset

**Size:** 711KB

**Structure:**
```json
{
  "conversations": [
    {
      "personality": ["friendly", "helpful"],
      "messages": [
        {"role": "user", "content": "...", "communicationFunction": 0.5, "conversationStructure": 0.6},
        {"role": "assistant", "content": "...", ...}
      ],
      "fullHistory": [...],
      "candidates": [...]
    }
  ]
}
```

**Count:** 145 conversations, ~1,206 messages total

**How It's Used:**
- **Categorized Messages:** Organized into 8 categories (instrumental/expressive × structured/emergent)
- **Filtering:** Can filter by category
- **Fallback:** Used when classified conversations aren't available

**Status:** ⚠️ Available but not primary (toggle in UI)

---

### 3. **Sample Messages** (Fallback - Hardcoded)

**Location:** `src/data/messages.ts`

**Source:** Hardcoded example messages

**Count:** 13 messages

**Structure:**
```typescript
{
  role: 'user' | 'assistant',
  content: string,
  communicationFunction: number,  // 0-1
  conversationStructure: number   // 0-1
}
```

**How It's Used:**
- **Default:** Shown when no other data source is selected
- **Demo:** Quick demonstration of visualization
- **Testing:** Development and testing

**Status:** ⚠️ Fallback only

---

## Data Flow

### Current Active Flow (Classified Conversations)

```
1. Load: /public/output/conv-*.json
   ↓
2. Parse: ClassifiedConversation[]
   ↓
3. Convert: conversationsToTerrains() → TerrainPreset[]
   ↓
4. Display: Terrain cards in grid
   ↓
5. Select: User clicks terrain card
   ↓
6. Extract: Conversation messages + classification
   ↓
7. Map: getCommunicationFunction() + getConversationStructure()
   ↓
8. Position: generatePathPoints() → PathPoint[]
   ↓
9. Visualize: 3D markers on terrain
```

### Alternative Flow (PersonaChat)

```
1. Load: personaChatMessages.json
   ↓
2. Filter: getMessagesByCategory(categoryId)
   ↓
3. Extract: Messages with communicationFunction/conversationStructure
   ↓
4. Position: generatePathPoints() → PathPoint[]
   ↓
5. Visualize: 3D markers on terrain
```

---

## Data Dimensions Used

### From Classified Conversations

| Dimension | Used For | Example Values |
|-----------|----------|----------------|
| `interactionPattern.category` | Terrain seed, Y-axis (structure) | casual-chat, question-answer, collaborative |
| `conversationPurpose.category` | X-axis (function) | entertainment, information-seeking, problem-solving |
| `emotionalTone.category` | Terrain seed, description | playful, neutral, supportive |
| `topicDepth.category` | Terrain seed | surface, moderate, deep (DEPRECATED/UNUSED) |
| `humanRole.distribution` | Description | seeker: 0.5, sharer: 0.5 |
| `aiRole.distribution` | Description | reflector: 0.8, facilitator: 0.2 |
| `messages[].content` | Visualization | Actual message text |
| `messages[].role` | Visualization | user or assistant |

### From PersonaChat Dataset

| Dimension | Used For | Example Values |
|-----------|----------|----------------|
| `communicationFunction` | X-axis position | 0.0-1.0 (instrumental ↔ expressive) |
| `conversationStructure` | Y-axis position | 0.0-1.0 (structured ↔ emergent) |
| `messages[].content` | Visualization | Actual message text |
| `messages[].role` | Visualization | user or assistant |

---

## Data Statistics

### Classified Conversations (Current)
- **Total Conversations:** 160 (as of 2025-01-03)
- **Average Messages per Conversation:** ~10-18
- **Total Messages:** ~1,600-2,880
- **Classification Dimensions:** 9 per conversation (topicDepth removed)
- **Data Points:** ~1,440 classification values + ~2,000+ messages
- **PAD Coverage:** 100% (all messages have PAD scores)
- **Source Distribution:** 80% Chatbot Arena, 20% OASST

### PersonaChat Dataset (Available)
- **Total Conversations:** 145
- **Total Messages:** 1,206
- **Average Messages per Conversation:** ~8.3
- **Categories:** 8 conversation categories

---

## How Data Determines Visualization

### Terrain Shape
- **Determined by:** Classification categories → seed → heightmap
- **Same conversation = same terrain** (deterministic)
- **Different conversations = different terrains**

### Message Positions
- **X-axis:** `conversationPurpose` → `communicationFunction` (0.0-1.0)
  - Left = Instrumental (task-oriented)
  - Right = Expressive (entertainment, relationship-building)
  
- **Y-axis:** `interactionPattern` → `conversationStructure` (0.0-1.0)
  - Back = Structured (question-answer, advisory)
  - Front = Emergent (collaborative, casual-chat)

- **Z-axis:** Height from terrain at (X, Y) position
  - Messages "sit on" the terrain surface

### Terrain Names & Descriptions
- **Name:** `interactionPattern` + `emotionalTone` (e.g., "Casual Chat Playful")
- **Description:** Summary of key dimensions and roles

---

## Data Loading

### Classified Conversations
```typescript
// Loads from /public/output/conv-*.json
loadClassifiedConversations()
  → fetches sequentially: conv-0.json, conv-1.json, ...
  → caches results
  → returns ClassifiedConversation[]
```

### PersonaChat
```typescript
// Loads from bundled JSON
import personaChatData from './personaChatMessages.json'
  → processes into categorized conversations
  → filters by category if needed
  → returns Message[]
```

---

## Current Status

**Active Data Source:** ✅ Classified Conversations (160 files)
- Loaded on app mount
- Used for terrain generation
- Used for message visualization
- Default mode

**Available Data Source:** ⚠️ PersonaChat Dataset (145 conversations)
- Available via toggle
- Can filter by category
- Pre-processed with communicationFunction/conversationStructure

**Fallback Data:** ⚠️ Sample Messages (13 hardcoded)
- Used when no other source available
- For testing/demo

---

## Future Data Sources

Potential additions:
- [x] More classified conversations (expanded to 160, WildChat integration in progress)
- [ ] Complete WildChat classification (589 conversations)
- [ ] Real-time conversation classification
- [ ] Import custom conversation files
- [ ] Export visualization data
- [ ] Comparison mode (multiple conversations side-by-side)
- [ ] Cross-dataset validation (Chatbot Arena vs. WildChat)

