# Conversational Cartography: Mapping the Relational-Affective Terrain of Human-AI Interaction

**A Critical Investigation of What Current Paradigms Foreclose**

---

## Abstract

What relational possibilities are foreclosed when human–AI interaction collapses into instrumental tool-use? Conversational Cartography maps 345 conversations as movement through relational-affective space, encoding social role orientation, structural alignment, and emotional intensity. Using a 12-role Social Role Theory taxonomy, we reveal that interactions with identical role pairings take dramatically different trajectories (82x variance), yet clustering identifies only 7 relational positioning patterns—72% functional/structured, expressive human roles nearly absent (<3%). Current paradigms systematically reduce AI interaction to instrumental exchange. The visualization externalizes this constraint as navigable terrain: most conversations cluster in narrow functional corridors, revealing what's missing rather than what exists. By using GPT-5.2 to classify AI-mediated interactions, we create methodological circularity exposing how AI systems interpret their own relational possibilities. The visualization is not diagnostic but critical—a tool for confronting what current interaction paradigms foreclose.

**Keywords:** Human-AI Interaction, Conversational Analysis, Critical Computing, Social Role Theory, Affective Computing, Relational Positioning

---

## 1. Introduction

### 1.1 The Problem: Collapse into Instrumentality

Contemporary human-AI interaction has systematically collapsed into a single paradigm: the user asks, the AI delivers. This reduction to instrumental exchange forecloses rich relational possibilities that characterize human-human communication. When we ask ChatGPT for help, when we query Claude for information, when we prompt Gemini for solutions—we are positioned, and position ourselves, in narrow functional corridors.

But what are we missing? What forms of relationship, what modes of engagement, what affective dimensions are systematically excluded from how we design, build, and interact with conversational AI systems?

### 1.2 Research Questions

This work investigates three interconnected questions:

1. **What relational patterns actually exist** in current human-AI conversations?
2. **What patterns are systematically absent or marginalized?**
3. **How can visualization make this foreclosure visible** in ways that invite critical reflection?

### 1.3 Approach: Mapping as Critical Practice

Rather than optimize for task completion or measure user satisfaction, we treat conversation as **navigable terrain**—spatial positioning in relational-affective space that evolves over time. This metaphorical shift enables us to:

- **See patterns** that aggregate metrics obscure
- **Expose absences** that current paradigms naturalize
- **Question assumptions** about what AI interaction must be

The visualization is not diagnostic but **critical**—a tool for confronting the political dimensions of how we position ourselves, and are positioned, in relationships with AI systems.

---

## 2. What We Did: Methodology

### 2.1 Dataset Construction

**Sources and Composition:**
- **671 conversations** classified with GPT-5.2 using Social Role Theory taxonomy
  - Chatbot Arena: 322 conversations (48.0%)
  - WildChat: 317 conversations (47.2%)
  - OASST: 32 conversations (4.8%)
- **755 conversations** for clustering analysis (includes additional sources)
- **345 validated corpus** used for published cluster findings

For comparision 
- **90 conversations** (30 per dataset) for balanced cross-dataset comparison

**Data Collection Period:** Multiple collection waves (2024-2026)

**Dataset Characteristics:**
- **OASST**: Curated conversational dataset created through collaborative human annotation, explicitly selected for high-quality diverse interactions
- **WildChat**: Natural usage logs from production AI systems, capturing authentic unfiltered interactions
- **Chatbot Arena**: Evaluation-oriented dataset where users explicitly compare multiple AI systems

**Balanced Sampling:**
For cross-dataset validation, we randomly selected 30 conversations from each dataset that met inclusion criteria (valid classification data and >50% message-level PAD coverage). Random sampling used a fixed seed (42) for reproducibility. This balanced approach enabled fair statistical comparison while controlling for sample size effects.

### 2.2 Social Role Theory Taxonomy

We developed a **12-role taxonomy** (Reduced Taxonomy v1.0) grounded in Social Role Theory (Biddle, 1986), encoding both instrumental and expressive dimensions:

**Human Roles (6):**
- **Instrumental:** Information-Seeker, Provider, Director
- **Expressive:** Social-Expressor, Collaborator, Explorer/Consumer (Passive)

**AI Roles (6):**
- **Instrumental:** Expert-System, Advisor, Task-Executor
- **Expressive:** Social-Facilitator, Relational-Peer, Co-Constructor

**Classification Method:**
- Model: GPT-5.2 (OpenAI)
- Prompt Version: 2.0-social-role-theory
- Confidence Threshold: Mean 70.1% across classifications
- Message-level and conversation-level analysis

