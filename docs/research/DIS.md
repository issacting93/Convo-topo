# Conversational Topography: A Terrain Interface for Seeing Relational Drift in Human–LLM Dialogue

## Abstract
As large language models become everyday companions, the most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally over time—delegating agency, seeking authority, performing confidence, or building rapport. Research in human–computer interaction has shown that social responses to computational systems arise automatically and often below conscious awareness (e.g., CASA), making such relational shifts difficult to notice or reflect upon.

We present **Conversational Topography**, an interactive system that represents a human–LLM conversation as a navigable terrain. Rather than labeling users or inferring psychological intent, the system makes visible the recurrence and drift of interactional configurations through spatial and topographic encodings grounded in theories of relational communication, role-taking and role-making, and social positioning.

Participants at DIS can load sample conversations (or their own), switch analytic lenses, and explore how different interactional “modes” accumulate, persist, and fade over time. We frame the work as an analytic artifact rather than an evaluative tool: an invitation to reflection and critique rather than conclusion-making. *What does it mean to “read” a conversation as geography?* 

What becomes legible—and what remains fundamentally ambiguous—when we visualize relational practice instead of sentiment or topic structure? 

In the Interactivity session, Conversational Topography functions as a hands-on encounter with the layered sociotechnical assumptions embedded in conversational AI, and with the interpretive risks of making the invisible visible.

## 1. Introduction
Human–LLM conversations increasingly mediate work, learning, and emotional processing. Yet contemporary interfaces overwhelmingly present dialogue as a linear transcript—well suited for archival retrieval, but poorly equipped to reveal patterns of relational positioning that unfold across turns. Prior work on social responses to computers suggests that people routinely apply social rules—such as politeness, deference, and authority attribution—to AI systems without conscious deliberation. As a result, users may not notice the gradual emergence of dependence, authority delegation, habitual prompting styles, or conversational “ruts” that shape both what the system can do and what the user comes to expect.

Conversational Topography proposes a different kind of interface: not a transcript viewer, not a scoring tool, and not a diagnostic classifier. Instead, it is an exploratory visualization that stages conversation as a terrain you can traverse, where spatial placement encodes interactional configuration and topographic height encodes persistence over time. Drawing on sociological and communicative theories that treat conversation as social action rather than psychological expression, the goal is not to tell participants what a conversation “is,” but to help them see the structure their interaction produces—and to provoke discussion about what we should (and should not) make legible in AI-mediated relationships.

## 2. Interactivity Concept
Conversational Topography is built around a simple metaphor: **a conversation is a landscape shaped by repeated patterns of positioning.** 

This metaphor is not intended as a literal model of dialogue, but as a representational device that leverages familiar spatial affordances—paths, ridges, basins, and contours—to support human interpretation of accumulation and change. *Similar to prior work in reflective and critical design, the metaphor is used to provoke sensemaking rather than to claim ontological truth.*

Participants first encounter a grid of terrain “cards” generated from pre-classified conversations. Each card previews elevation and topic depth, offering a compact overview of how interactional configurations distribute across a conversation. Selecting a card opens a 3D terrain with a path laid across it; each marker corresponds to a message (up to the first 30 turns).

Consistent with critical approaches to data visualization, the system foregrounds the interpretive status of its encodings. It emphasizes uncertainty, mixed roles, and alternative readings rather than categorical declarations. The interactivity is designed to be:
- **exploratory**, inviting play and discovery rather than task completion  
- **reflective**, surfacing ambiguity and interpretive tension  
- **critical**, making visible the assumptions and consequences of representation

## 3. Visual Mapping
Conversational Topography uses a stable coordinate frame so that relational placement remains consistent across analytic lenses, allowing participants to explore how different assumptions reshape legibility without altering the underlying interactional sequence.

**X-Axis: Functional ↔ Social**  
Orients conversational turns toward instrumental task progress or toward relational and affective engagement. Draws on relational communication theory’s distinction between content and relationship levels, as well as sociological accounts of specificity versus diffuseness in interaction. The axis is descriptive rather than evaluative; both poles represent legitimate interactional strategies.

