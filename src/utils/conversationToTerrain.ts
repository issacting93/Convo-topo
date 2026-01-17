import { TerrainPreset } from '../data/terrainPresets';
import { generate2DPathPoints } from './terrain';
import { getCommunicationFunction, getConversationStructure } from './coordinates';
import { Conversation } from '../schemas/conversationSchema';

// Re-export type for compatibility if needed, or alias it
export type ClassifiedConversation = Conversation;

// Re-export coordinate functions for convenience (used by multiple components)
export { getCommunicationFunction, getConversationStructure };

/**
 * Determine conversation source based on its ID
 * Returns one of: 'chatbot_arena', 'wildchat', 'oasst'
 */
export function getConversationSource(conversation: ClassifiedConversation): 'chatbot_arena' | 'wildchat' | 'oasst' {
  const id = conversation.id || '';

  // Check for each dataset type
  if (id.startsWith('chatbot_arena_')) {
    return 'chatbot_arena';
  }

  if (id.startsWith('wildchat_')) {
    return 'wildchat';
  }

  if (id.startsWith('oasst-')) {
    return 'oasst';
  }

  // Default to chatbot_arena for backwards compatibility
  return 'chatbot_arena';
}

/**
 * Calculate User Authority Score (0.0 - 1.0)
 * Proxies for agency and power in the interaction
 */
export function calculateUserAuthority(conv: Conversation): number {
  let score = 0;

  // 1. Power Dynamics Modifier
  const pd = conv.classification?.powerDynamics?.category;
  if (pd === 'human-led') score += 0.3;
  else if (pd === 'balanced' || pd === 'symmetric') score += 0.15;
  // ai-led gets 0 bonus

  // 2. Role-Based Authority
  // Get dominant human role
  let role = 'information-seeker'; // Default low authority
  let maxVal = 0;

  if (conv.classification?.humanRole?.distribution) {
    const dist = conv.classification.humanRole.distribution;
    for (const [r, v] of Object.entries(dist)) {
      if ((v as number) > maxVal) {
        maxVal = v as number;
        role = r;
      }
    }
  }

  // Role Authority Mapping
  const roleWeights: Record<string, number> = {
    'director': 0.7,      // High authority (directing)
    'evaluator': 0.7,     // High authority (judging)
    'provider': 0.6,      // High-ish (providing info)
    'expert': 0.6,
    'social-expressor': 0.3, // Personal agency
    'relational-peer': 0.3, // Shared agency
    'collaborator': 0.3,    // Shared agency
    'information-seeker': 0.0, // Low authority (asking)
    'dependent': 0.0,
    'passive': 0.0
  };

  // Map old/typo roles if needed
  const mappedRole = mapOldRoleToNew(role, 'human');
  const roleScore = roleWeights[mappedRole] ?? 0.2; // Default to low-mid if unknown

  score += roleScore;

  // Clamp to 0-1
  return Math.max(0.0, Math.min(1.0, score));
}


/**
 * Generate a deterministic seed from classification data
 */
function generateSeedFromClassification(conv: ClassifiedConversation): number {
  // Create a hash from classification categories
  let hash = 0;
  const classification = conv.classification;

  // If no classification, use conversation ID as seed
  if (!classification) {
    let idHash = 0;
    for (let i = 0; i < conv.id.length; i++) {
      const char = conv.id.charCodeAt(i);
      idHash = ((idHash << 5) - idHash) + char;
      idHash = idHash & idHash;
    }
    return Math.abs(idHash % 999) + 1;
  }

  // Combine various classification dimensions
  const pattern = classification.interactionPattern?.category || 'unknown';
  const tone = classification.emotionalTone?.category || 'neutral';
  const purpose = classification.conversationPurpose?.category || 'unknown';

  // Create hash from string combination
  const seedString = `${pattern}-${tone}-${purpose}-${conv.id}`;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Map to range 1-999 for terrain seeds
  return Math.abs(hash % 999) + 1;
}

/**
 * Generate a descriptive name from classification
 */
