/**
 * @antigravity/conversation-engine
 * 
 * This file serves as the public API for the Conversation Analysis SDK.
 * Import this file to access all analysis engines without importing internal project utils.
 */

// 1. FORENSIC ENGINES (Metrics)
// ----------------------------------------------------------------------------
export { calculatePAD } from './utils/pad';
export type { PADScores, PADContext } from './utils/pad';

export { detectSpikes } from './utils/spikeDetection';
export type { Spike } from './utils/spikeDetection';

export { analyzeTrajectory } from './utils/trajectoryStatus';
export type { TrajectoryStatus, TrajectoryAnalysis } from './utils/trajectoryStatus';


// 2. LINGUISTIC ENGINE (Style Analysis)
// ----------------------------------------------------------------------------
export {
    extractLinguisticFeatures,
    calculateConversationAlignment,
    calculateFunctionalSocialScore
} from './utils/linguisticMarkers';
export type { LinguisticFeatures } from './utils/linguisticMarkers';


// 3. MAPPING ENGINE (Coordinates & Taxonomy)
// ----------------------------------------------------------------------------
export {
    getCommunicationFunction,
    getConversationStructure
} from './utils/coordinates';

export { TAXONOMY, getDimensionTags, getTagInfo } from './utils/taxonomy';
export type { Taxonomy, TaxonomyTag, TaxonomyDimension } from './utils/taxonomy';


// 4. DATA SCHEMA (Validation)
// ----------------------------------------------------------------------------
export {
    ConversationSchema,
    MessageSchema,
    ClassificationSchema,
    PadSchema
} from './schemas/conversationSchema';
export type { Conversation } from './schemas/conversationSchema';
