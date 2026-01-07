# Reusable Components: What Can Be Extracted

**Date:** 2026-01-06  
**Purpose:** Identify functions, logic, and data structures that can be extracted and reused in other projects

---

## Overview

This project contains several well-defined, reusable components that can be extracted into standalone libraries or utilities. These components are:

1. **Domain-agnostic** (not tied to terrain visualization)
2. **Well-tested** (used in production)
3. **Documented** (clear interfaces and purposes)
4. **Self-contained** (minimal dependencies)

---

## 1. PAD (Pleasure-Arousal-Dominance) Utilities

### Location
- `src/utils/pad.ts`
- `src/schemas/conversationSchema.ts` (PadSchema)

### What It Does
Calculates emotional intensity from PAD scores using the formula: `(1 - pleasure) × 0.6 + arousal × 0.4`

### Reusable Functions

```typescript
// Calculate emotional intensity from PAD components
function calculateEmotionalIntensity(pleasure: number, arousal: number): number {
  return (1 - pleasure) * 0.6 + arousal * 0.4;
}

// Validate and normalize PAD scores
const PadSchema = z.object({
  pleasure: z.number().optional(),
  arousal: z.number().optional(),
  dominance: z.number().optional(),
  emotionalIntensity: z.number().optional(),
}).transform((data) => {
  const pleasure = data.pleasure ?? 0.5;
  const arousal = data.arousal ?? 0.5;
  const dominance = data.dominance ?? 0.5;
  const emotionalIntensity = data.emotionalIntensity ?? 
    ((1 - pleasure) * 0.6 + arousal * 0.4);
  return { pleasure, arousal, dominance, emotionalIntensity };
});
```

### Use Cases
- Any project analyzing emotional states
- Sentiment analysis with PAD model
- Affective computing applications
- Emotional intensity visualization

### Dependencies
- Zod (for schema validation)

### Extraction Potential
**High** - Standalone utility, minimal dependencies, clear purpose

---

## 2. Linguistic Marker Analysis

### Location
- `src/utils/linguisticMarkers.ts`

### What It Does
Extracts 7 linguistic features from conversation messages:
1. Formality (formal vs. informal markers)
2. Politeness (politeness markers)
3. Certainty (certainty vs. uncertainty expressions)
4. Structure (organized vs. loose)
5. Question-asking (question frequency)
6. Inclusive language (inclusive vs. exclusive)
7. Register (casual vs. professional)

### Reusable Functions

```typescript
interface LinguisticFeatures {
  formality: number;        // 0 = informal, 1 = formal
  politeness: number;      // 0 = none, 1 = many
  certainty: number;       // 0 = uncertain, 1 = certain
  structure: number;        // 0 = loose, 1 = structured
  questionAsking: number;  // 0 = no questions, 1 = many
  inclusiveLanguage: number; // 0 = none, 1 = extensive
  register: number;        // 0 = casual, 1 = formal/professional
}

// Extract linguistic features from messages
function extractLinguisticFeatures(
  messages: Array<{ role: string; content: string }>
): LinguisticFeatures;

// Calculate cosine similarity between two feature sets
function cosineSimilarity(a: LinguisticFeatures, b: LinguisticFeatures): number;

// Calculate conversation alignment (convergence/divergence)
function calculateConversationAlignment(
  messages: Array<{ role: string; content: string }>
): number; // 0 = aligned, 1 = divergent

// Calculate functional vs. social score
function calculateFunctionalSocialScore(
  messages: Array<{ role: string; content: string }>
): number; // 0 = functional, 1 = social
```

### Use Cases
- Communication style analysis
- Linguistic accommodation studies
- Conversation quality metrics
- Style matching detection
- Formality analysis

### Dependencies
- None (pure TypeScript)

### Extraction Potential
**High** - Standalone utility, no dependencies, well-defined interface

---

## 3. Volatility Metrics

### Location
- `src/utils/volatility.ts`

### What It Does
Calculates volatility metrics for conversations:
- Intensity variance
- Intensity range
- Spike count
- Volatility score

### Reusable Functions

```typescript
interface VolatilityMetrics {
  variance: number;        // Intensity variance
  range: number;           // Intensity range (max - min)
  mean: number;            // Mean intensity
  spikeCount: number;      // Number of spikes > threshold
  volatilityScore: number; // Combined volatility score
}

// Calculate volatility metrics from PAD scores
function calculateVolatility(conv: Conversation): VolatilityMetrics;
```

### Use Cases
- Conversation quality analysis
- Emotional stability metrics
- Incident detection
- Volatility-based filtering

### Dependencies
- Conversation schema (PAD scores)

### Extraction Potential
**Medium-High** - Standalone utility, but requires PAD scores

---

## 4. Spike Detection

### Location
- Can be extracted from `src/utils/volatility.ts` and analysis scripts

### What It Does
Detects "spikes" in emotional intensity (sudden increases > threshold)

### Reusable Functions

```typescript
interface Spike {
  messageIndex: number;
  intensity: number;
  spike: number;        // Increase from previous message
  context: {
    before: number;     // Intensity before spike
    after: number;      // Intensity after spike
  };
}

// Detect spikes in PAD intensity sequence
function detectSpikes(
  intensities: number[],
  threshold: number = 0.2
): Spike[];
```

