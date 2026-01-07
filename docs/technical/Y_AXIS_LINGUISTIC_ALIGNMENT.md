# Y-Axis Implementation: Linguistic Alignment

## Overview

The Y-axis in Conversational Cartography represents **Linguistic Alignment** between human and AI participants, grounded in **Communication Accommodation Theory (CAT)** [Giles, 1973].

**Y-Axis Range**: 0 (Aligned/Convergent) ↔ 1 (Divergent)

- **0.0-0.4**: Aligned — Human linguistic markers match LLM markers (convergence)
- **0.4-0.6**: Neutral — Mixed or balanced linguistic features
- **0.6-1.0**: Divergent — Human linguistic markers differ from LLM markers (divergence)

## Theoretical Framework

### Communication Accommodation Theory (CAT)

CAT posits that speakers adjust their communication style in response to their conversational partners:

- **Convergence**: Adapting one's speech style to become more similar to the interlocutor
  - Signals rapport, affiliation, desire for social approval
  - In human-AI context: user adopting AI's formal/structured style
  
- **Divergence**: Maintaining or emphasizing differences in speech style
  - Signals distinctiveness, autonomy, or resistance
  - In human-AI context: user maintaining casual style despite AI formality

### Application to Human-AI Interaction

Recent research (AAAI 2024) demonstrates that:
- LLMs adapt to users' cultural backgrounds and communication styles
- Users adjust their communication during conversations with AI
- This bidirectional accommodation creates measurable linguistic patterns

**Key Insight**: Alignment is not inherently "good" or "bad"—it reveals relational positioning. High alignment may indicate trust/rapport OR uncritical acceptance. High divergence may indicate autonomy OR friction.

## Implementation

### Feature Extraction (`extractLinguisticFeatures`)

We extract **7 linguistic dimensions** from messages:

| Dimension | Range | Low (0) | High (1) |
|-----------|-------|---------|----------|
| **Formality** | 0-1 | Informal (contractions, slang) | Formal (academic, technical) |
| **Politeness** | 0-1 | Direct, unadorned | Extensive politeness markers |
| **Certainty** | 0-1 | Hedging, uncertainty | Definitive, assertive |
| **Structure** | 0-1 | Loose, conversational | Organized, numbered lists |
| **Question-Asking** | 0-1 | Declarative | Interrogative |
| **Inclusive Language** | 0-1 | Individual pronouns | Collective pronouns (we, us) |
| **Register** | 0-1 | Casual | Professional/Academic |

### Linguistic Markers

**Formality Markers**:
- Formal: "thus", "therefore", "furthermore", "utilize", "facilitate"
- Informal: "yeah", "gonna", "kinda", "cool", "lol", contractions

**Politeness Markers**:
- "please", "thank you", "would you", "could you", "I apologize"

**Certainty Markers**:
- Uncertain: "maybe", "perhaps", "I think", "I'm not sure"
- Certain: "definitely", "clearly", "must", "always", "never"

**Structure Markers**:
- "first", "second", "in conclusion", numbered lists, bullet points

**Inclusive Language**:
- "we", "let's", "our", "together", "collaboratively"

### Alignment Calculation (`calculateConversationAlignment`)

**Algorithm**:

1. **Separate messages** by role:
   - Human messages: `role === 'user'`
   - LLM messages: `role === 'assistant'`

2. **Extract features** for each group:
   - `humanFeatures = extractLinguisticFeatures(humanMessages)`
   - `llmFeatures = extractLinguisticFeatures(llmMessages)`

3. **Calculate cosine similarity** across 7 dimensions:
   ```
   similarity = dotProduct(humanFeatures, llmFeatures) / 
                (magnitude(humanFeatures) × magnitude(llmFeatures))
   ```

4. **Convert to alignment score**:
   ```
   alignmentScore = 1 - similarity
   ```
   - High similarity → Low alignment score (0, aligned)
   - Low similarity → High alignment score (1, divergent)

### Per-Message Alignment (`calculateMessageAlignmentScores`)

For path generation, we calculate alignment **cumulatively**:
- Message 1: Default 0.5 (neutral)
- Message 2: Alignment of messages 1-2
- Message 3: Alignment of messages 1-3
- ...
- Message N: Alignment of entire conversation

This reveals **alignment drift** over time.

## Integration with Atlas Framework

### Mapping to Atlas Zones

