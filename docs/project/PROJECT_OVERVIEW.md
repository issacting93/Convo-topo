# Project Overview: Conversational Topography

## What Is This Project?

**Conversational Topography** is an interactive 3D visualization system that represents human-LLM conversations as navigable terrain landscapes. Instead of showing conversations as linear transcripts, it reveals **relational patterns**—how people position themselves over time, how authority shifts, and how emotional intensity creates peaks and valleys.

The core insight: **Aggregate role classifications compress away three kinds of temporal information: user emotional engagement, interaction quality, and anomalies. The terrain preserves all three, making visible where conversations deviate from their labeled pattern—even when the deviation lasts only a single message.**

**What this means:** The most consequential shifts in human-AI relationships occur invisibly—not in what is said, but in how people position themselves relationally (delegating agency, seeking authority, building rapport). These patterns are difficult to notice because social responses to computational systems arise automatically and often unconsciously. The terrain visualization reveals temporal dynamics that role classifications erase, including:
1. **User emotional engagement** (sarcasm, escalation, volatility)
2. **Interaction quality** (smooth learning vs. erratic patterns)
3. **Anomalies** (AI errors, breakdowns, single-message deviations)

---

## What Data Did We Use?

### Data Sources

The project uses **real human-LLM conversations** from multiple sources:

1. **Chatbot Arena Conversations** (128 conversations)
   - Source: LMSYS Chatbot Arena dataset (HuggingFace)
   - Characteristics: Diverse interaction patterns (technical, casual, advisory)
   - Message counts: 10-18 messages per conversation
   - Languages: Mixed (English, Spanish, French)
   - **Note**: Dataset bias toward information-seeking reflects evaluation context

2. **OpenAssistant (OASST) Conversations** (32 conversations)
   - Source: OpenAssistant dataset
   - Characteristics: Longer conversations (20+ messages)
   - Purpose: Testing pattern visibility in extended interactions

3. **WildChat-1M Dataset** (additional conversations integrated)
   - Source: [allenai/WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)
   - Characteristics: 838k organic ChatGPT conversations in the wild
   - Purpose: Cross-dataset validation to address Chatbot Arena bias
   - Status: Partially integrated, classification and PAD generation ongoing
   - See `WILDCHAT_INTEGRATION.md` for details

**Total Dataset**: 533 conversations loaded (as of 2026-01-09)
- **Final Validated Corpus**: 345 conversations used in analysis
- **Chatbot Arena**: 160 conversations (evaluation context)
- **OpenAssistant (OASST)**: 2 conversations
- **WildChat**: 371 valid files loaded (of 589 downloaded; 402 corrupted/skipped)
- **Classification**: GPT-5.2 with Social Role Theory taxonomy (6+6 roles)

### Data Structure

Each conversation includes:
- **Messages**: Turn-by-turn dialogue (user/assistant pairs)
- **Classification**: 9 dimensions analyzed by GPT-5.2:
  1. Interaction Pattern (technical, question-answer, advisory, etc.)
  2. Power Dynamics (human-dominant, balanced, AI-dominant)
  3. Emotional Tone (neutral, frustrated, playful, etc.)
  4. Engagement Style (questioning, directing, affirming, etc.)
  5. Knowledge Exchange (factual-info, problem-solving, etc.)
  6. Conversation Purpose (task-completion, exploration, etc.)
  7. Turn Taking (balanced, human-heavy, alternating)
  8. Human Role Distribution (probabilistic: Seeker 60%, Director 40%, etc.)
  9. AI Role Distribution (probabilistic: Expert 40%, Facilitator 60%, etc.)

- **PAD Scores**: Per-message Pleasure-Arousal-Dominance scores
  - **Pleasure** (0-1): Low = frustration, High = satisfaction
  - **Arousal** (0-1): Low = calm, High = agitated
  - **Dominance** (0-1): Low = passive, High = in control
  - **Emotional Intensity**: `(1 - pleasure) × 0.6 + arousal × 0.4`

