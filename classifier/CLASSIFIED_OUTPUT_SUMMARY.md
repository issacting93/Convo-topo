# Classified Output Summary

**Date:** 2026-01-08  
**Total Conversations:** 345

---

## Overall Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ New Taxonomy (6 roles) | 193 | 55.9% |
| ⏳ Old Taxonomy | 151 | 43.8% |
| ❌ No Classification | 1 | 0.3% |

---

## New Taxonomy Analysis (193 conversations)

### Human Roles - Dominant Distribution

| Role | Count | Percentage |
|------|-------|------------|
| Information-Seeker | 191 | 99.0% |
| Social-Expressor | 2 | 1.0% |
| Co-Constructor | 0 | 0.0% |

**Finding:** Very high dominance of Information-Seeker role (99%).

### AI Roles - Dominant Distribution

| Role | Count | Percentage |
|------|-------|------------|
| Facilitator | 186 | 96.4% |
| Expert System | 7 | 3.6% |
| Relational Peer | 0 | 0.0% |

**Finding:** Very high dominance of Facilitator role (96.4%).

### Role Pairs

| Pair | Count | Percentage |
|------|-------|------------|
| Information-Seeker → Facilitator | 184 | 95.3% |
| Information-Seeker → Expert System | 7 | 3.6% |
| Social-Expressor → Facilitator | 2 | 1.0% |

**Finding:** Overwhelming dominance of Information-Seeker → Facilitator pattern (95.3%).

---

## Quality Metrics

### Ambiguity

- **Human Roles:** 4/193 (2.1%) ambiguous
- **AI Roles:** 0/193 (0.0%) ambiguous

**Target:** <30% ambiguous (human), <15% ambiguous (AI)  
**Status:** ✅ **Excellent** - Well below targets

### Confidence Scores

- **Human Roles:** 0.806 average confidence
- **AI Roles:** 0.804 average confidence

**Status:** ✅ **Good** - High confidence scores

---

## Key Findings

### 1. High Role Dominance

- **99% Information-Seeker** (human)
- **96.4% Facilitator** (AI)
- **95.3% Information-Seeker → Facilitator** (pair)

This suggests:
- Dataset is heavily biased toward Q&A interactions
- Very little role diversity in this sample
- May reflect Chatbot Arena dataset characteristics

### 2. Low Ambiguity

- Only 2.1% ambiguous human roles
- 0% ambiguous AI roles
- Well below targets (<30% and <15%)

**Interpretation:** The 6-role taxonomy is working well - classifications are clear and confident.

### 3. Missing Roles

- **Co-Constructor:** 0% (no collaborative interactions detected)
- **Relational Peer:** 0% (no relational AI interactions detected)
- **Social-Expressor:** 1.0% (very few expressive interactions)

**Interpretation:** Either:
- Dataset truly lacks these interaction types
- Classifier may be over-assigning Information-Seeker/Facilitator
- Need to validate with human review

---

## Recommendations

### 1. Validate Role Diversity

- Manually review a sample of conversations
- Check if Co-Constructor and Relational Peer roles are truly absent
- Verify if Information-Seeker is being over-assigned

### 2. Compare with OpenAI Classifications

- OpenAI showed more Expert System detection (36% vs 3.6%)
- May indicate local model is over-assigning Facilitator
- Consider re-classifying with OpenAI for comparison

### 3. Dataset Characteristics

- High Information-Seeker → Facilitator dominance may reflect:
  - Chatbot Arena dataset bias (Q&A focused)
  - Need for more diverse conversation sources
  - Or accurate reflection of actual usage patterns

---

## Next Steps

1. ✅ **Classification Complete:** 193/345 with new taxonomy (55.9%)
2. ⏳ **Remaining:** 152 conversations still using old taxonomy
3. 🔄 **Re-classify:** Consider re-classifying old taxonomy conversations
4. 📊 **Analysis:** Compare with OpenAI classifications for validation
5. ✅ **Validation:** Manual review of role diversity findings

---

**Last Updated:** 2026-01-08

