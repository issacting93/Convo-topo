# OpenAI Setup Guide

This guide will help you set up OpenAI for the conversation classifier.

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:
```bash
./setup-openai.sh
```

This will:
- Check if the OpenAI package is installed
- Create a `.env` file for your API key
- Set up environment variables

### Option 2: Manual Setup

1. **Install the OpenAI package:**
   ```bash
   pip3 install openai
   ```
   Or install from requirements:
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Sign in or create an account
   - Create a new API key
   - Copy the key (it starts with `sk-`)

3. **Set the API key:**

   **Option A: Using .env file (Recommended)**
   ```bash
   echo "OPENAI_API_KEY=sk-your-key-here" > .env
   source .env
   ```

   **Option B: Export in terminal (Temporary)**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   ```

   **Option C: Add to shell profile (Permanent)**
   ```bash
   echo 'export OPENAI_API_KEY=sk-your-key-here' >> ~/.zshrc
   source ~/.zshrc
   ```

## Verify Setup

Test that everything is working:
```bash
python3 -c "from openai import OpenAI; import os; print('✅ OpenAI setup complete!' if os.getenv('OPENAI_API_KEY') else '❌ OPENAI_API_KEY not set')"
```

## Usage

Once set up, you can run the classifier:

```bash
# Basic classification
python3 classifier-openai.py conversations-for-classifier.json classified-output.json

# With windowed analysis
python3 classifier-openai.py conversations-for-classifier.json classified-output.json --windowed

# With custom model
python3 classifier-openai.py conversations-for-classifier.json classified-output.json --model gpt-4-turbo-preview
```

## Available Models

- `gpt-4` (default) - Most capable, slower, more expensive
- `gpt-4-turbo-preview` - Faster, better JSON compliance
- `gpt-3.5-turbo` - Cheaper, faster, less capable

## Cost Estimate

For 145 conversations:
- Without windowing: ~145 API calls ≈ $2-4
- With windowing (avg 4 windows each): ~580 API calls ≈ $8-16

## Troubleshooting

### "OPENAI_API_KEY not set"
- Make sure you've exported the environment variable
- Check that your `.env` file exists and contains `OPENAI_API_KEY=sk-...`
- Try running `source .env` before the classifier

### "openai package not installed"
- Run: `pip3 install openai`
- Or: `pip3 install -r requirements.txt`

### API Errors
- Check your API key is valid at https://platform.openai.com/api-keys
- Ensure you have credits/billing set up on your OpenAI account
- Check rate limits if you're processing many conversations

## Security Notes

- **Never commit your `.env` file to git** (it's in `.gitignore`)
- Keep your API key secret
- Rotate keys if they're exposed
- Use environment variables, not hardcoded keys

