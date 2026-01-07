# Detailed Calculation Methods

This document provides step-by-step explanations of how each calculated dimension is computed, including formulas, examples, and edge cases.

---

## 1. X-Axis: Communication Function (Functional ↔ Social)

### Overview
Measures whether conversation language is task-oriented (functional) or relationship-focused (social).

### Step-by-Step Calculation

#### Step 1: Combine All Messages
```typescript
const combinedContent = messages.map(m => m.content).join(' ').toLowerCase();
const words = combinedContent.split(/\s+/).filter(w => w.length > 0);
const wordCount = words.length;
```

#### Step 2: Count Functional Markers

**A. Task Imperatives** (40% weight)
- Patterns: `write`, `create`, `build`, `make`, `generate`, `implement`, `code`, `develop`, `design`, `construct`
- Patterns: `fix`, `debug`, `solve`, `find`, `get`, `retrieve`, `fetch`, `download`, `install`, `run`, `execute`
- Patterns: `show`, `display`, `print`, `output`, `return`, `calculate`, `compute`, `process`
- Patterns: `need`, `require`, `must`, `should`, `have to`, `want to get`, `need to get`
- Count: Total matches across all patterns
- Normalization: `taskImperativeCount / (wordCount * 0.02)`

**B. Goal-Directed Language** (30% weight)
- Patterns: `goal`, `objective`, `target`, `aim`, `purpose`, `intent`, `achieve`, `accomplish`, `complete`, `finish`
- Patterns: `how to`, `what is`, `where is`, `when does`, `which one`, `why does` (information-seeking questions)
- Patterns: `result`, `output`, `solution`, `answer`, `response`, `correct`, `accurate`, `precise`
- Normalization: `goalCount / (wordCount * 0.015)`

**C. Technical/Domain Language** (30% weight)
- Patterns: `function`, `method`, `class`, `variable`, `parameter`, `argument`, `algorithm`, `data structure`
- Patterns: `api`, `endpoint`, `request`, `response`, `status`, `error`, `exception`, `bug`, `issue`
- Patterns: `code`, `program`, `script`, `application`, `system`, `framework`, `library`, `module`
- Normalization: `technicalCount / (wordCount * 0.01)`

**Functional Score Formula:**
```typescript
functionalScore = Math.min(1,
  (taskImperativeCount / (wordCount * 0.02)) * 0.4 +
  (goalCount / (wordCount * 0.015)) * 0.3 +
  (technicalCount / (wordCount * 0.01)) * 0.3
);
```

#### Step 3: Count Social Markers

**A. Personal Pronouns** (30% weight)
- Patterns: `I `, `me `, `my `, `myself `, `I'm `, `I've `, `I'll `, `I'd `, `I was `, `I am `, `I feel`
- Patterns: `personal`, `myself`, `my own`, `my life`, `my experience`, `my thoughts`, `my feelings`
- Normalization: `personalPronounCount / (wordCount * 0.015)`

**B. Emotional/Affective Language** (30% weight)
- Patterns: `feel`, `feeling`, `emotion`, `emotional`, `excited`, `happy`, `sad`, `worried`, `anxious`, `stressed`, `frustrated`, `angry`, `disappointed`
- Patterns: `love`, `like`, `enjoy`, `appreciate`, `grateful`, `thankful`, `pleased`, `satisfied`, `unsatisfied`, `upset`
- Patterns: `hope`, `wish`, `want`, `desire`, `dream`, `aspiration`, `concern`, `care about`
- Patterns: `wow`, `amazing`, `great`, `wonderful`, `awesome`, `cool`, `nice`, `interesting`, `fascinating`
- Normalization: `emotionalCount / (wordCount * 0.02)`

**C. Social Niceties** (20% weight)
- Patterns: `please`, `thank you`, `thanks`, `appreciate it`, `I appreciate`, `grateful`
- Patterns: `sorry`, `apologize`, `excuse me`, `pardon`, `forgive`, `I'm sorry`
- Patterns: `how are you`, `how's it going`, `hope you're`, `wish you`, `take care`
- Patterns: `friend`, `together`, `share`, `sharing`, `connect`, `connection`, `bond`, `relationship`, `friendship`
- Normalization: `socialNicetyCount / (wordCount * 0.01)`

