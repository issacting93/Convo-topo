# Cluster Dashboard Implementation

**Date:** 2025-01-05
**Status:** ✅ Complete
**Route:** `/cluster-dashboard`

---

## Overview

Created a comprehensive cluster analysis dashboard that provides a birds-eye view of all conversation clusters with statistics, visualizations, and spatial distribution analysis.

---

## Features

### 1. **Key Metrics Overview**
- Total conversation count
- Number of active clusters
- Largest cluster identification with count and percentage

### 2. **Distribution Visualizations**

#### Pie Chart
- Visual breakdown of cluster distribution
- Color-coded by cluster
- Shows conversation count per cluster

#### Bar Chart
- Conversation count by cluster
- Sorted by size
- Each bar uses the cluster's distinct color

#### Spatial Positioning Scatter Plot
- Shows average X-Y position of each cluster
- X-axis: Functional ↔ Social
- Y-axis: Aligned ↔ Divergent
- Circle size represents conversation count
- Color-coded by cluster

### 3. **Cluster Characteristics Table**

Interactive table showing all 7 clusters with:
- **Cluster Name** - Simplified label
- **Count** - Number of conversations and percentage
- **Visual Language** - GenUI mapping (instrumental, relational, etc.)
- **Trajectory** - Path characteristic (straight, volatile, meandering, etc.)
- **Intensity** - Emotional intensity pattern
- **Alignment** - Linguistic alignment (aligned/divergent)
- **Orientation** - Functional/Social orientation
- **Actions** - Quick link to view in spatial clustering page

Features:
- Click row to expand and see conversations in that cluster
- Color-coded indicators
- Sorted by conversation count (largest first)

### 4. **Selected Cluster Detail View**

When you click a cluster row:
- Shows grid of conversations in that cluster (up to 12)
- Click any conversation to view its terrain
- Shows message count and interaction pattern
- Border color matches cluster color

---

## Cluster Color Palette

Each cluster has a distinct color:

| Cluster | Color | Hex |
|---------|-------|-----|
| Stable Q&A | Purple | #7b68ee |
| Valley Q&A | Green | #4ade80 |
| Narrative Info | Amber | #fbbf24 |
| Entertainment | Pink | #ec4899 |
| Self-Expression | Cyan | #06b6d4 |
| Volatile Q&A | Red | #ef4444 |
| Relational | Violet | #8b5cf6 |

---

## Simplified Cluster Labels

For better readability in the dashboard:

| Technical Name | Dashboard Label |
|---------------|-----------------|
| `StraightPath_Stable_FunctionalStructured_QA_InfoSeeking` | Stable Q&A |
| `Valley_FunctionalStructured_QA_InfoSeeking` | Valley Q&A |
| `SocialEmergent_Narrative_InfoSeeking` | Narrative Info |
| `SocialEmergent_Narrative_Entertainment` | Entertainment |
| `MeanderingPath_Narrative_SelfExpression` | Self-Expression |
| `Peak_Volatile_FunctionalStructured_QA_InfoSeeking` | Volatile Q&A |
| `SocialEmergent_Narrative_Relational` | Relational |

---

## Data Calculated

For each cluster, the dashboard calculates:

1. **Count** - Number of conversations
2. **Percentage** - Percentage of total conversations
3. **Average Emotional Intensity** - Mean of all message PAD emotional intensity scores
4. **Average X Position** - Mean functional ↔ social positioning
5. **Average Y Position** - Mean aligned ↔ divergent positioning
6. **Visual Language** - GenUI mapping from `clusterToGenUI.ts`
7. **Characteristics** - Trajectory, intensity, alignment, orientation

---

## User Interactions

1. **Navigate** - Top navigation bar to switch between views
2. **View Spatial Position** - Click "View in Space" button to see cluster in spatial clustering page
3. **Select Cluster** - Click table row to expand and see conversations
4. **View Conversation** - Click conversation card to view its terrain
5. **Hover Effects** - Interactive hover states on all clickable elements

---

## Technical Details

### File Location
- `src/pages/ClusterDashboardPage.tsx`

### Dependencies
- React hooks: `useState`, `useMemo`, `useEffect`
- Recharts: Bar chart, pie chart, scatter plot
- React Router: Navigation
- Zustand store: Conversation data
- Cluster utilities: `determineCluster`, `getLanguageForCluster`

### Data Sources
1. **Conversations** - From Zustand store
2. **Cluster Assignments** - Loaded from `loadClusterAssignments()`
3. **Spatial Positioning** - Calculated via `getCommunicationFunction()` and `getConversationStructure()`

### Performance
- Uses `useMemo` for expensive calculations
- Loads cluster assignments asynchronously
- Limits conversation display to 12 per cluster in detail view

---

## Integration

### Routes
Added to `src/App.tsx`:
```typescript
<Route path="/cluster-dashboard" element={<ClusterDashboardPage />} />
```

### Navigation
Added to `src/components/Navigation.tsx`:
```typescript
{ path: '/cluster-dashboard', label: 'Cluster Dashboard', description: 'Comprehensive cluster analysis and statistics' }
```

---

## Usage

1. Navigate to `/cluster-dashboard` from the navigation menu
2. View overall statistics in the header
3. Examine distribution charts (pie and bar)
4. Analyze spatial positioning in scatter plot
5. Browse cluster characteristics table
6. Click a cluster row to see its conversations
7. Click "View in Space" to see cluster in spatial clustering view
8. Click conversation cards to view individual terrains

---

## Future Enhancements

Potential additions:
- Export cluster statistics to CSV
- Filter/search within clusters
- Compare two clusters side-by-side
- Trend analysis over time (if temporal data available)
- Custom cluster grouping/filtering
- Interactive scatter plot (click points to filter)
- Download visualizations as images

---

## Benefits

1. **Comprehensive Overview** - See all clusters at once
2. **Multiple Perspectives** - Distribution, spatial, and characteristics
3. **Interactive** - Click to explore, drill down into details
4. **Visual Clarity** - Color-coded, distinct styling per cluster
5. **Actionable** - Quick links to related views and individual conversations
6. **Statistics** - Quantified metrics for analysis
7. **Accessible** - Clear labels, simplified names, helpful descriptions

---

## Related Pages

- **Spatial Clustering** (`/spatial-clustering`) - 2D scatter plot of conversations
- **Cluster UI** (`/cluster-ui`) - GenUI visual language showcase
- **Terrain Grid** (`/`) - Browse all conversation terrains
- **Multi-Path View** (`/multi-path`) - Compare multiple paths in 3D

---

## Files Modified

1. `src/pages/ClusterDashboardPage.tsx` - New dashboard page (created)
2. `src/App.tsx` - Added route
3. `src/components/Navigation.tsx` - Added navigation item

---

## Visual Design

- Clean, modern interface
- Consistent spacing and typography
- Purple accent color (#7b68ee)
- Card-based layout
- Responsive grid system
- Hover effects for interactivity
- Color-coded cluster indicators
- Clear visual hierarchy

---

## Accessibility

- Semantic HTML structure
- Color + text labels (not color alone)
- Keyboard navigable (via React Router)
- Clear hover states
- Descriptive tooltips in charts
- Readable font sizes (12-32px range)

---

## Notes

- Dashboard loads cluster assignments asynchronously for accuracy
- Falls back to `determineCluster()` if assignment not found
- Charts use Recharts library for consistency with other views
- Simplified labels make dashboard more approachable
- Technical cluster names still available in tooltips/details
