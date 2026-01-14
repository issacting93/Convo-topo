import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThreeScene } from '../components/ThreeScene';
import { generateHeightmap, generateContours, generatePathPoints, type MetricMode } from '../utils/terrain';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
import { useConversationStore } from '../store/useConversationStore';
import {
  getCommunicationFunction,
  getConversationStructure,
  calculateMessagePAD
} from '../utils/conversationToTerrain';
import { Navigation } from '../components/Navigation';
import { formatCategoryName, formatRoleDistribution } from '../utils/formatClassificationData';
import { getColorForRole } from '../utils/constants';

const MAX_MESSAGES = 100;
const TERRAIN_SIZE = 64;

// Color mapping for different conversation patterns (reused from other views)
const PATTERN_COLORS: Record<string, string> = {
  'question-answer': '#7b68ee', // Purple
  'advisory': '#4ade80', // Green
  'storytelling': '#fbbf24', // Amber
  'casual-chat': '#ec4899', // Pink
  'collaborative': '#06b6d4', // Cyan
  'debate': '#ef4444', // Red
  'failed-instruction': '#dc2626', // Dark Red
  'misalignment': '#b91c1c', // Darker Red
  'breakdown-loop': '#7f1d1d', // Very Dark Red
  'default': '#94a3b8', // Slate
};

interface PathData {
  id: number;
  name: string;
  pathPoints: any[];
  color: string;
  visible: boolean;
  conversation: ClassifiedConversation;
  stats?: {
    messageCount: number;
    avgPleasure: number;
    avgArousal: number;
    avgDominance: number;
    avgEmotionalIntensity: number;
    totalDistance: number;
    elevationChange: { min: number; max: number; avg: number };
    pattern?: string;
    tone?: string;
    humanRoles?: Array<{ role: string; percentage: number }>;
    aiRoles?: Array<{ role: string; percentage: number }>;
  };
  pattern?: string; // Add pattern to PathData interface
}

// Helper function to process conversation messages for visualization
function processConversationMessages(conversation: ClassifiedConversation | null, maxMessages: number) {
  if (!conversation || !conversation.messages) {
    return [];
  }

  const commFunc = getCommunicationFunction(conversation);
  const convStruct = getConversationStructure(conversation);

  return conversation.messages
    .slice(0, maxMessages)
    .map((msg, index) => {
      const pad = msg.pad || (conversation.classification
        ? calculateMessagePAD(
          msg,
          conversation.classification,
          index,
          conversation.messages.length
        )
        : undefined);

      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        communicationFunction: commFunc,
        conversationStructure: convStruct,
        pad
      };
    });
}

// Calculate path statistics
function calculatePathStats(pathPoints: any[], conversation: ClassifiedConversation | null): PathData['stats'] {
  if (!pathPoints.length || !conversation) {
    return undefined;
  }

  // Calculate average PAD values
  const pads = pathPoints
    .map(p => p.pad)
    .filter(p => p !== undefined);

  const avgPleasure = pads.length > 0
    ? pads.reduce((sum, p) => sum + (p?.pleasure || 0), 0) / pads.length
    : 0;
  const avgArousal = pads.length > 0
    ? pads.reduce((sum, p) => sum + (p?.arousal || 0), 0) / pads.length
    : 0;
  const avgDominance = pads.length > 0
    ? pads.reduce((sum, p) => sum + (p?.dominance || 0), 0) / pads.length
    : 0;
  const avgEmotionalIntensity = pads.length > 0
    ? pads.reduce((sum, p) => sum + (p?.emotionalIntensity || 0), 0) / pads.length
    : 0;

  // Calculate total distance traveled
  let totalDistance = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dz = (curr.pad?.emotionalIntensity || curr.height || 0) - (prev.pad?.emotionalIntensity || prev.height || 0);
    totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Calculate elevation change
  const elevations = pathPoints.map(p => p.pad?.emotionalIntensity || p.height || 0);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  const avgElevation = elevations.reduce((sum, e) => sum + e, 0) / elevations.length;

  // Get classification data
  const pattern = conversation.classification?.interactionPattern?.category;
  const tone = conversation.classification?.emotionalTone?.category;
  const humanRoles = conversation.classification?.humanRole?.distribution
    ? formatRoleDistribution(conversation.classification.humanRole.distribution)
    : undefined;
  const aiRoles = conversation.classification?.aiRole?.distribution
    ? formatRoleDistribution(conversation.classification.aiRole.distribution)
    : undefined;

  return {
    messageCount: pathPoints.length,
    avgPleasure,
    avgArousal,
    avgDominance,
    avgEmotionalIntensity,
    totalDistance,
    elevationChange: {
      min: minElevation,
      max: maxElevation,
      avg: avgElevation
    },
    pattern,
    tone,
    humanRoles,
    aiRoles
  };
}