**D. Expressive/Interpersonal Language** (20% weight)
- Patterns: `interesting`, `fascinating`, `intriguing`, `curious`, `surprising`, `unexpected`
- Patterns: `opinion`, `think`, `believe`, `view`, `perspective`, `interpretation`, `thoughts`, `feelings`
- Patterns: `share`, `tell`, `talk about`, `discuss`, `conversation`, `chat`, `exchange`, `dialogue`
- Normalization: `expressiveCount / (wordCount * 0.015)`

**Social Score Formula:**
```typescript
socialScore = Math.min(1,
  (personalPronounCount / (wordCount * 0.015)) * 0.3 +
  (emotionalCount / (wordCount * 0.02)) * 0.3 +
  (socialNicetyCount / (wordCount * 0.01)) * 0.2 +
  (expressiveCount / (wordCount * 0.015)) * 0.2
);
```

#### Step 4: Combine into Final Score
```typescript
const total = functionalScore + socialScore;
if (total > 0.1) {
  functionalSocialScore = socialScore / total; // 0 = functional, 1 = social
} else {
  // Edge case: very short messages (< 10 words) default to 0.3 (slight functional bias)
  functionalSocialScore = wordCount < 10 ? 0.3 : 0.5;
}
```

### Example
**Message:** "I feel really excited about this project! Can you help me write a function to calculate the results?"

**Functional markers:**
- `write` (task imperative) = 1
- `calculate` (task imperative) = 1
- `function` (technical) = 1
- `results` (goal language) = 1
- Word count: 18
- Functional score: `(2 / (18 * 0.02)) * 0.4 + (1 / (18 * 0.015)) * 0.3 + (1 / (18 * 0.01)) * 0.3` ≈ 0.44

**Social markers:**
- `I feel` (personal pronoun) = 1
- `excited` (emotional) = 1
- `help` (social nicety) = 1
- Social score: `(1 / (18 * 0.015)) * 0.3 + (1 / (18 * 0.02)) * 0.3 + (1 / (18 * 0.01)) * 0.2` ≈ 0.56

**Final score:** `0.56 / (0.44 + 0.56) = 0.56` (slightly social)

---

## 2. Y-Axis: Linguistic Alignment (Convergent ↔ Divergent)

### Overview
Measures how similar human and LLM linguistic styles are using cosine similarity of 7-dimensional feature vectors.

### Step-by-Step Calculation

#### Step 1: Separate Messages by Role
```typescript
const humanMessages = messages.filter(m => 
  m.role.toLowerCase() === 'user' || m.role.toLowerCase() === 'human'
);
const llmMessages = messages.filter(m => 
  m.role.toLowerCase() === 'assistant' || 
  m.role.toLowerCase() === 'ai' || 
  m.role.toLowerCase() === 'system'
);
```

#### Step 2: Extract 7 Linguistic Features for Each Group

For each group (human/LLM), calculate:

**1. Formality (0 = informal, 1 = formal)**
```typescript
formalMarkers = ['thus', 'therefore', 'furthermore', 'utilize', 'facilitate', 'via', 'per']
informalMarkers = ['yeah', 'gonna', 'wanna', 'cool', 'lol', "that's", "it's"]
formality = (formalCount / (wordCount * 0.01)) - (informalCount / (wordCount * 0.02))
```

**2. Politeness (0 = none, 1 = many)**
```typescript
politenessPatterns = ['please', 'thank you', 'would you', 'I apologize', 'sorry']
politeness = politenessCount / (wordCount * 0.02)
```

**3. Certainty (0 = uncertain, 1 = certain)**
```typescript
uncertaintyMarkers = ['maybe', 'perhaps', 'I think', 'I'm not sure']
certaintyMarkers = ['definitely', 'certainly', 'always', 'must', 'certain']
certainty = certaintyCount / (uncertaintyCount + certaintyCount)
```

**4. Structure (0 = loose, 1 = structured)**
```typescript
structureMarkers = ['first', 'second', 'step 1', 'in conclusion', numbered lists]
avgSentenceLength = wordCount / sentenceCount
structure = (structureCount / (sentenceCount * 0.1)) + (avgSentenceLength > 15 ? 0.2 : 0)
```

**5. Question-Asking (0 = none, 1 = many)**
```typescript
questionCount = count of '?'
questionAsking = questionCount / sentenceCount
```

**6. Inclusive Language (0 = none, 1 = extensive)**
```typescript
inclusivePatterns = ['we', "let's", 'together', 'our', 'collaboratively', 'team']
inclusiveLanguage = inclusiveCount / (wordCount * 0.01)
```

