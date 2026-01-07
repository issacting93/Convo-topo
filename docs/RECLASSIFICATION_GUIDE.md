# Reclassification Guide - v1.2 with Corrections

**Date Created**: 2026-01-05
**Purpose**: Reclassify all 379 conversations with enhanced v1.2 classifier
**Estimated Time**: 12-15 hours (with API delays)
**Estimated Cost**: $7.58-$11.37 (379 conversations × $0.02-0.03/each)

---

## What's New in v1.2

### Enhanced Classification Prompt
- Added 4 new human roles: `teacher-evaluator`, `philosophical-explorer`, `artist`, `tester`
- Added 3 new AI roles: `learner`, `creative-partner`, `unable-to-engage`
- Added 2 new interaction patterns: `philosophical-dialogue`, `artistic-expression`
- Added 4 new purposes: `emotional-processing`, `collaborative-refinement`, `capability-exploration`
- Added 1 new engagement style: `directive-iterative`
- Added 1 new knowledge exchange: `meaning-making`

### Post-Processing Corrections
1. **Pseudo-Problem-Solving Detection**
   - Detects: 3+ questions + high arousal (>0.5) + low AI helpfulness
   - Corrections: Purpose → emotional-processing, Sharer +25%, Affiliative +20%

2. **Collaboration Detection**
   - Detects: 2+ feedback keywords + 2+ refinement cycles
   - Corrections: Collaborator +25%, Director +15%, AI Learner +20%

3. **Seeker-Sharer Rebalancing**
   - Detects: Seeker > 50% + 2+ personal disclosures
   - Corrections: Sharer boost based on PAD arousal values

4. **Emotional Context Integration**
   - Detects: High arousal (>0.5) + low Affiliative (<15%)
   - Corrections: AI Affiliative boost proportional to arousal

---

## Pre-Flight Checklist

### ✅ Prerequisites

- [ ] OpenAI API key set (`OPENAI_API_KEY` in environment or `.env`)
- [ ] Python 3.7+ with `openai` package installed
- [ ] Sufficient API quota (~$10-15 recommended)
- [ ] Disk space for backup (~50-100 MB)
- [ ] Current working directory is project root

### 🔍 Verify Setup

```bash
# Check API key
if [ -n "$OPENAI_API_KEY" ]; then
  echo "✅ API key is set"
else
  echo "❌ API key is NOT set"
fi

# Check Python packages
python3 -c "import openai; print('✅ openai package installed')" 2>/dev/null || echo "❌ Run: pip install openai"

# Check classifier exists
ls classifier/classifier-openai-v1.2.py && echo "✅ v1.2 classifier found" || echo "❌ Classifier not found"

# Count conversations
echo "Current conversations: $(ls public/output/*.json 2>/dev/null | grep -v manifest | wc -l)"
```

---

## Step-by-Step Process

### Step 1: Test on Sample (Recommended)

Before reclassifying all 379 conversations, test on a small sample:

```bash
# Test on 5 conversations (dry run first)
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --limit 5 \
  --dry-run

# Actually run test
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --limit 5 \
  --model gpt-4o-mini \
  --yes

# Check results
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515
```

**Expected output**:
- Shows conversation analysis with corrections applied
- Should see patterns like "pseudo-problem-solving" or "collaboration" if detected
- Role distributions should be more balanced

**If test succeeds**: Proceed to Step 2
**If test fails**: Check error messages, verify API key, try different model

---

### Step 2: Reclassify Specific Patterns (Optional)

If you want to reclassify only conversations with specific issues:

```bash
# Reclassify only pseudo-problem-solving conversations
python3 scripts/reclassify-all-v1.2.py \
  --pattern pseudo-problem-solving \
  --model gpt-4o-mini \
  --yes

# Reclassify seeker-heavy conversations
python3 scripts/reclassify-all-v1.2.py \
  --pattern seeker-heavy \
  --model gpt-4o-mini \
  --yes

# Reclassify collaboration patterns
python3 scripts/reclassify-all-v1.2.py \
  --pattern collaboration \
  --model gpt-4o-mini \
  --yes

# Reclassify emotional-context issues
python3 scripts/reclassify-all-v1.2.py \
  --pattern emotional-context \
  --model gpt-4o-mini \
  --yes
```

