import { useState, useEffect, useMemo } from 'react';
import { ThreeScene } from '../ThreeScene/index';
import { generateHeightmap, generatePathPoints } from '../../utils/terrain';
import { getTerrainParams } from '../../utils/conversationToTerrain';

const TERRAIN_SIZE = 64;

export function TrajectoryContainer({ conversation }: { conversation: any }) {
    const params = useMemo(() => getTerrainParams(conversation), [conversation]);
    const heightmap = useMemo(() => generateHeightmap(TERRAIN_SIZE, 42, params), [params]);
    const pathPoints = useMemo(() => generatePathPoints(heightmap, TERRAIN_SIZE, conversation.messages.length, conversation.messages), [heightmap, conversation]);

    // Auto-animate
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let p = 0;
        const interval = setInterval(() => {
            p += 0.005;
            if (p > 1.2) p = 0; // Loop with a pause at the end
            setProgress(Math.min(p, 1));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <ThreeScene
            heightmap={heightmap}
            pathPoints={pathPoints}
            contours={[]}
            hoveredPoint={null}
            lockedPoint={null}
            timelineProgress={progress} // Animated progress!
            showContours={true}
            showTerrain={true}
            showMarkers={true} // Show marker at tip
            showPaths={true}
            terrainPosition={{ x: 0, y: 0, z: 0 }}
            cameraView="side"
            backgroundColor="#030213"
            onPointHover={() => { }}
            onPointClick={() => { }}
        />
    );
}
