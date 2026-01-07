# Conversational Topography: A Terrain Interface for Seeing Relational Drift in Human–LLM Dialogue

**Author:** Zac Ting  
**Affiliation:** [Your Institution]  
**Email:** [your.email@institution.edu]

---

## Abstract

Human–LLM conversations increasingly mediate work, learning, and emotional processing, yet contemporary interfaces present dialogue as linear transcript—poorly equipped to reveal patterns of relational positioning that unfold across turns. The most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally—delegating agency, seeking authority, building rapport. These shifts are difficult to notice because social responses to computational systems arise automatically and often unconsciously [Reeves & Nass, 1996].

We present **Conversational Topography**, an interactive system that represents conversation as navigable 3D terrain. The X-axis encodes functional versus social orientation; the Y-axis encodes structured versus emergent role-taking; the Z-axis encodes affective/evaluative intensity using the Pleasure-Arousal-Dominance (PAD) model, revealing emotional friction and affiliation. Participants can filter conversations by role distributions, message count, epistemic issues, and failure modes; explore how interactional "modes" accumulate and drift over time through timeline animation; and examine how affective peaks (frustration) and valleys (affiliation) correspond to relational positioning shifts. Grounded in relational communication theory and Goffman's concept of footing, the system treats relational dynamics as observable structure rather than inferred psychology. The contribution is methodological: we offer a way of staging encounters with patterns that typically remain invisible, inviting reflection on what should—and should not—be made legible in AI-mediated relationships.

---

## 1. Introduction

As large language models become everyday companions in work, education, and personal life, the most significant transformations often occur not in explicit content but in how people position themselves relationally over time. Users may gradually delegate agency, seek authority, perform confidence, or build rapport—patterns that shape both what the system can do and what users come to expect, yet remain largely invisible in current interfaces.

Contemporary conversational AI interfaces overwhelmingly present dialogue as linear transcripts—well suited for archival retrieval but poorly equipped to reveal relational dynamics. Prior research on social responses to computers demonstrates that people routinely apply social rules—politeness, deference, authority attribution—to AI systems without conscious deliberation [Reeves & Nass, 1996]. As a result, users may not notice the gradual emergence of dependence, habitual prompting styles, or conversational "ruts" that accumulate through repeated interaction.

**Conversational Topography** proposes a different kind of interface: not a transcript viewer, not a scoring tool, and not a diagnostic classifier. Instead, it is an exploratory visualization that stages conversation as a terrain to traverse, where spatial placement encodes interactional configuration and topographic height encodes affective/evaluative intensity. Drawing on sociological and communicative theories that treat conversation as social action rather than psychological expression [Goffman, 1981], the goal is not to tell participants what a conversation "is," but to help them see the structure their interaction produces—and to provoke discussion about what we should (and should not) make legible in AI-mediated relationships.

The system responds to DIS 2026's call to investigate how artifacts and technologies mediate broader ecosystems of relations by making visible how conversational AI technologies participate in sociotechnical systems that extend far beyond dyadic human–system exchanges. Through the terrain metaphor, we reveal how relational positioning, affective states, and interactional patterns accumulate and transform over time, illuminating impacts across social, cultural, and political domains.

---

## 2. Related Work

Our work builds on several interconnected research traditions. **Relational communication theory** [Watzlawick et al., 1967] provides the foundational insight that every message operates on two levels: it conveys content and defines a relationship. **Social role theory** [Turner, 1962] distinguishes between role-taking (following scripts) and role-making (negotiating roles), informing our structured–emergent axis. **Goffman's concept of footing** [Goffman, 1981] offers a mechanism for understanding how alignment and stance shift fluidly through interaction, particularly relevant in AI-mediated communication where authority is distributed between human and system.

In **human–computer interaction**, research on social responses to computers [Reeves & Nass, 1996] demonstrates that people automatically apply social rules to computational systems, often unconsciously. This work motivates our focus on making visible patterns that users may not consciously notice. Recent work on **AI-mediated communication** explores how AI systems mediate relationships between humans, extending beyond simple human–system dyads [Hancock et al., 2020].

In **critical data visualization** [Drucker, 2014], scholars emphasize the interpretive status of visual encodings, foregrounding uncertainty and alternative readings. Our system embodies this critical approach by using probabilistic role distributions, confidence visualizations, and explicit non-diagnostic framing. **Reflective and critical design** [Dunne & Raby, 2001] provides a framework for using design artifacts to provoke sensemaking rather than claim ontological truth—an approach we adopt with the terrain metaphor.

