#!/bin/bash
# Download long, high-quality conversations (30+ messages) from multiple sources
# This script focuses on getting the best conversations for PAD visualization

set -e

MIN_MESSAGES=30  # Minimum messages for a "long" conversation
TARGET_COUNT=20  # Target number of long conversations
TEMP_DIR="conversations-raw-temp"
OUTPUT_DIR="public/output"
DOWNLOAD_LIMIT=1000  # Download more to find longer ones

echo "🚀 Downloading long, high-quality conversations (${MIN_MESSAGES}+ messages)..."
echo "   Target: ${TARGET_COUNT} conversations"
echo "   Downloading up to ${DOWNLOAD_LIMIT} conversations per source to find long ones"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"
cd "$(dirname "$0")/.."

# Step 1: Download from ShareGPT (best for real human-AI conversations)
echo "📥 Step 1: Downloading from ShareGPT (real human-AI conversations)..."
echo "   This may take a few minutes - downloading ${DOWNLOAD_LIMIT} conversations..."
python3 data/download-conversation-datasets.py --source sharegpt --limit "$DOWNLOAD_LIMIT" --output "$TEMP_DIR" 2>&1 | tee /tmp/sharegpt-download.log | grep -E "(Downloading|Found|saved|Processed|Downloaded)" || true

# Step 2: Download from OpenAssistant (high-quality, annotated)
echo ""
echo "📥 Step 2: Downloading from OpenAssistant (high-quality, annotated)..."
echo "   Using improved downloader that properly builds conversation trees"
echo "   Filtering for conversations with ${MIN_MESSAGES}+ messages..."
if [ -f "data/download-openassistant-fixed.py" ]; then
    python3 data/download-openassistant-fixed.py --limit 50 --min-messages "$MIN_MESSAGES" --output "$TEMP_DIR" 2>&1 | tee /tmp/oasst-download.log
else
    echo "   ⚠️  Improved downloader not found, using standard downloader..."
    python3 data/download-conversation-datasets.py --source openassistant --limit "$DOWNLOAD_LIMIT" --output "$TEMP_DIR" 2>&1 | tee /tmp/oasst-download.log | grep -E "(Downloading|Found|saved|Processed|Downloaded)" || true
fi

# Step 3: Filter and copy long conversations
echo ""
echo "📋 Step 3: Filtering conversations with ${MIN_MESSAGES}+ messages..."
long_count=0
total_checked=0

# Process ShareGPT conversations
echo "   Checking ShareGPT conversations..."
for file in "$TEMP_DIR"/sharegpt-*.json "$TEMP_DIR"/*-sharegpt-*.json; do
    if [ -f "$file" ]; then
        total_checked=$((total_checked + 1))
        msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
        if [ "$msg_count" -ge "$MIN_MESSAGES" ]; then
            filename=$(basename "$file")
            cp "$file" "$OUTPUT_DIR/"
            echo "  ✓ ShareGPT: $filename ($msg_count messages)"
            long_count=$((long_count + 1))
        fi
    fi
done

# Process OpenAssistant conversations
echo "   Checking OpenAssistant conversations..."
for file in "$TEMP_DIR"/oasst-*.json "$TEMP_DIR"/*-oasst-*.json; do
    if [ -f "$file" ]; then
        total_checked=$((total_checked + 1))
        msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
        if [ "$msg_count" -ge "$MIN_MESSAGES" ]; then
            filename=$(basename "$file")
            cp "$file" "$OUTPUT_DIR/"
            echo "  ✓ OpenAssistant: $filename ($msg_count messages)"
            long_count=$((long_count + 1))
        fi
    fi
done

echo "   Checked $total_checked total conversations"

# Step 4: If we don't have enough, try Chatbot Arena (if available)
if [ "$long_count" -lt "$TARGET_COUNT" ]; then
    echo ""
    echo "📥 Step 4: Checking for Chatbot Arena conversations..."
    if [ -f "data/download-chatbot-arena.py" ]; then
        python3 data/download-chatbot-arena.py --limit 200 --output "$TEMP_DIR" 2>&1 | grep -E "(Downloading|Found|saved)" || true
        
        for file in "$TEMP_DIR"/chatbot_arena_*.json; do
            if [ -f "$file" ]; then
                total_checked=$((total_checked + 1))
                msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
                if [ "$msg_count" -ge "$MIN_MESSAGES" ]; then
                    filename=$(basename "$file")
                    cp "$file" "$OUTPUT_DIR/"
                    echo "  ✓ Chatbot Arena: $filename ($msg_count messages)"
                    long_count=$((long_count + 1))
                fi
            fi
        done
    else
        echo "  ⚠️  Chatbot Arena downloader not found, skipping"
    fi
fi

# Step 5: Summary
echo ""
echo "📊 Summary:"
echo "   Found $long_count conversations with ${MIN_MESSAGES}+ messages"

if [ "$long_count" -lt "$TARGET_COUNT" ]; then
    echo ""
    echo "⚠️  Only found $long_count conversations (target: ${TARGET_COUNT})"
    echo "   To get more long conversations:"
    echo "   1. Increase DOWNLOAD_LIMIT in this script (currently ${DOWNLOAD_LIMIT})"
    echo "   2. Lower MIN_MESSAGES threshold (currently ${MIN_MESSAGES})"
    echo "   3. Try downloading from different sources manually"
    echo ""
    echo "   Note: Long conversations (30+ messages) are rare in datasets."
    echo "   Most conversations are 5-15 messages, so downloading many is needed."
else
    echo "   ✅ Target reached!"
fi

# Step 6: Clean up temp directory
echo ""
read -p "🗑️  Delete temporary files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$TEMP_DIR"
    echo "   ✓ Cleaned up temporary files"
else
    echo "   ℹ️  Temporary files kept in $TEMP_DIR"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Filter non-English: Already done by app"
echo "   2. Classify conversations:"
echo "      python3 scripts/generate-pad-with-llm-direct.py --all --classify --force"
echo "   3. Generate PAD values:"
echo "      python3 scripts/generate-pad-with-llm-direct.py --all --force"
echo "   4. Update manifest:"
echo "      node scripts/generate-manifest.js"
echo ""
echo "   Then refresh your browser to see the new conversations!"

