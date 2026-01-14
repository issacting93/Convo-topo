import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCommunicationFunction, getConversationStructure, getConversationSource, getDominantHumanRole, getDominantAiRole, mapOldRoleToNew } from '../utils/conversationToTerrain';
import { formatRoleName } from '../utils/formatClassificationData';
import { generate2DPathPoints } from '../utils/terrain';
import { FilterPanel, type FilterState } from '../components/FilterPanel';
import { Navigation } from '../components/Navigation';
import { useConversationStore } from '../store/useConversationStore';

interface ConversationPoint {
  x: number; // Functional ↔ Social (0-1), where 0 = functional, 1 = social (Linguistic Markers)
  y: number; // Aligned ↔ Divergent (0-1), where 0 = aligned (convergent), 1 = divergent (Linguistic Alignment)
  id: string;
  name: string;
  pattern: string;
  tone: string;
  source: 'chatbot_arena' | 'wildchat' | 'oasst'; // Source classification
  messageCount: number;
  maxEI: number;
  humanRole?: string; // Dominant human role
  aiRole?: string; // Dominant AI role
  pathPoints?: Array<{ x: number; y: number; role: 'user' | 'assistant' }>;
}

interface ClusterData {
  source: 'chatbot_arena' | 'wildchat' | 'oasst';
  points: ConversationPoint[];
  color: string;
  label: string;
  description: string;
}

