#!/bin/bash
# Classify any missing human-human conversations

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Find missing files
for i in {0..9}; do
    if [ ! -f "public/output/cornell-${i}.json" ] && [ -f "conversations-raw/cornell-${i}.json" ]; then
        echo "Classifying missing: cornell-${i}.json"
        python3 classifier/classifier-openai-human-human.py \
            "conversations-raw/cornell-${i}.json" \
            "output/cornell-${i}.json" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output
        sleep 1
    fi
    
    if [ ! -f "public/output/kaggle-emo-${i}.json" ] && [ -f "conversations-raw/kaggle-emo-${i}.json" ]; then
        echo "Classifying missing: kaggle-emo-${i}.json"
        python3 classifier/classifier-openai-human-human.py \
            "conversations-raw/kaggle-emo-${i}.json" \
            "output/kaggle-emo-${i}.json" \
            --model gpt-5.2 \
            --individual \
            --output-dir public/output
        sleep 1
    fi
done

echo ""
echo "✅ Done!"
./scripts/check-classification-progress.sh
