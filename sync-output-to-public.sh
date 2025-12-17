#!/bin/bash
# Sync classified conversation output files to public directory for web app

set -e

echo "=== Syncing output files to public directory ==="
echo ""

# Create frontend/public/output directory if it doesn't exist
mkdir -p frontend/public/output

# Copy all JSON files from output/ to frontend/public/output/
if [ -d "output" ] && [ "$(ls -A output/*.json 2>/dev/null)" ]; then
    cp output/*.json frontend/public/output/
    count=$(ls -1 frontend/public/output/*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Synced $count conversation files to frontend/public/output/"
else
    echo "⚠️  No output files found in output/ directory"
    echo "   Run the classifier first: python3 classifier-openai.py ..."
fi

echo ""
echo "Files are now available at /output/conv-*.json in the web app (served from frontend/public/output)"

