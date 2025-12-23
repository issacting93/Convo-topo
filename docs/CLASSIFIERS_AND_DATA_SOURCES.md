# Classifiers and Data Sources Overview

This document provides a comprehensive overview of all available classifiers and data sources in the Conversational Topography project.

---

## Classifiers

### 1. OpenAI GPT-4 Classifier ⭐ **Currently Active**

**File:** `classifier/classifier-openai.py`  
**Model:** `gpt-4`  
**API Key:** `OPENAI_API_KEY`  
**Provider:** OpenAI

**Status:** ✅ **Active** - Primary classifier in use

**Setup:**
```bash
export OPENAI_API_KEY=sk-your-key-here
pip install openai
```

**Usage:**
```bash
cd classifier
python3 classifier-openai.py input.json output.json --individual --output-dir ../output
```

**Features:**
- ✅ Individual file output (`--individual`)
- ✅ Batch processing
- ✅ Windowed analysis (`--windowed`)
- ✅ Custom output directory (`--output-dir`)
- ✅ Limit processing (`--limit N`)
- ✅ Error handling with error files

**Cost:** ~$0.02-0.03 per conversation  
**Speed:** ~30-40 seconds per conversation

**Metadata Generated:**
```json
{
  "classificationMetadata": {
    "model": "gpt-4",
    "provider": "openai",
    "timestamp": "2025-01-19T...",
    "promptVersion": "1.1.0",
    "processingTimeMs": 30000
  }
}
```

**Output Format:** Same as Anthropic (v1.1 compatible)

---

### 2. Anthropic Claude Classifier (Original)

**File:** `classifier/classifier-v1.1.py`  
**Model:** `claude-sonnet-4-20250514`  
**API Key:** `ANTHROPIC_API_KEY`  
**Provider:** Anthropic

**Status:** ⚠️ **Available** - Original implementation, well-tested

**Setup:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
pip install anthropic
```

**Usage:**
```bash
cd classifier
python3 classifier-v1.1.py input.json output.json --windowed --validation 30
```

**Features:**
- ✅ Original v1.1 implementation
- ✅ Windowed analysis for temporal dynamics
- ✅ Validation mode
- ✅ Excellent JSON compliance
- ✅ Well-tested

**Cost:** ~$0.01-0.02 per conversation  
**Speed:** ~25-35 seconds per conversation

**Metadata Generated:**
```json
{
  "classificationMetadata": {
    "model": "claude-sonnet-4-20250514",
    "provider": "anthropic",
    "timestamp": "2025-01-19T...",
    "promptVersion": "1.1.0",
    "processingTimeMs": 28000
  }
}
```

**Output Format:** v1.1 standard (same as OpenAI version)

---

### 3. TypeScript Classifier (Alternative)

**File:** `classifier/classifier-v1.1.ts`  
**Language:** TypeScript  
**Status:** ⚠️ **Available** - Alternative implementation

**Note:** TypeScript version for environments where Python is not available. Uses same prompt and logic as Python versions.

---

## Data Sources

### Raw Data Sources

#### 1. Cornell Movie Dialogues

**Location:** `conversations-raw/cornell-*.json`  
**Count:** 10 files (cornell-0.json through cornell-9.json)  
**Format:** Raw conversation data  
**Status:** ✅ Available in `output/` as classified

**Description:** Movie dialogue dataset from Cornell University

**Usage:**
```bash
# These are already processed and in output/
# New cornell conversations can be classified with:
python3 classifier-openai.py cornell-conversations.json output.json --individual
```

---

#### 2. Kaggle Empathetic Dialogues

**Location:** `conversations-raw/kaggle-emo-*.json`  
**Count:** 10 files (kaggle-emo-0.json through kaggle-emo-9.json)  
**Format:** Empathetic dialogue conversations  
**Status:** ✅ Available in `output/` as classified

**Description:** Empathetic dialogues dataset from Kaggle

**Download Script:** `data/download-kaggle-empathetic.py`

**Usage:**
```bash
# Download new conversations
cd data
python3 download-kaggle-empathetic.py --limit 100

