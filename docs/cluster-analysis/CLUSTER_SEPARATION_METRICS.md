# Cluster Separation Metrics

This report provides detailed metrics on cluster separation and quality.

---

## Silhouette Scores

Silhouette score measures how well-separated clusters are. Range: -1 to 1.
- **>0.5:** Strong separation
- **0.3-0.5:** Moderate separation
- **<0.3:** Weak separation (overlapping clusters)

### Overall Silhouette Score: **0.160**

⚠️ **Interpretation:** Weak separation. Clusters show significant overlap, suggesting continuous variation rather than discrete types.

### Per-Cluster Silhouette Scores

| Cluster | Mean | Std | Min | Max |
|---------|------|-----|-----|-----|
| 0 | 0.254 | 0.070 | 0.153 | 0.376 |
| 1 | 0.262 | 0.069 | 0.130 | 0.322 |
| 2 | 0.079 | 0.095 | -0.085 | 0.243 |
| 3 | 0.129 | 0.052 | 0.024 | 0.237 |
| 4 | 0.182 | 0.150 | -0.119 | 0.348 |
| 5 | 0.177 | 0.062 | 0.073 | 0.263 |
| 6 | 0.205 | 0.086 | 0.053 | 0.360 |

---

## Inter-Cluster Distances

Distances between cluster centroids in feature space.

- **Minimum Inter-Cluster Distance:** 3.726
- **Maximum Inter-Cluster Distance:** 12.919
- **Average Inter-Cluster Distance:** 9.479
- **Average Intra-Cluster Distance:** 5.180
- **Separation Ratio (Inter/Intra):** 1.830

⚠️ **Interpretation:** Moderate separation

### Pairwise Cluster Distances

| Cluster A | Cluster B | Distance |
|-----------|-----------|----------|
| 2 | 6 | 3.726 |
| 2 | 3 | 5.467 |
| 3 | 6 | 5.471 |
| 1 | 2 | 8.397 |
| 0 | 5 | 8.968 |
| 0 | 3 | 8.973 |
| 1 | 6 | 9.045 |
| 3 | 5 | 9.250 |
| 3 | 4 | 9.379 |
| 1 | 3 | 9.526 |
| 0 | 2 | 9.531 |
| 0 | 6 | 9.763 |
| 4 | 5 | 9.992 |
| 2 | 5 | 10.454 |
| 5 | 6 | 10.487 |
| 4 | 6 | 10.751 |
| 0 | 4 | 10.941 |
| 2 | 4 | 11.090 |
| 0 | 1 | 12.421 |
| 1 | 5 | 12.513 |
| 1 | 4 | 12.919 |

---

## Summary

**Overall Silhouette Score:** 0.160
**Separation Ratio:** 1.830

**Conclusion:** Mixed separation metrics. Clusters are distinguishable but with some overlap.