**Affective computing** research has explored the PAD model [Mehrabian & Russell, 1974] for describing emotional states, though most applications focus on detection rather than visualization of affective patterns over time. Our work extends this by using PAD scores to encode terrain elevation, making temporal affective patterns visible through spatial metaphor.

---

## 3. The Terrain Metaphor

Conversational Topography is built around a simple metaphor: **a conversation is a landscape shaped by repeated patterns of positioning.**

This metaphor is not intended as a literal model of dialogue, but as a representational device that leverages familiar spatial affordances—paths, ridges, basins, and contours—to support human interpretation of accumulation and change. Similar to prior work in reflective and critical design [Dunne & Raby, 2001], the metaphor is used to provoke sensemaking rather than to claim ontological truth.

The terrain visualization makes visible how conversational AI technologies are embedded within larger relational systems. Each conversation terrain reveals:
- **Sociotechnical relations**: How technical affordances shape interactional possibilities
- **Cultural relations**: How communication norms and power dynamics are encoded
- **Temporal relations**: How relational configurations accumulate and transform over time

By making relational drift visible, the artifact illuminates how seemingly individual interactions participate in broader patterns of sociotechnical change.

### 3.1 Encounter Design

Participants first encounter a grid of terrain "cards" generated from pre-classified conversations. Each card provides rich preview information:
- **Minimap**: 2D projection showing the conversation path through relational space
- **Message count**: Total number of messages in the conversation
- **Dominant roles**: Probabilistic distributions for human and AI roles (e.g., "Seeker 60%, Director 40%")
- **PAD summary**: Average Pleasure, Arousal, and Emotional Intensity values
- **Classification dimensions**: Top 3 classification categories with confidence scores
- **XYZ coordinates**: Snapshot of conversation position in the coordinate frame

This enables quick comparison and selection. Cards can be filtered by:
- **Human role**: Director, Challenger, Seeker, Learner, Sharer, Collaborator
- **AI role**: Expert, Advisor, Facilitator, Reflector, Peer, Affiliative
- **Message count**: Short (<10), Medium (10-20), Long (>20)
- **Epistemic issues**: Has hallucination, has error, has repair, or no issues
- **Failure modes**: Has breakdown, has repair, or no breakdown

Selecting a card navigates to a dedicated route (`/terrain/:id`) displaying the 3D terrain with a path laid across it; each marker corresponds to a message (up to the first 30 messages are displayed by default, with support for longer conversations). Navigation uses React Router for seamless transitions between the grid view and individual terrain views.

Consistent with critical approaches to data visualization [Drucker, 2014], the system foregrounds the interpretive status of its encodings. It emphasizes uncertainty, mixed roles, and alternative readings rather than categorical declarations. The interactivity is designed to be:
- **Exploratory**: Inviting play and discovery rather than task completion
- **Reflective**: Surfacing ambiguity and interpretive tension
- **Critical**: Making visible the assumptions and consequences of representation

---

## 4. Coordinate System

Conversational Topography uses a stable coordinate frame so that relational placement remains consistent, allowing participants to explore how different assumptions reshape legibility without altering the underlying interactional sequence. The three-dimensional model integrates concepts from communication science, sociology, and computational linguistics, grounded in established theories of interaction structure and role negotiation.

### 4.1 X-Axis: Functional ↔ Social

Every message operates on two levels: it conveys content and it defines a relationship [Watzlawick et al., 1967]. The X-axis makes this distinction navigable. Toward the **Functional** pole, exchanges emphasize task completion—queries answered, code generated, information retrieved. Toward the **Social** pole, the relationship itself becomes salient: rapport, deference, playfulness, or friction. This corresponds roughly to Fiske's [1992] distinction between Market Pricing relations (instrumental, transactional) and Communal Sharing or Equality Matching relations (socially embedded).

The axis is descriptive, not evaluative. A conversation that stays functional is not impoverished; a conversation that drifts social is not off-task. The question is what patterns emerge and whether users notice them.

**Positioning along the X-axis** is derived from role distributions—specifically, how the human participant positions themselves:
- **Director** and **Challenger** roles (authoritative, evaluative) map toward the Functional end
- **Sharer** and **Collaborator** roles (social, relational) map toward the Social end
- **Seeker** and **Learner** roles (dependent, inquirer) map to intermediate positions

This encoding reveals how relational positioning is distributed through interactional configurations rather than being fixed in either party.

### 4.2 Y-Axis: Structured ↔ Emergent

