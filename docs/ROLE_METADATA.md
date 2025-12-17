# Role Metadata Documentation

> **✅ CURRENT: LLM-Based Classification System v1.1**  
> This document describes the **current classification system** using LLM-based analysis.  
> **Classification Method**: Claude API (Anthropic) with structured prompts  
> **Taxonomy Version**: v1.1 (see `taxonomy.json`)  
> **Roles**: Uses current taxonomy (`director`, `challenger`, `reflector`, `affiliative`)  
> **Implementation**: See `classifier-v1.1.py/ts` and `README-v1.1.md`

## Overview

Each conversation in the PersonaChat dataset includes rich metadata that provides deeper insights into the human-AI interaction dynamics. This metadata captures 10 key dimensions of conversational roles and patterns, classified using LLM-based analysis with probability distributions for role dimensions.

---

## Metadata Schema

### 1. **Interaction Pattern**
*How the conversation is structured*

- **collaborative** (86 conversations): Both parties work together, building on each other's ideas
- **casual-chat** (36 conversations): Informal, relaxed exchanges without clear goal
- **question-answer** (19 conversations): One party asks, the other responds with information
- **advisory** (4 conversations): One party seeks guidance, the other provides recommendations
- **storytelling** (0 conversations): Narrative-focused exchanges
- **debate** (0 conversations): Contrasting viewpoints being discussed

### 2. **Power Dynamics**
*Who controls the conversation flow*

- **balanced**: Equal participation and influence
- **human-led**: User drives topics and direction
- **ai-led**: Assistant guides the conversation
- **alternating**: Leadership shifts between participants

### 3. **Emotional Tone**
*The affective quality of the exchange*

- **supportive** (89 conversations): Encouraging, caring, helpful language
- **neutral** (14 conversations): Matter-of-fact, unemotional
- **playful** (20 conversations): Fun, lighthearted, humorous
- **professional** (21 conversations): Work-focused, formal
- **empathetic** (1 conversation): Deep understanding and emotional resonance
- **serious** (0 conversations): Grave, important matters

### 4. **Engagement Style**
*How participants interact with each other*

- **questioning**: Frequent use of questions to explore
- **affirming**: Agreement and validation patterns
- **challenging**: Pushing back on ideas
- **exploring**: Open-ended curiosity
- **reactive**: Responding without initiating

### 5. **Knowledge Exchange**
*Type of information being shared*

- **personal-sharing**: Sharing personal experiences, preferences, life details
- **skill-sharing**: Teaching or learning specific abilities
- **opinion-exchange**: Expressing and discussing viewpoints
- **factual-info**: Sharing objective information
- **experience-sharing**: Recounting past events and lessons

### 6. **Conversation Purpose**
*The underlying goal of the interaction*

- **information-seeking**: Trying to learn or understand something
- **relationship-building**: Connecting on a personal level
- **entertainment**: Having fun, being entertained
- **problem-solving**: Working through a challenge
- **self-expression**: Sharing thoughts and feelings

### 7. **Topic Depth**
*How deeply the conversation explores subjects*

- **surface**: Brief, shallow exchanges (≤2 messages or short responses)
- **moderate**: Some development of ideas (3-5 messages, medium length)
- **deep**: Extensive exploration (≥6 messages, long responses)

### 8. **Turn Taking**
*Balance of speaking time/length*

- **balanced**: Equal message lengths from both parties
- **user-dominant**: Human messages significantly longer
- **assistant-dominant**: AI messages significantly longer

### 9. **Human Role** (Distribution-Based)
*The user's conversational position - output as probability distribution*

- **seeker**: Requests information/clarification; primarily questions
- **learner**: Tests understanding/applies/verifies ("so if…, then…", "does that mean…?")
- **director**: Specifies deliverables/constraints/formats/next actions ("write a dev doc", "raw text")
- **collaborator**: Proposes alternatives/tradeoffs; co-builds iteratively
- **sharer**: Personal narrative/context mainly for expression/relational framing
- **challenger**: Critiques/stress-tests claims; explicit pushback

**Note**: Role classifications are output as probability distributions (values sum to 1.0), allowing for mixed roles.

### 10. **AI Role** (Distribution-Based)
*The assistant's conversational position - output as probability distribution*

