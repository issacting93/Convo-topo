/**
 * Epistemic Metadata Utilities
 * 
 * Functions to detect and display epistemic failures, authority disruptions,
 * and trust repair patterns in conversations.
 */

export interface EpistemicMetadata {
  hallucinationDetected?: boolean;
  errorCorrected?: boolean;
  authorityDisruption?: boolean;
  trustRepairAttempted?: boolean;
  trustRepairSuccessful?: boolean;
  disruptionTurns?: number[];
  repairTurns?: number[];
  recoveryStrategy?: 'domain_shift' | 'apology' | 'correction' | 'none';
}

export interface EpistemicFlags {
  hasHallucination: boolean;
  hasError: boolean;
  hasCorrection: boolean;
  hasAuthorityDisruption: boolean;
  hasRepairAttempt: boolean;
  hasSuccessfulRepair: boolean;
  isContestedKnowledge: boolean;
  isErroneousFactual: boolean;
  isHallucinatedInfo: boolean;
}

/**
 * Extract epistemic flags from conversation classification
 */
export function extractEpistemicFlags(conversation: {
  classification?: {
    knowledgeExchange?: { category?: string };
    aiRole?: { distribution?: Record<string, number> };
    [key: string]: any;
  };
  messages?: Array<{
    role: string;
    content: string;
    pad?: any;
  }>;
}): EpistemicFlags {
  const flags: EpistemicFlags = {
    hasHallucination: false,
    hasError: false,
    hasCorrection: false,
    hasAuthorityDisruption: false,
    hasRepairAttempt: false,
    hasSuccessfulRepair: false,
    isContestedKnowledge: false,
    isErroneousFactual: false,
    isHallucinatedInfo: false,
  };

  if (!conversation.classification) {
    return flags;
  }

  const { knowledgeExchange } = conversation.classification;

  // Check knowledge exchange category
  if (knowledgeExchange?.category) {
    const category = knowledgeExchange.category;
    flags.isContestedKnowledge = category === 'contested-knowledge';
    flags.isErroneousFactual = category === 'erroneous-factual';
    flags.isHallucinatedInfo = category === 'hallucinated-info';
    flags.hasError = flags.isErroneousFactual || flags.isHallucinatedInfo;
    flags.hasHallucination = flags.isHallucinatedInfo;
    flags.hasCorrection = flags.isContestedKnowledge || flags.isErroneousFactual;
  }

  // Check for correction markers in messages
  if (conversation.messages) {
    const hasCorrectionMarker = conversation.messages.some(msg =>
      msg.content.match(/\b(actually|no,|that's wrong|incorrect|mistake|sorry|apologize)\b/i)
    );
    flags.hasCorrection = flags.hasCorrection || hasCorrectionMarker;
    flags.hasRepairAttempt = hasCorrectionMarker;
  }

  // Authority disruption inferred from power dynamics or role changes
  const { powerDynamics } = conversation.classification;
  if (powerDynamics?.category === 'human-dominant' && flags.hasCorrection) {
    flags.hasAuthorityDisruption = true;
  }

  // Successful repair if conversation continues after correction
  if (flags.hasRepairAttempt && conversation.messages && conversation.messages.length > 3) {
    flags.hasSuccessfulRepair = true;
  }

  return flags;
}

/**
 * Get color for epistemic status
 */
export function getEpistemicStatusColor(flags: EpistemicFlags): string {
  if (flags.isHallucinatedInfo) {
    return '#ff4444'; // Red for hallucination
  }
  if (flags.isErroneousFactual) {
    return '#ff8800'; // Orange for error
  }
  if (flags.isContestedKnowledge) {
    return '#ffaa00'; // Yellow for contested
  }
  if (flags.hasSuccessfulRepair) {
    return '#88cc00'; // Green for repaired
  }
  return 'transparent';
}

/**
 * Get label for epistemic status
 */
export function getEpistemicStatusLabel(flags: EpistemicFlags): string | null {
  if (flags.isHallucinatedInfo) {
    return 'Hallucination Detected';
  }
  if (flags.isErroneousFactual) {
    return 'Erroneous Information';
  }
  if (flags.isContestedKnowledge) {
    return 'Contested Knowledge';
  }
  if (flags.hasSuccessfulRepair) {
    return 'Trust Repaired';
  }
  return null;
}

/**
 * Get description text for epistemic status
 */
export function getEpistemicStatusDescription(flags: EpistemicFlags): string | null {
  if (flags.isHallucinatedInfo) {
    return 'AI provided fabricated information that was later corrected.';
  }
  if (flags.isErroneousFactual) {
    return 'AI provided incorrect factual information that was corrected.';
  }
  if (flags.isContestedKnowledge) {
    return 'Information was disputed or corrected during the conversation.';
  }
  if (flags.hasSuccessfulRepair) {
    return 'Error was detected and trust was repaired through apology or correction.';
  }
  return null;
}

