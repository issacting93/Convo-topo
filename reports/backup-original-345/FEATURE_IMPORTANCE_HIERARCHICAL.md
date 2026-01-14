# Feature Importance Analysis

This analysis identifies which features are most discriminative for cluster separation.

## Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `max_intensity` | 0.1038 | Emotional Intensity |
| 2 | `avg_intensity` | 0.0690 | Emotional Intensity |
| 3 | `final_x` | 0.0680 | Spatial Trajectory |
| 4 | `min_intensity` | 0.0650 | Emotional Intensity |
| 5 | `path_length` | 0.0604 | Spatial Trajectory |
| 6 | `drift_x` | 0.0564 | Spatial Trajectory |
| 7 | `drift_y` | 0.0559 | Spatial Trajectory |
| 8 | `drift_magnitude` | 0.0522 | Spatial Trajectory |
| 9 | `final_y` | 0.0457 | Spatial Trajectory |
| 10 | `path_straightness` | 0.0444 | Spatial Trajectory |
| 11 | `intensity_variance` | 0.0415 | Emotional Intensity |
| 12 | `drift_angle_cos` | 0.0341 | Spatial Trajectory |
| 13 | `x_variance` | 0.0309 | Spatial Trajectory |
| 14 | `intensity_range` | 0.0273 | Emotional Intensity |
| 15 | `y_variance` | 0.0272 | Spatial Trajectory |
| 16 | `drift_angle_sin` | 0.0268 | Spatial Trajectory |
| 17 | `ai_advisor` | 0.0205 | AI Role |
| 18 | `pattern_qa` | 0.0194 | Pattern |
| 19 | `human_director` | 0.0190 | Human Role |
| 20 | `intensity_trend` | 0.0155 | Emotional Intensity |

## Insights

### Most Discriminative Feature Categories:

- **Spatial Trajectory**: 0.5020 (50.2%)
- **Emotional Intensity**: 0.3361 (33.6%)
- **Pattern**: 0.0506 (5.1%)
- **Human Role**: 0.0309 (3.1%)
- **Tone**: 0.0248 (2.5%)
- **AI Role**: 0.0205 (2.1%)
- **Purpose**: 0.0204 (2.0%)
- **Structure**: 0.0147 (1.5%)
