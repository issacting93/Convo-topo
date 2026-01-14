import { useState, useEffect, useMemo } from 'react';
import { Grid } from 'react-window';
import type { TerrainParams } from '../utils/terrain';
import { generate2DPathPoints } from '../utils/terrain';
import { getCommunicationFunction, getConversationStructure, type ClassifiedConversation, getDominantHumanRole, getDominantAiRole, getConversationSource, mapOldRoleToNew } from '../utils/conversationToTerrain';
import { getPadChangeColorHex } from '../utils/padPathColors';
import { Navigation } from './Navigation';
import { getClassificationStats, formatConfidence, getConfidenceColor, getClassificationDimensions, formatRoleName } from '../utils/formatClassificationData';
import {
  extractEpistemicFlags,
  getEpistemicStatusColor,
  getEpistemicStatusLabel
} from '../utils/epistemicMetadata';
import {
  extractFailureFlags,
  getFailureStatusColor,
  getFailureStatusLabel
} from '../utils/failureModeMetadata';

// Theme color helpers
const getThemeColor = (varName: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

// Helper to create rgba from hex with opacity
const rgba = (hex: string, opacity: number) => {
  // Handle rgba strings by extracting the color part
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
  }
  // Handle hex colors
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Theme colors (dark mode)
const borderHex = getThemeColor('--border', '#444444');
const cardHex = getThemeColor('--card', '#1a1a1a');
const accentHex = getThemeColor('--chart-1', '#7b68ee');

const THEME = {
  foreground: getThemeColor('--foreground', '##151515'),
  foregroundMuted: getThemeColor('--muted-foreground', '#b5b5b5'),
  accent: accentHex,
  accent2: getThemeColor('--chart-2', '#4ade80'),
  accent3: getThemeColor('--chart-3', '#fbbf24'),
  accent5: getThemeColor('--chart-5', '#f97316'),
  border: borderHex,
  card: cardHex,
  // RGBA variants
  borderRgba: (opacity: number) => rgba(borderHex, opacity),
  cardRgba: (opacity: number) => rgba(cardHex, opacity),
  accentRgba: (opacity: number) => rgba(accentHex, opacity),
};

interface TerrainPreview {
  id: number;
  name: string;
  seed: number;
  description: string;
  heightParams?: Partial<TerrainParams>; // Terrain height parameters from classification
  xyz?: { x: number; y: number; z: number }; // XYZ coordinates snapshot
  pathPoints2D?: Array<{ x: number; y: number; role: 'user' | 'assistant' }>; // Pre-computed 2D path points
}

interface TerrainPreviewCardProps {
  terrain: TerrainPreview;
  conversation?: ClassifiedConversation;
  onSelect: (terrain: TerrainPreview) => void;
}

function TerrainPreviewCard({ terrain, conversation, onSelect }: TerrainPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect prefers-reduced-motion for hover scale
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Use pre-computed path points from terrain data (huge performance win!)
  const minimapPoints = useMemo(() => {
    // If path points are pre-computed, use them directly
    if (terrain.pathPoints2D && terrain.pathPoints2D.length > 0) {
      return terrain.pathPoints2D;
    }

    // Fallback: generate path points if not pre-computed (legacy support)
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return [];
    }

    const commFunc = getCommunicationFunction(conversation);
    const convStruct = getConversationStructure(conversation);

    const preparedMessages = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      communicationFunction: commFunc,
      conversationStructure: convStruct
    }));

    return generate2DPathPoints(preparedMessages);
  }, [terrain.pathPoints2D, conversation]);

  // Get classification stats for confidence badge
  const classificationStats = useMemo(() =>
    getClassificationStats(conversation ?? null),
    [conversation]
  );

  // Extract epistemic flags for badge display
  const epistemicFlags = useMemo(() =>
    conversation ? extractEpistemicFlags(conversation) : null,
    [conversation]
  );

  // Extract failure mode flags for badge display
  const failureFlags = useMemo(() =>
    conversation ? extractFailureFlags(conversation) : null,
    [conversation]
  );

  // Get dominant roles
  const dominantHumanRole = useMemo(() =>
    conversation ? getDominantHumanRole(conversation) : null,
    [conversation]
  );
  const dominantAiRole = useMemo(() =>
    conversation ? getDominantAiRole(conversation) : null,
    [conversation]
  );

  // Get classification dimensions for card display
  const classificationDimensions = useMemo(() =>
    getClassificationDimensions(conversation ?? null).slice(0, 3), // Top 3 dimensions
    [conversation]
  );

  // Calculate average PAD values
  const padSummary = useMemo(() => {
    if (!conversation?.messages || conversation.messages.length === 0) return null;

    const messagesWithPad = conversation.messages.filter(msg => msg.pad);
    if (messagesWithPad.length === 0) return null;

    const totals = messagesWithPad.reduce((acc, msg) => {
      if (!msg.pad) return acc;
      return {
        pleasure: acc.pleasure + msg.pad.pleasure,
        arousal: acc.arousal + msg.pad.arousal,
        emotionalIntensity: acc.emotionalIntensity + msg.pad.emotionalIntensity,
        count: acc.count + 1
      };
    }, { pleasure: 0, arousal: 0, emotionalIntensity: 0, count: 0 });

    if (totals.count === 0) return null;

    return {
      avgPleasure: totals.pleasure / totals.count,
      avgArousal: totals.arousal / totals.count,
      avgIntensity: totals.emotionalIntensity / totals.count
    };
  }, [conversation]);

  // Get message count
  const messageCount = conversation?.messages?.length ?? 0;

  return (
    <div
      style={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: isHovered ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        transition: reduceMotion ? undefined : 'all 0.3s ease',
        transform: isHovered && !reduceMotion ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 8px 32px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
        pointerEvents: 'auto'
      }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(terrain)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(terrain);
        }
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{
            letterSpacing: '1px',
            fontSize: '12px',
            color: '#1a1a1a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            ◉ {terrain.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Failure Mode Badge - Show if breakdown detected (higher priority) */}
            {failureFlags && failureFlags.hasBreakdown && (
              <span style={{
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: 3,
                backgroundColor: getFailureStatusColor(failureFlags) + '40',
                border: `1px solid ${getFailureStatusColor(failureFlags)}`,
                color: getFailureStatusColor(failureFlags),
                letterSpacing: 0.5,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                marginRight: 4
              }} title={getFailureStatusLabel(failureFlags) || 'Breakdown detected'}>
                🔴 {getFailureStatusLabel(failureFlags)?.substring(0, 15) || 'BREAKDOWN'}
              </span>
            )}
            {/* Epistemic Status Badge - Show if flags detected (but not if breakdown) */}
            {epistemicFlags && (epistemicFlags.hasHallucination || epistemicFlags.hasError || epistemicFlags.isContestedKnowledge) && !failureFlags?.hasBreakdown && (
              <span style={{
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: 3,
                backgroundColor: getEpistemicStatusColor(epistemicFlags) + '40',
                border: `1px solid ${getEpistemicStatusColor(epistemicFlags)}`,
                color: getEpistemicStatusColor(epistemicFlags),
                letterSpacing: 0.5,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                marginRight: 4
              }} title={epistemicFlags.hasSuccessfulRepair ? 'Trust repaired' : undefined}>
                ⚠ {getEpistemicStatusLabel(epistemicFlags)?.substring(0, 12)}
              </span>
            )}
            {/* Confidence Badge */}
            {classificationStats.totalDimensions > 0 && classificationStats.averageConfidence > 0 && (
              <span style={{
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: 3,
                backgroundColor: `${getConfidenceColor(classificationStats.averageConfidence)}33`,
                border: `1px solid ${getConfidenceColor(classificationStats.averageConfidence)}`,
                color: getConfidenceColor(classificationStats.averageConfidence),
                letterSpacing: 0.5,
                fontWeight: classificationStats.averageConfidence >= 0.7 ? 'bold' : 'normal',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap'
              }}>
                {formatConfidence(classificationStats.averageConfidence).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <span style={{
          fontSize: '12px',
          opacity: 0.5,
          color: '#ffffff',
          flexShrink: 0
        }}>
          {terrain.seed}
        </span>
      </div>

      {/* Minimap Preview */}
      <div style={{
        width: '100%',
        height: 280,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: '#f8f8f8',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {terrain.xyz ? (
          <svg
            width="100%"
            height="100%"
            style={{ display: 'block' }}
            viewBox="0 0 256 256"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            <line x1="0" y1="0" x2="256" y2="0" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="128" x2="256" y2="128" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="256" x2="256" y2="256" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="256" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" />
            <line x1="128" y1="0" x2="128" y2="256" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="256" y1="0" x2="256" y2="256" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" />

            {/* Center crosshair */}
            <circle cx="128" cy="128" r="2" fill="none" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="0.5" />
            <line x1="126" y1="128" x2="130" y2="128" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="0.5" />
            <line x1="128" y1="126" x2="128" y2="130" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="0.5" />

            {/* Path line with gradient colors based on PAD incline/decline */}
            {minimapPoints.length > 1 && (
              <>
                {minimapPoints.map((p: { x: number; y: number; role: 'user' | 'assistant' }, idx: number) => {
                  if (idx === 0) return null; // Skip first point (no previous point to compare)

                  const prevPoint = minimapPoints[idx - 1];
                  const x1 = 20 + prevPoint.x * (256 - 40);
                  const y1 = 20 + prevPoint.y * (256 - 40);
                  const x2 = 20 + p.x * (256 - 40);
                  const y2 = 20 + p.y * (256 - 40);

                  // Get PAD data from conversation messages (match by index)
                  let padChange = 0;
                  if (conversation && conversation.messages && conversation.messages.length > idx) {
                    const prevMsg = conversation.messages[idx - 1];
                    const currMsg = conversation.messages[idx];

                    // Calculate PAD change if both messages have PAD data
                    if (prevMsg?.pad?.emotionalIntensity !== undefined && currMsg?.pad?.emotionalIntensity !== undefined) {
                      padChange = (currMsg.pad.emotionalIntensity - prevMsg.pad.emotionalIntensity) * 2;
                      padChange = Math.max(-1, Math.min(1, padChange));
                    }
                  }

                  const color = getPadChangeColorHex(padChange);

                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  );
                })}
              </>
            )}

            {/* Path points */}
            {minimapPoints.map((point: { x: number; y: number; role: 'user' | 'assistant' }, idx: number) => {
              const x = 20 + point.x * (256 - 40);
              const y = 20 + point.y * (256 - 40); // Aligned (0) at top, Divergent (1) at bottom
              const isLast = idx === minimapPoints.length - 1;
              const color = point.role === 'user' ? '#7b68ee' : '#f97316'; // User: purple-blue, Assistant: orange

              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={isLast ? 5 : 3}
                  fill={color}
                  opacity={isLast ? 1 : 0.8}
                  stroke={isLast ? '#ffffff' : 'none'}
                  strokeWidth={isLast ? 1 : 0}
                />
              );
            })}

            {/* Axis labels */}
            <text x="5" y="15" fontSize="6" fill="rgba(0, 0, 0, 0.5)" fontFamily="monospace">
              FUNC
            </text>
            <text x="230" y="15" fontSize="6" fill="rgba(0, 0, 0, 0.5)" fontFamily="monospace">
              SOC
            </text>
            <text x="5" y="138" fontSize="6" fill="rgba(0, 0, 0, 0.5)" fontFamily="monospace">
              ALIGNED
            </text>
            <text x="5" y="251" fontSize="6" fill="rgba(0, 0, 0, 0.5)" fontFamily="monospace">
              DIVERGENT
            </text>
          </svg>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '12px'
          }}>
            No minimap data
          </div>
        )}

      </div>

      {/* Description */}
      <div style={{
        padding: '8px 12px',
        color: '#1a1a1a',
        fontSize: '12px',
        lineHeight: 1.4,
        opacity: 0.6,
        flexShrink: 0
      }}>
        {terrain.description}
      </div>

      {/* Additional Info Section */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0
      }}>
        {/* Message Count */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          opacity: 0.7
        }}>
          <span style={{ color: '#1a1a1a' }}>Messages:</span>
          <span style={{ color: '#1a1a1a', fontWeight: 'bold', fontFamily: 'monospace' }}>{messageCount}</span>
        </div>

        {/* Dominant Roles */}
        {(dominantHumanRole || dominantAiRole) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            opacity: 0.7,
            gap: 8
          }}>
            {dominantHumanRole && (
              <span style={{ color: '#1a1a1a', flex: 1 }}>
                <span style={{ opacity: 0.6 }}>Human: </span>
                <span style={{ fontWeight: 'bold' }}>{formatRoleName(dominantHumanRole.role, 'human')}</span>
                <span style={{ opacity: 0.5, marginLeft: 4 }}>({Math.round(dominantHumanRole.value * 100)}%)</span>
              </span>
            )}
            {dominantAiRole && (
              <span style={{ color: '#1a1a1a', flex: 1, textAlign: 'right' }}>
                <span style={{ opacity: 0.6 }}>AI: </span>
                <span style={{ fontWeight: 'bold' }}>{formatRoleName(dominantAiRole.role, 'ai')}</span>
                <span style={{ opacity: 0.5, marginLeft: 4 }}>({Math.round(dominantAiRole.value * 100)}%)</span>
              </span>
            )}
          </div>
        )}

        {/* PAD Summary */}
        {padSummary && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            fontSize: '12px',
            opacity: 0.7,
            padding: '4px 6px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 3
          }}>
            <div style={{ color: '#1a1a1a', fontWeight: 'bold', marginBottom: 2 }}>PAD Avg:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#1a1a1a' }}>
                <span style={{ opacity: 0.6 }}>P:</span>
                <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{Math.round(padSummary.avgPleasure * 100)}%</span>
              </span>
              <span style={{ color: '#1a1a1a' }}>
                <span style={{ opacity: 0.6 }}>A:</span>
                <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{Math.round(padSummary.avgArousal * 100)}%</span>
              </span>
              <span style={{ color: '#1a1a1a' }}>
                <span style={{ opacity: 0.6 }}>D:</span>
                <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{Math.round(padSummary.avgIntensity * 100)}%</span>
              </span>
            </div>
          </div>
        )}

        {/* Top Classification Dimensions */}
        {classificationDimensions.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            fontSize: '12px',
            opacity: 0.6
          }}>
            {classificationDimensions.map((dim, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#1a1a1a'
              }}>
                <span style={{ opacity: 0.7 }}>{dim.label.split(' ')[0]}:</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {dim.formattedCategory.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XYZ Coordinates Snapshot */}
      {terrain.xyz && (
        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          fontSize: '12px',
          color: '#1a1a1a',
          opacity: 0.7,
          fontFamily: 'monospace',
          flexShrink: 0
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ opacity: 0.5 }}>X:</span>
            <span style={{ fontWeight: 'bold' }}>{terrain.xyz.x.toFixed(2)}</span>
            <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: 2 }}>
              {terrain.xyz.x < 0.4 ? 'FUNC' : terrain.xyz.x > 0.6 ? 'SOC' : 'MID'}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ opacity: 0.5 }}>Y:</span>
            <span style={{ fontWeight: 'bold' }}>{terrain.xyz.y.toFixed(2)}</span>
            <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: 2 }}>
              {terrain.xyz.y < 0.4 ? 'ALIGNED' : terrain.xyz.y > 0.6 ? 'DIVERGENT' : 'MID'}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ opacity: 0.5 }}>Z:</span>
            <span style={{ fontWeight: 'bold' }}>{terrain.xyz.z.toFixed(2)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

interface TerrainGridViewProps {
  terrains: TerrainPreview[];
  conversations: ClassifiedConversation[];
  onSelectTerrain: (terrain: TerrainPreview) => void;
}

export function TerrainGridView({ terrains, conversations, onSelectTerrain }: TerrainGridViewProps) {
  // Calculate grid dimensions
  // Card height breakdown (with 12px font sizes):
  // - Header: ~50px (larger font = more padding needed)
  // - Square minimap: 280px (matches card width)
  // - Description: ~60px (multi-line with 12px font)
  // - Additional Info (message count, roles, PAD, dimensions): ~150px (all with 12px font)
  // - XYZ coordinates (if present): ~35px (with 12px font)
  // Total: ~575px (using 600px to be safe)
  const CARD_WIDTH = 280;
  const CARD_HEIGHT = 600; // Fixed height for react-window (increased from 510px for larger fonts)
  const GAP = 24;
  const COLUMN_WIDTH = CARD_WIDTH + GAP;
  const ROW_HEIGHT = CARD_HEIGHT + GAP;
  const PAGINATION_HEIGHT = 60;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1400,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedHumanRole, setSelectedHumanRole] = useState<string>('all');
  const [selectedAiRole, setSelectedAiRole] = useState<string>('all');
  const [selectedMessageCount, setSelectedMessageCount] = useState<string>('all');
  const [selectedEpistemic, setSelectedEpistemic] = useState<string>('all');
  const [selectedFailure, setSelectedFailure] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all'); // 'all' | 'old' | 'new'

  // Theme state (always light mode for terrain grid)
  const [isDarkMode] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
  const ITEMS_PER_PAGE = 30; // Fixed: 30 cards per page

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate number of columns based on window width
  const HEADER_HEIGHT = 110; // Increased to accommodate filters
  const columnCount = Math.max(1, Math.floor((windowSize.width - 48) / COLUMN_WIDTH));

  // Calculate actual content width and center it
  const contentWidth = columnCount * COLUMN_WIDTH;
  const horizontalPadding = Math.max(24, (windowSize.width - contentWidth) / 2);

  // Filter terrains by role, message count, and flags
  const filteredData = useMemo(() => {
    return terrains.map((terrain, idx) => ({ terrain, conversation: conversations[idx] }))
      .filter(({ conversation }) => {
        if (!conversation) return false;

        // Filter by human role (handle both old and new taxonomy)
        if (selectedHumanRole !== 'all') {
          const dominantHumanRole = getDominantHumanRole(conversation);
          if (!dominantHumanRole) {
            return false;
          }
          // Map old role names to new taxonomy for comparison
          const mappedRole = mapOldRoleToNew(dominantHumanRole.role, 'human');
          const mappedSelected = mapOldRoleToNew(selectedHumanRole, 'human');
          // Check both original and mapped names for backward compatibility
          if (dominantHumanRole.role !== selectedHumanRole && mappedRole !== mappedSelected && mappedRole !== selectedHumanRole) {
            return false;
          }
        }

        // Filter by AI role (handle both old and new taxonomy)
        if (selectedAiRole !== 'all') {
          const dominantAiRole = getDominantAiRole(conversation);
          if (!dominantAiRole) {
            return false;
          }
          // Map old role names to new taxonomy for comparison
          const mappedRole = mapOldRoleToNew(dominantAiRole.role, 'ai');
          const mappedSelected = mapOldRoleToNew(selectedAiRole, 'ai');
          // Check both original and mapped names for backward compatibility
          if (dominantAiRole.role !== selectedAiRole && mappedRole !== mappedSelected && mappedRole !== selectedAiRole) {
            return false;
          }
        }

        // Filter by message count
        if (selectedMessageCount !== 'all') {
          const messageCount = conversation.messages?.length ?? 0;
          if (selectedMessageCount === 'short' && messageCount >= 10) return false;
          if (selectedMessageCount === 'medium' && (messageCount < 10 || messageCount > 20)) return false;
          if (selectedMessageCount === 'long' && messageCount <= 20) return false;
        }

        // Filter by epistemic flags
        if (selectedEpistemic !== 'all') {
          const epistemicFlags = extractEpistemicFlags(conversation);
          if (selectedEpistemic === 'has-hallucination' && !epistemicFlags.hasHallucination) return false;
          if (selectedEpistemic === 'has-error' && !epistemicFlags.hasError) return false;
          if (selectedEpistemic === 'has-repair' && !epistemicFlags.hasSuccessfulRepair) return false;
          if (selectedEpistemic === 'none' && (epistemicFlags.hasHallucination || epistemicFlags.hasError)) return false;
        }

        // Filter by failure flags
        if (selectedFailure !== 'all') {
          const failureFlags = extractFailureFlags(conversation);
          if (selectedFailure === 'has-breakdown' && !failureFlags.hasBreakdown) return false;
          if (selectedFailure === 'has-repair' && !failureFlags.hasSuccessfulRepair) return false;
          if (selectedFailure === 'none' && failureFlags.hasBreakdown) return false;
        }

        // Filter by source (old vs new)
        if (selectedSource !== 'all') {
          const source = getConversationSource(conversation);
          if (source !== selectedSource) return false;
        }

        return true;
      });
  }, [terrains, conversations, selectedHumanRole, selectedAiRole, selectedMessageCount, selectedEpistemic, selectedFailure, selectedSource]);

  const filteredTerrains = filteredData.map(({ terrain }) => terrain);
  const filteredConversations = filteredData.map(({ conversation }) => conversation);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedHumanRole, selectedAiRole, selectedMessageCount, selectedEpistemic, selectedFailure, selectedSource]);

  // Use fixed items per page (30)
  const itemsPerPage = ITEMS_PER_PAGE;

  // Paginate filtered terrains
  const totalPages = Math.ceil(filteredTerrains.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTerrains.length);
  const paginatedTerrains = filteredTerrains.slice(startIndex, endIndex);
  const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

  // Adjust row count for paginated data
  const rowCount = Math.ceil(paginatedTerrains.length / columnCount);

  // Reset to page 0 if current page is out of bounds
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  // Cell renderer for virtualized grid
  const CellComponent = ({
    columnIndex,
    rowIndex,
    style,
    ariaAttributes
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    ariaAttributes?: { 'aria-colindex': number; role: 'gridcell' };
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= paginatedTerrains.length) {
      return <div style={style} {...ariaAttributes} />;
    }

    const terrain = paginatedTerrains[index];
    const conversation = paginatedConversations[index];

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: GAP / 2,
          boxSizing: 'border-box'
        }}
        {...ariaAttributes}
      >
        <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          <TerrainPreviewCard
            terrain={terrain}
            conversation={conversation}
            onSelect={onSelectTerrain}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace'
    }}>
      <style>{`
        /* Hide scrollbars */
        * {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        *::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        minHeight: HEADER_HEIGHT
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                letterSpacing: '3px',
                marginBottom: 8,
                color: '#1a1a1a'
              }}>
                CONVERSATIONAL TOPOGRAPHY
              </div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '1px',
                color: '#666666',
                marginBottom: 8
              }}>
                {filteredTerrains.length > 0
                  ? `SELECT A CLASSIFIED CONVERSATION (${filteredTerrains.length} of ${terrains.length}${selectedHumanRole !== 'all' || selectedAiRole !== 'all' || selectedMessageCount !== 'all' || selectedEpistemic !== 'all' || selectedFailure !== 'all' || selectedSource !== 'all' ? ' filtered' : ''}${totalPages > 1 ? `, page ${currentPage + 1}/${totalPages}` : ''}) • Virtualized Grid`
                  : terrains.length > 0
                    ? 'NO CONVERSATIONS MATCH FILTERS'
                    : 'LOADING CLASSIFIED CONVERSATIONS...'}
              </div>
              {/* Role Filters */}
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    Human Role:
                  </label>
                  <select
                    value={selectedHumanRole}
                    onChange={(e) => setSelectedHumanRole(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 120
                    }}
                  >
                    <option value="all">All</option>
                    <option value="information-seeker">Information-Seeker</option>
                    <option value="provider">Provider</option>
                    <option value="director">Director</option>
                    <option value="collaborator">Collaborator</option>
                    <option value="social-expressor">Social-Expressor</option>
                    <option value="relational-peer">Relational-Peer</option>
                    {/* Backward compatibility */}
                    <option value="challenger">Challenger (Old)</option>
                    <option value="seeker">Seeker (Old)</option>
                    <option value="sharer">Sharer (Old)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    AI Role:
                  </label>
                  <select
                    value={selectedAiRole}
                    onChange={(e) => setSelectedAiRole(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 120
                    }}
                  >
                    <option value="all">All</option>
                    <option value="expert-system">Expert-System</option>
                    <option value="learning-facilitator">Learning-Facilitator</option>
                    <option value="advisor">Advisor</option>
                    <option value="co-constructor">Co-Constructor</option>
                    <option value="social-facilitator">Social-Facilitator</option>
                    <option value="relational-peer">Relational-Peer</option>
                    {/* Backward compatibility */}
                    <option value="expert">Expert (Old)</option>
                    <option value="facilitator">Facilitator (Old)</option>
                    <option value="reflector">Reflector (Old)</option>
                    <option value="peer">Peer (Old)</option>
                  </select>
                </div>
                {/* Message Count Filter */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    Messages:
                  </label>
                  <select
                    value={selectedMessageCount}
                    onChange={(e) => setSelectedMessageCount(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 100
                    }}
                  >
                    <option value="all">All</option>
                    <option value="short">Short (&lt;10)</option>
                    <option value="medium">Medium (10-20)</option>
                    <option value="long">Long (&gt;20)</option>
                  </select>
                </div>

                {/* Epistemic Filter */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    Epistemic:
                  </label>
                  <select
                    value={selectedEpistemic}
                    onChange={(e) => setSelectedEpistemic(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 140
                    }}
                  >
                    <option value="all">All</option>
                    <option value="has-hallucination">Has Hallucination</option>
                    <option value="has-error">Has Error</option>
                    <option value="has-repair">Has Repair</option>
                    <option value="none">No Issues</option>
                  </select>
                </div>

                {/* Failure Filter */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    Failure:
                  </label>
                  <select
                    value={selectedFailure}
                    onChange={(e) => setSelectedFailure(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 120
                    }}
                  >
                    <option value="all">All</option>
                    <option value="has-breakdown">Has Breakdown</option>
                    <option value="has-repair">Has Repair</option>
                    <option value="none">No Breakdown</option>
                  </select>
                </div>
                {/* Source Filter */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label style={{
                    fontSize: '11px',
                    color: THEME.foreground,
                    opacity: 0.7,
                    fontWeight: 600
                  }}>
                    Source:
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    style={{
                      background: THEME.cardRgba(0.5),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: 120
                    }}
                  >
                    <option value="all">All</option>
                    <option value="old">Old (Arena + OASST)</option>
                    <option value="new">New (WildChat)</option>
                  </select>
                </div>

                {(selectedHumanRole !== 'all' || selectedAiRole !== 'all' || selectedMessageCount !== 'all' || selectedEpistemic !== 'all' || selectedFailure !== 'all' || selectedSource !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedHumanRole('all');
                      setSelectedAiRole('all');
                      setSelectedMessageCount('all');
                      setSelectedEpistemic('all');
                      setSelectedFailure('all');
                      setSelectedSource('all');
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '10px',
                      background: THEME.cardRgba(0.3),
                      border: `1px solid ${THEME.borderRgba(0.3)}`,
                      borderRadius: 4,
                      color: THEME.foreground,
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                      fontFamily: 'inherit',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <Navigation />
        </div>
      </div>

      {/* Virtualized Grid Container */}
      <div style={{
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: horizontalPadding,
        right: horizontalPadding,
        bottom: PAGINATION_HEIGHT,
        display: 'flex',
        justifyContent: 'center'
      }}>
        {terrains.length > 0 && columnCount > 0 && rowCount > 0 ? (
          <Grid
            cellComponent={CellComponent}
            cellProps={{} as any}
            columnCount={columnCount}
            columnWidth={COLUMN_WIDTH}
            defaultHeight={windowSize.height - HEADER_HEIGHT - PAGINATION_HEIGHT}
            defaultWidth={contentWidth}
            rowCount={rowCount}
            rowHeight={ROW_HEIGHT}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(0, 0, 0, 0.3)',
            fontSize: '12px'
          }}>
            {terrains.length === 0 ? 'Loading conversations...' : 'No conversations available'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {terrains.length > ITEMS_PER_PAGE && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: PAGINATION_HEIGHT,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 24px',
          zIndex: 10
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            style={{
              padding: '8px 16px',
              background: currentPage === 0
                ? 'rgba(200, 212, 50, 0.1)'
                : 'rgba(200, 212, 50, 0.2)',
              border: '1px solid rgba(200, 212, 50, 0.3)',
              color: currentPage === 0
                ? 'rgba(200, 212, 50, 0.3)'
                : '#c8d432',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontSize: '10px',
              letterSpacing: '1px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              opacity: currentPage === 0 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage > 0) {
                e.currentTarget.style.background = 'rgba(200, 212, 50, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentPage === 0
                ? 'rgba(200, 212, 50, 0.1)'
                : 'rgba(200, 212, 50, 0.2)';
            }}
          >
            ◀ PREV
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#1a1a1a',
            fontSize: '10px',
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}>
            <span style={{ opacity: 0.6 }}>PAGE</span>
            <span style={{
              fontWeight: 'bold',
              padding: '4px 12px',
              background: 'rgba(200, 212, 50, 0.1)',
              border: '1px solid rgba(200, 212, 50, 0.3)',
              borderRadius: 2
            }}>
              {currentPage + 1}
            </span>
            <span style={{ opacity: 0.6 }}>OF</span>
            <span style={{ fontWeight: 'bold' }}>{totalPages}</span>
            <span style={{
              opacity: 0.5,
              marginLeft: 8,
              fontSize: '9px'
            }}>
              ({startIndex + 1}-{endIndex} of {terrains.length})
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            style={{
              padding: '8px 16px',
              background: currentPage >= totalPages - 1
                ? 'rgba(200, 212, 50, 0.1)'
                : 'rgba(200, 212, 50, 0.2)',
              border: '1px solid rgba(200, 212, 50, 0.3)',
              color: currentPage >= totalPages - 1
                ? 'rgba(200, 212, 50, 0.3)'
                : '#c8d432',
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '10px',
              letterSpacing: '1px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              opacity: currentPage >= totalPages - 1 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage < totalPages - 1) {
                e.currentTarget.style.background = 'rgba(200, 212, 50, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentPage >= totalPages - 1
                ? 'rgba(200, 212, 50, 0.1)'
                : 'rgba(200, 212, 50, 0.2)';
            }}
          >
            NEXT ▶
          </button>
        </div>
      )}

      {/* Corner markers */}
      {[[24, 24, 'tl'], [null, 24, 'tr'], [24, null, 'bl'], [null, null, 'br']].map(([left, top, pos]) => (
        <svg
          key={pos}
          style={{
            position: 'fixed',
            top: top ?? 'auto',
            bottom: top === null ? 24 : 'auto',
            left: left ?? 'auto',
            right: left === null ? 24 : 'auto',
            width: 32,
            height: 32,
            zIndex: 5
          }}
        >
          <circle cx="16" cy="16" r="4" fill="none" stroke={THEME.foreground} strokeWidth="1" opacity="0.6" />
          <line x1="16" y1="0" x2="16" y2="10" stroke={THEME.foreground} strokeWidth="1" opacity="0.4" />
          <line x1="16" y1="22" x2="16" y2="32" stroke={THEME.foreground} strokeWidth="1" opacity="0.4" />
          <line x1="0" y1="16" x2="10" y2="16" stroke={THEME.foreground} strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="16" x2="32" y2="16" stroke={THEME.foreground} strokeWidth="1" opacity="0.4" />
        </svg>
      ))}
    </div>
  );
}