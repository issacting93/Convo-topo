# Conversations Raw Data

This directory contains **raw conversation data** from various sources before classification.

## Contents

### Cornell Movie Dialogues
- **Files:** `cornell-0.json` through `cornell-9.json` (10 files)
- **Source:** Cornell Movie-Dialogs Corpus
- **Format:** Individual conversation JSON files
- **Status:** ✅ Available for classification

### Kaggle Empathetic Dialogues
- **Files:** `kaggle-emo-0.json` through `kaggle-emo-9.json` (10 files)
- **Source:** Kaggle Empathetic Dialogues dataset
- **Format:** Individual conversation JSON files
- **Status:** ✅ Available for classification

### Combined File
- **File:** `all-conversations.json`
- **Purpose:** Combined list of all conversations from individual files
- **Used by:** `classify.sh` to find unclassified conversations
- **Status:** ✅ Active - Used by classification workflow

## Workflow

```
conversations-raw/
  ├── Individual files (cornell-*.json, kaggle-emo-*.json)
  └── all-conversations.json (combined)
         ↓
    [classifier/classify.sh checks for unclassified]
         ↓
    [Classifies missing conversations]
         ↓
    output/
      └── conv-*.json (classified)
```

## Usage

### Check What's Unclassified

The `classify.sh` script automatically:
1. Loads `all-conversations.json`
2. Checks which conversations are already in `output/`
3. Creates `unclassified-conversations.json` with missing ones
4. Classifies them

### Add New Conversations

1. Add individual files to this directory (e.g., `cornell-10.json`)
2. Update `all-conversations.json` to include new conversations
3. Run `classifier/classify.sh` to classify them

## File Structure

Each conversation file should have this structure:

```json
{
  "id": "cornell-0",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

## Notes

- ✅ These are **source files** - keep them
- ✅ Individual files can be classified separately if needed
- ✅ `all-conversations.json` is the master list for the classifier

