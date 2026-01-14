# Dead End Analysis: Classification Comparison

**Date:** 2026-01-07  
**Issue:** Significant discrepancy between local (qwen2.5:7b) and OpenAI (GPT-4o-mini) classifications

---

## 🔴 The Core Problem

### Local Model (qwen2.5:7b) Results:
- **83.1%** classified as `information-seeker→facilitator`
- **0.6%** classified as `expert-system`
- **Almost no diversity** in AI role classifications

### OpenAI (GPT-4o-mini) Results:
- **60%** `facilitator`
- **36%** `expert-system`
- **More diverse** distribution

**Critical Issue:** Local model appears to be defaulting to `facilitator` despite few-shot examples that favor `expert`.

---

## 🤔 Why This Feels Like a Dead End

1. **Inconsistent Results:** The models disagree significantly on what should be expert vs facilitator
2. **Local Model Bias:** 83% defaulting to facilitator suggests the model isn't properly distinguishing roles
3. **Few-Shot Mismatch:** Few-shot examples show 4/5 with `expert` dominant, but local model produces opposite bias
4. **Unclear Ground Truth:** No way to know which model is "correct" without manual review
5. **Cost vs Quality:** Local model saves money but may not be reliable enough

---

## 🔍 Root Cause Analysis

### Possible Explanations:

1. **Model Limitation:**
   - qwen2.5:7b may not be sophisticated enough to distinguish expert vs facilitator
   - May be defaulting to "safer" facilitator role when uncertain

2. **Prompt Engineering:**
   - Local model may not be following few-shot examples as effectively
   - Temperature/parameters may need adjustment
   - Prompt format may not work as well for smaller models

3. **Few-Shot Examples:**
   - Examples might not be representative of the actual dataset
   - Examples favor expert (4/5), but dataset might genuinely favor facilitator
   - Need to check if examples match actual conversation patterns

4. **Dataset Differences:**
   - Local model classified 154 conversations (Cornell Movie + Empathetic Dialogues)
   - OpenAI classified only 25 conversations (unknown source)
   - Different datasets might genuinely have different distributions

---

## 💡 Potential Solutions

### Option 1: **Accept the Difference** (Pragmatic)
- Accept that different models will have different interpretations
- Use local model for speed/cost, OpenAI for accuracy-critical cases
- Document the model differences as a known limitation

### Option 2: **Validate with Manual Review** (Gold Standard)
- Sample 20-30 conversations that both models classified differently
- Manually annotate which classifications seem more accurate
- Use results to determine which model is more reliable

### Option 3: **Adjust Local Model Prompt** (Try to Fix)
- Experiment with different temperature settings (currently unknown)
- Add more explicit instructions about expert vs facilitator distinction
- Try different few-shot examples that better match the dataset
- Use chain-of-thought prompting to force model to reason through the distinction

### Option 4: **Use Different Local Model** (Model Switch)
- Try larger qwen model (e.g., qwen2.5:14b or 32b)
- Try different architecture (llama3, mistral, etc.)
- May still face same issues but worth testing

### Option 5: **Hybrid Approach** (Best of Both)
- Use local model for clear-cut cases (high confidence)
- Send ambiguous cases (low confidence) to OpenAI
- Use local model distribution as prior, OpenAI as refinement

### Option 6: **Simplify Taxonomy** (Reduce Ambiguity)
- Consider merging expert/facilitator if they're too hard to distinguish
- Or add clearer criteria for when to use each
- Accept that some conversations genuinely have mixed roles

---

## 📊 Recommended Next Steps

### Immediate (30 minutes):
1. **Sample Review:** Pick 10 conversations that local model classified as `facilitator` but OpenAI would likely classify as `expert`
   - Read the actual conversations
   - Judge which classification seems more accurate
   - This gives you ground truth for at least a sample

2. **Check Temperature:** Verify what temperature the local model is using
   - Lower temperature = more deterministic
   - Might help if model is being too "creative"

### Short-term (2-3 hours):
3. **Re-classify Sample with Different Settings:**
   - Try lower temperature (0.1-0.2) for more consistent results
   - Try higher temperature (0.5-0.7) to see if diversity improves
   - Try without few-shot examples (zero-shot) to see if examples are causing bias

4. **Compare Same Conversations:**
   - Classify same 25 conversations with both models
   - See exact disagreements
   - Identify patterns in where they disagree

### Long-term (if worth continuing):
5. **Manual Annotation Study:**
   - Have 2-3 people manually classify 50 conversations
   - Compare human agreement vs model agreement
   - This gives you inter-annotator agreement baseline

6. **Fine-tune or Use Different Model:**
   - If local model proves unreliable, accept that cost savings aren't worth it
   - Or fine-tune on manually annotated data

---

## 🎯 Decision Framework

**If you need accuracy above all:**
- Use OpenAI (or larger local model)
- Accept higher cost

**If cost is primary concern:**
- Accept local model limitations
- Document uncertainty in classifications
- Use for exploratory analysis, not definitive research

**If you want best of both:**
- Hybrid approach: local for clear cases, OpenAI for ambiguous
- Or: local for first pass, human review for important conversations

---

## 🚫 When to Give Up

Consider stopping if:
- Manual review shows local model is wrong >40% of the time
- The discrepancy reflects genuine ambiguity that neither model handles well
- The research question doesn't actually require this level of classification precision
- You've spent more time fixing the classifier than you would have using OpenAI

---

## 💭 Philosophical Note

**The "dead end" might actually be a finding:**
- If expert vs facilitator is genuinely ambiguous in many conversations
- If human annotators would also disagree
- Then maybe the taxonomy needs refinement, not the models

This isn't a failure—it's discovering that the classification task is harder than expected.

---

## 📝 Next Action

**I recommend starting with Option 2 (Manual Review):**
1. Pick 20 conversations from your local model results
2. Read them and classify them yourself (expert vs facilitator)
3. Compare your judgments to what the models said
4. This will tell you definitively whether the local model is wrong, or if this is just inherent ambiguity

This takes ~1 hour but gives you the ground truth you need to decide next steps.

