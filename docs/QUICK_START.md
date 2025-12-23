# Quick Start: Running Classification

## ✅ I can help you run the classifier!

Here's what's ready and what you need:

### ✅ Already Set Up
- ✅ Classifier script (`classifier-v1.1.py`) ready
- ✅ Python dependencies installed
- ✅ Data file prepared (145 conversations)
- ✅ Helper script created (`run-classification.sh`)

### 🔑 What You Need

**Anthropic API Key** - Get one from: https://console.anthropic.com/

Once you have it, set it up:

```bash
# Option 1: Export for this session
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Option 2: Add to .env file (recommended)
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
source .env
```

## 🚀 Running the Classifier

### Simple Way (using helper script):
```bash
./run-classification.sh
```

### Direct way:
```bash
python3 classifier-v1.1.py conversations-for-classifier.json classified-output.json
```

### With windowed analysis (role drift):
```bash
./run-classification.sh --windowed
```

### With validation samples:
```bash
./run-classification.sh --windowed --validation 30
```

## 📊 What Happens

1. Script loads 145 conversations
2. Sends each to Claude API for classification
3. Gets back 10-dimension analysis with:
   - 8 categorical dimensions (single category each)
   - 2 role dimensions (probability distributions)
   - Confidence scores, evidence quotes, rationale

## 💰 Cost Estimate

- 145 conversations ≈ **$1-2** (without windowing)
- With windowing ≈ **$5-8** (4-5 API calls per conversation)

## 📁 Output Files

After running, you'll get:
- `classified-output.json` - Full results with all classifications
- `classified-output-summary.json` - Summary statistics
- `classified-output-validation.json` - Validation samples (if used --validation)

## 🎯 Next Steps After Classification

Once you have classified data:

1. **Generate PAD Values** (required for Z-axis visualization):
   ```bash
   node scripts/add-pad-to-data.js
   ```

2. **Review the summary** to see distribution of classifications

3. **Integrate with visualization** - Classified conversations with PAD values will automatically appear in the terrain grid

4. **Visualization**:
   - X-axis: Communication Function (functional ↔ social)
   - Y-axis: Conversation Structure (structured ↔ emergent)
   - Z-axis: Affective/Evaluative Lens - PAD (emotional intensity)

See `docs/CONVERSATION_TERRAIN_INTEGRATION.md` for details on how classifications map to visualization.

---

**Ready to run?** Just set your API key and run `./run-classification.sh`!

