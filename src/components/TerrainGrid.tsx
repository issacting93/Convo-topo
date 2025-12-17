import React, { useRef, useEffect, useState } from 'react';
import { generateHeightmap, marchingSquares, type TerrainParams } from '../utils/terrain';

interface TerrainPreview {
  id: number;
  name: string;
  seed: number;
  description: string;
  heightParams?: Partial<TerrainParams>; // Terrain height parameters from classification
}

interface TerrainPreviewCardProps {
  terrain: TerrainPreview;
  onSelect: (terrain: TerrainPreview) => void;
}

function TerrainPreviewCard({ terrain, onSelect }: TerrainPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Respect prefers-reduced-motion for hover scale
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const hpKey = JSON.stringify(terrain.heightParams ?? {});
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const size = 32; // Lower resolution for preview
    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    // Render at device pixel ratio for sharpness while keeping logical size
    const logicalWidth = 256;
    const logicalHeight = 120;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    
    // Use terrain height parameters if available (from classification data)
    const heightmap = generateHeightmap(size, terrain.seed, terrain.heightParams);
    
    // Create simple 2D preview
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = logicalWidth;
    const h = logicalHeight;
    const cellW = w / size;
    const cellH = h / size;
    
    // Fill background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const raw = heightmap[y * size + x];
        const hh = Math.max(0, Math.min(1, raw));
        const brightness = Math.floor(hh * 255);
        // Dark terrain with yellow-brown tint
        ctx.fillStyle = `rgb(${Math.floor(brightness * 0.3)}, ${Math.floor(brightness * 0.3)}, ${Math.floor(brightness * 0.2)})`;
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
    }
    
    // Add contour-like overlay with yellow-green
    ctx.strokeStyle = 'rgba(200, 212, 50, 0.6)'; // Yellow-green contours
    ctx.lineWidth = 1;
    const sx = w / size;
    const sy = h / size;

    for (let i = 0; i < 5; i++) {
      const threshold = 0.2 + i * 0.15;
      const lines = marchingSquares(heightmap, size, threshold);
      
      for (const [p1, p2] of lines) {
        ctx.beginPath();
        ctx.moveTo(p1.x * sx, p1.y * sy);
        ctx.lineTo(p2.x * sx, p2.y * sy);
        ctx.stroke();
      }
    }
  }, [terrain.seed, hpKey]);
  
  return (
    <div
      style={{
        width: 280,
        height: 200,
        background: isHovered ? 'rgba(40, 40, 20, 0.95)' : 'rgba(20, 20, 15, 0.85)',
        border: isHovered ? '1px solid rgba(200, 212, 50, 0.6)' : '1px solid rgba(200, 212, 50, 0.25)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        transition: reduceMotion ? undefined : 'all 0.3s ease',
        transform: isHovered && !reduceMotion ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 8px 32px rgba(200, 212, 50, 0.2)' : 'none',
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
        borderBottom: '1px solid rgba(200, 212, 50, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{
            letterSpacing: '1px',
            fontSize: '10px',
            color: '#c8d432',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            ◉ {terrain.name}
          </span>
          {terrain.heightParams?.topicDepth !== undefined && (
            <span style={{
              fontSize: '7px',
              padding: '2px 4px',
              borderRadius: 2,
              backgroundColor: terrain.heightParams.topicDepth > 0.7
                ? 'rgba(200, 100, 50, 0.3)'
                : terrain.heightParams.topicDepth > 0.4
                  ? 'rgba(200, 150, 50, 0.3)'
                  : 'rgba(100, 100, 100, 0.3)',
              border: terrain.heightParams.topicDepth > 0.7
                ? '1px solid rgba(200, 100, 50, 0.6)'
                : terrain.heightParams.topicDepth > 0.4
                  ? '1px solid rgba(200, 150, 50, 0.6)'
                  : '1px solid rgba(100, 100, 100, 0.6)',
              color: terrain.heightParams.topicDepth > 0.7 ? '#ff8844' : '#c8d432',
              letterSpacing: 0.5,
              fontWeight: terrain.heightParams.topicDepth > 0.7 ? 'bold' : 'normal',
              fontFamily: 'monospace'
            }}>
              {terrain.heightParams.topicDepth.toFixed(2)}
            </span>
          )}
        </div>
        <span style={{
          fontSize: '8px',
          opacity: 0.5,
          color: '#c8d432',
          flexShrink: 0
        }}>
          {terrain.seed}
        </span>
      </div>
      
      {/* Preview Canvas */}
      <div style={{
        width: '100%',
        height: 120,
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0a0a'
      }}>
        <canvas
          ref={canvasRef}
          width={256}
          height={120}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Hover overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(200, 212, 50, 0.05)',
            border: '1px solid rgba(200, 212, 50, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c8d432',
            fontSize: '12px',
            letterSpacing: '2px'
          }}>
            ▶ LOAD TERRAIN
          </div>
        )}
      </div>
      
      {/* Description */}
      <div style={{
        padding: '8px 12px',
        color: '#c8d432',
        fontSize: '9px',
        lineHeight: 1.4,
        opacity: 0.6
      }}>
        {terrain.description}
      </div>
    </div>
  );
}

interface TerrainGridViewProps {
  terrains: TerrainPreview[];
  onSelectTerrain: (terrain: TerrainPreview) => void;
}

export function TerrainGridView({ terrains, onSelectTerrain }: TerrainGridViewProps) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'auto',
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace'
    }}>
      {/* Vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,8,16,0.6) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 48px',
        borderBottom: '1px solid rgba(200, 212, 50, 0.2)',
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{
              fontSize: '18px',
              letterSpacing: '3px',
              marginBottom: 8,
              color: '#c8d432'
            }}>
              CONVERSATIONAL TOPOGRAPHY
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: '#c8d432',
              opacity: 0.6
            }}>
              {terrains.length > 0
                ? `SELECT A CLASSIFIED CONVERSATION (${terrains.length} available)`
                : 'LOADING CLASSIFIED CONVERSATIONS...'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid Container */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
        padding: '48px 24px',
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        {terrains.map(terrain => (
          <TerrainPreviewCard
            key={terrain.id}
            terrain={terrain}
            onSelect={onSelectTerrain}
          />
        ))}
      </div>
      
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
          <circle cx="16" cy="16" r="4" fill="none" stroke="#c8d432" strokeWidth="1" opacity="0.6" />
          <line x1="16" y1="0" x2="16" y2="10" stroke="#c8d432" strokeWidth="1" opacity="0.4" />
          <line x1="16" y1="22" x2="16" y2="32" stroke="#c8d432" strokeWidth="1" opacity="0.4" />
          <line x1="0" y1="16" x2="10" y2="16" stroke="#c8d432" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="16" x2="32" y2="16" stroke="#c8d432" strokeWidth="1" opacity="0.4" />
        </svg>
      ))}
    </div>
  );
}