This axis maps the contrast between interactions governed by fixed rules, roles, or protocols (structured) and interactions that are dynamically co-created, allowing for negotiation and re-definition of roles (emergent). The axis draws directly on role-theoretic distinctions [Turner, 1962], treating emergence as the result of role-making (negotiating and co-authoring) rather than merely role-taking (following recognizable scripts).

Goffman's concept of **footing** [Goffman, 1981] provides the mechanism: footing refers to the alignment, stance, or posture a person takes up in relation to the interaction. Footing is characterized by constant, fluid changes and adjustments rather than resting in fixed roles. In the era of AI-Mediated Communication (AI-MC), communicative authority is distributed between the human user and the AI, allowing the AI to function as an active agent capable of making decisions autonomously. This active AI involvement necessitates emergent, negotiated interaction rather than simply running pre-set scripts.

**Positioning along the Y-axis** is derived from:
- Conversation structure classifications (turn-taking patterns, engagement styles)
- AI role distributions (structured roles like Expert/Advisor map toward Structured; emergent roles like Facilitator/Reflector map toward Emergent)

This reflects how structured versus emergent the interactional negotiation becomes.

### 4.3 Z-Axis: Affective/Evaluative Lens (PAD Model)

The Z-axis visualizes the **affective/evaluative dimension** of human-AI interaction, making visible emotional friction and affiliation. Height encodes emotional intensity derived from the **Pleasure-Arousal-Dominance (PAD)** model, a three-dimensional framework for describing affective states [Mehrabian & Russell, 1974]:

- **Pleasure (P)**: Measures the pleasantness or valence of an emotion. High scores indicate satisfaction or positive affect; low scores signify frustration, disappointment, or negative affect.
- **Arousal (A)**: Measures the level of physical or mental activation. High arousal indicates agitation, urgency, or intense engagement; low arousal indicates calmness or passivity.
- **Dominance (D)**: Measures the feeling of being in control of the situation versus being controlled by it.

In this topography, **Z-height** specifically increases with high Arousal (agitation) combined with low Pleasure (frustration), creating sharp "peaks" when a user is emotionally provoked by the interaction. The emotional intensity is calculated as:

```
emotionalIntensity = (1 - pleasure) × 0.6 + arousal × 0.4
```

This formula prioritizes pleasure as the primary driver (60% weight), reflecting that frustration (low pleasure) combined with high arousal creates the most intense emotional peaks. Conversely, low Arousal combined with high Pleasure produces "valleys" representing moments of **affiliation**—explicit endorsement of the AI's perspective and smooth, harmonious interaction.

**PAD Calculation Process**:

The PAD scores are calculated per message using a hybrid approach:

1. **Base scores** are derived from conversation-level classifications:
   - Pleasure: Derived from emotional tone (playful, supportive, empathetic → high; serious → low; neutral → moderate)
   - Arousal: Derived from engagement style (questioning, exploring → high; reactive, affirming → low)
   - Dominance: Derived from message structure (commands → high; questions → low; statements → moderate)

2. **Message-level adjustments** based on content analysis:
   - Frustration markers ("wrong", "error", "failed") → lower pleasure, higher arousal
   - Satisfaction markers ("perfect", "thanks", "exactly") → higher pleasure, lower arousal
   - Urgency markers ("urgent", "asap", "help") → higher arousal

3. **Path drift**: Messages drift toward role-determined target positions over time using a cumulative drift formula that creates gradual movement toward the target while preserving conversation flow.

**Significance of Friction and Affiliation**:

1. **Relational Friction and Control Challenges**: Peaks in the terrain often occur when an AI "hallucinates" or fails a task, causing user frustration. This negative affect frequently precedes structural changes:
   - **Role Inversion Signature**: The user shifts from an unknowing position to an authoritative one to correct the AI's error.
   - **Control Challenges**: The user moves from complementary deference to symmetrical contestation to reclaim definitional authority over the task.

2. **Affiliation and Smooth Interaction**: "Valleys" or smoother, lower regions in the topography signify **Affiliation**—a shared evaluative stance where the user endorses the AI's perspective. This differs from mere **alignment** (cooperating structurally with the task):
   - **Alignment**: Answering a question or accepting a turn.
   - **Affiliation**: Explicitly affirming the *quality* or *meaning* of the AI's response (e.g., "That's exactly right").

The Affective/Evaluative Lens is vital for identifying shifts toward **Persona Framing**. While task-oriented "Tool" or "Assistant" framings typically show low or moderate affect focused on utility, a transition to a **Persona** framing is marked by high emotional commitment and engagement that is **decoupled from task utility**. If the terrain remains "mountainous" with high investment and affect even when the AI is failing to provide useful answers, it signals an ethical transition point where the user may be forming an emotional over-reliance on a projected principal.