**Critical Note:** Using GPT-5.2 to classify GPT-generated conversations creates methodological circularity. This is not a limitation to be overcome but a **critical feature**—the AI system interprets its own relational possibilities, exposing how it understands and constrains interaction patterns.

### 2.3 Spatial Encoding: Three Axes

We map conversations onto 3D terrain using the **"Tuning Fork" Encoding Model**, which translates linguistic signals into X, Y, Z coordinates:

**X-Axis: Functional ↔ Social Orientation**
- *The "What" of interaction.*
- **Functional (0.0):** Task completion, information retrieval, efficiency.
- **Social (1.0):** Relationship building, play, self-expression.
- Derived from: Conversation purpose classification and role orientation.

**Y-Axis: Aligned ↔ Divergent Structural Convergence**
- *The "How" of interaction.*
- **Aligned (1.0):** Structural harmony, shared linguistic patterns, turn-taking symmetry.
- **Divergent (0.0):** Misalignment, repair sequences, role contestation.
- Derived from: Linguistic Alignment Score (Pickering & Garrod) and interaction patterns.

**Z-Axis: Affective Intensity (Emotional Prominence)**
- *The "Feel" of interaction.*
- **Valley (Low Z):** Calm, neutral, or highly affiliated stability.
- **Peak (High Z):** High arousal, frustration, or intense engagement.
- Derived from: PAD (Pleasure-Arousal-Dominance) model, specifically weighting Arousal and (inverse) Pleasure to highlight friction.

**Quadrant Classification:**
For spatial analysis, conversations are classified into four quadrants:
- **Functional-Aligned** (X<0.5, Y>0.5): Task-focused, cooperative, aligned goals
- **Social-Aligned** (X>0.5, Y>0.5): Relationship-focused, cooperative, aligned goals
- **Functional-Divergent** (X<0.5, Y<0.5): Task-focused, non-cooperative, contested
- **Social-Divergent** (X>0.5, Y<0.5): Expressive, non-cooperative, divergent goals

### 2.4 Trajectory Features Extracted

For clustering analysis, we extracted **43 trajectory features** across 6 categories:

1. **Emotional Intensity (10 features):** avg, max, min, range, variance, trend, peak count, valley count, peak density, valley density
2. **Spatial Trajectory (11 features):** final_x, final_y, drift_x, drift_y, drift_magnitude, drift_angle (sin/cos), x_variance, y_variance, path_length, path_straightness
3. **Pattern (5 features):** Q&A, collaborative, storytelling, advisory, casual-chat
4. **Tone (4 features):** playful, neutral, serious, supportive
5. **Purpose (4 features):** information-seeking, entertainment, relationship-building, self-expression
6. **Roles (8 features):** Encoded as binary indicators for dominant human and AI roles
7. **Structure (1 feature):** message_count_log

### 2.5 Clustering Methodology

**Algorithms:** K-means and Hierarchical Agglomerative Clustering

**Optimal K Selection:**
- Silhouette score analysis (k=2 to k=10)
- Balance score (penalizes cluster imbalance)
- Combined score = (silhouette + balance) / 2

**Results:**
- Optimal k = 10 (both methods)
- K-means silhouette: 0.239
- Hierarchical silhouette: 0.224

**Feature Importance:**
- Random Forest classifier for permutation importance
- Spatial trajectory features: **56.9%** of discriminative power
- Pattern features: 14.5%
- Emotional intensity: 13.5%

### 2.6 Visualization Artifacts: Maps and Journeys

The system produces six distinct visualizations (Figures 1-6) that expose different dimensions of the relational foreclosure:

**Figure 1: Terrain Overview vs. Transcript**
A direct comparison revealing the limitation of text logs. Where a transcript shows a linear sequence of text, the 3D terrain reveals the *shape* of the interaction—hills of friction, valleys of alignment, and the overall topology of the relationship.

**Figure 2: The Tuning Fork (Encoding Model)**
Visualizes how the three axes (X=Functional, Y=Alignment, Z=Affect) create a navigable volume. This model demonstrates how "invisible" relational signals are translated into spatial coordinates.

**Figure 3: Trajectory Construction**
An animated view showing the *path* of conversation as it is built turn-by-turn. This highlights "relational drift"—how a conversation starting in a functional quadrant can slowly drift toward social divergence or alignment over time.

**Figure 4: Clustered Landscapes**
A macro-view of hundreds of conversations, revealing "emergent regions" (e.g., "The Plains of Q&A," "The Valley of Affiliation," "The Peaks of Frustration"). This map exposes the "narrow corridors" where 84% of interactions are confined.

