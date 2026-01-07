# WildChat Dataset Integration

**Dataset:** [WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)  
**Source:** AllenAI  
**Size:** 838k conversations from ChatGPT interactions in the wild  
**Status:** ✅ 589 conversations downloaded, ready for classification

---

## Overview

WildChat contains 838,989 organic ChatGPT conversations collected by offering free access to GPT-3.5/GPT-4. This dataset addresses **dataset bias** in our current analysis, which relies primarily on Chatbot Arena (evaluation context, 83.1% information-seeking).

### Why WildChat?

**Current Dataset (Chatbot Arena):**
- 83.1% information-seeking purpose
- Evaluation context (users testing models)
- Competitive comparison setting
- May not reflect organic human-AI conversation

**WildChat Advantages:**
- **Organic conversations:** Real ChatGPT usage in the wild
- **Diverse purposes:** Not limited to evaluation context
- **Natural interactions:** Users genuinely seeking help, entertainment, connection
- **Broader representation:** 68 languages, various use cases

---

## Integration Status

### Download ✅
- **Script:** `scripts/download-wildchat.py`
- **Output:** `public/output-wildchat/` (589 conversations)
- **Filters:** 3-50 messages, non-toxic, primarily English

### Processing Pipeline

**Status Check:**
```bash
python3 scripts/process-wildchat-conversations.py
```

**Classification:**
```bash
# Dry-run first
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat --dry-run

# Then classify
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat
```

**PAD Generation:**
```bash
# Option A: Use regenerate script (supports --output-dir)
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat

# Option B: Copy to main output and use existing script
cp public/output-wildchat/*.json public/output/
python3 scripts/generate-pad-with-llm-direct.py --all
```

**Validation:**
```bash
cp public/output-wildchat/*.json public/output/
python3 scripts/validate-data-quality.py
```

**Merge and Analyze:**
```bash
cp public/output-wildchat/*.json public/output/
python3 scripts/cluster-paths-proper.py
```

---

## Pipeline Integration

### Existing Scripts Used

| Script | Supports Custom Directory | Usage |
|--------|-------------------------|-------|
| `batch-classify-unclassified.py` | ✅ Yes (`--directory`) | Full support |
| `regenerate-pad-for-low-diversity.py` | ✅ Yes (`--output-dir`) | Full support |
| `generate-pad-with-llm-direct.py` | ❌ No | Copy to `public/output/` |
| `validate-data-quality.py` | ❌ No | Copy to `public/output/` |

### Workflow

1. **Check Status** → `process-wildchat-conversations.py`
2. **Classify** → `batch-classify-unclassified.py --directory public/output-wildchat`
3. **Generate PAD** → `regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat`
4. **Validate** → Copy to `public/output/` and run validation
5. **Merge** → Copy to `public/output/` for clustering

---

## Research Questions

WildChat enables cross-dataset validation:

1. **Do the 7 archetypes persist?** Test cluster structure on WildChat
2. **How does purpose distribution differ?** Compare Chatbot Arena vs. WildChat
3. **Does 82.7% trajectory importance hold?** Validate feature importance across datasets
4. **Are there new archetypes?** Discover patterns unique to organic conversation

### Expected Differences

**Purpose Distribution:**
- Chatbot Arena: 83.1% information-seeking
- WildChat (expected): More diverse (entertainment, relationship-building, creative use)

**Cluster Structure:**
- May reveal more social/emergent clusters
- Different functional patterns (organic vs. test questions)
- Potentially new archetypes not present in Chatbot Arena

---

## Dataset Characteristics

### WildChat-1M Overview

- **Total conversations:** 838,989
- **Models:** GPT-3.5 (74.47%) and GPT-4 (25.53%)
- **Languages:** 68 languages detected
- **Collection method:** Offered free access to GPT-3.5/GPT-4 in exchange for conversation logs
- **Time period:** 2023-2024
- **Toxic content:** Filtered (this version excludes toxic conversations)

### Our Sample (589 conversations)

**Filters Applied:**
- Primarily English language (some other languages may be included)
- 3-50 messages per conversation
- Non-toxic content
- Random sampling from full dataset