function generateNameFromClassification(conv: ClassifiedConversation): string {
  const c = conv.classification;

  // If no classification, use conversation ID
  if (!c) {
    return conv.id.replace(/^emo-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const pattern = c.interactionPattern?.category || 'conversation';
  const tone = c.emotionalTone?.category || 'neutral';

  // Format: "Pattern Tone" -> "Casual-Chat Playful"
  const patternName = pattern.split('-').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  const toneName = tone.charAt(0).toUpperCase() + tone.slice(1);

  return `${patternName} ${toneName}`;
}

/**
 * Generate a description from classification
 */
function generateDescriptionFromClassification(conv: ClassifiedConversation): string {
  const c = conv.classification;

  // If no classification, return basic description
  if (!c) {
    return `Conversation: ${conv.id}`;
  }

  const parts: string[] = [];

  if (c.interactionPattern) {
    parts.push(`${c.interactionPattern.category} pattern`);
  }

  if (c.powerDynamics) {
    parts.push(`${c.powerDynamics.category} dynamics`);
  }

  // Add role information
  if (c.humanRole?.distribution) {
    const topHumanRole = Object.entries(c.humanRole.distribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    if (topHumanRole && (topHumanRole[1] as number) > 0.3) {
      parts.push(`human: ${topHumanRole[0]}`);
    }
  }

  if (c.aiRole?.distribution) {
    const topAiRole = Object.entries(c.aiRole.distribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    if (topAiRole && (topAiRole[1] as number) > 0.3) {
      parts.push(`ai: ${topAiRole[0]}`);
    }
  }

  const description = parts.join(', ');
  return description || 'Unclassified conversation';
}

import { calculatePAD } from './pad';

/**
 * Calculate PAD (Pleasure-Arousal-Dominance) scores for a single message
 * Uses conversation-level classification as base, then analyzes message content for variations
 *
 * @param message - The message to analyze
 * @param classification - Conversation-level classification data
 * @param messageIndex - Index of this message in the conversation
 * @param totalMessages - Total number of messages in conversation
 * @returns PAD scores and derived emotional intensity
 */
export function calculateMessagePAD(
  message: { role: string; content: string },
  classification: Conversation['classification'],
  _messageIndex: number,
  _totalMessages: number
): { pleasure: number; arousal: number; dominance: number; emotionalIntensity: number } {
  // Use the shared PAD engine
  // This ensures consistent scoring across Flight Recorder and Terrain View
  const pad = calculatePAD(message.content, {
    tone: classification?.emotionalTone?.category,
    engagement: classification?.engagementStyle?.category
  });

  return pad;
}

/**
 * Convert a classified conversation to a terrain preset
 */
export function conversationToTerrain(
  conversation: Conversation,
  index: number
): TerrainPreset {
  // Get terrain height parameters from classification
  const heightParams = getTerrainParams(conversation);

  // Calculate XYZ coordinates
  const x = getCommunicationFunction(conversation); // X: Functional ↔ Social (Linguistic Markers)
  const y = getConversationStructure(conversation); // Y: Aligned ↔ Divergent (Linguistic Alignment)

  // Z: Authority Level (Agency/Power)
  // Replaces previous Emotional Intensity (PAD) mapping
  // Low Z = Low Authority (Seeker), High Z = High Authority (Director)
  const z = calculateUserAuthority(conversation);

  // Pre-compute 2D path points for minimap
  let pathPoints2D: Array<{ x: number; y: number; role: 'user' | 'assistant' }> = [];
  if (conversation.messages && conversation.messages.length > 0) {
    const preparedMessages = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      communicationFunction: x,
      conversationStructure: y
    }));

    pathPoints2D = generate2DPathPoints(preparedMessages);
  }

  return {
    id: index + 1,
    name: generateNameFromClassification(conversation),
    seed: generateSeedFromClassification(conversation),
    description: generateDescriptionFromClassification(conversation),
    heightParams: heightParams, // Include height parameters for preview
    xyz: { x, y, z }, // Include XYZ coordinates snapshot
    pathPoints2D, // Pre-computed path points for minimap
    conversationId: conversation.id
  };
}

/**
 * Load all classified conversations from the output directory
 */
// Note: loadClassifiedConversations is now in src/data/classifiedConversations.ts
// This function was removed to avoid duplication - use the one in data/classifiedConversations.ts instead

/**
 * Convert multiple conversations to terrain presets
 */
export function conversationsToTerrains(
  conversations: Conversation[]
): TerrainPreset[] {
  const terrains = conversations.map((conv, index) =>
    conversationToTerrain(conv, index)
  );
  if (import.meta.env.DEV) {
    console.log(`Created ${terrains.length} terrain presets from ${conversations.length} conversations`);
  }
  return terrains;
}

/**
 * Get dominant human role from classification
 * Returns the role with highest probability and its value
 */
export function getDominantHumanRole(conv: ClassifiedConversation): { role: string; value: number } | null {
  if (!conv.classification) return null;
  const distribution = conv.classification.humanRole?.distribution;
  if (!distribution) return null;

  const entries = Object.entries(distribution) as [string, number][];
  if (entries.length === 0) return null;

  const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
  return { role, value };
}

/**
 * Get dominant AI role from classification
 * Returns the role with highest probability and its value
 */
export function getDominantAiRole(conv: ClassifiedConversation): { role: string; value: number } | null {
  if (!conv.classification) return null;
  const distribution = conv.classification.aiRole?.distribution;
  if (!distribution) return null;

  const entries = Object.entries(distribution) as [string, number][];
  if (entries.length === 0) return null;

  const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
  return { role, value };
}

/**
 * Map old role names to new Social Role Theory taxonomy roles
 * Provides backward compatibility with old classifications
 */
export function mapOldRoleToNew(role: string, roleType: 'human' | 'ai'): string {
  if (roleType === 'human') {
    const humanMap: Record<string, string> = {
      // Old taxonomy → New taxonomy
      'challenger': 'director',
      'seeker': 'information-seeker',
      'learner': 'provider',
      'sharer': 'social-expressor',

      // Typos and variations
      'co-constructor': 'collaborator',
      'co-construct': 'collaborator',
      'co-constructive': 'collaborator',
      'co-constructer': 'collaborator',

      // Edge cases
      'artist': 'social-expressor',
      'philosophical-explorer': 'social-expressor',
      'teacher-evaluator': 'director',
      'tester': 'director',
      'story-builder': 'social-expressor',
      'meta-commentator': 'collaborator',
      'social-explorer': 'social-expressor',

      // Already new (passthrough)
      'information-seeker': 'information-seeker',
      'provider': 'provider',
      'director': 'director',
      'collaborator': 'collaborator',
      'social-expressor': 'social-expressor',
      'relational-peer': 'relational-peer',
    };

    // Return full taxonomy role (6+6, not reduced to 3+3)
    return humanMap[role] || role;
  } else {
    const aiMap: Record<string, string> = {
      // Old taxonomy → New taxonomy
      'expert': 'expert-system',
      'facilitator': 'learning-facilitator',
      'reflector': 'social-facilitator',
      'peer': 'relational-peer',
      'affiliative': 'social-facilitator',

      // Edge cases
      'learner': 'co-constructor',
      'creative-partner': 'co-constructor',
      'content-provider': 'expert-system',
      'meta-commentator': 'social-facilitator',
      'unable-to-engage': 'unable-to-engage',  // Keep as-is (special breakdown case)

      // Already new (passthrough)
      'expert-system': 'expert-system',
      'learning-facilitator': 'learning-facilitator',
      'advisor': 'advisor',
      'co-constructor': 'co-constructor',
      'social-facilitator': 'social-facilitator',
      'relational-peer': 'relational-peer',
    };

    // Return full taxonomy role (6+6, not reduced to 3+3)
    return aiMap[role] || role;
  }
}

/**
 * Map goal roles (instructor, evaluator, dependent, confidant) to classification roles
 * Updated for Social Role Theory taxonomy
 */
export function mapToGoalRole(humanRole: string, aiRole: string | null): string {
  // Map new human roles to goal roles
  const roleMap: Record<string, string> = {
    'director': 'evaluator',
    'information-seeker': 'dependent',
    'provider': 'dependent',
    'social-expressor': 'confidant',
    'collaborator': 'collaborator',
    'relational-peer': 'confidant',
    // Backward compatibility
    'challenger': 'evaluator',
    'seeker': 'dependent',
    'learner': 'dependent',
    'sharer': 'confidant',
    'co-constructor': 'collaborator',
  };

  const mappedRole = mapOldRoleToNew(humanRole, 'human');

  // Check if human role maps to a goal role
  if (roleMap[mappedRole]) {
    // Confidant requires AI to be social-facilitator or relational-peer (expressive)
    if ((roleMap[mappedRole] === 'confidant' || roleMap[mappedRole] === 'confidant') && aiRole) {
      const mappedAiRole = mapOldRoleToNew(aiRole, 'ai');
      if (!['social-facilitator', 'relational-peer', 'reflector'].includes(mappedAiRole)) {
        return 'collaborator'; // Fallback if AI role doesn't match
      }
    }
    return roleMap[mappedRole];
  }

  return mappedRole; // Return mapped role if no goal mapping
}

/**
 * Get terrain parameters from classification for heightmap generation
 */
export function getTerrainParams(conv: ClassifiedConversation): {
  avgConfidence: number;
  emotionalIntensity: number;
} {
  const c = conv.classification;

  // If no classification, return defaults
  if (!c) {
    return {
      avgConfidence: 0.5,
      emotionalIntensity: 0.5
    };
  }

  // Calculate average confidence across all dimensions (excluding topicDepth)
  const confidences = [
    c.interactionPattern?.confidence,
    c.powerDynamics?.confidence,
    c.emotionalTone?.confidence,
    c.engagementStyle?.confidence,
    c.knowledgeExchange?.confidence,
    c.conversationPurpose?.confidence,
    c.turnTaking?.confidence,
    c.humanRole?.confidence,
    c.aiRole?.confidence
  ].filter((c): c is number => c !== undefined);

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0.7;

  // Authority-Based Intensity (Replaces PAD)
  // Maps User Authority directly to terrain height/intensity params
  // High Authority = High Peaks (Director)
  // Low Authority = Low Valleys (Seeker)
  const emotionalIntensity = calculateUserAuthority(conv);

  return {
    avgConfidence: Math.max(0.3, Math.min(1.0, avgConfidence)),
    emotionalIntensity: Math.max(0.2, Math.min(1.0, emotionalIntensity))
  };
}

