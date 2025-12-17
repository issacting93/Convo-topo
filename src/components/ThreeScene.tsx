import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import type { Contour, PathPoint } from '../utils/terrain';
import { COLORS, ChromaticAberrationShader, RGBShiftShader, getColorForRole } from '../utils/constants';

interface ThreeSceneProps {
  heightmap: Float32Array;
  pathPoints: PathPoint[];
  comparisonPathPoints?: PathPoint[];
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
  comparisonPathPoints,
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
  const comparisonMarkersRef = useRef<MarkerRef[]>([]);
  const pathLineRef = useRef<THREE.Line | null>(null);
  const comparisonPathLineRef = useRef<THREE.Line | null>(null);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  const contoursRef = useRef<THREE.LineSegments[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const composerRef = useRef<EffectComposer | null>(null);
  const chromaPassRef = useRef<ShaderPass | null>(null);
  const rgbPassRef = useRef<ShaderPass | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const effectIntensityRef = useRef(0);

  const size = Math.sqrt(heightmap.length);
  const terrainSize = 10;
  // Increase vertical scale so height differences (especially deep) are visible
  const terrainHeight = 6.0; // Increased from 3.5 for more dramatic peaks

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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    // Limit pixel ratio to 1.5 for better performance (especially on retina displays)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light - increased for better terrain visibility
    const ambient = new THREE.AmbientLight(0x445566, 1.2);
    scene.add(ambient);

    // Directional light - increased intensity
    const dirLight = new THREE.DirectionalLight(0xaaccdd, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Add another light from opposite side for better terrain definition
    const dirLight2 = new THREE.DirectionalLight(0x6688aa, 0.6);
    dirLight2.position.set(-5, 8, -5);
    scene.add(dirLight2);

    // Floor grid - subtle
    const gridHelper = new THREE.GridHelper(
      terrainSize * 1.4,
      28,
      COLORS.grid,
      COLORS.gridDim
    );
    gridHelper.position.y = -0.02;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    scene.add(gridHelper);

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
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    const handleClick = () => {
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

    const segments = size - 1;
    const geometry = new THREE.PlaneGeometry(
      terrainSize, terrainSize,
      segments, segments
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
        // Brighten terrain colors significantly to make the surface very visible
        const brighten = 3.5;
        colors[vertIdx] = Math.min(1, color.r * brighten);
        colors[vertIdx + 1] = Math.min(1, color.g * brighten);
        colors[vertIdx + 2] = Math.min(1, color.b * brighten);
      }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // Solid mesh with visible coloring (base layer)
    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: false, // Make fully opaque for maximum visibility
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x223344), // Add slight self-illumination
      emissiveIntensity: 0.2
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = 0;
    terrain.visible = false; // Hide terrain surface - show only contours
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
      const baseOpacity = isIndex ? 1.0 : (isMajor ? 0.95 : 0.75);

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
        linewidth: isMajor ? 2 : 1
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
    // SAFETY LIMIT: Never render more than 50 markers to prevent performance issues
    const maxMarkers = 50;
    const limitedCount = Math.min(visibleCount, maxMarkers);
    const visiblePoints = pathPoints.slice(0, limitedCount);

    // Create markers
    visiblePoints.forEach((point, idx) => {
      const group = new THREE.Group();

      const worldX = (point.x - 0.5) * terrainSize;
      const worldZ = (point.y - 0.5) * terrainSize;
      const worldY = point.height * terrainHeight;

      // PRIORITY: Use role-based color encoding (user projections)
      // Color represents how the user positioned themselves or the AI
      let markerColor = COLORS.marker;
      let glowColor = COLORS.markerGlow;
      
      if (point.role === 'user' && point.humanRole) {
        // User messages: color by human role (user positioning)
        markerColor = getColorForRole(point.humanRole);
        // Slightly brighter glow
        const baseColor = new THREE.Color(markerColor);
        baseColor.lerp(new THREE.Color(1, 1, 1), 0.3);
        glowColor = '#' + baseColor.getHexString();
      } else if (point.role === 'assistant' && point.aiRole) {
        // AI messages: color by AI role (how user positioned AI)
        markerColor = getColorForRole(point.aiRole);
        // Slightly brighter glow
        const baseColor = new THREE.Color(markerColor);
        baseColor.lerp(new THREE.Color(1, 1, 1), 0.3);
        glowColor = '#' + baseColor.getHexString();
      } else {
        // Fallback: use communication function if no role data
        const isFunctional = point.communicationFunction < 0.5;
        markerColor = isFunctional ? '#44ff66' : '#ffaa00';
        glowColor = isFunctional ? '#66ff88' : '#ffcc44';
      }

      // Vertical pole
      const poleHeight = 2.0;
      const poleGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, poleHeight, 0)
      ]);
      const poleMat = new THREE.LineBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.6
      });
      const pole = new THREE.Line(poleGeom, poleMat);
      group.add(pole);

      // Marker head (small sphere)
      const headGeom = new THREE.SphereGeometry(0.12, 16, 12);
      const headMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.9
      });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.y = poleHeight;
      group.add(head);

      // Glow ring
      const glowGeom = new THREE.RingGeometry(0.2, 0.35, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = poleHeight;
      group.add(glow);

      // Base marker on terrain
      const baseGeom = new THREE.CircleGeometry(0.15, 16);
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
      const hitboxGeom = new THREE.CylinderGeometry(0.3, 0.3, poleHeight + 0.5, 8);
      const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
      hitbox.position.y = poleHeight / 2;
      hitbox.userData.index = idx;
      group.add(hitbox);

      group.position.set(worldX, worldY, worldZ);
      scene.add(group);

      markersRef.current.push({
        group,
        head,
        glow,
        pole,
        base,
        hitbox,
        baseY: worldY
      });
    });

    // Create path line
    if (visiblePoints.length >= 2) {
      const pathGeom = new THREE.BufferGeometry();
      const pathPositions = visiblePoints.flatMap(p => [
        (p.x - 0.5) * terrainSize,
        p.height * terrainHeight + 0.05,
        (p.y - 0.5) * terrainSize
      ]);
      pathGeom.setAttribute('position', new THREE.Float32BufferAttribute(pathPositions, 3));

      const pathMat = new THREE.LineDashedMaterial({
        color: COLORS.path,
        dashSize: 0.25,
        gapSize: 0.12,
        transparent: true,
        opacity: 0.85
      });

      const pathLine = new THREE.Line(pathGeom, pathMat);
      pathLine.computeLineDistances();
      scene.add(pathLine);
      pathLineRef.current = pathLine;
    }

  }, [pathPoints, timelineProgress, terrainSize, terrainHeight]);

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
      timeRef.current += 0.016;
      frameCount++;

      // Slow camera orbit
      const orbitSpeed = 0.04;
      const radius = 15;
      camera.position.x = Math.sin(timeRef.current * orbitSpeed) * radius;
      camera.position.z = Math.cos(timeRef.current * orbitSpeed) * radius;
      camera.position.y = 9 + Math.sin(timeRef.current * 0.08) * 1.5;
      camera.lookAt(0, 1, 0);

      // Animate markers
      markersRef.current.forEach((m, idx) => {
        if (!m) return;

        const isHovered = hoveredPoint === idx;
        const isLocked = lockedPoint === idx;
        const isActive = isHovered || isLocked;

        const pulse = Math.sin(timeRef.current * 2.5 + idx * 0.5) * 0.5 + 0.5;

        const targetScale = isActive ? 1.4 : 1;
        const currentScale = m.head.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.1;
        m.head.scale.setScalar(newScale);
        m.glow.scale.setScalar(newScale * 1.2);

        if (m.glow.material instanceof THREE.MeshBasicMaterial) {
          m.glow.material.opacity = isActive ? 0.5 + pulse * 0.2 : 0.2 + pulse * 0.1;
        }
        m.group.position.y = m.baseY + Math.sin(timeRef.current * 1.5 + idx) * 0.03;
      });

      // Animate contour lines with pulsing effect (throttled for performance)
      if (frameCount % 2 === 0) {
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

      // Raycast for hover (throttled to every 3 frames for performance)
      if (frameCount % 3 === 0) {
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
          new THREE.Vector2(width / 2, height / 2), // Half resolution for performance
          0.3, // strength
          0.4, // radius
          0.85 // threshold
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
            focus: 15.0,
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
        effectIntensityRef.current += (targetIntensity - effectIntensityRef.current) * 0.05;
        const intensity = effectIntensityRef.current;

        // Only update uniforms if intensity changed significantly or if actively animating
        if (Math.abs(intensity - prevIntensity) > 0.001 || intensity > 0.01) {
          // Animate effects when point is locked
          if (intensity > 0.01) {
            const pulse = Math.sin(timeRef.current * 3.0) * 0.5 + 0.5;

            // Chromatic aberration
            chromaPass.uniforms.amount.value = 0.003 * intensity * (0.8 + pulse * 0.4);
            chromaPass.uniforms.angle.value = timeRef.current * 0.5;

            // RGB shift
            rgbPass.uniforms.amount.value = 0.004 * intensity * (0.7 + pulse * 0.3);
            rgbPass.uniforms.angle.value = timeRef.current * 0.3;

            // Depth of field
            (bokehPass.uniforms as any).aperture.value = 0.00015 * intensity;
            (bokehPass.uniforms as any).maxblur.value = 0.005 * intensity;
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

