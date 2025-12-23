import { TerrainGridView } from '../components/TerrainGrid';
import { useNavigate } from 'react-router-dom';
import type { TerrainPreset } from '../data/terrainPresets';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';

interface TerrainGridPageProps {
  terrains: TerrainPreset[];
  conversations: ClassifiedConversation[];
}

export function TerrainGridPage({ terrains, conversations }: TerrainGridPageProps) {
  const navigate = useNavigate();

  const handleSelectTerrain = (terrain: TerrainPreset) => {
    navigate(`/terrain/${terrain.id}`);
  };

  return (
    <TerrainGridView
      terrains={terrains}
      conversations={conversations}
      onSelectTerrain={handleSelectTerrain}
    />
  );
}