**7. Register (0 = casual, 1 = formal/professional)**
```typescript
contractionCount = count of contractions ("n't", "'ll", "'re", etc.)
contractionRatio = contractionCount / wordCount
register = (formality * 0.4) + (politeness * 0.3) + (structure * 0.2) + ((1 - contractionRatio) * 0.1)
```

#### Step 3: Calculate Cosine Similarity

**Vector Construction:**
```typescript
humanVector = [
  humanFeatures.formality,
  humanFeatures.politeness,
  humanFeatures.certainty,
  humanFeatures.structure,
  humanFeatures.questionAsking,
  humanFeatures.inclusiveLanguage,
  humanFeatures.register
];

llmVector = [
  llmFeatures.formality,
  llmFeatures.politeness,
  llmFeatures.certainty,
  llmFeatures.structure,
  llmFeatures.questionAsking,
  llmFeatures.inclusiveLanguage,
  llmFeatures.register
];
```

**Cosine Similarity Formula:**
```typescript
dotProduct = Σ(humanVector[i] * llmVector[i]) for i in 0..6
humanMagnitude = √(Σ(humanVector[i]²))
llmMagnitude = √(Σ(llmVector[i]²))
similarity = dotProduct / (humanMagnitude * llmMagnitude)
```

#### Step 4: Convert to Alignment Score
```typescript
alignmentScore = 1 - similarity
// High similarity (0.9) → Low alignment score (0.1) = Convergent
// Low similarity (0.2) → High alignment score (0.8) = Divergent
```

### Example

**Human messages:** "Hey! Can you help me? I'm not sure how to do this."

**LLM messages:** "Certainly. I would be happy to assist you. First, let us examine the problem systematically."

**Human features:**
- Formality: 0.1 (informal: "Hey!", contractions)
- Politeness: 0.3 ("Can you", "help me")
- Certainty: 0.2 (uncertain: "I'm not sure")
- Structure: 0.2 (loose)
- Question-asking: 0.5 (1 question / 2 sentences)
- Inclusive: 0.0
- Register: 0.2

**LLM features:**
- Formality: 0.8 (formal: "Certainly", "examine", "systematically")
- Politeness: 0.6 ("would be happy", "assist")
- Certainty: 0.9 (certain: "Certainly")
- Structure: 0.7 ("First", structured)
- Question-asking: 0.0
- Inclusive: 0.2 ("us")
- Register: 0.8

**Cosine similarity:** ≈ 0.35 (low similarity)

**Alignment score:** `1 - 0.35 = 0.65` (divergent)

---

## 3. Z-Axis: Emotional Intensity (Calm ↔ Agitated)

### Overview
Derived from PAD (Pleasure-Arousal-Dominance) model. High intensity = frustration peaks, low intensity = affiliation valleys.

### Step-by-Step Calculation

#### Option A: Per-Message PAD (Primary Method)

**Step 1: Calculate Base Pleasure from Classification**
```typescript
const convTone = classification.emotionalTone.category;
basePleasure = 
  (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
  (convTone === 'serious') ? 0.3 :
  0.5; // neutral
```

**Step 2: Calculate Base Arousal from Classification**
```typescript
const convEngagement = classification.engagementStyle.category;
baseArousal =
  (convEngagement === 'questioning') ? 0.7 :
  (convEngagement === 'reactive') ? 0.3 :
  (convEngagement === 'affirming') ? 0.45 :
  (convEngagement === 'exploring') ? 0.6 :
  0.5;
```

**Step 3: Apply Message-Level Adjustments**

**Frustration Markers** (lower pleasure, raise arousal):
```typescript
frustrationPatterns = [
  /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
  /\bno[,.]?\s+(that's|this is|it is)/i,
  /\bnot\s+(quite|right|correct|working)/i,
  /\b(doesn't|does not|can't|cannot)\s+(work|seem|make sense)/i,
  /\b(issue|problem|bug)\b/i,
  /\b(actually|however|but)\s+(that|this|it)/i
];
if (hasFrustration) {
  basePleasure = Math.max(0.1, basePleasure - 0.25);
  baseArousal = Math.min(1.0, baseArousal + 0.25);
}
```

