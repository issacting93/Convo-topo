	# Conversational Cartography: Mapping Relational Trajectories in Human–AI Dialogue

**DIS 2026 Pictorial Submission**

---

## ⧉ Front Matter (First Page)

**Title (Anonymous)**
*Conversation Cartographer: Mapping Relational Trajectories in Human–AI Dialogue*

**Abstract (≤150 words)**
Human–AI conversations are traditionally analyzed as text transcripts or metrics, obscuring relational dynamics that unfold over time. We introduce *Conversation Cartographer*, a visual system that renders dialogue as trajectories through a three-dimensional relational space defined by functional–social orientation, linguistic alignment, and affective intensity. By encoding each turn as a coordinate and constructing continuous paths, the map reveals patterns of relational drift, emotional change, and role positioning that are invisible in surface statistics. Analysis of 562 validated conversations shows that trajectory features account for 83.3% of pattern separation, and that conversations with the same dominant social role can follow dramatically different paths. The visual terrain and clustered landscapes enable designers and researchers to see, compare, and interpret conversational journeys, supporting more transparent and role-aware interactive systems. Substantive visuals are central to conveying these design insights.

**Author Keywords**
Conversational Cartography; Human-AI Interaction; Relational Dynamics; Spatial Visualization; Critical Computing; Social Role Theory.

**CCS Concepts**
• **Human-centered computing** → **Interaction design** → *Interaction design theory, concepts and paradigms*;
• **Human-centered computing** → **Visualization** → *Visualization design and evaluation methods*;
• **Human-centered computing** → **Empirical studies in HCI**.

---

## ⧉ Pictorial Narrative Text

### 1. Introduction

Traditional dialogue analysis treats exchanges as isolated text or point snapshots, masking relational dynamics important for trust, role interpretations, and system behavior. Our visual artifact shifts the unit of analysis to **trajectory and terrain**, making the *path* of interaction visible.

> **[FIGURE 1: Terrain Overview vs. Transcript]**
> * **Visual Suggestion:** A side-by-side comparison. Left: A standard JSON log or flat chat transcript snippet (opaque, illegible text). Right: The same conversation rendered as a rich 3D terrain path (revealing, navigable).
> * **Caption:** Transforming linear text logs into spatial navigational trajectories. The terrain reveals the specific relational signature of a conversation that a linear transcript obscures.
> * **Alt Text:** A side-by-side comparison image. The left panel shows a plain text chat log and a block of JSON code, appearing dense and difficult to read. The right panel shows the same conversation data visualized as a glowing 3D path traversing a dark, topographic terrain map. The path bends and rises, revealing a specific shape that was not visible in the text alone.

### 2. Spatial Encoding Model

We define a relational space with three dimensions:

*   **Functional ↔ Social Orientation (X)** — captures the spectrum from task-oriented to socially oriented exchanges.
*   **Linguistic Alignment (Y)** — measures structural and stylistic convergence between interlocutors.
*   **Affective Intensity (Z)** — encodes emotional prominence using a PAD-derived height metric.

> **[FIGURE 2: The Tuning Fork / Encoding Pipeline]**
> * **Visual Suggestion:** An exploded diagram of the 3 axes. Annotated arrows showing how text signals map to X, Y, and Z coordinates. The "Tuning Fork" metaphor separates the single signal of "text" into three distinct frequencies (Functional, Structural, Affective).
> * **Caption:** The three-dimensional relational space encodes functional orientation (X), linguistic alignment (Y), and emotional intensity (Z).
> * **Alt Text:** An encoding diagram shaped like a tuning fork. A single input line labeled "Conversation Text" splits into three distinct prongs. The first prong is labeled "X: Functional vs. Social," the second "Y: Aligned vs. Divergent," and the third "Z: Calm vs. Agitated." Each prong flows into a 3D coordinate system, showing how a single text message is mapped to a specific point in space.

#### 2.1 Understanding the Axes: From Text to Terrain

Each conversation is positioned in a three-dimensional relational space through automated linguistic analysis. The axes are not arbitrary—they encode theoretically grounded dimensions of human-AI interaction.

**X-Axis: Communication Function (Functional ↔ Social)**

This axis captures *why* participants are engaged in conversation, distinguishing instrumental exchange from relational connection.

* **Functional/Instrumental (X ≈ 0.0–0.4):** Task imperatives ("fix," "create," "calculate"), goal-directed language ("how to," "what is"), technical vocabulary, minimal social niceties. These conversations treat the AI as a *tool*—requesting outputs, seeking solutions, executing tasks.

* **Social/Expressive (X ≈ 0.6–1.0):** Personal pronouns ("I feel," "my experience"), emotional language ("excited," "worried," "grateful"), expressive markers ("interesting," "share," "opinion"), social niceties beyond politeness. These conversations treat the AI as an *interlocutor*—sharing experiences, exploring ideas, building rapport.