**Estimated counts** (based on sample analysis):
- `pseudo-problem-solving`: ~15-20% (~57-76 conversations)
- `seeker-heavy`: ~75% (~284 conversations)
- `collaboration`: ~10-15% (~38-57 conversations)
- `emotional-context`: ~40-50% (~152-190 conversations)

---

### Step 3: Full Reclassification

Reclassify all 379 conversations:

```bash
# Dry run first (see what will happen)
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --model gpt-4o-mini \
  --dry-run

# Actual reclassification
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --model gpt-4o-mini \
  --yes
```

**What happens**:
1. Creates backup at `public/output-backup-v1.1/`
2. Reclassifies each conversation with v1.2
3. Saves results back to `public/output/`
4. Regenerates manifest.json
5. Shows summary statistics

**Duration estimates**:
- With `gpt-4o-mini`: ~8-12 hours (with rate limiting)
- With `gpt-4`: ~15-20 hours (slower but potentially more accurate)

**Cost estimates**:
- `gpt-4o-mini`: ~$7.58 (379 × $0.02)
- `gpt-4`: ~$11.37 (379 × $0.03)

---

### Step 4: Verify Results

After reclassification completes:

```bash
# Check sample conversations
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_1882
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_0440

# Compare old vs new (requires backup)
python3 scripts/test-classifier-v1.2.py compare \
  chatbot_arena_16515 \
  public/output-backup-v1.1 \
  public/output

# Check for corrections applied
grep -r "correctionsApplied" public/output/*.json | wc -l
```

**Expected improvements**:
- Seeker role average: 45% → 28%
- Sharer role average: 6% → 18%
- AI Affiliative average: 8% → 18%
- Conversations with corrections: ~30-40%

---

## Troubleshooting

### Issue: API Rate Limit (429 errors)

**Symptoms**:
```
❌ API quota exceeded - please wait or use different key
```

**Solutions**:
1. Wait 60 seconds and resume from where it stopped
2. Use `--limit` to process in smaller batches
3. Increase delay between requests (modify `time.sleep(0.3)` to higher value)

**Resume after rate limit**:
```bash
# The script automatically saves progress
# Just re-run with --skip-existing to continue
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --model gpt-4o-mini \
  --skip-existing \
  --yes
```

---

### Issue: Classification Errors

**Symptoms**:
```
❌ Classification failed: chatbot_arena_XXXXX.json
```

**Solutions**:
1. Check if `-error.json` file was created
2. Read error message in that file
3. If it's a timeout, increase timeout in script
4. If it's malformed JSON, report to API provider

**Check error files**:
```bash
# List all error files
ls public/output/*-error.json

# Check specific error
cat public/output/chatbot_arena_XXXXX-error.json | jq '.classificationError'
```

---

### Issue: Out of Quota

**Symptoms**:
```
insufficient_quota: You exceeded your current quota
```

**Solutions**:
1. Wait until quota resets (usually monthly)
2. Add more credits to OpenAI account
3. Use different API key
4. Use Ollama (free but slower): See section below

---

### Issue: Want to Restore Backup

**If something goes wrong**:

```bash
# Restore from backup
rm -rf public/output
mv public/output-backup-v1.1 public/output

# Regenerate manifest
node scripts/generate-manifest.js

echo "✅ Restored to v1.1 classifications"
```

---

## Alternative: Use Ollama (Free, Local)

If you want to avoid API costs or are rate-limited:

```bash
# Install Ollama first: https://ollama.ai

# Pull a model
ollama pull llama3.2

# Create Ollama version of v1.2 classifier
# (Copy classifier-openai-v1.2.py and modify to use Ollama API)

# Or use existing Ollama classifier + manual corrections
python3 scripts/batch-classify-unclassified.py \
  --selected \
  --ollama \
  --model llama3.2
```

**Note**: Ollama is free but:
- Slower (2-3x longer)
- May have different classification patterns
- Requires local compute resources
- Corrections will still be applied

---

## Batch Processing Strategies

### Strategy 1: Small Batches (Safest)

Process in batches of 50 conversations:

```bash
# Batch 1: First 50
python3 scripts/reclassify-all-v1.2.py --all --limit 50 --yes

# Batch 2: Next 50 (skip existing)
python3 scripts/reclassify-all-v1.2.py --all --limit 100 --skip-existing --yes

# Continue until done
```

**Advantages**:
- Can stop/resume easily
- Faster feedback
- Lower risk if something breaks

