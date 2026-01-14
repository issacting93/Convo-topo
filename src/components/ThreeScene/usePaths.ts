import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { SCENE_CONFIG, MARKER_CONFIG } from './constants';
import { calculatePathPadChanges, getPadChangeColor } from '../../utils/padPathColors';
import type { PathPoint } from '../../utils/terrain';

interface UsePathsProps {
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
    pathPoints: PathPoint[];
    paths?: any[]; // PathWithColor
    showPaths: boolean;
    showDistanceLines: boolean;
    distanceThreshold: number;
    connectSamePatternOnly: boolean;
    coloringMode: 'path' | 'role';
    visibleRoles: { user: boolean; assistant: boolean };
    timelineProgress: number;
    terrainPosition: { x: number; y: number; z: number };
    markerColors: { user: string; userGlow: string; assistant: string; assistantGlow: string };
}

export function usePaths({
    sceneRef,
    pathPoints,
    paths,
    showPaths,
    showDistanceLines,
    distanceThreshold,
    connectSamePatternOnly,
    coloringMode,
    visibleRoles,
    timelineProgress,
    terrainPosition,
    markerColors
}: UsePathsProps) {
    const pathLineRef = useRef<Line2 | null>(null);
    const pathLinesRef = useRef<Line2[]>([]);
    const distanceLinesRef = useRef<THREE.LineSegments[]>([]);

    const terrainSize = SCENE_CONFIG.TERRAIN_SIZE;
    const terrainHeight = SCENE_CONFIG.TERRAIN_HEIGHT;

    // Distance Lines Logic
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        // Clear old distance lines
        distanceLinesRef.current.forEach(line => {
            scene.remove(line);
            line.geometry.dispose();
            if (line.material instanceof THREE.Material) {
                line.material.dispose();
            }
        });
        distanceLinesRef.current = [];

        if (!showDistanceLines) return;

        // Collect all points from all visible paths
        const allPoints: Array<{
            position: THREE.Vector3;
            pathIndex: number;
            pointIndex: number;
            pattern?: string;
        }> = [];

        if (paths && paths.length > 0) {
            paths.forEach((pathData, pathIdx) => {
                if (!pathData.points || pathData.points.length === 0) return;

                const visibleCount = timelineProgress >= 0.99
                    ? pathData.points.length
                    : Math.ceil(pathData.points.length * timelineProgress);
                const visiblePoints = pathData.points.slice(0, visibleCount);

                visiblePoints.forEach((p: PathPoint, pointIdx: number) => {
                    let yPosition: number;
                    if (p.pad?.emotionalIntensity !== undefined) {
                        yPosition = p.pad.emotionalIntensity * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else if (p.padHeight !== undefined) {
                        yPosition = p.padHeight * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else {
                        yPosition = p.height * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    }

                    const x = (p.x - 0.5) * terrainSize + terrainPosition.x;
                    const y = yPosition + terrainPosition.y;
                    const z = (p.y - 0.5) * terrainSize + terrainPosition.z;

                    allPoints.push({
                        position: new THREE.Vector3(x, y, z),
                        pathIndex: pathIdx,
                        pointIndex: pointIdx,
                        pattern: pathData.pattern
                    });
                });
            });
        }

        // Find pairs
        const lineSegments: THREE.Vector3[] = [];
        const lineColors: number[] = [];
        const thresholdSquared = distanceThreshold * distanceThreshold;
        const tempColor1 = new THREE.Color();
        const tempColor2 = new THREE.Color();

        for (let i = 0; i < allPoints.length; i++) {
            for (let j = i + 1; j < allPoints.length; j++) {
                const p1 = allPoints[i].position;
                const p2 = allPoints[j].position;

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dz = p2.z - p1.z;
                const distSquared = dx * dx + dy * dy + dz * dz;

                const patternsMatch = !connectSamePatternOnly || (allPoints[i].pattern && allPoints[j].pattern && allPoints[i].pattern === allPoints[j].pattern);

                if (allPoints[i].pathIndex !== allPoints[j].pathIndex && patternsMatch && distSquared <= thresholdSquared) {
                    lineSegments.push(p1, p2);

                    const color1Str = paths![allPoints[i].pathIndex].color;
                    const color2Str = paths![allPoints[j].pathIndex].color;

                    tempColor1.set(color1Str);
                    tempColor2.set(color2Str);

                    lineColors.push(tempColor1.r, tempColor1.g, tempColor1.b);
                    lineColors.push(tempColor2.r, tempColor2.g, tempColor2.b);
                }
            }
        }

        if (lineSegments.length > 0) {
            const geometry = new THREE.BufferGeometry().setFromPoints(lineSegments);
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.4,
                linewidth: 1
            });

            const lineSegmentsObj = new THREE.LineSegments(geometry, material);
            lineSegmentsObj.renderOrder = 500;
            scene.add(lineSegmentsObj);
            distanceLinesRef.current.push(lineSegmentsObj);
        }
    }, [paths, showDistanceLines, distanceThreshold, connectSamePatternOnly, timelineProgress, terrainSize, terrainHeight, terrainPosition, sceneRef]);


    // Path Rendering Logic
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        // Clear old paths
        if (pathLineRef.current) {
            scene.remove(pathLineRef.current);
            pathLineRef.current.geometry.dispose();
            if (pathLineRef.current.material instanceof THREE.Material) {
                pathLineRef.current.material.dispose();
            }
        }

        pathLinesRef.current.forEach(pathLine => {
            if (pathLine) {
                scene.remove(pathLine);
                pathLine.geometry.dispose();
                if (pathLine.material instanceof LineMaterial) {
                    pathLine.material.dispose();
                }
            }
        });
        pathLinesRef.current = [];

        // Render multiple paths
        if (showPaths && paths && paths.length > 0) {
            paths.forEach((pathData: any, _pathIdx: number) => {
                // ... (Copy loop logic from original file)
                if (pathData.points.length < 2) return;

                const visibleCount = timelineProgress >= 0.99
                    ? pathData.points.length
                    : Math.ceil(pathData.points.length * timelineProgress);
                const visiblePoints = pathData.points.slice(0, visibleCount);
                if (visiblePoints.length < 2) return;

                const positions: number[] = [];
                const colors: number[] = [];

                // Color parsing logic (simplified/copied)
                let r: number, g: number, b: number;
                if (pathData.color.startsWith('rgba')) {
                    // ... regex parse ...
                    const match = pathData.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                    if (match) {
                        r = parseInt(match[1], 10) / 255;
                        g = parseInt(match[2], 10) / 255;
                        b = parseInt(match[3], 10) / 255;
                    } else {
                        r = 0; g = 0; b = 0;
                    }
                } else {
                    const hex = pathData.color.replace('#', '');
                    r = parseInt(hex.substring(0, 2), 16) / 255;
                    g = parseInt(hex.substring(2, 4), 16) / 255;
                    b = parseInt(hex.substring(4, 6), 16) / 255;
                }

                const userColorHex = markerColors.user.replace('#', '');
                const userR = parseInt(userColorHex.substring(0, 2), 16) / 255;
                const userG = parseInt(userColorHex.substring(2, 4), 16) / 255;
                const userB = parseInt(userColorHex.substring(4, 6), 16) / 255;

                const aiColorHex = markerColors.assistant.replace('#', '');
                const aiR = parseInt(aiColorHex.substring(0, 2), 16) / 255;
                const aiG = parseInt(aiColorHex.substring(2, 4), 16) / 255;
                const aiB = parseInt(aiColorHex.substring(4, 6), 16) / 255;

                const useVertexColors = coloringMode === 'role';

                visiblePoints.forEach((p: PathPoint) => {
                    if (p.role === 'user' && !visibleRoles.user) return; // Note: continue doesn't work in forEach, use return
                    if (p.role === 'assistant' && !visibleRoles.assistant) return;

                    let yPosition: number;
                    if (p.pad?.emotionalIntensity !== undefined) {
                        yPosition = p.pad.emotionalIntensity * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else if (p.padHeight !== undefined) {
                        yPosition = p.padHeight * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else {
                        yPosition = p.height * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    }

                    const x = (p.x - 0.5) * terrainSize + terrainPosition.x;
                    const y = yPosition + terrainPosition.y;
                    const z = (p.y - 0.5) * terrainSize + terrainPosition.z;

                    if (isNaN(x) || isNaN(y) || isNaN(z)) return;

                    positions.push(x, y, z);

                    if (useVertexColors) {
                        if (p.role === 'user') {
                            colors.push(userR, userG, userB);
                        } else {
                            colors.push(aiR, aiG, aiB);
                        }
                    } else {
                        colors.push(r, g, b);
                    }
                });

                if (positions.length < 6) return; // Need at least 2 points (6 coords)

                const pathGeom = new LineGeometry();
                pathGeom.setPositions(positions);
                pathGeom.setColors(colors);

                const pathMat = new LineMaterial({
                    color: useVertexColors ? new THREE.Color(0xffffff) : new THREE.Color(r, g, b),
                    vertexColors: useVertexColors,
                    linewidth: 1, // Thin paths
                    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                    dashed: false,
                    alphaToCoverage: false,
                    worldUnits: false, // Important for thin lines? 
                    // ... other props
                });

                const pathLine = new Line2(pathGeom, pathMat);
                pathLine.renderOrder = 1000;
                scene.add(pathLine);
                pathLinesRef.current.push(pathLine);

                // Note: The resize handler for resolution update needs to be managed.
                // In separate hook, we can add global listener or passed down.
                const updateResolution = () => {
                    if (pathMat) pathMat.resolution.set(window.innerWidth, window.innerHeight);
                };
                window.addEventListener('resize', updateResolution);
                (pathLine as any)._cleanup = () => window.removeEventListener('resize', updateResolution);
            });
        }

        // Render Single Path (Fallback)
        else if (showPaths && pathPoints.length >= 2) {
            const visibleCount = timelineProgress >= 0.99
                ? pathPoints.length
                : Math.ceil(pathPoints.length * timelineProgress);
            const visiblePoints = pathPoints.slice(0, visibleCount);

            if (visiblePoints.length >= 2) {
                const padChanges = calculatePathPadChanges(visiblePoints);
                const positions: number[] = [];
                const colors: number[] = [];

                visiblePoints.forEach((p, i) => {
                    if (!p) return;
                    // ... same Y calc ...
                    let yPosition: number;
                    if (p.pad?.emotionalIntensity !== undefined) {
                        yPosition = p.pad.emotionalIntensity * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else if (p.padHeight !== undefined) {
                        yPosition = p.padHeight * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else if (p.height !== undefined) {
                        yPosition = p.height * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
                    } else {
                        yPosition = MARKER_CONFIG.PATH_Y_OFFSET;
                    }
                    const x = (p.x - 0.5) * terrainSize + terrainPosition.x;
                    const y = yPosition + terrainPosition.y;
                    const z = (p.y - 0.5) * terrainSize + terrainPosition.z;

                    if (isNaN(x) || isNaN(y) || isNaN(z)) return;

                    positions.push(x, y, z);

                    const change = i > 0 ? padChanges[i - 1] : 0;
                    const color = getPadChangeColor(change);
                    colors.push(color.r, color.g, color.b);
                });

                if (positions.length < 6) return;

                const pathGeom = new LineGeometry();
                pathGeom.setPositions(positions);
                pathGeom.setColors(colors);

                const pathMat = new LineMaterial({
                    vertexColors: true,
                    linewidth: 2,
                    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                    dashed: false,
                    alphaToCoverage: true,
                    worldUnits: false
                });

                const pathLine = new Line2(pathGeom, pathMat);
                scene.add(pathLine);
                pathLineRef.current = pathLine;

                const updateResolution = () => {
                    if (pathMat) pathMat.resolution.set(window.innerWidth, window.innerHeight);
                };
                window.addEventListener('resize', updateResolution);
                (pathLine as any)._cleanup = () => window.removeEventListener('resize', updateResolution);
            }
        }

        return () => {
            // Cleanup listeners attached to objects?
            // Since we rebuild paths on change, we should cleanup the listeners.
            pathLinesRef.current.forEach((pl: any) => {
                if (pl._cleanup) pl._cleanup();
            });
            if (pathLineRef.current && (pathLineRef.current as any)._cleanup) {
                (pathLineRef.current as any)._cleanup();
            }
        }

    }, [pathPoints, paths, showPaths, timelineProgress, terrainSize, terrainHeight, terrainPosition, markerColors, coloringMode, visibleRoles, sceneRef]);

    return { pathLineRef, pathLinesRef, distanceLinesRef };
}
