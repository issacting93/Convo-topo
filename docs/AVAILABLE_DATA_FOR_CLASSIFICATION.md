# Available Data for Classification

**Last Updated:** January 2026

## Summary

**Total Available:** 2,197 raw conversations  
**Already Classified:** 345 conversations (15.7%)  
**Unclassified:** **2,076 conversations (84.3%)** available for classification

---

## Currently Classified (345 conversations)

### Breakdown:
- **Chatbot Arena/OASST:** 160 conversations
- **WildChat:** 185 conversations (371 valid files loaded, 345 in validated corpus)

**Status:** ✅ 100% classified with GPT-5.2, Social Role Theory taxonomy

---

## Available for Classification (2,076 conversations)

### 1. Additional Chatbot Arena Conversations ⭐ **HIGH PRIORITY**

**Count:** ~2,000+ additional Chatbot Arena conversations  
**Source:** LMSYS Chatbot Arena dataset  
**Characteristics:**
- Same evaluation context as existing classified data
- Diverse interaction patterns (technical, casual, advisory)
- 10-18 messages per conversation typically
- Will help expand the evaluation context dataset

**Example IDs:**
- `chatbot_arena_1781`
- `chatbot_arena_1971`
- `chatbot_arena_09675`
- `chatbot_arena_23032`
- `chatbot_arena_31331`
- And 2,000+ more...

**Why Classify:**
- Expand evaluation context dataset
- More data for cluster analysis
- Better coverage of Chatbot Arena patterns
- Increase dataset size from 345 to 2,400+

---

### 2. Cornell Movie Dialogues (10 conversations) ⭐ **MEDIUM PRIORITY**

**Files:** `cornell-0.json` through `cornell-9.json`  
**Source:** Cornell Movie-Dialogs Corpus  
**Characteristics:**
- Human-human dialogue (not human-AI)
- Movie script conversations
- May require adaptation of classification approach
- Different relational dynamics (human-human vs. human-AI)

**Why Classify:**
- Test if framework applies to human-human conversation
- Interesting comparison: human-human vs. human-AI relational positioning
- Could reveal domain-general vs. domain-specific patterns

**Consideration:** These are human-human conversations, not human-AI. The Social Role Theory taxonomy may need adaptation, or these could serve as a control/comparison dataset.

---

### 3. Kaggle Empathetic Dialogues (10 conversations) ⭐ **MEDIUM PRIORITY**

**Files:** `kaggle-emo-0.json` through `kaggle-emo-9.json`  
**Source:** Kaggle Empathetic Dialogues dataset  
**Characteristics:**
- Human-human empathetic conversations
- Focus on emotional support and empathy
- Different interaction style than Chatbot Arena
- May show more expressive role patterns

**Why Classify:**
- Test framework on empathetic/emotional conversations
- Compare to task-oriented Chatbot Arena data
- Could reveal if expressive roles appear more in empathetic contexts
- Human-human data for comparison

**Consideration:** Also human-human conversations. May need separate analysis or adaptation.

---

### 4. Additional WildChat Conversations ⭐ **HIGH PRIORITY**

**Potential:** Download more from WildChat-1M dataset (838k total conversations available)  
**Current:** 185 classified (of 589 downloaded, 402 corrupted)  
**Source:** [allenai/WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)

**Characteristics:**
- Organic ChatGPT conversations
- Real-world usage (not evaluation context)
- More diverse patterns than Chatbot Arena
- Already showing different role distributions (more director, less expressive roles)

**Why Download & Classify More:**
- Expand organic usage dataset
- Address dataset bias (currently 160 evaluation vs. 185 organic)
- More diverse interaction patterns
- Better balance for cross-dataset validation

**How to Download:**
- See `docs/guides/WILDCHAT_INTEGRATION.md`
- Use WildChat dataset download scripts
- Filter for valid JSON before classification

---

## Potential New Data Sources

### 5. ShareGPT Dataset ⭐ **MEDIUM PRIORITY**

