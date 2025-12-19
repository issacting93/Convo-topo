# Data Processing Scripts

Scripts for downloading, processing, and extracting conversation data.

## Available Scripts

### Download Scripts

#### `download-kaggle-empathetic.py` ⭐ **NEW**
Download empathetic dialogues from Kaggle using kagglehub.

**Install dependencies:**
```bash
pip install kagglehub[pandas-datasets]
```

**Usage:**
```bash
# Download first 100 conversations
python3 download-kaggle-empathetic.py --limit 100

# Download all conversations
python3 download-kaggle-empathetic.py

# Custom output directory
python3 download-kaggle-empathetic.py --output-dir my-conversations
```

**Features:**
- Downloads from Kaggle dataset: `atharvjairath/empathetic-dialogues-facebook-ai`
- Automatically groups messages by conversation
- Saves individual JSON files
- Updates `all-conversations.json`

#### `download-conversation-datasets.py`
Download conversations from multiple sources (HuggingFace, etc.).

**Usage:**
```bash
python3 download-conversation-datasets.py --source kaggle --limit 100
python3 download-conversation-datasets.py --source all --limit 50
```

**Sources:**
- `sharegpt` - ShareGPT dataset
- `openassistant` - OpenAssistant dataset
- `cornell` - Cornell Movie-Dialogs Corpus
- `kaggle` - Kaggle empathetic dialogues (uses download-kaggle-empathetic.py)

### Extraction Scripts

#### `extract_emo_conversations.py`
Extract conversations from `emo.md` file (local empathetic dialogues).

#### `extract_empathetic_dialogues.py`
Extract from CSV file (alternative method).

#### `generate-sample-conversations.py`
Generate sample conversations for testing.

## Workflow

1. **Download conversations:**
   ```bash
   python3 download-kaggle-empathetic.py --limit 100
   ```

2. **Review downloaded conversations:**
   ```bash
   ls conversations-raw/
   ```

3. **Classify them:**
   ```bash
   cd ../classifier
   ./classify.sh
   ```

4. **Use in app:**
   - Classified conversations appear automatically in the app
   - Refresh browser to see new conversations

## Output Format

All scripts save conversations in this format:

```json
{
  "id": "kaggle-emo-0",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "emotion": "afraid",  // Optional
  "situation": "..."    // Optional
}
```

## Notes

- Downloaded conversations are saved to `conversations-raw/`
- Individual files: `conversations-raw/kaggle-emo-*.json`
- Combined file: `conversations-raw/all-conversations.json`
- The classifier automatically finds unclassified conversations

