#!/bin/bash
# Re-classify conversations with new taxonomy (GPT-5.2 + 2.0-social-role-theory)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Re-classifying conversations with NEW TAXONOMY (GPT-5.2 + 2.0-social-role-theory)..."
echo ""

# Load .env file if it exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Loaded .env file"
elif [ -f "../.env" ]; then
    set -a
    source ../.env
    set +a
    echo "✅ Loaded .env file from parent directory"
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    echo "   Please set it in .env file: OPENAI_API_KEY=your_key"
    exit 1
fi

echo "✅ API key found (starts with: ${OPENAI_API_KEY:0:7}...)"
echo ""

# Find conversations to re-classify
echo "📋 Finding conversations to re-classify..."
RECLASSIFY_JSON=$(python3 << 'EOF'
import json
from pathlib import Path

output_dir = Path('public/output')
raw_dir = Path('conversations-raw')

to_reclassify = {
    'chatbot_arena': [],
    'wildchat': [],
    'oasst': []
}

current_files = list(output_dir.glob("*.json"))
current_files = [f for f in current_files if f.name != "manifest.json"]

for file_path in current_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        classification = data.get('classification')
        if not classification:
            continue
        
        metadata_classification = classification.get('metadata', {})
        metadata_top = data.get('classificationMetadata', {})
        metadata = metadata_classification or metadata_top or {}
        
        filename = file_path.name
        
        # Check if it's new taxonomy
        is_new_tax = False
        if metadata:
            model = str(metadata.get('model', '')).lower().strip()
            prompt_version = str(metadata.get('promptVersion', '')).strip()
            
            is_gpt52 = 'gpt-5.2' in model or 'gpt5.2' in model
            is_new_prompt = '2.0-social-role-theory' in prompt_version
            is_new_tax = is_gpt52 and is_new_prompt
        
        # If NOT new taxonomy, mark for re-classification
        if not is_new_tax:
            # Check if raw data exists, otherwise use output file as source
            raw_file = raw_dir / filename
            output_file = output_dir / filename
            
            # Prefer raw data, but use output file if raw doesn't exist
            source_file = raw_file if raw_file.exists() else output_file
            
            if source_file.exists():
                item = {
                    'filename': filename,
                    'source': str(source_file),
                    'is_raw': raw_file.exists()
                }
                if filename.startswith('chatbot_arena_'):
                    to_reclassify['chatbot_arena'].append(item)
                elif filename.startswith('wildchat_'):
                    to_reclassify['wildchat'].append(item)
                elif filename.startswith('oasst-'):
                    to_reclassify['oasst'].append(item)

    except Exception as e:
        pass

# Output as JSON for processing
print(json.dumps(to_reclassify))
EOF
)

# Parse the list and count
ARENA_COUNT=$(echo "$RECLASSIFY_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['chatbot_arena']))")
WILDCHAT_COUNT=$(echo "$RECLASSIFY_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['wildchat']))")
OASST_COUNT=$(echo "$RECLASSIFY_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['oasst']))")
TOTAL=$((ARENA_COUNT + WILDCHAT_COUNT + OASST_COUNT))

echo "📊 Found conversations to re-classify:"
echo "   Chatbot Arena: $ARENA_COUNT"
echo "   WildChat: $WILDCHAT_COUNT"
echo "   OASST: $OASST_COUNT"
echo "   Total: $TOTAL"
echo ""

if [ $TOTAL -eq 0 ]; then
    echo "✅ No conversations need re-classification (all already use new taxonomy)"
    exit 0
fi

read -p "Continue with re-classification? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting re-classification..."
echo ""

# Counter
CURRENT=0
SUCCESS=0
FAILED=0

# Function to classify a file
classify_file() {
    local source_file=$1
    local filename=$2
    local use_temp=false
    local temp_source=""
    
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL] Classifying $filename..."
    
    # If re-classifying from output file, extract messages first
    if [[ "$source_file" == public/output/* ]]; then
        echo "  ⚠️  Re-classifying from existing output (extracting messages)..."
        # Extract messages and create temp file
        temp_source=$(python3 scripts/prepare-for-reclassification.py "$source_file" 2>&1 | tail -1)
        if [ -f "$temp_source" ]; then
            source_file="$temp_source"
            use_temp=true
        else
            echo "  ❌ Failed to prepare file"
            FAILED=$((FAILED + 1))
            return 1
        fi
    fi
    
    python3 classifier/classifier-openai-social-role-theory.py \
        "$source_file" \
        "output/$filename" \
        --few-shot-examples classifier/few-shot-examples-social-role-theory.json \
        --model gpt-5.2 \
        --individual \
        --output-dir public/output 2>&1
    
    result=$?
    
    # Clean up temp file if we created one
    if [ "$use_temp" = true ] && [ -n "$temp_source" ] && [ -f "$temp_source" ]; then
        rm "$temp_source"
    fi
    
    if [ $result -eq 0 ]; then
        SUCCESS=$((SUCCESS + 1))
        echo "  ✅ Success"
    else
        FAILED=$((FAILED + 1))
        echo "  ❌ Failed"
    fi
    
    # Rate limiting
    sleep 1
    
    # Progress update every 10
    if [ $((CURRENT % 10)) -eq 0 ]; then
        echo ""
        echo "  📊 Progress: $CURRENT/$TOTAL ($SUCCESS success, $FAILED failed)"
        echo ""
    fi
}

# Process Chatbot Arena
if [ $ARENA_COUNT -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Chatbot Arena: $ARENA_COUNT conversations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo "$RECLASSIFY_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data['chatbot_arena']:
    print(f\"{item['source']}|{item['filename']}\")
" | while IFS='|' read -r source_file filename; do
        classify_file "$source_file" "$filename"
    done
fi

# Process WildChat
if [ $WILDCHAT_COUNT -gt 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 WildChat: $WILDCHAT_COUNT conversations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo "$RECLASSIFY_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data['wildchat']:
    print(f\"{item['source']}|{item['filename']}\")
" | while IFS='|' read -r source_file filename; do
        classify_file "$source_file" "$filename"
    done
fi

# Process OASST
if [ $OASST_COUNT -gt 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 OASST: $OASST_COUNT conversations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo "$RECLASSIFY_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data['oasst']:
    print(f\"{item['source']}|{item['filename']}\")
" | while IFS='|' read -r source_file filename; do
        classify_file "$source_file" "$filename"
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RE-CLASSIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Total processed: $CURRENT"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed: $FAILED"
echo ""
echo "📊 Updated totals:"
echo "   Chatbot Arena: $(ls -1 public/output/chatbot_arena_*.json 2>/dev/null | wc -l | tr -d ' ') files"
echo "   WildChat: $(ls -1 public/output/wildchat_*.json 2>/dev/null | wc -l | tr -d ' ') files"
echo "   OASST: $(ls -1 public/output/oasst-*.json 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
