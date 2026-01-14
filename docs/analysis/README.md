# Analysis Documentation

This folder contains analytical documents examining specific aspects of the data, patterns, and system behavior.

**Last Updated:** 2026-01-10  
**Dataset Status:** 569 conversations classified (333 Chatbot Arena, 186 WildChat, 32 OASST, 18 human-human)  
**New Taxonomy:** 538 conversations (94.6%) with GPT-5.2 + 2.0-social-role-theory

## Files

### Core Analysis Documents

- **ALIGNMENT_ANALYSIS.md** - Analysis of linguistic alignment (Y-axis) and document alignment
- **COLLABORATOR_TERRAIN_ANALYSIS.md** - Terrain analysis of collaborator conversations (case studies)
- **NON_SEEKER_EXPERT_ANALYSIS.md** - Analysis of non-seeker→expert conversations
- **PAD_MEANINGFUL_UNDERSTANDING_ANALYSIS.md** - Critical analysis of PAD model reliability
- **WHY_CONVERSATIONS_ARE_STATIC.md** - Analysis of why role shifts are rare
- **SPATIAL_CLUSTERING_ANALYSIS.md** - Analysis of spatial clustering patterns

### Status and Validation

- **UPDATE_STATUS.md** - Current status of analysis documents (last updated: 2026-01-09)
- **VALIDATION_REPORT.md** - Comprehensive validation of all analysis documents against current dataset

## Purpose

These documents provide:
- Deep dives into specific conversation types or patterns
- Analysis of system limitations and strengths
- Examination of data characteristics
- Insights into user behavior patterns
- Validation of claims against current dataset

## Important Notes

### Dataset Size References

Some documents reference "345 validated conversations" - this refers to a validated subset used for specific analyses. The current full classified dataset has **569 conversations** (as of 2026-01-10), with **538 conversations** using the new taxonomy (GPT-5.2 + 2.0-social-role-theory).

### Number Verification

- **✅ Confirmed:** 82.7% trajectory feature importance, 7 clusters, variance ratios (82x/41x)
- **✅ Verified:** Role distribution percentages with 538 conversations (new taxonomy only):
  - Provider→Expert-System: 34.4%
  - Information-Seeker→Expert-System: 21.2%
  - Provider dominant: 46.1%
  - Expert-System dominant: 67.1%
- **📝 Updated:** Documents updated with verified statistics from re-classified dataset

See `VALIDATION_REPORT.md` for detailed validation status.