### Data Processing Pipeline

1. **Download**: Conversations retrieved from datasets
2. **Classify**: GPT-5.2 analyzes each conversation using the 9-dimension taxonomy
3. **Generate PAD**: Calculate Pleasure-Arousal-Dominance scores per message
4. **Generate Terrain**: Create heightmap from classification seed
5. **Generate Path**: Calculate 3D path points from role distributions and PAD scores

---

## How Did We Map the Visuals?

The visualization uses a **3D coordinate system** that maps relational dynamics to spatial positions:

### X-Axis: Functional ↔ Social
- **Functional (left)**: Task-oriented exchanges (queries, code generation, information retrieval)
- **Social (right)**: Relationship-focused (rapport, deference, playfulness)
- **Mapping**: Derived from **human role distribution**
  - Director/Challenger → Functional (X ~0.2-0.3)
  - Sharer/Collaborator → Social (X ~0.7-0.8)
  - Seeker → Middle (X ~0.4)

### Y-Axis: Structured ↔ Emergent
- **Structured (bottom)**: Fixed rules, protocols, role-taking
- **Emergent (top)**: Dynamically co-created, role-making, negotiated
- **Mapping**: Derived from **AI role distribution** and conversation structure
  - Expert/Advisor → Structured (Y ~0.2-0.3)
  - Facilitator/Peer → Emergent (Y ~0.7-0.8)
  - Reflector → Middle (Y ~0.6)

### Z-Axis: Affective/Evaluative Intensity (PAD)
- **Height**: Directly from **emotional intensity** (0-1)
- **Formula**: `emotionalIntensity = (1 - pleasure) × 0.6 + arousal × 0.4`
- **Peaks** (high Z): Frustration/agitation (low pleasure + high arousal)
- **Valleys** (low Z): Affiliation/satisfaction (high pleasure + low arousal)

### Path Generation

**Start Position**: All conversations begin at center (0.5, 0.5, base height)

**Drift Formula**: Paths drift toward role-determined target positions over time
```typescript
targetX = f(human roles)      // Based on role distribution
targetY = f(AI roles)         // Based on role distribution
driftFactor = 0.10 + (progress × 0.30)  // Increases over time
currentX += (targetX - startX) × 1.2 × driftFactor
```

**"Revealing Pattern"**: Early messages set trajectory (low drift), later messages clarify destination (high drift)

### Visual Elements

1. **Terrain**: Heightmap generated from classification seed (provides visual context)
2. **Contours**: Elevation lines showing terrain structure (pulsing animation)
3. **Path Line**: Dashed yellow line connecting message points
4. **Markers**: 
   - Purple-blue spheres for user messages
   - Orange spheres for assistant messages
   - Height = PAD emotional intensity
   - Glow rings with animated opacity
5. **Grid/Axes**: Reference lines showing coordinate frame boundaries

---

## What Are the Interactions?

### Grid View (Initial Encounter)

**Terrain Cards**:
- Preview minimap showing 2D path projection
- Message count, dominant roles, PAD summary
- Classification dimensions with confidence scores

**Filters**:
- **Human Role**: Director, Challenger, Seeker, Learner, Sharer, Collaborator
- **AI Role**: Expert, Advisor, Facilitator, Reflector, Peer, Affiliative
- **Message Count**: Short (<10), Medium (10-20), Long (>20)
- **Epistemic Issues**: Has hallucination, has error, has repair, no issues
- **Failure Modes**: Has breakdown, has repair, no breakdown

**Interaction**: Click a card → Opens 3D terrain view

### 3D Terrain View

**Timeline Animation**:
- Progress slider controls path/marker visibility
- Animated reveal showing how conversation unfolds over time
- Links to conversation point selection

