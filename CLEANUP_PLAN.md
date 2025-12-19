# Cleanup Plan for Scripts, Data, and Docs

## Overview

This document outlines what needs to be cleaned up and organized.

---

## 1. Scripts Cleanup

### Classifier Scripts (`classifier/`)

**Move to Archive:**
- `run-classification.sh` - Superseded by `classify.sh`
- `run-openai-classifier.sh` - Superseded by `classify.sh`

**Move Temp Files:**
- `unclassified-conversations.json` - Generated temp file (can be regenerated)
- `unclassified-emo-conversations.json` - Generated temp file (can be regenerated)
- `conversations-for-classifier.json` - Generated temp file (can be regenerated)

**Keep:**
- `classify.sh` - Main workflow script ✅
- `classify-remaining-emo.sh` - Specialized script ✅
- `classify-emo-files.py` - Helper script ✅
- `classifier-openai.py` - Active classifier ✅
- `classifier-v1.1.py` - Alternative classifier ✅
- `classifier-v1.1.ts` - Alternative classifier ✅
- `split-classified-output.py` - Utility script ✅
- `test-openai-setup.py` - Test script ✅
- `setup-openai.sh` - Setup script ✅
- `requirements.txt` - Dependencies ✅
- `README.md` - Documentation ✅

### Root Scripts

**Remove (if organization complete):**
- `organize-files.sh` - Organization is complete, script no longer needed

**Keep:**
- `sync-output-to-public.sh` - Active utility ✅

---

## 2. Data Cleanup

### Temporary/Unrelated Directories

**Consider Removing:**
- `temp-samantha/` - Appears unrelated to main project (chatbot/bible scripts)
  - **Action:** Move to archive or remove if confirmed unrelated

### Temporary Files

**Classifier Temp Files:**
- `classifier/unclassified-*.json` - Generated temp files (can be regenerated)
  - **Action:** Add to .gitignore, can be regenerated

**Build Output:**
- `build/` - Build artifacts (should be in .gitignore already)
  - **Action:** Verify .gitignore includes this

---

## 3. Documentation Cleanup

### Duplicate/Overlapping Docs

**Potential Duplicates:**
- `docs/CONVERSATION_DATA_SOURCES.md` vs `docs/technical/DATA_SOURCES.md`
  - **Action:** Compare and merge or clearly differentiate

**Organization Docs (May be Complete):**
- `ORGANIZATION_COMPLETE.md` - Organization is done ✅
- `ORGANIZATION_PLAN.md` - May be outdated if complete
  - **Action:** Move to archive or docs/archive if no longer needed

### Documentation Structure

**Current Active Docs:**
- `docs/CLASSIFIERS_AND_DATA_SOURCES.md` - New comprehensive guide ✅
- `docs/QUICK_REFERENCE_CLASSIFIERS.md` - Quick reference ✅
- `docs/technical/DATA_SOURCES.md` - Technical data sources ✅
- `docs/CONVERSATION_TERRAIN_INTEGRATION.md` - Integration guide ✅
- `docs/DATA_STRUCTURE.md` - Data structure ✅

**Consider Consolidating:**
- `docs/API_OPTIONS.md` - May overlap with CLASSIFIERS_AND_DATA_SOURCES.md
  - **Action:** Check if redundant

---

## 4. Reports Cleanup

**Reports Directory:**
- Keep all reports (they're historical analysis)
- Consider adding dates or "status" to report titles if not clear

---

## Cleanup Actions

### Phase 1: Safe Removals (Temp Files)
1. ✅ Add temp JSON files to .gitignore
2. ✅ Archive or remove legacy scripts
3. ✅ Verify build/ is in .gitignore

### Phase 2: Documentation Review
1. ✅ Compare duplicate docs and merge if needed
2. ✅ Move completed organization docs to archive
3. ✅ Update any broken links

### Phase 3: Directory Cleanup
1. ⚠️ Review temp-samantha/ - confirm if related or can be removed
2. ✅ Clean up any empty directories

---

## Files to Archive/Move

### Move to `classifier/archive/`:
- `run-classification.sh`
- `run-openai-classifier.sh`

### Move to `docs/archive/` (if organization complete):
- `ORGANIZATION_COMPLETE.md`
- `ORGANIZATION_PLAN.md`

### Add to `.gitignore`:
- `classifier/unclassified-*.json`
- `classifier/conversations-for-classifier.json`

---

## Files to Review/Decide

### `temp-samantha/`
- Contains: chatbot scripts, bible processing, database
- **Decision needed:** Is this related to Conversational Topography project?
- **If unrelated:** Move to separate location or remove

---

## Estimated Impact

**Files to Move:** ~5 files
**Files to Archive:** ~5 files  
**Temp Files to Ignore:** ~3 files
**Dirs to Review:** 1 directory (temp-samantha/)

**Risk Level:** Low (temp files can be regenerated, legacy scripts already documented as superseded)

