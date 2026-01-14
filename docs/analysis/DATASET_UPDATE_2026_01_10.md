# Dataset Update: Re-classification Complete

**Date:** 2026-01-10  
**Status:** ✅ Re-classification complete

---

## Summary

Successfully re-classified 345 conversations with the new taxonomy (GPT-5.2 + 2.0-social-role-theory), expanding the new taxonomy dataset from 199 to 538 conversations.

---

## Current Dataset Status

### Total Classified: 569 conversations

**Breakdown by Source:**
- **Chatbot Arena:** 333 conversations (58.5%)
- **WildChat:** 186 conversations (32.7%)
- **OASST:** 32 conversations (5.6%)
- **Cornell Movie Dialogues:** 9 conversations (1.6%) - human-human
- **Kaggle Empathetic Dialogues:** 9 conversations (1.6%) - human-human

### New Taxonomy Coverage: 538 conversations (94.6%)

**By Source:**
- **Chatbot Arena:** 322 with new taxonomy (96.7% of Chatbot Arena)
- **WildChat:** 184 with new taxonomy (98.9% of WildChat)
- **OASST:** 32 with new taxonomy (100% of OASST)

**Remaining:**
- 24 conversations with old taxonomies
- 7 conversations without classification

---

## Updated Role Distribution (New Taxonomy - 538 conversations)

### Human Roles (Dominant)

| Role | Count | Percentage |
|------|-------|------------|
| **Provider** | 248 | **46.1%** |
| Director | 155 | 28.8% |
| Information-Seeker | 127 | 23.6% |
| Social-Expressor | 8 | 1.5% |

### AI Roles (Dominant)

| Role | Count | Percentage |
|------|-------|------------|
| **Expert-System** | 361 | **67.1%** |
| Advisor | 107 | 19.9% |
| Co-Constructor | 36 | 6.7% |
| Social-Facilitator | 15 | 2.8% |
| Relational-Peer | 15 | 2.8% |
| Learning-Facilitator | 4 | 0.7% |

### Top Role Pairs

| Pair | Count | Percentage |
|------|-------|------------|
| **Provider→Expert-System** | 185 | **34.4%** |
| Information-Seeker→Expert-System | 114 | 21.2% |
| Director→Expert-System | 62 | 11.5% |
| Provider→Advisor | 54 | 10.0% |
| Director→Advisor | 39 | 7.2% |
| Director→Co-Constructor | 35 | 6.5% |

---

## Key Findings (Still Valid)

**Note:** The following findings are based on the **345 validated corpus** used for cluster analysis:

- ✅ **82.7% trajectory feature importance** - Trajectory features drive cluster separation
- ✅ **7 relational positioning patterns** - Identified through clustering
- ✅ **Variance ratios up to 82x** - Maximum variance difference between conversations
- ✅ **41x variance** - Specific pair (chatbot_arena_22853 vs chatbot_arena_30957)

These findings remain valid as they are based on the validated corpus subset.

---

## Changes from Previous Analysis

### Previous (199 conversations with new taxonomy):
- Provider: 55.8% (111 conversations)
- Expert-System: 72.4% (144 conversations)
- Provider→Expert-System: 42.7% (85 conversations)

### Current (538 conversations with new taxonomy):
- Provider: 46.1% (248 conversations) - **decreased** (more diverse)
- Expert-System: 67.1% (361 conversations) - **decreased** (more diverse)
- Provider→Expert-System: 34.4% (185 conversations) - **decreased** (more diverse)

**Key Insight:** The expanded dataset shows more diversity in role distributions, with Provider and Expert-System still dominant but less so than in the initial 199 conversations.

---

## Next Steps

1. ✅ **Manifest updated** - All 569 conversations now in manifest
2. ✅ **Analysis updated** - New taxonomy analysis complete
3. ⏳ **Visualizations** - Should automatically reflect new data via manifest
4. ⏳ **Documentation** - Key documents updated with new numbers

---

## Files Updated

- `reports/new-taxonomy-analysis.json` - Complete analysis of 538 conversations
- `public/output/manifest.json` - Updated with all 569 conversations
- `docs/analysis/UPDATE_STATUS.md` - Updated dataset numbers
- `docs/analysis/README.md` - Updated dataset status
- `docs/DATA_GUIDE.md` - Updated dataset numbers
- `docs/DIS_SUBMISSION_REPORT.md` - Updated dataset status

---

**Status:** ✅ Dataset re-classification complete and documentation updated

