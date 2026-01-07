# Hugging Face Classifier Guide

This guide explains how to use Hugging Face models for conversation classification.

## Overview

The `classifier-huggingface.py` script uses Hugging Face Transformers to classify conversations. It supports instruction-following models that can output structured JSON.

## Installation

```bash
pip install transformers torch accelerate
```

For GPU support (recommended):
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

## Authentication

Some models require Hugging Face authentication:

```bash
pip install huggingface-hub
huggingface-cli login
```

You'll need a Hugging Face account and may need to request access to some models (like LLaMA 2).

## Recommended Models

### Small & Fast (Good for Testing)
- **`microsoft/Phi-3-mini-4k-instruct`** (3.8B parameters)
  - Fast inference
  - Good quality for structured tasks
  - Low memory requirements
  - ✅ **Recommended for most users**

### Balanced Quality & Speed
- **`mistralai/Mistral-7B-Instruct-v0.2`** (7B parameters)
  - Excellent instruction following
  - Better JSON output reliability
  - Requires more memory

### High Quality (Larger Models)
- **`meta-llama/Llama-2-7b-chat-hf`** (7B parameters)
  - Requires Hugging Face authentication
  - High quality output
  - Larger memory footprint

- **`meta-llama/Llama-2-13b-chat-hf`** (13B parameters)
  - Even higher quality
  - Requires significant GPU memory (16GB+)

## Usage

### Basic Usage

```bash
python classifier-huggingface.py input.json output.json --model microsoft/Phi-3-mini-4k-instruct
```

### Save Individual Files

```bash
python classifier-huggingface.py input.json output.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --individual \
  --output-dir output/
```

### Custom Max Length

For very long conversations:

```bash
python classifier-huggingface.py input.json output.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --max-length 8192
```

## Model Comparison

| Model | Size | Speed | Quality | Memory | Notes |
|-------|------|-------|---------|--------|-------|
| Phi-3-mini-4k | 3.8B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ~4GB | Best balance |
| Mistral-7B | 7B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~8GB | Excellent quality |
| LLaMA-2-7B | 7B | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~8GB | Requires auth |
| LLaMA-2-13B | 13B | ⭐⭐ | ⭐⭐⭐⭐⭐ | ~16GB | High quality, slow |

## Performance Tips

1. **Use GPU**: Classification is 10-100x faster on GPU
   ```bash
   # Check GPU availability
   python -c "import torch; print(torch.cuda.is_available())"
   ```

2. **Batch Processing**: Process multiple conversations sequentially (the script handles this)

3. **Model Caching**: Models are cached in `~/.cache/huggingface/` after first download

4. **Memory Management**: For systems with limited memory:
   - Use smaller models (Phi-3-mini)
   - Reduce `--max-length` if conversations are truncated
   - Process conversations one at a time

## Troubleshooting

### Out of Memory Error

```
RuntimeError: CUDA out of memory
```

**Solutions:**
- Use a smaller model (`Phi-3-mini` instead of `Mistral-7B`)
- Reduce `--max-length` parameter
- Process one conversation at a time
- Use CPU (slower but uses less memory)

### Authentication Error

```
OSError: You are trying to access a gated repo
```

**Solution:**
```bash
huggingface-cli login
# Request access at: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
```

### JSON Parsing Errors

If you see JSON decode errors, the model might not be following the format correctly. Try:
- Using a different model (Mistral is better at JSON)
- Checking the model's response in the error output
- The script will fall back to a default classification on errors

### Slow Performance

**On CPU:**
- Expect 10-60 seconds per conversation depending on model size
- Consider using smaller models
- Process in batches during off-hours

**On GPU:**
- Should be 1-5 seconds per conversation
- If still slow, check GPU utilization: `nvidia-smi`

## Example: Batch Classify All Conversations

```bash
# 1. List unclassified conversations
python scripts/list-unclassified.py

# 2. Classify using Hugging Face
python classifier-huggingface.py \
  unclassified.json \
  classified.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --individual \
  --output-dir public/output/
```

## Advantages Over OpenAI/Ollama

✅ **No API costs** - Run locally  
✅ **Privacy** - Data stays on your machine  
✅ **No rate limits** - Process at your own pace  
✅ **Offline** - Works without internet after model download  
✅ **Customizable** - Can fine-tune models for your specific task  

## Disadvantages

❌ **Memory intensive** - Requires significant RAM/VRAM  
❌ **Slower setup** - Need to download models (several GB)  
❌ **Hardware dependent** - GPU recommended for reasonable speed  
❌ **JSON reliability** - Some models may have issues with structured output  

## Next Steps

1. **Test with a single conversation first**:
   ```bash
   python classifier-huggingface.py test-conversation.json output.json \
     --model microsoft/Phi-3-mini-4k-instruct
   ```

2. **Compare results** with OpenAI/Ollama classifications

3. **Choose your model** based on quality/speed tradeoffs

4. **Batch process** your remaining conversations

## Model Alternatives

If the recommended models don't work well, consider:

- **`Qwen/Qwen-7B-Chat`** - Good instruction following
- **`TinyLlama/TinyLlama-1.1B-Chat-v1.0`** - Very small (if memory is very limited)
- **`google/flan-t5-large`** - For text-to-text generation tasks

For more models, see: https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads

