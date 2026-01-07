# Cluster Analysis Documentation

This directory contains all documentation related to path cluster analysis of conversations.

---

## Overview

Analysis of 379 classified conversations (340 reclassified with v1.2) reveals **7 distinct relational positioning archetypes** in human-AI conversations. These clusters represent systematic patterns in how conversations move through relational-affective space.

**Key Finding**: 81.8% of feature importance comes from trajectory characteristics (spatial + emotional), while categorical classification features contribute only 18.2%. This supports the thesis that **how conversations move through relational space matters more than what they're about**.

**Note**: This finding is partially circular (we cluster on trajectory features, then observe they matter). The real question is whether these trajectories correspond to meaningful conversation dynamics independent of our encoding choices—this requires external validation.

---

## Main Documents

### **[COMPREHENSIVE_CLUSTER_ANALYSIS.md](COMPREHENSIVE_CLUSTER_ANALYSIS.md)** ⭐ **Start Here**
Complete synthesis of all findings, methodology, and theoretical interpretations. Includes:
- Executive summary with key findings
- The 7 clusters (detailed descriptions)
- Feature importance analysis
- Cluster distribution analysis
- Trajectory characteristics
- Cluster separation metrics
- Theoretical interpretation
- Implications for DIS submission

### **[THEORETICAL_SYNTHESIS.md](THEORETICAL_SYNTHESIS.md)**
Connects clusters to Watzlawick's relational communication theory, interpreting them as relational positioning archetypes.

### **[FEATURE_IMPORTANCE_ANALYSIS.md](FEATURE_IMPORTANCE_ANALYSIS.md)** ⭐
Comprehensive analysis of which features drive cluster separation. Shows that trajectory features (81.8%) are most discriminative. Includes both K-Means and Hierarchical clustering results.

**Note**: Historical method-specific files archived in `../archive/cluster-analysis/`

---

## Detailed Analysis

### Cluster-Specific Analysis
- **[CLUSTER_5_DEEP_ANALYSIS.md](CLUSTER_5_DEEP_ANALYSIS.md)** - Deep dive into Cluster 5 (low drift, self-expression)

### Methodology
- **[METHODOLOGY_AND_BUG_FIXES.md](METHODOLOGY_AND_BUG_FIXES.md)** - Bug fixes and methodological improvements
- **[SENSITIVITY_ANALYSIS.md](SENSITIVITY_ANALYSIS.md)** - Robustness testing of cluster structure

### Validation
- **[CLUSTER_VALIDATION_MANUAL.md](CLUSTER_VALIDATION_MANUAL.md)** - Manual validation framework with sampled conversations
- **[CLUSTER_SEPARATION_METRICS.md](CLUSTER_SEPARATION_METRICS.md)** - Detailed separation and quality metrics

### Algorithm-Specific Results
- **[PATH_CLUSTER_ANALYSIS_KMEANS.md](PATH_CLUSTER_ANALYSIS_KMEANS.md)** - K-Means clustering results
- **[PATH_CLUSTER_ANALYSIS_HIERARCHICAL.md](PATH_CLUSTER_ANALYSIS_HIERARCHICAL.md)** - Hierarchical clustering results

### Visualizations
- **[DASHBOARD_SUMMARY.md](DASHBOARD_SUMMARY.md)** - Summary of generated dashboard visualizations
- `../dashboard/` - Dashboard images and statistics

---

## The 7 Clusters (Current Analysis - 379 conversations)

1. **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking** (29.3%)
2. **StraightPath_Stable_FunctionalStructured_Advisory_InfoSeeking** (27.2%)
3. **Valley_FunctionalStructured_QA_InfoSeeking** (15.8%)
4. **StraightPath_Stable_MinimalDrift_Narrative_SelfExpression** (14.0%)
5. **StraightPath_Stable_SocialEmergent_Narrative_Entertainment** (9.0%)
6. **SocialEmergent_Casual_Entertainment** (2.6%)
7. **Peak_Volatile_FunctionalStructured_QA_InfoSeeking** (2.1%)

**Note**: Cluster distributions have changed with expanded dataset. See `../PATH_CLUSTER_ANALYSIS_KMEANS.md` for current detailed analysis.

See `COMPREHENSIVE_CLUSTER_ANALYSIS.md` for detailed descriptions.

---

## Key Metrics

- **Overall Silhouette Score**: 0.207 (weak separation, continuous variation)
- **Feature Importance**: 81.8% trajectory, 18.2% categorical
- **Dataset**: 379 conversations (340 reclassified with v1.2)
- **Analysis Date**: 2026-01-XX (updated after v1.2 reclassification)

**Previous Analysis (2025-01-03)**:
- 160 conversations
- Silhouette: 0.160
- Feature Importance: 82.7% trajectory

**Current Analysis**: See `../PATH_CLUSTER_ANALYSIS_KMEANS.md` for most recent results.

---

## Related Documentation

- **Submissions**: `../submissions/` - DIS submission framing and guidance
- **Analysis**: `../analysis/` - Pattern emergence and spatial clustering analysis
- **Calculations**: `../calculations/` - Dimension calculations and mappings

