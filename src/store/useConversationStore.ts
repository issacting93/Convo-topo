import { create } from 'zustand';
import { Conversation } from '../schemas/conversationSchema';
import { TerrainPreset } from '../data/terrainPresets';
import { loadClassifiedConversations } from '../data/classifiedConversations';
import { conversationsToTerrains } from '../utils/conversationToTerrain';

interface ConversationState {
    conversations: Conversation[];
    terrains: TerrainPreset[];
    loading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    reset: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
    conversations: [],
    terrains: [],
    loading: false,
    error: null,

    initialize: async () => {
        // Avoid double loading
        if (get().conversations.length > 0 || get().loading) return;

        set({ loading: true, error: null });

        try {
            const convs = await loadClassifiedConversations();

            // Process terrains
            const terrains = conversationsToTerrains(convs);

            set({
                conversations: convs,
                terrains,
                loading: false
            });
        } catch (err) {
            console.error('Failed to initialize store:', err);
            set({
                error: err instanceof Error ? err.message : 'Unknown error loading data',
                loading: false
            });
        }
    },

    reset: () => {
        set({ conversations: [], terrains: [], loading: false, error: null });
    }
}));
