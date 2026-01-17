import { Conversation } from '../schemas/conversationSchema';
import { getDominantHumanRole, getDominantAiRole, mapOldRoleToNew } from './conversationToTerrain';

export interface RoleNode {
  id: string;
  label: string;
  type: 'human' | 'ai';
  count: number;
}

export interface RoleLink {
  source: string;
  target: string;
  value: number; // Number of conversations with this pairing
  percentage: number; // Percentage of total conversations
}

export interface SankeyNode {
  name: string;
  color?: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface RoleNetworkData {
  nodes: RoleNode[];
  links: RoleLink[];
  sankeyData: SankeyData;
}

/**
 * Compute role pair connections from conversations
 * Returns nodes (roles) and links (human→AI role pairs) with percentages
 */
export function computeRoleNetwork(conversations: Conversation[]): RoleNetworkData {
  // Track role counts and pairs
  const humanRoleCounts = new Map<string, number>();
  const aiRoleCounts = new Map<string, number>();
  const rolePairs = new Map<string, number>(); // key: "humanRole->aiRole"

  // Process each conversation
  conversations.forEach(conv => {
    const humanRoleData = getDominantHumanRole(conv);
    const aiRoleData = getDominantAiRole(conv);

    if (!humanRoleData || !aiRoleData) return;

    // Map old roles to new taxonomy
    const humanRole = mapOldRoleToNew(humanRoleData.role, 'human');
    const aiRole = mapOldRoleToNew(aiRoleData.role, 'ai');

    // Only count if confidence is reasonable (value > 0.3)
    if (humanRoleData.value > 0.3 && aiRoleData.value > 0.3) {
      // Count individual roles
      humanRoleCounts.set(humanRole, (humanRoleCounts.get(humanRole) || 0) + 1);
      aiRoleCounts.set(aiRole, (aiRoleCounts.get(aiRole) || 0) + 1);

      // Count pairs
      const pairKey = `${humanRole}->${aiRole}`;
      rolePairs.set(pairKey, (rolePairs.get(pairKey) || 0) + 1);
    }
  });

  // Create nodes
  const nodes: RoleNode[] = [];

  humanRoleCounts.forEach((count, role) => {
    nodes.push({
      id: `human-${role}`,
      label: role,
      type: 'human',
      count
    });
  });

  aiRoleCounts.forEach((count, role) => {
    nodes.push({
      id: `ai-${role}`,
      label: role,
      type: 'ai',
      count
    });
  });

  // Create links with percentages
  const totalConversations = conversations.length;
  const links: RoleLink[] = [];

  rolePairs.forEach((count, pairKey) => {
    const [humanRole, aiRole] = pairKey.split('->');
    links.push({
      source: `human-${humanRole}`,
      target: `ai-${aiRole}`,
      value: count,
      percentage: (count / totalConversations) * 100
    });
  });

  // Sort links by value (descending)
  links.sort((a, b) => b.value - a.value);

  // Create Sankey data structure
  const sankeyData = convertToSankeyFormat(nodes, links);

  return {
    nodes,
    links,
    sankeyData
  };
}

/**
 * Convert nodes and links to Sankey diagram format
 */
function convertToSankeyFormat(nodes: RoleNode[], links: RoleLink[]): SankeyData {
  // Import role colors
  const ROLE_COLORS: Record<string, string> = {
    // Human roles
    'information-seeker': '#7b68ee',
    'provider': '#4ade80',
    'director': '#ec4899',
    'collaborator': '#06b6d4',
    'social-expressor': '#fbbf24',
    'relational-peer': '#4ade80',

    // AI roles
    'expert-system': '#7b68ee',
    'learning-facilitator': '#06b6d4',
    'advisor': '#ec4899',
    'co-constructor': '#4ade80',
    'social-facilitator': '#fbbf24',
  };

  // Create node index map
  const nodeIndexMap = new Map<string, number>();
  const sankeyNodes: SankeyNode[] = nodes.map((node, index) => {
    nodeIndexMap.set(node.id, index);
    return {
      name: node.label,
      color: ROLE_COLORS[node.label] || '#888888'
    };
  });

  // Create links with indices
  const sankeyLinks: SankeyLink[] = links.map(link => ({
    source: nodeIndexMap.get(link.source) || 0,
    target: nodeIndexMap.get(link.target) || 0,
    value: link.value
  }));

  return {
    nodes: sankeyNodes,
    links: sankeyLinks
  };
}

/**
 * Get top N role pairs by frequency
 */
export function getTopRolePairs(links: RoleLink[], topN: number = 10): RoleLink[] {
  return links.slice(0, topN);
}

/**
 * Format role name for display (convert kebab-case to Title Case)
 */
export function formatRoleName(role: string): string {
  return role
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
