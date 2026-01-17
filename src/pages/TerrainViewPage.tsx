import { useMemo, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThreeScene } from '../components/ThreeScene';
import { HUDOverlay } from '../components/HUDOverlay';
import { generateContours, generatePathPoints, generateDensityHeightmap, type MetricMode } from '../utils/terrain';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
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

export function TerrainViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const terrainId = id;

  const terrains = useConversationStore(state => state.terrains);
  const conversations = useConversationStore(state => state.conversations);
  const loading = useConversationStore(state => state.loading);

  const [timelineProgress, setTimelineProgress] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);
  const [contourCount, setContourCount] = useState(15);
  const [showContours, setShowContours] = useState(true);
  const metricMode: MetricMode = 'composite';
  const [selectedConversation, setSelectedConversation] = useState<ClassifiedConversation | null>(null);
  const [comparisonConversation] = useState<ClassifiedConversation | null>(null);
  const [terrainPosition, setTerrainPosition] = useState({ x: 0, y: 0, z: -2.5 });
  const [cameraView, setCameraView] = useState<'default' | 'side' | 'top'>('default');
  const [contourColors, setContourColors] = useState({
    minor: '#404040',
    major: '#808080',
    index: '#ffffff'
  });
  const [markerColors, setMarkerColors] = useState({
    user: '#4a3a8a',
    userGlow: '#5a4a9a',
    assistant: '#cc5500',
    assistantGlow: '#dd6600'
  });
  const [cameraDistance, setCameraDistance] = useState(18);
  const [cameraElevation, setCameraElevation] = useState(30);
  const [cameraRotation, setCameraRotation] = useState(0);

  // Find terrain and conversation by ID (support both numeric ID and string conversationId)
  const selectedTerrain = useMemo(() => {
    if (!terrainId) return null;

    // Try to find by conversationId first (exact string match)
    const byConvId = terrains.find(t => t.conversationId === terrainId);
    if (byConvId) return byConvId;

    // Fallback: try parsing as number for legacy/index IDs
    const numericId = parseInt(terrainId, 10);
    if (!isNaN(numericId)) {
      return terrains.find(t => t.id === numericId) || null;
    }

    return null;
  }, [terrainId, terrains]);

  useEffect(() => {
    // If loading, wait. If done loading and not found, redirect.
    if (!loading) {
      if (selectedTerrain) {
        const convIndex = terrains.findIndex(t => t.id === selectedTerrain.id);
        const conversation = convIndex >= 0 ? conversations[convIndex] : null;
        setSelectedConversation(conversation || null);
      } else if (terrainId !== null && terrains.length > 0) {
        // Terrain not found, redirect to grid
        navigate('/');
      }
    }
  }, [selectedTerrain, terrainId, terrains, conversations, navigate, loading]);

  // Use Global Density Heatmap as background
  // This helps visualize where this conversation fits in the broader landscape
  const globalPathsSample = useMemo(() => {
    // Sample diverse conversations for the background context
    // We limit to ~50 for performance while maintaining global structure
    return conversations
      .filter((_, i) => i % Math.max(1, Math.floor(conversations.length / 50)) === 0)
      .map(c => {
        const msgs = processConversationMessages(c, MAX_MESSAGES);
        return {
          points: generatePathPoints(new Float32Array(0), TERRAIN_SIZE, msgs.length, msgs) // Dummy heightmap for pre-generation
        };
      });
  }, [conversations]);

  const heightmap = useMemo(() => {
    // Generate density map from global sample
    return generateDensityHeightmap(TERRAIN_SIZE, globalPathsSample);
  }, [globalPathsSample]);

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

  const comparisonMessages = useMemo(() => {
    return [];
  }, []);

  const comparisonPathPoints = useMemo(
    () => generatePathPoints(heightmap, TERRAIN_SIZE, comparisonMessages.length, comparisonMessages),
    [heightmap, comparisonMessages]
  );

  const contours = useMemo(
    () => generateContours(heightmap, TERRAIN_SIZE, contourCount),
    [heightmap, contourCount]
  );

  const handleAnimate = useCallback(() => {
    setTimelineProgress(0);
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 3000, 1);
      setTimelineProgress(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const handleBackToGrid = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handlePointClick = useCallback((idx: number) => {
    setLockedPoint(prev => prev === idx ? null : idx);
  }, []);

  const handleConversationChange = useCallback((conversationId: string) => {
    // Find the conversation by ID or index
    // conversationId could be the actual ID or an index string
    let conversationIndex = conversations.findIndex(c => c.id === conversationId);

    // If not found by ID, try parsing as index
    if (conversationIndex < 0) {
      const parsedIndex = parseInt(conversationId, 10);
      if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < conversations.length) {
        conversationIndex = parsedIndex;
      }
    }

    // Find corresponding terrain (terrains and conversations are in the same order)
    if (conversationIndex >= 0 && conversationIndex < terrains.length) {
      const terrain = terrains[conversationIndex];
      if (terrain) {
        navigate(`/terrain/${terrain.id}`);
      }
    }
  }, [conversations, terrains, navigate]);

  if (!selectedTerrain) {
    return null; // Will redirect in useEffect
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: 0,
        width: '100%',
        height: '100%'
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
          showPathPoints={true} // Enable nodes for single view
          onPointHover={setHoveredPoint}
          onPointClick={handlePointClick}
          backgroundColor="#000000"
        />
      </div>

      <HUDOverlay
        pathPoints={pathPoints}
        comparisonPathPoints={comparisonPathPoints}
        hoveredPoint={hoveredPoint}
        lockedPoint={lockedPoint}
        timelineProgress={timelineProgress}
        onTimelineChange={setTimelineProgress}
        onBackToGrid={handleBackToGrid}
        terrainName={selectedTerrain?.name || 'Unknown'}
        selectedConversation={selectedConversation}
        comparisonConversation={comparisonConversation}
        cameraView={cameraView}
        onCameraViewChange={setCameraView}
        onAnimate={handleAnimate}
        onPointClick={handlePointClick}
        onConversationChange={handleConversationChange}
        contourCount={contourCount}
        showContours={showContours}
        terrainPosition={terrainPosition}
        cameraDistance={cameraDistance}
        cameraElevation={cameraElevation}
        cameraRotation={cameraRotation}
        contourColors={contourColors}
        markerColors={markerColors}
        onContourCountChange={setContourCount}
        onToggleContours={setShowContours}
        onTerrainPositionChange={setTerrainPosition}
        onCameraDistanceChange={setCameraDistance}
        onCameraElevationChange={setCameraElevation}
        onCameraRotationChange={setCameraRotation}
        onContourColorsChange={setContourColors}
        onMarkerColorsChange={setMarkerColors}
      />
    </div>
  );
}
