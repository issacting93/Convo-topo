# Feature Importance Analysis

**Analysis Date:** 2025-01-03  
**Method:** Permutation importance  
**Feature Space:** 43 features (trajectory + classification)

This analysis identifies which features are most discriminative for cluster separation across both K-Means and Hierarchical clustering methods.

---

## Key Finding: Trajectory Features Dominate

**82.7% of feature importance comes from trajectory characteristics** (spatial + emotional), while categorical classification features (pattern, purpose, tone) contribute only 17.3%. This directly supports the thesis that **how conversations move through relational space matters more than what they're about**.

---

## K-Means Clustering Results

### Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `intensity_variance` | 0.0716 | Emotional Intensity |
| 2 | `path_straightness` | 0.0625 | Spatial Trajectory |
| 3 | `drift_y` | 0.0594 | Spatial Trajectory |
| 4 | `min_intensity` | 0.0555 | Emotional Intensity |
| 5 | `final_y` | 0.0540 | Spatial Trajectory |
| 6 | `valley_count` | 0.0502 | Emotional Intensity |
| 7 | `drift_angle_sin` | 0.0489 | Spatial Trajectory |
| 8 | `path_length` | 0.0475 | Spatial Trajectory |
| 9 | `drift_angle_cos` | 0.0465 | Spatial Trajectory |
| 10 | `intensity_range` | 0.0457 | Emotional Intensity |
| 11 | `valley_density` | 0.0419 | Emotional Intensity |
| 12 | `drift_magnitude` | 0.0417 | Spatial Trajectory |
| 13 | `final_x` | 0.0348 | Spatial Trajectory |
| 14 | `drift_x` | 0.0317 | Spatial Trajectory |
| 15 | `max_intensity` | 0.0295 | Emotional Intensity |
| 16 | `avg_intensity` | 0.0269 | Emotional Intensity |
| 17 | `ai_expert` | 0.0255 | AI Role |
| 18 | `y_variance` | 0.0217 | Spatial Trajectory |
| 19 | `purpose_info` | 0.0208 | Purpose |
| 20 | `intensity_trend` | 0.0163 | Emotional Intensity |

### Feature Category Importance (K-Means)

- **Spatial Trajectory**: 0.4624 (46.2%)
- **Emotional Intensity**: 0.3652 (36.5%)
- **Purpose**: 0.0564 (5.6%)
- **AI Role**: 0.0477 (4.8%)
- **Human Role**: 0.0297 (3.0%)
- **Pattern**: 0.0226 (2.3%)
- **Tone**: 0.0112 (1.1%)
- **Structure**: 0.0049 (0.5%)

**Total Trajectory (Spatial + Emotional)**: 82.7%

---

## Hierarchical Clustering Results

### Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `drift_angle_sin` | 0.0677 | Spatial Trajectory |
| 2 | `drift_y` | 0.0662 | Spatial Trajectory |
| 3 | `tone_supportive` | 0.0636 | Tone |
| 4 | `valley_count` | 0.0587 | Emotional Intensity |
| 5 | `drift_angle_cos` | 0.0582 | Spatial Trajectory |
| 6 | `final_y` | 0.0550 | Spatial Trajectory |
| 7 | `avg_intensity` | 0.0534 | Emotional Intensity |
| 8 | `drift_x` | 0.0461 | Spatial Trajectory |
| 9 | `valley_density` | 0.0442 | Emotional Intensity |
| 10 | `drift_magnitude` | 0.0412 | Spatial Trajectory |
| 11 | `final_x` | 0.0373 | Spatial Trajectory |
| 12 | `path_straightness` | 0.0282 | Spatial Trajectory |
| 13 | `pattern_qa` | 0.0274 | Pattern |
| 14 | `min_intensity` | 0.0256 | Emotional Intensity |
| 15 | `purpose_entertainment` | 0.0238 | Purpose |
| 16 | `ai_expert` | 0.0214 | AI Role |
| 17 | `max_intensity` | 0.0205 | Emotional Intensity |
| 18 | `peak_density` | 0.0199 | Emotional Intensity |
| 19 | `y_variance` | 0.0189 | Spatial Trajectory |
| 20 | `path_length` | 0.0168 | Spatial Trajectory |

### Feature Category Importance (Hierarchical)

- **Spatial Trajectory**: 0.4467 (44.7%)
- **Emotional Intensity**: 0.2751 (27.5%)
- **Tone**: 0.0886 (8.9%)
- **Purpose**: 0.0570 (5.7%)
- **Pattern**: 0.0498 (5.0%)
- **AI Role**: 0.0412 (4.1%)
- **Human Role**: 0.0360 (3.6%)
- **Structure**: 0.0056 (0.6%)

**Total Trajectory (Spatial + Emotional)**: 72.2%

---

## Comparison: K-Means vs. Hierarchical

### Similarities

Both methods show:
- **Trajectory features dominate** (72-83% of importance)
- **Spatial trajectory** is the most important category
- **Emotional intensity** is the second most important
- **Classification features** (pattern, purpose, tone) contribute <20%

### Differences

- **K-Means**: More emphasis on emotional intensity variance (7.16% vs. 2.56%)
- **Hierarchical**: More emphasis on tone (8.86% vs. 1.12%)
- **K-Means**: `intensity_variance` is top feature
- **Hierarchical**: `drift_angle_sin` is top feature

### Interpretation

The differences reflect the clustering algorithms' sensitivities:
- **K-Means** (partition-based) emphasizes variance within clusters
- **Hierarchical** (linkage-based) emphasizes directional patterns

Both confirm the core finding: **trajectory dynamics drive cluster separation**, not categorical classification.

---

## Implications

1. **Theoretical**: Relational positioning is a fundamental dimension independent of conversational content
2. **Methodological**: Trajectory features should be prioritized in future analyses
3. **Design**: Visualization should emphasize path characteristics over categorical labels

---

## References

- See [COMPREHENSIVE_CLUSTER_ANALYSIS.md](COMPREHENSIVE_CLUSTER_ANALYSIS.md) for full cluster analysis
- See [CLUSTERING_METHODOLOGY_RESPONSE.md](CLUSTERING_METHODOLOGY_RESPONSE.md) for methodology details

