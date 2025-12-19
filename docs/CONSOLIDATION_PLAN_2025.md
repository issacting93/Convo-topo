# Docs Consolidation Plan 2025

**Date:** 2025-01-19
**Status:** Proposed

---

## Current State Analysis

### Root Directory Issues
- **20 markdown files** in `/docs/` root - too many for easy navigation
- **Multiple redundant files** covering similar topics
- **Status reports** that should be archived
- **Unclear organization** - no clear distinction between guides, references, and technical docs

### Identified Redundancies

#### 1. Data Structure Documentation (REDUNDANT)
- `DATA_ORGANIZATION.md` (355 lines) - Comprehensive overview with diagrams
- `DATA_STRUCTURE.md` (318 lines) - Detailed folder explanation
- **Issue:** ~90% overlap, different organization styles
- **Recommendation:** Merge into single `technical/DATA_ARCHITECTURE.md`

#### 2. Classifier & Data Sources (PARTIALLY REDUNDANT)
- `CLASSIFIERS_AND_DATA_SOURCES.md` (507 lines) - Comprehensive reference
- `CONVERSATION_DATA_SOURCES.md` (69 lines) - External data source suggestions
- `QUICK_REFERENCE_CLASSIFIERS.md` (91 lines) - Quick start commands
- **Issue:** CONVERSATION_DATA_SOURCES is about finding new datasets (different purpose)
- **Issue:** QUICK_REFERENCE is a useful quick-start (should stay)
- **Recommendation:** Keep all three, but move to proper subdirectories

#### 3. Status/Completion Reports (SHOULD BE ARCHIVED)
- `CONSOLIDATION_COMPLETE.md` - Previous consolidation report
- `CONTROL_PANEL_IMPROVEMENTS.md` - Completed improvement report
- **Recommendation:** Archive both to `archive/reports/`

---

## Proposed Structure

```
docs/
├── README.md                          # Main docs index
├── QUICK_START.md                     # Keep - user-facing
├── TAXONOMY.md                        # Keep - core reference
├── SOCIOLINGUISTIC_TERMS.md          # Keep - core reference
│
├── guides/                            # User guides
│   ├── README.md
│   ├── WORKFLOW.md                    # Moved from root
│   ├── OPENAI_SETUP.md               # Keep
│   ├── RUN_CLASSIFIER.md             # Keep
│   └── QUICK_REFERENCE_CLASSIFIERS.md # Moved from root
│
├── technical/                         # Technical documentation
│   ├── README.md
│   ├── DATA_ARCHITECTURE.md          # NEW - merged DATA_ORGANIZATION + DATA_STRUCTURE
│   ├── DATA_SOURCES.md               # Keep - current data sources
│   ├── DIMENSION_MAPPING.md          # Moved from root
│   ├── VALUE_EXPLANATION.md          # Moved from root
│   ├── TERRAIN_VISUALIZATION_DATA_FLOW.md  # Moved from root
│   ├── CONVERSATION_TERRAIN_INTEGRATION.md # Moved from root
│   ├── METRICS_ANALYSIS.md           # Moved from root
│   ├── ROLE_METADATA.md              # Moved from root
│   └── API_OPTIONS.md                # Moved from root
│
├── research/                          # Research & academic
│   ├── README.md
│   ├── THERAPEUTIC_RESEARCH_PLAN.md  # Moved from root
│   ├── CONVERSATION_DATA_SOURCES.md  # Moved from root (finding new datasets)
│   ├── DIS.md                        # Keep
│   ├── DIS2026_Interactivity_Submission.md  # Keep
│   ├── DIS2026_Interactivity_Submission_Revised.md  # Keep
│   ├── DIS2026_Technical_Specs.md    # Keep
│   ├── CRITICAL_COMPUTING_AND_DESIGN_THEORY.md  # Keep
│   └── THEORETICAL_POSITIONING.md    # Keep
│
├── archive/                           # Archived files
│   ├── README.md
│   ├── reports/                      # NEW - status/completion reports
│   │   ├── CONSOLIDATION_COMPLETE.md # Moved from root
│   │   └── CONTROL_PANEL_IMPROVEMENTS.md  # Moved from root
│   ├── taxonomy-versions/
│   │   ├── taxonomy-v1.1.json
│   │   └── taxonomy-v1.0.json.backup
│   └── [... existing archive files ...]
│
└── examples/                          # Example files
    ├── README.md
    └── exampleClassificationOutput.json
```

---

## Consolidation Actions

### Phase 1: Merge Redundant Files

#### Action 1.1: Create `technical/DATA_ARCHITECTURE.md`
**Merge:**
- `DATA_ORGANIZATION.md` (focus on directory structure + data flow)
- `DATA_STRUCTURE.md` (focus on file details + usage examples)

**New structure:**
```markdown
# Data Architecture

## Overview
[High-level summary]

## Directory Structure
[Combined from both files]

## Data Flow
[From DATA_ORGANIZATION]

## File Details
[From DATA_STRUCTURE]

## Usage Examples
[From DATA_STRUCTURE]

## Quick Reference
[Combined from both]
```

**Delete after merge:**
- `DATA_ORGANIZATION.md`
- `DATA_STRUCTURE.md`

---

### Phase 2: Organize by Category