*Computation:* The system analyzes linguistic markers across both participants' turns, counting functional markers (task verbs, information-seeking questions, technical terms) versus social markers (self-reference, emotional expressions, interpersonal language). This score is blended with metadata-derived role positioning (e.g., Social Role Theory's "Information-Seeker" vs. "Social-Expressor") to produce a hybrid coordinate. When present, linguistic analysis takes precedence.

**Y-Axis: Linguistic Alignment (Aligned ↔ Divergent)**

This axis measures *how* participants communicate, revealing power dynamics and relational positioning through stylistic convergence.

* **Aligned/Convergent (Y ≈ 0.0–0.4):** Human and AI adopt similar linguistic styles—matching formality levels, politeness conventions, sentence structure, certainty expressions. High alignment suggests *accommodation*: one or both parties adjust their style to match the other, indicating rapport, cooperation, or deference.

* **Divergent/Asymmetric (Y ≈ 0.6–1.0):** Human and AI maintain distinct linguistic styles—mismatched formality (casual human, formal AI), differing question-asking behavior, contrasting register. High divergence suggests *role differentiation*: participants maintain separate stances, indicating authority gaps, resistance, or maintained boundaries.

*Computation:* The system extracts seven linguistic features from each participant's turns: formality, politeness, certainty, structural organization, question-asking, inclusive language, and conversational register. It then calculates cosine similarity between the human's feature vector and the AI's feature vector. The alignment score is inverted (1 - similarity) so that high similarity yields low Y (aligned) and low similarity yields high Y (divergent). This score correlates with authority dynamics—facilitator roles typically show high divergence (emergent structure), while expert roles show low divergence (imposed structure).

**Z-Axis: Affective Intensity (Calm ↔ Agitated)**

This axis captures the *emotional texture* of interaction, revealing friction, urgency, and satisfaction.

* **Low Intensity (Z ≈ 0.0–0.4):** Neutral tone, satisfied markers ("thanks," "perfect," "exactly"), minimal urgency, low arousal. These conversations proceed smoothly—questions answered, goals met, expectations satisfied.

* **High Intensity (Z ≈ 0.6–1.0):** Frustration markers ("wrong," "doesn't work," "error"), urgency signals ("quickly," "help me," "urgent"), high arousal. These conversations show *friction*—unmet needs, misunderstandings, escalating effort.

*Computation:* The system uses the PAD (Pleasure-Arousal-Dominance) sentiment model. Pleasure is derived from frustration vs. satisfaction markers. Arousal is derived from urgency and conflict signals. Dominance is derived from question-asking (submissive) vs. commanding language (dominant). Emotional intensity is calculated as a weighted combination: `(1 - Pleasure) × 0.6 + Arousal × 0.4`. This formula treats low pleasure and high arousal as indicators of interaction friction. For conversation-level positioning, the system may alternatively use *User Authority* (derived from power dynamics and role distribution) to reflect agency rather than emotion.

**Why These Axes Matter**

These dimensions are not neutral descriptions—they reveal *designed constraints*. If most conversations cluster in the Functional-Divergent-Low Intensity region, we see that current AI systems successfully handle instrumental tasks with minimal friction, but struggle to support social connection or shared authority. If expressive human roles (**3% in our data**) consistently pair with instrumental AI responses (65%), we observe a *foreclosure*: users attempt relational engagement, but systems constrain them to functional exchange. The terrain makes this visible.

### 3. Conversation Trajectories

Each message becomes a coordinate; sequences form continuous paths — *conversational journeys*. These journeys reveal not only endpoints but the evolving relational shape of interaction.

> **[FIGURE 3: Trajectory Construction]**
> * **Visual Suggestion:** A step-by-step visual build: (A) Single message point -> (B) Two points connected -> (C) Full continuous path with drift and velocity cues (spacing between points).
> * **Caption:** Constructing the journey: individual turns are connected to visualize drift and relational velocity.
> * **Alt Text:** A three-part sequence illustrating how a trajectory is drawn. Panel A shows a single glowing dot in 3D space representing one message. Panel B shows a second dot connected to the first by a thin line. Panel C shows a complete, winding path made of many connected dots, forming a continuous route through the terrain. Varied spacing between dots indicates changes in relational velocity.

### 4. Patterns & Landscapes

Clustering trajectories exposes distinct relational landscapes and emergent regions of the terrain. Importantly, quantitative analysis confirms that **trajectory features dominate pattern separation**, validating the visual system as a lens into coherent interaction structures.