// Get color for a conversation based on its pattern
function getPathColor(conversation: ClassifiedConversation | null): string {
  if (!conversation?.classification?.interactionPattern?.category) {
    return PATTERN_COLORS.default;
  }
  const pattern = conversation.classification.interactionPattern.category;
  return PATTERN_COLORS[pattern] || PATTERN_COLORS.default;
}

export function MultiPathViewPage() {
  const navigate = useNavigate();
  const terrains = useConversationStore(state => state.terrains);
  const conversations = useConversationStore(state => state.conversations);
  const loading = useConversationStore(state => state.loading);

  const [seed] = useState(42);
  const [timelineProgress, setTimelineProgress] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);
  const contourCount = 15; // Removed unused state setter
  const [showContours, setShowContours] = useState(true);
  const metricMode: MetricMode = 'composite';
  const [selectedConversationIds, setSelectedConversationIds] = useState<number[]>([]);
  const terrainPosition = { x: 0, y: 0, z: -2.5 }; // Removed unused state setter
  const [cameraView, setCameraView] = useState<'default' | 'side' | 'top'>('default');
  const contourColors = { // Removed unused state setter
    minor: '#303030',
    major: '#202020',
    index: '#101010'
  };
  const [cameraDistance, setCameraDistance] = useState(18);
  const [cameraElevation, setCameraElevation] = useState(30);
  const [cameraRotation, setCameraRotation] = useState(0);
  const [pathVisibility, setPathVisibility] = useState<Record<number, boolean>>({});
  const [showMarkers, setShowMarkers] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const [showTerrain, setShowTerrain] = useState(false);
  const [showDistanceLines, setShowDistanceLines] = useState(false);
  const [distanceThreshold, setDistanceThreshold] = useState(2.0);
  const [connectSamePatternOnly, setConnectSamePatternOnly] = useState(false);


  // New state for enhancements
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'pattern' | 'tone' | 'role'>('none');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);
  const [coloringMode, setColoringMode] = useState<'path' | 'role'>('path');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [visibleRoles, setVisibleRoles] = useState({ user: true, assistant: true });
  const [soloPathId, setSoloPathId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedPathForStats, setSelectedPathForStats] = useState<number | null>(null);

  // Initialize with first 200 conversations
  useEffect(() => {
    if (!loading && terrains.length > 0 && selectedConversationIds.length === 0) {
      const initialIds = terrains.slice(0, 200).map(t => t.id);
      setSelectedConversationIds(initialIds);
      const initialVisibility: Record<number, boolean> = {};
      initialIds.forEach(id => {
        initialVisibility[id] = true;
      });
      setPathVisibility(initialVisibility);
    }
  }, [loading, terrains, selectedConversationIds.length]);

  // Generate heightmap (using composite mode for shared terrain)
  const heightmap = useMemo(() => {
    return generateHeightmap(TERRAIN_SIZE, seed, { metricMode });
  }, [seed, metricMode]);

  // Generate path data for all selected conversations with stats
  const pathDataList = useMemo(() => {
    return selectedConversationIds.map((id) => {
      const terrainIndex = terrains.findIndex(t => t.id === id);
      if (terrainIndex < 0) return null;

      const conversation = conversations[terrainIndex];
      if (!conversation) return null;

      const messages = processConversationMessages(conversation, MAX_MESSAGES);
      const pathPoints = generatePathPoints(heightmap, TERRAIN_SIZE, messages.length, messages);

      const stats = calculatePathStats(pathPoints, conversation);

      let color = PATTERN_COLORS.default;

      if (coloringMode === 'role') {
        const humanRoles = conversation?.classification?.humanRole?.distribution;
        if (humanRoles) {
          const formattedRoles = formatRoleDistribution(humanRoles);
          // Use dominant role
          if (formattedRoles.length > 0) {
            color = getColorForRole(formattedRoles[0].role);
          }
        }
      } else {
        color = getPathColor(conversation);
      }

      // Get pattern for filtering
      const pattern = conversation?.classification?.interactionPattern?.category;

      return {
        id,
        name: terrains[terrainIndex].name,
        pathPoints,
        color,
        visible: pathVisibility[id] !== false,
        conversation,
        stats,
        pattern // Pass pattern to ThreeScene
      };
    }).filter(p => p !== null) as PathData[];
  }, [selectedConversationIds, terrains, conversations, heightmap, pathVisibility, coloringMode]);

  // Calculate available roles from all loaded conversations
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    conversations.forEach(c => {
      if (c?.classification?.humanRole?.distribution) {
        formatRoleDistribution(c.classification.humanRole.distribution).forEach(r => {
          roles.add(r.role);
        });
      }
    });
    return Array.from(roles).sort();
  }, [conversations]);

  // Filter and group conversations for sidebar
  const filteredAndGroupedConversations = useMemo(() => {
    const filtered = terrains.map((terrain, idx) => {
      const conversation = conversations[idx];
      const isSelected = selectedConversationIds.includes(terrain.id);
      const pathData = pathDataList.find(p => p?.id === terrain.id);

      // Filter by search query
      const matchesSearch = !searchQuery ||
        terrain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation?.classification?.interactionPattern?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation?.classification?.emotionalTone?.category?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return null;

      // Filter by Role
      if (selectedRoleFilter) {
        const humanRoles = conversation?.classification?.humanRole?.distribution;
        if (!humanRoles) return null;

        const formattedRoles = formatRoleDistribution(humanRoles);
        const hasRole = formattedRoles.some(r => r.role === selectedRoleFilter);
        if (!hasRole) return null;
      }

      return {
        terrain,
        conversation,
        isSelected,
        pathData
      };
    }).filter(item => item !== null);

    // Group if needed
    if (groupBy === 'none') {
      return { groups: [{ key: 'all', label: 'All Conversations', items: filtered }] };
    }

    const groups = new Map<string, typeof filtered>();
    filtered.forEach(item => {
      if (!item) return;

      let key = 'unclassified';

      if (groupBy === 'pattern') {
        key = item.conversation?.classification?.interactionPattern?.category || 'unclassified';
      } else if (groupBy === 'tone') {
        key = item.conversation?.classification?.emotionalTone?.category || 'unclassified';
      } else if (groupBy === 'role') {
        const humanRoles = item.conversation?.classification?.humanRole?.distribution;
        if (humanRoles) {
          const formattedRoles = formatRoleDistribution(humanRoles);
          // Use dominant role (first one, as it's sorted by value)
          if (formattedRoles.length > 0) {
            key = formattedRoles[0].role;
          }
        }
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    const grouped = Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: groupBy === 'role' ? key : formatCategoryName(key),
      items
    })).sort((a, b) => a.label.localeCompare(b.label));

    return { groups: grouped };
  }, [terrains, conversations, selectedConversationIds, pathDataList, searchQuery, groupBy, selectedRoleFilter]);

  const contours = useMemo(
    () => generateContours(heightmap, TERRAIN_SIZE, contourCount),
    [heightmap, contourCount]
  );

  const handleAnimate = useCallback(() => {
    setTimelineProgress(0);
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 3000, 1);
      setTimelineProgress(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const handleBackToGrid = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handlePointClick = useCallback((idx: number) => {
    setLockedPoint(prev => prev === idx ? null : idx);
  }, []);

  const toggleConversation = useCallback((id: number) => {
    setSelectedConversationIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id].slice(0, 200); // Max 200 paths
      }
    });
  }, []);

  const togglePathVisibility = useCallback((id: number) => {
    setPathVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleCardExpansion = useCallback((id: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSoloPath = useCallback((id: number | null) => {
    if (soloPathId === id) {
      setSoloPathId(null);
    } else {
      setSoloPathId(id);
    }
  }, [soloPathId]);

  const selectAllInGroup = useCallback((groupKey: string) => {
    const group = filteredAndGroupedConversations.groups.find(g => g.key === groupKey);
    if (!group) return;

    const groupIds = group.items
      .filter(item => item && !item.isSelected)
      .map(item => item!.terrain.id);

    if (groupIds.length > 0) {
      setSelectedConversationIds(prev => {
        const newIds = [...prev, ...groupIds].slice(0, 200);
        const newVisibility: Record<number, boolean> = { ...pathVisibility };
        groupIds.forEach(id => {
          newVisibility[id] = true;
        });
        setPathVisibility(newVisibility);
        return newIds;
      });
    }
  }, [filteredAndGroupedConversations, pathVisibility]);

  const deselectAllInGroup = useCallback((groupKey: string) => {
    const group = filteredAndGroupedConversations.groups.find(g => g.key === groupKey);
    if (!group) return;

    const groupIds = group.items
      .filter(item => item && item.isSelected)
      .map(item => item!.terrain.id);

    if (groupIds.length > 0) {
      setSelectedConversationIds(prev => prev.filter(id => !groupIds.includes(id)));
      setPathVisibility(prev => {
        const newVisibility = { ...prev };
        groupIds.forEach(id => {
          delete newVisibility[id];
        });
        return newVisibility;
      });
    }
  }, [filteredAndGroupedConversations]);

  // Get visible paths (respecting solo mode)
  const visiblePaths = useMemo(() => {
    if (soloPathId !== null) {
      return pathDataList.filter(p => p && p.id === soloPathId && p.visible);
    }
    return pathDataList.filter(p => p && p.visible);
  }, [pathDataList, soloPathId]);

  // Get selected path for stats
  const selectedPathStats = useMemo(() => {
    if (selectedPathForStats === null) return null;
    return pathDataList.find(p => p && p.id === selectedPathForStats);
  }, [pathDataList, selectedPathForStats]);

  if (loading && terrains.length === 0) {
    return <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'monospace'
    }}>LOADING DATA...</div>;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex'
    }}>
      {/* Enhanced Sidebar */}
      <div style={{
        width: 380,
        background: '#f5f5f5',
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header with search and grouping */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          background: '#ffffff'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            fontFamily: 'monospace',
            marginBottom: 12
          }}>
            Multi-Path View
          </h2>
          <Navigation />

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              marginTop: 12,
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 4,
              fontSize: '12px',
              background: '#ffffff'
            }}
          />

          {/* Group by selector */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: 4 }}>
              Group by:
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'none' | 'pattern' | 'tone' | 'role')}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                fontSize: '12px',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="none">None</option>
              <option value="pattern">Pattern</option>
              <option value="tone">Tone</option>
              <option value="role">Human Role</option>
            </select>
          </div>

          {/* Role Filter */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: 4 }}>
              Filter by Role:
            </label>
            <select
              value={selectedRoleFilter || ''}
              onChange={(e) => setSelectedRoleFilter(e.target.value || null)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                fontSize: '12px',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Coloring Mode selector */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: 4 }}>
              Color paths by:
            </label>
            <select
              value={coloringMode}
              onChange={(e) => setColoringMode(e.target.value as 'path' | 'role')}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                fontSize: '12px',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="path">Conversation Pattern (Default)</option>
              <option value="role">Speaker Role (User/AI)</option>
            </select>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: 12
          }}>
            {visiblePaths.length} of {selectedConversationIds.length} paths visible
            {soloPathId !== null && ` (Solo mode)`}
          </div>
        </div>

        {/* Conversation list with grouping */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px'
        }}>
          {filteredAndGroupedConversations.groups.map((group) => (
            <div key={group.key} style={{ marginBottom: groupBy !== 'none' ? 16 : 0 }}>
              {/* Group header (only if grouping is enabled) */}
              {groupBy !== 'none' && (() => {
                const selectedCount = group.items.filter(item => item && item.isSelected).length;
                const allSelected = selectedCount === group.items.length;

                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#e8e8e8',
                    borderRadius: 4,
                    marginBottom: 8,
                    cursor: 'pointer'
                  }}
                    onClick={() => toggleGroup(group.key)}
                  >
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1a1a1a'
                    }}>
                      {group.label} ({group.items.length}) {selectedCount > 0 && `[${selectedCount} selected]`}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {!allSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllInGroup(group.key);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '10px',
                            background: 'rgba(123, 104, 238, 0.1)',
                            border: '1px solid rgba(123, 104, 238, 0.3)',
                            borderRadius: 3,
                            color: '#7b68ee',
                            cursor: 'pointer'
                          }}
                        >
                          Select All
                        </button>
                      )}
                      {selectedCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deselectAllInGroup(group.key);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '10px',
                            background: 'rgba(255, 100, 100, 0.1)',
                            border: '1px solid rgba(255, 100, 100, 0.3)',
                            borderRadius: 3,
                            color: '#ff6464',
                            cursor: 'pointer'
                          }}
                        >
                          Deselect All
                        </button>
                      )}
                      <span style={{ fontSize: '10px', color: '#666' }}>
                        {expandedGroups.has(group.key) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Group items */}
              {(groupBy === 'none' || expandedGroups.has(group.key)) && group.items.map((item) => {
                if (!item) return null;
                const { terrain, isSelected, pathData } = item;
                const isVisible = pathData?.visible ?? false;
                const isExpanded = expandedCards.has(terrain.id);
                const isSolo = soloPathId === terrain.id;

                return (
                  <div
                    key={terrain.id}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: isSelected ? (isSolo ? 'rgba(123, 104, 238, 0.2)' : 'rgba(123, 104, 238, 0.1)') : '#ffffff',
                      border: `2px solid ${isSelected ? (isVisible ? pathData?.color || '#000' : '#999') : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isSelected && !isVisible ? 0.5 : 1
                    }}
                    onClick={() => toggleConversation(terrain.id)}
                  >
                    {/* Main card content */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}>
                      {/* Color indicator */}
                      {isSelected && pathData && (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            background: pathData.color,
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            flexShrink: 0,
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePathVisibility(terrain.id);
                          }}
                          title={isVisible ? 'Hide path' : 'Show path'}
                        />
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 500,
                          color: '#1a1a1a',
                          marginBottom: 4
                        }}>
                          {terrain.name}
                        </div>

                        {/* Quick stats */}
                        {isSelected && pathData?.stats && (
                          <div style={{
                            fontSize: '11px',
                            color: '#666',
                            marginBottom: 6
                          }}>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              {pathData.stats.pattern && (
                                <span>📊 {formatCategoryName(pathData.stats.pattern)}</span>
                              )}
                              {pathData.stats.tone && (
                                <span>🎭 {formatCategoryName(pathData.stats.tone)}</span>
                              )}
                              <span>💬 {pathData.stats.messageCount} msgs</span>
                            </div>
                          </div>
                        )}

                        {/* Expandable details */}
                        {isSelected && pathData && (
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCardExpansion(terrain.id);
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '10px',
                                background: 'transparent',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: 3,
                                color: '#666',
                                cursor: 'pointer',
                                marginTop: 4
                              }}
                            >
                              {isExpanded ? '▼ Less' : '▶ More'}
                            </button>

                            {isExpanded && pathData.stats && (
                              <div style={{
                                marginTop: 8,
                                padding: 8,
                                background: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 4,
                                fontSize: '10px'
                              }}>
                                {/* PAD averages */}
                                <div style={{ marginBottom: 6 }}>
                                  <strong>PAD Averages:</strong>
                                  <div style={{ marginTop: 2 }}>
                                    P: {pathData.stats.avgPleasure.toFixed(2)} |
                                    A: {pathData.stats.avgArousal.toFixed(2)} |
                                    D: {pathData.stats.avgDominance.toFixed(2)}
                                  </div>
                                  <div>Intensity: {pathData.stats.avgEmotionalIntensity.toFixed(2)}</div>
                                </div>

                                {/* Role distributions */}
                                {pathData.stats.humanRoles && pathData.stats.humanRoles.length > 0 && (
                                  <div style={{ marginBottom: 6 }}>
                                    <strong>Human Roles:</strong>
                                    <div style={{ marginTop: 2 }}>
                                      {pathData.stats.humanRoles.slice(0, 3).map(r => (
                                        <span key={r.role} style={{ marginRight: 8 }}>
                                          {r.role} {r.percentage}%
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {pathData.stats.aiRoles && pathData.stats.aiRoles.length > 0 && (
                                  <div style={{ marginBottom: 6 }}>
                                    <strong>AI Roles:</strong>
                                    <div style={{ marginTop: 2 }}>
                                      {pathData.stats.aiRoles.slice(0, 3).map(r => (
                                        <span key={r.role} style={{ marginRight: 8 }}>
                                          {r.role} {r.percentage}%
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Path metrics */}
                                <div>
                                  <strong>Path Metrics:</strong>
                                  <div style={{ marginTop: 2 }}>
                                    Distance: {pathData.stats.totalDistance.toFixed(2)}
                                  </div>
                                  <div>
                                    Elevation: {pathData.stats.elevationChange.min.toFixed(2)} - {pathData.stats.elevationChange.max.toFixed(2)}
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSoloPath(terrain.id);
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      background: isSolo ? 'rgba(123, 104, 238, 0.3)' : 'rgba(123, 104, 238, 0.1)',
                                      border: '1px solid rgba(123, 104, 238, 0.3)',
                                      borderRadius: 3,
                                      color: '#7b68ee',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isSolo ? 'Exit Solo' : 'Solo'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPathForStats(terrain.id);
                                      setShowStats(true);
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      background: 'rgba(0, 0, 0, 0.05)',
                                      border: '1px solid rgba(0, 0, 0, 0.1)',
                                      borderRadius: 3,
                                      color: '#1a1a1a',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Stats
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main 3D Scene */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#000000'
      }}>
        <ThreeScene
          heightmap={heightmap}
          pathPoints={[]}
          paths={visiblePaths.filter(p => p).map(p => ({
            points: p!.pathPoints,
            color: p!.color,
            name: p!.name,
            pattern: p!.pattern
          }))}
          contours={contours}
          hoveredPoint={hoveredPoint}
          lockedPoint={lockedPoint}
          terrainPosition={terrainPosition}
          cameraView={cameraView}
          cameraDistance={cameraDistance}
          cameraElevation={cameraElevation}
          cameraRotation={cameraRotation}
          contourColors={contourColors}
          backgroundColor="#000000"
          timelineProgress={timelineProgress}
          showContours={showContours}
          showMarkers={showMarkers}
          showPaths={showPaths}
          showTerrain={showTerrain}
          showDistanceLines={showDistanceLines}
          distanceThreshold={distanceThreshold}
          connectSamePatternOnly={connectSamePatternOnly}
          coloringMode={coloringMode}
          visibleRoles={visibleRoles}
          onPointHover={setHoveredPoint}
          onPointClick={handlePointClick}
        />

        {/* Enhanced Controls overlay */}
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minWidth: 240,
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {/* Camera View Controls */}
          <div>
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Camera View
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['default', 'side', 'top'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setCameraView(view)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: cameraView === view
                      ? 'rgba(123, 104, 238, 0.2)'
                      : 'rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${cameraView === view ? 'rgba(123, 104, 238, 0.5)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: 4,
                    color: cameraView === view ? '#7b68ee' : '#1a1a1a',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: cameraView === view ? 600 : 400,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Controls */}
          <div style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Camera Controls
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: '11px', display: 'block', marginBottom: 4 }}>
                  Distance: {cameraDistance.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="8"
                  max="30"
                  step="0.5"
                  value={cameraDistance}
                  onChange={(e) => setCameraDistance(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', display: 'block', marginBottom: 4 }}>
                  Elevation: {cameraElevation.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={cameraElevation}
                  onChange={(e) => setCameraElevation(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', display: 'block', marginBottom: 4 }}>
                  Rotation: {cameraRotation.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={cameraRotation}
                  onChange={(e) => setCameraRotation(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* View Settings (Collapsed by default) */}
          <div style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => setExpandedSettings(!expandedSettings)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              View Settings
              <span>{expandedSettings ? '▼' : '▶'}</span>
            </button>

            {expandedSettings && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Role Visibility */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 2
                  }}>
                    Role Visibility
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleRoles.user}
                      onChange={(e) => setVisibleRoles(prev => ({ ...prev, user: e.target.checked }))}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show User</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleRoles.assistant}
                      onChange={(e) => setVisibleRoles(prev => ({ ...prev, assistant: e.target.checked }))}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Assistant</span>
                  </label>
                </div>

                {/* Visibility Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 2
                  }}>
                    Layers
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showPaths}
                      onChange={(e) => setShowPaths(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Paths</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showMarkers}
                      onChange={(e) => setShowMarkers(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Markers</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showContours}
                      onChange={(e) => setShowContours(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Contours</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showTerrain}
                      onChange={(e) => setShowTerrain(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Terrain</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showDistanceLines}
                      onChange={(e) => setShowDistanceLines(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Show Distance Lines</span>
                  </label>
                </div>
                {showDistanceLines && (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <label style={{ fontSize: '11px', display: 'block', marginBottom: 4 }}>
                        Line Threshold: {distanceThreshold.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={distanceThreshold}
                        onChange={(e) => setDistanceThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}>
                      <input
                        type="checkbox"
                        checked={connectSamePatternOnly}
                        onChange={(e) => setConnectSamePatternOnly(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: '#666' }}>Connect Only Same Pattern</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={handleAnimate}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(123, 104, 238, 0.1)',
                border: '1px solid rgba(123, 104, 238, 0.3)',
                borderRadius: 4,
                color: '#7b68ee',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: 6
              }}
            >
              Animate Paths
            </button>
            {soloPathId !== null && (
              <button
                onClick={() => setSoloPathId(null)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'rgba(255, 100, 100, 0.1)',
                  border: '1px solid rgba(255, 100, 100, 0.3)',
                  borderRadius: 4,
                  color: '#ff6464',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginBottom: 6
                }}
              >
                Exit Solo Mode
              </button>
            )}
            <button
              onClick={handleBackToGrid}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                color: '#1a1a1a',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Back to Grid
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && selectedPathStats && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '16px',
            borderRadius: 8,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            minWidth: 300,
            maxWidth: 400,
            maxHeight: '60vh',
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                Path Statistics: {selectedPathStats.name}
              </h3>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {selectedPathStats.stats && (
              <div style={{ fontSize: '12px' }}>
                {/* Basic Info */}
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <div><strong>Messages:</strong> {selectedPathStats.stats.messageCount}</div>
                  <div><strong>Pattern:</strong> {selectedPathStats.stats.pattern ? formatCategoryName(selectedPathStats.stats.pattern) : 'N/A'}</div>
                  <div><strong>Tone:</strong> {selectedPathStats.stats.tone ? formatCategoryName(selectedPathStats.stats.tone) : 'N/A'}</div>
                </div>

                {/* PAD Averages */}
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>PAD Averages</div>
                  <div>Pleasure: {selectedPathStats.stats.avgPleasure.toFixed(3)}</div>
                  <div>Arousal: {selectedPathStats.stats.avgArousal.toFixed(3)}</div>
                  <div>Dominance: {selectedPathStats.stats.avgDominance.toFixed(3)}</div>
                  <div>Emotional Intensity: {selectedPathStats.stats.avgEmotionalIntensity.toFixed(3)}</div>
                </div>

                {/* Path Metrics */}
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Path Metrics</div>
                  <div>Total Distance: {selectedPathStats.stats.totalDistance.toFixed(2)}</div>
                  <div>Elevation Range: {selectedPathStats.stats.elevationChange.min.toFixed(2)} - {selectedPathStats.stats.elevationChange.max.toFixed(2)}</div>
                  <div>Average Elevation: {selectedPathStats.stats.elevationChange.avg.toFixed(2)}</div>
                </div>

                {/* Role Distributions */}
                {selectedPathStats.stats.humanRoles && selectedPathStats.stats.humanRoles.length > 0 && (
                  <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Human Roles</div>
                    {selectedPathStats.stats.humanRoles.map(r => (
                      <div key={r.role} style={{ marginBottom: 4 }}>
                        {r.role}: {r.percentage}%
                      </div>
                    ))}
                  </div>
                )}

                {selectedPathStats.stats.aiRoles && selectedPathStats.stats.aiRoles.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>AI Roles</div>
                    {selectedPathStats.stats.aiRoles.map(r => (
                      <div key={r.role} style={{ marginBottom: 4 }}>
                        {r.role}: {r.percentage}%
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