**Camera Controls**:
- **View Modes**: Default (isometric), Side (horizontal graph), Top (bird's-eye)
- **Distance**: 8-30 units (zoom in/out)
- **Elevation**: 0-90 degrees (angle)
- **Rotation**: 0-360 degrees (azimuth)
- **Drag to Rotate**: Mouse drag rotates camera around scene

**Point Interaction**:
- **Hover**: Highlights marker, shows message content in side panel
- **Click**: Locks point, shows full message details
- **Active Point**: Triggers post-processing effects (RGB shift, bloom)

**Right Panel**:
- Settings section (expandable, starts closed)
  - Camera distance, elevation, rotation sliders
  - Reset all, center terrain buttons
  - Terrain position controls
  - Contour toggle and count
  - Color customization
- Timeline animation controls
- **Minimap**: 2D projection with clickable timeline points
- **Message Display**: Shows active message content
- **PAD Display**: Shows Pleasure, Arousal, Dominance, Emotional Intensity
- **Role Distribution**: Horizontal progress bars for human/AI roles
- **Timeline**: Clickable points for navigation

**Bottom Timeline**:
- Visual timeline showing all messages
- Click points to jump to specific messages
- Linked to 3D scene selection

---

## What Do the Data and Trends Tell Us?

### Key Patterns Discovered

#### 1. AI Role Breakdown Pattern
**Finding**: When AI fails completely, role distribution becomes uniform (all roles ≈ 0.167)

**Characteristics**:
- High emotional intensity (EI = 0.8) - persistent frustration peaks
- Human-dominant power dynamics (user takes control)
- Role inversion: User shifts from Seeker → Director/Challenger
- Example: `chatbot_arena_09.json` - User asks for Java code, AI repeatedly fails with "no entiendo"

**Terrain Signature**: Persistent peaks + functional drift + clear role inversion

#### 2. Frustration Peak Pattern
**Finding**: Technical conversations with AI failures show consistent high intensity

**Characteristics**:
- Low pleasure (0.2), high arousal (0.8) → high intensity (0.8)
- Creates sharp peaks in terrain
- Frustration accumulates across turns (not just isolated moments)
- Visible in terrain as elevation spikes

#### 3. Role Inversion Signature
**Finding**: Spatial shift (X-axis drift) + elevation change (Z-axis peak)

**Pattern**:
- Initial: User as Seeker (40-50%), AI as Expert/Advisor
- After failure: User as Director/Challenger (40-50%), AI role breakdown
- Emotional trajectory: Intensity increases as role inversion occurs
- Power dynamics: Shifts from balanced → human-dominant

**Terrain**: Path drifts toward Functional (X-axis) as user takes control, elevation increases (peaks) as frustration builds

#### 4. Spatial Clustering by Pattern Type
**Finding**: Different interaction patterns cluster in different regions

- **Technical conversations**: Functional side (X), variable Y, frequent peaks
- **Question-Answer**: Balanced functional/social, structured (Y), moderate intensity
- **Creative**: Variable functional/social, emergent (Y), lower intensity (valleys)
- **Casual-chat**: Social (X), balanced Y, very low intensity (flat terrain)

#### 5. Affiliation Valleys
**Finding**: Low emotional intensity (EI < 0.3) creates valleys

**Characteristics**:
- High pleasure + low arousal = affiliation (smooth coordination)
- Explicit endorsement of AI's perspective ("That's exactly right")
- Different from alignment (structural cooperation)

**Terrain**: Depressed regions (valleys) in topography

#### 6. Persona Framing Signal
**Finding**: Emotional intensity decoupled from utility signals over-reliance

**Pattern**:
- Utility: Low (AI failing)
- Affect: High (EI ≈ 0.8-0.9) - remains high despite failure
- Terrain: Mountainous despite low utility

**Significance**: Ethical transition point - emotional over-reliance on AI even when it's not helpful

#### 7. Relational Positioning Archetypes (Cluster Analysis)

Analysis of 533 conversations (345 in final validated corpus) reveals **7 distinct relational positioning archetypes**:

1. **StraightPath_Stable_FunctionalStructured_QA_InfoSeeking** (32.2%, n=111): Instrumental communication, minimal relational negotiation, very straight paths (0.912)
2. **StraightPath_Stable_FunctionalStructured_Advisory_InfoSeeking** (28.1%, n=97): Advisory pattern, extremely straight paths (1.115), minimal drift (0.282)
3. **Valley_FunctionalStructured_QA_InfoSeeking** (17.4%, n=60): Task-oriented with brief rapport-building moments, high valley density (0.152)
4. **StraightPath_Stable_SocialEmergent_Narrative_Entertainment** (9.9%, n=34): Pure relational communication, social drift (final_x: 0.792)
5. **StraightPath_Stable_MinimalDrift_Narrative_SelfExpression** (7.2%, n=25): Self-expression conversations with minimal relational positioning, stays near origin (drift: 0.066)
6. **SocialEmergent_Casual_Entertainment** (2.9%, n=10): Casual entertainment, very social (final_x: 0.905)
7. **Peak_Volatile_FunctionalStructured_QA_InfoSeeking** (2.3%, n=8): Frustrated information-seeking with emotional peaks, high variance (0.013), meandering paths (0.417)

**Key Finding**: 81.8% of feature importance comes from trajectory characteristics (spatial + emotional), not categorical classification. **How conversations move through relational space matters more than what they're about.**

**Distribution Insight**: 72.3% of conversations are functional/structured (prioritize content over relationship), while 25.6% engage in social/emergent relational work. This reflects the evaluation context (Chatbot Arena) where users test models rather than genuinely seeking help.

See `COMPREHENSIVE_CLUSTER_ANALYSIS.md` for detailed analysis.

#### 8. Conversation Length and Pattern Visibility

- **Short (10 messages)**: Patterns beginning to emerge, some drift visible
- **Medium (14-18 messages)**: Clearer trajectory, multiple peaks/valleys, role inversions visible
- **Long (30+ messages)**: Full "revealing" pattern, destination positions clear

---

## Why Did We Do It?

### The Problem

**Contemporary interfaces fail to reveal relational dynamics**:
- Linear transcripts show content but hide relational patterns
- Users don't notice gradual shifts (dependence, authority delegation, habitual prompting)
- Social responses to computers are automatic and unconscious
- Most consequential changes occur invisibly

### The Motivation

**Three interconnected goals**:

#### 1. Methodological Contribution
**A way of staging encounters with patterns that typically remain invisible**

- Make relational dynamics visible through spatial/topographic encoding
- Provide reusable method for visualizing relational patterns
- Show how PAD model can encode emotional intensity as terrain height
- Demonstrate how role-based positioning and affective intensity reveal drift

#### 2. Substantive Contribution
**Demonstrates how conversational AI mediates relations beyond dyadic exchanges**

- Reveal how authority, agency, control are distributed (not fixed)
- Show how individual interactions participate in broader patterns
- Make visible how relational configurations accumulate and transform
- Expose political and affective dimensions hidden in technical systems

#### 3. Theoretical/Reframing Contribution
**Reframes interactivity as relational positioning and affective intensity**

- Challenge traditional "input-output" model of interactivity
- Treat conversation as observable structure (not inferred psychology)
- Show interactivity as entangled systems (sociotechnical, cultural, temporal)
- Use moment-to-moment emotional responses (PAD) rather than accumulated sentiment

### Theoretical Foundation

**Grounded in**:
- **Relational Communication Theory** [Watzlawick et al., 1967]: Every message conveys content and defines relationship
- **Goffman's Footing** [Goffman, 1981]: Alignment/stance shifts fluidly through interaction
- **Role Theory** [Turner, 1962]: Distinction between role-taking (scripts) and role-making (negotiation)
- **Social Responses to Computers** [Reeves & Nass, 1996]: People automatically apply social rules to AI systems
- **Critical Data Visualization** [Drucker, 2014]: Visual encodings are interpretive, not neutral

### Design Philosophy

**Not a diagnostic tool, not an optimization interface**:
- **Exploratory**: Invites play and discovery
- **Reflective**: Surfaces ambiguity and interpretive tension
- **Critical**: Makes visible assumptions and consequences of representation

**Goal**: Help participants see the structure their interaction produces, provoke discussion about what should—and should not—be made legible in AI-mediated relationships.

---

## Key Insights Summary

### What We Learned

1. **Three types of temporal information revealed**: The terrain preserves user emotional engagement, interaction quality, and anomalies that role classifications erase
2. **Same roles, different trajectories**: Conversations with identical role classifications (seeker→expert) produce dramatically different path shapes, intensity patterns, and clusters
3. **Anomaly detection**: The terrain surfaces moments where something unexpected happened (AI errors, breakdowns) that aggregate role labels completely miss
4. **Trajectory dynamics drive clustering**: 81.8% of cluster separation comes from how conversations move through relational space, not what they're about
5. **Relational patterns are visible in terrain**: Frustration peaks, affiliation valleys, role inversions become legible
6. **AI failures create signature patterns**: Uniform role distribution + persistent peaks + functional drift
7. **Emotional intensity accumulates**: Not just isolated moments, but sustained patterns across turns
8. **Different conversation types cluster spatially**: Technical vs. creative vs. casual conversations occupy different regions
9. **Pattern visibility increases with length**: Longer conversations reveal clearer "revealing" patterns
10. **7 relational positioning archetypes**: Systematic patterns in how conversations position themselves relationally
11. **Most conversations prioritize content**: 72.3% functional/structured, but 25.6% engage in explicit relational work (based on 533/345 dataset)

### Why It Matters

- **For Design**: Shows how interfaces can reveal relational dynamics, not just content
- **For Research**: Demonstrates how to visualize affective patterns over time using PAD model
- **For Critical Reflection**: Makes visible the political and affective dimensions of AI systems
- **For Practice**: Invites users to reflect on their relationships with AI systems

---

## Technical Implementation

### Technologies

- **Frontend**: React + TypeScript + Three.js
- **3D Rendering**: Three.js (WebGL)
- **Post-processing**: EffectComposer (Bloom, RGB Shift)
- **Classification**: OpenAI GPT-4o-mini API
- **Data**: JSON files with classification and PAD scores

### Key Code Components

- `src/components/ThreeScene.tsx`: 3D rendering and interaction
- `src/components/TerrainGrid.tsx`: Grid view with filters
- `src/components/HUDOverlay.tsx`: UI overlays (minimap, timeline, controls)
- `src/utils/conversationToTerrain.ts`: Classification → terrain mapping
- `src/utils/terrain.ts`: Path generation and terrain creation
- `src/data/classifiedConversations.ts`: Data loading and manifest system

---

## Next Steps

1. **Complete WildChat Integration**: Classify and generate PAD for 589 WildChat conversations for cross-dataset validation
2. **Cross-Dataset Validation**: Compare cluster structures between Chatbot Arena and WildChat to test generalization
3. **User Studies**: Test with participants to evaluate insights and usability
4. **Refine Visualizations**: Improve clarity of pattern representations
5. **Documentation**: Complete academic submission for DIS 2026 (see `DIS_SUBMISSION_FRAMING.md`)
6. **Manual Cluster Validation**: Review sampled conversations from each cluster (see `CLUSTER_VALIDATION_MANUAL.md`)
7. **Extensions**: Explore other visualization techniques, other domains

---

## References

- Goffman, E. (1981). Forms of Talk. University of Pennsylvania Press.
- Watzlawick, P., Bavelas, J. B., & Jackson, D. D. (1967). Pragmatics of Human Communication. W.W. Norton.
- Reeves, B., & Nass, C. (1996). The Media Equation. Cambridge University Press.
- Turner, R. H. (1962). Role-Taking: Process versus Conformity. In A. M. Rose (Ed.), Human Behavior and Social Processes. Houghton Mifflin.
- Mehrabian, A., & Russell, J. A. (1974). An Approach to Environmental Psychology. MIT Press.
- Drucker, J. (2014). Graphesis: Visual Forms of Knowledge Production. Harvard University Press.

