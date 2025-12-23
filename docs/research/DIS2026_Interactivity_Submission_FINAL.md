> **Project**: [[Conversational Topography]] (canonical project note in `/projects/`)  
> **Parent Project**: [[Atlas of Human-AI Relationships]]  
> **Concepts**: [[Relational Drift]], [[Footing]], [[Roles as User Projections]]  
> **Theories**: [[Social Role Theory]], [[Positioning Theory]], [[Critical Computing]]

---

# Conversational Topography: A Terrain Interface for Seeing Relational Drift in Human–LLM Dialogue

**Author:** Zac Ting  
**Affiliation:** Your Institution, City, State, Country  
**Email:** your.email@institution.edu

*This is the final version matching the current implementation. Updated to reflect the PAD-based Z-axis, 63 conversations across multiple datasets, and current system features.*

---

## Abstract

Human–LLM conversations increasingly mediate work, learning, and emotional processing, yet contemporary interfaces present dialogue as linear transcript—poorly equipped to reveal patterns of relational positioning that unfold across turns. The most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally—delegating agency, seeking authority, building rapport. These shifts are difficult to notice because social responses to computational systems arise automatically and often unconsciously [Reeves & Nass, 1996].

We present **Conversational Topography**, an interactive system that represents conversation as navigable terrain. The X-axis encodes functional versus social orientation; the Y-axis encodes structured versus emergent role-taking; the Z-axis encodes affective/evaluative intensity using the Pleasure-Arousal-Dominance (PAD) model, revealing emotional friction and affiliation. Participants can load conversations, explore how interactional "modes" accumulate and drift over time, and examine how affective peaks (frustration) and valleys (affiliation) correspond to relational positioning shifts. Grounded in relational communication theory and Goffman's concept of footing, the system treats relational dynamics as observable structure rather than inferred psychology. The contribution is methodological: we offer a way of staging encounters with patterns that typically remain invisible, inviting reflection on what should—and should not—be made legible in AI-mediated relationships.

---

## 1. Introduction

Human–LLM conversations increasingly mediate work, learning, and emotional processing. Yet contemporary interfaces overwhelmingly present dialogue as a linear transcript—well suited for archival retrieval, but poorly equipped to reveal patterns of relational positioning that unfold across turns. Prior work on social responses to computers suggests that people routinely apply social rules—such as politeness, deference, and authority attribution—to AI systems without conscious deliberation [Reeves & Nass, 1996]. As a result, users may not notice the gradual emergence of dependence, authority delegation, habitual prompting styles, or conversational "ruts" that shape both what the system can do and what the user comes to expect.

Conversational Topography proposes a different kind of interface: not a transcript viewer, not a scoring tool, and not a diagnostic classifier. Instead, it is an exploratory visualization that stages conversation as a terrain you can traverse, where spatial placement encodes interactional configuration and topographic height encodes affective/evaluative intensity. Drawing on sociological and communicative theories that treat conversation as social action rather than psychological expression [Goffman, 1981], the goal is not to tell participants what a conversation "is," but to help them see the structure their interaction produces—and to provoke discussion about what we should (and should not) make legible in AI-mediated relationships.

---

## 2. The Terrain Metaphor

Conversational Topography is built around a simple metaphor: **a conversation is a landscape shaped by repeated patterns of positioning.**

This metaphor is not intended as a literal model of dialogue, but as a representational device that leverages familiar spatial affordances—paths, ridges, basins, and contours—to support human interpretation of accumulation and change. Similar to prior work in reflective and critical design [Dunne & Raby, 2001], the metaphor is used to provoke sensemaking rather than to claim ontological truth.

The terrain visualization makes visible how conversational AI technologies are embedded within larger relational systems. Each conversation terrain reveals sociotechnical relations (how technical affordances shape interactional possibilities), cultural relations (how communication norms and power dynamics are encoded), and temporal relations (how relational configurations accumulate and transform over time). By making relational drift visible, the artefact illuminates how seemingly individual interactions participate in broader patterns of sociotechnical change.

Participants first encounter a grid of terrain "cards" generated from pre-classified conversations. Each card provides rich preview information: a minimap showing the conversation path, message count, dominant roles (human and AI), PAD summary (average Pleasure, Arousal, and Emotional Intensity), top classification dimensions, and XYZ coordinates. This enables quick comparison and selection. Selecting a card opens a 3D terrain with a path laid across it; each marker corresponds to a message (up to the first 50 messages, though longer conversations can be visualized by adjusting the display).

