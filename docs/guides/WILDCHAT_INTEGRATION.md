# WildChat Integration Guide

**Status:** Implementation in Progress
**Source:** [allenai/WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)

---

## Overview

We are expanding the Conversational Cartography dataset from ~160 conversations (Chatbot Arena) to ~350+ by integrating organic conversations from WildChat. This allows us to validate that our 7 relational archetypes ("StraightPath Stable", "Volatile Peak", etc.) persist in naturalistic settings, not just evaluation contexts.

## Workflow

### 1. Download & Filter
Conversations are downloaded from HuggingFace.
- **Total downloaded:** 589
- **Readable:** 187
- **Corrupted/Skipped:** 402

### 2. Classification
We classify WildChat interactions using the same Social Role Theory taxonomy (6 Human + 6 AI roles) used for the Arena dataset.

**Command:**
```bash
python3 scripts/process-wildchat-conversations.py
```
*This script checks status, classifies unclassified files, and generates PAD scores.*

### 3. Validation
Run the validation suite to ensure schema compliance.
```bash
python3 scripts/validate-data-quality.py
```

### 4. Clustering & Analysis
Once integrated, we run the clustering pipeline on the combined dataset (N=347+).

```bash
python3 scripts/cluster-paths-proper.py
```

This generates:
- Updated K-Means clusters (k=7)
- Feature importance analysis (validating the "82.7% trajectory" finding)
- t-SNE visualizations

## Cross-Dataset Comparison

We utilize `scripts/compare-datasets.py` to compare:
- **Purpose Distribution:** Arena is 83% Info-Seeking. WildChat is more diverse.
- **Role Distribution:** WildChat shows higher 'Director' human roles (Commanding AI) vs Arena's 'Information-Seeker'.

## Troubleshooting

- **PAD Generation Fails:** Ensure `OPENAI_API_KEY` is set.
- **Classification Stalls:** Check `public/output-wildchat` for partial files.
- **Memory Issues:** The clustering script loads all JSONs; ensure sufficient RAM.

---
*Supersedes `WILDCHAT_IMMEDIATE_NEXT_STEPS.md` and `WILDCHAT_POST_CLASSIFICATION_WORKFLOW.md` (Archived).*
