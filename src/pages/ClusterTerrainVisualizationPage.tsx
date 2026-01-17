/**
 * Cluster Terrain Visualization Page
 *
 * 3D visualization showing all conversations with:
 * - X-axis: Functional ↔ Social (Communication Function)
 * - Y-axis: Aligned ↔ Divergent (Linguistic Structure)
 * - Z-axis: Emotional Intensity (PAD-based heightmap)
 * - Paths colored by cluster (7 clusters from k-means analysis)
 */

import { useMemo, useState } from 'react';
import { useConversationStore } from '../store/useConversationStore';
import { ThreeScene } from '../components/ThreeScene';
import { Navigation } from '../components/Navigation';
import { determineCluster } from '../utils/determineCluster';
import type { CartographyCluster } from '../utils/clusterToGenUI';
import { generateContours, generatePathCoordinates, getHeightAt, generateDensityHeightmap } from '../utils/terrain';
import { getCommunicationFunction, getConversationStructure } from '../utils/coordinates';
import { calculateUserAuthority, getDominantHumanRole, getDominantAiRole, mapOldRoleToNew } from '../utils/conversationToTerrain';
import type { PathPoint } from '../utils/terrain';

const THEME = {
  foreground: '#e0e0e0',
  foregroundMuted: '#9aa0a6',
  accent: '#a78bfa',
  border: 'rgba(255, 255, 255, 0.1)',
  card: '#1e1e1e',
  background: '#121212',
};

// Cluster colors (from cluster analysis)
const CLUSTER_COLORS: Record<CartographyCluster, string> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': '#7b68ee',
  'Valley_FunctionalStructured_QA_InfoSeeking': '#4ade80',
  'SocialEmergent_Narrative_InfoSeeking': '#fbbf24',
  'SocialEmergent_Narrative_Entertainment': '#ec4899',
  'MeanderingPath_Narrative_SelfExpression': '#06b6d4',
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': '#ef4444',
  'SocialEmergent_Narrative_Relational': '#8b5cf6',
};

const CLUSTER_LABELS: Record<CartographyCluster, string> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': 'Stable Q&A',
  'Valley_FunctionalStructured_QA_InfoSeeking': 'Valley Q&A',
  'SocialEmergent_Narrative_InfoSeeking': 'Narrative Info',
  'SocialEmergent_Narrative_Entertainment': 'Entertainment',
  'MeanderingPath_Narrative_SelfExpression': 'Self-Expression',
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': 'Volatile Q&A',
  'SocialEmergent_Narrative_Relational': 'Relational',
};

// Source colors (Chart colors)
const SOURCE_COLORS: Record<string, string> = {
  'Chatbot Arena': '#7b68ee', // chart-1
  'WildChat': '#4ade80',      // chart-2
  'OASST': '#fbbf24',         // chart-3
  'Human': '#ec4899',         // chart-4
  'Other': '#9aa0a6',         // muted
};

// Interaction Pattern colors (Structural)
const PATTERN_COLORS: Record<string, string> = {
  'question-answer': '#3b82f6', // blue-500
  'storytelling': '#8b5cf6',    // violet-500
  'collaborative': '#10b981',   // emerald-500
  'advisory': '#f59e0b',        // amber-500
  'casual-chat': '#ec4899',     // pink-500
  'unknown': '#525252',         // neutral-600
};

// User Purpose colors (Intent)
const PURPOSE_COLORS: Record<string, string> = {
  'information-seeking': '#0ea5e9', // sky-500
  'problem-solving': '#6366f1',     // indigo-500
  'creative-writing': '#d946ef',    // fuchsia-500
  'entertainment': '#f43f5e',       // rose-500
  'learning': '#84cc16',            // lime-500
  'relationship-building': '#14b8a6', // teal-500
  'self-expression': '#a855f7',     // purple-500
  'unknown': '#525252',             // neutral-600
};

