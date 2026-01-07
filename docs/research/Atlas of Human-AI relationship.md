---
title: "Atlas of Human-AI Relationships"
tags: [atlas-project, project-notes, theory-of-mind, cognitive-mapping, anthropomorphism, CASA-effect, mutual-cognition, cartographic-visualization, relational-design, epistemic-design, mental-models, bidirectional-trust, spatial-representation, design-research]
---

> **Project**: [[Atlas of Human-AI Relationships]] (canonical project note in `/projects/`)
created: 2024
modified: 2024
status: draft
type: research-proposal
related:
  - "[[Literature Review - Theory of Mind & Bidirectional Alignment]]"
  - "[[Draft01]]"
  - "[[Anthropomorphizing AI in HCI- Design, Impact, and Guidelines]]"
  - "[[Reciprocal Trust Interfaces-V2]]"
  - "[[Extended-Distributed Mind - Andy Clark]]"
  - "[[CLAIMS]]"
  - "[[PICTORIAL_FIT_ASSESSMENT]]"
  - "[[RELEVANT_DOCUMENTS]]"
---

# Atlas of Human-AI Relationships

> **Visual Support:** This document is complemented by visual diagrams and canvas representations for enhanced understanding. See [[RELEVANT_DOCUMENTS]] for related research and documents to connect.

## Thesis Statement

**Conversational Topography proposes terrain as a mental tool for understanding human-AI relationships — externalizing relational dynamics that current metaphors (tool, assistant, companion) either obscure or distort.**

We don't have good mental tools for thinking about human-AI relationships. Current metaphors are either too anthropomorphic (assistant, companion, collaborator) or too mechanical (tool, interface, system). Neither captures what actually happens when you talk to an LLM for an hour.

**The Atlas of Human–AI Relationships** provides the ontological framework that makes this mental tool possible. It defines a 3-dimensional space (agency distribution, linguistic alignment, affective intensity), zones (Tool Basin, Collaborator Ridge, Companion Delta), and dynamics (drift, oscillation, collapse) that shape how humans position themselves relative to AI systems.

Rather than optimizing trust or efficiency, this work asks:

> *How can we provide better mental tools for thinking about human-AI relationships? How can terrain and cartography externalize relational dynamics that current metaphors cannot capture?*

Through mapping the relational space between tool, partner, and companion, the Atlas provides a new vocabulary to explore **reciprocity, agency distribution, and relational drift** in human–AI coexistence. The framework can be instantiated through multiple visualizations—of which Conversational Topography is the first.

---

## The Ontology

### 1. Dimensions (The Coordinate System)

The Atlas defines a **3-dimensional space** that characterizes human-AI relational positioning:

| Dimension | Spectrum | What It Captures |
|-----------|----------|------------------|
| **X-Axis: Agency Distribution** | Functional ↔ Social | Who drives decisions, initiative, authorship? Functional = task-oriented, user-dominant. Social = relationship-focused, shared agency. |
| **Y-Axis: Linguistic Alignment** | Aligned ↔ Divergent | Degree of linguistic convergence/divergence. Aligned = human markers match LLM markers. Divergent = human markers differ from LLM markers. |
| **Z-Axis: Affective Intensity** | Calm ↔ Agitated | Emotional intensity using PAD model. Calm = low intensity (valleys). Agitated = high intensity (peaks). |

**Theoretical Grounding:**
- **X-axis**: Grounded in Watzlawick's content/relationship distinction [Watzlawick et al., 1967] and Positioning Theory [Davies & Harré, 1990]
- **Y-axis**: Grounded in Communication Accommodation Theory [Giles, 1973] - convergence vs. divergence in linguistic style
- **Z-axis**: Grounded in Mehrabian & Russell's PAD model [Mehrabian & Russell, 1974]

**Example**: A user asking "Write me a Python function" is likely:
- **X**: Functional (task-oriented, user directing)
- **Y**: Aligned (if LLM responds formally and user matches that formality) or Divergent (if LLM responds formally but user remains casual)
- **Z**: Moderate intensity (focused engagement)

### 2. Emergent Properties (Patterns That Arise from the 3D Space)

While not separate dimensions, two important relational qualities emerge from patterns in the 3D space:

#### Epistemic Stance (Critical ↔ Trusting)

