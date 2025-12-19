# Conversational Topography: A Terrain Interface for Seeing Relational Drift in Human–LLM Dialogue

**Author:** Zac Ting  
**Affiliation:** Your Institution, City, State, Country  
**Email:** your.email@institution.edu

*This is the revised version based on editorial feedback. It has been restructured, tightened, and refined for DIS 2026 submission.*

---

## Abstract

Human–LLM conversations increasingly mediate work, learning, and emotional processing, yet contemporary interfaces present dialogue as linear transcript—poorly equipped to reveal patterns of relational positioning that unfold across turns. The most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally—delegating agency, seeking authority, building rapport. These shifts are difficult to notice because social responses to computational systems arise automatically and often unconsciously [Reeves & Nass, 1996].

We present **Conversational Topography**, an interactive system that represents conversation as navigable terrain. The X-axis encodes functional versus social orientation; the Y-axis encodes scripted versus emergent role-taking; the Z-axis encodes conversation metrics (depth, affect, uncertainty) as elevation. Participants can load sample conversations, switch analytic lenses, and explore how interactional "modes" accumulate and drift over time. Grounded in relational communication theory and Goffman's concept of footing, the system treats relational dynamics as observable structure rather than inferred psychology. The contribution is methodological: we offer a way of staging encounters with patterns that typically remain invisible, inviting reflection on what should—and should not—be made legible in AI-mediated relationships.

---

## 1. Introduction

Human–LLM conversations increasingly mediate work, learning, and emotional processing. Yet contemporary interfaces overwhelmingly present dialogue as a linear transcript—well suited for archival retrieval, but poorly equipped to reveal patterns of relational positioning that unfold across turns. Prior work on social responses to computers suggests that people routinely apply social rules—such as politeness, deference, and authority attribution—to AI systems without conscious deliberation [Reeves & Nass, 1996]. As a result, users may not notice the gradual emergence of dependence, authority delegation, habitual prompting styles, or conversational "ruts" that shape both what the system can do and what the user comes to expect.

Conversational Topography proposes a different kind of interface: not a transcript viewer, not a scoring tool, and not a diagnostic classifier. Instead, it is an exploratory visualization that stages conversation as a terrain you can traverse, where spatial placement encodes interactional configuration and topographic height encodes persistence over time. Drawing on sociological and communicative theories that treat conversation as social action rather than psychological expression [Goffman, 1981], the goal is not to tell participants what a conversation "is," but to help them see the structure their interaction produces—and to provoke discussion about what we should (and should not) make legible in AI-mediated relationships.

---

## 2. The Terrain Metaphor

Conversational Topography is built around a simple metaphor: **a conversation is a landscape shaped by repeated patterns of positioning.**

This metaphor is not intended as a literal model of dialogue, but as a representational device that leverages familiar spatial affordances—paths, ridges, basins, and contours—to support human interpretation of accumulation and change. Similar to prior work in reflective and critical design [Dunne & Raby, 2001], the metaphor is used to provoke sensemaking rather than to claim ontological truth.

The terrain visualization makes visible how conversational AI technologies are embedded within larger relational systems. Each conversation terrain reveals sociotechnical relations (how technical affordances shape interactional possibilities), cultural relations (how communication norms and power dynamics are encoded), and temporal relations (how relational configurations accumulate and transform over time). By making relational drift visible, the artefact illuminates how seemingly individual interactions participate in broader patterns of sociotechnical change.

Participants first encounter a grid of terrain "cards" generated from pre-classified conversations. Each card previews elevation and terrain characteristics, offering a compact overview of how interactional configurations distribute across a conversation. Selecting a card opens a 3D terrain with a path laid across it; each marker corresponds to a message (up to the first 30 turns).

Consistent with critical approaches to data visualization [Drucker, 2014], the system foregrounds the interpretive status of its encodings. It emphasizes uncertainty, mixed roles, and alternative readings rather than categorical declarations. The interactivity is designed to be exploratory (inviting play and discovery), reflective (surfacing ambiguity and interpretive tension), and critical (making visible the assumptions and consequences of representation).

