/**
 * Role Dashboard Page
 * 
 * Comprehensive dashboard for analyzing role distributions and patterns:
 * - Role distribution overview (Human & AI)
 * - Evaluation Context vs Organic Usage data comparison
 * - Instrumental vs Expressive breakdown
 * - Authority level analysis
 * - Role pair analysis (human → AI)
 * - Role positioning on X/Y axes
 */

import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, Legend, ComposedChart
} from 'recharts';
import { useConversationStore } from '../store/useConversationStore';
import {
  getDominantHumanRole,
  getDominantAiRole,
  getConversationSource,
  mapOldRoleToNew
} from '../utils/conversationToTerrain';
import { getCommunicationFunction, getConversationStructure } from '../utils/conversationToTerrain';
import { getColorForRole } from '../utils/constants';
import { formatRoleName } from '../utils/formatClassificationData';
import { Navigation } from '../components/Navigation';

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

// New Social Role Theory taxonomy roles
const HUMAN_ROLES = ['information-seeker', 'provider', 'director', 'collaborator', 'social-expressor', 'relational-peer'];
const AI_ROLES = ['expert-system', 'learning-facilitator', 'advisor', 'co-constructor', 'social-facilitator', 'relational-peer'];

// Instrumental vs Expressive categorization
const INSTRUMENTAL_HUMAN = ['information-seeker', 'provider', 'director', 'collaborator'];
const EXPRESSIVE_HUMAN = ['social-expressor', 'relational-peer'];
const INSTRUMENTAL_AI = ['expert-system', 'learning-facilitator', 'advisor', 'co-constructor'];
const EXPRESSIVE_AI = ['social-facilitator', 'relational-peer'];

// Authority level categorization
const HIGH_AUTHORITY_HUMAN = ['director'];
const LOW_AUTHORITY_HUMAN = ['information-seeker', 'provider', 'social-expressor'];
const EQUAL_AUTHORITY_HUMAN = ['collaborator', 'relational-peer'];
const HIGH_AUTHORITY_AI = ['expert-system', 'advisor'];
const LOW_AUTHORITY_AI = ['learning-facilitator', 'social-facilitator'];
const EQUAL_AUTHORITY_AI = ['co-constructor', 'relational-peer'];