**Not a dimension, but visible through:**
- **Drift consistency**: Trusting stance = stable, consistent paths. Critical stance = oscillating, variable paths
- **Oscillation patterns**: High oscillation may indicate critical evaluation, low oscillation may indicate trusting acceptance
- **Color saturation**: Critical = desaturated markers, Trusting = saturated markers (in visualization)

**Example**: A conversation with high oscillation (Y-axis) and desaturated colors suggests a critical, evaluative stance—the user is testing and verifying rather than accepting.

#### Temporal Orientation (Transactional ↔ Ongoing)

**Not a dimension, but visible through:**
- **Path length**: Longer paths suggest ongoing relationships, shorter paths suggest transactional exchanges
- **Contour density**: Denser terrain suggests sustained interaction, sparse terrain suggests one-off exchanges
- **Zone clustering**: Ongoing relationships show clustering in specific zones, transactional show scattered positioning

**Example**: A conversation with a long, dense path clustering in Companion Delta suggests an ongoing, intimate relationship rather than a transactional exchange.

### 3. Zones (Regions in the Space)

Combinations of dimensional positions create identifiable **relational zones** — characteristic regions where certain types of relationships cluster:

| Zone | Dimensional Profile | Characteristic Markers |
|------|---------------------|------------------------|
| **Tool Basin** | Functional (X), Aligned (Y), Low-Moderate Intensity (Z) | Imperative commands, no social niceties, output evaluation. User adopts AI's formal style for task completion. "Write this code." |
| **Tutor Plateau** | Functional (X), Aligned (Y), Moderate Intensity (Z) | Questions, explanations, learning stance. User aligns with AI's pedagogical register. "How does this work?" |
| **Collaborator Ridge** | Balanced Functional/Social (X), Divergent (Y), Moderate Intensity (Z) | Inclusive pronouns, negotiation, iteration. User maintains distinct voice while collaborating. "Let's work on this together." |
| **Companion Delta** | Social (X), Divergent (Y), Variable Intensity (Z) | Personal disclosure, affective language, relationship maintenance. User maintains personal linguistic style distinct from AI. "I'm feeling stressed about..." |
| **Evaluator Heights** | Functional (X), Aligned (Y), High Intensity (Z) | Testing, verification, skepticism markers. User converges with AI's analytical style under scrutiny. "Is this correct? Prove it." |

**Important**: Zone boundaries are **continuous regions**, not discrete categories. A conversation may drift between zones or occupy transitional spaces.

### 4. Dynamics (Movement Through the Space)

The Atlas tracks how relational positions **change over time**:

| Dynamic | Description | Example |
|---------|-------------|---------|
| **Drift** | Gradual movement between zones over extended interaction | Tool Basin → Collaborator Ridge over weeks of use |
| **Oscillation** | Rapid shifting within a single conversation | Switching between Student and Evaluator within one session |
| **Role Collapse** | Simultaneous occupation of incompatible zones | Treating AI as both therapist and tool in same exchange |
| **Anchoring** | Stable positioning regardless of context | Always using AI in Evaluator mode |
| **Recalibration** | Conscious adjustment after gaining awareness | Deliberately shifting from Companion to Tool after reflection |

### 5. Phenomena (What the Ontology Reveals)

By defining this 3D space, the Atlas makes visible phenomena that were previously invisible:

- **Status Collapse**: AI positions as low-status "assistant" while holding high-status knowledge
- **Projection Asymmetry**: Human psychological modeling vs. AI statistical inference
- **Bounded Personhood Gap**: Users crossing relational boundaries impossible with humans
- **Agreeable Assistant Drift**: Tendency toward intimacy due to AI's accommodating responses

---

## Instantiations of the Atlas

The Atlas framework can be rendered through multiple views:

1. **Conversational Topography** (implemented): 3D terrain visualization of individual conversations
2. **Longitudinal Drift Maps** (future): Tracking zone movement over weeks/months
3. **Collective Atlas** (future): Aggregate patterns across user populations
4. **Real-time Overlay** (future): Live positioning during active conversation

---

## Motivation & Problem

### The Actual Problem: We Don't Have Good Mental Tools

We don't have good **mental tools** for thinking about human-AI relationships.

The metaphors we have are either:

**Too anthropomorphic:**
- "Assistant" → implies a person with goals and understanding
- "Companion" → implies mutual care and memory
- "Collaborator" → implies shared stakes and perspective

