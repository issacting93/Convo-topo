#!/bin/bash
# Classification workflow script using OpenAI

set -e

echo "=== Conversation Classification Workflow ==="
echo "Using OpenAI classifier"
echo ""

# Check API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    echo ""
    echo "Set it with:"
    echo "  export OPENAI_API_KEY=your-key-here"
    echo "  # or create .env file: echo 'OPENAI_API_KEY=...' > .env && source .env"
    exit 1
fi

CLASSIFIER="classifier-openai.py"
echo "✅ OpenAI API key found"

# Load .env if it exists
if [ -f ".env" ]; then
    source .env
fi

# Determine input/output files from remaining args or use defaults
if [ $# -eq 0 ]; then
    # Default: classify remaining unclassified conversations
    echo "No input specified, checking for unclassified conversations..."
    
    INPUT_FILE="unclassified-conversations.json"
    OUTPUT_DIR="../output"
    
    # Prepare unclassified conversations
    python3 << 'PYTHON'
import json
import os
import sys

# Load raw conversations
raw_path = '../conversations-raw/all-conversations.json'
if not os.path.exists(raw_path):
    print(f"❌ {raw_path} not found")
    sys.exit(1)

with open(raw_path) as f:
    raw_conversations = json.load(f)

# Check which are already classified
classified_ids = set()
for i in range(1000):
    path = f'../output/conv-{i}.json'
    if os.path.exists(path):
        try:
            with open(path) as f:
                data = json.load(f)
                if data.get('classification'):
                    classified_ids.add(data.get('id', f'conv-{i}'))
        except:
            pass

# Find unclassified
unclassified = [c for c in raw_conversations if c.get('id') not in classified_ids]

if len(unclassified) == 0:
    print("✅ All conversations are already classified!")
    sys.exit(0)

print(f"Found {len(unclassified)} unclassified conversations")

# Prepare for classifier
prepared = []
for conv in unclassified:
    prepared.append({
        'id': conv.get('id', 'unknown'),
        'messages': [
            {'role': msg['role'], 'content': msg['content']}
            for msg in conv.get('messages', [])
        ]
    })

# Save to temporary file
with open('unclassified-conversations.json', 'w') as f:
    json.dump(prepared, f, indent=2)

print(f"✅ Prepared {len(prepared)} conversations")
PYTHON
    
    if [ ! -f "$INPUT_FILE" ]; then
        echo "❌ Failed to prepare conversations"
        exit 1
    fi
    
    # Use OpenAI classifier with --individual flag to save directly
    CLASSIFIER_ARGS=("$INPUT_FILE" "../output/temp-combined.json" "--individual" "--output-dir" "$OUTPUT_DIR")
else
    # Use provided arguments, but add --individual if not present
    CLASSIFIER_ARGS=("$@")
    if [[ ! " ${CLASSIFIER_ARGS[@]} " =~ " --individual " ]]; then
        # Add --individual and --output-dir if not specified
        if [[ ! " ${CLASSIFIER_ARGS[@]} " =~ " --output-dir " ]]; then
            CLASSIFIER_ARGS+=("--individual" "--output-dir" "../output")
        else
            CLASSIFIER_ARGS+=("--individual")
        fi
    fi
fi

# Run classifier
echo ""
echo "Starting classification..."
echo ""

python3 "$CLASSIFIER" "${CLASSIFIER_ARGS[@]}"

# Sync individual files to public/output/
echo ""
echo "Syncing files to public/output/ for the app..."
python3 << 'PYTHON'
import os
import shutil
from pathlib import Path

output_dir = Path("../output")
public_dir = Path("../public/output")

if not output_dir.exists():
    print("❌ Output directory not found")
    exit(1)

public_dir.mkdir(parents=True, exist_ok=True)

# Find all conv-*.json files
conv_files = sorted(output_dir.glob("conv-*.json"))
copied = 0

for src in conv_files:
    dst = public_dir / src.name
    shutil.copy2(src, dst)
    copied += 1

print(f"✅ Synced {copied} files to {public_dir}/")
PYTHON

# Clean up temp combined file if it exists
if [ -f "../output/temp-combined.json" ]; then
    rm "../output/temp-combined.json"
    echo "✅ Cleaned up temporary combined file"
fi

echo ""
echo "=== Classification Complete ==="
echo ""
echo "Next steps:"
echo "1. Check output/ directory for individual conv-*.json files"
echo "2. Files have been synced to public/output/ for the app"
echo "3. Refresh your browser to see new conversations"
echo ""

