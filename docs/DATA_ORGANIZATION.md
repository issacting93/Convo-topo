# Data Organization Overview

**Date:** 2025-01-19  
**Status:** Current structure analysis

---

## Directory Structure

```
Cartography/
├── src/data/              # Frontend TypeScript data files
├── data/                  # Data processing Python scripts
├── conversations-raw/     # Raw conversation source files
├── classifier/            # Classification scripts
├── output/                # Classified conversations (before sync)
└── public/output/         # Classified conversations (served by app)
```

---

## 1. `/src/data/` - Frontend Data Files

**Purpose:** TypeScript/TypeScript data files used by the React application

### Files

| File | Purpose | Status |
|------|---------|--------|
| `classifiedConversations.ts` | Loads classified conversations from `/public/output/` | ✅ Active |
| `messages.ts` | Legacy message data | ⚠️ Review needed |
| `personaChatMessages.ts` | PersonaChat dataset loader | ⚠️ Alternative data source |
| `personaChatMessages.json` | PersonaChat dataset (711KB) | ⚠️ Large file, alternative source |
| `terrainPresets.ts` | Terrain visualization presets | ✅ Active |
| `taxonomy.json` | Current classification taxonomy | ✅ Active |
| `taxonomy-v1.1.json` | Taxonomy version 1.1 | ✅ Active |
| `taxonomy-v1.0.json.backup` | Taxonomy backup | 📦 Archive |
| `prompt.ts` | Classification prompt definitions | ✅ Active |
| `exampleClassificationOutput.json` | Example classification structure | 📚 Documentation |

### Data Flow

```
/public/output/*.json
    ↓
classifiedConversations.ts (loadClassifiedConversations)
    ↓
TerrainGrid component (displays cards)
ThreeScene component (3D visualization)
```

### Key Functions

- `loadClassifiedConversations()` - Fetches from `/output/conv-*.json`, `/output/sample-*.json`, `/output/emo-*.json`
- `getConversationById(id)` - Retrieves specific conversation

---

## 2. `/data/` - Data Processing Scripts

**Purpose:** Python scripts for downloading, extracting, and processing conversation data

### Scripts

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `download-kaggle-empathetic.py` | Downloads from Kaggle dataset | Kaggle API | `conversations-raw/kaggle-emo-*.json` |
| `download-conversation-datasets.py` | Multi-source downloader | Multiple APIs | `conversations-raw/` |
| `extract_emo_conversations.py` | Extracts from `emo.md` | `emo.md` | `conversations-raw/emo-*.json` |
| `extract_empathetic_dialogues.py` | Extracts from CSV | CSV files | `conversations-raw/` |
| `generate-sample-conversations.py` | Generates test conversations | None | `conversations-raw/sample-*.json` |

### Data Files

| File | Purpose | Status |
|------|---------|--------|
| `emo.md` | Local empathetic dialogues source | 📦 Source file |
| `empathetic_dialogues_sample.json` | Sample extracted dialogues | 📦 Example data |
| `sample-conversations.json` | Generated sample conversations | 📦 Test data |
| `classification-log.txt` | Classification processing log | 📝 Log file |

### Workflow

```
[Download/Extract Scripts]
    ↓
conversations-raw/
    ↓
[Classifier Scripts]
    ↓
output/
    ↓
[sync-output-to-public.sh]
    ↓
public/output/
```

---

## 3. `/conversations-raw/` - Raw Conversation Source Files

**Purpose:** Unclassified conversation data from various sources

### Contents

| Source | Files | Count | Format |
|--------|-------|-------|--------|
| **Cornell Movie Dialogues** | `cornell-0.json` ... `cornell-9.json` | 10 | Individual JSON files |
| **Kaggle Empathetic** | `kaggle-emo-0.json` ... `kaggle-emo-9.json` | 10 | Individual JSON files |
| **Combined** | `all-conversations.json` | 1 | Array of all conversations |

### File Structure

