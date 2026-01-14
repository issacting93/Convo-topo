import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerrainGridView } from '../components/TerrainGrid';
import { useConversationStore } from '../store/useConversationStore';
import type { ClassifiedConversation } from '../utils/conversationToTerrain';
import { getCommunicationFunction, getConversationStructure } from '../utils/conversationToTerrain';
import { generate2DPathPoints } from '../utils/terrain';
import type { TerrainParams } from '../utils/terrain';

interface TerrainPreview {
  id: number;
  name: string;
  seed: number;
  description: string;
  heightParams?: Partial<TerrainParams>;
  xyz?: { x: number; y: number; z: number };
  pathPoints2D?: Array<{ x: number; y: number; role: 'user' | 'assistant' }>;
}

export function TerrainGridPage() {
  const conversations = useConversationStore(state => state.conversations);
  const navigate = useNavigate();

  // Convert conversations to terrain previews
  const terrains: TerrainPreview[] = useMemo(() => {
    return conversations.map((conv: ClassifiedConversation, idx: number) => {
      const commFunc = getCommunicationFunction(conv);
      const convStruct = getConversationStructure(conv);
      
      // Calculate average emotional intensity (Z coordinate)
      const messages = conv.messages || [];
      const messagesWithPad = messages.filter(msg => msg.pad?.emotionalIntensity !== undefined);
      const avgEI = messagesWithPad.length > 0
        ? messagesWithPad.reduce((sum, msg) => sum + (msg.pad?.emotionalIntensity || 0), 0) / messagesWithPad.length
        : 0.5;

      // Generate 2D path points for minimap using proper trajectory calculation
      const pathPoints2D = messages.length > 0
        ? generate2DPathPoints(
            messages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content || '',
              communicationFunction: commFunc,
              conversationStructure: convStruct
            }))
          )
        : [];

      // Get conversation name
      const name = conv.id || `Conversation ${idx + 1}`;
      
      // Generate description from classification
      const pattern = conv.classification?.interactionPattern?.category || 'unknown';
      const purpose = conv.classification?.conversationPurpose?.category || 'unknown';
      const description = `${pattern} • ${purpose}`;

      // Use conversation ID or index as seed
      const seed = parseInt(conv.id?.replace(/\D/g, '') || String(idx)) || idx;

      return {
        id: idx,
        name,
        seed,
        description,
        xyz: {
          x: commFunc,
          y: convStruct,
          z: avgEI
        },
        pathPoints2D
      };
    });
  }, [conversations]);

  const handleSelectTerrain = (terrain: TerrainPreview) => {
    // Navigate to the terrain detail view
    const conversation = conversations[terrain.id];
    if (conversation?.id) {
      navigate(`/terrain/${conversation.id}`);
    }
  };

  return (
    <TerrainGridView
      terrains={terrains}
      conversations={conversations}
      onSelectTerrain={handleSelectTerrain}
    />
  );
}

