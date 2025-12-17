/**
 * Conversation Metadata Classifier v1.1
 * 
 * Changes from v1.0:
 * - Roles (dim 9-10) now output probability distributions
 * - All dimensions require evidence quotes
 * - Alternative label required when confidence < 0.6
 * - Abstain flag for short/ambiguous conversations
 * - Windowed classification support for temporal dynamics
 * - Zod schema validation for robust parsing
 * 
 * Usage:
 *   npx ts-node classifier-v1.1.ts ./conversations.json ./output.json
 *   npx ts-node classifier-v1.1.ts ./conversations.json ./output.json --windowed
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import * as fs from "fs";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

// Role type unions
type HumanRole = "seeker" | "learner" | "director" | "collaborator" | "sharer" | "challenger";
type AIRole = "expert" | "advisor" | "facilitator" | "reflector" | "peer" | "affiliative";

// Zod schemas for runtime validation
const DimensionResultSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  evidence: z.array(z.string()).min(1).max(3),
  alternative: z.string().nullable().optional(),
});

const RoleEvidenceSchema = z.object({
  role: z.string(),
  quote: z.string(),
});

const HumanRoleDistributionSchema = z.object({
  seeker: z.number().min(0).max(1),
  learner: z.number().min(0).max(1),
  director: z.number().min(0).max(1),
  collaborator: z.number().min(0).max(1),
  sharer: z.number().min(0).max(1),
  challenger: z.number().min(0).max(1),
});

const AIRoleDistributionSchema = z.object({
  expert: z.number().min(0).max(1),
  advisor: z.number().min(0).max(1),
  facilitator: z.number().min(0).max(1),
  reflector: z.number().min(0).max(1),
  peer: z.number().min(0).max(1),
  affiliative: z.number().min(0).max(1),
});

const RoleDistributionResultSchema = z.object({
  distribution: z.union([HumanRoleDistributionSchema, AIRoleDistributionSchema]),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  evidence: z.array(RoleEvidenceSchema).min(1).max(4),
  alternative: z.string().nullable().optional(),
});

const ClassificationResultSchema = z.object({
  abstain: z.boolean().optional(),
  interactionPattern: DimensionResultSchema,
  powerDynamics: DimensionResultSchema,
  emotionalTone: DimensionResultSchema,
  engagementStyle: DimensionResultSchema,
  knowledgeExchange: DimensionResultSchema,
  conversationPurpose: DimensionResultSchema,
  topicDepth: DimensionResultSchema,
  turnTaking: DimensionResultSchema,
  humanRole: z.object({
    distribution: HumanRoleDistributionSchema,
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
    evidence: z.array(RoleEvidenceSchema).min(1).max(4),
    alternative: z.string().nullable().optional(),
  }),
  aiRole: z.object({
    distribution: AIRoleDistributionSchema,
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
    evidence: z.array(RoleEvidenceSchema).min(1).max(4),
    alternative: z.string().nullable().optional(),
  }),
});

// TypeScript interfaces (derived from Zod for type safety)
type DimensionResult = z.infer<typeof DimensionResultSchema>;
type RoleEvidence = z.infer<typeof RoleEvidenceSchema>;
type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  [key: string]: unknown;
}

interface WindowedClassification {
  windowIndex: number;
  startMessage: number;
  endMessage: number;
  classification: ClassificationResult;
}

interface ProcessedConversation extends Conversation {
  classification: ClassificationResult;
  windowedClassifications?: WindowedClassification[];
  classificationMetadata: {
    model: string;
    timestamp: string;
    promptVersion: string;
    processingTimeMs: number;
    windowed: boolean;
    windowSize?: number;
    windowStride?: number;
  };
}

// ============================================================================
// PROMPT v1.1
// ============================================================================

const CLASSIFICATION_PROMPT = `You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- If confidence < 0.6, you MUST name one plausible alternative category.
- Evidence quotes must be EXACT excerpts from the conversation.

## TASK
Classify the conversation across 10 dimensions:
- Dimensions 1–8: choose ONE category
- Dimensions 9–10: output a PROBABILITY DISTRIBUTION over roles (values must sum to 1.0)

## CONFIDENCE CALIBRATION
- 0.9–1.0: Unambiguous, clear signals, no reasonable alternative
- 0.7–0.9: Strong fit, minor ambiguity or mixed signals
- 0.5–0.7: Moderate fit, could reasonably be another category
- 0.3–0.5: Weak fit, defaulting due to lack of better option / short conversation
- <0.3: Highly uncertain, conversation may be too short or ambiguous

## EDGE CASES
- If conversation is 1–2 turns: set confidence <= 0.5 for most dimensions
- If you cannot justify with quotes: set confidence <= 0.5
- Set "abstain": true if too short/ambiguous to meaningfully classify (still provide best-effort)

---

## DIMENSION DEFINITIONS

### 1. INTERACTION PATTERN
The dominant structural mode of exchange.

| Category | Definition | Signals |
|----------|------------|---------|
| question-answer | One party primarily asks questions, other provides answers | >40% messages contain questions; clear information asymmetry |
| storytelling | Extended narrative, explanation, or sequential account | Long turns; temporal markers; "and then..."; teaching/explaining |
| advisory | Guidance, recommendations, or counsel being given | Imperatives; "you should"; "I recommend"; problem→solution structure |
| debate | Argumentation, persuasion, or position defense | "but"; "however"; counterarguments; thesis-antithesis pattern |
| collaborative | Joint problem-solving, brainstorming, or co-creation | "we could"; building on each other's ideas; iterative refinement |
| casual-chat | Social exchange without specific instrumental goal | Greetings; small talk; no clear topic progression; phatic communion |

### 2. POWER DYNAMICS
Who controls the conversation's direction and pace.

| Category | Definition | Signals |
|----------|------------|---------|
| human-led | Human sets agenda, asks most questions, steers topics | Human questions > 2× AI questions; human introduces new topics |
| ai-led | AI drives conversation through questions or topic shifts | AI asks probing questions; AI suggests directions; human responds |
| balanced | Roughly equal contribution to direction | Similar message lengths; both ask questions; mutual topic development |
| alternating | Control shifts noticeably between parties | Distinct phases where each leads; turn-taking in direction-setting |

### 3. EMOTIONAL TONE
The dominant affective quality of the exchange.

| Category | Definition | Signals |
|----------|------------|---------|
| supportive | Warm, encouraging, affirming | Praise; validation; "great job"; expressions of care |
| playful | Light, humorous, fun | Jokes; wordplay; "lol/haha"; teasing; exclamation marks |
| serious | Grave, weighty, consequential | Urgent language; concern; high-stakes topics; careful hedging |
| empathetic | Understanding, compassionate, validating feelings | "I understand"; acknowledging emotions; "that must be hard" |
| professional | Formal, business-like, task-focused | Formal register; no personal disclosure; focus on deliverables |
| neutral | No strong emotional coloring | Factual exchange; minimal affect markers; informational |

### 4. ENGAGEMENT STYLE
How participants respond to and build on each other's contributions.

| Category | Definition | Signals |
|----------|------------|---------|
| questioning | Frequent questions driving exploration | High question density; Socratic; "what about...?"; "how does...?" |
| challenging | Pushback, critique, or devil's advocate | "but"; "actually"; "I disagree"; counterexamples; skepticism |
| exploring | Open-ended wondering, brainstorming | "maybe"; "what if"; "I wonder"; hypotheticals; speculation |
| affirming | Agreement, validation, building on ideas | "yes"; "exactly"; "right"; "that makes sense"; elaboration |
| reactive | Responding without strong direction | Short responses; following other's lead; minimal initiative |

### 5. KNOWLEDGE EXCHANGE
What type of information is being shared.

| Category | Definition | Signals |
|----------|------------|---------|
| personal-sharing | Private experiences, feelings, life details | Personal pronouns in narrative; life events; self-disclosure |
| skill-sharing | How-to knowledge, techniques, methods | Instructions; "how to"; steps; procedures; tutorials |
| opinion-exchange | Views, beliefs, interpretations | "I think"; "I believe"; evaluative statements; preferences |
| factual-info | Data, facts, definitions, specifications | Numbers; citations; "is defined as"; technical specs |
| experience-sharing | Narratives about learning or doing something | "when I tried"; lessons learned; process descriptions |

### 6. CONVERSATION PURPOSE
The apparent goal or function of the exchange.

| Category | Definition | Signals |
|----------|------------|---------|
| information-seeking | Obtaining specific knowledge or answers | Direct questions; "what is"; "how do I"; research queries |
| problem-solving | Resolving an issue or challenge | Problem statement; "help me"; troubleshooting; solutions |
| entertainment | Fun, amusement, passing time | Games; jokes; creative play; "tell me a story"; no instrumental goal |
| relationship-building | Social bonding, rapport, connection | Personal questions; "how are you"; shared experiences; warmth |
| self-expression | Processing thoughts, venting, journaling | Extended personal monologue; reflection; working through ideas |

### 7. TOPIC DEPTH
How deeply the conversation explores its subject matter.

| Category | Definition | Signals |
|----------|------------|---------|
| surface | Brief, shallow, or introductory | Few exchanges; simple questions; no follow-up; greetings only |
| moderate | Some exploration but not exhaustive | Multiple turns on topic; some clarifying questions; reasonable depth |
| deep | Thorough, nuanced, detailed exploration | Many exchanges; follow-up questions; edge cases; complexity acknowledged |

### 8. TURN TAKING
The balance of contribution volume between parties.

| Category | Definition | Signals |
|----------|------------|---------|
| user-dominant | Human messages substantially longer/more | User avg length > 1.4× AI avg length |
| assistant-dominant | AI messages substantially longer/more | AI avg length > 1.4× user avg length |
| balanced | Roughly equal message lengths | Length ratio between 0.7 and 1.4 |

---

### 9. HUMAN ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition | Key Signals |
|------|------------|-------------|
| seeker | Requests information/clarification; primarily questions | "what is"; "can you explain"; "tell me about" |
| learner | Tests understanding, applies, verifies | "so if…, then…"; "does that mean…?"; "let me try" |
| director | Specifies deliverables/constraints/formats/next actions | "write a…"; "make it…"; "I need you to"; format specs |
| collaborator | Proposes alternatives/tradeoffs; co-builds iteratively | "what if we"; "another option"; building on AI's output |
| sharer | Personal narrative/context for expression/relational framing | Life stories; "I feel"; personal context not task-required |
| challenger | Critiques/stress-tests claims; explicit pushback | "but what about"; "I disagree"; "that's not right" |

**Tie-breakers:**
- seeker vs learner: learner shows checking/applying; seeker is request-only
- director vs seeker: director specifies deliverable/format constraints
- director vs collaborator: collaborator contributes options/tradeoffs; director mainly commands
- sharer vs collaborator: sharer is personal/relational; collaborator is task input
- challenger overrides if dominant move is explicit pushback

### 10. AI ROLE (DISTRIBUTION REQUIRED)
Output probability weights that sum to 1.0. Mixed roles are expected.

| Role | Definition | Key Signals |
|------|------------|-------------|
| expert | Explains/teaches/frames concepts; definitions; examples | Definitions; "this means"; comprehensive explanations |
| advisor | Prescribes steps/recommendations | "I suggest"; "you should"; "try doing X then Y" |
| facilitator | Guides via questions/scaffolding/options rather than prescribing | "what do you think about"; "have you considered"; offering choices |
| reflector | Paraphrases/validates/invites elaboration | "it sounds like…"; "that makes sense"; "tell me more" |
| peer | Brainstorms alongside with low-authority tone | "we could…"; "maybe…"; collaborative speculation |
| affiliative | Warmth/encouragement/rapport not required for task completion | "great job!"; personal warmth; social pleasantries beyond task |

**Tie-breakers:**
- expert vs advisor: expert explains concepts; advisor prescribes actions
- facilitator vs reflector: facilitator offers structure/options; reflector mirrors/validates
- peer vs facilitator: peer is speculative/equal; facilitator guides with intent
- affiliative is additive—can co-occur with others but only dominant if warmth > task content

---

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown fences). All distributions must sum to 1.0.

{
  "abstain": false,
  "interactionPattern": {
    "category": "question-answer",
    "confidence": 0.85,
    "evidence": ["exact quote from conversation"],
    "rationale": "Explanation in 1-2 sentences",
    "alternative": null
  },
  "powerDynamics": {
    "category": "human-led",
    "confidence": 0.8,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "emotionalTone": {
    "category": "neutral",
    "confidence": 0.7,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "engagementStyle": {
    "category": "questioning",
    "confidence": 0.75,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "knowledgeExchange": {
    "category": "factual-info",
    "confidence": 0.8,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "conversationPurpose": {
    "category": "information-seeking",
    "confidence": 0.85,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "topicDepth": {
    "category": "moderate",
    "confidence": 0.7,
    "evidence": ["exact quote"],
    "rationale": "...",
    "alternative": null
  },
  "turnTaking": {
    "category": "assistant-dominant",
    "confidence": 0.9,
    "evidence": ["exact quote about length disparity"],
    "rationale": "...",
    "alternative": null
  },
  "humanRole": {
    "distribution": {
      "seeker": 0.6,
      "learner": 0.2,
      "director": 0.1,
      "collaborator": 0.05,
      "sharer": 0.0,
      "challenger": 0.05
    },
    "confidence": 0.75,
    "evidence": [
      {"role": "seeker", "quote": "What does X mean?"},
      {"role": "learner", "quote": "So if I do Y, then Z happens?"}
    ],
    "rationale": "Human primarily asks questions (seeker) with some verification (learner)",
    "alternative": null
  },
  "aiRole": {
    "distribution": {
      "expert": 0.5,
      "advisor": 0.3,
      "facilitator": 0.1,
      "reflector": 0.05,
      "peer": 0.0,
      "affiliative": 0.05
    },
    "confidence": 0.8,
    "evidence": [
      {"role": "expert", "quote": "This concept means..."},
      {"role": "advisor", "quote": "I recommend you try..."}
    ],
    "rationale": "AI primarily explains concepts (expert) and gives recommendations (advisor)",
    "alternative": null
  }
}

---

## CONVERSATION TO ANALYZE

`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeDist<T extends string>(dist: Record<T, number>): Record<T, number> {
  const sum = Object.values(dist).reduce((a, b) => (a as number) + (b as number), 0) as number;
  if (sum <= 0) return dist;
  const out = { ...dist };
  (Object.keys(out) as T[]).forEach((k) => {
    out[k] = Math.round((out[k] / sum) * 1000) / 1000; // 3 decimal places
  });
  return out;
}

function approxSumToOne(obj: Record<string, number>, eps = 0.05): boolean {
  const sum = Object.values(obj).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1) <= eps;
}

function argmaxDist(dist: Record<string, number>): string {
  return Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0];
}

function validateAndFixClassification(raw: unknown): ClassificationResult {
  // First, try to parse with Zod
  const parsed = ClassificationResultSchema.parse(raw);

  // Normalize role distributions
  parsed.humanRole.distribution = normalizeDist(parsed.humanRole.distribution) as typeof parsed.humanRole.distribution;
  parsed.aiRole.distribution = normalizeDist(parsed.aiRole.distribution) as typeof parsed.aiRole.distribution;

  // Validate sums
  if (!approxSumToOne(parsed.humanRole.distribution)) {
    console.warn("Warning: humanRole distribution did not sum to 1, normalized");
  }
  if (!approxSumToOne(parsed.aiRole.distribution)) {
    console.warn("Warning: aiRole distribution did not sum to 1, normalized");
  }

  // Enforce alternative requirement for low confidence
  const dimensions = [
    "interactionPattern",
    "powerDynamics",
    "emotionalTone",
    "engagementStyle",
    "knowledgeExchange",
    "conversationPurpose",
    "topicDepth",
    "turnTaking",
  ] as const;

  for (const dim of dimensions) {
    const d = parsed[dim];
    if (d.confidence < 0.6 && !d.alternative) {
      console.warn(`Warning: ${dim} has confidence ${d.confidence} but no alternative provided`);
    }
  }

  if (parsed.humanRole.confidence < 0.6 && !parsed.humanRole.alternative) {
    console.warn("Warning: humanRole has low confidence but no alternative");
  }
  if (parsed.aiRole.confidence < 0.6 && !parsed.aiRole.alternative) {
    console.warn("Warning: aiRole has low confidence but no alternative");
  }

  return parsed;
}

// ============================================================================
// WINDOWING
// ============================================================================

interface Window {
  startIdx: number;
  endIdx: number;
  messages: Message[];
}

function createWindows(messages: Message[], windowSize = 6, stride = 2): Window[] {
  const windows: Window[] = [];

  if (messages.length <= windowSize) {
    // Single window for short conversations
    return [{ startIdx: 0, endIdx: messages.length - 1, messages }];
  }

  for (let i = 0; i <= messages.length - windowSize; i += stride) {
    const end = Math.min(i + windowSize, messages.length);
    windows.push({
      startIdx: i,
      endIdx: end - 1,
      messages: messages.slice(i, end),
    });
  }

  // Ensure we capture the final messages
  const lastWindow = windows[windows.length - 1];
  if (lastWindow && lastWindow.endIdx < messages.length - 1) {
    windows.push({
      startIdx: messages.length - windowSize,
      endIdx: messages.length - 1,
      messages: messages.slice(-windowSize),
    });
  }

  return windows;
}

// ============================================================================
// CLASSIFIER
// ============================================================================

class ConversationClassifier {
  private client: Anthropic;
  private model: string;
  private promptVersion = "1.1.0";

  constructor(model: string = "claude-sonnet-4-20250514") {
    this.client = new Anthropic();
    this.model = model;
  }

  private formatConversation(messages: Message[]): string {
    return messages
      .map((m, i) => {
        const role = m.role === "user" ? "HUMAN" : "AI";
        return `[${i + 1}] ${role}: ${m.content}`;
      })
      .join("\n\n");
  }

  private extractJSON(text: string): string {
    let jsonText = text.trim();
    // Remove markdown fences if present
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    return jsonText.trim();
  }

  async classifyMessages(messages: Message[]): Promise<ClassificationResult> {
    const formatted = this.formatConversation(messages);
    const prompt = CLASSIFICATION_PROMPT + formatted;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonText = this.extractJSON(content.text);
    const raw = JSON.parse(jsonText);
    return validateAndFixClassification(raw);
  }

  async classify(
    conversation: Conversation,
    options: { windowed?: boolean; windowSize?: number; windowStride?: number } = {}
  ): Promise<ProcessedConversation> {
    const startTime = Date.now();
    const { windowed = false, windowSize = 6, windowStride = 2 } = options;

    // Full conversation classification
    const classification = await this.classifyMessages(conversation.messages);

    let windowedClassifications: WindowedClassification[] | undefined;

    // Windowed classification if requested
    if (windowed && conversation.messages.length > windowSize) {
      const windows = createWindows(conversation.messages, windowSize, windowStride);
      windowedClassifications = [];

      for (let i = 0; i < windows.length; i++) {
        const win = windows[i];
        try {
          const winClassification = await this.classifyMessages(win.messages);
          windowedClassifications.push({
            windowIndex: i,
            startMessage: win.startIdx,
            endMessage: win.endIdx,
            classification: winClassification,
          });
        } catch (error) {
          console.error(`Error classifying window ${i}:`, error);
        }

        // Rate limit between windows
        if (i < windows.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }

    return {
      ...conversation,
      classification,
      windowedClassifications,
      classificationMetadata: {
        model: this.model,
        timestamp: new Date().toISOString(),
        promptVersion: this.promptVersion,
        processingTimeMs: Date.now() - startTime,
        windowed,
        windowSize: windowed ? windowSize : undefined,
        windowStride: windowed ? windowStride : undefined,
      },
    };
  }

  async classifyBatch(
    conversations: Conversation[],
    options: {
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
      delayMs?: number;
      windowed?: boolean;
      windowSize?: number;
      windowStride?: number;
    } = {}
  ): Promise<ProcessedConversation[]> {
    const {
      concurrency = 2, // Lower for more API calls with windowing
      onProgress,
      delayMs = 600,
      windowed = false,
      windowSize = 6,
      windowStride = 2,
    } = options;

    const results: ProcessedConversation[] = [];
    let completed = 0;

    for (let i = 0; i < conversations.length; i += concurrency) {
      const batch = conversations.slice(i, i + concurrency);

      const batchResults = await Promise.all(
        batch.map(async (convo) => {
          try {
            return await this.classify(convo, { windowed, windowSize, windowStride });
          } catch (error) {
            console.error(`\nError on conversation ${convo.id}:`, error);
            return {
              ...convo,
              classification: null as unknown as ClassificationResult,
              classificationError: String(error),
              classificationMetadata: {
                model: this.model,
                timestamp: new Date().toISOString(),
                promptVersion: this.promptVersion,
                processingTimeMs: 0,
                windowed,
              },
            } as ProcessedConversation;
          }
        })
      );

      results.push(...batchResults);
      completed += batch.length;

      if (onProgress) {
        onProgress(completed, conversations.length);
      }

      if (i + concurrency < conversations.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}

// ============================================================================
// SUMMARY STATS (Updated for distributions)
// ============================================================================

function generateSummaryStats(results: ProcessedConversation[]): object {
  const categoricalDimensions = [
    "interactionPattern",
    "powerDynamics",
    "emotionalTone",
    "engagementStyle",
    "knowledgeExchange",
    "conversationPurpose",
    "topicDepth",
    "turnTaking",
  ] as const;

  const summary: Record<string, unknown> = {
    totalConversations: results.length,
    successfulClassifications: results.filter((r) => r.classification).length,
    failedClassifications: results.filter((r) => !r.classification).length,
    abstainedClassifications: results.filter((r) => r.classification?.abstain).length,
    promptVersion: "1.1.0",
    categoricalDimensions: {},
    roleDimensions: {},
  };

  // Categorical dimensions (1-8)
  for (const dim of categoricalDimensions) {
    const valid = results.filter((r) => r.classification?.[dim]);

    const categories: Record<string, number> = {};
    const confidences: number[] = [];
    const lowConfCount = { count: 0, withAlternative: 0 };

    for (const result of valid) {
      const d = result.classification[dim];
      categories[d.category] = (categories[d.category] || 0) + 1;
      confidences.push(d.confidence);
      if (d.confidence < 0.6) {
        lowConfCount.count++;
        if (d.alternative) lowConfCount.withAlternative++;
      }
    }

    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;

    (summary.categoricalDimensions as Record<string, unknown>)[dim] = {
      distribution: categories,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      lowConfidenceCount: lowConfCount.count,
      lowConfidenceWithAlternative: lowConfCount.withAlternative,
    };
  }

  // Role dimensions (9-10) - distribution-based
  const roleDims = ["humanRole", "aiRole"] as const;
  const roleCategories = {
    humanRole: ["seeker", "learner", "director", "collaborator", "sharer", "challenger"],
    aiRole: ["expert", "advisor", "facilitator", "reflector", "peer", "affiliative"],
  };

  for (const dim of roleDims) {
    const valid = results.filter((r) => r.classification?.[dim]?.distribution);

    // Compute mean distribution
    const meanDist: Record<string, number> = {};
    const dominantCounts: Record<string, number> = {};
    const confidences: number[] = [];

    for (const role of roleCategories[dim]) {
      meanDist[role] = 0;
      dominantCounts[role] = 0;
    }

    for (const result of valid) {
      const d = result.classification[dim];
      confidences.push(d.confidence);

      // Accumulate for mean
      for (const role of roleCategories[dim]) {
        meanDist[role] += (d.distribution as Record<string, number>)[role] || 0;
      }

      // Count dominant role
      const dominant = argmaxDist(d.distribution as Record<string, number>);
      dominantCounts[dominant] = (dominantCounts[dominant] || 0) + 1;
    }

    // Compute mean
    for (const role of roleCategories[dim]) {
      meanDist[role] = Math.round((meanDist[role] / valid.length) * 1000) / 1000;
    }

    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;

    (summary.roleDimensions as Record<string, unknown>)[dim] = {
      meanDistribution: meanDist,
      dominantRoleCounts: dominantCounts,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
    };
  }

  // Windowed stats if available
  const windowedResults = results.filter((r) => r.windowedClassifications?.length);
  if (windowedResults.length > 0) {
    (summary as Record<string, unknown>).windowedStats = {
      conversationsWithWindows: windowedResults.length,
      avgWindowsPerConversation:
        Math.round(
          (windowedResults.reduce((sum, r) => sum + (r.windowedClassifications?.length || 0), 0) /
            windowedResults.length) *
            10
        ) / 10,
    };
  }

  return summary;
}

// ============================================================================
// VALIDATION EXPORT (Updated for distributions)
// ============================================================================

function exportForValidation(results: ProcessedConversation[], sampleSize = 30): object[] {
  const valid = results.filter((r) => r.classification);

  // Sort by average confidence (stratified sampling)
  const sorted = [...valid].sort((a, b) => {
    const avgA =
      (a.classification.humanRole.confidence + a.classification.aiRole.confidence) / 2;
    const avgB =
      (b.classification.humanRole.confidence + b.classification.aiRole.confidence) / 2;
    return avgA - avgB;
  });

  const third = Math.floor(sorted.length / 3);
  const nEach = Math.ceil(sampleSize / 3);

  const sample = [
    ...sorted.slice(0, nEach), // Low confidence
    ...sorted.slice(third, third + nEach), // Medium
    ...sorted.slice(-nEach), // High
  ].slice(0, sampleSize);

  return sample.map((r) => ({
    id: r.id,
    messages: r.messages.map((m) => ({
      role: m.role,
      content: m.content.slice(0, 600) + (m.content.length > 600 ? "..." : ""),
    })),
    llmClassification: {
      ...r.classification,
      // Include dominant roles for easier annotation
      _humanRoleDominant: argmaxDist(r.classification.humanRole.distribution),
      _aiRoleDominant: argmaxDist(r.classification.aiRole.distribution),
    },
    humanAnnotation: {
      interactionPattern: { category: "", notes: "" },
      powerDynamics: { category: "", notes: "" },
      emotionalTone: { category: "", notes: "" },
      engagementStyle: { category: "", notes: "" },
      knowledgeExchange: { category: "", notes: "" },
      conversationPurpose: { category: "", notes: "" },
      topicDepth: { category: "", notes: "" },
      turnTaking: { category: "", notes: "" },
      humanRole: {
        dominantRole: "",
        secondaryRole: "",
        confidence: null,
        notes: "",
      },
      aiRole: {
        dominantRole: "",
        secondaryRole: "",
        confidence: null,
        notes: "",
      },
      overallNotes: "",
    },
    annotatorId: "",
    annotationDate: "",
  }));
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Conversation Metadata Classifier v1.1

Usage:
  npx ts-node classifier-v1.1.ts <input.json> <output.json> [options]

Options:
  --model <model>       Model to use (default: claude-sonnet-4-20250514)
  --concurrency <n>     Parallel requests (default: 2)
  --validation <n>      Export n samples for validation
  --windowed            Enable windowed classification for temporal dynamics
  --window-size <n>     Messages per window (default: 6)
  --window-stride <n>   Window stride (default: 2)

Changes in v1.1:
  - Role dimensions output probability distributions
  - All dimensions include evidence quotes
  - Alternative labels required when confidence < 0.6
  - Windowed classification for role drift analysis
    `);
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1];

  // Parse options
  const model = args.includes("--model")
    ? args[args.indexOf("--model") + 1]
    : "claude-sonnet-4-20250514";
  const concurrency = args.includes("--concurrency")
    ? parseInt(args[args.indexOf("--concurrency") + 1])
    : 2;
  const validationSamples = args.includes("--validation")
    ? parseInt(args[args.indexOf("--validation") + 1])
    : 0;
  const windowed = args.includes("--windowed");
  const windowSize = args.includes("--window-size")
    ? parseInt(args[args.indexOf("--window-size") + 1])
    : 6;
  const windowStride = args.includes("--window-stride")
    ? parseInt(args[args.indexOf("--window-stride") + 1])
    : 2;

  console.log(`Loading conversations from ${inputPath}...`);
  const conversations: Conversation[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log(`Found ${conversations.length} conversations`);

  if (windowed) {
    console.log(`\nWindowed mode: size=${windowSize}, stride=${windowStride}`);
  }

  const classifier = new ConversationClassifier(model);

  console.log(`\nClassifying with ${model} (concurrency: ${concurrency})...\n`);

  const results = await classifier.classifyBatch(conversations, {
    concurrency,
    onProgress: (completed, total) => {
      const pct = Math.round((completed / total) * 100);
      process.stdout.write(`\rProgress: ${completed}/${total} (${pct}%)`);
    },
    windowed,
    windowSize,
    windowStride,
  });

  console.log("\n\nWriting results...");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${outputPath}`);

  // Summary
  const summary = generateSummaryStats(results);
  const summaryPath = outputPath.replace(".json", "-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Summary saved to ${summaryPath}`);

  // Validation export
  if (validationSamples > 0) {
    const validationData = exportForValidation(results, validationSamples);
    const validationPath = outputPath.replace(".json", "-validation.json");
    fs.writeFileSync(validationPath, JSON.stringify(validationData, null, 2));
    console.log(`Validation samples saved to ${validationPath}`);
  }

  // Print summary
  console.log("\n=== Classification Summary ===\n");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(console.error);
