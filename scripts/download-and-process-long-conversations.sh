#!/bin/bash
# Download and process 10 long conversations (20+ messages)

set -e

echo "🚀 Downloading and processing 10 long conversations..."
echo ""

# Step 1: Download from OpenAssistant (tends to have longer conversations)
echo "📥 Step 1: Downloading from OpenAssistant..."
python3 data/download-conversation-datasets.py --source openassistant --limit 50 --output conversations-raw-temp

# Step 2: Copy long conversations to output
echo ""
echo "📋 Step 2: Copying long conversations to public/output..."
cd "$(dirname "$0")/.."

# Copy OpenAssistant conversations that have 20+ messages
for file in conversations-raw-temp/oasst-*.json; do
    if [ -f "$file" ]; then
        msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
        if [ "$msg_count" -ge 20 ]; then
            cp "$file" "public/output/"
            echo "  ✓ Copied $(basename "$file"): $msg_count messages"
        fi
    fi
done

# Step 3: Create additional combined conversations if needed
echo ""
echo "🔗 Step 3: Creating combined conversations to reach 10 total..."
python3 scripts/create-long-conversations.py --limit 10 --min-messages 20 --strategy combine

# Count how many long conversations we have now
long_count=$(find public/output -name "combined-long-*.json" -o -name "oasst-*.json" | wc -l | tr -d ' ')
echo ""
echo "✅ Total long conversations (20+ messages): $long_count"

if [ "$long_count" -lt 10 ]; then
    echo "⚠️  Only found $long_count conversations with 20+ messages"
    echo "   You may need to download more or lower the minimum threshold"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Classify: python3 scripts/generate-pad-with-llm-direct.py --all --classify --force"
echo "   2. Generate PAD: python3 scripts/generate-pad-with-llm-direct.py --all --force"
echo "   3. Update manifest: node scripts/generate-manifest.js"

