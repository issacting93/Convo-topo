# GenUI Integration: Cluster-Based UI Generation

## Overview

This integration connects the **Cartography** conversation cluster analysis with **GenUI's** visual language generation system. Different conversation clusters now generate different UI visual languages that reflect the relational positioning archetypes identified in the cluster analysis.

## How It Works

### 1. Cluster Detection

Each conversation is analyzed to determine its cluster membership:

- **Primary Method**: Cluster assignment from analysis scripts (stored in metadata)
- **Fallback Method**: Heuristic computation based on conversation characteristics:
  - Interaction patterns (question-answer, storytelling, etc.)
  - Conversation purpose (information-seeking, entertainment, etc.)
  - Emotional intensity patterns (peaks, valleys, stability)
  - Role distributions (functional vs. social, structured vs. emergent)

### 2. Cluster-to-Language Mapping

The 7 Cartography clusters map to 6 GenUI visual languages:

| Cluster | GenUI Language | Zone | Characteristics |
|---------|---------------|------|----------------|
| `StraightPath_Stable_FunctionalStructured_QA_InfoSeeking` | **instrumental** | tool-basin | Minimal, task-focused, command-driven |
| `Valley_FunctionalStructured_QA_InfoSeeking` | **instrumental** | tool-basin | Task-oriented with brief rapport-building |
| `SocialEmergent_Narrative_InfoSeeking` | **exploratory** | collaborator-ridge | Information-seeking through narrative |
| `SocialEmergent_Narrative_Entertainment` | **relational** | companion-delta | Pure relational communication |
| `MeanderingPath_Narrative_SelfExpression` | **exploratory** | collaborator-ridge | Self-expression, minimal positioning |
| `Peak_Volatile_FunctionalStructured_QA_InfoSeeking` | **analytical** | evaluator-heights | Frustrated, volatile, data-dense |
| `SocialEmergent_Narrative_Relational` | **relational** | companion-delta | Explicit relationship-building |

### 3. User Profile Generation

For each cluster, a GenUI `UserProfile` is generated with:

- **Zone**: Maps to GenUI's zone system (tool-basin, companion-delta, etc.)
- **Movement**: How the conversation moves (anchored, drifting, oscillating, sudden-shift)
- **Intensity**: Emotional intensity level (calm, variable, intense)
- **Diversity**: Exploration pattern (focused, explorer, wanderer)
- **Temporal Orientation**: Time focus (task-focused, relationship-builder, mixed)
- **Linguistic Style**: Communication style (accommodator, voice-preserver, style-mixer)

### 4. Visual Language Generation

GenUI generates a complete UI layout based on the profile:

- **Design Tokens**: Colors, typography, spacing, motion, borders, shadows
- **Interaction Contracts**: Navigation patterns, feedback modes, affordances
- **Epistemic Posture**: Cognitive stance (do, connect, evaluate, explore, learn, accommodate)
- **Components & Absences**: What UI elements are present/absent

## Files Created

### Core Utilities

1. **`src/utils/clusterToGenUI.ts`**
   - Maps clusters to GenUI languages
   - Generates UserProfile from cluster
   - Zone and language ID mappings

2. **`src/utils/determineCluster.ts`**
   - Determines cluster membership from conversation
   - Computes cluster from characteristics (fallback)
   - Helper functions for variance calculation

3. **`src/utils/genUITypes.ts`**
   - Type definitions for GenUI integration
   - Matches GenUI's type system

### Components

4. **`src/components/ClusterBasedUI.tsx`**
   - Main component that renders GenUI based on cluster
   - Shows generated profile and visual language information
   - Displays color palettes and design tokens

5. **`src/pages/ClusterUIPage.tsx`**
   - Full page showcasing cluster-based UI generation
   - Cluster statistics and distribution
   - Conversation selection and preview
   - Information panel explaining the integration

## Usage

### Accessing the Integration

Navigate to `/cluster-ui` in the Cartography application to see:

1. **Cluster Distribution**: Overview of all 7 clusters with counts and percentages
2. **Conversation Selection**: Browse conversations by cluster
3. **UI Preview**: See the generated GenUI profile and visual language for each conversation

### Programmatic Usage

```typescript
import { determineCluster } from '../utils/determineCluster';
import { clusterToUserProfile, getLanguageForCluster } from '../utils/clusterToGenUI';
import { ClusterBasedUI } from '../components/ClusterBasedUI';

// Determine cluster for a conversation
const cluster = determineCluster(conversation);

// Get GenUI language
const languageId = getLanguageForCluster(cluster);

// Generate user profile
const userProfile = clusterToUserProfile(cluster, conversationCount, topics);

// Render UI component
<ClusterBasedUI conversation={conversation} />
```

## Integration Status

### ✅ Completed

- Cluster-to-language mapping
- User profile generation
- Cluster detection (metadata + loaded assignments + computation)
- UI component and page
- Route integration
- Cluster assignment loading from JSON files

### 📝 Setup Note

The cluster assignment JSON files (`reports/path-clusters-*.json`) need to be accessible from the public directory. They are automatically copied to `public/reports/` when the integration is set up. If you regenerate cluster analysis, you may need to copy the updated files:

```bash
cp reports/path-clusters-*.json public/reports/
```

### 🔄 Future Enhancements

1. **Full GenUI Rendering**: Currently shows profile and language info. For full UI rendering:
   - Copy GenUI layout components into Cartography, or
   - Set up proper module imports from GenUI project

2. **Real-time Updates**: Update UI as conversations are analyzed

3. **Cluster Assignment Storage**: Store cluster assignments in conversation metadata during analysis

4. **Visual Language Preview**: Render actual GenUI layouts (not just profile info)

## Theoretical Connection

This integration demonstrates how **relational positioning archetypes** (identified through cluster analysis) map to **epistemic postures** (encoded in visual languages). The UI generated for each cluster reflects:

- **How the conversation positions itself relationally** (functional vs. social, structured vs. emergent)
- **The emotional intensity patterns** (calm, variable, intense)
- **The interaction dynamics** (task-focused, relationship-building, exploratory)

This creates a bridge between:
- **Cartography's** analysis of conversation patterns
- **GenUI's** generation of visual interfaces

Both systems share a focus on **relational dynamics** and **epistemic postures**, making this integration conceptually coherent.

## References

- **Cluster Analysis**: See `docs/cluster-analysis/COMPREHENSIVE_CLUSTER_ANALYSIS.md`
- **GenUI System**: See GenUI project documentation
- **Visual Language Theory**: See GenUI's epistemic posture framework

