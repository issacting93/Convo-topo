/**
 * Linguistic Marker Analysis - Communication Accommodation Theory
 * 
 * This module analyzes linguistic alignment between human and LLM messages,
 * measuring convergence/divergence in linguistic style.
 * 
 * Y-Axis: Aligned ↔ Divergent
 * - Aligned (low Y): Human linguistic markers match LLM linguistic markers (convergence)
 * - Divergent (high Y): Human linguistic markers differ from LLM linguistic markers (divergence)
 * 
 * Theoretical Framework: Communication Accommodation Theory [Giles, 1973]
 * - Convergence: Adjusting style to match interlocutor (aligned)
 * - Divergence: Maintaining or emphasizing different style (divergent)
 */

export interface LinguisticFeatures {
  /** Formality level: 0 = informal, 1 = formal */
  formality: number;
  /** Politeness markers: 0 = none, 1 = many */
  politeness: number;
  /** Certainty expressions: 0 = uncertain, 1 = certain */
  certainty: number;
  /** Structural organization: 0 = loose, 1 = structured */
  structure: number;
  /** Question-asking behavior: 0 = no questions, 1 = many questions */
  questionAsking: number;
  /** Inclusive language: 0 = none, 1 = extensive */
  inclusiveLanguage: number;
  /** Conversational register: 0 = casual, 1 = formal/professional */
  register: number;
}

/**
 * Extract linguistic features from a message or set of messages
 */