**Disadvantages**:
- More manual steps
- Takes longer overall

---

### Strategy 2: Overnight Run (Fastest)

Run entire batch overnight:

```bash
# Start in screen/tmux session
screen -S reclassify

# Run full batch
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --model gpt-4o-mini \
  --yes \
  2>&1 | tee reclassify.log

# Detach with Ctrl-A D
# Reattach later with: screen -r reclassify
```

**Advantages**:
- Hands-off
- Completes while you sleep
- Single command

**Disadvantages**:
- Must handle rate limits automatically
- Harder to monitor progress

---

### Strategy 3: Pattern-Based (Targeted)

Focus on high-impact patterns first:

```bash
# 1. Fix seeker-heavy (biggest issue, ~75%)
python3 scripts/reclassify-all-v1.2.py \
  --pattern seeker-heavy \
  --model gpt-4o-mini \
  --yes

# 2. Fix emotional-context (common, ~40-50%)
python3 scripts/reclassify-all-v1.2.py \
  --pattern emotional-context \
  --model gpt-4o-mini \
  --yes

# 3. Fix remaining with --all
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --skip-existing \
  --model gpt-4o-mini \
  --yes
```

**Advantages**:
- Fixes most important issues first
- Can stop early if needed
- Shows immediate improvement

**Disadvantages**:
- Some overlap (conversation may match multiple patterns)
- Requires multiple runs

---

## Post-Reclassification Tasks

### 1. Generate Comparison Report

```bash
# Create script to compare distributions
python3 << 'EOF'
import json
from pathlib import Path
from collections import defaultdict

def analyze_directory(dir_path):
    stats = {
        'human_roles': defaultdict(list),
        'ai_roles': defaultdict(list),
        'purposes': defaultdict(int),
        'corrections': defaultdict(int)
    }

    for f in Path(dir_path).glob('*.json'):
        if f.name == 'manifest.json':
            continue
        try:
            conv = json.load(open(f))
            classification = conv.get('classification', {})

            # Human roles
            for role, pct in classification.get('humanRole', {}).get('distribution', {}).items():
                stats['human_roles'][role].append(pct)

            # AI roles
            for role, pct in classification.get('aiRole', {}).get('distribution', {}).items():
                stats['ai_roles'][role].append(pct)

            # Purpose
            purpose = classification.get('conversationPurpose', {}).get('category')
            if purpose:
                stats['purposes'][purpose] += 1

            # Corrections
            for correction in classification.get('correctionsApplied', []):
                stats['corrections'][correction] += 1
        except:
            pass

    return stats

print("Analyzing v1.1 (backup)...")
old_stats = analyze_directory('public/output-backup-v1.1')

print("Analyzing v1.2 (current)...")
new_stats = analyze_directory('public/output')

print("\n" + "="*60)
print("COMPARISON REPORT")
print("="*60)

print("\nHuman Role Averages:")
for role in set(list(old_stats['human_roles'].keys()) + list(new_stats['human_roles'].keys())):
    old_avg = sum(old_stats['human_roles'].get(role, [])) / max(1, len(old_stats['human_roles'].get(role, [])))
    new_avg = sum(new_stats['human_roles'].get(role, [])) / max(1, len(new_stats['human_roles'].get(role, [])))
    delta = new_avg - old_avg
    symbol = "↑" if delta > 0 else "↓" if delta < 0 else "="
    print(f"  {role:20s}: {old_avg:.2%} → {new_avg:.2%} ({symbol}{abs(delta):.2%})")

print("\nAI Role Averages:")
for role in set(list(old_stats['ai_roles'].keys()) + list(new_stats['ai_roles'].keys())):
    old_avg = sum(old_stats['ai_roles'].get(role, [])) / max(1, len(old_stats['ai_roles'].get(role, [])))
    new_avg = sum(new_stats['ai_roles'].get(role, [])) / max(1, len(new_stats['ai_roles'].get(role, [])))
    delta = new_avg - old_avg
    symbol = "↑" if delta > 0 else "↓" if delta < 0 else "="
    print(f"  {role:20s}: {old_avg:.2%} → {new_avg:.2%} ({symbol}{abs(delta):.2%})")

print("\nCorrections Applied:")
for correction, count in sorted(new_stats['corrections'].items(), key=lambda x: x[1], reverse=True):
    print(f"  {correction:30s}: {count:3d} conversations")

total_with_corrections = sum(new_stats['corrections'].values())
print(f"\nTotal conversations with corrections: {total_with_corrections}")

EOF
```