The coordinate frame remains stable across all visualizations, ensuring that relational placement (X, Y) is consistent while affective intensity (Z) varies per message, revealing how emotional friction and affiliation correspond to relational positioning shifts.

---

## 5. Interactive Experience

Conversational Topography is designed as a walk-up experience that can be understood quickly while still supporting sustained exploration and discussion. This section describes what participants actually do during a typical encounter.

### 5.1 Encounter Flow

A typical encounter lasts 5-8 minutes. Participants begin at the terrain grid, scanning cards that preview different conversation shapes—some mountainous with sharp peaks, some flat, some with winding paths through valleys. Each card shows a minimap of the conversation path, elevation preview, and average classification confidence. Using the filter controls, participants can narrow down conversations by role combinations, message length, or interaction characteristics.

Selecting a card navigates to the 3D terrain view via React Router. The 3D terrain uses an isometric-like perspective camera (approximately 30° elevation, 45° azimuth) for stable, consistent viewing. Participants can:
- **Drag left and right** to rotate the terrain around its Y-axis, maintaining the isometric angle while exploring different viewing angles
- **Switch camera views** between default perspective, side orthographic, and top orthographic views (accessible from the right panel)
- **Adjust camera distance, elevation, and rotation** via the expandable settings section in the right panel (starts closed)

The terrain mesh can be toggled on or off; when hidden, only contour lines are visible, emphasizing the topographic structure.

Most participants first explore the terrain by rotating it, getting their bearings. The facilitator prompts: "Find where the path gets steep." Participants discover that peaks correspond to frustration moments (high arousal, low pleasure) while valleys correspond to affiliation moments (low arousal, high pleasure). The HUD shows PAD values for the selected point; participants often express surprise at how affective intensity corresponds to specific message content.

The key reflection moment comes when participants recognize a pattern—a persistent valley, a sudden peak—and connect it to something they remember about the conversation's feel. The system doesn't tell them what the pattern means; it makes the pattern visible and invites interpretation.

### 5.2 Key Interaction Features

**Timeline Controls**: An interactive timeline allows participants to navigate through the conversation in multiple ways:
- **Right Panel Timeline**: A horizontal bar with clickable points representing each message. Clicking any point jumps to that message and locks the corresponding 3D marker.
- **Minimap Timeline**: Clickable circles in the minimap SVG that allow direct navigation to specific messages.
- **Bottom Timeline**: A larger timeline bar at the bottom of the screen for easy access.
- **Play Button**: Animates the conversation from start to finish over 3 seconds, revealing how relational positioning and affective intensity change over time.
- **Navigation Arrows**: Left (◀) and right (▶) arrow buttons on both timeline components allow step-by-step navigation between messages
- **Manual Control**: Timeline sliders provide fine-grained scrubbing control

As the timeline progresses, path points appear sequentially and markers animate into view, making drift visible as the path moves across the terrain, with peaks and valleys corresponding to specific interactional moments.

**Point Selection and Information Display**: 
- **Hover**: Hovering over a marker highlights it and shows a preview of the message content
- **Click/Lock**: Clicking a marker (or a timeline point) locks it and displays full message details in the right panel
- **Message Display**: Shows the message text, communication function, conversational structure, and role distributions
- **PAD Visualization**: Displays Pleasure, Arousal, Dominance, and Emotional Intensity values with visual progress bars and indicators for "Peak (Frustration)" and "Valley (Affiliation)" states
- **Role Distributions**: Displayed as horizontal progress bars for both human and AI roles, showing probabilistic assignments (e.g., "Seeker: 60%") rather than fixed labels
- **Interactive Minimap**: Mirrors the 3D terrain in 2D, allowing participants to click points directly on the map to jump to specific messages

**Contour and Terrain Controls** (in expandable settings section):
- **Contour Toggle**: Toggling contour lines on and off changes the legibility of the terrain. With contours, elevation changes are easier to read; without them, the surface appears more organic.
- **Contour Count**: Adjustable from 5-30 lines, allowing participants to explore different levels of detail
- **Contour Colors**: Customizable minor, major, and index contour colors
- **Terrain Position**: Fine-tuning of the terrain's position in 3D space (X, Y, Z offsets), supporting exploration and documentation needs

