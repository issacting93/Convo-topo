import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TerrainGridPage } from './pages/TerrainGridPage';
import { TerrainViewPage } from './pages/TerrainViewPage';
import { type TerrainPreset } from './data/terrainPresets';
import { loadClassifiedConversations } from './data/classifiedConversations';
import {
  conversationsToTerrains,
  type ClassifiedConversation
} from './utils/conversationToTerrain';

function App() {
  const [classifiedConversations, setClassifiedConversations] = useState<ClassifiedConversation[]>([]);
  const [conversationTerrains, setConversationTerrains] = useState<TerrainPreset[]>([]);

  // Load classified conversations on mount
  useEffect(() => {
    loadClassifiedConversations().then(convs => {
      setClassifiedConversations(convs);
      const terrains = conversationsToTerrains(convs);
      setConversationTerrains(terrains);
    });
  }, []);

  const availableTerrains = useMemo(() => {
    return conversationTerrains.length > 0
      ? conversationTerrains
      : [];
  }, [conversationTerrains]);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <TerrainGridPage 
              terrains={availableTerrains}
              conversations={classifiedConversations}
            />
          } 
        />
        <Route 
          path="/terrain/:id" 
          element={
            <TerrainViewPage 
              terrains={availableTerrains}
              conversations={classifiedConversations}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;