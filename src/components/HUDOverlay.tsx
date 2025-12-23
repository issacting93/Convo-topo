import React from 'react';
import type { PathPoint } from '../utils/terrain';
import { getColorForRole } from '../utils/constants';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
import { calculatePadChange, getPadChangeColorHex } from '../utils/padPathColors';
import { getDominantHumanRole, getDominantAiRole } from '../utils/conversationToTerrain';
import {
  formatCategoryName,
  formatConfidence,
  getConfidenceColor,
  getClassificationDimensions,
  getRoleDistributions,
  formatClassificationMetadata,
  getClassificationStats
} from '../utils/formatClassificationData';
import {
  extractEpistemicFlags,
  getEpistemicStatusColor,
  getEpistemicStatusLabel,
  getEpistemicStatusDescription
} from '../utils/epistemicMetadata';
import { ControlsContent } from './ControlsContent';
import {
  extractFailureFlags,
  getFailureStatusColor,
  getFailureStatusLabel,
  getFailureStatusDescription,
  isRoleBreakdown
} from '../utils/failureModeMetadata';

// Theme color helpers
const getThemeColor = (varName: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

// Helper to create rgba from hex with opacity
const rgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Theme colors (light mode)
const accentHex = getThemeColor('--chart-1', '#7b68ee');
const accent5Hex = getThemeColor('--chart-5', '#f97316');
const foregroundHex = getThemeColor('--foreground', '#ffffff');
const borderHex = getThemeColor('--border', 'rgba(255, 255, 255, 0.1)');
const cardHex = getThemeColor('--card', '#1a1a1a');

const THEME = {
  foreground: foregroundHex,
  foregroundMuted: getThemeColor('--muted-foreground', '#888888'),
  primary: getThemeColor('--primary', '#030213'),
  accent: accentHex,
  accent2: getThemeColor('--chart-2', '#4ade80'),
  accent3: getThemeColor('--chart-3', '#fbbf24'),
  accent4: getThemeColor('--chart-4', '#ec4899'),
  accent5: accent5Hex,
  border: borderHex,
  card: cardHex,
  destructive: getThemeColor('--destructive', '#dc2626'),
  // RGBA variants
  accentRgba: (opacity: number) => rgba(accentHex, opacity),
  accent5Rgba: (opacity: number) => rgba(accent5Hex, opacity),
  foregroundRgba: (opacity: number) => rgba(foregroundHex, opacity),
  borderRgba: (opacity: number) => rgba(borderHex, opacity),
  cardRgba: (opacity: number) => rgba(cardHex, opacity),
  accent3Rgba: (opacity: number) => {
    const accent3Hex = getThemeColor('--chart-3', '#fbbf24');
    return rgba(accent3Hex, opacity);
  },
};

// UI Configuration constants
const UI_CONFIG = {
  MINIMAP_SIZE_COLLAPSED: 280,
  MINIMAP_SIZE_EXPANDED: 600, // also used for expanded panel width
  MINIMAP_HEIGHT_EXPANDED: 600,
  MINIMAP_HEADER_HEIGHT: 30,
  MINIMAP_PADDING: 30,
  PANEL_OFFSET: 20,
  PANEL_WIDTH: 280,
  MESSAGE_PANEL_TOP: 20,
} as const;

interface HUDOverlayProps {
  pathPoints: PathPoint[];
  comparisonPathPoints: PathPoint[];
  hoveredPoint: number | null;
  lockedPoint: number | null;
  timelineProgress: number;
  onTimelineChange: (progress: number) => void;
  onBackToGrid: () => void;
  terrainName?: string;
  selectedConversation: ClassifiedConversation | null;
  comparisonConversation?: ClassifiedConversation | null;
  cameraView?: 'default' | 'side' | 'top';
  onCameraViewChange?: (view: 'default' | 'side' | 'top') => void;
  onAnimate?: () => void;
  onPointClick?: (idx: number) => void;
  // Settings props
  contourCount?: number;
  showContours?: boolean;
  terrainPosition?: { x: number; y: number; z: number };
  cameraDistance?: number;
  cameraElevation?: number;
  cameraRotation?: number;
  contourColors?: { minor: string; major: string; index: string };
  markerColors?: { user: string; userGlow: string; assistant: string; assistantGlow: string };
  onContourCountChange?: (count: number) => void;
  onToggleContours?: (show: boolean) => void;
  onTerrainPositionChange?: (pos: { x: number; y: number; z: number }) => void;
  onCameraDistanceChange?: (distance: number) => void;
  onCameraElevationChange?: (elevation: number) => void;
  onCameraRotationChange?: (rotation: number) => void;
  onContourColorsChange?: (colors: { minor: string; major: string; index: string }) => void;
  onMarkerColorsChange?: (colors: { user: string; userGlow: string; assistant: string; assistantGlow: string }) => void;
}

export function HUDOverlay({
  pathPoints,
  comparisonPathPoints: _comparisonPathPoints,
  hoveredPoint,
  lockedPoint,
  timelineProgress,
  onTimelineChange,
  onBackToGrid,
  terrainName,
  selectedConversation,
  comparisonConversation: _comparisonConversation,
  cameraView = 'default',
  onCameraViewChange,
  onAnimate,
  onPointClick,
  // Settings props
  contourCount,
  showContours,
  terrainPosition,
  cameraDistance,
  cameraElevation,
  cameraRotation,
  contourColors,
  markerColors,
  onContourCountChange,
  onToggleContours,
  onTerrainPositionChange,
  onCameraDistanceChange,
  onCameraElevationChange,
  onCameraRotationChange,
  onContourColorsChange,
  onMarkerColorsChange,
}: HUDOverlayProps) {
  const activeIndex = lockedPoint ?? hoveredPoint;
  const visibleCount = Math.ceil(pathPoints.length * timelineProgress);
  const [minimapExpanded, setMinimapExpanded] = React.useState(false);
  const [settingsExpanded, setSettingsExpanded] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['dimensions', 'cameraControls']));

  // Format classification data using utilities
  const classificationDimensions = React.useMemo(() => 
    getClassificationDimensions(selectedConversation),
    [selectedConversation]
  );

  const roleDistributions = React.useMemo(() => 
    getRoleDistributions(selectedConversation),
    [selectedConversation]
  );

  const classificationMetadata = React.useMemo(() => 
    formatClassificationMetadata(selectedConversation),
    [selectedConversation]
  );

  const classificationStats = React.useMemo(() => 
    getClassificationStats(selectedConversation),
    [selectedConversation]
  );

  // Extract epistemic flags for display
  const epistemicFlags = React.useMemo(() => 
    selectedConversation ? extractEpistemicFlags(selectedConversation) : null,
    [selectedConversation]
  );

  // Extract failure mode flags for display
  const failureFlags = React.useMemo(() => 
    selectedConversation ? extractFailureFlags(selectedConversation) : null,
    [selectedConversation]
  );

  // Check for role breakdown
  const hasRoleBreakdown = React.useMemo(() => 
    selectedConversation?.classification?.aiRole?.distribution 
      ? isRoleBreakdown(selectedConversation.classification.aiRole.distribution)
      : false,
    [selectedConversation]
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Minimap sizing + layout
  const panelWidth = minimapExpanded ? UI_CONFIG.MINIMAP_SIZE_EXPANDED : UI_CONFIG.PANEL_WIDTH;
  const minimapWidth = panelWidth;
  const minimapHeightBase = minimapExpanded ? UI_CONFIG.MINIMAP_HEIGHT_EXPANDED : UI_CONFIG.MINIMAP_SIZE_COLLAPSED;
  const minimapContainerHeight = minimapHeightBase;
  const minimapRenderWidth = minimapWidth;
  const minimapBodyHeight = minimapContainerHeight - UI_CONFIG.MINIMAP_HEADER_HEIGHT;
  const xMin = UI_CONFIG.MINIMAP_PADDING;
  const xMax = minimapRenderWidth - UI_CONFIG.MINIMAP_PADDING;
  const xSpan = xMax - xMin;
  const yMin = UI_CONFIG.MINIMAP_PADDING;
  const yMax = minimapBodyHeight - UI_CONFIG.MINIMAP_PADDING;
  const ySpan = yMax - yMin;
  const midY = yMin + ySpan / 2;

  const activePoint = React.useMemo(() => {
    if (activeIndex === null || activeIndex < 0 || activeIndex >= pathPoints.length) {
      return null;
    }
    return pathPoints[activeIndex];
  }, [activeIndex, pathPoints]);

  const activeMessage = React.useMemo(() => {
    if (!activePoint) return null;
    // Ensure content exists, use empty string as fallback
    const content = activePoint.content ?? '';
    return {
      role: activePoint.role,
      content: content,
      communicationFunction: activePoint.communicationFunction,
      conversationStructure: activePoint.conversationStructure
    };
  }, [activePoint]);

  return (
    <>
      {/* Custom scrollbar styling */}
      <style>{`
        .hud-scrollable::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .hud-scrollable::-webkit-scrollbar-track {
          background: ${THEME.cardRgba(0.3)};
          border-radius: 4px;
        }
        .hud-scrollable::-webkit-scrollbar-thumb {
          background: var(--chart-1, #7b68ee);
          border-radius: 4px;
          border: 1px solid var(--chart-1, #7b68ee);
          opacity: 0.4;
        }
        .hud-scrollable::-webkit-scrollbar-thumb:hover {
          background: var(--chart-1, #7b68ee);
          opacity: 0.6;
        }
        .hud-scrollable {
          scrollbar-width: thin;
          scrollbar-color: var(--chart-1, #7b68ee) ${THEME.card};
        }
      `}</style>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      color: THEME.foreground,
      fontSize: '12px',
      letterSpacing: '0.5px'
      }}>
        {/* Subtle vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none'
        }} />

     

      {/* Top left - Title and Role Patterns (Combined) */}
      <div style={{
        position: 'absolute',
        top: UI_CONFIG.PANEL_OFFSET,
        left: UI_CONFIG.PANEL_OFFSET,
        maxWidth: `${UI_CONFIG.PANEL_WIDTH}px`,
        zIndex: 10,
        background: THEME.cardRgba(0.85),
        border: `1px solid ${THEME.borderRgba(0.3)}`,
        backdropFilter: 'blur(4px)',
        borderRadius: '4px',
        padding: '12px',
        pointerEvents: 'auto'
      }}>
        <div style={{
          fontSize: '13px',
          letterSpacing: '2px',
          marginBottom: 4,
          color: THEME.accent
        }}>
          CONVERSATIONAL TOPOGRAPHY
        </div>
    

          {/* Back button */}
          <button
           onClick={onBackToGrid}
           style={{
             padding: '6px 12px',
             background: `var(--chart-1, #7b68ee)33`,
             border: `1px solid var(--chart-1, #7b68ee)`,
             opacity: 0.4,
             color: THEME.accent,
             cursor: 'pointer',
             fontFamily: 'inherit',
             fontSize: '12px',
             letterSpacing: '1px',
             transition: 'all 0.2s',
             pointerEvents: 'auto'
           }}
           onMouseEnter={(e) => {
             (e.target as HTMLButtonElement).style.background = THEME.accentRgba(0.25);
               }}
               onMouseLeave={(e) => {
                 (e.target as HTMLButtonElement).style.background = THEME.accentRgba(0.15);
           }}
         >
           ← BACK TO GRID
         </button>

        {/* Role patterns - integrated into title panel */}
        {selectedConversation && (
          <div style={{ 
            marginTop: 8,
            padding: '6px 10px', 
            background: THEME.foregroundRgba(0.1), 
            border: `1px solid ${THEME.foregroundRgba(0.3)}`,
            fontSize: '12px',
            marginBottom: 8
          }}>
            <div style={{ marginBottom: 4, fontWeight: 'bold', fontSize: '12px' }}>ROLE PATTERNS</div>
            {(() => {
              const humanRole = getDominantHumanRole(selectedConversation);
              const aiRole = getDominantAiRole(selectedConversation);

              return (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {humanRole && (
                    <div>
                      <span style={{ opacity: 0.6 }}>You: </span>
                      <span style={{ 
                        color: getColorForRole(humanRole.role),
                        fontWeight: 'bold'
                      }}>
                        {humanRole.role} ({Math.round(humanRole.value * 100)}%)
                      </span>
                    </div>
                  )}
                  {aiRole && (
                    <div>
                      <span style={{ opacity: 0.6 }}>AI: </span>
                      <span style={{ 
                        color: getColorForRole(aiRole.role),
                        fontWeight: 'bold'
                      }}>
                        {aiRole.role} ({Math.round(aiRole.value * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
        <div style={{ opacity: 0.5, fontSize: '12px', letterSpacing: '1px', marginBottom: 4, color: THEME.accent5 }}>
          {terrainName}
        </div>
        <div style={{ opacity: 0.5, fontSize: '12px', letterSpacing: '0.5px', lineHeight: 1.4, marginBottom: 8 }}>
          X: USER POSITIONING (FUNCTIONAL↔SOCIAL) · Y: AI POSITIONING (STRUCTURED↔EMERGENT) · Z: AFFECTIVE/EVALUATIVE LENS (PAD)
        </div>
       
      </div>


      {/* Left side - Message panel */}
      <div 
        className="hud-scrollable"
        style={{
          position: 'absolute',
          top: 300,
          left: UI_CONFIG.PANEL_OFFSET,
          width: UI_CONFIG.PANEL_WIDTH,
          maxHeight: 'calc(100vh - 310px)',
          overflowY: 'auto',
          pointerEvents: 'auto',
          zIndex: 5
        }}
      >
        <div style={{
          background: THEME.cardRgba(0.85),
          border: `1px solid ${THEME.borderRgba(0.3)}`,
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${THEME.borderRgba(0.15)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            flexShrink: 0
          }}>
            <span style={{ letterSpacing: '1px' }}>◉ STATION DATA</span>
            <span style={{ opacity: 0.5 }}>
              {activeIndex !== null ? `PT ${String(activeIndex + 1).padStart(2, '0')}` : '—'}
            </span>
          </div>


          <div className="hud-scrollable" style={{ overflowY: 'auto', flex: 1 }}>
          {activeMessage ? (
            <div style={{ padding: 16 }}>
              <div style={{
                display: 'inline-block',
                padding: '2px 6px',
                marginBottom: 8,
                background: activeMessage.role === 'user' ? THEME.accent5Rgba(0.2) : THEME.accentRgba(0.2),
                border: `1px solid ${activeMessage.role === 'user' ? THEME.accent5Rgba(0.5) : THEME.accentRgba(0.5)}`,
                color: activeMessage.role === 'user' ? THEME.accent5 : THEME.accent,
                fontSize: '12px',
                letterSpacing: '1px'
              }}>
                {activeMessage.role === 'user' ? 'HUMAN' : 'SYSTEM'}
              </div>

              <div style={{
                color: THEME.foreground,
                fontSize: '12px',
                lineHeight: 1.5,
                marginBottom: 12,
                paddingLeft: 8,
                borderLeft: `2px solid ${activeMessage.role === 'user' ? THEME.accent5 : THEME.accent}`
              }}>
                {activeMessage.content}
              </div>
 


              {/* Role information - if available */}
              {activePoint && (activePoint.humanRole || activePoint.aiRole) && (
                <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${THEME.borderRgba(0.15)}` }}>
                  <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 6 }}>ROLE POSITIONING</div>
                  {activePoint.role === 'user' && activePoint.humanRole && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 2 }}>
                        You positioned yourself as:
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: `${getColorForRole(activePoint.humanRole)}33`,
                        border: `1px solid ${getColorForRole(activePoint.humanRole)}`,
                        color: getColorForRole(activePoint.humanRole),
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {activePoint.humanRole.toUpperCase()} {activePoint.roleConfidence ? `(${Math.round(activePoint.roleConfidence * 100)}%)` : ''}
                      </div>
                    </div>
                  )}
                  {activePoint.role === 'assistant' && activePoint.aiRole && (
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 2 }}>
                        You positioned the AI as:
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: `${getColorForRole(activePoint.aiRole)}33`,
                        border: `1px solid ${getColorForRole(activePoint.aiRole)}`,
                        color: getColorForRole(activePoint.aiRole),
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {activePoint.aiRole.toUpperCase()} {activePoint.roleConfidence ? `(${Math.round(activePoint.roleConfidence * 100)}%)` : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAD (Affective/Evaluative) Display */}
              {/* NOTE: PAD values can be stored in JSON files (added via scripts/add-pad-to-data.js) or calculated at runtime */}
              {activePoint?.pad && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.borderRgba(0.15)}` }}>
                  <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 6 }}>
                    AFFECTIVE STATE (PAD)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* Pleasure */}
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: 2 }}>
                        Pleasure: {Math.round(activePoint.pad.pleasure * 100)}%
                      </div>
                      <div style={{
                        height: 4,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${activePoint.pad.pleasure * 100}%`,
                          background: activePoint.pad.pleasure > 0.6 ? '#4ade80' : '#f97316',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Arousal */}
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: 2 }}>
                        Arousal: {Math.round(activePoint.pad.arousal * 100)}%
                      </div>
                      <div style={{
                        height: 4,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${activePoint.pad.arousal * 100}%`,
                          background: '#7b68ee',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Emotional Intensity */}
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: 2 }}>
                        Intensity: {Math.round(activePoint.pad.emotionalIntensity * 100)}%
                        {activePoint.pad.emotionalIntensity > 0.6 && (
                          <span style={{ color: '#f97316', marginLeft: 6, fontWeight: 'bold' }}>
                            Peak (Frustration)
                          </span>
                        )}
                        {activePoint.pad.emotionalIntensity < 0.4 && (
                          <span style={{ color: '#4ade80', marginLeft: 6, fontWeight: 'bold' }}>
                            Valley (Affiliation)
                          </span>
                        )}
                      </div>
                      <div style={{
                        height: 4,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${activePoint.pad.emotionalIntensity * 100}%`,
                          background: activePoint.pad.emotionalIntensity > 0.6 ? '#f97316' : activePoint.pad.emotionalIntensity < 0.4 ? '#4ade80' : '#7b68ee',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Failure Mode Badge - Show prominently if breakdown detected (higher priority) */}
              {failureFlags && failureFlags.hasBreakdown && (
                <div style={{ 
                  marginTop: 12, 
                  padding: '10px 12px', 
                  background: getFailureStatusColor(failureFlags) + '20',
                  border: `2px solid ${getFailureStatusColor(failureFlags)}`,
                  borderRadius: 6
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: getFailureStatusColor(failureFlags),
                    marginBottom: 4
                  }}>
                    🔴 {getFailureStatusLabel(failureFlags)}
                  </div>
                  {getFailureStatusDescription(failureFlags) && (
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      lineHeight: 1.4,
                      marginBottom: 4
                    }}>
                      {getFailureStatusDescription(failureFlags)}
                    </div>
                  )}
                  {failureFlags.hasRepairAttempts && (
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.7,
                      marginBottom: 4
                    }}>
                      Repair attempts: {failureFlags.hasSuccessfulRepair ? '✓ Successful' : '✗ Failed'}
                    </div>
                  )}
                  {hasRoleBreakdown && (
                    <div style={{ 
                      fontSize: '11px', 
                      paddingTop: 6,
                      borderTop: `1px solid ${getFailureStatusColor(failureFlags)}40`,
                      color: getFailureStatusColor(failureFlags),
                      fontWeight: 'bold'
                    }}>
                      ⚠️ AI Role Breakdown (non-functional state)
                    </div>
                  )}
                </div>
              )}

              {/* Epistemic Status Badge - Show prominently if flags detected (but not if breakdown) */}
              {epistemicFlags && (epistemicFlags.hasHallucination || epistemicFlags.hasError || epistemicFlags.isContestedKnowledge) && !failureFlags?.hasBreakdown && (
                <div style={{ 
                  marginTop: 12, 
                  padding: '10px 12px', 
                  background: getEpistemicStatusColor(epistemicFlags) + '20',
                  border: `2px solid ${getEpistemicStatusColor(epistemicFlags)}`,
                  borderRadius: 6
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: getEpistemicStatusColor(epistemicFlags),
                    marginBottom: 4
                  }}>
                    ⚠️ {getEpistemicStatusLabel(epistemicFlags)}
                  </div>
                  {getEpistemicStatusDescription(epistemicFlags) && (
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.8,
                      lineHeight: 1.4
                    }}>
                      {getEpistemicStatusDescription(epistemicFlags)}
                    </div>
                  )}
                  {epistemicFlags.hasSuccessfulRepair && (
                    <div style={{ 
                      fontSize: '11px', 
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: `1px solid ${getEpistemicStatusColor(epistemicFlags)}40`,
                      color: '#4ade80',
                      fontWeight: 'bold'
                    }}>
                      ✓ Trust repaired during conversation
                    </div>
                  )}
                </div>
              )}

              {/* Conversation-level Classification Data - Collapsible */}
              {selectedConversation && selectedConversation.classification && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.borderRgba(0.15)}` }}>
                  
                  {/* Classification Dimensions Section */}
                  {classificationDimensions.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div
                        onClick={() => toggleSection('dimensions')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          marginBottom: 6,
                          fontSize: '12px',
                          letterSpacing: '1px',
                          opacity: 0.5
                        }}
                      >
                        <span>CLASSIFICATION DIMENSIONS</span>
                        <span style={{ fontSize: '12px' }}>
                          {expandedSections.has('dimensions') ? '▼' : '▶'} {classificationDimensions.length} dims
                        </span>
                      </div>
                      
                      {expandedSections.has('dimensions') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {classificationDimensions.map((dim, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '10px 14px',
                                background: THEME.accentRgba(0.08),
                                border: `1px solid ${THEME.accentRgba(0.15)}`,
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                <span style={{ opacity: 0.5, fontSize: '12px' }}>{dim.label}</span>
                                <span style={{
                                  color: getConfidenceColor(dim.confidence),
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {dim.formattedConfidence}
                                </span>
                              </div>
                                <div style={{ fontWeight: 'bold', color: THEME.accent, marginBottom: 2 }}>
                                {dim.formattedCategory}
                              </div>
                              {dim.alternative && (
                                <div style={{ fontSize: '12px', opacity: 0.5, fontStyle: 'italic', marginTop: 2 }}>
                                  Alt: {formatCategoryName(dim.alternative)}
                                </div>
                              )}
                              {dim.rationale && (
                                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 3, lineHeight: 1.3 }}>
                                  {dim.rationale}
                                </div>
                              )}
                              {dim.evidence && dim.evidence.length > 0 && (
                                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 3, fontStyle: 'italic' }}>
                                  Evidence: "{dim.evidence[0]}"{dim.evidence.length > 1 ? ` (+${dim.evidence.length - 1} more)` : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Distributions Section */}
                  {(roleDistributions.humanRoles.length > 0 || roleDistributions.aiRoles.length > 0) && (
                    <div style={{ marginBottom: 8 }}>
                      <div
                        onClick={() => toggleSection('roles')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          marginBottom: 6,
                          fontSize: '12px',
                          letterSpacing: '1px',
                          opacity: 0.5
                        }}
                      >
                        <span>ROLE DISTRIBUTIONS</span>
                        <span style={{ fontSize: '12px' }}>
                          {expandedSections.has('roles') ? '▼' : '▶'}
                        </span>
                      </div>

                      {expandedSections.has('roles') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {roleDistributions.humanRoles.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: 8 }}>
                                HUMAN ROLES
                                {roleDistributions.humanConfidence > 0 && (
                                  <span style={{ marginLeft: 6, color: getConfidenceColor(roleDistributions.humanConfidence) }}>
                                    ({formatConfidence(roleDistributions.humanConfidence)})
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {roleDistributions.humanRoles.map((role, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                      <span style={{ color: THEME.foreground, fontWeight: 600 }}>
                                        {role.role}
                                      </span>
                                      <span style={{ color: THEME.foreground, opacity: 0.7, fontFamily: 'monospace' }}>
                                        {role.percentage}%
                                      </span>
                                    </div>
                                    <div style={{
                                      width: '100%',
                                      height: 8,
                                      background: THEME.cardRgba(0.3),
                                      borderRadius: 4,
                                      overflow: 'hidden',
                                      border: `1px solid ${THEME.borderRgba(0.2)}`
                                    }}>
                                      <div style={{
                                        width: `${role.percentage}%`,
                                        height: '100%',
                                        background: THEME.accent5,
                                        borderRadius: 4,
                                        transition: 'width 0.3s ease'
                                      }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {roleDistributions.aiRoles.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                  AI ROLES
                                  {roleDistributions.aiConfidence > 0 && (
                                    <span style={{ marginLeft: 6, color: getConfidenceColor(roleDistributions.aiConfidence) }}>
                                      ({formatConfidence(roleDistributions.aiConfidence)})
                                    </span>
                                  )}
                                </span>
                                {hasRoleBreakdown && (
                                  <span style={{
                                    fontSize: '10px',
                                    color: '#ff4444',
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    background: '#ff444420',
                                    border: '1px solid #ff4444',
                                    borderRadius: 3
                                  }}>
                                    BREAKDOWN
                                  </span>
                                )}
                              </div>
                              {hasRoleBreakdown ? (
                                <div style={{
                                  padding: '8px 10px',
                                  background: '#ff444420',
                                  border: '1px solid #ff4444',
                                  borderRadius: 4,
                                  fontSize: '11px',
                                  color: '#ff4444',
                                  fontStyle: 'italic'
                                }}>
                                  AI role distribution indicates complete breakdown (sum ≈ 0).
                                  AI failed to fulfill any functional role during this conversation.
                                  {selectedConversation?.classification?.aiRole && 'breakdown' in selectedConversation.classification.aiRole && (selectedConversation.classification.aiRole as any).breakdown && (
                                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                                      Type: {(selectedConversation.classification.aiRole as any).breakdown.type || 'non-grounding'}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {roleDistributions.aiRoles.map((role, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                        <span style={{ color: THEME.foreground, fontWeight: 600 }}>
                                          {role.role}
                                        </span>
                                        <span style={{ color: THEME.foreground, opacity: 0.7, fontFamily: 'monospace' }}>
                                          {role.percentage}%
                                        </span>
                                      </div>
                                      <div style={{
                                        width: '100%',
                                        height: 8,
                                        background: THEME.cardRgba(0.3),
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        border: `1px solid ${THEME.borderRgba(0.2)}`
                                      }}>
                                        <div style={{
                                          width: `${role.percentage}%`,
                                          height: '100%',
                                          background: THEME.accent,
                                          borderRadius: 4,
                                          transition: 'width 0.3s ease'
                                        }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Classification Metadata Section */}
                  {classificationMetadata.model && (
                    <div>
                      <div
                        onClick={() => toggleSection('metadata')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          marginBottom: 6,
                          fontSize: '12px',
                          letterSpacing: '1px',
                          opacity: 0.5
                        }}
                      >
                        <span>CLASSIFICATION INFO</span>
                        <span style={{ fontSize: '12px' }}>
                          {expandedSections.has('metadata') ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {expandedSections.has('metadata') && (
                        <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {classificationMetadata.model && (
                            <div>Model: {classificationMetadata.model} ({classificationMetadata.provider})</div>
                          )}
                          {classificationMetadata.promptVersion && (
                            <div>Prompt: v{classificationMetadata.promptVersion}</div>
                          )}
                          {classificationMetadata.timestamp && (
                            <div>Classified: {classificationMetadata.timestamp}</div>
                          )}
                          {classificationMetadata.processingTime && (
                            <div>Processing: {classificationMetadata.processingTime}</div>
                          )}
                          {classificationStats.totalDimensions > 0 && (
                            <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${THEME.borderRgba(0.1)}` }}>
                              <div>Avg Confidence: {formatConfidence(classificationStats.averageConfidence)}</div>
                              {classificationStats.lowConfidenceCount > 0 && (
                                <div style={{ color: '#ff6b6b' }}>
                                  {classificationStats.lowConfidenceCount} dims with low confidence
                                </div>
                              )}
                              {classificationStats.abstain && (
                                <div style={{ color: THEME.accent5 }}>⚠️ Classification marked as abstain</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: 20,
              textAlign: 'center',
               opacity: 0.4,
              fontSize: '12px'
            }}>
              <div style={{ fontSize: '16px', marginBottom: 6 }}>◎</div>
              SELECT POINT TO VIEW DATA
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Right side - Minimap Only */}
      <div 
        style={{
          position: 'absolute',
          top: UI_CONFIG.MESSAGE_PANEL_TOP,
          right: UI_CONFIG.PANEL_OFFSET,
          width: panelWidth,
          maxHeight: 'calc(100vh - 300px)',
          pointerEvents: 'auto',
          zIndex: 5
        }}
      >
        <div style={{
          background: THEME.cardRgba(0.85),
          border: `1px solid ${THEME.borderRgba(0.3)}`,
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}>
          <div 
            onClick={() => setMinimapExpanded(!minimapExpanded)}
            style={{
              padding: '6px 10px',
              borderBottom: `1px solid ${THEME.borderRgba(0.15)}`,
              fontSize: '12px',
              letterSpacing: '1px',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span>AXIS MAP</span>
            <span style={{ opacity: 0.5 }}>{minimapExpanded ? 'Click to collapse' : 'Click to expand'}</span>
          </div>
          <svg
            width="100%"
            height={minimapBodyHeight}
            style={{ display: 'block' }}
          >
            {/* Quadrant labels */}
            <text x={30} y={yMin - 10} fontSize="7" fill={THEME.foreground} opacity="0.4" fontFamily="inherit">
              STRUCTURED
            </text>
            <text x={30} y={yMax + 20} fontSize="7" fill={THEME.foreground} opacity="0.4" fontFamily="inherit">
              EMERGENT
            </text>
            <text x="5" y={midY + 5} fontSize="7" fill={THEME.foreground} opacity="0.4" fontFamily="inherit">
              FUNC.
            </text>
            <text x={xMax - 10} y={midY + 5} fontSize="7" fill={THEME.foreground} opacity="0.4" fontFamily="inherit">
              SOCIAL
            </text>

            {/* Grid */}
            <line x1={xMin} y1={yMin} x2={xMax} y2={yMin} stroke={THEME.borderRgba(0.2)} strokeWidth="1" />
            <line x1={xMin} y1={midY} x2={xMax} y2={midY} stroke={THEME.borderRgba(0.3)} strokeWidth="1" strokeDasharray="2,2" />
            <line x1={xMin} y1={yMax} x2={xMax} y2={yMax} stroke={THEME.borderRgba(0.2)} strokeWidth="1" />
            <line x1={xMin} y1={yMin} x2={xMin} y2={yMax} stroke={THEME.borderRgba(0.2)} strokeWidth="1" />
            <line x1={(xMin + xMax) / 2} y1={yMin} x2={(xMin + xMax) / 2} y2={yMax} stroke={THEME.borderRgba(0.3)} strokeWidth="1" strokeDasharray="2,2" />
            <line x1={xMax} y1={yMin} x2={xMax} y2={yMax} stroke={THEME.borderRgba(0.2)} strokeWidth="1" />

            {/* Center crosshair */}
            <circle cx={(xMin + xMax) / 2} cy={midY} r="3" fill="none" stroke={THEME.accent} strokeWidth="1" opacity="0.5" />
            <line x1={(xMin + xMax) / 2 - 3} y1={midY} x2={(xMin + xMax) / 2 + 3} y2={midY} stroke={THEME.accent} strokeWidth="1" opacity="0.5" />
            <line x1={(xMin + xMax) / 2} y1={midY - 3} x2={(xMin + xMax) / 2} y2={midY + 3} stroke={THEME.accent} strokeWidth="1" opacity="0.5" />

            {/* Path points - interactive */}
            {pathPoints.slice(0, visibleCount).map((point, idx) => {
              const x = xMin + point.x * xSpan;
              const y = yMin + point.y * ySpan;
              const isActive = idx === activeIndex;
              const isVisible = idx < visibleCount;

              if (!isVisible) return null;

              const color = point.role === 'user' ? '#7b68ee' : '#f97316'; // Match Three.js scene colors

              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 4}
                  fill={color}
                  opacity={isActive ? 1 : 0.7}
                  stroke={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth={isActive ? 2 : 1}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newProgress = (idx + 1) / pathPoints.length;
                    onTimelineChange(newProgress);
                    // Also select/lock the corresponding point
                    if (onPointClick) {
                      onPointClick(idx);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.setAttribute('r', isActive ? '7' : '5');
                    target.setAttribute('opacity', '1');
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.setAttribute('r', isActive ? '6' : '4');
                    target.setAttribute('opacity', isActive ? '1' : '0.7');
                  }}
                >
                  <title>{`Message ${idx + 1}: ${point.content.substring(0, 50)}${point.content.length > 50 ? '...' : ''}`}</title>
                </circle>
              );
            })}

            {/* Path line with gradient colors based on PAD incline/decline */}
            {pathPoints.length > 1 && (
              <>
                {pathPoints.slice(0, visibleCount).map((point, idx) => {
                  if (idx === 0) return null; // Skip first point
                  
                  const prevPoint = pathPoints[idx - 1];
                  const x1 = xMin + prevPoint.x * xSpan;
                  const y1 = yMin + prevPoint.y * ySpan;
                  const x2 = xMin + point.x * xSpan;
                  const y2 = yMin + point.y * ySpan;
                  
                  // Calculate PAD change between consecutive points
                  const padChange = calculatePadChange(prevPoint, point);
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
          </svg>
        </div>

        {/* Camera View Controls */}
        {onCameraViewChange && (
          <div style={{
            padding: '8px 10px',
            borderTop: `1px solid ${THEME.borderRgba(0.15)}`,
            background: THEME.cardRgba(0.95),
            display: 'flex',
            marginTop: 10,
            borderRadius: 6,
            flexDirection: 'column',
            gap: 6
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '1px',
              opacity: 0.6,
              color: THEME.foreground,
              marginBottom: 4
            }}>
              CAMERA VIEW
            </div>
            <div style={{
              display: 'flex',
              gap: 6
            }}>
              {(['default', 'side', 'top'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => onCameraViewChange(view)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    background: cameraView === view
                      ? THEME.accentRgba(0.3)
                      : THEME.cardRgba(0.2),
                    border: `1px solid ${cameraView === view ? THEME.accent : THEME.borderRgba(0.3)}`,
                    borderRadius: 3,
                    color: cameraView === view ? THEME.accent : THEME.foreground,
                    cursor: 'pointer',
                    opacity: cameraView === view ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    if (cameraView !== view) {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.background = THEME.cardRgba(0.3);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cameraView !== view) {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.background = THEME.cardRgba(0.2);
                    }
                  }}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          marginTop: 10,
          borderRadius: 6,
          padding: '8px 10px',
          borderTop: `1px solid ${THEME.borderRgba(0.15)}`,
          background: THEME.cardRgba(0.95),
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '1px',
              opacity: 0.6,
              color: THEME.foreground
            }}>
              TIMELINE ({visibleCount}/{pathPoints.length})
            </div>
            {onAnimate && (
              <button
                onClick={onAnimate}
                style={{
                  padding: '4px 8px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  background: THEME.accentRgba(0.2),
                  border: `1px solid ${THEME.accentRgba(0.5)}`,
                  borderRadius: 3,
                  color: THEME.accent,
                  cursor: 'pointer',
                  opacity: 0.8,
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                ▶ Play
              </button>
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            flexWrap: 'wrap',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '4px 0'
          }}>
            {/* Left Arrow */}
            <button
              onClick={() => {
                if (activeIndex !== null && activeIndex > 0) {
                  const prevIdx = activeIndex - 1;
                  const newProgress = (prevIdx + 1) / pathPoints.length;
                  onTimelineChange(newProgress);
                  if (onPointClick) {
                    onPointClick(prevIdx);
                  }
                }
              }}
              disabled={activeIndex === null || activeIndex === 0}
              style={{
                padding: '4px 6px',
                fontSize: '12px',
                background: (activeIndex === null || activeIndex === 0) 
                  ? THEME.borderRgba(0.2) 
                  : THEME.accentRgba(0.2),
                border: `1px solid ${(activeIndex === null || activeIndex === 0) 
                  ? THEME.borderRgba(0.3) 
                  : THEME.accentRgba(0.5)}`,
                borderRadius: 3,
                color: (activeIndex === null || activeIndex === 0) 
                  ? THEME.foregroundMuted 
                  : THEME.accent,
                cursor: (activeIndex === null || activeIndex === 0) ? 'not-allowed' : 'pointer',
                opacity: (activeIndex === null || activeIndex === 0) ? 0.4 : 0.8,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '28px',
                height: '24px'
              }}
              onMouseEnter={(e) => {
                if (activeIndex !== null && activeIndex > 0) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (activeIndex !== null && activeIndex > 0) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              ◀
            </button>
            
            {pathPoints.map((_, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const newProgress = (idx + 1) / pathPoints.length;
                  onTimelineChange(newProgress);
                  // Also select/lock the corresponding point
                  if (onPointClick) {
                    onPointClick(idx);
                  }
                }}
                style={{
                  width: idx < visibleCount ? 16 : 8,
                  height: 4,
                  background: idx < visibleCount
                    ? (idx === activeIndex ? THEME.accent5 : THEME.accent)
                    : THEME.accentRgba(0.2),
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scaleY(2)';
                  e.currentTarget.style.background = idx < visibleCount
                    ? (idx === activeIndex ? THEME.accent3 : THEME.accent)
                    : THEME.accentRgba(0.4);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scaleY(1)';
                  e.currentTarget.style.background = idx < visibleCount
                    ? (idx === activeIndex ? THEME.accent5 : THEME.accent)
                    : THEME.accentRgba(0.2);
                }}
                title={`Message ${idx + 1}`}
              />
            ))}
            
            {/* Right Arrow */}
            <button
              onClick={() => {
                if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
                  const nextIdx = activeIndex + 1;
                  const newProgress = (nextIdx + 1) / pathPoints.length;
                  onTimelineChange(newProgress);
                  if (onPointClick) {
                    onPointClick(nextIdx);
                  }
                }
              }}
              disabled={activeIndex === null || activeIndex >= pathPoints.length - 1}
              style={{
                padding: '4px 6px',
                fontSize: '12px',
                background: (activeIndex === null || activeIndex >= pathPoints.length - 1) 
                  ? THEME.borderRgba(0.2) 
                  : THEME.accentRgba(0.2),
                border: `1px solid ${(activeIndex === null || activeIndex >= pathPoints.length - 1) 
                  ? THEME.borderRgba(0.3) 
                  : THEME.accentRgba(0.5)}`,
                borderRadius: 3,
                color: (activeIndex === null || activeIndex >= pathPoints.length - 1) 
                  ? THEME.foregroundMuted 
                  : THEME.accent,
                cursor: (activeIndex === null || activeIndex >= pathPoints.length - 1) ? 'not-allowed' : 'pointer',
                opacity: (activeIndex === null || activeIndex >= pathPoints.length - 1) ? 0.4 : 0.8,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '28px',
                height: '24px'
              }}
              onMouseEnter={(e) => {
                if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Settings Section - Expandable */}
        <div style={{
          marginTop: 10,
          borderRadius: 6,
          background: THEME.cardRgba(0.95),
          borderTop: `1px solid ${THEME.borderRgba(0.15)}`,
          maxHeight: settingsExpanded ? 'calc(100vh - 400px)' : 'none',
          overflowY: settingsExpanded ? 'auto' : 'hidden',
          transition: 'max-height 0.3s ease-out'
        }}>
          <div 
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            style={{
              padding: '6px 10px',
              borderBottom: settingsExpanded ? `1px solid ${THEME.borderRgba(0.15)}` : 'none',
              fontSize: '12px',
              letterSpacing: '1px',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>SETTINGS</span>
            <span style={{ opacity: 0.5 }}>
              {settingsExpanded ? '▼' : '▶'} {settingsExpanded ? 'Click to collapse' : 'Click to expand'}
            </span>
          </div>
          
          {settingsExpanded && (
            <div style={{ padding: '8px' }}>
              <ControlsContent
                pathPoints={pathPoints}
                timelineProgress={timelineProgress}
                contourCount={contourCount ?? 15}
                showContours={showContours ?? true}
                terrainPosition={terrainPosition ?? { x: 0, y: 0, z: -2.5 }}
                cameraView={cameraView}
                cameraDistance={cameraDistance ?? 18}
                cameraElevation={cameraElevation ?? 30}
                cameraRotation={cameraRotation ?? 0}
                contourColors={contourColors ?? { minor: '#303030', major: '#202020', index: '#101010' }}
                markerColors={markerColors ?? { user: '#4a3a8a', userGlow: '#5a4a9a', assistant: '#cc5500', assistantGlow: '#dd6600' }}
                onTimelineChange={onTimelineChange}
                onContourCountChange={onContourCountChange ?? (() => {})}
                onToggleContours={onToggleContours ?? (() => {})}
                onTerrainPositionChange={onTerrainPositionChange ?? (() => {})}
                onCameraViewChange={onCameraViewChange ?? (() => {})}
                onCameraDistanceChange={onCameraDistanceChange ?? (() => {})}
                onCameraElevationChange={onCameraElevationChange ?? (() => {})}
                onCameraRotationChange={onCameraRotationChange ?? (() => {})}
                onContourColorsChange={onContourColorsChange ?? (() => {})}
                onMarkerColorsChange={onMarkerColorsChange ?? (() => {})}
                onAnimate={onAnimate ?? (() => {})}
              />
            </div>
          )}
        </div>
      </div>

   

      {/* Bottom center - Point timeline */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        background: THEME.cardRgba ? THEME.cardRgba(0.8) : 'rgba(26, 26, 26, 0.8)',
        padding: '10px 20px',
        border: `1px solid ${THEME.borderRgba(0.3)}`,
        pointerEvents: 'auto',
        borderRadius: 4,
        maxWidth: 'calc(100vw - 200px)', // Prevent overflow
        overflowX: 'auto',
        zIndex: 5
      }}>
        {/* Left Arrow */}
        <button
          onClick={() => {
            if (activeIndex !== null && activeIndex > 0) {
              const prevIdx = activeIndex - 1;
              const newProgress = (prevIdx + 1) / pathPoints.length;
              onTimelineChange(newProgress);
              if (onPointClick) {
                onPointClick(prevIdx);
              }
            }
          }}
          disabled={activeIndex === null || activeIndex === 0}
          style={{
            padding: '6px 8px',
            fontSize: '14px',
            background: (activeIndex === null || activeIndex === 0) 
              ? THEME.borderRgba(0.2) 
              : THEME.accentRgba(0.2),
            border: `1px solid ${(activeIndex === null || activeIndex === 0) 
              ? THEME.borderRgba(0.3) 
              : THEME.accentRgba(0.5)}`,
            borderRadius: 3,
            color: (activeIndex === null || activeIndex === 0) 
              ? THEME.foregroundMuted 
              : THEME.accent,
            cursor: (activeIndex === null || activeIndex === 0) ? 'not-allowed' : 'pointer',
            opacity: (activeIndex === null || activeIndex === 0) ? 0.4 : 0.8,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            height: '28px',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (activeIndex !== null && activeIndex > 0) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (activeIndex !== null && activeIndex > 0) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
        >
          ◀
        </button>
        
        {pathPoints.map((_, idx) => (
          <div
            key={idx}
                onClick={() => {
                  const newProgress = (idx + 1) / pathPoints.length;
                  onTimelineChange(newProgress);
                  // Also select/lock the corresponding point
                  if (onPointClick) {
                    onPointClick(idx);
                  }
                }}
                style={{
              width: idx < visibleCount ? 20 : 10,
              height: 6,
              background: idx < visibleCount
                ? (idx === activeIndex ? THEME.accent5 : THEME.accent)
                : THEME.accentRgba(0.2),
              transition: 'all 0.2s ease',
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scaleY(2)';
              e.currentTarget.style.background = idx < visibleCount
                ? (idx === activeIndex ? THEME.accent3 : THEME.accent)
                : THEME.accentRgba(0.4);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scaleY(1)';
              e.currentTarget.style.background = idx < visibleCount
                ? (idx === activeIndex ? THEME.accent5 : THEME.accent)
                : THEME.accentRgba(0.2);
            }}
            title={`Message ${idx + 1}`}
          />
        ))}
        
        {/* Right Arrow */}
        <button
          onClick={() => {
            if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
              const nextIdx = activeIndex + 1;
              const newProgress = (nextIdx + 1) / pathPoints.length;
              onTimelineChange(newProgress);
              if (onPointClick) {
                onPointClick(nextIdx);
              }
            }
          }}
          disabled={activeIndex === null || activeIndex >= pathPoints.length - 1}
          style={{
            padding: '6px 8px',
            fontSize: '14px',
            background: (activeIndex === null || activeIndex >= pathPoints.length - 1) 
              ? THEME.borderRgba(0.2) 
              : THEME.accentRgba(0.2),
            border: `1px solid ${(activeIndex === null || activeIndex >= pathPoints.length - 1) 
              ? THEME.borderRgba(0.3) 
              : THEME.accentRgba(0.5)}`,
            borderRadius: 3,
            color: (activeIndex === null || activeIndex >= pathPoints.length - 1) 
              ? THEME.foregroundMuted 
              : THEME.accent,
            cursor: (activeIndex === null || activeIndex >= pathPoints.length - 1) ? 'not-allowed' : 'pointer',
            opacity: (activeIndex === null || activeIndex >= pathPoints.length - 1) ? 0.4 : 0.8,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            height: '28px',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (activeIndex !== null && activeIndex < pathPoints.length - 1) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
        >
          ▶
        </button>
      </div>

    </div>
    </>
  );
}