> **[FIGURE 4: Clustered Landscapes]**
> * **Visual Suggestion:** High-level map showing color-coded clusters (e.g., "Affiliation Valley", "Frustration Peak"). Heatmap style overlay distinct regions of the X-Y plane.
> * **Caption:** Emergent landscapes: Clustering reveals distinct interaction regions defined by movement patterns rather than just semantic topics.
> * **Alt Text:** A top-down heatmap view of the conversation terrain. Seven distinct colored regions are visible, labeled with names like "Affiliation Valley" and "Frustration Peak." The regions show where hundreds of conversation paths tend to cluster, revealing common "territories" of interaction such as functional Q&A or emotional breakdown.

### 5. Same Roles, Different Journeys

Visual comparison of multiple conversations with identical dominant roles shows striking differences in trajectory shape and emotional contour, illustrating that role labels alone are insufficient without path context.

> **[FIGURE 5: Comparative Pairs]**
> * **Visual Suggestion:** Two terrain panels side-by-side. Both tagged as "Info-Seeking", but one is a smooth flat line (efficient) and the other is a jagged high-peak path (frustrated).
> * **Caption:** Taxonomy vs. Topography: Two conversations with identical "Information Seeking" role labels exhibit drastically different relational journeys.
> * **Alt Text:** A comparison of two different conversation paths. Left: A smooth, straight path moving efficiently across the terrain, labeled "Information Seeking (Efficient)." Right: A jagged, erratic path winding back and forth with high spikes, labeled "Information Seeking (Frustrated)." Despite having the same role label, the two visual shapes are completely different, illustrating the limitation of static labels.

### 6. Role Network Analysis: The Foreclosure

Beyond trajectory analysis, we apply Social Role Theory to classify both human and AI participants across a 12-role taxonomy (n=562 conversations). This reveals not the asymmetry we expected, but something more troubling: the near-total absence of relational engagement.

**The Taxonomy**

Human roles span instrumental and expressive dimensions:
- **Instrumental**: Provider (sharing information), Director (commanding), Information-Seeker (asking questions), Collaborator (co-constructing)
- **Expressive**: Social-Expressor (sharing experiences), Relational-Peer (building rapport)

AI roles reflect distinct interaction modes:
- **Authoritative**: Expert-System (delivering facts), Advisor (guiding decisions)
- **Facilitative**: Learning-Facilitator (scaffolding), Social-Facilitator (reflecting)
- **Collaborative**: Co-Constructor (building together), Relational-Peer (engaging as equal)

**The Pattern**

Analysis of 562 conversations reveals not a relational mismatch, but a *relational absence*:

- **97% of human interactions are instrumental** (Provider 44.5%, Director 27.9%, Information-Seeker 24.6%): users seek information, direct tasks, share knowledge
- **3% are expressive** (Social-Expressor): sharing experiences, seeking connection
- **65% of AI responses are Expert-System**: delivering facts, not facilitating or relating
- **19% are Advisor**: providing guidance

This is not evidence of user desire for instrumental exchange. It reveals a *normalized constraint*: current systems train users to be instrumental. The 3% who attempt expressive engagement receive instrumental responses, reinforcing the boundary.

> **[FIGURE 6: Role Network Sankey Diagram]**
> * **Visual Suggestion:** A Sankey flow diagram. Left column: Human roles (color-coded—blue for instrumental, pink for expressive). Right column: AI roles. The diagram is dominated by thick blue flows: Provider→Expert-System (33.1%), Information-Seeker→Expert-System (20.8%), Director→Expert-System (11.0%). A single thin pink flow: Social-Expressor (3%) → scattered instrumental AI responses.
> * **Caption:** Role flow dominance: 97% instrumental human roles flow to 65% Expert-System AI. The thin pink line (Social-Expressor, 3%) reveals the foreclosure—expressive attempts are rare, and when they occur, receive instrumental responses.
> * **Alt Text:** A Sankey flow diagram visualizing the relationship between Human Roles (left) and AI Roles (right). The vast majority of the flow consists of thick blue bands representing instrumental human roles (Provider, Director) flowing into a massive "Expert-System" node on the AI side. In stark contrast, a tiny, thin pink band represents "Social-Expressor" (3%) on the human side. This thin pink line dissipates into instrumental AI responses, visually demonstrating that expressive human input is rare and meets a non-expressive AI response.

**The Dominant Pattern**

The Sankey reveals one overwhelming mode:
1. **Instrumental-Expert** (97% → 65%): Human seeks/provides/directs → AI delivers facts

The absence of *expressive interaction* is the finding. Users have learned not to attempt relational engagement. The system has trained them out of it. The 3% who try anyway encounter a system that responds instrumentally, teaching them the boundary.

**Methodological Circularity**

