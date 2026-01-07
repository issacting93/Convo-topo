# Cluster Analysis Dashboard Summary

**Generated:** 2025-01-03  
**Total Conversations:** 160  
**Clusters:** 7 relational positioning archetypes

---

## 📊 Visualizations

All visualizations are available in `docs/dashboard/`:

### 1. Cluster Distribution
**File:** `cluster-distribution.png`

Shows the size and proportion of each cluster:
- **Bar chart:** Number of conversations per cluster
- **Pie chart:** Percentage distribution

**Key Insight:** 66.9% of conversations cluster into functional/structured patterns (Clusters 1, 2, 6), while 25.7% engage in social/emergent relational work (Clusters 3, 4, 7).

### 2. Trajectory Comparison
**File:** `trajectory-comparison.png`

Compares 6 key trajectory characteristics across all clusters:
- Average Emotional Intensity
- Path Straightness
- Drift Magnitude
- Intensity Variance
- Valley Density
- Peak Density

**Key Insight:** Clusters show distinct trajectory profiles:
- **Cluster 1:** High straightness (0.819), stable intensity
- **Cluster 2:** Lower straightness (0.542), higher valley density
- **Cluster 5:** Very low straightness (0.166), minimal drift

### 3. Relational Positioning Map
**File:** `relational-positioning-map.png`

2D scatter plot showing where each cluster positions itself in relational space:
- **X-axis:** Functional (left) ↔ Social (right)
- **Y-axis:** Structured (bottom) ↔ Emergent (top)
- **Bubble size:** Cluster size

**Key Insight:** Clear separation between:
- **Functional/Structured quadrant:** Clusters 1, 2, 6 (bottom-left)
- **Social/Emergent quadrant:** Clusters 3, 4, 7 (top-right)
- **Center:** Cluster 5 (self-expression, minimal positioning)

### 4. Feature Importance
**File:** `feature-importance.png`

Top 15 most discriminative features for cluster separation.

**Key Insight:** Trajectory features dominate:
- `intensity_variance` (7.16%)
- `path_straightness` (6.25%)
- `drift_y` (5.94%)
- Spatial + Emotional features = 82.7% of importance

### 5. Comparison Matrix
**File:** `comparison-matrix.png`

Heatmap showing normalized values of key trajectory features across clusters.

**Key Insight:** Visual comparison of how clusters differ in:
- Emotional intensity patterns
- Path characteristics
- Drift behavior

---

## 📈 Statistics Summary

### Cluster Sizes

| Cluster | Size | Percentage |
|---------|------|------------|
| StraightPath_Stable_FunctionalStructured_QA_InfoSeeking | 63 | 39.4% |
| Valley_FunctionalStructured_QA_InfoSeeking | 44 | 27.5% |
| SocialEmergent_Narrative_InfoSeeking | 27 | 16.9% |
| SocialEmergent_Narrative_Entertainment | 8 | 5.0% |
| MeanderingPath_Narrative_SelfExpression | 6 | 3.8% |
| Peak_Volatile_FunctionalStructured_QA_InfoSeeking | 6 | 3.8% |
| SocialEmergent_Narrative_Relational | 6 | 3.8% |

### Trajectory Characteristics (Mean ± Std)

| Cluster | Avg Intensity | Path Straightness | Drift Magnitude | Intensity Variance |
|---------|---------------|-------------------|-----------------|-------------------|
| Cluster 1 | 0.426 ± 0.043 | 0.819 ± 0.149 | 0.604 ± 0.035 | 0.002 ± 0.002 |
| Cluster 2 | 0.384 ± 0.060 | 0.542 ± 0.124 | 0.613 ± 0.033 | 0.007 ± 0.003 |
| Cluster 3 | 0.403 ± 0.049 | 0.614 ± 0.206 | 0.463 ± 0.062 | 0.005 ± 0.006 |
| Cluster 4 | 0.386 ± 0.051 | 0.603 ± 0.208 | 0.543 ± 0.096 | 0.005 ± 0.005 |
| Cluster 5 | 0.502 ± 0.065 | 0.166 ± 0.266 | 0.148 ± 0.230 | 0.003 ± 0.001 |
| Cluster 6 | 0.465 ± 0.059 | 0.435 ± 0.049 | 0.622 ± 0.028 | 0.012 ± 0.003 |
| Cluster 7 | 0.416 ± 0.082 | 0.541 ± 0.190 | 0.434 ± 0.066 | 0.004 ± 0.003 |

### Pattern Distribution

