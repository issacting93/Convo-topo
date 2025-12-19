import { useState, useMemo, useCallback, useEffect } from 'react';
import { TerrainGridView } from './components/TerrainGrid';
import { ThreeScene } from './components/ThreeScene';
import { HUDOverlay } from './components/HUDOverlay';
import { generateHeightmap, generateContours, generatePathPoints, type MetricMode } from './utils/terrain';
import { type TerrainPreset } from './data/terrainPresets';
import { loadClassifiedConversations } from './data/classifiedConversations';
import {
  conversationsToTerrains,
  type ClassifiedConversation,
  getCommunicationFunction,
  getConversationStructure,
  getTerrainParams,
  getDominantHumanRole,
  getDominantAiRole,
  calculateMessagePAD
} from './utils/conversationToTerrain';
import type { TerrainParams } from './utils/terrain';

type ViewMode = 'grid' | 'single';

const MAX_MESSAGES = 30;
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
      // Calculate PAD scores for this message
      const pad = conversation.classification
        ? calculateMessagePAD(
            msg,
            conversation.classification,
            index,
            conversation.messages.length
          )
        : undefined;

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
        pad // Add PAD scores
      };
    });
}

export default function ConversationalTopography() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [seed, setSeed] = useState(42);
  const [timelineProgress, setTimelineProgress] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);
  const [contourCount, setContourCount] = useState(15);
  const [showContours, setShowContours] = useState(true);
  const metricMode: MetricMode = 'composite';
  const [classifiedConversations, setClassifiedConversations] = useState<ClassifiedConversation[]>([]);
  const [conversationTerrains, setConversationTerrains] = useState<TerrainPreset[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ClassifiedConversation | null>(null);
  const [comparisonConversation] = useState<ClassifiedConversation | null>(null);
  const [isDiffMode, setIsDiffMode] = useState(false);

  
  // Load classified conversations on mount
  useEffect(() => {
    loadClassifiedConversations().then(convs => {
      setClassifiedConversations(convs);
      const terrains = conversationsToTerrains(convs);
      setConversationTerrains(terrains);
    });
  }, []);
  
  // Always use conversation terrains if available, otherwise show empty state
  const availableTerrains = useMemo(() => {
    return conversationTerrains.length > 0
      ? conversationTerrains
      : [];
  }, [conversationTerrains]);
  
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
    () => generatePathPoints(heightmap, TERRAIN_SIZE, messages.length, messages),
    [heightmap, messages]
  );

  const comparisonMessages = useMemo(() => {
    if (!isDiffMode || !comparisonConversation) {
      return [];
    }
    return processConversationMessages(comparisonConversation, MAX_MESSAGES);
  }, [comparisonConversation, isDiffMode]);

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
  
  const handleSeedChange = useCallback((newSeed: number) => {
    setSeed(newSeed);
    setLockedPoint(null);
  }, []);
  
  const handleSelectTerrain = useCallback((terrain: TerrainPreset) => {
    setSelectedTerrainId(terrain.id);
    setSeed(terrain.seed);
    setViewMode('single');
    setLockedPoint(null);
    setTimelineProgress(1);

    // Find and set the corresponding conversation
    const convIndex = conversationTerrains.findIndex(t => t.id === terrain.id);
    const conversation = convIndex >= 0 ? classifiedConversations[convIndex] : null;
    setSelectedConversation(conversation || null);
  }, [conversationTerrains, classifiedConversations]);
  
  const handleBackToGrid = useCallback(() => {
    setViewMode('grid');
    setLockedPoint(null);
  }, []);

  const handlePointClick = useCallback((idx: number) => {
    setLockedPoint(prev => prev === idx ? null : idx);
  }, []);

  if (viewMode === 'grid') {
    return (
      <TerrainGridView
        terrains={availableTerrains}
        conversations={classifiedConversations}
        onSelectTerrain={handleSelectTerrain}
      />
    );
  }
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--background, #030213)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ThreeScene
        heightmap={heightmap}
        pathPoints={pathPoints}
        contours={contours}
        hoveredPoint={hoveredPoint}
        lockedPoint={lockedPoint}
        timelineProgress={timelineProgress}
        showContours={showContours}
        onPointHover={setHoveredPoint}
        onPointClick={handlePointClick}
      />
      
      <HUDOverlay
        pathPoints={pathPoints}
        comparisonPathPoints={comparisonPathPoints}
        hoveredPoint={hoveredPoint}
        lockedPoint={lockedPoint}
        timelineProgress={timelineProgress}
        seed={seed}
        contourCount={contourCount}
        showContours={showContours}
        metricMode={metricMode}
        isDiffMode={isDiffMode}
        onTimelineChange={setTimelineProgress}
        onSeedChange={handleSeedChange}
        onContourCountChange={setContourCount}
        onToggleContours={setShowContours}
        onToggleDiffMode={setIsDiffMode}
        onAnimate={handleAnimate}
        onBackToGrid={handleBackToGrid}
        terrainName={availableTerrains.find(t => t.id === selectedTerrainId)?.name || 'Custom'}
        selectedConversation={selectedConversation}
        comparisonConversation={comparisonConversation}
      />
    </div>
  );
}