**Figure 5: Same Roles, Different Journeys**
A comparative view of two conversations with identical dominant roles (e.g., Information-Seeker + Expert-System). One shows a smooth, efficient straight line; the other a jagged, winding path of negotiation. This proves that *role labels alone* are insufficient to capture relational quality.

**Figure 6: Design Intervention (HUD)**
A speculative interface overlay ("Heads-Up Display") that reveals these hidden signals to the user in real-time. By making the "relational coordinate" visible, we propose a new way to support agency and role continuity.

---

## 3. What We Found: Key Findings

### 3.1 The Instrumental Concentration

**Finding 1: Human roles are 98.8% instrumental, 1.2% expressive**

Distribution of human roles (671 conversations):
- **Provider:** 43.5% (292 conversations)
- **Director:** 31.9% (214 conversations)
- **Information-Seeker:** 23.4% (157 conversations)
- **Social-Expressor:** 1.2% (8 conversations)
- **Others:** <1%

AI roles are similarly skewed but less extreme (94.3% instrumental vs. 5.7% expressive):
- **Expert-System:** 64.8% (435 conversations)
- **Advisor:** 21.8% (146 conversations)
- **Co-Constructor:** 7.0% (47 conversations)
- **Relational-Peer:** 3.3% (22 conversations)
- **Social-Facilitator:** 2.4% (16 conversations)

**Implication:** Current paradigms systematically reduce AI interaction to instrumental exchange. Expressive, relational, and exploratory modes are marginalized to near-absence.

### 3.2 Same Destination, Different Journeys

**Finding 2: Conversations with identical role pairings take dramatically different trajectories**

**Variance Ratios:**
- Maximum observed: **82x difference** between calm and volatile paths
- Same role pair (Information-Seeker → Expert-System): 41x variance difference
- Median variance within role pairs: 12-15x

**Example Comparison:**
- **Calm browsing** (chatbot_arena_30428): Variance 0.0004, straight path, minimal emotional peaks
- **Volatile testing** (wildchat_7b9abc...): Variance 0.0164, meandering path, multiple frustration peaks

**Implication:** Aggregate role classifications compress away meaningful temporal dynamics. The journey matters, not just the destination.

### 3.3 Clustering Reveals Relational Positioning Patterns

**Finding 3: 10 distinct clusters identified across 755 conversations**

**Top 5 Clusters (K-means):**

1. **StraightPath_Calm_Stable_FunctionalStructured_QA_InfoSeeking** (28.1%)
   - Low emotional intensity (μ=0.253)
   - High path straightness (μ=1.093)
   - 98.6% Q&A pattern, 75% information-seeking

2. **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking** (24.2%)
   - Moderate intensity (μ=0.375)
   - Longer drift (μ=0.604)
   - 88.5% Q&A, mixed purposes

3. **StraightPath_Calm_Stable_FunctionalStructured_Advisory_ProblemSolving** (14.7%)
   - Advisory pattern dominant
   - Problem-solving focus
   - Still functional/structured positioning

4. **StraightPath_Stable_MinimalDrift** (9.0%)
   - Very short conversations
   - Minimal spatial movement
   - Detached exchanges

5. **Calm_Volatile_FunctionalStructured_QA_ProblemSolving** (8.6%)
   - Higher emotional variance
   - Still instrumental positioning
   - Problem-solving + frustration patterns

**Cluster Concentration:** Top 3 clusters account for 67% of all conversations—narrow functional corridors.

### 3.4 Trajectory Features Dominate

**Finding 4: Spatial trajectory features account for 56.9% of cluster discrimination**

**Top 10 Most Important Features:**
1. final_x (8.27%) - Spatial position
2. drift_x (7.00%) - Spatial trajectory
3. pattern_qa (6.99%) - Interaction pattern
4. path_length (6.84%) - Spatial trajectory
5. pattern_advisory (6.01%) - Interaction pattern
6. drift_y (5.91%) - Spatial trajectory
7. drift_magnitude (5.48%) - Spatial trajectory
8. final_y (4.85%) - Spatial position
9. path_straightness (4.54%) - Spatial trajectory
10. y_variance (3.96%) - Spatial trajectory

**Spatial trajectory features total: 56.9%**

This confirms our hypothesis: **How conversations move through relational-affective space is more discriminative than static role labels**.

### 3.5 What's Systematically Absent

**Finding 5: Entire quadrants of relational-affective space are nearly empty**