# Classify them
cd ../classifier
./classify.sh
```

---

#### 3. Empathetic Dialogues (Local)

**Location:** `data/emo.md`, `data/empathetic_dialogues_sample.json`  
**Format:** CSV (emo.md) → JSON (processed)  
**Status:** ✅ Processed, available in `output/emo-*.json`

**Extraction Script:** `data/extract_emo_conversations.py`

**Emotions Covered:**
- afraid, angry, annoyed, ashamed, confident, embarrassed
- excited, faithful, grateful, guilty, jealous, joyful
- lonely, nostalgic, prepared, proud, sad, sentimental
- surprised, terrified

**Usage:**
```bash
# Extract from emo.md
cd data
python3 extract_emo_conversations.py

# Classify extracted conversations
cd ../classifier
python3 classifier-openai.py ../data/empathetic_dialogues_sample.json output.json --individual --output-dir ../output
```

---

#### 4. Sample Conversations

**Location:** `data/sample-conversations.json`, `output/sample-*.json`  
**Format:** Pre-written sample conversations  
**Count:** 7 sample conversations  
**Status:** ✅ All classified and available

**Samples:**
- `sample-very-shallow.json`
- `sample-shallow-moderate.json`
- `sample-question-answer.json`
- `sample-medium-depth.json`
- `sample-deep-discussion.json`
- `sample-deep-technical.json`
- `sample-very-deep.json`

**Generation Script:** `data/generate-sample-conversations.py`

---

### Classified Data Sources

#### 1. Main Conversations (`conv-*.json`)

**Location:** `output/conv-*.json` → `public/output/conv-*.json`  
**Count:** 20 files (conv-0 through conv-19)  
**Classifier Used:** OpenAI GPT-4  
**Status:** ✅ **Active** - Primary data source

**Source:** Mixed (Cornell, Kaggle, Empathetic Dialogues)

---

#### 2. Empathetic Dialogues (`emo-*.json`)

**Location:** `output/emo-*.json` → `public/output/emo-*.json`  
**Count:** 28 files (5 classified, 23 unclassified)  
**Classifier Used:** OpenAI GPT-4  
**Status:** ⚠️ **Partial** - Some need classification

**Format:** `emo-{emotion}-{index}.json`

**To Classify Remaining:**
```bash
cd classifier
./classify-remaining-emo.sh
```

---

#### 3. Sample Conversations (`sample-*.json`)

**Location:** `output/sample-*.json` → `public/output/sample-*.json`  
**Count:** 7 files  
**Classifier Used:** OpenAI GPT-4  
**Status:** ✅ **Complete** - All classified

---

### Alternative Data Sources (Not Classified)

#### 1. PersonaChat Dataset

**Location:** `src/data/personaChatMessages.json`  
**Size:** 711KB  
**Count:** 145 conversations, ~1,206 messages  
**Format:** Pre-processed with heuristics  
**Status:** ⚠️ **Available** - Alternative visualization mode

**Description:** Pre-processed conversations with heuristic-based `communicationFunction` and `conversationStructure` values (not LLM-classified)

**How It's Used:**
- Alternative visualization mode in UI
- Per-message heuristics (not conversation-level classification)
- Filterable by category

---

## Classification Workflow Scripts

### Main Workflow Scripts

#### `classify.sh` - Main Entry Point

**Location:** `classifier/classify.sh`  
**Purpose:** Unified workflow for classification

**Features:**
- Auto-detects unclassified conversations
- Handles API key validation
- Automatically saves individual files
- Syncs to `public/output/`

**Usage:**
```bash
cd classifier
./classify.sh                                    # Classify remaining unclassified
./classify.sh input.json output.json             # Classify specific file
./classify.sh input.json output.json --limit 10  # Limit to first 10
```

---

#### `classify-remaining-emo.sh` - Emo Files Only

**Location:** `classifier/classify-remaining-emo.sh`  
**Purpose:** Classify only unclassified emo files

**Usage:**
```bash
cd classifier
./classify-remaining-emo.sh
```

**What It Does:**
1. Finds all unclassified `emo-*.json` files
2. Classifies them with OpenAI GPT-4
3. Saves to `output/`
4. Syncs to `public/output/`

---

### Utility Scripts

#### `split-classified-output.py`

**Location:** `classifier/split-classified-output.py`  
**Purpose:** Split combined JSON output into individual files

**Usage:**
```bash
python3 split-classified-output.py classified-output.json --sync-public
```

**Options:**
- `--start-index N` - Start numbering from N
- `--output-dir DIR` - Output directory
- `--sync-public` - Copy to `public/output/`
- `--prefix PREFIX` - File prefix (default: "conv-")

---

#### `classify-emo-files.py`

**Location:** `classifier/classify-emo-files.py`  
**Purpose:** Prepare unclassified emo files for classification

**Usage:**
```bash
python3 classify-emo-files.py
```

**Output:** Creates `unclassified-emo-conversations.json`

---

## Data Flow

### Complete Classification Workflow

```
Raw Data Sources
├── conversations-raw/
│   ├── cornell-*.json
│   ├── kaggle-emo-*.json
│   └── all-conversations.json
└── data/
    ├── emo.md
    ├── empathetic_dialogues_sample.json
    └── sample-conversations.json
        ↓
    [Extraction Scripts]
        ↓
    Prepared Conversations
        ↓
    [Classifier Selection]
    ├── OpenAI GPT-4 (classifier-openai.py) ⭐
    └── Anthropic Claude (classifier-v1.1.py)
        ↓
    Classified Output
    ├── output/
    │   ├── conv-*.json
    │   ├── emo-*.json
    │   └── sample-*.json
    └── public/output/ (synced)
        ↓
    Application Loads
    ├── src/data/classifiedConversations.ts
    └── TerrainGrid visualization
