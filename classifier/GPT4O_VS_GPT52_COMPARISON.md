# GPT-4o vs GPT-5.2 Classification Comparison

**Date:** 2026-01-08  
**Dataset:** 50 WildChat conversations (identical set)  
**Taxonomy:** Social Role Theory (6+6 roles)  
**Agreement Rate:** 66% (33/50 conversations have same dominant AI role)

---

## Executive Summary

**Critical Finding:** GPT-5.2 produces dramatically different role classifications than GPT-4o, even with identical prompts, taxonomy, and conversations. This reveals that model version is a significant factor in classification outcomes.

### Key Differences

1. **Human Role Classification:** Massive shift
   - GPT-4o: 78% information-seeker, 8% director
   - GPT-5.2: 10% information-seeker, 48% director, 40% provider

2. **AI Role Classification:** Moderate shift
   - GPT-4o: 42% advisor, 40% expert-system, 8% co-constructor
   - GPT-5.2: 42% expert-system, 32% advisor, 26% co-constructor

3. **Agreement:** Only 66% of conversations get the same dominant AI role

---

## Detailed Comparison

### AI Role Distribution

| Role | GPT-4o | GPT-5.2 | Difference |
|------|--------|---------|------------|
| **advisor** | 21/50 (42.0%) | 16/50 (32.0%) | **-5** |
| **expert-system** | 20/50 (40.0%) | 21/50 (42.0%) | +1 |
| **co-constructor** | 4/50 (8.0%) | 13/50 (26.0%) | **+9** |
| **relational-peer** | 4/50 (8.0%) | 0/50 (0.0%) | -4 |
| **social-facilitator** | 1/50 (2.0%) | 0/50 (0.0%) | -1 |

**Key Observations:**
- GPT-5.2 classifies **3x more** conversations as `co-constructor` (26% vs 8%)
- GPT-5.2 classifies **fewer** as `advisor` (32% vs 42%)
- GPT-5.2 **eliminates** expressive roles (`relational-peer`, `social-facilitator`) entirely
- `expert-system` remains similar (~40-42%)

### Human Role Distribution

| Role | GPT-4o | GPT-5.2 | Difference |
|------|--------|---------|------------|
| **information-seeker** | 39/50 (78.0%) | 5/50 (10.0%) | **-34** |
| **director** | 4/50 (8.0%) | 24/50 (48.0%) | **+20** |
| **provider** | 0/50 (0.0%) | 20/50 (40.0%) | **+20** |
| **relational-peer** | 3/50 (6.0%) | 0/50 (0.0%) | -3 |
| **social-expressor** | 2/50 (4.0%) | 0/50 (0.0%) | -2 |
| **collaborator** | 2/50 (4.0%) | 1/50 (2.0%) | -1 |

**Key Observations:**
- **Massive shift:** GPT-5.2 sees 48% as `director` vs GPT-4o's 8%
- **Provider role emerges:** GPT-5.2 identifies 40% as `provider` (GPT-4o: 0%)
- **Information-seeker collapses:** From 78% to 10% (-68 percentage points!)
- **Expressive roles disappear:** GPT-5.2 assigns 0% to expressive roles

---

## Interpretation

### What This Means

1. **Model Version Matters Enormously**
   - Even within the same model family (GPT-4o → GPT-5.2), classifications differ dramatically
   - This is not just a "better/worse" issue—it's a fundamentally different interpretation

2. **GPT-5.2's Interpretation**
   - **More instrumental focus:** Eliminates expressive roles entirely
   - **More directive interpretation:** Sees humans as "directors" rather than "seekers"
   - **More collaborative AI:** 3x more `co-constructor` classifications
   - **Provider role recognition:** Identifies when humans provide information (40%)

3. **GPT-4o's Interpretation**
   - **More expressive recognition:** Identifies expressive roles (8% relational-peer, 2% social-facilitator)
   - **More information-seeking focus:** 78% see humans as information-seekers
   - **More advisory AI:** 42% advisor vs GPT-5.2's 32%

### Possible Explanations

