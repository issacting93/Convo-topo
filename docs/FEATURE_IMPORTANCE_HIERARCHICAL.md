# Feature Importance Analysis

This analysis identifies which features are most discriminative for cluster separation.

## Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `max_intensity` | 0.0737 | Emotional Intensity |
| 2 | `path_straightness` | 0.0694 | Spatial Trajectory |
| 3 | `final_x` | 0.0684 | Spatial Trajectory |
| 4 | `drift_x` | 0.0649 | Spatial Trajectory |
| 5 | `path_length` | 0.0628 | Spatial Trajectory |
| 6 | `avg_intensity` | 0.0551 | Emotional Intensity |
| 7 | `drift_y` | 0.0498 | Spatial Trajectory |
| 8 | `drift_magnitude` | 0.0463 | Spatial Trajectory |
| 9 | `final_y` | 0.0408 | Spatial Trajectory |
| 10 | `intensity_trend` | 0.0404 | Emotional Intensity |
| 11 | `min_intensity` | 0.0394 | Emotional Intensity |
| 12 | `intensity_variance` | 0.0380 | Emotional Intensity |
| 13 | `drift_angle_sin` | 0.0310 | Spatial Trajectory |
| 14 | `intensity_range` | 0.0269 | Emotional Intensity |
| 15 | `x_variance` | 0.0266 | Spatial Trajectory |
| 16 | `human_director` | 0.0260 | Human Role |
| 17 | `y_variance` | 0.0231 | Spatial Trajectory |
| 18 | `ai_advisor` | 0.0226 | AI Role |
| 19 | `valley_density` | 0.0209 | Emotional Intensity |
| 20 | `drift_angle_cos` | 0.0205 | Spatial Trajectory |

## Insights

### Most Discriminative Feature Categories:

- **Spatial Trajectory**: 0.5036 (50.4%)
- **Emotional Intensity**: 0.3292 (32.9%)
- **Pattern**: 0.0497 (5.0%)
- **Human Role**: 0.0417 (4.2%)
- **Tone**: 0.0244 (2.4%)
- **AI Role**: 0.0226 (2.3%)
- **Purpose**: 0.0185 (1.8%)
- **Structure**: 0.0103 (1.0%)