---

## 3. Coordinate System

Conversational Topography uses a stable coordinate frame so that relational placement remains consistent across analytic lenses, allowing participants to explore how different assumptions reshape legibility without altering the underlying interactional sequence. The three-dimensional model integrates concepts from communication science, sociology, and computational linguistics, grounded in established theories of interaction structure and role negotiation.

[Maybe having it rotate will confuse people of the XZ]
### 3.1 X-Axis: Functional ↔ Social

Every message operates on two levels: it conveys content and it defines a relationship [Watzlawick et al., 1967]. The X-axis makes this distinction navigable. Toward the Functional pole, exchanges emphasize task completion—queries answered, code generated, information retrieved. Toward the Social pole, the relationship itself becomes salient: rapport, deference, playfulness, or friction. This corresponds roughly to Fiske's [1992] distinction between Market Pricing relations (instrumental, transactional) and Communal Sharing or Equality Matching relations (socially embedded).

The axis is descriptive, not evaluative. A conversation that stays functional is not impoverished; a conversation that drifts social is not off-task. The question is what patterns emerge and whether users notice them.

### 3.2 Y-Axis: Prescribed ↔ Emergent

This axis maps the contrast between interactions governed by fixed rules, roles, or protocols (prescribed) and interactions that are dynamically co-created, allowing for negotiation and re-definition of roles (emergent). The axis draws directly on role-theoretic distinctions [Turner, 1962], treating emergence as the result of role-making (negotiating and co-authoring) rather than merely role-taking (following recognizable scripts).

Goffman's concept of footing [Goffman, 1981] provides the mechanism: footing refers to the alignment, stance, or posture a person takes up in relation to the interaction. Footing is characterized by constant, fluid changes and adjustments rather than resting in fixed roles. In the era of AI-Mediated Communication (AI-MC), communicative authority is distributed between the human user and the AI, allowing the AI to function as an active agent capable of making decisions autonomously. This active AI involvement necessitates emergent, negotiated interaction rather than simply running pre-set scripts.

### 3.3 Z-Axis: Metric Height (Lens-Dependent)

The Z-axis measures the computational intensity and certainty associated with the conversation, relying on high-level metrics derived from Natural Language Processing (NLP) and contextual analysis. Height encodes lens-driven metrics rather than elapsed time, with each mode grounded in established measurement approaches:

**Composite Mode** (current implementation): Uses fixed terrain parameters while keeping path positions fixed. The terrain shape remains consistent, allowing focus on relational positioning patterns.

**Affect Mode**: Correlates with the continuous, multidimensional measurement of emotional state, typically categorized into Pleasure, Arousal, and Dominance (PAD) levels. Emotional intensity sharpens peaks and valleys.

**Uncertainty Mode**: Draws on approaches to accountability modeling in dialogue systems, which use classification methods to predict the probability of dialogue state components. Lower classifier confidence produces rougher, higher terrain, making visible where interpretation is less certain. This approach makes uncertainty a visible, first-class dimension of the visualization rather than hiding it or treating it as noise.

**Composite Mode**: Blends depth, uncertainty, and affect while keeping path positions fixed. Re-running lenses reshapes the surface but not the trajectory.

---

## 4. Interactive Experience

Conversational Topography is designed as a walk-up experience that can be understood quickly while still supporting sustained exploration and discussion. This section describes what participants actually do during a typical encounter.

### 4.1 Encounter Flow

A typical encounter lasts 5-8 minutes. Participants begin at the terrain grid, scanning cards that preview different conversation shapes—some mountainous, some flat, some with winding paths. Each card shows elevation, terrain characteristics, and a brief description. Selecting a card transitions to the 3D view.

Most participants first orbit the terrain, getting their bearings. The facilitator prompts: "Find where the path gets steep." This usually leads to lens switching—participants discover that "steepness" changes meaning depending on whether they're viewing affect, depth, or uncertainty. The HUD shows role distributions for the selected point; participants often express surprise at the probabilistic framing ("it thinks I'm 60% learner and 40% director?").

