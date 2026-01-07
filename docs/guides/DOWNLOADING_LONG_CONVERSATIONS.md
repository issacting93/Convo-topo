# Downloading Long, High-Quality Conversations

This guide helps you download longer, higher-quality conversations for better PAD visualization.

## Current Statistics

Your current dataset has (as of 2025-01-03):
- **Total conversations**: 160 classified (128 Chatbot Arena + 32 OASST)
- **Average length**: ~10.7 messages
- **Long conversations (20+)**: 4
- **Very long (30+)**: 0
- **Maximum**: 24 messages

**Note**: Most conversations are relatively short (10-18 messages). For effective PAD incline/decline visualization, you want conversations with **30+ messages** to see meaningful emotional trajectories.

**WildChat Integration**: 589 conversations downloaded from WildChat-1M dataset (integration in progress). See `WILDCHAT_INTEGRATION.md` for details.

## Quick Start

### Option 1: Automated Script (Recommended)

```bash
# Download long conversations (30+ messages) from multiple sources
./scripts/download-long-high-quality-conversations.sh
```

This script:
- Downloads from ShareGPT (real human-AI conversations)
- Downloads from OpenAssistant (high-quality, annotated)
- Filters for conversations with 30+ messages
- Copies them to `public/output/`

### Option 2: Manual Download

#### Download from ShareGPT (Best for Real Conversations)

```bash
# Download 200 conversations (will filter for long ones)
python3 data/download-conversation-datasets.py --source sharegpt --limit 200 --output conversations-raw-temp

# Filter and copy long ones (30+ messages)
for file in conversations-raw-temp/sharegpt-*.json; do
    msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
    if [ "$msg_count" -ge 30 ]; then
        cp "$file" public/output/
        echo "✓ $(basename "$file"): $msg_count messages"
    fi
done
```

#### Download from OpenAssistant (High Quality)

```bash
python3 data/download-conversation-datasets.py --source openassistant --limit 200 --output conversations-raw-temp

# Filter and copy long ones
for file in conversations-raw-temp/oasst-*.json; do
    msg_count=$(jq ".messages | length" "$file" 2>/dev/null || echo 0)
    if [ "$msg_count" -ge 30 ]; then
        cp "$file" public/output/
        echo "✓ $(basename "$file"): $msg_count messages"
    fi
done
```

## Best Data Sources

### 1. ShareGPT ⭐ **Best for Real Conversations**
- **Source**: HuggingFace `anon8231489123/ShareGPT_Vicuna_unfiltered`
- **Why**: Real human-AI conversations from ShareGPT platform
- **Quality**: High - actual user interactions
- **Length**: Variable, but many long conversations available
- **Install**: `pip install datasets`

### 2. OpenAssistant ⭐ **Best for Quality**
- **Source**: HuggingFace `OpenAssistant/oasst1`
- **Why**: Expert-annotated, quality-rated conversations
- **Quality**: Very high with annotations
- **Length**: Many longer conversation trees
- **Install**: `pip install datasets`

### 3. Chatbot Arena
- **Source**: Model Database
- **Why**: Real comparisons between AI models
- **Quality**: High with user preferences
- **Note**: May need custom downloader

## After Downloading

### 1. Classify Conversations

Generate classification data for new conversations:

```bash
python3 scripts/generate-pad-with-llm-direct.py --all --classify --force
```

This will:
- Analyze each conversation
- Generate role metadata
- Create classification data

### 2. Generate PAD Values

Generate PAD (Pleasure-Arousal-Dominance) scores:

```bash
python3 scripts/generate-pad-with-llm-direct.py --all --force
```

This will:
- Calculate PAD scores for each message
- Generate emotional intensity values
- Enable Z-axis visualization

### 3. Update Manifest

Update the manifest file so the app can find new conversations:

```bash
node scripts/generate-manifest.js
```

### 4. Refresh Browser

The new conversations will appear automatically in the app!

## Filtering for Quality

### Minimum Message Count

For meaningful PAD visualization:
- **Minimum**: 20 messages (basic trajectory)
- **Recommended**: 30+ messages (clear patterns)
- **Ideal**: 50+ messages (rich emotional arcs)

### Quality Indicators

Look for conversations with:
- ✅ Multiple topic shifts (shows engagement)
- ✅ Varied message lengths (natural flow)
- ✅ Mix of questions and statements
- ✅ Some emotional content (not just factual Q&A)

## Troubleshooting

### "No long conversations found"

1. **Increase download limit**: Try `--limit 500` instead of `--limit 200`
2. **Lower minimum threshold**: Change `MIN_MESSAGES=30` to `MIN_MESSAGES=20` in the script
3. **Try different sources**: Some sources have longer conversations than others

### "Datasets library not installed"

```bash
pip install datasets
```

### "Conversations not appearing in app"

1. Make sure files are in `public/output/`
2. Run `node scripts/generate-manifest.js`
3. Check browser console for errors
4. Verify conversations have `messages` array with proper structure

## Combining Short Conversations

If you can't find enough long conversations, you can combine shorter ones:

```bash
python3 scripts/create-long-conversations.py --limit 10 --min-messages 30 --strategy combine
```

This merges multiple short conversations into longer ones (though quality may be lower than naturally long conversations).

## Expected Results

After running the download script, you should have:
- **20+ conversations** with 30+ messages each
- **Average length**: 35-50 messages
- **Maximum length**: 100+ messages (some sources have very long conversations)

This will give you much better PAD visualization with clear incline/decline patterns!

