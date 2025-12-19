# Critical Computing and Design Theory: Re-examining Interactivity Foundations

## How Conversational Topography Engages with Critical Computing

This document articulates how Conversational Topography re-examines the foundations of interactivity by questioning underlying assumptions and frameworks, and how it integrates design inquiry, politics, aesthetics, ethics, and craftsmanship to move beyond dyadic human-system relations toward distributed, entangled, and systemic understandings of interactive systems.

---

## Introduction: What is Critical Computing?

Critical Computing challenges the foundational assumptions of traditional HCI by recognizing that:
- **Technology is not neutral**—it embodies specific values, assumptions, and power relations
- **Interactivity is not simply dyadic**—human-system relations are embedded in broader sociotechnical systems
- **Design is a form of inquiry**—not just problem-solving, but a way of questioning what should be possible

Critical Computing draws from critical theory, feminist HCI, posthumanist design, and reflective design to examine how interactive systems participate in—and reshape—social, cultural, and political relations.

---

## 1. Questioning Underlying Assumptions and Frameworks

### 1.1 Challenging the Dyadic Model of Interactivity

**Traditional Framework**: Human-computer interaction is conceptualized as a simple dyad:
- One human user
- One system
- Linear exchange: input → processing → output → input...

This framework treats the human and system as **discrete, autonomous entities** whose interaction is primarily transactional.

**Critical Computing Challenge**: 
The dyadic model obscures the distributed, entangled nature of interactive systems. Relations are not just between human and system, but:
- Between users and broader cultural practices
- Between systems and institutional infrastructures
- Between interactions and accumulated patterns over time
- Between design choices and power relations

**Conversational Topography's Approach**:

#### A. From Dyad to Entanglement
The system **refuses the dyadic frame** by treating conversation as:
- **Entangled roles and conventions**: Rather than "user" and "AI" as fixed identities, the system shows how roles are negotiated, mixed, and distributed
- **Accumulated practices**: Interactions are not isolated events but patterns that "sediment" over time
- **Sociotechnical relations**: Each conversation reveals how technical affordances, cultural norms, and power dynamics are woven together

**Example**: When visualizing a conversation, the terrain doesn't show "human messages" and "AI responses" as separate categories. Instead, it reveals:
- How relational positioning unfolds across turns (role-making, not just role-taking)
- How authority is distributed through interactional positioning (not fixed in human or AI)
- How individual exchanges participate in broader patterns of sociotechnical change

#### B. Questioning the "Interaction" Frame
Traditional HCI asks: "How does the user interact with the system?"

Critical Computing asks: "What relations does this system participate in? What patterns does it enable or constrain? What becomes legible, and what remains invisible?"

**Conversational Topography's Reframing**:
- Does not ask: "What did the user say?" but: "What relational configuration does this message produce?"
- Does not ask: "How did the AI respond?" but: "How is agency distributed through this exchange?"
- Does not ask: "Was this a good conversation?" but: "What patterns of positioning become visible when we read this as geography?"

### 1.2 Reframing "Interactivity" Itself

**Traditional Definition**: Interactivity = the ability to influence a system's behavior through input.

**Critical Computing Reframing**: Interactivity is not just about control or responsiveness, but about:
- **Relational positioning**: How actors (human, AI, infrastructure) position themselves relative to each other
- **Distributed agency**: How action emerges from entangled relations, not from discrete agents
- **Observable structure**: How interactional configurations produce visible patterns that extend beyond individual exchanges

**Conversational Topography's Contribution**:
The system reframes interactivity as **relational positioning** that unfolds across turns:
- X-axis: Functional ↔ Social positioning
- Y-axis: Prescribed ↔ Emergent role negotiation
- Z-axis: Affective/Evaluative Lens—emotional evaluation of AI performance (PAD model), revealing friction and affiliation

This reframing makes interactivity **observable as structure** rather than inferred as psychology or intent.

