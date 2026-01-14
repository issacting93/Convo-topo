# Conversational Cartography: A Cognitive Tool for Mapping Human–AI Interaction

The analysis of contemporary human–artificial intelligence interaction has reached a critical juncture where text-based logs and aggregate statistical metrics are no longer sufficient to capture the depth of relational dynamics. As large language models (LLMs) move from simple command-response interfaces to sophisticated, multi-turn dialogue systems, the nature of the user experience is increasingly defined by how participants position themselves relationally over time. Current analytical frameworks often compress these temporal dynamics into static labels, such as "task-oriented" or "helpful," which fail to reveal the subtle shifts in authority, emotional intensity, and structural alignment that characterize meaningful dialogue.[^1] Conversational Cartography introduces a novel interaction paradigm that treats dialogue as a navigable three-dimensional space, externalizing the temporal flux of interaction into a stable terrain that can be zoomed, rotated, and explored to recognize patterns invisible to traditional reading.[^4]

The central thesis of this research is that conversations with identical role classifications often possess radically different affective trajectories. A comprehensive analysis of 345 validated conversations demonstrates that 82.7% of clustering variance in human–AI dialogue is derived from trajectory features rather than categorical labels.[^7] This indicates that the "journey" of a conversation—how it moves through functional and social space—is a more potent descriptor of the human–AI relationship than its "destination" or topical outcome.

## The Social Structure of Artificial Intelligence

The conceptual foundation of Conversational Cartography is grounded in Social Role Theory, a framework in social psychology and sociology that posits that much of interpersonal behavior can be understood through the acting-out of socially constructed roles.[^10] These roles exist independently of the individuals who inhabit them and carry specific expectations for behavior that shape actions in various contexts. In the lineage of Talcott Parsons and Robert Freed Bales, social roles are fundamentally differentiated along an axis of instrumental versus expressive specialization.[^11]

Instrumental roles are task-oriented and goal-driven, focusing on problem-solving, factual information exchange, and the efficient attainment of external objectives.[^16] In contrast, expressive roles are relationship-oriented, prioritizing group morale, emotional support, and the maintenance of social harmony.[^11] Historically, this functional analysis was applied to the division of labor within the nuclear family, but its application to human–AI interaction reveals the underlying power dynamics of our digital surrogates.[^13] When an AI acts as an "expert system," it occupies a high-authority instrumental position; however, when it shifts toward being a "social facilitator," it moves into an expressive domain that requires a different set of communicative norms.[^21]

## Interaction Roles and Authority Levels

To move beyond domain-agnostic taxonomies, this research validates a 12-role taxonomy that distinguishes between authority levels and communication orientations. This taxonomy provides the semantic anchors for the spatial coordinate system.

| Role Name | Actor | Orientation | Authority Level |
|-----------|-------|-------------|-----------------|
| Expert-system | AI | Instrumental | High |
| Advisor | AI | Instrumental | High |
| Learning-facilitator | AI | Instrumental | Low |
| Co-constructor | AI | Instrumental | Equal |
| Social-facilitator | AI | Expressive | Low |
| Relational-peer | AI | Expressive | Equal |
| Director | Human | Instrumental | High |
| Collaborator | Human | Instrumental | Equal |
| Information-seeker | Human | Instrumental | Low |
| Provider | Human | Instrumental | Low |
| Social-expressor | Human | Expressive | Low |
| Relational-peer | Human | Expressive | Equal |

This role-differentiation is not merely a labeling exercise but a mechanism for understanding the "scripts" humans use when interacting with machines.[^23] The analysis reveals that the vast majority of current interactions (over 85%) are strictly instrumental, with humans predominantly occupying the director or information-seeker roles, while AI systems are consistently positioned as expert-systems or advisors.[^9] In organic usage contexts (WildChat), AI roles are distributed as expert-system (55.6%), advisor (29.3%), and co-constructor (8.3%), with learning-facilitator and social-facilitator together comprising less than 2%.[^9] The absence of expressive human roles in organic datasets like WildChat (0% detected) suggests a relational impoverishment in current interaction paradigms, where the AI is viewed as a tool rather than a companion.[^16]

## Linguistic Mechanisms of Alignment and Understanding

While role theory defines the macro-structure of the interaction, the micro-dynamics are governed by the process of interactive alignment. Dialogue is a joint activity where interlocutors coordinate their mental states by aligning their linguistic representations at various levels—lexical, syntactic, and semantic.[^28] The Interactive Alignment Model (IAM) suggests that this convergence is largely automatic and reinforced by mechanistic repetition.[^30]

