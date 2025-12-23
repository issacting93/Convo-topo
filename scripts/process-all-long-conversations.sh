#!/bin/bash
# Process all long conversations (classify + PAD generation)

set -e

echo "🔍 Processing all long conversations..."
echo ""

cd "$(dirname "$0")/.."

# Find all long conversation files
LONG_FILES=($(find public/output -name "combined-long-*.json" -o -name "oasst-*.json" | sort))

if [ ${#LONG_FILES[@]} -eq 0 ]; then
    echo "❌ No long conversations found"
    exit 1
fi

echo "📋 Found ${#LONG_FILES[@]} long conversations to process"
echo ""

# Process each file
for file in "${LONG_FILES[@]}"; do
    filename=$(basename "$file")
    echo "🔄 Processing $filename..."
    
    # Classify and generate PAD
    python3 scripts/generate-pad-with-llm-direct.py --file "$filename" --classify --force
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Completed $filename"
    else
        echo "  ❌ Error processing $filename"
    fi
    echo ""
done

echo "✅ Finished processing all long conversations"
echo ""
echo "📋 Next step: Update manifest"
echo "   node scripts/generate-manifest.js"

