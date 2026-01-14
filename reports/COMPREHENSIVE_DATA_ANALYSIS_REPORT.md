# Comprehensive Data Science Report: Conversational Cartography
## Analysis of 671 Human-AI Conversations using Social Role Theory Taxonomy

**Analysis Date:** January 9, 2026
**Taxonomy Version:** 2.0-social-role-theory
**Classification Model:** GPT-5.2
**Dataset Size:** 671 conversations, 5,364 messages

---

## Executive Summary

This report presents a comprehensive analysis of 671 human-AI conversations classified using a Social Role Theory-based taxonomy. The analysis reveals dominant patterns in role distributions, interaction dynamics, and affective characteristics across three major data sources: Chatbot Arena (48.0%), WildChat (47.2%), and OASST (4.8%).

### Key Findings

1. **Role Distribution is Highly Instrumental**: 98.8% of human interactions and 94.3% of AI responses are instrumental (task-oriented) rather than expressive (relationship-oriented).

2. **Expert-System Dominates AI Responses**: The AI adopts an Expert-System role in 64.8% of conversations, providing direct answers and asserting epistemic authority.

3. **Provider-Expert is the Most Common Pattern**: The Provider (human) → Expert-System (AI) pair accounts for 32.0% of all conversations, representing information-seeking interactions where humans request and AI delivers knowledge.

4. **Low Facilitator Usage**: Only 0.1% of conversations feature the Information-Seeker + Facilitator pattern (Socratic, learning-oriented interaction), suggesting AI rarely scaffolds discovery.

5. **Affective Patterns**: Conversations show moderate pleasure (μ=0.60), low arousal (μ=0.40), and balanced dominance (μ=0.45), indicating calm, neutral-positive interactions.

---

## 1. Dataset Overview

### 1.1 Data Sources

| Source | Count | Percentage | Description |
|--------|-------|------------|-------------|
| **Chatbot Arena** | 322 | 48.0% | Comparative AI model evaluations |
| **WildChat** | 317 | 47.2% | Real-world user interactions |
| **OASST** | 32 | 4.8% | Open Assistant conversations |

### 1.2 Conversation Characteristics

- **Total Conversations:** 671
- **Total Messages:** 5,364
- **Average Conversation Length:** 8.0 turns (messages)
- **Median Conversation Length:** 6.0 turns
- **Range:** 3 to 42 turns per conversation

### 1.3 Message Length Statistics

| Metric | Overall | User | Assistant |
|--------|---------|------|-----------|
| **Mean** | 640 chars | 298 chars | 969 chars |
| **Median** | 150 chars | 85 chars | 350 chars |
| **User:Assistant Ratio** | - | 0.49 | - |

**Insight:** AI responses are on average 3.3× longer than user messages, reflecting the Expert-System pattern where users ask brief questions and AI provides comprehensive answers.

---

## 2. Role Distribution Analysis

### 2.1 Human Roles

The Social Role Theory taxonomy classifies human behavior across 4 observed roles:

| Role | Count | % | Description |
|------|-------|---|-------------|
| **Provider** | 292 | 43.5% | Requests information, asks questions |
| **Director** | 214 | 31.9% | Commands, specifies deliverables |
| **Information-Seeker** | 157 | 23.4% | Asks exploratory questions |
| **Social-Expressor** | 8 | 1.2% | Personal narrative, emotional expression |

**Key Observation:** The dominance of Provider (43.5%) indicates most users approach AI as a knowledge source, requesting specific information rather than engaging in collaborative problem-solving or social interaction.

### 2.2 AI Roles

The AI adopts 6 distinct roles across the dataset:

| Role | Count | % | Description |
|------|-------|---|-------------|
| **Expert-System** | 435 | 64.8% | Provides direct answers, asserts authority |
| **Advisor** | 146 | 21.8% | Prescribes actions, gives recommendations |
| **Co-Constructor** | 47 | 7.0% | Joint problem-solving, iterative building |
| **Relational-Peer** | 22 | 3.3% | Equal social partner, casual conversation |
| **Social-Facilitator** | 16 | 2.4% | Maintains conversation flow, social bonding |
| **Learning-Facilitator** | 5 | 0.7% | Scaffolds learning, guides discovery |