---

### 2. Regenerate Spatial Coordinates

After reclassification, regenerate PAD paths and spatial coordinates:

```bash
# Regenerate manifest
node scripts/generate-manifest.js

# If you have PAD regeneration scripts
# python3 scripts/regenerate-pad-for-low-diversity.py

# Restart dev server to see changes
npm run dev
```

---

### 3. Update Documentation

Document the reclassification in your research notes:

```markdown
## Reclassification v1.2 - [Date]

**Conversations processed**: 379
**Corrections applied**: ~XXX conversations (XX%)
**Duration**: XX hours
**Cost**: $X.XX

**Key improvements**:
- Seeker role: 45% → 28% (-17%)
- Sharer role: 6% → 18% (+12%)
- AI Affiliative: 8% → 18% (+10%)

**Patterns detected**:
- Pseudo-problem-solving: XX conversations
- Collaboration: XX conversations
- Emotional-context: XX conversations

**Files changed**: All in public/output/
**Backup location**: public/output-backup-v1.1/
```

---

## FAQ

### Q: Should I reclassify all conversations or just problematic ones?

**A**: Recommended approach:
1. Test on 10 conversations first
2. If improvements look good, reclassify patterns (seeker-heavy, emotional-context)
3. Evaluate impact on visualization
4. If satisfied, reclassify all

**Full reclassification benefits**:
- Consistent taxonomy (everyone uses same 10+9 roles)
- All corrections applied uniformly
- Cleaner dataset for research

**Pattern-only benefits**:
- Cheaper (~40-50% of conversations)
- Faster
- Targets known issues

---

### Q: What if I want to keep v1.1 and v1.2 separate?

```bash
# Reclassify to different directory
python3 scripts/reclassify-all-v1.2.py \
  --all \
  --output-dir public/output-v1.2 \
  --no-backup \
  --yes

# Now you have:
# - public/output/ (v1.1 original)
# - public/output-v1.2/ (v1.2 with corrections)

# Compare them side-by-side
python3 scripts/test-classifier-v1.2.py compare \
  chatbot_arena_16515 \
  public/output \
  public/output-v1.2
```

---

### Q: Can I reclassify just my own conversations (not Chatbot Arena)?

```bash
# If your conversations are in conversations-selected/
python3 scripts/batch-classify-unclassified.py \
  --selected \
  --model gpt-4o-mini \
  --yes

# They'll automatically use v1.2 if you update classifier-openai.py
# Or explicitly use v1.2 classifier
```

---

### Q: How do I know if corrections are working?

Check a few known problematic conversations:

```bash
# Medical advice (should detect pseudo-problem-solving)
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_16515

# Look for:
# - Corrections Applied: ['pseudo-problem-solving']
# - Purpose: emotional-processing (not information-seeking)
# - Sharer role: >20%

# Puzzle refinement (should detect collaboration)
python3 scripts/test-classifier-v1.2.py analyze chatbot_arena_29587

# Look for:
# - Corrections Applied: ['collaboration']
# - Collaborator role: >20%
# - AI Learner role: >15%
```

---

## Next Steps After Reclassification

1. **Regenerate visualizations** - New role distributions may shift clusters
2. **Update cluster analysis** - Rerun clustering with new coordinates
3. **Validate research findings** - Check if conclusions still hold
4. **Document changes** - Update papers/presentations with new data
5. **Archive v1.1** - Keep backup for reproducibility

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error logs in `reclassify.log`
3. Test single conversation: `python3 scripts/test-classifier-v1.2.py analyze <id>`
4. Check GitHub issues: https://github.com/anthropics/claude-code/issues

---

**Document Version**: 1.0
**Last Updated**: 2026-01-05
**Related Docs**:
- [MISCLASSIFICATION_PATTERNS_ANALYSIS.md](./analysis/MISCLASSIFICATION_PATTERNS_ANALYSIS.md)
- [CLASSIFICATION_CORRECTION_FRAMEWORK.md](./analysis/CLASSIFICATION_CORRECTION_FRAMEWORK.md)
- [CLASSIFICATION_QUALITY_SUMMARY.md](./analysis/CLASSIFICATION_QUALITY_SUMMARY.md)
