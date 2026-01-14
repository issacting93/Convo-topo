/**
 * Cluster-Based UI Component
 * 
 * Renders GenUI visual languages based on Cartography conversation clusters.
 * This bridges the Cartography visualization system with GenUI's visual language generation.
 */

import { useMemo } from 'react';
import { Conversation } from '../schemas/conversationSchema';
import { determineCluster } from '../utils/determineCluster';
import { clusterToUserProfile, getLanguageForCluster } from '../utils/clusterToGenUI';
import { UserProfile } from '../utils/genUITypes';

interface ClusterBasedUIProps {
  conversation: Conversation;
  className?: string;
}

/**
 * Cluster-Based UI Component
 * 
 * Determines the cluster for a conversation and renders the appropriate GenUI layout
 */
export function ClusterBasedUI({ conversation, className }: ClusterBasedUIProps) {
  // Determine cluster
  const cluster = useMemo(() => determineCluster(conversation), [conversation]);

  // Generate user profile from cluster
  const userProfile = useMemo(() => {
    // Extract topics from conversation messages
    const topics = conversation.messages
      .slice(0, 5)
      .map(msg => {
        // Simple topic extraction (first few words)
        const words = msg.content.split(' ').slice(0, 3).join(' ');
        return words.length > 20 ? words.substring(0, 20) + '...' : words;
      })
      .filter(t => t.length > 0);

    return clusterToUserProfile(
      cluster,
      conversation.messages?.length || 0,
      topics
    );
  }, [conversation, cluster]);

  // Get language ID
  const languageId = useMemo(() => getLanguageForCluster(cluster), [cluster]);

  return (
    <div className={className}>
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Cluster-Based UI Generation</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div>
            <span className="font-medium">Cluster:</span> {cluster}
          </div>
          <div>
            <span className="font-medium">Visual Language:</span> {languageId}
          </div>
          <div>
            <span className="font-medium">Interface Type:</span>{' '}
            {getAttributeDescription('zone', userProfile.primaryZone)}
          </div>
          <div>
            <span className="font-medium">Interaction Style:</span>{' '}
            {getEpistemicPostureDescription(getEpistemicPosture(languageId))}
          </div>
        </div>
      </div>

      <GenUIWrapper userProfile={userProfile} />
    </div>
  );
}

/**
 * Wrapper component that renders GenUI with the user profile
 * This is a simplified version that directly uses GenUI's generation logic
 */
/**
 * Get human-readable description for profile attributes
 */
function getAttributeDescription(attribute: string, value: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    zone: {
      'tool-basin': 'For completing tasks quickly',
      'companion-delta': 'For building relationships',
      'evaluator-heights': 'For analyzing data',
      'collaborator-ridge': 'For exploring ideas',
      'tutor-plateau': 'For learning',
      'social-accommodator': 'For adapting to context',
    },
    movement: {
      'anchored': 'Stays consistent throughout',
      'drifting': 'Changes slowly over time',
      'oscillating': 'Alternates between patterns',
      'sudden-shift': 'Changes abruptly',
    },
    intensity: {
      'calm': 'Steady, low emotional peaks',
      'variable': 'Mixed emotional levels',
      'intense': 'High emotional peaks',
    },
    diversity: {
      'focused': 'Stays on one topic',
      'explorer': 'Covers related topics',
      'wanderer': 'Covers many different topics',
    },
    temporal: {
      'task-focused': 'Aimed at completing tasks',
      'relationship-builder': 'Aimed at building connection',
      'mixed': 'Both tasks and relationships',
    },
  };

  return descriptions[attribute]?.[value] || value;
}

function GenUIWrapper({ userProfile }: { userProfile: UserProfile }) {
  // Import GenUI's generation function
  // For now, we'll create a simple wrapper that shows the profile info
  // Full integration would require importing GenUI's App component

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <div className="mb-4">
        <h4 className="text-md font-semibold mb-3">Generated UI Profile</h4>
        <div className="space-y-3 text-sm">
          <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              What kind of interface?
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getAttributeDescription('zone', userProfile.primaryZone)}
            </div>
          </div>

          <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              How does the conversation change?
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getAttributeDescription('movement', userProfile.movement)}
            </div>
          </div>

          <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              How intense are the emotions?
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getAttributeDescription('intensity', userProfile.intensity)}
            </div>
          </div>

          <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              How many topics are covered?
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getAttributeDescription('diversity', userProfile.diversity)}
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              What's the main purpose?
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getAttributeDescription('temporal', userProfile.temporalOrientation)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> Full GenUI integration requires copying GenUI components into this project
          or setting up a proper module import. This is a placeholder showing the generated profile.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          The GenUI system would render a complete UI layout based on this profile, using the visual
          language ({getLanguageForCluster(userProfile.name as any)}) appropriate for the cluster.
        </p>
      </div>
    </div>
  );
}

/**
 * Get epistemic posture for a language ID
 */
function getEpistemicPosture(languageId: string): string {
  const postures: Record<string, string> = {
    instrumental: 'do',
    relational: 'connect',
    analytical: 'evaluate',
    exploratory: 'explore',
    instructional: 'learn',
    conversational: 'accommodate',
  };
  return postures[languageId] || 'explore';
}

/**
 * Get human-readable description for epistemic posture
 */
function getEpistemicPostureDescription(posture: string): string {
  const descriptions: Record<string, string> = {
    'do': 'Focused on completing tasks',
    'connect': 'Focused on building relationships',
    'evaluate': 'Focused on analyzing information',
    'explore': 'Focused on discovering new ideas',
    'learn': 'Focused on learning',
    'accommodate': 'Adapts to the situation',
  };
  return descriptions[posture] || posture;
}

