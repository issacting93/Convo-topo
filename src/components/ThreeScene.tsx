import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import type { Contour, PathPoint } from '../utils/terrain';
import { COLORS } from '../utils/constants';
import { calculatePathPadChanges, getPadChangeColor } from '../utils/padPathColors';

// Scene configuration constants
const SCENE_CONFIG = {
  TERRAIN_SIZE: 7.5,
  TERRAIN_HEIGHT: 6.0,
  // Isometric-like perspective camera settings
  CAMERA_FOV: 50, // Narrower FOV reduces perspective distortion
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 100,
  // Isometric angle: ~30° elevation, ~45° azimuth
  // Distance calculated for isometric-like appearance
  CAMERA_DISTANCE: 18, // Distance from center for isometric-like view
  CAMERA_ELEVATION: 30, // Degrees above horizontal (isometric angle)
  CAMERA_LOOK_AT: { x: 0, y: 1, z: 0 },
  MAX_PIXEL_RATIO: 1.5,
  GRID_SIZE_MULTIPLIER: 1.4,
  GRID_DIVISIONS: 28,
  GRID_OPACITY: 0.9,
  GRID_Y_OFFSET: -0.02,
} as const;

// Lighting configuration
const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.2,
  DIR_LIGHT_1_INTENSITY: 1.0,
  DIR_LIGHT_1_POSITION: { x: 5, y: 10, z: 5 },
  DIR_LIGHT_2_INTENSITY: 0.6,
  DIR_LIGHT_2_POSITION: { x: -5, y: 8, z: -5 },
  TERRAIN_BRIGHTEN: 2.2,  // Increased from 1.5 for more brightness
  TERRAIN_EMISSIVE_INTENSITY: 0.95,  // Increased from 0.2 for more glow
} as const;

// Marker configuration
const MARKER_CONFIG = {
  POLE_HEIGHT: 2.0,
  HEAD_RADIUS: 0.12,
  HEAD_SEGMENTS: { width: 16, height: 12 },
  GLOW_INNER_RADIUS: 0.1,
  GLOW_OUTER_RADIUS: 0.15,
  GLOW_SEGMENTS: 24,
  BASE_RADIUS: 0.15,
  BASE_SEGMENTS: 16,
  HITBOX_RADIUS: 0.3,
  HITBOX_SEGMENTS: 8,
  PATH_DASH_SIZE: 0.25,
  PATH_GAP_SIZE: 0.12,
  PATH_Y_OFFSET: 0.05,
  MAX_MARKERS: 50,
} as const;

// Animation configuration
const ANIMATION_CONFIG = {
  TIME_STEP: 0.016,
  ORBIT_SPEED: 0.04,
  ORBIT_RADIUS: 15,
  CAMERA_Y_BASE: 9,
  CAMERA_Y_AMPLITUDE: 1.5,
  CAMERA_Y_FREQUENCY: 0.08,
  PULSE_FREQUENCY: 2.5,
  PULSE_PHASE_SHIFT: 0.5,
  MARKER_HOVER_SCALE: 1.4,
  MARKER_NORMAL_SCALE: 1,
  SCALE_LERP_SPEED: 0.1,
  MARKER_FLOAT_FREQUENCY: 1.5,
  MARKER_FLOAT_AMPLITUDE: 0.03,
  RAYCAST_THROTTLE: 3,
  CONTOUR_ANIMATION_THROTTLE: 2,
} as const;

// Post-processing configuration
const POST_PROCESSING_CONFIG = {
  BLOOM_RESOLUTION_DIVISOR: 2,
  BLOOM_STRENGTH: 0.3,
  BLOOM_RADIUS: 0.4,
  BLOOM_THRESHOLD: 0.85,
} as const;

type CameraView = 'default' | 'side' | 'top';

interface ThreeSceneProps {
  heightmap: Float32Array;
  pathPoints: PathPoint[];
  contours: Contour[];
  hoveredPoint: number | null;
  lockedPoint: number | null;
  timelineProgress: number;
  showContours: boolean;
  terrainPosition?: { x: number; y: number; z: number };
  cameraView?: CameraView;
  cameraDistance?: number;
  cameraElevation?: number;
  cameraRotation?: number;
  contourColors?: { minor: string; major: string; index: string };
  markerColors?: { user: string; userGlow: string; assistant: string; assistantGlow: string };
  onPointHover: (index: number | null) => void;
  onPointClick: (index: number) => void;
}

