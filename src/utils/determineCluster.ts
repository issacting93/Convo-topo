/**
 * Determine which cluster a conversation belongs to
 * 
 * This utility attempts to determine cluster membership from:
 * 1. Cluster assignment data (if available in conversation metadata)
 * 2. Computed characteristics based on classification and trajectory
 */

import { Conversation } from '../schemas/conversationSchema';
import { CartographyCluster } from './clusterToGenUI';
import { getClusterAssignment } from './loadClusterAssignments';

// Cache for cluster assignments to avoid repeated async calls
let clusterAssignmentsCache: Map<string, CartographyCluster> | null = null;

/**
 * Load cluster assignments once and cache them
 */
async function loadClusterAssignmentsOnce(): Promise<Map<string, CartographyCluster>> {
  if (clusterAssignmentsCache) {
    return clusterAssignmentsCache;
  }

  const assignments = new Map<string, CartographyCluster>();

  try {
    await getClusterAssignment(''); // This will trigger loading
    // Actually, we need to load all assignments
    const { loadClusterAssignments } = await import('./loadClusterAssignments');
    clusterAssignmentsCache = await loadClusterAssignments();
    return clusterAssignmentsCache;
  } catch (error) {
    console.warn('Could not load cluster assignments:', error);
    return assignments;
  }
}

/**
 * Attempt to determine cluster from conversation metadata
 */
export function getClusterFromMetadata(conversation: Conversation): CartographyCluster | null {
  // Check if cluster is stored in metadata
  const metadata = (conversation as any).clusterMetadata;
  if (metadata?.cluster) {
    return metadata.cluster as CartographyCluster;
  }

  // Check if cluster is stored in classification metadata
  const classificationMeta = conversation.classificationMetadata;
  if (classificationMeta && (classificationMeta as any).cluster) {
    return (classificationMeta as any).cluster as CartographyCluster;
  }

  return null;
}

/**
 * Get cluster from loaded assignment data (synchronous if cache is available)
 */
export function getClusterFromAssignments(conversationId: string): CartographyCluster | null {
  if (clusterAssignmentsCache) {
    return clusterAssignmentsCache.get(conversationId) || null;
  }
  return null;
}

/**
 * Compute cluster from conversation characteristics
 * 
 * This is a heuristic based on cluster analysis findings.
 * For accurate clustering, use the cluster assignment data from analysis scripts.
 */
