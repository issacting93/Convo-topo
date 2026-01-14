/**
 * Cluster to GenUI Visual Language Mapping
 * 
 * Maps Cartography conversation clusters to GenUI visual languages
 * based on the relational positioning archetypes identified in cluster analysis.
 */

import { UserProfile } from './genUITypes';

/**
 * Cartography cluster names (from comprehensive cluster analysis)
 */
export type CartographyCluster =
  | 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking'
  | 'Valley_FunctionalStructured_QA_InfoSeeking'
  | 'SocialEmergent_Narrative_InfoSeeking'
  | 'SocialEmergent_Narrative_Entertainment'
  | 'MeanderingPath_Narrative_SelfExpression'
  | 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking'
  | 'SocialEmergent_Narrative_Relational';

/**
 * GenUI visual language IDs
 */
export type GenUILanguageId =
  | 'instrumental'
  | 'relational'
  | 'analytical'
  | 'exploratory'
  | 'instructional'
  | 'conversational';

/**
 * Mapping from Cartography clusters to GenUI visual languages
 * Based on cluster characteristics and epistemic postures
 */
export const CLUSTER_TO_LANGUAGE: Record<CartographyCluster, GenUILanguageId> = {
  // Cluster 1: Instrumental communication, minimal relational negotiation
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': 'instrumental',

  // Cluster 2: Task-oriented with brief rapport-building
  'Valley_FunctionalStructured_QA_InfoSeeking': 'instrumental',

  // Cluster 3: Information-seeking through narrative and relationship-building
  'SocialEmergent_Narrative_InfoSeeking': 'exploratory',

  // Cluster 4: Pure relational communication, relationship-building as primary goal
  'SocialEmergent_Narrative_Entertainment': 'relational',

  // Cluster 5: Self-expression conversations with minimal relational positioning
  'MeanderingPath_Narrative_SelfExpression': 'exploratory',

  // Cluster 6: Frustrated information-seeking with emotional peaks
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': 'analytical',

  // Cluster 7: Explicit relationship-building where connection is the explicit purpose
  'SocialEmergent_Narrative_Relational': 'relational',
};

/**
 * GenUI zone mapping (for UserProfile.primaryZone)
 */
export const CLUSTER_TO_ZONE: Record<CartographyCluster, string> = {
  'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': 'tool-basin',
  'Valley_FunctionalStructured_QA_InfoSeeking': 'tool-basin',
  'SocialEmergent_Narrative_InfoSeeking': 'collaborator-ridge',
  'SocialEmergent_Narrative_Entertainment': 'companion-delta',
  'MeanderingPath_Narrative_SelfExpression': 'collaborator-ridge',
  'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': 'evaluator-heights',
  'SocialEmergent_Narrative_Relational': 'companion-delta',
};

/**
 * Generate GenUI UserProfile from Cartography cluster
 * 
 * @param cluster - The cluster name from Cartography analysis
 * @param conversationCount - Number of conversations in this cluster (optional)
 * @param recentTopics - Recent topics from conversations (optional)
 * @returns UserProfile compatible with GenUI
 */
export function clusterToUserProfile(
  cluster: CartographyCluster,
  conversationCount?: number,
  recentTopics?: string[]
): UserProfile {
  const baseProfile: UserProfile = {
    name: cluster,
    primaryZone: CLUSTER_TO_ZONE[cluster],
    conversations: conversationCount || 0,
    recentTopics: recentTopics || [],
    movement: 'anchored',
    intensity: 'calm',
    linguisticStyle: 'neutral',
    diversity: 'focused',
    temporalOrientation: 'mixed',
  };

  // Map cluster characteristics to profile attributes
  switch (cluster) {
    case 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking':
      return {
        ...baseProfile,
        movement: 'anchored',
        intensity: 'calm',
        linguisticStyle: 'accommodator',
        diversity: 'focused',
        temporalOrientation: 'task-focused',
      };

    case 'Valley_FunctionalStructured_QA_InfoSeeking':
      return {
        ...baseProfile,
        movement: 'anchored',
        intensity: 'calm',
        linguisticStyle: 'accommodator',
        diversity: 'focused',
        temporalOrientation: 'task-focused',
      };

    case 'SocialEmergent_Narrative_InfoSeeking':
      return {
        ...baseProfile,
        movement: 'oscillating',
        intensity: 'variable',
        linguisticStyle: 'voice-preserver',
        diversity: 'explorer',
        temporalOrientation: 'relationship-builder',
      };

    case 'SocialEmergent_Narrative_Entertainment':
      return {
        ...baseProfile,
        movement: 'drifting',
        intensity: 'variable',
        linguisticStyle: 'style-mixer',
        diversity: 'wanderer',
        temporalOrientation: 'relationship-builder',
      };

    case 'MeanderingPath_Narrative_SelfExpression':
      return {
        ...baseProfile,
        movement: 'drifting',
        intensity: 'variable',
        linguisticStyle: 'voice-preserver',
        diversity: 'wanderer',
        temporalOrientation: 'mixed',
      };

    case 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking':
      return {
        ...baseProfile,
        movement: 'sudden-shift',
        intensity: 'intense',
        linguisticStyle: 'voice-preserver',
        diversity: 'focused',
        temporalOrientation: 'task-focused',
      };

    case 'SocialEmergent_Narrative_Relational':
      return {
        ...baseProfile,
        movement: 'drifting',
        intensity: 'variable',
        linguisticStyle: 'style-mixer',
        diversity: 'wanderer',
        temporalOrientation: 'relationship-builder',
      };

    default:
      return {
        ...baseProfile,
        movement: 'oscillating',
        intensity: 'variable',
        linguisticStyle: 'accommodator',
        diversity: 'explorer',
        temporalOrientation: 'mixed',
      };
  }
}

/**
 * Get GenUI language ID for a cluster
 */
export function getLanguageForCluster(cluster: CartographyCluster): GenUILanguageId {
  return CLUSTER_TO_LANGUAGE[cluster];
}

/**
 * Get zone for a cluster
 */
export function getZoneForCluster(cluster: CartographyCluster): string {
  return CLUSTER_TO_ZONE[cluster];
}

