import { TerrainPreset } from '../data/terrainPresets';
import { generate2DPathPoints } from './terrain';
import { getCommunicationFunction, getConversationStructure } from './coordinates';
import { Conversation } from '../schemas/conversationSchema';

// Re-export type for compatibility if needed, or alias it
export type ClassifiedConversation = Conversation;


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

  // Z: Affective Intensity (Calm ↔ Agitated)
  // Use average emotional intensity from message PAD scores if available, otherwise use conversation-level estimate
  let z: number;
  if (conversation.messages && conversation.messages.length > 0) {
    // Calculate average emotional intensity from per-message PAD scores
    const messagesWithPad = conversation.messages.filter(msg => msg.pad?.emotionalIntensity !== undefined);
    if (messagesWithPad.length > 0) {
      const avgIntensity = messagesWithPad.reduce((sum, msg) =>
        sum + (msg.pad?.emotionalIntensity || 0), 0) / messagesWithPad.length;
      z = Math.max(0, Math.min(1, avgIntensity));
    } else {
      // Fallback: use conversation-level emotional intensity from classification
      z = heightParams.emotionalIntensity;
    }
  } else {
    // No messages: use conversation-level estimate
    z = heightParams.emotionalIntensity;
  }

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
 * Map goal roles (instructor, evaluator, dependent, confidant) to classification roles
 * Updated for 4-role taxonomy
 */
export function mapToGoalRole(humanRole: string, aiRole: string | null): string {
  // Map human roles to goal roles (updated for 4-role taxonomy)
  const roleMap: Record<string, string> = {
    'challenger': 'evaluator',
    'seeker': 'dependent',
    'sharer': 'confidant',
    'collaborator': 'collaborator'
  };

  // Check if human role maps to a goal role
  if (roleMap[humanRole]) {
    // Confidant requires AI to be reflector
    if (roleMap[humanRole] === 'confidant' && aiRole && aiRole !== 'reflector') {
      return 'collaborator'; // Fallback if AI role doesn't match
    }
    return roleMap[humanRole];
  }

  return humanRole; // Return original if no mapping
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

  // Calculate emotional intensity based on PAD model (Affective/Evaluative Lens)
  // Z-height increases with high Arousal (agitation) + low Pleasure (frustration)
  // Current implementation: Text-based approximation using tone and engagement
  // Envisioned: Multimodal fusion (face analysis, voice analysis, sentiment)

  const tone = c.emotionalTone?.category || 'neutral';
  const engagement = c.engagementStyle?.category || 'reactive';

  // PAD Model: Pleasure-Arousal-Dominance
  // High Arousal + Low Pleasure = Frustration/Agitation = Peaks
  // Low Arousal + High Pleasure = Affiliation = Valleys

  // Map tone to Pleasure dimension (P)
  // Low Pleasure (frustration) = serious, neutral when challenging
  // High Pleasure (affiliation) = supportive, playful, empathetic
  const pleasure =
    (tone === 'playful' || tone === 'supportive' || tone === 'empathetic') ? 0.8 : // High pleasure
      (tone === 'serious' || (tone === 'neutral' && engagement === 'challenging')) ? 0.2 : // Low pleasure
        0.5; // Neutral

  // Map engagement to Arousal dimension (A)
  // High Arousal = challenging, questioning (agitation)
  // Low Arousal = reactive, affirming (calm)
  const arousal =
    (engagement === 'challenging' || engagement === 'questioning') ? 0.8 : // High arousal
      (engagement === 'reactive') ? 0.3 : // Low arousal
        0.5; // Moderate

  // Emotional intensity = (1 - Pleasure) + Arousal
  // High intensity = low pleasure (frustration) + high arousal (agitation) = peaks
  // Low intensity = high pleasure (affiliation) + low arousal (calm) = valleys
  const emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4;

  return {
    avgConfidence: Math.max(0.3, Math.min(1.0, avgConfidence)),
    emotionalIntensity: Math.max(0.2, Math.min(1.0, emotionalIntensity))
  };
}

