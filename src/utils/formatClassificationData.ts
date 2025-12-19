/**
 * Utility functions for formatting and displaying classification data
 */

import type { ClassifiedConversation } from './conversationToTerrain';

/**
 * Format category name from snake-case to Title Case
 */
export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format confidence score as a readable string
 */
export function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
}

/**
 * Get confidence color based on value
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return '#4ecdc4'; // Teal for high confidence
  if (confidence >= 0.5) return '#ffaa00'; // Orange for medium
  return '#ff6b6b'; // Red for low
}

/**
 * Format role distribution for display
 * Returns roles sorted by probability, filtered to show only significant ones
 */
export function formatRoleDistribution(
  distribution: Record<string, number>,
  threshold: number = 0.1
): Array<{ role: string; value: number; percentage: number }> {
  return Object.entries(distribution)
    .filter(([_, value]) => value >= threshold)
    .map(([role, value]) => ({
      role: formatCategoryName(role),
      value,
      percentage: Math.round(value * 100)
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get all classification dimensions in a structured format
 */
export function getClassificationDimensions(
  conversation: ClassifiedConversation | null
): Array<{
  label: string;
  category: string;
  confidence: number;
  formattedCategory: string;
  formattedConfidence: string;
  alternative?: string;
  evidence?: string[];
  rationale?: string;
}> {
  if (!conversation?.classification) return [];

  const c = conversation.classification;
  const dimensions: Array<{
    label: string;
    category: string;
    confidence: number;
    formattedCategory: string;
    formattedConfidence: string;
    alternative?: string;
    evidence?: string[];
    rationale?: string;
  }> = [];

  const dims = [
    { key: 'interactionPattern', label: 'Interaction Pattern' },
    { key: 'powerDynamics', label: 'Power Dynamics' },
    { key: 'emotionalTone', label: 'Emotional Tone' },
    { key: 'engagementStyle', label: 'Engagement Style' },
    { key: 'knowledgeExchange', label: 'Knowledge Exchange' },
    { key: 'conversationPurpose', label: 'Conversation Purpose' },
    { key: 'turnTaking', label: 'Turn Taking' },
  ] as const;

  for (const { key, label } of dims) {
    const dim = c[key as keyof typeof c] as { category?: string; confidence?: number; alternative?: string; evidence?: string[]; rationale?: string } | undefined;
    if (dim?.category) {
      dimensions.push({
        label,
        category: dim.category,
        confidence: dim.confidence ?? 0,
        formattedCategory: formatCategoryName(dim.category),
        formattedConfidence: formatConfidence(dim.confidence ?? 0),
        alternative: dim.alternative ?? undefined,
        evidence: dim.evidence,
        rationale: dim.rationale
      });
    }
  }

  return dimensions;
}

/**
 * Get formatted role distributions
 */
export function getRoleDistributions(conversation: ClassifiedConversation | null): {
  humanRoles: Array<{ role: string; value: number; percentage: number }>;
  aiRoles: Array<{ role: string; value: number; percentage: number }>;
  humanConfidence: number;
  aiConfidence: number;
} {
  if (!conversation?.classification) {
    return {
      humanRoles: [],
      aiRoles: [],
      humanConfidence: 0,
      aiConfidence: 0
    };
  }

  const c = conversation.classification;

  return {
    humanRoles: c.humanRole?.distribution
      ? formatRoleDistribution(c.humanRole.distribution)
      : [],
    aiRoles: c.aiRole?.distribution
      ? formatRoleDistribution(c.aiRole.distribution)
      : [],
    humanConfidence: c.humanRole?.confidence ?? 0,
    aiConfidence: c.aiRole?.confidence ?? 0
  };
}

/**
 * Format classification metadata for display
 */
export function formatClassificationMetadata(
  conversation: ClassifiedConversation | null
): {
  model?: string;
  provider?: string;
  timestamp?: string;
  processingTime?: string;
  promptVersion?: string;
} {
  if (!conversation?.classificationMetadata) {
    return {};
  }

  const meta = conversation.classificationMetadata;
  const date = meta.timestamp ? new Date(meta.timestamp) : null;

  return {
    model: meta.model,
    provider: meta.provider ? meta.provider.toUpperCase() : undefined,
    timestamp: date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString() : undefined,
    processingTime: meta.processingTimeMs ? `${(meta.processingTimeMs / 1000).toFixed(1)}s` : undefined,
    promptVersion: meta.promptVersion
  };
}

/**
 * Get classification summary stats
 */
export function getClassificationStats(
  conversation: ClassifiedConversation | null
): {
  totalDimensions: number;
  averageConfidence: number;
  lowConfidenceCount: number;
  abstain: boolean;
} {
  if (!conversation?.classification) {
    return {
      totalDimensions: 0,
      averageConfidence: 0,
      lowConfidenceCount: 0,
      abstain: false
    };
  }

  const c = conversation.classification;
  const dimensions = getClassificationDimensions(conversation);
  
  const confidences = dimensions.map(d => d.confidence);
  const averageConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;
  
  const lowConfidenceCount = confidences.filter(conf => conf < 0.5).length;

  return {
    totalDimensions: dimensions.length,
    averageConfidence,
    lowConfidenceCount,
    abstain: c.abstain ?? false
  };
}