**Satisfaction Markers** (raise pleasure, lower arousal):
```typescript
satisfactionPatterns = [
  /\b(perfect|exactly|brilliant|excellent|amazing|awesome)\b/i,
  /\b(thanks|thank you)\b/i,
  /\b(that|it)\s+works\b/i,
  /\byes[!.]?\s+(that's|exactly|perfect|correct)\b/i,
  /\bworks?\s+perfectly\b/i,
  /\blove\s+(it|this|that)\b/i
];
if (hasSatisfaction) {
  basePleasure = Math.min(1.0, basePleasure + 0.25);
  baseArousal = Math.max(0.1, baseArousal - 0.15);
}
```

**Urgency Markers** (raise arousal):
```typescript
urgencyPatterns = [
  /\b(urgent|asap|as soon as possible)\b/i,
  /\b(quickly|immediately|right now)\b/i,
  /\bhelp[!.]?\s+(me|us|please)\b/i
];
if (hasUrgency && !hasFrustration) {
  baseArousal = Math.min(1.0, baseArousal + 0.2);
}
```

**Step 4: Calculate Emotional Intensity**
```typescript
emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4
// High intensity = Low Pleasure (frustration) + High Arousal (agitation)
// Low intensity = High Pleasure (affiliation) + Low Arousal (calm)
```

**Step 5: Average Across All Messages**
```typescript
const messagesWithPad = messages.filter(msg => msg.pad?.emotionalIntensity !== undefined);
const avgIntensity = messagesWithPad.reduce((sum, msg) => 
  sum + msg.pad.emotionalIntensity, 0) / messagesWithPad.length;
z = Math.max(0, Math.min(1, avgIntensity));
```

#### Option B: Conversation-Level Fallback

If per-message PAD unavailable, use classification-based approximation:

```typescript
// Map tone to Pleasure
pleasure = 
  (tone === 'playful' || tone === 'supportive' || tone === 'empathetic') ? 0.8 :
  (tone === 'serious' || (tone === 'neutral' && engagement === 'challenging')) ? 0.2 :
  0.5;

// Map engagement to Arousal
arousal =
  (engagement === 'challenging' || engagement === 'questioning') ? 0.8 :
  (engagement === 'reactive') ? 0.3 :
  0.5;

// Calculate intensity
emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4;
```

### Example

**Message:** "This is wrong! It doesn't work. Can you fix it quickly?"

**Base values:**
- Tone: `serious` → Pleasure: 0.3
- Engagement: `questioning` → Arousal: 0.7

**Message adjustments:**
- "wrong" → Frustration detected
- Pleasure: `0.3 - 0.25 = 0.05` (clamped to 0.1)
- Arousal: `0.7 + 0.25 = 0.95`
- "quickly" → Urgency detected, but already frustrated (no additional adjustment)

**Emotional Intensity:**
```
(1 - 0.1) * 0.6 + 0.95 * 0.4
= 0.9 * 0.6 + 0.38
= 0.54 + 0.38
= 0.92 (high intensity = peak)
```

---

## 4. PAD Scores (Pleasure, Arousal, Dominance)

### Pleasure (P)

**Base from Classification:**
```typescript
basePleasure = 
  (tone === 'playful' || tone === 'supportive' || tone === 'empathetic') ? 0.8 :
  (tone === 'serious') ? 0.3 :
  0.5;
```

**Message Adjustments:**
- Frustration markers: `-0.25`
- Satisfaction markers: `+0.25`
- Clamped to [0, 1]

### Arousal (A)

**Base from Classification:**
```typescript
baseArousal =
  (engagement === 'questioning') ? 0.7 :
  (engagement === 'reactive') ? 0.3 :
  (engagement === 'affirming') ? 0.45 :
  (engagement === 'exploring') ? 0.6 :
  0.5;
```

**Message Adjustments:**
- Frustration markers: `+0.25`
- Satisfaction markers: `-0.15`
- Urgency markers: `+0.2`
- Clamped to [0, 1]

### Dominance (D) - Directive-ness

**Message Structure Analysis:**
```typescript
const isQuestion = content.includes('?');
const isCommand = /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change )/i.test(content);
const baseDominance = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);
```

**Note:** This measures directive-ness (commands/requests vs. questions), not social dominance in PAD literature sense.

---

## 5. Path Position Calculation (Message X, Y, Z)

### Overview
Messages start at origin (0.5, 0.5) and drift toward conversation target based on cumulative message characteristics.

### Step-by-Step Calculation