The key reflection moment comes when participants recognize a pattern—a persistent valley, a sudden ridge—and connect it to something they remember about the conversation's feel. The system doesn't tell them what the pattern means; it makes the pattern visible and invites interpretation.

### 4.2 Key Interaction Moments

**Lens Switching**: Height and shading can be regenerated live using different analytic lenses. Path positions remain fixed while the surface re-forms, making visible how analytic assumptions reshape interpretation without altering relational placement. This is often the moment when participants understand that the visualization is interpretive, not objective.

**Timeline Scrubbing**: A slider at the bottom allows participants to scrub through the conversation timeline. As they move the slider, path points appear sequentially, and the terrain's visible portion updates. This reveals how relational positioning changes over time—drift becomes visible as the path moves across the terrain.

**Point Selection**: Hovering or locking a point reveals the message text, communication function, conversational structure, and distributions over inferred roles, tone, and power. Roles are displayed probabilistically rather than as fixed labels, reinforcing the system's interpretive and non-diagnostic stance. Participants can compare their own sense of a message with the system's classification.

**Contour Overlays**: Toggling contour lines on and off changes the legibility of the terrain. With contours, elevation changes are easier to read; without them, the surface appears more organic. Adjusting the contour count (5-30 lines) allows participants to explore different levels of detail.

### 4.3 Reflection Prompts

The system is designed to provoke reflection rather than provide answers. Key questions that emerge during interaction include:

- What does it mean to "read" a conversation as geography?
- How do different lenses reveal different aspects of the same interaction?
- Should relational dynamics be visualized at all, and how should uncertainty be staged?
- What patterns become visible that weren't apparent in the linear transcript?

---

## 5. System Implementation

The system is built using React and Three.js, with conversation data pre-classified using LLM-based analysis (Claude API). The terrain is generated from a heightmap computed via fractal noise, with height modulated by conversation metrics (depth, confidence, emotional intensity). Path points are positioned using role-based distributions when available, falling back to purpose-based classification. The coordinate frame remains stable across lens changes, ensuring that relational placement is consistent while surface topography varies.

Classification uses a structured prompt that outputs probability distributions over roles (human: seeker, learner, director, collaborator, sharer, challenger; AI: expert, advisor, facilitator, reflector, peer, affiliative) along with evidence quotes and confidence scores. This approach treats roles as observable interactional configurations rather than fixed identities. The use of Claude API for role analysis creates a recursive relation—AI systems analyzing AI-mediated interactions—which itself becomes part of what the visualization makes visible.

The system includes 20 pre-classified sample conversations covering various interaction patterns (collaborative, question-answer, advisory, casual-chat), different terrain characteristics (varying elevations, path patterns, complexity), and diverse role distributions. All sample conversations are non-identifying and clearly labeled as examples. An optional "bring your own conversation" mode allows participants to paste their own dialogue for real-time classification (requires internet connection and explicit consent).

---

## 6. Design Rationale and DIS Positioning

Conversational Topography aligns with DIS 2026's call to investigate how artefacts and technologies mediate broader ecosystems of relations. The work responds to the theme of "Experiences, Artefacts, and Technologies" by demonstrating how interactive artefacts can reveal, rather than obscure, the relational systems in which they participate.

### 6.1 What the Terrain Reveals

The terrain visualization is not a neutral representation but an active mediator that connects individual interactions to systemic patterns. Each conversation path reveals how personal exchanges participate in broader sociotechnical configurations. The coordinate frame, role distributions, and metric lenses expose the assumptions embedded in conversational AI systems. By showing how authority, agency, and control are distributed through interactional positioning, the artefact reveals political dimensions often hidden in technical systems.

### 6.2 Staging Encounters with Systemic Impacts

The interactive experience stages encounters that illuminate impacts across multiple domains:

