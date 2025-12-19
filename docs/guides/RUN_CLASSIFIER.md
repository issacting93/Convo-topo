# Running the Classifier

**📖 For the complete workflow guide, see [`classifier/README.md`](classifier/README.md)**

## Quick Start

### 1. Set API Key

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or create a `.env` file:
```bash
echo "OPENAI_API_KEY=your-key-here" > .env
source .env
```

### 2. Classify Conversations

**Recommended: Use the workflow script**
```bash
cd classifier
./classify.sh
```

This will automatically:
- Find unclassified conversations
- Classify them using OpenAI
- Save individual files
- Sync to public/output/ for the app

## Manual Classification

If you need more control, you can run the classifier directly:

```bash
cd classifier
python3 classifier-openai.py input.json output.json --individual --output-dir ../output/
```

## Cost Estimates

**OpenAI (GPT-4):**
- ~$0.02-0.03 per conversation
- 10 conversations: ~$0.20-0.30

## Output Files

- `output/conv-*.json` - Individual classified conversations
- `public/output/conv-*.json` - Synced for app (served by Vite)
- `classified-output-summary.json` - Summary statistics (if generated)

For detailed documentation, see [`classifier/README.md`](classifier/README.md)

