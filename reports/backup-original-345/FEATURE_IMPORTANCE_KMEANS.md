# Feature Importance Analysis

This analysis identifies which features are most discriminative for cluster separation.

## Top 20 Most Important Features

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `final_x` | 0.0827 | Spatial Trajectory |
| 2 | `drift_x` | 0.0700 | Spatial Trajectory |
| 3 | `pattern_qa` | 0.0699 | Pattern |
| 4 | `path_length` | 0.0684 | Spatial Trajectory |
| 5 | `pattern_advisory` | 0.0601 | Pattern |
| 6 | `drift_y` | 0.0591 | Spatial Trajectory |
| 7 | `drift_magnitude` | 0.0548 | Spatial Trajectory |
| 8 | `final_y` | 0.0485 | Spatial Trajectory |
| 9 | `path_straightness` | 0.0454 | Spatial Trajectory |
| 10 | `y_variance` | 0.0396 | Spatial Trajectory |
| 11 | `drift_angle_cos` | 0.0376 | Spatial Trajectory |
| 12 | `human_director` | 0.0340 | Human Role |
| 13 | `x_variance` | 0.0319 | Spatial Trajectory |
| 14 | `intensity_trend` | 0.0319 | Emotional Intensity |
| 15 | `drift_angle_sin` | 0.0311 | Spatial Trajectory |
| 16 | `purpose_info` | 0.0298 | Purpose |
| 17 | `ai_advisor` | 0.0289 | AI Role |
| 18 | `intensity_range` | 0.0242 | Emotional Intensity |
| 19 | `intensity_variance` | 0.0227 | Emotional Intensity |
| 20 | `human_collaborator` | 0.0201 | Human Role |

## Insights

### Most Discriminative Feature Categories:

- **Spatial Trajectory**: 0.5691 (56.9%)
- **Pattern**: 0.1452 (14.5%)
- **Emotional Intensity**: 0.1349 (13.5%)
- **Human Role**: 0.0541 (5.4%)
- **Purpose**: 0.0414 (4.1%)
- **AI Role**: 0.0289 (2.9%)
- **Structure**: 0.0184 (1.8%)
- **Tone**: 0.0080 (0.8%)
