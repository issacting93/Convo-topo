# Classification Workflow

Workflow for classifying conversations using OpenAI.

## Quick Start

### 1. Set API Key

```bash
export OPENAI_API_KEY=your-key-here
```

Or create a `.env` file:
```bash
echo "OPENAI_API_KEY=your-key-here" > .env
source .env
```

### 2. Classify Conversations

**Classify remaining unclassified conversations (recommended):**
```bash
cd classifier
./classify.sh
```

**Classify a specific file:**
```bash
cd classifier
./classify.sh input.json output.json
```

## Workflow Overview

```
Raw Conversations (conversations-raw/*.json)
    ↓
Prepare Format (automatic)
    ↓
Classify (classifier-openai.py with --individual)
    ↓
Save Individual Files (automatic)
    ↓
Sync to public/output/ (automatic)
    ↓
App Loads (src/data/classifiedConversations.ts)
```

## Scripts

### `classify.sh` - Main Workflow Script

Main entry point for classification. Handles:
- API key validation
- Preparing unclassified conversations
- Running OpenAI classifier
- Saving individual files automatically
- Syncing to public/output/

**Usage:**
```bash
./classify.sh [classifier-options...]

# Examples:
./classify.sh                                    # Classify remaining unclassified
./classify.sh input.json output.json             # Classify specific file
./classify.sh input.json output.json --limit 10  # Limit to first 10 conversations
```

### `split-classified-output.py` - Split Combined Output

Splits a combined JSON file into individual `conv-*.json` files.

**Usage:**
```bash
python3 split-classified-output.py classified-output.json [options]

Options:
  --start-index N      Start numbering from N (default: auto-detect)
  --output-dir DIR     Output directory (default: output/)
  --sync-public        Copy files to public/output/
```

**Example:**
```bash
python3 split-classified-output.py classified-output.json --sync-public
```

### `classifier-openai.py` - OpenAI Classifier

Classifies conversations using GPT-4.

**Usage:**
```bash
python3 classifier-openai.py input.json output.json [options]

Options:
  --individual            Save individual files (recommended)
  --output-dir DIR        Directory for individual files
  --limit N               Process only first N conversations
  --windowed              Enable windowed analysis
  --model MODEL           Model name (default: gpt-4)
```

**Example:**
```bash
python3 classifier-openai.py conversations.json output.json --individual --output-dir output/
```

## Common Workflows

### Classify All Remaining Conversations

```bash
cd classifier
./classify.sh
```

This will:
1. Find unclassified conversations in `conversations-raw/`
2. Prepare them for classification
3. Classify using OpenAI
4. Save individual `conv-*.json` files automatically
5. Sync to `public/output/`

### Classify a Specific Dataset

```bash
cd classifier
./classify.sh my-conversations.json my-output.json
```

The script automatically uses `--individual` flag, so files are saved directly.

### Classify with Options

```bash
cd classifier
./classify.sh conversations.json output.json --limit 10 --windowed
```

## File Structure

```
classifier/
├── classify.sh                    # Main workflow script
├── split-classified-output.py     # Utility to split combined output
├── classifier-v1.1.py            # Anthropic classifier
├── classifier-openai.py          # OpenAI classifier
├── classifier-v1.1.ts            # TypeScript version (alternative)
└── README.md                      # This file

output/                            # Classified conversations (individual files)
├── conv-0.json
├── conv-1.json
└── ...

public/output/                     # Synced for app (served by Vite)
├── conv-0.json
├── conv-1.json
└── ...
```

## Cost Estimates

**OpenAI (GPT-4):**
- ~$0.02-0.03 per conversation
- 10 conversations: ~$0.20-0.30
- 100 conversations: ~$2-3

## Troubleshooting

### "API key not set"
Make sure you've exported the API key:
```bash
export OPENAI_API_KEY=your-key-here
```

### "No unclassified conversations found"
All conversations in `conversations-raw/` are already classified. Check `output/` directory.

### Files not showing in app
1. Make sure files are in `public/output/`
2. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check browser console for errors

### Want to re-classify?
Remove the files from `output/` and `public/output/`, then run the classifier again.

## Legacy Scripts

The following scripts have been archived (see `archive/` directory):
- `run-classification.sh` - Archived, use `./classify.sh` instead
- `run-openai-classifier.sh` - Archived, use `./classify.sh` instead
- `classify-remaining-conversations.sh` - Archived, use `./classify.sh` instead