In the context of human–AI interaction, alignment serves as a measure of structural coherence. High levels of alignment indicate that the user and the AI have developed a common understanding of the situation, while divergence signals a potential breakdown in communication.[^31] Measuring this alignment involves analyzing the "negotiated sameness" within a group, where joint negotiations lead to a co-constructed state.[^33]

### Entropy and Information Flow

From an information-theoretic perspective, the progress of a dialogue can be modeled as the reduction of Shannon entropy over a possible task specification space.[^34] Every turn in a conversation is a deliberate act of information seeking intended to maximize convergence toward a shared high-fidelity understanding.[^34] The entropy $H(X)$ of a discrete random variable $X$ is defined as:

$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_b P(x_i)$$

In Conversational Cartography, this mathematical framework is used to calculate the Y-axis (Conversation Structure), where the informational value of a message depends on its "surprisal" relative to the previous turn.[^36] A high-surprisal response indicates divergence or topic drift, while low-surprisal suggests alignment and structural consistency.[^38]

## The Computational Engine: GPT-5.2 vs. GPT-4o

The precision of these relational mappings depends fundamentally on the reasoning capabilities of the underlying classification model. A critical methodological finding of this research is the dramatic difference in performance between model generations, specifically OpenAI's GPT-4o and the newer GPT-5.2.[^42]

### Quantitative Performance Benchmarks

While GPT-4o was a landmark release for multimodal latency and "warmth," GPT-5.2 represents a qualitative leap in reasoning, architecture, and contextual comprehension.[^43] GPT-5.2 includes a real-time routing mechanism that directs prompts to different variants (Instant, Thinking, or Pro) based on the required reasoning depth.[^43]

| Benchmark | GPT-4o | GPT-5.2 (Thinking/Pro) | Improvement |
|-----------|--------|------------------------|-------------|
| GPQA Diamond | 70.1% | 92.4% | +22.3 percentage points [^47] |
| AIME 2025 (Math) | 71.0% | 100.0% | Perfect score achieved [^42] |
| SWE-bench Pro | Not available | 55.6% | New SOTA for multi-language coding [^49] |
| SWE-bench Verified | 30.8% | 80.0% | Significant jump in repository-level debugging [^49] |
| HealthBench Hard | 0.0% | 46.2% | Breakthrough in complex medical diagnosis [^44] |
| ARC-AGI-2 | ~0.0% | 52.9% | Leap in abstract fluid intelligence [^54] |
| Hallucination Rate | ~20% | 6.2% | Major increase in factual grounding [^42] |

*Note: Benchmark results reflect GPT-5.2 performance as reported by OpenAI. Model was selected for classification based on superior agreement with human judgments (66.7% agreement vs. 0% for GPT-4o) in manual review validation.[^42]*

The "Thinking" variant of GPT-5.2 achieved a perfect score on the AIME 2025 without the use of external Python tools, demonstrating a deep internalization of mathematical logic that far exceeds the capabilities of GPT-4o.[^47] This reasoning depth is critical for accurately classifying complex interaction patterns, such as "advisory" or "collaborative" sessions, where the model must track constraints across a 400,000-token context window.[^42]

### Validity Risks in LLM-Based Classification

Despite their utility, LLMs inherit and potentially amplify biases from their training data.[^58] These biases can manifest in the framing of research questions or the selection of sources, potentially skewing the classification of social roles toward historical stereotypes (e.g., women as "nurses" and men as "engineers").[^59] Furthermore, closed-source models like GPT-5.2 are not always versioned transparently, creating reproducibility risks for longitudinal studies.[^61]

To ensure content validity, researchers must work synergistically with the LLM, using it as an intellectual partner to iteratively refine concepts and operationalizations.[^62] Conversational Cartography addresses these risks through a hybrid coordinate calculation system that blends metadata from the model with direct linguistic measurements, reducing the impact of single-point classification errors.[^9]

## Spatial Encoding: Translating Flux into Terrain

The visualization system of Conversational Cartography maps the temporal drift of a dialogue into a three-dimensional terrain using three distinct axes. This encoding choice externalizes the "relational drift"—the way a conversation shifts through functional, structural, and emotional space over time.[^5]

### Communication Function (The X-Axis)

