# Memory-Saving Guide for Hugging Face Classifier

## Problem: Out of Memory Crashes

Phi-3-mini (3.8B parameters) can use 4-8GB of RAM, which can cause crashes on systems with limited memory, especially on Mac.

## Solutions

### 1. **Force CPU Mode** (Recommended First Step)

CPU mode uses less memory than MPS on some systems:

```bash
python classifier-huggingface.py test-conversation.json output.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --cpu
```

**Pros:**
- Uses less memory than MPS
- More stable on Mac
- No additional dependencies

**Cons:**
- Slower (but still functional)

### 2. **Reduce Max Length**

Default is now 2048 (reduced from 4096). You can reduce further:

```bash
python classifier-huggingface.py test-conversation.json output.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --max-length 1024 \
  --cpu
```

**Pros:**
- Significant memory savings
- Faster processing

**Cons:**
- May truncate very long conversations

### 3. **Use 8-bit Quantization** (Best Memory Savings)

Requires `bitsandbytes` package:

```bash
pip install bitsandbytes
```

Then run:

```bash
python classifier-huggingface.py test-conversation.json output.json \
  --model microsoft/Phi-3-mini-4k-instruct \
  --8bit \
  --cpu
```

**Pros:**
- ~50% memory reduction
- Still good quality

**Cons:**
- Requires additional package
- Slightly slower inference

### 4. **Use an Even Smaller Model**

Consider TinyLlama (1.1B parameters) if Phi-3 is still too large:

```bash
python classifier-huggingface.py test-conversation.json output.json \
  --model TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
  --cpu
```

**Note:** Quality may be lower, but it uses much less memory.

## Recommended Approach

**For systems with limited memory:**

1. Start with CPU mode:
   ```bash
   python classifier-huggingface.py test-conversation.json output.json \
     --model microsoft/Phi-3-mini-4k-instruct \
     --cpu \
     --max-length 1024
   ```

2. If still crashes, add 8-bit quantization:
   ```bash
   pip install bitsandbytes
   python classifier-huggingface.py test-conversation.json output.json \
     --model microsoft/Phi-3-mini-4k-instruct \
     --8bit \
     --cpu \
     --max-length 1024
   ```

3. If still crashes, use a smaller model:
   ```bash
   python classifier-huggingface.py test-conversation.json output.json \
     --model TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
     --cpu
   ```

## Memory Usage Estimates

| Configuration | Approximate RAM Usage |
|---------------|----------------------|
| Phi-3-mini (MPS, float32) | 6-8GB |
| Phi-3-mini (CPU, float32) | 4-6GB |
| Phi-3-mini (CPU, 8-bit) | 2-3GB |
| TinyLlama (CPU) | 1-2GB |

## Troubleshooting

### Still Running Out of Memory?

1. **Close other applications** - Free up as much RAM as possible
2. **Process one conversation at a time** - Use `--individual` flag
3. **Reduce max_length further** - Try `--max-length 512`
4. **Use a different approach** - Consider using OpenAI API instead for now

### Check Available Memory

On Mac:
```bash
# Check memory usage
vm_stat

# Or use Activity Monitor
```

### Monitor Memory During Run

```bash
# In another terminal, watch memory usage
watch -n 1 'ps aux | grep python | head -1'
```

## Alternative: Use OpenAI Instead

If local models are too memory-intensive, the OpenAI classifier is a good alternative:

```bash
python classifier-openai.py test-conversation.json output.json
```

This uses the API (costs money) but requires no local memory.

