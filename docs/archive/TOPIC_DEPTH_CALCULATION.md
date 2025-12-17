# How Topic Depth is Calculated

## Answer: It's Determined by GPT-4, Not a Formula

`topicDepth.category` and `topicDepth.confidence` are **NOT calculated using a formula**. They are **determined by OpenAI's GPT-4 model** analyzing the conversation text according to specific guidelines.

## The Process

### 1. **Input: Conversation Messages**
```json
{
  "messages": [
    {"role": "user", "content": "I've been thinking about the nature of consciousness..."},
    {"role": "assistant", "content": "That's a fascinating philosophical question..."}
  ]
}
```

### 2. **GPT-4 Analysis**
The classifier sends the conversation to GPT-4 with a detailed prompt that includes:

**Topic Depth Definition:**
```
### 7. TOPIC DEPTH
| Category | Definition |
|----------|------------|
| surface | Brief, shallow, or introductory |
| moderate | Some exploration but not exhaustive |
| deep | Thorough, nuanced, detailed exploration |
```

**Confidence Guidelines:**
```
## CONFIDENCE CALIBRATION
- 0.9–1.0: Unambiguous, clear signals, no reasonable alternative
- 0.7–0.9: Strong fit, minor ambiguity or mixed signals
- 0.5–0.7: Moderate fit, could reasonably be another category
- 0.3–0.5: Weak fit, defaulting due to lack of better option / short conversation
- <0.3: Highly uncertain, conversation may be too short or ambiguous
```

### 3. **GPT-4 Output**
GPT-4 analyzes the conversation and returns:
```json
{
  "topicDepth": {
    "category": "deep",
    "confidence": 0.7,
    "evidence": [
      "The hard problem of consciousness suggests",
      "Perhaps integrated information theory or global workspace theory could provide frameworks."
    ],
    "rationale": "The conversation involves a thorough exploration of a complex philosophical topic.",
    "alternative": null
  }
}
```

## How GPT-4 Determines Category

GPT-4 looks for signals in the conversation:

### **Surface** Indicators:
- Few exchanges (1-2 turns)
- Simple questions with brief answers
- No follow-up questions
- Greetings or small talk only
- Example: "hi, how are you?" → "I'm fine"

### **Moderate** Indicators:
- Multiple turns on the same topic
- Some clarifying questions
- Reasonable depth but not exhaustive
- Example: 4-6 messages exploring a topic with some detail

### **Deep** Indicators:
- Many exchanges (6+ turns)
- Follow-up questions exploring nuances
- Edge cases discussed
- Complexity acknowledged
- Example: Philosophical discussion with multiple layers of questioning

## How Confidence is Determined

GPT-4 assigns confidence based on:

1. **Clarity of signals**: How clearly the conversation fits the category
2. **Conversation length**: Longer conversations = higher confidence
3. **Evidence quality**: Can quotes justify the classification?
4. **Ambiguity**: Are there mixed signals or clear alternative categories?

### Examples:

**High Confidence (0.7-1.0):**
- Long conversation (10+ messages)
- Clear pattern throughout
- Strong evidence quotes
- No reasonable alternative

**Low Confidence (0.3-0.5):**
- Short conversation (1-2 messages)
- Ambiguous or mixed signals
- Weak evidence
- Could reasonably be another category

## Example from Your Data

**`output/sample-deep-discussion.json`:**
```json
{
  "topicDepth": {
    "category": "deep",
    "confidence": 0.7,
    "evidence": [
      "The hard problem of consciousness suggests",
      "Perhaps integrated information theory or global workspace theory could provide frameworks."
    ],
    "rationale": "The conversation involves a thorough exploration of a complex philosophical topic."
  }
}
```

**Why "deep"?**
- 6 messages exploring consciousness
- Multiple layers: hard problem → solipsism → biological substrate → frameworks
- Complex concepts discussed (integrated information theory, global workspace theory)
- Follow-up questions building on previous answers

**Why confidence 0.7?**
- Strong evidence of depth
- But could potentially be "moderate" if conversation were shorter
- Some ambiguity (philosophical topics can be hard to classify)

## Comparison: Surface vs Deep

**Surface (`output/conv-0.json`):**
```json
{
  "topicDepth": {
    "category": "surface",
    "confidence": 0.3,
    "evidence": ["hi , how are you doing ?"],
    "rationale": "The conversation is too short to determine topic depth."
  }
}
```
- Only 2 messages
- Brief greeting
- No topic exploration
- Low confidence (0.3) due to shortness

**Deep (`output/sample-deep-discussion.json`):**
```json
{
  "topicDepth": {
    "category": "deep",
    "confidence": 0.7,
    "evidence": [
      "The hard problem of consciousness suggests",
      "Perhaps integrated information theory or global workspace theory could provide frameworks."
    ],
    "rationale": "The conversation involves a thorough exploration of a complex philosophical topic."
  }
}
```
- 6 messages
- Complex topic (consciousness)
- Multiple theoretical frameworks mentioned
- Higher confidence (0.7) due to clear depth signals

## Summary

**Topic Depth is:**
- ✅ **Determined by GPT-4** analyzing conversation text
- ✅ **Based on prompt guidelines** (surface/moderate/deep definitions)
- ✅ **Evidence-based** (quotes from conversation)
- ✅ **Confidence-calibrated** (based on clarity, length, ambiguity)

**Topic Depth is NOT:**
- ❌ A mathematical formula
- ❌ A simple word count
- ❌ A fixed rule
- ❌ Calculated from message length alone

It's a **semantic analysis** by GPT-4 of how thoroughly the conversation explores its topic.

