#!/bin/bash
# Script to run classification with proper setup

set -e

echo "=== Conversation Classification Setup ==="
echo ""

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    echo ""
    echo "To set it:"
    echo "  export ANTHROPIC_API_KEY=your-key-here"
    echo ""
    echo "Or create a .env file:"
    echo "  echo 'ANTHROPIC_API_KEY=your-key-here' > .env"
    echo "  source .env"
    echo ""
    exit 1
fi

echo "✅ API key found"

# Prepare data if needed
if [ ! -f "conversations-for-classifier.json" ]; then
    echo "Preparing data format..."
    python3 << 'PYTHON'
import json
with open('src/data/personaChatMessages.json') as f:
    data = json.load(f)
if isinstance(data, dict) and 'conversations' in data:
    conversations = data['conversations']
    transformed = []
    for i, conv in enumerate(conversations):
        transformed.append({
            'id': conv.get('id', f'conv-{i}'),
            'messages': [
                {'role': msg['role'], 'content': msg['content']}
                for msg in conv.get('messages', [])
            ]
        })
    with open('conversations-for-classifier.json', 'w') as out:
        json.dump(transformed, out, indent=2)
    print(f'✅ Prepared {len(transformed)} conversations')
PYTHON
fi

# Run classifier
echo ""
echo "Starting classification..."
echo ""

python3 classifier-v1.1.py conversations-for-classifier.json classified-output.json "$@"

echo ""
echo "✅ Classification complete!"
echo "Output: classified-output.json"
echo "Summary: classified-output-summary.json"

