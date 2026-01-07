# Documentation Cleanup Plan 2026

**Date:** 2026-01-XX  
**Current Count:** 42 markdown files in root `docs/`  
**Target:** Reduce to ~30 files (28% reduction)

---

## 🔴 High Priority: Consolidate These Groups

### 1. WildChat Documentation (3 files → 1)

**Current:**
- `WILDCHAT_INTEGRATION.md` - Main integration guide
- `WILDCHAT_IMMEDIATE_NEXT_STEPS.md` - Action items
- `WILDCHAT_POST_CLASSIFICATION_WORKFLOW.md` - Post-classification steps

**Action:** 
- ✅ **Keep:** `WILDCHAT_INTEGRATION.md` (expand with sections from others)
- 📦 **Archive:** `WILDCHAT_IMMEDIATE_NEXT_STEPS.md` → `archive/wildchat/`
- 📦 **Archive:** `WILDCHAT_POST_CLASSIFICATION_WORKFLOW.md` → `archive/wildchat/`

**Reason:** All three cover WildChat workflow. Consolidate into one comprehensive guide.

---

### 2. Role Examples (3 files → 1)

**Current:**
- `COLLABORATOR_EXAMPLES.md` - Collaborator examples
- `DIRECTOR_EXAMPLES.md` - Director examples  
- `ROLE_DISTINCTIONS_EXAMPLES.md` - Distinctions between roles

**Action:**
- ✅ **Keep:** `ROLE_DISTINCTIONS_EXAMPLES.md` (expand with collaborator/director examples)
- 📦 **Archive:** `COLLABORATOR_EXAMPLES.md` → `archive/examples/`
- 📦 **Archive:** `DIRECTOR_EXAMPLES.md` → `archive/examples/`

**Reason:** All three are examples. Consolidate into one comprehensive examples file.

---

### 3. Hypothesis Validation (4 files → 2)

**Current:**
- `DESTINATION_VS_JOURNEY_HYPOTHESIS.md` - Core hypothesis ✅ **KEEP**
- `VERIFIED_HYPOTHESIS_AND_NARRATIVE.md` - Verification details
- `THESIS_VALIDATION_TWO_CONVERSATIONS.md` - Concrete examples
- `RESEARCH_HYPOTHESIS_VALIDATION.md` - Validation summary

**Action:**
- ✅ **Keep:** `DESTINATION_VS_JOURNEY_HYPOTHESIS.md` (core)
- ✅ **Keep:** `RESEARCH_HYPOTHESIS_VALIDATION.md` (consolidate verification + examples into this)
- 📦 **Archive:** `VERIFIED_HYPOTHESIS_AND_NARRATIVE.md` → `archive/hypothesis/`
- 📦 **Archive:** `THESIS_VALIDATION_TWO_CONVERSATIONS.md` → `archive/hypothesis/`

**Reason:** Too much overlap. Keep core hypothesis + one validation doc with examples.

---

### 4. Research Demonstration (2 files → 1)

**Current:**
- `RESEARCH_DEMONSTRATION_CONVERSATIONS.md` - Demo conversations
- `FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md` - Figure pairs

**Action:**
- ✅ **Keep:** `FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md` (more detailed)
- 📦 **Archive:** `RESEARCH_DEMONSTRATION_CONVERSATIONS.md` → `archive/research/`

**Reason:** Both list conversations for figures. Keep the more detailed one.

---

### 5. Status Reports (2 files → consolidate into DATA_GUIDE)

**Current:**
- `DATA_STATUS_REPORT.md` - Snapshot status
- `RECLASSIFICATION_COMPLETE.md` - Completion status

**Action:**
- ✅ **Keep:** `DATA_GUIDE.md` (add status section)
- 📦 **Archive:** `DATA_STATUS_REPORT.md` → `archive/status/`
- 📦 **Archive:** `RECLASSIFICATION_COMPLETE.md` → `archive/status/`

**Reason:** Status reports are snapshots. Add current status to DATA_GUIDE.md instead.

---

## 🟡 Medium Priority: Archive Outdated

### 6. Documentation Cleanup Analysis