interface MarkerRef {
  group: THREE.Group;
  head: THREE.Mesh;
  glow: THREE.Mesh;
  pole: THREE.Line;
  base: THREE.Mesh;
  hitbox: THREE.Mesh;
  baseY: number;
}

export function ThreeScene({
  heightmap,
  pathPoints,
  contours,
  hoveredPoint,
  lockedPoint,
  timelineProgress,
  showContours,
  terrainPosition = { x: 0, y: 0, z: 0 },
  cameraView = 'default',
  cameraDistance = 18,
  cameraElevation = 30,
  cameraRotation = 0,
  contourColors = { minor: '#a0d080', major: '#b0e090', index: '#c0f0a0' },
  markerColors = { user: '#4a3a8a', userGlow: '#5a4a9a', assistant: '#cc5500', assistantGlow: '#dd6600' },
  onPointHover,
  onPointClick
}: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const frameRef = useRef<number | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);
  const pathLineRef = useRef<Line2 | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const contoursRef = useRef<THREE.LineSegments[]>([]);
  const projectionMarkerRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const xAxisLineRef = useRef<THREE.Line | null>(null);
  const zAxisLineRef = useRef<THREE.Line | null>(null);
  const boundaryFrameRef = useRef<THREE.LineSegments | null>(null);
  const cornerPostsRef = useRef<THREE.Line[]>([]);
  const quadrantMarkersRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const composerRef = useRef<EffectComposer | null>(null);
  const rotationYRef = useRef(0); // Rotation angle around Y-axis (in radians)
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const size = Math.sqrt(heightmap.length);
  const terrainSize = SCENE_CONFIG.TERRAIN_SIZE;
  const terrainHeight = SCENE_CONFIG.TERRAIN_HEIGHT;

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);
    scene.fog = new THREE.FogExp2(COLORS.fog, 0.04);
    sceneRef.current = scene;

    // Camera - Start with perspective (default view)
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.CAMERA_FOV,
      width / height,
      SCENE_CONFIG.CAMERA_NEAR,
      SCENE_CONFIG.CAMERA_FAR
    );
    
    // Calculate isometric-like position (45° azimuth, 30° elevation)
    const elevationRad = (SCENE_CONFIG.CAMERA_ELEVATION * Math.PI) / 180;
    const azimuthRad = (45 * Math.PI) / 180; // 45 degrees for isometric view
    
    const distance = SCENE_CONFIG.CAMERA_DISTANCE;
    const horizontalDistance = distance * Math.cos(elevationRad);
    
    // Camera starts at fixed position relative to origin (not terrainPosition)
    camera.position.set(
      horizontalDistance * Math.sin(azimuthRad),  // x
      distance * Math.sin(elevationRad),          // y (height)
      horizontalDistance * Math.cos(azimuthRad)   // z
    );
    
    // Look at the terrain center (which includes terrainPosition offset)
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

    // Ambient light
    const ambient = new THREE.AmbientLight(0x445566, LIGHTING_CONFIG.AMBIENT_INTENSITY);
    scene.add(ambient);

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xaaccdd, LIGHTING_CONFIG.DIR_LIGHT_1_INTENSITY);
    dirLight.position.set(
      LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.x,
      LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.y,
      LIGHTING_CONFIG.DIR_LIGHT_1_POSITION.z
    );
    scene.add(dirLight);

    // Secondary directional light
    const dirLight2 = new THREE.DirectionalLight(0x6688aa, LIGHTING_CONFIG.DIR_LIGHT_2_INTENSITY);
    dirLight2.position.set(
      LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.x,
      LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.y,
      LIGHTING_CONFIG.DIR_LIGHT_2_POSITION.z
    );
    scene.add(dirLight2);

    // Floor grid
    const gridHelper = new THREE.GridHelper(
      terrainSize * SCENE_CONFIG.GRID_SIZE_MULTIPLIER,
      SCENE_CONFIG.GRID_DIVISIONS,
      COLORS.grid,
      COLORS.gridDim
    );
    gridHelper.position.set(terrainPosition.x, SCENE_CONFIG.GRID_Y_OFFSET + terrainPosition.y, terrainPosition.z);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = SCENE_CONFIG.GRID_OPACITY;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Add 2D axis visualization (Functional↔Social, Structured↔Emergent)
    // Center dividing lines showing quadrants
    const axisY = 0.01; // Slightly above grid to be visible

    // X-axis line (Functional at -X, Social at +X)
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

    // Z-axis line (Structured at -Z, Emergent at +Z)
    const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, -terrainSize / 2 + terrainPosition.z),
      new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, terrainSize / 2 + terrainPosition.z)
    ]);
    const zAxisMat = new THREE.LineBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.8,
      linewidth: 4  
    });
    const zAxisLine = new THREE.Line(zAxisGeom, zAxisMat);
    scene.add(zAxisLine);
    zAxisLineRef.current = zAxisLine;

    // Add corner markers for quadrants
    const markerRadius = 0.15;
    const markerGeom = new THREE.CircleGeometry(markerRadius, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const quadrantPositions = [
      { x: -terrainSize * 0.4, z: -terrainSize * 0.4 }, // Functional + Structured
      { x: terrainSize * 0.4, z: -terrainSize * 0.4 },  // Social + Structured
      { x: -terrainSize * 0.4, z: terrainSize * 0.4 },  // Functional + Emergent
      { x: terrainSize * 0.4, z: terrainSize * 0.4 }    // Social + Emergent
    ];

    quadrantPositions.forEach(pos => {
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(pos.x + terrainPosition.x, axisY + terrainPosition.y, pos.z + terrainPosition.z);
      scene.add(marker);
      quadrantMarkersRef.current.push(marker);
    });

    // Add boundary frame showing the 2D axis bounds
    const boundaryY = 0.01;
    const halfSize = terrainSize / 2;
    const boundaryPoints = [
      // Bottom edge (Structured, -Z)
      new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
      new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
      // Right edge (Social, +X)
      new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, -halfSize + terrainPosition.z),
      new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
      // Top edge (Emergent, +Z)
      new THREE.Vector3(halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
      new THREE.Vector3(-halfSize + terrainPosition.x, boundaryY + terrainPosition.y, halfSize + terrainPosition.z),
      // Left edge (Functional, -X)
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

    // Add corner posts (vertical lines at each corner)
    const postHeight = 0.5;
    const corners = [
      { x: -halfSize, z: -halfSize, label: 'FUNC+STR' },
      { x: halfSize, z: -halfSize, label: 'SOC+STR' },
      { x: -halfSize, z: halfSize, label: 'FUNC+EMG' },
      { x: halfSize, z: halfSize, label: 'SOC+EMG' }
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

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const aspect = w / h;
      
      if (rendererRef.current) {
        rendererRef.current.setSize(w, h);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.MAX_PIXEL_RATIO));
      }
      
      if (cameraRef.current) {
        if (cameraRef.current instanceof THREE.PerspectiveCamera) {
          cameraRef.current.aspect = aspect;
          cameraRef.current.updateProjectionMatrix();
        } else if (cameraRef.current instanceof THREE.OrthographicCamera) {
          // Update orthographic camera bounds
          // Use smaller size for better visibility (reduced from 15 to 7.2)
          const size = 7.2; // Corresponds to default cameraDistance 18 * 0.4
          cameraRef.current.left = -size * aspect;
          cameraRef.current.right = size * aspect;
          cameraRef.current.top = size;
          cameraRef.current.bottom = -size;
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Update Line2 material resolution for proper line width scaling
      if (pathLineRef.current && pathLineRef.current.material instanceof LineMaterial) {
        pathLineRef.current.material.resolution.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.x = normalizedX;
      mouseRef.current.y = normalizedY;

      // Handle rotation drag
      if (isDraggingRef.current) {
        const deltaX = e.clientX - lastMouseXRef.current;
        // Convert pixel movement to rotation (sensitivity factor)
        // Negative to reverse direction: drag right = rotate left, drag left = rotate right
        const rotationSpeed = 0.005;
        rotationYRef.current -= deltaX * rotationSpeed;
        lastMouseXRef.current = e.clientX;
      }
    };
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (e: MouseEvent) => {
      // Only start dragging on left mouse button
      if (e.button === 0) {
        isDraggingRef.current = true;
        lastMouseXRef.current = e.clientX;
        if (rendererRef.current) {
          rendererRef.current.domElement.style.cursor = 'grabbing';
        }
      }
    };
    renderer.domElement.addEventListener('mousedown', handleMouseDown);

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (rendererRef.current) {
        rendererRef.current.domElement.style.cursor = 'default';
      }
    };
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp); // Stop dragging when mouse leaves

    const handleClick = (e: MouseEvent) => {
      // Only trigger click if we didn't drag (to avoid accidental clicks after rotation)
      if (isDraggingRef.current) {
        e.preventDefault();
        return;
      }
      if (!raycasterRef.current || !cameraRef.current) return;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(
        markersRef.current.filter(m => m).map(m => m.hitbox).filter(h => h),
        false
      );
      if (intersects.length > 0 && intersects[0].object.userData.index !== undefined) {
        const idx = intersects[0].object.userData.index as number;
        onPointClick(idx);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClick);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      // Dispose composer and all its passes
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }

      // Dispose renderer
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Clear refs
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, [onPointClick]);

  // Create/update terrain mesh (visual context backdrop)
  // NOTE: Terrain serves as visual context, but marker Z-heights are calculated
  // DIRECTLY from PAD emotional intensity (not from terrain height). The terrain
  // provides visual backdrop while markers show actual PAD-based heights.
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

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: false,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x334455),  // Brighter emissive color (was 0x223344)
      emissiveIntensity: LIGHTING_CONFIG.TERRAIN_EMISSIVE_INTENSITY
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(terrainPosition.x, terrainPosition.y, terrainPosition.z);
    terrain.visible = false; // Hidden - only showing contours
    scene.add(terrain);
    terrainRef.current = terrain;

  }, [heightmap, size, terrainSize, terrainHeight]);

  // Update terrain position when terrainPosition changes
  useEffect(() => {
    if (terrainRef.current) {
      terrainRef.current.position.set(terrainPosition.x, terrainPosition.y, terrainPosition.z);
    }
  }, [terrainPosition]);

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

      // Determine line color and width
      const isIndex = contourIdx % 10 === 0; // Every 10th is index contour
      const color = isIndex ? contourColors.index : (isMajor ? contourColors.major : contourColors.minor);
      const baseOpacity = 1.0;  // Full opacity for better visibility on white background

      // Create geometry from line segments
      const points: THREE.Vector3[] = [];
      lines.forEach(segment => {
        const [p1, p2] = segment;

        // Convert grid coords to world coords with terrain position offset
        const x1 = (p1.x / size - 0.5) * terrainSize + terrainPosition.x;
        const z1 = (p1.y / size - 0.5) * terrainSize + terrainPosition.z;
        const y1 = elevation * terrainHeight + 0.02 + terrainPosition.y; // Slight offset above terrain

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

      // Store metadata for animation
      lineSegments.userData.baseOpacity = baseOpacity;
      lineSegments.userData.elevation = elevation;
      lineSegments.userData.isIndex = isIndex;
      lineSegments.userData.isMajor = isMajor;
      lineSegments.userData.contourIdx = contourIdx;

      scene.add(lineSegments);
      contoursRef.current.push(lineSegments);
    });

  }, [contours, showContours, size, terrainSize, terrainHeight, terrainPosition, contourColors]);

  // Create/update markers and path
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear old markers
    markersRef.current.forEach(m => {
      if (m) {
        scene.remove(m.group);
        m.group.traverse(obj => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material && obj.material instanceof THREE.Material) obj.material.dispose();
          }
        });
      }
    });
    markersRef.current = [];

    // Clear old path
    if (pathLineRef.current) {
      scene.remove(pathLineRef.current);
      pathLineRef.current.geometry.dispose();
      if (pathLineRef.current.material instanceof THREE.Material) {
        pathLineRef.current.material.dispose();
      }
    }

    // Show all markers by default, but allow timeline control for animation
    // If timelineProgress is 1.0, show all; otherwise show progressive reveal
    const visibleCount = timelineProgress >= 0.99
      ? pathPoints.length
      : Math.ceil(pathPoints.length * timelineProgress);
    const limitedCount = Math.min(visibleCount, MARKER_CONFIG.MAX_MARKERS);
    const visiblePoints = pathPoints.slice(0, limitedCount);

    // Create markers
    visiblePoints.forEach((point, idx) => {
      const marker = createMarkerGroup(point, idx, terrainSize, terrainHeight, terrainPosition, markerColors);
      scene.add(marker.group);
      markersRef.current.push(marker);
    });

    // Create path line with gradient colors based on PAD incline/decline
    if (visiblePoints.length >= 2) {
      // Calculate PAD changes for each segment
      const padChanges = calculatePathPadChanges(visiblePoints);
      
      // Build positions and colors for line segments
      const positions: number[] = [];
      const colors: number[] = [];
      
      for (let i = 0; i < visiblePoints.length; i++) {
        const p = visiblePoints[i];
        // Z-height is DIRECTLY from PAD emotional intensity
        let yPosition: number;
        if (p.pad?.emotionalIntensity !== undefined) {
          // Use emotional intensity directly for Z-height
          yPosition = p.pad.emotionalIntensity * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
        } else if (p.padHeight !== undefined) {
          // Fallback: use padHeight if emotionalIntensity not available
          yPosition = p.padHeight * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
        } else {
          // Last resort: use terrain height
          yPosition = p.height * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
        }

        const x = (p.x - 0.5) * terrainSize + terrainPosition.x;
        const y = yPosition + terrainPosition.y;
        const z = (p.y - 0.5) * terrainSize + terrainPosition.z;
        
        positions.push(x, y, z);
        
        // Get color for this segment (use previous segment's change, or neutral for first point)
        const change = i > 0 ? padChanges[i - 1] : 0;
        const color = getPadChangeColor(change);
        colors.push(color.r, color.g, color.b);
      }
      
      // Use Line2 for actually thick lines (LineBasicMaterial ignores linewidth in WebGL)
      const pathGeom = new LineGeometry();
      pathGeom.setPositions(positions);
      pathGeom.setColors(colors);

      const pathMat = new LineMaterial({
        vertexColors: true,
        linewidth: 3, // Thinner line with darker colors
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        dashed: false,
        alphaToCoverage: true, // Better antialiasing
        worldUnits: false // Use screen space pixels for consistent thickness
      });

      const pathLine = new Line2(pathGeom, pathMat);
      scene.add(pathLine);
      pathLineRef.current = pathLine;
    }

  }, [pathPoints, timelineProgress, terrainSize, terrainHeight, terrainPosition, markerColors]);

  // Create/update projection marker showing conversation position on 2D axis
  useEffect(() => {
    if (!sceneRef.current || pathPoints.length === 0) return;
    const scene = sceneRef.current;

    // Clear old projection marker
    if (projectionMarkerRef.current) {
      scene.remove(projectionMarkerRef.current);
      projectionMarkerRef.current.traverse(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material && obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    }

    // Calculate average position of all path points (conversation center on 2D axis)
    let avgX = 0;
    let avgY = 0;
    pathPoints.forEach(p => {
      avgX += p.x;
      avgY += p.y;
    });
    avgX /= pathPoints.length;
    avgY /= pathPoints.length;

    // Convert to world coordinates
    const worldX = (avgX - 0.5) * terrainSize;
    const worldZ = (avgY - 0.5) * terrainSize;

    // Create projection marker group
    const group = new THREE.Group();

    // Ground circle marker showing 2D position
    const circleGeom = new THREE.RingGeometry(0.3, 0.4, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const circle = new THREE.Mesh(circleGeom, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.02;
    group.add(circle);

    // Inner filled circle
    const innerCircleGeom = new THREE.CircleGeometry(0.25, 32);
    const innerCircleMat = new THREE.MeshBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const innerCircle = new THREE.Mesh(innerCircleGeom, innerCircleMat);
    innerCircle.rotation.x = -Math.PI / 2;
    innerCircle.position.y = 0.03;
    group.add(innerCircle);

    // Vertical projection line
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 3, 0)
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.4,
      dashSize: 0.2,
      gapSize: 0.1
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.computeLineDistances();
    group.add(line);

    // Top marker sphere
    const sphereGeom = new THREE.SphereGeometry(0.15, 16, 12);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.7
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.y = 3;
    group.add(sphere);

    // Position the group at the conversation's center with terrain offset
    group.position.set(worldX + terrainPosition.x, terrainPosition.y, worldZ + terrainPosition.z);
    scene.add(group);
    projectionMarkerRef.current = group;

  }, [pathPoints, terrainSize, terrainHeight, terrainPosition]);

  // Update grid and axis elements position when terrainPosition changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const axisY = 0.01;
    const halfSize = terrainSize / 2;
    
    // Update grid helper
    if (gridHelperRef.current) {
      gridHelperRef.current.position.set(
        terrainPosition.x,
        SCENE_CONFIG.GRID_Y_OFFSET + terrainPosition.y,
        terrainPosition.z
      );
    }
    
    // Update X-axis line
    if (xAxisLineRef.current) {
      const xAxisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfSize + terrainPosition.x, axisY + terrainPosition.y, terrainPosition.z),
        new THREE.Vector3(halfSize + terrainPosition.x, axisY + terrainPosition.y, terrainPosition.z)
      ]);
      xAxisLineRef.current.geometry.dispose();
      xAxisLineRef.current.geometry = xAxisGeom;
    }
    
    // Update Z-axis line
    if (zAxisLineRef.current) {
      const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, -halfSize + terrainPosition.z),
        new THREE.Vector3(terrainPosition.x, axisY + terrainPosition.y, halfSize + terrainPosition.z)
      ]);
      zAxisLineRef.current.geometry.dispose();
      zAxisLineRef.current.geometry = zAxisGeom;
    }
    
    // Update quadrant markers
    const quadrantPositions = [
      { x: -terrainSize * 0.4, z: -terrainSize * 0.4 },
      { x: terrainSize * 0.4, z: -terrainSize * 0.4 },
      { x: -terrainSize * 0.4, z: terrainSize * 0.4 },
      { x: terrainSize * 0.4, z: terrainSize * 0.4 }
    ];
    quadrantMarkersRef.current.forEach((marker, idx) => {
      if (marker) {
        const pos = quadrantPositions[idx];
        marker.position.set(pos.x + terrainPosition.x, axisY + terrainPosition.y, pos.z + terrainPosition.z);
      }
    });
    
    // Update boundary frame
    if (boundaryFrameRef.current) {
      const boundaryY = 0.01;
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
      boundaryFrameRef.current.geometry.dispose();
      boundaryFrameRef.current.geometry = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    }
    
    // Update corner posts
    const corners = [
      { x: -halfSize, z: -halfSize },
      { x: halfSize, z: -halfSize },
      { x: -halfSize, z: halfSize },
      { x: halfSize, z: halfSize }
    ];
    const postHeight = 0.5;
    cornerPostsRef.current.forEach((post, idx) => {
      if (post) {
        const corner = corners[idx];
        const postGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(corner.x + terrainPosition.x, terrainPosition.y, corner.z + terrainPosition.z),
          new THREE.Vector3(corner.x + terrainPosition.x, postHeight + terrainPosition.y, corner.z + terrainPosition.z)
        ]);
        post.geometry.dispose();
        post.geometry = postGeom;
      }
    });
    
    // Update camera initial position to account for terrain position
    // (This is handled in animation loop, but we can set initial position here)
    // The animation loop will handle the view changes
  }, [terrainPosition, terrainSize]);

  // Switch camera type based on view mode
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const container = renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // Store current camera position and rotation before switching
    const oldPosition = cameraRef.current.position.clone();
    const oldRotation = cameraRef.current.rotation.clone();
    const oldQuaternion = cameraRef.current.quaternion.clone();

    // Check if we need to switch camera type
    const needsPerspective = cameraView === 'default';
    const isCurrentlyPerspective = cameraRef.current instanceof THREE.PerspectiveCamera;

    if (needsPerspective === isCurrentlyPerspective) {
      // Camera type matches, no need to switch
      return;
    }

    let newCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    if (cameraView === 'default') {
      // Perspective camera for default view
      newCamera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.CAMERA_FOV,
        aspect,
        SCENE_CONFIG.CAMERA_NEAR,
        SCENE_CONFIG.CAMERA_FAR
      );
    } else {
      // Orthographic camera for side and top views
      // Map cameraDistance (8-30) to orthographic frustum size (inverse relationship)
      // Distance 8 (close) = size 4 (zoomed in), Distance 30 (far) = size 15 (zoomed out)
      const size = cameraDistance * 0.4; // Reduced from 0.8 for better visibility of terrain and contours
      newCamera = new THREE.OrthographicCamera(
        -size * aspect,  // left
        size * aspect,   // right
        size,            // top
        -size,           // bottom
        SCENE_CONFIG.CAMERA_NEAR,
        SCENE_CONFIG.CAMERA_FAR
      );
    }

    // Copy position and rotation from old camera
    newCamera.position.copy(oldPosition);
    newCamera.rotation.copy(oldRotation);
    newCamera.quaternion.copy(oldQuaternion);
    newCamera.updateMatrixWorld();

    // Update camera reference
    cameraRef.current = newCamera;

    // Recreate EffectComposer with new camera if it exists
    if (composerRef.current) {
      composerRef.current.dispose();
      composerRef.current = null;
      
      // Composer will be recreated on next frame in animation loop
    }
  }, [cameraView, cameraDistance]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    let isAnimating = true;
    let frameCount = 0;

    const animate = () => {
      if (!isAnimating) return;
      timeRef.current += ANIMATION_CONFIG.TIME_STEP;
      frameCount++;

      // Calculate center of visible path points in terrain-local space (before terrainPosition offset)
      // const visiblePoints = pathPoints.slice(0, Math.ceil(pathPoints.length * timelineProgress));
          
            // Camera anchor: terrain center (world space)
      const centerX = terrainPosition.x;
      const centerZ = terrainPosition.z;

      // Pick a stable height to look at (keeps camera from bobbing with emotion height)
      const centerY = terrainPosition.y + terrainHeight * 0.35; // tweak 0.25–0.6

          
          // Camera position based on view mode
      // All views now support user-controlled rotation, elevation, and distance
      if (cameraView === 'top') {
        // Top view: directly above with optional rotation
        const elevationRad = (85 * Math.PI) / 180; // Near-vertical (85° instead of 90° for slight angle)
        const azimuthRad = cameraRotation + rotationYRef.current; // User rotation + drag rotation
        const distance = cameraDistance;
        const horizontalDistance = distance * Math.cos(elevationRad);

        camera.position.x = centerX + horizontalDistance * Math.sin(azimuthRad);
        camera.position.z = centerZ + horizontalDistance * Math.cos(azimuthRad);
        camera.position.y = centerY + distance * Math.sin(elevationRad);
        camera.lookAt(centerX, centerY, centerZ);
      } else if (cameraView === 'side') {
        // Side view: horizontal graph view with 0° elevation
        const elevationRad = 0; // Fixed at 0° for true side/graph view
        const azimuthRad = cameraRotation + rotationYRef.current + (90 * Math.PI) / 180; // 90° base + drag rotation + user rotation
        const distance = cameraDistance;
        const horizontalDistance = distance * Math.cos(elevationRad);

        camera.position.x = centerX + horizontalDistance * Math.sin(azimuthRad);
        camera.position.z = centerZ + horizontalDistance * Math.cos(azimuthRad);
        camera.position.y = centerY + distance * Math.sin(elevationRad);
        camera.lookAt(centerX, centerY, centerZ);
      } else {
        // Default view: Isometric-like with user-controlled rotation, elevation, and distance
        const elevationRad = (cameraElevation * Math.PI) / 180;
        const azimuthRad = cameraRotation + rotationYRef.current + (45 * Math.PI) / 180; // 45° base + drag rotation + user rotation
        const distance = cameraDistance;
        const horizontalDistance = distance * Math.cos(elevationRad);

        camera.position.x = centerX + horizontalDistance * Math.sin(azimuthRad);
        camera.position.z = centerZ + horizontalDistance * Math.cos(azimuthRad);
        camera.position.y = centerY + distance * Math.sin(elevationRad);
        camera.lookAt(centerX, centerY, centerZ);
      }

      // Animate markers
      markersRef.current.forEach((m, idx) => {
        if (!m) return;

        const isHovered = hoveredPoint === idx;
        const isLocked = lockedPoint === idx;
        const isActive = isHovered || isLocked;

        const targetScale = isActive ? ANIMATION_CONFIG.MARKER_HOVER_SCALE : ANIMATION_CONFIG.MARKER_NORMAL_SCALE;
        const currentScale = m.head.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * ANIMATION_CONFIG.SCALE_LERP_SPEED;
        m.head.scale.setScalar(newScale);
        // Glow ring removed - using spheres only for pin-like appearance
        m.group.position.y = m.baseY + Math.sin(timeRef.current * ANIMATION_CONFIG.MARKER_FLOAT_FREQUENCY + idx) * ANIMATION_CONFIG.MARKER_FLOAT_AMPLITUDE;
      });

      // Contour animation removed - contours are static for better visibility

      // Raycast for hover (throttled for performance)
      if (frameCount % ANIMATION_CONFIG.RAYCAST_THROTTLE === 0) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(
          markersRef.current.filter(m => m).map(m => m.hitbox).filter(h => h),
          false
        );

        if (intersects.length > 0 && intersects[0].object.userData.index !== undefined) {
          const idx = intersects[0].object.userData.index as number;
          if (hoveredPoint !== idx) {
            onPointHover(idx);
          }
        } else if (hoveredPoint !== null) {
          onPointHover(null);
        }
      }

      // Initialize post-processing on first frame
      if (!composerRef.current) {
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        // Subtle bloom (reduced resolution for better performance)
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width / POST_PROCESSING_CONFIG.BLOOM_RESOLUTION_DIVISOR, height / POST_PROCESSING_CONFIG.BLOOM_RESOLUTION_DIVISOR),
          POST_PROCESSING_CONFIG.BLOOM_STRENGTH,
          POST_PROCESSING_CONFIG.BLOOM_RADIUS,
          POST_PROCESSING_CONFIG.BLOOM_THRESHOLD
        );
        bloomPass.enabled = true;
        composer.addPass(bloomPass);

        // Chromatic aberration and RGB shift removed

        composerRef.current = composer;
      }

      // Render with composer or renderer
      const composer = composerRef.current;
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      isAnimating = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [hoveredPoint, lockedPoint, onPointHover, cameraView, cameraDistance, cameraElevation, cameraRotation, terrainPosition, timelineProgress, pathPoints]);

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