**Camera Controls** (in expandable settings section):
- **Preset Views**: Three camera modes (default perspective, side orthographic, top orthographic) accessible from the right panel header
- **Distance**: Adjustable camera distance (affects zoom level)
- **Elevation**: Adjustable camera elevation angle
- **Rotation**: User-controlled rotation offset around the Y-axis
- **Reset**: Quick reset to default camera position

**Filtering and Comparison**:
- **Grid Filters**: Filter conversations by human role, AI role, message count, epistemic issues, and failure modes
- **Clear Filters**: One-click button to reset all filters
- **Filtered Count**: Display shows "X of Y conversations (filtered)" when filters are active

### 5.3 Reflection Prompts

The system is designed to provoke reflection rather than provide answers. Key questions that emerge during interaction include:

- What does it mean to "read" a conversation as geography?
- How do affective peaks (frustration) and valleys (affiliation) correspond to relational positioning shifts?
- Should relational dynamics be visualized at all, and how should uncertainty be staged?
- What patterns become visible that weren't apparent in the linear transcript?
- What does it mean when emotional intensity remains high even when the AI is failing?
- How do role distributions accumulate over time, and what does this reveal about interactional patterns?

---

## 6. System Implementation

The system is built using React 18.3.1 with TypeScript and Three.js 0.171.0 for 3D rendering, using React Router DOM for navigation between the terrain grid view and individual terrain views. Conversation data is pre-classified using LLM-based analysis (OpenAI GPT-4 API). The terrain is generated from a heightmap computed via fractal noise (Perlin noise), with height modulated by PAD-based emotional intensity. Path points are positioned using role-based distributions when available, falling back to purpose-based classification. The coordinate frame remains stable, ensuring that relational placement is consistent while affective intensity varies per message.

### 6.1 Classification System

Classification uses a structured prompt that outputs probability distributions over 9 dimensions:

1. **Interaction Pattern**: How participants engage (collaborative, storytelling, casual-chat, question-answer, etc.)
2. **Power Dynamics**: Authority and control distribution (human-led, balanced, AI-assisted, etc.)
3. **Emotional Tone**: Overall affective quality (neutral, playful, serious, empathetic, supportive, etc.)
4. **Engagement Style**: How users approach the interaction (reactive, exploring, questioning, affirming, etc.)
5. **Knowledge Exchange**: Type of information flow (factual-info, opinion-exchange, personal-sharing, etc.)
6. **Conversation Purpose**: Primary goal or function (entertainment, information-seeking, problem-solving, etc.)
7. **Turn Taking**: Pattern of exchange structure (balanced, user-dominant, AI-dominant, etc.)
8. **Human Role Distribution**: Probabilistic assignment over roles (seeker, learner, director, collaborator, sharer, challenger)
9. **AI Role Distribution**: Probabilistic assignment over roles (expert, advisor, facilitator, reflector, peer, affiliative)

This approach treats roles as observable interactional configurations rather than fixed identities. The use of OpenAI GPT-4 API for role analysis creates a recursive relation—AI systems analyzing AI-mediated interactions—which itself becomes part of what the visualization makes visible.

### 6.2 PAD Calculation

PAD (Pleasure-Arousal-Dominance) scores are calculated per message using a hybrid approach:

1. **Base scores** are derived from conversation-level classifications:
   - Pleasure: Derived from emotional tone (playful, supportive, empathetic → high; serious → low; neutral → moderate)
   - Arousal: Derived from engagement style (questioning, exploring → high; reactive, affirming → low)
   - Dominance: Derived from message structure (commands → high; questions → low; statements → moderate)

2. **Message-level adjustments** based on content analysis:
   - Frustration markers ("wrong", "error", "failed", "incorrect") → lower pleasure, higher arousal
   - Satisfaction markers ("perfect", "thanks", "exactly", "great") → higher pleasure, lower arousal
   - Urgency markers ("urgent", "asap", "help", "quickly") → higher arousal

3. **Emotional Intensity** is calculated as: `(1 - pleasure) × 0.6 + arousal × 0.4`, where peaks (high intensity) represent frustration and valleys (low intensity) represent affiliation.

PAD values are stored in the conversation data files (added via post-processing script) and can also be calculated at runtime if not present. This dual approach supports both accuracy (stored values from sophisticated analysis) and flexibility (runtime calculation for new conversations).

### 6.3 Path Generation and Drift

Path points are generated with two key mechanisms:

1. **Target Position Calculation**: Based on role distributions:
   - X-axis target: Weighted average of human role positions (Director/Challenger → Functional, Sharer/Collaborator → Social, Seeker/Learner → intermediate)
   - Y-axis target: Weighted average of AI role positions (Expert/Advisor → Structured, Facilitator/Reflector → Emergent, Peer/Affiliative → intermediate)