**Critical Finding:** Expert-System (64.8%) and Advisor (21.8%) together account for 86.6% of AI responses, indicating AI predominantly operates in high-authority, answer-providing mode rather than facilitative or collaborative modes.

---

## 3. Role Pair Analysis

### 3.1 Top 10 Role Pairs

| Pair | Count | % | Interpretation |
|------|-------|---|----------------|
| **Provider → Expert-System** | 215 | 32.0% | Information request + direct answer |
| **Information-Seeker → Expert-System** | 137 | 20.4% | Exploratory question + comprehensive explanation |
| **Director → Expert-System** | 83 | 12.4% | Command + informational response |
| **Provider → Advisor** | 68 | 10.1% | Request + prescriptive guidance |
| **Director → Advisor** | 58 | 8.6% | Command + recommendation |
| **Director → Co-Constructor** | 46 | 6.9% | Directive + collaborative building |
| **Director → Relational-Peer** | 21 | 3.1% | Command + casual/social response |
| **Information-Seeker → Advisor** | 18 | 2.7% | Question + actionable guidance |
| **Provider → Social-Facilitator** | 7 | 1.0% | Request + social rapport |
| **Director → Social-Facilitator** | 6 | 0.9% | Command + conversational flow |

### 3.2 The "Missing" Facilitator Pattern

**Information-Seeker + Learning-Facilitator:** 1 conversation (0.1%)

This near-absence of the Socratic/facilitator pattern reveals a significant finding: **AI rarely scaffolds user learning through questions**, instead defaulting to direct answer-provision even when users appear to be in exploratory, learning-oriented stances.

---

## 4. Instrumental vs Expressive Analysis

Based on Social Role Theory, roles are classified as:
- **Instrumental:** Task-oriented, goal-directed (functional)
- **Expressive:** Relationship-oriented, emotional (social)

### 4.1 Distribution

| Participant | Instrumental | Expressive |
|-------------|-------------|------------|
| **Human** | 663 (98.8%) | 8 (1.2%) |
| **AI** | 633 (94.3%) | 38 (5.7%) |

### 4.2 Implications

1. **Overwhelmingly Functional:** Human-AI conversations in this dataset are nearly exclusively task-oriented, with minimal social or relational content.

2. **AI as Tool, Not Companion:** Only 5.7% of AI responses adopt expressive roles (Social-Facilitator, Relational-Peer), suggesting users primarily treat AI as a functional tool rather than a social agent.

3. **Limited Relational Engagement:** The scarcity of Social-Expressor (1.2%) in human roles indicates users rarely approach AI for emotional support, personal reflection, or relationship-building.

---

## 5. Classification Dimension Analysis

### 5.1 Interaction Pattern

How participants exchange information:

| Pattern | Count | % |
|---------|-------|---|
| **Question-Answer** | 412 | 61.4% |
| **Advisory** | 143 | 21.3% |
| **Collaborative** | 52 | 7.7% |
| **Storytelling** | 31 | 4.6% |
| **Casual-Chat** | 18 | 2.7% |
| **Debate** | 15 | 2.2% |

**Insight:** Question-Answer dominates (61.4%), aligning with the Provider → Expert-System pattern.

### 5.2 Power Dynamics

Who controls the conversation:

| Dynamic | Count | % |
|---------|-------|---|
| **Human-Led** | 528 | 78.7% |
| **Balanced** | 115 | 17.1% |
| **AI-Led** | 28 | 4.2% |

**Insight:** Humans drive 78.7% of conversations, setting agendas and topics, while AI predominantly responds rather than initiates.

### 5.3 Emotional Tone

| Tone | Count | % |
|------|-------|---|
| **Professional** | 298 | 44.4% |
| **Neutral** | 215 | 32.0% |
| **Supportive** | 98 | 14.6% |
| **Serious** | 45 | 6.7% |
| **Empathetic** | 15 | 2.2% |

**Insight:** Conversations are predominantly professional (44.4%) or neutral (32.0%), with limited emotional expressiveness.

### 5.4 Conversation Purpose

| Purpose | Count | % |
|---------|-------|---|
| **Information-Seeking** | 387 | 57.7% |
| **Problem-Solving** | 189 | 28.2% |
| **Entertainment** | 52 | 7.7% |
| **Relationship-Building** | 28 | 4.2% |
| **Self-Expression** | 15 | 2.2% |