| Pattern | Count | Percentage |
|--------|-------|------------|
| Question-Answer | 107 | 66.9% |
| Storytelling | 41 | 25.6% |
| Advisory | 8 | 5.0% |
| Casual-Chat | 4 | 2.5% |

### Purpose Distribution

| Purpose | Count | Percentage |
|---------|-------|------------|
| Information-Seeking | 133 | 83.1% |
| Entertainment | 8 | 5.0% |
| Self-Expression | 6 | 3.8% |
| Relationship-Building | 6 | 3.8% |
| Problem-Solving | 7 | 4.4% |

---

## 🔍 Key Comparisons

### Functional vs. Social Clusters

**Functional Clusters (66.9%):**
- Higher path straightness (0.542-0.819)
- Strong functional drift (final_x: 0.060-0.073)
- Lower emotional variability
- Dominated by Q&A pattern

**Social Clusters (25.7%):**
- Moderate path straightness (0.541-0.614)
- Strong social drift (final_x: 0.907-0.931)
- Higher emotional variability
- Dominated by storytelling pattern

### Stable vs. Volatile Clusters

**Stable Clusters:**
- Low intensity variance (<0.003)
- Predictable emotional frame
- Examples: Clusters 1, 5

**Volatile Clusters:**
- High intensity variance (>0.01)
- Unstable emotional frame
- Example: Cluster 6 (peak_volatile)

### High vs. Low Drift

**High Drift (>0.6):**
- Strong relational positioning
- Clear functional or social orientation
- Examples: Clusters 1, 2, 6

**Low Drift (<0.2):**
- Minimal relational positioning
- Stays near origin
- Example: Cluster 5 (self-expression)

---

## 📊 Statistical Insights

### 1. Dominant Pattern: Functional/Structured Q&A
- **66.9%** of conversations are functional/structured
- **83.1%** have information-seeking purpose
- **66.9%** use question-answer pattern

**Interpretation:** Most human-AI conversations prioritize content over relationship, with clear role boundaries (seeker/expert).

### 2. Relational Work is Significant Minority
- **25.7%** engage in social/emergent relational work
- **9.4%** have explicit relationship-building or entertainment purpose
- **25.6%** use storytelling pattern

**Interpretation:** A significant minority of conversations engage in explicit relationship-building, suggesting relational work is important but secondary to information exchange.

### 3. Trajectory Features Drive Separation
- **82.7%** of feature importance from trajectory features (spatial + emotional)
- Top features: `intensity_variance`, `path_straightness`, `drift_y`
- Classification features (pattern, purpose) are less discriminative

**Interpretation:** How conversations move through relational space (trajectory) is more important than what they're about (classification) for cluster separation.

### 4. Emotional Patterns Reveal Relational Dynamics
- **Valleys** (affiliative moments): Cluster 2 has 0.155 density
- **Peaks** (conflict/intensity): Cluster 6 has 0.086 density
- **Stability**: Clusters 1, 5 have very low variance

**Interpretation:** Emotional intensity patterns (valleys, peaks, stability) map to relational dynamics (rapport, conflict, predictability).

---

## 📁 Files Generated

### Visualizations (PNG)
- `cluster-distribution.png` - Size and proportion charts
- `trajectory-comparison.png` - 6-panel trajectory comparison
- `relational-positioning-map.png` - 2D positioning scatter plot
- `feature-importance.png` - Top 15 discriminative features
- `comparison-matrix.png` - Heatmap comparison

### Data Files
- `statistics-table.md` - Markdown statistics table
- `statistics-table.csv` - CSV data export

### Location
All files in: `docs/dashboard/`

---

## 🎯 Quick Reference

**Largest Cluster:** StraightPath_Stable_FunctionalStructured_QA_InfoSeeking (39.4%)  
**Smallest Clusters:** 3 clusters tied at 3.8% each  
**Most Discriminative Feature:** `intensity_variance` (7.16%)  
**Most Common Pattern:** Question-Answer (66.9%)  
**Most Common Purpose:** Information-Seeking (83.1%)  
**Average Path Straightness:** 0.542-0.819 (functional), 0.541-0.614 (social)  
**Average Drift Magnitude:** 0.148-0.622 (varies by cluster)

---

## 📚 Related Documents

- `COMPREHENSIVE_CLUSTER_ANALYSIS.md` - Full analysis
- `THEORETICAL_SYNTHESIS.md` - Theoretical interpretation
- `SENSITIVITY_ANALYSIS.md` - Robustness validation
- `FEATURE_IMPORTANCE_KMEANS.md` - Feature importance details
- `CLUSTER_VALIDATION_MANUAL.md` - Manual validation framework

---

*Dashboard generated by `scripts/create-cluster-dashboard.py`*

