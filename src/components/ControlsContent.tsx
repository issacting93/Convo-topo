import React from 'react';
import type { PathPoint } from '../utils/terrain';

const THEME = {
  foreground: '#ffffff', // White text
  foregroundMuted: '#cccccc',
  accent: '#7b68ee',
  border: '#444444',
  card: '#1a1a1a',
  cardRgba: (alpha: number) => `rgba(26, 26, 26, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(68, 68, 68, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
};

interface ControlsContentProps {
  pathPoints: PathPoint[];
  timelineProgress: number;
  contourCount: number;
  showContours: boolean;
  terrainPosition: { x: number; y: number; z: number };
  cameraView: 'default' | 'side' | 'top';
  cameraDistance: number;
  cameraElevation: number;
  cameraRotation: number;
  contourColors: { minor: string; major: string; index: string };
  markerColors: { user: string; userGlow: string; assistant: string; assistantGlow: string };
  onTimelineChange: (progress: number) => void;
  onContourCountChange: (count: number) => void;
  onToggleContours: (show: boolean) => void;
  onTerrainPositionChange: (position: { x: number; y: number; z: number }) => void;
  onCameraViewChange: (view: 'default' | 'side' | 'top') => void;
  onCameraDistanceChange: (distance: number) => void;
  onCameraElevationChange: (elevation: number) => void;
  onCameraRotationChange: (rotation: number) => void;
  onContourColorsChange: (colors: { minor: string; major: string; index: string }) => void;
  onMarkerColorsChange: (colors: { user: string; userGlow: string; assistant: string; assistantGlow: string }) => void;
  onAnimate: () => void;
}

// Helper component for terrain position axis control
function TerrainPositionAxisControl({
  axis,
  value,
  min,
  max,
  onChange
}: {
  axis: 'x' | 'y' | 'z';
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [inputValue, setInputValue] = React.useState(value.toFixed(2));
  
  React.useEffect(() => {
    setInputValue(value.toFixed(2));
  }, [value]);
  
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 4,
        gap: 8
      }}>
        <label style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase',
          opacity: 0.9,
          minWidth: '20px',
          fontWeight: '500',
          color: THEME.foreground
        }}>
          {axis}:
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
              const clamped = Math.max(min, Math.min(max, numVal));
              onChange(clamped);
            }
          }}
          onBlur={(e) => {
            const numVal = parseFloat(e.target.value);
            if (isNaN(numVal)) {
              setInputValue(value.toFixed(2));
            } else {
              const clamped = Math.max(min, Math.min(max, numVal));
              setInputValue(clamped.toFixed(2));
              if (clamped !== value) {
                onChange(clamped);
              }
            }
          }}
          step="0.1"
          min={min}
          max={max}
          style={{
            width: '70px',
            padding: '4px 6px',
            fontSize: '11px',
            background: THEME.cardRgba(0.2),
            border: `1px solid ${THEME.borderRgba(0.3)}`,
            borderRadius: 4,
            color: THEME.foreground,
            fontFamily: 'monospace',
            textAlign: 'right'
          }}
        />
        <div style={{
          fontSize: '10px',
          opacity: 0.7,
          minWidth: '50px',
          textAlign: 'right',
          fontFamily: 'monospace',
          color: THEME.foreground
        }}>
          [{min}, {max}]
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step="0.05"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setInputValue(val.toFixed(2));
          onChange(val);
        }}
        style={{ 
          width: '100%', 
          accentColor: THEME.accent,
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export function ControlsContent({
  pathPoints,
  timelineProgress,
  contourCount,
  showContours,
  terrainPosition,
  cameraView,
  cameraDistance,
  cameraElevation,
  cameraRotation,
  contourColors,
  markerColors,
  onTimelineChange,
  onContourCountChange,
  onToggleContours,
  onTerrainPositionChange,
  onCameraViewChange,
  onCameraDistanceChange,
  onCameraElevationChange,
  onCameraRotationChange,
  onContourColorsChange,
  onMarkerColorsChange,
  onAnimate,
}: ControlsContentProps) {
  const visibleCount = Math.ceil(pathPoints.length * timelineProgress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Timeline Slider */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 8, 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          color: THEME.foreground
        }}>
          TIMELINE ({visibleCount}/{pathPoints.length} messages)
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={timelineProgress}
          onChange={(e) => onTimelineChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: THEME.accent, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', opacity: 0.8, marginTop: 4, color: THEME.foreground }}>
          <span>Start</span>
          <span>End</span>
        </div>
        <button
          onClick={onAnimate}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '6px 10px',
            background: THEME.accentRgba(0.2),
            border: `1px solid ${THEME.accentRgba(0.5)}`,
            borderRadius: 4,
            color: THEME.accent,
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          Animate Path
        </button>
      </div>

      {/* Contour Toggle */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <label style={{ 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          cursor: 'pointer',
          color: THEME.foreground
        }}>
          SHOW CONTOURS
        </label>
        <input
          type="checkbox"
          checked={showContours}
          onChange={(e) => onToggleContours(e.target.checked)}
          style={{
            width: 16,
            height: 16,
            accentColor: THEME.accent,
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Contour Count Slider */}
      {showContours && (
        <div style={{
          padding: '12px 16px',
          background: THEME.cardRgba(0.3),
          border: `1px solid ${THEME.borderRgba(0.2)}`,
          borderRadius: 6
        }}>
          <div style={{ 
            marginBottom: 8, 
            fontWeight: 'bold', 
            fontSize: '12px', 
            letterSpacing: '0.5px',
            opacity: 0.9,
            color: THEME.foreground
          }}>
            CONTOUR COUNT ({contourCount})
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={contourCount}
            onChange={(e) => onContourCountChange(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: THEME.accent, cursor: 'pointer' }}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 8, 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          color: THEME.foreground
        }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onTerrainPositionChange({ x: 0, y: 0, z: -2.5 });
              onCameraDistanceChange(18);
              onCameraElevationChange(30);
              onCameraRotationChange(0);
            }}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '8px 12px',
              background: THEME.accentRgba(0.2),
              border: `1px solid ${THEME.accentRgba(0.5)}`,
              borderRadius: 4,
              color: THEME.accent,
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = THEME.accentRgba(0.3);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = THEME.accentRgba(0.2);
            }}
          >
            Reset All
          </button>
          <button
            onClick={() => onTerrainPositionChange({ x: 0, y: 0, z: -2.5 })}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '8px 12px',
              background: THEME.cardRgba(0.2),
              border: `1px solid ${THEME.borderRgba(0.3)}`,
              borderRadius: 4,
              color: THEME.foreground,
              fontSize: '11px',
              fontWeight: 'normal',
              cursor: 'pointer',
              opacity: 0.8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = THEME.cardRgba(0.3);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.background = THEME.cardRgba(0.2);
            }}
          >
            Center Terrain
          </button>
        </div>
      </div>

      {/* Camera View Controls */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 8, 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          color: THEME.foreground
        }}>
          CAMERA VIEW
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['default', 'side', 'top'] as const).map((view) => (
            <button
              key={view}
              onClick={() => onCameraViewChange(view)}
              style={{
                flex: 1,
                minWidth: '60px',
                padding: '6px 10px',
                background: cameraView === view 
                  ? THEME.accentRgba(0.3) 
                  : THEME.cardRgba(0.2),
                border: `1px solid ${
                  cameraView === view 
                    ? THEME.accent 
                    : THEME.borderRgba(0.3)
                }`,
                borderRadius: 4,
                color: cameraView === view ? THEME.accent : THEME.foreground,
                fontSize: '11px',
                fontWeight: cameraView === view ? 'bold' : 'normal',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                opacity: cameraView === view ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (cameraView !== view) {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = THEME.cardRgba(0.4);
                }
              }}
              onMouseLeave={(e) => {
                if (cameraView !== view) {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.background = THEME.cardRgba(0.2);
                }
              }}
            >
              {view === 'default' ? 'Default' : view === 'side' ? 'Side' : 'Top'}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Controls */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 12, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '12px', 
            letterSpacing: '0.5px',
            opacity: 0.9,
            color: THEME.foreground
          }}>
            CAMERA CONTROLS
          </div>
          {(() => {
            const defaultDistance = 18;
            const defaultElevation = 30;
            const defaultRotation = 0;
            const isDefault = 
              Math.abs(cameraDistance - defaultDistance) < 0.1 &&
              Math.abs(cameraElevation - defaultElevation) < 0.1 &&
              Math.abs(cameraRotation - defaultRotation) < 0.01;
            return !isDefault && (
              <button
                onClick={() => {
                  onCameraDistanceChange(defaultDistance);
                  onCameraElevationChange(defaultElevation);
                  onCameraRotationChange(defaultRotation);
                }}
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  background: THEME.cardRgba(0.2),
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 3,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                Reset
              </button>
            );
          })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Distance Control */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4
            }}>
              <label style={{ fontSize: '11px', opacity: 0.9, color: THEME.foreground }}>
                {cameraView === 'default' ? 'Distance:' : 'Zoom (FOV):'}
              </label>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: THEME.accent,
                fontWeight: 'bold'
              }}>
                {cameraDistance.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={30}
              step={0.5}
              value={cameraDistance}
              onChange={(e) => onCameraDistanceChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: THEME.accent,
                cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              opacity: 0.6,
              marginTop: 2,
              color: THEME.foreground
            }}>
              <span>Close (8)</span>
              <span>Far (30)</span>
            </div>
          </div>

          {/* Elevation Control */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4
            }}>
              <label style={{ fontSize: '11px', opacity: 0.9, color: THEME.foreground }}>
                Elevation:
              </label>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: THEME.accent,
                fontWeight: 'bold'
              }}>
                {cameraElevation}°
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={85}
              step={5}
              value={cameraElevation}
              onChange={(e) => onCameraElevationChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: THEME.accent,
                cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              opacity: 0.6,
              marginTop: 2,
              color: THEME.foreground
            }}>
              <span>Low (5°)</span>
              <span>High (85°)</span>
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4
            }}>
              <label style={{ fontSize: '11px', opacity: 0.9, color: THEME.foreground }}>
                Rotation:
              </label>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: THEME.accent,
                fontWeight: 'bold'
              }}>
                {Math.round((cameraRotation * 180) / Math.PI)}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.PI * 2}
              step={Math.PI / 36}
              value={cameraRotation}
              onChange={(e) => onCameraRotationChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: THEME.accent,
                cursor: 'pointer'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              opacity: 0.6,
              marginTop: 2,
              color: THEME.foreground
            }}>
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Helpful tip */}
          <div style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: `1px solid ${THEME.borderRgba(0.1)}`,
            fontSize: '10px',
            opacity: 0.7,
            lineHeight: 1.4,
            color: THEME.foreground
          }}>
            💡 Tip: Use low elevation (5-15°) to see Z-axis peaks/valleys clearly
            <br />
            ℹ️ {cameraView === 'default' ? 'Distance controls camera distance (perspective)' : 'Zoom controls FOV size (orthographic)'}
          </div>
        </div>
      </div>

      {/* Terrain Position Controls */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 12, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '12px', 
            letterSpacing: '0.5px',
            opacity: 0.9,
            color: THEME.foreground
          }}>
            TERRAIN POSITION
          </div>
          {(() => {
            const defaultPosition = { x: 0, y: 0, z: -2.5 };
            const isDefault = 
              Math.abs(terrainPosition.x - defaultPosition.x) < 0.01 &&
              Math.abs(terrainPosition.y - defaultPosition.y) < 0.01 &&
              Math.abs(terrainPosition.z - defaultPosition.z) < 0.01;
            return !isDefault && (
              <button
                onClick={() => onTerrainPositionChange(defaultPosition)}
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  background: THEME.cardRgba(0.2),
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 3,
                  color: THEME.foreground,
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                Reset
              </button>
            );
          })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['x', 'y', 'z'] as const).map((axis) => {
            const min = axis === 'y' ? -5 : -10;
            const max = axis === 'y' ? 5 : 10;
            return (
              <TerrainPositionAxisControl
                key={axis}
                axis={axis}
                value={terrainPosition[axis]}
                min={min}
                max={max}
                onChange={(val) => onTerrainPositionChange({ ...terrainPosition, [axis]: val })}
              />
            );
          })}
        </div>
      </div>

      {/* Contour Color Controls */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 8, 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          color: THEME.foreground
        }}>
          CONTOUR COLORS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['minor', 'major', 'index'] as const).map((type) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: '11px', opacity: 0.9, minWidth: '60px', textTransform: 'capitalize', color: THEME.foreground }}>
                {type}:
              </label>
              <input
                type="color"
                value={contourColors[type]}
                onChange={(e) => onContourColorsChange({ ...contourColors, [type]: e.target.value })}
                style={{
                  width: '50px',
                  height: '30px',
                  cursor: 'pointer',
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 4
                }}
              />
              <input
                type="text"
                value={contourColors[type]}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    onContourColorsChange({ ...contourColors, [type]: e.target.value });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: THEME.cardRgba(0.2),
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  fontFamily: 'monospace'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marker Color Controls */}
      <div style={{
        padding: '12px 16px',
        background: THEME.cardRgba(0.3),
        border: `1px solid ${THEME.borderRgba(0.2)}`,
        borderRadius: 6
      }}>
        <div style={{ 
          marginBottom: 8, 
          fontWeight: 'bold', 
          fontSize: '12px', 
          letterSpacing: '0.5px',
          opacity: 0.9,
          color: THEME.foreground
        }}>
          MARKER COLORS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            { key: 'user' as const, label: 'User' },
            { key: 'userGlow' as const, label: 'User Glow' },
            { key: 'assistant' as const, label: 'Assistant' },
            { key: 'assistantGlow' as const, label: 'Assistant Glow' },
          ]).map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: '11px', opacity: 0.9, minWidth: '100px', color: THEME.foreground }}>
                {label}:
              </label>
              <input
                type="color"
                value={markerColors[key]}
                onChange={(e) => onMarkerColorsChange({ ...markerColors, [key]: e.target.value })}
                style={{
                  width: '50px',
                  height: '30px',
                  cursor: 'pointer',
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 4
                }}
              />
              <input
                type="text"
                value={markerColors[key]}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    onMarkerColorsChange({ ...markerColors, [key]: e.target.value });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: THEME.cardRgba(0.2),
                  border: `1px solid ${THEME.borderRgba(0.3)}`,
                  borderRadius: 4,
                  color: THEME.foreground,
                  fontFamily: 'monospace'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

