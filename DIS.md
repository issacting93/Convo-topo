# Conversational Topography: A Terrain Interface for Seeing Relational Drift in Human–LLM Dialogue

**Authors**  
[Your Name], NYU Tandon School of Engineering / Integrated Design & Media  
[Co-authors if any], [Affiliations]  
Contact: [email]

**Keywords**  
human–AI interaction, conversation visualization, relational dynamics, research-through-design, interpretive analytics, uncertainty, interactivity, critical computing

---

## Abstract
As large language models become everyday companions, the most consequential shifts often occur invisibly: not in what is said, but in how people position themselves relationally over time—delegating agency, seeking authority, performing confidence, or building rapport. We present **Conversational Topography**, an interactive system that represents a human–LLM conversation as a navigable terrain. Rather than labeling users or inferring psychological intent, the system makes visible the *recurrence* and *drift* of interactional configurations through spatial and topographic encodings. Participants at DIS can load sample conversations (or their own), switch analytic lenses, and explore how different interactional “modes” accumulate, persist, and fade. We frame the work as an **analytic artifact** that invites reflection and critique: What does it mean to “read” a conversation as geography? What becomes legible—and what remains fundamentally ambiguous—when we visualize relational practice instead of sentiment? In the Interactivity session, Conversational Topography functions as a hands-on encounter with the layered sociotechnical assumptions embedded in conversational AI, and the interpretive risks of making the invisible visible.

---

## 1. Introduction
Human–LLM conversations increasingly mediate work, learning, and emotional processing. Yet contemporary interfaces often reduce dialogue to a linear transcript—excellent for archival retrieval, poor for seeing patterns of relational positioning that unfold across turns. As a result, users may not notice the gradual emergence of dependence, authority delegation, habitual prompting styles, or conversational “ruts” that shape what the AI can do and what the user comes to expect.

Conversational Topography proposes a different kind of interface: not a transcript viewer, not a scoring tool, and not a diagnostic classifier. Instead, it is an exploratory visualization that **stages conversation as a terrain you can traverse**, where spatial placement encodes interactional configuration and topographic height encodes *persistence over time*. The goal is not to tell participants what a conversation “is,” but to help them *see the structure their interaction produces*—and to provoke discussion about what we should (and should not) make legible in AI-mediated relationships.

---

## 2. Interactivity Concept
Conversational Topography is built around a simple metaphor: **a conversation is a landscape shaped by repeated patterns of positioning.**

Participants encounter a terrain surface with a trace path over it. Each point in the path corresponds to a user turn (or window of turns). The visualization is not intended to imply that conversation is naturally geographic; rather, it uses topographic affordances (paths, ridges, basins, contours) to support a human capacity for reading accumulation and change. Critically, the system foregrounds the interpretive status of its encodings: it emphasizes uncertainty, mixed roles, and alternative readings rather than categorical declarations.

The interactivity is designed to be:
- **exploratory** (inviting play and discovery)
- **reflective** (surfacing interpretive ambiguity)
- **critical** (making visible the assumptions and consequences of representation)

---

## 3. Visual Mapping
Conversational Topography uses a stable coordinate frame so that the “ground truth” of placement is consistent across lenses.

**X-Axis: Functional ↔ Social**  
Whether a turn leans toward instrumental task progress versus relational/affective connection. Both ends are legitimate strategies; the axis is descriptive, not moral.

**Y-Axis: Prescribed ↔ Emergent**  
Whether the interaction follows an explicit script or externally defined frame versus improvisational, exploratory, or co-authored behavior. “Emergent” is defined operationally and treated as an interpretive construct, not a psychological claim.

**Z-Axis: Temporal Accumulation / Persistence**  
Height is not “importance” or “intensity.” Height represents **persistence**: repeated returns to similar configurations over time create elevation. Peaks indicate where the conversation *spent time*. A recurring region could signal comfort and stability—or stuckness and circularity. The system does not decide; it invites interpretation.

**Uncertainty as a First-Class Channel**  
Confidence is visualized as fog/opacity/surface roughness (depending on mode). Lower-confidence regions appear less crisp, and the UI exposes “plausible alternatives” rather than hiding uncertainty.

---

## 4. Interaction Design
Conversational Topography is a walk-up experience that can be understood in under a minute, while still rewarding deeper exploration.

**4.1 Overview → Zoom → Details on Demand**  
- Overview: see the whole terrain and path trace.  
- Zoom & pan: move across regions to inspect local structures.  
- Details on demand: hover/select to reveal the corresponding text snippet and metadata (lens values, role distribution).

**4.2 Lens Switching (Interpretation Without Mode Collapse)**  
Switch lenses that re-render the same conversation; path positions stay fixed, terrain formation/shading changes. Example lenses:  
- Tension lens (pressure, friction, constraint)  
- Delegation/control lens (steering, offloading)  
- Social/functional lens (warming/cooling the surface)  
- Combined lens (weighted composite with sensitivity notes)  
Smooth animation reinforces that lenses are readings of the same interaction, not different data.

