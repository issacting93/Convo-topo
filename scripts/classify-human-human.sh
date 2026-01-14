#!/bin/bash
# Classify Human-Human Dialogues (Cornell + Kaggle)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Classifying Human-Human Dialogues..."
echo ""

# Load .env file if it exists (handles export KEY=VALUE format)
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Loaded .env file"
elif [ -f "../.env" ]; then
    set -a
    source ../.env
    set +a
    echo "✅ Loaded .env file from parent directory"
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    echo "   Please set it in .env file: OPENAI_API_KEY=your_key"
    echo "   Or export it: export OPENAI_API_KEY=your_key"
    exit 1
fi

echo "✅ API key found (starts with: ${OPENAI_API_KEY:0:7}...)"
echo ""

# Classify Cornell Movie Dialogues (10 files)
echo "📝 Classifying Cornell Movie Dialogues..."
CORNELL_COUNT=0
for i in {0..9}; do
    file="conversations-raw/cornell-${i}.json"
    if [ -f "$file" ]; then
        echo "  Classifying cornell-${i}.json... ($(($CORNELL_COUNT + 1))/10)"
        python3 classifier/classifier-openai-human-human.py \
            "$file" \
            "output/cornell-${i}.json" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        CORNELL_COUNT=$((CORNELL_COUNT + 1))
        sleep 1  # Rate limiting
    fi
done

echo "✅ Classified $CORNELL_COUNT Cornell conversations"
echo ""

# Classify Kaggle Empathetic Dialogues (10 files)
echo "📝 Classifying Kaggle Empathetic Dialogues..."
KAGGLE_COUNT=0
for i in {0..9}; do
    file="conversations-raw/kaggle-emo-${i}.json"
    if [ -f "$file" ]; then
        echo "  Classifying kaggle-emo-${i}.json... ($(($KAGGLE_COUNT + 1))/10)"
        python3 classifier/classifier-openai-human-human.py \
            "$file" \
            "output/kaggle-emo-${i}.json" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output || echo "  ⚠️  Failed: $file"
        KAGGLE_COUNT=$((KAGGLE_COUNT + 1))
        sleep 1  # Rate limiting
    fi
done

echo "✅ Classified $KAGGLE_COUNT Kaggle conversations"
echo ""

# Summary
echo "📊 Classification Summary:"
echo "  - Cornell Movie Dialogues: $CORNELL_COUNT"
echo "  - Kaggle Empathetic Dialogues: $KAGGLE_COUNT"
echo "  - Total: $((CORNELL_COUNT + KAGGLE_COUNT))"
echo ""
echo "✅ Human-human classification complete!"