**Characteristics:**
- Average message count: ~6-8 messages
- Message range: 3-50
- Models: Mix of GPT-3.5 and GPT-4 variants

---

## Files Generated

### Scripts
- `scripts/download-wildchat.py` - Download and convert WildChat format
- `scripts/process-wildchat-conversations.py` - Status check and next steps

### Data
- `public/output-wildchat/` - Downloaded conversations (589 files)

---

## Citation

If using WildChat data, cite:

```bibtex
@inproceedings{
  zhao2024wildchat,
  title={WildChat: 1M Chat{GPT} Interaction Logs in the Wild},
  author={Wenting Zhao and Xiang Ren and Jack Hessel and Claire Cardie and Yejin Choi and Yuntian Deng},
  booktitle={The Twelfth International Conference on Learning Representations},
  year={2024},
  url={https://openreview.net/forum?id=Bl8u7ZRlbM}
}
```

---

## References

- **Dataset:** https://huggingface.co/datasets/allenai/WildChat-1M
- **Paper:** https://arxiv.org/abs/2405.01470
- **Interactive Search Tool:** https://wildvisualizer.com

---

## Immediate Next Steps

### Current Situation

✅ **What's Done:**
- 589 conversations downloaded
- 187 files are readable (JSON parses correctly)
- Some conversations have PAD scores

❌ **What's Missing:**
- Most conversations need classification
- Some files have malformed JSON (cannot be processed)
- Focus on the 187 readable files

### Step 1: Classify the Readable Files

**Before you can do anything else, you need classification data.**

```bash
# Classify the 187 readable files
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat

# This will:
# - Skip files with JSON errors (automatically)
# - Classify the 187 readable files
# - Add classification data to each file
```

**Expected time:** ~5-10 minutes for 187 files  
**Cost:** ~$0.19-0.37 (GPT-4o-mini)

### Step 2: Verify Classification

```bash
# Check status
python3 scripts/check-wildchat-status.py

# Should show:
# - ✅ Classified: 187 (or close to it)
# - ✅ With PAD: varies
# - ✅ Complete: files with both classification and PAD
```

### Step 3: Generate PAD for Remaining Files

**If some files are classified but missing PAD:**

```bash
# Generate PAD for classified files without PAD
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat

# This will:
# - Only process files that have classification
# - Skip files with JSON errors
# - Generate PAD for files missing it
```

### Step 4: Validate and Merge

**Once you have classified + PAD files:**

```bash
# Copy to main output directory
cp public/output-wildchat/*.json public/output/

# Validate data quality
python3 scripts/validate-data-quality.py

# Check results
cat reports/validation-report.json | jq '.summary'
```

### Step 5: Run Clustering

**With expanded dataset:**

```bash
# Run clustering on combined dataset
python3 scripts/cluster-paths-proper.py

# This will:
# - Extract features from all conversations
# - Run K-Means and Hierarchical clustering
# - Generate cluster analysis reports
# - Create visualizations
```

---

## Post-Classification Workflow

### Step 1: Verify Classification Status

**Check what's been classified:**
```bash
python3 scripts/process-wildchat-conversations.py
```

**This will show:**
- Total conversations in `public/output-wildchat/`
- How many are classified
- How many need PAD generation

### Step 2: Handle Failed Classifications

**Check which files failed:**
```bash
cd public/output-wildchat
ls -la *.json | grep -v "wildchat_" | wc -l  # Count classified
```

**Re-run failed classifications:**
```bash
# Check for files without classification
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat --dry-run

# Re-classify any remaining
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat
```

**Note:** Some failures might be due to:
- Invalid JSON structure
- Missing required fields
- API rate limits
- Malformed conversation data

### Step 3: Generate PAD Values

**Once all conversations are classified, generate PAD scores:**

```bash
# Option A: Use regenerate script (recommended, supports --output-dir)
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat

# Option B: Copy to main output and use existing script
cp public/output-wildchat/*.json public/output/
python3 scripts/generate-pad-with-llm-direct.py --all
```

**Expected time:** ~1-3 seconds per conversation (GPT-4o-mini)  
**Cost:** ~$0.001-0.01 per conversation

### Step 4: Validate Data Quality

