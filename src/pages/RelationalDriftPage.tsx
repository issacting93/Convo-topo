import { useMemo, useState, useEffect } from 'react';
import {
  getCommunicationFunction,
  getConversationStructure,
  getDominantHumanRole,
  getDominantAiRole
} from '../utils/conversationToTerrain';
import { generate2DPathPoints } from '../utils/terrain';
import { Navigation } from '../components/Navigation';
import { useConversationStore } from '../store/useConversationStore';

interface DriftData {
  id: string;
  name: string;
  pattern: string;
  tone: string;
  color: string;
  earlyPoints: Array<{ x: number; y: number }>;
  latePoints: Array<{ x: number; y: number }>;
  allPoints: Array<{ x: number; y: number; role: 'user' | 'assistant' }>;
  earlyAvg: { x: number; y: number };
  lateAvg: { x: number; y: number };
  driftDirection: { x: number; y: number; magnitude: number };
  messageCount: number;
  humanRole: string;
  aiRole: string;
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

// Color mapping for different conversation patterns
const PATTERN_COLORS: Record<string, string> = {
  'question-answer': '#7b68ee', // Purple
  'advisory': '#4ade80', // Green
  'storytelling': '#fbbf24', // Amber
  'casual-chat': '#ec4899', // Pink
  'collaborative': '#06b6d4', // Cyan
  'default': '#94a3b8', // Slate
};

const SVG_SIZE = 800;
const SVG_PADDING = 80;

export function RelationalDriftPage() {
  const conversations = useConversationStore(state => state.conversations);

  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [showAllPaths, setShowAllPaths] = useState(false);
  const [showEarlyLateOnly, setShowEarlyLateOnly] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showAnchors, setShowAnchors] = useState(true);

  // Role filters
  const [selectedHumanRoles, setSelectedHumanRoles] = useState<string[]>([]);
  const [selectedAiRoles, setSelectedAiRoles] = useState<string[]>([]);

