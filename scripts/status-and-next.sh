#!/bin/bash
# Quick status check and guide for next steps

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "📊 Current Classification Status"
echo "================================"
echo ""

# Count classifications
CORNELL=$(ls -1 public/output/cornell-*.json 2>/dev/null | wc -l | tr -d ' ')
KAGGLE=$(ls -1 public/output/kaggle-emo-*.json 2>/dev/null | wc -l | tr -d ' ')
ARENA=$(ls -1 public/output/chatbot_arena_*.json 2>/dev/null | wc -l | tr -d ' ')

echo "Human-Human Dialogues:"
echo "  - Cornell: $CORNELL/10"
echo "  - Kaggle: $KAGGLE/10"
echo "  - Total: $((CORNELL + KAGGLE))"
echo ""

echo "Chatbot Arena:"
echo "  - Classified: $ARENA"
echo "  - Target: 200 additional (total 328)"
echo ""

TOTAL=$((CORNELL + KAGGLE + ARENA))
echo "Total Classified: $TOTAL"
echo ""

# Check if script is running
if ps aux | grep -E "classify.*chatbot|python3.*classifier-openai-social-role" | grep -v grep > /dev/null; then
    echo "✅ Classification script is running"
else
    echo "⚠️  No classification script currently running"
    echo ""
    echo "To continue classification, run:"
    echo "  ./scripts/retry-failed-chatbot-arena.sh 200"
fi

echo ""
echo "Next Steps:"
echo "1. Monitor progress: ./scripts/check-classification-progress.sh"
echo "2. Continue classification: ./scripts/retry-failed-chatbot-arena.sh 197  # (200 - 3 already done)"
echo "3. Validate quality: Review sample classifications"
echo "4. Update documentation once complete"