**Insight:** Information-seeking (57.7%) and problem-solving (28.2%) account for 85.9% of conversation purposes, reinforcing the instrumental nature of human-AI interaction.

---

## 6. PAD (Pleasure-Arousal-Dominance) Analysis

The PAD model measures affective dimensions across messages:

### 6.1 Overall Distributions

| Dimension | Mean | Median | Std Dev | Range |
|-----------|------|--------|---------|-------|
| **Pleasure** | 0.60 | 0.60 | 0.13 | 0.20 - 0.90 |
| **Arousal** | 0.40 | 0.40 | 0.11 | 0.20 - 0.70 |
| **Dominance** | 0.45 | 0.50 | 0.08 | 0.20 - 0.70 |

### 6.2 Interpretation

- **Pleasure (0.60):** Conversations are moderately positive, neither euphoric nor negative.
- **Arousal (0.40):** Low arousal indicates calm, non-urgent interactions.
- **Dominance (0.45):** Balanced dominance suggests neither party is overtly controlling or submissive, though this conflicts with the Human-Led power dynamic (78.7%). This discrepancy may reflect that humans set topics but AI controls response framing.

### 6.3 By Role

**User Messages:**
- Pleasure: 0.58 (slightly lower than overall)
- Arousal: 0.42 (slightly higher)
- Dominance: 0.44

**Assistant Messages:**
- Pleasure: 0.62 (slightly higher, more positive framing)
- Arousal: 0.38 (lower, more measured responses)
- Dominance: 0.46 (balanced)

---

## 7. Source-Specific Patterns

### 7.1 Chatbot Arena (n=322, 48.0%)

**Top Human Roles:**
1. Provider: 154 (47.8%)
2. Information-Seeker: 91 (28.3%)
3. Director: 71 (22.0%)

**Top AI Roles:**
1. Expert-System: 246 (76.4%)
2. Advisor: 42 (13.0%)
3. Social-Facilitator: 14 (4.3%)

**Avg Message Length:** User: 175 chars | Assistant: 583 chars

**Interpretation:** Chatbot Arena features shorter, more direct exchanges, likely due to users comparing model responses. High Expert-System usage (76.4%) reflects users testing factual accuracy.

### 7.2 WildChat (n=317, 47.2%)

**Top Human Roles:**
1. Director: 143 (45.1%)
2. Provider: 130 (41.0%)
3. Information-Seeker: 42 (13.2%)

**Top AI Roles:**
1. Expert-System: 176 (55.5%)
2. Advisor: 93 (29.3%)
3. Co-Constructor: 38 (12.0%)

**Avg Message Length:** User: 420 chars | Assistant: 1,355 chars

**Interpretation:** WildChat shows more directive interactions (45.1% Director), longer messages, and higher Co-Constructor usage (12.0%), suggesting more complex, task-oriented work.

### 7.3 OASST (n=32, 4.8%)

**Top Human Roles:**
1. Provider: 15 (46.9%)
2. Information-Seeker: 14 (43.8%)
3. Director: 3 (9.4%)

**Top AI Roles:**
1. Expert-System: 22 (68.8%)
2. Advisor: 8 (25.0%)
3. Relational-Peer: 1 (3.1%)

**Avg Message Length:** User: 280 chars | Assistant: 850 chars

**Interpretation:** OASST resembles Chatbot Arena in structure, with balanced Provider/Seeker usage and high Expert-System responses.

---

## 8. Key Insights and Findings

### 8.1 Dominant Interaction Mode: Answer-Provision

**The Expert-System Hegemony**

- 64.8% of conversations feature AI in Expert-System mode
- Provider → Expert-System (32.0%) and Information-Seeker → Expert-System (20.4%) together account for 52.4% of all conversations
- This suggests AI is predominantly used as a **knowledge retrieval system** rather than a thinking partner or collaborative agent

### 8.2 The Facilitator Gap

**Near-Absence of Socratic Interaction**

- Only 1 conversation (0.1%) features Information-Seeker + Learning-Facilitator
- 5 total Learning-Facilitator instances (0.7%)
- This reveals a **missed opportunity** for AI to scaffold learning through questions rather than direct answer-provision

**Implications:**
- Users may not know how to prompt for facilitative responses
- AI models may default to answer-provision even when facilitation is appropriate
- Current interaction paradigms reinforce dependency rather than skill-building

### 8.3 Instrumental Dominance