### Use Cases
- Incident detection
- Anomaly detection
- Emotional event identification
- Debugging tools

### Dependencies
- None (pure function)

### Extraction Potential
**High** - Standalone utility, no dependencies

---

## 5. Conversation Schema & Validation

### Location
- `src/schemas/conversationSchema.ts`

### What It Does
Zod schemas for validating conversation data structures

### Reusable Components

```typescript
// PAD Schema
const PadSchema = z.object({...});

// Message Schema
const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  pad: PadSchema.optional(),
});

// Classification Schema
const ClassificationSchema = z.object({...});

// Full Conversation Schema
const ConversationSchema = z.object({
  id: z.string(),
  source: z.string().optional(),
  messages: z.array(MessageSchema),
  classification: ClassificationSchema,
  classificationMetadata: z.object({...}).optional(),
});

// TypeScript types inferred from schemas
type Conversation = z.infer<typeof ConversationSchema>;
```

### Use Cases
- Data validation
- Type-safe conversation processing
- API response validation
- Data pipeline validation

### Dependencies
- Zod

### Extraction Potential
**High** - Standard schema definitions, reusable across projects

---

## 6. Path Generation Algorithm

### Location
- `src/utils/terrain.ts` (generatePathPoints)

### What It Does
Generates 2D/3D path points from conversation messages with drift toward target

### Reusable Functions

```typescript
interface PathPoint {
  x: number;
  y: number;
  z?: number;  // Optional height
  role: 'user' | 'assistant';
  pad?: {
    emotionalIntensity: number;
  };
}

// Generate 2D path points
function generate2DPathPoints(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
  }>
): Array<{ x: number; y: number; role: 'user' | 'assistant' }>;

// Generate 3D path points with PAD height
function generatePathPoints(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
    pad?: { emotionalIntensity: number };
  }>
): PathPoint[];
```

### Use Cases
- Trajectory visualization
- Path-based analysis
- Temporal dynamics visualization
- Any project needing conversation trajectories

### Dependencies
- Message structure with communicationFunction/conversationStructure

### Extraction Potential
**Medium** - Useful but requires specific input structure

---

## 7. Classification Taxonomy

### Location
- `src/data/taxonomy.json`

### What It Does
Structured taxonomy of conversation dimensions, roles, patterns, etc.

### Reusable Components

```json
{
  "version": "1.1.0",
  "dimensions": {
    "interactionPattern": {
      "category": "structural",
      "tags": {
        "question-answer": {...},
        "storytelling": {...},
        ...
      }
    },
    "humanRole": {
      "tags": {
        "seeker": {...},
        "director": {...},
        ...
      }
    },
    ...
  }
}
```

### Use Cases
- Classification systems
- Role-based analysis
- Pattern recognition
- Taxonomy-driven applications

### Dependencies
- None (JSON file)

### Extraction Potential
**High** - Standalone JSON, can be used by any project

---

## 8. Feature Extraction Pipeline

### Location
- Various utilities combined

### What It Does
Extracts features from conversations for analysis/clustering

### Reusable Functions

```typescript
interface ConversationFeatures {
  // Linguistic features
  linguistic: LinguisticFeatures;
  alignment: number;
  functionalSocial: number;
  
  // PAD features
  pad: {
    mean: number;
    variance: number;
    range: number;
    spikes: Spike[];
  };
  
  // Trajectory features
  trajectory: {
    pathLength: number;
    straightness: number;
    driftMagnitude: number;
  };
  
  // Classification features
  roles: {
    human: Record<string, number>;
    ai: Record<string, number>;
  };
}

// Extract all features from conversation
function extractConversationFeatures(
  conversation: Conversation
): ConversationFeatures;
```

### Use Cases
- Machine learning feature extraction
- Clustering analysis
- Conversation comparison
- Pattern recognition

### Dependencies
- All above utilities

### Extraction Potential
**Medium** - Useful but requires all other components

---

## Recommended Extraction Strategy

### Phase 1: Standalone Utilities (High Priority)

**1. PAD Utilities** (`@conversation-analysis/pad`)
- Emotional intensity calculation
- PAD schema validation
- Standalone, minimal dependencies

**2. Linguistic Markers** (`@conversation-analysis/linguistic`)
- Feature extraction
- Alignment calculation
- Functional/social scoring
- No dependencies

**3. Spike Detection** (`@conversation-analysis/spikes`)
- Spike detection algorithm
- Incident identification
- Pure functions

### Phase 2: Schema & Validation (Medium Priority)

**4. Conversation Schema** (`@conversation-analysis/schema`)
- Zod schemas
- Type definitions
- Validation utilities

**5. Classification Taxonomy** (`@conversation-analysis/taxonomy`)
- JSON taxonomy
- Type definitions
- Documentation

### Phase 3: Composite Utilities (Lower Priority)

**6. Volatility Metrics** (`@conversation-analysis/volatility`)
- Requires PAD utilities
- Useful for analysis

**7. Path Generation** (`@conversation-analysis/trajectory`)
- Requires specific input structure
- Useful for visualization

**8. Feature Extraction** (`@conversation-analysis/features`)
- Combines all utilities
- Useful for ML/clustering
