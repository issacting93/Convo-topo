/**
 * Generate complete taxonomy.json from classifier prompt definitions
 * 
 * This script extracts all dimension definitions from the classifier prompt
 * and creates a comprehensive taxonomy file that matches the prompt structure.
 */

import * as fs from 'fs';

// Taxonomy structure based on classifier-v1.1 prompt definitions
const taxonomy = {
  version: "1.1.0",
  promptVersion: "1.1.0",
  totalDimensions: 10,
  generatedFrom: "classifier-v1.1 prompt definitions",
  lastUpdated: new Date().toISOString().split('T')[0],
  dimensions: {
    interactionPattern: {
      category: "structural",
      domain: "conversation-architecture",
      description: "The dominant structural mode of exchange",
      tags: {
        "question-answer": {
          definition: "One party primarily asks questions, other provides answers",
          signals: [">40% messages contain questions", "clear information asymmetry"],
          parent: "goal-oriented"
        },
        "storytelling": {
          definition: "Extended narrative, explanation, or sequential account",
          signals: ["Long turns", "temporal markers", "\"and then...\"", "teaching/explaining"],
          parent: "narrative-oriented"
        },
        "advisory": {
          definition: "Guidance, recommendations, or counsel being given",
          signals: ["Imperatives", "\"you should\"", "\"I recommend\"", "problem→solution structure"],
          parent: "goal-oriented"
        },
        "debate": {
          definition: "Argumentation, persuasion, or position defense",
          signals: ["\"but\"", "\"however\"", "counterarguments", "thesis-antithesis pattern"],
          parent: "conflict-oriented"
        },
        "collaborative": {
          definition: "Joint problem-solving, brainstorming, or co-creation",
          signals: ["\"we could\"", "building on each other's ideas", "iterative refinement"],
          parent: "process-oriented"
        },
        "casual-chat": {
          definition: "Social exchange without specific instrumental goal",
          signals: ["Greetings", "small talk", "no clear topic progression", "phatic communion"],
          parent: "expression-oriented"
        }
      }
    },
    powerDynamics: {
      category: "structural",
      domain: "conversational-control",
      description: "Who controls the conversation's direction and pace",
      tags: {
        "human-led": {
          definition: "Human sets agenda, asks most questions, steers topics",
          signals: ["Human questions > 2× AI questions", "human introduces new topics"],
          parent: "single-driver"
        },
        "ai-led": {
          definition: "AI drives conversation through questions or topic shifts",
          signals: ["AI asks probing questions", "AI suggests directions", "human responds"],
          parent: "single-driver"
        },
        "balanced": {
          definition: "Roughly equal contribution to direction",
          signals: ["Similar message lengths", "both ask questions", "mutual topic development"],
          parent: "shared-control"
        },
        "alternating": {
          definition: "Control shifts noticeably between parties",
          signals: ["Distinct phases where each leads", "turn-taking in direction-setting"],
          parent: "shared-control"
        }
      }
    },
    emotionalTone: {
      category: "communicative",
      domain: "affective-quality",
      description: "The dominant affective quality of the exchange",
      tags: {
        "supportive": {
          definition: "Warm, encouraging, affirming",
          signals: ["Praise", "validation", "\"great job\"", "expressions of care"],
          parent: "positive-valence",
          valence: "positive"
        },
        "playful": {
          definition: "Light, humorous, fun",
          signals: ["Jokes", "wordplay", "\"lol/haha\"", "teasing", "exclamation marks"],
          parent: "positive-valence",
          valence: "positive"
        },
        "serious": {
          definition: "Grave, weighty, consequential",
          signals: ["Urgent language", "concern", "high-stakes topics", "careful hedging"],
          parent: "negative-valence",
          valence: "neutral-negative"
        },
        "empathetic": {
          definition: "Understanding, compassionate, validating feelings",
          signals: ["\"I understand\"", "acknowledging emotions", "\"that must be hard\""],
          parent: "positive-valence",
          valence: "positive"
        },
        "professional": {
          definition: "Formal, business-like, task-focused",
          signals: ["Formal register", "no personal disclosure", "focus on deliverables"],
          parent: "neutral-valence",
          valence: "neutral"
        },
        "neutral": {
          definition: "No strong emotional coloring",
          signals: ["Factual exchange", "minimal affect markers", "informational"],
          parent: "neutral-valence",
          valence: "neutral"
        }
      }
    },
    engagementStyle: {
      category: "communicative",
      domain: "interaction-method",
      description: "How participants respond to and build on each other's contributions",
      tags: {
        "questioning": {
          definition: "Frequent questions driving exploration",
          signals: ["High question density", "Socratic", "\"what about...?\"", "\"how does...?\""],
          parent: "proactive"
        },
        "challenging": {
          definition: "Pushback, critique, or devil's advocate",
          signals: ["\"but\"", "\"actually\"", "\"I disagree\"", "counterexamples", "skepticism"],
          parent: "proactive"
        },
        "exploring": {
          definition: "Open-ended wondering, brainstorming",
          signals: ["\"maybe\"", "\"what if\"", "\"I wonder\"", "hypotheticals", "speculation"],
          parent: "proactive"
        },
        "affirming": {
          definition: "Agreement, validation, building on ideas",
          signals: ["\"yes\"", "\"exactly\"", "\"right\"", "\"that makes sense\"", "elaboration"],
          parent: "receptive"
        },
        "reactive": {
          definition: "Responding without strong direction",
          signals: ["Short responses", "following other's lead", "minimal initiative"],
          parent: "receptive"
        }
      }
    },
    knowledgeExchange: {
      category: "content",
      domain: "information-type",
      description: "What type of information is being shared",
      tags: {
        "personal-sharing": {
          definition: "Private experiences, feelings, life details",
          signals: ["Personal pronouns in narrative", "life events", "self-disclosure"],
          parent: "experiential",
          nature: "subjective-autobiographical"
        },
        "skill-sharing": {
          definition: "How-to knowledge, techniques, methods",
          signals: ["Instructions", "\"how to\"", "steps", "procedures", "tutorials"],
          parent: "conceptual",
          nature: "procedural-educational"
        },
        "opinion-exchange": {
          definition: "Views, beliefs, interpretations",
          signals: ["\"I think\"", "\"I believe\"", "evaluative statements", "preferences"],
          parent: "conceptual",
          nature: "subjective-evaluative"
        },
        "factual-info": {
          definition: "Data, facts, definitions, specifications",
          signals: ["Numbers", "citations", "\"is defined as\"", "technical specs"],
          parent: "conceptual",
          nature: "objective-verifiable"
        },
        "experience-sharing": {
          definition: "Narratives about learning or doing something",
          signals: ["\"when I tried\"", "lessons learned", "process descriptions"],
          parent: "experiential",
          nature: "story-based-reflective"
        }
      }
    },
    conversationPurpose: {
      category: "content",
      domain: "goal-intent",
      description: "The apparent goal or function of the exchange",
      tags: {
        "information-seeking": {
          definition: "Obtaining specific knowledge or answers",
          signals: ["Direct questions", "\"what is\"", "\"how do I\"", "research queries"],
          parent: "instrumental",
          motivation: "extrinsic"
        },
        "problem-solving": {
          definition: "Resolving an issue or challenge",
          signals: ["Problem statement", "\"help me\"", "troubleshooting", "solutions"],
          parent: "instrumental",
          motivation: "extrinsic"
        },
        "entertainment": {
          definition: "Fun, amusement, passing time",
          signals: ["Games", "jokes", "creative play", "\"tell me a story\"", "no instrumental goal"],
          parent: "social",
          motivation: "intrinsic"
        },
        "relationship-building": {
          definition: "Social bonding, rapport, connection",
          signals: ["Personal questions", "\"how are you\"", "shared experiences", "warmth"],
          parent: "social",
          motivation: "intrinsic"
        },
        "self-expression": {
          definition: "Processing thoughts, venting, journaling",
          signals: ["Extended personal monologue", "reflection", "working through ideas"],
          parent: "social",
          motivation: "intrinsic"
        }
      }
    },
    topicDepth: {
      category: "quality",
      domain: "cognitive-engagement",
      description: "How deeply the conversation explores its subject matter",
      tags: {
        "surface": {
          definition: "Brief, shallow, or introductory",
          signals: ["Few exchanges", "simple questions", "no follow-up", "greetings only"],
          characteristics: ["single-topic", "minimal-elaboration", "quick"]
        },
        "moderate": {
          definition: "Some exploration but not exhaustive",
          signals: ["Multiple turns on topic", "some clarifying questions", "reasonable depth"],
          characteristics: ["elaboration", "follow-ups", "basic-depth"]
        },
        "deep": {
          definition: "Thorough, nuanced, detailed exploration",
          signals: ["Many exchanges", "follow-up questions", "edge cases", "complexity acknowledged"],
          characteristics: ["multiple-subtopics", "rich-elaboration", "nuanced"]
        }
      }
    },
    turnTaking: {
      category: "quality",
      domain: "conversational-balance",
      description: "The balance of contribution volume between parties",
      tags: {
        "user-dominant": {
          definition: "Human messages substantially longer/more",
          signals: ["User avg length > 1.4× AI avg length"],
          ratio: "user/ai > 1.4"
        },
        "assistant-dominant": {
          definition: "AI messages substantially longer/more",
          signals: ["AI avg length > 1.4× user avg length"],
          ratio: "user/ai < 0.7"
        },
        "balanced": {
          definition: "Roughly equal message lengths",
          signals: ["Length ratio between 0.7 and 1.4"],
          ratio: "0.7 ≤ user/ai ≤ 1.4"
        }
      }
    },
    humanRole: {
      category: "role",
      domain: "user-position",
      description: "Human interactional configuration (distribution required)",
      isDistribution: true,
      tags: {
        "seeker": {
          definition: "Requests information/clarification; primarily questions",
          signals: ["\"what is\"", "\"can you explain\"", "\"tell me about\""],
          parent: "information-oriented"
        },
        "learner": {
          definition: "Tests understanding, applies, verifies (\"so if…, then…\", \"does that mean…?\")",
          signals: ["\"so if…, then…\"", "\"does that mean…?\"", "\"let me try\""],
          parent: "information-oriented"
        },
        "director": {
          definition: "Specifies deliverables/constraints/formats/next actions (\"write a dev doc\", \"raw text\")",
          signals: ["\"write a…\"", "\"make it…\"", "\"I need you to\"", "format specs"],
          parent: "leadership-oriented"
        },
        "collaborator": {
          definition: "Proposes alternatives/tradeoffs; co-builds iteratively",
          signals: ["\"what if we\"", "\"another option\"", "building on AI's output"],
          parent: "leadership-oriented"
        },
        "sharer": {
          definition: "Personal narrative/context mainly for expression/relational framing",
          signals: ["Life stories", "\"I feel\"", "personal context not task-required"],
          parent: "expression-oriented"
        },
        "challenger": {
          definition: "Critiques/stress-tests claims; explicit pushback",
          signals: ["\"but what about\"", "\"I disagree\"", "\"that's not right\""],
          parent: "critical-oriented"
        }
      },
      tieBreakers: [
        "seeker vs learner: learner shows checking/applying; seeker is request-only",
        "director vs seeker: director specifies deliverable/format constraints",
        "director vs collaborator: collaborator contributes options/tradeoffs; director mainly commands",
        "sharer vs collaborator: sharer is personal/relational; collaborator is task input",
        "challenger overrides if dominant move is explicit pushback"
      ]
    },
    aiRole: {
      category: "role",
      domain: "assistant-position",
      description: "AI interactional configuration (distribution required)",
      isDistribution: true,
      tags: {
        "expert": {
          definition: "Explains/teaches/frames concepts; definitions; examples",
          signals: ["Definitions", "\"this means\"", "comprehensive explanations"],
          parent: "knowledge-oriented"
        },
        "advisor": {
          definition: "Prescribes steps/recommendations (\"do X then Y\")",
          signals: ["\"I suggest\"", "\"you should\"", "\"try doing X then Y\""],
          parent: "knowledge-oriented"
        },
        "facilitator": {
          definition: "Guides via questions/scaffolding/options rather than prescribing",
          signals: ["\"what do you think about\"", "\"have you considered\"", "offering choices"],
          parent: "collaborative-oriented"
        },
        "reflector": {
          definition: "Paraphrases/validates/invites elaboration (\"it sounds like…\", \"that makes sense…\")",
          signals: ["\"it sounds like…\"", "\"that makes sense…\"", "\"tell me more\""],
          parent: "support-oriented"
        },
        "peer": {
          definition: "Brainstorms alongside with low-authority tone (\"we could…\")",
          signals: ["\"we could…\"", "\"maybe…\"", "collaborative speculation"],
          parent: "collaborative-oriented"
        },
        "affiliative": {
          definition: "Warmth/encouragement/rapport not required for task completion",
          signals: ["\"great job!\"", "personal warmth", "social pleasantries beyond task"],
          parent: "support-oriented"
        }
      },
      tieBreakers: [
        "expert vs advisor: expert explains concepts; advisor prescribes actions",
        "facilitator vs reflector: facilitator offers structure/options; reflector mirrors/validates",
        "peer vs facilitator: peer is speculative/equal; facilitator guides with intent",
        "affiliative is additive—can co-occur with others but only dominant if warmth > task content"
      ]
    }
  }
};

// Write taxonomy file
const outputPath = './src/data/taxonomy-v1.1.json';
fs.writeFileSync(outputPath, JSON.stringify(taxonomy, null, 2));

console.log(`✅ Generated taxonomy from prompt definitions`);
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Dimensions: ${taxonomy.totalDimensions}`);
console.log(`🏷️  Total categories: ${Object.values(taxonomy.dimensions).reduce((sum, dim) => sum + Object.keys(dim.tags).length, 0)}`);

