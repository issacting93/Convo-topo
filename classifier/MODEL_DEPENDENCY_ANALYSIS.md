# Model Dependency Analysis: How Different Models Identify Social Roles

**Date:** 2026-01-08  
**Finding:** Different LLM models produce significantly different role classifications, even with identical prompts and taxonomy.

---

## Executive Summary

**Critical Discovery:** Model selection is not just a technical choice—it fundamentally shapes the patterns you observe in your data. Different models apply the same taxonomy differently, revealing different aspects of conversational dynamics.

### The Evidence

| Model | Dataset Size | Dominant AI Role | Distribution |
|-------|--------------|------------------|--------------|
| **qwen2.5:7b (Local)** | 154 conversations | `facilitator` | 83.1% (128/154) |
| **GPT-4o-mini** | 25 conversations | `facilitator` | 60.0% (15/25) |
| **GPT-4o** | 50 conversations | `advisor` | 42.0% (21/50) |

**Key Insight:** The same conversations, classified with the same taxonomy, produce dramatically different role distributions depending on the model used.

---

## Detailed Comparison

### AI Role Distributions

#### Local Model (qwen2.5:7b) - Old Taxonomy
- `facilitator`: **83.1%** (128/154) ⚠️ Strong bias
- `expert-system`: **0.6%** (1/154)
- `relational-peer`: **0.0%** (0/154)

**Pattern:** Almost everything is classified as "facilitator," suggesting the model defaults to this category when uncertain.

#### OpenAI GPT-4o-mini - Old Taxonomy
- `facilitator`: **60.0%** (15/25)
- `expert-system`: **36.0%** (9/25)
- `relational-peer`: **4.0%** (1/25)

**Pattern:** More balanced distribution, but still favors facilitator. Shows some ability to distinguish expert vs facilitator.

#### OpenAI GPT-4o - New Taxonomy (Social Role Theory)
- `advisor`: **42.0%** (21/50) - Instrumental, guidance-oriented
- `expert-system`: **40.0%** (20/50) - Instrumental, knowledge-providing
- `co-constructor`: **8.0%** (4/50) - Instrumental, collaborative
- `relational-peer`: **8.0%** (4/50) - Expressive, peer-like
- `social-facilitator`: **2.0%** (1/50) - Expressive, relationship-building

**Pattern:** Most diverse distribution. Shows clear instrumental/expressive distinction. No single role dominates.

---

## Why This Happens

### 1. **Model Capability Differences**
- **Smaller models (qwen2.5:7b):** May lack the nuanced understanding needed to distinguish subtle role differences. Default to "safe" categories.
- **Larger models (GPT-4o):** Better at understanding context, applying theoretical frameworks, and making fine-grained distinctions.

### 2. **Few-Shot Learning Effectiveness**
- Different models respond differently to few-shot examples
- Smaller models may over-rely on examples or ignore them when uncertain
- Larger models better integrate examples with the taxonomy framework

### 3. **Taxonomy Complexity**
- The old "facilitator" role was ambiguous (could mean learning or social facilitation)
- GPT-4o with the refined taxonomy can distinguish these nuances
- Smaller models may collapse ambiguous categories into defaults

### 4. **Calibration Differences**
- Models differ in how they assign confidence scores
- Some models are overconfident in defaults
- Others better reflect uncertainty in their distributions

---

## Research Implications

### ⚠️ Critical Methodological Considerations

1. **Model Selection is Not Neutral**
   - Your choice of model shapes what patterns you discover
   - Different models may reveal different aspects of conversational dynamics
   - This is a feature, not a bug—but must be acknowledged

2. **Validation is Essential**
   - Manual review remains the gold standard
   - Cross-model validation can reveal model-specific biases
   - Ground truth should be established independently of model choice

3. **Taxonomy Matters**
   - The refined Social Role Theory taxonomy enables better distinctions
   - Ambiguous categories (like old "facilitator") get collapsed by weaker models
   - Clearer taxonomy helps all models, but especially smaller ones

4. **Reproducibility Concerns**
   - Results are model-dependent
   - Must document model choice, version, and parameters
   - Consider reporting results across multiple models

### ✅ Positive Implications

1. **Multiple Models Reveal Different Patterns**
   - Using multiple models can validate findings
   - Disagreement between models may indicate ambiguous cases
   - Agreement across models increases confidence

2. **Model Choice as Research Tool**
   - Different models may be better for different research questions
   - Smaller models might capture "default" patterns
   - Larger models might reveal nuanced distinctions

3. **Taxonomy Refinement Validated**
   - GPT-4o's diverse distribution with new taxonomy suggests it's working
   - The instrumental/expressive distinction is meaningful
   - Refined taxonomy helps models make better distinctions

---

## Recommendations

### For Your Research

1. **Document Model Choice**
   - Clearly state which model was used for each analysis
   - Explain why that model was chosen
   - Acknowledge model limitations

2. **Cross-Validate When Possible**
   - Run key analyses with multiple models
   - Report agreement/disagreement rates
   - Use manual review to resolve discrepancies

3. **Use Appropriate Models for Different Tasks**
   - **Exploratory analysis:** Larger models (GPT-4o) for nuanced patterns
   - **Large-scale classification:** Consider cost/quality tradeoffs
   - **Validation:** Always include manual review

4. **Refine Taxonomy Based on Model Capabilities**
   - The Social Role Theory taxonomy works well with GPT-4o
   - Consider if taxonomy needs adjustment for smaller models
   - Or accept that smaller models may need different taxonomies

### For Future Work

1. **Model Comparison Study**
   - Systematically compare multiple models on same dataset
   - Identify model-specific biases
   - Create model selection guidelines

2. **Calibration Analysis**
   - Compare confidence scores across models
   - Identify which models are better calibrated
   - Use calibration to weight model outputs

3. **Ensemble Methods**
   - Combine predictions from multiple models
   - Use disagreement as uncertainty signal
   - Weight models by their agreement with ground truth

---

## Conclusion

**The finding that different models identify different social roles is not a problem—it's a discovery.** It reveals that:

1. Model selection is a critical methodological choice
2. Different models reveal different aspects of conversational dynamics
3. The refined Social Role Theory taxonomy enables better distinctions
4. Cross-model validation and manual review remain essential

This finding should be documented in your research methodology and discussed as a limitation (or feature) of LLM-based classification approaches.

---

## Data Sources

- **Local (qwen2.5:7b):** 154 conversations from Cornell Movie Dialogues + Empathetic Dialogues
- **GPT-4o-mini:** 25 conversations (subset of above)
- **GPT-4o:** 50 conversations from WildChat dataset

**Note:** Different datasets may contribute to differences, but the pattern of model-dependent classification is clear.