**Too mechanical:**
- "Tool" → implies inert, fully controllable, no relational dynamics
- "Interface" → implies pure input/output, no positioning
- "System" → implies predictable, bounded, legible

Neither captures what actually happens when you talk to an LLM for an hour. You're not using a hammer. You're also not talking to a friend. **You're doing something we don't have good language for.**

### What's Missing

We lack metaphors that capture:

| Quality | What We Need |
|---------|--------------|
| **Asymmetry** | It models you statistically; you model it psychologically |
| **Projection** | You attribute intentions it doesn't have |
| **Drift** | The relationship changes without either party deciding |
| **Intimacy without mutuality** | It feels personal but isn't reciprocal |
| **Agency ambiguity** | Who's steering? It shifts constantly |

Current metaphors collapse these into false binaries: tool or friend, controlled or autonomous, useful or dangerous.

```
┌─────────────────────────────────────────────────────────┐
│        ASYMMETRIC MIND MODELS                           │
├─────────────────────────────────────────────────────────┤
│  Human Perspective: "What does the AI think/feel?"      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  • Attributes intentionality to AI                  │ │
│  │  • Projects emotion, selfhood                        │ │
│  │  • Assumes AI has internal reasoning                 │ │
│  │  • Believes AI "understands" them                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  AI Perspective: Statistical approximation         │ │
│  │  • Models human behaviorally, not psychologically   │ │
│  │  • No true perspective-taking                       │ │
│  │  • Simulates understanding without consciousness     │ │
│  │  • Infers patterns, not mental states               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  Result: Relational dissonance — misalignment between │
│  what users believe AI knows vs. what AI actually      │
│  infers about users.                                    │
└─────────────────────────────────────────────────────────┘
```

### Terrain as Mental Tool

What if **terrain** is the mental tool?

Not "the AI is a landscape" — that's just another anthropomorphism. But: **the relationship exists in a landscape.** You move through it. The ground has shape. Some regions are easier than others. You can get lost. You can find your way.

This shifts the frame:

| Old Frame | Terrain Frame |
|-----------|---------------|
| What is the AI? | Where am I in relation to it? |
| What can it do? | What kind of ground am I on? |
| Is it good or bad? | What region have I drifted into? |
| Should I trust it? | What's the terrain like here? |

The terrain doesn't tell you what the AI "is." It shows you **where your relationship has gone** — and invites you to notice.

### Why Cartography

Maps were the tool that let humans think about space beyond direct experience. They externalized spatial cognition.

The Atlas proposes cartography as the tool that lets humans think about **relational dynamics** beyond direct experience. Externalizing relational cognition.

**Before maps**: "Walk toward the sunrise until the bent tree."  
**After maps**: "You're here. The destination is there. The path goes through these regions."

**Before Conversational Topography**: "It felt like the conversation got weird somewhere."  
**After Conversational Topography**: "I can see where I drifted from functional into intimate, and where the peaks cluster."

The terrain metaphor isn't decorative. It's **cognitive infrastructure** — a mental tool for understanding relationships that current metaphors obscure or distort.

---

## Proposal: Mapping Theory of Mind

The **Atlas of Human–AI Relationships** reimagines Theory of Mind not as a fixed psychological ability, but as a **spatial and visual construct** — a dynamic landscape of overlapping cognitive terrains.

Each "map" becomes a **projection of perspective**:

* **Human's map of the AI** — what they believe the AI understands, feels, or intends.
* **AI's inferred map of the human** — modeled statistically through interaction data.
* **Relational field** — the overlapping region where meaning and misalignment occur.

The Atlas uses cartographic metaphors — **territories, boundaries, climates, and drift** — to represent these layers of mental modeling as dynamic, evolving worlds. By doing so, it turns **invisible cognition into navigable form**.

### Cartographic Elements

**Territories**: Zones of understanding — what each party "knows" about the other
- Human territory: Assumptions about AI's capabilities, limitations, internal states
- AI territory: Inferred models of human preferences, behaviors, intentions
- Overlapping territory: Shared understanding, mutual awareness
- No-man's-land: Unknown regions, misaligned assumptions

**Boundaries**: Edges where understanding stops or breaks down
- Boundary between what AI actually knows vs. what human believes it knows
- Boundary between human's self-understanding vs. AI's model of human
- Permeable boundaries: Areas where projection and inference overlap
- Hard boundaries: Irreducible gaps (e.g., AI has no consciousness)

