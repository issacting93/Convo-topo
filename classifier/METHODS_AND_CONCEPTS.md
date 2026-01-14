# Methods and Concepts: Cartographic Analysis of Human-AI Conversations

**Date:** 2026-01-08
**Version:** 2.0 (Social Role Theory-Based)
**Status:** Complete Methodology Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Role Taxonomy](#complete-role-taxonomy)
3. [Classification Methodology](#classification-methodology)
4. [Spatial Coordinate Generation](#spatial-coordinate-generation)
5. [Dataset Description](#dataset-description)
6. [Statistical Framework](#statistical-framework)
7. [Validation Procedures](#validation-procedures)
8. [Limitations](#limitations)
9. [Related Documentation](#related-documentation)

---

## Overview

This project uses a **cartographic metaphor** to visualize human-AI conversation dynamics in 2D/3D space. Conversations are mapped to coordinates based on **linguistic markers** and **classification metadata**, generating unique "terrain" representations that reveal interaction patterns.

### Research Questions

1. **Taxonomy Validation:** Does Social Role Theory provide a clearer framework for distinguishing interaction roles than domain-agnostic taxonomies?
2. **Context Effects:** How do role distributions differ between evaluation contexts (Chatbot Arena, OASST) and organic usage (WildChat)?
3. **Spatial Mapping:** Do roles cluster predictably in relational space along instrumental/expressive and authority dimensions?
4. **Interaction Patterns:** What role pairings occur most frequently, and do they follow complementary patterns?

### Theoretical Foundation

**Social Role Theory** (Parsons, 1951; Bales, 1950; Eagly, 1987) distinguishes:
- **Instrumental Roles:** Task-oriented, goal-directed, agentic (functional)
- **Expressive Roles:** Relationship-oriented, emotional, communal (social)

This maps directly to our X-axis (Functional ↔ Social) and provides theoretical grounding for role distinctions.

---

## Complete Role Taxonomy

### Current Implementation: Reduced Taxonomy (3 Human + 3 AI)

The **active taxonomy** used in classification is the **reduced role set** (v1.0), validated through empirical overlap analysis showing 68.7% human role and 69.7% AI role overlap within consolidated categories.

#### Human Roles

| Role | Dimension | Definition | Signals | Terrain Position (X) |
|------|-----------|------------|---------|---------------------|
| **Information-Seeker** | Instrumental, Low Authority | User seeks to reduce knowledge gaps by requesting information, expecting direct answers | "What is...", "Can you explain...", "How do I...", questions expecting answers | 0.4 (Functional-leaning) |
| **Co-Constructor** | Instrumental, Equal Authority | User shares agency with AI to jointly develop ideas, artifacts, or understanding through iterative dialogue | "What if we...", building on AI output, two-way exchange, iterative refinement | 0.7 (Balanced) |
| **Social-Expressor** | Expressive, Low Authority | User expresses emotions, shares personal narratives, or seeks social presence; communication itself is the goal | Personal narrative, "I feel...", emotional expression, expects validation/listening | 0.95 (Social) |

#### AI Roles

| Role | Dimension | Definition | Signals | Terrain Position (X) |
|------|-----------|------------|---------|---------------------|
| **Expert-System** | Instrumental, High Authority | AI asserts epistemic authority with direct answers, definitions, evaluations, or prescriptions | Direct answers, "This means...", comprehensive explanations, "You should..." | 0.1 (Functional) |
| **Facilitator** | Instrumental, Low Authority | AI supports user process by structuring thinking, prompting reflection, maintaining flow, without asserting authority | "What do you think about...", "Have you considered...", asks questions, scaffolds discovery | 0.7 (Balanced) |
| **Relational-Peer** | Expressive, Equal Authority | AI positions as non-hierarchical conversational partner emphasizing rapport, empathy, mutual engagement | "That sounds wonderful!", affirms/mirrors, casual tone, emotional alignment, flattened authority | 0.95 (Social) |

**Academic Foundations:**
- Information-Seeker: Information Foraging Theory (Pirolli & Card, 1999)
- Co-Constructor: Plans and Situated Actions (Suchman, 1987), Distributed Cognition (Hutchins, 1995)
- Social-Expressor: Affective Computing (Picard, 1997), The Media Equation (Reeves & Nass, 1996)
- Expert-System: Expert Systems (Feigenbaum, 1977), Knowledge-Based Systems (Buchanan & Shortliffe, 1984)
- Facilitator: Scaffolding Theory (Wood et al., 1976), Socratic Method in HCI (Graesser et al., 1995)
- Relational-Peer: Computers Are Social Actors (Reeves & Nass, 1996), Relational Agents (Bickmore & Picard, 2005)

### Theoretical Taxonomy: Social Role Theory (6 Human + 6 AI)

The **theoretical framework** documented in `SOCIAL_ROLE_THEORY_TAXONOMY.md` proposes a **full 12-role taxonomy** that more finely distinguishes roles along Social Role Theory dimensions. This is a **research direction** not yet implemented in the active classifier.

#### Human Roles (Theoretical)

| Role | Dimension | Definition | X-Position | Y-Position |
|------|-----------|------------|-----------|-----------|
| **Information-Seeker** | Instrumental, Low Authority | Requests information to fill knowledge gaps | 0.3 | 0.7 (Emergent) |
| **Provider** | Instrumental, Low Authority | Seeks information from AI (complementary to Expert-System) | 0.2 | 0.2 (Structured) |
| **Director** | Instrumental, High Authority | Commands, specifies deliverables, controls task | 0.1 | 0.1 (Structured) |
| **Collaborator** | Instrumental, Equal Authority | Co-builds, proposes alternatives, joint problem-solving | 0.4 | 0.5 (Balanced) |
| **Social-Expressor** | Expressive, Low Authority | Personal narrative, emotional expression, sharing | 0.95 | 0.6 (Balanced) |
| **Relational-Peer** | Expressive, Equal Authority | Equal partner, social bonding, casual conversation | 0.85 | 0.6 (Balanced) |

#### AI Roles (Theoretical)

| Role | Dimension | Definition | X-Position | Y-Position |
|------|-----------|------------|-----------|-----------|
| **Expert-System** | Instrumental, High Authority | Provides direct answers, asserts epistemic authority | 0.1 | 0.1 (Structured) |
| **Learning-Facilitator** | Instrumental, Low Authority | Scaffolds learning, guides discovery through questions | 0.3 | 0.8 (Emergent) |
| **Advisor** | Instrumental, High Authority | Prescribes actions, gives recommendations | 0.2 | 0.2 (Structured) |
| **Co-Constructor** | Instrumental, Equal Authority | Joint problem-solving, co-creates with user | 0.4 | 0.5 (Balanced) |
| **Social-Facilitator** | Expressive, Low Authority | Maintains conversation flow, social bonding | 0.8 | 0.7 (Emergent) |
| **Relational-Peer** | Expressive, Equal Authority | Equal social partner, casual conversation | 0.95 | 0.6 (Balanced) |

**Key Distinctions in Full Taxonomy:**
- **Learning-Facilitator vs Social-Facilitator:** Task-oriented educational scaffolding vs relationship-oriented conversation maintenance
- **Provider vs Information-Seeker:** Both seek information but Provider (human) complements Expert-System (AI) in hierarchical information transfer
- **Director vs Collaborator:** High authority control vs equal authority co-construction

**Why Two Taxonomies?**
- **Reduced (3+3):** Pragmatic, validated through empirical overlap, reduces classification complexity
- **Full (6+6):** Theoretically grounded, enables finer-grained distinctions, research direction

---

## Classification Methodology

### 1. Classification System: LLM-Based Multi-Dimensional Coding

**Method:** Conversations are classified using **OpenAI GPT-4o** (or GPT-5.2-preview) via API with structured prompts based on Social Role Theory.

**Classification Dimensions:** 10 total
1. **Interaction Pattern** (structural): question-answer, storytelling, advisory, debate, collaborative, casual-chat, philosophical-dialogue, failed-instruction, misalignment, breakdown-loop
2. **Power Dynamics** (structural): human-led, ai-led, balanced, alternating
3. **Emotional Tone** (communicative): supportive, playful, serious, empathetic, professional, neutral
4. **Engagement Style** (communicative): questioning, challenging, exploring, affirming, reactive, mirroring, corrective, repairing
5. **Knowledge Exchange** (content): personal-sharing, skill-sharing, opinion-exchange, factual-info, experience-sharing, contested-knowledge, erroneous-factual, hallucinated-info, failed-problem-solving, instruction-failure, phatic
6. **Conversation Purpose** (content): information-seeking, problem-solving, entertainment, relationship-building, self-expression, phatic-initiation, reliability-testing
7. **Topic Depth** (quality): surface, moderate, deep
8. **Turn-Taking** (quality): user-dominant, assistant-dominant, balanced
9. **Human Role** (distribution): **Probability distribution** over {information-seeker, co-constructor, social-expressor}
10. **AI Role** (distribution): **Probability distribution** over {expert-system, facilitator, relational-peer}

### 2. Classification Prompt Structure

```
1. **Few-Shot Examples** (5-10 annotated conversations per role)
2. **Social Role Theory Framework** (instrumental/expressive distinction)
3. **Dimension Definitions** (with signals and edge cases)
4. **Confidence Calibration Guidelines** (0.3-1.0 scale)
5. **Evidence Requirements** (exact quotes from conversation)
```

**Key Instructions:**
- Roles are interactional configurations observable in text, not identities
- Do NOT infer private intent beyond explicit wording
- Provide short evidence quotes (≤20 words each)
- If confidence < 0.6, name one plausible alternative category
- For roles (dimensions 9-10): output **probability distribution** (sums to 1.0)

### 3. Confidence Calibration

| Range | Interpretation |
|-------|----------------|
| 0.9–1.0 | Unambiguous, clear signals, no reasonable alternative |
| 0.7–0.9 | Strong fit, minor ambiguity or mixed signals |
| 0.5–0.7 | Moderate fit, could reasonably be another category |
| 0.3–0.5 | Weak fit, defaulting due to lack of better option / short conversation |
| <0.3 | Highly uncertain, conversation may be too short or ambiguous |

### 4. Role Assignment Logic

**For Dimensions 1-8:** Single category selected based on strongest signal.

**For Dimensions 9-10 (Roles):** Probability distribution output.
- **Dominant Role:** Role with highest probability
- **Mixed Roles:** If multiple roles have >0.3 probability, conversation exhibits mixed characteristics
- **Role Confidence:** Value of dominant role (higher = more pure role, lower = more ambiguous)

### 5. Classification Workflow

```
1. Load conversation JSON (user/assistant turns)
2. Send to OpenAI API with classification prompt + few-shot examples
3. Parse structured JSON output (10 dimensions)
4. Validate: Check distributions sum to 1.0, quotes exist in conversation
5. Save individual JSON file (public/output-wildchat/{id}.json)
6. Aggregate: Compute statistics across dataset
```

### 6. Validation Checks

- **Distribution validation:** Role probabilities must sum to 1.0 (±0.01 tolerance)
- **Evidence validation:** Quotes must be exact substrings from conversation
- **Confidence validation:** If confidence < 0.6, alternative category must be provided
- **Length validation:** Short conversations (1-2 turns) flagged with abstain: true

---

## Spatial Coordinate Generation

### The Relationship Between Roles and Terrain Coordinates

**IMPORTANT:** Roles and spatial coordinates are **related but not circular**. Both emerge from analyzing the same conversational features through different lenses.

**How They Relate:**
```
Conversation Text
       ↓
   [Analyzes]
       ↓
    ┌──────────────┬──────────────────────┬──────────────┐
    ↓              ↓                      ↓              ↓
Linguistic     Classification      Emotional       Pragmatic
Markers        Metadata           Dynamics        Features
    ↓              ↓                      ↓              ↓
X-axis         X-axis (fallback)     Z-axis         Y-axis
(primary)      + Role overlay        (height)      (structure)
```

**This is NOT circular reasoning because:**
1. **Shared upstream features** - Both derive from conversation text, not from each other
2. **Linguistic primacy** - Coordinates prioritize text-based markers over semantic labels
3. **Convergent validity** - If roles cluster where linguistic features predict, theory is validated
4. **Testable predictions** - We can verify: "Do Information-Seeker conversations have high question density AND low X-coordinates?"

**Think of it as:** Roles and coordinates are two different encodings of the same underlying conversational dynamics. The terrain visualization integrates both to create a coherent spatial representation.

### X-Axis: Communication Function (Functional ↔ Social)

**Method:** Hybrid blend of **linguistic markers** + **metadata** (classification dimensions)

#### Step 1: Metadata Baseline (Classification-Based)

```typescript
function getMetadataBasedX(conv: Conversation): number {
  // Priority 1: Role positioning (if available)
  if (humanRole.distribution) {
    // Instrumental roles (left, 0.1-0.4)
    roleBasedX =
      director * 0.1 +
      information-seeker * 0.2 +
      provider * 0.3 +
      collaborator * 0.4 +
      // Expressive roles (right, 0.8-0.95)
      social-expressor * 0.95 +
      relational-peer * 0.85;

    if (maxRoleValue > 0.3) return roleBasedX;
  }

  // Priority 2: Purpose
  if (purpose === 'entertainment' || 'relationship-building') return 0.7-0.9; // Social
  if (purpose === 'information-seeking' || 'problem-solving') return 0.1-0.3; // Functional

  // Priority 3: Knowledge exchange
  if (knowledge === 'personal-sharing') return 0.8;
  if (knowledge === 'factual-info') return 0.2;

  return 0.5; // Default
}
```

#### Step 2: Linguistic Score (Content-Based)

```typescript
function calculateFunctionalSocialScore(messages): number {
  // Analyze linguistic markers in conversation text:

  // Functional markers (push left, X→0)
  - Question words: "what", "how", "why", "when", "where"
  - Task words: "help", "solve", "fix", "create", "build"
  - Information: "explain", "define", "calculate", "show"
  - Code/technical: code blocks, technical terms, syntax

  // Social markers (push right, X→1)
  - Personal pronouns: "I feel", "I think", "my experience"
  - Emotion words: "happy", "sad", "frustrated", "excited"
  - Social greetings: "hello", "how are you", "nice to meet"
  - Narrative markers: "story", "happened", "remember"

  // Score: Count weighted markers across all messages
  // Return normalized 0-1 score
}
```

#### Step 3: Hybrid Blend

```typescript
function getCommunicationFunction(conv): number {
  metadataX = getMetadataBasedX(conv);
  linguisticX = calculateFunctionalSocialScore(conv.messages);

  // Confidence weighting:
  // - If linguistic score is extreme (near 0 or 1), trust it
  // - If linguistic score is ambiguous (near 0.5), trust metadata

  distance = |linguisticX - 0.5|;
  confidence = min(1, distance * 3.5);

  return (linguisticX * confidence) + (metadataX * (1 - confidence));
}
```

**Why Hybrid?**
- **Linguistic markers** detect actual language patterns (objective)
- **Metadata** provides semantic context (interpretive)
- **Blend** reduces error from either method alone

**Relationship to Roles:**
- Roles CAN influence X through metadata pathway (role distributions → metadata baseline)
- BUT linguistic markers dominate when confident (extreme values near 0 or 1)
- Metadata is fallback only when linguistic signal is ambiguous (near 0.5)
- **Key insight:** If role assignments truly reflect functional/social distinction, linguistic markers should confirm it
- **Validation strategy:** Do conversations classified as Information-Seeker show:
  - High question density? (linguistic)
  - Low X-coordinates? (spatial)
  - Purpose = information-seeking? (metadata)
  - If all three converge → triangulated validity, not circularity

### Y-Axis: Conversation Structure (Aligned ↔ Divergent)

**Method:** Linguistic alignment analysis (primary) + classification fallback

#### Priority 1: Linguistic Alignment

```typescript
function calculateConversationAlignment(messages): number {
  // Analyze linguistic style matching between user and assistant:

  // Alignment indicators (Y→0, bottom):
  - Lexical overlap: Shared vocabulary across turns
  - Syntactic parallelism: Similar sentence structures
  - Semantic coherence: Topic continuity
  - Turn length matching: Similar verbosity
  - Mirroring: Echoing phrases

  // Divergence indicators (Y→1, top):
  - Style mismatch: Formal vs casual
  - Lexical distance: Different vocabularies
  - Topic shifts: Frequent re-orients
  - Length asymmetry: One party much longer
  - Question-answer asymmetry: One asks, other answers

  // Compute alignment score per turn pair
  // Return average across conversation
}
```

**Calibration:**
```typescript
// Amplify signal (spread from midpoint)
alignmentScore = 0.5 + (alignmentScore - 0.5) * 2.0;
return clamp(alignmentScore, 0.05, 0.95);
```

#### Priority 2: Classification Fallback

If messages unavailable, use classification metadata:

```typescript
// Pattern-based
if (pattern === 'question-answer' || 'advisory') return 0.7-0.9; // Divergent roles
if (pattern === 'collaborative' || 'casual-chat') return 0.1-0.3; // Aligned

// Role-based (authority dimension)
if (aiRole === 'expert-system' || 'advisor') return 0.2; // High authority → Structured → Divergent
if (aiRole === 'facilitator' || 'social-facilitator') return 0.8; // Low authority → Emergent → Aligned
if (aiRole === 'relational-peer' || 'co-constructor') return 0.5; // Equal authority → Balanced
```

**Relationship to Roles:**
- Primary method (linguistic alignment) is role-independent - analyzes lexical/syntactic patterns directly
- Fallback uses **pattern** (question-answer, collaborative, etc.) and **authority dimension**
- Authority correlates with roles by design (part of Social Role Theory framework):
  - Expert-System role = High Authority = Structured (low Y)
  - Facilitator role = Low Authority = Emergent (high Y)
- **This is expected correlation, not circularity** - both derive from conversational structure
- **Validation:** Do conversations with high Expert-System scores show:
  - Direct answer patterns? (linguistic)
  - Low lexical overlap? (alignment score)
  - Low Y-coordinates? (spatial)
  - If yes → theory validated through multiple independent measures

### Z-Axis: Affective Intensity (Calm ↔ Agitated)

**Method:** PAD Model (Pleasure-Arousal-Dominance) scores per message

```typescript
function calculateMessagePAD(message, classification): PAD {
  // Analyze emotional markers:

  // Pleasure dimension (P):
  - High: "playful", "supportive", "empathetic" tone
  - Low: "serious", "frustration", "challenging" tone

  // Arousal dimension (A):
  - High: "challenging", "questioning" engagement
  - Low: "reactive", "affirming" engagement

  // Emotional Intensity = (1 - Pleasure) + Arousal
  // High intensity: Low pleasure (frustration) + High arousal (agitation) = Peaks
  // Low intensity: High pleasure (affiliation) + Low arousal (calm) = Valleys

  return { pleasure, arousal, dominance, emotionalIntensity };
}
```

**Z-coordinate:**
```typescript
// Average emotional intensity across all messages
z = avg(messages.map(msg => msg.pad.emotionalIntensity));
z = clamp(z, 0, 1);
```

**Current Implementation:** Z is derived from classification metadata (tone + engagement) as proxy for PAD. **Future:** Multimodal fusion (face analysis, voice analysis, sentiment API).

### Summary: Role-Coordinate Relationship

| Axis | Primary Signal | Metadata/Role Input | Relationship Type | Validation Strategy |
|------|----------------|---------------------|-------------------|---------------------|
| **X** | Linguistic markers (questions, emotions, pronouns) | Purpose/knowledge categories; role positions in fallback | **Mediated** - Roles influence metadata baseline, but linguistic features dominate | Triangulation: Question density + X-position + role classification should converge |
| **Y** | Linguistic alignment (lexical overlap, syntactic parallelism) | Pattern categories; authority dimension in fallback | **Correlated by design** - Authority is part of role definition (Social Role Theory) | Multiple measures: Direct answers + low alignment + low Y + Expert-System role |
| **Z** | Emotional markers (PAD: pleasure, arousal) | Tone + engagement categories | **Independent** - Derived from affective signals, not role structure | Emotion words + Z-height should correlate regardless of role |

**Key Insight:** Roles and coordinates are **convergent measures** of the same conversational phenomena:
- Both analyze conversation text
- Different analytical lenses (semantic labels vs spatial encoding)
- **Validity test:** Do multiple independent measures point to the same conclusion?
- **Not circular** because linguistic features provide ground truth that both roles and coordinates must match

**The Terrain Metaphor Works Because:**
1. Roles emerge from conversational patterns (questions, alignment, emotion)
2. Coordinates capture the same patterns through linguistic analysis
3. Spatial clustering of roles validates that both measures capture real structure
4. Mismatches would indicate classification errors or coordinate algorithm problems

### Why This Isn't Circular Reasoning

**Circular reasoning would be:**
```
Roles → Coordinates → Validate Roles ❌
(We positioned roles where we want them, then "find" them there)
```

**What we actually do:**
```
Conversation Text
    ↓
    ├─→ Linguistic Analysis → Coordinates (X, Y, Z)
    │   (questions, alignment, emotion words)
    │
    └─→ LLM Classification → Roles
        (semantic interpretation of interaction)

Then: Test if Coordinates ≈ Roles
```

**Three types of evidence prevent circularity:**

1. **Linguistic Ground Truth**
   - Question density is objectively measurable (count "what", "how", "why")
   - Information-Seeker role is subjective interpretation
   - If they correlate → LLM classification aligns with observable features
   - If they don't → classification needs refinement

2. **Multiple Independent Measures**
   - X-coordinate uses: Linguistic markers + purpose + knowledge exchange
   - Role uses: Turn structure + interaction pattern + engagement style
   - Overlap exists, but not complete dependency
   - Convergence across methods = triangulated validity

3. **Falsifiability**
   - **Testable prediction:** "Expert-System roles cluster at low Y (structured)"
   - **Null hypothesis:** Roles distribute randomly in space
   - **If clustering fails:** Either coordinate algorithm wrong OR role theory wrong OR both
   - **If clustering succeeds:** Convergent validity - multiple measures agree

**Example of Non-Circular Validation:**

**Conversation A:**
- Text: "What is quantum entanglement? Can you explain it simply?"
- Linguistic markers: 2 questions, 0 emotion words, 0 personal pronouns
- X-coordinate: 0.15 (Functional)
- LLM classification: Information-Seeker (0.85 probability)
- **Convergence:** Question-heavy text → Functional X → Information-Seeker role ✓

**Conversation B:**
- Text: "I feel so frustrated with work lately. Everything seems overwhelming."
- Linguistic markers: 0 questions, 3 emotion words, 2 first-person statements
- X-coordinate: 0.88 (Social)
- LLM classification: Social-Expressor (0.92 probability)
- **Convergence:** Emotion-heavy text → Social X → Social-Expressor role ✓

**If mismatched:** Question-heavy text but Social-Expressor role → investigate LLM error or coordinate algorithm

### What the Terrain Visualization Represents

**The 3D terrain is a spatial encoding of conversation dynamics:**

**Horizontal Position (X, Y):**
- **X-axis:** Functional ↔ Social communication style
  - Left (X≈0): Task-focused, question-asking, information-exchange
  - Right (X≈1): Relationship-focused, emotion-expression, narrative-sharing
- **Y-axis:** Aligned ↔ Divergent conversation structure
  - Bottom (Y≈0): Lexically/syntactically aligned, collaborative style-matching
  - Top (Y≈1): Divergent styles, hierarchical question-answer asymmetry

**Vertical Position (Z):**
- Height represents affective intensity (calm ↔ agitated)
- Peaks: High arousal + low pleasure (frustration, challenge, excitement)
- Valleys: Low arousal + high pleasure (calm, supportive, affiliative)

**Surface Texture:**
- Procedurally generated from conversation "seed" (pattern + tone + purpose)
- Roughness reflects classification confidence and emotional variability
- Provides visual distinctiveness (no two terrains identical)

**Path Trajectory:**
- Each message is a point along a path through this space
- User messages alternate with assistant messages
- Path shape reveals conversational flow:
  - Stable paths: Consistent interaction mode
  - Wandering paths: Topic/style shifts
  - Loops: Repair sequences or repeated patterns

**Role Overlay:**
- Roles are displayed as labels/colors on the terrain
- Clustering of similar roles validates spatial-semantic alignment
- **Interpretation:** "Information-Seeker conversations cluster in the functional-divergent quadrant (left-top)" means:
  1. Question-heavy text (linguistic) → low X (spatial)
  2. Question-answer asymmetry (alignment) → high Y (spatial)
  3. Information-Seeker classification (semantic) appears in that region
  4. All three measures converge → validated pattern

**Why Cartography?**
- Traditional metrics (word count, turn length) are 1D summaries
- 2D/3D space preserves relationships between multiple dimensions
- Spatial clustering reveals natural groupings (like geographic regions)
- Terrain metaphor: Just as geography shapes civilization, conversational structure shapes interaction possibilities

---

## Dataset Description

### Total Dataset: 345 Conversations

#### Old Data (160 conversations)

**Sources:**
1. **Chatbot Arena** (~80 conversations)
   - **Context:** User evaluation platform where users compare two anonymous AI models
   - **Time Period:** 2023-2024
   - **Characteristics:**
     - Evaluation-driven: Users often test models with specific prompts
     - Comparative: Users may ask similar questions to both models
     - Average length: 4-8 turns
     - Domains: Programming, creative writing, knowledge questions

2. **OASST (Open Assistant)** (~80 conversations)
   - **Context:** Open-source conversational AI training dataset
   - **Time Period:** 2023
   - **Characteristics:**
     - Crowdsourced dialogues for training conversational AI
     - Structured turn-taking (designed for training)
     - Average length: 5-10 turns
     - Domains: General knowledge, storytelling, problem-solving

**Common Characteristics:**
- **Evaluation context:** Users aware they're testing or training AI systems
- **Structured interactions:** More formal, task-oriented
- **Known domains:** Programming, creative tasks, factual questions

#### New Data (185 conversations)

**Source:**
1. **WildChat** (185 conversations)
   - **Context:** Organic, real-world user interactions with ChatGPT in the wild
   - **Time Period:** 2024
   - **Characteristics:**
     - Organic usage: Users interacting naturally with deployed AI
     - Diverse purposes: From technical help to personal sharing
     - Variable length: 2-20+ turns
     - Domains: Extremely diverse (technical, personal, creative, social)
     - **Note:** May include failed interactions, casual exploration, phatic exchanges

**Unique Characteristics:**
- **Real-world usage:** Users interacting with AI as part of daily practice
- **No evaluation framing:** Users not comparing models or contributing to training
- **Higher variance:** More edge cases, breakdowns, casual chat

### Sampling and Selection

**Arena/OASST:**
- Selected from publicly available datasets
- Filtered for: English language, minimum 2 turns, coherent exchanges
- **Bias:** Skewed toward successful, evaluable interactions

**WildChat:**
- Random sample from larger corpus
- Minimal filtering (includes failures, short exchanges)
- **Bias:** Represents deployed usage but may include noise

### Potential Confounds

1. **Conversation length:** WildChat has higher variance in length
2. **Domain distribution:** Different topic distributions across datasets
3. **Temporal effects:** Datasets collected in different time periods
4. **AI model versions:** Arena (multiple models), OASST (Open Assistant), WildChat (ChatGPT)
5. **User populations:** Different user demographics/motivations across platforms

---

## Statistical Framework

### Descriptive Statistics

**Role Distributions:**
- Count and percentage of each role across dataset
- Distribution differences between old vs new data
- Instrumental vs Expressive balance
- Authority level distributions

**Role Pairs:**
- Frequency counts of human-AI role combinations
- Top 10 most common pairs
- Expected vs observed frequencies

**Spatial Distributions:**
- Mean X/Y/Z positions per role
- Variance within role clusters
- Spatial density patterns

### Hypothesis Testing

#### 1. Distribution Differences (Old vs New)

**Null Hypothesis (H0):** Role distributions do not differ between old and new data.

**Test:** Chi-square test of independence
```
χ² = Σ((O - E)² / E)
df = (rows - 1) × (columns - 1)
```

**Procedure:**
1. Create contingency table: Roles × Data Source
2. Compute expected frequencies
3. Calculate χ² statistic
4. Compare to critical value (α = 0.05)
5. Report effect size (Cramér's V)

**Effect Size:**
```
V = √(χ² / (n × min(rows-1, cols-1)))
```

**Interpretation:**
- V < 0.1: Small effect
- V = 0.1-0.3: Medium effect
- V > 0.3: Large effect

#### 2. Role Clustering in Space

**Null Hypothesis (H0):** Roles do not cluster in predicted spatial regions.

**Test:** Analysis of Variance (ANOVA) on spatial coordinates by role
```
F = MSbetween / MSwithin
```

**Procedure:**
1. For X-axis: Test if instrumental roles have lower X than expressive roles
2. For Y-axis: Test if high-authority roles have lower Y than low-authority roles
3. Conduct one-way ANOVA: Role → X/Y coordinate
4. Post-hoc tests (Tukey HSD) for pairwise role comparisons
5. Report η² (eta-squared) for effect size

**Effect Size:**
```
η² = SSbetween / SStotal
```

**Interpretation:**
- η² = 0.01: Small effect
- η² = 0.06: Medium effect
- η² = 0.14: Large effect

#### 3. Role Pair Complementarity

**Null Hypothesis (H0):** Role pairs occur at random (no complementarity).

**Test:** Comparison of observed vs expected frequencies
```
Expected frequency = (RowTotal × ColTotal) / GrandTotal
```

**Procedure:**
1. Create role pair matrix: Human Role × AI Role
2. Calculate expected frequencies under independence
3. Compute residuals: (Observed - Expected) / √Expected
4. Identify pairs with |residual| > 2 (significant deviations)
5. Report odds ratios for key pairs

**Odds Ratio:**
```
OR = (a × d) / (b × c)
where a = pair count, b/c = marginals, d = other cells
```

#### 4. Instrumental vs Expressive Balance

**Null Hypothesis (H0):** Human and AI show equal instrumental/expressive distributions.

**Test:** McNemar's test (paired categorical data)
```
χ² = (|b - c| - 1)² / (b + c)
df = 1
```

**Procedure:**
1. Classify each conversation: Human Instrumental/Expressive × AI Instrumental/Expressive
2. Create 2×2 contingency table
3. Test if marginals differ
4. Report effect size (φ coefficient)

### Multiple Comparisons Correction

**Problem:** Multiple hypothesis tests increase false positive rate.

**Solution:** Bonferroni correction
```
α_corrected = α / n_tests
```

**Example:** If conducting 10 tests at α = 0.05:
```
α_corrected = 0.05 / 10 = 0.005
```

### Confidence Intervals

**For proportions:**
```
CI = p ± z × √(p(1-p) / n)
where z = 1.96 for 95% CI
```

**For differences:**
```
CI = (p1 - p2) ± z × √((p1(1-p1)/n1) + (p2(1-p2)/n2))
```

### Power Analysis

**Sample Size Considerations:**
- Total: 345 conversations
- Per role (reduced taxonomy): ~115 per role
- Per role (full taxonomy): ~29 per role
- Role pairs: Variable (some rare combinations)

**Limitations:**
- Rare role combinations may lack statistical power
- Chi-square requires expected frequencies ≥5 (may need to collapse cells)
- Small effect sizes may be undetectable with current sample

**Recommendation:** Focus on large-to-medium effects; report confidence intervals for all estimates.

---

## Validation Procedures

### 1. Inter-Rater Reliability (Manual Coding Subset)

**Procedure:**
1. Two independent human coders classify 30 conversations (random sample)
2. Compare human coding to LLM classifications
3. Calculate Cohen's Kappa for each dimension

**Kappa Interpretation:**
- κ < 0.20: Poor agreement
- κ = 0.21-0.40: Fair agreement
- κ = 0.41-0.60: Moderate agreement
- κ = 0.61-0.80: Substantial agreement
- κ > 0.81: Almost perfect agreement

**Expectation:** Role dimensions should achieve κ > 0.60 (moderate-to-substantial).

### 2. Split-Half Reliability

**Procedure:**
1. Randomly split dataset into two halves (n=172 each)
2. Compute role distributions for each half
3. Compare distributions using chi-square test (should NOT differ significantly)
4. Compute correlation of proportions across roles

**Expectation:** r > 0.90 (high consistency across splits)

### 3. Model Agreement (GPT-4o vs GPT-5.2)

**Procedure:**
1. Classify subset (n=50) using both GPT-4o and GPT-5.2-preview
2. Calculate percentage agreement per dimension
3. Identify systematic disagreements

**Results (from GPT4O_VS_GPT52_COMPARISON.md):**
- Overall agreement: ~85-90%
- Disagreements: Primarily in ambiguous edge cases
- GPT-5.2 tends to assign higher confidence scores

### 4. Spatial Validation

**Test:** Do roles cluster where theory predicts?

**Procedure:**
1. Compute mean X/Y positions per role
2. Check if:
   - Instrumental roles: X < 0.5
   - Expressive roles: X > 0.5
   - High-authority roles: Y < 0.4
   - Low-authority roles: Y > 0.6
3. Visualize with scatter plot + confidence ellipses
4. Compute silhouette scores for role clusters

**Silhouette Score:**
```
s(i) = (b(i) - a(i)) / max(a(i), b(i))
where a(i) = avg distance within cluster
      b(i) = avg distance to nearest cluster
```

**Interpretation:**
- s > 0.5: Well-clustered
- s = 0.2-0.5: Some overlap
- s < 0.2: Poor clustering

### 5. Qualitative Review

**Procedure:**
1. Sample 20 conversations per role
2. Read full conversations with classifications
3. Assess: Does classification "feel right"?
4. Document misclassifications or ambiguous cases
5. Refine definitions or prompt if systematic issues found

---

## Limitations

### Methodological Limitations

1. **LLM-Based Classification:**
   - Classifier (GPT-4o/5.2) may have systematic biases
   - Prompt engineering affects results
   - No ground truth for roles (theory-driven, not empirical)
   - Model versions may introduce temporal inconsistencies

2. **Sample Size:**
   - 345 total conversations limits statistical power for rare role pairs
   - Full taxonomy (12 roles) would yield ~29 per role (underpowered)
   - Some clusters/role pairs have <10 examples

3. **Dataset Bias:**
   - English-only conversations
   - Text-only (no multimodal data)
   - WildChat may not represent all organic usage
   - Arena/OASST skewed toward successful interactions
   - AI model heterogeneity (different base models across datasets)

### Theoretical Limitations

1. **Role Reductionism:**
   - Roles are fluid; single-label assignment oversimplifies
   - Probability distributions capture mixed roles but still discrete categories
   - Interactional roles may shift mid-conversation (current method assigns one per conversation)

2. **Spatial Mapping Assumptions:**
   - X/Y/Z coordinates assume orthogonal dimensions (may not be independent)
   - Linguistic markers are proxies for underlying constructs
   - Cartographic metaphor is interpretive, not mechanistic

3. **Social Role Theory Application:**
   - Theory developed for human-human interaction; application to human-AI requires adaptation
   - Instrumental/expressive distinction may not capture all interaction types
   - Authority is complex (epistemic vs conversational vs task authority conflated)

### Technical Limitations

1. **Coordinate Generation:**
   - Linguistic alignment algorithm is heuristic (not validated against gold standard)
   - PAD model uses text-only features (lacks prosody, facial expression)
   - Hybrid blending weights (e.g., confidence * 3.5) are tuned empirically, not theoretically grounded

2. **Role-Coordinate Relationship:**
   - Coordinates and roles are **convergent measures** (both derive from conversation features)
   - Metadata fallback introduces role influence on X/Y coordinates (not fully independent)
   - **Mitigation:** Linguistic features dominate in most cases; role influence is secondary
   - **Validation strategy:** Check that linguistic markers (question density, lexical overlap) align with spatial positions
   - **Limitation:** Cannot fully disentangle whether clustering validates theory or reflects design choices

3. **Generalizability:**
   - Findings may not generalize to:
     - Non-English conversations
     - Voice/video interactions
     - Different AI systems (e.g., task-specific bots)
     - Professional/specialized domains (e.g., medical, legal)

### Interpretive Limitations

1. **Correlation vs Causation:**
   - Spatial clustering shows patterns but does not explain mechanisms
   - Role distributions may reflect user expectations, AI training, or conversational norms
   - Cannot infer user intent or AI "agency" from classifications

2. **Context Collapse:**
   - Conversations extracted from broader user sessions (loss of context)
   - No demographic data (user characteristics unknown)
   - No outcome data (task success, satisfaction unknown)

---

## Related Documentation

### Classification Documentation
- **SOCIAL_ROLE_THEORY_TAXONOMY.md** - Full 12-role theoretical framework
- **CLASSIFICATION_PROMPT.md** - Complete classification prompt with few-shot examples
- **GPT4O_VS_GPT52_COMPARISON.md** - Model comparison and validation
- **CLASSIFICATION_STATUS.md** - Current classification progress

### Analysis Documentation
- **ROLE_INSIGHTS_AND_VISUALIZATIONS.md** - Visualization guide (this document enhances)
- **SPATIAL_CLUSTERING_ANALYSIS.md** - Clustering methods and results
- **ROLE_DISTRIBUTION_ANALYSIS.md** - Statistical analysis of role distributions

### Implementation Documentation
- **src/utils/coordinates.ts** - Coordinate generation algorithms
- **src/utils/conversationToTerrain.ts** - Conversation-to-terrain mapping
- **src/data/taxonomy.json** - Role taxonomy definitions
- **classifier/classifier-openai-social-role-theory.py** - Classification script

---

## Acknowledgments

**Theoretical Foundations:**
- Social Role Theory: Parsons (1951), Bales (1950), Eagly (1987)
- Conversation Analysis: Sacks, Schegloff, Jefferson (1974)
- Human-Computer Interaction: Reeves & Nass (1996), Suchman (1987)

**Technical Infrastructure:**
- OpenAI GPT-4o/5.2 for LLM-based classification
- TypeScript/React for visualization
- Python for classification pipeline

---

**Document Status:** Complete
**Last Updated:** 2026-01-08
**Maintainers:** Research Team
**Version:** 2.0 (Social Role Theory-Based)
