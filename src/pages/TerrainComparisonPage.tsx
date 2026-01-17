import { useMemo, useCallback, useEffect, useState } from 'react';
import { ThreeScene } from '../components/ThreeScene';
import { generateHeightmap, generateContours, generatePathPoints, type MetricMode } from '../utils/terrain';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
import { Navigation } from '../components/Navigation';
import { useConversationStore } from '../store/useConversationStore';
import {
  getCommunicationFunction,
  getConversationStructure,
  getTerrainParams,
  getDominantHumanRole,
  getDominantAiRole,
  calculateMessagePAD,
  calculateUserAuthority
} from '../utils/conversationToTerrain';
import type { TerrainParams } from '../utils/terrain';

const MAX_MESSAGES = 100; // Increased to accommodate longer conversations
const TERRAIN_SIZE = 64;

// Helper function to process conversation messages for visualization
function processConversationMessages(conversation: ClassifiedConversation | null, maxMessages: number) {
  if (!conversation || !conversation.messages) {
    return [];
  }

  const commFunc = getCommunicationFunction(conversation);
  const convStruct = getConversationStructure(conversation);
  const dominantHumanRole = getDominantHumanRole(conversation);
  const dominantAiRole = getDominantAiRole(conversation);

  return conversation.messages
    .slice(0, maxMessages)
    .map((msg, index) => {
      // Use PAD from data if available, otherwise calculate it
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
        humanRole: dominantHumanRole?.role,
        aiRole: dominantAiRole?.role,
        roleConfidence: msg.role === 'user'
          ? dominantHumanRole?.value
          : dominantAiRole?.value,
        pad
      };
    });
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