#### Step 1: Calculate Conversation Target
```typescript
// Target based on conversation-level X and Y values
const targetX = 0.1 + communicationFunction * 0.8; // Maps [0,1] to [0.1, 0.9]
const targetY = 0.1 + conversationStructure * 0.8;
```

#### Step 2: Analyze Each Message
```typescript
function analyzeMessage(message) {
  const content = message.content.toLowerCase();
  const hasQuestion = content.includes('?');
  const length = message.content.length;
  
  // Expressive score: personal pronouns, emotional words, casual language
  const expressiveWords = ['i', 'my', 'me', 'feel', 'like', 'love', 'wow', 'awesome'];
  const expressiveCount = expressiveWords.filter(word => content.includes(word)).length;
  const hasContractions = content.includes("'");
  const expressiveScore = Math.min(1, 
    (expressiveCount * 0.2) + 
    (hasContractions ? 0.3 : 0) + 
    (length > 50 ? 0.2 : 0)
  );
  
  return { hasQuestion, length, expressiveScore };
}
```

#### Step 3: Calculate Alignment Scores Incrementally
```typescript
// For each message, calculate alignment up to that point
for (let i = 2; i <= messages.length; i++) {
  const conversationSoFar = messages.slice(0, i);
  alignmentScores[i] = calculateConversationAlignment(conversationSoFar);
}
alignmentScores[0] = 0.5; // First message default
```

#### Step 4: Calculate Drift Per Message

**Length Scaling:**
```typescript
const conversationLength = messages.length;
const lengthScale = Math.min(1.5, 1.0 + (conversationLength - 10) / 50);
// Longer conversations get more drift per message
```

**Drift Components:**
```typescript
// 1. Target drift (toward conversation-level X, Y)
const targetDriftX = (targetX - 0.5) * 1.2 * lengthScale;
const targetDriftY = (targetY - 0.5) * 1.2 * lengthScale;

// 2. Message-level drift (based on content)
const messageDriftX = (expressiveScore - 0.5) * 0.5 * lengthScale;
// Expressive messages drift right (toward social/high X)
const messageDriftY = (alignmentScore - 0.5) * 0.5 * lengthScale;
// Aligned messages drift down (toward convergent/low Y)

// 3. Role-based drift
const roleDriftX = (message.role === 'user' ? -0.06 : 0.06) * lengthScale;
// Users drift left, assistants drift right
const roleDriftY = (message.role === 'user' ? 0.06 : -0.06) * lengthScale;
// Users drift up, assistants drift down
```

**Progressive Drift Factor:**
```typescript
const progress = i / Math.max(count - 1, 1); // 0 to 1
const baseDriftFactor = conversationLength > 30 ? 0.08 : 0.10;
const maxDriftFactor = conversationLength > 30 ? 0.40 : 0.30;
const driftFactor = baseDriftFactor + (progress * (maxDriftFactor - baseDriftFactor));
// Early messages: small drift, later messages: larger drift
```

**Final Drift:**
```typescript
const driftX = (targetDriftX + messageDriftX + roleDriftX) * driftFactor;
const driftY = (targetDriftY + messageDriftY + roleDriftY) * driftFactor;
```

#### Step 5: Update Position
```typescript
currentX += driftX;
currentY += driftY;

// Clamp to safe range
const margin = conversationLength > 30 ? 0.03 : 0.05;
currentX = Math.max(margin, Math.min(1.0 - margin, currentX));
currentY = Math.max(margin, Math.min(1.0 - margin, currentY));
```

#### Step 6: Calculate Z Position (Height)
```typescript
// Priority 1: PAD emotional intensity
if (message.pad?.emotionalIntensity !== undefined) {
  worldY = message.pad.emotionalIntensity * terrainHeight;
}
// Priority 2: PAD height fallback
else if (message.padHeight !== undefined) {
  worldY = message.padHeight * terrainHeight;
}
// Priority 3: Terrain height (last resort)
else {
  const tx = Math.floor(currentX * (size - 1));
  const ty = Math.floor(currentY * (size - 1));
  worldY = heightmap[ty * size + tx] * terrainHeight;
}
```

### Example

**Conversation:**
- Communication Function: 0.6 (social)
- Conversation Structure: 0.4 (convergent)
- Length: 5 messages

**Target:**
- `targetX = 0.1 + 0.6 * 0.8 = 0.58`
- `targetY = 0.1 + 0.4 * 0.8 = 0.42`