// Helper function to create terrain geometry
function createTerrainGeometry(
  heightmap: Float32Array,
  size: number,
  terrainSize: number,
  terrainHeight: number
): THREE.BufferGeometry {
  const segments = size - 1;
  const geometry = new THREE.PlaneGeometry(
    terrainSize,
    terrainSize,
    segments,
    segments
  );

  const positions = geometry.attributes.position.array as Float32Array;
  const colors = new Float32Array(positions.length);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const idx = i * size + j;
      const vertIdx = idx * 3;
      const h = heightmap[idx];

      positions[vertIdx + 2] = h * terrainHeight;

      // Higher contrast color gradient
      const color = new THREE.Color().lerpColors(
        COLORS.terrain.low,
        h > 0.6 ? COLORS.terrain.high : COLORS.terrain.mid,
        h * 0.85  // Increased from 0.7 for higher contrast
      );
      colors[vertIdx] = Math.min(1, color.r * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
      colors[vertIdx + 1] = Math.min(1, color.g * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
      colors[vertIdx + 2] = Math.min(1, color.b * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
    }
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return geometry;
}

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

  // Z-height is DIRECTLY from PAD emotional intensity (0-1), not terrain height
  // Paper: "The Z-axis specifically measures emotional intensity at each message"
  // High emotional intensity (frustration) = peaks, low (affiliation) = valleys
  let worldY: number;
  if (point.pad?.emotionalIntensity !== undefined) {
    // emotionalIntensity already calculated as: (1 - pleasure) * 0.6 + arousal * 0.4
    // Scale to terrain height: 0 = valley (affiliation), 1 = peak (frustration)
    worldY = point.pad.emotionalIntensity * terrainHeight;
  } else if (point.padHeight !== undefined) {
    // Fallback: use padHeight if emotionalIntensity not available
    worldY = point.padHeight * terrainHeight;
  } else {
    // Last resort: use terrain height (not ideal, but handles missing PAD data)
    worldY = point.height * terrainHeight;
  }
  
  // Apply terrain position offset to Y
  worldY += terrainPosition.y;

  // Determine colors based on role (user vs assistant)
  // Use markerColors from props if available
  const userMarker = markerColors?.user || '#4a3a8a';
  const assistantMarker = markerColors?.assistant || '#cc5500';

  let markerColor: string;

  if (point.role === 'user') {
    // User messages: purple-blue for clear distinction
    markerColor = userMarker;
  } else if (point.role === 'assistant') {
    // Assistant messages: orange for clear distinction
    markerColor = assistantMarker;
  } else {
    // Fallback: use functional/social distinction
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
    transparent: false,  // No transparency for better visibility
    opacity: 1.0
  });
  const pole = new THREE.Line(poleGeom, poleMat);
  group.add(pole);

  // Marker head - larger sphere for pin-like appearance
  const headRadius = MARKER_CONFIG.HEAD_RADIUS * 1.5; // Make it larger
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

  // Glow ring removed - using sphere only for pin-like appearance
  // Create a dummy mesh for compatibility (won't be rendered)
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshBasicMaterial({ visible: false }));

  // Base marker - small sphere at bottom for pin-like appearance
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

