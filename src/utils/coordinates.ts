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
    if (c.humanRole?.distribution) {
        const humanRole = c.humanRole.distribution;
        const roleBasedX =
            (humanRole['challenger'] || 0) * 0.1 +
            (humanRole['seeker'] || 0) * 0.2 +     // Seeker = asking for help -> Functional
            (humanRole['learner'] || 0) * 0.3 +
            (humanRole['collaborator'] || 0) * 0.6 +
            (humanRole['sharer'] || 0) * 0.95;     // Sharer = sharing feelings -> Social

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

    if (pattern === 'question-answer' || pattern === 'advisory') {
        return 0.5 + 0.2 + strength; // ~0.8-0.9 (Divergent roles)
    }
    if (pattern === 'collaborative' || pattern === 'casual-chat' || pattern === 'storytelling') {
        return 0.5 - 0.2 - strength; // ~0.1-0.2 (Aligned)
    }

    // 2. Role Fallback
    if (c.aiRole?.distribution) {
        const aiRole = c.aiRole.distribution;
        const isExpert = (aiRole['expert'] || 0) + (aiRole['advisor'] || 0);
        const isPeer = (aiRole['peer'] || 0) + (aiRole['facilitator'] || 0);

        if (isExpert > isPeer) return 0.75;
        if (isPeer > isExpert) return 0.25;
    }

    return 0.5;
}