Consistent with critical approaches to data visualization [Drucker, 2014], the system foregrounds the interpretive status of its encodings. It emphasizes uncertainty, mixed roles, and alternative readings rather than categorical declarations. The interactivity is designed to be exploratory (inviting play and discovery), reflective (surfacing ambiguity and interpretive tension), and critical (making visible the assumptions and consequences of representation).

---

## 3. Coordinate System

Conversational Topography uses a stable coordinate frame so that relational placement remains consistent, allowing participants to explore how different assumptions reshape legibility without altering the underlying interactional sequence. The three-dimensional model integrates concepts from communication science, sociology, and computational linguistics, grounded in established theories of interaction structure and role negotiation.

### 3.1 X-Axis: Functional ↔ Social

Every message operates on two levels: it conveys content and it defines a relationship [Watzlawick et al., 1967]. The X-axis makes this distinction navigable. Toward the Functional pole, exchanges emphasize task completion—queries answered, code generated, information retrieved. Toward the Social pole, the relationship itself becomes salient: rapport, deference, playfulness, or friction. This corresponds roughly to Fiske's [1992] distinction between Market Pricing relations (instrumental, transactional) and Communal Sharing or Equality Matching relations (socially embedded).

The axis is descriptive, not evaluative. A conversation that stays functional is not impoverished; a conversation that drifts social is not off-task. The question is what patterns emerge and whether users notice them.

Positioning along the X-axis is derived from role distributions—specifically, how the human participant positions themselves. Director and Challenger roles (authoritative, evaluative) map toward the Functional end, while Sharer and Collaborator roles (social, relational) map toward the Social end. This encoding reveals how relational positioning is distributed through interactional configurations rather than being fixed in either party.

### 3.2 Y-Axis: Structured ↔ Emergent

This axis maps the contrast between interactions governed by fixed rules, roles, or protocols (structured) and interactions that are dynamically co-created, allowing for negotiation and re-definition of roles (emergent). The axis draws directly on role-theoretic distinctions [Turner, 1962], treating emergence as the result of role-making (negotiating and co-authoring) rather than merely role-taking (following recognizable scripts).

Goffman's concept of footing [Goffman, 1981] provides the mechanism: footing refers to the alignment, stance, or posture a person takes up in relation to the interaction. Footing is characterized by constant, fluid changes and adjustments rather than resting in fixed roles. In the era of AI-Mediated Communication (AI-MC), communicative authority is distributed between the human user and the AI, allowing the AI to function as an active agent capable of making decisions autonomously. This active AI involvement necessitates emergent, negotiated interaction rather than simply running pre-set scripts.

Positioning along the Y-axis is derived from conversation structure classifications (turn-taking patterns, engagement styles) and AI role distributions, reflecting how structured versus emergent the interactional negotiation becomes.

### 3.3 Z-Axis: Affective/Evaluative Lens (PAD Model)

The Z-axis visualizes the **affective/evaluative dimension** of human-AI interaction, making visible emotional friction and affiliation. Height encodes emotional intensity derived from the **Pleasure-Arousal-Dominance (PAD)** model, a three-dimensional framework for describing affective states [Mehrabian & Russell, 1974]:

- **Pleasure (P)**: Measures the pleasantness or valence of an emotion. High scores indicate satisfaction or positive affect; low scores signify frustration, disappointment, or negative affect.
- **Arousal (A)**: Measures the level of physical or mental activation. High arousal indicates agitation, urgency, or intense engagement; low arousal indicates calmness or passivity.
- **Dominance (D)**: Measures the feeling of being in control of the situation versus being controlled by it.

In this topography, **Z-height** specifically increases with high Arousal (agitation) combined with low Pleasure (frustration), creating sharp "peaks" when a user is emotionally provoked by the interaction. Conversely, low Arousal combined with high Pleasure produces "valleys" representing moments of affiliation—explicit endorsement of the AI's perspective and smooth, harmonious interaction.

The PAD scores are calculated per message using a hybrid approach: base scores are derived from conversation-level classifications (emotional tone, engagement style), which are then adjusted based on message-level content analysis. The system detects frustration markers ("wrong", "error", "failed"), satisfaction markers ("perfect", "thanks", "exactly"), and urgency markers ("urgent", "asap", "help") to provide message-specific affective variation.

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

## 4. Interactive Experience

Conversational Topography is designed as a walk-up experience that can be understood quickly while still supporting sustained exploration and discussion. This section describes what participants actually do during a typical encounter.

### 4.1 Encounter Flow

A typical encounter lasts 5-8 minutes. Participants begin at the terrain grid, scanning cards that preview different conversation shapes—some mountainous with sharp peaks, some flat, some with winding paths through valleys. Each card shows a minimap of the conversation path, elevation preview, and average classification confidence. Selecting a card transitions to the 3D view.