export function TerrainComparisonPage() {
  const conversations = useConversationStore(state => state.conversations);

  // Conversation selection
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Visibility controls
  const [showTerrain, setShowTerrain] = useState(false);
  const [showContours, setShowContours] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPaths, setShowPaths] = useState(true);

  // Scene state
  const [seed, setSeed] = useState(42);
  const [timelineProgress] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);
  const [contourCount] = useState(15);
  const metricMode: MetricMode = 'composite';
  const [selectedConversation, setSelectedConversation] = useState<ClassifiedConversation | null>(null);
  const [terrainPosition] = useState({ x: 0, y: 0, z: -2.5 });
  const [cameraView] = useState<'default' | 'side' | 'top'>('default');
  const [contourColors] = useState({
    minor: '#303030',
    major: '#202020',
    index: '#101010'
  });
  const [markerColors] = useState({
    user: '#4a3a8a',
    userGlow: '#5a4a9a',
    assistant: '#cc5500',
    assistantGlow: '#dd6600'
  });
  const [cameraDistance] = useState(18);
  const [cameraElevation] = useState(30);
  const [cameraRotation] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize with first conversation if available
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Update selected conversation when ID changes
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find(c => c.id === selectedConversationId);
      if (conv) {
        setSelectedConversation(conv);
        // Use conversation ID as seed for consistent terrain generation
        // Create hash from ID string
        let hash = 0;
        for (let i = 0; i < conv.id.length; i++) {
          const char = conv.id.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        const seedValue = Math.abs(hash % 999) + 1;
        setSeed(seedValue);
      } else {
        setSelectedConversation(null);
      }
    } else {
      setSelectedConversation(null);
    }
  }, [selectedConversationId, conversations]);

  // Get terrain parameters from selected conversation for heightmap generation
  const terrainParams = useMemo((): Partial<TerrainParams> | undefined => {
    if (selectedConversation) {
      return {
        ...getTerrainParams(selectedConversation),
        metricMode
      };
    }
    return { metricMode };
  }, [selectedConversation, metricMode]);

  const heightmap = useMemo(() => {
    return generateHeightmap(TERRAIN_SIZE, seed, terrainParams);
  }, [seed, terrainParams]);

  const messages = useMemo(() => {
    return processConversationMessages(selectedConversation, MAX_MESSAGES);
  }, [selectedConversation]);

  const pathPoints = useMemo(
    () => {
      const authorityScore = selectedConversation ? calculateUserAuthority(selectedConversation) : undefined;
      return generatePathPoints(heightmap, TERRAIN_SIZE, messages.length, messages, { authorityScore });
    },
    [heightmap, messages, selectedConversation]
  );

  const contours = useMemo(
    () => generateContours(heightmap, TERRAIN_SIZE, contourCount),
    [heightmap, contourCount]
  );

  const handlePointClick = useCallback((idx: number) => {
    setLockedPoint(prev => prev === idx ? null : idx);
  }, []);

  // Get conversation name for display
  const conversationName = useMemo(() => {
    if (!selectedConversation) return 'No conversation selected';
    // Use a readable format of the ID
    return selectedConversation.id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [selectedConversation]);

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
      {/* Control Panel */}
      <div style={{
        padding: '16px 20px',
        background: THEME.card,
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Navigation />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          {/* Conversation selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '14px', color: THEME.foregroundMuted, fontWeight: 500 }}>
              Conversation:
            </label>
            <select
              value={selectedConversationId || ''}
              onChange={(e) => setSelectedConversationId(e.target.value)}
              style={{
                padding: '8px 12px',
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: 4,
                color: THEME.foreground,
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: 200
              }}
            >
              {conversations.map((conv) => {
                const name = conv.id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <option key={conv.id} value={conv.id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Visibility toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
            <label style={{ fontSize: '12px', color: THEME.foregroundMuted, fontWeight: 600, letterSpacing: '0.5px' }}>
              VISIBILITY:
            </label>

            {[
              { key: 'terrain', label: 'Terrain', state: showTerrain, setter: setShowTerrain },
              { key: 'contours', label: 'Contours', state: showContours, setter: setShowContours },
              { key: 'markers', label: 'Markers', state: showMarkers, setter: setShowMarkers },
              { key: 'paths', label: 'Paths', state: showPaths, setter: setShowPaths },
            ].map(({ key, label, state, setter }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: THEME.foreground,
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: 'pointer'
                  }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '8px 16px',
              background: isExpanded ? THEME.accentRgba(0.2) : THEME.borderRgba(0.1),
              border: `1px solid ${isExpanded ? THEME.accent : THEME.border}`,
              borderRadius: 4,
              color: isExpanded ? THEME.accent : THEME.foreground,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {isExpanded ? '↗ Collapse' : '⬛ Expand'}
          </button>
        </div>
      </div>

      {/* Scene Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: isExpanded ? '100%' : 'calc(100vh - 80px)',
        overflow: 'hidden',
        minHeight: 400,
        minWidth: 400
      }}>
        <ThreeScene
          heightmap={heightmap}
          pathPoints={pathPoints}
          contours={contours}
          hoveredPoint={hoveredPoint}
          lockedPoint={lockedPoint}
          terrainPosition={terrainPosition}
          cameraView={cameraView}
          cameraDistance={cameraDistance}
          cameraElevation={cameraElevation}
          cameraRotation={cameraRotation}
          contourColors={contourColors}
          markerColors={markerColors}
          timelineProgress={timelineProgress}
          showContours={showContours}
          showTerrain={showTerrain}
          showMarkers={showMarkers}
          showPaths={showPaths}
          onPointHover={setHoveredPoint}
          onPointClick={handlePointClick}
        />
      </div>

      {/* Info overlay (optional) */}
      {selectedConversation && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: THEME.cardRgba(0.9),
          border: `1px solid ${THEME.border}`,
          borderRadius: 4,
          padding: '12px 16px',
          fontSize: '12px',
          color: THEME.foreground,
          zIndex: 5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{conversationName}</div>
          <div style={{ color: THEME.foregroundMuted }}>
            {messages.length} messages • {pathPoints.length} path points
          </div>
        </div>
      )}
    </div>
  );
}