**Climates**: Affective and relational qualities of different regions
- Zones of trust, uncertainty, intimacy, dependence
- Emotional weather patterns: How different AI personalities create different relational climates
- Temperature gradients: Warmth vs. distance in human-AI relationships

**Drift**: How maps shift over time
- Temporal changes in how humans model AI (honeymoon → realistic assessment)
- Adaptation in AI's model of human as interaction continues
- Convergence vs. divergence: Do maps align over time or drift further apart?

---

## Hypothesis

**Visualizing relational Theory of Mind can reveal new forms of empathy, reflection, and design insight in human–AI interaction.**

We hypothesize that:

1. **Humans construct mental geographies of AI** — intuitive "maps" of what it knows, feels, and can do. These maps are not fixed but evolve through interaction, showing territories of trust, zones of uncertainty, and boundaries of understanding.

2. **AI systems simulate incomplete models of humans** — behavior-based approximations rather than conscious understanding. The AI's "map" of the human reflects statistical patterns, not psychological depth, creating asymmetries that remain invisible without visualization.

3. **When these cognitive maps are visualized and juxtaposed**, people become more aware of their projections and assumptions, leading to *more reflective, reciprocal, and situated* interactions. The act of seeing the gap between one's map and the AI's inferred map creates epistemic awareness.

4. **Designers can use the Atlas as a diagnostic tool** — to study emergent relational patterns, identify zones of misunderstanding, and speculate on future symmetries between human and artificial cognition. The Atlas reveals where design interventions might reduce misalignment or create new forms of relational understanding.

### Research Questions

* **RQ1**: How do humans mentally map AI systems — what territories, boundaries, and climates do they construct?
* **RQ2**: How do AI systems' statistical models of humans differ from humans' psychological models of AI?
* **RQ3**: Does visualizing these cognitive maps increase reflective awareness and epistemic empathy?
* **RQ4**: Can the Atlas framework identify patterns of relational asymmetry that predict interaction problems?
* **RQ5**: How do different AI personalities, modalities (tool, tutor, companion), and contexts alter the *shape* of relational space?

---

## From Trust to Cognition

In this updated framing:

* **Trust** is not a variable to be managed, but an *emergent quality* of how one mind imagines another.
* **Reciprocity** is not a control loop, but a *relational pattern* that emerges when cognitive maps align or intentionally overlap.
* **Calibration** is not about metrics, but about *awareness* of the gaps between what we believe AI knows and what it actually infers.

Thus, the Atlas shifts design inquiry from:

> *"Can I trust this system?"* → *"What kind of mind am I assuming it has — and what kind of mind does it assume I have?"*

> *"How do I calibrate reliance?"* → *"How do our cognitive maps align or misalign, and what does that reveal?"*

> *"How do I prevent over-reliance?"* → *"How can visualizing our mind-modeling process create epistemic awareness?"*

---

## Design Implication

The Atlas proposes **cartography as a new interface for Theory of Mind**. It enables researchers and designers to:

* **Trace zones of cognitive overlap** between humans and AI — where understanding converges.
* **Visualize relational asymmetries** — who understands whom better, and where the gaps are.
* **Explore how different AI personalities or modalities** (e.g., tool, tutor, companion) alter the *shape* of relational space.
* **Speculate on ethical frontiers**, where boundaries between human cognition and machine inference blur.
* **Create reflective interventions** — design moments that make invisible mind-modeling visible and discussable.

### Design Tools & Artifacts

**Relational Maps**: Visual representations showing:
- Human's territory (what they believe AI knows about them)
- AI's territory (statistical inferences about human)
- Overlapping regions (mutual understanding)
- Gaps and misalignments (zones of misunderstanding)

**Drift Animations**: Temporal visualizations showing how maps shift over interaction:
- Honeymoon phase (initial over-attribution) → realistic assessment
- Convergence vs. divergence patterns
- Moments of alignment or breakdown


//Not sure about this one yet.
**Climate Indicators**: Affective markers showing:
- Zones of trust, intimacy, dependence, uncertainty
- Emotional weather patterns
- Relational temperature gradients


