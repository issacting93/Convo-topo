#!/bin/bash
# Retry failed Chatbot Arena classifications with the correct arguments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

LIMIT=${1:-200}  # Default to 200, can override

echo "🔄 Retrying Chatbot Arena Classifications (with fix)..."
echo ""

# Load .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Loaded .env file"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    exit 1
fi

echo "✅ API key found"
echo ""

# Find unclassified Chatbot Arena conversations
echo "📋 Finding unclassified Chatbot Arena conversations..."
UNCLASSIFIED_ARENA=$(python3 << 'EOF'
import json
from pathlib import Path

# Get all classified IDs
output_dir = Path('public/output')
classified_ids = set()
if output_dir.exists():
    for f in output_dir.glob('chatbot_arena_*.json'):
        try:
            with open(f, 'r') as file:
                data = json.load(file)
                if 'id' in data and 'classification' in data:
                    classified_ids.add(data['id'])
        except:
            pass

# Get unclassified Chatbot Arena files
raw_dir = Path('conversations-raw')
unclassified = []
for f in sorted(raw_dir.glob('chatbot_arena_*.json')):
    try:
        with open(f, 'r') as file:
            data = json.load(file)
            if 'id' in data and data['id'] not in classified_ids:
                unclassified.append(str(f))
    except:
        pass

# Print file paths
for f in unclassified:
    print(f)
EOF
)

if [ -z "$UNCLASSIFIED_ARENA" ]; then
    echo "✅ All Chatbot Arena conversations are already classified!"
    exit 0
fi

TOTAL=$(echo "$UNCLASSIFIED_ARENA" | wc -l | tr -d ' ')
echo "Found $TOTAL unclassified Chatbot Arena conversations"
echo "Will classify up to $LIMIT"
echo ""

ARENA_COUNT=0
CURRENT=0

for file in $UNCLASSIFIED_ARENA; do
    if [ -f "$file" ] && [ $CURRENT -lt $LIMIT ]; then
        filename=$(basename "$file")
        echo "  Classifying $filename... ($(($CURRENT + 1))/$LIMIT)"
        
        python3 classifier/classifier-openai-social-role-theory.py \
            "$file" \
            "output/$filename" \
            --few-shot-examples classifier/few-shot-examples-social-role-theory.json \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        
        ARENA_COUNT=$((ARENA_COUNT + 1))
        CURRENT=$((CURRENT + 1))
        sleep 0.5  # Rate limiting
        
        # Progress update every 50
        if [ $((CURRENT % 50)) -eq 0 ]; then
            echo "  📊 Progress: $CURRENT/$LIMIT classified"
        fi
    fi
done

echo ""
echo "✅ Classified $ARENA_COUNT additional Chatbot Arena conversations"
echo "📊 Total new classifications: $ARENA_COUNT"

