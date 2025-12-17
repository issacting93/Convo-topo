import { TerrainPreset } from '../data/terrainPresets';

export interface ClassifiedConversation {
  id: string;
  messages: Array<{ role: string; content: string }>;
  classification: {
    interactionPattern?: { category: string; confidence: number };
    powerDynamics?: { category: string; confidence: number };
    emotionalTone?: { category: string; confidence: number };
    engagementStyle?: { category: string; confidence: number };
    knowledgeExchange?: { category: string; confidence: number };
    conversationPurpose?: { category: string; confidence: number };
    topicDepth?: { category: string; confidence: number };
    turnTaking?: { category: string; confidence: number };
    humanRole?: { distribution: Record<string, number>; confidence: number };
    aiRole?: { distribution: Record<string, number>; confidence: number };
    abstain?: boolean;
  };
  classificationMetadata?: {
    model: string;
    provider: string;
    timestamp: string;
    promptVersion: string;
    processingTimeMs: number;
  };
}

/**
 * Generate a deterministic seed from classification data
 */
function generateSeedFromClassification(conv: ClassifiedConversation): number {
  // Create a hash from classification categories
  let hash = 0;
  const classification = conv.classification;
  
  // Combine various classification dimensions
  const pattern = classification.interactionPattern?.category || 'unknown';
  const tone = classification.emotionalTone?.category || 'neutral';
  const purpose = classification.conversationPurpose?.category || 'unknown';
  const depth = classification.topicDepth?.category || 'surface';
  
  // Create hash from string combination
  const seedString = `${pattern}-${tone}-${purpose}-${depth}-${conv.id}`;
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
  
  const pattern = c.interactionPattern?.category || 'conversation';
  const tone = c.emotionalTone?.category || 'neutral';
  const depth = c.topicDepth?.category || 'surface';
  
  // Format: "Pattern Tone Depth" -> "Casual-Chat Playful Surface"
  const patternName = pattern.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  const toneName = tone.charAt(0).toUpperCase() + tone.slice(1);
  const depthName = depth.charAt(0).toUpperCase() + depth.slice(1);
  
  // Include depth in name if it's "deep" to make it more visible
  if (depth === 'deep') {
    return `${patternName} ${toneName} (Deep)`;
  }
  
  return `${patternName} ${toneName}`;
}

/**
 * Generate a description from classification
 */
function generateDescriptionFromClassification(conv: ClassifiedConversation): string {
  const c = conv.classification;
  const parts: string[] = [];
  
  if (c.interactionPattern) {
    parts.push(`${c.interactionPattern.category} pattern`);
  }
  
  if (c.powerDynamics) {
    parts.push(`${c.powerDynamics.category} dynamics`);
  }
  
  if (c.topicDepth) {
    parts.push(`${c.topicDepth.category} depth`);
  }
  
  // Add role information
  if (c.humanRole?.distribution) {
    const topHumanRole = Object.entries(c.humanRole.distribution)
      .sort(([, a], [, b]) => b - a)[0];
    if (topHumanRole && topHumanRole[1] > 0.3) {
      parts.push(`human: ${topHumanRole[0]}`);
    }
  }
  
  if (c.aiRole?.distribution) {
    const topAiRole = Object.entries(c.aiRole.distribution)
      .sort(([, a], [, b]) => b - a)[0];
    if (topAiRole && topAiRole[1] > 0.3) {
      parts.push(`ai: ${topAiRole[0]}`);
    }
  }
  
  const description = parts.join(', ');
  return description || 'Unclassified conversation';
}

/**
 * Convert a classified conversation to a terrain preset
 */
export function conversationToTerrain(
  conversation: ClassifiedConversation,
  index: number
): TerrainPreset {
  // Get terrain height parameters from classification
  const heightParams = getTerrainParams(conversation);
  
  return {
    id: index + 1,
    name: generateNameFromClassification(conversation),
    seed: generateSeedFromClassification(conversation),
    description: generateDescriptionFromClassification(conversation),
    heightParams: heightParams // Include height parameters for preview
  };
}

/**
 * Load all classified conversations from the output directory
 */
export async function loadClassifiedConversations(): Promise<ClassifiedConversation[]> {
  const conversations: ClassifiedConversation[] = [];
  
  try {
    // Try to load conversations from the output directory
    // In a real app, you'd fetch these from a server or use a bundler plugin
    // For now, we'll use dynamic imports or fetch
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try to fetch conversations sequentially
      let index = 0;
      let hasMore = true;
      
      while (hasMore && index < 100) { // Safety limit
        try {
          const response = await fetch(`/output/conv-${index}.json`);
          if (response.ok) {
            const data = await response.json();
            conversations.push(data);
            index++;
          } else {
            hasMore = false;
          }
        } catch (error) {
          // File doesn't exist or other error
          hasMore = false;
        }
      }
    }
  } catch (error) {
    console.error('Error loading classified conversations:', error);
  }
  
  return conversations;
}