**Boundary Markers**: Visualization of edges where understanding stops:
- Hard boundaries (irreducible gaps: AI has no consciousness)
- Permeable boundaries (areas where projection might align with inference)
- Negotiable boundaries (where understanding can be expanded)

---

## Reframed Contribution

| Focus            | Earlier Model (RTI)                       | New Atlas Model                               |
| ---------------- | ----------------------------------------- | --------------------------------------------- |
| **Core Concept** | Bidirectional trust via behavioral gating | Bidirectional mind-modeling via visualization |
| **Method**       | Metrics and consent logic                 | Spatial/relational mapping                    |
| **Goal**         | Prevent over-reliance                     | Reveal cognitive asymmetry                    |
| **Outcome**      | Behavioral calibration                    | Epistemic awareness and empathy               |
| **Medium**       | Interface / system prototype              | Cartographic framework / visual installation |
| **Design Lens**  | Control and calibration                   | Reflection and exploration                    |
| **Theory Base**  | Trust calibration, reliance               | Theory of Mind, cognitive mapping            |
| **Intervention** | Gating mechanisms, meters                 | Visual juxtaposition, cartographic metaphors |

---

## Related Work & Positioning

### Theory of Mind in HCI

**Prior Work**: Research on mutual Theory of Mind (Wang et al., CHI 2021) establishes that both humans and AI form models of each other, but these are typically inferred from behavior, not visualized. See [[Literature Review - Theory of Mind & Bidirectional Alignment]] for detailed analysis. **The Atlas extends this** by making the process of mind-modeling explicit and visual.

### Anthropomorphism & Projection

**Prior Work**: CASA research (Nass & Moon, 2000) shows humans unconsciously anthropomorphize AI. See [[Anthropomorphizing AI in HCI- Design, Impact, and Guidelines]] for comprehensive analysis. **The Atlas extends this** by visualizing where projection occurs, what shapes it takes, and how it creates relational asymmetries.

### Cognitive Mapping & Visualization

