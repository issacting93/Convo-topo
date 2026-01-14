import { useNavigate, useLocation } from 'react-router-dom';

const THEME = {
  foreground: '#151515',
  foregroundMuted: '#666666',
  accent: '#7b68ee',
  border: 'rgba(0, 0, 0, 0.1)',
  card: '#ffffff',
  cardRgba: (alpha: number) => `rgba(255, 255, 255, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
};

interface NavItem {
  path: string;
  label: string;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Map', description: 'Spatial clustering of all conversations' },
  { path: '/cluster-terrain', label: '3D Clusters', description: '3D visualization of all conversations by cluster' },
  { path: '/terrain-grid', label: 'Grid', description: 'Grid view of all terrain conversations' },
  { path: '/cluster-dashboard', label: 'Dashboard', description: 'Cluster statistics and analytics' },
  { path: '/role-dashboard', label: 'Roles', description: 'Role distribution and analysis' },
  { path: '/multi-path', label: 'Flow', description: 'Multi-path conversation dynamics' },
  { path: '/relational-drift', label: 'Drift', description: 'Relational drift analysis' },
  { path: '/pad-timeline', label: 'Emotions', description: 'Emotional intensity timeline' },
  { path: '/terrain-comparison', label: 'Compare', description: 'Side-by-side terrain comparison' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/terrain/');
    }
    return location.pathname === path;
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '8px 16px',
              background: active ? THEME.accentRgba(0.15) : THEME.borderRgba(0.05),
              border: `1px solid ${active ? THEME.accent : THEME.border}`,
              borderRadius: 4,
              color: active ? THEME.accent : THEME.foreground,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: active ? 600 : 500,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = THEME.borderRgba(0.1);
                e.currentTarget.style.borderColor = THEME.foregroundMuted;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = THEME.borderRgba(0.05);
                e.currentTarget.style.borderColor = THEME.border;
              }
            }}
            title={item.description}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

