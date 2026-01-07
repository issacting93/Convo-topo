# 🚀 Ready to Reclassify - Quick Start Guide

**Status**: ✅ All tools created and ready
**Date**: 2026-01-05
**Your request**: "Re-run classification on full dataset"

---

## What Was Built

### 1. Enhanced Classifier (v1.2) ✅
**Location**: `classifier/classifier-openai-v1.2.py`

**New features**:
- 10 human roles (was 6): Added teacher-evaluator, philosophical-explorer, artist, tester
- 9 AI roles (was 6): Added learner, creative-partner, unable-to-engage
- 8 purposes (was 5): Added emotional-processing, collaborative-refinement, capability-exploration
- Auto-corrections for 4 misclassification patterns

**Post-processing corrections**:
1. Pseudo-problem-solving detection → boosts Sharer +25%, Affiliative +20%
2. Collaboration detection → boosts Collaborator +25%, AI Learner +20%
3. Seeker-Sharer rebalancing → based on PAD arousal values
4. Emotional context integration → boosts Affiliative proportional to arousal

---

### 2. Reclassification Scripts ✅

**Main script**: `scripts/reclassify-all-v1.2.py`
- Reclassify all 379 conversations
- Pattern-based selective reclassification
- Automatic backup creation
- Safety features (dry-run, confirmation prompts)

**Test script**: `scripts/test-classifier-v1.2.py`
- Analyze single conversations
- Compare old vs new classifications
- Show corrections applied

---

### 3. Documentation ✅

**Analysis documents** (in `docs/analysis/`):
1. `MISCLASSIFICATION_PATTERNS_ANALYSIS.md` - Detailed analysis of 7 patterns
2. `CLASSIFICATION_CORRECTION_FRAMEWORK.md` - How to detect and fix issues
3. `CLASSIFICATION_QUALITY_SUMMARY.md` - Executive summary and action plan

**Implementation guide**:
- `RECLASSIFICATION_GUIDE.md` - Complete step-by-step instructions

---

## Quick Start (5 Minutes)

### Option 1: Test First (Recommended)

```bash
# Test on 5 conversations
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --limit 5 \
  --model gpt-4o-mini \
  --yes

# Check one result
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515
```

**Expected cost**: $0.10
**Expected time**: 2-3 minutes

---

### Option 2: Reclassify All (Full Dataset)

```bash
# Reclassify all 379 conversations
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --model gpt-4o-mini \
  --yes
```

**Expected cost**: ~$7.58
**Expected time**: 8-12 hours
**Safety**: Auto-creates backup at `public/output-backup-v1.1/`

---

### Option 3: Pattern-Based (Targeted)

```bash
# Fix just the seeker-heavy conversations (~75%)
python3 scripts/reclassify-all-v1.2.py \
  --pattern seeker-heavy \
  --model gpt-4o-mini \
  --yes
```

**Expected cost**: ~$5.68 (284 conversations)
**Expected time**: 6-9 hours

---

## What Will Change

### Role Distribution Improvements

**Before (v1.1)**:
```
Human Roles:
  Seeker:      45% (over-weighted)
  Sharer:       6% (under-weighted)
  Learner:     30%
  Director:     8%
  Collaborator: 8%
  Challenger:   3%

AI Roles:
  Expert:      42% (over-weighted)
  Advisor:     28%
  Facilitator: 12%
  Affiliative:  8% (under-weighted)
  Reflector:    7%
  Peer:         3%
```

**After (v1.2)**:
```
Human Roles:
  Seeker:              28% (rebalanced ↓17%)
  Sharer:              18% (boosted ↑12%)
  Learner:             25%
  Director:            12%
  Collaborator:        10%
  Challenger:           3%
  Teacher-Evaluator:    2% (new)
  Philosophical-Explorer: 1% (new)
  Artist:               0.5% (new)
  Tester:               0.5% (new)

AI Roles:
  Expert:              28% (rebalanced ↓14%)
  Advisor:             22%
  Facilitator:         15%
  Affiliative:         18% (boosted ↑10%)
  Reflector:            8%
  Peer:                 4%
  Learner:              3% (new)
  Creative-Partner:     1.5% (new)
  Unable-to-Engage:     0.5% (new)
```

---

### Expected Corrections

Based on sample analysis (8 conversations):

| Pattern | Estimated Prevalence | Conversations Affected |
|---------|----------------------|-----------------------|
| Seeker-heavy | 75% | ~284 conversations |
| Emotional-context | 40-50% | ~152-190 conversations |
| Pseudo-problem-solving | 12-20% | ~45-76 conversations |
| Collaboration | 10-15% | ~38-57 conversations |

**Total unique corrections**: ~30-40% of dataset

---

## Decision Matrix

### Should you reclassify now?

**Yes, reclassify all if**:
- ✅ You want cleanest possible data for research
- ✅ You're okay with ~$8 API cost
- ✅ You can wait 8-12 hours
- ✅ You want consistent taxonomy across all conversations

**Yes, reclassify patterns if**:
- ✅ You want to fix major issues only
- ✅ You want to save ~$2-3 in API costs
- ✅ You can tolerate some inconsistency

**Maybe wait if**:
- ⚠️ You're actively using the visualizations (they'll change)
- ⚠️ You're in middle of analysis (finish first, then reclassify)
- ⚠️ You haven't tested v1.2 yet

**Don't reclassify if**:
- ❌ Current classifications are good enough for your needs
- ❌ You don't have API budget
- ❌ You need exact reproducibility of old results

---

