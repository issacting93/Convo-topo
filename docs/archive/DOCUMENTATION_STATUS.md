# Documentation Status & Inconsistencies

## Summary

The codebase currently has **two classification systems**:

1. **Rule-based system** (described in `CALCULATION_FORMULAS.md`)
   - Uses algorithmic calculations with thresholds
   - Old role names: `initiator`, `responder`, `listener`, `companion`
   - Currently NOT implemented in code

2. **LLM-based classifier** (v1.1 in `classifier-v1.1.py/ts`)
   - Uses Claude/Anthropic API for classification
   - New role names: `director`, `challenger`, `reflector`, `affiliative`
   - Currently implemented and aligned with `taxonomy.json`

## Documentation Files Status

### ✅ Up-to-Date (Match Current System)

| File | Status | Notes |
|------|--------|-------|
| `taxonomy.json` | ✅ Current | Matches classifier prompt v1.1 definitions |
| `classifier-v1.1.py` | ✅ Current | Uses new role taxonomy |
| `classifier-v1.1.ts` | ✅ Current | Uses new role taxonomy |
| `src/data/prompt.ts` | ✅ Current | Minimal prompt (references full definitions) |
| `WORKFLOW.md` | ✅ Current | Describes classifier → visualization workflow |
| `README-v1.1.md` | ✅ Current | Classifier documentation |

### ⚠️ Needs Update (Old System References)

| File | Issue | What Needs Changing |
|------|-------|---------------------|
| `CALCULATION_FORMULAS.md` | Old role names | Update humanRole (dim 9) and aiRole (dim 10) sections |
| `FORMULA_QUICK_REFERENCE.md` | Old role names | Update role sections (9-10) |
| `ROLE_METADATA.md` | Old role names + rule-based | Update to LLM-based classification |
| `TAXONOMY.md` | Old role names | Update humanRole and aiRole sections |
| `ORGANIZATION_ANALYSIS.md` | Different categorization | Uses old 8-category system, not 10-dim classifier |

## Key Inconsistencies

### 1. Role Names Mismatch

**Old System:**
- Human: `seeker`, `learner`, `sharer`, `responder`, `initiator`, `collaborator`
- AI: `expert`, `advisor`, `listener`, `companion`, `facilitator`, `peer`

**New System (v1.1):**
- Human: `seeker`, `learner`, `director`, `collaborator`, `sharer`, `challenger`
- AI: `expert`, `advisor`, `facilitator`, `reflector`, `peer`, `affiliative`

**Changes:**
- ❌ Removed: `initiator`, `responder` (human)
- ✅ Added: `director`, `challenger` (human)
- ❌ Removed: `listener`, `companion` (AI)
- ✅ Added: `reflector`, `affiliative` (AI)

### 2. Classification Method Mismatch

**Old System (Rule-based):**
- Algorithmic calculations with thresholds
- Keyword matching
- Ratio calculations
- Deterministic outputs

**New System (LLM-based):**
- Claude API classification
- Context-aware analysis
- Evidence-based with quotes
- Probabilistic role distributions

### 3. Output Format Mismatch

**Old System:**
- Single category per dimension
- Simple key-value pairs

**New System:**
- Single category for dimensions 1-8
- **Probability distributions** for dimensions 9-10 (roles)
- Includes confidence scores, evidence quotes, alternatives

## Recommendations

### Option 1: Update All Docs to Match Classifier v1.1 (Recommended)

Update all documentation to reflect:
1. LLM-based classification approach
2. New role taxonomy (director, challenger, reflector, affiliative)
3. Distribution-based role outputs
4. Evidence and confidence scoring

**Files to update:**
- `CALCULATION_FORMULAS.md` → Rename to `CLASSIFIER_APPROACH.md` or archive
- `FORMULA_QUICK_REFERENCE.md` → Update role sections
- `ROLE_METADATA.md` → Update to v1.1 taxonomy
- `TAXONOMY.md` → Update role dimensions

### Option 2: Archive Old System, Create New Docs

1. Move rule-based docs to `docs/archive/`
2. Create new docs for LLM-based system
3. Add clear note about which system is current

### Option 3: Dual Documentation

Keep both systems documented but clearly separate:
- `docs/rule-based/` - Old algorithmic approach
- `docs/llm-based/` - Current classifier v1.1

## Current Active System

**✅ The classifier v1.1 (LLM-based) is the current system:**
- Used in `classifier-v1.1.py` and `classifier-v1.1.ts`
- Taxonomy in `taxonomy.json` matches prompt definitions
- Role definitions align across codebase

**❌ The rule-based formulas are NOT currently used:**
- Described in `CALCULATION_FORMULAS.md`
- May have been an earlier approach or alternative
- Should be archived or clearly marked as "alternative approach"

## Action Items

1. **Immediate**: Update `TAXONOMY.md` and `ROLE_METADATA.md` with new role names
2. **Short-term**: Decide fate of `CALCULATION_FORMULAS.md` (archive or update)
3. **Medium-term**: Align all documentation with classifier v1.1 approach
4. **Long-term**: Consider if rule-based formulas should be implemented as fallback

## Quick Fix: Update Role Names

If you want a quick fix to align documentation:

```bash
# Replace old role names in documentation
sed -i '' 's/initiator/director/g' *.md
sed -i '' 's/responder/challenger/g' *.md  # Note: This may need manual review
sed -i '' 's/listener/reflector/g' *.md
sed -i '' 's/companion/affiliative/g' *.md
```

**⚠️ Warning**: `responder` → `challenger` mapping is NOT direct. `responder` doesn't have a direct equivalent in new taxonomy. Review manually.

## Documentation Structure Recommendation

```
docs/
├── classifier/
│   ├── README-v1.1.md (current)
│   ├── prompt-definitions.md (extracted from classifier)
│   └── taxonomy-v1.1.json
├── visualization/
│   ├── terrain-system.md
│   └── data-mapping.md
├── archive/
│   ├── rule-based-formulas.md (old CALCULATION_FORMULAS.md)
│   └── old-taxonomy.md
└── README.md (overview)
```

