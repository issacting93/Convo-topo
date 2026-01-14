import { useMemo } from 'react';
import { ThreeScene } from '../ThreeScene/index';
import { generateHeightmap, generatePathPoints } from '../../utils/terrain';
import { getTerrainParams } from '../../utils/conversationToTerrain';

const TERRAIN_SIZE = 64;

export function OverviewContainer({ conversation }: { conversation: any }) {
    const params = useMemo(() => getTerrainParams(conversation), [conversation]);
    const heightmap = useMemo(() => generateHeightmap(TERRAIN_SIZE, 42, params), [params]);
    const pathPoints = useMemo(() => generatePathPoints(heightmap, TERRAIN_SIZE, conversation.messages.length, conversation.messages), [heightmap, conversation]);

    return (
        <ThreeScene
            heightmap={heightmap}
            pathPoints={pathPoints}
            contours={[]}
            hoveredPoint={null}
            lockedPoint={null}
            timelineProgress={1}
            showContours={true}
            showTerrain={true}
            showMarkers={false}
            showPaths={true}
            terrainPosition={{ x: 0, y: 0, z: 0 }}
            cameraView="default"
            backgroundColor="#030213"
            onPointHover={() => { }}
            onPointClick={() => { }}
        />
    );
}
