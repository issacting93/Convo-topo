import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MultiPathViewPage } from './pages/MultiPathViewPage';
import { TerrainViewPage } from './pages/TerrainViewPage';
import { TerrainComparisonPage } from './pages/TerrainComparisonPage';
import { SpatialClusteringPage } from './pages/SpatialClusteringPage';
import { PADTimelinePage } from './pages/PADTimelinePage';
import { RelationalDriftPage } from './pages/RelationalDriftPage';
import { ClusterDashboardPage } from './pages/ClusterDashboardPage';
import { ClusterTerrainVisualizationPage } from './pages/ClusterTerrainVisualizationPage';
import { RoleDashboardPage } from './pages/RoleDashboardPage';
import { TerrainGridPage } from './pages/TerrainGridPage';
import { DISPictorialPage } from './pages/DISPictorialPage';
import FlightRecorderPage from './pages/FlightRecorderPage';
import { useConversationStore } from './store/useConversationStore';

function App() {
  const initializeStore = useConversationStore(state => state.initialize);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpatialClusteringPage />} />
        <Route path="/multi-path" element={<MultiPathViewPage />} />
        <Route path="/terrain/:id" element={<TerrainViewPage />} />
        <Route path="/terrain-comparison" element={<TerrainComparisonPage />} />
        <Route path="/pad-timeline" element={<PADTimelinePage />} />
        <Route path="/relational-drift" element={<RelationalDriftPage />} />
        <Route path="/cluster-dashboard" element={<ClusterDashboardPage />} />
        <Route path="/cluster-terrain" element={<ClusterTerrainVisualizationPage />} />
        <Route path="/role-dashboard" element={<RoleDashboardPage />} />
        <Route path="/terrain-grid" element={<TerrainGridPage />} />
        <Route path="/dis-pictorial" element={<DISPictorialPage />} />
        <Route path="/flight-recorder" element={<FlightRecorderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;