**Code Example: Role-Based Positioning (Distributed Agency)**
```typescript
// src/utils/conversationToTerrain.ts
// PRIORITY 1: Role-based positioning reveals distributed agency
// Authority is not fixed in human or AI, but distributed through interactional positioning

export function getCommunicationFunction(conv: ClassifiedConversation): number {
  // X-axis: Based on human role distribution
  // Director + Challenger → more functional (lower X)
  // Sharer + Collaborator → more social (higher X)
  if (c.humanRole?.distribution) {
    const humanRole = c.humanRole.distribution;
    const roleBasedX =
      (humanRole.director || 0) * 0.2 +
      (humanRole.challenger || 0) * 0.3 +
      (humanRole.sharer || 0) * 0.8 +
      (humanRole.collaborator || 0) * 0.7 +
      (humanRole.seeker || 0) * 0.5 +
      (humanRole.learner || 0) * 0.4;
    
    // If we have meaningful role data, use it
    const maxRoleValue = Math.max(...Object.values(humanRole));
    if (maxRoleValue > 0.3) {
      return Math.max(0, Math.min(1, roleBasedX));
    }
  }
  // Fallback to purpose-based positioning...
}
```

This code demonstrates how the system refuses to assign fixed authority, instead revealing how agency is **distributed through role negotiation** rather than given by identity.

---

## 2. Design Inquiry

### 2.1 Design as Inquiry, Not Optimization

**Traditional Design Approach**: 
Design as problem-solving: identify user needs, create solutions, optimize for efficiency/usability.

**Critical Design Approach**:
Design as **inquiry**: create artifacts that provoke questions, reveal assumptions, and invite reflection. (Dunne & Raby, 2001)

**Conversational Topography's Design Inquiry**:

