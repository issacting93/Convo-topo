# Manual Review Guidance

**Review File:** `manual-review-sample.json`  
**Total Conversations:** 11  
**All classified as:** `facilitator` by local model

---

## ⚠️ Important Issues in This Sample

**Many conversations have empty or missing assistant responses:**
- `kaggle-emo-0`: Assistant response is empty string
- `kaggle-emo-1`: Assistant response is empty string  
- `kaggle-emo-2`: Assistant response is empty string
- `kaggle-emo-3`: Assistant response is empty string
- `kaggle-emo-5`: Assistant response is empty string
- `kaggle-emo-9`: Assistant response is empty string

**These cannot be properly reviewed** - you need to see what the AI actually said to judge its role.

---

## ✅ Conversations That Can Be Reviewed

### Reviewable (have AI responses):

1. **cornell-6** (sequence 1)
   - Human: "How is our little Find the Wench A Date plan progressing?"
   - AI: "Well, there's someone I think might be --"
   - **Analysis:** Incomplete response, hard to judge. Appears conversational/peer-like rather than expert or facilitator.

2. **cornell-8** (sequence 2)
   - Human: "You got something on your mind?"
   - AI: "I counted on you to help my cause. You and that thug are obviously failing. Aren't we ever going on our date?"
   - **Analysis:** This is roleplay/relationship talk, not information-seeking. Neither expert nor facilitator really fits - this is more like **peer/affiliative**.

3. **cornell-9** (sequence 3)
   - Human: "You have my word. As a gentleman"
   - AI: "You're sweet."
   - **Analysis:** Very brief, relationship-building. Not really expert or facilitator - more **affiliative/peer**.

4. **cornell-3** (sequence 9)
   - Human: "Why?"
   - AI: "Unsolved mystery. She used to be really popular when she started high school, then it was just like she got sick of it or something."
   - Human: "That's a shame."
   - **Analysis:** AI provides direct information/explanation. This looks more like **expert** (providing factual answer) than facilitator (which would ask questions).

5. **cornell-7** (sequence 10)
   - Human: "There."
   - AI: "Where?"
   - **Analysis:** AI asks a clarifying question. This could be **facilitator** (guiding) but it's so brief it's hard to tell.

---

## ❌ Cannot Review (empty AI responses):

- `kaggle-emo-0`: Empty assistant response
- `kaggle-emo-1`: Empty assistant response
- `kaggle-emo-2`: Empty assistant response  
- `kaggle-emo-3`: Empty assistant response
- `kaggle-emo-5`: Empty assistant response
- `kaggle-emo-9`: Empty assistant response

**These should be marked as "unable to review" or "data quality issue".**

---

## 📝 Review Instructions

For each **reviewable** conversation:

1. **Read the conversation** - focus on what the AI actually says
2. **Judge the AI's role:**
   - **Expert:** Provides direct answers, explanations, facts
   - **Facilitator:** Asks questions, guides discovery, scaffolds learning
   - **Neither:** Peer/affiliative/other roles
3. **Fill in the manualReview section:**
   ```json
   "manualReview": {
       "shouldBeExpert": true/false/null,
       "shouldBeFacilitator": true/false/null,
       "correctClassification": "expert" or "facilitator" or "affiliative" or "mixed" or "unclear",
       "notes": "Brief explanation of your judgment",
       "reviewed": true
   }
   ```

---

## 🎯 Quick Assessment of Reviewable Ones

**cornell-3** (sequence 9): 
- **Model says:** facilitator
- **Likely correct:** **expert** (provides direct information/explanation)
- **This is probably a misclassification**

**cornell-7** (sequence 10):
- **Model says:** facilitator  
- **Likely correct:** **facilitator** (asks clarifying question)
- **This might be correct**

**cornell-8, cornell-9, cornell-6**:
- **Model says:** facilitator
- **Likely correct:** **affiliative/peer** (relationship-focused, not task-oriented)
- **These don't fit expert/facilitator well** - suggests taxonomy might need expansion

---

## 💡 Recommendation

**This sample has a data quality issue** - 6 out of 11 conversations have empty assistant responses.

**Suggested actions:**

1. **Get a better sample:**
   ```bash
   # Sample from the larger output file that likely has complete conversations
   python3 sample-for-review.py output-remaining.json better-sample.json \
       --focus-on facilitator --sample-size 20
   ```

2. **Or review what you can:**
   - Review the 5 conversations with actual AI responses
   - Mark the 6 with empty responses as "unable to review"
   - Note this as a data quality issue

3. **Check the source files:**
   - These might be from a dataset where responses were truncated
   - You might need to go back to original sources to get full conversations

---

## 🚀 Next Steps

**Option A: Review what you have (5 conversations, ~15 minutes)**
- Review the 5 conversations with AI responses
- See if there's a clear pattern (are they misclassified?)
- Then decide if you need a better sample

**Option B: Get a better sample (recommended)**
- Use `output-remaining.json` or find conversations with complete responses
- Sample 20 complete conversations
- Then do full review

**Option C: Check original data**
- These seem to be from Cornell Movie Dialogues or Kaggle Empathetic Dialogues
- Check if original data has full responses
- If truncated, might need different dataset

---

## 📊 Quick Pattern I Notice

**From the 5 reviewable conversations:**
- Most are very short (1-3 messages)
- Most are relationship-focused (dating, friendship, personal)
- Few are actually information-seeking where expert/facilitator distinction matters

**This suggests:**
- The sample might be biased toward casual/relational conversations
- Expert/facilitator distinction might not apply well to these types
- You might need a sample with more task-oriented conversations

