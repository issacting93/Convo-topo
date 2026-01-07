# Research Findings Summary

**Date:** 2026-01-XX  
**Status:** Current findings (reframed with limitations acknowledged)

---

## Primary Documents

- **[RESEARCH_FINDINGS_REPORT_REFRAMED.md](RESEARCH_FINDINGS_REPORT_REFRAMED.md)** - Comprehensive findings (reframed)
- **[DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md](DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md)** - DIS submission guidance
- **[FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md](FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md)** - Example conversation pairs
- **[RESEARCH_HYPOTHESIS_VALIDATION.md](RESEARCH_HYPOTHESIS_VALIDATION.md)** - Hypothesis validation with examples

---

## Key Findings

### 1. Same Destination, Different Journeys

**Core Insight:** Aggregate role classifications compress away meaningful temporal variation.

**Evidence:**
- Conversation 22853 vs 30957: Same roles (seeker→expert), 50x variance difference
- Conversation 13748 vs 30957: Same roles, 75x variance difference
- See `FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md` for detailed examples

### 2. Temporal Dynamics Revealed

**Finding:** The terrain reveals three types of temporal information:
1. User emotional engagement (volatile vs. stable paths)
2. Interaction quality (smooth vs. erratic patterns)
3. Anomalies (AI errors, breakdowns, single-message deviations)

### 3. Cluster Structure

**Observation:** 7 relational positioning archetypes identified (see `cluster-analysis/COMPREHENSIVE_CLUSTER_ANALYSIS.md`)

**Note:** Trajectory features dominate cluster separation (81.8%) when clustering on trajectory features - this is expected, not surprising.

---

## Important Caveats

- **Circularity:** We cluster on trajectory features, then observe they matter
- **Validation Gap:** No external validation that trajectories predict outcomes
- **Encoding Choices:** X, Y, Z axes are design decisions, not validated dimensions

See `RESEARCH_FINDINGS_REPORT_REFRAMED.md` for detailed limitations.

---

## For DIS Submission

See `DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md` for:
- What to use vs. avoid from research docs
- DIS submission structure recommendations
- Visual argumentation guidance
