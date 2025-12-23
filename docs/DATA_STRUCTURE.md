# Data Structure Overview

This document explains the data folders and how they're organized in the Conversational Topography project.

## Folder Structure

```
Cartography/
├── data/                    # Data processing scripts and source data
│   ├── extract_emo_conversations.py
│   ├── extract_empathetic_dialogues.py
│   ├── download-conversation-datasets.py
│   ├── generate-sample-conversations.py
│   ├── emo.md
│   ├── empathetic_dialogues_sample.json
│   └── sample-conversations.json
│
├── src/data/                # Application data files (TypeScript/JSON)
│   ├── classifiedConversations.ts
│   ├── personaChatMessages.ts
│   ├── personaChatMessages.json
│   ├── messages.ts
│   ├── terrainPresets.ts
│   ├── taxonomy.json
│   └── prompt.ts
│
└── output/                  # Classified conversation outputs
    └── conv-*.json, emo-*.json
```

---

## `/data/` Folder - Data Processing & Source Files

**Purpose**: Contains scripts for processing raw conversation data and converting it to the project format.

### Scripts

#### `extract_emo_conversations.py`
- **Purpose**: Extracts conversations from `emo.md` (empathetic dialogues dataset)
- **Input**: `emo.md` (malformed CSV with empathetic dialogues)
- **Output**: 
  - Individual files: `output/emo-{emotion}-{index}.json`
  - Combined file: `data/empathetic_dialogues_sample.json`
- **Features**:
  - Parses malformed CSV format
  - Groups conversations by emotion
  - Converts Customer/Agent → user/assistant format
  - Creates 28 conversations across 20 emotions

#### `extract_empathetic_dialogues.py`
- **Purpose**: Extracts conversations from Empathetic Dialogues dataset (Kaggle)
- **Input**: CSV file from Kaggle dataset
- **Output**: `data/empathetic_dialogues_sample.json`
- **Note**: Alternative extraction method for the same dataset

#### `generate-sample-conversations.py`
- **Purpose**: Generates sample conversations for testing/demo
- **Output**: `data/sample-conversations.json`
- **Creates**: Pre-written conversations with expected patterns (deep discussion, Q&A, collaborative, etc.)

#### `download-conversation-datasets.py`
- **Purpose**: Downloads conversation datasets from various sources
- **Sources**: HuggingFace, Kaggle, etc.
- **Output**: Raw dataset files

### Data Files

#### `emo.md`
- **Format**: Malformed CSV with empathetic dialogue data
- **Structure**: 
  - Columns: Situation, Emotion, Empathetic Dialogues, Labels
  - Each row = one turn in a conversation
  - Customer/Agent format
- **Size**: 213 lines, 106 conversation rows
- **Status**: ✅ Processed → 28 conversations extracted

#### `empathetic_dialogues_sample.json`
- **Format**: JSON array of conversations
- **Source**: Extracted from `emo.md` or Kaggle dataset
- **Structure**:
```json
[
  {
    "id": "emo-afraid-1",
    "messages": [{"role": "user", "content": "..."}, ...],
    "emotion": "afraid",
    "situation": "...",
    "source": "empathetic_dialogues"
  }
]
```
- **Status**: ✅ Ready for classification

#### `sample-conversations.json`
- **Format**: JSON array of pre-written conversations
- **Purpose**: Demo/testing conversations with known patterns
- **Structure**:
```json
[
  {
    "id": "sample-deep-discussion",
    "messages": [...],
    "expected_pattern": "debate",
    "expected_depth": "deep",
    "expected_tone": "serious"
  }
]
```

---

## `/src/data/` Folder - Application Data Files

**Purpose**: Contains TypeScript modules and JSON data used by the React application.

### TypeScript Modules

#### `classifiedConversations.ts`
- **Purpose**: Loads classified conversations from `public/output/`
- **Function**: `loadClassifiedConversations()`
- **Loads**:
  - `conv-*.json` files (via manifest or sequentially)
  - `sample-*.json` files (by known IDs)
  - `emo-*.json` files (by emotion and index)
  - `chatbot_arena_*.json` files (via manifest)
- **Returns**: `ClassifiedConversation[]` with PAD values in each message
- **Caching**: Yes (cached after first load)
- **PAD Support**: Uses PAD values from message `pad` objects, or calculates on-the-fly if missing

#### `personaChatMessages.ts`
- **Purpose**: Provides access to PersonaChat dataset
- **Imports**: `personaChatMessages.json` (711KB, 22K+ lines)
- **Functions**:
  - `getConversationMessages(id)` - Get messages for a conversation
  - `getFormattedMessages(count)` - Get formatted messages
  - `getMessagesByCategory(categoryId, count)` - Filter by category
  - `getCategoryOptions()` - Get available categories
- **Caching**: Yes (message cache, category cache)

#### `messages.ts`
- **Purpose**: Defines Message interface and sample messages
- **Exports**: 
  - `Message` interface
  - `SAMPLE_MESSAGES` array (13 hardcoded messages)

#### `terrainPresets.ts`
- **Purpose**: Defines terrain preset interface and default presets
- **Exports**:
  - `TerrainPreset` interface
  - `TERRAIN_PRESETS` array (9 default presets)

#### `prompt.ts`
- **Purpose**: Contains the classification prompt used by the classifier
- **Exports**: `CLASSIFICATION_PROMPT` string

### JSON Data Files