export function extractLinguisticFeatures(
  messages: Array<{ role: string; content: string }>
): LinguisticFeatures {
  if (messages.length === 0) {
    return {
      formality: 0.5,
      politeness: 0.5,
      certainty: 0.5,
      structure: 0.5,
      questionAsking: 0.5,
      inclusiveLanguage: 0.5,
      register: 0.5,
    };
  }

  // Combine all message content
  const combinedContent = messages.map(m => m.content).join(' ').toLowerCase();
  const words = combinedContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentenceCount = combinedContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  // 1. FORMALITY LEVEL (0 = informal, 1 = formal)
  const formalMarkers = [
    /\b(thus|therefore|furthermore|moreover|however|nevertheless|consequently|accordingly)\b/g,
    /\b(approximately|approximately|substantially|considerably|significantly)\b/g,
    /\b(utilize|facilitate|implement|demonstrate|indicate|establish)\b/g,
    /\b(via|per|wherein|herein|thereof|hereof)\b/g,
  ];
  const informalMarkers = [
    /\b(yeah|yep|yup|nah|nope|gonna|wanna|gotta|kinda|sorta)\b/g,
    /\b(cool|nice|awesome|sweet|dude|hey|yo|sup)\b/g,
    /\b(omg|lol|lmao|tbh|fyi|imo|nvm|btw)\b/g,
    /\b(that's|it's|here's|there's|what's|where's|how's)\b/g,
  ];
  const formalCount = formalMarkers.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const informalCount = informalMarkers.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const formality = wordCount > 0
    ? Math.max(0, Math.min(1, (formalCount / Math.max(1, wordCount * 0.01)) - (informalCount / Math.max(1, wordCount * 0.02))))
    : 0.5;

  // 2. POLITENESS MARKERS (0 = none, 1 = many)
  const politenessPatterns = [
    /\b(please|kindly|thank you|thanks|appreciate|grateful)\b/g,
    /\b(would you|could you|might you|if you wouldn't mind)\b/g,
    /\b(I apologize|sorry|excuse me|pardon|forgive me)\b/g,
    /\b(much obliged|my pleasure|at your service)\b/g,
  ];
  const politenessCount = politenessPatterns.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const politeness = wordCount > 0
    ? Math.min(1, politenessCount / Math.max(1, wordCount * 0.02))
    : 0;

  // 3. CERTAINTY EXPRESSIONS (0 = uncertain, 1 = certain)
  const uncertaintyMarkers = [
    /\b(maybe|perhaps|possibly|might|could|may|unclear|uncertain)\b/g,
    /\b(I think|I believe|I suppose|it seems|it appears|sort of|kind of)\b/g,
    /\b(I'm not sure|I don't know|I'm uncertain|I'm unclear)\b/g,
  ];
  const certaintyMarkers = [
    /\b(definitely|certainly|absolutely|undoubtedly|clearly|obviously|surely)\b/g,
    /\b(always|never|must|should|will|is|are|was|were)\b/g,
    /\b(certain|sure|positive|confident|definite)\b/g,
  ];
  const uncertaintyCount = uncertaintyMarkers.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const certaintyCount = certaintyMarkers.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const totalCertaintyMarkers = uncertaintyCount + certaintyCount;
  const certainty = totalCertaintyMarkers > 0
    ? certaintyCount / totalCertaintyMarkers
    : 0.5;

  // 4. STRUCTURAL ORGANIZATION (0 = loose, 1 = structured)
  // Indicators: numbered lists, "first/second/third", bullet points, clear topic sentences
  const structureMarkers = [
    /\b(first(ly)?|second(ly)?|third(ly)?|finally|lastly|in conclusion)\b/g,
    /\b(step \d+|step one|step two|part \d+|section \d+)\b/g,
    /\b(\d+[\.\)] |[-*] |• )/g, // Lists
    /\b(in summary|to summarize|in conclusion|overall|in short)\b/g,
  ];
  const structureCount = structureMarkers.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  // Also check average sentence length (longer sentences suggest more structure)
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 10;
  const structure = Math.min(1, (structureCount / Math.max(1, sentenceCount * 0.1)) + (avgSentenceLength > 15 ? 0.2 : 0));

  // 5. QUESTION-ASKING BEHAVIOR (0 = no questions, 1 = many questions)
  const questionCount = (combinedContent.match(/\?/g) || []).length;
  const questionAsking = sentenceCount > 0
    ? Math.min(1, questionCount / sentenceCount)
    : 0;

  // 6. INCLUSIVE LANGUAGE (0 = none, 1 = extensive)
  const inclusivePatterns = [
    /\b(we |let's |let us |us |together|our |we're |we'll |we've |we'd )/g,
    /\b(collaboratively|jointly|mutually|cooperatively|collectively)\b/g,
    /\b(team|group|together|shared|common|joint)\b/g,
  ];
  const inclusiveCount = inclusivePatterns.reduce((sum, pattern) => {
    const matches = combinedContent.match(pattern);
    return sum + (matches?.length || 0);
  }, 0);
  const inclusiveLanguage = wordCount > 0
    ? Math.min(1, inclusiveCount / Math.max(1, wordCount * 0.01))
    : 0;

  // 7. CONVERSATIONAL REGISTER (0 = casual, 1 = formal/professional)
  // Combination of formality + politeness + structure + absence of contractions
  const contractionCount = (combinedContent.match(/\b(n't|'ll|'re|'ve|'d|'m|'s|'t)\b/g) || []).length;
  const contractionRatio = wordCount > 0 ? contractionCount / wordCount : 0;
  const register = Math.min(1, (formality * 0.4) + (politeness * 0.3) + (structure * 0.2) + ((1 - contractionRatio) * 0.1));

  return {
    formality: Math.max(0, Math.min(1, formality)),
    politeness: Math.max(0, Math.min(1, politeness)),
    certainty: Math.max(0, Math.min(1, certainty)),
    structure: Math.max(0, Math.min(1, structure)),
    questionAsking: Math.max(0, Math.min(1, questionAsking)),
    inclusiveLanguage: Math.max(0, Math.min(1, inclusiveLanguage)),
    register: Math.max(0, Math.min(1, register)),
  };
}

/**
 * Calculate cosine similarity between two feature vectors
 */
function cosineSimilarity(a: LinguisticFeatures, b: LinguisticFeatures): number {
  const aValues = [a.formality, a.politeness, a.certainty, a.structure, a.questionAsking, a.inclusiveLanguage, a.register];
  const bValues = [b.formality, b.politeness, b.certainty, b.structure, b.questionAsking, b.inclusiveLanguage, b.register];

  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < aValues.length; i++) {
    dotProduct += aValues[i] * bValues[i];
    aMagnitude += aValues[i] * aValues[i];
    bMagnitude += bValues[i] * bValues[i];
  }

  aMagnitude = Math.sqrt(aMagnitude);
  bMagnitude = Math.sqrt(bMagnitude);

  if (aMagnitude === 0 || bMagnitude === 0) {
    return 0.5; // Default to moderate similarity if either vector is empty
  }

  return dotProduct / (aMagnitude * bMagnitude);
}

/**
 * Calculate linguistic alignment between human and LLM messages
 * Returns Y-axis value: 0 = aligned (convergent), 1 = divergent
 * 
 * Formula: y_value = 1 - similarity(human_features, llm_features)
 * 
 * @param messages - Array of conversation messages with role field
 * @returns Alignment score: 0 = aligned, 1 = divergent
 */
export function calculateConversationAlignment(
  messages: Array<{ role: string; content: string }>
): number {
  if (messages.length === 0) {
    return 0.5; // Neutral alignment if no messages
  }

  // Separate human (user) and LLM (assistant) messages
  // CRITICAL: 'user' or 'human' = HUMAN, 'assistant' or 'ai' or 'system' = LLM
  const humanMessages = messages.filter(m => {
    const role = (m.role || '').toLowerCase();
    return role === 'user' || role === 'human';
  });
  const llmMessages = messages.filter(m => {
    const role = (m.role || '').toLowerCase();
    return role === 'assistant' || role === 'ai' || role === 'system';
  });

  // If we don't have both types, return neutral
  if (humanMessages.length === 0 || llmMessages.length === 0) {
    return 0.5;
  }

  // Extract linguistic features for each group
  const humanFeatures = extractLinguisticFeatures(humanMessages);
  const llmFeatures = extractLinguisticFeatures(llmMessages);

  // Calculate similarity (cosine similarity across all 7 dimensions)
  const similarity = cosineSimilarity(humanFeatures, llmFeatures);

  // Convert to alignment score: high similarity = aligned (low Y), low similarity = divergent (high Y)
  // y_value = 1 - similarity
  const alignmentScore = 1 - similarity;

  return Math.max(0, Math.min(1, alignmentScore));
}

/**
 * Calculate per-message alignment scores for path generation
 * For each message, calculate alignment up to that point in the conversation
 */
export function calculateMessageAlignmentScores(
  messages: Array<{ role: string; content: string }>
): number[] {
  const scores: number[] = [];

  for (let i = 2; i <= messages.length; i++) {
    // Calculate alignment using messages up to this point
    const conversationSoFar = messages.slice(0, i);
    scores.push(calculateConversationAlignment(conversationSoFar));
  }

  // First message has no alignment (need at least 2 messages)
  if (messages.length > 0) {
    scores.unshift(0.5); // Default for first message
  }

  return scores;
}



/**
 * Calculate Functional ↔ Social score based on linguistic markers
 * 
 * X-Axis: Functional ↔ Social (Agency Distribution)
 * - Functional (low X, 0.0-0.4): Task-oriented, goal-directed, instrumental language
 * - Social (high X, 0.6-1.0): Relationship-focused, expressive, personal language
 * 
 * Theoretical Framework: Watzlawick's content/relationship distinction [Watzlawick et al., 1967]
 * 
 * @param messages - Array of conversation messages (typically all messages or human messages)
 * @returns Functional/Social score: 0 = functional, 1 = social
 */
export function calculateFunctionalSocialScore(
  messages: Array<{ role: string; content: string }>
): number {
  if (messages.length === 0) {
    return 0.5; // Neutral if no messages
  }

  // Combine all message content
  const combinedContent = messages.map(m => m.content).join(' ').toLowerCase();
  const words = combinedContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return 0.5;
  }

  // ==========================================
  // FUNCTIONAL (Task-Oriented) MARKERS
  // ==========================================

  // Task-oriented imperatives and directives
  const taskImperatives = [
    /\b(write|create|build|make|generate|implement|code|develop|design|construct)\b/g,
    /\b(fix|debug|solve|find|get|retrieve|fetch|download|install|run|execute)\b/g,
    /\b(show|display|print|output|return|calculate|compute|process)\b/g,
    /\b(need|require|must|should|have to|want to get|need to get)\b/g,
  ];
  let taskImperativeCount = 0;
  taskImperatives.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) taskImperativeCount += matches.length;
  });

  // Goal-directed language
  const goalLanguage = [
    /\b(goal|objective|target|aim|purpose|intent|achieve|accomplish|complete|finish)\b/g,
    /\b(how to|what is|where is|when does|which one|why does)\b/g, // Information-seeking questions
    /\b(result|output|solution|answer|response|correct|accurate|precise)\b/g,
  ];
  let goalCount = 0;
  goalLanguage.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) goalCount += matches.length;
  });

  // Technical/domain-specific language
  const technicalMarkers = [
    /\b(function|method|class|variable|parameter|argument|algorithm|data structure)\b/g,
    /\b(api|endpoint|request|response|status|error|exception|bug|issue)\b/g,
    /\b(code|program|script|application|system|framework|library|module)\b/g,
  ];
  let technicalCount = 0;
  technicalMarkers.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) technicalCount += matches.length;
  });

  // Minimal social niceties (when present, indicates task focus)
  // Count absence of social markers as functional indicator



  // ==========================================
  // SOCIAL (Relationship-Focused) MARKERS
  // ==========================================

  // Personal pronouns and self-reference
  const personalPronouns = [
    /\b(I |me |my |myself |I'm |I've |I'll |I'd |I was |I am |I feel)\b/g,
    /\b(personal|myself|my own|my life|my experience|my thoughts|my feelings)\b/g,
  ];
  let personalPronounCount = 0;
  personalPronouns.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) personalPronounCount += matches.length;
  });

  // Emotional/affective language
  const emotionalLanguage = [
    /\b(feel|feeling|emotion|emotional|excited|happy|sad|worried|anxious|stressed|frustrated|angry|disappointed)\b/g,
    /\b(love|like|enjoy|appreciate|grateful|thankful|pleased|satisfied|unsatisfied|upset)\b/g,
    /\b(hope|wish|want|desire|dream|aspiration|concern|care about)\b/g,
    /\b(wow|amazing|great|wonderful|awesome|cool|nice|interesting|fascinating)\b/g,
  ];
  let emotionalCount = 0;
  emotionalLanguage.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) emotionalCount += matches.length;
  });

  // Social niceties and relationship-building
  const socialNiceties = [
    /\b(please|thank you|thanks|appreciate it|I appreciate|grateful)\b/g,
    /\b(sorry|apologize|excuse me|pardon|forgive|I'm sorry)\b/g,
    /\b(how are you|how's it going|hope you're|wish you|take care)\b/g,
    /\b(friend|together|share|sharing|connect|connection|bond|relationship|friendship)\b/g,
  ];
  let socialNicetyCount = 0;
  socialNiceties.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) socialNicetyCount += matches.length;
  });

  // Expressive/interpersonal language
  const expressiveLanguage = [
    /\b(interesting|fascinating|intriguing|curious|surprising|unexpected)\b/g,
    /\b(opinion|think|believe|view|perspective|interpretation|thoughts|feelings)\b/g,
    /\b(share|tell|talk about|discuss|conversation|chat|exchange|dialogue)\b/g,
  ];
  let expressiveCount = 0;
  expressiveLanguage.forEach(pattern => {
    const matches = combinedContent.match(pattern);
    if (matches) expressiveCount += matches.length;
  });



  // ==========================================
  // COMBINE INTO FUNCTIONAL/SOCIAL SCORE
  // ==========================================

  // OLD LOGIC: socialScore / (functionalScore + socialScore) -> Mass centers at 0.5

  // NEW LOGIC: Independent Push/Pull
  // Start at 0.5 (Neutral)
  // Functional markers push LEFT (subtract)
  // Social markers push RIGHT (add)

  // 1. Calculate raw intensity of each side
  // Boost the weights slightly to ensure we can reach edges
  const rawFunctional = Math.min(1.0,
    (taskImperativeCount * 0.6) + // Strongest push
    (goalCount * 0.4) +
    (technicalCount * 0.5)
  ) / Math.max(1, wordCount * 0.05); // Normalize by length

  const rawSocial = Math.min(1.0,
    (personalPronounCount * 0.4) +
    (emotionalCount * 0.5) +      // Strongest push
    (socialNicetyCount * 0.3) +   // Weaker push (allow polite functional)
    (expressiveCount * 0.3)
  ) / Math.max(1, wordCount * 0.05); // Normalize by length

  // 2. Apply Push/Pull
  // Base 0.5
  // Max Functional pull: -0.45 (Result 0.05)
  // Max Social push: +0.45 (Result 0.95)

  let score = 0.5;

  // Apply forces with specific tuning
  score -= rawFunctional * 0.8;
  score += rawSocial * 0.8;

  // 3. Special Case: Polite Functional ("Please fix this")
  // If we have strong functional markers AND social niceties,
  // bias towards Functional (don't let 'please' neutralize 'fix')
  if (taskImperativeCount > 0 && socialNicetyCount > 0 && emotionalCount === 0) {
    score -= 0.1; // Penalty to ensure it leans functional
  }

  // 4. Short Message Handling
  // Short messages (< 10 words) without specific markers are usually functional
  if (wordCount < 10 && rawSocial < 0.1 && rawFunctional < 0.1) {
    score -= 0.15; // Default to slightly functional
  }

  return Math.max(0.05, Math.min(0.95, score));
}