These roles are classified using GPT-5.2 analyzing GPT-based conversations. The AI interprets its own relational possibilities—and sees 97% instrumental, 65% Expert-System. This circularity exposes the design: the system has optimized for information exchange and trained users to comply. It cannot see relational possibilities because it has successfully foreclosed them.

### 7. Design Implications

Making relational journeys visible suggests new opportunities for interaction design:

*   supporting **role continuity** across model switches
*   exposing **trajectory cues** to users
*   guiding systems to respect relational expectations
*   preventing abrupt "relational fractures" in conversation
*   designing for **reciprocal expressiveness**, not just facilitation

> **[FIGURE 7: Design Intervention Schematics]**
> * **Visual Suggestion:** Schematic sketches or "HUD" mockups showing how a user might see their "current drift" or "relational coordinate" in real-time. Include a small role indicator showing human↔AI role pairing.
> * **Caption:** Design interventions: Visualizing trajectory cues and role asymmetries to support continuity and enable reciprocal engagement.
> * **Alt Text:** A user interface mockup for a "Relational HUD." It shows a standard chat window with an added sidebar. The sidebar displays a "Drift Compass" showing the conversation's current movement toward social or functional space, and a role indicator showing "Current Pairing: Provider -> Expert." This illustrates how the visualization could be used in real-time to alert users to their relational positioning.

### 8. Scaffolding and Reflection

The narrative complements visuals and emphasizes generative questions rather than definitive claims. It positions *Conversational Cartography* as both a **design artifact** and an **analytical lens** for rethinking dialogue, trust, and interaction patterns beyond text. Supporting panels situate this work within design research through visual examples, sketches, and reflective notes.

### 9. Conclusion: Seeing the Boundary

We opened by asking: *What relational possibilities are foreclosed when human–AI interaction collapses into instrumental tool-use?* The terrain provides an answer—but not the one we expected.

**The Findings**

Analysis of 562 conversations reveals that 97% of human interactions are instrumental, with only 3% attempting expressive engagement. Conversations with identical role pairings exhibit 82x variance in trajectory shape, yet cluster into just 7 relational patterns. Trajectory features—*how* participants move through role-space—account for 83.3% of pattern separation, suggesting that the path matters more than the starting position.

**The Foreclosure**

The foreclosure is not an asymmetry between user intent and system response. It is an *absence*. Users have learned not to attempt relational engagement. The 3% who try encounter instrumental responses, reinforcing the boundary. Current AI systems have successfully optimized for information exchange and trained users to comply. The terrain makes this visible: narrow functional corridors, missing expressive regions, a landscape shaped by design constraints we've naturalized.

**The Circularity**

We classified these roles using GPT-5.2 analyzing GPT-based conversations. The AI interprets its own relational possibilities—and consistently sees instrumental exchange. This methodological circularity is not a limitation; it's the contribution. It exposes how AI systems constrain not just what responses are possible, but what questions can be asked. The system cannot see beyond what it's trained to be. Making this constraint visible is the first step toward questioning it.

**The Opportunity**

Conversational Cartography is not diagnostic. It does not tell us which trajectories are "good" or "bad." Instead, it makes designed constraints *navigable*, turning implicit boundaries into explicit terrain. By visualizing what's missing—the absent valleys of mutual vulnerability, the uncharted peaks of reciprocal expressiveness—it stages encounters with the political dimensions of how we position ourselves, and are positioned, in relationships with AI.

The visualization does not solve the foreclosure. It makes it visible. And visibility is the condition for contestation.

> **[FIGURE 8: The Full Terrain]**
> * **Visual Suggestion:** A full 3D terrain view showing all 562 conversations overlaid. The instrumental corridor is densely packed with illuminated paths. The expressive region is nearly empty—a dark, unexplored landscape. A few scattered, faint traces mark the 3% who tried.
> * **Caption:** The foreclosure made visible: 97% of interactions cluster in instrumental corridors. The empty expressive terrain reveals not user preference, but trained absence—relational possibilities designed out of reach.
> * **Alt Text:** A dense visualization of all 562 analyzed conversations overlaid on the 3D terrain. A specific "corridor" on the map is glowing brightly, packed with hundreds of overlapping paths—this is the instrumental zone. The rest of the terrain is largely dark and empty, representing the "expressive" and "social" regions. This visual contrast strikingly shows how interactions are confined to a narrow functional range, leaving the rest of the relational landscape unexplored.

The question is not whether AI can be relational. The question is: *what would we have to unlearn* to make space for it?

---

## 🏁 Submission Notes

*   Follow the **DIS Pictorials template** and landscape format.
*   The **abstract** and **title page** are textual; the remainder should prioritize **high-quality annotated visuals** with short accompanying text.
*   Omit author names and affiliations for double-blind review.
*   Visuals should be accessible with alt text and clear legends.
