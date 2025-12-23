# Classification and PAD Generation API Options

This document covers API options for both **conversation classification** and **PAD value generation**.

---

## Classification API Options

You have **two options** for running the classifier:

### 1. OpenAI GPT-4 ⭐ **Currently Active**

**File**: `classifier/classifier-openai.py`  
**Model**: `gpt-4`  
**API Key**: `OPENAI_API_KEY`

**Status**: ✅ **Active** - Primary classifier in use

**Setup:**
```bash
export OPENAI_API_KEY=sk-your-key-here
pip install openai
python3 classifier-openai.py conversations.json output.json
```

**Pros:**
- ✅ Widely available API
- ✅ GPT-4 is very capable
- ✅ Good JSON compliance
- ✅ Individual file output support (`--individual`)
- ✅ Well-integrated workflow

**Cons:**
- Requires OpenAI API key
- Costs ~$0.02-0.03 per conversation (~$2-4 for 145 conversations)

---

### 2. Anthropic Claude (Original)

**File**: `classifier/classifier-v1.1.py`  
**Model**: `claude-sonnet-4-20250514`  
**API Key**: `ANTHROPIC_API_KEY`

**Status**: ⚠️ **Available** - Original implementation, well-tested

**Setup:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
pip install anthropic
python3 classifier-v1.1.py conversations.json output.json
```

**Pros:**
- ✅ Original implementation, well-tested
- ✅ Claude is excellent at structured outputs
- ✅ Excellent JSON compliance
- ✅ Lower cost (~$0.01-0.02 per conversation)

**Cons:**
- Requires Anthropic API key
- Less integrated into current workflow

---

## PAD Generation Options

PAD (Pleasure-Arousal-Dominance) values are generated **per message** to create the Z-axis visualization. You have two approaches:

### 1. Rule-Based PAD Generation (Current Default)

**Script**: `scripts/add-pad-to-data.js`  
**Method**: Pattern matching and rule-based analysis

**Usage:**
```bash
node scripts/add-pad-to-data.js
node scripts/add-pad-to-data.js --force  # Recalculate existing PAD values
```

**Pros:**
- ✅ Free (no API costs)
- ✅ Fast (instant processing)
- ✅ Deterministic results

**Cons:**
- ⚠️ Language-specific (English-only patterns)
- ⚠️ Context-insensitive
- ⚠️ Limited emotional nuance

**Current Status**: ✅ **Active** - All conversation files have PAD values generated this way

---

### 2. LLM-Based PAD Generation (Recommended)

**Script**: `scripts/generate-pad-with-llm-direct.py`  
**Method**: OpenAI GPT-4o-mini API for accurate, multilingual PAD generation

**Usage:**
```bash
python3 scripts/generate-pad-with-llm-direct.py --file chatbot_arena_01.json
python3 scripts/generate-pad-with-llm-direct.py --all  # Process all files
```

**Pros:**
- ✅ Better accuracy than rule-based
- ✅ Multilingual support
- ✅ Context-aware analysis

**Cons:**
- ⚠️ Still limited compared to true LLM analysis
- ⚠️ Multilingual support is limited

**Current Status**: ⚠️ **Available** - Used for chatbot_arena dataset recalculation

---

### 3. True LLM-Based PAD Generation ✅ **Available**

**Script**: `scripts/generate-pad-with-llm-direct.py`  
**Model**: GPT-4o-mini (OpenAI)  
**Method**: Batch processing (single API call per conversation)

**Status**: ✅ **Implemented** - Ready to use

**Usage:**
```bash
# Process single file
python3 scripts/generate-pad-with-llm-direct.py --file chatbot_arena_01.json

# Process all files
python3 scripts/generate-pad-with-llm-direct.py --all

# Dry-run to preview
python3 scripts/generate-pad-with-llm-direct.py --all --dry-run
```

**Benefits:**
- ✅ Multilingual (works across languages, including Spanish)
- ✅ Context-aware emotional understanding
- ✅ More accurate frustration/satisfaction detection
- ✅ Understands conversation flow and emotional shifts

**Cost:**
- ~$0.001-0.01 per conversation (GPT-4o-mini is very cost-effective)
- ~$0.02-0.20 for 20 conversations

**Setup:**
```bash
pip install openai
export OPENAI_API_KEY=sk-your-key-here
```

**See**: `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md` for detailed strategy and usage

---

## Comparison

### Classification APIs

| Feature | OpenAI GPT-4 | Anthropic Claude |
|---------|-------------|------------------|
| **Status** | ✅ Active | ⚠️ Available |
| **Cost/Conversation** | ~$0.02-0.03 | ~$0.01-0.02 |
| **Speed** | ~30-40s | ~25-35s |
| **JSON Compliance** | Good | Excellent |
| **Individual Files** | ✅ Yes | ⚠️ Manual |
| **Workflow Integration** | ✅ Excellent | ⚠️ Basic |

### PAD Generation Methods

| Method | Cost | Speed | Quality | Multilingual |
|--------|------|-------|---------|--------------|
| **Rule-Based** | Free | Instant | Good | ❌ English only |
| **Enhanced Rule-Based** | Free | Instant | Better | ⚠️ Limited |
| **LLM-Based** (planned) | ~$0.01-0.05/conv | ~1-3s | Best | ✅ Yes |

---

## Recommendation

### For Classification

**Use OpenAI GPT-4** (`classifier-openai.py`) - Currently active and well-integrated into the workflow.

**Alternative**: Use Anthropic Claude if you prefer lower costs and better JSON compliance.

### For PAD Generation

**Current**: Use rule-based generation (`scripts/add-pad-to-data.js`) for cost-effectiveness.

**Future**: Consider LLM-based PAD generation for multilingual conversations or when higher accuracy is needed. See `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md` for implementation details.

---

## Quick Setup

### Classification (OpenAI GPT-4)

```bash
# Install OpenAI package
pip install openai

# Set API key
export OPENAI_API_KEY=sk-your-key-here

# Run classification
cd classifier
python3 classifier-openai.py conversations.json output.json --individual --output-dir ../output
```

### PAD Generation (Rule-Based)

```bash
# Generate PAD values for all conversations
node scripts/add-pad-to-data.js

# Recalculate PAD values (if calculation logic changed)
node scripts/add-pad-to-data.js --force
```

---

## Related Documentation

- **Classification**: See `docs/CLASSIFIERS_AND_DATA_SOURCES.md`
- **PAD Strategy**: See `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md`
- **Data Structure**: See `docs/DATA_STRUCTURE.md`