#### Action 2.1: Move to `guides/`
- `WORKFLOW.md` (root → guides/)
- `QUICK_REFERENCE_CLASSIFIERS.md` (root → guides/)

#### Action 2.2: Move to `technical/`
- `DIMENSION_MAPPING.md`
- `VALUE_EXPLANATION.md`
- `TERRAIN_VISUALIZATION_DATA_FLOW.md`
- `CONVERSATION_TERRAIN_INTEGRATION.md`
- `METRICS_ANALYSIS.md`
- `ROLE_METADATA.md`
- `API_OPTIONS.md`

#### Action 2.3: Move to `research/`
- `THERAPEUTIC_RESEARCH_PLAN.md`
- `CONVERSATION_DATA_SOURCES.md` (external datasets)

#### Action 2.4: Move to `archive/reports/`
- `CONSOLIDATION_COMPLETE.md`
- `CONTROL_PANEL_IMPROVEMENTS.md`

---

### Phase 3: Update Index Files

#### Action 3.1: Update `docs/README.md`
Add clear navigation structure:
```markdown
# Documentation

## Quick Start
- [Quick Start Guide](QUICK_START.md) - Get up and running
- [Workflow Guide](guides/WORKFLOW.md) - Development workflow
- [Classifier Quick Reference](guides/QUICK_REFERENCE_CLASSIFIERS.md)

## Core Reference
- [Taxonomy](TAXONOMY.md) - Classification taxonomy
- [Sociolinguistic Terms](SOCIOLINGUISTIC_TERMS.md)

## Guides
See [guides/](guides/) for detailed guides

## Technical Documentation
See [technical/](technical/) for architecture & implementation details

## Research
See [research/](research/) for academic papers & research plans

## Examples
See [examples/](examples/) for example data
```

#### Action 3.2: Create/Update Subdirectory READMEs
- `guides/README.md` - Index of all guides
- `technical/README.md` - Index of technical docs
- Update `research/README.md` - Add new files

---

### Phase 4: Clean Up References

#### Action 4.1: Update Links
Search and update all markdown links that reference moved files:
```bash
# Find all broken links
grep -r "docs/DATA_ORGANIZATION" .
grep -r "docs/WORKFLOW" .
# etc.
```

#### Action 4.2: Update Main Project README
Update `/Users/zac/Downloads/Cartography/README.md` if it references any moved docs

---

## File Count Comparison

### Before
```
docs/                     20 files
docs/guides/               2 files
docs/technical/            1 file
docs/research/             7 files
docs/archive/             20 files
docs/examples/             1 file
────────────────────────────────
Total:                    51 files
```

### After
```
docs/                      3 files (README, QUICK_START, TAXONOMY, SOCIOLINGUISTIC_TERMS)
docs/guides/               5 files
docs/technical/           10 files
docs/research/             9 files
docs/archive/             22 files (+2 in reports/)
docs/examples/             1 file
────────────────────────────────
Total:                    50 files (-1 from merge)
```

**Improvement:**
- Root directory: 20 → 4 files (80% reduction)
- Better organization by purpose
- Clearer navigation

---

## Benefits

### 1. Easier Navigation
- Root has only essential user-facing docs
- Clear categories (guides, technical, research)
- Subdirectory READMEs provide indexes

### 2. Better Discoverability
- New users see QUICK_START immediately
- Developers find technical docs in one place
- Researchers find papers in dedicated folder

### 3. Reduced Redundancy
- DATA_ORGANIZATION + DATA_STRUCTURE merged
- Completion reports archived
- No duplicate information

### 4. Maintainability
- Clear categories prevent future clutter
- Easier to know where new docs belong
- Archive pattern established

---

## Migration Checklist

- [ ] Phase 1: Merge redundant files
  - [ ] Create `technical/DATA_ARCHITECTURE.md`
  - [ ] Delete `DATA_ORGANIZATION.md`
  - [ ] Delete `DATA_STRUCTURE.md`

- [ ] Phase 2: Move files to categories
  - [ ] Move guides/ files
  - [ ] Move technical/ files
  - [ ] Move research/ files
  - [ ] Move archive/reports/ files

- [ ] Phase 3: Update indexes
  - [ ] Update `docs/README.md`
  - [ ] Update `guides/README.md`
  - [ ] Create `technical/README.md`
  - [ ] Update `research/README.md`

- [ ] Phase 4: Fix references
  - [ ] Search for broken links
  - [ ] Update all references
  - [ ] Test navigation

- [ ] Phase 5: Verify
  - [ ] Check all links work
  - [ ] Verify no broken references
  - [ ] Review final structure

---

## Timeline

**Estimated Time:** 30-45 minutes

1. Merge redundant files (10 min)
2. Move files to categories (10 min)
3. Update READMEs (10 min)
4. Fix references (10 min)
5. Verification (5 min)

---

## Risks & Mitigations

### Risk: Broken Links
**Mitigation:** Search all markdown files for references before/after

### Risk: Git History
**Mitigation:** Use `git mv` to preserve file history

### Risk: External References
**Mitigation:** Check if any external docs link to these files

---

## Notes

- Keep CONSOLIDATION_COMPLETE.md in archive as reference for previous work
- CONVERSATION_DATA_SOURCES.md stays separate (different purpose - finding new data)
- QUICK_REFERENCE_CLASSIFIERS.md stays separate (different audience - quick reference)
- No files are deleted, only merged or moved

