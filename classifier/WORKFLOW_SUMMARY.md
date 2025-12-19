# Classification Workflow Summary

## What Changed

The classification workflow has been cleaned up and unified into a single, consistent system.

## New Unified Workflow

### Main Entry Point: `classify.sh`

One script handles everything:
```bash
cd classifier
./classify.sh    # Classify remaining conversations using OpenAI
```

### Key Features

1. **Automatic Detection**: Finds unclassified conversations automatically
2. **OpenAI Integration**: Uses OpenAI GPT-4 for classification
3. **Individual Files**: Automatically saves individual files (no splitting needed)
4. **Auto-Sync**: Automatically syncs files to `public/output/` for the app
5. **Smart Indexing**: Automatically finds next available `conv-*` index

## File Structure

```
classifier/
├── classify.sh                    # ⭐ Main workflow script (use this!)
├── split-classified-output.py      # Utility: split combined → individual files
├── classifier-v1.1.py             # Anthropic classifier (Claude)
├── classifier-openai.py           # OpenAI classifier
└── README.md                      # Complete documentation

output/                            # Individual classified files
└── conv-*.json

public/output/                     # Synced for app
└── conv-*.json
```

## Migration Guide

### Old Way → New Way

**Before:**
```bash
# Multiple scripts, manual steps
cd classifier
./run-classification.sh
python3 split-manually.py
cp files to public/output/
```

**After:**
```bash
# One command does everything
cd classifier
./classify.sh anthropic
```

### Replacing Old Scripts

| Old Script | New Command |
|------------|-------------|
| `run-classification.sh` | `./classify.sh` |
| `run-openai-classifier.sh` | `./classify.sh` |
| `classify-remaining-conversations.sh` | `./classify.sh` |

## Common Tasks

### Classify Remaining Conversations
```bash
cd classifier
./classify.sh
```

### Classify Specific File
```bash
cd classifier
./classify.sh input.json output.json
```

### Split Existing Combined Output
```bash
cd classifier
python3 split-classified-output.py classified-output.json --sync-public
```

## Benefits

1. **Simpler**: One command instead of multiple steps
2. **Streamlined**: Single provider (OpenAI) eliminates choice complexity
3. **Automatic**: Handles file saving and syncing automatically
4. **Documented**: Complete README with examples
5. **Maintainable**: Centralized logic, easier to update

## Next Steps

1. Set API key: `export OPENAI_API_KEY=your-key-here`
2. Try the new workflow: `cd classifier && ./classify.sh`
3. Read full docs: `classifier/README.md`
4. Remove old scripts if desired (they're superseded but won't break anything)

