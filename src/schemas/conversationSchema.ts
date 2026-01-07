import { z } from 'zod';

// PAD (Pleasure-Arousal-Dominance) Schema
// Accepts both formats: full names (pleasure/arousal/dominance) or abbreviations (p/a/d)
export const PadSchema = z.object({
    // Full names
    pleasure: z.number().optional(),
    arousal: z.number().optional(),
    dominance: z.number().optional(),
    emotionalIntensity: z.number().optional(),
    // Abbreviations (for backward compatibility)
    p: z.number().optional(),
    a: z.number().optional(),
    d: z.number().optional(),
}).transform((data) => {
    // Normalize to full names, calculate emotionalIntensity if missing
    const pleasure = data.pleasure ?? data.p ?? 0.5;
    const arousal = data.arousal ?? data.a ?? 0.5;
    const dominance = data.dominance ?? data.d ?? 0.5;
    const emotionalIntensity = data.emotionalIntensity ?? 
        ((1 - pleasure) * 0.6 + arousal * 0.4);
    
    return {
        pleasure,
        arousal,
        dominance,
        emotionalIntensity,
    };
});

// Message Schema
// Note: Linguistic alignment is calculated on-the-fly from message content
// using Communication Accommodation Theory (CAT) - see linguisticMarkers.ts
export const MessageSchema = z.object({
    role: z.string(),
    content: z.string(),
    pad: PadSchema.optional(),
});

// Classification Metadata
// Accepts additional fields (evidence, rationale, alternative) that may be present
export const ClassificationCategorySchema = z.object({
    category: z.string(),
    confidence: z.number(),
    evidence: z.array(z.string()).optional(),
    rationale: z.string().optional(),
    alternative: z.string().nullable().optional(),
}).passthrough(); // Allow additional fields

// Role Distribution Schema
export const RoleDistributionSchema = z.object({
    distribution: z.record(z.string(), z.number()),
    confidence: z.number(),
});

// Full Classification Object
export const ClassificationSchema = z.object({
    interactionPattern: ClassificationCategorySchema.optional(),
    powerDynamics: ClassificationCategorySchema.optional(),
    emotionalTone: ClassificationCategorySchema.optional(),
    engagementStyle: ClassificationCategorySchema.optional(),
    knowledgeExchange: ClassificationCategorySchema.optional(),
    conversationPurpose: ClassificationCategorySchema.optional(),
    turnTaking: ClassificationCategorySchema.optional(),
    humanRole: RoleDistributionSchema.optional(),
    aiRole: RoleDistributionSchema.optional(),
    abstain: z.boolean().optional(),
});

// Top-level Conversation Schema
export const ConversationSchema = z.object({
    id: z.string(),
    source: z.string().optional(),
    messages: z.array(MessageSchema).default([]),
    classification: ClassificationSchema,
    classificationMetadata: z.object({
        model: z.string(),
        provider: z.string(),
        timestamp: z.string(),
        promptVersion: z.string().optional(), // Some files may not have this
        processingTimeMs: z.number().optional(), // Some files may not have this
    }).passthrough().optional(), // Allow additional fields and make it optional
}).passthrough(); // Allow additional fields like 'metadata' that may be present

// Infer strict Typescript type from Zod schema
export type Conversation = z.infer<typeof ConversationSchema>;