The 3D terrain uses an isometric-like perspective camera (approximately 30° elevation, 45° azimuth) for stable, consistent viewing. Participants can drag left and right to rotate the terrain around its Y-axis, maintaining the isometric angle while exploring different viewing angles. The terrain mesh can be toggled on or off; when hidden, only contour lines are visible, emphasizing the topographic structure.

Most participants first explore the terrain by rotating it, getting their bearings. The facilitator prompts: "Find where the path gets steep." Participants discover that peaks correspond to frustration moments (high arousal, low pleasure) while valleys correspond to affiliation moments (low arousal, high pleasure). The HUD shows PAD values for the selected point; participants often express surprise at how affective intensity corresponds to specific message content.

The key reflection moment comes when participants recognize a pattern—a persistent valley, a sudden peak—and connect it to something they remember about the conversation's feel. The system doesn't tell them what the pattern means; it makes the pattern visible and invites interpretation.

### 4.2 Key Interaction Moments

**Timeline Controls**: An interactive timeline in the right panel allows participants to navigate through the conversation. Clicking any point on the timeline jumps to that message, while a play button animates the conversation from start to finish over 3 seconds, revealing how relational positioning and affective intensity change over time. A slider in the settings panel provides manual scrubbing control. As the timeline progresses, path points appear sequentially and markers animate into view, making drift visible as the path moves across the terrain, with peaks and valleys corresponding to specific interactional moments.

**Point Selection**: Hovering or clicking a marker reveals the message text, communication function, conversational structure, and distributions over inferred roles, tone, and power. The PAD values (Pleasure, Arousal, Dominance, Emotional Intensity) are displayed with visual progress bars, showing how affective state maps to terrain height. Roles are displayed probabilistically rather than as fixed labels, reinforcing the system's interpretive and non-diagnostic stance. Participants can compare their own sense of a message with the system's classification. The interactive minimap in the right panel mirrors the 3D terrain, allowing participants to click points directly on the 2D map to jump to specific messages, providing an alternative navigation method.

**Contour Overlays**: Toggling contour lines on and off changes the legibility of the terrain. With contours, elevation changes are easier to read; without them, the surface appears more organic. Adjusting the contour count (5-30 lines) allows participants to explore different levels of detail. The contour lines use a light yellow-green color for visibility on the dark background.

**Camera and Terrain Controls**: A comprehensive settings panel (accessible via gear icon) provides extensive controls for exploration. Camera controls include three preset views (default perspective, side orthographic, top orthographic) accessible from the right panel, plus adjustable distance, elevation, and rotation in the settings. Terrain position controls allow fine-tuning of the terrain's position in 3D space (X, Y, Z offsets), supporting exploration and documentation needs. Color customization is available for contours and markers, enabling personalized exploration of the visualization.

**Path Visualization**: The conversation path is rendered as a bright yellow-gold line (`#FDD90D`) connecting message markers, making the trajectory through affective and relational space clearly visible. Path markers use distinct colors: purple-blue for user messages, orange for assistant messages, with size indicating selection state.

### 4.3 Reflection Prompts

The system is designed to provoke reflection rather than provide answers. Key questions that emerge during interaction include:

- What does it mean to "read" a conversation as geography?
- How do affective peaks (frustration) and valleys (affiliation) correspond to relational positioning shifts?
- Should relational dynamics be visualized at all, and how should uncertainty be staged?
- What patterns become visible that weren't apparent in the linear transcript?
- What does it mean when emotional intensity remains high even when the AI is failing?

---

## 5. System Implementation

The system is built using React and Three.js, with conversation data pre-classified using LLM-based analysis (Claude API via Anthropic). The terrain is generated from a heightmap computed via fractal noise (Perlin noise), with height modulated by PAD-based emotional intensity. Path points are positioned using role-based distributions when available, falling back to purpose-based classification. The coordinate frame remains stable, ensuring that relational placement is consistent while affective intensity varies per message.

### 5.1 Classification System

Classification uses a structured prompt that outputs probability distributions over 9 dimensions:

1. **Interaction Pattern**: How participants engage (collaborative, storytelling, casual-chat, etc.)
2. **Power Dynamics**: Authority and control distribution
3. **Emotional Tone**: Overall affective quality (neutral, playful, serious, empathetic, supportive)
4. **Engagement Style**: How users approach the interaction (reactive, exploring, questioning, affirming)
5. **Knowledge Exchange**: Type of information flow (factual-info, opinion-exchange, etc.)
6. **Conversation Purpose**: Primary goal or function
7. **Turn Taking**: Pattern of exchange structure
8. **Human Role Distribution**: Probabilistic assignment over roles (seeker, learner, director, collaborator, sharer, challenger)
9. **AI Role Distribution**: Probabilistic assignment over roles (expert, advisor, facilitator, reflector, peer, affiliative)

