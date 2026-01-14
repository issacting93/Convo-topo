# Analysis Folder Update Status

**Last Updated:** 2026-01-10

---

## Current Dataset Status

### Classification Status (as of 2026-01-10)

**Total Classified:** 569 conversations
- **Chatbot Arena:** 333 conversations (58.5%)
- **WildChat:** 186 conversations (32.7%)
- **OASST:** 32 conversations (5.6%)
- **Cornell Movie Dialogues:** 9 conversations (1.6%) - human-human
- **Kaggle Empathetic Dialogues:** 9 conversations (1.6%) - human-human

**Classification Model:** GPT-5.2 with Social Role Theory taxonomy (12 roles: 6 human + 6 AI)

**New Taxonomy (GPT-5.2 + 2.0-social-role-theory):** 538 conversations (94.6%)
- **Chatbot Arena:** 322 with new taxonomy (96.7% of Chatbot Arena)
- **WildChat:** 184 with new taxonomy (98.9% of WildChat)
- **OASST:** 32 with new taxonomy (100% of OASST)

**Note:** Some analysis documents reference "345 validated conversations" - this refers to a validated subset used for specific analyses. The current full classified dataset has 569 conversations, with 538 using the new taxonomy.

### Updated Role Distribution (New Taxonomy Only - 538 conversations, as of 2026-01-10)

**Dominant Human Roles:**
- Provider: 46.1% (248 conversations)
- Director: 28.8% (155 conversations)
- Information-Seeker: 23.6% (127 conversations)
- Social-Expressor: 1.5% (8 conversations)

**Dominant AI Roles:**
- Expert-System: 67.1% (361 conversations)
- Advisor: 19.9% (107 conversations)
- Co-Constructor: 6.7% (36 conversations)
- Social-Facilitator: 2.8% (15 conversations)
- Relational-Peer: 2.8% (15 conversations)

**Key Role Pairs:**
- Provider→Expert-System: 34.4% (185 conversations)
- Information-Seeker→Expert-System: 21.2% (114 conversations)
- Director→Expert-System: 11.5% (62 conversations)
- Provider→Advisor: 10.0% (54 conversations)
- Director→Advisor: 7.2% (39 conversations)
- Information-Seeker/Provider/Director→Expert pairs: 67.1% (361 conversations total)

---

## Document Status

### ✅ Current and Valid

**Core Analysis Documents:**
- `SPATIAL_CLUSTERING_ANALYSIS.md` - Theoretical/descriptive analysis ✅
- `COLLABORATOR_TERRAIN_ANALYSIS.md` - Specific case studies ✅
- `PAD_MEANINGFUL_UNDERSTANDING_ANALYSIS.md` - Critical design discussion ✅
- `README.md` - Document index ✅

**These documents are mostly theoretical or case-study based, so they remain valid regardless of dataset size changes.**

---

### ⚠️ Needs Updates for Accuracy

**Documents referencing specific dataset sizes or percentages:**

1. **WHY_CONVERSATIONS_ARE_STATIC.md**
   - References "345 conversations" and "81.2% seeker→expert"
   - **Updated:** With 563 conversations, Seeker/Information-Seeker→Expert pairs are 14.0% (not 81.2%)
   - **Action:** Update percentages with verified 563 conversation dataset
   - **Priority:** HIGH

2. **NON_SEEKER_EXPERT_ANALYSIS.md**
   - References "92 conversations (26.7% of dataset)" based on 345
   - **Updated:** With 563 conversations, non-seeker→expert pairs are 484 conversations (86.0%)
   - **Action:** Update with verified percentages
   - **Priority:** MEDIUM (conclusions likely still valid)

3. **ALIGNMENT_ANALYSIS.md**
   - References "345 validated corpus" and "95% role homogeneity"
   - **Updated:** With 563 conversations, Information-Seeker→Facilitator is 39.6% (not 95%)
   - **Action:** Update role distribution claims with verified data
   - **Priority:** HIGH

---

### ✅ Methodologically Valid (Minor Updates Needed)

**These documents contain valid analysis but may reference outdated numbers:**

- Most percentages and distributions are relative, so conclusions remain valid
- Dataset size references may be from analysis subset (345) rather than full set (439)
- Key findings (82.7% trajectory feature importance, 7 clusters, variance ratios) remain confirmed

---

## Key Findings Status

### ✅ Confirmed Findings (No Updates Needed)

1. **82.7% Trajectory Feature Importance** - ✅ Validated across multiple analyses
2. **7 Archetypes/Clusters** - ✅ Confirmed in cluster analysis
3. **Variance Ratios (82x max, 41x specific pair)** - ✅ Verified in DIS submission
4. **Spatial Clustering Patterns** - ✅ Validated theoretical framework

### ⚠️ Needs Verification

1. **Role Distribution Percentages** - ✅ **VERIFIED** with 563 conversations
   - Information-Seeker→Facilitator: 39.6% (223 conversations)
   - Seeker/Information-Seeker→Expert: 14.0% (79 conversations)
   - Information-Seeker dominant role: 47.8% (269 conversations)

2. **Dataset Size Claims** - Multiple references to "345 validated"
   - Clarify: validated subset vs. full classified set (439)
   - Add date context to all size references

---

## Recent Changes

### Dataset Expansion (2026-01-10)
- **Total:** Expanded from 439 to 563 conversations (+124 conversations)
- **Chatbot Arena:** Expanded from 204 to 328 conversations (+124 conversations)
- **WildChat:** 185 conversations (unchanged)
- **OASST:** 32 conversations (unchanged)
- **Human-Human Dialogues:** 18 conversations (9 Cornell, 9 Kaggle - unchanged)

### Previous Expansion (2026-01-09)
- **Human-Human Dialogues:** 18 conversations added (9 Cornell, 9 Kaggle)
- **Chatbot Arena:** Expanded from 128-131 to 204 conversations
- **OASST:** Expanded from 2 to 32 conversations

### New Documents
- `VALIDATION_REPORT.md` - Comprehensive validation of all analysis documents

---

## Recommendations

### Priority 1: Immediate Updates
1. ✅ Update this status document
2. ✅ Verify role distribution percentages with full 563 dataset
3. ⏳ Update WHY_CONVERSATIONS_ARE_STATIC.md with verified percentages (14.0% seeker→expert, not 81.2%)
4. ⏳ Clarify "345 validated" vs "563 classified" terminology in ALIGNMENT_ANALYSIS.md

### Priority 2: Verification
1. ✅ Recalculate non-seeker→expert percentages with 563 conversations (86.0%)
2. ⏳ Verify cluster distribution percentages still hold
3. ⏳ Confirm variance ratios still accurate with expanded dataset

### Priority 3: Documentation Improvements
1. ⏳ Add "last updated" dates to all analysis documents
2. ⏳ Add dataset size context (analysis date, subset vs. full)
3. ⏳ Update cross-references between documents

---

## Notes

- **"Validated" vs "Classified":** The "345 validated" reference likely refers to conversations that passed quality validation checks, while "563 classified" refers to all conversations that have been classified. Both numbers are valid in different contexts.

- **Taxonomy Consistency:** All current classifications use GPT-5.2 with Social Role Theory (12-role taxonomy). Older percentages may be from different taxonomy versions.

- **Continuous Growth:** Dataset is actively expanding. Documents should note analysis date or reference specific dataset version for reproducibility.

---

**Status:** ⚠️ Documents are methodologically sound but some need number updates. See VALIDATION_REPORT.md for detailed validation.

