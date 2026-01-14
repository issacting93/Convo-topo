/**
 * Cluster Dashboard Page
 *
 * Comprehensive dashboard for analyzing conversation clusters with:
 * - Distribution overview
 * - Cluster characteristics
 * - Spatial positioning
 * - Trajectory analysis
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useConversationStore } from '../store/useConversationStore';
import { determineCluster } from '../utils/determineCluster';
import { getLanguageForCluster, CartographyCluster } from '../utils/clusterToGenUI';
import { getCommunicationFunction, getConversationStructure, getDominantHumanRole, getDominantAiRole, mapOldRoleToNew } from '../utils/conversationToTerrain';
import { loadClusterAssignments } from '../utils/loadClusterAssignments';
import { Navigation } from '../components/Navigation';
import { formatRoleName } from '../utils/formatClassificationData';

const THEME = {
  foreground: '#151515',
  foregroundMuted: '#666666',
  accent: '#7b68ee',
  accent2: '#4ade80',
  accent3: '#fbbf24',
  accent4: '#ec4899',
  accent5: '#06b6d4',
  border: 'rgba(0, 0, 0, 0.1)',
  card: '#ffffff',
  cardRgba: (alpha: number) => `rgba(255, 255, 255, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
};

// Cluster colors - distinct palette for each cluster
const CLUSTER_COLORS: Record<CartographyCluster, string> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': '#7b68ee', // Purple
  'Valley_FunctionalStructured_QA_InfoSeeking': '#4ade80', // Green
  'SocialEmergent_Narrative_InfoSeeking': '#fbbf24', // Amber
  'SocialEmergent_Narrative_Entertainment': '#ec4899', // Pink
  'MeanderingPath_Narrative_SelfExpression': '#06b6d4', // Cyan
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': '#ef4444', // Red
  'SocialEmergent_Narrative_Relational': '#8b5cf6', // Violet
};

// Simplified cluster labels
const CLUSTER_LABELS: Record<CartographyCluster, string> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': 'Stable Q&A',
  'Valley_FunctionalStructured_QA_InfoSeeking': 'Valley Q&A',
  'SocialEmergent_Narrative_InfoSeeking': 'Narrative Info',
  'SocialEmergent_Narrative_Entertainment': 'Entertainment',
  'MeanderingPath_Narrative_SelfExpression': 'Self-Expression',
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': 'Volatile Q&A',
  'SocialEmergent_Narrative_Relational': 'Relational',
};

// Cluster characteristics
const CLUSTER_CHARACTERISTICS: Record<CartographyCluster, {
  trajectory: string;
  intensity: string;
  alignment: string;
  orientation: string;
}> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': {
    trajectory: 'Straight path',
    intensity: 'Low, stable',
    alignment: 'Aligned',
    orientation: 'Functional',
  },
  'Valley_FunctionalStructured_QA_InfoSeeking': {
    trajectory: 'Valley (low intensity)',
    intensity: 'Very low',
    alignment: 'Aligned',
    orientation: 'Functional',
  },
  'SocialEmergent_Narrative_InfoSeeking': {
    trajectory: 'Exploratory',
    intensity: 'Variable',
    alignment: 'Divergent',
    orientation: 'Social',
  },
  'SocialEmergent_Narrative_Entertainment': {
    trajectory: 'Meandering',
    intensity: 'Variable',
    alignment: 'Divergent',
    orientation: 'Social',
  },
  'MeanderingPath_Narrative_SelfExpression': {
    trajectory: 'Meandering',
    intensity: 'Variable',
    alignment: 'Divergent',
    orientation: 'Mixed',
  },
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': {
    trajectory: 'Volatile with peaks',
    intensity: 'High, volatile',
    alignment: 'Aligned',
    orientation: 'Functional',
  },
  'SocialEmergent_Narrative_Relational': {
    trajectory: 'Relational drift',
    intensity: 'Variable',
    alignment: 'Divergent',
    orientation: 'Social',
  },
};

export function ClusterDashboardPage() {
  const conversations = useConversationStore(state => state.conversations);
  const loading = useConversationStore(state => state.loading);
  const navigate = useNavigate();

  const [selectedCluster, setSelectedCluster] = useState<CartographyCluster | null>(null);
  const [clusterMap, setClusterMap] = useState<Map<string, CartographyCluster>>(new Map());

  // Load cluster assignments
  useEffect(() => {
    loadClusterAssignments().then(assignments => {
      setClusterMap(assignments);
    });
  }, []);

  // Group conversations by cluster
  const conversationsByCluster = useMemo(() => {
    const grouped: Record<CartographyCluster, typeof conversations> = {
      'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': [],
      'Valley_FunctionalStructured_QA_InfoSeeking': [],
      'SocialEmergent_Narrative_InfoSeeking': [],
      'SocialEmergent_Narrative_Entertainment': [],
      'MeanderingPath_Narrative_SelfExpression': [],
      'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': [],
      'SocialEmergent_Narrative_Relational': [],
    };

    conversations.forEach(conv => {
      const cluster = clusterMap.get(conv.id) || determineCluster(conv);
      if (grouped[cluster]) {
        grouped[cluster].push(conv);
      }
    });

    return grouped;
  }, [conversations, clusterMap]);

  // Calculate statistics
  const stats = useMemo(() => {
    const clusterStats = Object.entries(conversationsByCluster).map(([cluster, convs]) => {
      const clusterKey = cluster as CartographyCluster;

      // Calculate average intensity
      const avgIntensity = convs.length > 0
        ? convs.reduce((sum, conv) => {
          const messages = conv.messages || [];
          const avgEI = messages.length > 0
            ? messages.reduce((s, m) => s + (m.pad?.emotionalIntensity || 0), 0) / messages.length
            : 0;
          return sum + avgEI;
        }, 0) / convs.length
        : 0;

      // Calculate average X and Y positions
      const avgX = convs.length > 0
        ? convs.reduce((sum, conv) => sum + getCommunicationFunction(conv), 0) / convs.length
        : 0;

      const avgY = convs.length > 0
        ? convs.reduce((sum, conv) => sum + getConversationStructure(conv), 0) / convs.length
        : 0;

      // Calculate dominant roles for this cluster
      const humanRoles: Record<string, number> = {};
      const aiRoles: Record<string, number> = {};
      convs.forEach(conv => {
        const humanRole = getDominantHumanRole(conv);
        const aiRole = getDominantAiRole(conv);
        if (humanRole) {
          const mapped = mapOldRoleToNew(humanRole.role, 'human');
          humanRoles[mapped] = (humanRoles[mapped] || 0) + 1;
        }
        if (aiRole) {
          const mapped = mapOldRoleToNew(aiRole.role, 'ai');
          aiRoles[mapped] = (aiRoles[mapped] || 0) + 1;
        }
      });

      const topHumanRole = Object.entries(humanRoles).sort((a, b) => b[1] - a[1])[0];
      const topAiRole = Object.entries(aiRoles).sort((a, b) => b[1] - a[1])[0];

      return {
        cluster: clusterKey,
        label: CLUSTER_LABELS[clusterKey],
        count: convs.length,
        percentage: conversations.length > 0 ? (convs.length / conversations.length) * 100 : 0,
        color: CLUSTER_COLORS[clusterKey],
        language: getLanguageForCluster(clusterKey),
        characteristics: CLUSTER_CHARACTERISTICS[clusterKey],
        avgIntensity,
        avgX,
        avgY,
        topHumanRole: topHumanRole ? formatRoleName(topHumanRole[0], 'human') : 'N/A',
        topHumanRoleCount: topHumanRole ? topHumanRole[1] : 0,
        topHumanRolePercentage: topHumanRole ? (topHumanRole[1] / convs.length * 100).toFixed(1) : '0',
        topAiRole: topAiRole ? formatRoleName(topAiRole[0], 'ai') : 'N/A',
        topAiRoleCount: topAiRole ? topAiRole[1] : 0,
        topAiRolePercentage: topAiRole ? (topAiRole[1] / convs.length * 100).toFixed(1) : '0',
      };
    });

    return clusterStats.sort((a, b) => b.count - a.count);
  }, [conversationsByCluster, conversations.length]);

  // Data for charts
  const pieData = stats.filter(s => s.count > 0).map(s => ({
    name: s.label,
    value: s.count,
    color: s.color,
  }));

  const barData = stats.map(s => ({
    name: s.label,
    count: s.count,
    percentage: s.percentage,
    fill: s.color,
  }));

  const scatterData = stats.filter(s => s.count > 0).map(s => ({
    x: s.avgX,
    y: s.avgY,
    cluster: s.label,
    count: s.count,
    color: s.color,
  }));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: 32,
            height: 32,
            border: `2px solid ${THEME.border}`,
            borderTopColor: THEME.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: 16, color: THEME.foregroundMuted }}>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#fafafa' }}>
      {/* Header */}
      <div style={{
        background: THEME.card,
        borderBottom: `1px solid ${THEME.border}`,
        padding: '24px 32px',
      }}>
        <Navigation />
        <div style={{ marginTop: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: THEME.foreground }}>
            Cluster Analysis Dashboard
          </h1>
          <p style={{ color: THEME.foregroundMuted, fontSize: 16 }}>
            Comprehensive overview of conversation clusters, their characteristics, and spatial distribution
          </p>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
          <div style={{
            background: THEME.accentRgba(0.1),
            border: `1px solid ${THEME.accentRgba(0.3)}`,
            borderRadius: 8,
            padding: 16,
          }}>
            <div style={{ fontSize: 12, color: THEME.foregroundMuted, marginBottom: 4 }}>Total Conversations</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: THEME.accent }}>{conversations.length}</div>
          </div>

          <div style={{
            background: THEME.cardRgba(1),
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: 16,
          }}>
            <div style={{ fontSize: 12, color: THEME.foregroundMuted, marginBottom: 4 }}>Active Clusters</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: THEME.foreground }}>
              {stats.filter(s => s.count > 0).length}
            </div>
          </div>

          <div style={{
            background: THEME.cardRgba(1),
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            padding: 16,
          }}>
            <div style={{ fontSize: 12, color: THEME.foregroundMuted, marginBottom: 4 }}>Largest Cluster</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.foreground }}>
              {stats[0]?.label || 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: THEME.foregroundMuted, marginTop: 4 }}>
              {stats[0]?.count || 0} conversations ({stats[0]?.percentage.toFixed(1) || 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: 32, maxWidth: 1600, margin: '0 auto' }}>
        {/* Distribution Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Pie Chart */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 24,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: THEME.foreground }}>
              Cluster Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 24,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: THEME.foreground }}>
              Conversation Count by Cluster
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.borderRgba(0.3)} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11, fill: THEME.foregroundMuted }}
                />
                <YAxis tick={{ fill: THEME.foregroundMuted }} />
                <Tooltip
                  contentStyle={{
                    background: THEME.card,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spatial Positioning */}
        <div style={{
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: THEME.foreground }}>
            Spatial Positioning (X-Y Plane)
          </h2>
          <p style={{ fontSize: 14, color: THEME.foregroundMuted, marginBottom: 16 }}>
            Average position of each cluster in relational space (X: Functional ↔ Social, Y: Aligned ↔ Divergent)
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 80, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.borderRgba(0.3)} />
              <XAxis
                type="number"
                dataKey="x"
                name="Functional ↔ Social"
                domain={[0, 1]}
                label={{ value: 'Functional ← → Social', position: 'bottom', fill: THEME.foregroundMuted }}
                tick={{ fill: THEME.foregroundMuted }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Aligned ↔ Divergent"
                domain={[0, 1]}
                label={{ value: 'Aligned ← → Divergent', angle: -90, position: 'left', fill: THEME.foregroundMuted }}
                tick={{ fill: THEME.foregroundMuted }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  background: THEME.card,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 8,
                }}
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      background: THEME.card,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 8,
                      padding: 12,
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.cluster}</div>
                      <div style={{ fontSize: 12, color: THEME.foregroundMuted }}>
                        {data.count} conversations
                      </div>
                      <div style={{ fontSize: 12, color: THEME.foregroundMuted }}>
                        X: {data.x.toFixed(2)}, Y: {data.y.toFixed(2)}
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Cluster Details Table */}
        <div style={{
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: THEME.foreground }}>
            Cluster Characteristics
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Cluster</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Count</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Top Human Role</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Top AI Role</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Visual Language</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Trajectory</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Intensity</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Alignment</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Orientation</th>
                  <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: THEME.foregroundMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr
                    key={stat.cluster}
                    style={{
                      borderBottom: `1px solid ${THEME.borderRgba(0.3)}`,
                      background: selectedCluster === stat.cluster ? THEME.accentRgba(0.05) : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedCluster(selectedCluster === stat.cluster ? null : stat.cluster)}
                    onMouseEnter={(e) => e.currentTarget.style.background = THEME.borderRgba(0.05)}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedCluster === stat.cluster ? THEME.accentRgba(0.05) : 'transparent'}
                  >
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: stat.color,
                        }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{stat.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{stat.count}</div>
                      <div style={{ fontSize: 11, color: THEME.foregroundMuted }}>{stat.percentage.toFixed(1)}%</div>
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{stat.topHumanRole}</div>
                      <div style={{ fontSize: 11, color: THEME.foregroundMuted }}>
                        {stat.topHumanRoleCount} ({stat.topHumanRolePercentage}%)
                      </div>
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{stat.topAiRole}</div>
                      <div style={{ fontSize: 11, color: THEME.foregroundMuted }}>
                        {stat.topAiRoleCount} ({stat.topAiRolePercentage}%)
                      </div>
                    </td>
                    <td style={{ padding: 12, fontSize: 13, textTransform: 'capitalize' }}>{stat.language}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{stat.characteristics.trajectory}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{stat.characteristics.intensity}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{stat.characteristics.alignment}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{stat.characteristics.orientation}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/spatial-clustering');
                        }}
                        style={{
                          padding: '4px 12px',
                          background: THEME.accentRgba(0.1),
                          border: `1px solid ${THEME.accent}`,
                          borderRadius: 4,
                          color: THEME.accent,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        View in Space
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Cluster Details */}
        {selectedCluster && (
          <div style={{
            background: THEME.card,
            border: `2px solid ${CLUSTER_COLORS[selectedCluster]}`,
            borderRadius: 12,
            padding: 24,
            marginTop: 32,
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: THEME.foreground }}>
              {CLUSTER_LABELS[selectedCluster]} - Conversations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {conversationsByCluster[selectedCluster].slice(0, 12).map(conv => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/terrain/${conv.id}`)}
                  style={{
                    padding: 16,
                    background: THEME.cardRgba(1),
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = CLUSTER_COLORS[selectedCluster];
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = THEME.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: THEME.foreground }}>
                    {conv.id}
                  </div>
                  <div style={{ fontSize: 12, color: THEME.foregroundMuted }}>
                    {conv.messages?.length || 0} messages
                  </div>
                  <div style={{ fontSize: 12, color: THEME.foregroundMuted, marginTop: 4 }}>
                    {conv.classification?.interactionPattern?.category || 'unknown'}
                  </div>
                </div>
              ))}
            </div>
            {conversationsByCluster[selectedCluster].length > 12 && (
              <div style={{ marginTop: 16, textAlign: 'center', color: THEME.foregroundMuted, fontSize: 13 }}>
                Showing 12 of {conversationsByCluster[selectedCluster].length} conversations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