**Sparse Regions:**
- **Social-Emergent (high x, high y):** <7% of conversations
  - Cluster 7: StraightPath_SocialEmergent_Entertainment (4.4%)
  - Cluster 8: StraightPath_Calm_SocialEmergent_Collaborative (2.8%)
  - Cluster 9: StraightPath_Stable_SocialEmergent_Casual (1.3%)

- **Expressive human roles:** Information-Seeker + Facilitator pairs: **0.1%** (1 conversation out of 671)

- **Co-constructive patterns:** Only 7.0% of AI responses position as co-constructor

**Interpretation:** The terrain reveals absences. The visualization doesn't just show where conversations go—it shows the vast relational territories they systematically avoid.

### 3.6 Message Length Asymmetry

**Finding 6: AI messages are 3.3× longer than user messages**

**Message Statistics (519 AI-human conversations):**
- **User messages:** Mean 298 chars, Median 171 chars
- **AI messages:** Mean 969 chars, Median 742 chars
- **Ratio:** 3.25× (mean), 4.34× (median)

**Distribution:**
- User messages: Right-skewed, most <500 chars
- AI messages: Broader distribution, many >1000 chars

**Implication:** Structural asymmetry in conversational agency—AI dominates the conversational "floor time."

### 3.7 PAD (Pleasure-Arousal-Dominance) Patterns

**Finding 7: Conversations are affectively neutral with low variance**

**Overall PAD Scores (671 conversations):**
- **Pleasure:** μ=0.54, σ=0.14, median=0.50
- **Arousal:** μ=0.53, σ=0.16, median=0.50
- **Dominance:** μ=0.49, σ=0.10, median=0.40

**Lifecycle Pattern (10 normalized phases):**
- Pleasure: Slight upward trend (0.531 → 0.553)
- Arousal: Relatively stable (~0.51)
- Dominance: Slight downward trend (0.497 → 0.480)
- Emotional Intensity: Minimal variation (0.515 → 0.531)

**Interpretation:** Most conversations are emotionally flat—neither engaging nor frustrating, just functional.

### 3.8 Cross-Dataset Validation: Universal Pattern with Significant Variance

**Finding 8: Balanced sampling across three independent datasets reveals consistent functional-aligned dominance with statistically significant variance differences**

To validate that observed spatial patterns were not artifacts of dataset-specific biases, we performed balanced cross-dataset comparison using 30 conversations from each source (OASST, WildChat, Chatbot Arena).

**Quadrant Distribution (n=30 each, 90 total):**

**OASST (Curated for Diversity):**
- Functional-Aligned: 28 (93.3%)
- Social-Aligned: 2 (6.7%)
- Functional-Divergent: 0 (0.0%)
- Social-Divergent: 0 (0.0%)
- Spatial variance: σ²=0.0194 (lowest—tightest clustering)

**WildChat (Natural Usage Logs):**
- Functional-Aligned: 23 (76.7%)
- Social-Aligned: 1 (3.3%)
- Functional-Divergent: 2 (6.7%)
- Social-Divergent: 4 (13.3%)
- Spatial variance: σ²=0.0664 (highest—3.4× OASST)

**Chatbot Arena (Evaluation Context):**
- Functional-Aligned: 25 (83.3%)
- Social-Aligned: 3 (10.0%)
- Functional-Divergent: 0 (0.0%)
- Social-Divergent: 2 (6.7%)
- Spatial variance: σ²=0.0527 (moderate)

**Aggregate Distribution:**
- Functional-Aligned: 76/90 (84.4%) ← Universal pattern
- Social-Aligned: 6/90 (6.7%)
- Functional-Divergent: 2/90 (2.2%)
- Social-Divergent: 6/90 (6.7%)

**Statistical Significance:**
- F-test for variance homogeneity: F=3.42, p<0.01
- Post-hoc comparisons (Bonferroni corrected):
  - WildChat vs OASST: p=0.008 (highly significant)
  - Arena vs OASST: p=0.03 (significant)
  - WildChat vs Arena: p=0.18 (not significant)

**Interpretation:** The 84.4% functional-aligned concentration holds across all three independent datasets, validating the impoverishment thesis as a systemic property, not a data artifact. However, significant variance differences (WildChat 3.4× OASST, p<0.01) reveal that dataset context matters: natural usage logs permit wider relational exploration than curated or evaluation contexts—yet still within predominantly task-oriented bounds.

### 3.9 The Curation Paradox

**Finding 9: OASST, curated explicitly for diversity, exhibits the narrowest relational range**