- **expert**: Explains/teaches/frames concepts; definitions; examples
- **advisor**: Prescribes steps/recommendations ("do X then Y")
- **facilitator**: Guides via questions/scaffolding/options rather than prescribing
- **reflector**: Paraphrases/validates/invites elaboration ("it sounds like…", "that makes sense…")
- **peer**: Brainstorms alongside with low-authority tone ("we could…")
- **affiliative**: Warmth/encouragement/rapport not required for task completion

**Note**: Role classifications are output as probability distributions (values sum to 1.0), allowing for mixed roles.

---

## Key Insights from the Data

### Classification Method

Classifications are generated using **LLM-based analysis** (Claude API) which provides:
- Context-aware role identification
- Probability distributions for roles (mixed roles allowed)
- Evidence quotes for each classification
- Confidence scores for all dimensions

### Most Common Patterns

1. **Collaborative + Expert-Seeker Dynamic**
   - Collaborative conversations where the human seeks information and the AI provides expert knowledge

2. **Supportive Emotional Tone**
   - The majority of conversations have a supportive, caring quality

3. **Personal Sharing**
   - Most conversations involve sharing personal experiences and preferences

### Interesting Findings

- **Role Distributions**: Unlike single-category systems, roles are output as probability distributions, allowing for nuanced mixed-role identification
- **Evidence-Based**: All classifications include evidence quotes from the conversation
- **Confidence Scoring**: Each dimension includes a confidence score (0.0-1.0) indicating classification certainty

---

## Usage Examples

### Filtering by Human-AI Dynamic

```typescript
// Find all conversations where human is a sharer and AI is a reflector
// Note: Roles are probability distributions, so we check dominant role
function getDominantRole(roleData: {distribution?: Record<string, number>} | string | undefined): string | null {
  if (!roleData) return null;
  if (typeof roleData === 'string') return roleData;
  if (roleData.distribution) {
    return Object.entries(roleData.distribution)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  return null;
}

const sharingConversations = conversations.filter(conv => {
  const humanDominant = getDominantRole(conv.metadata?.humanRole);
  const aiDominant = getDominantRole(conv.metadata?.aiRole);
  return humanDominant === 'sharer' && aiDominant === 'reflector';
});
```

### Analyzing Emotional Patterns

```typescript
// Group conversations by emotional tone
const toneGroups = conversations.reduce((acc, conv) => {
  const tone = conv.metadata?.emotionalTone?.category || 'unknown';
  if (!acc[tone]) acc[tone] = [];
  acc[tone].push(conv);
  return acc;
}, {} as Record<string, Conversation[]>);
```

### Finding Deep Collaborative Conversations

```typescript
// Find conversations that are both deep and collaborative
const deepCollaborative = conversations.filter(conv =>
  conv.metadata?.topicDepth?.category === 'deep' &&
  conv.metadata?.interactionPattern?.category === 'collaborative'
);
```

---

## Visualization Opportunities

This metadata enables rich visualization possibilities:

1. **Role Matrix**: Plot humanRole × aiRole to see common pairings
2. **Emotional Journey**: Track how emotionalTone changes through conversation progression
3. **Power Dynamics Map**: Visualize powerDynamics distribution across different interactionPatterns
4. **Purpose Clustering**: Group conversations by conversationPurpose and visualize topic distributions
5. **Depth vs Engagement**: Correlate topicDepth with engagementStyle

---

## Metadata Quality

The metadata is generated through **LLM-based classification** (Claude API) which analyzes:
- Message content patterns
- Contextual understanding
- Conversation flow and structure
- Evidence-based reasoning
- Role distributions (mixed roles allowed)

Each classification includes:
- **Confidence scores** (0.0-1.0) for all dimensions
- **Evidence quotes** from the conversation
- **Rationale** explaining the classification
- **Alternative categories** when confidence < 0.6

This approach provides nuanced, context-aware categorization across all conversations.

---

## Future Enhancements

Potential additions to the metadata:
- **Sentiment trajectory**: Track emotional progression
- **Topic tags**: Specific subjects discussed
- **Expertise level**: Perceived knowledge demonstrated
- **Responsiveness score**: How well participants respond to each other
- **Coherence rating**: How well the conversation flows

---

This metadata transforms the PersonaChat dataset into a rich resource for understanding human-AI conversational dynamics! 🤖💬
