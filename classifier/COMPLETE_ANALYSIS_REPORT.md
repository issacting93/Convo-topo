# Complete Classification Analysis Report

**Date:** 2026-01-07  
**Model:** qwen2.5:7b (Ollama)  
**Method:** Few-shot learning with 5 examples  
**Total Conversations:** 165 unique (after removing 10 duplicates)

---

## Executive Summary

✅ **Overall Quality: Good**
- 100% success rate (165/165 conversations classified)
- Average confidence: 0.72 (moderate-high)
- Only 0.3% of classifications have low confidence (<0.6)
- 1 validation issue found (needs fixing)

⚠️ **Issues Found:**
- 10 duplicate conversations (same IDs in multiple batches)
- 1 role distribution error (conv-115: AI role sum = 0.000)
- 59 unclear human roles (max probability <0.5)
- 26 unclear AI roles (max probability <0.5)

---

## Dataset Overview

| Batch | Conversations | Status |
|-------|--------------|--------|
| Original (30) | 30 | ✅ Complete |
| Test Batch (20) | 20 | ✅ Complete |
| Remaining (125) | 125 | ✅ Complete |
| **TOTAL** | **175** | |
| **UNIQUE** | **165** | **10 duplicates removed** |

**Duplicate IDs:** kaggle-emo-0 through kaggle-emo-9 (same conversations classified in original and test batches)

---

## Dimension Distributions (1-8)

### 1. Interaction Pattern
- **Casual-chat:** 158 (96.9%) - **Dominant**
- **Question-answer:** 5 (3.1%)

*Note: This dataset appears to be primarily casual/social interactions (Cornell Movie Dialogues + Kaggle Empathetic Dialogues)*

### 2. Power Dynamics
- **Balanced:** 155 (94.5%) - **Dominant**
- **Human-led:** 9 (5.5%)

*No AI-dominant conversations found*

### 3. Emotional Tone
- **Neutral:** 137 (83.5%) - **Dominant**
- **Playful:** 25 (15.2%)
- **Empathetic:** 2 (1.2%)

*Predominantly neutral tone, as expected for casual interactions*

### 4. Engagement Style
- **Reactive:** 140 (85.4%) - **Dominant**
- **Questioning:** 15 (9.1%)
- **Casual-chat:** 8 (4.9%)
- **Exploring:** 1 (0.6%)

### 5. Knowledge Exchange
- **Personal-sharing:** 144 (87.8%) - **Dominant**
- **Factual-info:** 20 (12.2%)

*This is interesting - the dataset shows more personal-sharing than factual-info, which differs from Chatbot Arena data*

### 6. Conversation Purpose
- **Relationship-building:** 104 (63.4%) - **Dominant**
- **Information-seeking:** 42 (25.6%)
- **Self-expression:** 17 (10.4%)
- **Emotional-processing:** 1 (0.6%)

*This is a key finding - 63.4% relationship-building vs. 79.3% information-seeking in Chatbot Arena. This dataset shows more social/relational focus.*

### 7. Topic Depth
- **Surface:** 159 (97.0%) - **Dominant**
- **Moderate:** 5 (3.0%)

*Very shallow conversations (likely due to dataset source - movie dialogues are typically brief)*

### 8. Turn Taking
- **Balanced:** 163 (99.4%) - **Dominant**
- **User-dominant:** 1 (0.6%)

---

## Role Distributions (9-10)

### Human Roles (Average Probabilities)

| Role | Average | Note |
|------|---------|------|
| **Seeker** | 0.517 (51.7%) | **Dominant** |
| Learner | 0.170 (17.0%) | |
| Sharer | 0.120 (12.0%) | |
| Collaborator | 0.102 (10.2%) | |
| Director | 0.083 (8.3%) | |
| Artist | 0.004 (0.4%) | |
| Tester | 0.004 (0.4%) | |
| Others | <0.1% | |

