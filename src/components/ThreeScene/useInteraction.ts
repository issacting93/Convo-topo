import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface UseInteractionProps {
    rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
    cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>;
    markersRef: React.MutableRefObject<any[]>; // MarkerRef[]
    onPointClick: (index: number) => void;
    onPointHover: (index: number | null) => void;
}

export function useInteraction({
    rendererRef,
    cameraRef,
    markersRef,
    onPointClick,
    onPointHover: _onPointHover // Rename to underscore to ignore unused
}: UseInteractionProps) {
    const mouseRef = useRef(new THREE.Vector2());
    const raycasterRef = useRef(new THREE.Raycaster());
    const rotationYRef = useRef(0);
    const isDraggingRef = useRef(false);
    const lastMouseXRef = useRef(0);

    useEffect(() => {
        const renderer = rendererRef.current;
        if (!renderer) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            // Standard normalized device coordinates
            const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const normalizedY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            mouseRef.current.x = normalizedX;
            mouseRef.current.y = normalizedY;

            // Handle rotation drag
            if (isDraggingRef.current) {
                const deltaX = e.clientX - lastMouseXRef.current;
                const rotationSpeed = 0.005;
                rotationYRef.current -= deltaX * rotationSpeed;
                lastMouseXRef.current = e.clientX;
            }

            // Handle Hover (Raycasting)
            // Note: In original code, hover logic might have been in animate loop or handleMouseMove?
            // Actually, `onPointHover` was passed but I don't see it used in `handleMouseMove` in my previous snippet.
            // Let me check if it was in `animate`.
            // Yes, typically raycasting for hover is done in animate or throttled move.
            // I'll keep the refs here and let the animator use them or implement a local throttled check.
            // In the original file, line 1382 'animate' loop had raycasting logic?
            // "RAYCAST_THROTTLE" suggests it was in loop.
            // So `useInteraction` just tracks mouse state. 
            // BUT `handleClick` does independent raycasting.
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                isDraggingRef.current = true;
                lastMouseXRef.current = e.clientX;
                renderer.domElement.style.cursor = 'grabbing';
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            renderer.domElement.style.cursor = 'default';
        };

        const handleClick = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                e.preventDefault();
                return;
            }
            if (!raycasterRef.current || !cameraRef.current) return;

            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
            // We need access to hitboxes or markers. markersRef contains groups with hitboxes?
            // markersRef items have .hitbox property.
            const hitboxes = markersRef.current.filter(m => m).map(m => m.hitbox).filter(Boolean);

            const intersects = raycasterRef.current.intersectObjects(hitboxes, false);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData && object.userData.index !== undefined) {
                    onPointClick(object.userData.index);
                }
            }
        };

        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('mouseleave', handleMouseUp);
        renderer.domElement.addEventListener('click', handleClick);

        return () => {
            if (renderer && renderer.domElement) {
                renderer.domElement.removeEventListener('mousemove', handleMouseMove);
                renderer.domElement.removeEventListener('mousedown', handleMouseDown);
                renderer.domElement.removeEventListener('mouseup', handleMouseUp);
                renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
                renderer.domElement.removeEventListener('click', handleClick);
            }
        };
    }, [rendererRef, cameraRef, markersRef, onPointClick]);

    return { mouseRef, raycasterRef, rotationYRef, isDraggingRef };
}