  // Process conversations into drift data
  const driftData = useMemo((): DriftData[] => {
    return conversations
      .filter(conv => conv.classification && conv.messages && conv.messages.length > 0)
      .map(conv => {
        const pattern = conv.classification?.interactionPattern?.category || 'unknown';
        const tone = conv.classification?.emotionalTone?.category || 'neutral';
        const color = PATTERN_COLORS[pattern] || PATTERN_COLORS.default;

        const x = getCommunicationFunction(conv);
        const y = getConversationStructure(conv);

        // Generate path points
        const preparedMessages = conv.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          communicationFunction: x,
          conversationStructure: y
        }));

        const allPoints = generate2DPathPoints(preparedMessages);

        // Split into early (first 1/3) and late (last 1/3)
        const third = Math.floor(allPoints.length / 3);
        const earlyPoints = allPoints.slice(0, third);
        const latePoints = allPoints.slice(-third);

        // Calculate average positions
        const earlyAvg = earlyPoints.length > 0
          ? {
            x: earlyPoints.reduce((sum, p) => sum + p.x, 0) / earlyPoints.length,
            y: earlyPoints.reduce((sum, p) => sum + p.y, 0) / earlyPoints.length
          }
          : { x: 0.5, y: 0.5 };

        const lateAvg = latePoints.length > 0
          ? {
            x: latePoints.reduce((sum, p) => sum + p.x, 0) / latePoints.length,
            y: latePoints.reduce((sum, p) => sum + p.y, 0) / latePoints.length
          }
          : { x: 0.5, y: 0.5 };

        // Calculate drift direction and magnitude
        const driftX = lateAvg.x - earlyAvg.x;
        const driftY = lateAvg.y - earlyAvg.y;
        const magnitude = Math.sqrt(driftX * driftX + driftY * driftY);

        const currentHumanRole = getDominantHumanRole(conv)?.role || 'unknown';
        const currentAiRole = getDominantAiRole(conv)?.role || 'unknown';

        return {
          id: conv.id,
          name: conv.id,
          pattern: pattern,
          tone: tone,
          color: color,
          earlyPoints: earlyPoints.map(p => ({ x: p.x, y: p.y })),
          latePoints: latePoints.map(p => ({ x: p.x, y: p.y })),
          allPoints: allPoints,
          earlyAvg: earlyAvg,
          lateAvg: lateAvg,
          driftDirection: { x: driftX, y: driftY, magnitude },
          messageCount: conv.messages.length,
          humanRole: currentHumanRole,
          aiRole: currentAiRole
        };
      })
      .filter(d => d.allPoints.length > 0)
      .sort((a, b) => b.driftDirection.magnitude - a.driftDirection.magnitude); // Sort by drift magnitude
  }, [conversations]);

  // Extract available roles
  const availableHumanRoles = useMemo(() => Array.from(new Set(driftData.map(d => d.humanRole))).sort(), [driftData]);
  const availableAiRoles = useMemo(() => Array.from(new Set(driftData.map(d => d.aiRole))).sort(), [driftData]);

  // Initialize filters with all roles when data loads
  useEffect(() => {
    if (driftData.length > 0 && selectedHumanRoles.length === 0) {
      setSelectedHumanRoles(availableHumanRoles);
      setSelectedAiRoles(availableAiRoles);
    }
  }, [driftData.length, availableHumanRoles.length, availableAiRoles.length]);

  // Don't auto-select any conversations by default - user should select manually

  const filteredDrifts = useMemo(() => {
    return driftData.filter(d =>
      selectedHumanRoles.includes(d.humanRole) &&
      selectedAiRoles.includes(d.aiRole)
    );
  }, [driftData, selectedHumanRoles, selectedAiRoles]);

  const selectedDrifts = useMemo(() => {
    return filteredDrifts.filter(d => selectedConversationIds.includes(d.id));
  }, [filteredDrifts, selectedConversationIds]);

  // Convert normalized coordinates (0-1) to SVG coordinates
  const toSvgX = (x: number) => SVG_PADDING + x * (SVG_SIZE - 2 * SVG_PADDING);
  const toSvgY = (y: number) => SVG_PADDING + (1 - y) * (SVG_SIZE - 2 * SVG_PADDING); // Invert Y for SVG

  // Generate path string from points
  const pointsToPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    const path = points.map((p, idx) => {
      const svgX = toSvgX(p.x);
      const svgY = toSvgY(p.y);
      return `${idx === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
    });
    return path.join(' ');
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: THEME.card,
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: THEME.foreground
          }}>
            Relational Drift Comparison
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: THEME.foregroundMuted
          }}>
            Early vs. late conversation positioning in relational space
          </p>
        </div>


        <Navigation />
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        gap: 24,
        overflow: 'auto'
      }}>
        {/* Visualization Area */}
        <div style={{
          flex: 1,
          minWidth: 600,
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 8,
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedDrifts.length > 0 && (
            <>
              {/* SVG Visualization */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  width={SVG_SIZE}
                  height={SVG_SIZE}
                  style={{ border: `1px solid ${THEME.border}`, borderRadius: 4 }}
                >
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke={THEME.borderRgba(0.1)} strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Axis labels */}
                  <text
                    x={SVG_SIZE / 2}
                    y={SVG_SIZE - 20}
                    textAnchor="middle"
                    fill={THEME.foreground}
                    fontSize="14"
                    fontWeight="500"
                  >
                    Functional ↔ Social
                  </text>
                  <text
                    x={20}
                    y={SVG_SIZE / 2}
                    textAnchor="middle"
                    fill={THEME.foreground}
                    fontSize="14"
                    fontWeight="500"
                    transform={`rotate(-90, 20, ${SVG_SIZE / 2})`}
                  >
                    Aligned ↔ Divergent
                  </text>

                  {/* Corner labels */}
                  <text x={SVG_PADDING} y={SVG_SIZE - SVG_PADDING + 20} fill={THEME.foregroundMuted} fontSize="12">Functional</text>
                  <text x={SVG_SIZE - SVG_PADDING - 60} y={SVG_SIZE - SVG_PADDING + 20} fill={THEME.foregroundMuted} fontSize="12" textAnchor="end">Social</text>
                  <text x={SVG_PADDING - 10} y={SVG_PADDING} fill={THEME.foregroundMuted} fontSize="12" textAnchor="end">Divergent</text>
                  <text x={SVG_PADDING - 10} y={SVG_SIZE - SVG_PADDING + 5} fill={THEME.foregroundMuted} fontSize="12" textAnchor="end">Aligned</text>

                  {/* Render all selected conversations */}
                  {selectedDrifts.map((drift) => {
                    const opacity = 0.6;
                    const pointSize = 3;
                    const markerSize = 6;
                    const lineWidth = 2;

                    return (
                      <g key={drift.id}>
                        {/* Full path (if enabled) */}
                        {showAllPaths && (
                          <path
                            d={pointsToPath(drift.allPoints.map(p => ({ x: p.x, y: p.y })))}
                            fill="none"
                            stroke={drift.color}
                            strokeWidth={lineWidth}
                            opacity={opacity * 0.3}
                            strokeDasharray="4 4"
                          />
                        )}

                        {/* Early points */}
                        {showPoints && drift.earlyPoints.map((point, idx) => (
                          <circle
                            key={`early-${drift.id}-${idx}`}
                            cx={toSvgX(point.x)}
                            cy={toSvgY(point.y)}
                            r={pointSize}
                            fill={drift.color}
                            opacity={opacity * 0.6}
                          />
                        ))}

                        {/* Late points */}
                        {showPoints && drift.latePoints.map((point, idx) => (
                          <circle
                            key={`late-${drift.id}-${idx}`}
                            cx={toSvgX(point.x)}
                            cy={toSvgY(point.y)}
                            r={pointSize}
                            fill={drift.color}
                            opacity={opacity * 0.9}
                          />
                        ))}

                        {/* Early average marker */}
                        {showAnchors && (
                          <circle
                            cx={toSvgX(drift.earlyAvg.x)}
                            cy={toSvgY(drift.earlyAvg.y)}
                            r={markerSize}
                            fill={drift.color}
                            stroke="#fff"
                            strokeWidth="2"
                            opacity={opacity}
                          />
                        )}
                        {/* Early average marker text (enabled) */}
                        {(
                          <text
                            x={toSvgX(drift.earlyAvg.x)}
                            y={toSvgY(drift.earlyAvg.y) - 15}
                            textAnchor="middle"
                            fill={THEME.foreground}
                            fontSize="11"
                            fontWeight="600"
                          >
                            Early
                          </text>
                        )}

                        {/* Late average marker */}
                        {showAnchors && (
                          <circle
                            cx={toSvgX(drift.lateAvg.x)}
                            cy={toSvgY(drift.lateAvg.y)}
                            r={markerSize}
                            fill={drift.color}
                            stroke="#fff"
                            strokeWidth="2"
                            opacity={opacity}
                          />
                        )}
                        {/* Late average marker text (enabled) */}
                        {(
                          <text
                            x={toSvgX(drift.lateAvg.x)}
                            y={toSvgY(drift.lateAvg.y) - 15}
                            textAnchor="middle"
                            fill={THEME.foreground}
                            fontSize="11"
                            fontWeight="600"
                          >
                            Late
                          </text>
                        )}

                        {/* Drift arrow */}
                        {showArrows && (
                          <>
                            <defs>
                              <marker
                                id={`arrowhead-${drift.id}`}
                                markerWidth="10"
                                markerHeight="10"
                                refX="9"
                                refY="3"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3, 0 6"
                                  fill={drift.color}
                                  opacity={opacity}
                                />
                              </marker>
                            </defs>
                            <line
                              x1={toSvgX(drift.earlyAvg.x)}
                              y1={toSvgY(drift.earlyAvg.y)}
                              x2={toSvgX(drift.lateAvg.x)}
                              y2={toSvgY(drift.lateAvg.y)}
                              stroke={drift.color}
                              strokeWidth={lineWidth}
                              opacity={opacity}
                              markerEnd={`url(#arrowhead-${drift.id})`}
                            />
                          </>
                        )}

                        {/* Early to late path (if showing full) */}
                        {!showEarlyLateOnly && drift.allPoints.length > 1 && (
                          <path
                            d={pointsToPath(drift.allPoints.map(p => ({ x: p.x, y: p.y })))}
                            fill="none"
                            stroke={drift.color}
                            strokeWidth={lineWidth}
                            opacity={opacity * 0.4}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Caption and Details */}
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
                <strong>Figure: Relational Drift - All Conversations ({selectedDrifts.length})</strong>
                <br />
                Comparison of early vs. late conversation positioning across {selectedDrifts.length} conversations reveals how relational dynamics shift over time. Each arrow shows the direction and magnitude of drift for one conversation.
              </div>

              {/* Drift Statistics */}
              {selectedDrifts.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  background: THEME.cardRgba(0.3),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <strong>Early Position:</strong>
                      <br />
                      X: {(selectedDrifts[0].earlyAvg.x * 100).toFixed(1)} ({(selectedDrifts[0].earlyAvg.x < 0.5 ? 'Functional' : 'Social')})
                      <br />
                      Y: {(selectedDrifts[0].earlyAvg.y * 100).toFixed(1)} ({(selectedDrifts[0].earlyAvg.y < 0.5 ? 'Aligned' : 'Divergent')})
                    </div>
                    <div>
                      <strong>Late Position:</strong>
                      <br />
                      X: {(selectedDrifts[0].lateAvg.x * 100).toFixed(1)} ({(selectedDrifts[0].lateAvg.x < 0.5 ? 'Functional' : 'Social')})
                      <br />
                      Y: {(selectedDrifts[0].lateAvg.y * 100).toFixed(1)} ({(selectedDrifts[0].lateAvg.y < 0.5 ? 'Aligned' : 'Divergent')})
                    </div>
                    <div>
                      <strong>Drift:</strong>
                      <br />
                      Magnitude: {(selectedDrifts[0].driftDirection.magnitude * 100).toFixed(1)}%
                      <br />
                      Direction: {selectedDrifts[0].driftDirection.x > 0 ? '→ Social' : '← Functional'}, {selectedDrifts[0].driftDirection.y > 0 ? '↑ Divergent' : '↓ Aligned'}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary statistics */}
              {selectedDrifts.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  background: THEME.cardRgba(0.3),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  fontSize: '12px'
                }}>
                  <strong>Summary:</strong> {selectedDrifts.length} conversations showing drift patterns.
                  Average drift magnitude: {(selectedDrifts.reduce((sum, d) => sum + d.driftDirection.magnitude, 0) / selectedDrifts.length * 100).toFixed(1)}%
                </div>
              )}
            </>
          )}
        </div>

        {/* Conversation Selector Panel */}
        <div style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* View Settings */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: THEME.foreground
            }}>
              View Settings
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '13px',
                color: THEME.foreground
              }}>
                <input
                  type="checkbox"
                  checked={showAllPaths}
                  onChange={(e) => setShowAllPaths(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Show Full Path
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '13px',
                color: THEME.foreground
              }}>
                <input
                  type="checkbox"
                  checked={showEarlyLateOnly}
                  onChange={(e) => setShowEarlyLateOnly(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Early/Late Only
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '13px',
                color: THEME.foreground
              }}>
                <input
                  type="checkbox"
                  checked={showArrows}
                  onChange={(e) => setShowArrows(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Show Drift Arrows
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '13px',
                color: THEME.foreground
              }}>
                <input
                  type="checkbox"
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Show Message Points
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '13px',
                color: THEME.foreground
              }}>
                <input
                  type="checkbox"
                  checked={showAnchors}
                  onChange={(e) => setShowAnchors(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Show Drift Anchors
              </label>
            </div>
          </div>

          {/* Role Filters */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: THEME.foreground
            }}>
              Filter by Roles
            </h2>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: 8, color: THEME.foregroundMuted }}>HUMAN ROLE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {availableHumanRoles.map(role => (
                  <label key={`h-${role}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedHumanRoles.includes(role)}
                      onChange={(e) => {
                        setSelectedHumanRoles(prev =>
                          e.target.checked ? [...prev, role] : prev.filter(r => r !== role)
                        );
                      }}
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: 8, color: THEME.foregroundMuted }}>AI ROLE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {availableAiRoles.map(role => (
                  <label key={`a-${role}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedAiRoles.includes(role)}
                      onChange={(e) => {
                        setSelectedAiRoles(prev =>
                          e.target.checked ? [...prev, role] : prev.filter(r => r !== role)
                        );
                      }}
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Selection List */}
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
              Select Conversations
            </h2>

            {/* Quick actions */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedConversationIds(filteredDrifts.map(d => d.id))}
                style={{
                  padding: '6px 12px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: 1
                }}
              >
                All
              </button>
              <button
                onClick={() => setSelectedConversationIds([])}
                style={{
                  padding: '6px 12px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: 1
                }}
              >
                Clear
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}>
              {filteredDrifts.length === 0 && (
                <div style={{ padding: 12, fontSize: '13px', color: THEME.foregroundMuted, fontStyle: 'italic' }}>
                  No conversations match filters.
                </div>
              )}
              {filteredDrifts.map((drift) => (
                <div
                  key={drift.id}
                  onClick={() => {
                    // Toggle selection
                    setSelectedConversationIds(prev =>
                      prev.includes(drift.id)
                        ? prev.filter(id => id !== drift.id)
                        : [...prev, drift.id]
                    );
                  }}
                  style={{
                    padding: '12px',
                    background: selectedConversationIds.includes(drift.id)
                      ? THEME.accentRgba(0.1)
                      : THEME.borderRgba(0.05),
                    border: `2px solid ${selectedConversationIds.includes(drift.id) ? drift.color : THEME.border}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: selectedConversationIds.includes(drift.id) ? 1 : 0.6
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: drift.color,
                      flexShrink: 0
                    }} />
                    <div style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: THEME.foreground
                    }}>
                      {drift.name}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: THEME.foregroundMuted,
                    marginLeft: 20,
                    marginBottom: 4
                  }}>
                    {drift.pattern} • {drift.tone}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: THEME.foregroundMuted,
                    marginLeft: 20
                  }}>
                    {drift.messageCount} messages • Drift: {(drift.driftDirection.magnitude * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

