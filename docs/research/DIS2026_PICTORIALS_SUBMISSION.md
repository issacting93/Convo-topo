# DIS 2026 Pictorials Submission Plan

**Deadlines:**
- **Title & Abstract:** January 9, 2026 (150 words)
- **Full Submission:** January 19, 2026 (12 pages max)
- **Acceptance Notification:** March 18, 2026
- **Camera-Ready:** April 8, 2026
- **Conference:** June 13-17, 2026, Singapore (in-person)

---

## The End-to-End Story: What, Why, and How

### What: The Problem We Encountered

Human-LLM conversations increasingly mediate work, learning, and emotional processing. Yet contemporary interfaces overwhelmingly present dialogue as **linear transcripts**—well suited for archival retrieval, but poorly equipped to reveal patterns of relational positioning that unfold across turns.

**The core insight**: The most consequential shifts in human-AI relationships occur invisibly—not in what is said, but in how people position themselves relationally. Users may not notice:
- The gradual emergence of dependence or authority delegation
- Habitual prompting styles that shape both what the system can do and what the user comes to expect
- The moment when frustration triggers a role inversion (user shifts from seeking help to correcting the AI)
- When smooth coordination shifts to affiliation (explicit endorsement of the AI's perspective)

These patterns are difficult to notice because social responses to computational systems arise automatically and often unconsciously [Reeves & Nass, 1996]. A linear transcript cannot reveal:
- How relational positioning accumulates across turns
- How emotional friction corresponds to structural changes
- How individual interactions participate in broader patterns of sociotechnical change

### Why: The Theoretical Foundation

We draw on relational communication theory and Goffman's concept of **footing** [Goffman, 1981] to treat conversation as social action rather than psychological expression. Every message operates on two levels: it conveys content and it defines a relationship [Watzlawick et al., 1967].

**Why visualization matters**: Patterns that remain invisible in linear transcripts become visible when encoded spatially. The terrain metaphor leverages familiar spatial affordances—paths, ridges, basins, and contours—to support human interpretation of relational dynamics. Similar to prior work in reflective and critical design [Dunne & Raby, 2001], the metaphor provokes sensemaking rather than claiming ontological truth.

**Why PAD model**: The Pleasure-Arousal-Dominance (PAD) model [Mehrabian & Russell, 1974] provides a three-dimensional framework for describing affective states. By encoding emotional intensity as terrain height, we make visible how emotional friction (high arousal + low pleasure = frustration peaks) and affiliation (low arousal + high pleasure = satisfaction valleys) correspond to relational positioning shifts.

**Why relational positioning**: By encoding how users position themselves functionally vs. socially (X-axis) and how interactions are structured vs. emergent (Y-axis), we reveal how authority, agency, and control are distributed through interactional positioning—not fixed in the human or the AI, but negotiated through the interaction itself.

### How: The Design and Implementation Process

#### Step 1: Coordinate System Design

We established a **stable coordinate frame** grounded in established theories:

- **X-axis (Functional ↔ Social)**: Derived from Watzlawick's axiom that every communication has both content and relationship aspects. Positioned using role distributions: Director and Challenger roles (authoritative, evaluative) map toward Functional; Sharer and Collaborator roles (social, relational) map toward Social.

- **Y-axis (Structured ↔ Emergent)**: Derived from Goffman's footing concept and role-theoretic distinctions [Turner, 1962]. Positioned using conversation structure classifications and AI role distributions, revealing whether interactions follow predictable patterns (structured) or involve dynamic role negotiation (emergent).

- **Z-axis (Emotional Intensity via PAD)**: Encodes moment-to-moment emotional intensity calculated as `(1 - pleasure) * 0.6 + arousal * 0.4`. Base scores derived from conversation-level classifications (emotional tone, engagement style), then adjusted based on message-level content analysis detecting frustration markers ("wrong", "error"), satisfaction markers ("perfect", "thanks"), and urgency markers ("urgent", "asap").

**Key design decision**: Z-height is **directly from PAD emotional intensity**, not an offset from terrain height. This makes each peak and valley correspond to a specific moment where the user's emotional response is particularly intense.

#### Step 2: Classification System

We developed a structured classification system using LLM-based analysis (Claude API via Anthropic) that outputs probability distributions over 9 dimensions:

1. Interaction Pattern (collaborative, storytelling, casual-chat, etc.)
2. Power Dynamics (authority and control distribution)
3. Emotional Tone (neutral, playful, serious, empathetic, supportive)
4. Engagement Style (reactive, exploring, questioning, affirming)
5. Knowledge Exchange (factual-info, opinion-exchange, etc.)
6. Conversation Purpose (primary goal or function)
7. Turn Taking (pattern of exchange structure)
8. Human Role Distribution (probabilistic: seeker, learner, director, collaborator, sharer, challenger)
9. AI Role Distribution (probabilistic: expert, advisor, facilitator, reflector, peer, affiliative)

**Key design decision**: Roles are treated as **probabilistic, observable interactional configurations** rather than fixed identities. The classifier outputs confidence scores, evidence quotes, and rationales—emphasizing the interpretive status of classifications.

#### Step 3: Terrain Generation

The terrain uses **procedural generation via Perlin noise** to create naturalistic elevation patterns. The heightmap serves as visual context backdrop, while marker Z-heights are calculated **directly from PAD emotional intensity** (not from terrain height). This ensures that peaks and valleys correspond to actual affective states rather than procedural variation.

**Key design decision**: Terrain provides visual context, but the meaningful data (marker heights) comes from PAD scores. This separates visual metaphor from data encoding.

#### Step 4: Path Positioning

Path points are positioned using role-based distributions when available, falling back to purpose-based classification. The path drifts across the terrain based on:
- Conversation-level target (where classification says it should go)
- Message-level drift (expressive/structured scores)
- Temporal progression (more drift as conversation progresses)

**Key design decision**: The coordinate frame remains stable—relational placement (X, Y) is consistent while emotional intensity (Z) varies per message. This allows participants to see how affective friction and affiliation correspond to relational positioning shifts.

#### Step 5: Interface Design

We designed the interface to be **exploratory, reflective, and critical**:

- **Grid view**: Participants first encounter terrain cards showing minimaps and elevation previews
- **3D terrain view**: Isometric-like perspective (30° elevation, 45° azimuth) for stable viewing
- **Interaction**: Drag to rotate, timeline scrubbing, point selection revealing PAD values and role distributions
- **HUD overlay**: Displays message content, classification dimensions, and PAD scores with visual progress bars
- **Contour lines**: Toggle-able to aid in reading elevation changes

**Key design decision**: The system emphasizes its interpretive status through probabilistic role distributions, confidence scores, and alternative readings—never claiming to show "truth" but rather "one way of reading the conversation's structure."

#### Step 6: Data Collection and Processing

We classified 63 conversations across multiple datasets:
- 8 conv-*.json: General conversation samples
- 7 sample-*.json: Curated examples covering various interaction patterns
- 28 emo-*.json: Emotion-focused dialogues
- 10 cornell-*.json: Cornell Movie Dialogs dataset
- 10 kaggle-emo-*.json: Kaggle Empathetic Dialogues dataset

PAD scores are stored in conversation data files (added via post-processing script using LLM-based analysis) and can also be calculated at runtime. The system uses manifest-based parallel loading for improved performance (approximately 2-3x faster than sequential loading).

**Key design decision**: All conversations are non-identifying and clearly labeled as examples. The system runs client-side by default; optional "bring your own conversation" mode requires explicit consent and discloses API usage.

### What We Learned: Patterns That Become Visible

The terrain visualization makes visible patterns that are difficult to notice in linear transcripts:

1. **Frustration peaks preceding role inversion**: A gradual rise in emotional intensity across multiple turns before the user explicitly takes control—visible as elevation changes but difficult to notice when reading sequentially.

2. **Affiliation valleys marking smooth coordination**: Moments where the user explicitly endorses the AI's perspective (not just accepting, but affirming quality)—visible as topographic valleys, subtle in transcripts.

3. **Spatial clustering revealing interactional patterns**: When viewing multiple conversations, spatial arrangements reveal systematic differences—technical support conversations cluster in functional/structured regions, with post-frustration drift toward emergent interaction.

4. **Emotional intensity decoupled from task utility**: Persistent peaks combined with social drift signal Persona Framing—high emotional investment that goes beyond task completion, difficult to identify in transcripts but visible as "mountainous social regions."

### Why It Matters: Critical Reflection

This work engages seriously with tensions and limitations:

- **What gets reified?** By encoding relational dynamics as spatial coordinates, we necessarily reify fluid interactions as fixed positions. The system addresses this by emphasizing its interpretive status, but the act of encoding creates categories that shape interpretation.

- **Surveillance implications**: Making relational dynamics visible enables monitoring. We designed for reflection, not surveillance (client-side, no storage by default), but the technology itself enables surveillance regardless of intent.

- **What's lost when dynamics become terrain?** Simplification involves loss: ambiguity, context-dependency, fluidity within single messages. This loss is necessary for making patterns visible—the question is whether what's gained outweighs what's lost.

- **The "interpretive, not diagnostic" hedge**: The system wants to avoid diagnostic problems while claiming value. The act of encoding is itself a claim—by choosing certain dimensions, we make implicit claims about what matters. The value is in staging encounters with patterns, not revealing truth.

- **The recursive problem**: We use AI (Claude API) to analyze AI-mediated conversations, creating a recursive loop. This recursion reveals not just relational dynamics but also the assumptions embedded in AI systems—assumptions that become visible when AI systems analyze their own interactions.

### How It Contributes: Methodological and Substantive

**Methodological contribution**: A way of staging encounters with relational ecosystems that typically remain invisible. The terrain metaphor leverages spatial reasoning to reveal relational dynamics that unfold across multiple turns—patterns that become clear when seen as a landscape but remain invisible when read sequentially.

**Substantive contribution**: Demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human-system exchange. By making visible how authority, agency, and emotional engagement are distributed through interactional positioning, the work reveals political and affective dimensions often hidden in technical systems.

**Theoretical contribution**: Reframes interactivity as relational positioning (X/Y axes) and affective intensity (Z-axis via PAD) rather than input-output. Treats conversation as entangled systems, observable structure, and moment-to-moment emotional responses rather than accumulated sentiment.

---

## Why Pictorials is Perfect for This Work

### Visual Components (Already Available)
1. **3D Terrain Renderings** - Multiple conversation terrains showing different patterns (frustration peaks, affiliation valleys, spatial clustering)
2. **Terrain Cards** - Grid view with minimaps and visual previews
3. **Coordinate System Diagrams** - X/Y/Z axis mappings with annotated examples
4. **Path Visualizations** - Conversation flow across terrain with PAD-based heights
5. **Classification Dimension Mappings** - Visual representation of 9 dimensions
6. **Role Distribution Charts** - Probabilistic role visualizations
7. **Before/After Comparisons** - Linear transcript vs. terrain visualization showing invisible patterns
8. **Screenshot Sequences** - User interaction flow through the interface

### Visual-First Narrative Opportunities
- **Terrain metaphor as visual argument** - Show, don't just tell how patterns become visible
- **Side-by-side comparisons** - Different conversation types, different emotional patterns
- **Annotated diagrams** - Coordinate system with example points, PAD formula visualization
- **Visual flow** - User journey from grid view → terrain exploration → pattern recognition
- **Critical visualizations** - Making the invisible visible through spatial encoding

---

## Submission Strategy

### Recommended: Adapt Interactivity Submission for Visual-First Narrative

The existing Interactivity submission provides strong content. Restructure it to be **visual-first**:

1. **Lead with visuals**: Each page dominated by images/diagrams
2. **Text supports visuals**: Minimal text, captions, annotations
3. **Show the story**: Before/after comparisons, pattern identification sequences
4. **Demonstrate the contribution**: Visual examples of patterns that become visible

This approach:
- Leverages existing theoretical and methodological work
- Shows the design process and implementation visually
- Demonstrates the contribution through concrete visual examples
- Fits the Pictorials format (visual contribution + research rigor)

---

## Visual Content Needed

### High Priority (Must Have)
1. **3D Terrain Screenshots** (4-5 variations)
   - Frustration peak example (Example 1 from paper)
   - Affiliation valley example (Example 2 from paper)
   - Spatial clustering view (Example 3 from paper)
   - Persona framing example (Example 4 from paper)

2. **Before/After Comparison**
   - Linear transcript excerpt
   - Corresponding terrain view with annotations
   - Arrow/callout showing pattern that becomes visible

3. **Coordinate System Diagram**
   - Large annotated 3D axis diagram
   - X/Y/Z labels with descriptions (Functional↔Social, Structured↔Emergent, PAD Intensity)
   - Example points plotted showing different conversation types
   - PAD formula visualization (how peaks and valleys are calculated)

4. **Path Visualization Sequence**
   - Conversation path across terrain
   - Marker annotations (user=purple-blue, assistant=orange)
   - Elevation changes with PAD values labeled
   - Timeline progression showing path appearance

5. **Terrain Card Grid View**
   - Full grid showing multiple conversations
   - Close-up of individual cards with minimap details
   - Visual preview of different terrain shapes

### Medium Priority (Should Have)
6. **Classification System Visualization**
   - Visual representation of 9 dimensions
   - Probabilistic role distributions (pie charts or bars)
   - Confidence scores displayed visually
   - Evidence quotes highlighted

7. **Interface Interaction Flow**
   - Grid view → card selection → terrain view
   - Hover/click interactions with annotations
   - Timeline scrubbing sequence
   - PAD display in HUD overlay

8. **Design Process Visuals**
   - Early sketches/iterations
   - Coordinate system evolution
   - Terrain generation process diagram

### Nice to Have
9. **Side-by-Side Conversation Comparisons**
   - Different conversation types in same view
   - Pattern identification annotations
   - Spatial clustering visualization

10. **PAD Calculation Flowchart**
    - Base scores from classification
    - Message-level adjustments
    - Formula application
    - Height calculation

---

## Pictorial Structure (12 Pages)

### Page 1: Title Page
- **Title:** "Conversational Topography: A Visual Interface for Seeing Relational Drift in Human-LLM Dialogue"
- **Abstract:** 150 words (see below)
- **Key Visual:** Hero image of terrain with path overlay, annotated showing PAD peaks and valleys

### Pages 2-3: The Problem (Visual)
- **Left page**: Large image of linear transcript with annotations highlighting invisible patterns
- **Right page**: Corresponding terrain visualization with callouts showing what becomes visible
- **Caption text**: "Patterns that remain invisible in transcripts (left) become visible as terrain features (right)"
- **Examples**: Frustration building across turns, affiliation moments, spatial patterns

### Pages 4-5: The Coordinate System (Visual)
- **Large annotated 3D diagram**: X/Y/Z axes with descriptions
  - X-axis: Functional ↔ Social (with role mapping examples)
  - Y-axis: Structured ↔ Emergent (with footing examples)
  - Z-axis: PAD Emotional Intensity (with formula: `(1 - pleasure) * 0.6 + arousal * 0.4`)
- **Plotted conversations**: Different conversation types shown as points in the space
- **PAD visualization**: Diagram showing how peaks (frustration) and valleys (affiliation) are calculated

### Pages 6-7: The Terrain Metaphor (Visual)
- **3D terrain renderings**: 3-4 different conversation types
  - High frustration conversation (mountainous with peaks)
  - Smooth coordination conversation (valleys)
  - Mixed pattern conversation (varied elevation)
- **Annotated overlays**: Callouts showing specific moments (e.g., "AI error here → peak", "User affirmation → valley")
- **Side-by-side**: Different emotional/relational patterns with path trajectories

### Pages 8-9: The Interface (Visual)
- **Full interface screenshots**: Grid view, terrain view with HUD overlay
- **Interaction sequences**: User exploration flow (grid → selection → terrain → pattern recognition)
- **Detail views**: 
  - Terrain card with minimap annotated
  - HUD showing PAD values with progress bars
  - Point selection revealing message content and role distributions
- **Timeline scrubbing**: Sequence showing path progression

### Pages 10-11: Patterns That Become Visible (Visual)
- **Four concrete examples from paper**:
  1. Frustration peaks preceding role inversion (with transcript + terrain comparison)
  2. Affiliation valleys marking smooth coordination (with annotation)
  3. Spatial clustering revealing interactional patterns (multiple conversations viewed together)
  4. Emotional intensity decoupled from task utility (Persona Framing signal)
- **Annotated terrain analyses**: Showing how patterns are identified visually
- **Critical reflection**: What becomes visible, what remains hidden

### Page 12: Implications & Conclusion
- **Visual summary**: Diagram of key contributions (methodological, substantive, theoretical)
- **Brief text**: Implications for HCI/design research, critical visualization, AI interaction
- **References**: Minimal, essential only (6-8 key references)

---

## Abstract (150 words - Updated)

**Conversational Cartography: Mapping Human-AI Interaction as Navigable Terrain**

Human-LLM conversations increasingly mediate work, learning, and emotional processing, yet contemporary interfaces present dialogue as linear transcripts—poorly equipped to reveal relational positioning patterns across turns. The most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally—delegating agency, seeking authority, building rapport. This pictorial presents Conversational Cartography, mapping 538 conversations as navigable terrain. The X-axis encodes functional versus social orientation; the Y-axis encodes aligned versus divergent structure; the Z-axis encodes emotional intensity via the Pleasure-Arousal-Dominance (PAD) model, revealing friction (peaks) and affiliation (valleys). We demonstrate how the terrain metaphor makes relational drift visible: interactions with identical role classifications take dramatically different affective trajectories (74.8x variance ratio), yet clustering identifies 7 relational positioning patterns with trajectory features driving 60.8% separation. Spatial analysis reveals 72% functional/structured patterns, expressive roles nearly absent (<3%). Contribution: using spatial affordances to reveal what relational possibilities are foreclosed.

---

## Key Differences from Interactivity Track

| Aspect | Interactivity | Pictorials |
|--------|--------------|------------|
| **Format** | Demo/installation | Visual paper (12 pages) |
| **Narrative** | Text-first, experiential | Visual-first, archival |
| **Archive** | Proceedings | ACM DL (archival) |
| **Focus** | Experience, interaction | Visual contribution, design process |
| **Review** | Demo quality, installation feasibility | Visual quality + research contribution |
| **Audience** | Conference attendees (hands-on) | Research community (archival reference) |

**They complement each other**: Pictorials documents the visual design and methodology; Interactivity lets people experience it hands-on.

---

## Visual Quality Requirements

From CFP: "Visual quality (image quality, layout, typography) high enough to convey the message"

### Image Requirements
- **High resolution:** 300 DPI minimum for print
- **Clear annotations:** Labels, arrows, callouts, highlights
- **Consistent style:** Color palette matching app, clear typography
- **Accessible:** Alt text, color contrast, clear labels

### Layout Requirements
- **Visual hierarchy:** Images lead, text supports (80/20 split)
- **Flow:** Narrative progression through images
- **White space:** Don't cram—let visuals breathe
- **Typography:** Clear, readable, intentional (supporting visuals, not competing)

### Using Templates
- **InDesign template:** Recommended for professional layout
- **Word/PowerPoint:** Alternatives if needed
- **Creative first page:** Can include visuals on title page (hero image)

---

## Review Criteria Alignment

Reviewers will ask:

- ✅ **Visual contribution?** YES - Terrain metaphor is novel visual language for relational dynamics
- ✅ **Visuals lead narrative?** YES - Can restructure to be visual-first with text supporting
- ✅ **High visual quality?** YES - With proper screenshots/renders at 300 DPI
- ✅ **Clear contribution?** YES - Making relational patterns visible, methodological approach
- ✅ **HCI implications?** YES - Critical visualization for AI interaction, design research methodology
- ✅ **Rigor?** YES - Grounded in established theory, systematic implementation, critical reflection

---

## Action Items

### Immediate (Before Jan 9)
- [x] Draft 150-word abstract (see above)
- [ ] Collect high-res screenshots/renders (300 DPI)
  - [ ] 3D terrain views (4-5 variations)
  - [ ] Grid view with cards
  - [ ] Interface screenshots with HUD
  - [ ] Before/after transcript comparisons
- [ ] Create annotated diagrams
  - [ ] Coordinate system diagram
  - [ ] PAD formula visualization
  - [ ] Path visualization sequence
- [ ] Submit title & abstract (NOI)

### Before Jan 19
- [ ] Restructure narrative for visual-first
  - [ ] Each page dominated by visuals
  - [ ] Minimal supporting text
  - [ ] Clear visual flow
- [ ] Create all diagrams/annotations
  - [ ] Annotate terrain screenshots
  - [ ] Add callouts and labels
  - [ ] Create comparison visuals
- [ ] Layout in InDesign template
  - [ ] Visual hierarchy (80/20 split)
  - [ ] White space management
  - [ ] Consistent typography
- [ ] Write minimal supporting text
  - [ ] Captions for each visual
  - [ ] Brief section introductions
  - [ ] Conclusion (1 page max)
- [ ] Ensure visual quality (300 DPI)
- [ ] Add alt text for accessibility
- [ ] Final review for visual flow
- [ ] Get feedback on visual clarity

### After Acceptance (if accepted)
- [ ] Address reviewer feedback
- [ ] Final visual polish
- [ ] Camera-ready version
- [ ] Prepare presentation (20 min)

---

## Resources

- **CFP:** https://dis.acm.org/2026/pictorials/
- **Templates:** Download from CFP page
- **Examples:** 
  - VOICON: Geometric Motion-Based Visual Feedback (DIS '24)
  - Transmediating Sky Blanket (DIS '23)
  - Tactful Feminist Sensing (DIS '23)
- **Existing Materials:**
  - Interactivity submission (base content, theoretical framing)
  - User Experience doc (interaction details)
  - Critical Computing doc (theoretical positioning)
  - Code implementation (visual examples)

---

## The Story Arc (For Visual Narrative)

1. **Problem**: Linear transcripts hide relational patterns (show transcript, highlight invisible patterns)
2. **Solution**: Terrain metaphor makes patterns visible (show terrain, annotate visible patterns)
3. **How**: Coordinate system design (show diagram, explain X/Y/Z)
4. **Implementation**: Classification + PAD calculation + terrain generation (show process, show results)
5. **What we see**: Concrete examples of patterns that become visible (show 4 examples from paper)
6. **Why it matters**: Critical reflection on legibility, surveillance, reification (visual summary of tensions)
7. **Contribution**: Methodological approach for staging encounters with invisible patterns (diagram of contributions)

This arc tells the complete story: **what** problem we're addressing, **why** it matters theoretically, and **how** we designed and implemented the solution.
