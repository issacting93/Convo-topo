import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SCENE_CONFIG, LIGHTING_CONFIG } from './constants';
import { COLORS } from '../../utils/constants';

interface UseSceneSetupProps {
    backgroundColor?: string;
    terrainPosition: { x: number; y: number; z: number };
    terrainSize: number;
}

export function useSceneSetup({ backgroundColor, terrainPosition, terrainSize }: UseSceneSetupProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    const xAxisLineRef = useRef<THREE.Line | null>(null);
    const zAxisLineRef = useRef<THREE.Line | null>(null);
    const boundaryFrameRef = useRef<THREE.LineSegments | null>(null);
    // cornerPosts, quadrantMarkers are managed in useMarkers now, or kept here?
    // They are static scene elements (part of the grid/axis visualization), so logic says here.
    // BUT the implementation plan said useMarkers handles them. I will stick to the plan but 
    // actually, looking at the code, they are part of the 'initializeScene' block which is primarily here.
    // HOWEVER, the "undefined corner" bug suggests they are dynamic or at least re-created.
    // Let's keep the static axis/grid stuff here. The dynamic markers (quadrants, corners) 
    // are technically static helpers but implemented in a way that had bugs. 
    // I will move them to useMarkers or a new useSceneHelpers if they are complex.
    // For now, let's keep the basic scene setup here.

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Get container size
        const rect = container.getBoundingClientRect();
        let width = rect.width || container.clientWidth;
        let height = rect.height || container.clientHeight;

        if (width === 0 || height === 0) {
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                const newWidth = entry.contentRect.width || container.clientWidth;
                const newHeight = entry.contentRect.height || container.clientHeight;

                if (newWidth > 0 && newHeight > 0) {
                    initializeScene(newWidth, newHeight);
                    resizeObserver.disconnect();
                }
            });
            resizeObserver.observe(container);
            return () => resizeObserver.disconnect();
        }

        initializeScene(width, height);

        function initializeScene(width: number, height: number) {
            // Scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(backgroundColor || COLORS.background);
            scene.fog = new THREE.FogExp2(COLORS.fog, 0.04);
            sceneRef.current = scene;

            // Camera
            const aspect = height > 0 ? width / height : 1;
            const camera = new THREE.PerspectiveCamera(
                SCENE_CONFIG.CAMERA_FOV,
                aspect,
                SCENE_CONFIG.CAMERA_NEAR,
                SCENE_CONFIG.CAMERA_FAR
            );

            const elevationRad = (SCENE_CONFIG.CAMERA_ELEVATION * Math.PI) / 180;
            const azimuthRad = (45 * Math.PI) / 180;
            const distance = SCENE_CONFIG.CAMERA_DISTANCE;
            const horizontalDistance = distance * Math.cos(elevationRad);

            camera.position.set(
                horizontalDistance * Math.sin(azimuthRad),
                distance * Math.sin(elevationRad),
                horizontalDistance * Math.cos(azimuthRad)
            );

            camera.lookAt(
                SCENE_CONFIG.CAMERA_LOOK_AT.x + terrainPosition.x,
                SCENE_CONFIG.CAMERA_LOOK_AT.y + terrainPosition.y,
                SCENE_CONFIG.CAMERA_LOOK_AT.z + terrainPosition.z
            );
            cameraRef.current = camera;

            // Renderer
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance'
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.MAX_PIXEL_RATIO));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Lights
            const ambient = new THREE.AmbientLight(0x445566, LIGHTING_CONFIG.AMBIENT_INTENSITY);
            scene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xaaccdd, LIGHTING_CONFIG.DIR_LIGHT_1_INTENSITY);
            dirLight.position.set(
                LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.x,
                LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.y,
                LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.z
            );
            scene.add(dirLight);

            const dirLight2 = new THREE.DirectionalLight(0x6688aa, LIGHTING_CONFIG.DIR_LIGHT_2_INTENSITY);
            dirLight2.position.set(
                LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.x,
                LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.y,
                LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.z
            );
            scene.add(dirLight2);

            // Grid Helper
            const gridHelper = new THREE.GridHelper(
                terrainSize * SCENE_CONFIG.GRID_SIZE_MULTIPLIER,
                SCENE_CONFIG.GRID_DIVISIONS,
                COLORS.grid,
                COLORS.gridDim
            );
            gridHelper.position.set(terrainPosition.x, SCENE_CONFIG.GRID_Y_OFFSET + terrainPosition.y, terrainPosition.z);
            const gridMaterials = Array.isArray(gridHelper.material) ? gridHelper.material : [gridHelper.material];
            gridMaterials.forEach((mat: THREE.Material) => {
                mat.transparent = true;
                mat.opacity = SCENE_CONFIG.GRID_OPACITY;
            });
            scene.add(gridHelper);
            gridHelperRef.current = gridHelper;

            // Axes and Boundary Frame logic remains here as it's static structure
            const axisY = 0.01;

            // X-axis line
            const xAxisGeom = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-terrainSize / 2 + terrainPosition.x, axisY + terrainPosition.y, terrainPosition.z),
                new THREE.Vector3(terrainSize / 2 + terrainPosition.x, axisY + terrainPosition.y, terrainPosition.z)
            ]);
            const xAxisMat = new THREE.LineBasicMaterial({
                color: COLORS.accent,
                transparent: true,
                opacity: 0.8,
                linewidth: 2
            });
            const xAxisLine = new THREE.Line(xAxisGeom, xAxisMat);
            scene.add(xAxisLine);
            xAxisLineRef.current = xAxisLine;

            // Z-axis line
            const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, -terrainSize / 2 + terrainPosition.z),
                new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, terrainSize / 2 + terrainPosition.z)
            ]);
            const zAxisMat = new THREE.LineBasicMaterial({
                color: COLORS.accent,
                transparent: true,
                opacity: 0.8,
                linewidth: 2
            });
            const zAxisLine = new THREE.Line(zAxisGeom, zAxisMat);
            scene.add(zAxisLine);
            zAxisLineRef.current = zAxisLine;

            // Boundary Frame
            const boundaryY = 0.01;
            const halfSize = terrainSize / 2;
            const boundaryPoints = [
                new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
                new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
                new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
                new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
                new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
                new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
                new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
                new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z)
            ];
            const boundaryGeom = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
            const boundaryMat = new THREE.LineBasicMaterial({
                color: COLORS.accent,
                transparent: true,
                opacity: 0.8,
                linewidth: 2
            });
            const boundaryFrame = new THREE.LineSegments(boundaryGeom, boundaryMat);
            scene.add(boundaryFrame);
            boundaryFrameRef.current = boundaryFrame;


            // Handle Resize
            const handleResize = () => {
                const w = container.clientWidth || container.getBoundingClientRect().width;
                const h = container.clientHeight || container.getBoundingClientRect().height;
                if (w === 0 || h === 0) return;

                const aspect = w / h;
                renderer.setSize(w, h);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.MAX_PIXEL_RATIO));

                if (cameraRef.current instanceof THREE.PerspectiveCamera) {
                    cameraRef.current.aspect = aspect;
                    cameraRef.current.updateProjectionMatrix();
                } else if (cameraRef.current instanceof THREE.OrthographicCamera) {
                    const size = 7.2;
                    cameraRef.current.left = -size * aspect;
                    cameraRef.current.right = size * aspect;
                    cameraRef.current.top = size;
                    cameraRef.current.bottom = -size;
                    cameraRef.current.updateProjectionMatrix();
                }
            };
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                if (renderer) {
                    if (container.contains(renderer.domElement)) {
                        container.removeChild(renderer.domElement);
                    }
                    renderer.forceContextLoss();
                    renderer.dispose();
                }
                sceneRef.current = null;
                rendererRef.current = null;
                cameraRef.current = null;
            };
        }
    }, [backgroundColor, terrainPosition, terrainSize]);

    // Return refs and additional helpers if needed
    return {
        containerRef,
        sceneRef,
        rendererRef,
        cameraRef,
        gridHelperRef,
        xAxisLineRef,
        zAxisLineRef,
        boundaryFrameRef
    };
}
