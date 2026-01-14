# Classification Analysis Summary

**Date:** 2026-01-07  
**Total Conversations:** 165 unique (from 175 total, 10 duplicates removed)  
**Model:** qwen2.5:7b (Ollama)  
**Success Rate:** 100% (165/165)

---

## 🎯 Key Findings

### ✅ Overall Quality: **Good**

**Strengths:**
- 100% success rate - all conversations classified
- Average confidence: 0.72 (moderate-high)
- Only 0.3% of classifications have low confidence (<0.6)
- Clear patterns reflecting conversational dataset

**Issues Found:**
1. **Typo in conv-115:** `aiiRole` instead of `aiRole` (but data is present)
2. **Missing category in conv-110:** interactionPattern.category = None
3. **10 duplicate conversations** (same IDs in multiple batches)
4. **59 unclear human roles** (max probability <0.5) - may be expected for probabilistic output

---

## 📊 Dataset Characteristics

This dataset (Cornell Movie Dialogues + Kaggle Empathetic Dialogues) is **significantly more relational** than Chatbot Arena:

| Metric | This Dataset | Chatbot Arena | Difference |
|--------|-------------|---------------|------------|
| **Purpose: Relationship-building** | 63.4% | ~10% | ↑ 53% |
| **Purpose: Information-seeking** | 25.6% | 79.3% | ↓ 54% |
| **AI Role: Facilitator** | 58.1% | 41.0% | ↑ 17% |
| **AI Role: Expert** | 10.5% | 34.0% | ↓ 24% |
| **Human Role: Seeker** | 51.7% | 73.5% | ↓ 22% |
| **Pattern: Casual-chat** | 96.9% | ~10% | ↑ 87% |

**Key Insight:** The dataset source (movie dialogues + empathetic dialogues) creates a more conversational, relationship-focused pattern than evaluation/test contexts (Chatbot Arena).

---

## 📈 Role Patterns

### Most Common Role Pair
**Seeker → Facilitator:** 84 conversations (50.9%)

### Top 5 Role Pairs
1. Seeker → Facilitator: 84 (50.9%)
2. Collaborator → Facilitator: 22 (13.3%)
3. Seeker → Peer: 16 (9.7%)
4. Sharer → Facilitator: 9 (5.5%)
5. Seeker → Expert: 7 (4.2%)

**Finding:** 64% of conversations involve Facilitator as AI role, consistent with relationship-building purpose (63.4%).

---

## 🎯 Confidence Scores

**Overall Average:** 0.72

**Distribution:**
- Low (<0.6): 0.3% (4 classifications)
- Medium (0.6-0.8): 60.9% (804 classifications)
- High (≥0.8): 38.8% (512 classifications)

**By Dimension (Highest to Lowest):**
1. Interaction Pattern: 0.81 ⭐
2. Engagement Style: 0.79
3. Conversation Purpose: 0.79
4. Power Dynamics: 0.71
5. Knowledge Exchange: 0.70
6. Turn Taking: 0.70
7. Emotional Tone: 0.61 ⚠️
8. Topic Depth: 0.60 ⚠️

*Emotional tone and topic depth show lower confidence - likely because conversations are brief/surface-level*

---

## ⚠️ Issues to Fix

### 1. conv-115: Typo in AI Role Key
- **Issue:** Classification has `aiiRole` instead of `aiRole`
- **Data exists:** The role distribution is present but under wrong key
- **Fix:** Rename `aiiRole` → `aiRole` in classification
- **Status:** Easy fix - just rename key

### 2. conv-110: Missing Interaction Pattern Category
- **Issue:** `interactionPattern.category = None`
- **Has alternative:** Suggests `question-answer` as alternative
- **Fix:** Re-classify or use alternative category
- **Status:** Needs re-classification

### 3. Duplicate Conversations
- **Issue:** 10 conversations (kaggle-emo-0 through kaggle-emo-9) appear in multiple batches
- **Fix:** Remove duplicates, keep last occurrence
- **Status:** Already handled in analysis (165 unique)

### 4. Unclear Role Distributions
- **Issue:** 59 human roles and 26 AI roles have max probability <0.5
- **Interpretation:** This may be expected - model is spreading probability across multiple plausible roles rather than being overly confident
- **Recommendation:** Review sample to see if spread is appropriate
- **Status:** May not be an issue

---

## 📁 Output Files

**Location:** `/Users/zac/Downloads/Cartography/classifier/`

| File | Conversations | Size | Status |
|------|--------------|------|--------|
| `output-classified.json` | 30 | 138 KB | ✅ Complete |
| `test-output-20.json` | 20 | 109 KB | ✅ Complete |
| `output-remaining.json` | 125 | 673 KB | ✅ Complete |
| **TOTAL** | **175** | **920 KB** | |
| **UNIQUE** | **165** | | **10 duplicates** |

---

## 🔧 Recommended Fixes

### Immediate (5 minutes)
1. Fix conv-115: Rename `aiiRole` → `aiRole`
2. Fix conv-110: Re-classify or use alternative category

### Short-term (30 minutes)
1. Remove duplicates and create clean merged file
2. Review sample of unclear role distributions
3. Validate all role distributions sum to 1.0

### Long-term (optional)
1. Add more few-shot examples for emotional tone
2. Compare with GPT-4o-mini results
3. Generate PAD scores for new conversations

---

## 💡 Key Insights

1. **Dataset source matters:** Movie dialogues + empathetic dialogues create more relational, conversational patterns than evaluation contexts
2. **Facilitator role prominent:** 58% of conversations use Facilitator, consistent with relationship-building purpose
3. **Model performs well:** 100% success rate, good confidence scores, appropriate classifications
4. **Few-shot learning works:** Consistent structured output, appropriate role distributions

---

## 📊 Full Analysis Report

See `COMPLETE_ANALYSIS_REPORT.md` for detailed analysis including:
- Dimension-by-dimension breakdowns
- Role distribution details
- Confidence analysis by dimension
- Quality checks
- Comparison with previous dataset
- Sample classifications

---

**Status:** ✅ **Ready for use after fixing 2 minor issues** (conv-115 typo, conv-110 missing category)

