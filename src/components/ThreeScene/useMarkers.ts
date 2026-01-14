import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SCENE_CONFIG, MARKER_CONFIG } from './constants';
import { COLORS } from '../../utils/constants';
import type { PathPoint } from '../../utils/terrain';

// Helper function to create a marker group
function createMarkerGroup(
    point: PathPoint,
    idx: number,
    terrainSize: number,
    terrainHeight: number,
    terrainPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    markerColors?: { user: string; userGlow: string; assistant: string; assistantGlow: string }
): { group: THREE.Group; head: THREE.Mesh; glow: THREE.Mesh; pole: THREE.Line; base: THREE.Mesh; hitbox: THREE.Mesh; baseY: number } {
    const group = new THREE.Group();

    const worldX = (point.x - 0.5) * terrainSize + terrainPosition.x;
    const worldZ = (point.y - 0.5) * terrainSize + terrainPosition.z;

    let worldY: number;
    if (point.pad?.emotionalIntensity !== undefined) {
        worldY = point.pad.emotionalIntensity * terrainHeight;
    } else if (point.padHeight !== undefined) {
        worldY = point.padHeight * terrainHeight;
    } else {
        worldY = point.height * terrainHeight;
    }

    worldY += terrainPosition.y;

    const userMarker = markerColors?.user || '#4a3a8a';
    const assistantMarker = markerColors?.assistant || '#cc5500';

    let markerColor: string;

    if (point.role === 'user') {
        markerColor = userMarker;
    } else if (point.role === 'assistant') {
        markerColor = assistantMarker;
    } else {
        const isFunctional = point.communicationFunction < 0.5;
        markerColor = isFunctional ? userMarker : assistantMarker;
    }

    // Vertical pole
    const poleGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, MARKER_CONFIG.POLE_HEIGHT, 0)
    ]);
    const poleMat = new THREE.LineBasicMaterial({
        color: markerColor,
        transparent: false,
        opacity: 1.0
    });
    const pole = new THREE.Line(poleGeom, poleMat);
    group.add(pole);

    // Marker head
    const headRadius = MARKER_CONFIG.HEAD_RADIUS * 1.5;
    const headGeom = new THREE.SphereGeometry(
        headRadius,
        MARKER_CONFIG.HEAD_SEGMENTS.width,
        MARKER_CONFIG.HEAD_SEGMENTS.height
    );
    const headMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: false,
        opacity: 1.0
    });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = MARKER_CONFIG.POLE_HEIGHT;
    group.add(head);

    // Dummy glow (compatibility)
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshBasicMaterial({ visible: false }));

    // Base marker
    const baseRadius = MARKER_CONFIG.BASE_RADIUS * 0.8;
    const baseGeom = new THREE.SphereGeometry(
        baseRadius,
        MARKER_CONFIG.BASE_SEGMENTS / 2,
        MARKER_CONFIG.BASE_SEGMENTS / 2
    );
    const baseMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: false,
        opacity: 1.0
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0;
    group.add(base);

    // Invisible hitbox
    const hitboxGeom = new THREE.CylinderGeometry(
        MARKER_CONFIG.HITBOX_RADIUS,
        MARKER_CONFIG.HITBOX_RADIUS,
        MARKER_CONFIG.POLE_HEIGHT + 0.5,
        MARKER_CONFIG.HITBOX_SEGMENTS
    );
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
    hitbox.position.y = MARKER_CONFIG.POLE_HEIGHT / 2;
    hitbox.userData.index = idx;
    group.add(hitbox);

    group.position.set(worldX, worldY, worldZ);

    return { group, head, glow, pole, base, hitbox, baseY: worldY };
}


interface UseMarkersProps {
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
    pathPoints: PathPoint[];
    paths?: any[];
    showMarkers: boolean;
    timelineProgress: number;
    terrainPosition: { x: number; y: number; z: number };
    markerColors: { user: string; userGlow: string; assistant: string; assistantGlow: string };
}