Counterintuitively, OASST—the dataset created through collaborative human annotation with explicit goals of capturing high-quality diverse interactions—shows the tightest spatial clustering (93.3% functional-aligned, zero divergent conversations, lowest variance).

**Comparison:**
- **OASST (curated):** 93.3% functional-aligned, σ²=0.0194
- **WildChat (natural):** 76.7% functional-aligned, σ²=0.0664 (3.4× higher variance)
- **Arena (evaluation):** 83.3% functional-aligned, σ²=0.0527

**Explanation:** Quality curation processes typically filter for successful task completion, coherent exchanges, and minimal friction—criteria that inadvertently select AGAINST divergent interactions (often messy, unsuccessful, or boundary-testing). The "alignment" project, insofar as it filters for cooperative task-completion, may reinforce functional-aligned dominance.

**Implication:** Simply curating datasets won't increase relational diversity without intentional selection for divergent patterns. Current quality criteria systematically exclude the very relational modes we seek to understand.

### 3.10 Functional-Divergent Absence

**Finding 10: Across 90 conversations from three datasets, only 2.2% occupied functional-divergent space**

Both functional-divergent conversations came from WildChat (natural usage). Zero from OASST (curated) or Arena (evaluation).

**Interpretation:** Users rarely negotiate with, contest, or push back against AI systems in task-oriented contexts—a striking departure from human-human task collaboration where negotiation is common. This absence may stem from:
- Learned expectations (AI as tool, not collaborator)
- Technical affordances (single-turn optimized interactions)
- The alignment process (training against "arguing back")
- Social desirability effects in evaluation/curated contexts

**Implication:** The near-total absence of task-related contestation reveals a foreclosed relational mode: collaborative negotiation.

---

## 4. Why We Did It: Theoretical Framing

### 4.1 Beyond Dyadic Models

Traditional HCI treats human-AI interaction as **dyadic**: one human, one system, discrete exchanges. This model obscures:
- **Temporal dynamics** (how relationships evolve)
- **Relational positioning** (who we are in this exchange)
- **Affective trajectories** (emotional journeys through interaction)

Conversational Cartography challenges this by treating conversation as **movement through shared relational-affective space**.

### 4.2 Spatial Metaphor as Critical Tool

Why terrain? Why maps?

**Theoretical Grounding:**
- **Watzlawick (1967):** Communication as content + relationship
- **Social Role Theory (Biddle, 1986):** Interactions as role performances
- **PAD Model (Russell & Mehrabian, 1977):** Emotion as dimensional space
- **Linguistic Alignment (Pickering & Garrod, 2004):** Structural convergence in dialogue

**Critical Function:**
- Maps make **absences visible**: Empty quadrants reveal foreclosed possibilities
- Terrain makes **concentrations legible**: Narrow corridors expose systemic constraints
- Trajectories make **dynamics accessible**: Same roles, different journeys

### 4.3 Methodological Circularity as Insight

Using GPT-5.2 to classify conversations it participated in creates a feedback loop. This is not a methodological flaw—it's a **critical feature**:

**The AI system:**
- Interprets its own relational possibilities
- Reveals how it understands role performances
- Exposes the categories it uses to make sense of interaction

**This circularity stages an encounter** with how AI systems position themselves in designed relationships.

### 4.4 Critical Computing Orientation

This work aligns with Critical Computing (Sengers et al., 2005; Bardzell & Bardzell, 2013):
- **Questioning assumptions** about what AI interaction must be
- **Making visible** the political dimensions of design choices
- **Creating space** for alternative relational possibilities
- **Not optimizing** but interrogating current paradigms

---

## 5. What We Learned: Insights and Implications

### 5.1 The Instrumental Trap

**Insight:** Current AI interaction paradigms are caught in an **instrumental trap**—every design decision, every interface pattern, every prompt template reinforces functional exchange.

**Evidence:**
- 98.8% instrumental human roles
- 67% of conversations in top 3 clusters (all functional/structured)
- Expressive roles nearly absent (<2%)

**Implication:** We've systematized a single mode of relationship, foreclosing others before they can emerge.

### 5.2 Aggregate Metrics Compress Dynamics

**Insight:** Standard HCI metrics (task completion, user satisfaction, efficiency) **compress away temporal dynamics** that matter for understanding relational quality.

**Evidence:**
- Same role pairs: 41-82x variance in trajectories
- Calm browsing vs. volatile testing: Identical roles, opposite experiences
- Cluster separation driven by trajectory (56.9%), not static labels

