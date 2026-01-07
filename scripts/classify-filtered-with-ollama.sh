#!/bin/bash
# Quick script to classify conversations-filtered/ using Ollama

# Default values
MODEL="llama2"
LIMIT=""
BATCH_SIZE=10

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --model)
      MODEL="$2"
      shift 2
      ;;
    --limit)
      LIMIT="$2"
      shift 2
      ;;
    --batch-size)
      BATCH_SIZE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="--dry-run"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--model MODEL] [--limit N] [--batch-size N] [--dry-run]"
      exit 1
      ;;
  esac
done

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama server not running"
    echo "   Start it with: ollama serve"
    exit 1
fi

echo "============================================================"
echo "Classify conversations-filtered/ with Ollama"
echo "============================================================"
echo ""
echo "Model: $MODEL"
if [ -n "$LIMIT" ]; then
    echo "Limit: $LIMIT conversations"
fi
echo ""

# Build command
CMD="python3 scripts/batch-classify-unclassified.py --filtered --ollama --model $MODEL"

if [ -n "$LIMIT" ]; then
    CMD="$CMD --limit $LIMIT"
fi

if [ -n "$DRY_RUN" ]; then
    CMD="$CMD $DRY_RUN"
fi

echo "Running: $CMD"
echo ""

# Execute
$CMD