**Message 1 (User, expressive):**
- `expressiveScore = 0.7`
- `alignmentScore = 0.5` (first message)
- `progress = 0 / 4 = 0`
- `driftFactor = 0.10 + (0 * 0.20) = 0.10`
- `targetDriftX = (0.58 - 0.5) * 1.2 * 1.0 = 0.096`
- `messageDriftX = (0.7 - 0.5) * 0.5 * 1.0 = 0.1`
- `roleDriftX = -0.06 * 1.0 = -0.06`
- `driftX = (0.096 + 0.1 - 0.06) * 0.10 = 0.0136`
- `currentX = 0.5 + 0.0136 = 0.5136`

**Message 5 (Assistant, structured):**
- `expressiveScore = 0.3`
- `alignmentScore = 0.35` (convergent)
- `progress = 4 / 4 = 1.0`
- `driftFactor = 0.10 + (1.0 * 0.20) = 0.30`
- `driftX = (0.096 + (0.3 - 0.5) * 0.5 + 0.06) * 0.30 = 0.0168`
- `currentX = 0.5 + cumulative_drift ≈ 0.55` (closer to target)

---

## 6. Linguistic Features (7 Dimensions)

### Formality

**Calculation:**
```typescript
formalMarkers = [
  /\b(thus|therefore|furthermore|moreover|however|nevertheless|consequently|accordingly)\b/g,
  /\b(approximately|substantially|considerably|significantly)\b/g,
  /\b(utilize|facilitate|implement|demonstrate|indicate|establish)\b/g,
  /\b(via|per|wherein|herein|thereof|hereof)\b/g
];
informalMarkers = [
  /\b(yeah|yep|yup|nah|nope|gonna|wanna|gotta|kinda|sorta)\b/g,
  /\b(cool|nice|awesome|sweet|dude|hey|yo|sup)\b/g,
  /\b(omg|lol|lmao|tbh|fyi|imo|nvm|btw)\b/g,
  /\b(that's|it's|here's|there's|what's|where's|how's)\b/g
];
formality = (formalCount / (wordCount * 0.01)) - (informalCount / (wordCount * 0.02));
```

**Example:**
- "Thus, we shall utilize the framework" → Formality: 0.8
- "Yeah, we're gonna use that" → Formality: 0.1

### Politeness

**Calculation:**
```typescript
politenessPatterns = [
  /\b(please|kindly|thank you|thanks|appreciate|grateful)\b/g,
  /\b(would you|could you|might you|if you wouldn't mind)\b/g,
  /\b(I apologize|sorry|excuse me|pardon|forgive me)\b/g,
  /\b(much obliged|my pleasure|at your service)\b/g
];
politeness = Math.min(1, politenessCount / (wordCount * 0.02));
```

### Certainty

**Calculation:**
```typescript
uncertaintyMarkers = ['maybe', 'perhaps', 'I think', 'I'm not sure', 'possibly', 'might', 'could'];
certaintyMarkers = ['definitely', 'certainly', 'absolutely', 'always', 'never', 'must', 'certain'];
certainty = totalCertaintyMarkers > 0 
  ? certaintyCount / (uncertaintyCount + certaintyCount)
  : 0.5;
```

**Example:**
- "I think maybe it could work" → Certainty: 0.25 (3 uncertain, 0 certain)
- "This definitely must work" → Certainty: 1.0 (0 uncertain, 2 certain)

### Structure

**Calculation:**
```typescript
structureMarkers = [
  /\b(first(ly)?|second(ly)?|third(ly)?|finally|lastly|in conclusion)\b/g,
  /\b(step \d+|step one|step two|part \d+|section \d+)\b/g,
  /\b(\d+[\.\)] |[-*] |• )/g, // Lists
  /\b(in summary|to summarize|in conclusion|overall|in short)\b/g
];
avgSentenceLength = wordCount / sentenceCount;
structure = Math.min(1, 
  (structureCount / (sentenceCount * 0.1)) + 
  (avgSentenceLength > 15 ? 0.2 : 0)
);
```

### Question-Asking

**Calculation:**
```typescript
questionCount = (content.match(/\?/g) || []).length;
questionAsking = sentenceCount > 0 
  ? Math.min(1, questionCount / sentenceCount)
  : 0;
```

### Inclusive Language

