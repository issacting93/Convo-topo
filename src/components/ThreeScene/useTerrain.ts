import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SCENE_CONFIG } from './constants';
import { TerrainFresnelShader } from '../../utils/shaders';
import type { Contour } from '../../utils/terrain';
// Helper function createTerrainGeometry is defined locally below

// For now, I'll copy the helper function here or assume it's exported from utils/terrainHelper.ts if I move it there.
// Ideally, `createTerrainGeometry` should be in a utility file. I will look for it. 
// It was at the bottom of ThreeScene.tsx defined locally. I should move it to a util file.
// I'll define it locally here for now to avoid breaking changes, then refactor it out.

function createTerrainGeometry(
    heightmap: Float32Array,
    size: number,
    terrainSize: number,
    terrainHeight: number
): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, size - 1, size - 1);
    const positionAttribute = geometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
        // Current plane geometry creates vertices row by row
        // heightmap is also row by row
        if (i < heightmap.length) {
            // Set z-coordinate (which is y-up in Three.js geometry before rotation)
            // We'll rotate x by -90 deg later
            positionAttribute.setZ(i, heightmap[i] * terrainHeight);
        }
    }

    geometry.computeVertexNormals();
    return geometry;
}

interface UseTerrainProps {
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
    heightmap: Float32Array;
    contours: Contour[];
    showTerrain: boolean;
    showContours: boolean;
    terrainPosition: { x: number; y: number; z: number };
    contourColors: { minor: string; major: string; index: string };
}

export function useTerrain({
    sceneRef,
    heightmap,
    contours,
    showTerrain,
    showContours,
    terrainPosition,
    contourColors
}: UseTerrainProps) {
    const terrainRef = useRef<THREE.Mesh | null>(null);
    const contoursRef = useRef<THREE.LineSegments[]>([]);

    const size = Math.sqrt(heightmap.length);
    const terrainSize = SCENE_CONFIG.TERRAIN_SIZE;
    const terrainHeight = SCENE_CONFIG.TERRAIN_HEIGHT;

    // Create/update terrain mesh
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        if (terrainRef.current) {
            scene.remove(terrainRef.current);
            terrainRef.current.geometry.dispose();
            if (terrainRef.current.material instanceof THREE.Material) {
                terrainRef.current.material.dispose();
            }
        }

        const geometry = createTerrainGeometry(heightmap, size, terrainSize, terrainHeight);

        const shader = TerrainFresnelShader;
        const material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(shader.uniforms),
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Configure uniforms
        material.uniforms.uBaseColor.value.setHex(0xffffff);
        material.uniforms.uRimColor.value.setHex(0xffffff);
        material.uniforms.uFresnelPower.value = 3.0;
        material.uniforms.uBaseOpacity.value = 0.05;
        material.uniforms.uRimOpacity.value = 0.6;

        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.position.set(terrainPosition.x, terrainPosition.y, terrainPosition.z);
        terrain.visible = showTerrain;
        scene.add(terrain);
        terrainRef.current = terrain;

        // Cleanup
        return () => {
            if (terrainRef.current) {
                scene.remove(terrainRef.current);
                terrainRef.current.geometry.dispose();
                if (terrainRef.current.material instanceof THREE.Material) {
                    terrainRef.current.material.dispose();
                }
            }
        };

    }, [heightmap, size, terrainSize, terrainHeight, showTerrain, terrainPosition, sceneRef]); // Added dependencies

    // Update terrain position/visibility
    useEffect(() => {
        if (terrainRef.current) {
            terrainRef.current.position.set(terrainPosition.x, terrainPosition.y, terrainPosition.z);
            terrainRef.current.visible = showTerrain;
        }
    }, [terrainPosition, showTerrain]);

    // Create/update contour lines
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        // Clear old contours
        contoursRef.current.forEach(obj => {
            scene.remove(obj);
            obj.geometry.dispose();
            if (obj.material instanceof THREE.Material) {
                obj.material.dispose();
            }
        });
        contoursRef.current = [];

        if (!showContours) return;

        contours.forEach((contour, contourIdx) => {
            const { elevation, isMajor, lines } = contour;
            if (lines.length === 0) return;

            const isIndex = contourIdx % 10 === 0;
            const color = isIndex ? contourColors.index : (isMajor ? contourColors.major : contourColors.minor);
            const baseOpacity = 1.0;

            const points: THREE.Vector3[] = [];
            lines.forEach(segment => {
                const [p1, p2] = segment;
                const x1 = (p1.x / size - 0.5) * terrainSize + terrainPosition.x;
                const z1 = (p1.y / size - 0.5) * terrainSize + terrainPosition.z;
                const y1 = elevation * terrainHeight + 0.02 + terrainPosition.y;

                const x2 = (p2.x / size - 0.5) * terrainSize + terrainPosition.x;
                const z2 = (p2.y / size - 0.5) * terrainSize + terrainPosition.z;
                const y2 = elevation * terrainHeight + 0.02 + terrainPosition.y;

                points.push(new THREE.Vector3(x1, y1, z1));
                points.push(new THREE.Vector3(x2, y2, z2));
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: baseOpacity,
                linewidth: isMajor ? 3 : 2
            });

            const lineSegments = new THREE.LineSegments(geometry, material);
            // Metadata storage if needed for animation
            lineSegments.userData.baseOpacity = baseOpacity;
            lineSegments.userData.elevation = elevation;

            scene.add(lineSegments);
            contoursRef.current.push(lineSegments);
        });

        return () => {
            // Cleanup contours on unmount/update
            contoursRef.current.forEach(obj => {
                scene.remove(obj);
                obj.geometry.dispose();
                if (obj.material instanceof THREE.Material) obj.material.dispose();
            });
            contoursRef.current = [];
        };

    }, [contours, showContours, size, terrainSize, terrainHeight, terrainPosition, contourColors, sceneRef]);

    return { terrainRef, contoursRef };
}
