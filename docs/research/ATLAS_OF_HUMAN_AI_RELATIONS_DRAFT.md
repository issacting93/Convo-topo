# Atlas of Human-AI Relations: Pictorial Draft
## Conversational Topography as a Cognitive Mapping Tool

---

## 1. Abstract (150 words)

**Problem**: Contemporary conversational AI interfaces present dialogue as linear transcripts, poorly equipped to reveal patterns of relational positioning that unfold across turns. The most consequential shifts occur invisibly—not in what is said, but in how people position themselves relationally (delegating agency, seeking authority, building rapport).

**Approach**: We present an interactive system that represents human-LLM conversations as navigable 3D terrain. Three axes encode relational dynamics: X-axis (functional ↔ social orientation), Y-axis (structured ↔ emergent role-taking), and Z-axis (affective intensity via PAD model). This spatial encoding reveals patterns invisible in transcripts: frustration peaks preceding role inversions, affiliation valleys marking smooth coordination, and spatial clustering of interaction types.

**Contribution**: Methodologically, we offer a reusable approach to staging encounters with relational patterns. Substantively, we demonstrate how conversational AI mediates relations beyond dyadic exchanges. Theoretically, we reframe interactivity as relational positioning and affective intensity rather than input-output cycles.

**Implications**: The terrain metaphor provides a cognitive tool for understanding how authority, agency, and emotional engagement are distributed through interactional positioning—revealing sociotechnical, cultural, and political dimensions of AI-mediated communication.

---

## 2. A Shift in Metaphor: Beyond Anthropomorphism

### 2.1 The Problem with Current Metaphors

Contemporary conversational AI interfaces rely on metaphors that obscure relational dynamics:

- **Chat/Transcript Metaphor**: Treats conversation as linear exchange, hiding how positioning accumulates over time
- **Persona/Character Metaphor**: Encourages anthropomorphic thinking, attributing fixed identities to AI systems
- **Tool/Assistant Metaphor**: Frames AI as instrumental extension, missing how authority and agency are negotiated

These metaphors fail because they treat roles as **fixed properties** rather than **observable interactional configurations** that emerge through dialogue.

### 2.2 Drivers for Understanding Roles Beyond Anthropomorphism

**Theoretical Grounding**:

1. **Goffman's Footing** [Goffman, 1981]: Alignment, stance, and posture shift fluidly through interaction—roles are not fixed identities but dynamic positions taken up moment-to-moment.

2. **Relational Communication Theory** [Watzlawick et al., 1967]: Every message operates on two levels—content (what is said) and relationship (how participants position themselves). Traditional interfaces emphasize content, hiding relational dynamics.

3. **Role Theory** [Turner, 1962]: Distinguishes between **role-taking** (following scripts) and **role-making** (negotiating roles). AI-mediated communication involves both: users take roles (Seeker, Director) while also making roles (negotiating what the AI should be: Expert, Peer).

4. **Social Responses to Computers** [Reeves & Nass, 1996]: People automatically apply social rules to computational systems unconsciously. Anthropomorphic metaphors reinforce this, making it harder to notice how we actually position ourselves relationally.

### 2.3 The Terrain Metaphor as Alternative