export function useMarkers({
    sceneRef,
    pathPoints,
    paths,
    showMarkers,
    timelineProgress,
    terrainPosition,
    markerColors
}: UseMarkersProps) {
    const markersRef = useRef<any[]>([]);
    const hitboxesRef = useRef<THREE.Mesh[]>([]);
    const quadrantMarkersRef = useRef<THREE.Mesh[]>([]);
    const cornerPostsRef = useRef<THREE.Line[]>([]);
    const projectionMarkerRef = useRef<THREE.Group | null>(null);

    const terrainSize = SCENE_CONFIG.TERRAIN_SIZE;
    const terrainHeight = SCENE_CONFIG.TERRAIN_HEIGHT;

    // Static Elements (Quadrants & Corners)
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;
        const axisY = 0.01;
        const halfSize = terrainSize / 2;

        // --- Quadrant Markers ---
        quadrantMarkersRef.current.forEach(m => scene.remove(m));
        quadrantMarkersRef.current = [];

        const markerRadius = 0.15;
        const markerGeom = new THREE.CircleGeometry(markerRadius, 16);
        const markerMat = new THREE.MeshBasicMaterial({
            color: COLORS.accent,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const quadrantPositions = [
            { x: -terrainSize * 0.4, z: -terrainSize * 0.4 },
            { x: terrainSize * 0.4, z: -terrainSize * 0.4 },
            { x: -terrainSize * 0.4, z: terrainSize * 0.4 },
            { x: terrainSize * 0.4, z: terrainSize * 0.4 }
        ];

        quadrantPositions.forEach(pos => {
            const marker = new THREE.Mesh(markerGeom, markerMat);
            marker.rotation.x = -Math.PI / 2;
            marker.position.set(pos.x + terrainPosition.x, axisY + terrainPosition.y, pos.z + terrainPosition.z);
            scene.add(marker);
            quadrantMarkersRef.current.push(marker);
        });

        // --- Corner Posts ---
        cornerPostsRef.current.forEach(p => scene.remove(p));
        cornerPostsRef.current = [];

        const postHeight = 0.5;
        const corners = [
            { x: -halfSize, z: -halfSize, label: 'FUNC+SUP' },
            { x: halfSize, z: -halfSize, label: 'SOC+SUP' },
            { x: -halfSize, z: halfSize, label: 'FUNC+DIR' },
            { x: halfSize, z: halfSize, label: 'SOC+DIR' }
        ];

        corners.forEach(corner => {
            const postGeom = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(corner.x + terrainPosition.x, terrainPosition.y, corner.z + terrainPosition.z),
                new THREE.Vector3(corner.x + terrainPosition.x, postHeight + terrainPosition.y, corner.z + terrainPosition.z)
            ]);
            const postMat = new THREE.LineBasicMaterial({
                color: COLORS.accent,
                transparent: true,
                opacity: 0.5
            });
            const post = new THREE.Line(postGeom, postMat);
            scene.add(post);
            cornerPostsRef.current.push(post);
        });

    }, [terrainSize, terrainPosition, sceneRef]);

    // Dynamic Conversation Markers
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        // Clear old markers
        markersRef.current.forEach(m => {
            if (m) {
                scene.remove(m.group);
                m.group.traverse((obj: any) => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                        materials.forEach((mat: any) => mat.dispose());
                    }
                });
            }
        });
        markersRef.current = [];
        hitboxesRef.current = [];

        // Logic to determine visible points
        let visiblePoints: typeof pathPoints = [];
        // If NO multiple paths provided, use pathPoints
        if (!(paths && paths.length > 0) && pathPoints.length > 0) {
            const visibleCount = timelineProgress >= 0.99
                ? pathPoints.length
                : Math.ceil(pathPoints.length * timelineProgress);
            const limitedCount = Math.min(visibleCount, MARKER_CONFIG.MAX_MARKERS);
            visiblePoints = pathPoints.slice(0, limitedCount);

            if (showMarkers) {
                visiblePoints.forEach((point, idx) => {
                    if (!point) return;
                    const marker = createMarkerGroup(point, idx, terrainSize, terrainHeight, terrainPosition, markerColors);
                    scene.add(marker.group);
                    markersRef.current.push(marker);
                    if (marker.hitbox) {
                        hitboxesRef.current.push(marker.hitbox);
                    }
                });
            }
        }

        // If Multiple paths provided:
        if (showMarkers && paths && paths.length > 0) {
            paths.forEach((pathData: any, pathIdx: number) => {
                const visibleCount = timelineProgress >= 0.99
                    ? pathData.points.length
                    : Math.ceil(pathData.points.length * timelineProgress);
                const pathVisiblePoints = pathData.points.slice(0, visibleCount);

                pathVisiblePoints.forEach((point: PathPoint, idx: number) => {
                    // Decimation for performance? 
                    if (idx % 2 !== 0 && pathVisiblePoints.length > 50) return;

                    const marker = createMarkerGroup(point, idx, terrainSize, terrainHeight, terrainPosition, markerColors);
                    scene.add(marker.group);
                    markersRef.current.push(marker);
                    if (marker.hitbox) {
                        marker.hitbox.userData = { ...marker.hitbox.userData, pathIndex: pathIdx };
                        hitboxesRef.current.push(marker.hitbox);
                    }
                });
            });
        }

    }, [pathPoints, paths, timelineProgress, showMarkers, terrainPosition, terrainSize, markerColors, sceneRef]);

    return { markersRef, hitboxesRef, quadrantMarkersRef, cornerPostsRef, projectionMarkerRef };
}
