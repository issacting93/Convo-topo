import React, { useMemo, useState } from 'react';
import { useConversationStore } from '../store/useConversationStore';
import { computeRoleNetwork, getTopRolePairs, formatRoleName } from '../utils/roleNetwork';
import { RoleSankeyDiagram } from '../components/visualizations/RoleSankeyDiagram';
import { RoleNetworkGraph } from '../components/visualizations/RoleNetworkGraph';
import styles from './RoleNetworkPage.module.css';

type ViewMode = 'sankey' | 'network' | 'both';

export const RoleNetworkPage: React.FC = () => {
  const conversations = useConversationStore(state => state.conversations);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [showTopN, setShowTopN] = useState<number>(10);

  // Compute role network data
  const networkData = useMemo(() => {
    return computeRoleNetwork(conversations);
  }, [conversations]);

  // Get top role pairs
  const topPairs = useMemo(() => {
    return getTopRolePairs(networkData.links, showTopN);
  }, [networkData.links, showTopN]);

  // Filter network data for top pairs only (for cleaner visualization)
  const filteredNetworkData = useMemo(() => {
    if (showTopN >= networkData.links.length) return networkData;

    const topNodeIds = new Set<string>();
    topPairs.forEach(link => {
      topNodeIds.add(link.source);
      topNodeIds.add(link.target);
    });

    const filteredNodes = networkData.nodes.filter(node => topNodeIds.has(node.id));

    const nodeIndexMap = new Map<string, number>();
    const sankeyNodes = filteredNodes.map((node, index) => {
      nodeIndexMap.set(node.id, index);
      return {
        name: node.label,
        color: networkData.sankeyData.nodes.find(n => n.name === node.label)?.color
      };
    });

    const sankeyLinks = topPairs.map(link => ({
      source: nodeIndexMap.get(link.source) || 0,
      target: nodeIndexMap.get(link.target) || 0,
      value: link.value
    }));

    return {
      nodes: filteredNodes,
      links: topPairs,
      sankeyData: {
        nodes: sankeyNodes,
        links: sankeyLinks
      }
    };
  }, [networkData, topPairs, showTopN]);

  const totalConversations = conversations.length;
  const totalPairs = networkData.links.length;
  const totalHumanRoles = networkData.nodes.filter(n => n.type === 'human').length;
  const totalAiRoles = networkData.nodes.filter(n => n.type === 'ai').length;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Role Network Visualization</h1>
          <p className={styles.subtitle}>
            Exploring human-AI role dynamics through network graphs and flow diagrams
          </p>
        </div>

        {/* Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statValue} ${styles.blue}`}>{totalConversations}</div>
            <div className={styles.statLabel}>Conversations</div>
          </div>
          <div className={`${styles.statCard} ${styles.purple}`}>
            <div className={`${styles.statValue} ${styles.purple}`}>{totalHumanRoles}</div>
            <div className={styles.statLabel}>Human Roles</div>
          </div>
          <div className={`${styles.statCard} ${styles.green}`}>
            <div className={`${styles.statValue} ${styles.green}`}>{totalAiRoles}</div>
            <div className={styles.statLabel}>AI Roles</div>
          </div>
          <div className={`${styles.statCard} ${styles.yellow}`}>
            <div className={`${styles.statValue} ${styles.yellow}`}>{totalPairs}</div>
            <div className={styles.statLabel}>Role Pairs</div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>View Mode:</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setViewMode('both')}
                className={`${styles.button} ${viewMode === 'both' ? styles.active : styles.inactive}`}
              >
                Both
              </button>
              <button
                onClick={() => setViewMode('sankey')}
                className={`${styles.button} ${viewMode === 'sankey' ? styles.active : styles.inactive}`}
              >
                Sankey
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`${styles.button} ${viewMode === 'network' ? styles.active : styles.inactive}`}
              >
                Network
              </button>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Show top:</label>
            <select
              value={showTopN}
              onChange={(e) => setShowTopN(Number(e.target.value))}
              className={styles.select}
            >
              <option value={5}>5 pairs</option>
              <option value={10}>10 pairs</option>
              <option value={15}>15 pairs</option>
              <option value={20}>20 pairs</option>
              <option value={networkData.links.length}>All {networkData.links.length} pairs</option>
            </select>
          </div>
        </div>

        {/* Visualizations */}
        {(viewMode === 'both' || viewMode === 'sankey') && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sankey Diagram</h2>
              <p className={styles.sectionDescription}>
                Flow visualization showing how human roles connect to AI roles. Flow width represents conversation frequency.
              </p>
            </div>
            <div className={styles.visualizationBox}>
              <RoleSankeyDiagram data={filteredNetworkData.sankeyData} width={900} height={600} />
            </div>
          </div>
        )}

        {(viewMode === 'both' || viewMode === 'network') && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Force-Directed Network Graph</h2>
              <p className={styles.sectionDescription}>
                Interactive network visualization. Node size = frequency, edge thickness = connection strength. Drag nodes to reposition.
              </p>
            </div>
            <div className={styles.visualizationBox}>
              <RoleNetworkGraph
                nodes={filteredNetworkData.nodes}
                links={filteredNetworkData.links}
                width={900}
                height={600}
              />
            </div>
          </div>
        )}

        {/* Top Role Pairs Table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top Role Pairs</h2>
            <p className={styles.sectionDescription}>
              Ranked list of most common human-AI role combinations
            </p>
          </div>
          <div className={styles.visualizationBox}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Rank</th>
                  <th>Human Role</th>
                  <th>AI Role</th>
                  <th>Count</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {topPairs.map((pair, index) => {
                  const humanRole = pair.source.replace('human-', '');
                  const aiRole = pair.target.replace('ai-', '');

                  return (
                    <tr key={`${pair.source}-${pair.target}`}>
                      <td>
                        <span className={styles.rankBadge}>{index + 1}</span>
                      </td>
                      <td>
                        <span className={`${styles.roleText} ${styles.human}`}>
                          {formatRoleName(humanRole)}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.roleText} ${styles.ai}`}>
                          {formatRoleName(aiRole)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.countText}>
                          {pair.value} <span className={styles.countLabel}>convs</span>
                        </span>
                      </td>
                      <td>
                        <div className={styles.distributionContainer}>
                          <span className={styles.percentage}>
                            {pair.percentage.toFixed(1)}%
                          </span>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${Math.min(pair.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Section */}
        <div className={styles.insightsBox}>
          <h2 className={styles.insightsTitle}>Key Insights</h2>
          <div className={styles.insightsList}>
            {topPairs[0] && (
              <div className={styles.insight}>
                <div className={`${styles.insightDot} ${styles.blue}`}></div>
                <p className={styles.insightText}>
                  Most common pairing: <strong className={styles.purple}>{formatRoleName(topPairs[0].source.replace('human-', ''))}</strong> →{' '}
                  <strong className={styles.green}>{formatRoleName(topPairs[0].target.replace('ai-', ''))}</strong>
                  <span> ({topPairs[0].value} conversations, {topPairs[0].percentage.toFixed(1)}%)</span>
                </p>
              </div>
            )}
            <div className={styles.insight}>
              <div className={`${styles.insightDot} ${styles.yellow}`}></div>
              <p className={styles.insightText}>
                Total unique role pairs identified: <strong className={styles.yellow}>{totalPairs}</strong>
              </p>
            </div>
            <div className={styles.insight}>
              <div className={`${styles.insightDot} ${styles.cyan}`}></div>
              <p className={styles.insightText}>
                Average connections per role pair: <strong className={styles.cyan}>{(networkData.links.reduce((sum, link) => sum + link.value, 0) / totalPairs).toFixed(1)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
