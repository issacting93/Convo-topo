# Feature Importance Analysis

This analysis identifies which features are most discriminative for cluster separation.

## Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `pattern_advisory` | 0.0842 | Pattern |
| 2 | `final_x` | 0.0785 | Spatial Trajectory |
| 3 | `pattern_qa` | 0.0700 | Pattern |
| 4 | `drift_x` | 0.0626 | Spatial Trajectory |
| 5 | `drift_magnitude` | 0.0546 | Spatial Trajectory |
| 6 | `drift_y` | 0.0518 | Spatial Trajectory |
| 7 | `final_y` | 0.0488 | Spatial Trajectory |
| 8 | `path_length` | 0.0466 | Spatial Trajectory |
| 9 | `intensity_variance` | 0.0421 | Emotional Intensity |
| 10 | `path_straightness` | 0.0413 | Spatial Trajectory |
| 11 | `intensity_range` | 0.0399 | Emotional Intensity |
| 12 | `human_director` | 0.0311 | Human Role |
| 13 | `max_intensity` | 0.0306 | Emotional Intensity |
| 14 | `drift_angle_sin` | 0.0301 | Spatial Trajectory |
| 15 | `y_variance` | 0.0296 | Spatial Trajectory |
| 16 | `x_variance` | 0.0294 | Spatial Trajectory |
| 17 | `drift_angle_cos` | 0.0293 | Spatial Trajectory |
| 18 | `intensity_trend` | 0.0292 | Emotional Intensity |
| 19 | `ai_advisor` | 0.0273 | AI Role |
| 20 | `purpose_info` | 0.0209 | Purpose |

## Insights

### Most Discriminative Feature Categories:

- **Spatial Trajectory**: 0.5025 (50.3%)
- **Emotional Intensity**: 0.1956 (19.6%)
- **Pattern**: 0.1709 (17.1%)
- **Human Role**: 0.0448 (4.5%)
- **Purpose**: 0.0355 (3.6%)
- **AI Role**: 0.0273 (2.7%)
- **Structure**: 0.0148 (1.5%)
- **Tone**: 0.0085 (0.9%)
