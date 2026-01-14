import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export function EncodingContainer() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ExplodedAxesScene />
            {/* HTML Overlay for Labels */}
            <div style={{ position: 'absolute', top: '15%', left: '15%', color: '#ff6b6b', fontWeight: 'bold', fontFamily: 'monospace' }}>Social ↔ Functional (X)</div>
            <div style={{ position: 'absolute', top: '15%', right: '15%', color: '#4ecdc4', fontWeight: 'bold', fontFamily: 'monospace' }}>Linguistic Alignment (Z)</div>
            <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', color: '#ffe66d', fontWeight: 'bold', fontFamily: 'monospace' }}>Affective Intensity (Y/Height)</div>
        </div>
    );
}

function ExplodedAxesScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Init
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color('#030213');

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(20, 20, 20);
        camera.lookAt(0, 5, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- Content ---

        // Grid Helper (Subtle floor)
        const grid = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
        scene.add(grid);

        // Custom Axes Vectors
        // X: Social <-> Functional (Redish)
        const xGeo = new LineGeometry();
        xGeo.setPositions([-10, 0, 0, 10, 0, 0]);
        const xMat = new LineMaterial({ color: 0xff6b6b, linewidth: 4, resolution: new THREE.Vector2(width, height) });
        scene.add(new Line2(xGeo, xMat));

        // Z: Alignment (Tealish)
        const zGeo = new LineGeometry();
        zGeo.setPositions([0, 0, -10, 0, 0, 10]);
        const zMat = new LineMaterial({ color: 0x4ecdc4, linewidth: 4, resolution: new THREE.Vector2(width, height) });
        scene.add(new Line2(zGeo, zMat));

        // Y: Affect (Yellowish)
        const yGeo = new LineGeometry();
        yGeo.setPositions([0, 0, 0, 0, 15, 0]);
        const yMat = new LineMaterial({ color: 0xffe66d, linewidth: 4, resolution: new THREE.Vector2(width, height) });
        scene.add(new Line2(yGeo, yMat));

        // Representative Point
        const pointGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const point = new THREE.Mesh(pointGeo, pointMat);
        const pLoc = { x: 5, y: 8, z: 5 };
        point.position.set(pLoc.x, pLoc.y, pLoc.z);
        scene.add(point);

        // Projection Lines (Dashed?)
        const projMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

        // Vertical Drop Line
        const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pLoc.x, pLoc.y, pLoc.z),
            new THREE.Vector3(pLoc.x, 0, pLoc.z)
        ]);
        scene.add(new THREE.Line(dropLineGeo, projMat));

        // Floor X Projection
        const floorXGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pLoc.x, 0, pLoc.z),
            new THREE.Vector3(pLoc.x, 0, 0)
        ]);
        scene.add(new THREE.Line(floorXGeo, projMat));

        // Floor Z Projection
        const floorZGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pLoc.x, 0, pLoc.z),
            new THREE.Vector3(0, 0, pLoc.z)
        ]);
        scene.add(new THREE.Line(floorZGeo, projMat));

        // Animation Loop
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (containerRef.current && renderer.domElement) {
                controls.update();

                // Resolution update logic for fat lines
                if (xMat) xMat.resolution.set(containerRef.current.clientWidth, containerRef.current.clientHeight);
                if (yMat) yMat.resolution.set(containerRef.current.clientWidth, containerRef.current.clientHeight);
                if (zMat) zMat.resolution.set(containerRef.current.clientWidth, containerRef.current.clientHeight);

                renderer.render(scene, camera);
            }
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.forceContextLoss();
            renderer.dispose();
            xGeo.dispose(); xMat.dispose();
            yGeo.dispose(); yMat.dispose();
            zGeo.dispose(); zMat.dispose();
            controls.dispose();
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
