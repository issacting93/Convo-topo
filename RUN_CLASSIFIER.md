# Running the Classifier

## Setup Required

### 1. API Key
You need an Anthropic API key to run the classifier. Get one from: https://console.anthropic.com/

### 2. Set Environment Variable

**Option A: Export in terminal (temporary)**
```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

**Option B: Add to shell profile (permanent)**
```bash
echo 'export ANTHROPIC_API_KEY=your-api-key-here' >> ~/.zshrc
source ~/.zshrc
```

**Option C: Use .env file (recommended for projects)**
```bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
# Then source it before running
source .env
```

### 3. Install Dependencies (if not already done)
```bash
pip3 install anthropic
```

## Running Classification

### Basic Classification
```bash
python3 classifier-v1.1.py src/data/personaChatMessages.json classified-output.json
```

### With Windowed Analysis (for role drift)
```bash
python3 classifier-v1.1.py src/data/personaChatMessages.json classified-output.json --windowed
```

### With Validation Export
```bash
python3 classifier-v1.1.py src/data/personaChatMessages.json classified-output.json --windowed --validation 30
```

## Cost Estimate

For 145 conversations:
- Without windowing: ~145 API calls ≈ $1-2
- With windowing (avg 4 windows each): ~580 API calls ≈ $5-8

## Output Files

- `classified-output.json` - Full classification results
- `classified-output-summary.json` - Summary statistics
- `classified-output-validation.json` - Validation samples (if --validation used)