**Before merging, validate the WildChat data:**

```bash
# Copy to main output for validation
cp public/output-wildchat/*.json public/output/

# Run validation
python3 scripts/validate-data-quality.py

# Check for problematic conversations
python3 scripts/detect-problematic-conversations.py
```

**What to check:**
- Schema compliance (all required fields present)
- PAD score ranges (0.0-1.0)
- Role distributions sum to ~1.0
- Classification confidence scores
- Logical consistency

### Step 5: Merge with Main Dataset

**Once validated, merge WildChat conversations with main dataset:**

```bash
# Copy all WildChat conversations to main output
cp public/output-wildchat/*.json public/output/

# Verify total count
ls public/output/*.json | wc -l
# Should be: original + WildChat = total
```

**Note:** Make sure you don't overwrite existing conversations. The WildChat files have `wildchat_` prefix, so they won't conflict with `chatbot_arena_*` or `oasst-*` files.

### Step 6: Run Cluster Analysis on Expanded Dataset

**Run clustering on the combined dataset:**

```bash
python3 scripts/cluster-paths-proper.py
```

**This will:**
- Extract features from all conversations
- Run K-Means and Hierarchical clustering
- Generate cluster analysis reports
- Create t-SNE visualizations
- Calculate feature importance

### Step 7: Cross-Dataset Comparison

**Compare cluster structures between Chatbot Arena and WildChat:**

**Research questions:**
1. Do the 7 archetypes persist in WildChat?
2. Are there new clusters unique to WildChat?
3. Does 81.8% trajectory importance hold across datasets?
4. How does purpose distribution affect cluster membership?

**Expected differences:**
- Chatbot Arena: 83.1% information-seeking
- WildChat: More diverse (entertainment, relationship-building, creative use)

### Step 8: Update Documentation

**Update key documents with expanded dataset findings:**
- `docs/cluster-analysis/COMPREHENSIVE_CLUSTER_ANALYSIS.md` - Update total conversations, add cross-dataset comparison
- `docs/cluster-analysis/FEATURE_IMPORTANCE_ANALYSIS.md` - Compare feature importance between datasets
- `docs/PROJECT_OVERVIEW.md` - Update dataset statistics, add WildChat findings

---

## About the Malformed JSON Files

**402 files have JSON parsing errors.** These cannot be processed with current tools.

**Options:**

1. **Exclude them** (recommended for now)
   - Focus on the 187 readable files
   - This still gives you significant dataset expansion

2. **Fix them manually** (time-consuming)
   - Would need to identify and fix JSON syntax errors
   - May not be worth the effort

3. **Re-download a different subset**
   - Try downloading with different filters
   - May get cleaner JSON

**For DIS submission:** 187 additional conversations is still valuable for cross-dataset validation.

---

## Quick Reference: Complete Workflow

```bash
# 1. Check status
python3 scripts/process-wildchat-conversations.py

# 2. Classify
python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat

# 3. Check status again
python3 scripts/check-wildchat-status.py

# 4. Generate PAD (if needed)
python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat

# 5. Validate
cp public/output-wildchat/*.json public/output/
python3 scripts/validate-data-quality.py

# 6. Run clustering
python3 scripts/cluster-paths-proper.py

# 7. Generate dashboard
python3 scripts/create-cluster-dashboard.py
```

---

## Expected Outcomes

### Dataset Expansion
- **Before:** 160 conversations (128 Chatbot Arena + 32 OASST)
- **After:** 347+ conversations (with 187 WildChat)
- **Increase:** 2.2x+ dataset size

### Research Value
- **Cross-dataset validation:** Test if 7 archetypes persist
- **Bias mitigation:** Address Chatbot Arena evaluation context
- **Generalizability:** Validate findings across different conversation contexts
- **New patterns:** Discover WildChat-specific relational positioning

### For DIS Submission
- **Stronger claims:** Cross-dataset validation strengthens findings
- **Addresses critique:** Directly responds to dataset bias concerns
- **Generalizability:** Shows patterns hold across different contexts
- **Critical design:** Can frame as "revealing how different contexts shape relational positioning"

---

**Status:** Ready for classification and analysis pipeline ✅

