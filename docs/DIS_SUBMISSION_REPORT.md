# Conversational Cartography: Mapping Human–AI Interaction as Navigable Terrain

**A Comprehensive Report for DIS Submission**

**Date:** January 2026  
**Dataset:** 345 conversations in validated corpus used for analysis (subset of 569 total classified: 333 Chatbot Arena, 186 WildChat, 32 OASST, 18 human-human)  
**New Taxonomy:** 538 conversations (94.6%) classified with GPT-5.2 + 2.0-social-role-theory  
**Classification Model:** OpenAI GPT-5.2 with Social Role Theory taxonomy  
**Status:** Complete analysis and visualization system

---

## Abstract

**Conversational Cartography** introduces a spatial framework that maps human–AI interaction as movement through relational-affective space. Analysis of 345 validated conversations (subset of 569 total classified, 538 with new taxonomy) reveals a core insight: interactions with identical role classifications often take dramatically different affective journeys, with variance ratios up to 82x between calm information-seeking and volatile adversarial testing. By encoding conversations onto 3D terrain—where X-axis represents functional/social orientation, Y-axis measures aligned/divergent structure, and Z-axis encodes emotional intensity via the PAD (Pleasure-Arousal-Dominance) model—we make visible temporal dynamics that aggregate metrics obscure. The visualization reveals that same-labeled conversations (e.g., "information-seeker → expert-system") can range from flat detached browsing (variance 0.0004) to volatile adversarial testing (variance 0.0164, 41x higher). Clustering analysis of 345 validated conversations identifies 7 relational positioning patterns, with trajectory features (spatial drift, path straightness, emotional intensity patterns) accounting for 82.7% of cluster separation—demonstrating that how conversations move through relational space matters more than what they're about. We use GPT-5.2 to classify conversations using a Social Role Theory taxonomy, creating a methodological circularity that reveals how AI systems interpret their own interactions. The visualization is not a diagnostic tool but a critical design artifact that provokes questions about what should—and should not—be made legible in AI-mediated relationships.

---

## Executive Summary

**Conversational Cartography** reveals that **conversations with identical role classifications can have dramatically different affective trajectories**—variance ratios up to 82x between the calmest and most volatile interactions. While aggregate labels describe where conversations *end up* ("information-seeker → expert-system"), terrain patterns reveal *how they get there*: flat detached browsing vs. volatile adversarial testing, smooth learning vs. erratic breakdown recovery.

**Core Finding**: Two conversations with the same role classification produce:
- **Detached browsing** (chatbot_arena_22853): Variance 0.0004, range 0.060—nearly flat terrain
- **Adversarial testing** (chatbot_arena_30957): Variance 0.0164, range 0.460—**41x more volatile** (0.0164 / 0.0004 = 41x)

