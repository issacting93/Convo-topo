# Dataset Revalidation & Paper Update Plan

**Date:** January 13, 2026
**Goal:** Expand validated corpus from 345 to 543, rerun analysis, update paper
**Status:** 🟡 In Progress

---

## Current Status

### Data Quality ✅
- **Total files:** 569
- **Valid conversations:** 543 (after fixing 102 PAD issues)
- **Remaining issues:** 26
  - 7 with no classification (error files)
  - 19 with old taxonomy

### Original Analysis (345 conversations)
- ✅ 82.7% trajectory feature importance
- ✅ 7 clusters identified
- ✅ Variance ratios: 41x to 82x
- ✅ Silhouette score: 0.160

---

## Step-by-Step Plan

### Phase 1: Fix Remaining Data Issues (26 files)

#### 1.1. Re-classify Old Taxonomy Files (19 files)
**Files:**
- `cornell-*.json` (10 files)
- `kaggle-emo-*.json` (9 files)

**Action:**
```bash
# Option A: Re-run full classifier on these files
python3 classifier/classifier-openai-social-role-theory.py --files cornell-*.json kaggle-emo-*.json

# Option B: Create small script to just update these 19
python3 scripts/reclassify-old-taxonomy.py
```

**Expected Result:** 19 files converted to new taxonomy

#### 1.2. Handle Classification Error Files (7 files)
**Files:**
- `chatbot_arena_0242-error.json`
- `chatbot_arena_0266-error.json`
- `chatbot_arena_1362-error.json`
- `chatbot_arena_17468-error.json`
- `chatbot_arena_1851-error.json`
- `chatbot_arena_1882-error.json`
- `chatbot_arena_22306-error.json`

**Action:**
1. Inspect files to see why classification failed
2. Either:
   - Fix the data and re-classify
   - Or exclude from analysis (document why)

**Decision:** Likely exclude (7 out of 569 is 1.2% - minimal impact)

---

### Phase 2: Re-run Cluster Analysis (543 conversations)

#### 2.1. Backup Original Results
```bash
cp reports/path-clusters-kmeans.json reports/path-clusters-kmeans-345-original.json
cp reports/path-clusters-hierarchical.json reports/path-clusters-hierarchical-345-original.json
cp docs/FEATURE_IMPORTANCE_*.md docs/archive/
```

#### 2.2. Run Clustering Script
```bash
python3 scripts/cluster-paths-proper.py
```

**What it does:**
- Reads all valid conversations from `public/output/`
- Extracts 43 trajectory features
- Runs K-means clustering (K=7, matching original)
- Runs Hierarchical clustering
- Calculates feature importance
- Generates reports in `reports/`

#### 2.3. Compare Results

**Key Metrics to Check:**
1. **Trajectory Feature Importance**
   - Original: 82.7% (hierarchical)
   - New: ??? (should be similar if findings are robust)

2. **Number of Clusters**
   - Original: 7 clusters
   - New: ??? (may change with more data)

3. **Variance Ratios**
   - Original: 41x to 82x
   - New: ??? (specific examples should remain stable)

4. **Silhouette Score**
   - Original: 0.160 (weak separation)
   - New: ??? (may improve with more data)

---

### Phase 3: Validate Findings Stability

#### 3.1. Check if Key Examples Still Exist
**Critical conversations:**
- `chatbot_arena_22853` (detached browsing)
- `chatbot_arena_30957` (adversarial testing)
- `chatbot_arena_13748` (smooth learning)
- `oasst-ebc51bf5-c486-471b-adfe-a58f4ad60c7a_0084` (anomalous breakdown)

**Verify:**
- Do they still show same variance ratios?
- Are they in different clusters?
- Do they demonstrate same patterns?

#### 3.2. Compare Feature Importance
```python
# Compare old vs new
old_importance = {
    'spatial_trajectory': 0.502,
    'emotional_intensity': 0.336,
    'pattern': 0.051,
    # ... etc
}

new_importance = {
    # Read from new analysis
}

# Calculate differences
for category in old_importance:
    diff = new_importance[category] - old_importance[category]
    print(f"{category}: {diff:+.3f} ({diff/old_importance[category]*100:+.1f}%)")
```

#### 3.3. Decision Criteria

**If findings are STABLE (within 5%):**
- ✅ Update paper to 543 conversations
- ✅ Update all percentages
- ✅ Note: "Findings robust across expanded dataset"

**If findings CHANGE significantly (>10%):**
- ⚠️ Keep 345 for paper
- ⚠️ Note: "Dataset expansion ongoing" in limitations
- ⚠️ Plan follow-up paper with expanded analysis

