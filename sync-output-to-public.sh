#!/bin/bash
# Sync classified conversation output files to public directory for web app

set -e

echo "=== Syncing output files to public directory ==="
echo ""

# Create public/output directory if it doesn't exist
mkdir -p public/output

# Copy all JSON files from output/ to public/output/
if [ -d "output" ] && [ "$(ls -A output/*.json 2>/dev/null)" ]; then
    cp output/*.json public/output/
    count=$(ls -1 public/output/*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Synced $count conversation files to public/output/"
    
    # Show breakdown
    conv_count=$(ls -1 public/output/conv-*.json 2>/dev/null | wc -l | tr -d ' ')
    emo_count=$(ls -1 public/output/emo-*.json 2>/dev/null | wc -l | tr -d ' ')
    sample_count=$(ls -1 public/output/sample-*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "   - conv-*.json: $conv_count"
    echo "   - emo-*.json: $emo_count"
    echo "   - sample-*.json: $sample_count"
else
    echo "⚠️  No output files found in output/ directory"
    echo "   Run the classifier first: python3 classifier-openai.py ..."
fi

echo ""
echo "Files are now available at /output/*.json in the web app (served from public/output)"

