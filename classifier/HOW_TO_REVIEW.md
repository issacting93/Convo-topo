# How to Review Conversations: Step-by-Step Guide

**File to Review:** `manual-review-sample-complete.json`  
**Total Conversations:** 20 complete conversations  
**All classified as:** `facilitator` by local model

---

## 🎯 Your Goal

**Judge whether each conversation should actually be classified as `facilitator` or if it should be `expert`.**

---

## 📋 Quick Decision Guide

### Expert (Should provide direct answers)
- AI gives direct factual answers
- AI explains concepts clearly
- AI provides specific information
- AI acts as a knowledge source
- **Example:** "Python uses indentation for code blocks. Here's how it works..."

### Facilitator (Should guide discovery)
- AI asks questions to help you figure it out
- AI scaffolds learning step-by-step
- AI guides you to discover answers yourself
- AI acts as a learning coach
- **Example:** "What do you think happens if we try X? Let's explore that..."

### Neither/Both
- AI is more like a peer/affiliative (relationship-focused)
- Genuinely mixed roles
- Too ambiguous to decide
- **Mark as:** "mixed" or "unclear"

---

## ✅ Step-by-Step Review Process

### Step 1: Open the File
```bash
cd classifier
open manual-review-sample-complete.json  # or use your preferred editor
```

### Step 2: Review Each Conversation

For each of the 20 conversations:

1. **Read the conversation messages**
   - Focus on what the AI actually says (the `content` field)
   - Don't trust the classification - judge for yourself

2. **Make your judgment:**
   - Is the AI providing direct answers? → **expert**
   - Is the AI asking questions and guiding? → **facilitator**
   - Is it relationship-focused/peer-like? → **affiliative/peer**
   - Is it genuinely mixed? → **mixed**

3. **Fill in the `manualReview` section:**
   ```json
   "manualReview": {
       "shouldBeExpert": true,        // or false or null
       "shouldBeFacilitator": false,  // or true or null
       "correctClassification": "expert",  // "expert", "facilitator", "affiliative", "peer", "mixed", or "unclear"
       "notes": "AI provides direct factual explanation about...",
       "reviewed": true
   }
   ```

### Step 3: After Reviewing All 20

Run the analysis:
```bash
python3 sample-for-review.py manual-review-sample-complete.json --analyze
```

This will show you:
- How many the model got right vs wrong
- Agreement rate between your judgments and model classifications
- Patterns in misclassifications

---

## 📝 Example Review

### Conversation Example:
```json
{
  "id": "example-1",
  "conversation": {
    "messages": [
      {
        "role": "user",
        "content": "How does Python handle exceptions?"
      },
      {
        "role": "assistant",
        "content": "Python uses try/except blocks. You write 'try:' followed by code that might raise an exception, then 'except ExceptionType:' to catch it. Here's an example: try: x = 1/0 except ZeroDivisionError: print('Error!')"
      }
    ]
  },
  "classification": {
    "aiRole": {
      "dominant_role": "facilitator",  // Model classified as facilitator
      "dominant_prob": 1.0
    }
  },
  "manualReview": {
    "shouldBeExpert": true,            // ✅ You think it should be expert
    "shouldBeFacilitator": false,      // ❌ Not facilitator
    "correctClassification": "expert", // Your judgment
    "notes": "AI provides direct factual explanation, not guiding questions",
    "reviewed": true
  }
}
```

**This would count as a misclassification** - model said facilitator, but you judged it as expert.

---

## ⏱️ Time Management

**Full Review (20 conversations):**
- ~2-3 minutes per conversation
- **Total: 45-60 minutes**

**Quick Check (5-10 conversations):**
- **Total: 15-30 minutes**
- If you see a clear pattern (>50% wrong), you might not need to review all 20

---

## 🎯 What to Look For

### Signs it's EXPERT (model probably wrong if it said facilitator):
- ✅ AI gives direct answers immediately
- ✅ AI explains concepts without asking questions
- ✅ AI provides code examples or facts
- ✅ AI acts as authoritative knowledge source

### Signs it's FACILITATOR (model probably right):
- ✅ AI asks questions: "What do you think about...?"
- ✅ AI guides step-by-step: "Let's start with..."
- ✅ AI helps you discover rather than telling you
- ✅ AI acts as learning coach

### Signs it's NEITHER:
- ✅ AI is just being friendly/empathetic
- ✅ AI is roleplaying/being a peer
- ✅ Conversation is too casual/relationship-focused
- ✅ Too short to judge

---

## 💡 Tips

1. **Trust your gut** - Your first impression is usually right
2. **Don't overthink** - If genuinely ambiguous, mark as "mixed"
3. **Focus on what AI says** - Ignore the classification field when reading
4. **Take breaks** - Review in batches of 5-10 if helpful

---

## 📊 After You Review

### Run Analysis:
```bash
cd classifier
python3 sample-for-review.py manual-review-sample-complete.json --analyze
```

### What the Results Mean:

**If >40% wrong:**
- ❌ Local model is unreliable
- ✅ Use OpenAI instead or fix the local model

**If <20% wrong:**
- ✅ Local model is mostly accurate
- ⚠️ Accept with minor caveats

**If 30%+ ambiguous:**
- 💡 Classification task might be inherently difficult
- 💡 Consider pivoting research or refining taxonomy

---

## 🚀 Ready to Start?

1. Open `manual-review-sample-complete.json`
2. Start with conversation #1
3. Read it and make your judgment
4. Fill in the `manualReview` section
5. Mark `"reviewed": true`
6. Move to next conversation

**After reviewing, run the analysis to see the results!**

