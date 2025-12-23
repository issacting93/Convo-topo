/**
 * Failure Mode Metadata Utilities
 * 
 * Functions to detect and display interactional failures, breakdowns,
 * and non-repair patterns in conversations.
 */

export interface FailureMetadata {
  hasBreakdown?: boolean;
  breakdownType?: 'instructional-failure' | 'misalignment' | 'system-error' | 'breakdown-loop';
  repairAttempts?: number;
  repairSuccessful?: boolean;
  breakdownTurns?: number[];
  finalState?: 'collapsed' | 'stuck' | 'irrelevant' | 'normal';
}

export interface FailureFlags {
  hasBreakdown: boolean;
  hasInstructionalFailure: boolean;
  hasMisalignment: boolean;
  hasBreakdownLoop: boolean;
  hasRepairAttempts: boolean;
  hasSuccessfulRepair: boolean;
  aiRoleBroken: boolean;
  aiRoleNonGrounding: boolean;
  isFailedProblemSolving: boolean;
  isFailedInstruction: boolean;
}

/**
 * Extract failure flags from conversation classification
 */
export function extractFailureFlags(conversation: {
  classification?: {
    interactionPattern?: { category?: string };
    knowledgeExchange?: { category?: string };
    engagementStyle?: { category?: string };
    aiRole?: { distribution?: Record<string, number> };
    [key: string]: any;
  };
  messages?: Array<{
    role: string;
    content: string;
  }>;
}): FailureFlags {
  const flags: FailureFlags = {
    hasBreakdown: false,
    hasInstructionalFailure: false,
    hasMisalignment: false,
    hasBreakdownLoop: false,
    hasRepairAttempts: false,
    hasSuccessfulRepair: false,
    aiRoleBroken: false,
    aiRoleNonGrounding: false,
    isFailedProblemSolving: false,
    isFailedInstruction: false,
  };

  if (!conversation.classification) {
    return flags;
  }

  const { interactionPattern, knowledgeExchange, engagementStyle, aiRole } = conversation.classification;

  // Check interaction pattern for failure modes
  if (interactionPattern?.category) {
    const category = interactionPattern.category;
    flags.isFailedInstruction = category === 'failed-instruction';
    flags.hasMisalignment = category === 'misalignment';
    flags.hasBreakdownLoop = category === 'breakdown-loop';
    flags.hasBreakdown = flags.isFailedInstruction || flags.hasMisalignment || flags.hasBreakdownLoop;
  }

  // Check knowledge exchange for failures
  if (knowledgeExchange?.category) {
    const category = knowledgeExchange.category;
    flags.isFailedProblemSolving = category === 'failed-problem-solving' || category === 'instruction-failure';
    flags.hasBreakdown = flags.hasBreakdown || flags.isFailedProblemSolving;
  }

  // Check engagement style for repair attempts
  if (engagementStyle?.category === 'corrective' || engagementStyle?.category === 'repairing') {
    flags.hasRepairAttempts = true;
  }

  // Check AI role for breakdown states
  if (aiRole?.distribution) {
    const dist = aiRole.distribution;
    flags.aiRoleBroken = (dist.broken || 0) > 0.3;
    flags.aiRoleNonGrounding = (dist['non-grounding'] || 0) > 0.3;
    flags.hasBreakdown = flags.hasBreakdown || flags.aiRoleBroken || flags.aiRoleNonGrounding;
  }

  // Detect repair attempts from message patterns
  if (conversation.messages) {
    const repairMarkers = [
      /\b(creo que no entendiste|no entendiste|actually|that's wrong|incorrect|correction|clarification)\b/i,
      /(la idea es|the idea is|what I mean is)/i,
      /(te faltó|you missed|you forgot)/i,
    ];
    
    const hasRepairMarker = conversation.messages.some(msg =>
      repairMarkers.some(regex => regex.test(msg.content))
    );
    
    flags.hasRepairAttempts = flags.hasRepairAttempts || hasRepairMarker;

    // Check if repair was successful (conversation continues productively after repair attempts)
    if (flags.hasRepairAttempts && conversation.messages.length > 5) {
      // Look for signs of successful resolution in later messages
      const laterMessages = conversation.messages.slice(Math.floor(conversation.messages.length / 2));
      const hasResolution = laterMessages.some(msg =>
        /\b(thanks|gracias|perfect|exactly|yes|sí)\b/i.test(msg.content)
      );
      
      // If breakdown categories but no resolution, repair failed
      if (flags.hasBreakdown && !hasResolution) {
        flags.hasSuccessfulRepair = false;
      } else if (hasResolution) {
        flags.hasSuccessfulRepair = true;
      }
    }
  }

  return flags;
}

/**
 * Get color for failure mode status
 */
export function getFailureStatusColor(flags: FailureFlags): string {
  if (flags.aiRoleBroken) {
    return '#cc0000'; // Dark red for broken
  }
  if (flags.hasBreakdownLoop) {
    return '#ff4444'; // Red for breakdown loop
  }
  if (flags.hasInstructionalFailure || flags.hasMisalignment) {
    return '#ff8800'; // Orange for instructional failure
  }
  if (flags.aiRoleNonGrounding) {
    return '#ffaa00'; // Yellow-orange for non-grounding
  }
  if (flags.isFailedProblemSolving) {
    return '#ffaa00'; // Yellow for failed problem-solving
  }
  return 'transparent';
}

/**
 * Get label for failure mode status
 */
export function getFailureStatusLabel(flags: FailureFlags): string | null {
  if (flags.aiRoleBroken) {
    return 'System Breakdown';
  }
  if (flags.hasBreakdownLoop) {
    return 'Breakdown Loop';
  }
  if (flags.hasInstructionalFailure) {
    return 'Instructional Failure';
  }
  if (flags.hasMisalignment) {
    return 'Misalignment';
  }
  if (flags.aiRoleNonGrounding) {
    return 'Non-Grounding';
  }
  if (flags.isFailedProblemSolving) {
    return 'Failed Problem-Solving';
  }
  return null;
}

/**
 * Get description text for failure status
 */
export function getFailureStatusDescription(flags: FailureFlags): string | null {
  if (flags.aiRoleBroken) {
    return 'AI entered a non-functional state with nonsensical or irrelevant responses.';
  }
  if (flags.hasBreakdownLoop) {
    return 'Conversation stuck in repetitive failure cycle with no progress or resolution.';
  }
  if (flags.hasInstructionalFailure) {
    return 'Instructional interaction failed to converge due to repeated non-understanding.';
  }
  if (flags.hasMisalignment) {
    return 'Participants failed to establish shared understanding or grounding.';
  }
  if (flags.aiRoleNonGrounding) {
    return 'AI failed to establish shared understanding despite repair attempts.';
  }
  if (flags.isFailedProblemSolving) {
    return 'Attempted problem-solving interaction where no solution was achieved.';
  }
  return null;
}

/**
 * Check if AI role distribution indicates breakdown (sum is 0 or very low)
 */
export function isRoleBreakdown(aiRoleDistribution: Record<string, number> | undefined): boolean {
  if (!aiRoleDistribution) return false;
  
  const sum = Object.values(aiRoleDistribution).reduce((a, b) => a + b, 0);
  
  // If sum is 0 or very low (< 0.1), it indicates complete role failure
  return sum < 0.1;
}

/**
 * Get breakdown severity level
 */
export function getBreakdownSeverity(flags: FailureFlags): 'none' | 'minor' | 'moderate' | 'severe' {
  if (flags.aiRoleBroken) {
    return 'severe';
  }
  if (flags.hasBreakdownLoop) {
    return 'severe';
  }
  if (flags.hasInstructionalFailure || flags.hasMisalignment) {
    return 'moderate';
  }
  if (flags.aiRoleNonGrounding || flags.isFailedProblemSolving) {
    return 'moderate';
  }
  return 'none';
}