// Valence colors (Emotional)
const VALENCE_COLORS = {
  positive: '#22c55e', // green-500
  neutral: '#94a3b8',  // slate-400
  negative: '#ef4444', // red-500
};

// Human Role colors (Social Role Theory taxonomy)
const HUMAN_ROLE_COLORS: Record<string, string> = {
  'information-seeker': '#3b82f6',  // blue-500
  'provider': '#8b5cf6',             // violet-500
  'director': '#ef4444',             // red-500
  'collaborator': '#10b981',         // emerald-500
  'social-expressor': '#ec4899',     // pink-500
  'relational-peer': '#f59e0b',      // amber-500
};

// AI Role colors
const AI_ROLE_COLORS: Record<string, string> = {
  'expert-system': '#3b82f6',        // blue-500
  'learning-facilitator': '#8b5cf6', // violet-500
  'advisor': '#ef4444',              // red-500
  'co-constructor': '#10b981',       // emerald-500
  'social-facilitator': '#ec4899',   // pink-500
  'relational-peer': '#f59e0b',      // amber-500
};

const ALL_HUMAN_ROLES = Object.keys(HUMAN_ROLE_COLORS);
const ALL_AI_ROLES = Object.keys(AI_ROLE_COLORS);

interface PathWithColor {
  points: PathPoint[];
  color: string;
  name: string;
  pattern?: string;
  cluster: CartographyCluster;
}

function processConversationMessages(conversation: any) {
  if (!conversation || !conversation.messages) return [];

  const commFunc = getCommunicationFunction(conversation);
  const convStruct = getConversationStructure(conversation);

  return conversation.messages.map((msg: any) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    communicationFunction: commFunc,
    conversationStructure: convStruct,
    pad: msg.pad,
  }));
}

// Helper to determine source
const determineSource = (conv: any): string => {
  let source = conv.source;

  // Normalize source from file if present
  if (source) {
    if (source === 'wildchat') return 'WildChat';
    if (source === 'chatbot_arena') return 'Chatbot Arena';
    if (source === 'oasst') return 'OASST';
    return source; // Return raw if not mapped (e.g. 'Human' might be fine if source is encoded that way)
  }

  if (!conv.id) return 'Other';

  if (conv.id.startsWith('chatbot_arena')) return 'Chatbot Arena';
  if (conv.id.startsWith('wildchat')) return 'WildChat';
  if (conv.id.startsWith('oasst')) return 'OASST';
  if (conv.id.startsWith('cornell') || conv.id.startsWith('kaggle')) return 'Human';

  return 'Other';
};

// Helper: Determine Interaction Pattern
const determinePattern = (conv: any): string => {
  return conv.classification?.interactionPattern?.category || 'unknown';
};

// Helper: Determine User Purpose
const determinePurpose = (conv: any): string => {
  return conv.classification?.conversationPurpose?.category || 'unknown';
};

// Helper: Determine Emotional Valence
const determineValence = (conv: any): string => {
  // Calculate average pleasure from messages
  const validScores = conv.messages?.map((m: any) => m.pad?.pleasure).filter((p: number | undefined) => p !== undefined) || [];
  if (validScores.length === 0) return 'neutral';

  const avgPleasure = validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length;
  if (avgPleasure > 0.6) return 'positive';
  if (avgPleasure < 0.4) return 'negative';
  return 'neutral';
};

// Helper: Get dominant human role
const getHumanRole = (conv: any): string | null => {
  const roleData = getDominantHumanRole(conv);
  if (!roleData || roleData.value < 0.3) return null;
  return mapOldRoleToNew(roleData.role, 'human');
};

// Helper: Get dominant AI role
const getAiRole = (conv: any): string | null => {
  const roleData = getDominantAiRole(conv);
  if (!roleData || roleData.value < 0.3) return null;
  return mapOldRoleToNew(roleData.role, 'ai');
};

const ALL_SOURCES = ['Chatbot Arena', 'WildChat', 'OASST', 'Human', 'Other'];