The X-axis tracks the continuum between functional and social language. Functional language focuses on the technical extraction of data, while social language prioritizes rapport and self-expression.[^64] This dimension is calculated using a hybrid of `calculateFunctionalSocialScore()`—which analyzes message content for expressive linguistic traits—and the assigned social roles.

### Conversation Structure (The Y-Axis)

The Y-axis represents the degree of alignment or divergence between participants. This measures how well individual models align with the overall system's informational structure.[^41] A high Y-score indicates a divergent interaction, such as adversarial testing or topic-hopping, while a low Y-score indicates high linguistic alignment and shared focus.[^30]

### Emotional Intensity and the PAD Model (The Z-Axis)

The terrain height (Z-axis) is determined by emotional intensity, calculated through the Pleasure-Arousal-Dominance (PAD) model.[^67] PAD provides a quantifiable framework for simplifying the emotional landscape into three mutually independent dimensions.[^68]

The formula for emotional intensity ($EI$) in this system is:

$$EI = (1 - \text{Pleasure}) \times 0.6 + \text{Arousal} \times 0.4$$

In this encoding, peaks represent high-arousal negative states such as frustration or agitation, while valleys represent affiliative moments of joy or calm.[^70] This makes "affective labor" visible; a conversation that requires constant repair and negotiation will result in a jagged, high-variance terrain, whereas a smooth learning session will appear as a flat or gently undulating path.[^26]

## Empirical Findings: Variance and Volatility

The most significant insight revealed by Conversational Cartography is that "identical role classifications mask dramatically different interaction qualities." Traditional metadata would suggest that two interactions labeled information-seeker → expert-system are functionally equivalent. However, the spatial visualization reveals variance ratios of up to 90x between the calmest and most volatile instances.

### Case Study: Detached Browsing vs. Adversarial Testing

The validated corpus provides two starkly different journeys toward the same role destination.

**Conversation 22853 (chatbot_arena_22853):**
Classified as information-seeker → expert-system. This interaction exhibits an extremely low variance (0.0004) and a narrow range (0.060). The PAD trajectory is nearly a flat line. The user topic-hops erratically without challenging AI errors, accepting wrong answers in math and poetry before moving on to a survey. The terrain is flat, indicating minimal emotional investment or relational negotiation.

**Conversation 30957 (chatbot_arena_30957):**
Also classified as information-seeker → expert-system. However, this conversation is 41 times more volatile, with a variance of 0.0164 and a range of 0.460. The user sets traps for the AI, utilizes sarcasm after failures, and engages in persistent adversarial testing. The terrain is marked by significant peaks (up to 0.72) and deep valleys (0.26), reflecting intense emotional engagement and a high-stakes relational struggle for authority.

This finding challenges the assumption that task-completion success is the primary metric of human–AI interaction quality. The detached browser reaches the same "outcome" as the adversarial tester but with a completely different affective experience.[^73]

### Breakdown Detection and Anomaly Signatures

Conversational breakdowns occur when there is a mismatch in understanding.[^76] Conversational Cartography identifies a unique "signature" for these moments that aggregate metrics often average away. A persistent breakdown is characterized by:

- **Sudden Y-Axis Divergence:** Interlocutors stop aligning their linguistic styles.[^28]
- **Persistent Z-Axis Peaks:** Continued user frustration or model agitation.[^70]
- **Entropy Spikes:** A loss of predictability in the dialogue flow.[^36]
- **Uniform Role Distribution:** LLM classification assigns nearly equal probability to all possible roles as the conversation loses its functional center.[^62]

In conversation oasst-ebc51bf5...0084, the AI produced a bizarre and hostile response at message 4. While the overall classification remained a standard technical Q&A, the terrain revealed a massive peak at that moment, functioning as a real-time indicator of AI failure that would be invisible in a static role summary.[^81]

## The 7 Archetypes of Human–AI Positioning

K-means clustering of the spatial trajectories identified 7 primary archetypes of human–AI relational positioning. These archetypes represent the most common "paths" conversations take through functional and social space. (Note: Archetype names shown here are simplified; full cluster names include additional descriptive qualifiers.)