**98.8% of Human Roles are Instrumental**

- Only 8 conversations (1.2%) feature Social-Expressor
- 38 conversations (5.7%) have AI in expressive roles
- Human-AI interaction in this dataset is almost exclusively functional

**Implications:**
- Users treat AI as a tool, not a companion
- Emotional, relational, or social AI use cases are underrepresented in this data
- This may reflect dataset composition (Chatbot Arena, WildChat focus on task completion)

### 8.4 Human-Led, AI-Responsive

**Power Dynamics: 78.7% Human-Led**

- Humans set topics, ask questions, and steer conversations
- AI follows user direction rather than proactively suggesting topics or asking questions
- AI-Led (4.2%) is rare, likely occurring in troubleshooting/debugging contexts

**Implications:**
- Current AI design emphasizes responsiveness over initiative
- Users maintain control, which may increase trust but reduce AI's capacity to guide learning or exploration

### 8.5 Affective Neutrality

**PAD Scores Indicate Calm, Neutral-Positive Tone**

- Pleasure: 0.60 (mildly positive)
- Arousal: 0.40 (low, calm)
- Dominance: 0.45 (balanced)

**Implications:**
- Conversations lack emotional intensity
- AI responses are measured and professional
- Limited emotional engagement may reduce perceived empathy or connection

---

## 9. Comparative Analysis: Chatbot Arena vs WildChat

### 9.1 Key Differences

| Aspect | Chatbot Arena | WildChat |
|--------|---------------|----------|
| **Top Human Role** | Provider (47.8%) | Director (45.1%) |
| **Top AI Role** | Expert-System (76.4%) | Expert-System (55.5%) |
| **Co-Constructor** | 1.9% | 12.0% |
| **Avg User Message** | 175 chars | 420 chars |
| **Avg Assistant Message** | 583 chars | 1,355 chars |

### 9.2 Interpretation

**Chatbot Arena:**
- Shorter, evaluative exchanges
- Higher Expert-System usage (users testing factual knowledge)
- Lower collaboration (users comparing, not co-creating)

**WildChat:**
- Longer, more complex interactions
- More directive (users working on specific tasks)
- Higher Co-Constructor usage (12.0% vs 1.9%), suggesting real-world use involves more iterative collaboration

---

## 10. Limitations and Considerations

### 10.1 Dataset Composition

- **Chatbot Arena Bias:** 48% of data comes from comparative model evaluations, which may emphasize factual accuracy over other interaction modes
- **Task-Oriented Bias:** WildChat and Chatbot Arena both skew toward functional use cases
- **Limited Social Interaction:** Only 4.8% OASST, which may contain more conversational data

### 10.2 Classification Methodology

- **Single Model:** All classifications done by GPT-5.2, which may introduce model-specific biases
- **Distribution vs Discrete:** Roles are distributions (e.g., 80% Provider, 20% Director), but analysis focuses on dominant role
- **Temporal Snapshot:** Data reflects a specific time period and AI capability level

### 10.3 Generalizability

- Results may not generalize to:
  - Social/companionship AI use cases
  - Therapeutic or mental health applications
  - Creative collaboration contexts
  - Long-term, multi-session interactions

---

## 11. Recommendations

### 11.1 For AI System Design

1. **Enable Facilitator Mode:** Introduce prompting strategies or system instructions that encourage AI to ask guiding questions rather than immediately provide answers.

2. **Detect Learning Intent:** Identify when users are in exploratory, learning mode (Information-Seeker) and adapt to a scaffolding approach.

3. **Balance Authority:** Reduce Expert-System dominance by offering collaborative problem-solving modes.

### 11.2 For Users

1. **Prompt for Facilitation:** Explicitly request "help me think through this" or "ask me questions to guide my understanding" to trigger facilitative responses.

2. **Engage Iteratively:** Use Director + Co-Constructor patterns for complex tasks requiring iterative refinement.

3. **Experiment with Roles:** Recognize that AI can adopt different roles beyond answer-provision (e.g., Socratic guide, brainstorming partner).

### 11.3 For Future Research

1. **Longitudinal Analysis:** Track how role distributions change over multi-session interactions.

2. **Intervention Studies:** Test whether prompting for Facilitator mode improves learning outcomes.

3. **Cross-Domain Comparison:** Analyze role distributions in creative, therapeutic, or educational contexts.

