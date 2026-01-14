import { useMemo } from 'react';
import { ThreeScene } from '../ThreeScene/index';
import { generateHeightmap, generatePathPoints } from '../../utils/terrain';
import { getTerrainParams } from '../../utils/conversationToTerrain';

const TERRAIN_SIZE = 64;

export function ComparisonContainer({ conversations }: { conversations: any[] }) {
    // Select two contrasting conversations
    // Ideally these would be specific IDs from the findings (e.g. Calm vs Volatile)
    // For now, we pick index 0 and index 1 (or any two that exist)
    const conv1 = conversations[0];
    // Try to find a longer one for contrast if possible
    const conv2 = conversations.length > 5 ? conversations[5] : (conversations[1] || conversations[0]);

    const data1 = useMemo(() => {
        if (!conv1) return null;
        const params = getTerrainParams(conv1);
        const h = generateHeightmap(TERRAIN_SIZE, 42, params);
        const p = generatePathPoints(h, TERRAIN_SIZE, conv1.messages.length, conv1.messages);
        return { h, p };
    }, [conv1]);

    const data2 = useMemo(() => {
        if (!conv2) return null;
        const params = getTerrainParams(conv2);
        const h = generateHeightmap(TERRAIN_SIZE, 43, params); // Varied seed
        const p = generatePathPoints(h, TERRAIN_SIZE, conv2.messages.length, conv2.messages);
        return { h, p };
    }, [conv2]);

    if (!data1 || !data2) return <div>Not enough conversations for comparison</div>;

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, position: 'relative', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>CASE A</div>
                    <div style={{ color: '#fff' }}>{conv1.title || conv1.id?.slice(0, 8)}</div>
                </div>
                <ThreeScene
                    heightmap={data1.h}
                    pathPoints={data1.p}
                    contours={[]}
                    hoveredPoint={null}
                    lockedPoint={null}
                    timelineProgress={1}
                    showContours={true}
                    showTerrain={true}
                    showMarkers={false}
                    showPaths={true}
                    terrainPosition={{ x: 0, y: 0, z: 0 }}
                    cameraView="top"
                    backgroundColor="#030213"
                    onPointHover={() => { }}
                    onPointClick={() => { }}
                />
            </div>

            {/* Right Panel */}
            <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>CASE B</div>
                    <div style={{ color: '#fff' }}>{conv2.title || conv2.id?.slice(0, 8)}</div>
                </div>
                <ThreeScene
                    heightmap={data2.h}
                    pathPoints={data2.p}
                    contours={[]}
                    hoveredPoint={null}
                    lockedPoint={null}
                    timelineProgress={1}
                    showContours={true}
                    showTerrain={true}
                    showMarkers={false}
                    showPaths={true}
                    terrainPosition={{ x: 0, y: 0, z: 0 }}
                    cameraView="top"
                    backgroundColor="#030213"
                    onPointHover={() => { }}
                    onPointClick={() => { }}
                />
            </div>
        </div>
    );
}