*Seeker is still dominant but less so than in Chatbot Arena (73.5% vs. 51.7%)*

### AI Roles (Average Probabilities)

| Role | Average | Note |
|------|---------|------|
| **Facilitator** | 0.581 (58.1%) | **Dominant** |
| Expert | 0.105 (10.5%) | |
| Peer | 0.092 (9.2%) | |
| Affiliative | 0.063 (6.3%) | |
| Advisor | 0.059 (5.9%) | |
| Reflector | 0.057 (5.7%) | |
| Unable-to-engage | 0.015 (1.5%) | |
| Others | <1% | |

*Facilitator is highly dominant (58.1%), more than in previous dataset (41%)*

---

## Dominant Role Pairs

| Human → AI Role | Count | Percentage |
|----------------|-------|------------|
| **Seeker → Facilitator** | 84 | 50.9% - **Most Common** |
| Collaborator → Facilitator | 22 | 13.3% |
| Seeker → Peer | 16 | 9.7% |
| Sharer → Facilitator | 9 | 5.5% |
| Seeker → Expert | 7 | 4.2% |
| Seeker → Affiliative | 6 | 3.6% |
| Collaborator → Peer | 5 | 3.0% |
| Others | 16 | 9.7% |

**Key Insight:** 
- 50.9% follow Seeker→Facilitator pattern
- 64.2% involve Facilitator as AI role (84 + 22 + 9 + 1)
- Much higher Facilitator usage than previous dataset (41% vs. 58%)

---

## Confidence Analysis

### Overall Statistics
- **Average confidence:** 0.72 (moderate-high)
- **Min confidence:** 0.50
- **Max confidence:** 0.90

### Distribution
- **Low (<0.6):** 4 (0.3%)
- **Medium (0.6-0.8):** 804 (60.9%)
- **High (≥0.8):** 512 (38.8%)

### By Dimension
| Dimension | Avg Confidence | Note |
|-----------|---------------|------|
| Interaction Pattern | 0.81 | Highest confidence |
| Engagement Style | 0.79 | |
| Conversation Purpose | 0.79 | |
| Power Dynamics | 0.71 | |
| Knowledge Exchange | 0.70 | |
| Turn Taking | 0.70 | |
| Emotional Tone | 0.61 | Lower confidence |
| Topic Depth | 0.60 | Lower confidence |

*Emotional tone and topic depth show lower confidence, possibly because these conversations are brief and surface-level*

---

## Validation & Quality Checks

### ✅ Passed Checks
- **100% success rate** (all conversations have classifications)
- **99.9% role distributions sum to 1.0** (1 error found)
- **0 items with very low confidence** (<0.5)

### ⚠️ Issues Found

1. **Role Distribution Error (1 conversation)**
   - `conv-115`: AI role distribution sum = 0.000
   - *Recommendation: Re-classify this conversation*

2. **Unclear Role Distributions**
   - **Human roles:** 59/165 (35.8%) have max probability <0.5
   - **AI roles:** 26/165 (15.8%) have max probability <0.5
   - *This is actually expected for probabilistic distributions - the model is spreading probability across multiple roles rather than being overly confident*

3. **Duplicate Conversations (10)**
   - Same conversations (kaggle-emo-0 through kaggle-emo-9) classified in both original and test batches
   - *Recommendation: Remove duplicates, keep last occurrence*

---

## Comparison with Previous Dataset (Chatbot Arena)

### Key Differences

| Metric | Chatbot Arena (345) | This Dataset (165) | Difference |
|--------|-------------------|-------------------|------------|
| **Human Role: Seeker** | 73.5% | 51.7% | ↓ 21.8% |
| **AI Role: Expert** | 34.0% | 10.5% | ↓ 23.5% |
| **AI Role: Facilitator** | 41.0% | 58.1% | ↑ 17.1% |
| **Purpose: Info-seeking** | 79.3% | 25.6% | ↓ 53.7% |
| **Purpose: Relationship** | N/A | 63.4% | ↑ New |
| **Pattern: Casual-chat** | ~10% | 96.9% | ↑ 86.9% |
| **Pattern: Q&A** | ~70% | 3.1% | ↓ 66.9% |

