import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Navigation } from '../components/Navigation';
import { useConversationStore } from '../store/useConversationStore';

interface TimelinePoint {
  messageIndex: number;
  emotionalIntensity: number;
  messageContent: string;
  role: 'user' | 'assistant';
  turn: number; // 1-indexed turn number
}

interface ConversationTimeline {
  id: string;
  name: string;
  pattern: string;
  tone: string;
  color: string;
  data: TimelinePoint[];
  maxEI: number;
  peaks: Array<{ index: number; value: number; message: string }>;
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

// Frustration threshold (peaks above this are highlighted)
const FRUSTRATION_THRESHOLD = 0.7;

export function PADTimelinePage() {
  const conversations = useConversationStore(state => state.conversations);

  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [showPeakAnnotations, setShowPeakAnnotations] = useState(true);

  // Process conversations into timeline data
  const timelines = useMemo((): ConversationTimeline[] => {
    return conversations
      .filter(conv => conv.classification && conv.messages && conv.messages.length > 0)
      .map(conv => {
        const pattern = conv.classification?.interactionPattern?.category || 'unknown';
        const tone = conv.classification?.emotionalTone?.category || 'neutral';
        const color = PATTERN_COLORS[pattern] || PATTERN_COLORS.default;

        // Extract PAD data from messages
        const timelineData: TimelinePoint[] = [];
        let turn = 1;

        conv.messages.forEach((msg, index) => {
          const ei = msg.pad?.emotionalIntensity;
          if (ei !== undefined && ei > 0) {
            timelineData.push({
              messageIndex: index,
              emotionalIntensity: ei,
              messageContent: msg.content,
              role: msg.role as 'user' | 'assistant',
              turn: turn++
            });
          }
        });

        // Find peaks (local maxima above threshold)
        const peaks: Array<{ index: number; value: number; message: string }> = [];
        timelineData.forEach((point, idx) => {
          if (point.emotionalIntensity >= FRUSTRATION_THRESHOLD) {
            // Check if it's a local maximum
            const isLocalMax =
              (idx === 0 || timelineData[idx - 1].emotionalIntensity < point.emotionalIntensity) &&
              (idx === timelineData.length - 1 || timelineData[idx + 1].emotionalIntensity < point.emotionalIntensity);

            if (isLocalMax) {
              peaks.push({
                index: point.turn,
                value: point.emotionalIntensity,
                message: point.messageContent.substring(0, 100) + (point.messageContent.length > 100 ? '...' : '')
              });
            }
          }
        });

        const maxEI = timelineData.length > 0
          ? Math.max(...timelineData.map(p => p.emotionalIntensity))
          : 0;

        return {
          id: conv.id,
          name: conv.id,
          pattern: pattern,
          tone: tone,
          color: color,
          data: timelineData,
          maxEI: maxEI,
          peaks: peaks
        };
      })
      .filter(t => t.data.length > 0)
      .sort((a, b) => b.maxEI - a.maxEI); // Sort by max intensity
  }, [conversations]);

  // Don't auto-select any conversations by default - user should select manually

  // Get selected timelines
  const selectedTimelines = useMemo(() => {
    return timelines.filter(t => selectedConversationIds.includes(t.id));
  }, [timelines, selectedConversationIds]);

  // Custom tooltip - show data for the specific point being hovered
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // With shared={false}, recharts should only pass one payload entry for the hovered line
      // The payload array contains the data for the line being hovered at the current x-coordinate
      // payload[0] should be the hovered point's data
      const p = payload[0];

      if (!p || !p.payload) {
        return null;
      }

      // Get the actual data point from the payload
      // This is the specific point on the line being hovered
      const data = p.payload as TimelinePoint;

      return (
        <div style={{
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 4,
          padding: '12px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: 300
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Turn {data.turn} ({data.role === 'user' ? 'User' : 'AI'})
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>EI:</strong> {data.emotionalIntensity.toFixed(3)}
          </div>
          {p.name && (
            <div style={{ marginBottom: 6, fontSize: '11px', color: THEME.foregroundMuted }}>
              {p.name}
            </div>
          )}
          <div style={{
            color: THEME.foregroundMuted,
            fontSize: '11px',
            lineHeight: 1.4,
            borderTop: `1px solid ${THEME.border}`,
            paddingTop: 6,
            marginTop: 6
          }}>
            {data.messageContent.substring(0, 150)}
            {data.messageContent.length > 150 ? '...' : ''}
          </div>
        </div>
      );
    }
    return null;
  };

  const toggleConversation = (id: string) => {
    setSelectedConversationIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
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
              PAD Emotional Intensity Timeline
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: THEME.foregroundMuted
            }}>
              Frustration peaks and emotional progression across conversations
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
                checked={showPeakAnnotations}
                onChange={(e) => setShowPeakAnnotations(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Show Peak Annotations
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
        overflow: 'auto'
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
          <ResponsiveContainer width="100%" height="100%" minHeight={500}>
            <LineChart
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.borderRgba(0.2)} />

              <XAxis
                dataKey="turn"
                type="number"
                label={{
                  value: 'Turn (Message Number)',
                  position: 'insideBottom',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: THEME.foreground, fontSize: 14, fontWeight: 500 }
                }}
                tick={{ fill: THEME.foregroundMuted, fontSize: 12 }}
                domain={['dataMin', 'dataMax']}
              />

