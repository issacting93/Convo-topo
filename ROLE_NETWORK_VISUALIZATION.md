# Role Network Visualization

## Overview

A comprehensive visualization system for exploring human-AI role dynamics through interactive network graphs and flow diagrams. Built with React, D3.js, and Tailwind CSS.

## Access

**URL:** `http://localhost:5175/role-network`

## Features

### 📊 Three Visualization Types

#### 1. Sankey Diagram
- **Purpose:** Visualize directional flow from human roles → AI roles
- **Visual Encoding:**
  - Flow width = Number of conversations
  - Colors = Role-specific coding (matching taxonomy)
  - Left side = Human roles
  - Right side = AI roles
- **Interactions:**
  - Hover over flows to see exact conversation counts
  - Hover over nodes to see total connections
  - Smooth animated tooltips

#### 2. Force-Directed Network Graph
- **Purpose:** Interactive exploration of role relationships
- **Visual Encoding:**
  - Node size = Frequency of role occurrence
  - Edge thickness = Connection strength (number of pairings)
  - Layout = Physics-based with spatial separation (human left, AI right)
- **Interactions:**
  - **Drag nodes** to reorganize layout
  - Hover over nodes to highlight connected edges
  - Hover over edges to see pairing statistics
  - Dynamic force simulation maintains spatial organization

#### 3. Side-by-Side Comparison
- Toggle between viewing both diagrams, Sankey only, or Network only
- Synchronized data filtering across all views

### 🎛️ Interactive Controls

**View Mode Selector:**
- Both (default)
- Sankey only
- Network only

**Top N Filter:**
- Show top 5, 10, 15, 20 role pairs
- Or view all role pairs
- Filters apply to both visualizations

### 📈 Statistics Dashboard

Real-time metrics displayed in card format:
- **Total Conversations:** Number analyzed
- **Human Roles:** Unique human role types identified
- **AI Roles:** Unique AI role types identified
- **Role Pairs:** Total unique human→AI combinations

### 📋 Data Table

Ranked list of top role pairs featuring:
- **Rank:** Position in frequency ordering
- **Human Role:** Source role with color coding
- **AI Role:** Target role with color coding
- **Count:** Absolute number of conversations
- **Distribution:** Percentage with animated progress bar

### 💡 Key Insights Panel

Auto-generated insights including:
- Most common role pairing with statistics
- Total unique pairs identified
- Average connections per role pair

## Design System

### Color Palette

**Human Roles:**
- Information-Seeker: `#7b68ee` (purple-blue)
- Provider: `#4ade80` (green)
- Director: `#ec4899` (magenta)
- Collaborator: `#06b6d4` (cyan)
- Social-Expressor: `#fbbf24` (yellow)
- Relational-Peer: `#4ade80` (green)

**AI Roles:**
- Expert-System: `#7b68ee` (purple-blue)
- Learning-Facilitator: `#06b6d4` (cyan)
- Advisor: `#ec4899` (magenta)
- Co-Constructor: `#4ade80` (green)
- Social-Facilitator: `#fbbf24` (yellow)
- Relational-Peer: `#4ade80` (green)

### Visual Style

- **Background:** Gradient from gray-900 → slate-900 → gray-900
- **Cards:** Semi-transparent with backdrop blur and gradient borders
- **Typography:**
  - Headers: Gradient text (blue → purple → pink)
  - Body: Gray-400 for descriptions, white for emphasis
- **Hover Effects:** Smooth transitions with glow effects
- **Shadows:** Layered 2xl shadows for depth

## Technical Architecture

### File Structure

```
src/
├── pages/
│   └── RoleNetworkPage.tsx          # Main page component
├── components/
│   └── visualizations/
│       ├── RoleSankeyDiagram.tsx    # Sankey flow visualization
│       └── RoleNetworkGraph.tsx     # Force-directed graph
└── utils/
    └── roleNetwork.ts               # Data computation utilities
```

### Data Flow

```
Conversation Store (Zustand)
    ↓
computeRoleNetwork(conversations)
    ↓
{
  nodes: RoleNode[],        // All roles with counts
  links: RoleLink[],        // Role pairs with frequencies
  sankeyData: SankeyData    // D3-formatted Sankey data
}
    ↓
Filtered by Top N selection
    ↓
Rendered in visualizations
```

### Key Functions

**`computeRoleNetwork(conversations)`**
- Processes conversation data to extract role pairs
- Counts frequencies and calculates percentages
- Maps old taxonomy to new Social Role Theory roles
- Filters by confidence threshold (>0.3)

**`getTopRolePairs(links, topN)`**
- Sorts links by frequency (descending)
- Returns top N pairs for cleaner visualizations

**`formatRoleName(role)`**
- Converts kebab-case to Title Case
- Example: `information-seeker` → `Information Seeker`

## Performance Optimizations

1. **useMemo hooks** for expensive computations:
   - Network data calculation
   - Top pairs filtering
   - Filtered network data generation

2. **Efficient D3 patterns:**
   - Data joins with `.join()`
   - Force simulation with controlled alpha decay
   - Tooltip reuse to avoid DOM thrashing

3. **Responsive sizing:**
   - SVG scales to container width
   - Force simulation bounded to viewport
   - Table with fixed column widths

## Accessibility Features

- Semantic HTML structure
- ARIA-compliant table headers
- Keyboard-navigable controls
- High-contrast color scheme
- Descriptive tooltips

## Browser Compatibility

- Modern browsers with ES6+ support
- Tested on Chrome, Firefox, Safari
- Requires SVG and CSS Grid support

## Future Enhancements

Potential additions:
- [ ] Export visualizations as PNG/SVG
- [ ] Filter by specific role types
- [ ] Temporal analysis (role pairs over time)
- [ ] Chord diagram alternative
- [ ] Hierarchical clustering view
- [ ] Role transition paths (multi-hop connections)

## Data Source

Uses classified conversation data from:
- `useConversationStore` (Zustand)
- Role classifications with confidence scores
- Social Role Theory taxonomy (reduced v1.0)

## Dependencies

```json
{
  "d3": "^7.x",
  "d3-sankey": "^0.x",
  "@types/d3": "^7.x",
  "@types/d3-sankey": "^3.x",
  "react": "^18.x",
  "zustand": "^4.x"
}
```

## Credits

- **Visualization Design:** D3.js force-directed layout + Sankey diagrams
- **Taxonomy:** Social Role Theory (Biddle, 1986)
- **Styling:** Tailwind CSS with custom gradient system
- **Data Processing:** Custom role network computation engine

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