**Y-Axis: Prescribed ↔ Emergent**  
Captures whether interaction follows recognizable scripts or externally defined frames, or whether it is negotiated and co-authored in situ. Adapts role-theoretic distinctions between role-taking and role-making, treating emergence as an interpretive construct rather than a claim about creativity or intent.

**Z-Axis: Metric Height (Lens-Dependent)**  
Height encodes lens-driven metrics rather than elapsed time. In depth mode, taller regions reflect higher topic depth; in uncertainty mode, lower classifier confidence produces rougher, higher terrain; in affect mode, emotional intensity sharpens peaks and valleys; composite blends these signals. Path positions stay fixed; re-running lenses reshapes the surface but not the trajectory.

**Metric Modes (Height Drivers)**  
- **Depth:** scales the persistence field to emphasize deeper conversations.  
- **Uncertainty:** scales/roughens the persistence field where classifier confidence is low.  
- **Affect:** adds sharper peaks and valleys based on emotional intensity.  
- **Composite:** blends depth, uncertainty, and affect while keeping path positions fixed.

**Uncertainty as a First-Class Channel**  
In the current implementation, the uncertainty lens raises and roughens the terrain where classifier confidence is low; it does not add fog or opacity effects. Lower-confidence regions are therefore expressed through elevation and surface texture, with alternative readings surfaced in the HUD rather than via atmospheric rendering.

## 4. Interaction Design
Conversational Topography is designed as a walk-up experience that can be understood quickly while still supporting sustained exploration and discussion.

**4.1 Prototype Flow**  
Participants begin on a Terrain Grid of cards generated from static JSON files representing pre-classified conversations. Selecting a card opens a 3D terrain with message markers and a timeline slider. A lightweight HUD provides a minimap, role summary, and navigation controls, while orbit and zoom enable spatial exploration.

**4.2 Metric Lens Switcher**  
Height and shading can be regenerated live using different analytic lenses. Path positions remain fixed while the surface re-forms, making visible how analytic assumptions reshape interpretation without altering relational placement.

**4.3 Controls for Legibility**  
Timeline scrubbing, trace-path animation, contour overlays, and stochastic seed controls allow participants to explore drift, accumulation, and variability without destabilizing the coordinate frame.

**4.4 Role and Context Readouts**  
Hovering or locking a point reveals the message text, communication function, conversational structure, and distributions over inferred roles, tone, and power. Roles are displayed probabilistically rather than as fixed labels, reinforcing the system’s interpretive and non-diagnostic stance.

## 5. System Implementation
(Note: this section functions as technical substantiation; no additional theoretical framing is required.)

## 6. What the Interactivity Enables at DIS
Three experiential encounters frame the installation:
- **Encounter A: Seeing a Conversation as a Place** — conversation becomes navigable space rather than linear text, encouraging participants to reflect on what it means to inhabit an interaction.  
- **Encounter B: Confronting Uncertainty and Ambiguity** — mixed roles, rougher surfaces in low-confidence regions, and alternative readings prompt critique: should relational dynamics be visualized at all, and how should uncertainty be staged?  
- **Encounter C: Critiquing Sociotechnical Assumptions** — by manipulating analytic parameters, participants experience how visualization choices shape meaning, reinforcing that “analysis” is a crafted epistemology rather than neutral fact.

## 7. Positioning Within DIS Interactivity
Conversational Topography aligns with DIS’s emphasis on interactivity as inquiry rather than optimization. By treating conversation as entangled roles, conventions, and accumulated practices, the system frames relational dynamics as interactional structure, not private psychology. It explicitly avoids diagnosing users or personifying AI, instead offering an interpretive surface for reflection, discussion, and critique.

## 12. Conclusion
Conversational Topography reframes human–LLM dialogue as a landscape of accumulated interactional practice. Rather than producing conclusions, the interactivity stages encounters with uncertainty, drift, and representational choice. In doing so, it invites DIS attendees to reconsider what counts as interactivity in conversational AI—beyond chat interfaces, beyond labels, and toward the politics of representation itself.