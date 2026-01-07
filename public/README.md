# Public Output Directory

This directory contains classified conversations served to the web application.

## Directory Structure

### `output/` (Active)
- **Purpose**: Main directory for classified conversations
- **Status**: ✅ Active - served by the application
- **Contents**: ~448 JSON files (3.2M)
- **Usage**: Loaded by `src/data/classifiedConversations.ts`

### `output/_archive/` (Archive)
- **Purpose**: Archived error files
- **Status**: 📦 Archive - not served
- **Contents**: Error files from classification attempts

### `output-backup/` (Backup)
- **Purpose**: Backup of previous output files
- **Status**: 📦 Backup - old files, may be removed if no longer needed
- **Contents**: ~100 JSON files (1.3M)
- **Note**: Many files are duplicates of current `output/` directory

### `output-quarantine/` (Quarantine)
- **Purpose**: Problematic conversations that failed classification
- **Status**: 🔒 Quarantine - kept for reference
- **Contents**: 26 JSON files (304K)
- **Note**: Includes error files and conversations that couldn't be classified

## File Naming Conventions

- `conv-*.json` - General conversations
- `emo-*.json` - Empathetic dialogues
- `chatbot_arena_*.json` - Chatbot Arena dataset
- `oasst-*.json` - OpenAssistant dataset
- `cornell-*.json` - Cornell Movie Dialogues
- `sample-*.json` - Sample/test conversations
- `*-error.json` - Files with classification errors

## Maintenance

### To Clean Up:
1. **Remove .DS_Store files** (macOS system files)
2. **Review output-backup/** - Remove if no longer needed
3. **Review output-quarantine/** - Keep for reference, but can be archived

### To Add Files:
- Classified conversations should be placed in `output/`
- Use `classifier/classify.sh` which automatically syncs to `output/`
- Files are automatically synced from `../output/` to `public/output/`

## Data Flow

```
classifier/classify.sh
    ↓
../output/*.json
    ↓
public/output/*.json (synced)
    ↓
src/data/classifiedConversations.ts (loads)
    ↓
React App (displays)
```