**Current:**
- `DOCUMENTATION_CLEANUP_ANALYSIS.md` - Previous cleanup analysis

**Action:**
- 📦 **Archive:** → `archive/organization/` (historical reference)

**Reason:** This is the old analysis. Replace with this new plan.

---

### 7. Role Documentation (5 files → keep, but organize)

**Current:**
- `ROLE_DEFINITIONS.md` ✅ **KEEP** (core reference)
- `ROLE_METADATA.md` ✅ **KEEP** (metadata details)
- `ROLE_RELATIONSHIP_MAPPING.md` ✅ **KEEP** (relationship mapping)
- `ROLE_DISTINCTIONS_EXAMPLES.md` ✅ **KEEP** (after consolidation)
- `ROLES_TO_PATHS_MAPPING.md` - Could merge into ROLE_DEFINITIONS.md

**Action:**
- ✅ **Keep all** - They serve distinct purposes
- Consider: Merge `ROLES_TO_PATHS_MAPPING.md` into `ROLE_DEFINITIONS.md` as a section

---

## 🟢 Low Priority: Keep These (Distinct Purposes)

### Core References (Keep)
- `PROJECT_OVERVIEW.md` ⭐
- `TAXONOMY.md` ⭐
- `AXIS_DEFINITIONS.md` ⭐
- `FINDINGS_SUMMARY.md` ⭐
- `README.md` ⭐

### Research Findings (Keep)
- `RESEARCH_FINDINGS_REPORT_REFRAMED.md` ⭐
- `DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md` ⭐
- `ANOMALY_DETECTION_THESIS.md`
- `TERRAIN_VS_CLASSIFIER_INDEPENDENCE.md`
- `PROJECT_ACHIEVEMENTS_AND_LEARNINGS.md`

### Data & Guides (Keep)
- `DATA_GUIDE.md` ⭐
- `DATA_ENCODING_VERIFICATION.md`
- `RECLASSIFICATION_GUIDE.md`
- `WILDCHAT_INTEGRATION.md` (after consolidation)

### Specialized Analysis (Keep)
- `CONVERSATION_COMPARISON_CAPABILITIES.md`
- `CROSS_DATASET_CLUSTER_COMPARISON.md`
- `HUMAN_AI_ROLE_DISTRIBUTION.md`
- `PAD_MEANINGFUL_UNDERSTANDING_ANALYSIS.md`
- `NON_SEEKER_EXPERT_ANALYSIS.md`
- `WHY_CONVERSATIONS_ARE_STATIC.md`

### Implementation (Keep)
- `CLUSTER_DASHBOARD_IMPLEMENTATION.md`
- `GENUI_INTEGRATION.md`

### Other (Keep)
- `SOCIOLINGUISTIC_TERMS.md`
- `WORKFLOW.md`

---

## 📋 Summary: Files to Archive

### Archive to `archive/wildchat/`:
1. `WILDCHAT_IMMEDIATE_NEXT_STEPS.md`
2. `WILDCHAT_POST_CLASSIFICATION_WORKFLOW.md`

### Archive to `archive/examples/`:
3. `COLLABORATOR_EXAMPLES.md`
4. `DIRECTOR_EXAMPLES.md`

### Archive to `archive/hypothesis/`:
5. `VERIFIED_HYPOTHESIS_AND_NARRATIVE.md`
6. `THESIS_VALIDATION_TWO_CONVERSATIONS.md`

### Archive to `archive/research/`:
7. `RESEARCH_DEMONSTRATION_CONVERSATIONS.md`

### Archive to `archive/status/`:
8. `DATA_STATUS_REPORT.md`
9. `RECLASSIFICATION_COMPLETE.md`

### Archive to `archive/organization/`:
10. `DOCUMENTATION_CLEANUP_ANALYSIS.md`

**Total: 10 files to archive**

---

## 📋 Files to Consolidate (Merge Content)

### 1. Expand `WILDCHAT_INTEGRATION.md`
- Add "Immediate Next Steps" section
- Add "Post-Classification Workflow" section