/**
 * Convert multiple conversations to terrain presets
 */
export function conversationsToTerrains(
  conversations: ClassifiedConversation[]
): TerrainPreset[] {
  return conversations.map((conv, index) => 
    conversationToTerrain(conv, index)
  );
}

/**
 * Map classification to communicationFunction (0 = instrumental, 1 = expressive)
 * PRIORITY: Use role-based positioning when available, fallback to purpose-based
 */
export function getCommunicationFunction(conv: ClassifiedConversation): number {
  const c = conv.classification;
  
  // PRIORITY 1: Role-based positioning (from WORKFLOW.md)
  // X-axis: Based on human role distribution
  // Director + Challenger → more instrumental (lower X)
  // Sharer + Collaborator → more expressive (higher X)
  if (c.humanRole?.distribution) {
    const humanRole = c.humanRole.distribution;
    const roleBasedX = 
      (humanRole.director || 0) * 0.2 +
      (humanRole.challenger || 0) * 0.3 +
      (humanRole.sharer || 0) * 0.8 +
      (humanRole.collaborator || 0) * 0.7 +
      (humanRole.seeker || 0) * 0.4 +
      (humanRole.learner || 0) * 0.5;
    
    // If we have meaningful role data, use it
    const maxRoleValue = Math.max(...Object.values(humanRole));
    if (maxRoleValue > 0.3) {
      return Math.max(0, Math.min(1, roleBasedX));
    }
  }
  
  // FALLBACK: Purpose-based (original logic)
  const purpose = c.conversationPurpose?.category;
  if (purpose === 'entertainment' || purpose === 'relationship-building' || purpose === 'self-expression') {
    return 0.7 + (c.conversationPurpose?.confidence || 0.5) * 0.2; // 0.7-0.9 range
  }
  if (purpose === 'information-seeking' || purpose === 'problem-solving') {
    return 0.1 + (c.conversationPurpose?.confidence || 0.5) * 0.2; // 0.1-0.3 range
  }
  
  // Fallback to knowledge exchange
  const knowledge = c.knowledgeExchange?.category;
  if (knowledge === 'personal-sharing' || knowledge === 'experience-sharing') {
    return 0.6;
  }
  if (knowledge === 'factual-info' || knowledge === 'skill-sharing') {
    return 0.3;
  }
  
  return 0.5; // Default middle
}

/**
 * Map classification to conversationStructure (0 = structured, 1 = emergent)
 * PRIORITY: Use role-based positioning when available, fallback to pattern-based
 */
export function getConversationStructure(conv: ClassifiedConversation): number {
  const c = conv.classification;
  
  // PRIORITY 1: Role-based positioning (from WORKFLOW.md)
  // Y-axis: Based on AI role distribution
  // Expert + Advisor → structured (prescriptive) (lower Y)
  // Peer + Facilitator → emergent (exploratory) (higher Y)
  if (c.aiRole?.distribution) {
    const aiRole = c.aiRole.distribution;
    const roleBasedY =
      (aiRole.expert || 0) * 0.3 +
      (aiRole.advisor || 0) * 0.2 +
      (aiRole.facilitator || 0) * 0.7 +
      (aiRole.peer || 0) * 0.8 +
      (aiRole.reflector || 0) * 0.6 +
      (aiRole.affiliative || 0) * 0.5;
    
    // If we have meaningful role data, use it
    const maxRoleValue = Math.max(...Object.values(aiRole));
    if (maxRoleValue > 0.3) {
      return Math.max(0, Math.min(1, roleBasedY));
    }
  }
  
  // FALLBACK: Pattern-based (original logic)
  const pattern = c.interactionPattern?.category;
  if (pattern === 'collaborative' || pattern === 'casual-chat' || pattern === 'storytelling') {
    return 0.7 + (c.interactionPattern?.confidence || 0.5) * 0.2; // 0.7-0.9 range
  }
  if (pattern === 'question-answer' || pattern === 'advisory') {
    return 0.1 + (c.interactionPattern?.confidence || 0.5) * 0.2; // 0.1-0.3 range
  }
  
  // Fallback to engagement style
  const engagement = c.engagementStyle?.category;
  if (engagement === 'exploring' || engagement === 'questioning') {
    return 0.7;
  }
  if (engagement === 'reactive' || engagement === 'affirming') {
    return 0.4;
  }
  
  return 0.5; // Default middle
}

