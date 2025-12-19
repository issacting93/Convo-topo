import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import type { Contour, PathPoint } from '../utils/terrain';
import { COLORS, ChromaticAberrationShader, RGBShiftShader } from '../utils/constants';

// Scene configuration constants
const SCENE_CONFIG = {
  TERRAIN_SIZE: 10,
  TERRAIN_HEIGHT: 6.0,
  CAMERA_FOV: 45,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 100,
  CAMERA_POSITION: { x: 12, y: 10, z: 12 },
  CAMERA_LOOK_AT: { x: 0, y: 1, z: 0 },
  MAX_PIXEL_RATIO: 1.5,
  GRID_SIZE_MULTIPLIER: 1.4,
  GRID_DIVISIONS: 28,
  GRID_OPACITY: 0.6,
  GRID_Y_OFFSET: -0.02,
} as const;

// Lighting configuration
const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 1.2,
  DIR_LIGHT_1_INTENSITY: 1.0,
  DIR_LIGHT_1_POSITION: { x: 5, y: 10, z: 5 },
  DIR_LIGHT_2_INTENSITY: 0.6,
  DIR_LIGHT_2_POSITION: { x: -5, y: 8, z: -5 },
  TERRAIN_BRIGHTEN: 1.5,
  TERRAIN_EMISSIVE_INTENSITY: 0.2,
} as const;

// Marker configuration
const MARKER_CONFIG = {
  POLE_HEIGHT: 2.0,
  HEAD_RADIUS: 0.12,
  HEAD_SEGMENTS: { width: 16, height: 12 },
  GLOW_INNER_RADIUS: 0.2,
  GLOW_OUTER_RADIUS: 0.35,
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
  CHROMA_AMOUNT_MAX: 0.003,
  RGB_SHIFT_AMOUNT_MAX: 0.004,
  BOKEH_FOCUS: 15.0,
  BOKEH_APERTURE_MAX: 0.00015,
  BOKEH_MAXBLUR_MAX: 0.005,
  EFFECT_INTENSITY_LERP: 0.05,
} as const;