export function computeClusterFromCharacteristics(conversation: Conversation): CartographyCluster {
  const classification = conversation.classification;
  if (!classification) {
    // Default fallback
    return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
  }

  const pattern = classification.interactionPattern?.category || 'unknown';
  const purpose = classification.conversationPurpose?.category || 'unknown';
  // tone variable removed

  // Calculate average emotional intensity from PAD scores
  const padScores = conversation.messages
    .map(msg => msg.pad?.emotionalIntensity || 0)
    .filter(v => v > 0);
  // avgIntensity variable removed
  const intensityVariance = padScores.length > 1
    ? computeVariance(padScores)
    : 0;

  // Check for peaks (high intensity moments)
  const peakCount = padScores.filter(v => v > 0.7).length;
  const peakDensity = padScores.length > 0 ? peakCount / padScores.length : 0;

  // Check for valleys (low intensity moments)
  const valleyCount = padScores.filter(v => v < 0.3).length;
  const valleyDensity = padScores.length > 0 ? valleyCount / padScores.length : 0;

  // Get role distributions
  const humanRoles = classification.humanRole?.distribution || {};
  const aiRoles = classification.aiRole?.distribution || {};

  // Determine functional vs social (from human roles) - Social Role Theory taxonomy
  // Instrumental roles (Functional) vs Expressive roles (Social)
  const functionalRoles = (humanRoles.director || humanRoles['challenger'] || 0) +
    (humanRoles['information-seeker'] || humanRoles['seeker'] || 0) +
    (humanRoles['provider'] || humanRoles['learner'] || 0) +
    (humanRoles.collaborator || humanRoles['co-constructor'] || 0);
  const socialRoles = (humanRoles['social-expressor'] || humanRoles.sharer || 0) +
    (humanRoles['relational-peer'] || humanRoles.peer || 0);
  const isFunctional = functionalRoles > socialRoles;

  // Determine aligned vs divergent (approximated from AI roles when linguistic data unavailable)
  // Note: This is a fallback approximation. Primary calculation uses linguistic alignment.
  // High Authority (Structured/Aligned) vs Low Authority (Emergent/Divergent)
  const alignedRoles = (aiRoles['expert-system'] || aiRoles.expert || 0) +
    (aiRoles.advisor || 0);
  const divergentRoles = (aiRoles['learning-facilitator'] || aiRoles['facilitator'] || 0) +
    (aiRoles['social-facilitator'] || aiRoles.reflector || 0);
  const isStructured = alignedRoles > divergentRoles; // Using legacy variable name for compatibility

  // Cluster 6: Peak_Volatile - High intensity variance and peaks
  if (intensityVariance > 0.01 && peakDensity > 0.05 && pattern === 'question-answer' && isFunctional) {
    return 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking';
  }

  // Cluster 4: SocialEmergent_Narrative_Entertainment
  if (purpose === 'entertainment' && pattern === 'storytelling' && !isFunctional) {
    return 'SocialEmergent_Narrative_Entertainment';
  }

  // Cluster 7: SocialEmergent_Narrative_Relational
  if (purpose === 'relationship-building' && pattern === 'storytelling' && !isFunctional) {
    return 'SocialEmergent_Narrative_Relational';
  }

  // Cluster 5: MeanderingPath_Narrative_SelfExpression
  if (purpose === 'self-expression' && pattern === 'storytelling') {
    return 'MeanderingPath_Narrative_SelfExpression';
  }

  // Cluster 3: SocialEmergent_Narrative_InfoSeeking
  if (purpose === 'information-seeking' && pattern === 'storytelling' && !isStructured) {
    return 'SocialEmergent_Narrative_InfoSeeking';
  }

  // Cluster 2: Valley_FunctionalStructured_QA_InfoSeeking
  if (pattern === 'question-answer' && purpose === 'information-seeking' && isFunctional && isStructured && valleyDensity > 0.1) {
    return 'Valley_FunctionalStructured_QA_InfoSeeking';
  }

  // Cluster 1: StraightPath_Stable_FunctionalStructured_QA_InfoSeeking (default for functional/structured Q&A)
  if (pattern === 'question-answer' && purpose === 'information-seeking' && isFunctional && isStructured) {
    return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
  }

  // Fallback defaults based on pattern
  if (isFunctional && isStructured) {
    return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
  }

  if (!isFunctional && !isStructured) {
    return 'SocialEmergent_Narrative_InfoSeeking';
  }

  // Final fallback
  return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
}

/**
 * Determine cluster for a conversation
 * Tries: 1) metadata, 2) loaded assignments, 3) computation
 */
export function determineCluster(conversation: Conversation): CartographyCluster {
  // Try metadata first
  const fromMetadata = getClusterFromMetadata(conversation);
  if (fromMetadata) {
    return fromMetadata;
  }

  // Try loaded assignments (if cache is available)
  const fromAssignments = getClusterFromAssignments(conversation.id);
  if (fromAssignments) {
    return fromAssignments;
  }

  // Fallback to computation
  return computeClusterFromCharacteristics(conversation);
}

/**
 * Async version that loads assignments if needed
 */
export async function determineClusterAsync(conversation: Conversation): Promise<CartographyCluster> {
  // Try metadata first
  const fromMetadata = getClusterFromMetadata(conversation);
  if (fromMetadata) {
    return fromMetadata;
  }

  // Load assignments if not cached
  if (!clusterAssignmentsCache) {
    await loadClusterAssignmentsOnce();
  }

  // Try loaded assignments
  const fromAssignments = getClusterFromAssignments(conversation.id);
  if (fromAssignments) {
    return fromAssignments;
  }

  // Fallback to computation
  return computeClusterFromCharacteristics(conversation);
}

/**
 * Helper: Compute variance of an array
 */
function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

