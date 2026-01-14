# Quick Start: Social Role Theory Classifier

## ✅ Everything is Ready!

1. ✅ New classifier script: `classifier-openai-social-role-theory.py`
2. ✅ Few-shot examples: `few-shot-examples-social-role-theory.json`
3. ✅ Test data: `test-misclassified.json` (5 conversations)
4. ✅ 6+6 role taxonomy based on Social Role Theory

---

## 🚀 Run Now (3 Steps)

### Step 1: Set API Key

```bash
export OPENAI_API_KEY=your-key-here
```

### Step 2: Test on Misclassified Conversations

```bash
cd classifier
python3 classifier-openai-social-role-theory.py \
    test-misclassified.json \
    test-results-social-role-theory.json \
    --few-shot-examples few-shot-examples-social-role-theory.json \
    --model gpt-4o
```

### Step 3: Review Results

```bash
# Check if casual chat is now classified correctly
python3 << 'EOF'
import json

with open('test-results-social-role-theory.json', 'r') as f:
    results = json.load(f)

print("📊 New Classifications:\n")
for r in results:
    if r.get('classification'):
        ai_dist = r['classification']['aiRole']['distribution']
        dominant = max(ai_dist.items(), key=lambda x: x[1])
        print(f"{r['id']}: {dominant[0]} ({dominant[1]:.2f})")
EOF
```

---

## 🎯 What Should Happen

**Before (local model):**
- conv-20: facilitator ❌
- conv-21: facilitator ❌
- conv-22: facilitator ❌
- conv-23: facilitator ❌
- conv-26: facilitator ❌

**After (social role theory + GPT-4o):**
- conv-20: social-facilitator or relational-peer ✅
- conv-21: social-facilitator or relational-peer ✅
- conv-22: social-facilitator or relational-peer ✅
- conv-23: social-facilitator or relational-peer ✅
- conv-26: social-facilitator or relational-peer ✅

**These are casual chat conversations** - they should be EXPRESSIVE roles (social-facilitator/relational-peer), not INSTRUMENTAL (learning-facilitator/expert-system).

---

## 📋 Full Documentation

See `SOCIAL_ROLE_THEORY_CLASSIFIER_READY.md` for complete instructions.