```

---

## Classifier Comparison

| Feature | OpenAI GPT-4 | Anthropic Claude | TypeScript |
|---------|-------------|------------------|------------|
| **Status** | ✅ Active | ⚠️ Available | ⚠️ Available |
| **Cost/Conversation** | ~$0.02-0.03 | ~$0.01-0.02 | N/A |
| **Speed** | ~30-40s | ~25-35s | N/A |
| **JSON Compliance** | Good | Excellent | Same as Python |
| **Individual Files** | ✅ Yes | ⚠️ Manual | ✅ Yes |
| **Windowed Mode** | ✅ Yes | ✅ Yes | ⚠️ Unknown |
| **Error Handling** | ✅ Yes | ⚠️ Basic | ⚠️ Unknown |

---

## Data Source Summary

| Data Source | Location | Count | Status | Classifier |
|-------------|----------|-------|--------|------------|
| **conv-*.json** | `output/`, `public/output/` | 20 | ✅ Active | OpenAI GPT-4 |
| **emo-*.json** | `output/`, `public/output/` | 28 (5 classified) | ⚠️ Partial | OpenAI GPT-4 |
| **sample-*.json** | `output/`, `public/output/` | 7 | ✅ Complete | OpenAI GPT-4 |
| **cornell-*.json** | `conversations-raw/` | 10 | ✅ Available | - |
| **kaggle-emo-*.json** | `conversations-raw/` | 10 | ✅ Available | - |
| **PersonaChat** | `src/data/` | 145 | ⚠️ Alternative | Heuristics |

---

## Metadata Tracking

Each classified conversation includes metadata about which classifier was used:

```json
{
  "classificationMetadata": {
    "model": "gpt-4" | "claude-sonnet-4-20250514",
    "provider": "openai" | "anthropic",
    "timestamp": "ISO 8601 timestamp",
    "promptVersion": "1.1.0",
    "processingTimeMs": 30000,
    "windowed": false
  }
}
```

**This allows you to:**
- Track which classifier created each classification
- Compare results between classifiers
- Filter by classifier/provider
- Monitor processing times

---

## Quick Reference

### Classify New Conversations

```bash
# Using OpenAI (recommended)
cd classifier
./classify.sh