### 2. Expand `ROLE_DISTINCTIONS_EXAMPLES.md`
- Add collaborator examples from `COLLABORATOR_EXAMPLES.md`
- Add director examples from `DIRECTOR_EXAMPLES.md`
- Rename to `ROLE_EXAMPLES.md` or keep current name

### 3. Expand `RESEARCH_HYPOTHESIS_VALIDATION.md`
- Add verification details from `VERIFIED_HYPOTHESIS_AND_NARRATIVE.md`
- Add concrete examples from `THESIS_VALIDATION_TWO_CONVERSATIONS.md`

### 4. Expand `DATA_GUIDE.md`
- Add current status section (from `DATA_STATUS_REPORT.md`)
- Add reclassification completion note (from `RECLASSIFICATION_COMPLETE.md`)

### 5. Consider merging `ROLES_TO_PATHS_MAPPING.md` into `ROLE_DEFINITIONS.md`
- Or keep separate if it's substantial

---

## 📊 Impact Summary

**Before:** 42 files  
**After:** ~32 files (10 archived)  
**Reduction:** 24% fewer files

**Benefits:**
- Cleaner root directory
- Less confusion about which file to read
- Historical documents preserved in archive
- Better organization
- Consolidated information in fewer, more comprehensive files

---

## 🎯 Action Plan

### Step 1: Create Archive Directories
```bash
mkdir -p docs/archive/{wildchat,examples,hypothesis,research,status,organization}
```

### Step 2: Consolidate Content First
1. Expand `WILDCHAT_INTEGRATION.md` with content from other WildChat files
2. Expand `ROLE_DISTINCTIONS_EXAMPLES.md` with collaborator/director examples
3. Expand `RESEARCH_HYPOTHESIS_VALIDATION.md` with verification details
4. Expand `DATA_GUIDE.md` with status information

### Step 3: Archive Files
```bash
# Archive WildChat files
mv docs/WILDCHAT_IMMEDIATE_NEXT_STEPS.md docs/archive/wildchat/
mv docs/WILDCHAT_POST_CLASSIFICATION_WORKFLOW.md docs/archive/wildchat/

# Archive examples
mv docs/COLLABORATOR_EXAMPLES.md docs/archive/examples/
mv docs/DIRECTOR_EXAMPLES.md docs/archive/examples/

# Archive hypothesis files
mv docs/VERIFIED_HYPOTHESIS_AND_NARRATIVE.md docs/archive/hypothesis/
mv docs/THESIS_VALIDATION_TWO_CONVERSATIONS.md docs/archive/hypothesis/

# Archive research
mv docs/RESEARCH_DEMONSTRATION_CONVERSATIONS.md docs/archive/research/

# Archive status
mv docs/DATA_STATUS_REPORT.md docs/archive/status/
mv docs/RECLASSIFICATION_COMPLETE.md docs/archive/status/

# Archive organization
mv docs/DOCUMENTATION_CLEANUP_ANALYSIS.md docs/archive/organization/
```

### Step 4: Update Cross-References
- Update `README.md` to remove references to archived files
- Update any files that link to archived documents
- Add notes in consolidated files pointing to archive

### Step 5: Verify
```bash
# Count files
ls docs/*.md | wc -l  # Should be ~32

# Check for broken links
grep -r "WILDCHAT_IMMEDIATE_NEXT_STEPS\|COLLABORATOR_EXAMPLES\|VERIFIED_HYPOTHESIS" docs/*.md
```

---

## ⚠️ Before Archiving

**Check for cross-references:**
```bash
# Find files that reference files to be archived
grep -r "WILDCHAT_IMMEDIATE_NEXT_STEPS\|WILDCHAT_POST_CLASSIFICATION\|COLLABORATOR_EXAMPLES\|DIRECTOR_EXAMPLES\|VERIFIED_HYPOTHESIS\|THESIS_VALIDATION_TWO\|RESEARCH_DEMONSTRATION\|DATA_STATUS_REPORT\|RECLASSIFICATION_COMPLETE" docs/*.md
```

**Update cross-references** before archiving to avoid broken links.

---

**Status:** Ready for execution  
**Next:** Execute consolidation, then archive

