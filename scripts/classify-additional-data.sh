#!/bin/bash
# Classify additional conversations: Chatbot Arena + Human-Human dialogues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting classification of additional data..."
echo ""

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    exit 1
fi

# 1. Classify Human-Human Dialogues (Cornell + Kaggle)
echo "📝 Step 1: Classifying Human-Human Dialogues (Cornell + Kaggle)"
echo ""

CORNELL_FILES=$(find conversations-raw -name "cornell-*.json" | head -10)
KAGGLE_FILES=$(find conversations-raw -name "kaggle-emo-*.json" | head -10)

HUMAN_HUMAN_COUNT=0

# Classify Cornell Movie Dialogues
for file in $CORNELL_FILES; do
    if [ -f "$file" ]; then
        echo "  Classifying $file..."
        python3 classifier/classifier-openai-human-human.py \
            "$file" \
            "output/$(basename "$file")" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        HUMAN_HUMAN_COUNT=$((HUMAN_HUMAN_COUNT + 1))
        sleep 1  # Rate limiting
    fi
done

# Classify Kaggle Empathetic Dialogues
for file in $KAGGLE_FILES; do
    if [ -f "$file" ]; then
        echo "  Classifying $file..."
        python3 classifier/classifier-openai-human-human.py \
            "$file" \
            "output/$(basename "$file")" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        HUMAN_HUMAN_COUNT=$((HUMAN_HUMAN_COUNT + 1))
        sleep 1  # Rate limiting
    fi
done

echo "✅ Classified $HUMAN_HUMAN_COUNT human-human conversations"
echo ""

# 2. Classify Additional Chatbot Arena Conversations (200-500)
echo "📝 Step 2: Classifying Additional Chatbot Arena Conversations"
echo ""

# Find unclassified Chatbot Arena conversations
UNCLASSIFIED_ARENA=$(python3 -c "
import json
import os
from pathlib import Path

# Get all classified IDs
output_dir = Path('public/output')
classified_ids = set()
if output_dir.exists():
    for f in output_dir.glob('*.json'):
        try:
            with open(f, 'r') as file:
                data = json.load(file)
                if 'id' in data:
                    classified_ids.add(data['id'])
        except:
            pass

# Get unclassified Chatbot Arena files
raw_dir = Path('conversations-raw')
unclassified = []
for f in raw_dir.glob('chatbot_arena_*.json'):
    try:
        with open(f, 'r') as file:
            data = json.load(file)
            if 'id' in data and data['id'] not in classified_ids:
                unclassified.append(str(f))
    except:
        pass

# Limit to 500
for f in unclassified[:500]:
    print(f)
" 2>/dev/null)

ARENA_COUNT=0
LIMIT=500
CURRENT=0

for file in $UNCLASSIFIED_ARENA; do
    if [ -f "$file" ] && [ $CURRENT -lt $LIMIT ]; then
        echo "  Classifying $file... ($CURRENT/$LIMIT)"
        python3 classifier/classifier-openai-social-role-theory.py \
            "$file" \
            "output/$(basename "$file")" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        ARENA_COUNT=$((ARENA_COUNT + 1))
        CURRENT=$((CURRENT + 1))
        sleep 0.5  # Rate limiting
    fi
done

echo "✅ Classified $ARENA_COUNT additional Chatbot Arena conversations"
echo ""

# Summary
echo "📊 Classification Summary:"
echo "  - Human-Human Dialogues: $HUMAN_HUMAN_COUNT"
echo "  - Chatbot Arena: $ARENA_COUNT"
echo "  - Total: $((HUMAN_HUMAN_COUNT + ARENA_COUNT))"
echo ""
echo "✅ Classification complete!"