1. **Training Data Differences**
   - GPT-5.2 may have been trained on different data that emphasizes different role patterns
   - May reflect evolving understanding of human-AI interaction

2. **Model Architecture Changes**
   - GPT-5.2 may have different reasoning patterns
   - May interpret "directive" vs "seeking" behavior differently

3. **Taxonomy Application**
   - Both models use the same taxonomy, but apply it differently
   - GPT-5.2 may have stricter criteria for certain roles
   - GPT-5.2 may interpret role boundaries differently

4. **Calibration Differences**
   - GPT-5.2 may be more confident in certain classifications
   - May have different thresholds for role assignment

---

## Research Implications

### ⚠️ Critical Methodological Considerations

1. **Model Version is a Major Variable**
   - Upgrading from GPT-4o to GPT-5.2 would produce completely different results
   - Cannot compare results across model versions without accounting for this
   - Must document exact model version in all research

2. **Reproducibility Concerns**
   - Results are not reproducible across model versions
   - Must freeze model version for consistency
   - Or explicitly study model version as a variable

3. **Which Model is "Correct"?**
   - Neither model is inherently "wrong"
   - They reveal different aspects of the same conversations
   - Need ground truth (manual review) to evaluate

4. **Taxonomy Robustness**
   - The taxonomy works with both models, but produces different distributions
   - This suggests the taxonomy is valid, but model interpretation varies
   - May need model-specific calibration

### ✅ Positive Implications

1. **Model Comparison as Research Tool**
   - Disagreement between models may indicate ambiguous cases
   - Agreement may indicate clear-cut classifications
   - Can use ensemble methods combining both models

2. **Different Perspectives**
   - GPT-4o: More expressive, information-seeking focus
   - GPT-5.2: More instrumental, directive focus
   - Both perspectives may be valid for different research questions

3. **Provider Role Discovery**
   - GPT-5.2 identifies "provider" role that GPT-4o missed
   - This may be a genuine pattern that GPT-4o overlooked
   - Worth investigating manually

---

## Recommendations

### For Your Research

1. **Choose One Model Version**
   - Stick with GPT-4o for consistency with previous work
   - Or commit to GPT-5.2 for new analyses
   - Don't mix model versions in same analysis

2. **Document Model Version**
   - Always specify exact model version in methods
   - Include model version in metadata
   - Note model version limitations in discussion

3. **Cross-Validate with Manual Review**
   - Use manual review to evaluate which model is more accurate
   - Or accept that both models reveal different valid patterns
   - Consider both perspectives in interpretation

4. **Study Model Disagreement**
   - Conversations where models disagree may be most interesting
   - These may be ambiguous cases worth deeper analysis
   - Could reveal taxonomy edge cases

### For Future Work

1. **Model Version Comparison Study**
   - Systematically compare GPT-4o, GPT-4o-mini, GPT-5.2 on same dataset
   - Identify model-specific biases
   - Create model selection guidelines

2. **Ensemble Methods**
   - Combine predictions from multiple models
   - Use disagreement as uncertainty signal
   - Weight models by agreement with ground truth

3. **Calibration Analysis**
   - Compare confidence scores across models
   - Identify which models are better calibrated
   - Use calibration to weight model outputs

---

## Conclusion

**The finding that GPT-4o and GPT-5.2 produce dramatically different classifications is a major methodological discovery.** It reveals that:

1. Model version is a critical variable in LLM-based classification
2. Different models reveal different aspects of the same data
3. Model choice shapes research findings significantly
4. This must be explicitly addressed in methodology

This finding should be:
- Documented in your research methodology
- Discussed as a limitation (or feature) of LLM-based classification
- Used to inform model selection decisions
- Considered when comparing results across studies

---

## Data Files

- **Input:** `wildchat-50-sample.json` (50 conversations)
- **GPT-4o Results:** `wildchat-50-results.json`
- **GPT-5.2 Results:** `wildchat-50-results-gpt5.2.json`

Both results files contain identical conversations classified with the same taxonomy but different models.