const THEME = {
  foreground: '#151515',
  foregroundMuted: '#666666',
  accent: '#7b68ee',
  border: 'rgba(0, 0, 0, 0.1)',
  card: '#ffffff',
  cardRgba: (alpha: number) => `rgba(255, 255, 255, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
};

// Source color mapping
const SOURCE_COLORS: Record<'chatbot_arena' | 'wildchat' | 'oasst', { color: string; label: string; description: string }> = {
  'chatbot_arena': {
    color: '#7b68ee', // Purple
    label: 'Chatbot Arena',
    description: 'Head-to-head comparison conversations. Users compare different AI models side-by-side in structured evaluation context.'
  },
  'wildchat': {
    color: '#4ade80', // Green
    label: 'WildChat',
    description: 'Organic ChatGPT usage in the wild. Natural user interactions representing real-world AI conversations.'
  },
  'oasst': {
    color: '#fbbf24', // Amber
    label: 'OASST',
    description: 'OpenAssistant conversations. Instruction-following and task-oriented interactions from the OASST dataset.'
  }
};

export function SpatialClusteringPage() {
  const conversations = useConversationStore(state => state.conversations);

  const navigate = useNavigate();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [showPaths, setShowPaths] = useState(false);
  const [pinnedTooltip, setPinnedTooltip] = useState<ConversationPoint | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    pattern: 'all',
    tone: 'all',
    intensityRange: [0, 1],
    messageCountRange: [0, 100],
    source: 'all'
  });

  // Calculate available filter values
  const availablePatterns = useMemo(() => {
    const patterns = new Set<string>();
    conversations.forEach(conv => {
      const pattern = conv.classification?.interactionPattern?.category;
      if (pattern) patterns.add(pattern);
    });
    return Array.from(patterns).sort();
  }, [conversations]);

  const availableTones = useMemo(() => {
    const tones = new Set<string>();
    conversations.forEach(conv => {
      const tone = conv.classification?.emotionalTone?.category;
      if (tone) tones.add(tone);
    });
    return Array.from(tones).sort();
  }, [conversations]);

  const intensityRange: [number, number] = useMemo(() => {
    const intensities: number[] = [];
    conversations.forEach(conv => {
      conv.messages?.forEach(msg => {
        const ei = msg.pad?.emotionalIntensity;
        if (ei !== undefined && ei > 0) intensities.push(ei);
      });
    });
    if (intensities.length === 0) return [0, 1];
    return [Math.min(...intensities), Math.max(...intensities)];
  }, [conversations]);

  const messageCountRange: [number, number] = useMemo(() => {
    const counts = conversations.map(conv => conv.messages?.length || 0);
    if (counts.length === 0) return [0, 100];
    return [Math.min(...counts), Math.max(...counts)];
  }, [conversations]);

  // Initialize message count range (only once when data loads)
  useEffect(() => {
    if (messageCountRange[0] !== undefined && messageCountRange[1] !== undefined) {
      setFilters(prev => {
        // Only update message count range if still at default (0-100)
        if (prev.messageCountRange[0] === 0 && prev.messageCountRange[1] === 100) {
          return {
            ...prev,
            messageCountRange: messageCountRange
          };
        }
        return prev;
      });
    }
  }, [messageCountRange]);

  // Calculate positions and group by pattern
  const conversationPoints = useMemo((): ConversationPoint[] => {
    return conversations
      .filter(conv => conv.classification) // Only classified conversations
      .filter(conv => {
        // Apply filters
        if (filters.pattern !== 'all') {
          const pattern = conv.classification?.interactionPattern?.category;
          if (pattern !== filters.pattern) return false;
        }
        if (filters.tone !== 'all') {
          const tone = conv.classification?.emotionalTone?.category;
          if (tone !== filters.tone) return false;
        }

        const messageCount = conv.messages?.length || 0;
        if (messageCount < filters.messageCountRange[0] || messageCount > filters.messageCountRange[1]) {
          return false;
        }

        const padValues = conv.messages?.map(msg => msg.pad?.emotionalIntensity || 0).filter(v => v > 0) || [];
        const maxEI = padValues.length > 0 ? Math.max(...padValues) : 0;
        if (maxEI < filters.intensityRange[0] || maxEI > filters.intensityRange[1]) {
          return false;
        }

        // Filter by source (chatbot_arena, wildchat, oasst)
        if (filters.source && filters.source !== 'all') {
          const source = getConversationSource(conv);
          if (source !== filters.source) return false;
        }

        return true;
      })
      .map(conv => {
        const x = getCommunicationFunction(conv);
        const y = getConversationStructure(conv);
        const pattern = conv.classification?.interactionPattern?.category || 'unknown';
        const tone = conv.classification?.emotionalTone?.category || 'neutral';
        const source = getConversationSource(conv);

        // Calculate max emotional intensity
        const padValues = conv.messages
          .map(msg => msg.pad?.emotionalIntensity || 0)
          .filter(v => v > 0);
        const maxEI = padValues.length > 0 ? Math.max(...padValues) : 0;

        // Generate path points if messages exist
        let pathPoints: Array<{ x: number; y: number; role: 'user' | 'assistant' }> = [];
        if (conv.messages && conv.messages.length > 0) {
          const preparedMessages = conv.messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            communicationFunction: x,
            conversationStructure: y
          }));
          pathPoints = generate2DPathPoints(preparedMessages);
        }

        // Get dominant roles
        const humanRole = getDominantHumanRole(conv);
        const aiRole = getDominantAiRole(conv);
        const mappedHumanRole = humanRole ? mapOldRoleToNew(humanRole.role, 'human') : undefined;
        const mappedAiRole = aiRole ? mapOldRoleToNew(aiRole.role, 'ai') : undefined;

        return {
          x: x * 100, // Scale to 0-100 for better chart display
          y: y * 100,
          id: conv.id,
          name: conv.id,
          pattern: pattern,
          tone: tone,
          source: source,
          messageCount: conv.messages?.length || 0,
          maxEI: maxEI,
          humanRole: mappedHumanRole,
          aiRole: mappedAiRole,
          pathPoints: pathPoints
        };
      });
  }, [conversations, filters]);

  // Group by source (three separate datasets)
  const clusters = useMemo((): ClusterData[] => {
    const grouped: Record<'chatbot_arena' | 'wildchat' | 'oasst', ConversationPoint[]> = {
      chatbot_arena: [],
      wildchat: [],
      oasst: []
    };

    conversationPoints.forEach(point => {
      grouped[point.source].push(point);
    });

    return Object.entries(grouped)
      .filter(([_, points]) => points.length > 0)
      .map(([source, points]) => ({
        source: source as 'chatbot_arena' | 'wildchat' | 'oasst',
        points,
        ...SOURCE_COLORS[source as 'chatbot_arena' | 'wildchat' | 'oasst']
      }))
      .sort((a, b) => b.points.length - a.points.length); // Sort by count
  }, [conversationPoints]);

  const handlePointClick = (data: any, _index: number, e: React.MouseEvent) => {
    e?.stopPropagation();
    // Recharts passes the point data as the first argument, or within payload
    const point = (data.payload || data) as ConversationPoint;

    setPinnedTooltip(point);
    setSelectedConversationIds(prev =>
      prev.includes(point.id)
        ? prev.filter(id => id !== point.id)
        : [...prev, point.id]
    );
  };

  // Custom tooltip with click to pin functionality
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ConversationPoint;
      const isSelected = selectedConversationIds.includes(data.id);

      return (
        <div
          style={{
            background: THEME.card,
            border: `2px solid ${isSelected ? THEME.accent : THEME.border}`,
            borderRadius: 4,
            padding: '12px',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            maxWidth: 300
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPinnedTooltip(data);
            // Also toggle selection
            setSelectedConversationIds(prev =>
              prev.includes(data.id)
                ? prev.filter(id => id !== data.id)
                : [...prev, data.id]
            );
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{data.name}</div>
            <div style={{
              fontSize: '10px',
              color: THEME.foregroundMuted,
              cursor: 'pointer'
            }}>
              {isSelected ? '✓ Selected' : 'Click to select'}
            </div>
          </div>
          <div style={{ color: THEME.foregroundMuted, lineHeight: 1.6 }}>
            <div><strong>Pattern:</strong> {data.pattern}</div>
            <div><strong>Tone:</strong> {data.tone}</div>
            <div><strong>Source:</strong> {SOURCE_COLORS[data.source].label}</div>
            {data.humanRole && (
              <div><strong>Human Role:</strong> {formatRoleName(data.humanRole, 'human')}</div>
            )}
            {data.aiRole && (
              <div><strong>AI Role:</strong> {formatRoleName(data.aiRole, 'ai')}</div>
            )}
            <div><strong>Messages:</strong> {data.messageCount}</div>
            <div><strong>Max EI:</strong> {isNaN(data.maxEI) ? 'N/A' : data.maxEI.toFixed(3)}</div>
            <div><strong>Position:</strong> ({isNaN(data.x) ? 'N/A' : data.x.toFixed(1)}, {isNaN(data.y) ? 'N/A' : data.y.toFixed(1)})</div>
            <div style={{ marginTop: 6, fontSize: '11px', fontStyle: 'italic', color: THEME.accent }}>
              Click to pin & select
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: THEME.card,
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              color: THEME.foreground
            }}>
              Multi-Conversation Spatial Clustering
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: THEME.foregroundMuted
            }}>
              Conversations plotted in relational space (X: Functional ↔ Social, Y: Aligned ↔ Divergent) - Color coded by source (Evaluation Context: Purple, Organic Usage: Green)
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: '14px',
              color: THEME.foreground
            }}>
              <input
                type="checkbox"
                checked={showPaths}
                onChange={(e) => setShowPaths(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Show Paths
            </label>
          </div>
        </div>

        <Navigation />
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        gap: 24,
        minHeight: 0 // Allow flex child to shrink below content size
      }}>
        {/* Chart Area */}
        <div style={{
          flex: 1,
          minWidth: 600,
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 8,
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={600}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.borderRgba(0.2)} />

              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                label={{
                  value: 'Functional ↔ Social',
                  position: 'insideBottom',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: THEME.foreground, fontSize: 14, fontWeight: 500 }
                }}
                tick={{ fill: THEME.foregroundMuted, fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value === 0) return 'Functional';
                  if (value === 100) return 'Social';
                  return '';
                }}
              />

              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 100]}
                label={{
                  value: 'Aligned ↔ Divergent',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: THEME.foreground, fontSize: 14, fontWeight: 500 }
                }}
                tick={{ fill: THEME.foregroundMuted, fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value === 0) return 'Aligned';
                  if (value === 100) return 'Divergent';
                  return '';
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Render each cluster */}
              {clusters.map((cluster) => (
                <Scatter
                  key={cluster.source}
                  name={cluster.label}
                  data={cluster.points}
                  fill={cluster.color}
                  opacity={selectedCluster === null || selectedCluster === cluster.source ? 0.7 : 0.2}
                  onClick={handlePointClick}
                  cursor="pointer"
                >
                  {cluster.points.map((point, index) => {
                    const isSelected = selectedConversationIds.includes(point.id);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={cluster.color}
                        stroke={isSelected ? THEME.accent : 'none'}
                        strokeWidth={isSelected ? 3 : 0}
                      />
                    );
                  })}
                </Scatter>
              ))}

            </ScatterChart>
          </ResponsiveContainer>

          {/* Caption */}
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: THEME.cardRgba(0.5),
            border: `1px solid ${THEME.border}`,
            borderRadius: 4,
            fontSize: '13px',
            color: THEME.foreground,
            lineHeight: 1.6
          }}>
            <strong>Figure: Conversation Clustering by Source</strong>
            <br />
            Conversations are color-coded by source: <span style={{ color: SOURCE_COLORS.chatbot_arena.color, fontWeight: 600 }}>Chatbot Arena (Purple)</span> for head-to-head comparison conversations,
            <span style={{ color: SOURCE_COLORS.wildchat.color, fontWeight: 600 }}> WildChat (Green)</span> for organic usage in the wild,
            and <span style={{ color: SOURCE_COLORS.oasst.color, fontWeight: 600 }}>OASST (Amber)</span> for instruction-following conversations.
            This visualization shows how conversations from different sources cluster in relational space, revealing systematic differences
            between evaluation contexts and organic usage patterns.
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availablePatterns={availablePatterns}
            availableTones={availableTones}
            intensityRange={intensityRange}
            messageCountRange={messageCountRange}
          />

          {/* Pinned Tooltip */}
          {pinnedTooltip && (
            <div style={{
              background: THEME.card,
              border: `2px solid ${THEME.accent}`,
              borderRadius: 8,
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: THEME.foreground }}>
                  Selected Conversation
                </h3>
                <button
                  onClick={() => {
                    setPinnedTooltip(null);
                    setSelectedConversationIds(prev => prev.filter(id => id !== pinnedTooltip.id));
                  }}
                  style={{
                    padding: '4px 8px',
                    background: THEME.borderRgba(0.1),
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 4,
                    color: THEME.foreground,
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Close
                </button>
              </div>
              <div style={{ fontSize: '12px', color: THEME.foregroundMuted, lineHeight: 1.6 }}>
                <div><strong>ID:</strong> {pinnedTooltip.name}</div>
                <div><strong>Source:</strong> {SOURCE_COLORS[pinnedTooltip.source].label}</div>
                <div><strong>Pattern:</strong> {pinnedTooltip.pattern}</div>
                <div><strong>Tone:</strong> {pinnedTooltip.tone}</div>
                {pinnedTooltip.humanRole && (
                  <div><strong>Human Role:</strong> {formatRoleName(pinnedTooltip.humanRole, 'human')}</div>
                )}
                {pinnedTooltip.aiRole && (
                  <div><strong>AI Role:</strong> {formatRoleName(pinnedTooltip.aiRole, 'ai')}</div>
                )}
                <div><strong>Messages:</strong> {pinnedTooltip.messageCount}</div>
                <div><strong>Max EI:</strong> {isNaN(pinnedTooltip.maxEI) ? 'N/A' : pinnedTooltip.maxEI.toFixed(3)}</div>
                <div><strong>Position:</strong> ({isNaN(pinnedTooltip.x) ? 'N/A' : pinnedTooltip.x.toFixed(1)}, {isNaN(pinnedTooltip.y) ? 'N/A' : pinnedTooltip.y.toFixed(1)})</div>
              </div>
              <button
                onClick={() => navigate(`/terrain/${pinnedTooltip.id}`)}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '8px',
                  background: THEME.accentRgba(0.1),
                  border: `1px solid ${THEME.accent}`,
                  borderRadius: 4,
                  color: THEME.accent,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                View in Terrain →
              </button>
              <button
                onClick={() => navigate('/multi-path', { state: { selectedIds: [pinnedTooltip.id] } })}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                View in Multi-Path →
              </button>
            </div>
          )}

          {/* Selected Conversations Summary */}
          {selectedConversationIds.length > 0 && (
            <div style={{
              background: THEME.card,
              border: `1px solid ${THEME.accent}`,
              borderRadius: 8,
              padding: '12px',
              fontSize: '12px',
              color: THEME.foreground
            }}>
              <strong>{selectedConversationIds.length}</strong> conversation{selectedConversationIds.length !== 1 ? 's' : ''} selected
              <button
                onClick={() => {
                  setSelectedConversationIds([]);
                  setPinnedTooltip(null);
                }}
                style={{
                  marginLeft: 8,
                  padding: '2px 6px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 3,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear
              </button>
            </div>
          )}
          {/* Clusters List */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: THEME.foreground
            }}>
              Source Clusters
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clusters.map((cluster) => (
                <div
                  key={cluster.source}
                  onClick={() => setSelectedCluster(selectedCluster === cluster.source ? null : cluster.source)}
                  style={{
                    padding: '12px',
                    background: selectedCluster === cluster.source
                      ? THEME.accentRgba(0.1)
                      : THEME.borderRgba(0.05),
                    border: `2px solid ${selectedCluster === cluster.source ? cluster.color : THEME.border}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: cluster.color,
                      flexShrink: 0
                    }} />
                    <div style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: THEME.foreground
                    }}>
                      {cluster.label}
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      color: THEME.foregroundMuted,
                      background: THEME.borderRgba(0.1),
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      {cluster.points.length}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: THEME.foregroundMuted,
                    lineHeight: 1.5,
                    marginLeft: 24
                  }}>
                    {cluster.description}
                  </div>

                  {/* Role statistics for this cluster */}
                  {cluster.points.length > 0 && (() => {
                    const clusterHumanRoles: Record<string, number> = {};
                    const clusterAiRoles: Record<string, number> = {};

                    cluster.points.forEach(point => {
                      if (point.humanRole) {
                        clusterHumanRoles[point.humanRole] = (clusterHumanRoles[point.humanRole] || 0) + 1;
                      }
                      if (point.aiRole) {
                        clusterAiRoles[point.aiRole] = (clusterAiRoles[point.aiRole] || 0) + 1;
                      }
                    });

                    const topHumanRole = Object.entries(clusterHumanRoles).sort((a, b) => b[1] - a[1])[0];
                    const topAiRole = Object.entries(clusterAiRoles).sort((a, b) => b[1] - a[1])[0];

                    if (topHumanRole || topAiRole) {
                      return (
                        <div style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: `1px solid ${THEME.borderRgba(0.2)}`,
                          fontSize: '11px',
                          color: THEME.foregroundMuted
                        }}>
                          {topHumanRole && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontWeight: 600 }}>Human: </span>
                              {formatRoleName(topHumanRole[0], 'human')} ({topHumanRole[1]}/{cluster.points.length})
                            </div>
                          )}
                          {topAiRole && (
                            <div>
                              <span style={{ fontWeight: 600 }}>AI: </span>
                              {formatRoleName(topAiRole[0], 'ai')} ({topAiRole[1]}/{cluster.points.length})
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${THEME.border}`,
              fontSize: '12px',
              color: THEME.foregroundMuted,
              textAlign: 'center'
            }}>
              Total: {conversationPoints.length} conversations
            </div>
          </div>

          {/* Statistics */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: THEME.foreground
            }}>
              Statistics
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.foregroundMuted }}>Showing:</span>
                <span style={{ fontWeight: 500, color: THEME.foreground }}>{conversationPoints.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.foregroundMuted }}>Selected:</span>
                <span style={{ fontWeight: 500, color: THEME.accent }}>{selectedConversationIds.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.foregroundMuted }}>Clusters:</span>
                <span style={{ fontWeight: 500, color: THEME.foreground }}>{clusters.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.foregroundMuted }}>Avg Messages:</span>
                <span style={{ fontWeight: 500, color: THEME.foreground }}>
                  {conversationPoints.length > 0
                    ? Math.round(conversationPoints.reduce((sum, p) => sum + p.messageCount, 0) / conversationPoints.length)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