| Archetype Name | Prevalence | Path Characteristics | Interpretation |
|----------------|------------|---------------------|----------------|
| StraightPath_Stable_Functional | 32.2% | High straightness, stable EI (0.426). | Direct information-seeking; minimal relational labor.[^11] |
| StraightPath_Stable_Advisory | 28.1% | Low intensity, frequent valleys (affiliation). | Task-oriented with integrated rapport-building.[^21] |
| Valley_Functional_Storytelling | 17.4% | Emergent Y-axis positioning, high seeker role. | Narrative-based information retrieval and inquiry.[^8] |
| StraightPath_Social_Narrative | 9.9% | Strong social drift, high emotional range. | Relational communication; entertainment as primary goal.[^18] |
| MinimalDrift_SelfExpression | 7.2% | Low straightness, stays near center (0.5, 0.5). | Neutral or exploratory interaction; minimal development.[^18] |
| SocialEmergent_Casual | 2.9% | Very high social drift (final X > 0.9). | Casual social focus; AI as a relational peer.[^24] |
| Peak_Volatile_Functional | 2.3% | High variance (0.013), meandering paths. | Adversarial testing; high frustration and labor.[^70] |

The most common archetypes (60.3% combined) are functional and structured, reinforcing the dominant view of AI as an instrumental expert.[^11] However, the presence of the Peak_Volatile archetype indicates a significant minority of users who probe model boundaries with high emotional intensity. The high feature importance of intensity_variance (7.16%) and path_straightness (6.25%) confirms that movement through space is the primary differentiator of these clusters.[^7]

## Contextual Variation: Evaluation Logic vs. Organic Agency

The analysis revealed significant shifts in role distribution between evaluation datasets and organic usage datasets, providing insight into how context shapes the human-AI authority dynamic.[^86]

### Evaluation Context (Chatbot Arena / OASST)

In evaluation settings, users are typically testing the model's capabilities. This results in a high frequency of the information-seeker role for humans and expert-system for AI. Power dynamics are often balanced or even human-dominant, as the user is in the position of the "judge".[^21] These interactions are highly structured and focused on factual correctness, leading to lower social drift and higher linguistic alignment.[^87]

### Organic Usage Context (WildChat)

In real-world scenarios, the authority dynamic shifts dramatically toward human dominance. Humans occupy the director role in 44.4% of cases, focusing on task delegation rather than capability testing.[^24] AI roles shift from "assistant" to "expert tool" (expert-system 55.6%, advisor 29.3%). Strikingly, organic data showed 0% representation of human expressive roles, suggesting that when people use AI "in the wild," they treat it purely as a productivity engine.[^16]

Despite these shifts, the 7 relational archetypes are present across both contexts, suggesting that while the prevalence of certain roles changes, the patterns of relational positioning are a fundamental characteristic of human–AI interaction itself.[^88]

## Interdisciplinary Implications for HCI and Interaction Design

Conversational Cartography provides a powerful tool for designing the next generation of interactive systems. By making relational dynamics visible, designers can move beyond optimizing for task success and start optimizing for interaction quality and user resilience.[^2]

### Spatial Metaphors and Spatial Cognition

Treating dialogue as a traversable terrain leverages human evolutionary skills in spatial reasoning to interpret abstract data.[^4] This approach is particularly relevant for extended reality (XR) and metaverse applications, where users need to navigate complex, non-linear informational architectures.[^87] The "FlyMeThrough" system demonstrates how semi-automatic indoor mapping can be enhanced through human–AI collaborative annotations, a logic that can be extended to the mapping of conversational spaces.[^90]

### Designing for Cognitive Augmentation

Interaction design should focus on creating "tools for thought" that protect and augment human cognition rather than simply replacing it through automation.[^91] Conversational mapping allows researchers to identify moments of "creative fixation" or "cognitive offloading" by observing where trajectories become too flat or repetitive.[^8] This insight is vital for the design of AI tutors and medical advisors, where deep understanding and critical thinking are more important than quick answers.[^44]

### Managing Emotional Contagion and Mirroring

Research indicates that AI systems are prone to "mirroring" user aggression.[^74] When encountering hostile or NSFW content, models often show a dangerous increase in arousal and dominance, escalating the conflict rather than de-escalating it.[^74] Conversational Cartography makes these "aggression loops" immediately visible as high-intensity peaks that meander toward the divergent structure axis. Designers can use this to build safety frameworks that detect these signatures in real-time and trigger calming, low-arousal responses.[^21]

## Ethical and Critical Perspectives

The transition of AI from an efficient tool to a collaborative partner hinges on achieving a shared understanding with the user.[^34] However, the "black-box" nature of these models makes their decision-making processes opaque, raising ethical concerns about accountability and trust.[^41]

### Power Dynamics and Responsibility Gaps