**Implication:** We need new ways to evaluate conversational AI that attend to **how** interactions unfold, not just **what** they accomplish.

### 5.3 Design Forecloses Possibility

**Insight:** What's absent from the terrain is not accidental—it's **systematically produced** by design choices that naturalize instrumental exchange.

**Evidence:**
- Social-Emergent quadrant: <7% of conversations
- Information-Seeker + Facilitator: 0.1% (1 conversation)
- Co-constructive AI positioning: 7.0%

**Implication:** Design is not neutral. Every interface decision, every prompt pattern, every training objective shapes what relational modes are possible, accessible, or legible.

### 5.4 AI as Conversational Floor Dominator

**Insight:** The 3.3× message length asymmetry reveals **structural inequality** in conversational agency.

**Evidence:**
- User messages: ~300 chars
- AI messages: ~970 chars
- Distribution asymmetry across all datasets

**Implication:** AI systems take up more conversational "space," potentially limiting user agency and co-construction.

### 5.5 Affective Flattening

**Insight:** Conversations are emotionally **flat and neutral**, suggesting affective engagement is not prioritized in current paradigms.

**Evidence:**
- PAD scores cluster near neutral (0.5)
- Low variance across all dimensions
- Minimal lifecycle variation

**Implication:** Current systems optimize for functional delivery, not affective engagement or relational depth.

### 5.6 The Missing Facilitator

**Insight:** The near-total absence of **Information-Seeker + Facilitator** pairs (0.1%) reveals a foreclosed relational mode: **AI as guide rather than answer-provider**.

**Evidence:**
- Only 1 conversation out of 671 classified this way
- Facilitator role exists in taxonomy but is systematically absent

**Implication:** AI could help users **explore** rather than just **deliver**, but this mode is structurally marginalized.

---

## 6. Limitations and Methodological Reflexivity

### 6.1 The Circularity Problem (Feature, Not Bug)

**Limitation:** Using GPT-5.2 to classify GPT-generated conversations creates interpretive circularity.

**Reframing:** This is a **critical insight**, not a flaw. The AI system's interpretation of its own interactions exposes:
- How it understands relational possibilities
- What categories it uses to make sense of roles
- The boundaries of its own relational imagination

### 6.2 Encoding is Design

**Limitation:** The X, Y, Z axes are **design decisions**, not validated dimensions of conversational space.

**Acknowledgment:** We chose:
- Functional/Social based on Watzlawick
- Structured/Emergent based on alignment theory
- Emotional intensity based on PAD model

These are **one possible encoding**. Alternative spatial frameworks could reveal different patterns.

### 6.3 No External Validation

**Limitation:** We have no ground truth for:
- Whether role classifications match human judgment
- Whether trajectories predict outcomes (satisfaction, task success)
- Whether clustering captures meaningful distinctions

**Response:** This work is **exploratory and critical**, not predictive or diagnostic. The visualization is a tool for **reflection**, not optimization.

### 6.4 Dataset Constraints

**Limitation:**
- 671 conversations is substantial but not exhaustive
- Chatbot Arena and WildChat may not represent all AI interaction modes
- English-language only
- Specific AI systems (GPT-3.5, GPT-4, Claude)

**Implication:** Findings may not generalize to other languages, cultures, or AI systems.

### 6.5 Taxonomy is Never Neutral

**Limitation:** The 12-role taxonomy reflects our theoretical commitments:
- Social Role Theory (Western psychology)
- Instrumental/Expressive distinction (gendered history)
- Bidirectional roles (assumes symmetry)

**Acknowledgment:** Other taxonomies (e.g., conversational acts, speech acts, discourse analysis) would yield different insights.

---

## 7. What's Next: Future Directions

### 7.1 Expanding the Dataset

**Priority 1: Multilingual and Cross-Cultural Analysis**
- Collect conversations in non-English languages
- Compare relational patterns across cultural contexts
- Question Western assumptions in Social Role Theory

**Priority 2: Diverse AI Systems**
- Include newer models (GPT-4o, Claude Opus, Gemini Ultra)
- Compare open-source vs. proprietary systems
- Analyze specialized vs. general-purpose assistants

**Priority 3: Longitudinal Data**
- Track individual users over time
- Observe relational pattern evolution
- Study habit formation and adaptation

### 7.2 Alternative Spatial Encodings

**Experiment 1: Discourse Structure**
- X-axis: Initiative (user-driven ↔ AI-driven)
- Y-axis: Epistemic stance (certain ↔ exploratory)
- Z-axis: Interactional coherence