---

### Phase 4: Update Paper (if stable)

#### 4.1. Numbers to Update

**Dataset Size:**
- Change: "345 validated conversations" → "543 validated conversations"
- Change: "533 total" → "569 total classified, 543 validated"

**Percentages (if changed):**
- Trajectory feature importance: 82.7% → ???
- Cluster distribution: Update if changed
- Role distributions: May shift slightly

**Keep Same:**
- Methodology (unchanged)
- Theoretical framework (unchanged)
- Core narrative "same roles, different trajectories" (should remain)
- Specific example variance ratios (41x, 82x - these are specific pairs)

#### 4.2. Update Validation Report
```bash
# Update PAPER_DRAFT_VALIDATION_REPORT.md with new numbers
```

#### 4.3. Re-verify Claims
```bash
node check_data_integrity.cjs  # Should show 543 valid
python3 scripts/verify-paper-claims.py  # Re-verify all claims
```

---

## Risk Assessment

### Low Risk ✅
- **PAD fix:** Adding missing `emotionalIntensity` using established formula
- **Expanding dataset:** More data typically strengthens findings

### Medium Risk ⚠️
- **Feature importance may shift:** 82.7% might change to 75-90%
- **Cluster count may change:** 7 clusters might become 6 or 8

### High Risk ❌
- **Core findings invalidated:** If trajectory features drop below 50%
- **Example conversations disappear:** If key examples change dramatically

### Mitigation
- **Run analysis first, then decide:** Don't commit to paper changes until we see results
- **Keep 345 as fallback:** Original analysis remains valid regardless
- **Document thoroughly:** Note what changed and why in methods

---

## Timeline Estimate

### Quick Path (24 hours)
- ⏱️ 2 hours: Fix 19 old taxonomy files
- ⏱️ 1 hour: Handle 7 error files (likely exclude)
- ⏱️ 2 hours: Run cluster analysis
- ⏱️ 2 hours: Compare results & validate
- ⏱️ 3 hours: Update paper if stable

**Total:** ~10 hours of work + compute time

### Conservative Path (48 hours)
- Add buffer for unexpected issues
- Thorough validation
- Multiple review cycles

---

## Decision Points

### Decision 1: Handle Error Files
**Option A:** Try to fix and re-classify (takes time)
**Option B:** Exclude from analysis (1.2% of data, minimal impact)
**Recommendation:** Option B (exclude)

### Decision 2: Update Paper Now or Later
**Option A:** Update for this submission (if findings stable)
**Option B:** Keep 345, note expansion in future work
**Recommendation:** Depends on timeline - if stable results within 24 hours, update

### Decision 3: Number of Clusters
**Option A:** Keep K=7 (match original)
**Option B:** Re-optimize K (may find different number)
**Recommendation:** Option A for comparability, note alternative Ks in appendix

---

## Success Criteria

✅ **Full Success:**
- 543 valid conversations
- Trajectory feature importance within 5% of 82.7%
- 7 clusters remain
- Key examples (41x, 82x) still valid
- Paper updated with new numbers

✅ **Partial Success:**
- 543 valid conversations
- Findings mostly stable (within 10%)
- Some numbers updated, core narrative intact
- Note changes in methods section

⚠️ **Inconclusive:**
- Findings change significantly (>10%)
- Keep 345 for current paper
- Plan follow-up with expanded analysis

---

## Next Immediate Actions

1. ✅ **DONE:** Fix 102 PAD issues → Now 543 valid
2. 🟡 **NOW:** Decide on error files (exclude or fix?)
3. 🔜 **NEXT:** Re-classify 19 old taxonomy files
4. 🔜 **THEN:** Run cluster analysis
5. 🔜 **FINALLY:** Compare and decide on paper updates

---

## Questions to Resolve

1. **Error files:** Exclude 7 files or try to fix? (Recommend: exclude)
2. **API costs:** Re-classifying 19 files = ~$0.50-2.00 via OpenAI
3. **Compute time:** Clustering 543 vs 345 = ~2-5 minutes (minimal)
4. **Submission deadline:** How much time before submission? (determines urgency)

---

## Rollback Plan

If anything goes wrong:
```bash
# Restore original files
git checkout public/output/cornell-*.json
git checkout public/output/kaggle-emo-*.json

# Restore original reports
cp reports/path-clusters-kmeans-345-original.json reports/path-clusters-kmeans.json
cp reports/path-clusters-hierarchical-345-original.json reports/path-clusters-hierarchical.json

# Paper stays at 345
# Everything still valid
```

---

**Status:** Ready to proceed. Awaiting user decision on next steps.
