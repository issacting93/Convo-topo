# Sensitivity Analysis: Combined Score Weighting

This analysis tests how cluster structure changes with different weightings
of silhouette score (cluster quality) vs. balance score (distribution).

---

## Summary: Best k for Each Weighting

| Weighting (Sil/Bal) | Best k | Silhouette | Balance | Combined Score |
|---------------------|--------|------------|---------|----------------|
| 0.3/0.7 | 7 | 0.160 | 0.606 | 0.472 |
| 0.4/0.6 | 7 | 0.160 | 0.606 | 0.428 |
| 0.5/0.5 | 7 | 0.160 | 0.606 | 0.383 |
| 0.6/0.4 | 7 | 0.160 | 0.606 | 0.338 |
| 0.7/0.3 | 7 | 0.160 | 0.606 | 0.294 |
| 0.8/0.2 | 7 | 0.160 | 0.606 | 0.249 |

---

## Weighting: 0.3 Silhouette / 0.7 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.472

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.271 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.421 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.431 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.458 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.472 | 63, 44, 27, 8, 6, 6, 6 |

---

## Weighting: 0.4 Silhouette / 0.6 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.428

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.261 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.382 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.390 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.413 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.428 | 63, 44, 27, 8, 6, 6, 6 |

---

## Weighting: 0.5 Silhouette / 0.5 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.383

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.252 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.343 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.348 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.368 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.383 | 63, 44, 27, 8, 6, 6, 6 |

---

## Weighting: 0.6 Silhouette / 0.4 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.338

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.242 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.304 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.307 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.323 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.338 | 63, 44, 27, 8, 6, 6, 6 |

---

## Weighting: 0.7 Silhouette / 0.3 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.294

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.232 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.265 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.265 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.277 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.294 | 63, 44, 27, 8, 6, 6, 6 |

---

## Weighting: 0.8 Silhouette / 0.2 Balance

**Best k:** 7
**Silhouette Score:** 0.160
**Balance Score:** 0.606
**Combined Score:** 0.249

### Cluster Distribution

- **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking**: 63 conversations (39.4%)
- **Valley_FunctionalStructured_QA_InfoSeeking**: 44 conversations (27.5%)
- **SocialEmergent_Narrative_InfoSeeking**: 27 conversations (16.9%)
- **SocialEmergent_Narrative_Entertainment**: 8 conversations (5.0%)
- **MeanderingPath_Narrative_SelfExpression**: 6 conversations (3.8%)
- **Peak_Volatile_FunctionalStructured_QA_InfoSeeking**: 6 conversations (3.8%)
- **SocialEmergent_Narrative_Relational**: 6 conversations (3.8%)

### k Selection Across Weightings

| k | Silhouette | Balance | Combined | Cluster Sizes |
|---|------------|---------|----------|---------------|
| 3 | 0.203 | 0.300 | 0.223 | 112, 29, 19 |
| 4 | 0.148 | 0.537 | 0.226 | 74, 38, 29, 19 |
| 5 | 0.140 | 0.556 | 0.223 | 71, 41, 29, 14, 5 |
| 6 | 0.142 | 0.594 | 0.232 | 65, 40, 27, 13, 8, 7 |
| 7 | 0.160 | 0.606 | 0.249 | 63, 44, 27, 8, 6, 6, 6 |

---

## Insights

### Stability of k Selection

- **Most common best k:** 7 (appears in 6/6 weightings)
- **k range:** 7 - 7

✅ **Stable:** All weightings select the same k, indicating robust cluster structure.

### Cluster Name Consistency

Most common cluster patterns across weightings:

- **FunctionalStructured_QA_InfoSeeking**: appears 18 times
- **MeanderingPath_Narrative_SelfExpression**: appears 6 times
- **SocialEmergent_Narrative_Entertainment**: appears 6 times
- **SocialEmergent_Narrative_InfoSeeking**: appears 6 times
- **SocialEmergent_Narrative_Relational**: appears 6 times