**Key Findings:**
1. **This dataset is more relational** - 63.4% relationship-building vs. 25.6% information-seeking
2. **More Facilitator usage** - 58.1% vs. 41% (consistent with relationship-building)
3. **Less Expert usage** - 10.5% vs. 34% (consistent with less information-seeking)
4. **More role diversity** - Seeker only 51.7% vs. 73.5%
5. **Dataset source matters** - Cornell/Kaggle data is more conversational, less task-oriented

---

## Model Performance

### Strengths
1. ✅ **High success rate** (100%)
2. ✅ **Good confidence scores** (avg 0.72)
3. ✅ **Structured output** (consistent JSON format)
4. ✅ **Few-shot examples working** (consistent classifications)
5. ✅ **Fast processing** (~31 seconds per conversation)

### Weaknesses
1. ⚠️ **Unclear role distributions** (many spread across multiple roles)
2. ⚠️ **Lower confidence on some dimensions** (emotional tone, topic depth)
3. ⚠️ **1 validation error** (conv-115 needs fixing)

### Recommendations
1. **Fix conv-115** - Re-classify to fix AI role distribution error
2. **Remove duplicates** - Keep only unique conversations
3. **Review unclear roles** - Check if spread is appropriate or indicates uncertainty
4. **Add more few-shot examples** - Especially for emotional tone and topic depth

---

## Sample Classifications

### Example 1: High Confidence
**ID:** cornell-0  
**Pattern:** casual-chat  
**Purpose:** information-seeking  
**Human Role:** seeker (0.70)  
**AI Role:** advisor (0.80)  
**Quality:** ✅ Good - clear roles, high confidence

### Example 2: Relational Focus
**ID:** cornell-1  
**Pattern:** casual-chat  
**Purpose:** self-expression  
**Tone:** playful  
**Human Role:** seeker (0.50)  
**AI Role:** affiliative (0.80)  
**Quality:** ✅ Good - appropriate for relational conversation

### Example 3: Problematic
**ID:** conv-115  
**Issue:** AI role distribution sum = 0.000  
**Quality:** ⚠️ Needs re-classification

---

## Next Steps

### Immediate Actions
1. ✅ **Fix conv-115** - Re-classify to correct AI role distribution
2. ✅ **Remove duplicates** - Create clean merged dataset
3. ✅ **Review unclear roles** - Check if spread is appropriate

### Short-term Improvements
1. Add more few-shot examples for emotional tone
2. Test with additional conversation types
3. Compare with GPT-4o-mini results for validation

### Long-term Analysis
1. Merge with Chatbot Arena dataset (if needed)
2. Generate PAD scores for new conversations
3. Re-run clustering with expanded dataset
4. Compare cluster structures between datasets

---

## Conclusion

The qwen2.5:7b model with few-shot learning produces **good quality classifications** with:
- ✅ 100% success rate
- ✅ Moderate-high confidence (avg 0.72)
- ✅ Appropriate role distributions for dataset type
- ✅ Clear patterns reflecting conversational vs. task-oriented data

**Main Findings:**
- This dataset shows more relational/social focus than Chatbot Arena
- Facilitator role is highly prominent (58.1%)
- Role distributions are more diverse than previous dataset
- Dataset source (Cornell/Kaggle) shapes the patterns significantly

**Overall Assessment:** ✅ **Ready for use after fixing 1 validation error and removing duplicates**

---

## Files

- **Analysis Script:** `analyze-all-classifications.py`
- **Output Files:**
  - `output-classified.json` (30 conversations)
  - `test-output-20.json` (20 conversations)
  - `output-remaining.json` (125 conversations)
- **Report:** `COMPLETE_ANALYSIS_REPORT.md` (this file)