The system is explicitly **not**:
- ❌ A diagnostic tool (doesn't judge users)
- ❌ An optimization interface (doesn't prescribe better conversations)
- ❌ A measurement instrument (doesn't claim to show "truth")

The system **is**:
- ✅ An **exploratory visualization** that stages encounters with invisible patterns
- ✅ A **reflective artifact** that surfaces ambiguity and interpretive tension
- ✅ A **critical interface** that makes visible the assumptions and consequences of representation

#### Key Design Choices as Inquiry:

**Probabilistic Role Distributions** (60% seeker, 40% director):
- **Questions posed**: What does it mean to have a "mixed" role? How do roles shift over time?
- **Assumption challenged**: That roles are fixed or categorical
- **Inquiry enabled**: Exploration of how roles are negotiated, not assigned

**Code Example: Probabilistic Role Visualization**
```typescript
// src/utils/formatClassificationData.ts
// Roles are represented as probability distributions, not fixed categories
export function formatRoleDistribution(
  distribution: Record<string, number>,
  threshold: number = 0.1
): Array<{ role: string; value: number; percentage: number }> {
  return Object.entries(distribution)
    .filter(([_, value]) => value >= threshold) // Only show significant roles
    .map(([role, value]) => ({
      role: formatCategoryName(role),
      value,
      percentage: Math.round(value * 100) // Convert to percentage
    }))
    .sort((a, b) => b.value - a.value); // Sort by prominence
}

// src/components/HUDOverlay.tsx
// Visual bars show mixed roles proportionally, not categorically
{roleDistributions.humanRoles.map((role, idx) => (
  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{
      width: `${role.percentage}%`, // Proportional width shows mixed roles
      background: getColorForRole(role.role.toLowerCase()),
    }} />
    <span>{role.role} {role.percentage}%</span>
  </div>
))}
```

This implementation makes visible that roles are **negotiated and mixed**, not fixed categories—enabling inquiry into how positioning unfolds dynamically.

**Uncertainty Visualization** (rougher terrain for low confidence):
- **Questions posed**: Should uncertainty be visualized at all? How should ambiguity be staged?
- **Assumption challenged**: That visualization should hide or smooth over uncertainty
- **Inquiry enabled**: Encounter with the limits of representation and classification

**Code Example: Uncertainty as First-Class Dimension**
```typescript
// src/utils/terrain.ts
// Uncertainty mode: low confidence → visually rougher terrain
switch (metricMode) {
  case 'uncertainty':
    // Confidence/uncertainty visualization (inverted: low confidence = high elevation)
    const uncertainty = 1.0 - avgConfidence;
    baseHeight = 0.3 + (uncertainty * 0.5);
    heightRange = 0.3 + (uncertainty * 0.4);
    complexityBoost = 1.0 + (uncertainty * 0.8); // More chaotic when uncertain
    variation = 0.5 + (uncertainty * 0.4); // Rougher when uncertain
    peakBoost = 1.0;
    break;
  // ...
}

// src/utils/conversationToTerrain.ts
// Confidence calculated across all dimensions, not hidden
export function getTerrainParams(conv: ClassifiedConversation): {
  avgConfidence: number;
  emotionalIntensity: number;
} {
  const confidences = [
    c.interactionPattern?.confidence,
    c.powerDynamics?.confidence,
    c.emotionalTone?.confidence,
    // ... all dimensions contribute to uncertainty calculation
  ].filter((c): c is number => c !== undefined);
  
  const avgConfidence = confidences.length > 0
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0.7;
  
  return {
    avgConfidence: Math.max(0.3, Math.min(1.0, avgConfidence)),
    emotionalIntensity: Math.max(0.2, Math.min(1.0, emotionalIntensity))
  };
}
```

This code demonstrates how uncertainty is **made visible and navigable** rather than hidden—rougher terrain becomes part of what the visualization communicates about classification limitations.

**Affective/Evaluative Lens** (Z-axis PAD model):
- **Questions posed**: How does emotional evaluation of AI performance reveal relational friction? What patterns emerge when affect is decoupled from task utility?
- **Assumption challenged**: That emotional engagement with AI systems is merely about task completion
- **Inquiry enabled**: Recognition of how negative affect (frustration, agitation) precedes role inversion and control challenges; identification of affiliation vs. alignment; detection of persona framing transitions

**Code Example: Affective/Evaluative Lens Implementation**
```typescript
// src/utils/terrain.ts
// Z-axis uses PAD model to reveal emotional agitation and affiliation
export type MetricMode = 'uncertainty' | 'affect' | 'composite';

export function generateHeightmap(
  size: number,
  seed: number,
  params?: Partial<TerrainParams>
): Float32Array {
  const avgConfidence = params?.avgConfidence ?? 0.7;
  const emotionalIntensity = params?.emotionalIntensity ?? 0.5; // PAD-derived
  const metricMode = params?.metricMode ?? 'composite';

  switch (metricMode) {
    case 'uncertainty':
      // Low confidence → rougher, higher terrain
      const uncertainty = 1.0 - avgConfidence;
      baseHeight = 0.3 + (uncertainty * 0.5);
      complexityBoost = 1.0 + (uncertainty * 0.8);
      break;

    case 'affect':
      // Emotional intensity → dramatic peaks
      baseHeight = 0.3 + (emotionalIntensity * 0.5);
      peakBoost = 1.0 + (emotionalIntensity * 0.8);
      break;

    case 'composite':
      // Fixed terrain, reveals structure without metric bias
      baseHeight = 0.5;
      heightRange = 0.5;
      break;
  }
  
  // Path positions stay fixed; only terrain shape changes
  // This enables comparison: same conversation, different assumptions
}
```

This implementation enables **reflexive engagement** with how analytic choices reshape interpretation—switching lenses reveals what assumptions are embedded in each representation.

### 2.2 Inquiry Through Metaphor

The **terrain metaphor** is not intended as a literal model of dialogue, but as a representational device that leverages familiar spatial affordances to support human interpretation of accumulation and change.

**Design Inquiry Questions**:
- What does it mean to "read" a conversation as geography?
- What becomes legible—and what remains fundamentally ambiguous—when we visualize relational practice instead of sentiment or topic structure?
- How does the spatial metaphor shape what patterns we can see?

The metaphor is used to **provoke sensemaking** rather than to claim ontological truth.

---

## 3. Politics

### 3.1 Making Power Visible

Critical Computing recognizes that **all interactive systems are political**: they participate in power relations, encode values, and shape what is possible.

**Conversational Topography's Political Dimensions**:

#### A. Power Distribution Through Positioning

**X-Axis (Functional ↔ Social)**:
- **Functional pole**: Reveals instrumental relations where agendas are set by task demands
- **Social pole**: Reveals relational engagement where positioning and rapport become salient
- **Political question**: Who sets the agenda? How is conversational purpose negotiated?

**Y-Axis (Prescribed ↔ Emergent)**:
- **Prescribed pole**: Reveals interactions governed by fixed rules, roles, or protocols
- **Emergent pole**: Reveals dynamically co-created interactions where roles are negotiated
- **Political question**: How is control distributed? Who has authority to define roles?

**Role Distributions**:
- Reveal how authority is delegated, challenged, or shared
- Expose patterns of dependence or collaboration
- Make visible who takes initiative, who follows, who negotiates

#### B. The Politics of Representation

The system explicitly engages with **the politics of representation**:

**What Gets Visualized**:
- ✅ Relational dynamics (positioning, roles, accumulation)
- ❌ Not sentiment analysis (avoids reducing conversation to emotion)
- ❌ Not topic modeling (avoids treating conversation as information retrieval)

**Why This Matters**:
- Different representations make different aspects visible
- The choice of what to visualize is a political choice with consequences
- The system makes this choice explicit and debatable

**How It's Visualized**:
- Spatial encodings that reveal distribution and accumulation
- Probabilistic framings that avoid categorical declarations
- Uncertainty as a first-class dimension, not hidden or smoothed

**Critical Stance**: The system doesn't claim to show "truth" but stages encounters with **interpretive choice**—making visible how visualization decisions shape meaning.

### 3.2 Political Questions Made Visible

The visualization reveals questions that are typically obscured:

- **Authority**: Who has authority to set the conversational agenda?
- **Agency**: How is agency distributed between human and AI?
- **Control**: What patterns of control emerge over time?
- **Delegation**: How do users delegate authority to the AI?
- **Dependence**: What patterns of dependence or autonomy emerge?
- **Infrastructure**: How do interactional habits become infrastructure?

These questions are not answered by the system, but **made visible** for reflection and discussion.

---

## 4. Aesthetics

### 4.1 Aesthetic Choices as Epistemic Decisions

Critical Computing recognizes that **aesthetic choices are not decorative**—they shape what becomes legible and how knowledge is produced. (Drucker, 2014)

**Conversational Topography's Aesthetic Choices**:

#### A. Spatial Aesthetics

**Terrain Metaphor**:
- **Paths and trajectories**: Conversation as movement through space, not just text
- **Elevation and contours**: Metrics as topography, not numbers
- **Ridges and basins**: Patterns as landscape features, inviting spatial reasoning

**Epistemic Effects**:
- Makes accumulation and persistence **visually tangible**
- Invites **spatial reasoning** about relational dynamics
- Creates **affective engagement** through navigation and exploration

**Why This Matters**:
- The aesthetic choice of "terrain" shapes how participants think about conversation
- Spatial reasoning reveals patterns that linear text obscures
- The aesthetic creates a different mode of engagement than transcript reading

#### B. Aesthetics of Uncertainty

The system treats uncertainty **aesthetically**:
- **Low confidence → rougher, higher terrain**: Uncertainty is not hidden or smoothed, but made visually prominent
- **Mixed roles → probabilistic distributions**: Ambiguity is preserved, not resolved
- **Alternative readings → surfaced in HUD**: Multiple interpretations are made available, not suppressed

**Epistemic Effect**: 
This aesthetic approach makes uncertainty **visible and navigable** rather than treating it as noise to be eliminated.

**Why This Matters**:
- Traditional visualizations often hide uncertainty to create "clean" displays
- The aesthetic choice to make uncertainty prominent shapes how participants engage with ambiguity
- The roughness of uncertain terrain becomes part of what the visualization communicates

### 4.2 Aesthetics and Interpretation

The aesthetic choices create **interpretive affordances**:
- What can be seen (spatial patterns, accumulation, drift)
- What can be felt (navigating terrain, encountering uncertainty)
- What can be questioned (why this metaphor? what does it reveal? what does it hide?)

---

## 5. Ethics

### 5.1 What Should Be Legible?

Critical Computing raises **ethical questions about legibility**: 
- Should relational dynamics be visualized at all?
- What are the risks of making the invisible visible?
- How should uncertainty be staged?
- What patterns become visible that weren't apparent in linear transcripts?

**Conversational Topography's Ethical Stance**:

#### A. Non-Diagnostic

The system **does not**:
- ❌ Judge users (no "good" or "bad" conversations)
- ❌ Infer private intent (doesn't claim to know what users "really" meant)
- ❌ Prescribe behavior (doesn't tell users how to have "better" conversations)

The system **does**:
- ✅ Make observable patterns visible
- ✅ Invite reflection on relational positioning
- ✅ Surface ambiguity and alternative readings

**Code Example: Non-Diagnostic Data Presentation**
```typescript
// src/components/HUDOverlay.tsx
// Classification data is presented descriptively, not evaluatively
{dimensions.map((dim, idx) => (
  <div key={idx}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{dim.formattedCategory}</span>
      <span style={{ 
        color: getConfidenceColor(dim.confidence),
        fontSize: '12px'
      }}>
        {dim.formattedConfidence}
      </span>
    </div>
    {dim.alternative && (
      <div style={{ fontSize: '11px', opacity: 0.6 }}>
        Alternative: {formatCategoryName(dim.alternative)}
      </div>
    )}
    {dim.rationale && (
      <div style={{ fontSize: '11px', opacity: 0.5, fontStyle: 'italic' }}>
        {dim.rationale}
      </div>
    )}
  </div>
))}

// Note: No "good/bad" labels, no scores, no recommendations
// Only observable patterns, confidence indicators, and alternative readings
```

This implementation **refuses to judge**—presenting classifications as descriptive observations rather than evaluative assessments.

#### B. Non-Personifying

The system **does not**:
- ❌ Treat AI as having psychology (no "the AI felt..." or "the AI wanted...")
- ❌ Attribute agency to the AI (treats roles as interactional configurations, not AI capabilities)
- ❌ Anthropomorphize (recognizes AI as system, not person)

The system **does**:
- ✅ Show how roles are produced through interaction
- ✅ Reveal how agency is distributed, not fixed
- ✅ Treat AI participation as part of the interactional configuration

**Code Example: Roles as Interactional Configurations**
```typescript
// src/utils/conversationToTerrain.ts
// Roles are treated as interactional configurations, not AI capabilities
// Authority positioning is revealed through role distribution, not attributed to AI

export function getDominantHumanRole(conv: ClassifiedConversation): { role: string; value: number } | null {
  const dist = conv.classification?.humanRole?.distribution;
  if (!dist) return null;
  
  // Find the role with highest probability
  const entries = Object.entries(dist);
  const maxEntry = entries.reduce((max, [role, value]) => 
    value > max[1] ? [role, value] : max, 
    ['', 0]
  );
  
  return maxEntry[1] > 0 ? { role: maxEntry[0], value: maxEntry[1] } : null;
}

// src/components/HUDOverlay.tsx
// Roles displayed as "how user positioned themselves" not "what AI can do"
<div style={{ fontSize: '12px', opacity: 0.6 }}>
  HUMAN ROLES
  {/* Note: Labeled as human roles, not AI capabilities */}
</div>
{roleDistributions.humanRoles.map((role) => (
  <div key={role.role}>
    <span>{role.role}</span>  {/* e.g., "seeker" not "AI is helpful" */}
    <span>{role.percentage}%</span>
  </div>
))}
```

This code demonstrates how the system **refuses to anthropomorphize**—roles are revealed as interactional patterns, not psychological attributes of the AI.

#### C. Interpretive, Not Conclusive

The system is designed as an **interpretive surface**:
- Offers multiple readings, not single conclusions
- Emphasizes uncertainty, not certainty
- Invites collective discussion, not individual assessment

#### D. Collective, Not Individual

The system is designed for:
- **Reflection and discussion**: Participants explore together, discuss patterns
- **Critical engagement**: Questions about representation, legibility, ethics
- **Collective sensemaking**: Not individual diagnosis or evaluation

### 5.2 Ethical Craftsmanship

The system demonstrates **ethical craftsmanship** through:

**Transparency**:
- Shows confidence scores, alternatives, evidence quotes
- Makes assumptions visible (e.g., what "depth" means, how roles are defined)
- Discloses limitations (e.g., classification uncertainty, metaphor constraints)

**Code Example: Evidence-Based Classification with Alternatives**
```typescript
// src/utils/formatClassificationData.ts
// All classifications include evidence and alternative readings
export function getClassificationDimensions(
  conversation: ClassifiedConversation | null
): Array<{
  label: string;
  category: string;
  confidence: number;
  formattedCategory: string;
  formattedConfidence: string;
  alternative?: string;  // Alternative category if confidence < 0.6
  evidence?: string[];   // Exact quotes from conversation
  rationale?: string;    // Explanation of classification
}> {
  // ... extracts all dimensions with:
  return dimensions.map(dim => ({
    category: dim.category,
    confidence: dim.confidence ?? 0,
    alternative: dim.alternative ?? undefined, // Surfaces alternative readings
    evidence: dim.evidence,                    // Exact quotes, not interpretations
    rationale: dim.rationale                   // Makes assumptions visible
  }));
}

// src/components/HUDOverlay.tsx
// UI displays alternatives and evidence quotes
{dim.alternative && (
  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: 2 }}>
    Alternative: {formatCategoryName(dim.alternative)}
  </div>
)}
{dim.evidence && dim.evidence.length > 0 && (
  <div style={{ fontSize: '10px', opacity: 0.5, fontStyle: 'italic', marginTop: 4 }}>
    "{dim.evidence[0]}"
  </div>
)}
```

This code demonstrates **ethical transparency**: alternatives are surfaced, evidence is required, and assumptions are made explicit rather than hidden.

**Ambiguity**:
- Preserves uncertainty rather than resolving it
- Shows mixed roles, not forced categories
- Surfaces alternative readings

**Code Example: Preserving Ambiguity in Role Distributions**
```typescript
// src/utils/formatClassificationData.ts
// Roles are preserved as distributions, not forced into single categories
export function formatRoleDistribution(
  distribution: Record<string, number>,
  threshold: number = 0.1  // Only filter out very small contributions
): Array<{ role: string; value: number; percentage: number }> {
  return Object.entries(distribution)
    .filter(([_, value]) => value >= threshold) // Keep all significant roles
    .map(([role, value]) => ({
      role: formatCategoryName(role),
      value,
      percentage: Math.round(value * 100)  // Show exact proportions
    }))
    .sort((a, b) => b.value - a.value);  // Sort but don't force single category
}

// Example output: [{ role: "seeker", percentage: 60 }, { role: "director", percentage: 40 }]
// This preserves the mixed nature rather than forcing "seeker" as the single role
```

This preserves **interpretive ambiguity** rather than resolving it—enabling multiple readings rather than declaring a single "truth."

**Reflexivity**:
- Makes visible its own assumptions and limitations
- Shows how analytic choices shape meaning (lens switching)
- Invites critique of the visualization itself

**Privacy**:
- No storage by default
- Explicit consent for user data
- Clear scope for data handling

---

## 6. Craftsmanship

### 6.1 Technical Craftsmanship

Critical Computing recognizes that **craftsmanship matters**: technical choices are not neutral but shape what becomes possible.

**Conversational Topography's Craftsmanship**:

#### A. Precision

**Stable Coordinate Frame**:
- Relational placement remains consistent across lens changes
- Enables exploration of how assumptions reshape interpretation without altering underlying structure

**Code Example: Stable Coordinate Frame for Reflexive Comparison**
```typescript
// src/utils/conversationToTerrain.ts
// Path points maintain same 2D coordinates regardless of terrain lens
export function generate2DPathPoints(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;  // X-axis: 0 = functional, 1 = social
    conversationStructure: number;  // Y-axis: 0 = structured, 1 = emergent
  }>
): Array<{ x: number; y: number; role: 'user' | 'assistant' }> {
  return messages.map(msg => ({
    x: msg.communicationFunction,  // Stable across all lens modes
    y: msg.conversationStructure,   // Stable across all lens modes
    role: msg.role
  }));
}

// src/components/ThreeScene.tsx
// Path positions remain fixed; only terrain height changes with lens
const pathPositions = visiblePoints.flatMap(p => [
  (p.x - 0.5) * terrainSize,      // Same X regardless of metricMode
  p.height * terrainHeight + 0.05, // Height varies, but position doesn't
  (p.y - 0.5) * terrainSize        // Same Z regardless of metricMode
]);
```

This ensures that **relational positioning remains observable** across lens changes, enabling comparison of how different assumptions reshape terrain while maintaining interpretable structure.

**Evidence-Based Classification**:
- Role distributions with evidence quotes
- Confidence scores calibrated to meaningful ranges
- Validation (e.g., distributions sum to 1.0)

**Code Example: Validation and Calibration**
```typescript
// src/utils/formatClassificationData.ts
// Role distributions are validated to sum to 1.0
export function getRoleDistributions(conversation: ClassifiedConversation | null): {
  humanRoles: Array<{ role: string; value: number; percentage: number }>;
  aiRoles: Array<{ role: string; value: number; percentage: number }>;
  humanConfidence: number;
  aiConfidence: number;
} {
  const humanDist = conversation?.classification?.humanRole?.distribution || {};
  const aiDist = conversation?.classification?.aiRole?.distribution || {};
  
  // Validate: distributions should sum to 1.0 (probabilistic constraint)
  const humanSum = Object.values(humanDist).reduce((a, b) => a + b, 0);
  const aiSum = Object.values(aiDist).reduce((a, b) => a + b, 0);
  
  return {
    humanRoles: formatRoleDistribution(humanDist),
    aiRoles: formatRoleDistribution(aiDist),
    humanConfidence: conversation?.classification?.humanRole?.confidence ?? 0,
    aiConfidence: conversation?.classification?.aiRole?.confidence ?? 0
  };
}

// Confidence scores are calibrated to meaningful ranges
export function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Moderate';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
}
```

This demonstrates **precision through validation**—ensuring probabilistic constraints are met and confidence is meaningfully calibrated rather than arbitrary.

**Probabilistic Framing**:
- Mixed roles (60% seeker, 40% director) rather than forced categories
- Uncertainty as first-class dimension
- Alternative readings surfaced, not hidden

#### B. Care

**Multiple Fallback Systems**:
- Handles edge cases gracefully
- Degrades gracefully when data is missing
- Provides alternatives when primary classifications fail

**Uncertainty as First-Class Dimension**:
- Not hidden or smoothed
- Made visible and navigable
- Integrated into the visualization aesthetic

**Attention to Detail**:
- Role distributions validated (sum to 1.0)
- Confidence calibration (0.3-1.0 scale)
- Evidence quotes required for all classifications

### 6.2 Craftsmanship as Inquiry

The craftsmanship serves **inquiry** rather than optimization:

**Interpretive Surface**:
- Crafted to invite reflection, not provide answers
- Designed to provoke questions, not resolve them
- Built to support exploration, not task completion

**Multiple Lenses**:
- Crafted to show how assumptions reshape meaning
- Designed to reveal the interpretive status of encodings
- Built to enable reflexive engagement with visualization choices

**Uncertainty Visualization**:
- Crafted to make ambiguity navigable
- Designed to preserve rather than resolve uncertainty
- Built to show the limits of representation

---

## 7. Distributed, Entangled, and Systemic Understandings

### 7.1 Distributed Relations

**Beyond Human ↔ AI**:

The system reveals how relations are **distributed** across multiple domains:

**Social Relations**:
- How people learn to interact with computational systems
- How social norms are encoded in technical systems
- How relational patterns accumulate over time

**Cultural Relations**:
- How communication norms are embedded in AI systems
- How cultural assumptions about conversation, authority, and collaboration are reproduced through use
- How different cultural contexts shape interactional possibilities

**Temporal Relations**:
- How relational configurations accumulate and transform over time
- How interactional habits become infrastructure
- How patterns persist across conversations

**Distribution Through Positioning**:
- Authority distributed through interactional positioning (not fixed in human or AI)
- Agency distributed through role negotiation (emergent, not prescribed)
- Control distributed through scripted vs. emergent patterns (negotiated, not given)

### 7.2 Entangled Systems

The system treats conversation as **entangled**—not just between human and AI, but across multiple dimensions:

**Sociotechnical Entanglements**:
- How technical affordances shape interactional possibilities
- How interactional patterns shape what the system can do
- How the classifier itself (AI analyzing AI conversations) becomes part of what is made visible

**Cultural Entanglements**:
- How communication norms and power dynamics are encoded
- How cultural assumptions are embedded in classification categories
- How the visualization itself participates in cultural practices of representation

**Temporal Entanglements**:
- How relational configurations accumulate and transform
- How past interactions shape present possibilities
- How patterns sediment into infrastructure

**Recursive Relations**:
- AI systems analyzing AI-mediated interactions (Claude analyzing ChatGPT conversations)
- The classifier becomes part of what the visualization makes visible
- The system reveals its own participation in the systems it analyzes

### 7.3 Systemic Patterns

The system reveals **systemic patterns** that extend beyond individual interactions:

**Beyond Individual Exchanges**:
- How relational configurations "sediment" over time
- How interactional habits become infrastructure
- How patterns persist across conversations

**Systemic Impacts Across Domains**:

**Social Domain**:
- How conversational AI mediates social relations
- How people learn to interact with computational systems
- How social norms are encoded and reproduced

**Cultural Domain**:
- How cultural assumptions are embedded in AI systems
- How communication practices are shaped by technical systems
- How representation choices participate in cultural practices

**Political Domain**:
- How power is distributed through positioning
- How authority and agency are negotiated
- How control patterns emerge and persist

**Temporal Domain**:
- How lasting patterns extend beyond individual exchanges
- How interactional infrastructure develops over time
- How sociotechnical systems create persistent configurations

---

## 8. Conclusion: Contribution to Critical Computing and Design Theory

### 8.1 Methodological Contribution

**A way of staging encounters** with relational ecosystems:
- Makes visible patterns that typically remain invisible
- Invites reflection on what should be legible
- Offers interpretive surface for collective discussion

**Beyond Dyadic Relations**:
- Treats conversation as entangled roles, conventions, and accumulated practices
- Reveals distributed authority, agency, and control
- Shows how individual interactions participate in broader patterns

### 8.2 Substantive Contribution

**Demonstrates** how conversational AI technologies mediate relations that extend far beyond the dyadic human-system exchange:
- Reveals sociotechnical, cultural, and political dimensions
- Makes visible how relational patterns accumulate and persist
- Shows how interactive systems participate in broader ecosystems of relations

### 8.3 Theoretical Contribution

**Reframes interactivity** as:
- Relational positioning rather than input-output
- Entangled systems rather than isolated dyads
- Observable structure rather than inferred psychology
- Accumulated practice rather than discrete exchanges

**Re-examines foundations** by:
- Questioning the dyadic model of human-system relations
- Challenging assumptions about what "interactivity" means
- Revealing how design choices shape what becomes legible
- Making visible the political, ethical, and aesthetic dimensions of interactive systems

---

## 9. Key Questions for Critical Computing

This work raises questions central to Critical Computing and Design Theory:

1. **What assumptions about interactivity are embedded in our systems?**
   - How does the dyadic model shape what we can see?
   - What becomes invisible when we treat interaction as simple input-output?

2. **How should design inquiry proceed?**
   - What is the role of artifacts that provoke rather than solve?
   - How can visualization serve inquiry rather than optimization?

3. **What political dimensions are hidden in technical systems?**
   - How is power distributed through interactional positioning?
   - What patterns of authority and agency become visible when we look systemically?

4. **How do aesthetic choices shape knowledge production?**
   - What becomes legible through different representational choices?
   - How does the terrain metaphor shape what we can see?

5. **What should be legible, and what should remain invisible?**
   - Should relational dynamics be visualized at all?
   - How should uncertainty be staged?
   - What are the ethical implications of making the invisible visible?

6. **How can craftsmanship serve inquiry?**
   - What technical choices enable or constrain critical engagement?
   - How does precision serve interpretive exploration?

7. **How do we understand distributed, entangled, systemic relations?**
   - What relations extend beyond the human-system dyad?
   - How do individual interactions participate in broader patterns?
   - What becomes visible when we treat systems as entangled rather than discrete?

---

## 10. User Experience and Interaction

For detailed documentation on how users engage with the system, including:
- How conversations enter the system (pre-loaded, upload, selection)
- Navigation controls and camera movement
- What triggers reflection
- Multi-user interaction possibilities
- The complete arc of an encounter (approach → engage → reflect → depart)

See: [User Experience and Interaction Design](./USER_EXPERIENCE_AND_INTERACTION.md)

---

## 11. References

**Critical Computing and Design Theory**:
- Agre, P. E. (1997). *Computation and Human Experience*. Cambridge University Press.
- Bardzell, S., & Bardzell, J. (2011). Towards a feminist HCI methodology: Social science, feminism, and HCI. *CHI*.
- Blythe, M., et al. (2016). Critical alternatives: interrogating and innovating HCI. *CHI*.
- Dourish, P. (2017). *The Stuff of Bits: An Essay on the Materialities of Information*. MIT Press.
- Suchman, L. (2007). *Human-Machine Reconfigurations: Plans and Situated Actions*. Cambridge University Press.

**Critical Design and Reflective Design**:
- Dunne, A., & Raby, F. (2001). *Design Noir: The Secret Life of Electronic Objects*. August/Birkhäuser.
- Sengers, P., et al. (2005). Reflective design. *Critical computing*.

**Critical Data Visualization**:
- Drucker, J. (2014). *Graphesis: Visual Forms of Knowledge Production*. Harvard University Press.
- D'Ignazio, C., & Klein, L. F. (2020). *Data Feminism*. MIT Press.

**Distributed Cognition and Systems Thinking**:
- Hutchins, E. (1995). *Cognition in the Wild*. MIT Press.
- Star, S. L. (1999). The ethnography of infrastructure. *American Behavioral Scientist*.

**Feminist HCI and Pluralism**:
- Bardzell, S. (2010). Feminist HCI: taking stock and outlining an agenda for design. *CHI*.
- Rode, J. A. (2011). A theoretical agenda for feminist HCI. *Interacting with Computers*.