const CheckboxItem = ({ id, label, color, count, checked, onChange }: any) => (
  <label key={id} style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
    cursor: 'pointer', borderRadius: '0.5rem', marginBottom: '0.5rem',
    background: checked ? `${color}15` : 'transparent',
    border: `1px solid ${checked ? color : THEME.border}`,
  }}>
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ cursor: 'pointer', accentColor: color }} />
    <div style={{
      width: '1rem', height: '1rem', borderRadius: '0.25rem',
      background: color, flexShrink: 0,
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: THEME.foreground }}>
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: THEME.foregroundMuted }}>
        {count || 0} conversations
      </div>
    </div>
  </label>
);

export function ClusterTerrainVisualizationPage() {
  const conversations = useConversationStore(state => state.conversations);
  const loading = useConversationStore(state => state.loading);

  const [showTerrain, setShowTerrain] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showMarkers, setShowMarkers] = useState(false);

  // Selection States
  const [selectedClusters, setSelectedClusters] = useState<Set<CartographyCluster>>(
    new Set(Object.keys(CLUSTER_COLORS) as CartographyCluster[])
  );
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(ALL_SOURCES)
  );
  // Dynamic Group Selections
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(
    new Set(Object.keys(PATTERN_COLORS))
  );
  const [selectedPurposes, setSelectedPurposes] = useState<Set<string>>(
    new Set(Object.keys(PURPOSE_COLORS))
  );
  const [selectedValences, setSelectedValences] = useState<Set<string>>(
    new Set(Object.keys(VALENCE_COLORS))
  );
  const [selectedHumanRoles, setSelectedHumanRoles] = useState<Set<string>>(
    new Set(ALL_HUMAN_ROLES)
  );
  const [selectedAiRoles, setSelectedAiRoles] = useState<Set<string>>(
    new Set(ALL_AI_ROLES)
  );

  // Data Sampling Mode (30 per source)
  const [samplingEnabled, setSamplingEnabled] = useState(false);

  const displayConversations = useMemo(() => {
    if (!samplingEnabled) return conversations;

    const counts: Record<string, number> = {
      'WildChat': 0,
      'Chatbot Arena': 0,
      'OASST': 0
    };
    const MAX_PER_SOURCE = 30;

    return conversations.filter(conv => {
      const source = determineSource(conv);
      if (counts[source] !== undefined && counts[source] < MAX_PER_SOURCE) {
        counts[source]++;
        return true;
      }
      return false;
    });
  }, [conversations, samplingEnabled]);

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);

  // New visualization controls
  const [showPathPoints, setShowPathPoints] = useState(false);
  const [showDropLines, setShowDropLines] = useState(false);
  const [coloringMode, setColoringMode] = useState<'cluster' | 'source' | 'pattern' | 'purpose' | 'valence'>('cluster');

  // Precompute path coordinates for all conversations
  // This allows the heightmap to be generated from the full path traces vs just endpoints
  const precomputedPaths = useMemo(() => {
    return displayConversations
      .filter(conv => {
        if (!conv.classification) return false;

        // 1. Global Filter: Source (Always active as a dataset filter)
        if (!selectedSources.has(determineSource(conv))) return false;

        // 2. Role Filters (Always active)
        const humanRole = getHumanRole(conv);
        const aiRole = getAiRole(conv);

        // If conversation has identifiable roles, filter by them
        if (humanRole && !selectedHumanRoles.has(humanRole)) return false;
        if (aiRole && !selectedAiRoles.has(aiRole)) return false;

        // 3. View Mode Specific Filters
        // Depending on which VIEW we are in, we filter by that dimension
        // This makes the terrain "react" to the toggles of the current view
        if (coloringMode === 'cluster') {
          if (!selectedClusters.has(determineCluster(conv))) return false;
        } else if (coloringMode === 'pattern') {
          if (!selectedPatterns.has(determinePattern(conv))) return false;
        } else if (coloringMode === 'purpose') {
          if (!selectedPurposes.has(determinePurpose(conv))) return false;
        } else if (coloringMode === 'valence') {
          if (!selectedValences.has(determineValence(conv))) return false;
        }

        return true;
      })
      .map(conv => {
        const messages = processConversationMessages(conv);
        // Only generate if we have messages
        if (messages.length < 2) return null;

        return {
          conv,
          messages,
          // Generate simple 2D coordinates (no height yet)
          points: generatePathCoordinates(messages)
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [displayConversations, selectedSources, selectedHumanRoles, selectedAiRoles, selectedClusters, selectedPatterns, selectedPurposes, selectedValences, coloringMode]);

  // Generate density-based heightmap (Z-axis = Emotional Intensity)
  // Now accumulated from ALL points along the paths, not just endpoints
  const heightmap = useMemo(() => {
    const size = 128;
    // Use reusable density generation
    // Default: Emotional Intensity (Previous Heatmap Logic)
    return generateDensityHeightmap(size, precomputedPaths);
  }, [precomputedPaths]);

  // Generate paths colored by cluster
  const paths = useMemo(() => {
    const pathsData: PathWithColor[] = [];
    const terrainSize = 128;

    precomputedPaths.forEach(({ conv, points }) => {
      const cluster = determineCluster(conv);
      // Redundant check removed as precomputedPaths is already filtered by cluster
      // if (!selectedClusters.has(cluster)) return;

      const source = determineSource(conv); // Recalculate source for coloring

      // Sample heights from the generated heightmap
      const pointsWithHeight: PathPoint[] = points.map(pt => {
        const gridX = pt.x * (terrainSize - 1);
        const gridY = pt.y * (terrainSize - 1);
        const height = getHeightAt(heightmap, terrainSize, gridX, gridY);

        // Use Authority Score for Z-height (consistent with density map)
        const padHeight = calculateUserAuthority(conv);

        // Remove analysis from object to match PathPoint
        const { analysis, ...rest } = pt;

        return {
          ...rest,
          height,
          padHeight
        };
      });

      let color = CLUSTER_COLORS[cluster] || THEME.accent;

      if (coloringMode === 'source') {
        color = SOURCE_COLORS[source] || SOURCE_COLORS['Other'];
      } else if (coloringMode === 'pattern') {
        const pattern = conv.classification?.interactionPattern?.category || 'unknown';
        color = PATTERN_COLORS[pattern] || PATTERN_COLORS['unknown'];
      } else if (coloringMode === 'purpose') {
        const purpose = conv.classification?.conversationPurpose?.category || 'unknown';
        color = PURPOSE_COLORS[purpose] || PURPOSE_COLORS['unknown'];
      } else if (coloringMode === 'valence') {
        // Calculate average pleasure from messages
        const validScores = conv.messages?.map((m: any) => m.pad?.pleasure).filter((p: number | undefined) => p !== undefined) || [];
        if (validScores.length > 0) {
          const avgPleasure = validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length;
          if (avgPleasure > 0.6) color = VALENCE_COLORS.positive;
          else if (avgPleasure < 0.4) color = VALENCE_COLORS.negative;
          else color = VALENCE_COLORS.neutral;
        } else {
          color = VALENCE_COLORS.neutral;
        }
      }

      pathsData.push({
        points: pointsWithHeight,
        color: color,
        name: conv.id,
        pattern: conv.classification?.interactionPattern?.category || 'unknown',
        cluster,
      });
    });

    return pathsData;
  }, [precomputedPaths, selectedClusters, coloringMode, heightmap]);

  // Generate contour lines from heightmap
  const contours = useMemo(() => {
    const size = 128;
    return generateContours(heightmap, size, 15);
  }, [heightmap]);

  // Calculate stats for the sidebar (counts per category)
  const clusterStats = useMemo(() => {
    const stats: Record<string, number> = {};
    (Object.keys(CLUSTER_COLORS) as CartographyCluster[]).forEach(k => stats[k] = 0);
    displayConversations.forEach(conv => {
      // Only count if it passes the source filter (global filter)
      if (selectedSources.has(determineSource(conv))) {
        const cluster = determineCluster(conv);
        if (stats[cluster] !== undefined) stats[cluster]++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  const patternStats = useMemo(() => {
    const stats: Record<string, number> = {};
    Object.keys(PATTERN_COLORS).forEach(k => stats[k] = 0);
    displayConversations.forEach(conv => {
      if (selectedSources.has(determineSource(conv))) {
        const p = determinePattern(conv);
        if (stats[p] !== undefined) stats[p]++;
        else stats['unknown']++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  const purposeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    Object.keys(PURPOSE_COLORS).forEach(k => stats[k] = 0);
    displayConversations.forEach(conv => {
      if (selectedSources.has(determineSource(conv))) {
        const p = determinePurpose(conv);
        if (stats[p] !== undefined) stats[p]++;
        else stats['unknown']++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  const valenceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    Object.keys(VALENCE_COLORS).forEach(k => stats[k] = 0);
    displayConversations.forEach(conv => {
      if (selectedSources.has(determineSource(conv))) {
        const p = determineValence(conv);
        if (stats[p] !== undefined) stats[p]++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ALL_SOURCES.forEach(s => stats[s] = 0);
    displayConversations.forEach(conv => {
      const src = determineSource(conv);
      if (stats[src] !== undefined) stats[src]++;
    });
    return stats;
  }, [displayConversations]);

  const humanRoleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ALL_HUMAN_ROLES.forEach(r => stats[r] = 0);
    displayConversations.forEach(conv => {
      if (selectedSources.has(determineSource(conv))) {
        const role = getHumanRole(conv);
        if (role && stats[role] !== undefined) stats[role]++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  const aiRoleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ALL_AI_ROLES.forEach(r => stats[r] = 0);
    displayConversations.forEach(conv => {
      if (selectedSources.has(determineSource(conv))) {
        const role = getAiRole(conv);
        if (role && stats[role] !== undefined) stats[role]++;
      }
    });
    return stats;
  }, [displayConversations, selectedSources]);

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: THEME.background, color: THEME.foreground,
      }}>Loading conversations...</div>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: THEME.background, fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <Navigation />

      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem', borderBottom: `1px solid ${THEME.border}`, background: THEME.card,
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 600, color: THEME.foreground }}>
          3D Cluster Visualization
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: THEME.foregroundMuted }}>
          {conversations.length} conversations • X: Functional↔Social • Y: Aligned↔Divergent • Z: Emotional Intensity
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Controls */}
        <div style={{
          width: '320px', background: THEME.card, borderRight: `1px solid ${THEME.border}`,
          overflowY: 'auto', padding: '1.5rem',
        }}>
          {/* Sample Mode Toggle */}
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: THEME.card, borderRadius: '0.5rem', border: `1px solid ${THEME.border}` }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: THEME.foreground }}>Sample View (30/source)</span>
              <div style={{ position: 'relative', width: '2rem', height: '1.1rem', background: samplingEnabled ? THEME.accent : '#333', borderRadius: '1rem', transition: 'background 0.2s' }}>
                <div style={{
                  position: 'absolute', top: '0.1rem', left: samplingEnabled ? '1rem' : '0.1rem',
                  width: '0.9rem', height: '0.9rem', background: '#fff', borderRadius: '50%',
                  transition: 'left 0.2s'
                }} />
              </div>
              <input type="checkbox" style={{ display: 'none' }} checked={samplingEnabled} onChange={(e) => setSamplingEnabled(e.target.checked)} />
            </label>
            <div style={{ fontSize: '0.7rem', color: THEME.foregroundMuted, marginTop: '0.4rem' }}>
              Limits visibility to 30 balanced conversations from WildChat, Arena, and OASST.
            </div>
          </div>

          <h3 style={{
            margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>View Controls</h3>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => setShowTerrain(!showTerrain)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem',
                background: showTerrain ? THEME.accent : THEME.card,
                color: showTerrain ? '#fff' : THEME.foreground,
                border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: '0.75rem'
              }}
            >
              Terrain
            </button>
            <button
              onClick={() => setShowContours(!showContours)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem',
                background: showContours ? THEME.accent : THEME.card,
                color: showContours ? '#fff' : THEME.foreground,
                border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: '0.75rem'
              }}
            >
              Contours
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setShowPaths(!showPaths)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem',
                background: showPaths ? THEME.accent : THEME.card,
                color: showPaths ? '#fff' : THEME.foreground,
                border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: '0.75rem'
              }}
            >
              Paths
            </button>
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.25rem',
                background: showMarkers ? THEME.accent : THEME.card,
                color: showMarkers ? '#fff' : THEME.foreground,
                border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: '0.75rem'
              }}
            >
              Pins
            </button>
          </div>

          {/* Visualization Options */}
          {(showPaths || showPathPoints || showDropLines) && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: THEME.background, borderRadius: '0.5rem', border: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: THEME.foreground, marginBottom: '0.5rem' }}>VISUALIZATION STYLE</div>

              {/* Show Points Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => setShowPathPoints(!showPathPoints)}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '2px', border: `1px solid ${THEME.foregroundMuted}`,
                  background: showPathPoints ? THEME.accent : 'transparent', marginRight: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {showPathPoints && <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '1px' }} />}
                </div>
                <span style={{ fontSize: '0.8rem', color: THEME.foreground }}>Show Nodes</span>
              </div>

              {/* Show Drop Lines Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => setShowDropLines(!showDropLines)}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '2px', border: `1px solid ${THEME.foregroundMuted}`,
                  background: showDropLines ? THEME.accent : 'transparent', marginRight: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {showDropLines && <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '1px' }} />}
                </div>
                <span style={{ fontSize: '0.8rem', color: THEME.foreground }}>Show Drop Lines</span>
              </div>

              {/* Coloring Mode */}
              <div style={{ fontSize: '0.7rem', color: THEME.foregroundMuted, marginBottom: '0.4rem' }}>COLOR BY</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'cluster', label: 'Cluster' },
                  { id: 'source', label: 'Source' },
                  { id: 'pattern', label: 'Pattern' },
                  { id: 'purpose', label: 'Purpose' },
                  { id: 'valence', label: 'Valence' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setColoringMode(mode.id as any)}
                    style={{
                      flex: '1 0 30%', padding: '0.3rem', borderRadius: '0.25rem',
                      background: coloringMode === mode.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: coloringMode === mode.id ? THEME.accent : THEME.foregroundMuted,
                      border: `1px solid ${coloringMode === mode.id ? THEME.accent : THEME.border}`,
                      cursor: 'pointer', fontSize: '0.65rem'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{
                margin: 0, fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Data Sources</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedSources(new Set(ALL_SOURCES))}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>All</button>
                <button onClick={() => setSelectedSources(new Set())}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>None</button>
              </div>
            </div>

            {ALL_SOURCES.map(source => {
              const isSelected = selectedSources.has(source);
              return (
                <label key={source} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  cursor: 'pointer', borderRadius: '0.5rem', marginBottom: '0.5rem',
                  background: isSelected ? 'rgba(123, 104, 238, 0.1)' : 'transparent',
                  border: `1px solid ${isSelected ? THEME.accent : THEME.border}`,
                }}>
                  <input type="checkbox" checked={isSelected}
                    onChange={() => {
                      const newSet = new Set(selectedSources);
                      isSelected ? newSet.delete(source) : newSet.add(source);
                      setSelectedSources(newSet);
                    }}
                    style={{ cursor: 'pointer', accentColor: THEME.accent }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: THEME.foreground }}>
                      {source}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: THEME.foregroundMuted }}>
                      {sourceStats[source] || 0} conversations
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Human Roles Filter */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{
                margin: 0, fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Human Roles ({selectedHumanRoles.size}/{ALL_HUMAN_ROLES.length})</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedHumanRoles(new Set(ALL_HUMAN_ROLES))}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>All</button>
                <button onClick={() => setSelectedHumanRoles(new Set())}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>None</button>
              </div>
            </div>

            {ALL_HUMAN_ROLES.map(role => (
              <CheckboxItem
                key={role}
                id={role}
                label={role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                color={HUMAN_ROLE_COLORS[role]}
                count={humanRoleStats[role]}
                checked={selectedHumanRoles.has(role)}
                onChange={() => {
                  const newSet = new Set(selectedHumanRoles);
                  newSet.has(role) ? newSet.delete(role) : newSet.add(role);
                  setSelectedHumanRoles(newSet);
                }}
              />
            ))}
          </div>

          {/* AI Roles Filter */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{
                margin: 0, fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>AI Roles ({selectedAiRoles.size}/{ALL_AI_ROLES.length})</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedAiRoles(new Set(ALL_AI_ROLES))}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>All</button>
                <button onClick={() => setSelectedAiRoles(new Set())}
                  style={{
                    padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                    borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                  }}>None</button>
              </div>
            </div>

            {ALL_AI_ROLES.map(role => (
              <CheckboxItem
                key={role}
                id={role}
                label={role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                color={AI_ROLE_COLORS[role]}
                count={aiRoleStats[role]}
                checked={selectedAiRoles.has(role)}
                onChange={() => {
                  const newSet = new Set(selectedAiRoles);
                  newSet.has(role) ? newSet.delete(role) : newSet.add(role);
                  setSelectedAiRoles(newSet);
                }}
              />
            ))}
          </div>

          {/* Dynamic View Filtering */}
          {coloringMode !== 'source' && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                  margin: 0, fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {coloringMode === 'cluster' && `Clusters (${selectedClusters.size}/7)`}
                  {coloringMode === 'pattern' && `Patterns (${selectedPatterns.size}/${Object.keys(PATTERN_COLORS).length})`}
                  {coloringMode === 'purpose' && `Purposes (${selectedPurposes.size}/${Object.keys(PURPOSE_COLORS).length})`}
                  {coloringMode === 'valence' && `Valence (${selectedValences.size}/${Object.keys(VALENCE_COLORS).length})`}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* "All" button logic */}
                  <button onClick={() => {
                    if (coloringMode === 'cluster') setSelectedClusters(new Set(Object.keys(CLUSTER_COLORS) as CartographyCluster[]));
                    if (coloringMode === 'pattern') setSelectedPatterns(new Set(Object.keys(PATTERN_COLORS)));
                    if (coloringMode === 'purpose') setSelectedPurposes(new Set(Object.keys(PURPOSE_COLORS)));
                    if (coloringMode === 'valence') setSelectedValences(new Set(Object.keys(VALENCE_COLORS)));
                  }}
                    style={{
                      padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                      borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                    }}>All</button>
                  {/* "None" button logic */}
                  <button onClick={() => {
                    if (coloringMode === 'cluster') setSelectedClusters(new Set());
                    if (coloringMode === 'pattern') setSelectedPatterns(new Set());
                    if (coloringMode === 'purpose') setSelectedPurposes(new Set());
                    if (coloringMode === 'valence') setSelectedValences(new Set());
                  }}
                    style={{
                      padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${THEME.border}`,
                      borderRadius: '0.375rem', background: THEME.card, color: THEME.foreground, cursor: 'pointer',
                    }}>None</button>
                </div>
              </div>

              {/* Render List Items based on Mode */}
              {coloringMode === 'cluster' && (Object.keys(CLUSTER_COLORS) as CartographyCluster[]).map(key => (
                <CheckboxItem
                  key={key}
                  id={key}
                  label={CLUSTER_LABELS[key]}
                  color={CLUSTER_COLORS[key]}
                  count={clusterStats[key]}
                  checked={selectedClusters.has(key)}
                  onChange={() => {
                    const newSet = new Set(selectedClusters);
                    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
                    setSelectedClusters(newSet);
                  }}
                />
              ))}

              {coloringMode === 'pattern' && Object.keys(PATTERN_COLORS).map(key => (
                <CheckboxItem
                  key={key}
                  id={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                  color={PATTERN_COLORS[key]}
                  count={patternStats[key]}
                  checked={selectedPatterns.has(key)}
                  onChange={() => {
                    const newSet = new Set(selectedPatterns);
                    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
                    setSelectedPatterns(newSet);
                  }}
                />
              ))}

              {coloringMode === 'purpose' && Object.keys(PURPOSE_COLORS).map(key => (
                <CheckboxItem
                  key={key}
                  id={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}
                  color={PURPOSE_COLORS[key]}
                  count={purposeStats[key]}
                  checked={selectedPurposes.has(key)}
                  onChange={() => {
                    const newSet = new Set(selectedPurposes);
                    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
                    setSelectedPurposes(newSet);
                  }}
                />
              ))}

              {coloringMode === 'valence' && Object.keys(VALENCE_COLORS).map(key => (
                <CheckboxItem
                  key={key}
                  id={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  color={(VALENCE_COLORS as any)[key]}
                  count={valenceStats[key]}
                  checked={selectedValences.has(key)}
                  onChange={() => {
                    const newSet = new Set(selectedValences);
                    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
                    setSelectedValences(newSet);
                  }}
                />
              ))}
            </div>
          )}

          {/* Axes */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: THEME.foreground,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>3D Axes</h3>
            <div style={{
              fontSize: '0.8rem', color: THEME.foregroundMuted, lineHeight: 1.7, padding: '1rem',
              background: 'rgba(123, 104, 238, 0.05)', borderRadius: '0.5rem', border: `1px solid ${THEME.border}`,
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: THEME.foreground }}>X:</strong> Functional ↔ Social<br />
                <span style={{ fontSize: '0.7rem' }}>Role-based communication function</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: THEME.foreground }}>Y:</strong> Aligned ↔ Divergent<br />
                <span style={{ fontSize: '0.7rem' }}>Linguistic structure alignment</span>
              </div>
              <div>
                <strong style={{ color: THEME.foreground }}>Z:</strong> Emotional Intensity<br />
                <span style={{ fontSize: '0.7rem' }}>PAD-based intensity (height)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Scene */}
        <div style={{ flex: 1, position: 'relative', background: '#000000' }}>
          <ThreeScene
            heightmap={heightmap}
            pathPoints={[]}
            paths={paths}
            contours={contours}
            hoveredPoint={hoveredPoint}
            lockedPoint={lockedPoint}
            timelineProgress={1.0}
            showContours={showContours}
            showTerrain={showTerrain}
            showMarkers={showMarkers}
            showPaths={showPaths}
            showPathPoints={showPathPoints}
            showDropLines={showDropLines}
            coloringMode={'path'} // Always use 'path' mode so it uses the pre-calculated color from our paths array
            backgroundColor="#000000"
            onPointHover={setHoveredPoint}
            onPointClick={setLockedPoint}
            lineWidth={1.0} // Thinner lines as requested
          />

          {/* Stats */}
          <div style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'rgba(30, 30, 30, 0.85)', backdropFilter: 'blur(10px)',
            padding: '1.25rem', borderRadius: '0.5rem', border: `1px solid ${THEME.border}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', minWidth: '200px', pointerEvents: 'none',
          }}>
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: '0.7rem', color: THEME.foregroundMuted, textTransform: 'uppercase' }}>Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: THEME.accent }}>{conversations.length}</div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: THEME.foregroundMuted, textTransform: 'uppercase' }}>Visible</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{paths.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: THEME.foregroundMuted, textTransform: 'uppercase' }}>Clusters</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{selectedClusters.size}/7</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