/**
 * Get dominant human role from classification
 * Returns the role with highest probability and its value
 */
export function getDominantHumanRole(conv: ClassifiedConversation): { role: string; value: number } | null {
  const distribution = conv.classification.humanRole?.distribution;
  if (!distribution) return null;
  
  const entries = Object.entries(distribution);
  if (entries.length === 0) return null;
  
  const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
  return { role, value };
}

/**
 * Get dominant AI role from classification
 * Returns the role with highest probability and its value
 */
export function getDominantAiRole(conv: ClassifiedConversation): { role: string; value: number } | null {
  const distribution = conv.classification.aiRole?.distribution;
  if (!distribution) return null;
  
  const entries = Object.entries(distribution);
  if (entries.length === 0) return null;
  
  const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
  return { role, value };
}

/**
 * Map goal roles (instructor, evaluator, dependent, confidant) to classification roles
 */
export function mapToGoalRole(humanRole: string, aiRole: string | null): string {
  // Map human roles to goal roles
  const roleMap: Record<string, string> = {
    'director': 'instructor',
    'challenger': 'evaluator',
    'seeker': 'dependent',
    'learner': 'dependent',
    'sharer': 'confidant',
    'collaborator': 'collaborator'
  };
  
  // Check if human role maps to a goal role
  if (roleMap[humanRole]) {
    // Confidant requires AI to be reflector or affiliative
    if (roleMap[humanRole] === 'confidant' && aiRole && aiRole !== 'reflector' && aiRole !== 'affiliative') {
      return 'collaborator'; // Fallback if AI role doesn't match
    }
    return roleMap[humanRole];
  }
  
  return humanRole; // Return original if no mapping
}

/**
 * Convert categorical topic depth to continuous numeric score (0.1 to 1.0)
 * Takes into account both the category and confidence level
 */
export function calculateDepthScore(conv: ClassifiedConversation): number {
  const c = conv.classification;
  const category = c.topicDepth?.category || 'surface';
  const confidence = c.topicDepth?.confidence || 0.5;

  // Base scores for each category
  const categoryScores: Record<string, number> = {
    'surface': 0.2,    // Very shallow
    'moderate': 0.55,  // Medium depth
    'deep': 0.9        // Very deep
  };

  const baseScore = categoryScores[category] || 0.2;

  // Adjust based on confidence:
  // - High confidence: closer to category base
  // - Low confidence: pull toward middle (0.5)
  const adjustedScore = baseScore * confidence + 0.5 * (1 - confidence);

  // Clamp to 0.1-1.0 range
  return Math.max(0.1, Math.min(1.0, adjustedScore));
}

/**
 * Get terrain parameters from classification for heightmap generation
 */
export function getTerrainParams(conv: ClassifiedConversation): {
  topicDepth: number;  // Changed from categorical to continuous 0.1-1.0
  avgConfidence: number;
  emotionalIntensity: number;
} {
  const c = conv.classification;

  // Calculate continuous depth score (0.1 to 1.0)
  const topicDepth = calculateDepthScore(conv);
  
  // Calculate average confidence across all dimensions
  const confidences = [
    c.interactionPattern?.confidence,
    c.powerDynamics?.confidence,
    c.emotionalTone?.confidence,
    c.engagementStyle?.confidence,
    c.knowledgeExchange?.confidence,
    c.conversationPurpose?.confidence,
    c.topicDepth?.confidence,
    c.turnTaking?.confidence,
    c.humanRole?.confidence,
    c.aiRole?.confidence
  ].filter((c): c is number => c !== undefined);
  
  const avgConfidence = confidences.length > 0
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0.7;
  
  // Calculate emotional intensity based on tone and engagement
  const tone = c.emotionalTone?.category || 'neutral';
  const engagement = c.engagementStyle?.category || 'reactive';
  
  const emotionalIntensity = 
    (tone === 'playful' || tone === 'supportive' || tone === 'empathetic' ? 0.7 : 0.3) +
    (engagement === 'affirming' || engagement === 'challenging' ? 0.2 : 0);
  
  return {
    topicDepth,
    avgConfidence: Math.max(0.3, Math.min(1.0, avgConfidence)),
    emotionalIntensity: Math.max(0.2, Math.min(1.0, emotionalIntensity))
  };
}

