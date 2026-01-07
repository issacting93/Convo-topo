/**
 * Load cluster assignments from analysis JSON files
 * 
 * This loads the actual cluster assignments from the cluster analysis scripts
 * which are more accurate than heuristic computation.
 */

import { CartographyCluster } from './clusterToGenUI';

interface ClusterData {
  [clusterName: string]: Array<{
    id: string;
    features?: any;
    classification?: any;
  }>;
}

let clusterAssignmentsCache: Map<string, CartographyCluster> | null = null;

/**
 * Normalize cluster names from JSON to our type system
 * Handles variations in cluster naming
 */
function normalizeClusterName(clusterName: string): CartographyCluster {
  const normalized = clusterName.trim();
  
  // Map variations to canonical names
  const mappings: Record<string, CartographyCluster> = {
    // StraightPath variations
    'StraightPath_FunctionalStructured_QA_InfoSeeking': 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking',
    'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking': 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking',
    'StraightPath_Stable_FunctionalStructured_Advisory_ProblemSolving': 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking',
    'StraightPath_Stable_MinimalDrift': 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking',
    
    // Valley variations
    'Valley_FunctionalStructured_QA_InfoSeeking': 'Valley_FunctionalStructured_QA_InfoSeeking',
    'Valley_FunctionalStructured_Narrative_InfoSeeking': 'Valley_FunctionalStructured_QA_InfoSeeking',
    'Valley_FunctionalEmergent_Casual_InfoSeeking': 'Valley_FunctionalStructured_QA_InfoSeeking',
    
    // MeanderingPath variations
    'MeanderingPath_Narrative_SelfExpression': 'MeanderingPath_Narrative_SelfExpression',
    'MeanderingPath_SocialEmergent_Narrative_SelfExpression': 'MeanderingPath_Narrative_SelfExpression',
    
    // Peak variations
    'Peak_Volatile_FunctionalStructured_QA_InfoSeeking': 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking',
    
    // SocialEmergent variations
    'SocialEmergent_Narrative_InfoSeeking': 'SocialEmergent_Narrative_InfoSeeking',
    'SocialEmergent_Narrative_Entertainment': 'SocialEmergent_Narrative_Entertainment',
    'SocialEmergent_Narrative_Relational': 'SocialEmergent_Narrative_Relational',
  };

  // Direct match
  if (mappings[normalized]) {
    return mappings[normalized];
  }

  // Pattern matching for variations
  if (normalized.includes('StraightPath') && normalized.includes('FunctionalStructured') && normalized.includes('QA')) {
    return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
  }
  if (normalized.includes('Valley') && normalized.includes('FunctionalStructured')) {
    return 'Valley_FunctionalStructured_QA_InfoSeeking';
  }
  if (normalized.includes('MeanderingPath') && normalized.includes('SelfExpression')) {
    return 'MeanderingPath_Narrative_SelfExpression';
  }
  if (normalized.includes('Peak') && normalized.includes('Volatile')) {
    return 'Peak_Volatile_FunctionalStructured_QA_InfoSeeking';
  }
  if (normalized.includes('SocialEmergent') && normalized.includes('Entertainment')) {
    return 'SocialEmergent_Narrative_Entertainment';
  }
  if (normalized.includes('SocialEmergent') && normalized.includes('Relational')) {
    return 'SocialEmergent_Narrative_Relational';
  }
  if (normalized.includes('SocialEmergent') && normalized.includes('InfoSeeking')) {
    return 'SocialEmergent_Narrative_InfoSeeking';
  }

  // Default fallback
  console.warn(`Unknown cluster name: ${clusterName}, defaulting to StraightPath_Stable`);
  return 'StraightPath_Stable_FunctionalStructured_QA_InfoSeeking';
}

/**
 * Load cluster assignments from JSON files
 * Tries hierarchical first, then kmeans
 */
export async function loadClusterAssignments(): Promise<Map<string, CartographyCluster>> {
  if (clusterAssignmentsCache) {
    return clusterAssignmentsCache;
  }

  const assignments = new Map<string, CartographyCluster>();

  try {
    // Try hierarchical first (preferred)
    const hierarchicalResponse = await fetch('/reports/path-clusters-hierarchical.json');
    if (hierarchicalResponse.ok) {
      const data: ClusterData = await hierarchicalResponse.json();
      for (const [clusterName, conversations] of Object.entries(data)) {
        const normalizedCluster = normalizeClusterName(clusterName);
        for (const conv of conversations) {
          assignments.set(conv.id, normalizedCluster);
        }
      }
      clusterAssignmentsCache = assignments;
      return assignments;
    }
  } catch (error) {
    console.warn('Could not load hierarchical cluster assignments:', error);
  }

  try {
    // Fallback to kmeans
    const kmeansResponse = await fetch('/reports/path-clusters-kmeans.json');
    if (kmeansResponse.ok) {
      const data: ClusterData = await kmeansResponse.json();
      for (const [clusterName, conversations] of Object.entries(data)) {
        const normalizedCluster = normalizeClusterName(clusterName);
        for (const conv of conversations) {
          assignments.set(conv.id, normalizedCluster);
        }
      }
      clusterAssignmentsCache = assignments;
      return assignments;
    }
  } catch (error) {
    console.warn('Could not load kmeans cluster assignments:', error);
  }

  // Return empty map if neither file is available
  return assignments;
}

/**
 * Get cluster assignment for a conversation ID
 */
export async function getClusterAssignment(conversationId: string): Promise<CartographyCluster | null> {
  const assignments = await loadClusterAssignments();
  return assignments.get(conversationId) || null;
}

/**
 * Clear the cache (useful for development)
 */
export function clearClusterAssignmentsCache() {
  clusterAssignmentsCache = null;
}