**Why terrain works**:
- **Spatial encoding** makes accumulation visible (paths show trajectory over time)
- **Elevation encoding** makes affective intensity visible (peaks = frustration, valleys = affiliation)
- **Topographic structure** reveals patterns (clustering, drift, inversions)
- **Non-prescriptive** (doesn't label people or AI systems, shows observable structure)

**Key shift**: From "What roles are people playing?" → "What relational patterns are observable in the interaction structure?"

**Visual Support Needed**:
- Figure: Traditional chat interface (linear transcript) vs. terrain visualization
- Figure: Role distribution visualized probabilistically (e.g., "Seeker 60%, Director 40%") rather than fixed labels

---

## 3. Maps as Cognitive Tools: Adding New Dimensions

### 3.1 The Cognitive Power of Spatial Representations

Maps and spatial visualizations are powerful cognitive tools because they:
- **Reveal patterns** invisible in sequential formats (temporal accumulation becomes spatial distribution)
- **Support comparison** (multiple conversations visible simultaneously)
- **Enable exploration** (participants navigate and discover patterns)
- **Make abstraction concrete** (relational dynamics become visible paths, peaks, valleys)

### 3.2 Why Two Dimensions Aren't Enough

Prior work in visualizing conversation typically uses:
- **Sentiment over time** (1D: time → emotion)
- **Topic clustering** (2D: similarity space)
- **Interaction networks** (nodes and edges)

These approaches miss:
- **Relational positioning** (how authority and agency are distributed)
- **Affective dynamics** (how emotional intensity corresponds to structural changes)
- **Temporal accumulation** (how patterns build over conversation)

### 3.3 The Three-Dimensional Model

Our terrain model adds **three interconnected dimensions**:

**X-Axis: Functional ↔ Social** (0.0 - 1.0)
- Encodes **what conversation is oriented toward**
- Functional: Task completion, problem-solving
- Social: Relationship-building, emotional engagement
- **Derived from**: Human role distributions (Director/Challenger → functional; Sharer/Collaborator → social)

**Y-Axis: Structured ↔ Emergent** (0.0 - 1.0)
- Encodes **how interaction is organized**
- Structured: Following scripts, predictable patterns
- Emergent: Co-created, dynamically negotiated
- **Derived from**: AI role distributions (Expert/Advisor → structured; Facilitator/Peer → emergent)

**Z-Axis: Affective Intensity** (0.0 - 1.0)
- Encodes **emotional friction and affiliation**
- Calculated via PAD model: `(1 - pleasure) × 0.6 + arousal × 0.4`
- High intensity (peaks) = frustration, agitation
- Low intensity (valleys) = affiliation, smooth coordination

**Visual Support Needed**:
- Figure: Three-axis coordinate system with annotated examples
- Figure: How PAD scores map to terrain elevation (with example messages)

---

## 4. Specific Axes: PAD, Emergence, Function vs. Social

### 4.1 Z-Axis: Affective/Evaluative Lens (PAD Model)

**Why PAD**:
The Pleasure-Arousal-Dominance (PAD) model [Mehrabian & Russell, 1974] provides a three-dimensional framework for describing affective states. Unlike simple sentiment (positive/negative), PAD captures:
- **Pleasure**: Valence (satisfaction ↔ frustration)
- **Arousal**: Activation (calm ↔ agitated)
- **Dominance**: Control (passive ↔ in control)

**Calculation Process**:
1. **Base scores** from conversation-level classifications:
   - Pleasure: Emotional tone (playful, supportive → high; serious → low)
   - Arousal: Engagement style (questioning, exploring → high; reactive → low)
   - Dominance: Message structure (commands → high; questions → low)

2. **Message-level adjustments**:
   - Frustration markers ("wrong", "error", "failed") → lower pleasure, higher arousal
   - Satisfaction markers ("perfect", "thanks", "exactly") → higher pleasure, lower arousal
   - Urgency markers ("urgent", "asap", "help") → higher arousal

3. **Emotional Intensity**: `(1 - pleasure) × 0.6 + arousal × 0.4`
   - **Peaks** (high intensity): Frustration, agitation (low pleasure + high arousal)
   - **Valleys** (low intensity): Affiliation, satisfaction (high pleasure + low arousal)

**What PAD Reveals**:
- **Friction points**: Peaks mark moments where user frustration is high, often preceding structural changes
- **Affiliation moments**: Valleys mark smooth coordination and explicit endorsement of AI's perspective
- **Persona framing signals**: High intensity despite low utility signals emotional over-reliance

**Visual Support Needed**:
- Figure: PAD calculation flow (base → adjustments → intensity)
- Figure: Example conversation with PAD values annotated on timeline
- Figure: Terrain showing peaks (frustration) and valleys (affiliation) with corresponding messages

### 4.2 Y-Axis: Structured ↔ Emergent

**Definition**:
- **Structured (0.0-0.4)**: Interactions follow recognizable scripts, externally defined frames
- **Emergent (0.6-1.0)**: Interactions are dynamically negotiated and co-authored in situ

**Theoretical Basis**:
- **Role-taking vs. Role-making** [Turner, 1962]: Structured interactions involve role-taking (following scripts); emergent interactions involve role-making (negotiating roles)
- **Goffman's Footing**: Emergent interactions show constant, fluid changes in alignment and stance

**Positioning Logic**:
- **AI Role Distributions** (primary method):
  - Expert (0.3), Advisor (0.2) → Structured (prescriptive, authoritative)
  - Facilitator (0.7), Peer (0.8) → Emergent (exploratory, collaborative)
  - Reflector (0.6) → Somewhat emergent (validates, invites elaboration)

- **Fallback**: Interaction pattern classifications (question-answer → structured; collaborative/casual-chat → emergent)

**What Emergence Reveals**:
- **Control distribution**: Structured = clear authority; Emergent = negotiated authority
- **Interactional flexibility**: Emergent interactions allow for role negotiation and re-definition
- **AI agency**: Emergent side shows AI functioning as active agent rather than passive tool

**Visual Support Needed**:
- Figure: Y-axis mapping with role examples
- Figure: Structured conversation (question-answer pattern) vs. Emergent conversation (collaborative exploration)

### 4.3 X-Axis: Functional ↔ Social

**Definition**:
- **Functional (0.0-0.4)**: Task-oriented, instrumental exchanges (queries answered, code generated)
- **Social (0.6-1.0)**: Relationship-focused, expressive exchanges (rapport, playfulness, emotional engagement)

**Theoretical Basis**:
- **Watzlawick's Axiom**: Every message conveys content AND defines relationship
- **Fiske's Social Relations** [Fiske, 1992]: Functional ≈ Market Pricing (transactional); Social ≈ Communal Sharing/Equality Matching (socially embedded)

**Positioning Logic**:
- **Human Role Distributions** (primary method):
  - Director (0.2), Challenger (0.3) → Functional (authoritative, task-focused)
  - Sharer (0.8), Collaborator (0.7) → Social (relational, expressive)
  - Seeker (0.4), Learner (0.5) → Intermediate (can be either)

- **Fallback**: Conversation purpose (entertainment, relationship-building → social; information-seeking, problem-solving → functional)

**What Function vs. Social Reveals**:
- **Interactional orientation**: What the conversation is "about" (task completion vs. relationship)
- **Authority distribution**: Functional side often shows clearer authority structures
- **Relational drift**: Conversations may drift from functional to social (or vice versa) over time

**Visual Support Needed**:
- Figure: X-axis mapping with role examples
- Figure: Functional conversation (technical Q&A) vs. Social conversation (personal sharing)
- Figure: Conversation showing drift from functional to social over time

**Visual Support Needed**:
- Figure: All three axes together with annotated example conversation
- Figure: How the three axes work together to reveal relational patterns

---

## 5. Trends and Pathways

### 5.1 The "Revealing" Pattern: Trajectory Over Time

**Finding**: Early messages set trajectory; late messages clarify destination.

**Observation**:
- Path points drift toward target positions based on role distributions
- Drift increases over time: `drift = (target - start) × 1.2 × (0.10 + progress × 0.30)`
- Early messages (10% drift) establish direction
- Late messages (40% drift) clarify final position

**Why This Matters**:
- Makes visible how relational configurations **accumulate** over time
- Shows that initial positioning influences subsequent interaction
- Reveals that final position (where conversation "ends up") is shaped by cumulative drift

**Visual Support Needed**:
- Figure: Conversation path showing drift over time with annotations
- Figure: Multiple conversations showing different drift patterns

### 5.2 Role Inversion Signature

**Pattern**: User shifts from unknowing position (Seeker) to authoritative position (Director/Challenger) when AI fails.

**Visual Signature**:
- **Spatial shift**: Path drifts toward Functional (X-axis) as user takes control
- **Elevation change**: Z-axis peaks increase as frustration builds
- **Temporal correlation**: Frustration peaks precede role inversion

**Example**: Technical conversation where AI repeatedly fails (e.g., "no entiendo" responses)
- Initial: User as Seeker (40%), AI as Expert
- After failure: User as Director (60%), AI role breakdown (uniform distribution)
- Emotional trajectory: Intensity increases (0.5 → 0.8) as role inversion occurs

**Significance**:
- Reveals how **control challenges** trigger structural changes
- Shows how emotional friction (PAD) corresponds to relational positioning shifts
- Makes visible the moment when user reclaims definitional authority

**Visual Support Needed**:
- Figure: Role inversion conversation with annotated path showing spatial and elevation changes
- Figure: Role distribution timeline showing shift from Seeker to Director

### 5.3 Affiliation Valleys

**Pattern**: Low emotional intensity (EI < 0.3) creates terrain valleys.

**Characteristics**:
- High pleasure + low arousal = affiliation (smooth coordination)
- Explicit endorsement of AI's perspective ("That's exactly right", "Perfect!")
- Different from alignment (structural cooperation without emotional endorsement)

**Visual Signature**:
- Depressed regions (valleys) in topography
- Low elevation markers (Z < 0.3)
- Smooth path through valley regions

**Significance**:
- Reveals moments of **harmonious coordination**
- Shows when user explicitly endorses AI's contribution
- Makes visible affiliation as distinct from mere structural alignment

**Visual Support Needed**:
- Figure: Conversation showing affiliation valleys with annotated messages
- Figure: Comparison of alignment vs. affiliation moments

### 5.4 Spatial Clustering by Pattern Type

**Finding**: Different interaction patterns cluster in different regions of the terrain.

**Observations**:
- **Technical conversations**: Functional side (X: 0.1-0.3), variable Y, frequent peaks
- **Question-Answer**: Balanced functional/social, structured (Y: 0.2-0.3), moderate intensity
- **Creative/Collaborative**: More social (X: 0.5-0.7), emergent (Y: 0.7-0.9), lower intensity (valleys)
- **Casual-chat**: Social (X: 0.7-0.9), balanced Y, very low intensity (flat terrain)

**Significance**:
- Reveals how **conversation type** maps to relational positioning
- Shows that similar interaction patterns occupy similar regions
- Enables **comparison** across conversations (clustering = similar patterns)

**Visual Support Needed**:
- Figure: Scatter plot of all conversations in X/Y space colored by pattern type
- Figure: Terrain showing different regions with pattern type labels

### 5.5 Conversation Length and Pattern Visibility

**Finding**: Longer conversations show clearer patterns.

**Observations**:
- **Short (10 messages)**: Patterns beginning to emerge, some drift visible
- **Medium (14-18 messages)**: Clearer trajectory, multiple peaks/valleys, role inversions visible
- **Long (30+ messages)**: Full "revealing" pattern, destination positions clear, accumulation visible

**Implications**:
- **Minimum conversation length** needed to see relational patterns: ~15-20 messages
- **Temporal dimension** is crucial—patterns accumulate over time
- Short conversations may not reveal full relational trajectory

**Visual Support Needed**:
- Figure: Comparison of short vs. long conversations showing pattern visibility
- Figure: Accumulation pattern showing how drift increases with conversation length

---

## 6. Patterns

### 6.1 Frustration Peak Pattern

**Pattern**: Technical conversations with AI failures show consistent high emotional intensity.

**Characteristics**:
- Low pleasure (0.2), high arousal (0.8) → high intensity (0.8)
- Creates sharp peaks in terrain
- Frustration accumulates across turns (not just isolated moments)

**Terrain Signature**:
- Elevation spikes (Z > 0.7)
- Persistent peaks (multiple high-intensity messages)
- Often accompanied by X-axis drift toward Functional

**Significance**:
- Makes visible how frustration **builds** across interaction
- Shows that frustration is not isolated but accumulates
- Reveals correlation between AI failure and emotional intensity

**Visual Support Needed**:
- Figure: Frustration peak conversation with terrain showing elevation spikes
- Figure: PAD timeline showing pleasure/arousal/intensity over conversation

### 6.2 Persona Framing Signal

**Pattern**: Emotional intensity decoupled from utility signals over-reliance.

**Characteristics**:
- Utility: Low (AI failing to provide useful answers)
- Affect: High (EI ≈ 0.8-0.9) - remains high despite failure
- Terrain: Mountainous despite low utility

**Significance**:
- **Ethical transition point**: Emotional over-reliance on AI even when not helpful
- Signals shift from "Tool" framing to "Persona" framing
- Reveals when user investment in AI relationship exceeds practical value

**Visual Support Needed**:
- Figure: Persona framing conversation showing high intensity despite low utility
- Figure: Comparison of Tool framing (low intensity, high utility) vs. Persona framing (high intensity, low utility)

### 6.3 Most Common Role Combinations

**From dataset analysis** (63+ conversations):

**Frequent Patterns**:
- **Seeker + Expert** (most common): Information-seeking, neutral tone, structured Q&A
- **Seeker + Advisor**: Advisory conversations, empathetic/supportive tone
- **Seeker + Peer**: Casual-chat, playful, emergent exploration
- **Director + Expert**: Technical or creative work, user-directed, functional
- **Director + Affiliative**: Creative work, playful, social

**Significance**:
- Reveals **common interactional configurations**
- Shows that certain role combinations are more prevalent
- Suggests patterns in how people position themselves with AI

**Visual Support Needed**:
- Figure: Role combination frequency chart
- Figure: Example conversations for each common role combination

### 6.4 Accumulation and Persistence

**Pattern**: Relational configurations accumulate and persist across turns.

**Observation**:
- Role distributions stabilize over time
- Path position reflects cumulative role positioning
- Patterns become more visible as conversation progresses

**Significance**:
- Shows that relational positioning is not moment-to-moment but **builds over time**
- Reveals how initial positioning influences subsequent interaction
- Makes visible the **temporal dimension** of relational dynamics

**Visual Support Needed**:
- Figure: Role distribution stability over conversation length
- Figure: Path showing accumulation pattern

---

## 7. Limitations and Failures

### 7.1 Classification Uncertainty

**Limitation**: Role distributions and classifications are probabilistic, not certain.

**Challenges**:
- LLM-based classification introduces uncertainty
- Different classifiers may produce different results
- Confidence scores vary across conversations

**Mitigation Strategies**:
- **Display confidence scores** throughout interface
- **Show probabilistic distributions** rather than fixed labels
- **Emphasize interpretive status** (this is one way of reading the conversation)

**Reflection**:
- Uncertainty is not a bug but a feature—it foregrounds the interpretive nature of classification
- Multiple readings are possible and valuable
- System makes uncertainty visible rather than hiding it

### 7.2 Short Conversation Limitations

**Limitation**: Patterns are less visible in short conversations (<15 messages).

**Observation**:
- Relational drift requires time to accumulate
- Role inversions may not occur in very short exchanges
- Full trajectory is only visible in longer conversations

**Implications**:
- Minimum conversation length for pattern visibility: ~15-20 messages
- System may not reveal patterns in brief interactions
- Dataset bias toward longer conversations

**Future Work**:
- Explore pattern detection in shorter conversations
- Develop methods for making micro-patterns visible
- Consider conversation length as a design parameter

### 7.3 PAD Calculation Challenges

**Limitation**: PAD scores rely on pattern matching and classification, not direct measurement.

**Challenges**:
- Rule-based pattern matching may miss nuanced emotional states
- LLM-based PAD generation requires API access
- PAD scores are inferred, not measured

**Mitigation**:
- **Hybrid approach**: Base scores from classification + message-level adjustments
- **Transparency**: Show how PAD is calculated
- **Fallback**: Rule-based generation available offline

**Reflection**:
- PAD scores are interpretive, not objective measurements
- Multiple calculation methods are possible
- System foregrounds uncertainty in affective encoding

### 7.4 Cultural and Language Limitations

**Limitation**: System optimized for English conversations, may not generalize.

**Challenges**:
- Classification prompts are English-language
- Cultural norms around roles and positioning may differ
- PAD pattern matching is language-specific

**Implications**:
- System may miss patterns in non-English conversations
- Cultural assumptions embedded in role definitions
- Need for multilingual and multicultural validation

**Future Work**:
- Multilingual classification support
- Cross-cultural validation of role taxonomy
- Adaptation of PAD calculation for different languages

### 7.5 What Patterns We Miss

**Limitation**: Some relational patterns may not be visible in current encoding.

**Potential Blind Spots**:
- **Multimodal cues**: Non-verbal communication (tone, timing) not captured
- **Context**: Broader context (platform, relationship history) not encoded
- **Group dynamics**: Conversations with multiple participants
- **Power structures**: External power relations (hierarchical, institutional) not visible

**Reflection**:
- System makes visible **some** patterns but not all
- Design decision to focus on observable structure rather than inferred context
- Multiple visualization methods needed to capture full complexity

### 7.6 Reification Risks

**Limitation**: Visualization may be interpreted as "truth" rather than interpretation.

**Challenges**:
- Spatial encoding can feel authoritative
- Terrain metaphor may suggest objective reality
- Participants may over-trust visualization

**Mitigation**:
- **Explicit framing**: System described as "analytic artifact" not "diagnostic tool"
- **Probabilistic displays**: Emphasize uncertainty and alternative readings
- **Reflective prompts**: Invite questions rather than provide answers
- **Non-diagnostic language**: Avoid labeling users or judging interactions

**Reflection**:
- Tension between making patterns visible and avoiding reification
- Design must balance legibility with interpretive openness
- Critical design stance is essential

---

## 8. Possible Next Steps

### 8.1 Methodological Extensions

**Multi-Conversation Visualization**:
- Compare multiple conversations simultaneously
- Identify cross-conversation patterns
- Visualize relationship evolution over multiple sessions

**Temporal Lens**:
- Track conversation changes over time (same user-AI pair)
- Reveal relationship development
- Show how patterns persist or shift across sessions

**Comparative Analysis**:
- Compare different AI systems (different models, different interfaces)
- Identify system-specific patterns
- Reveal how technical affordances shape relational positioning

### 8.2 Theoretical Extensions

**Beyond Dyadic Relations**:
- Group conversations (multiple humans, multiple AIs)
- Institutional contexts (how organizational power structures shape interaction)
- Platform analysis (how interface design influences positioning)

**Cross-Cultural Validation**:
- Test role taxonomy across cultures
- Validate PAD encoding in different languages
- Identify cultural variations in relational positioning

**Longitudinal Studies**:
- Track conversations over weeks/months
- Reveal relationship development patterns
- Identify long-term accumulation effects

### 8.3 Technical Extensions

**Real-Time Visualization**:
- Live conversation visualization
- Real-time pattern detection
- Interactive feedback during conversation

**Multimodal Encoding**:
- Incorporate tone, timing, formatting
- Visual representation of message structure
- Capture non-verbal cues (where available)

**Advanced Pattern Detection**:
- Machine learning for pattern identification
- Automated anomaly detection
- Predictive modeling of relationship trajectories

### 8.4 Application Domains

**Educational Settings**:
- Visualize student-AI tutor interactions
- Reveal learning relationship patterns
- Support pedagogical reflection

**Therapeutic Contexts**:
- Analyze patient-AI therapist interactions (research only)
- Identify therapeutic alliance patterns
- Support clinical supervision

**Workplace Analysis**:
- Visualize worker-AI assistant interactions
- Reveal power dynamics in AI-mediated work
- Support organizational reflection on AI integration

### 8.5 Critical Extensions

**Ethical Visualization**:
- Making visible power asymmetries
- Revealing surveillance and control mechanisms
- Supporting resistance and agency

**Participatory Design**:
- Co-design visualizations with users
- Incorporate user interpretations
- Support community-led pattern discovery

**Reflective Practice**:
- Tools for self-reflection on AI relationships
- Support for critical awareness
- Facilitation of collective discussion

---

## Additional Sections to Consider for DIS Submission

### A. Related Work Section

**Why needed**: Pictorials benefit from situating work within existing research traditions.

**Content**:
- **Relational communication theory**: Watzlawick, Goffman, Turner
- **Social responses to computers**: Reeves & Nass
- **Critical data visualization**: Drucker, critical visualization work
- **Affective computing**: PAD model, emotion visualization
- **AI-mediated communication**: Recent HCI work on AI relationships
- **Reflective and critical design**: Dunne & Raby

**Visual Support**:
- Figure: Related work landscape showing position of this work

### B. Method Section

**Why needed**: Pictorials should clearly explain methodology.

**Content**:
- **Classification process**: How conversations are analyzed
- **Terrain generation**: Procedural generation approach
- **Path positioning**: Drift calculation and target positioning
- **PAD calculation**: Step-by-step process
- **Dataset**: Conversation sources and characteristics

**Visual Support**:
- Figure: Method pipeline (conversation → classification → terrain → visualization)
- Figure: Technical architecture diagram

### C. Example Conversations (Detailed)

**Why needed**: Pictorials rely heavily on annotated examples.

**Content**:
- **3-5 detailed examples** with full annotations:
  - Frustration peak conversation (role inversion)
  - Affiliation valley conversation (smooth coordination)
  - Emergent conversation (collaborative exploration)
  - Structured conversation (Q&A pattern)
  - Long conversation (full accumulation pattern)

**Visual Support**:
- Full-page annotated terrain visualizations
- Message-by-message annotations
- PAD timeline annotations
- Role distribution timeline

### D. Design Implications

**Why needed**: Pictorials should connect findings to design practice.

**Content**:
- **For interface design**: How to make relational dynamics visible
- **For AI system design**: Implications for how AI systems should position themselves
- **For user experience**: How users can become aware of relational patterns
- **For research**: Methodological contributions for HCI research

**Visual Support**:
- Figure: Design implications for different stakeholders
- Figure: Example interface designs incorporating insights

### E. Discussion: What Becomes Visible vs. What Gets Hidden

**Why needed**: Critical reflection strengthens pictorials.

**Content**:
- **What becomes visible**: Relational drift, affective patterns, role distributions, spatial clustering
- **What gets hidden**: Multimodal cues, broader context, group dynamics, external power structures
- **Trade-offs**: Design decisions about what to encode
- **Reification risks**: How to avoid treating visualization as truth

**Visual Support**:
- Figure: Visibility vs. invisibility mapping
- Figure: Design decision trade-offs

### F. Acknowledgments and Ethics

**Why needed**: Standard for academic submissions.

**Content**:
- **Data sources**: Chatbot Arena, OpenAssistant, etc.
- **Ethical considerations**: Privacy, consent, interpretive framing
- **Limitations**: What the system should and shouldn't be used for

---

## Recommended Structure for DIS Pictorial Submission (12 pages max)

### Page Layout Strategy:

1. **Page 1**: Title, Abstract, Authors
2. **Pages 2-3**: Introduction & Problem (Section 1 + 2.1-2.2)
3. **Pages 3-4**: Theoretical Foundation (Section 2.3 + 3)
4. **Pages 4-6**: Three Axes (Section 4) - **KEY VISUAL PAGES**
5. **Pages 6-7**: Trends and Pathways (Section 5) - **ANNOTATED EXAMPLES**
6. **Pages 7-8**: Patterns (Section 6) - **ANNOTATED EXAMPLES**
7. **Page 8-9**: Limitations (Section 7)
8. **Page 9**: Design Implications (New Section D)
9. **Page 10**: Next Steps (Section 8)
10. **Page 11**: Discussion (New Section E)
11. **Page 12**: References, Acknowledgments

### Visual Emphasis:

- **50% of pages should be visual** (figures, annotated examples, diagrams)
- **Every major claim should have visual support**
- **Use full-page spreads** for key examples
- **Annotate heavily** - show, don't just tell

---

## Key Visuals Needed

### High Priority (Must Have):

1. **Three-axis coordinate system** with annotated example conversation
2. **PAD calculation flow** diagram
3. **Role inversion example** - full annotated terrain with message timeline
4. **Spatial clustering** - scatter plot of all conversations in X/Y space
5. **Comparison figure** - traditional transcript vs. terrain visualization
6. **Multiple example conversations** with different patterns annotated

### Medium Priority (Should Have):

7. **Drift pattern** showing accumulation over time
8. **Frustration peak** conversation with PAD timeline
9. **Affiliation valley** conversation annotated
10. **Role distribution** probabilistic display
11. **Method pipeline** diagram
12. **Design implications** visualizations

### Nice to Have:

13. **Cross-conversation comparison**
14. **Longitudinal patterns**
15. **Cultural variations**
16. **Interface mockups** showing design implications

---

## Writing Style Notes for Pictorial

- **Visual-first**: Write to support visuals, not the other way around
- **Dense but clear**: Pictorials can have more text than typical papers, but must be scannable
- **Annotate heavily**: Every figure should have extensive annotations
- **Show progression**: Build understanding through sequential figures
- **Use callouts**: Highlight key insights in visual callouts
- **Balance theory and examples**: Theoretical claims must be grounded in visual examples

---

## Questions to Address in Each Section

1. **What does this reveal?** (What patterns become visible?)
2. **Why does it matter?** (Theoretical or practical significance)
3. **How do we know?** (Evidence from examples/data)
4. **What are the limits?** (What doesn't this capture?)
5. **What's next?** (Future directions)

---

**Next Steps for Writing**:
1. Select 5-7 key example conversations for detailed annotation
2. Create annotated terrain visualizations for each example
3. Develop coordinate system and PAD flow diagrams
4. Write section-by-section, ensuring each has visual support
5. Iterate based on visual-first approach (revise text to support figures)