**Social Domain**: The visualization reveals how conversational AI mediates social relations—not just between human and AI, but in how people learn to interact with computational systems, how social norms are encoded in technical systems, and how relational patterns accumulate over time.

**Cultural Domain**: By making visible the role distributions, communication functions, and interactional patterns, the system exposes how cultural assumptions about conversation, authority, and collaboration are embedded in AI systems and reproduced through use.

**Political Domain**: The terrain reveals how power is distributed through interactional positioning—who sets agendas, who has authority, how agency is delegated. These political dimensions become visible through the spatial encodings.

**Temporal Patterns**: The system's approach to making visible accumulation, persistence, and transformation reveals how sociotechnical systems create lasting patterns that extend beyond individual interactions. These patterns—how relational configurations sediment over time, how interactional habits become infrastructure—have implications for understanding the long-term impacts of AI-mediated communication.

### 6.3 Beyond Dyadic Relations

The work engages with the call to move beyond dyadic human–system relations by treating conversation as entangled roles, conventions, and accumulated practices. The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. The system explicitly avoids judging users, diagnosing intent, or personifying the AI. It offers an interpretive surface for reflection and collective discussion.

---

## 7. Accessibility and Inclusive Design

- Keyboard navigation for point selection and lens switching
- High-contrast palettes and contour-only mode
- Transcript panel for screen-reader compatibility (terrain is supplementary)
- 2D mode provides full function (no stereo vision required)
- Motion-light: animations reducible or disable-able

---

## 8. Privacy, Safety, and Technical Requirements

**Privacy and Safety**: Default content consists of curated sample conversations (non-identifying). Optional "bring your own conversation" mode: paste locally; can run locally or via disclosed API path with explicit consent. Data handling: no storage by default; exports are local and clearly scoped. Risks: interpretive harm (over-trust). Mitigation: confidence visualization, alternatives, explicit non-claims, printed guidance.

**Technical Requirements**: Footprint: 1 table, 1 power outlet. Hardware: 1 laptop (discrete GPU preferred), external monitor recommended, mouse for navigation. Software: runs in browser (Chrome recommended); offline mode for samples. Staffing: at least one author present to facilitate and manage privacy choices.

---

## 9. Conclusion

Conversational Topography reframes human–LLM dialogue as a landscape of accumulated interactional practice. Rather than producing conclusions, the interactivity stages encounters with uncertainty, drift, and representational choice.

As an artefact that mediates broader ecosystems of relations, the system demonstrates how interactive technologies can illuminate impacts across social, cultural, and political domains. By making visible how relational patterns accumulate and persist, the work reveals how seemingly individual interactions participate in larger sociotechnical configurations.

The contribution is both methodological and substantive: it offers a way of staging encounters with relational ecosystems, and it demonstrates how conversational AI technologies mediate relations that extend far beyond the dyadic human–system exchange. In doing so, it invites DIS attendees to reconsider what counts as interactivity in conversational AI—beyond chat interfaces, beyond labels, and toward understanding how artefacts and technologies participate in broader ecosystems of relations.

---

## References

Dunne, A., & Raby, F. (2001). *Design Noir: The Secret Life of Electronic Objects*. August/Birkhäuser.

Drucker, J. (2014). *Graphesis: Visual Forms of Knowledge Production*. Harvard University Press.

Fiske, A. P. (1992). The four elementary forms of sociality: Framework for a unified theory of social relations. *Psychological Review*, 99(4), 689–723.

Goffman, E. (1981). *Forms of Talk*. University of Pennsylvania Press.

Reeves, B., & Nass, C. (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places*. Cambridge University Press.

Turner, R. H. (1962). Role-taking: Process versus conformity. In A. M. Rose (Ed.), *Human Behavior and Social Processes* (pp. 20–40). Houghton Mifflin.

Watzlawick, P., Bavelas, J. B., & Jackson, D. D. (1967). *Pragmatics of Human Communication: A Study of Interactional Patterns, Pathologies, and Paradoxes*. W. W. Norton & Company.