This approach treats roles as observable interactional configurations rather than fixed identities. The use of Claude API for role analysis creates a recursive relation—AI systems analyzing AI-mediated interactions—which itself becomes part of what the visualization makes visible.

### 5.2 PAD Calculation

PAD (Pleasure-Arousal-Dominance) scores are calculated per message using a hybrid approach:

1. **Base scores** are derived from conversation-level classifications:
   - Pleasure: Derived from emotional tone (playful, supportive, empathetic → high; serious → low; neutral → moderate)
   - Arousal: Derived from engagement style (questioning, exploring → high; reactive, affirming → low)
   - Dominance: Derived from message structure (commands → high; questions → low; statements → moderate)

2. **Message-level adjustments** based on content analysis:
   - Frustration markers ("wrong", "error", "failed") → lower pleasure, higher arousal
   - Satisfaction markers ("perfect", "thanks", "exactly") → higher pleasure, lower arousal
   - Urgency markers ("urgent", "asap", "help") → higher arousal

3. **Emotional Intensity** is calculated as: `(1 - pleasure) * 0.6 + arousal * 0.4`, where peaks (high intensity) represent frustration and valleys (low intensity) represent affiliation.

PAD values are stored in the conversation data files (added via post-processing script) and can also be calculated at runtime if not present. This dual approach supports both accuracy (stored values from sophisticated analysis) and flexibility (runtime calculation for new conversations).

### 5.3 Data and Performance

The system includes 63 pre-classified conversations across multiple datasets:

- **8 conv-*.json**: General conversation samples
- **7 sample-*.json**: Curated examples covering various interaction patterns
- **28 emo-*.json**: Emotion-focused dialogues (afraid, angry, joyful, etc.)
- **10 cornell-*.json**: Cornell Movie Dialogs dataset samples
- **10 kaggle-emo-*.json**: Kaggle Empathetic Dialogues dataset samples

All conversations are loaded via a manifest file that enables parallel loading for improved performance (approximately 2-3x faster than sequential loading). The system falls back to sequential loading if the manifest is unavailable, ensuring robustness.

Conversations are non-identifying and clearly labeled as examples. The system is designed to run entirely in the browser, with optional "bring your own conversation" mode for local analysis (requires internet connection for classification and explicit consent).

### 5.4 Terrain Generation

The terrain uses procedural generation via Perlin noise to create naturalistic elevation patterns. The heightmap is then modulated by PAD-based emotional intensity: areas corresponding to high-intensity messages (frustration peaks) are elevated, while low-intensity messages (affiliation valleys) create depressions. Contour lines are generated at regular intervals (5-30 lines, adjustable) to aid in reading elevation changes. The terrain mesh can be toggled on or off; when hidden, only contour lines and the path are visible, emphasizing the topographic structure over surface detail.

---

## 6. Design Rationale and DIS Positioning

Conversational Topography aligns with DIS 2026's call to investigate how artefacts and technologies mediate broader ecosystems of relations. The work responds to the theme of "Experiences, Artefacts, and Technologies" by demonstrating how interactive artefacts can reveal, rather than obscure, the relational systems in which they participate.

### 6.1 What the Terrain Reveals

The terrain visualization is not a neutral representation but an active mediator that connects individual interactions to systemic patterns. Each conversation path reveals how personal exchanges participate in broader sociotechnical configurations. The coordinate frame, role distributions, and PAD-based affective encoding expose the assumptions embedded in conversational AI systems. By showing how authority, agency, and emotional engagement are distributed through interactional positioning, the artefact reveals political and affective dimensions often hidden in technical systems.

### 6.2 Staging Encounters with Systemic Impacts

The interactive experience stages encounters that illuminate impacts across multiple domains:

**Social Domain**: The visualization reveals how conversational AI mediates social relations—not just between human and AI, but in how people learn to interact with computational systems, how social norms are encoded in technical systems, and how relational patterns accumulate over time. The PAD-based Z-axis makes visible how emotional friction and affiliation shape interactional trajectories.

**Cultural Domain**: By making visible the role distributions, communication functions, and interactional patterns, the system exposes how cultural assumptions about conversation, authority, and collaboration are embedded in AI systems and reproduced through use. The affective peaks and valleys reveal how cultural expectations about AI performance create emotional responses.

