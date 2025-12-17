# Classification API Options

You have **three options** for running the classifier:

## 1. Anthropic Claude (Original)

**File**: `classifier-v1.1.py`  
**Model**: `claude-sonnet-4-20250514`  
**API Key**: `ANTHROPIC_API_KEY`

### Setup
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
pip install anthropic
python3 classifier-v1.1.py conversations.json output.json
```

### Pros
- ✅ Original implementation, well-tested
- ✅ Claude is excellent at structured outputs
- ✅ Good JSON compliance

### Cons
- Requires Anthropic API key
- Costs ~$1-2 for 145 conversations

---

## 2. OpenAI GPT-4 (Alternative)

**File**: `classifier-openai.py`  
**Model**: `gpt-4` or `gpt-4-turbo-preview`  
**API Key**: `OPENAI_API_KEY`

### Setup
```bash
export OPENAI_API_KEY=sk-your-key-here
pip install openai
python3 classifier-openai.py conversations.json output.json
```

### Pros
- ✅ Widely available API
- ✅ GPT-4 is very capable
- ✅ Similar quality to Claude

### Cons
- Requires OpenAI API key
- Costs ~$2-4 for 145 conversations (GPT-4 is more expensive)
- May need `gpt-4-turbo-preview` for better JSON compliance

---

## 3. Cursor (Not Available)

**Can you use Cursor for classification?**

**Short answer: No, not directly.**

**Why?**
- Cursor is an IDE/editor (like VS Code)
- It uses AI models internally for code completion, but doesn't expose them as an API
- You can't use Cursor's internal models for batch processing tasks

**However:**
- Cursor can help you **write and run** the classification scripts
- Cursor's AI assistant (me!) can help debug and improve the code
- But the actual classification still needs to run via API calls

---

## Comparison

| Feature | Anthropic Claude | OpenAI GPT-4 | Cursor |
|---------|-----------------|--------------|---------|
| API Available | ✅ Yes | ✅ Yes | ❌ No |
| Cost (145 convos) | ~$1-2 | ~$2-4 | N/A |
| JSON Compliance | Excellent | Good | N/A |
| Setup Complexity | Low | Low | N/A |
| Speed | Fast | Fast | N/A |

---

## Recommendation

**For best results**: Use **Anthropic Claude** (original implementation)
- Best structured output compliance
- Lower cost
- Original design target

**If you prefer OpenAI**: Use `classifier-openai.py`
- Works just as well
- Slightly more expensive
- Might need model adjustments for best JSON output

**Both work well** - choose based on which API you have access to!

---

## Quick Setup for OpenAI Version

```bash
# Install OpenAI package
pip install openai

# Set API key
export OPENAI_API_KEY=sk-your-key-here

# Run classification
python3 classifier-openai.py conversations-for-classifier.json classified-output.json
```

The OpenAI version uses the same prompt and produces identical output format!