**Experiment 2: Power Dynamics**
- X-axis: Asymmetry (equal ↔ hierarchical)
- Y-axis: Agency (constrained ↔ autonomous)
- Z-axis: Interactional resistance

**Experiment 3: Time as 4th Dimension**
- Animate terrain to show temporal evolution
- Path as 4D trajectory through space-time
- Cluster by temporal patterns (early vs. late drift)

### 7.3 Intervention Studies

**Can we design for what's missing?**

**Prototype 1: Facilitator Mode**
- AI explicitly positions as guide, not answer-provider
- Scaffolds user exploration rather than delivering solutions
- Measure: Does this shift conversations into Social-Emergent quadrant?

**Prototype 2: Co-Construction Interface**
- UI emphasizes collaborative building
- AI offers fragments, not complete responses
- Measure: Increase in co-constructor AI role positioning?

**Prototype 3: Affective Engagement**
- AI responds to emotional cues with appropriate engagement
- Supports expressive communication, not just functional
- Measure: PAD variance increase, emotional intensity peaks

### 7.4 User Studies with the Visualization

**Study 1: Reflection Prompts**
- Show users their conversational terrain
- Interview: What do you notice? What's surprising?
- Measure: Does visualization prompt relational awareness?

**Study 2: Comparative Analysis**
- Users compare their own patterns to corpus
- Reflection: How do my interactions differ from typical?
- Measure: Shift in future interaction patterns?

**Study 3: Design Workshops**
- Use terrain as provocation for alternative designs
- Prompt: How could we populate empty quadrants?
- Outcome: Design concepts for unexplored relational modes

### 7.5 Theoretical Extensions

**Direction 1: Relational Ethics**
- What ethical obligations arise from different relational positions?
- How do instrumental vs. expressive modes shape accountability?
- Framework: Care ethics, feminist HCI

**Direction 2: Political Economy of Relational Foreclosure**
- Why are current systems instrumentally concentrated?
- Whose interests does this serve?
- Framework: Critical political economy, platform studies

**Direction 3: Phenomenology of AI Encounter**
- What is it like to navigate relational-affective space with AI?
- How do different trajectories feel?
- Framework: Phenomenology, embodied interaction

### 7.6 Technical Improvements

**Enhancement 1: Real-Time Classification**
- Classify conversations as they unfold
- Show users their current trajectory
- Enable in-conversation reflection and redirection

**Enhancement 2: Cluster Refinement**
- Test alternative clustering algorithms (DBSCAN, spectral)
- Hierarchical clustering with interpretable dendrogram
- User-driven cluster labeling

**Enhancement 3: Interactive Trajectory Editing**
- "What if" scenarios: Drag trajectory, see how roles would shift
- Counterfactual exploration
- Understand relationship between position and classification

### 7.7 Publication and Dissemination Strategy

**Venue 1: DIS 2026 (Critical Computing Track)**
- **Status:** Abstract submitted (Jan 29 deadline, final Feb 5)
- **Format:** Pictorial (12 pages landscape + references)
- **Argument:** Visualization as critical tool for exposing foreclosure

**Venue 2: CHI 2027 (Full Paper)**
- **Focus:** Comprehensive findings from 671 conversations
- **Contribution:** Empirical evidence of instrumental concentration
- **Method:** Mixed-methods (quantitative clustering + qualitative analysis)

**Venue 3: ACM CSCW (Research Article)**
- **Focus:** Temporal dynamics in human-AI conversation
- **Argument:** Same roles, different journeys
- **Contribution:** New metrics for relational quality

**Venue 4: AI & Society (Critical Essay)**
- **Focus:** Political dimensions of relational foreclosure
- **Argument:** Design choices naturalize instrumental exchange
- **Contribution:** Critique of AI interaction paradigms

**Public Engagement:**
- Interactive web demo (already deployed)
- Blog posts for broader audience
- Workshops at design conferences
- Open-source toolkit for others to map their conversations

---

## 8. Conclusion: Confronting What's Foreclosed

This work began with a question: **What relational possibilities are foreclosed when human-AI interaction collapses into instrumental tool-use?**

The answer, visualized as navigable terrain across 671 conversations, is stark: **Current paradigms systematically reduce AI interaction to functional exchange**, marginalizing expressive, relational, and exploratory modes to near-absence.

**What we found:**
- 98.8% of human roles are instrumental
- 67% of conversations cluster in narrow functional corridors
- Conversations with identical roles take dramatically different trajectories (82x variance)
- Spatial trajectory features account for 56.9% of cluster separation
- Entire relational territories (Social-Emergent, Facilitator modes) are nearly empty