**4.3 Role Distributions (Not Labels)**  
Shows distributions (e.g., seeker 0.55, director 0.30, collaborator 0.15). Selecting a point shows:  
- top roles with percentages  
- evidence snippets used to support the coding  
- next-best alternative if confidence is low

**4.4 Comparison Encounters**  
- Two conversations side-by-side (e.g., support-seeking vs debugging).  
- The same conversation under different lenses.  
Supports group discussion in the interactivity space.

---

## 5. System Implementation
Dual renderer: **2D canvas** topographic map (fast, legible) and **3D Three.js** terrain mesh (immersive, performative). The mesh is generated from a height field over a grid; height at each cell is derived from message influence fields with temporal persistence. The same conversation can be recomputed under different lenses while preserving placement.

**5.1 Metric Provenance**  
Distinguishes:  
- upstream signals (from existing annotation/classification)  
- computed signals (derived heuristically or via models)  
- confidence (estimated, visualized, and surfaced to avoid over-claiming)

**5.2 Role Coding via LLM (Structured “Coder” Prompt)**  
LLM returns categorical dimensions plus role distributions, with evidence quotes and alternatives when confidence is low. Prompt/model versioning and validation sampling are recorded for reproducibility.

**5.3 Sensitivity and Parameters**  
Exposes influence spread σ (spiky vs smooth) and temporal decay λ (short vs long memory). Presets let participants feel how assumptions about persistence reshape what becomes visible.

---

## 6. What the Interactivity Enables at DIS
Three encounters frame the experience:

**Encounter A: Seeing a Conversation as a Place**  
The interface is navigable space, not a chart. Participants ask: what does it mean to inhabit a conversation?

**Encounter B: Confronting Uncertainty and Ambiguity**  
Mixed roles, fogged regions, and alternatives prompt critique: should we visualize this at all, and how should uncertainty be staged?

**Encounter C: Critiquing Sociotechnical Assumptions**  
By manipulating λ and σ, participants experience how design choices alter legibility, revealing that “analysis” is a crafted epistemology, not neutral fact.

---

## 7. Positioning Within DIS Interactivity
Aligns with the call to move beyond dyadic human–system relations by treating conversation as entangled roles, conventions, and accumulated practices. The contribution is the stance and the artifact: relational dynamics are treated as **interactional structure**, not private psychology. The system explicitly avoids judging users, diagnosing intent, or personifying the AI. It offers an interpretive surface for reflection and collective discussion.

---

## 8. Accessibility and Inclusive Design
- Keyboard navigation for point selection and lens switching  
- High-contrast palettes and contour-only mode  
- Transcript panel for screen-reader compatibility (terrain is supplementary)  
- 2D mode provides full function (no stereo vision required)  
- Motion-light: animations reducible or disable-able

---

## 9. Privacy, Safety, and Risk Management
**Default content:** curated sample conversations (non-identifying).  
**Optional “bring your own conversation” mode:** paste locally; can run locally or via disclosed API path with explicit consent.  
**Data handling:** no storage by default; exports are local and clearly scoped.  
**Risks:** interpretive harm (over-trust). Mitigation: confidence visualization, alternatives, explicit non-claims, printed guidance.

---

## 10. Technical Requirements for the Venue
- Footprint: 1 table, 1 power outlet  
- Hardware: 1 laptop (discrete GPU preferred), external monitor recommended, mouse for navigation  
- Software: runs in browser (Chrome recommended); offline mode for samples  
- Staffing: at least one author present to facilitate and manage privacy choices

---

## 11. Video (recommended, <5 min)
Suggested structure:  
1) Problem: invisible relational drift (20s)  
2) What is Conversational Topography (40s)  
3) Show 2D → 3D, hover, lens switching (90s)  
4) Show uncertainty + role distributions (60s)  
5) Show σ/λ presets and “assumptions change the terrain” (60s)  
6) Close: invitation to critique (20s)

---

## 12. Conclusion
Conversational Topography reframes human–LLM dialogue as a landscape of accumulated interactional practice. The interactivity is less a tool for conclusion-making and more a staged encounter: participants explore how visualization choices shape what becomes legible, and how easily interpretive surfaces can become normative infrastructures. It invites DIS attendees to reconsider what counts as “interactivity” in conversational AI—beyond chat, beyond labels, and into the politics of representation.

---

### Technical Spec PDF (separate document — outline to use)
- System overview diagram (conversation → coder → metrics → terrain → interaction)  
- Hardware list + venue requirements  
- Privacy modes (default sample-only vs optional paste-in)  
- Risk analysis and mitigations  
- Accessibility checklist  
- Setup steps (boot, open URL, load samples, reset between participants)