Each conversation file:
```json
{
  "id": "cornell-0",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

### Usage

1. **Source Files:** Keep all individual files
2. **Master List:** `all-conversations.json` is used by classifier to find unclassified conversations
3. **Classification:** Classifier checks `output/` vs `all-conversations.json` to identify missing classifications

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────────────────────────────────────────────┤
│  • Kaggle API                                                │
│  • Cornell Movie Dialogues                                   │
│  • Local files (emo.md, CSV, etc.)                          │
│  • Generated samples                                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /data/ PROCESSING SCRIPTS                                   │
├─────────────────────────────────────────────────────────────┤
│  • download-kaggle-empathetic.py                            │
│  • extract_emo_conversations.py                             │
│  • generate-sample-conversations.py                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /conversations-raw/ RAW FILES                               │
├─────────────────────────────────────────────────────────────┤
│  • cornell-*.json (10 files)                                │
│  • kaggle-emo-*.json (10 files)                             │
│  • all-conversations.json (master list)                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /classifier/ CLASSIFICATION                                 │
├─────────────────────────────────────────────────────────────┤
│  • classify.sh                                               │
│  • classifier-openai.py                                     │
│  • Checks unclassified vs output/                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /output/ CLASSIFIED FILES                                   │
├─────────────────────────────────────────────────────────────┤
│  • conv-*.json (classified conversations)                   │
│  • sample-*.json (classified samples)                       │
│  • emo-*.json (classified empathetic dialogues)             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  sync-output-to-public.sh                                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /public/output/ SERVED FILES                                │
├─────────────────────────────────────────────────────────────┤
│  • Available at /output/*.json in app                       │
│  • Served by Vite dev server / production build             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  /src/data/classifiedConversations.ts                       │
├─────────────────────────────────────────────────────────────┤
│  • loadClassifiedConversations()                            │
│  • Fetches from /output/conv-*.json                         │
│  • Fetches from /output/sample-*.json                       │
│  • Fetches from /output/emo-*.json                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  REACT APPLICATION                                           │
├─────────────────────────────────────────────────────────────┤
│  • TerrainGrid (displays cards)                             │
│  • ThreeScene (3D visualization)                            │
│  • HUDOverlay (control panel)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## File Naming Conventions

### Raw Conversations
- `cornell-{index}.json` - Cornell Movie Dialogues
- `kaggle-emo-{index}.json` - Kaggle Empathetic Dialogues
- `emo-{emotion}-{index}.json` - Empathetic dialogues by emotion

### Classified Conversations
- `conv-{index}.json` - Classified regular conversations
- `sample-{name}.json` - Classified sample conversations
- `emo-{emotion}-{index}.json` - Classified empathetic dialogues

### ID Format
- Raw: `cornell-0`, `kaggle-emo-1`, etc.
- Classified: Same ID preserved from raw file

---

## Key Relationships

### 1. Raw → Classified Mapping
```
conversations-raw/cornell-0.json
    → output/conv-X.json (ID: "cornell-0")
    → public/output/conv-X.json
```

### 2. Classification Status Tracking
```
all-conversations.json (all raw conversations)
    ↓
Classifier checks: output/*.json IDs
    ↓
Identifies unclassified conversations
    ↓
Classifies missing ones
```

### 3. App Loading
```
public/output/*.json
    ↓
classifiedConversations.ts (fetches sequentially)
    ↓
TerrainGrid displays cards
```

---

## Issues & Recommendations

### ✅ Well Organized
- Clear separation between raw and classified data
- Good documentation in README files
- Logical file naming conventions

### ⚠️ Areas for Improvement

1. **Large Files in src/data/**
   - `personaChatMessages.json` (711KB) - Consider moving to public/ or loading on demand
   - Multiple taxonomy versions - Consider versioning strategy

2. **Duplicate Data**
   - `taxonomy.json`, `taxonomy-v1.1.json`, `taxonomy-v1.0.json.backup` - Consolidate?
   - `messages.ts` - Check if still used

3. **Data Sync**
   - Manual sync step (`sync-output-to-public.sh`) - Could be automated
   - Consider watching output/ and auto-syncing

4. **File Discovery**
   - `classifiedConversations.ts` tries sequential loading (0-100) - Could use manifest file
   - Emo file loading tries all emotions - Could cache available files

### 📝 Recommendations

1. **Create Manifest File**
   ```json
   // public/output/manifest.json
   {
     "conversations": ["conv-0", "conv-1", ...],
     "samples": ["sample-very-shallow", ...],
     "emo": ["emo-afraid-1", ...],
     "lastUpdated": "2025-01-19T..."
   }
   ```

2. **Consolidate Taxonomy**
   - Keep only `taxonomy.json` (current)
   - Archive old versions to `docs/archive/`

3. **Move Large Files**
   - Move `personaChatMessages.json` to `public/data/` if needed
   - Or load on-demand

4. **Auto-sync Script**
   - Watch `output/` directory for changes
   - Auto-sync to `public/output/` on file changes

---

## Quick Reference

### Loading Conversations in App
```typescript
import { loadClassifiedConversations } from '@/data/classifiedConversations';

const conversations = await loadClassifiedConversations();
// Returns: ClassifiedConversation[]
```

### Adding New Raw Conversations
1. Add file to `conversations-raw/` (e.g., `cornell-10.json`)
2. Update `conversations-raw/all-conversations.json`
3. Run `classifier/classify.sh`
4. Sync: `./sync-output-to-public.sh`
5. Refresh app

### Classifying Conversations
```bash
cd classifier
./classify.sh
# Or manually:
python3 classifier-openai.py
```

### Syncing to Public
```bash
./sync-output-to-public.sh
```

---

## Summary

The data organization is **well-structured** with clear separation between:
- **Raw data** (`conversations-raw/`)
- **Processing scripts** (`data/`)
- **Classified data** (`output/` → `public/output/`)
- **Frontend loaders** (`src/data/`)

The main improvements would be:
1. ✅ Create manifest file for better file discovery
2. ✅ Consolidate taxonomy files
3. ✅ Consider auto-sync workflow
4. ✅ Review large files in `src/data/`

