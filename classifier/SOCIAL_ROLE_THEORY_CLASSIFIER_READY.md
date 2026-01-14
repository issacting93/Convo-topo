# Social Role Theory Classifier - Ready to Run

**Date:** 2026-01-07  
**Version:** v2.0-social-role-theory  
**Taxonomy:** 6 Human Roles + 6 AI Roles  
**Model:** OpenAI GPT-4o

---

## ✅ What's Ready

### 1. New Taxonomy Defined
- **6 Human Roles:** information-seeker, provider, director, collaborator, social-expressor, relational-peer
- **6 AI Roles:** expert-system, learning-facilitator, advisor, co-constructor, social-facilitator, relational-peer
- **Key Distinction:** Learning-Facilitator (instrumental) vs Social-Facilitator (expressive)

### 2. Few-Shot Examples Created
- **File:** `few-shot-examples-social-role-theory.json`
- **6 examples** showing key distinctions:
  1. Learning-Facilitator (instrumental, scaffolds learning)
  2. Social-Facilitator (expressive, builds rapport)
  3. Expert-System (instrumental, high authority)
  4. Relational-Peer (expressive, equal authority)
  5. Co-Constructor (instrumental, equal authority)
  6. Advisor (instrumental, prescriptive)

### 3. New Classifier Script Created
- **File:** `classifier-openai-social-role-theory.py`
- **Features:**
  - Social Role Theory framework integrated
  - 6+6 role taxonomy
  - Few-shot examples support
  - OpenAI GPT-4o model

### 4. Test Data Prepared
- **File:** `test-misclassified.json`
- **5 conversations** that were previously misclassified
- Ready for testing

---

## 🚀 How to Run

### Step 1: Set OpenAI API Key

```bash
export OPENAI_API_KEY=your-key-here
```

Or create a `.env` file:
```bash
echo "OPENAI_API_KEY=your-key-here" > .env
source .env
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

This will classify the 5 previously misclassified conversations and save results to `test-results-social-role-theory.json`.

### Step 3: Analyze Results

Compare the new classifications with your manual reviews to see if they're correct:

```bash
python3 << 'EOF'
import json

# Load results
with open('test-results-social-role-theory.json', 'r') as f:
    results = json.load(f)

# Load manual reviews
with open('manual-review-sample-complete.json', 'r') as f:
    reviews = json.load(f)

# Create lookup for manual reviews
review_dict = {r['id']: r.get('manualReview', {}) for r in reviews if r.get('manualReview', {}).get('reviewed')}

print("📊 Classification Comparison:")
print("=" * 70)

for result in results:
    conv_id = result.get('id', 'unknown')
    ai_role_dist = result.get('classification', {}).get('aiRole', {}).get('distribution', {})
    
    # Get dominant role
    if ai_role_dist:
        dominant_role = max(ai_role_dist.items(), key=lambda x: x[1])
        
        # Get manual review
        manual_review = review_dict.get(conv_id, {})
        manual_correct = manual_review.get('correctClassification', 'N/A')
        
        print(f"\n{conv_id}:")
        print(f"  Model (old): facilitator")
        print(f"  Model (new): {dominant_role[0]} ({dominant_role[1]:.2f})")
        print(f"  Manual:      {manual_correct}")
        
        # Check if new classification matches manual
        if manual_correct and dominant_role[0] == manual_correct:
            print(f"  ✅ MATCH!")
        elif manual_correct == 'affiliative' and dominant_role[0] in ['social-facilitator', 'relational-peer']:
            print(f"  ✅ Close match (expressive roles)")
        else:
            print(f"  ⚠️  Different")

EOF
```

### Step 4: Run on Full Dataset (After Testing)

Once you've verified the test results look good:

```bash
cd classifier
python3 classifier-openai-social-role-theory.py \
    output-remaining.json \
    output-social-role-theory.json \
    --few-shot-examples few-shot-examples-social-role-theory.json \
    --model gpt-4o \
    --individual \
    --output-dir output-social-role-theory/
```

---

## 📊 Expected Improvements

### What Should Improve:

1. **Casual Chat Classifications:**
   - **Before:** Classified as "facilitator"
   - **After:** Should be "social-facilitator" or "relational-peer" ✅

2. **Learning Scaffolding:**
   - **Before:** Might be confused with casual chat
   - **After:** Should be "learning-facilitator" (clear distinction) ✅

3. **Role Distribution:**
   - **Before:** 70%+ facilitator (conflated learning + social)
   - **After:** Should see more diversity (learning-facilitator vs social-facilitator vs expert-system) ✅

---

## 🔍 What to Check in Results

### For Each Conversation:

1. **Is the AI role appropriate?**
   - Learning-Facilitator: Scaffolds learning (instrumental)
   - Social-Facilitator: Maintains conversation (expressive)
   - Expert-System: Provides direct answers (instrumental, high authority)
   - Relational-Peer: Casual peer conversation (expressive, equal)

2. **Does it match your manual review?**
   - Compare with `manual-review-sample-complete.json`
   - Check if classifications align with your judgments

3. **Is there more diversity?**
   - Should see learning-facilitator, social-facilitator, expert-system, etc.
   - Not just one dominant role

---

## 📝 Files Created

1. **`classifier-openai-social-role-theory.py`** - New classifier script
2. **`few-shot-examples-social-role-theory.json`** - Few-shot examples with social role theory
3. **`test-misclassified.json`** - Test conversations (5 previously misclassified)
4. **`SOCIAL_ROLE_THEORY_TAXONOMY.md`** - Taxonomy documentation
5. **`TAXONOMY_MAPPING.md`** - Mapping from old to new taxonomy

---

## 🎯 Next Steps

1. **Set API key** (if not already set)
2. **Run test** on 5 misclassified conversations
3. **Review results** and compare with manual reviews
4. **If good:** Run on full dataset
5. **If not:** Iterate on taxonomy or few-shot examples

---

## 💡 Testing Checklist

- [ ] API key set
- [ ] Few-shot examples loaded successfully
- [ ] Test conversations classified
- [ ] Results compared with manual reviews
- [ ] Learning-Facilitator vs Social-Facilitator distinction clear
- [ ] Casual chat classified correctly (social-facilitator/relational-peer, not learning-facilitator)
- [ ] Expert-System vs Learning-Facilitator distinction clear

---

Ready to run! Just set your API key and execute the command.