2. **Drift Formula**: Messages gradually drift toward their target positions over time:
   ```
   driftX[i] = (targetX - startX) × 1.2 × (0.10 + progress[i] × 0.30)
   currentX[i] = startX + driftX[i]
   ```
   
   The 1.2 multiplier creates a slight "overshoot" effect (120% toward target), ensuring that conversations with strong role distributions reach their intended positions. The drift factor increases from 10% to 40% over the conversation, meaning early messages set trajectory while later messages clarify destination.

This approach reveals the "revealing" pattern: cumulative small-to-large increments mean early messages set trajectory, late messages clarify destination, making the path structure visible over time.

### 6.4 Terrain Generation

The terrain uses procedural generation via Perlin noise (fractal noise) to create naturalistic elevation patterns. The process:

1. **Seed Generation**: A deterministic hash function creates a unique seed from classification data (pattern, tone, purpose, depth, conversation ID), ensuring the same conversation always generates the same terrain.

2. **Heightmap Generation**: Fractal noise (multiple octaves of Perlin noise) creates a base elevation map (64×64 grid by default).

3. **PAD Modulation**: The base heightmap is modulated by PAD-based emotional intensity:
   - Areas corresponding to high-intensity messages (frustration peaks) are elevated
   - Low-intensity messages (affiliation valleys) create depressions
   - This creates a terrain where the path naturally follows elevation changes

