#!/bin/bash
# Quick progress checker for classification

cd "$(dirname "${BASH_SOURCE[0]}")/.."

CORNELL=$(ls -1 public/output/cornell-*.json 2>/dev/null | wc -l | tr -d ' ')
KAGGLE=$(ls -1 public/output/kaggle-emo-*.json 2>/dev/null | wc -l | tr -d ' ')
ARENA=$(ls -1 public/output/chatbot_arena_*.json 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Classification Progress:"
echo "  - Cornell Movie Dialogues: $CORNELL/10"
echo "  - Kaggle Empathetic Dialogues: $KAGGLE/10"
echo "  - Chatbot Arena (total): $ARENA"
echo ""
echo "Total classified conversations: $((CORNELL + KAGGLE + ARENA))"

if [ $CORNELL -eq 10 ] && [ $KAGGLE -eq 10 ]; then
    echo ""
    echo "✅ Human-human classification complete!"
fi