**Political Domain**: The terrain reveals how power is distributed through interactional positioning—who sets agendas, who has authority, how agency is delegated. These political dimensions become visible through the spatial encodings, and the affective dimension reveals how power struggles (peaks) and harmonious coordination (valleys) correspond to relational configurations.

**Temporal Patterns**: The system's approach to making visible accumulation, persistence, and transformation reveals how sociotechnical systems create lasting patterns that extend beyond individual interactions. The PAD-based encoding shows how affective states build up over time, with peaks and valleys marking critical transition points in the relational arc.

### 6.3 Beyond Dyadic Relations

The work engages with the call to move beyond dyadic human–system relations by treating conversation as entangled roles, conventions, and accumulated practices. The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. The system explicitly avoids judging users, diagnosing intent, or personifying the AI. It offers an interpretive surface for reflection and collective discussion.

The PAD-based affective encoding extends this beyond dyadic relations by revealing how emotional responses to AI systems are not simply individual reactions but are shaped by broader cultural expectations, technical affordances, and accumulated interactional patterns. Peaks and valleys in the terrain make visible how affective states participate in relational configurations that extend beyond the immediate exchange.

---

## 7. Accessibility and Inclusive Design

- Keyboard navigation for point selection and controls
- High-contrast palettes and contour-only mode (terrain mesh can be hidden)
- Transcript panel for screen-reader compatibility (terrain is supplementary)
- Isometric perspective provides stable 2D-like viewing (no stereo vision required)
- Motion-light: animations can be reduced or disabled
- Adjustable contour count and terrain position controls support various viewing needs

---

## 8. Privacy, Safety, and Technical Requirements

**Privacy and Safety**: Default content consists of 63 curated sample conversations (non-identifying). Optional "bring your own conversation" mode: paste locally; classification runs via disclosed API path with explicit consent. Data handling: no storage by default; exports are local and clearly scoped. Risks: interpretive harm (over-trust in visualization, misreading affective peaks). Mitigation: confidence visualization, probabilistic role displays, explicit non-diagnostic framing, printed guidance emphasizing interpretive nature.

**Technical Requirements**: Footprint: 1 table, 1 power outlet. Hardware: 1 laptop (discrete GPU preferred for smoother Three.js rendering), external monitor recommended for visibility, mouse for navigation. Software: runs in modern browser (Chrome, Firefox, Safari recommended); offline mode available for sample conversations. Staffing: at least one author present to facilitate and manage privacy choices.

**Performance**: Manifest-based parallel loading improves initial load time (approximately 2-3x faster than sequential). Terrain rendering optimized for 30 message markers (longer conversations can be displayed but may require performance tuning).

---

## 9. Conclusion

Conversational Topography reframes human–LLM dialogue as a landscape of accumulated interactional practice. Rather than producing conclusions, the interactivity stages encounters with uncertainty, drift, and representational choice.

As an artefact that mediates broader ecosystems of relations, the system demonstrates how interactive technologies can illuminate impacts across social, cultural, and political domains. By making visible how relational patterns and affective states accumulate and persist, the work reveals how seemingly individual interactions participate in larger sociotechnical configurations.

The PAD-based affective encoding extends this by making visible how emotional friction and affiliation shape interactional trajectories. Peaks and valleys in the terrain reveal critical transition points—moments of frustration that precede role inversions, moments of affiliation that mark smooth coordination—illuminating how affective states participate in relational configurations.

The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. In doing so, it invites DIS attendees to reconsider what counts as interactivity in conversational AI—beyond chat interfaces, beyond labels, and toward understanding how artefacts and technologies participate in broader ecosystems of relations, making visible both the relational positioning and the affective dimensions that shape human–AI interaction.

---

## References

Dunne, A., & Raby, F. (2001). *Design Noir: The Secret Life of Electronic Objects*. August/Birkhäuser.

Drucker, J. (2014). *Graphesis: Visual Forms of Knowledge Production*. Harvard University Press.

Fiske, A. P. (1992). The four elementary forms of sociality: Framework for a unified theory of social relations. *Psychological Review*, 99(4), 689–723.

Goffman, E. (1981). *Forms of Talk*. University of Pennsylvania Press.

Mehrabian, A., & Russell, J. A. (1974). *An Approach to Environmental Psychology*. MIT Press.

Reeves, B., & Nass, C. (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places*. Cambridge University Press.

Turner, R. H. (1962). Role-taking: Process versus conformity. In A. M. Rose (Ed.), *Human Behavior and Social Processes* (pp. 20–40). Houghton Mifflin.

Watzlawick, P., Bavelas, J. B., & Jackson, D. D. (1967). *Pragmatics of Human Communication: A Study of Interactional Patterns, Pathologies, and Paradoxes*. W. W. Norton & Company.

