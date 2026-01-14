import type { Contour, PathPoint } from '../../utils/terrain';
import { useSceneSetup } from './useSceneSetup';
import { useTerrain } from './useTerrain';
import { useMarkers } from './useMarkers';
import { usePaths } from './usePaths';
import { useInteraction } from './useInteraction';
import { useAnimation } from './useAnimation';
import { SCENE_CONFIG } from './constants';

type CameraView = 'default' | 'side' | 'top';

interface PathWithColor {
    points: PathPoint[];
    color: string;
    name?: string;
    pattern?: string;
}

export interface ThreeSceneProps {
    heightmap: Float32Array;
    pathPoints: PathPoint[];
    paths?: PathWithColor[];
    contours: Contour[];
    hoveredPoint: number | null;
    lockedPoint: number | null;
    timelineProgress: number;
    showContours: boolean;
    showTerrain?: boolean;
    showMarkers?: boolean;
    showPaths?: boolean;
    coloringMode?: 'path' | 'role';
    visibleRoles?: { user: boolean; assistant: boolean };
    showDistanceLines?: boolean;
    distanceThreshold?: number;
    connectSamePatternOnly?: boolean;
    terrainPosition?: { x: number; y: number; z: number };
    cameraView?: CameraView;
    cameraDistance?: number;
    cameraElevation?: number;
    cameraRotation?: number;
    contourColors?: { minor: string; major: string; index: string };
    markerColors?: { user: string; userGlow: string; assistant: string; assistantGlow: string };
    backgroundColor?: string;
    onPointHover: (index: number | null) => void;
    onPointClick: (index: number) => void;
}

export function ThreeScene({
    heightmap,
    pathPoints,
    paths,
    contours,
    hoveredPoint,
    lockedPoint,
    timelineProgress,
    showContours,
    showTerrain = false,
    showMarkers = true,
    showPaths = true,
    coloringMode = 'path',
    visibleRoles = { user: true, assistant: true },
    showDistanceLines = false,
    distanceThreshold = 2.0,
    connectSamePatternOnly = false,
    terrainPosition = { x: 0, y: 0, z: 0 },
    cameraView = 'default',
    cameraDistance = 18,
    cameraElevation = 30,
    cameraRotation = 0,
    contourColors = { minor: '#a0d080', major: '#b0e090', index: '#c0f0a0' },
    markerColors = { user: '#4a3a8a', userGlow: '#5a4a9a', assistant: '#cc5500', assistantGlow: '#dd6600' },
    backgroundColor,
    onPointHover,
    onPointClick
}: ThreeSceneProps) {

    const terrainSize = SCENE_CONFIG.TERRAIN_SIZE;

    // 1. Scene Setup
    const {
        containerRef,
        sceneRef,
        rendererRef,
        cameraRef
    } = useSceneSetup({
        backgroundColor,
        terrainPosition,
        terrainSize
    });

    // 2. Terrain
    const { contoursRef } = useTerrain({
        sceneRef,
        heightmap,
        contours,
        showTerrain,
        showContours,
        terrainPosition,
        contourColors
    });

    // 3. Markers
    const { markersRef } = useMarkers({
        sceneRef,
        pathPoints,
        paths,
        showMarkers,
        timelineProgress,
        terrainPosition,
        markerColors
    });

    // 4. Paths
    usePaths({
        sceneRef,
        pathPoints,
        paths,
        showPaths,
        showDistanceLines,
        distanceThreshold: distanceThreshold || 2.0,
        connectSamePatternOnly,
        coloringMode: coloringMode || 'path',
        visibleRoles,
        timelineProgress,
        terrainPosition,
        markerColors
    });

    // 5. Interaction
    const { mouseRef, raycasterRef, rotationYRef } = useInteraction({
        rendererRef,
        cameraRef,
        markersRef,
        onPointClick,
        onPointHover
    });

    // 6. Animation
    useAnimation({
        sceneRef,
        rendererRef,
        cameraRef,
        markersRef,
        contoursRef,
        mouseRef,
        raycasterRef,
        rotationYRef,
        cameraView,
        cameraDistance,
        cameraElevation,
        cameraRotation,
        terrainPosition,
        onPointHover,
        hoveredPoint,
        lockedPoint
    });

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                cursor: hoveredPoint !== null ? 'pointer' : 'crosshair'
            }}
        />
    );
}
