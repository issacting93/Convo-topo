/**
 * Cartesian Coordinate Engine
 * Maps conversation metadata and linguistic features to 2D space.
 */

import { Conversation } from '../schemas/conversationSchema';
import { calculateConversationAlignment, calculateFunctionalSocialScore } from './linguisticMarkers';

// ------------------------------------------------------------------
// X-AXIS: COMMUNICATION FUNCTION (Functional <-> Social)
// ------------------------------------------------------------------

/**
 * Calculate X-position based *only* on classification metadata
 */
function getMetadataBasedX(conv: Conversation): number {
    const c = conv.classification;
    if (!c) return 0.5;

    // 1. Role-based positioning (Strongest metadata signal)
    // Using Social Role Theory taxonomy: Instrumental (Functional, left) ↔ Expressive (Social, right)
    if (c.humanRole?.distribution) {
        const humanRole = c.humanRole.distribution;
        const roleBasedX =
            // Instrumental roles (Functional, left side: 0.1-0.4)
            (humanRole['director'] || humanRole['challenger'] || 0) * 0.1 +              // Instrumental, High Authority
            (humanRole['information-seeker'] || humanRole['seeker'] || 0) * 0.2 +        // Instrumental, Low Authority
            (humanRole['provider'] || humanRole['learner'] || 0) * 0.3 +                 // Instrumental, Low Authority (seeks from AI)
            (humanRole['collaborator'] || humanRole['co-constructor'] || 0) * 0.4 +      // Instrumental, Equal Authority
            // Expressive roles (Social, right side: 0.8-0.95)
            (humanRole['social-expressor'] || humanRole['sharer'] || 0) * 0.95 +         // Expressive, Low Authority
            (humanRole['relational-peer'] || 0) * 0.85;                                  // Expressive, Equal Authority

        const maxRoleValue = Math.max(...Object.values(humanRole));
        if (maxRoleValue > 0.3) {
            return Math.max(0, Math.min(1, roleBasedX));
        }
    }

    // 2. Purpose-based
    const purpose = c.conversationPurpose?.category;
    if (purpose === 'entertainment' || purpose === 'relationship-building' || purpose === 'self-expression') {
        return 0.7 + (c.conversationPurpose?.confidence || 0.5) * 0.2; // Social
    }
    if (purpose === 'information-seeking' || purpose === 'problem-solving') {
        return 0.1 + (c.conversationPurpose?.confidence || 0.5) * 0.2; // Functional
    }

    // 3. Knowledge exchange
    const knowledge = c.knowledgeExchange?.category;
    if (knowledge === 'personal-sharing' || knowledge === 'experience-sharing') {
        return 0.8;
    }
    if (knowledge === 'factual-info' || knowledge === 'skill-sharing') {
        return 0.2;
    }

    return 0.5; // Default middle
}

export function getCommunicationFunction(conv: Conversation): number {
    // 1. Calculate Metadata Baseline
    const metadataX = getMetadataBasedX(conv);

    // 2. Calculate Linguistic Score (if available)
    if (conv.messages && conv.messages.length > 0) {
        const linguisticX = calculateFunctionalSocialScore(conv.messages);

        // HYBRID BLENDING STRATEGY
        // If linguistic score is very confident (near 0 or 1), use it.
        // If linguistic score is ambiguous (near 0.5), trust the metadata.
        const dist = Math.abs(linguisticX - 0.5);
        const confidence = Math.min(1, dist * 3.5);

        return (linguisticX * confidence) + (metadataX * (1 - confidence));
    }

    return metadataX;
}


// ------------------------------------------------------------------
// Y-AXIS: CONVERSATION STRUCTURE (Aligned <-> Divergent)
// ------------------------------------------------------------------

export function getConversationStructure(conv: Conversation): number {
    // PRIORITY 1: Linguistic alignment analysis
    if (conv.messages && conv.messages.length > 0) {
        let alignmentScore = calculateConversationAlignment(conv.messages);

        // CALIBRATION: Amplify signal
        const midpoint = 0.5;
        const spread = 2.0;
        alignmentScore = midpoint + (alignmentScore - midpoint) * spread;

        return Math.max(0.05, Math.min(0.95, alignmentScore));
    }

    // FALLBACK: Classification-Based Positioning
    const c = conv.classification;
    if (!c) return 0.5;

    // 1. Pattern (Most reliable)
    const pattern = c.interactionPattern?.category;
    const confidence = c.interactionPattern?.confidence || 0.5;
    const strength = 0.3 * confidence;

    // Adjusted mapping to reduce skew toward Divergent
    // Question-answer can be more balanced if it's a back-and-forth exchange
    if (pattern === 'question-answer') {
        // Use confidence to determine: high confidence = more divergent, low = more balanced
        return 0.5 + (0.15 * confidence); // ~0.5-0.65 (Balanced to Divergent)
    }
    if (pattern === 'advisory') {
        return 0.5 + 0.2 + strength; // ~0.8-0.9 (Divergent roles - one-way advice)
    }
    if (pattern === 'collaborative' || pattern === 'casual-chat' || pattern === 'storytelling') {
        return 0.5 - 0.2 - strength; // ~0.1-0.2 (Aligned)
    }

    // 2. Role Fallback
    // Using Social Role Theory taxonomy: High Authority (Structured, bottom) ↔ Low Authority (Emergent, top)
    if (c.aiRole?.distribution) {
        const aiRole = c.aiRole.distribution;
        // High Authority roles (Structured, bottom: 0.1-0.3)
        const isExpert = (aiRole['expert-system'] || aiRole['expert'] || 0) +
            (aiRole['advisor'] || 0);
        // Low Authority roles (Emergent, top: 0.7-0.8)
        const isFacilitator = (aiRole['learning-facilitator'] || aiRole['facilitator'] || 0) +
            (aiRole['social-facilitator'] || aiRole['reflector'] || 0);
        // Equal Authority roles (Balanced, middle: 0.5-0.6)
        const isPeer = (aiRole['relational-peer'] || aiRole['peer'] || 0) +
            (aiRole['co-constructor'] || 0);

        if (isExpert > isFacilitator && isExpert > isPeer) return 0.2; // High authority -> Structured
        if (isFacilitator > isExpert && isFacilitator > isPeer) return 0.8; // Low authority -> Emergent
        if (isPeer > isExpert && isPeer > isFacilitator) return 0.5; // Equal authority -> Balanced
    }

    return 0.5;
}

/**
 * Standardize mapping from [0, 1] data space to [0.1, 0.9] visualization space
 * This ensures all elements (paths, terrain density, markers) use the exact same boundaries.
 */
export function toVisualizationSpace(value: number): number {
    // 0.1 padding on each side to keep action away from edges
    return 0.1 + value * 0.8;
}
