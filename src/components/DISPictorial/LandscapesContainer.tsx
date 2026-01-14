import { useMemo } from 'react';
import { ThreeScene } from '../ThreeScene/index';
import { generateHeightmap, generatePathPoints, generatePathCoordinates, generateContours } from '../../utils/terrain';
import { getCommunicationFunction, getConversationStructure } from '../../utils/coordinates';

const TERRAIN_SIZE = 64;

export function LandscapesContainer({ conversations }: { conversations: any[] }) {
    // Generate multi-path data
    // Generate density-based aggregate heightmap
    const { heightmap, paths, contours } = useMemo(() => {
        if (conversations.length === 0) return { heightmap: new Float32Array(TERRAIN_SIZE * TERRAIN_SIZE), paths: [], contours: [] };

        const densityMap = new Float32Array(TERRAIN_SIZE * TERRAIN_SIZE).fill(0);
        const countMap = new Float32Array(TERRAIN_SIZE * TERRAIN_SIZE).fill(0);

        // 1. Pre-calculate 2D coordinates for all conversations
        const allPaths = conversations.map(conv => {
            const commFunc = getCommunicationFunction(conv);
            const convStruct = getConversationStructure(conv);
            // Enrich messages with interaction coordinates
            const enrichedMessages = conv.messages.map((msg: any) => ({
                ...msg,
                communicationFunction: commFunc,
                conversationStructure: convStruct,
            }));

            return {
                conv,
                points: generatePathCoordinates(enrichedMessages)
            };
        });

        // 2. Accumulate density
        allPaths.forEach(({ points }) => {
            points.forEach(pt => {
                const intensity = pt.pad?.emotionalIntensity ?? (pt.analysis.expressiveScore * 0.8);
                const gridX = Math.floor(pt.x * (TERRAIN_SIZE - 1));
                const gridY = Math.floor(pt.y * (TERRAIN_SIZE - 1));

                // Gaussian spread
                const radius = 2;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = gridX + dx;
                        const ny = gridY + dy;
                        if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
                            const idx = ny * TERRAIN_SIZE + nx;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const weight = Math.exp(-(dist * dist) / (2 * radius * radius));
                            densityMap[idx] += intensity * weight * 0.5;
                            countMap[idx] += weight * 0.5;
                        }
                    }
                }
            });
        });

        // 3. Normalize
        for (let i = 0; i < densityMap.length; i++) {
            if (countMap[i] > 0) densityMap[i] /= countMap[i];
        }

        // 4. Smooth
        const scaledHeightmap = new Float32Array(densityMap); // Simplified smoothing

        // 5. Generate 3D paths using the new aggregate heightmap
        const pathsData = allPaths.map(({ conv, points }, i) => {
            // Sample height from our new aggregate map
            const points3D = points.map(pt => {
                const tx = Math.floor(pt.x * (TERRAIN_SIZE - 1));
                const ty = Math.floor(pt.y * (TERRAIN_SIZE - 1));
                const idx = ty * TERRAIN_SIZE + tx;
                const height = scaledHeightmap[idx] || 0;
                return { ...pt, height, padHeight: pt.pad?.emotionalIntensity }; // Add required props
            });

            return {
                points: points3D,
                color: `hsl(${i * 137.5 % 360}, 70%, 50%)`,
                name: conv.id || `Conv ${i}`
            };
        });

        // 6. Generate Contours
        const generatedContours = generateContours(scaledHeightmap, TERRAIN_SIZE, 30);

        return { heightmap: scaledHeightmap, paths: pathsData, contours: generatedContours };
    }, [conversations]);

    return (
        <ThreeScene
            heightmap={heightmap}
            pathPoints={[]} // Unused in multi-path mode
            paths={paths}   // Pass multiple paths
            contours={contours}
            hoveredPoint={null}
            lockedPoint={null}
            timelineProgress={1}
            showContours={true}
            showTerrain={false}
            showMarkers={false}
            showPaths={true}
            terrainPosition={{ x: 0, y: 0, z: 0 }}
            cameraView="top" // Top-down view for landscapes
            backgroundColor="#030213"
            onPointHover={() => { }}
            onPointClick={() => { }}
        />
    );
}
