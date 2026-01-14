# Cross-Dataset Distribution Analysis
**Date:** January 13, 2026
**Datasets:** OASST, WildChat, Chatbot Arena

---

## Dataset Statistics

### OASST

**Conversations:** 32

#### Spatial Distribution

| Dimension | Mean | Std Dev | Variance | Range |
|-----------|------|---------|----------|-------|
| X (Functional↔Social) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Y (Aligned↔Divergent) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Z (Emotional Intensity) | 0.226 | 0.067 | 0.0045 | 0.250 |

**Total Spatial Variance:** 0.0045

**Average Density (NN Distance):** 0.004

#### Quadrant Distribution

| Quadrant | Count | Percentage |
|----------|-------|------------|
| Functional-Aligned | 0 | 0.0% |
| Social-Aligned | 0 | 0.0% |
| Functional-Divergent | 0 | 0.0% |
| Social-Divergent | 32 | 100.0% |

### WildChat

**Conversations:** 63

#### Spatial Distribution

| Dimension | Mean | Std Dev | Variance | Range |
|-----------|------|---------|----------|-------|
| X (Functional↔Social) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Y (Aligned↔Divergent) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Z (Emotional Intensity) | 0.232 | 0.121 | 0.0146 | 0.424 |

**Total Spatial Variance:** 0.0146

**Average Density (NN Distance):** 0.003

#### Quadrant Distribution

| Quadrant | Count | Percentage |
|----------|-------|------------|
| Functional-Aligned | 0 | 0.0% |
| Social-Aligned | 0 | 0.0% |
| Functional-Divergent | 0 | 0.0% |
| Social-Divergent | 63 | 100.0% |

### Chatbot Arena

**Conversations:** 327

#### Spatial Distribution

| Dimension | Mean | Std Dev | Variance | Range |
|-----------|------|---------|----------|-------|
| X (Functional↔Social) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Y (Aligned↔Divergent) | 0.000 | 0.000 | 0.0000 | 0.000 |
| Z (Emotional Intensity) | 0.272 | 0.101 | 0.0103 | 0.419 |

**Total Spatial Variance:** 0.0103

**Average Density (NN Distance):** 0.002

#### Quadrant Distribution

| Quadrant | Count | Percentage |
|----------|-------|------------|
| Functional-Aligned | 0 | 0.0% |
| Social-Aligned | 0 | 0.0% |
| Functional-Divergent | 0 | 0.0% |
| Social-Divergent | 327 | 100.0% |

---

## Statistical Comparisons

### OASST vs WildChat

#### T-Tests (Mean Differences)

| Dimension | t-statistic | p-value | Significant? |
|-----------|-------------|---------|-------------|
| X | nan | nan | ❌ No |
| Y | nan | nan | ❌ No |
| Z | -0.266 | 0.790814 | ❌ No |

#### KS Tests (Distribution Similarity)

| Dimension | KS-statistic | p-value | Different? |
|-----------|--------------|---------|------------|
| X | 0.000 | 1.000000 | ❌ No |
| Y | 0.000 | 1.000000 | ❌ No |
| Z | 0.286 | 0.051017 | ❌ No |

### OASST vs Chatbot Arena

#### T-Tests (Mean Differences)

| Dimension | t-statistic | p-value | Significant? |
|-----------|-------------|---------|-------------|
| X | nan | nan | ❌ No |
| Y | nan | nan | ❌ No |
| Z | -2.512 | 0.012461 | ❌ No |

#### KS Tests (Distribution Similarity)

| Dimension | KS-statistic | p-value | Different? |
|-----------|--------------|---------|------------|
| X | 0.000 | 1.000000 | ❌ No |
| Y | 0.000 | 1.000000 | ❌ No |
| Z | 0.253 | 0.038870 | ❌ No |

### WildChat vs Chatbot Arena

#### T-Tests (Mean Differences)

| Dimension | t-statistic | p-value | Significant? |
|-----------|-------------|---------|-------------|
| X | nan | nan | ❌ No |
| Y | nan | nan | ❌ No |
| Z | -2.762 | 0.006017 | ❌ No |

#### KS Tests (Distribution Similarity)

| Dimension | KS-statistic | p-value | Different? |
|-----------|--------------|---------|------------|
| X | 0.000 | 1.000000 | ❌ No |
| Y | 0.000 | 1.000000 | ❌ No |
| Z | 0.390 | 0.000000 | ✅ Yes |