#### `personaChatMessages.json` (711KB)
- **Format**: Large JSON file with PersonaChat conversations
- **Structure**:
```json
{
  "conversations": [
    {
      "personality": ["friendly", "helpful"],
      "messages": [
        {
          "role": "user",
          "content": "...",
          "communicationFunction": 0.25,
          "conversationStructure": 0.85
        }
      ],
      "fullHistory": [...],
      "candidates": [...]
    }
  ]
}
```
- **Values**: Pre-calculated using heuristics (keyword matching)
- **Usage**: Loaded by `personaChatMessages.ts`

#### `taxonomy.json`
- **Purpose**: Complete taxonomy definitions for classification
- **Contains**: All 9 dimensions with categories, definitions, signals
- **Used by**: Classifier prompts, documentation

#### `exampleClassificationOutput.json`
- **Purpose**: Example of what classified conversation output looks like
- **Format**: Single classified conversation with full classification data

---

## Data Flow

### 1. Raw Data → Processed Data

```
emo.md (raw CSV)
  ↓
extract_emo_conversations.py
  ↓
output/emo-*.json (individual files)
  +
data/empathetic_dialogues_sample.json (combined)
```

### 2. Processed Data → Classified Data

```
data/empathetic_dialogues_sample.json
  ↓
classifier/classifier-openai.py
  ↓
output/emo-*.json (with classification)
  ↓
public/output/emo-*.json (served to app)
```

### 3. Classified Data → Application

```
public/output/conv-*.json, emo-*.json
  ↓
src/data/classifiedConversations.ts
  ↓
loadClassifiedConversations()
  ↓
App.tsx → TerrainGrid → Visualization
```

---

## Data Sources Summary

| Source | Location | Format | Values | Status |
|--------|----------|--------|--------|--------|
| **Classified Conversations** | `output/`, `public/output/` | JSON with classification | Calculated from classification | ✅ Active |
| **PersonaChat** | `src/data/personaChatMessages.json` | JSON with heuristics | Per-message heuristics | ⚠️ Available |
| **Sample Conversations** | `data/sample-conversations.json` | JSON | Pre-written | ✅ Available |
| **Empathetic Dialogues** | `data/emo.md` | CSV | Raw (needs classification) | ✅ Processed |

---

## Key Differences

### Classified Conversations (conv-*.json, emo-*.json, chatbot_arena_*.json)
- **Classification**: Calculated at conversation level from LLM classification
- **PAD Values**: Calculated per message using rule-based analysis (stored in message `pad` objects)
- **Method**: 
  - Classification: Role distributions, interaction patterns, engagement styles
  - PAD: Base values from classification + message-level pattern matching
- **Accuracy**: High for classification (LLM-based), good for PAD (rule-based, with LLM enhancement planned)
- **Usage**: Primary data source for visualization
- **Z-Axis**: Uses PAD `emotionalIntensity` for marker heights

### PersonaChat (personaChatMessages.json)
- **Values**: Calculated per-message using keyword heuristics
- **Method**: Keyword matching, question detection
- **Accuracy**: Medium (simple rules)
- **Usage**: Alternative/fallback data source

---

## File Naming Conventions

### Classified Conversations
- `conv-{index}.json` - Main classified conversations (0-19)
- `emo-{emotion}-{index}.json` - Empathetic dialogues by emotion
- `sample-{pattern}.json` - Sample conversations

### Processing Scripts
- `extract_*.py` - Extract from raw data
- `generate_*.py` - Generate synthetic data
- `download_*.py` - Download from external sources

---

## Usage Examples

### Loading Classified Conversations
```typescript
import { loadClassifiedConversations } from './data/classifiedConversations';

const conversations = await loadClassifiedConversations();
// Returns: ClassifiedConversation[] with classification data
```

### Accessing PersonaChat Data
```typescript
import { getMessagesByCategory } from './data/personaChatMessages';

const messages = getMessagesByCategory('expressive-emergent', 20);
// Returns: Message[] with communicationFunction/conversationStructure
```

### Processing Raw Data
```bash
# Extract from emo.md
python3 data/extract_emo_conversations.py

# Classify extracted conversations
python3 classifier/classifier-openai.py data/empathetic_dialogues_sample.json output/classified.json --individual
```

---

## Current Status

✅ **Active Data Sources:**
- 20 chatbot_arena conversations (`chatbot_arena_01.json` to `chatbot_arena_20.json`) - **Currently displayed**
- 20 classified conversations (`conv-0.json` to `conv-19.json`) - Available but hidden
- 5 classified empathetic dialogues (`emo-afraid-1`, `emo-afraid-2`, `emo-angry-1`, `emo-angry-2`, `emo-angry-3`)
- Sample conversations (7 files)

✅ **PAD Values:**
- All active conversations have PAD values in message `pad` objects
- Generated using rule-based analysis (`scripts/add-pad-to-data.js`) or LLM-based (`scripts/generate-pad-with-llm-direct.py`)
- LLM-based generation recommended for better accuracy (see `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md`)

⚠️ **Available but Not Primary:**
- PersonaChat dataset (145 conversations, 1,206 messages)
- Older conversation files (hidden in favor of chatbot_arena)

📝 **Processing Scripts:**
- Classification: `classifier/classifier-openai.py` (OpenAI GPT-4)
- PAD generation: `scripts/add-pad-to-data.js` (rule-based) or `scripts/generate-pad-with-llm-direct.py` (LLM-based, recommended)

