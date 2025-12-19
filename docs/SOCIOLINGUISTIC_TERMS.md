# Sociolinguistic & Sociological Terms for Conversation Metrics

## Recommended Established Terms

### X-Axis: Functional ↔ Social

#### Best Option: **FUNCTIONAL ↔ SOCIAL** (a.k.a. Instrumental ↔ Expressive in Parsons)
- **Source**: Structural functionalism (Talcott Parsons, 1950s) uses instrumental/expressive; we surface the audience-friendly labels functional/social.
- **Definition**: 
  - **Functional (Instrumental)**: Goal-oriented, task-focused, pragmatic action
  - **Social (Expressive)**: Relationship-building, emotional, value-oriented action
- **Why it fits**: Well-established in sociology; “functional/social” keeps the plain-language framing while aligning to the instrumental/expressive literature.
- **Usage**: "functionalSocial" or "instrumentalExpressive" (code may still use `communicationFunction`)

#### Alternative: **REFERENTIAL ↔ PHATIC** (Roman Jakobson)
- **Source**: Functions of language (Roman Jakobson, 1960)
- **Definition**:
  - **Referential**: Focus on information/content (task-oriented)
  - **Phatic**: Focus on maintaining social connection (social-oriented)
- **Why it fits**: Directly from linguistics, describes communication function
- **Usage**: "referentialPhatic" or "communicationFunction"

#### Alternative: **TRANSACTIONAL ↔ INTERACTIONAL** (Conversation Analysis)
- **Source**: Conversation Analysis tradition
- **Definition**:
  - **Transactional**: Goal-oriented, information exchange
  - **Interactional**: Relationship-maintaining, social bonding
- **Why it fits**: From conversation analysis, directly applicable
- **Usage**: "transactionalInteractional" or "conversationOrientation"

### Z-Axis: Emergent ↔ Prescribed

#### Best Option: **STRUCTURED ↔ EMERGENT** (Discourse Analysis)
- **Source**: Discourse analysis and conversation analysis
- **Definition**:
  - **Structured**: Pre-organized, rule-governed, predictable patterns
  - **Emergent**: Spontaneous, context-dependent, co-constructed
- **Why it fits**: Describes discourse organization directly
- **Usage**: "discourseStructure" or "conversationStructure"

#### Alternative: **ADJACENCY-PAIR ↔ OPEN-ENDED** (Conversation Analysis)
- **Source**: Conversation Analysis (Harvey Sacks)
- **Definition**:
  - **Adjacency-Pair**: Turn-taking pairs (question-answer, greeting-greeting)
  - **Open-ended**: Free-form, exploratory conversation
- **Why it fits**: Technical CA term, but might be too specific
- **Usage**: "adjacencyPattern" or "turnStructure"

#### Alternative: **DIRECTIVE ↔ INTERROGATIVE** (Speech Act Theory)
- **Source**: Speech Act Theory (Austin, Searle)
- **Definition**:
  - **Directive**: Commands, statements, directives (prescribed)
  - **Interrogative**: Questions, exploratory acts (emergent)
- **Why it fits**: Describes speech act types, but limited scope
- **Usage**: "speechActType" or "illocutionaryForce"

## Recommended Implementation

### Primary Recommendation:

**X-Axis**: `functionalSocial` (a.k.a. `instrumentalExpressive`) or `communicationFunction`
- Labels: **INSTRUMENTAL ↔ EXPRESSIVE**
- 0 = Instrumental (task-focused, goal-oriented)
- 1 = Expressive (relationship-focused, value-oriented)

**Z-Axis**: `discourseStructure` or `conversationStructure`
- Labels: **STRUCTURED ↔ EMERGENT**
- 0 = Structured (prescribed, rule-governed)
- 1 = Emergent (spontaneous, co-constructed)

### Why These Terms Work:

1. **Established academic terms**: From well-known frameworks (Parsons, discourse analysis)
2. **Clear semantic meaning**: Terms accurately describe what's being measured
3. **No confusion**: Unlike "tension" (which implies conflict) or "delegation" (which implies authority)
4. **Academic rigor**: Can reference established literature
5. **Precise**: Capture the exact dimensions you're analyzing

## Alternative Framework: Erving Goffman

### Frame Analysis Approach:
- **X-Axis**: **FRONT STAGE ↔ BACK STAGE**
  - Front Stage: Public, performative, functional/task
  - Back Stage: Private, authentic, social/expressive
  - *Note: This is more about self-presentation than communication function*

### Keying & Footing:
- **Z-Axis**: **PRIMARY FRAME ↔ KEYED FRAME**
  - Primary: Direct, literal interaction
  - Keyed: Transformed, framed interaction (play, joke, etc.)
  - *Note: Interesting but might not match your dimension exactly*

## Code Implementation Suggestion

```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  functionalSocial: number; // 0 = functional/instrumental, 1 = social/expressive
  discourseStructure: number; // 0 = structured, 1 = emergent
}

// Or with clearer variable names:
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  communicationFunction: number; // 0 = functional/referential, 1 = social/phatic
  conversationStructure: number; // 0 = structured/prescribed, 1 = emergent/exploratory
}
```

## UI Labels Recommendation

**Display in UI:**
- **X-Axis**: "FUNCTIONAL ↔ SOCIAL" (a.k.a. instrumental/expressive) or "TASK ↔ RELATIONAL"
- **Z-Axis**: "STRUCTURED ↔ EMERGENT" or "PRESCRIBED ↔ EXPLORATORY"

**Metric Labels:**
- Instead of "MODALITY" (for X-axis): "COMMUNICATION FUNCTION"
- Instead of "EMERGENCE FACTOR" (for Z-axis): "DISCOURSE STRUCTURE"

## References

1. **Talcott Parsons** - *The Social System* (1951) - Instrumental/Expressive
2. **Roman Jakobson** - "Linguistics and Poetics" (1960) - Functions of language
3. **Harvey Sacks** - Conversation Analysis - Adjacency pairs, turn-taking
4. **Erving Goffman** - *Frame Analysis* (1974) - Frames, keying, footing
5. **John Searle** - Speech Act Theory - Illocutionary acts

