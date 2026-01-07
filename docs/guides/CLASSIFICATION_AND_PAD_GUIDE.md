# Classification and PAD Generation Guide

**Complete guide** for classifying conversations and generating PAD values.

---

## Quick Start

### Classify Remaining Files
```bash
cd classifier
./classify.sh  # Auto-detects and classifies unclassified conversations
```

### Generate PAD Values
```bash
# LLM-based (recommended)
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output

# Rule-based (legacy)
node scripts/add-pad-to-data.js
```

---

## Classification Options

### OpenAI GPT-4 ⭐ **Currently Active**

**File:** `classifier/classifier-openai.py`  
**Model:** `gpt-4`  
**API Key:** `OPENAI_API_KEY`

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
- ✅ Custom output directory (`--output-dir`)
- ✅ Error handling

**Cost:** ~$0.02-0.03 per conversation  
**Speed:** ~30-40 seconds per conversation

### Anthropic Claude (Alternative)

**File:** `classifier/classifier-v1.1.py`  
**Model:** `claude-sonnet-4-20250514`  
**API Key:** `ANTHROPIC_API_KEY`

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

**Cost:** ~$0.01-0.02 per conversation  
**Speed:** ~25-35 seconds per conversation

---

## PAD Generation Options

### LLM-Based PAD Generation ✅ **Recommended**

**Script:** `scripts/regenerate-pad-for-low-diversity.py`  
**Model:** GPT-4o-mini (OpenAI)  
**Method:** Batch processing (single API call per conversation)

**Status:** ✅ **Implemented** - All 160 conversations have LLM-generated PAD values

**Usage:**
```bash
# Process single file
python3 scripts/regenerate-pad-for-low-diversity.py --file chatbot_arena_01.json

# Process all files
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output

# Process WildChat conversations
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat
```

**Benefits:**
- ✅ Multilingual (works across languages)
- ✅ Context-aware emotional understanding
- ✅ More accurate frustration/satisfaction detection
- ✅ Understands conversation flow and emotional shifts

**Cost:** ~$0.001-0.01 per conversation (GPT-4o-mini)

### Rule-Based PAD Generation (Legacy)

**Script:** `scripts/add-pad-to-data.js`  
**Status:** ⚠️ **Legacy** - Replaced by LLM-based generation

**Usage:**
```bash
# Generate PAD values for all conversations
node scripts/add-pad-to-data.js

# Recalculate PAD values (if calculation logic changed)
node scripts/add-pad-to-data.js --force
```

**Note:** Rule-based generation is still available but LLM-based is recommended for better accuracy and multilingual support.

---

## Data Sources

### Current Dataset

| Source | Files | Status | Action |
|--------|-------|--------|--------|
| **chatbot_arena_*** | 128 files | ✅ Classified | Ready to use |
| **oasst-*** | 32 files | ✅ Classified | Ready to use |
| **wildchat-*** | 589 files | ⚠️ Needs classification | See `WILDCHAT_INTEGRATION.md` |
| **emo-*** | 28 files (5 done) | ⚠️ Partial | Run `./classify-remaining-emo.sh` |
| **sample-*** | 7 files | ✅ Complete | Ready to use |

**Total Classified**: 160 conversations (as of 2025-01-03)

### Classify Specific Data Source

#### Empathetic Dialogues (emo files)
```bash
cd classifier
./classify-remaining-emo.sh
```

#### WildChat Conversations
```bash
# Classify WildChat conversations (589 downloaded)
cd classifier
python3 batch-classify-unclassified.py --directory ../public/output-wildchat

# Generate PAD for WildChat conversations
python3 ../scripts/regenerate-pad-for-low-diversity.py --output-dir ../public/output-wildchat
```

---

## Common Commands

```bash
# Classify everything remaining
cd classifier && ./classify.sh

# Classify only emo files
cd classifier && ./classify-remaining-emo.sh

# Generate PAD values (LLM-based, recommended)
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output

# Generate PAD values (rule-based, legacy)
node scripts/add-pad-to-data.js

# Sync files to app
./sync-output-to-public.sh
```

---

## Related Documentation

- **Data Sources:** See `DATA_STRUCTURE.md` and `DATA_ORGANIZATION.md`
- **WildChat Integration:** See `WILDCHAT_INTEGRATION.md`
- **HuggingFace Guide:** See `HUGGINGFACE_CLASSIFICATION_GUIDE.md`
- **PAD Regeneration:** See `LLM_PAD_REGENERATION_GUIDE.md`

