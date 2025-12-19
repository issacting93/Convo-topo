import { TerrainPreset } from '../data/terrainPresets';
import { generate2DPathPoints } from './terrain';

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
  classification: ClassifiedConversation['classification'],
  _messageIndex: number,
  _totalMessages: number
): { pleasure: number; arousal: number; dominance: number; emotionalIntensity: number } {
  // Base PAD from conversation-level classification
  const convTone = classification?.emotionalTone?.category || 'neutral';
  const convEngagement = classification?.engagementStyle?.category || 'reactive';

  // Calculate base Pleasure (P) from conversation tone
  // Based on actual categories in data: ['empathetic', 'neutral', 'playful', 'serious', 'supportive']
  let basePleasure =
    (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
    (convTone === 'serious') ? 0.3 :
    (convTone === 'neutral') ? 0.5 : 0.5;

  // Calculate base Arousal (A) from conversation engagement  
  // Based on actual categories in data: ['affirming', 'exploring', 'questioning', 'reactive']
  let baseArousal =
    (convEngagement === 'questioning') ? 0.7 : // High arousal (probing, active)
    (convEngagement === 'reactive') ? 0.3 : // Low arousal (responding passively)
    (convEngagement === 'affirming') ? 0.45 : // Moderate-low (validating, calm)
    (convEngagement === 'exploring') ? 0.6 : // Moderate-high (curious, engaged)
    0.5; // Default fallback

  // Message-level adjustments based on content analysis
  const content = message.content.toLowerCase();

  // Detect frustration markers (low pleasure, high arousal)
  // More specific patterns to avoid false positives
  const frustrationMarkers = [
    /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
    /\bno[,.]?\s+(that\'s|this is|it is)/i,
    /\bnot\s+(quite|right|correct|working|working properly)/i,
    /\b(doesn\'t|does not|can\'t|cannot|won\'t|will not)\s+(work|seem|appear|make sense)/i,
    /\b(issue|problem|bug)\b/i,
    /\b(actually|however|but)\s+(that|this|it)/i,
  ];
  const hasFrustration = frustrationMarkers.some(pattern => pattern.test(content));

  // Detect satisfaction markers (high pleasure)
  // More specific patterns with positive context
  const satisfactionMarkers = [
    /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic)\b/i,
    /\b(thanks|thank you)\b/i,
    /\b(that|it)\s+works\b/i,
    /\byes[!.]?\s+(that\'s|exactly|perfect|correct|right)/i,
    /\bworks?\s+perfectly\b/i,
    /\bexactly\s+(what|what i|what we)/i,
    /\bthat\'s\s+it\b/i,
    /\blove\s+(it|this|that)\b/i,
  ];
  const hasSatisfaction = satisfactionMarkers.some(pattern => pattern.test(content));

  // Detect urgency/agitation (high arousal)
  // More specific patterns to avoid false positives
  const urgencyMarkers = [
    /\b(urgent|asap|as soon as possible)\b/i,
    /\b(quickly|immediately|right now)\b/i,
    /\bhelp[!.]?\s+(me|us|please)/i,
    /\bplease[!.]?\s+(help|urgent)/i,
    /\b(very|extremely|really)\s+(urgent|important|critical)/i,
    /\b(hurry|rush|fast)\b/i,
  ];
  const hasUrgency = urgencyMarkers.some(pattern => pattern.test(content));

  // Adjust PAD based on message content
  // Use more subtle adjustments to avoid extreme values
  if (hasFrustration) {
    basePleasure = Math.max(0.1, basePleasure - 0.25); // Lower pleasure
    baseArousal = Math.min(1.0, baseArousal + 0.25);   // Higher arousal
  }

  if (hasSatisfaction) {
    basePleasure = Math.min(1.0, basePleasure + 0.25); // Higher pleasure
    baseArousal = Math.max(0.1, baseArousal - 0.15);   // Lower arousal (calm)
  }

  if (hasUrgency && !hasFrustration) {
    // Only apply urgency if not already frustrated
    baseArousal = Math.min(1.0, baseArousal + 0.2); // Higher arousal
  }

  // Calculate Dominance (D) from message structure
  // Questions = lower dominance (seeking), Commands = higher dominance
  const isQuestion = content.includes('?');
  const isCommand = /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change )/i.test(content);
  const baseDominance = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);

  // Emotional intensity: High Arousal + Low Pleasure = Peaks (frustration)
  // Low Arousal + High Pleasure = Valleys (affiliation)
  const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;

  return {
    pleasure: Math.max(0, Math.min(1, basePleasure)),
    arousal: Math.max(0, Math.min(1, baseArousal)),
    dominance: Math.max(0, Math.min(1, baseDominance)),
    emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity))
  };
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

  // Calculate XYZ coordinates
  const x = getCommunicationFunction(conversation); // X: Functional ↔ Social
  const y = getConversationStructure(conversation); // Y: Structured ↔ Emergent
  const z = 0.5; // Z: Fixed height (no longer using topic depth)

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
    pathPoints2D // Pre-computed path points for minimap
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
  conversations: ClassifiedConversation[]
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
 * Map classification to communicationFunction (0 = functional, 1 = social)
 * PRIORITY: Use role-based positioning when available, fallback to purpose-based
 */
export function getCommunicationFunction(conv: ClassifiedConversation): number {
  const c = conv.classification;
  
  // If no classification, return default middle value
  if (!c) {
    return 0.5;
  }
  
  // PRIORITY 1: Role-based positioning (from WORKFLOW.md)
  // X-axis: Based on human role distribution
  // Director + Challenger → more functional (lower X)
  // Sharer + Collaborator → more social (higher X)
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
  
  // If no classification, return default middle value
  if (!c) {
    return 0.5;
  }
  
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
  if (!conv.classification) return null;
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
  if (!conv.classification) return null;
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

