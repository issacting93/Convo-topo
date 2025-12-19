# Quick Reference: Classifiers and Data Sources

## Choose Your Workflow

### ⚡ Quick Start: Classify Remaining Files

```bash
cd classifier
./classify.sh  # Auto-detects and classifies unclassified conversations
```

### 🎯 Classify Specific Data Source

#### Empathetic Dialogues (emo files)
```bash
cd classifier
./classify-remaining-emo.sh
```

#### Cornell Conversations
```bash
cd classifier
python3 classifier-openai.py ../conversations-raw/cornell-batch.json output.json --individual --output-dir ../output
```

#### Kaggle Conversations
```bash
cd classifier
python3 classifier-openai.py ../conversations-raw/kaggle-batch.json output.json --individual --output-dir ../output
```

### 🔧 Choose Your Classifier

#### OpenAI GPT-4 (Recommended) ⭐
```bash
cd classifier
python3 classifier-openai.py input.json output.json --individual --output-dir ../output
```

#### Anthropic Claude
```bash
cd classifier
python3 classifier-v1.1.py input.json output.json --individual --output-dir ../output
```

---

## Data Sources at a Glance

| Source | Files | Status | Action |
|--------|-------|--------|--------|
| **conv-*** | 20 files | ✅ Classified | Ready to use |
| **emo-*** | 28 files (5 done) | ⚠️ Partial | Run `./classify-remaining-emo.sh` |
| **sample-*** | 7 files | ✅ Complete | Ready to use |
| **cornell-*** | 10 raw | ✅ Available | Classify if needed |
| **kaggle-emo-*** | 10 raw | ✅ Available | Classify if needed |

---

## Available Classifiers

1. **OpenAI GPT-4** (`classifier-openai.py`) ⭐ **Active**
   - Cost: ~$0.02-0.03/conversation
   - Speed: ~30-40s/conversation
   
2. **Anthropic Claude** (`classifier-v1.1.py`)
   - Cost: ~$0.01-0.02/conversation
   - Speed: ~25-35s/conversation

---

## Common Commands

```bash
# Classify everything remaining
cd classifier && ./classify.sh

# Classify only emo files
cd classifier && ./classify-remaining-emo.sh

# Sync files to app
./sync-output-to-public.sh

# Check what needs classification
cd classifier && python3 classify-emo-files.py
```

---

For detailed information, see [CLASSIFIERS_AND_DATA_SOURCES.md](CLASSIFIERS_AND_DATA_SOURCES.md)