**Source:** ShareGPT dataset (multiple variants available)  
**Script:** `data/download-conversation-datasets.py` (has `download_sharegpt()` function)  
**Variants:**
- `anon8231489123/ShareGPT_Vicuna_unfiltered`
- `RyokoAI/ShareGPT52K`
- `liuhaotian/ShareGPT4V`

**Characteristics:**
- Real human-AI dialogues shared by users
- Diverse topics and interaction styles
- Organic usage (similar to WildChat)

**Status:** Script exists but not yet downloaded

---

### 6. OpenAssistant Dataset (More Conversations) ⭐ **LOW PRIORITY**

**Current:** Only 2 conversations classified  
**Potential:** Download more from OpenAssistant dataset  
**Source:** OpenAssistant Conversations Dataset

**Characteristics:**
- Longer conversations (20+ messages typically)
- Extended interaction patterns
- Good for testing pattern visibility in long conversations

**Why More:**
- Currently only 2 conversations (not enough for analysis)
- Longer conversations may reveal different trajectory patterns
- Test if findings hold for extended interactions

---

## Recommendations for Classification Priority

### High Priority (Immediate Value)

1. **Additional Chatbot Arena Conversations** (~2,000 available)
   - Same context as existing classified data
   - Will significantly expand dataset (345 → 2,400+)
   - Immediate value for cluster analysis and validation
   - **Estimated time:** Moderate (GPT-5.2 API costs)

2. **More WildChat Conversations** (download 200-500 more)
   - Balance evaluation vs. organic contexts
   - Already showing different patterns
   - **Estimated time:** Download + classification

### Medium Priority (Research Value)

3. **Cornell Movie Dialogues** (10 conversations)
   - Test framework on human-human conversation
   - Interesting comparison dataset
   - **Estimated time:** Low (only 10 conversations)

4. **Kaggle Empathetic Dialogues** (10 conversations)
   - Test on empathetic/emotional conversations
   - Compare to task-oriented data
   - **Estimated time:** Low (only 10 conversations)

5. **ShareGPT Dataset** (download 100-200 conversations)
   - Real human-AI dialogues
   - Organic usage patterns
   - **Estimated time:** Download + classification

### Low Priority (Future Work)

6. **More OpenAssistant** (if needed for longer conversations)
7. **Other datasets** (as discovered/needed)

---

## Classification Process

### Using Existing Classifier

1. **Check unclassified conversations:**
   ```bash
   cd classifier
   ./classify.sh  # Automatically finds and classifies unclassified conversations
   ```

2. **Classify specific conversations:**
   ```bash
   python3 classifier-openai-social-role-theory.py conversations-raw/chatbot_arena_1781.json
   ```

3. **Batch classification:**
   - Scripts will automatically process all unclassified conversations
   - Progress saved incrementally
   - Failed classifications can be retried

### Costs

- **GPT-5.2 API:** ~$0.01-0.05 per conversation (estimated)
- **2,000 conversations:** ~$20-100 total
- **Consider:** Start with subset (e.g., 500) to validate before full classification

---

## Current Dataset Statistics

- **Classified:** 345 conversations
  - Chatbot Arena/OASST: 160 (46%)
  - WildChat: 185 (54%)
  
- **Available:** 2,076 unclassified
  - Chatbot Arena: ~2,000
  - Cornell: 10
  - Kaggle Empathetic: 10
  - Others: 56+

**Total Potential:** 2,421+ conversations (7x current dataset)

---

## Next Steps

1. **Decide priority:** Which datasets to classify first?
2. **Budget consideration:** GPT-5.2 API costs for 2,000+ conversations
3. **Start small:** Classify 200-500 additional Chatbot Arena conversations first
4. **Validate:** Ensure quality before full classification
5. **Iterate:** Expand based on findings

See `docs/guides/CLASSIFICATION_AND_PAD_GUIDE.md` for detailed classification instructions.

