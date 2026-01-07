import type { TerrainParams } from '../utils/terrain';

export interface TerrainPreset {
  id: number;
  name: string;
  seed: number;
  description: string;
  heightParams?: Partial<TerrainParams>; // Terrain height parameters from classification
  xyz?: { x: number; y: number; z: number }; // XYZ coordinates snapshot
  pathPoints2D?: Array<{ x: number; y: number; role: 'user' | 'assistant' }>; // Pre-computed path points for minimap
  conversationId?: string; // Link to original conversation ID
}

export const TERRAIN_PRESETS: TerrainPreset[] = [
  { id: 1, name: 'Deep Dialogue', seed: 42, description: 'High-variation exchanges with peaks and valleys' },
  { id: 2, name: 'Flowing Exchange', seed: 17, description: 'Smooth, rolling conversation patterns' },
  { id: 3, name: 'Casual Waves', seed: 88, description: 'Gentle, meandering discussions' },
  { id: 4, name: 'Intense Outbursts', seed: 33, description: 'Emotional peaks and impact moments' },
  { id: 5, name: 'Gradual Understanding', seed: 56, description: 'Slow, deliberate progression of ideas' },
  { id: 6, name: 'Complex Discourse', seed: 71, description: 'Deep, multi-layered discussions' },
  { id: 7, name: 'Layered Narrative', seed: 94, description: 'Stepped transitions between topics' },
  { id: 8, name: 'Breakthrough Moment', seed: 22, description: 'Central realization with surrounding context' },
  { id: 9, name: 'Divergent Views', seed: 45, description: 'Split perspectives and opposing ideas' },
];

