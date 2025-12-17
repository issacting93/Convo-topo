import React from 'react';
import type { PathPoint, MetricMode } from '../utils/terrain';
import { COLORS, getColorForRole } from '../utils/constants';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
import { getDominantHumanRole, getDominantAiRole, mapToGoalRole } from '../utils/conversationToTerrain';

interface HUDOverlayProps {
  pathPoints: PathPoint[];
  comparisonPathPoints: PathPoint[];
  hoveredPoint: number | null;
  lockedPoint: number | null;
  timelineProgress: number;
  seed: number;
  contourCount: number;
  showContours: boolean;
  metricMode: MetricMode;
  isDiffMode: boolean;
  onTimelineChange: (progress: number) => void;
  onSeedChange: (seed: number) => void;
  onContourCountChange: (count: number) => void;
  onToggleContours: (show: boolean) => void;
  onMetricModeChange: (mode: MetricMode) => void;
  onToggleDiffMode: (enabled: boolean) => void;
  onAnimate: () => void;
  onBackToGrid: () => void;
  terrainName: string;
  selectedConversation: ClassifiedConversation | null;
  comparisonConversation: ClassifiedConversation | null;
}

export function HUDOverlay({
  pathPoints,
  comparisonPathPoints,
  hoveredPoint,
  lockedPoint,
  timelineProgress,
  seed,
  contourCount,
  showContours,
  metricMode,
  isDiffMode,
  onTimelineChange,
  onSeedChange,
  onContourCountChange,
  onToggleContours,
  onMetricModeChange,
  onToggleDiffMode,
  onAnimate,
  onBackToGrid,
  terrainName,
  selectedConversation,
  comparisonConversation
}: HUDOverlayProps) {
  const activeIndex = lockedPoint ?? hoveredPoint;
  const visibleCount = Math.ceil(pathPoints.length * timelineProgress);
  const [minimapExpanded, setMinimapExpanded] = React.useState(false);

  // Minimap sizing + layout
  const minimapWidth = minimapExpanded ? 640 : 200;
  const minimapHeight = minimapExpanded ? 640 : 200;
  const minimapHeaderHeight = 30;
  const minimapBodyHeight = minimapHeight - minimapHeaderHeight;
  const xMin = 30;
  const xMax = minimapWidth - 30;
  const xSpan = xMax - xMin;
  const yMin = 30;
  const yMax = minimapBodyHeight - 30;
  const ySpan = yMax - yMin;
  const midY = yMin + ySpan / 2;

  const activePoint = activeIndex !== null ? pathPoints[activeIndex] : null;
  const activeMessage = React.useMemo(() => {
    if (!activePoint) return null;
    return {
      role: activePoint.role,
      content: activePoint.content,
      communicationFunction: activePoint.communicationFunction,
      conversationStructure: activePoint.conversationStructure
    };
  }, [activePoint]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      color: '#c8d432',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }}>
      {/* Subtle vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(10,10,10,0.6) 100%)',
        pointerEvents: 'none'
      }} />

     

      {/* Top left - Title and Role Patterns (Combined) */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20,
        maxWidth: '280px',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '13px',
          letterSpacing: '2px',
          marginBottom: 4,
          color: '#7ad4e8'
        }}>
          CONVERSATIONAL TOPOGRAPHY
        </div>
    

         {/* Back button */}
         <button
          onClick={onBackToGrid}
          style={{
            padding: '6px 12px',
            background: 'rgba(74, 170, 204, 0.15)',
            border: '1px solid rgba(74, 170, 204, 0.4)',
            color: '#7ad4e8',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '9px',
            letterSpacing: '1px',
            transition: 'all 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.25)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.15)';
          }}
        >
          ← BACK TO GRID
        </button>

        {/* Role patterns - integrated into title panel */}
        {selectedConversation && (
          <div style={{ 
            marginTop: 8,
            padding: '6px 10px', 
            background: 'rgba(200, 212, 50, 0.1)', 
            border: '1px solid rgba(200, 212, 50, 0.3)',
            fontSize: '8px',
            marginBottom: 8
          }}>
            <div style={{ marginBottom: 4, fontWeight: 'bold', fontSize: '9px' }}>ROLE PATTERNS</div>
            {(() => {
              const humanRole = getDominantHumanRole(selectedConversation);
              const aiRole = getDominantAiRole(selectedConversation);
              const goalRole = humanRole ? mapToGoalRole(humanRole.role, aiRole?.role || null) : null;
              
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
    <div style={{ opacity: 0.7, fontSize: '10px', letterSpacing: '1px', marginBottom: 4, color: '#ffaa00' }}>
          {terrainName}
        </div>
        <div style={{ opacity: 0.5, fontSize: '8px', letterSpacing: '0.5px', lineHeight: 1.4, marginBottom: 8 }}>
          X: USER POSITIONING (INSTRUMENTAL↔EXPRESSIVE) · Z: AI POSITIONING (STRUCTURED↔EMERGENT) · Y: TOPIC DEPTH
        </div>
       
      </div>


      {/* Left side - Message panel */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 20 ,
        width: 280,
        maxHeight: 'calc(100vh - 200px)', // Prevent overflow
        overflowY: 'auto',
        pointerEvents: 'auto',
        zIndex: 5
      }}>
        <div style={{
          background: 'rgba(10, 20, 30, 0.85)',
          border: '1px solid rgba(74, 170, 204, 0.25)',
          backdropFilter: 'blur(4px)',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(74, 170, 204, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            flexShrink: 0
          }}>
            <span style={{ letterSpacing: '1px' }}>◉ STATION DATA</span>
            <span style={{ opacity: 0.5 }}>
              {activeIndex !== null ? `PT ${String(activeIndex + 1).padStart(2, '0')}` : '—'}
            </span>
          </div>


          <div style={{ overflowY: 'auto', flex: 1 }}>
          {activeMessage ? (
            <div style={{ padding: 12 }}>
              <div style={{
                display: 'inline-block',
                padding: '2px 6px',
                marginBottom: 8,
                background: activeMessage.role === 'user' ? 'rgba(255, 102, 0, 0.2)' : 'rgba(74, 170, 204, 0.2)',
                border: `1px solid ${activeMessage.role === 'user' ? 'rgba(255, 102, 0, 0.5)' : 'rgba(74, 170, 204, 0.5)'}`,
                color: activeMessage.role === 'user' ? '#ff8844' : '#7ad4e8',
                fontSize: '8px',
                letterSpacing: '1px'
              }}>
                {activeMessage.role === 'user' ? 'HUMAN' : 'SYSTEM'}
              </div>

              <div style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '11px',
                lineHeight: 1.5,
                marginBottom: 12,
                paddingLeft: 8,
                borderLeft: `2px solid ${activeMessage.role === 'user' ? '#ff6600' : '#4aaacc'}`
              }}>
                {activeMessage.content}
              </div>

              {/* Role-based metrics - more relevant to goal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{
                  padding: 6,
                  background: 'rgba(74, 170, 204, 0.1)',
                  border: '1px solid rgba(74, 170, 204, 0.2)'
                }}>
                  <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: 2 }}>USER POSITIONING</div>
                  <div style={{ fontSize: '9px', marginBottom: 2 }}>
                    {activeMessage.communicationFunction < 0.5 ? 'INSTRUMENTAL' : 'EXPRESSIVE'}
                  </div>
                  <div style={{
                    height: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    borderRadius: 1
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${activeMessage.communicationFunction * 100}%`,
                      background: activeMessage.communicationFunction < 0.5
                        ? `#44ff66`
                        : `#ffaa00`,
                      borderRadius: 1
                    }} />
                  </div>
                </div>
                <div style={{
                  padding: 6,
                  background: 'rgba(100, 100, 100, 0.1)',
                  border: '1px solid rgba(150, 150, 150, 0.2)'
                }}>
                  <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: 2 }}>AI POSITIONING</div>
                  <div style={{ fontSize: '9px', marginBottom: 2 }}>
                    {activeMessage.conversationStructure < 0.5 ? 'STRUCTURED' : 'EMERGENT'}
                  </div>
                  <div style={{
                    height: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    borderRadius: 1
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${activeMessage.conversationStructure * 100}%`,
                      background: 'linear-gradient(90deg, #4aaacc, #ffaa00)',
                      borderRadius: 1
                    }} />
                  </div>
                </div>
              </div>

              {/* Topic Depth - what terrain height actually represents */}
              {selectedConversation && selectedConversation.classification.topicDepth && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: 3 }}>
                    TOPIC DEPTH (Terrain Height)
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '9px'
                  }}>
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(200, 212, 50, 0.2)',
                      border: '1px solid rgba(200, 212, 50, 0.4)',
                      borderRadius: 2
                    }}>
                      {selectedConversation.classification.topicDepth.category.toUpperCase()}
                    </span>
                    <span style={{ opacity: 0.6 }}>
                      Elevation: {((activePoint?.height ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{
                    marginTop: 4,
                    fontSize: '7px',
                    opacity: 0.5,
                    fontStyle: 'italic'
                  }}>
                    Deeper conversations = higher terrain
                  </div>
                </div>
              )}

              {/* Role information - if available */}
              {activePoint && (activePoint.humanRole || activePoint.aiRole) && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(74, 170, 204, 0.15)' }}>
                  <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: 6 }}>ROLE POSITIONING</div>
                  {activePoint.role === 'user' && activePoint.humanRole && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: '8px', opacity: 0.7, marginBottom: 2 }}>
                        You positioned yourself as:
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: `${getColorForRole(activePoint.humanRole)}33`,
                        border: `1px solid ${getColorForRole(activePoint.humanRole)}`,
                        color: getColorForRole(activePoint.humanRole),
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {activePoint.humanRole.toUpperCase()} {activePoint.roleConfidence ? `(${Math.round(activePoint.roleConfidence * 100)}%)` : ''}
                      </div>
                    </div>
                  )}
                  {activePoint.role === 'assistant' && activePoint.aiRole && (
                    <div>
                      <div style={{ fontSize: '8px', opacity: 0.7, marginBottom: 2 }}>
                        You positioned the AI as:
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: `${getColorForRole(activePoint.aiRole)}33`,
                        border: `1px solid ${getColorForRole(activePoint.aiRole)}`,
                        color: getColorForRole(activePoint.aiRole),
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {activePoint.aiRole.toUpperCase()} {activePoint.roleConfidence ? `(${Math.round(activePoint.roleConfidence * 100)}%)` : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation-level insights - if available */}
              {selectedConversation && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(74, 170, 204, 0.15)' }}>
                  <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: 6 }}>CONVERSATION DYNAMICS</div>
                  
                  {selectedConversation.classification.emotionalTone && (
                    <div style={{ marginBottom: 4, fontSize: '8px' }}>
                      <span style={{ opacity: 0.6 }}>Tone: </span>
                      <span style={{ fontWeight: 'bold' }}>
                        {selectedConversation.classification.emotionalTone.category}
                      </span>
                    </div>
                  )}
                  
                  {selectedConversation.classification.powerDynamics && (
                    <div style={{ marginBottom: 4, fontSize: '8px' }}>
                      <span style={{ opacity: 0.6 }}>Power: </span>
                      <span style={{ fontWeight: 'bold' }}>
                        {selectedConversation.classification.powerDynamics.category}
                      </span>
                    </div>
                  )}
                  
                  {selectedConversation.classification.interactionPattern && (
                    <div style={{ fontSize: '8px' }}>
                      <span style={{ opacity: 0.6 }}>Pattern: </span>
                      <span style={{ fontWeight: 'bold' }}>
                        {selectedConversation.classification.interactionPattern.category}
                      </span>
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
              fontSize: '10px'
            }}>
              <div style={{ fontSize: '16px', marginBottom: 6 }}>◎</div>
              SELECT POINT TO VIEW DATA
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Right side - Combined Controls & Status */}
      <div style={{
        position: 'absolute',
        top: 80,
        right: 20,
        width: 280,
        pointerEvents: 'auto',
        zIndex: 5
      }}>
        <div style={{
          background: 'rgba(10, 20, 30, 0.85)',
          border: '1px solid rgba(74, 170, 204, 0.25)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(74, 170, 204, 0.15)',
            letterSpacing: '1px',
            fontSize: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>◉ CONTROLS</span>
            <span style={{ fontSize: '8px', opacity: 0.5 }}>
              {visibleCount}/{pathPoints.length} messages
            </span>
          </div>

          <div style={{ padding: 10 }}>
            <button
              onClick={onAnimate}
              style={{
                width: '100%',
                padding: '6px 12px',
                background: 'rgba(74, 170, 204, 0.15)',
                border: '1px solid rgba(74, 170, 204, 0.4)',
                color: '#7ad4e8',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '10px',
                letterSpacing: '1px',
                marginBottom: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.25)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.15)';
              }}
            >
              ▶ TRACE PATH
            </button>

            {/* Metric Mode Toggle */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: '8px',
                opacity: 0.5,
                marginBottom: 6,
                letterSpacing: '1px'
              }}>
                METRIC LENS
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4
              }}>
                {(['depth', 'uncertainty', 'affect', 'composite'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onMetricModeChange(mode)}
                    style={{
                      padding: '4px 8px',
                      background: metricMode === mode
                        ? 'rgba(74, 170, 204, 0.3)'
                        : 'rgba(74, 170, 204, 0.08)',
                      border: `1px solid ${metricMode === mode
                        ? 'rgba(74, 170, 204, 0.6)'
                        : 'rgba(74, 170, 204, 0.2)'}`,
                      color: metricMode === mode ? '#7ad4e8' : 'rgba(200, 212, 50, 0.7)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '8px',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s',
                      fontWeight: metricMode === mode ? 'bold' : 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (metricMode !== mode) {
                        (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.15)';
                        (e.target as HTMLButtonElement).style.borderColor = 'rgba(74, 170, 204, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (metricMode !== mode) {
                        (e.target as HTMLButtonElement).style.background = 'rgba(74, 170, 204, 0.08)';
                        (e.target as HTMLButtonElement).style.borderColor = 'rgba(74, 170, 204, 0.2)';
                      }
                    }}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{
                fontSize: '7px',
                opacity: 0.4,
                marginTop: 4,
                lineHeight: 1.3
              }}>
                {metricMode === 'depth' && 'Semantic/intellectual depth'}
                {metricMode === 'uncertainty' && 'Classifier confidence (inverted)'}
                {metricMode === 'affect' && 'Emotional intensity'}
                {metricMode === 'composite' && 'Combined metrics'}
              </div>
            </div>

            {/* Contour toggle */}
            <div style={{ marginBottom: 12 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '9px'
              }}>
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => onToggleContours(e.target.checked)}
                  style={{ accentColor: '#4aaacc' }}
                />
                <span>SHOW CONTOURS</span>
              </label>
            </div>

            {/* Contour count slider - simplified */}
            {showContours && (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                  fontSize: '8px',
                  opacity: 0.5
                }}>
                  <span>CONTOUR LINES</span>
                  <span>{contourCount}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={contourCount}
                  onChange={(e) => onContourCountChange(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#7ad4e8' }}
                />
              </div>
            )}

            {/* Divider */}
            <div style={{
              height: 1,
              background: 'rgba(74, 170, 204, 0.15)',
              margin: '12px 0'
            }} />

            {/* Status info - simplified */}
            <div style={{ fontSize: '8px', opacity: 0.5 }}>
              <div style={{ marginBottom: 2 }}>Resolution: 64×64</div>
              <div>Mode: Topographic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom left - Minimap */}
      <div
        role="button"
        tabIndex={0}
        aria-label={minimapExpanded ? 'Collapse minimap' : 'Expand minimap'}
        onClick={() => setMinimapExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setMinimapExpanded((v) => !v);
          }
        }}
        style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: minimapWidth,
        height: minimapHeight,
        background: 'rgba(10, 20, 30, 0.9)',
        border: '1px solid rgba(74, 170, 204, 0.3)',
        pointerEvents: 'auto',
        zIndex: 5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: minimapExpanded ? '0 12px 30px rgba(0,0,0,0.4)' : 'none'
      }}>
        <div style={{
          padding: '6px 10px',
          borderBottom: '1px solid rgba(74, 170, 204, 0.15)',
          fontSize: '8px',
          letterSpacing: '1px',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>AXIS MAP</span>
          <span style={{ opacity: 0.5 }}>{minimapExpanded ? 'Click to collapse' : 'Click to expand'}</span>
        </div>
        <svg
          width={minimapWidth}
          height={minimapBodyHeight}
          style={{ display: 'block' }}
        >
          {/* Quadrant labels */}
          <text x={30} y={yMin - 10} fontSize="7" fill="rgba(200, 212, 50, 0.4)" fontFamily="inherit">
            STRUCTURED
          </text>
          <text x={30} y={yMax + 20} fontSize="7" fill="rgba(200, 212, 50, 0.4)" fontFamily="inherit">
            EMERGENT
          </text>
          <text x="5" y={midY + 5} fontSize="7" fill="rgba(200, 212, 50, 0.4)" fontFamily="inherit">
            INSTR.
          </text>
          <text x={xMax - 10} y={midY + 5} fontSize="7" fill="rgba(200, 212, 50, 0.4)" fontFamily="inherit">
            EXPR.
          </text>

          {/* Grid */}
          <line x1={xMin} y1={yMin} x2={xMax} y2={yMin} stroke="rgba(74, 170, 204, 0.2)" strokeWidth="1" />
          <line x1={xMin} y1={midY} x2={xMax} y2={midY} stroke="rgba(74, 170, 204, 0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={xMin} y1={yMax} x2={xMax} y2={yMax} stroke="rgba(74, 170, 204, 0.2)" strokeWidth="1" />
          <line x1={xMin} y1={yMin} x2={xMin} y2={yMax} stroke="rgba(74, 170, 204, 0.2)" strokeWidth="1" />
          <line x1={(xMin + xMax) / 2} y1={yMin} x2={(xMin + xMax) / 2} y2={yMax} stroke="rgba(74, 170, 204, 0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={xMax} y1={yMin} x2={xMax} y2={yMax} stroke="rgba(74, 170, 204, 0.2)" strokeWidth="1" />

          {/* Center crosshair */}
          <circle cx={(xMin + xMax) / 2} cy={midY} r="3" fill="none" stroke="rgba(200, 212, 50, 0.5)" strokeWidth="1" />
          <line x1={(xMin + xMax) / 2 - 3} y1={midY} x2={(xMin + xMax) / 2 + 3} y2={midY} stroke="rgba(200, 212, 50, 0.5)" strokeWidth="1" />
          <line x1={(xMin + xMax) / 2} y1={midY - 3} x2={(xMin + xMax) / 2} y2={midY + 3} stroke="rgba(200, 212, 50, 0.5)" strokeWidth="1" />

          {/* Path points */}
          {pathPoints.slice(0, visibleCount).map((point, idx) => {
            const x = xMin + point.x * xSpan;
            const y = yMin + point.y * ySpan;
            const isActive = idx === activeIndex;
            const isVisible = idx < visibleCount;

            if (!isVisible) return null;

            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isActive ? 3 : 1.5}
                fill={isActive ? '#ffaa00' : point.role === 'user' ? '#ff6600' : '#4aaacc'}
                opacity={isActive ? 1 : 0.6}
                stroke={isActive ? '#ffffff' : 'none'}
                strokeWidth={isActive ? 1 : 0}
              />
            );
          })}

          {/* Path line connecting points */}
          {pathPoints.length > 1 && (
            <polyline
              points={pathPoints.slice(0, visibleCount).map((point) => {
                const x = xMin + point.x * xSpan;
                const y = yMin + point.y * ySpan;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="rgba(74, 170, 204, 0.3)"
              strokeWidth="1"
            />
          )}
        </svg>
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
        background: 'rgba(10, 20, 30, 0.8)',
        padding: '10px 20px',
        border: '1px solid rgba(74, 170, 204, 0.3)',
        pointerEvents: 'auto',
        borderRadius: 4,
        maxWidth: 'calc(100vw - 200px)', // Prevent overflow
        overflowX: 'auto',
        zIndex: 5
      }}>
        {pathPoints.map((_, idx) => (
          <div
            key={idx}
            onClick={() => {
              const newProgress = (idx + 1) / pathPoints.length;
              onTimelineChange(newProgress);
            }}
            style={{
              width: idx < visibleCount ? 20 : 10,
              height: 6,
              background: idx < visibleCount
                ? (idx === activeIndex ? '#ffaa00' : '#4aaacc')
                : 'rgba(74, 170, 204, 0.2)',
              transition: 'all 0.2s ease',
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scaleY(2)';
              e.currentTarget.style.background = idx < visibleCount
                ? (idx === activeIndex ? '#ffcc44' : '#7ad4e8')
                : 'rgba(74, 170, 204, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scaleY(1)';
              e.currentTarget.style.background = idx < visibleCount
                ? (idx === activeIndex ? '#ffaa00' : '#4aaacc')
                : 'rgba(74, 170, 204, 0.2)';
            }}
          />
        ))}
      </div>

    </div>
  );
}

