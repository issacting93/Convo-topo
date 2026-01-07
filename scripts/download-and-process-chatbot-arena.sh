#!/bin/bash
# Download and process Chatbot Arena conversations through the full pipeline

set -e

LIMIT=${1:-30}  # Default: download 30 new conversations
OUTPUT_DIR="conversations-raw"

echo "🚀 Downloading and processing Chatbot Arena conversations..."
echo "   Downloading: ${LIMIT} conversations"
echo ""

cd "$(dirname "$0")/.."

# Step 1: Download conversations
echo "📥 Step 1: Downloading from Chatbot Arena..."
echo "   Note: You may need to login with: huggingface-cli login"
echo "   Note: You may need to accept terms on HuggingFace website"
echo ""

python3 data/download-chatbot-arena.py --limit "$LIMIT" --output "$OUTPUT_DIR" --min-messages 10

# Check if any conversations were downloaded
DOWNLOADED=$(find "$OUTPUT_DIR" -name "chatbot_arena_*.json" -type f | wc -l | tr -d ' ')
if [ "$DOWNLOADED" -eq 0 ]; then
    echo ""
    echo "❌ No conversations downloaded. Check errors above."
    exit 1
fi

echo ""
echo "✅ Downloaded $DOWNLOADED conversations"

# Step 2: Copy to output directory
echo ""
echo "📋 Step 2: Copying to output directory..."

# Find newly downloaded files (not already in output)
NEW_FILES=0
for file in "$OUTPUT_DIR"/chatbot_arena_*.json; do
    if [ -f "$file" ]; then
        basename=$(basename "$file")
        if [ ! -f "output/$basename" ]; then
            cp "$file" "output/"
            NEW_FILES=$((NEW_FILES + 1))
        fi
    fi
done

echo "  Copied $NEW_FILES new conversations to output/"

if [ "$NEW_FILES" -eq 0 ]; then
    echo "  ⚠️  No new files to process (all already exist in output/)"
    exit 0
fi

# Step 3: Copy to public/output for processing
echo ""
echo "📋 Step 3: Copying to public/output for processing..."
cp output/chatbot_arena_*.json public/output/ 2>/dev/null || true
echo "  ✓ Copied to public/output/"

# Step 4: Classify conversations
echo ""
echo "🔍 Step 4: Classifying conversations..."
echo "   This will use OpenAI GPT-4 API (make sure OPENAI_API_KEY is set)"
echo ""

# Check for API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set"
    echo "   Set it with: export OPENAI_API_KEY=your-key-here"
    echo ""
    echo "   Skipping classification. Run manually:"
    echo "   python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify"
    CLASSIFY_SKIP=true
else
    echo "✅ OPENAI_API_KEY found"
    python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify || {
        echo "⚠️  Classification failed. You can run manually:"
        echo "   python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena --classify"
        CLASSIFY_SKIP=true
    }
fi

# Step 5: Generate PAD values
echo ""
echo "📊 Step 5: Generating PAD values..."
echo "   This will use OpenAI GPT-4o-mini API for PAD calculation"
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Skipping PAD generation."
    echo "   Run manually: python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena"
    PAD_SKIP=true
else
    python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena || {
        echo "⚠️  PAD generation failed. You can run manually:"
        echo "   python3 scripts/generate-pad-with-llm-direct.py --chatbot-arena"
        PAD_SKIP=true
    }
fi

# Step 6: Update manifest
echo ""
echo "📝 Step 6: Updating manifest..."
node scripts/generate-manifest.js

# Step 7: Copy processed files back to output
echo ""
echo "📋 Step 7: Syncing processed files back to output..."
cp public/output/chatbot_arena_*.json output/ 2>/dev/null || true

# Summary
echo ""
echo "✅ Processing complete!"
echo ""
echo "Summary:"
echo "  • Downloaded: $NEW_FILES new conversations"
echo "  • Classification: $([ "$CLASSIFY_SKIP" = true ] && echo "Skipped" || echo "Completed")"
echo "  • PAD Generation: $([ "$PAD_SKIP" = true ] && echo "Skipped" || echo "Completed")"
echo "  • Manifest: Updated"
echo ""
echo "Files are now available in:"
echo "  • output/chatbot_arena_*.json"
echo "  • public/output/chatbot_arena_*.json"
echo ""
echo "🌐 Refresh your browser to see new conversations in the app!"