export function RoleDashboardPage() {
  const conversations = useConversationStore(state => state.conversations);
  const [selectedDataSource, setSelectedDataSource] = useState<'all' | 'old' | 'new'>('all');

  // Calculate role statistics
  const roleStats = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return {
        humanRoles: {} as Record<string, number>,
        aiRoles: {} as Record<string, number>,
        rolePairs: {} as Record<string, number>,
        oldData: { humanRoles: {} as Record<string, number>, aiRoles: {} as Record<string, number> },
        newData: { humanRoles: {} as Record<string, number>, aiRoles: {} as Record<string, number> },
        instrumentalExpressive: { human: { instrumental: 0, expressive: 0 }, ai: { instrumental: 0, expressive: 0 } },
        authorityLevel: { human: { high: 0, low: 0, equal: 0 }, ai: { high: 0, low: 0, equal: 0 } },
        rolePositions: [] as Array<{ role: string; roleType: 'human' | 'ai'; x: number; y: number; source: 'old' | 'new' }>,
        total: 0,
      };
    }

    // Filter by data source
    const filteredConversations = conversations.filter(conv => {
      const source = getConversationSource(conv);
      const isOld = source === 'chatbot_arena' || source === 'oasst';
      const isNew = source === 'wildchat';

      if (selectedDataSource === 'all') return true;
      if (selectedDataSource === 'old') return isOld;
      if (selectedDataSource === 'new') return isNew;
      return true;
    });

    const humanRoles: Record<string, number> = {};
    const aiRoles: Record<string, number> = {};
    const rolePairs: Record<string, number> = {};
    const oldData = { humanRoles: {} as Record<string, number>, aiRoles: {} as Record<string, number> };
    const newData = { humanRoles: {} as Record<string, number>, aiRoles: {} as Record<string, number> };
    const instrumentalExpressive = { human: { instrumental: 0, expressive: 0 }, ai: { instrumental: 0, expressive: 0 } };
    const authorityLevel = { human: { high: 0, low: 0, equal: 0 }, ai: { high: 0, low: 0, equal: 0 } };
    const rolePositions: Array<{ role: string; roleType: 'human' | 'ai'; x: number; y: number; source: 'old' | 'new' }> = [];

    filteredConversations.forEach(conv => {
      const rawSource = getConversationSource(conv);
      const source: 'old' | 'new' = (rawSource === 'chatbot_arena' || rawSource === 'oasst') ? 'old' : 'new';

      const humanRole = getDominantHumanRole(conv);
      const aiRole = getDominantAiRole(conv);

      if (humanRole) {
        const mappedRole = mapOldRoleToNew(humanRole.role, 'human');
        humanRoles[mappedRole] = (humanRoles[mappedRole] || 0) + 1;

        if (source === 'old') {
          oldData.humanRoles[mappedRole] = (oldData.humanRoles[mappedRole] || 0) + 1;
        } else {
          newData.humanRoles[mappedRole] = (newData.humanRoles[mappedRole] || 0) + 1;
        }

        // Instrumental vs Expressive
        if (INSTRUMENTAL_HUMAN.includes(mappedRole)) {
          instrumentalExpressive.human.instrumental++;
        } else if (EXPRESSIVE_HUMAN.includes(mappedRole)) {
          instrumentalExpressive.human.expressive++;
        }

        // Authority level
        if (HIGH_AUTHORITY_HUMAN.includes(mappedRole)) {
          authorityLevel.human.high++;
        } else if (LOW_AUTHORITY_HUMAN.includes(mappedRole)) {
          authorityLevel.human.low++;
        } else if (EQUAL_AUTHORITY_HUMAN.includes(mappedRole)) {
          authorityLevel.human.equal++;
        }

        // Role positioning
        const x = getCommunicationFunction(conv);
        const y = getConversationStructure(conv);
        rolePositions.push({ role: mappedRole, roleType: 'human', x, y, source });
      }

      if (aiRole) {
        const mappedRole = mapOldRoleToNew(aiRole.role, 'ai');
        aiRoles[mappedRole] = (aiRoles[mappedRole] || 0) + 1;

        if (source === 'old') {
          oldData.aiRoles[mappedRole] = (oldData.aiRoles[mappedRole] || 0) + 1;
        } else {
          newData.aiRoles[mappedRole] = (newData.aiRoles[mappedRole] || 0) + 1;
        }

        // Instrumental vs Expressive
        if (INSTRUMENTAL_AI.includes(mappedRole)) {
          instrumentalExpressive.ai.instrumental++;
        } else if (EXPRESSIVE_AI.includes(mappedRole)) {
          instrumentalExpressive.ai.expressive++;
        }

        // Authority level
        if (HIGH_AUTHORITY_AI.includes(mappedRole)) {
          authorityLevel.ai.high++;
        } else if (LOW_AUTHORITY_AI.includes(mappedRole)) {
          authorityLevel.ai.low++;
        } else if (EQUAL_AUTHORITY_AI.includes(mappedRole)) {
          authorityLevel.ai.equal++;
        }

        // Role positioning
        const x = getCommunicationFunction(conv);
        const y = getConversationStructure(conv);
        rolePositions.push({ role: mappedRole, roleType: 'ai', x, y, source });
      }

      // Role pairs
      if (humanRole && aiRole) {
        const mappedHuman = mapOldRoleToNew(humanRole.role, 'human');
        const mappedAi = mapOldRoleToNew(aiRole.role, 'ai');
        const pair = `${mappedHuman} → ${mappedAi}`;
        rolePairs[pair] = (rolePairs[pair] || 0) + 1;
      }
    });

    return {
      humanRoles,
      aiRoles,
      rolePairs,
      oldData,
      newData,
      instrumentalExpressive,
      authorityLevel,
      rolePositions,
      total: filteredConversations.length,
    };
  }, [conversations, selectedDataSource]);

  // Prepare data for charts
  const humanRoleData = useMemo(() => {
    return HUMAN_ROLES.map(role => ({
      role: formatRoleName(role, 'human'),
      count: roleStats.humanRoles[role] || 0,
      percentage: roleStats.total > 0 ? ((roleStats.humanRoles[role] || 0) / roleStats.total * 100).toFixed(1) : '0',
      color: getColorForRole(role),
    })).filter(item => item.count > 0);
  }, [roleStats]);

  const aiRoleData = useMemo(() => {
    return AI_ROLES.map(role => ({
      role: formatRoleName(role, 'ai'),
      count: roleStats.aiRoles[role] || 0,
      percentage: roleStats.total > 0 ? ((roleStats.aiRoles[role] || 0) / roleStats.total * 100).toFixed(1) : '0',
      color: getColorForRole(role),
    })).filter(item => item.count > 0);
  }, [roleStats]);

  // Old vs New comparison
  const comparisonData = useMemo(() => {
    const allRoles = [...new Set([...Object.keys(roleStats.oldData.humanRoles), ...Object.keys(roleStats.newData.humanRoles)])];

    return {
      human: allRoles.map(role => ({
        role: formatRoleName(role, 'human'),
        old: roleStats.oldData.humanRoles[role] || 0,
        new: roleStats.newData.humanRoles[role] || 0,
        color: getColorForRole(role),
      })).filter(item => item.old > 0 || item.new > 0),
      ai: [...new Set([...Object.keys(roleStats.oldData.aiRoles), ...Object.keys(roleStats.newData.aiRoles)])].map(role => ({
        role: formatRoleName(role, 'ai'),
        old: roleStats.oldData.aiRoles[role] || 0,
        new: roleStats.newData.aiRoles[role] || 0,
        color: getColorForRole(role),
      })).filter(item => item.old > 0 || item.new > 0),
    };
  }, [roleStats]);

  // Role pairs data (top 10)
  const topRolePairs = useMemo(() => {
    return Object.entries(roleStats.rolePairs)
      .map(([pair, count]) => ({
        pair: pair.split(' → ').map((r, i) => formatRoleName(r, i === 0 ? 'human' : 'ai')).join(' → '),
        count,
        percentage: roleStats.total > 0 ? ((count / roleStats.total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [roleStats]);

  // Instrumental vs Expressive data
  const instrumentalExpressiveData = useMemo(() => {
    const totalHuman = roleStats.instrumentalExpressive.human.instrumental + roleStats.instrumentalExpressive.human.expressive;
    const totalAi = roleStats.instrumentalExpressive.ai.instrumental + roleStats.instrumentalExpressive.ai.expressive;

    return {
      human: [
        { name: 'Instrumental', value: roleStats.instrumentalExpressive.human.instrumental, percentage: totalHuman > 0 ? (roleStats.instrumentalExpressive.human.instrumental / totalHuman * 100).toFixed(1) : '0' },
        { name: 'Expressive', value: roleStats.instrumentalExpressive.human.expressive, percentage: totalHuman > 0 ? (roleStats.instrumentalExpressive.human.expressive / totalHuman * 100).toFixed(1) : '0' },
      ],
      ai: [
        { name: 'Instrumental', value: roleStats.instrumentalExpressive.ai.instrumental, percentage: totalAi > 0 ? (roleStats.instrumentalExpressive.ai.instrumental / totalAi * 100).toFixed(1) : '0' },
        { name: 'Expressive', value: roleStats.instrumentalExpressive.ai.expressive, percentage: totalAi > 0 ? (roleStats.instrumentalExpressive.ai.expressive / totalAi * 100).toFixed(1) : '0' },
      ],
    };
  }, [roleStats]);

  // Authority level data
  const authorityData = useMemo(() => {
    const totalHuman = roleStats.authorityLevel.human.high + roleStats.authorityLevel.human.low + roleStats.authorityLevel.human.equal;
    const totalAi = roleStats.authorityLevel.ai.high + roleStats.authorityLevel.ai.low + roleStats.authorityLevel.ai.equal;

    return {
      human: [
        { name: 'High Authority', value: roleStats.authorityLevel.human.high, percentage: totalHuman > 0 ? (roleStats.authorityLevel.human.high / totalHuman * 100).toFixed(1) : '0' },
        { name: 'Low Authority', value: roleStats.authorityLevel.human.low, percentage: totalHuman > 0 ? (roleStats.authorityLevel.human.low / totalHuman * 100).toFixed(1) : '0' },
        { name: 'Equal Authority', value: roleStats.authorityLevel.human.equal, percentage: totalHuman > 0 ? (roleStats.authorityLevel.human.equal / totalHuman * 100).toFixed(1) : '0' },
      ],
      ai: [
        { name: 'High Authority', value: roleStats.authorityLevel.ai.high, percentage: totalAi > 0 ? (roleStats.authorityLevel.ai.high / totalAi * 100).toFixed(1) : '0' },
        { name: 'Low Authority', value: roleStats.authorityLevel.ai.low, percentage: totalAi > 0 ? (roleStats.authorityLevel.ai.low / totalAi * 100).toFixed(1) : '0' },
        { name: 'Equal Authority', value: roleStats.authorityLevel.ai.equal, percentage: totalAi > 0 ? (roleStats.authorityLevel.ai.equal / totalAi * 100).toFixed(1) : '0' },
      ],
    };
  }, [roleStats]);

  // Role positioning data (aggregate by role)
  const rolePositionData = useMemo(() => {
    const roleGroups: Record<string, Array<{ roleType: 'human' | 'ai'; x: number; y: number; source: 'old' | 'new' }>> = {};

    roleStats.rolePositions.forEach(({ role, roleType, x, y, source }) => {
      // Use a separator that won't appear in role names
      const key = `${roleType}|||${role}`;
      if (!roleGroups[key]) {
        roleGroups[key] = [];
      }
      roleGroups[key].push({ roleType, x, y, source });
    });

    return Object.entries(roleGroups).map(([key, positions]) => {
      const [roleType, role] = key.split('|||');
      const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
      const avgY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
      const oldCount = positions.filter(p => p.source === 'old').length;
      const newCount = positions.filter(p => p.source === 'new').length;

      return {
        role,
        roleType: roleType as 'human' | 'ai',
        x: avgX,
        y: avgY,
        count: positions.length,
        oldCount,
        newCount,
        color: getColorForRole(role),
      };
    });
  }, [roleStats]);

  const PIE_COLORS = ['#7b68ee', '#4ade80', '#fbbf24', '#ec4899', '#06b6d4', '#8b5cf6'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fefefe',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <Navigation />

      <div style={{ maxWidth: 1400, margin: '0 auto', paddingTop: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 600,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Role Distribution Dashboard
          </h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: THEME.foregroundMuted,
            marginBottom: 16
          }}>
            Analyzing role distributions and patterns using Social Role Theory taxonomy
          </p>

          {/* Data Source Filter */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: THEME.foreground }}>
              Data Source:
            </label>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value as 'all' | 'old' | 'new')}
              style={{
                padding: '6px 12px',
                border: `1px solid ${THEME.border}`,
                borderRadius: 4,
                fontSize: '14px',
                background: THEME.card,
                cursor: 'pointer'
              }}
            >
              <option value="all">All Data ({roleStats.total} conversations)</option>
              <option value="old">Evaluation Context (Arena + OASST)</option>
              <option value="new">Organic Usage (WildChat)</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          <div style={{
            padding: 20,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: '14px', color: THEME.foregroundMuted, marginBottom: 4 }}>Total Conversations</div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: THEME.foreground }}>{roleStats.total}</div>
          </div>
          <div style={{
            padding: 20,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: '14px', color: THEME.foregroundMuted, marginBottom: 4 }}>Human Roles Found</div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: THEME.foreground }}>{Object.keys(roleStats.humanRoles).length}</div>
          </div>
          <div style={{
            padding: 20,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: '14px', color: THEME.foregroundMuted, marginBottom: 4 }}>AI Roles Found</div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: THEME.foreground }}>{Object.keys(roleStats.aiRoles).length}</div>
          </div>
          <div style={{
            padding: 20,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: '14px', color: THEME.foregroundMuted, marginBottom: 4 }}>Unique Role Pairs</div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: THEME.foreground }}>{Object.keys(roleStats.rolePairs).length}</div>
          </div>
        </div>

        {/* Role Distribution Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 24,
          marginBottom: 32
        }}>
          {/* Human Roles */}
          <div style={{
            padding: 24,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: THEME.foreground }}>
              Human Role Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={humanRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, _name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" fill={THEME.accent} radius={[4, 4, 0, 0]}>
                  {humanRoleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={humanRoleData[index].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Roles */}
          <div style={{
            padding: 24,
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: THEME.foreground }}>
              AI Role Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, _name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" fill={THEME.accent} radius={[4, 4, 0, 0]}>
                  {aiRoleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={aiRoleData[index].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evaluation Context vs Organic Usage Comparison */}
        {selectedDataSource === 'all' && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: THEME.foreground }}>
              Evaluation Context vs Organic Usage Comparison
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: 24
            }}>
              {/* Human Roles Comparison */}
              <div style={{
                padding: 24,
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                  Human Roles: Evaluation Context vs Organic Usage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={comparisonData.human}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="old" name="Evaluation Context (Arena + OASST)" fill="#7b68ee" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new" name="Organic Usage (WildChat)" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* AI Roles Comparison */}
              <div style={{
                padding: 24,
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                  AI Roles: Evaluation Context vs Organic Usage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={comparisonData.ai}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                    <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="old" name="Evaluation Context (Arena + OASST)" fill="#7b68ee" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new" name="Organic Usage (WildChat)" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Instrumental vs Expressive */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: THEME.foreground }}>
            Instrumental vs Expressive Roles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24
          }}>
            {/* Human Roles */}
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                Human Roles: Instrumental vs Expressive
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={instrumentalExpressiveData.human}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {instrumentalExpressiveData.human.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* AI Roles */}
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                AI Roles: Instrumental vs Expressive
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={instrumentalExpressiveData.ai}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {instrumentalExpressiveData.ai.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Authority Level */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: THEME.foreground }}>
            Authority Level Distribution
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24
          }}>
            {/* Human Roles */}
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                Human Roles: Authority Level
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={authorityData.human}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {authorityData.human.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* AI Roles */}
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: THEME.foreground }}>
                AI Roles: Authority Level
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={authorityData.ai}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {authorityData.ai.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => [
                    `${value} conversations (${props.payload.percentage}%)`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Role Pairs */}
        {topRolePairs.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: THEME.foreground }}>
              Top Role Pairs (Human → AI)
            </h2>
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topRolePairs} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="pair" type="category" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => [
                      `${value} conversations (${props.payload.percentage}%)`,
                      'Count'
                    ]}
                  />
                  <Bar dataKey="count" fill={THEME.accent} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Role Positioning */}
        {rolePositionData.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: THEME.foreground }}>
              Role Positioning in Relational Space
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: THEME.foregroundMuted }}>
              X-axis: Functional (Instrumental) ↔ Social (Expressive) | Y-axis: Structured (High Authority) ↔ Emergent (Low Authority)
            </p>
            <div style={{
              padding: 24,
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
            }}>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Functional ↔ Social"
                    domain={[0, 1]}
                    label={{ value: 'Functional ↔ Social', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Structured ↔ Emergent"
                    domain={[0, 1]}
                    label={{ value: 'Structured ↔ Emergent', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: THEME.card,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: 4,
                            padding: 12,
                            fontSize: '12px'
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{formatRoleName(data.role, data.roleType === 'human' ? 'human' : 'ai')}</div>
                            <div>X: {data.x.toFixed(3)} (Functional ↔ Social)</div>
                            <div>Y: {data.y.toFixed(3)} (Structured ↔ Emergent)</div>
                            <div>Count: {data.count} conversations</div>
                            {data.oldCount > 0 && <div>Evaluation Context: {data.oldCount}</div>}
                            {data.newCount > 0 && <div>Organic Usage: {data.newCount}</div>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Roles" data={rolePositionData} fill="#8884d8">
                    {rolePositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