interface ThreeSceneProps {
  heightmap: Float32Array;
  pathPoints: PathPoint[];
  contours: Contour[];
  hoveredPoint: number | null;
  lockedPoint: number | null;
  timelineProgress: number;
  showContours: boolean;
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
  onPointHover,
  onPointClick
}: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);
  const pathLineRef = useRef<THREE.Line | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const contoursRef = useRef<THREE.LineSegments[]>([]);
  const projectionMarkerRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const composerRef = useRef<EffectComposer | null>(null);
  const rotationYRef = useRef(0); // Rotation angle around Y-axis (in radians)
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const chromaPassRef = useRef<ShaderPass | null>(null);
  const rgbPassRef = useRef<ShaderPass | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const effectIntensityRef = useRef(0);

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

    // Camera
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.CAMERA_FOV,
      width / height,
      SCENE_CONFIG.CAMERA_NEAR,
      SCENE_CONFIG.CAMERA_FAR
    );
    camera.position.set(
      SCENE_CONFIG.CAMERA_POSITION.x,
      SCENE_CONFIG.CAMERA_POSITION.y,
      SCENE_CONFIG.CAMERA_POSITION.z
    );
    camera.lookAt(
      SCENE_CONFIG.CAMERA_LOOK_AT.x,
      SCENE_CONFIG.CAMERA_LOOK_AT.y,
      SCENE_CONFIG.CAMERA_LOOK_AT.z
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
    gridHelper.position.set(0, SCENE_CONFIG.GRID_Y_OFFSET, 0); // Explicitly center at origin
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = SCENE_CONFIG.GRID_OPACITY;
    scene.add(gridHelper);

    // Add 2D axis visualization (Functional↔Social, Structured↔Emergent)
    // Center dividing lines showing quadrants
    const axisY = 0.01; // Slightly above grid to be visible

    // X-axis line (Functional at -X, Social at +X)
    const xAxisGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-terrainSize / 2, axisY, 0),
      new THREE.Vector3(terrainSize / 2, axisY, 0)
    ]);
    const xAxisMat = new THREE.LineBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });
    const xAxisLine = new THREE.Line(xAxisGeom, xAxisMat);
    scene.add(xAxisLine);

    // Z-axis line (Structured at -Z, Emergent at +Z)
    const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, axisY, -terrainSize / 2),
      new THREE.Vector3(0, axisY, terrainSize / 2)
    ]);
    const zAxisMat = new THREE.LineBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });
    const zAxisLine = new THREE.Line(zAxisGeom, zAxisMat);
    scene.add(zAxisLine);

    // Add corner markers for quadrants
    const markerRadius = 0.15;
    const markerGeom = new THREE.CircleGeometry(markerRadius, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.4,
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
      marker.position.set(pos.x, axisY, pos.z);
      scene.add(marker);
    });

    // Add boundary frame showing the 2D axis bounds
    const boundaryY = 0.01;
    const halfSize = terrainSize / 2;
    const boundaryPoints = [
      // Bottom edge (Structured, -Z)
      new THREE.Vector3(-halfSize, boundaryY, -halfSize),
      new THREE.Vector3(halfSize, boundaryY, -halfSize),
      // Right edge (Social, +X)
      new THREE.Vector3(halfSize, boundaryY, -halfSize),
      new THREE.Vector3(halfSize, boundaryY, halfSize),
      // Top edge (Emergent, +Z)
      new THREE.Vector3(halfSize, boundaryY, halfSize),
      new THREE.Vector3(-halfSize, boundaryY, halfSize),
      // Left edge (Functional, -X)
      new THREE.Vector3(-halfSize, boundaryY, halfSize),
      new THREE.Vector3(-halfSize, boundaryY, -halfSize)
    ];

    const boundaryGeom = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({
      color: COLORS.accent,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    const boundaryFrame = new THREE.LineSegments(boundaryGeom, boundaryMat);
    scene.add(boundaryFrame);

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
        new THREE.Vector3(corner.x, 0, corner.z),
        new THREE.Vector3(corner.x, postHeight, corner.z)
      ]);
      const postMat = new THREE.LineBasicMaterial({
        color: COLORS.accent,
        transparent: true,
        opacity: 0.5
      });
      const post = new THREE.Line(postGeom, postMat);
      scene.add(post);
    });

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (cameraRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
      if (rendererRef.current) {
        rendererRef.current.setSize(w, h);
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
      chromaPassRef.current = null;
      rgbPassRef.current = null;
      bokehPassRef.current = null;

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

  // Create/update terrain mesh (subtle base)
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
      emissive: new THREE.Color(0x223344),
      emissiveIntensity: LIGHTING_CONFIG.TERRAIN_EMISSIVE_INTENSITY
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, 0, 0); // Explicitly center at origin
    terrain.visible = false; // Hidden - only showing contours
    scene.add(terrain);
    terrainRef.current = terrain;

  }, [heightmap, size, terrainSize, terrainHeight]);

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
      const color = isIndex ? COLORS.contour.index : (isMajor ? COLORS.contour.major : COLORS.contour.minor);
      const baseOpacity = isIndex ? 1.0 : (isMajor ? 0.9 : 0.85);

      // Create geometry from line segments
      const points: THREE.Vector3[] = [];
      lines.forEach(segment => {
        const [p1, p2] = segment;

        // Convert grid coords to world coords
        const x1 = (p1.x / size - 0.5) * terrainSize;
        const z1 = (p1.y / size - 0.5) * terrainSize;
        const y1 = elevation * terrainHeight + 0.02; // Slight offset above terrain

        const x2 = (p2.x / size - 0.5) * terrainSize;
        const z2 = (p2.y / size - 0.5) * terrainSize;
        const y2 = elevation * terrainHeight + 0.02;

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

  }, [contours, showContours, size, terrainSize, terrainHeight]);

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
      const marker = createMarkerGroup(point, idx, terrainSize, terrainHeight);
      scene.add(marker.group);
      markersRef.current.push(marker);
    });

    // Create path line
    if (visiblePoints.length >= 2) {
      const pathGeom = new THREE.BufferGeometry();
      const pathPositions = visiblePoints.flatMap(p => {
        // Use PAD-based height if available, otherwise use terrain height
        let yPosition: number;
        if (p.padHeight !== undefined) {
          const baseTerrainY = p.height * terrainHeight;
          const padOffset = (p.padHeight - 0.5) * terrainHeight * 0.8;
          yPosition = baseTerrainY + padOffset + MARKER_CONFIG.PATH_Y_OFFSET;
        } else {
          yPosition = p.height * terrainHeight + MARKER_CONFIG.PATH_Y_OFFSET;
        }

        return [
          (p.x - 0.5) * terrainSize,
          yPosition,
          (p.y - 0.5) * terrainSize
        ];
      });
      pathGeom.setAttribute('position', new THREE.Float32BufferAttribute(pathPositions, 3));

      const pathMat = new THREE.LineDashedMaterial({
        color: COLORS.path,
        dashSize: MARKER_CONFIG.PATH_DASH_SIZE,
        gapSize: MARKER_CONFIG.PATH_GAP_SIZE,
        transparent: true,
        opacity: 1.0,
        linewidth: 2
      });

      const pathLine = new THREE.Line(pathGeom, pathMat);
      pathLine.computeLineDistances();
      scene.add(pathLine);
      pathLineRef.current = pathLine;
    }

  }, [pathPoints, timelineProgress, terrainSize, terrainHeight]);

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

    // Position the group at the conversation's center
    group.position.set(worldX, 0, worldZ);
    scene.add(group);
    projectionMarkerRef.current = group;

  }, [pathPoints, terrainSize, terrainHeight]);

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

      // Calculate center of visible path points
      const visiblePoints = pathPoints.slice(0, Math.ceil(pathPoints.length * timelineProgress));
      let centerX = 0;
      let centerZ = 0;
      let centerY = 1; // Default height
      
      if (visiblePoints.length > 0) {
        // Calculate average position of path points in world space
        const worldPositions = visiblePoints.map(p => ({
          x: (p.x - 0.5) * terrainSize,
          z: (p.y - 0.5) * terrainSize,
          y: p.height * terrainHeight
        }));
        
        centerX = worldPositions.reduce((sum, p) => sum + p.x, 0) / worldPositions.length;
        centerZ = worldPositions.reduce((sum, p) => sum + p.z, 0) / worldPositions.length;
        centerY = worldPositions.reduce((sum, p) => sum + p.y, 0) / worldPositions.length + 1; // Add offset for better view
      }

      // Camera position with user-controlled rotation around Y-axis
      // Rotate around the path center based on drag input
      const radius = ANIMATION_CONFIG.ORBIT_RADIUS;
      const angle = rotationYRef.current;
      camera.position.x = centerX + Math.sin(angle) * radius;
      camera.position.z = centerZ + Math.cos(angle) * radius;
      camera.position.y = ANIMATION_CONFIG.CAMERA_Y_BASE;
      camera.lookAt(centerX, centerY, centerZ);

      // Animate markers
      markersRef.current.forEach((m, idx) => {
        if (!m) return;

        const isHovered = hoveredPoint === idx;
        const isLocked = lockedPoint === idx;
        const isActive = isHovered || isLocked;

        const pulse = Math.sin(timeRef.current * ANIMATION_CONFIG.PULSE_FREQUENCY + idx * ANIMATION_CONFIG.PULSE_PHASE_SHIFT) * 0.5 + 0.5;

        const targetScale = isActive ? ANIMATION_CONFIG.MARKER_HOVER_SCALE : ANIMATION_CONFIG.MARKER_NORMAL_SCALE;
        const currentScale = m.head.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * ANIMATION_CONFIG.SCALE_LERP_SPEED;
        m.head.scale.setScalar(newScale);
        m.glow.scale.setScalar(newScale * 1.2);

        if (m.glow.material instanceof THREE.MeshBasicMaterial) {
          m.glow.material.opacity = isActive ? 0.5 + pulse * 0.2 : 0.2 + pulse * 0.1;
        }
        m.group.position.y = m.baseY + Math.sin(timeRef.current * ANIMATION_CONFIG.MARKER_FLOAT_FREQUENCY + idx) * ANIMATION_CONFIG.MARKER_FLOAT_AMPLITUDE;
      });

      // Animate contour lines with pulsing effect (throttled for performance)
      if (frameCount % ANIMATION_CONFIG.CONTOUR_ANIMATION_THROTTLE === 0) {
        contoursRef.current.forEach((contour) => {
          if (!contour || !contour.userData) return;

          const { baseOpacity, elevation, isIndex, isMajor, contourIdx } = contour.userData as {
            baseOpacity: number;
            elevation: number;
            isIndex: boolean;
            isMajor: boolean;
            contourIdx: number;
          };

          // Create wave-like pulsing patterns based on elevation and type
          // Index lines pulse slower and more prominently
          const speed = isIndex ? 1.0 : (isMajor ? 1.5 : 2.0);
          const amplitude = isIndex ? 0.25 : (isMajor ? 0.15 : 0.10);

          // Create traveling wave effect based on elevation
          const phase = elevation * Math.PI * 2;
          const pulse = Math.sin(timeRef.current * speed + phase) * 0.5 + 0.5;

          // Additional slow wave for variation
          const slowWave = Math.sin(timeRef.current * 0.3 + contourIdx * 0.2) * 0.5 + 0.5;

          // Combine pulses for more organic effect
          const finalPulse = pulse * 0.7 + slowWave * 0.3;

          // Apply opacity animation
          const targetOpacity = baseOpacity * (1 - amplitude + amplitude * finalPulse);
          if (contour.material instanceof THREE.LineBasicMaterial) {
            contour.material.opacity = targetOpacity;
          }
        });
      }

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

        // Chromatic aberration
        const chromaPass = new ShaderPass(ChromaticAberrationShader);
        chromaPass.uniforms.amount.value = 0.0;
        chromaPass.uniforms.angle.value = Math.PI / 4;
        chromaPass.enabled = true;
        composer.addPass(chromaPass);
        chromaPassRef.current = chromaPass;

        // RGB shift
        const rgbPass = new ShaderPass(RGBShiftShader);
        rgbPass.uniforms.amount.value = 0.0;
        rgbPass.uniforms.angle.value = Math.PI / 3;
        rgbPass.enabled = true;
        composer.addPass(rgbPass);
        rgbPassRef.current = rgbPass;

        // Depth of field (bokeh)
        const bokehPass = new BokehPass(
          scene,
          camera,
          {
            focus: POST_PROCESSING_CONFIG.BOKEH_FOCUS,
            aperture: 0.0,
            maxblur: 0.0
          }
        );
        bokehPass.enabled = true;
        composer.addPass(bokehPass);
        bokehPassRef.current = bokehPass;

        composerRef.current = composer;
      }

      // Update post-processing effects based on locked point
      const composer = composerRef.current;
      const chromaPass = chromaPassRef.current;
      const rgbPass = rgbPassRef.current;
      const bokehPass = bokehPassRef.current;

      if (composer && chromaPass && rgbPass && bokehPass) {
        // Target intensity based on whether a point is locked
        const targetIntensity = lockedPoint !== null ? 1.0 : 0.0;

        // Smooth transition
        const prevIntensity = effectIntensityRef.current;
        effectIntensityRef.current += (targetIntensity - effectIntensityRef.current) * POST_PROCESSING_CONFIG.EFFECT_INTENSITY_LERP;
        const intensity = effectIntensityRef.current;

        // Only update uniforms if intensity changed significantly or if actively animating
        if (Math.abs(intensity - prevIntensity) > 0.001 || intensity > 0.01) {
          // Animate effects when point is locked
          if (intensity > 0.01) {
            const pulse = Math.sin(timeRef.current * 3.0) * 0.5 + 0.5;

            // Chromatic aberration
            chromaPass.uniforms.amount.value = POST_PROCESSING_CONFIG.CHROMA_AMOUNT_MAX * intensity * (0.8 + pulse * 0.4);
            chromaPass.uniforms.angle.value = timeRef.current * 0.5;

            // RGB shift
            rgbPass.uniforms.amount.value = POST_PROCESSING_CONFIG.RGB_SHIFT_AMOUNT_MAX * intensity * (0.7 + pulse * 0.3);
            rgbPass.uniforms.angle.value = timeRef.current * 0.3;

            // Depth of field
            (bokehPass.uniforms as any).aperture.value = POST_PROCESSING_CONFIG.BOKEH_APERTURE_MAX * intensity;
            (bokehPass.uniforms as any).maxblur.value = POST_PROCESSING_CONFIG.BOKEH_MAXBLUR_MAX * intensity;
          } else if (intensity < 0.01 && prevIntensity >= 0.01) {
            // Only update to zero once when transitioning to inactive
            chromaPass.uniforms.amount.value = 0.0;
            rgbPass.uniforms.amount.value = 0.0;
            (bokehPass.uniforms as any).aperture.value = 0.0;
            (bokehPass.uniforms as any).maxblur.value = 0.0;
          }
        }

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
  }, [hoveredPoint, lockedPoint, onPointHover]);

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

      // Subtle color gradient
      const color = new THREE.Color().lerpColors(
        COLORS.terrain.low,
        h > 0.6 ? COLORS.terrain.high : COLORS.terrain.mid,
        h * 0.7
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
  terrainHeight: number
): { group: THREE.Group; head: THREE.Mesh; glow: THREE.Mesh; pole: THREE.Line; base: THREE.Mesh; hitbox: THREE.Mesh; baseY: number } {
  const group = new THREE.Group();

  const worldX = (point.x - 0.5) * terrainSize;
  const worldZ = (point.y - 0.5) * terrainSize;

  // Use PAD-based height if available (affective/evaluative lens)
  // High emotional intensity (frustration) = peaks, low (affiliation) = valleys
  let worldY: number;
  if (point.padHeight !== undefined) {
    // PAD-based height: emotionalIntensity determines height above/below terrain
    // Scale: 0.5 = terrain level, 1.0 = peak (frustration), 0.0 = valley (affiliation)
    const baseTerrainY = point.height * terrainHeight;
    const padOffset = (point.padHeight - 0.5) * terrainHeight * 0.8; // -0.4 to +0.4 range
    worldY = baseTerrainY + padOffset;
  } else {
    // Fallback: use terrain height
    worldY = point.height * terrainHeight;
  }

  // Determine colors based on role (user vs assistant)
  // Primary distinction: user = cyan/blue, assistant = orange/yellow
  let markerColor: string;
  let glowColor: string;

  if (point.role === 'user') {
    // User messages: always cyan/blue for clear distinction
    markerColor = COLORS.userMarker;
    glowColor = COLORS.userMarkerGlow;
  } else if (point.role === 'assistant') {
    // Assistant messages: always orange/yellow for clear distinction
    markerColor = COLORS.assistantMarker;
    glowColor = COLORS.assistantMarkerGlow;
  } else {
    // Fallback: use functional/social distinction
    const isFunctional = point.communicationFunction < 0.5;
    markerColor = isFunctional ? COLORS.userMarker : COLORS.assistantMarker;
    glowColor = isFunctional ? COLORS.userMarkerGlow : COLORS.assistantMarkerGlow;
  }

  // Vertical pole
  const poleGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, MARKER_CONFIG.POLE_HEIGHT, 0)
  ]);
  const poleMat = new THREE.LineBasicMaterial({
    color: markerColor,
    transparent: true,
    opacity: 0.6
  });
  const pole = new THREE.Line(poleGeom, poleMat);
  group.add(pole);

  // Marker head
  const headGeom = new THREE.SphereGeometry(
    MARKER_CONFIG.HEAD_RADIUS,
    MARKER_CONFIG.HEAD_SEGMENTS.width,
    MARKER_CONFIG.HEAD_SEGMENTS.height
  );
  const headMat = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.9
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = MARKER_CONFIG.POLE_HEIGHT;
  group.add(head);

  // Glow ring
  const glowGeom = new THREE.RingGeometry(
    MARKER_CONFIG.GLOW_INNER_RADIUS,
    MARKER_CONFIG.GLOW_OUTER_RADIUS,
    MARKER_CONFIG.GLOW_SEGMENTS
  );
  const glowMat = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = MARKER_CONFIG.POLE_HEIGHT;
  group.add(glow);

  // Base marker
  const baseGeom = new THREE.CircleGeometry(
    MARKER_CONFIG.BASE_RADIUS,
    MARKER_CONFIG.BASE_SEGMENTS
  );
  const baseMat = new THREE.MeshBasicMaterial({
    color: markerColor,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.03;
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

