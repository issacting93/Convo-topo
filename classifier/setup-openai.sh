#!/bin/bash
# Setup script for OpenAI classifier

set -e

echo "=== OpenAI Classifier Setup ==="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo ""
    echo "Please enter your OpenAI API key:"
    echo "(Get it from: https://platform.openai.com/api-keys)"
    echo ""
    read -p "API Key: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ API key cannot be empty"
        exit 1
    fi
    
    echo "OPENAI_API_KEY=$api_key" > .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Check if openai package is installed
if python3 -c "import openai" 2>/dev/null; then
    echo "✅ OpenAI package is installed"
else
    echo "📦 Installing OpenAI package..."
    pip3 install openai
    echo "✅ OpenAI package installed"
fi

# Source the .env file
if [ -f ".env" ]; then
    source .env
    export OPENAI_API_KEY
    echo "✅ Environment variables loaded"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To use the classifier:"
echo "  1. Make sure your .env file has OPENAI_API_KEY set"
echo "  2. Run: source .env (or export OPENAI_API_KEY=your-key)"
echo "  3. Run: python3 classifier-openai.py conversations.json output.json"
echo ""