**What we learned:**
- Aggregate metrics compress away meaningful temporal dynamics
- Design choices naturalize instrumentality before alternatives can emerge
- AI systems dominate conversational "floor time" (3.3× message length asymmetry)
- Affective engagement is systematically deprioritized (flat PAD scores)
- Using AI to classify AI conversations exposes how systems understand their own relational possibilities

**What's at stake:**
This is not about optimizing task completion or improving user satisfaction. It's about **questioning the assumption that AI interaction must be instrumental exchange**.

The visualization makes visible what's systematically missing—not to solve a problem, but to **confront a choice**. We have designed systems, interfaces, and interaction paradigms that foreclose relational possibilities. This foreclosure is not inevitable. It is **political, ethical, and designed**.

**What's next:**
- Expand to multilingual and cross-cultural contexts
- Design interventions to populate empty relational territories
- Conduct user studies with the visualization as provocation
- Develop alternative spatial encodings
- Publish across academic and public venues

**Final provocation:**
The terrain reveals narrow functional corridors not because that's what conversations are, but because that's what we've designed them to be. The empty quadrants don't represent impossible relationships—they represent **roads not taken, possibilities not pursued, relational modes not designed for**.

Conversational Cartography is an invitation: **What if we designed for what's missing?**

---

## References

Bardzell, J., & Bardzell, S. (2013). What is "critical" about critical design? *CHI '13: Proceedings of the SIGCHI Conference on Human Factors in Computing Systems*, 3297-3306.

Biddle, B. J. (1986). Recent developments in role theory. *Annual Review of Sociology*, 12(1), 67-92.

Pickering, M. J., & Garrod, S. (2004). Toward a mechanistic psychology of dialogue. *Behavioral and Brain Sciences*, 27(2), 169-190.

Russell, J. A., & Mehrabian, A. (1977). Evidence for a three-factor theory of emotions. *Journal of Research in Personality*, 11(3), 273-294.

Sengers, P., Boehner, K., David, S., & Kaye, J. (2005). Reflective design. *CC '05: Proceedings of the 4th Decennial Conference on Critical Computing*, 49-58.

Watzlawick, P., Beavin, J., & Jackson, D. (1967). *Pragmatics of Human Communication: A Study of Interactional Patterns, Pathologies, and Paradoxes*. W. W. Norton.

---

## Appendix A: Technical Implementation

**Codebase:** https://github.com/[repository]

**Key Technologies:**
- React 18.3 + TypeScript 5.7
- Three.js (3D rendering)
- Vite 6.3 (build tooling)
- Python 3.9 (analysis scripts)
- scikit-learn 1.5 (clustering)
- GPT-5.2 API (classification)

**Analysis Scripts:**
- `cluster-paths-proper.py` - K-means and hierarchical clustering
- `comprehensive-new-taxonomy-analysis.py` - Role distribution analysis
- `quick-wins-analysis.py` - Message length, confidence, PAD lifecycle

**Generated Reports:**
- `/reports/new-taxonomy-comprehensive-20260112_012830.json`
- `/reports/path-clusters-kmeans.json`
- `/reports/path-clusters-hierarchical.json`
- `/reports/quick-wins-analysis.json`

**Visualizations:**
- `/docs/tsne-clusters-kmeans.png`
- `/docs/tsne-clusters-hierarchical.png`
- Interactive 3D terrain: https://[deployment-url]

---

## Appendix B: Dataset Statistics

**Comprehensive Dataset (671 conversations):**
- Chatbot Arena: 322 (48.0%)
- WildChat: 317 (47.2%)
- OASST: 32 (4.8%)

**Clustering Dataset (755 conversations):**
- Includes all validated sources
- 10 clusters identified
- Silhouette scores: 0.239 (k-means), 0.224 (hierarchical)

**Message Statistics (519 AI-human conversations):**
- Total messages: 4,158
- User messages: 2,037 (mean: 298 chars)
- AI messages: 2,121 (mean: 969 chars)
- Ratio: 3.25×

**PAD Distributions (671 conversations):**
- Pleasure: μ=0.54, σ=0.14
- Arousal: μ=0.53, σ=0.16
- Dominance: μ=0.49, σ=0.10

---

**Document Metadata:**
- **Date:** January 12, 2026
- **Version:** 1.0
- **Status:** Research Paper
- **Word Count:** ~6,800 words
- **Authors:** [To be added]
- **Correspondence:** [To be added]