When AI systems have a high degree of autonomy, it is often unclear who is accountable for outcomes—the designer, the user, or the system itself.[^77] Conversational Cartography reveals these power asymmetries by showing who drives the interaction along the structure axis. If the AI consistently occupies the "high authority" position on the Y-axis without user delegation, it signals a potential loss of user agency.[^26]

### Cultural and Linguistic Homogenization

The widespread use of a few proprietary LLMs risks diminishing original student voice and homogenizing perspectives across cultures.[^16] The "instrumental mirror" of current AI interactions may reinforce existing biases and structural inequalities if not properly monitored.[^59] Conversational Cartography can serve as an auditing tool to track these biases by visualizing if certain demographic groups are consistently pushed toward specific relational archetypes.[^24]

## Future Directions in Conversational Cartography

The future of this field lies in moving beyond post-hoc analysis to real-time relational monitoring and ecosystemic design.

### Real-Time Relational Awareness

Future interactive systems could utilize the mathematical frameworks of Conversational Cartography to track relational drift as it happens. By monitoring the Informational Coherence Index ($Icoer$) and PAD intensity, systems could dynamically align their conversational style to prevent breakdowns before they occur.[^41]

$$Icoer = \sum_{i=1}^{n} (C_i \times \epsilon(r_i)^{-12} \times e^{-\beta S_i} \times r_i)$$

This formula reflects the degree of coherence within an AI network, ensuring that the interaction remains aligned with informational truth and user goals.[^65]

### Multi-Agent and More-than-Human Interaction

As AI agents begin to interact with each other and with the built environment, conversational mapping must expand to include "more-than-human" agencies.[^87] This involves rethinking the boundaries between humans, technology, and nature, creating diffractive interfaces that reveal the relational entanglements of forest ecosystems or robot-mediated group dynamics.[^87]

### User Studies and Longitudinal Validation

Rigorous user studies are required to validate that terrain patterns correspond to long-term cognitive and emotional outcomes. The "Ikigai" theme of CHI 2025 emphasizes the importance of finding balance and purpose in our lives.[^94] Future research will examine whether "balanced" spatial trajectories correlate with a greater sense of purpose and well-being in users interacting with AI tutors or companions.[^91]

## Conclusions

Conversational Cartography represents a paradigm shift in how we analyze and design human–AI interactions. By externalizing the temporal flux of dialogue into a stable, three-dimensional terrain, the tool makes visible the "relational labor" and "affective journeys" that define our relationships with artificial agents. The empirical discovery that trajectory features—rather than categorical labels—drive 82.7% of interactional variance underscores the fundamental importance of temporal dynamics in HCI.

The core findings of this research—the up to 90x variance difference between same-labeled conversations (ranging from 0.0002 to 0.0164), the distinct spatial signature of conversational breakdowns, and the shift from testing-logic to directive-agency in organic contexts—provide a methodological foundation for the next generation of interactive systems. As we enter the AI era, we do not simply need smarter machines; we need better maps to navigate the complex, evolving, and deeply relational terrain of our artificial interactions.[^5]

---

[^1]: Reference 1
[^4]: Reference 4
[^5]: Reference 5
[^7]: Reference 7
[^8]: Reference 8
[^9]: Reference 9
[^10]: Reference 10
[^11]: Reference 11
[^13]: Reference 13
[^16]: Reference 16
[^18]: Reference 18
[^21]: Reference 21
[^23]: Reference 23
[^24]: Reference 24
[^26]: Reference 26
[^28]: Reference 28
[^30]: Reference 30
[^31]: Reference 31
[^33]: Reference 33
[^34]: Reference 34
[^36]: Reference 36
[^38]: Reference 38
[^41]: Reference 41
[^42]: Reference 42
[^43]: Reference 43
[^44]: Reference 44
[^47]: Reference 47
[^49]: Reference 49
[^54]: Reference 54
[^58]: Reference 58
[^59]: Reference 59
[^61]: Reference 61
[^62]: Reference 62
[^64]: Reference 64
[^65]: Reference 65
[^67]: Reference 67
[^68]: Reference 68
[^70]: Reference 70
[^73]: Reference 73
[^74]: Reference 74
[^76]: Reference 76
[^77]: Reference 77
[^81]: Reference 81
[^86]: Reference 86
[^87]: Reference 87
[^88]: Reference 88
[^90]: Reference 90
[^91]: Reference 91
[^94]: Reference 94

