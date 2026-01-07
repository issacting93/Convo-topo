# Ollama Classifier Setup

This guide explains how to use Ollama with Llama2 (or other local models) for conversation classification instead of OpenAI/Anthropic APIs.

## Why Use Ollama?

- ✅ **Free**: No API costs
- ✅ **Private**: All data stays local
- ✅ **Fast**: Runs on your hardware
- ✅ **Flexible**: Use any model (Llama2, Llama3, Mistral, etc.)

## Prerequisites

1. **Install Ollama**: https://ollama.ai/download
2. **Install Python package**: `pip install requests`
3. **Pull a model**: `ollama pull llama2` (or `llama3.2`, `mistral`, etc.)

## Quick Start

```bash
# Start Ollama server (if not already running)
ollama serve

# Classify conversations
python3 classifier-ollama.py conversations.json output.json

# Use a different model
python3 classifier-ollama.py conversations.json output.json --model llama3.2

# Save individual files
python3 classifier-ollama.py conversations.json output.json --model llama3.2 --individual --output-dir output/
```

## Available Models

Check installed models:
```bash
ollama list
```

Pull a new model:
```bash
ollama pull llama2        # Llama 2 (7B)
ollama pull llama3.2      # Llama 3.2 (3B - faster, smaller)
ollama pull mistral       # Mistral 7B
ollama pull qwen2.5       # Qwen 2.5 (good for structured tasks)
```

## Model Recommendations

For classification tasks, we recommend:

1. **Llama 3.2 3B** (`llama3.2`) - Fast, good JSON output
2. **Llama 2 7B** (`llama2`) - Good quality, moderate speed
3. **Mistral 7B** (`mistral`) - Good reasoning
4. **Qwen 2.5** (`qwen2.5`) - Excellent structured output

## Configuration

Set custom Ollama server URL:
```bash
export OLLAMA_BASE_URL=http://localhost:11434
```

## Comparison: Ollama vs OpenAI

| Feature | OpenAI GPT-4 | Ollama (Llama2/Llama3) |
|---------|--------------|------------------------|
| **Cost** | ~$0.01-0.03 per conversation | Free |
| **Privacy** | Data sent to API | Fully local |
| **Speed** | Fast (API latency) | Fast (local) |
| **Quality** | Excellent | Good (depends on model) |
| **Setup** | API key only | Install Ollama + model |

## Performance Notes

- **Llama 3.2 3B**: ~2-5 seconds per conversation
- **Llama 2 7B**: ~5-10 seconds per conversation
- **GPU acceleration**: Significantly faster if you have CUDA/Metal support

## Troubleshooting

**"Ollama server not reachable"**
```bash
# Make sure Ollama is running
ollama serve
```

**"Model not found"**
```bash
# List available models
ollama list

# Pull the model
ollama pull llama2
```

**Poor JSON output**
- Try a model better at structured output (e.g., `qwen2.5`)
- The classifier includes JSON extraction to handle imperfect outputs

## Usage Examples

### Basic Classification
```bash
python3 classifier-ollama.py conversations.json output.json --model llama3.2
```

### Batch Processing with Individual Files
```bash
python3 classifier-ollama.py conversations-selected/*.json output.json \
  --model llama3.2 \
  --individual \
  --output-dir public/output/
```

### With Windowed Classification
```bash
python3 classifier-ollama.py conversations.json output.json \
  --model llama2 \
  --windowed \
  --window-size 6 \
  --window-stride 2
```

## Quality Comparison

For best results, we recommend:
- **Development/Testing**: Llama 3.2 3B (fast, good enough)
- **Production**: Llama 2 7B or Mistral 7B (better quality)
- **Best Quality**: Still OpenAI GPT-4, but Ollama is close

The classification prompt is designed to work well with both, but OpenAI models tend to be more consistent with complex role distributions.

