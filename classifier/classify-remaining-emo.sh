#!/bin/bash
# Script to classify remaining unclassified emo files

set -e

echo "=== Classifying Remaining Emo Files ==="
echo ""

# Check API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    echo "Set it with: export OPENAI_API_KEY=your-key-here"
    exit 1
fi

# Prepare unclassified emo files
echo "Preparing unclassified emo files..."
python3 classify-emo-files.py

if [ ! -f "unclassified-emo-conversations.json" ]; then
    echo "❌ Failed to prepare conversations or all files already classified"
    exit 1
fi

# Run classifier
echo ""
echo "Classifying with OpenAI (this will cost ~$0.46-$0.69 for 23 conversations)..."
echo ""

python3 classifier-openai.py \
    unclassified-emo-conversations.json \
    ../output/temp-emo-combined.json \
    --individual \
    --output-dir ../output

# Sync to public/output
echo ""
echo "Syncing emo files to public/output/..."
python3 << 'PYTHON'
import shutil
from pathlib import Path

output_dir = Path("../output")
public_dir = Path("../public/output")

public_dir.mkdir(parents=True, exist_ok=True)

# Find all emo-*.json files
emo_files = sorted(output_dir.glob("emo-*.json"))
copied = 0

for src in emo_files:
    dst = public_dir / src.name
    shutil.copy2(src, dst)
    copied += 1

print(f"✅ Synced {copied} emo files to {public_dir}/")
PYTHON

# Clean up
if [ -f "../output/temp-emo-combined.json" ]; then
    rm "../output/temp-emo-combined.json"
fi

echo ""
echo "✅ Classification complete!"
echo "All emo files have been classified and synced to public/output/"