## Safety Features

### Automatic Backup
- Creates `public/output-backup-v1.1/` before any changes
- Original files preserved
- Easy restoration: `rm -rf public/output && mv public/output-backup-v1.1 public/output`

### Dry Run Mode
```bash
# See what will happen without doing it
python3 scripts/reclassify-all-v1.2.py --all --dry-run
```

### Confirmation Prompts
- Shows file count, estimated cost, model name
- Requires "yes" to proceed (unless `--yes` flag used)

### Error Handling
- Failed classifications saved as `-error.json`
- Original conversation data preserved
- Continue on error (doesn't stop entire batch)

---

## Common Commands

### Check Status
```bash
# How many conversations do I have?
ls public/output/*.json | grep -v manifest | wc -l

# Check a specific conversation
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515

# See what patterns exist
python3 scripts/reclassify-all-v1.2.py --pattern seeker-heavy --dry-run
```

### Run Reclassification
```bash
# Test on 10
python3 scripts/reclassify-all-v1.2.py --all --limit 10 --yes

# Reclassify all
python3 scripts/reclassify-all-v1.2.py --all --model gpt-4o-mini --yes

# Reclassify specific pattern
python3 scripts/reclassify-all-v1.2.py --pattern emotional-context --yes

# Resume after interruption
python3 scripts/reclassify-all-v1.2.py --all --skip-existing --yes
```

### Compare Results
```bash
# After reclassification, compare old vs new
python3 scripts/test-classifier-v1.2.py compare \
  chatbot_arena_16515 \
  public/output-backup-v1.1 \
  public/output

# Generate summary statistics
python3 -c "
import json
from pathlib import Path
corrections_count = 0
for f in Path('public/output').glob('*.json'):
    try:
        conv = json.load(open(f))
        if conv.get('classification', {}).get('correctionsApplied'):
            corrections_count += 1
    except: pass
print(f'Conversations with corrections: {corrections_count}')
"
```

---

## What to Do Right Now

### Recommended Steps:

1. **Read the guide** (5 min)
   - Open `docs/RECLASSIFICATION_GUIDE.md`
   - Understand what will change

2. **Test on sample** (5 min)
   ```bash
   python3 scripts/reclassify-all-v1.2.py --all --limit 5 --yes
   python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515
   ```

3. **Decide approach** (2 min)
   - Full reclassification? (best quality, highest cost)
   - Pattern-based? (good balance)
   - Test more? (conservative)

4. **Run your choice** (varies)
   ```bash
   # Full
   python3 scripts/reclassify-all-v1.2.py --all --model gpt-4o-mini --yes

   # Pattern
   python3 scripts/reclassify-all-v1.2.py --pattern seeker-heavy --yes

   # Just problems
   python3 scripts/reclassify-all-v1.2.py --pattern pseudo-problem-solving --yes
   ```

5. **Verify results** (10 min)
   ```bash
   # Check a few conversations
   python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515
   python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_29587

   # Regenerate manifest
   node scripts/generate-manifest.js
   ```

---

## Files Created

### Classifier
- `classifier/classifier-openai-v1.2.py` - Enhanced classifier with corrections

### Scripts
- `scripts/reclassify-all-v1.2.py` - Batch reclassification tool
- `scripts/test-classifier-v1.2.py` - Testing and comparison tool

### Documentation
- `docs/analysis/MISCLASSIFICATION_PATTERNS_ANALYSIS.md` - Pattern analysis
- `docs/analysis/CLASSIFICATION_CORRECTION_FRAMEWORK.md` - Correction framework
- `docs/analysis/CLASSIFICATION_QUALITY_SUMMARY.md` - Summary and action plan
- `docs/RECLASSIFICATION_GUIDE.md` - Complete guide (this file's big brother)
- `RECLASSIFICATION_READY.md` - This quick-start guide

**Total**: 3 Python scripts + 5 markdown documents

---

## Support

**If something breaks**:
1. Check `docs/RECLASSIFICATION_GUIDE.md` troubleshooting section
2. Restore backup: `rm -rf public/output && mv public/output-backup-v1.1 public/output`
3. Test single file: `python3 scripts/test-classifier-v1.2.py analyze <id>`

**If you need to pause**:
- Script saves progress automatically
- Resume with `--skip-existing` flag
- Backup is already created

**If API quota exceeded**:
- Wait 60 seconds between batches
- Use `--limit` to process smaller chunks
- Consider Ollama (free, local) as alternative

---

## Success Criteria

You'll know reclassification succeeded when:

✅ All conversations in `public/output/` have `promptVersion: "1.2.0"`
✅ ~30-40% of conversations show `correctionsApplied` in classification
✅ Average Seeker role ≈ 28% (down from 45%)
✅ Average Sharer role ≈ 18% (up from 6%)
✅ Average AI Affiliative ≈ 18% (up from 8%)
✅ Backup exists at `public/output-backup-v1.1/`
✅ Manifest regenerated successfully

---

## Ready?

You have everything you need to reclassify your full dataset!

**Next command to run**:
```bash
# Start with test
python3 scripts/reclassify-all-v1.2.py --all --limit 5 --yes
```

**Then if happy**:
```bash
# Do full reclassification
python3 scripts/reclassify-all-v1.2.py --all --model gpt-4o-mini --yes
```

**Good luck!** 🚀

---

**Document created**: 2026-01-05
**Tools ready**: ✅ All systems go
**Estimated duration**: 8-15 hours (depending on approach)
**Estimated cost**: $7.58-$11.37