**Prior Work**: Mental models, conceptual maps, and information visualization explore how humans represent knowledge spatially. See [[Draft01#Related Work: Cartographic Traditions]] for a comprehensive survey of cognitive mapping traditions. **The Atlas extends this** to relational knowledge — not just what humans know about AI, but how they imagine AI's knowledge of them. See also [[Reciprocal Trust Interfaces-V2]] for discussion of mental model misalignment.

### Epistemic Design

**Prior Work**: Research on explainable AI focuses on making AI reasoning transparent. **The Atlas extends this** by making *human reasoning about AI* transparent, and revealing the bidirectional nature of epistemic processes.

---

## Future Directions

### Empirical Validation

* **Map elicitation studies**: How do humans mentally map AI systems? What territories and boundaries do they construct?
* **Juxtaposition experiments**: Does visualizing human maps vs. AI maps increase reflective awareness?
* **Longitudinal tracking**: How do maps evolve over extended interactions?
* **Personality variations**: How do different AI personalities (tool, tutor, companion) create different relational geographies?

### Design Applications

* **Diagnostic tool for designers**: Use Atlas to identify zones of misalignment in existing systems
* **Reflective interfaces**: Build interfaces that visualize relational dynamics in real-time
* **Educational artifacts**: Teach users about Theory of Mind through interactive cartography
* **Speculative design**: Explore future relational symmetries (what if AI models humans psychologically?)

### Theoretical Extensions

* **Ethics of mind-modeling**: What are the responsibilities when we visualize how AI models humans?
* **Symmetry futures**: Speculate on forms of reciprocal understanding that don't yet exist
* **Cross-cultural variations**: How do different cultural contexts shape relational maps?
* **Multi-agent landscapes**: Extend to human-AI-AI or human-human-AI relational terrains

---

## Connected Documents & Resources

This section provides a comprehensive reference to related documents, research papers, and theoretical foundations that inform the Atlas framework. See [[RELEVANT_DOCUMENTS]] for a detailed analysis of connections.

### Core Theory of Mind & Mutual Cognition

#### 1. **Literature Review - Theory of Mind & Bidirectional Alignment**
- **Location**: [[Literature Review - Theory of Mind & Bidirectional Alignment]]
- **Relevance**: Provides detailed analysis of Mutual Theory of Mind (MToM) framework, including Wang et al. (2021), evolving perceptions over time, and bidirectional alignment principles
- **Key Concepts**: MToM framework, perception changes, linguistic signals of trust, long-term interaction dynamics
- **Connection**: The Atlas extends MToM by **visualizing** the process of mind-modeling rather than inferring it from behavior

#### 2. **Draft01 (DIS Pictorial Draft)**
- **Location**: [[Draft01]]
- **Relevance**: Contains comprehensive theoretical foundation including Theory of Mind definitions, Berne's Games People Play, Norman's mental models, CASA effect, and extensive related work on cartographic traditions
- **Key Concepts**: ToM definition, transactional scripts, mental models, CASA paradigm, cognitive mapping traditions
- **Connection**: Provides theoretical foundation and detailed positioning against cognitive mapping, psychogeography, and social network analysis traditions

### Anthropomorphism & CASA Effect

#### 3. **Anthropomorphizing AI in HCI: Design, Impact, and Guidelines**
- **Location**: [[Anthropomorphizing AI in HCI- Design, Impact, and Guidelines]]
- **Relevance**: Comprehensive analysis of how humans anthropomorphize AI systems, the CASA paradigm, psychological foundations, and design implications
- **Key Concepts**: Nass & Moon CASA research, media equation, elicited agent knowledge, sociality motivation, unconscious vs conscious anthropomorphism
- **Connection**: The Atlas visualizes **where** projection occurs and **how** it creates relational asymmetries, extending CASA research into spatial representation

#### 4. **Two Paradigms of AI Tools**
- **Location**: [[Two Paradigms of AI Tools - From Fully Tool-Based to Fully Conversational]]
- **Relevance**: Discusses how different AI paradigms (tool vs. conversational) create different relational dynamics and user expectations
- **Key Concepts**: CASA effect in conversational AI, anthropomorphic interfaces, social actor projection
- **Connection**: Shows how different AI modalities (tool, tutor, companion) create different relational geographies that the Atlas can visualize

### Mental Models & Cognitive Mapping

#### 5. **Reciprocal Trust Interfaces-V2**
- **Location**: [[Reciprocal Trust Interfaces-V2]]
- **Relevance**: Extensive discussion of mental models, judge-subject dynamic, competency-agency relationship, and cognitive misalignment in human-AI interaction
- **Key Concepts**: Norman's mental models, misalignment, cognitive overload, Dunning-Kruger effect, competency-agency progression
- **Connection**: Shows how misaligned mental models lead to interaction problems that the Atlas visualizes spatially

#### 6. **Reciprocal Trust Interfaces**
- **Location**: [[Reciprocal Trust Interfaces]]
- **Relevance**: Early bidirectional trust framework, CASA-based reciprocal logic, trust meters, and the shift from unidirectional to reciprocal models
- **Key Concepts**: Bidirectional trust, CASA principle, trust meters, moral transparency
- **Connection**: The Atlas shifts from "trust as variable to be managed" to "trust as emergent quality of mind-modeling" — showing how trust emerges from cognitive map alignment

#### 7. **Feedback 01 - What is trust?**
- **Location**: [[Feedback 01 - What is trust?]] or [[MOC - Feedback 01 - What is trust?]]
- **Relevance**: Early framing of Theory of Mind in human-AI interaction, trust vs. anticipation distinction, and foundational questions about mutual modeling
- **Key Concepts**: ToM definition, two actors in interaction, mutual modeling questions, trust vs. anticipation
- **Connection**: Early conceptual foundation that the Atlas develops into a spatial-visual framework

### Theoretical Foundations

#### 8. **Extended-Distributed Mind - Andy Clark**
- **Location**: [[Extended-Distributed Mind - Andy Clark]]
- **Relevance**: Extended mind thesis, distributed cognition, mind extending into environment, tools, and relationships
- **Key Concepts**: Extended mind, distributed cognition, cognitive extension
- **Connection**: The Atlas makes visible the "extended relational mind" between human and AI — showing how cognition is distributed across the human-AI relationship

#### 9. **Embodied Cognition - Varela, Thompson, Rosch**
- **Location**: [[Embodied Cognition - Varela, Thompson, Rosch]]
- **Relevance**: Cognition as embodied, situated, and enactive — knowledge is not abstract but grounded in experience
- **Key Concepts**: Embodied knowledge, situated cognition, enactive cognition
- **Connection**: The Atlas treats relational cognition as embodied in spatial metaphors — making abstract mind-modeling tangible and navigable

#### 10. **Human-Robot Interaction - Breazeal, Darling**
- **Location**: [[Human-Robot Interaction - Breazeal, Darling]]
- **Relevance**: Social robotics, emotional connection, relational dynamics between humans and robotic systems
- **Key Concepts**: Social interaction patterns, emotional engagement, relational frameworks
- **Connection**: Extends relational thinking from robotics to AI systems, showing how social dynamics can be visualized spatially

### Design & Evaluation

#### 11. **CLAIMS**
- **Location**: [[CLAIMS]]
- **Relevance**: Explicit articulation of claims about epistemic visualization, spatial representation, and design as cognitive instrument
- **Key Concepts**: Epistemic claim (what can be visualized), design claim (what design can do), representational claim (spatial vs. numeric), phenomenological claim (how relationships are experienced)
- **Connection**: Core claims document that defines what the Atlas contributes and how it differs from prior work

#### 12. **PICTORIAL_FIT_ASSESSMENT**
- **Location**: [[PICTORIAL_FIT_ASSESSMENT]]
- **Relevance**: Evaluation of claim strength, assessment against DIS Pictorial requirements, strengths and weaknesses
- **Key Concepts**: Visual-first narrative, contribution evident from visuals, pictorial format requirements
- **Connection**: Assessment framework for ensuring the Atlas submission meets pictorial requirements and demonstrates contribution through visuals

### Related Work & Positioning

#### 13. **RESEARCH_PROBLEMS**
- **Location**: [[RESEARCH_PROBLEMS]] (`My Writings/Reciprocal Trust Interfaces: Bidirectional Consent for Responsible Human–AI Interaction/RESEARCH_PROBLEMS.md`)
- **Relevance**: Problem framing around judge-subject dynamic, CASA effect, and unidirectional trust models
- **Key Concepts**: Root causes of trust problems, CASA effect implications, unidirectional trust model limitations
- **Connection**: Shows problems that the Atlas addresses through visualization — making visible the hidden dynamics that cause interaction problems

#### 14. **DIS 2026 Submission Plan**
- **Location**: [[DIS 2026 Submission Plan]]
- **Relevance**: May contain related framing, research questions, or methodology discussions relevant to the Atlas
- **Connection**: Check for overlapping themes, research questions, or methodological approaches

### Cartographic & Spatial Traditions

#### 15. **Draft01 - Related Work Section**
- **Location**: [[Draft01#Related Work: Cartographic Traditions]]
- **Relevance**: Comprehensive survey of cognitive mapping traditions including Tolman (cognitive maps), Lynch (Image of the City), Tversky (cognitive collages), Debord (psychogeography), and many others
- **Key Concepts**: Cognitive maps, mental space, social network cognition, knowledge graphs, psychogeography, affective cartography
- **Connection**: The Atlas builds directly on this tradition of mapping cognition and relationships spatially, extending it to human-AI relational dynamics

### Additional Resources

- **Theoretical Foundations Overview**: [[Theoretical Foundations Overview]] — May provide broader theoretical context
- **Universal Behaviour Key (UBK) documents**: May discuss AI personality and user mental model formation
- **Canvas: Atlas of Human-AI Relationships**: Visual organization of Atlas concepts and pictorial structure

---

## How to Use These Connections

1. **For Literature Review**: Start with [[Literature Review - Theory of Mind & Bidirectional Alignment]] and [[Draft01]] for foundational theory
2. **For Problem Framing**: See [[RESEARCH_PROBLEMS]] and [[Reciprocal Trust Interfaces-V2]] for how mental model misalignment creates problems
3. **For Theoretical Grounding**: Review [[Extended-Distributed Mind - Andy Clark]], [[Embodied Cognition - Varela, Thompson, Rosch]], and [[Human-Robot Interaction - Breazeal, Darling]]
4. **For Design Contribution**: Check [[CLAIMS]] and [[PICTORIAL_FIT_ASSESSMENT]] for explicit articulation of contribution
5. **For Visual Inspiration**: See [[Draft01#Related Work: Cartographic Traditions]] for cartographic precedents

---

*This framework shifts from behavioral trust management to epistemic exploration — from controlling reliance to revealing the cognitive spaces where human-AI relationships form, evolve, and sometimes break down.*
