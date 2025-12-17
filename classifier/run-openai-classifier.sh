#!/bin/bash
# Wrapper script to run OpenAI classifier

set -e

echo "=== OpenAI Classifier ==="
echo ""

# The classifier now automatically loads from .env, but we can also source it
# to ensure it's available for any subprocesses
if [ -f ".env" ]; then
    source .env
    echo "✅ Loaded API key from .env"
else
    echo "⚠️  No .env file found"
    echo "   Make sure OPENAI_API_KEY is set in your environment"
fi

echo ""

# Run the classifier with all passed arguments
python3 classifier-openai.py "$@"