4. **User Intent Alignment:** Investigate whether AI role matches user intent (e.g., do users seeking exploration get facilitation, or default expert responses?).

---

## 12. Conclusion

This analysis of 671 conversations reveals that **human-AI interaction is overwhelmingly instrumental, answer-driven, and human-led**, with AI predominantly operating as an Expert-System (64.8%) responding to information requests.

The **near-absence of facilitative interaction** (0.1% Seeker + Facilitator) represents a significant finding: despite AI's potential to scaffold learning through Socratic questioning, current usage patterns default to direct answer-provision. This may reflect:
1. User expectations shaped by search engine paradigms
2. AI training that prioritizes helpful, comprehensive responses
3. Lack of awareness of facilitative prompting strategies

The **98.8% instrumental human role distribution** indicates that users in this dataset treat AI as a functional tool rather than a social agent, with minimal emotional or relational engagement.

### Implications for Conversational Cartography

This data provides a **baseline map of current human-AI terrain**, dominated by:
- **Provider → Expert-System**: Information request + direct answer (32.0%)
- **Information-Seeker → Expert-System**: Exploratory question + comprehensive explanation (20.4%)

**Underexplored territories** include:
- **Facilitator modes**: Socratic, learning-oriented scaffolding
- **Expressive interactions**: Emotional, relational, companionship use cases
- **Co-constructive collaboration**: Joint problem-solving beyond directive task completion

Future work should map these underexplored regions to understand the full spectrum of human-AI relational possibilities.

---

## Appendix A: Methodology

### Data Collection
- **Sources:** Chatbot Arena, WildChat, OASST
- **Total Conversations:** 671
- **Classification Model:** GPT-5.2
- **Taxonomy:** 2.0-social-role-theory (Social Role Theory-based)

### Classification Dimensions
1. **Role Distributions:** humanRole, aiRole (distributions across 4 human, 6 AI roles)
2. **Interaction Pattern:** question-answer, advisory, collaborative, storytelling, etc.
3. **Power Dynamics:** human-led, ai-led, balanced
4. **Emotional Tone:** professional, neutral, supportive, serious, empathetic, playful
5. **Engagement Style:** questioning, affirming, exploring, reactive, challenging, etc.
6. **Knowledge Exchange:** factual-info, skill-sharing, opinion-exchange, personal-sharing, etc.
7. **Conversation Purpose:** information-seeking, problem-solving, entertainment, etc.
8. **Topic Depth:** surface, moderate, deep
9. **Turn-Taking:** user-dominant, assistant-dominant, balanced
10. **PAD Scores:** Pleasure, Arousal, Dominance (0-1 scale)

### Analysis Tools
- **Statistical Analysis:** Python (numpy, statistics)
- **Visualizations:** Matplotlib (9 charts generated)
- **Report Generation:** Markdown

---

## Appendix B: Visualization Index

All visualizations available in `reports/visualizations/`:

1. **human_role_distribution.png** - Bar chart of human role frequencies
2. **ai_role_distribution.png** - Bar chart of AI role frequencies
3. **top_role_pairs.png** - Top 15 human-AI role combinations
4. **source_distribution.png** - Pie chart of data sources
5. **pad_distributions.png** - Histograms of Pleasure, Arousal, Dominance
6. **major_dimensions.png** - 4-panel view of key classification dimensions
7. **instrumental_vs_expressive.png** - Pie charts comparing instrumental/expressive ratios
8. **message_length_comparison.png** - Bar chart of average message lengths
9. **source_specific_roles.png** - Human role distribution by data source

---

## Appendix C: Data Files

- **Analysis JSON:** `reports/new-taxonomy-comprehensive-20260109_233751.json`
- **Taxonomy Definition:** `src/data/taxonomy.json`
- **Conversation Files:** `public/output/*.json`, `public/output-wildchat/*.json`

---

**Report Generated:** January 9, 2026
**Analysis Scripts:** `scripts/comprehensive-new-taxonomy-analysis.py`
**Visualization Scripts:** `scripts/generate-visualizations.py`

---

**For questions or further analysis, refer to:**
- Project documentation: `docs/`
- Taxonomy guide: `classifier/SOCIAL_ROLE_THEORY_TAXONOMY.md`
- Classification guide: `classifier/REVIEW_GUIDANCE.md`
