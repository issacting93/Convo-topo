import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TerrainGridView } from './components/TerrainGrid';
import { ThreeScene } from './components/ThreeScene';
import { HUDOverlay } from './components/HUDOverlay';
import { generateHeightmap, generateContours, generatePathPoints, type MetricMode } from './utils/terrain';
import { TERRAIN_PRESETS, type TerrainPreset } from './data/terrainPresets';
import { loadClassifiedConversations } from './data/classifiedConversations';
import {
  conversationsToTerrains,
  type ClassifiedConversation,
  getCommunicationFunction,
  getConversationStructure,
  getTerrainParams,
  getDominantHumanRole,
  getDominantAiRole
} from './utils/conversationToTerrain';
import type { TerrainParams } from './utils/terrain';

type ViewMode = 'grid' | 'single';

export default function ConversationalTopography() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [seed, setSeed] = useState(42);
  const [timelineProgress, setTimelineProgress] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [lockedPoint, setLockedPoint] = useState<number | null>(null);
  const [contourCount, setContourCount] = useState(15);
  const [showContours, setShowContours] = useState(true);
  const [metricMode, setMetricMode] = useState<MetricMode>('depth');
  const [classifiedConversations, setClassifiedConversations] = useState<ClassifiedConversation[]>([]);
  const [conversationTerrains, setConversationTerrains] = useState<TerrainPreset[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ClassifiedConversation | null>(null);
  const [comparisonConversation, setComparisonConversation] = useState<ClassifiedConversation | null>(null);
  const [isDiffMode, setIsDiffMode] = useState(false);

  const size = 64;
  const terrainPresets = useMemo<TerrainPreset[]>(() => TERRAIN_PRESETS, []);
  
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
    return generateHeightmap(size, seed, terrainParams);
  }, [seed, size, terrainParams]);

  // SAFETY LIMIT: Never load more than 30 messages to prevent rendering issues
  const MAX_MESSAGES = 30;
  const messages = useMemo(() => {
    // Use messages from selected classified conversation
    if (selectedConversation && selectedConversation.messages) {
      const commFunc = getCommunicationFunction(selectedConversation);
      const convStruct = getConversationStructure(selectedConversation);
      
      // Get dominant roles for the conversation (used for visual encoding)
      const dominantHumanRole = getDominantHumanRole(selectedConversation);
      const dominantAiRole = getDominantAiRole(selectedConversation);
      
      return selectedConversation.messages
        .slice(0, MAX_MESSAGES)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          communicationFunction: commFunc,
          conversationStructure: convStruct,
          humanRole: dominantHumanRole?.role,
          aiRole: dominantAiRole?.role,
          roleConfidence: msg.role === 'user'
            ? dominantHumanRole?.value
            : dominantAiRole?.value
        }));
    }
    
    // No conversation selected - return empty array
    return [];
  }, [selectedConversation]);
  
  const pathPoints = useMemo(
    () => generatePathPoints(heightmap, size, messages.length, messages),
    [heightmap, size, messages]
  );

  // Comparison path points for diff mode
  const comparisonMessages = useMemo(() => {
    if (!isDiffMode || !comparisonConversation || !comparisonConversation.messages) {
      return [];
    }

    const commFunc = getCommunicationFunction(comparisonConversation);
    const convStruct = getConversationStructure(comparisonConversation);
    const dominantHumanRole = getDominantHumanRole(comparisonConversation);
    const dominantAiRole = getDominantAiRole(comparisonConversation);

    return comparisonConversation.messages
      .slice(0, MAX_MESSAGES)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        communicationFunction: commFunc,
        conversationStructure: convStruct,
        humanRole: dominantHumanRole?.role,
        aiRole: dominantAiRole?.role,
        roleConfidence: msg.role === 'user'
          ? dominantHumanRole?.value
          : dominantAiRole?.value
      }));
  }, [comparisonConversation, isDiffMode]);

  const comparisonPathPoints = useMemo(
    () => generatePathPoints(heightmap, size, comparisonMessages.length, comparisonMessages),
    [heightmap, size, comparisonMessages]
  );
  const contours = useMemo(
    () => generateContours(heightmap, size, contourCount),
    [heightmap, size, contourCount]
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
    if (conversationTerrains.length > 0) {
      const convIndex = conversationTerrains.findIndex(t => t.id === terrain.id);
      if (convIndex >= 0 && classifiedConversations[convIndex]) {
        setSelectedConversation(classifiedConversations[convIndex]);
        setTimelineProgress(1);
      } else {
        setSelectedConversation(null);
      }
    } else {
      setSelectedConversation(null);
    }
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
        onSelectTerrain={handleSelectTerrain}
      />
    );
  }
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ThreeScene
        heightmap={heightmap}
        pathPoints={pathPoints}
        comparisonPathPoints={isDiffMode ? comparisonPathPoints : undefined}
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
        onMetricModeChange={setMetricMode}
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
