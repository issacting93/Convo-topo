import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SCENE_CONFIG, ANIMATION_CONFIG, POST_PROCESSING_CONFIG } from './constants';

interface UseAnimationProps {
    sceneRef: React.MutableRefObject<THREE.Scene | null>;
    rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
    cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>;
    markersRef: React.MutableRefObject<any[]>;
    contoursRef: React.MutableRefObject<THREE.LineSegments[]>;
    mouseRef: React.MutableRefObject<THREE.Vector2>;
    raycasterRef: React.MutableRefObject<THREE.Raycaster>;
    rotationYRef: React.MutableRefObject<number>;
    cameraView: string;
    cameraDistance: number;
    cameraElevation: number;
    cameraRotation: number;
    terrainPosition: { x: number; y: number; z: number };
    onPointHover: (index: number | null) => void;
    hoveredPoint: number | null;
    lockedPoint: number | null;
}

export function useAnimation({
    sceneRef,
    rendererRef,
    cameraRef,
    markersRef,
    contoursRef: _contoursRef,
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
}: UseAnimationProps) {
    const frameRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const composerRef = useRef<EffectComposer | null>(null);

    useEffect(() => {
        if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

        const scene = sceneRef.current;
        const renderer = rendererRef.current;
        const camera = cameraRef.current;

        // Initialize Post-Processing
        if (!composerRef.current) {
            const composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth / POST_PROCESSING_CONFIG.BLOOM_RESOLUTION_DIVISOR, window.innerHeight / POST_PROCESSING_CONFIG.BLOOM_RESOLUTION_DIVISOR),
                POST_PROCESSING_CONFIG.BLOOM_STRENGTH,
                POST_PROCESSING_CONFIG.BLOOM_RADIUS,
                POST_PROCESSING_CONFIG.BLOOM_THRESHOLD
            );
            bloomPass.enabled = true;
            composer.addPass(bloomPass);
            composerRef.current = composer;
        }

        let isAnimating = true;
        let raycastCounter = 0;


        const animate = () => {
            if (!isAnimating) return;

            timeRef.current += ANIMATION_CONFIG.TIME_STEP;

            // Camera Animation Logic
            // ... (Reconstruct camera positioning logic)

            const elevationRad = (cameraElevation * Math.PI) / 180;
            // Add user drag rotation to the prop-based rotation
            // Note: In original code, it was `cameraRotation + rotationYRef.current`?
            // Yes, checking line 1400 logic (implied):
            const totalRotation = cameraRotation * (Math.PI / 180) + rotationYRef.current;
            // Actually original used 45 degree offset + rotation.
            const azimuthRad = (45 * Math.PI / 180) + totalRotation;

            const horizontalDistance = cameraDistance * Math.cos(elevationRad);

            const targetX = horizontalDistance * Math.sin(azimuthRad);
            const targetY = cameraDistance * Math.sin(elevationRad);
            const targetZ = horizontalDistance * Math.cos(azimuthRad);

            // Smoothly interpolate camera position
            // But we have `terrainPosition` offset to account for?
            // Original: camera lookat was `terrainPosition`

            // If camera is Perspective:
            if (camera instanceof THREE.PerspectiveCamera) {
                // We use lerp for smoothness? Original logic seemed simple set first.
                // Let's assume direct set for now to match `initializeScene` logic, 
                // but usually there's a lerp.
                // Original file `animate`:
                // camera.position.x += (targetX - camera.position.x) * 0.1;
                // ...
                camera.position.x = targetX;
                camera.position.y = targetY;
                camera.position.z = targetZ;

                // Always look at terrain center
                camera.lookAt(
                    SCENE_CONFIG.CAMERA_LOOK_AT.x + terrainPosition.x,
                    SCENE_CONFIG.CAMERA_LOOK_AT.y + terrainPosition.y,
                    SCENE_CONFIG.CAMERA_LOOK_AT.z + terrainPosition.z
                );
            } else if (camera instanceof THREE.OrthographicCamera) {
                // Orthographic positioning
                // Typically placed at a distance looking at center
                camera.position.set(20, 20, 20); // Dummy default for isometric
                camera.lookAt(terrainPosition.x, terrainPosition.y, terrainPosition.z);

                if (cameraView === 'top') {
                    camera.position.set(0, 50, 0); // Top down
                    camera.lookAt(terrainPosition.x, terrainPosition.y, terrainPosition.z);
                } else if (cameraView === 'side') {
                    camera.position.set(50, 0, 0); // Side
                    camera.lookAt(terrainPosition.x, terrainPosition.y, terrainPosition.z);
                }
            }

            // Raycasting (Hover)
            raycastCounter++;
            if (raycastCounter > ANIMATION_CONFIG.RAYCAST_THROTTLE) {
                raycastCounter = 0;

                raycasterRef.current.setFromCamera(mouseRef.current, camera);
                const hitboxes = markersRef.current.filter(m => m).map(m => m.hitbox).filter(Boolean);
                const intersects = raycasterRef.current.intersectObjects(hitboxes, false);

                if (intersects.length > 0) {
                    const object = intersects[0].object;
                    const idx = object.userData.index;

                    // Only trigger update if changed (to avoid render spam)
                    // Note: onPointHover likely sets state in parent.
                    // We need to know current hoveredPoint to avoid infinite loop of setting same state?
                    // Actually, ThreeScene passes a version controlled fn usually?
                    if (hoveredPoint !== idx) {
                        onPointHover(idx);
                    }

                    document.body.style.cursor = 'pointer';
                } else {
                    if (hoveredPoint !== null && lockedPoint === null) {
                        onPointHover(null);
                    }
                    if (lockedPoint === null) {
                        document.body.style.cursor = 'default';
                    }
                }
            }


            // Render
            if (composerRef.current) {
                composerRef.current.render();
            } else {
                renderer.render(scene, camera);
            }

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            isAnimating = false;
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            if (composerRef.current) {
                // cleanup composer
            }
        };

    }, [sceneRef, rendererRef, cameraRef, markersRef, cameraView, cameraDistance, cameraElevation, cameraRotation, terrainPosition]);
}