The Y-axis (Alignment) combines with X-axis (Function) and Z-axis (Intensity) to position conversations in relational zones:

| Zone | X (Function) | Y (Alignment) | Z (Intensity) |
|------|--------------|---------------|---------------|
| **Tool Basin** | Functional | Aligned | Low-Moderate |
| **Tutor Plateau** | Functional | Aligned | Moderate |
| **Collaborator Ridge** | Balanced | Divergent | Moderate |
| **Companion Delta** | Social | Divergent | Variable |
| **Evaluator Heights** | Functional | Aligned | High |

**Interpretation**:
- **Aligned + Functional** = Tool-like interaction (user adopts AI's style for task completion)
- **Divergent + Social** = Companion-like interaction (user maintains distinct voice)
- **Aligned + High Intensity** = Evaluative interaction (convergence under scrutiny)

### Relational Dynamics

**Drift Patterns**:
- **Convergence drift** (1.0 → 0.0): User gradually adopts AI's linguistic style
- **Divergence drift** (0.0 → 1.0): User increasingly maintains distinct style
- **Oscillation**: Rapid switching between alignment and divergence

**What Alignment Reveals**:
- **High alignment** may indicate:
  - Trust and rapport
  - Uncritical acceptance
  - Task-focused efficiency
  - Power asymmetry (user deferring to AI's style)

- **High divergence** may indicate:
  - Autonomy and critical stance
  - Relational friction
  - Maintaining human identity
  - Resistance to AI influence

## Example Scenarios

### Scenario 1: Tool Basin (Aligned, Functional)

**Human**: "Please write a function that sorts an array."
**AI**: "Certainly. Here is a function that sorts an array using the quicksort algorithm."

**Analysis**:
- Both use formal register
- Both use structured, technical language
- High alignment (low Y-axis value)
- Functional orientation (low X-axis value)
- **Position**: Tool Basin

### Scenario 2: Companion Delta (Divergent, Social)

**Human**: "ugh i'm so stressed about this deadline, like i can't even think straight rn"
**AI**: "I understand that deadlines can create significant pressure. Would you like to discuss strategies for managing your workload?"

**Analysis**:
- Human: informal, emotional, unstructured
- AI: formal, structured, professional
- High divergence (high Y-axis value)
- Social orientation (high X-axis value)
- **Position**: Companion Delta

### Scenario 3: Convergence Drift

**Turn 1**:
- Human: "hey can u help me with this?"
- AI: "Of course! I'd be happy to help. What do you need assistance with?"
- Alignment: 0.7 (divergent)

**Turn 5**:
- Human: "I would appreciate guidance on implementing this feature."
- AI: "Certainly. I recommend the following approach for implementing this feature."
- Alignment: 0.2 (aligned)

**Analysis**: User has converged toward AI's formal style over conversation

## Validation & Limitations

### Strengths

1. **Observable**: Based on actual text, not interpretation
2. **Reproducible**: Same text always produces same scores
3. **Theoretically grounded**: CAT is well-established in communication research
4. **Bidirectional**: Captures both human→AI and AI→human accommodation

### Limitations

1. **Language-specific**: Currently optimized for English
2. **Context-blind**: Doesn't account for topic-driven style shifts
3. **Marker-based**: May miss subtle stylistic differences
4. **No intent inference**: Measures behavior, not motivation

### Future Enhancements

1. **LIWC integration**: Use Linguistic Inquiry and Word Count categories
2. **Temporal weighting**: Recent messages weighted more heavily
3. **Topic normalization**: Control for domain-specific language
4. **Multilingual support**: Extend to non-English conversations

## References

- Giles, H. (1973). Accent mobility: A model and some data. *Anthropological Linguistics*, 15(2), 87-105.
- AAAI (2024). Communication Accommodation in Human-LLM Interaction.
- Ireland, M. E., et al. (2011). Language style matching in writing: synchrony in essays, correspondence, and poetry. *Journal of Personality and Social Psychology*, 101(3), 491.

## See Also

- [Atlas Framework](../research/ATLAS_FRAMEWORK.md)
- [Theoretical Framework](../research/THEORETICAL_FRAMEWORK.md)
- [X-Axis: Communication Function](X_AXIS_COMMUNICATION_FUNCTION.md)
- [Z-Axis: Emotional Intensity](Z_AXIS_EMOTIONAL_INTENSITY.md)