4. **Contour Generation**: Contour lines are generated at regular intervals (5-30 lines, adjustable) to aid in reading elevation changes. Contours use a light yellow-green color (#a0d080 for minor, #b0e090 for major) for visibility on the dark background.

5. **Mesh Rendering**: The terrain mesh can be toggled on or off; when hidden, only contour lines and the path are visible, emphasizing the topographic structure over surface detail.

### 6.5 Data and Performance

The system includes 63+ pre-classified conversations across multiple datasets:
- **Chatbot Arena**: High-quality conversational data from public evaluations
- **Combined Long Conversations**: Merged conversations creating longer interaction sequences (20+ messages)
- **OpenAssistant**: Dataset samples providing diverse interaction patterns
- **Curated Examples**: Manually selected conversations covering various interaction types

All conversations are loaded via a manifest file that enables parallel loading for improved performance (approximately 2-3x faster than sequential loading). The system falls back to sequential loading if the manifest is unavailable, ensuring robustness.

Conversations are non-identifying and clearly labeled as examples. The system is designed to run entirely in the browser, with optional "bring your own conversation" mode for local analysis (requires internet connection for classification and explicit consent).

### 6.6 Technical Architecture

**Frontend Stack**:
- React 18.3.1 with TypeScript for UI components
- React Router DOM for navigation (routes: `/` for grid, `/terrain/:id` for individual views)
- Three.js 0.171.0 for 3D rendering
- Vite 6.0.1 as build tool
- Custom React components with responsive design
- Static site deployment (can be served from any web server or CDN)

**Performance Optimizations**:
- Virtualized grid rendering for terrain cards using `react-window`
- LOD (Level of Detail) for terrain rendering
- Throttled animations and raycasting
- Manifest-based parallel data loading
- Efficient path point generation with memoization

**Browser Compatibility**:
- Recommended: Chrome/Edge (Chromium-based) latest version
- Minimum: Any browser with WebGL 2.0 support
- Fallback: 2D mode available for browsers without WebGL

---

## 7. Design Rationale and DIS Positioning

Conversational Topography aligns with DIS 2026's call to investigate how artifacts and technologies mediate broader ecosystems of relations. The work responds to the theme of "Experiences, Artefacts, and Technologies" by demonstrating how interactive artifacts can reveal, rather than obscure, the relational systems in which they participate.

### 7.1 What the Terrain Reveals

The terrain visualization is not a neutral representation but an active mediator that connects individual interactions to systemic patterns. Each conversation path reveals how personal exchanges participate in broader sociotechnical configurations. The coordinate frame, role distributions, and PAD-based affective encoding expose the assumptions embedded in conversational AI systems. By showing how authority, agency, and emotional engagement are distributed through interactional positioning, the artifact reveals political and affective dimensions often hidden in technical systems.

### 7.2 Staging Encounters with Systemic Impacts

The interactive experience stages encounters that illuminate impacts across multiple domains:

**Social Domain**: The visualization reveals how conversational AI mediates social relations—not just between human and AI, but in how people learn to interact with computational systems, how social norms are encoded in technical systems, and how relational patterns accumulate over time. The PAD-based Z-axis makes visible how emotional friction and affiliation shape interactional trajectories.

**Cultural Domain**: By making visible the role distributions, communication functions, and interactional patterns, the system exposes how cultural assumptions about conversation, authority, and collaboration are embedded in AI systems and reproduced through use. The affective peaks and valleys reveal how cultural expectations about AI performance create emotional responses.

**Political Domain**: The terrain reveals how power is distributed through interactional positioning—who sets agendas, who has authority, how agency is delegated. These political dimensions become visible through the spatial encodings, and the affective dimension reveals how power struggles (peaks) and harmonious coordination (valleys) correspond to relational configurations.

**Temporal Patterns**: The system's approach to making visible accumulation, persistence, and transformation reveals how sociotechnical systems create lasting patterns that extend beyond individual interactions. The PAD-based encoding shows how affective states build up over time, with peaks and valleys marking critical transition points in the relational arc.

### 7.3 Beyond Dyadic Relations

The work engages with the call to move beyond dyadic human–system relations by treating conversation as entangled roles, conventions, and accumulated practices. The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. The system explicitly avoids judging users, diagnosing intent, or personifying the AI. It offers an interpretive surface for reflection and collective discussion.

The PAD-based affective encoding extends this beyond dyadic relations by revealing how emotional responses to AI systems are not simply individual reactions but are shaped by broader cultural expectations, technical affordances, and accumulated interactional patterns. Peaks and valleys in the terrain make visible how affective states participate in relational configurations that extend beyond the immediate exchange.

### 7.4 Critical Design Stance

The system embodies a critical design stance in several ways:

1. **Foregrounding Interpretation**: The system explicitly frames itself as an "analytic artifact" rather than a diagnostic tool, emphasizing uncertainty and alternative readings.

2. **Probabilistic Representations**: Role distributions are shown probabilistically (e.g., "Seeker 60%, Director 40%") rather than as fixed categories, reinforcing the interpretive nature of classification.

3. **Confidence Visualization**: Classification confidence is displayed throughout, making uncertainty visible rather than hidden.

4. **Non-Diagnostic Framing**: Printed guidance and UI elements explicitly state that the system does not diagnose or evaluate users.

5. **Reflective Prompts**: The system is designed to provoke questions rather than provide answers, inviting participants to reflect on what should—and should not—be made legible.

---

## 8. Accessibility and Inclusive Design

The system incorporates several accessibility considerations:

- **Keyboard Navigation**: Full keyboard support for point selection and controls
- **High-Contrast Palettes**: Dark theme with high-contrast colors for visibility
- **Contour-Only Mode**: Terrain mesh can be hidden, leaving only contour lines for reduced visual complexity
- **Screen Reader Compatibility**: Transcript panel provides text-based access to message content (terrain is supplementary visualization)
- **Isometric Perspective**: Stable 2D-like viewing (no stereo vision required)
- **Motion Controls**: Animations can be reduced or disabled via browser preferences
- **Adjustable Detail**: Contour count and terrain position controls support various viewing needs
- **Filter Interface**: Clear labels and dropdown menus support various interaction preferences

---

## 9. Privacy, Safety, and Technical Requirements

### 9.1 Privacy and Safety

**Default Content**: 63+ curated sample conversations (non-identifying, clearly labeled as examples).

**Optional "Bring Your Own Conversation" Mode**:
- Paste locally; classification runs via disclosed API path with explicit consent
- Clear warnings about data handling
- No automatic data storage
- Easy data clearing mechanism

**Data Handling**:
- No storage by default; exports are local and clearly scoped
- Browser localStorage used for user preferences only
- All user data can be cleared with single button click

**Risks and Mitigation**:
- **Interpretive Harm**: Risk of over-trust in visualization or misreading affective peaks
  - Mitigation: Confidence visualization, probabilistic role displays, explicit non-diagnostic framing, printed guidance emphasizing interpretive nature
- **Privacy**: Risk of users pasting sensitive personal conversations
  - Mitigation: Clear warnings, explicit consent required, no automatic storage, easy clearing mechanism

### 9.2 Technical Requirements

**Physical Setup**:
- Space: 1 table (minimum 1.2m × 0.6m)
- Power: 1 standard power outlet (110V/220V compatible)
- Network: Optional (system can run fully offline with sample data)

**Hardware Requirements**:
- Primary Device: 1 laptop/desktop computer
  - CPU: Modern multi-core processor (Intel i5/AMD Ryzen 5 or equivalent)
  - GPU: Discrete GPU recommended (NVIDIA GTX 1050 / AMD RX 560 or better) for smoother Three.js rendering
  - RAM: Minimum 8GB, 16GB recommended
  - Display: Built-in screen sufficient, external monitor (1920×1080 or higher) recommended for better visibility
  - Input: Mouse or trackpad required for 3D navigation
  - Storage: 500MB free space for application and sample data

**Software Requirements**:
- Operating System: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- Browser: Chrome/Edge latest version (installed and tested)
- No additional software installation required (runs entirely in browser)

**Setup Time**:
- Initial Setup: 15 minutes (load application, verify sample data)
- Between Participants: 2-3 minutes (reset to default state, clear any user data)

**Performance**:
- Manifest-based parallel loading improves initial load time (approximately 2-3x faster than sequential)
- Terrain rendering optimized for 30 message markers (longer conversations can be displayed but may require performance tuning)
- Settings available to reduce visual complexity for lower-end hardware

**Staffing**:
- At least one author present to facilitate and manage privacy choices
- Facilitator guides participants through reflection prompts and manages technical issues

---

## 10. Conclusion

Conversational Topography reframes human–LLM dialogue as a landscape of accumulated interactional practice. Rather than producing conclusions, the interactivity stages encounters with uncertainty, drift, and representational choice.

As an artifact that mediates broader ecosystems of relations, the system demonstrates how interactive technologies can illuminate impacts across social, cultural, and political domains. By making visible how relational patterns and affective states accumulate and persist, the work reveals how seemingly individual interactions participate in larger sociotechnical configurations.

The PAD-based affective encoding extends this by making visible how emotional friction and affiliation shape interactional trajectories. Peaks and valleys in the terrain reveal critical transition points—moments of frustration that precede role inversions, moments of affiliation that mark smooth coordination—illuminating how affective states participate in relational configurations.

The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. In doing so, it invites DIS attendees to reconsider what counts as interactivity in conversational AI—beyond chat interfaces, beyond labels, and toward understanding how artifacts and technologies participate in broader ecosystems of relations, making visible both the relational positioning and the affective dimensions that shape human–AI interaction.

The terrain metaphor, while not claiming ontological truth, provides a powerful representational device for making visible patterns that typically remain invisible. Through the interactive experience, participants can explore how their own interactions—and those of others—create structures that extend beyond individual exchanges, revealing the sociotechnical systems in which conversational AI participates.

---

## References

Dunne, A., & Raby, F. (2001). *Design Noir: The Secret Life of Electronic Objects*. August/Birkhäuser.

Drucker, J. (2014). *Graphesis: Visual Forms of Knowledge Production*. Harvard University Press.

Fiske, A. P. (1992). The four elementary forms of sociality: Framework for a unified theory of social relations. *Psychological Review*, 99(4), 689–723.

Goffman, E. (1981). *Forms of Talk*. University of Pennsylvania Press.

Hancock, J. T., Naaman, M., & Levy, K. (2020). AI-Mediated Communication: Definition, Research Agenda, and Ethical Considerations. *Journal of Computer-Mediated Communication*, 25(1), 89–100.

Mehrabian, A., & Russell, J. A. (1974). *An Approach to Environmental Psychology*. MIT Press.

Reeves, B., & Nass, C. (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places*. Cambridge University Press.

Turner, R. H. (1962). Role-taking: Process versus conformity. In A. M. Rose (Ed.), *Human Behavior and Social Processes* (pp. 20–40). Houghton Mifflin.

Watzlawick, P., Bavelas, J. B., & Jackson, D. D. (1967). *Pragmatics of Human Communication: A Study of Interactional Patterns, Pathologies, and Paradoxes*. W. W. Norton & Company.

---

## Appendix A: System Screenshots and Diagrams

[Note: In the actual submission, this section would include screenshots of:]
- Terrain grid view with filter controls
- 3D terrain visualization showing path and markers
- Right panel with message display and PAD values
- Timeline controls and minimap
- Expandable settings section in right panel (with camera and terrain controls)

## Appendix B: Example Conversations

[Note: In the actual submission, this section would include brief descriptions of example conversations highlighting different patterns:]
- Conversation with persistent frustration peaks (role inversion signature)
- Conversation with smooth affiliation valleys
- Conversation showing drift from structured to emergent interaction
- Long conversation (20+ messages) showing accumulation patterns

---

**Word Count**: ~8,500 words  
**Recommended Format**: ACM SIGCHI format (single-column for initial submission)  
**Submission Category**: Interactivity / Demo

