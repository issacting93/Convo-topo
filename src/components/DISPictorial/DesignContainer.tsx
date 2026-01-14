import { useState, useMemo } from 'react';
import { HUDOverlay } from '../HUDOverlay';
import { generateHeightmap, generatePathPoints } from '../../utils/terrain';
import { getTerrainParams } from '../../utils/conversationToTerrain';

const TERRAIN_SIZE = 64;

export function DesignContainer({ conversation }: { conversation: any }) {
    const params = useMemo(() => getTerrainParams(conversation), [conversation]);
    const heightmap = useMemo(() => generateHeightmap(TERRAIN_SIZE, 42, params), [params]);
    const pathPoints = useMemo(() => generatePathPoints(heightmap, TERRAIN_SIZE, conversation.messages.length, conversation.messages), [heightmap, conversation]);

    // Default mock state for HUD
    const [progress, setProgress] = useState(0.7);
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Background hint */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
                opacity: 0.1
            }} />

            <HUDOverlay
                pathPoints={pathPoints}
                comparisonPathPoints={[]}
                hoveredPoint={hovered}
                lockedPoint={null}
                timelineProgress={progress}
                onTimelineChange={setProgress}
                onBackToGrid={() => { }}
                selectedConversation={conversation}
                cameraView="default"
                onPointClick={(idx) => setHovered(idx)}
            />
        </div>
    );
}