# Using Anthropic Claude
cd classifier
python3 classifier-v1.1.py input.json output.json --individual --output-dir ../output
```

### Classify Specific Data Source

```bash
# Emo files only
cd classifier
./classify-remaining-emo.sh

# Cornell conversations
python3 classifier-openai.py ../conversations-raw/cornell-conversations.json output.json --individual

# Kaggle conversations
python3 classifier-openai.py ../conversations-raw/kaggle-conversations.json output.json --individual
```

### Sync to Public Directory

```bash
# Automatic (built into classify.sh)
# Or manual:
./sync-output-to-public.sh
```

---

## Recommendations

### For New Classifications

1. **Use OpenAI GPT-4** (`classifier-openai.py`) - Currently active and well-integrated
2. **Use `classify.sh`** - Simplest workflow with auto-detection
3. **Use `--individual` flag** - Automatically saves individual files
4. **Sync to public/** - Files are automatically synced for app access

### For Comparison Studies

1. **Use both classifiers** on the same conversations
2. **Track metadata** - Classifier info is stored in `classificationMetadata`
3. **Compare results** - Same prompt version (1.1.0) ensures consistency

### For Data Management

1. **Keep raw data** in `conversations-raw/` or `data/`
2. **Classified data** goes in `output/`
3. **Synced data** for app goes in `public/output/`
4. **Document which classifier** was used for each batch

---

## PAD Value Generation

PAD (Pleasure-Arousal-Dominance) values are stored in each message within classified conversations. These values control the Z-axis visualization (marker heights).

### Current Implementation

**Method**: Rule-based pattern matching  
**Script**: `scripts/add-pad-to-data.js`  
**Location**: PAD values stored in `messages[].pad` object

**Structure:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "...",
      "pad": {
        "pleasure": 0.5,      // 0-1, low = frustration, high = satisfaction
        "arousal": 0.3,        // 0-1, low = calm, high = agitated
        "dominance": 0.4,      // 0-1, low = passive, high = in control
        "emotionalIntensity": 0.42  // (1 - pleasure) * 0.6 + arousal * 0.4
      }
    }
  ]
}
```

### PAD Generation Scripts

1. **`scripts/add-pad-to-data.js`** (Rule-based)
   - Adds PAD values to all conversation files
   - Uses conversation classification + message content analysis
   - Usage: `node scripts/add-pad-to-data.js [--force]`

2. **`scripts/generate-pad-with-llm-direct.py`** ✅ **Recommended** (LLM-based)
   - Uses OpenAI GPT-4o-mini API
   - Better multilingual support and accuracy
   - Context-aware analysis
   - Usage: `python3 scripts/generate-pad-with-llm-direct.py [--file filename] [--all]`
   - See `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md` for details

### Usage

```bash
# Generate PAD values for all conversations (rule-based)
node scripts/add-pad-to-data.js

# Recalculate PAD values (if calculation logic changed)
node scripts/add-pad-to-data.js --force

# LLM-based PAD generation (GPT-4o-mini) - Recommended
python3 scripts/generate-pad-with-llm-direct.py --file chatbot_arena_01.json
python3 scripts/generate-pad-with-llm-direct.py --all  # Process all files
python3 scripts/generate-pad-with-llm-direct.py --file chatbot_arena_01.json
python3 scripts/generate-pad-with-llm-direct.py --all  # Process all files
```

---

## Future Enhancements

Potential improvements:
- [ ] LLM-based PAD generation (see `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md`)
- [ ] Unified classifier selection interface
- [ ] Batch comparison tool (compare OpenAI vs Claude results)
- [ ] Data source metadata tracking
- [ ] Automatic classifier selection based on data source
- [ ] Cost estimation before classification
- [ ] Progress tracking for large batches
- [ ] Retry mechanism for failed classifications