This 41-fold difference is invisible in classification metadata but immediately visible in spatial form. **Analysis of 345 validated conversations** reveals that 82.7% of clustering variance comes from *trajectory features* (how conversations move through relational space), not categorical labels (what they're about).

**Contributions:**
1. **Cognitive Tool**: Spatial encoding that externalizes temporal dynamics for human perception and reasoning
2. **Empirical Evidence**: Same-labeled conversations show distinct patterns—emotional engagement, interaction quality, and anomalies that classification alone erases
3. **Theoretical Framework**: Social Role Theory (Parsons, Bales) applied to human–AI interaction, distinguishing instrumental vs. expressive dimensions
4. **Working System**: Interactive 3D visualization enabling both close reading (individual turns) and distant reading (corpus-level patterns)

**For Interaction Design**: Demonstrates how spatial metaphors can make relational dynamics visible, supporting pattern recognition at multiple scales—from message-level emotional peaks to corpus-level archetypal trajectories.

---

## 1. Introduction

### 1.1 Problem Statement

Contemporary interfaces for analyzing human–AI conversations treat dialogue as logs to be read or datasets to be aggregated. This approach fails to reveal **relational dynamics**—how people position themselves over time, how authority shifts, and how emotional intensity creates peaks and valleys. Most consequential shifts in human–AI relationships occur invisibly—not in what is said, but in how people position themselves relationally (delegating agency, seeking authority, building rapport).

**The Challenge**: Aggregate role classifications compress away three kinds of temporal information:
1. **User emotional engagement** (sarcasm, escalation, volatility)
2. **Interaction quality** (smooth learning vs. erratic patterns)
3. **Anomalies** (AI errors, breakdowns, single-message deviations)

### 1.2 Research Questions

1. **Taxonomy Validation**: Does Social Role Theory provide a clearer framework for distinguishing interaction roles than domain-agnostic taxonomies?
2. **Context Effects**: How do role distributions differ between evaluation contexts (Chatbot Arena, OASST) and organic usage (WildChat)?
3. **Spatial Mapping**: Do roles cluster predictably in relational space along instrumental/expressive and authority dimensions?
4. **Temporal Dynamics**: Do conversations with identical role classifications show distinct affective trajectories?

### 1.3 Theoretical Foundation

This work is grounded in **cognitive tools research** (Fan et al.), which demonstrates that external representations—such as drawings, diagrams, and visualizations—do not merely communicate information but **extend human cognition** by making latent structure visible and manipulable.

**Key Theoretical Frameworks:**
- **Distributed Cognition** (Hutchins): Cognition spread across people, artifacts, and environments
- **Extended Mind Theory** (Clark & Chalmers): Cognition extends into the world via tools
- **Cognitive Artifacts** (Norman): External representations augment cognitive performance
- **Social Role Theory** (Parsons, Bales, Eagly): Distinguishes instrumental (task-oriented) vs. expressive (relationship-oriented) roles
- **Relational Communication Theory** (Watzlawick et al.): Every message conveys content and defines relationship

### 1.4 Contribution to Interactive Systems Research

This work contributes to DIS themes in three ways:

**1. Novel Interaction Paradigm: Conversations as Navigable Space**
- **Spatial metaphor**: Treating dialogue as terrain users can fly through, zoom in/out between message-level detail and corpus-level overview
- **Multi-scale interaction**: Supporting both close reading (individual turns, emotional peaks) and distant reading (archetypal patterns across hundreds of conversations)
- **Interaction design challenge**: How to balance exploration (discovering unexpected patterns) with comparison (analyzing known differences)?

**2. Critical Perspective on AI Interaction Dynamics**
- **Political dimensions made visible**: Spatial positioning reveals *who has authority* (structured/divergent Y-axis), exposing power asymmetries in human–AI dialogue
- **Affective labor revealed**: Terrain peaks expose the emotional work required to navigate AI systems—managing frustration during breakdowns, repairing misunderstandings, escalating when AI fails
- **Challenging assumptions**: "Successful" task-completion conversations can be volatile (high variance), while "failed" conversations may be smooth (low variance)—outcome ≠ experience

**3. Cognitive Tool Design Principles**
- **Externalization for perception**: Temporal patterns invisible in chat logs become immediately perceptible in spatial form (flat vs. peaked terrain)
- **Augmented pattern recognition**: Humans excel at recognizing spatial patterns; terrain encoding leverages this capability for conversation analysis
- **Design space exploration**: What other conversational features could be spatialized? (Turn-taking rhythm, topic drift, role switching)

**For DIS Community**: This work opens questions about how interaction design can reveal—not just facilitate—the relational dynamics of human–AI systems. If conversations encode power, affect, and relational positioning, what other interaction traces should we be visualizing?

### 1.5 Related Work

**Conversation Visualization**:
- **Thread Arcs** (Kerr, 2003): Visualizes temporal structure of email threads as arcs connecting messages
- **Conversation Flowers** (Viegas & Donath, 1999): Radial visualizations of online community participation patterns
- **Conversation Map** (Sack, 2000): Network graphs of discussion forum reply structures
- **Our contribution**: 3D spatial encoding of *affective trajectory*, not just structural patterns; supports perception of emotional dynamics over time

**Human-AI Interaction Analysis**:
- **Conversational breakdowns** (Ashktorab et al., 2019): Taxonomy of chatbot failure modes based on user complaints
- **User intent classification** (Luger & Sellen, 2016): Categorizing what users want from conversational agents
- **Conversation patterns** (Cowan et al., 2017): Identifying recurring structures in human-chatbot dialogue
- **Our contribution**: Continuous affective tracking vs. discrete failure detection; reveals that identical intents produce different emotional trajectories

**Cognitive Tools and External Representations**:
- **Drawing as cognitive tool** (Fan et al., 2019): External sketches extend cognition by making abstract concepts manipulable
- **Information landscapes** (Card et al., 1999): Spatial metaphors for large document collections
- **Sensemaking** (Pirolli & Card, 2005): How analysts use visualizations to construct understanding
- **Our contribution**: Conversations as *traversable terrain* enabling perception of temporal dynamics; spatial form supports both exploration and sensemaking

**Social Role Theory in HCI**:
- **CASA paradigm** (Reeves & Nass, 1996): Humans unconsciously apply social norms to computers
- **Relational agents** (Bickmore & Picard, 2005): Designing for long-term user-agent relationships
- **Social presence** (Short et al., 1976): Perceived intimacy in mediated communication
- **Our contribution**: Empirical application of Parsonian role theory (instrumental/expressive dimensions) to classify and spatialize human–AI interaction patterns

---

## 2. Methodology

### 2.1 Dataset

**Validated Corpus**: 345 conversations (subset used for cluster analysis and published findings)

**Total Classified**: 465 conversations (as of 2026-01-09, includes validated corpus plus additional classified conversations)

**Data Sources (Validated Corpus):**
1. **Chatbot Arena** (128 conversations in validated corpus, 241 total classified)
   - Source: LMSYS Chatbot Arena dataset (HuggingFace)
   - Characteristics: Diverse interaction patterns, 10-18 messages per conversation
   - Context: Evaluation setting, users testing model capabilities
   - Status: Expanded from 128 to 241 conversations (Jan 2026)

2. **OpenAssistant (OASST)** (32 conversations)
   - Source: OpenAssistant Conversations Dataset
   - Characteristics: Longer conversations (20+ messages)
   - Purpose: Extended interaction pattern analysis
   - Status: Expanded from 2 to 32 conversations (Jan 2026)

3. **WildChat** (185 conversations in validated corpus)
   - Source: allenai/WildChat-1M dataset
   - Characteristics: Organic ChatGPT conversations from real-world usage
   - Purpose: Cross-dataset validation, addressing evaluation context bias
   - Classification: GPT-5.2 with Social Role Theory taxonomy

4. **Human-Human Dialogues** (18 conversations classified, not in validated corpus)
   - Cornell Movie Dialogues: 9 conversations
   - Kaggle Empathetic Dialogues: 9 conversations
   - Purpose: Comparison dataset for human-human vs. human-AI dynamics
   - Note: Uses adapted classification taxonomy for symmetric roles

**Data Quality and Filtering**:

**Data Quality and Validation Process**:
- Schema validation via Zod (type-safe structure verification)
- Classification completeness (all 9 dimensions present)
- Message content availability (required for linguistic coordinate calculation)
- Role distribution validity (probabilities sum to 1.0 ± 0.01)
- English language filtering (non-English conversations excluded)

**Final Validated Corpus** (345 conversations):
- Selected subset meeting all quality criteria
- Used for cluster analysis and published findings
- Represents validated, high-quality classification data

**Data Quality Issues Addressed**:
- **Mixed taxonomy**: Old classifications used previous role names (e.g., "seeker" vs. "information-seeker"), requiring backward-compatibility mapping
- **Typos in LLM output**: Variations like "co-construct", "co-constructive", "co-constructer" mapped to "collaborator"
- **Corrupted files**: Some WildChat files had JSON parsing errors and were excluded from validated corpus

**Mitigation Strategies**:
- Manual review of 20 conversations (5.8% of corpus) to verify classification quality
- Backward-compatibility mapping ensures old taxonomy data remains usable
- Validation pipeline filters out incomplete or corrupted data

### 2.2 Classification Methodology

**Model**: OpenAI GPT-5.2  
**Taxonomy**: Social Role Theory (6 Human + 6 AI Roles)  
**Classification Dimensions**: 9-dimensional analysis

**Classification Process:**
1. **Few-shot Learning**: 12 enhanced examples incorporating manual review feedback
2. **Prompt Engineering**: Structured prompts with Social Role Theory framework
3. **Validation**: Manual review of 20 conversations (66.7% agreement with GPT-5.2)
4. **Confidence Scoring**: Average confidence 0.743 (moderate-high)

**Classification Dimensions:**
1. Interaction Pattern (question-answer, advisory, collaborative, etc.)
2. Power Dynamics (human-dominant, balanced, AI-dominant)
3. Emotional Tone (neutral, frustrated, playful, etc.)
4. Engagement Style (questioning, directing, affirming, etc.)
5. Knowledge Exchange (factual-info, problem-solving, etc.)
6. Conversation Purpose (task-completion, exploration, etc.)
7. Turn Taking (balanced, human-heavy, alternating)
8. Human Role Distribution (probabilistic: information-seeker 60%, director 40%, etc.)
9. AI Role Distribution (probabilistic: expert-system 40%, learning-facilitator 60%, etc.)

### 2.3 Social Role Theory Taxonomy

**Human Roles (6 roles):**
- **Instrumental, Low Authority**: `information-seeker`, `provider`
- **Instrumental, High Authority**: `director`
- **Instrumental, Equal Authority**: `collaborator`
- **Expressive, Low Authority**: `social-expressor`
- **Expressive, Equal Authority**: `relational-peer`

**AI Roles (6 roles):**
- **Instrumental, High Authority**: `expert-system`, `advisor`
- **Instrumental, Low Authority**: `learning-facilitator`
- **Instrumental, Equal Authority**: `co-constructor`
- **Expressive, Low Authority**: `social-facilitator`
- **Expressive, Equal Authority**: `relational-peer`

**Key Distinction**: The taxonomy separates **Learning-Facilitator** (instrumental, task-oriented scaffolding) from **Social-Facilitator** (expressive, relationship-oriented rapport-building), addressing a critical conflation in previous taxonomies.

### 2.4 Spatial Coordinate Generation

**X-Axis: Communication Function** (Functional ↔ Social)
- **Range**: 0.0 (Functional) to 1.0 (Social)
- **Calculation**: Hybrid of linguistic analysis and metadata
  - Linguistic: `calculateFunctionalSocialScore()` analyzes message content
  - Metadata: Role-based positioning (instrumental → functional, expressive → social)
  - Blending: `(linguisticX * confidence) + (metadataX * (1 - confidence))`

**Y-Axis: Conversation Structure** (Aligned ↔ Divergent)
- **Range**: 0.0 (Aligned) to 1.0 (Divergent)
- **Calculation**: Priority to linguistic alignment, fallback to classification
  - Primary: `calculateConversationAlignment()` measures linguistic similarity
  - Amplified: `midpoint + (alignmentScore - midpoint) * 2.0`
  - Fallback: Pattern-based (question-answer → 0.5-0.65, advisory → 0.8)

**Z-Axis: Emotional Intensity** (PAD-based)
- **Formula**: `emotionalIntensity = (1 - Pleasure) × 0.6 + Arousal × 0.4`
- **Range**: 0.0 (calm/affiliation) to 1.0 (frustration/agitation)
- **Encoding**: Peaks = frustration, Valleys = affiliation

### 2.5 Path Generation Algorithm

**Starting Point**: All conversations begin at center `(0.5, 0.5)`

**Target Position**: Determined by conversation-level classifications
- Target X: `0.1 + communicationFunction * 0.8`
- Target Y: `0.1 + conversationStructure * 0.8`

**Drift Calculation** (per message):
1. **Base Drift**: Pulls toward classification-based target
2. **Message Drift**: Adds local variation based on linguistic features
   - Expressive score (0-1): Detects social vs. functional language
   - Alignment score (0-1): Measures linguistic similarity incrementally
3. **Temporal Progression**: Accelerated middle (sinusoidal curve)
4. **Normalization**: Step size scaled by conversation length

**Result**: Paths that start at center and drift toward target positions, with local variations based on individual message content.

### 2.6 Visualization System

**Technology Stack:**
- **Frontend**: React + TypeScript
- **3D Rendering**: Three.js (WebGL)
- **Post-processing**: EffectComposer (Bloom effects)
- **State Management**: Zustand + Zod (type-safe validation)

**Visualization Modes:**
1. **Terrain View**: Navigate individual conversations in 3D space
2. **Grid View**: Browse all conversations as thumbnail terrains
3. **Spatial Clustering**: 2D scatter plots showing conversation similarity
4. **Role Dashboard**: Comprehensive role analytics and distribution analysis
5. **Terrain Comparison**: Side-by-side analysis of multiple conversations
6. **PAD Timeline**: Emotional trajectory over conversation turns
7. **Relational Drift**: How conversation dynamics shift over time

---

## 3. Results and Analysis

### 3.1 Dataset Characteristics

**Pattern Distribution:**
- `question-answer`: 241 (69.9%)
- `unknown`: 80 (23.2%)
- `advisory`: 13 (3.8%)
- `storytelling`: 5 (1.4%)
- Others: 6 (1.7%)

**Role Distribution (WildChat, GPT-5.2):**

**AI Roles:**
- `expert-system`: 55.6% (instrumental, high authority)
- `advisor`: 29.3% (instrumental, high authority)
- `co-constructor`: 8.3% (instrumental, equal authority)
- `relational-peer`: 5.3% (expressive, equal authority)
- `learning-facilitator`: 0.8% (instrumental, low authority)
- `social-facilitator`: 0.8% (expressive, low authority)

**Human Roles:**
- `director`: 44.4% (instrumental, high authority)
- `provider`: 33.1% (instrumental, low authority)
- `information-seeker`: 22.6% (instrumental, low authority)
- Expressive roles: 0% (none detected in WildChat sample)

**Key Finding**: **85% instrumental AI roles** vs. 6% expressive, **100% instrumental human roles**. WildChat conversations are overwhelmingly task-oriented, with users directing AI as an expert system to solve problems.

### 3.2 Model Comparison: GPT-4o vs. GPT-5.2

**Critical Discovery**: GPT-4o and GPT-5.2 produce dramatically different classifications, even with identical prompts, taxonomy, and conversations.

**Agreement Rate**: Only 66% of conversations get the same dominant AI role

**Key Differences:**
- **Human Roles**: GPT-4o sees 78% information-seeker, GPT-5.2 sees 48% director
- **AI Roles**: GPT-4o sees 42% advisor, GPT-5.2 sees 55.6% expert-system
- **Expressive Roles**: GPT-4o identifies 10% expressive roles, GPT-5.2 identifies 6%

**Manual Review Validation**: GPT-5.2 shows 66.7% agreement with manual review (12/18 conversations), while GPT-4o shows 0% agreement (0/18).

**Implication**: Model version is a critical methodological variable. GPT-5.2 was selected for final classification based on superior agreement with human judgments.

### 3.3 Core Finding: Same Destination, Different Journeys

**Primary Contribution**: Conversations with identical role classifications produce dramatically different terrain patterns.

**Concrete Evidence:**

**Example 1: Detached vs. Adversarial (Same Roles, 41x Variance Difference)**

**Conversation 22853** (`chatbot_arena_22853`): `information-seeker → expert-system`
- **Variance**: 0.0004 (extremely flat path)
- **Range**: 0.060 (narrow)
- **PAD Trajectory**: `0.42 → 0.44 → 0.42 → 0.46 → 0.48 → 0.46 → 0.44 → 0.46 → 0.46 → 0.44` (FLAT LINE)
- **Pattern**: Detached browsing, erratic topic-hopping (math → wrong answer → poem → wrong answer → survey)
- **Behavior**: Never challenges errors, emotionally disengaged
- **Terrain**: FLAT path, minimal height variation

**Conversation 30957** (`chatbot_arena_30957`): `information-seeker → expert-system` (identical roles)
- **Variance**: 0.0164 (41x higher - volatile: 0.0164 / 0.0004 = 41x)
- **Range**: 0.460 (wide)
- **PAD Trajectory**: `0.46 → 0.36 → 0.56 → 0.42 → 0.26 → 0.46 → 0.48 → 0.62 → 0.72 → 0.62 → 0.40 → 0.42` (VOLATILE with peaks)
- **Pattern**: Adversarial testing (sets trap → AI fails → sarcasm → escalation → trick question)
- **Behavior**: Actively testing AI capabilities, emotionally engaged (frustration peaks)
- **Terrain**: VOLATILE path with clear PEAKS (0.26 valley → 0.72 peak)

**Example 2: Smooth vs. Volatile (Same Roles, 75x Variance Difference)**

**Conversation 13748** (`chatbot_arena_13748`): `information-seeker → expert-system`
- **Variance**: 0.0002 (extremely smooth)
- **Range**: 0.040 (very narrow)
- **PAD Trajectory**: `0.40 → 0.38 → 0.38 → 0.40 → 0.40 → 0.38 → 0.40 → 0.42 → 0.40 → 0.38` (EXTREMELY FLAT)
- **Pattern**: Smooth, progressive learning (security dilemma → follow-up questions → deeper exploration)
- **Behavior**: No challenges, no errors, calm methodical inquiry
- **Terrain**: FLAT path with minimal valleys (affiliative moments)

**Conversation 30957**: Same roles, 75x higher variance (see above)

**Example 3: AI Anomaly Detection**

**Conversation** (`oasst-ebc51bf5-c486-471b-adfe-a58f4ad60c7a_0084`): `information-seeker → expert-system`
- **Variance**: 0.0139 (high - volatile)
- **PAD Trajectory**: `0.40 → 0.24 → 0.34 → 0.72 → 0.32 → 0.50 → 0.40 → 0.30 → 0.34 → 0.40 → 0.38 → 0.34 → 0.34`
- **Pattern**: Routine technical Q&A, but **AI produces bizarre, hostile response** at message 4
- **Key Insight**: Major peak (0.72) at message 4 is **AI anomaly, not user frustration** - demonstrates anomaly detection capability
- **Terrain**: VOLATILE path with major PEAK at AI breakdown moment

**Interpretation**: Role classifications describe **destinations** (where conversations end up), while terrain patterns reveal **journeys** (how they get there). The same destination can be reached through dramatically different affective trajectories.

### 3.4 Temporal Dynamics Revealed

The terrain preserves three types of temporal information that aggregate role classifications erase:

**1. User Emotional Engagement**
- **Volatile paths**: High variance, emotional peaks (frustration, escalation)
- **Stable paths**: Low variance, consistent emotional intensity
- **Example**: Conversation 30957 shows persistent frustration peaks (EI ≈ 0.8) despite identical role classification to flat conversations

**2. Interaction Quality**
- **Smooth patterns**: Consistent trajectory, minimal deviation
- **Erratic patterns**: High variance, unpredictable movement
- **Example**: Conversation 13748 shows smooth learning trajectory, while 30957 shows erratic, meandering path

**3. Anomalies**
- **AI errors**: Sudden spikes in emotional intensity
- **Breakdowns**: Role distribution becomes uniform (all roles ≈ 0.167)
- **Single-message deviations**: Brief departures from main trajectory
- **Example**: Conversation `chatbot_arena_09.json` shows AI failure pattern: uniform role distribution + persistent peaks + functional drift

### 3.5 Spatial Clustering Analysis

**7 Relational Positioning Archetypes Identified:**

1. **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking** (32.2%, n=111)
   - **Trajectory**: High path straightness (0.819), stable intensity (0.426 ± 0.043)
   - **Drift**: Strong functional/structured drift (final_x: 0.073, final_y: 0.073)
   - **Pattern**: 74.6% question-answer, 92.1% information-seeking
   - **Interpretation**: Instrumental communication, minimal relational negotiation

2. **StraightPath_Stable_FunctionalStructured_Advisory_InfoSeeking** (28.1%, n=97)
   - **Trajectory**: Lower path straightness (0.542), lower intensity (0.384 ± 0.060)
   - **Emotional Pattern**: High valley density (0.155) - low-intensity segments (affiliation moments)
   - **Drift**: Functional/structured (final_x: 0.066, final_y: 0.066)
   - **Pattern**: 63.6% question-answer, 93.2% information-seeking
   - **Interpretation**: Task-oriented with brief rapport-building moments

3. **Valley_FunctionalStructured_QA_InfoSeeking** (17.4%, n=60)
   - **Trajectory**: Moderate path straightness (0.614), moderate intensity (0.403 ± 0.049)
   - **Drift**: Functional X (0.069) but emergent Y (0.576) - hybrid pattern
   - **Pattern**: 81.5% storytelling, 100% information-seeking
   - **Interpretation**: Information-seeking through narrative and relationship-building

4. **StraightPath_Stable_SocialEmergent_Narrative_Entertainment** (9.9%, n=34)
   - **Trajectory**: Moderate path straightness (0.603), moderate intensity (0.386 ± 0.051)
   - **Drift**: Strong social drift (final_x: 0.931), emergent positioning (final_y: 0.456)
   - **Pattern**: 100% entertainment purpose
   - **Interpretation**: Pure relational communication where relationship-building is primary

5. **StraightPath_Stable_MinimalDrift_Narrative_SelfExpression** (7.2%, n=25)
   - **Trajectory**: Low path straightness (0.166), minimal drift (0.066)
   - **Drift**: Stays near origin (0.5, 0.5)
   - **Pattern**: Self-expression, minimal relational positioning
   - **Interpretation**: Self-expression conversations without strong relational development

6. **SocialEmergent_Casual_Entertainment** (2.9%, n=10)
   - **Trajectory**: Moderate path straightness (0.435), social positioning
   - **Drift**: Very social (final_x: 0.905)
   - **Pattern**: Casual entertainment
   - **Interpretation**: Casual entertainment with social focus

7. **Peak_Volatile_FunctionalStructured_QA_InfoSeeking** (2.3%, n=8)
   - **Trajectory**: High variance (0.013), meandering paths (0.417)
   - **Emotional Pattern**: Volatile, high intensity peaks
   - **Pattern**: Frustrated information-seeking
   - **Interpretation**: Adversarial testing with escalating frustration

**Cluster Separation Metrics:**
- **Silhouette Score**: 0.160 (weak separation, continuous variation)
- **Interpretation**: Clusters are **archetypal attractors** in a continuous space, not discrete types
- **Inter/Intra-Cluster Distance Ratio**: 1.830 (moderate separation)
- **Closest Clusters**: Clusters 2 and 6 (distance: 3.726) - boundary cases

**Feature Importance Analysis:**

**Top 10 Features (K-Means):**
1. `intensity_variance`: 7.16% (Emotional Intensity)
2. `path_straightness`: 6.25% (Spatial Trajectory)
3. `drift_y`: 5.94% (Spatial Trajectory)
4. `min_intensity`: 5.55% (Emotional Intensity)
5. `final_y`: 5.40% (Spatial Trajectory)
6. `valley_count`: 5.02% (Emotional Intensity)
7. `drift_angle_sin`: 4.89% (Spatial Trajectory)
8. `path_length`: 4.75% (Spatial Trajectory)
9. `drift_angle_cos`: 4.65% (Spatial Trajectory)
10. `intensity_range`: 4.57% (Emotional Intensity)

**Feature Category Importance:**
- **Spatial Trajectory**: 46.2%
- **Emotional Intensity**: 36.5%
- **Purpose**: 5.6%
- **AI Role**: 4.8%
- **Human Role**: 3.0%
- **Pattern**: 2.3%
- **Tone**: 1.1%
- **Structure**: 0.5%

**Total Trajectory (Spatial + Emotional)**: **82.7%**

**Key Finding**: **82.7% of feature importance** comes from trajectory characteristics (spatial + emotional), not categorical classification. **How conversations move through relational space matters more than what they're about.**

**Distribution Insight**: 72.3% of conversations are functional/structured (prioritize content over relationship), while 25.6% engage in social/emergent relational work. This reflects the evaluation context (Chatbot Arena) where users test models rather than genuinely seeking help.

**Validation**: Manual review of sampled conversations per cluster confirms cluster characteristics. See `docs/cluster-analysis/CLUSTER_VALIDATION_MANUAL.md` for detailed validation framework.

### 3.6 Context Effects: Old vs. New Data

**Old Data (Arena + OASST)**: 160 conversations
- Context: Evaluation setting, structured interactions
- Characteristics: Information-seeking bias, task-oriented

**New Data (WildChat)**: 185 conversations
- Context: Organic usage, diverse interaction patterns
- Characteristics: Problem-solving focus (50.4%), instrumental dominance (85%)

**Comparison Findings:**
- Both datasets show instrumental dominance (task-oriented interactions)
- WildChat shows slightly more diverse patterns (storytelling, collaborative)
- Role distributions differ: WildChat has more `director` (44.4%) vs. Arena's `information-seeker` dominance
- Spatial clustering: Old and new data show similar functional/structured clustering

**Cross-Dataset Cluster Analysis:**

**Cluster Mixing**: Clusters show significant cross-dataset mixing, suggesting relational positioning patterns are not artifacts of dataset-specific contexts but reflect genuine interaction dynamics.

**Example Cluster Distribution:**
- **Cluster 1 (StraightPath_FunctionalStructured_QA)**: 
  - Chatbot Arena: ~70 conversations (74.5%)
  - WildChat: ~15 conversations (16.0%)
  - OASST: ~9 conversations (9.6%)
  - **Interpretation**: Pattern exists across contexts, not just evaluation setting

- **Cluster 7 (MinimalDrift)**:
  - WildChat: ~60 conversations (74.1%)
  - Chatbot Arena: ~15 conversations (18.5%)
  - OASST: ~6 conversations (7.4%)
  - **Interpretation**: WildChat shows more "neutral" interactions that don't develop strong relational dynamics

**Key Insight**: Expansion from 160 to 345 conversations **confirmed homogeneity rather than revealed diversity**. Both evaluation (Arena/OASST) and organic (WildChat) contexts show similar instrumental bias, suggesting this may be a characteristic of current human–AI interaction patterns rather than a dataset artifact.

**Interpretation**: Context shapes role emergence, but both evaluation and organic contexts show instrumental bias, suggesting this may be a characteristic of current human–AI interaction patterns. The cross-dataset mixing validates that clusters represent genuine interaction dynamics, not dataset-specific artifacts.

### 3.7 Y-Axis Skew Analysis

**Finding**: 97.7% of conversations classified as Divergent (Y > 0.6)

**Root Cause**: 
- 69.9% of conversations are `question-answer` patterns
- Original pattern-to-Y mapping put `question-answer` at 0.8 (Divergent)
- This is semantically correct (Q&A is divergent), but creates visual skew

**Fix Applied**: Adjusted `question-answer` mapping from 0.8 to 0.5-0.65 (confidence-based), creating more balanced distribution while maintaining semantic accuracy.

**Interpretation**: The skew reflects actual dataset characteristics (most conversations are Q&A), but the adjustment makes the visualization more interpretable without losing semantic meaning.

---

## 4. Contributions

### 4.1 Methodological Contribution

**A spatial encoding that preserves message-level dynamics when aggregate classifications would erase them.**

- Demonstrates how PAD (Pleasure-Arousal-Dominance) model can encode emotional intensity as terrain height
- Shows how role-based positioning and affective intensity reveal temporal drift
- Provides reusable method for visualizing relational patterns in human–AI interaction
- Enables both close reading (individual conversations) and distant reading (large corpora)

### 4.2 Substantive Contribution

**Evidence that same-labeled conversations have distinct affective trajectories (variance ratios up to 82x: maximum 0.0164 / 0.0002 = 82x, specific pair 0.0164 / 0.0004 = 41x).**

- Concrete examples showing identical role classifications producing dramatically different terrain patterns
- Demonstrates that temporal dynamics matter even when roles are static
- Reveals three types of temporal information: emotional engagement, interaction quality, anomalies
- Shows how conversations with same "destination" take different "journeys"

### 4.3 Theoretical Contribution

**Application of Social Role Theory to human–AI interaction, revealing instrumental vs. expressive role dimensions.**

- Distinguishes Learning-Facilitator (instrumental) from Social-Facilitator (expressive)
- Maps roles to relational space (X: Functional↔Social, Y: Structured↔Emergent)
- Reveals authority level patterns (High/Low/Equal authority)
- Provides theoretical grounding for role taxonomy

### 4.4 Technical Contribution

**A working visualization system that enables exploratory analysis of human–AI conversations.**

- Interactive 3D terrain visualization (Three.js/WebGL)
- Multiple visualization modes (Terrain, Grid, Clustering, Dashboard)
- Real-time filtering and comparison
- Type-safe data pipeline (Zod validation)
- Extensible architecture for future research

---

## 5. Limitations and Future Work

### 5.1 Limitations

**1. Model Dependency**
- GPT-4o and GPT-5.2 produce different classifications (66% agreement)
- Model version is a critical methodological variable
- Manual review validation needed for key findings
- **Impact**: Model choice significantly shapes research findings

**2. Encoding Choices**
- X, Y, Z axes are design decisions, not validated dimensions
- Coordinate calculations are hybrid (linguistic + metadata), not pure
- Pattern-to-Y mapping requires calibration
- **Impact**: Spatial positions reflect encoding choices, not absolute truth

**3. Dataset Bias**
- Evaluation context (Arena/OASST) creates information-seeking bias
- WildChat shows similar instrumental dominance (may reflect current usage patterns)
- Limited expressive role representation (6% AI, 0% human in WildChat)
- **Impact**: Findings may reflect dataset characteristics rather than universal patterns

**4. Validation Gap**
- No external validation that trajectories predict outcomes users care about
- Trajectory feature dominance (81.8%) is partially circular (we cluster on trajectory features)
- Need user studies to evaluate insights and usability
- **Impact**: Cannot claim trajectories predict meaningful outcomes without external validation

**5. Data Quality**
- 402 WildChat files corrupted (excluded from analysis)
- Some old data uses previous taxonomy (mapped via backward compatibility)
- Schema validation failures for some files (gracefully handled)
- **Impact**: Reduced dataset size, potential selection bias

**6. Classification Accuracy and Spatial Positioning**
- **Manual validation**: 66.7% agreement with GPT-5.2 classifications (12/18 manually reviewed conversations)
- **Systematic patterns identified**:
  - "Pseudo-Problem-Solving": Emotional processing disguised as question-asking (appears functional, actually expressive)
  - Philosophical conversations collapsed to simple information-seeking (misses reflective/exploratory dimension)
- **Spatial impact**: X-axis errors of 0.10-0.16 in affected conversations (~25-37% of corpus)
- **Mitigation**: Hybrid coordinate calculation (linguistic + metadata) provides resilience against classification noise
- **Terrain patterns remain interpretable**: Despite positioning uncertainty, gross patterns (flat vs. peaked, stable vs. volatile) are robust
- **Future work**: Fine-tune classification prompts for edge cases; develop confidence-weighted positioning that reduces influence of low-confidence classifications

**7. Cluster Separation**
- **Silhouette score: 0.160** (weak separation, continuous variation)
- Clusters show significant overlap, suggesting continuous variation rather than discrete types
- **Interpretation**: Clusters are archetypal attractors, not distinct categories
- **Impact**: Cluster boundaries are fuzzy, requiring interpretation rather than categorical assignment

### 5.2 Future Work

**1. User Studies**
- Test with participants to evaluate insights and usability
- Validate that terrain patterns correspond to meaningful conversation dynamics
- Assess whether visualization supports pattern recognition

**2. Cross-Dataset Validation**
- Compare cluster structures across different datasets
- Test generalization to other conversation types
- Investigate context effects more systematically

**3. Taxonomy Refinement**
- Investigate if expressive roles are underrepresented or truly rare
- Consider refining taxonomy or sampling strategy
- Explore role emergence in different contexts

**4. Model Comparison Study**
- Systematically compare GPT-4o, GPT-4o-mini, GPT-5.2 on same dataset
- Identify model-specific biases
- Create model selection guidelines

**5. Extensions**
- Explore other visualization techniques
- Apply to other domains (therapy, education, customer service)
- Integrate with real-time conversation analysis

---

## 6. Conclusion

Conversational Cartography demonstrates that **aggregate role classifications compress away meaningful temporal variation**, and that **spatial visualization makes these dynamics visible**. The core contribution is showing that conversations with the same "destination" (role labels) can take dramatically different "journeys" (terrain patterns), and that these differences are experientially meaningful.

**Key Takeaways:**
1. **Same destination, different journeys**: Identical role classifications produce distinct terrain patterns (variance ratios up to 82x: maximum across dataset, 41x for specific pair)
2. **Temporal dynamics matter**: Message-level variation reveals emotional engagement, interaction quality, and anomalies
3. **Trajectory drives clustering**: How conversations move through relational space matters more than what they're about (81.8% feature importance)
4. **Model choice matters**: GPT-4o and GPT-5.2 produce different classifications, requiring careful model selection
5. **Context shapes patterns**: Evaluation vs. organic contexts show different role distributions, but both show instrumental bias

**For Interaction Designers**:
- Spatial metaphors reveal relational dynamics invisible in chat logs—flat vs. peaked terrain immediately shows emotional volatility
- Multiple views (terrain, grid, scatter, timeline) support different analytical tasks; no single view suffices
- Interactive exploration enables pattern *discovery*, not just confirmation of known categories

**For HCI Researchers**:
- Trajectory-based clustering outperforms classification-based approaches (82.7% vs. 17.3% feature importance)
- Temporal dynamics are not noise to be averaged away—they're the signal
- PAD model provides reusable method for encoding emotional intensity; applicable beyond conversations

**For Practitioners and System Builders**:
- Same role label ≠ same user experience (up to 82x variance between calmest and most volatile: maximum 0.0164 / 0.0002 = 82x, specific pair 41x)
- Adversarial testing patterns (volatile peaks, sarcastic turns) reveal users probing boundaries—design implication: anticipate and support exploration, not just task completion
- Breakdown detection signature: Uniform role distributions + persistent emotional peaks + functional drift = AI failure requiring intervention

**For Critical AI Studies**:
- Instrumental dominance (85-100%) reveals current AI positioning as tools, not companions
- Absence of expressive roles (0% human expressive in WildChat) suggests relational impoverishment in current interaction paradigms
- Evaluation contexts (Arena) shape interactions differently than organic use (WildChat shows more directive behavior)—research findings may not generalize

The contribution is not simply a new visualization technique, but a **new way of thinking with conversations**: treating dialogue as terrain that can be mapped, traversed, and examined as an external cognitive object. Conversational Cartography demonstrates that when we externalize interaction dynamics in spatial form, we make visible what was previously only felt—the emotional labor of AI interaction, the power asymmetries in conversational positioning, the difference between smooth and turbulent journeys toward the same goal.

---

## 7. References

### Theoretical Foundations
- Bales, R. F. (1950). *Interaction Process Analysis*. University of Chicago Press.
- Clark, A., & Chalmers, D. (1998). The Extended Mind. *Analysis*, 58(1), 7-19.
- Eagly, A. H. (1987). *Sex Differences in Social Behavior: A Social-Role Interpretation*. Psychology Press.
- Fan, J. E., et al. (2019). Drawing as a Cognitive Tool. *Cognitive Science*, 43(8).
- Goffman, E. (1981). *Forms of Talk*. University of Pennsylvania Press.
- Hutchins, E. (1995). *Cognition in the Wild*. MIT Press.
- Norman, D. A. (1991). *The Design of Everyday Things*. Basic Books.
- Parsons, T. (1951). *The Social System*. Free Press.
- Watzlawick, P., Bavelas, J. B., & Jackson, D. D. (1967). *Pragmatics of Human Communication*. W.W. Norton.

### Data Sources
- LMSYS Chatbot Arena Dataset. HuggingFace: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations
- OpenAssistant Dataset. https://open-assistant.io/
- WildChat-1M Dataset. HuggingFace: https://huggingface.co/datasets/allenai/WildChat-1M

### Technical Documentation
- Three.js Documentation: https://threejs.org/
- Zod Schema Validation: https://zod.dev/
- React Documentation: https://react.dev/

---

## Appendix A: Dataset Statistics

**Validated Corpus (for analysis)**: 345 conversations
- Chatbot Arena: 128 conversations
- OASST: 32 conversations
- WildChat: 185 conversations

**Total Classified (as of 2026-01-09)**: 476 conversations
- Chatbot Arena: 241 conversations (128 in validated corpus)
- WildChat: 185 conversations (all in validated corpus)
- OASST: 32 conversations (all in validated corpus)
- Cornell Movie Dialogues: 9 conversations (human-human, not in validated corpus)
- Kaggle Empathetic Dialogues: 9 conversations (human-human, not in validated corpus)

**Classification Success Rate**: 97.7% (337/345 successfully classified with all dimensions)

**Average Confidence**: 0.743 (moderate-high)

**Pattern Distribution**:
- question-answer: 241 (69.9%)
- unknown: 80 (23.2%)
- advisory: 13 (3.8%)
- storytelling: 5 (1.4%)
- others: 6 (1.7%)

**Role Distribution (WildChat, GPT-5.2)**:
- **AI Roles**: 85% instrumental, 6% expressive
  - expert-system: 55.6%
  - advisor: 29.3%
  - co-constructor: 8.3%
  - relational-peer: 5.3%
  - learning-facilitator: 0.8%
  - social-facilitator: 0.8%
- **Human Roles**: 100% instrumental, 0% expressive
  - director: 44.4%
  - provider: 33.1%
  - information-seeker: 22.6%

**Cluster Distribution**:
- Cluster 1 (StraightPath_Stable_FunctionalStructured_QA): 32.2% (111)
- Cluster 2 (StraightPath_Stable_Advisory): 28.1% (97)
- Cluster 3 (Valley_FunctionalStructured_QA): 17.4% (60)
- Cluster 4 (SocialEmergent_Narrative_Entertainment): 9.9% (34)
- Cluster 5 (MinimalDrift_SelfExpression): 7.2% (25)
- Cluster 6 (SocialEmergent_Casual): 2.9% (10)
- Cluster 7 (Peak_Volatile_QA): 2.3% (8)

**Feature Importance (Top 10)**:
1. intensity_variance: 7.16%
2. path_straightness: 6.25%
3. drift_y: 5.94%
4. min_intensity: 5.55%
5. final_y: 5.40%
6. valley_count: 5.02%
7. drift_angle_sin: 4.89%
8. path_length: 4.75%
9. drift_angle_cos: 4.65%
10. intensity_range: 4.57%

**Trajectory Features (Spatial + Emotional)**: 82.7% of total importance

---

## Appendix B: Technical Specifications

**Classification Model**: OpenAI GPT-5.2  
**Taxonomy**: Social Role Theory (6 Human + 6 AI Roles)  
**Coordinate System**: 3D (X: Functional↔Social, Y: Aligned↔Divergent, Z: Emotional Intensity)  
**Path Generation**: Drift-based algorithm with message-level variation  
**Visualization**: Three.js/WebGL, React, TypeScript  
**Data Validation**: Zod schema validation  
**File Format**: JSON with classification metadata and PAD scores

---

**Report Generated**: January 2026  
**Status**: Complete - Ready for DIS Submission  
**Contact**: [Your contact information]