**Calculation:**
```typescript
inclusivePatterns = [
  /\b(we |let's |let us |us |together|our |we're |we'll |we've |we'd )/g,
  /\b(collaboratively|jointly|mutually|cooperatively|collectively)\b/g,
  /\b(team|group|together|shared|common|joint)\b/g
];
inclusiveLanguage = Math.min(1, inclusiveCount / (wordCount * 0.01));
```

### Register

**Calculation:**
```typescript
contractionCount = (content.match(/\b(n't|'ll|'re|'ve|'d|'m|'s|'t)\b/g) || []).length;
contractionRatio = contractionCount / wordCount;
register = Math.min(1, 
  (formality * 0.4) + 
  (politeness * 0.3) + 
  (structure * 0.2) + 
  ((1 - contractionRatio) * 0.1)
);
```

---

## 7. Terrain Seed

### Calculation
```typescript
function generateSeedFromClassification(conv) {
  const pattern = classification.interactionPattern?.category || 'unknown';
  const tone = classification.emotionalTone?.category || 'neutral';
  const purpose = classification.conversationPurpose?.category || 'unknown';
  
  const seedString = `${pattern}-${tone}-${purpose}-${conv.id}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Map to range 1-999
  return Math.abs(hash % 999) + 1;
}
```

**Example:**
- Input: `"question-answer-neutral-information-seeking-chatbot_arena_001"`
- Hash: `-1234567890` (example)
- Output: `Math.abs(-1234567890 % 999) + 1 = 123`

---

## 8. Average Confidence

### Calculation
```typescript
const confidences = [
  classification.interactionPattern?.confidence,
  classification.powerDynamics?.confidence,
  classification.emotionalTone?.confidence,
  classification.engagementStyle?.confidence,
  classification.knowledgeExchange?.confidence,
  classification.conversationPurpose?.confidence,
  classification.turnTaking?.confidence,
  classification.humanRole?.confidence,
  classification.aiRole?.confidence
].filter(c => c !== undefined);

const avgConfidence = confidences.length > 0
  ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
  : 0.7;

// Clamped to [0.3, 1.0]
return Math.max(0.3, Math.min(1.0, avgConfidence));
```

**Example:**
- Confidences: `[0.8, 0.7, 0.9, 0.6, 0.85, 0.75, 0.8, 0.7, 0.65]`
- Average: `(0.8 + 0.7 + 0.9 + 0.6 + 0.85 + 0.75 + 0.8 + 0.7 + 0.65) / 9 = 0.75`

---

## Edge Cases and Fallbacks

### Empty Messages
- **X-axis:** Returns `0.5` (neutral)
- **Y-axis:** Returns `0.5` (neutral alignment)
- **Z-axis:** Uses conversation-level estimate
- **Linguistic features:** All default to `0.5`

### Single Message
- **Y-axis:** Returns `0.5` (need at least 2 messages for alignment)
- **Path drift:** Minimal (early in conversation)

### Missing Classification
- **X-axis:** Falls back to role-based or purpose-based positioning
- **Y-axis:** Falls back to role-based or pattern-based positioning
- **Z-axis:** Uses default `0.5`
- **PAD:** Uses default values (P: 0.5, A: 0.5, D: 0.5)

### Very Short Messages (< 10 words)
- **X-axis:** Slight bias toward functional (`0.3`)
- **Linguistic features:** May have low counts, normalized appropriately

### Very Long Conversations (> 30 messages)
- **Path drift:** Uses different scaling factors
  - `baseDriftFactor = 0.08` (vs. 0.10 for shorter)
  - `maxDriftFactor = 0.40` (vs. 0.30 for shorter)
  - `margin = 0.03` (vs. 0.05 for shorter)

---

## Performance Considerations

### Optimization Strategies

1. **Caching:** Linguistic features are calculated once per message group
2. **Incremental Alignment:** Alignment scores calculated incrementally (only up to current message)
3. **Normalization:** All scores clamped to [0, 1] to prevent overflow
4. **Regex Compilation:** Patterns compiled once, reused for all messages

### Computational Complexity

- **X-axis (Functional/Social):** O(n) where n = total words
- **Y-axis (Alignment):** O(n + m) where n = human words, m = LLM words
- **Path positions:** O(m) where m = number of messages
- **Linguistic features:** O(n) per feature, 7 features total

---

This document provides the detailed calculation methods for all primary dimensions. For implementation details, see the source code in `src/utils/`.

