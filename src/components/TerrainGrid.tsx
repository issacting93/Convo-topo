import { useState, useEffect, useMemo } from 'react';
import { Grid } from 'react-window';
import type { TerrainParams } from '../utils/terrain';
import { generate2DPathPoints } from '../utils/terrain';
import { getCommunicationFunction, getConversationStructure, type ClassifiedConversation } from '../utils/conversationToTerrain';
import { getClassificationStats, formatConfidence, getConfidenceColor } from '../utils/formatClassificationData';

// Theme color helpers
const getThemeColor = (varName: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

// Theme colors (dark mode)
const THEME = {
  foreground: getThemeColor('--foreground', '#f5f5f5'),
  foregroundMuted: getThemeColor('--muted-foreground', '#b5b5b5'),
  accent: getThemeColor('--chart-1', '#7b68ee'),
  accent2: getThemeColor('--chart-2', '#4ade80'),
  accent3: getThemeColor('--chart-3', '#fbbf24'),
  accent5: getThemeColor('--chart-5', '#f97316'),
  border: getThemeColor('--border', '#444444'),
  card: getThemeColor('--card', '#1a1a1a'),
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
  
  return (
    <div
      style={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{
            letterSpacing: '1px',
            fontSize: '10px',
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            ◉ {terrain.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
          fontSize: '8px',
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
        background: '#0a0a0a',
        border: '1px solid rgba(255, 255, 255, 0.1)'
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
            <line x1="0" y1="0" x2="256" y2="0" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="128" x2="256" y2="128" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="256" x2="256" y2="256" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="256" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
            <line x1="128" y1="0" x2="128" y2="256" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="256" y1="0" x2="256" y2="256" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
            
            {/* Center crosshair */}
            <circle cx="128" cy="128" r="2" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
            <line x1="126" y1="128" x2="130" y2="128" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
            <line x1="128" y1="126" x2="128" y2="130" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
            
            {/* Path line */}
            {minimapPoints.length > 1 && (
              <polyline
                points={minimapPoints.map((p: { x: number; y: number }) => {
                  const x = 20 + p.x * (256 - 40); // Map 0-1 to 20-236 (Functional left, Social right)
                  const y = 20 + p.y * (256 - 40); // Map 0-1 to 20-236 (Structured top=20, Emergent bottom=236)
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#FDD90D"
                strokeWidth="2"
                opacity="0.8"
              />
            )}
            
            {/* Path points */}
            {minimapPoints.map((point: { x: number; y: number; role: 'user' | 'assistant' }, idx: number) => {
              const x = 20 + point.x * (256 - 40);
              const y = 20 + point.y * (256 - 40); // Structured (0) at top, Emergent (1) at bottom
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
            <text x="5" y="15" fontSize="6" fill="rgba(255, 255, 255, 0.5)" fontFamily="monospace">
              FUNC
            </text>
            <text x="230" y="15" fontSize="6" fill="rgba(255, 255, 255, 0.5)" fontFamily="monospace">
              SOC
            </text>
            <text x="5" y="138" fontSize="6" fill="rgba(255, 255, 255, 0.5)" fontFamily="monospace">
              STR
            </text>
            <text x="5" y="251" fontSize="6" fill="rgba(255, 255, 255, 0.5)" fontFamily="monospace">
              EMG
            </text>
          </svg>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '8px'
          }}>
            No minimap data
          </div>
        )}
        
      </div>
      
      {/* Description */}
      <div style={{
        padding: '8px 12px',
            color: '#ffffff',
        fontSize: '9px',
        lineHeight: 1.4,
        opacity: 0.6,
        flexShrink: 0
      }}>
        {terrain.description}
      </div>
      
      {/* XYZ Coordinates Snapshot */}
      {terrain.xyz && (
        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          fontSize: '8px',
          color: '#ffffff',
          opacity: 0.7,
          fontFamily: 'monospace',
          flexShrink: 0
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ opacity: 0.5 }}>X:</span>
            <span style={{ fontWeight: 'bold' }}>{terrain.xyz.x.toFixed(2)}</span>
            <span style={{ fontSize: '7px', opacity: 0.5, marginLeft: 2 }}>
              {terrain.xyz.x < 0.4 ? 'FUNC' : terrain.xyz.x > 0.6 ? 'SOC' : 'MID'}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ opacity: 0.5 }}>Y:</span>
            <span style={{ fontWeight: 'bold' }}>{terrain.xyz.y.toFixed(2)}</span>
            <span style={{ fontSize: '7px', opacity: 0.5, marginLeft: 2 }}>
              {terrain.xyz.y < 0.4 ? 'STR' : terrain.xyz.y > 0.6 ? 'EMG' : 'MID'}
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
  // Card height breakdown:
  // - Header: ~40px
  // - Square minimap: 280px (matches card width)
  // - Description: ~40px
  // - XYZ coordinates (if present): ~30px
  // Total: ~390px minimum
  const CARD_WIDTH = 280;
  const CARD_HEIGHT = 420; // Increased to account for square minimap (280px) + all content
  const GAP = 24;
  const COLUMN_WIDTH = CARD_WIDTH + GAP;
  const ROW_HEIGHT = CARD_HEIGHT + GAP;
  const PAGINATION_HEIGHT = 60;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1400,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [currentPage, setCurrentPage] = useState(0);

  // Theme state (always dark mode)
  const [isDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark mode
  });

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
  const HEADER_HEIGHT = 70;
  const columnCount = Math.max(1, Math.floor((windowSize.width - 48) / COLUMN_WIDTH));
  
  // Calculate actual content width and center it
  const contentWidth = columnCount * COLUMN_WIDTH;
  const horizontalPadding = Math.max(24, (windowSize.width - contentWidth) / 2);
  
  // Use fixed items per page (30)
  const itemsPerPage = ITEMS_PER_PAGE;

  // Paginate terrains
  const totalPages = Math.ceil(terrains.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, terrains.length);
  const paginatedTerrains = terrains.slice(startIndex, endIndex);
  const paginatedConversations = conversations.slice(startIndex, endIndex);
  
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
      background: 'var(--background, #030213)',
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(26, 26, 26, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        height: HEADER_HEIGHT
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
              color: '#ffffff'
            }}>
              CONVERSATIONAL TOPOGRAPHY
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: '#ffffff',
              opacity: 0.6
            }}>
              {terrains.length > 0
                ? `SELECT A CLASSIFIED CONVERSATION (${terrains.length} total${totalPages > 1 ? `, page ${currentPage + 1}/${totalPages}` : ''}) • Virtualized Grid`
                : 'LOADING CLASSIFIED CONVERSATIONS...'}
            </div>
          </div>

        
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
            color: 'rgba(255, 255, 255, 0.3)',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(26, 26, 26, 0.9)',
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
            color: '#ffffff',
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