              <YAxis
                label={{
                  value: 'Emotional Intensity (PAD)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: THEME.foreground, fontSize: 14, fontWeight: 500 }
                }}
                tick={{ fill: THEME.foregroundMuted, fontSize: 12 }}
                domain={[0, 1]}
              />

              {/* Frustration threshold line */}
              <ReferenceLine
                y={FRUSTRATION_THRESHOLD}
                stroke="#dc2626"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Frustration Threshold', position: 'right', fill: '#dc2626', fontSize: 12 }}
              />

              <Tooltip
                content={<CustomTooltip />}
                shared={false}
              />
              <Legend />

              {/* Render each selected timeline */}
              {selectedTimelines.map((timeline) => (
                <Line
                  key={timeline.id}
                  type="monotone"
                  dataKey="emotionalIntensity"
                  data={timeline.data}
                  name={`${timeline.name} (${timeline.pattern})`}
                  stroke={timeline.color}
                  strokeWidth={2}
                  dot={{ fill: timeline.color, r: 3 }}
                  activeDot={{ r: 6, fill: timeline.color }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}

              {/* Peak annotations */}
              {showPeakAnnotations && selectedTimelines.map((timeline) => (
                timeline.peaks.map((peak, idx) => (
                  <g key={`peak-${timeline.id}-${idx}`}>
                    {/* Vertical line at peak */}
                    <ReferenceLine
                      x={peak.index}
                      stroke={timeline.color}
                      strokeDasharray="2 2"
                      strokeOpacity={0.3}
                    />
                    {/* Peak marker */}
                    <circle
                      cx={0} // Will be positioned by ReferenceLine
                      cy={0}
                      r={4}
                      fill={timeline.color}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  </g>
                ))
              ))}
            </LineChart>
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
            <strong>Figure: Frustration Peaks and Emotional Progression</strong>
            <br />
            PAD emotional intensity progression across conversation turns. Peaks above the frustration threshold (0.7)
            indicate moments of high emotional engagement, frustration, or agitation. These peaks often precede or
            coincide with role inversions, authority shifts, and breakdowns in coordination.
          </div>

          {/* Peak Details */}
          {showPeakAnnotations && selectedTimelines.length > 0 && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: THEME.cardRgba(0.3),
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              fontSize: '12px'
            }}>
              <strong>Peak Moments:</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedTimelines.map(timeline => (
                  timeline.peaks.length > 0 && (
                    <div key={timeline.id} style={{ borderLeft: `3px solid ${timeline.color}`, paddingLeft: 8 }}>
                      <div style={{ fontWeight: 500, color: THEME.foreground }}>
                        {timeline.name} ({timeline.peaks.length} peak{timeline.peaks.length !== 1 ? 's' : ''}):
                      </div>
                      {timeline.peaks.map((peak, idx) => (
                        <div key={idx} style={{ marginLeft: 12, marginTop: 4, color: THEME.foregroundMuted }}>
                          Turn {peak.index}: EI = {peak.value.toFixed(3)} - {peak.message}
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversation Selector Panel */}
        <div style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
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

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}>
              {timelines.map((timeline) => (
                <label
                  key={timeline.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px',
                    background: selectedConversationIds.includes(timeline.id)
                      ? THEME.accentRgba(0.1)
                      : THEME.borderRgba(0.05),
                    border: `2px solid ${selectedConversationIds.includes(timeline.id) ? timeline.color : THEME.border}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConversationIds.includes(timeline.id)}
                    onChange={() => toggleConversation(timeline.id)}
                    style={{
                      width: 18,
                      height: 18,
                      cursor: 'pointer',
                      marginTop: 2,
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4
                    }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: timeline.color,
                        flexShrink: 0
                      }} />
                      <div style={{
                        fontWeight: 600,
                        fontSize: '13px',
                        color: THEME.foreground
                      }}>
                        {timeline.name}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: THEME.foregroundMuted,
                      marginLeft: 20
                    }}>
                      {timeline.pattern} • {timeline.tone}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: THEME.foregroundMuted,
                      marginLeft: 20,
                      marginTop: 2
                    }}>
                      {timeline.data.length} turns • Max EI: {timeline.maxEI.toFixed(3)} • {timeline.peaks.length} peak{timeline.peaks.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 12,
              color: THEME.foreground
            }}>
              Quick Select
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => {
                  // Select top 3 highest intensity
                  const top3 = timelines.slice(0, 3).map(t => t.id);
                  setSelectedConversationIds(top3);
                }}
                style={{
                  padding: '8px 12px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left'
                }}
              >
                Top 3 Highest Intensity
              </button>
              <button
                onClick={() => {
                  // Select conversations with peaks
                  const withPeaks = timelines.filter(t => t.peaks.length > 0).slice(0, 3).map(t => t.id);
                  setSelectedConversationIds(withPeaks);
                }}
                style={{
                  padding: '8px 12px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left'
                }}
              >
                With Frustration Peaks
              </button>
              <button
                onClick={() => setSelectedConversationIds([])}
                style={{
                  padding: '8px 12px',
                  background: THEME.borderRgba(0.1),
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left'
                }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

