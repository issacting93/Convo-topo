# User Experience and Interaction Design

## Overview

This document describes how users engage with Conversational Topography, from initial approach through reflection and departure. It covers both the current implementation and the envisioned DIS installation experience.

---

## Part 1: Current Implementation

### Data Loading and Entry Points

**Current Implementation:**
- **Pre-loaded conversations**: All conversations are loaded from `/output/` directory on application start
- **No upload mechanism**: Conversations must be pre-classified and placed in the output directory
- **Grid view as entry point**: Users always start by seeing a grid of conversation terrain cards

**Code Implementation:**
```typescript
// src/App.tsx
// Conversations are loaded on mount
useEffect(() => {
  loadClassifiedConversations().then(convs => {
    setClassifiedConversations(convs);
    const terrains = conversationsToTerrains(convs);
    setConversationTerrains(terrains);
  });
}, []);

// src/data/classifiedConversations.ts
// Sequential loading of conversation files
while (hasMore && index < 100) {
  const response = await fetch(`/output/conv-${index}.json`);
  if (response.ok) {
    const data = await response.json();
    conversations.push(data);
    index++;
  } else {
    hasMore = false;
  }
}
```

### Navigation and Camera Controls

**Current Implementation:**
- **Manual camera rotation**: Click and drag to rotate the terrain around Y-axis
- **Camera view presets**: Three camera views available (default perspective, side orthographic, top orthographic)
- **Camera controls**: Adjustable distance, elevation, and rotation via settings panel
- **Mouse interaction**: Hover over markers to see details, click to lock/unlock
- **Timeline controls**: Interactive timeline with play button for animation (animates from start to finish over 3 seconds)
- **Back button**: Return to grid view

**Code Implementation:**
```typescript
// src/components/ThreeScene.tsx
// Automatic camera orbit around path center
camera.position.x = centerX + Math.sin(timeRef.current * ORBIT_SPEED) * ORBIT_RADIUS;
camera.position.z = centerZ + Math.cos(timeRef.current * ORBIT_SPEED) * ORBIT_RADIUS;
camera.position.y = CAMERA_Y_BASE + Math.sin(timeRef.current * CAMERA_Y_FREQUENCY) * CAMERA_Y_AMPLITUDE;
camera.lookAt(centerX, centerY, centerZ);

// Mouse interaction with markers
const handleMouseMove = (event: MouseEvent) => {
  mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // Raycasting to detect marker hover...
};

const handleClick = () => {
  // Raycasting to detect marker clicks...
  onPointClick(idx);
};
```

### Interaction Flow

**Current Flow:**
1. **Grid View**: User sees paginated grid of terrain cards (30 per page)
   - Each card shows: conversation name, minimap preview, message count, dominant roles, PAD summary, top classification dimensions, XYZ coordinates
   - Enhanced cards provide rich preview information before selection
2. **Card Selection**: Click a card to enter single terrain view
3. **Terrain View**: 
   - **3D Scene**: 
     - Click and drag to rotate terrain around Y-axis
     - Hover over glowing markers to see message preview in HUD
     - Click marker to lock it (shows full message details)
   - **Left Panel (HUD)**: 
     - Message details when marker is selected
     - Classification dimensions with evidence
     - Role distributions
     - Failure mode and epistemic status badges
   - **Right Panel**: 
     - Interactive minimap (2D axis map) - clickable points to jump to messages
     - Camera view controls (default/side/top)
     - Timeline with play button for animation
   - **Settings Modal**: 
     - Camera controls (distance, elevation, rotation)
     - Terrain position controls
     - Contour toggle and count
     - Color customization (contours, markers)
     - Timeline slider for manual control
4. **Return to Grid**: Click back button to select another conversation

**Reflection Triggers:**
- **Organic discovery**: Hovering reveals message details and role positioning
- **Comparison**: Side-by-side view enabled by selecting different conversations
- **HUD data**: Classification dimensions, role distributions, evidence quotes shown in panels
- **Spatial reasoning**: Terrain visualization invites interpretation of conversation patterns

---

## Part 2: Envisioned DIS Installation Experience

### The Arc of an Encounter

#### Stage 1: Approach (10 feet away)

**What they see:**
- **Large screen/display** showing a grid of terrain visualizations
- **Dark, ambient space** with soft lighting highlighting the screen
- **Minimalist UI**: Cards arranged in a grid, each showing:
  - Small terrain preview (minimap)
  - Conversation name (e.g., "Collaborative Playful")
  - XYZ coordinates snapshot
- **Gentle motion**: Camera slowly orbiting on a selected terrain if someone is actively viewing

**What draws them in:**
- **Visual intrigue**: Topographic landscapes are immediately recognizable but unfamiliar in this context
- **Movement**: Slow, organic camera motion suggests depth and exploration
- **Scale**: Multiple conversations visible at once suggests a landscape to explore
- **Aesthetic**: Dark theme with glowing contours creates an inviting, mysterious atmosphere

#### Stage 2: First Interaction (Approaching the display)

**Initial understanding:**
- **Ambient signage**: Minimal text explaining "Conversation Terrains" or "AI Dialogues as Geography"
- **Visual affordances**: 
  - Grid layout suggests "browsing" or "selection"
  - Cards are clearly clickable (hover states, visual feedback)
  - 2D minimap on each card previews the 3D terrain
- **No instruction manual needed**: The interface is exploratory by design

**First interaction:**
1. **Mouse/touch cursor** appears when approaching
2. **Hover over cards**: Cards slightly scale up, reveal more details (description, confidence)
3. **Click a card**: Smooth transition to 3D terrain view

**Understanding what they're looking at:**
- **HUD overlay** provides immediate context:
  - Title: "STATION DATA" with message counter
  - Active message content shown when hovering
  - Classification dimensions visible in collapsible sections
  - Axis labels: "X: FUNCTIONAL ↔ SOCIAL" "Y: STRUCTURED ↔ EMERGENT"
- **2D positioning visualization** in HUD shows conversation location on the axes
- **Spatial reasoning**: Topographic metaphor makes accumulation and patterns tangible

#### Stage 3: Engagement (Exploring a terrain)

**Manipulation:**
- **Hover over glowing markers**: 
  - Marker pulses and scales up
  - Message content appears in HUD
  - Role positioning shown ("You positioned yourself as: seeker 60%")
- **Click marker**: 
  - Locks the marker (stays highlighted)
  - Full message details displayed
  - Classification data expanded
- **Timeline slider**: 
  - Animate path progression from start to end
  - Markers appear sequentially
  - Shows conversation unfolding over time
- **Camera**: 
  - Automatically orbits around path center
  - Smoothly follows conversation trajectory
  - Can be paused (future: manual control)

**The "Oh, I see it" moment:**

**Moment 1: Spatial Understanding**
- User realizes: "This conversation started in one quadrant and moved to another"
- The path shows relational positioning unfolding over time
- Contour lines reveal conversation "elevation" and complexity

**Moment 2: Role Positioning**
- User hovers over a marker and sees: "You positioned yourself as: director 70%"
- Realization: "This isn't about what the AI did, but how I positioned myself"
- The system reveals interactional dynamics, not psychological states

**Moment 3: Affective Friction Recognition**
- User notices sharp peaks in the terrain and connects them to moments of frustration
- Realization: "Those peaks correspond to when the AI failed—that's when I took control"
- Recognition that emotional agitation (high Arousal + low Pleasure from PAD model) precedes role inversion
- Understanding that valleys represent affiliation—not just task cooperation, but shared evaluative stance

**Moment 4: Pattern Recognition**
- User switches between conversations and notices patterns
- "All my technical questions create similar terrain shapes"
- "The collaborative conversations have different paths than question-answer ones"
- "Frustration peaks always precede my corrections"
- Spatial reasoning reveals patterns text transcripts obscure

**Moment 5: Uncertainty and Ambiguity**
- User notices confidence scores and alternative readings
- Realization: "This isn't claiming to show truth, but staging interpretation"
- The system makes visible its own limitations and assumptions

**Moment 6: Persona Framing Transition**
- User recognizes that high emotional peaks persist even when the AI isn't useful
- Realization: "I'm forming an emotional attachment that's decoupled from task utility"
- Recognition of ethical transition point toward persona framing rather than tool framing

#### Stage 4: Reflection

**What provokes reflection:**

1. **Classification Data Exposure**:
   - Collapsible sections reveal all classification dimensions
   - Evidence quotes show exactly what triggered each classification
   - Alternative categories shown when confidence is low
   - Confidence scores indicate certainty/uncertainty

2. **Role Distribution Visualization**:
   - Probabilistic bars show mixed roles (60% seeker, 40% director)
   - Questions arise: "What does it mean to have mixed roles?"
   - "How did my positioning change over time?"

3. **Spatial Metaphor Engagement**:
   - "Why terrain? What does this metaphor reveal?"
   - "What patterns become visible that transcripts hide?"
   - "What assumptions are embedded in this representation?"

4. **Comparison and Pattern Recognition**:
   - Switching between conversations reveals patterns
   - "All my work conversations look similar"
   - "Personal conversations have different terrain shapes"
   - Recognition of accumulated practices

5. **Affective/Evaluative Lens Recognition**:
   - Noticing sharp peaks (high Arousal + low Pleasure = frustration)
   - Connecting peaks to moments of AI failure or task breakdown
   - Recognizing that frustration precedes role inversion (taking control)
   - Identifying valleys as affiliation moments (shared evaluative stance, not just task cooperation)
   - Realizing when emotional peaks persist despite task failure = persona framing transition

**Reflection prompts (optional facilitator or on-screen):**
- "What patterns do you notice across your conversations?"
- "How does viewing conversation as geography change what you see?"
- "What remains ambiguous? What questions does this raise?"
- "How do you feel about relational dynamics being visualized?"
- "Do you notice peaks of frustration? What do they correspond to?"
- "When do you see valleys of affiliation versus peaks of friction?"
- "Are there moments where your emotional investment seems disconnected from task utility?"

#### Stage 5: Departure

**What they leave with:**

1. **Insight**: 
   - Recognition of patterns in their own conversation practices
   - Understanding of relational positioning and role negotiation
   - Awareness of how conversations accumulate and persist

2. **Questions**:
   - "What should be legible? What should remain private?"
   - "How do different representations shape meaning?"
   - "What assumptions are embedded in this visualization?"

3. **Artifact (optional)**:
   - **Screenshot/export**: Save their conversation terrain as image
   - **QR code**: Link to their conversation visualization (if they provided their own)
   - **Printed card**: Mini terrain map with coordinates and classification summary
   - **Reflection card**: Prompt questions printed for later consideration

4. **Collective engagement**:
   - If multi-user: Discussion with others who explored similar terrains
   - Shared insights about patterns across conversations
   - Critical questions about representation and legibility

---

## Part 3: Detailed Interaction Specifications

### Navigation Controls

**Current State:**
- **Camera**: 
  - Manual rotation via click-and-drag (Y-axis rotation)
  - Three preset views: default (perspective), side (orthographic), top (orthographic)
  - Adjustable distance, elevation, and rotation via settings
- **Mouse**: Hover and click on markers, drag to rotate terrain
- **Timeline**: 
  - Interactive timeline in right panel with clickable points
  - Play button to animate from start to finish (3 seconds)
  - Slider in settings modal for manual control
- **Settings Modal**: Comprehensive controls for all visualization parameters
- **Back**: Return to grid

**Current Features:**
- **Camera controls**: Click + drag to rotate around Y-axis
- **Camera presets**: Default (perspective), side (orthographic), top (orthographic) views
- **Settings panel**: Comprehensive controls for camera, terrain, contours, and colors

**Envisioned Enhancements (Future):**
- **Enhanced camera controls**:
  - Scroll/wheel: Zoom in/out
  - Right-click + drag: Pan
  - Double-click marker: Focus camera on that marker
- **Keyboard shortcuts**:
  - `Space`: Play/pause timeline animation
  - `R`: Reset camera to default view
  - `G`: Toggle grid overlay
  - `C`: Toggle contours
  - `←/→`: Navigate between conversations

### Data Entry Points

**Current: Pre-loaded Only**
- Conversations must be pre-classified
- Loaded from `/output/` directory
- No upload mechanism

**Envisioned: Multiple Entry Points**

1. **Pre-loaded Sample Conversations**:
   - 20-30 diverse conversations covering different patterns
   - Clearly labeled as "Sample Conversations"
   - Diverse interaction patterns, roles, purposes

2. **Bring Your Own Conversation (Optional)**:
   - Paste dialogue into input field
   - Real-time classification (requires internet connection)
   - Explicit consent for data processing
   - Option to save or discard after viewing
   - QR code to return to their visualization later

3. **Upload from File**:
   - Support JSON format conversations
   - Batch upload for researchers
   - Privacy controls (local-only processing option)

### Multi-User Interaction

**Current State:**
- Single-user only
- No collaboration features

**Envisioned for DIS Installation:**

1. **Parallel Exploration**:
   - Multiple screens/displays showing different conversations
   - Users can independently explore different terrains
   - Facilitator can highlight interesting patterns across displays

2. **Shared Annotation** (Future):
   - Users can "pin" observations to terrains
   - Shared reflection board for collective sensemaking
   - Comment threads on specific conversation patterns

3. **Comparison Mode**:
   - Side-by-side view of multiple conversations
   - Overlay mode showing path differences
   - Pattern recognition across conversations

### Reflection Mechanisms

**Current Triggers:**
- Hover/click reveals classification data
- Evidence quotes and alternatives surface ambiguity
- Probabilistic role distributions invite interpretation
- Spatial visualization enables pattern recognition

**Envisioned Enhancements:**

1. **Facilitated Sessions** (Optional):
   - Trained facilitator guides groups through exploration
   - Structured reflection prompts
   - Group discussion of patterns and questions
   - Critical engagement with representation choices

2. **On-Screen Prompts**:
   - Subtle questions appear after viewing multiple conversations
   - "What patterns do you notice?" overlay
   - "How does this visualization shape what you see?"
   - Non-intrusive, dismissible prompts

3. **Reflection Journal** (Digital/Physical):
   - Users can save observations
   - Print or email reflection notes
   - Structured prompts for deeper engagement

---

## Part 4: Typical Encounter Duration

**Estimated Times:**

- **Quick Browse**: 2-3 minutes
  - View grid, select one conversation, hover over a few markers, leave

- **Exploratory Engagement**: 5-8 minutes
  - Select multiple conversations
  - Explore different terrains
  - Read classification data
  - Recognize some patterns

- **Deep Reflection**: 10-15 minutes
  - Systematic exploration
  - Comparison across conversations
  - Critical engagement with visualization
  - Discussion with others (if multi-user)

- **Facilitated Session**: 20-30 minutes
  - Guided exploration
  - Structured reflection
  - Group discussion
  - Critical questions about representation

---

## Part 5: Code Examples of Interaction

### Grid Selection Flow

```typescript
// src/components/TerrainGrid.tsx
// User clicks a terrain card
const handleCardClick = (terrain: TerrainPreset) => {
  onSelectTerrain(terrain); // Triggers transition to single view
};

// src/App.tsx
// Selection triggers view mode change and conversation loading
const handleSelectTerrain = useCallback((terrain: TerrainPreset) => {
  setSelectedTerrainId(terrain.id);
  setSeed(terrain.seed);
  setViewMode('single'); // Transition from grid to terrain view
  setSelectedConversation(conversation || null);
}, [conversationTerrains, classifiedConversations]);
```

### Marker Interaction

```typescript
// src/components/ThreeScene.tsx
// Hover detection via raycasting
const handleMouseMove = (event: MouseEvent) => {
  mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycasterRef.current.setFromCamera(mouseRef.current, camera);
  const intersects = raycasterRef.current.intersectObjects(
    markersRef.current.map(m => m.hitbox)
  );
  
  if (intersects.length > 0) {
    onPointHover(intersects[0].object.userData.index);
  } else {
    onPointHover(null);
  }
};

// Click to lock/unlock marker
const handleClick = () => {
  if (intersects.length > 0) {
    const idx = intersects[0].object.userData.index;
    onPointClick(idx); // Toggle lock state
  }
};
```

### Timeline Animation

```typescript
// src/App.tsx
// Timeline slider controls path progression
const handleAnimate = useCallback(() => {
  setTimelineProgress(0);
  const animate = (timestamp: number) => {
    const progress = Math.min((timestamp - start) / 3000, 1);
    setTimelineProgress(progress);
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}, []);

// Markers appear/disappear based on timeline progress
const visibleCount = timelineProgress >= 0.99
  ? pathPoints.length
  : Math.ceil(pathPoints.length * timelineProgress);
```

### HUD Data Display

```typescript
// src/components/HUDOverlay.tsx
// Message details shown when hovering/locking
{activeMessage && (
  <div>
    <div>{activeMessage.content}</div>
    {activePoint?.humanRole && (
      <div>You positioned yourself as: {activePoint.humanRole}</div>
    )}
    {activePoint?.aiRole && (
      <div>AI positioned as: {activePoint.aiRole}</div>
    )}
  </div>
)}

// Classification dimensions in collapsible sections
{getClassificationDimensions(selectedConversation).map((dim, idx) => (
  <div key={idx}>
    <span>{dim.formattedCategory}</span>
    <span>Confidence: {dim.formattedConfidence}</span>
    {dim.alternative && (
      <span>Alternative: {dim.alternative}</span>
    )}
    {dim.evidence && (
      <div>Evidence: "{dim.evidence[0]}"</div>
    )}
  </div>
))}
```

---

## Part 6: Design Principles for Interaction

### 1. Exploratory, Not Prescriptive
- No instruction manual required
- Interface invites exploration through visual affordances
- Data is descriptive, not evaluative

### 2. Reflection Through Ambiguity
- Uncertainty is made visible, not hidden
- Alternative readings are surfaced
- Probabilistic framings preserve ambiguity

### 3. Spatial Reasoning
- Topographic metaphor leverages spatial cognition
- Patterns become visible through spatial visualization
- Accumulation and persistence are tangible

### 4. Transparency
- Classification assumptions are explicit
- Evidence quotes required for all classifications
- Confidence scores and alternatives shown

### 5. Non-Diagnostic
- No "good" or "bad" conversations
- No prescriptive recommendations
- Only observable patterns and invitations to reflect

---

## Part 7: Future Enhancements

### Planned Features

1. **Manual Camera Controls**:
   - Click + drag rotation
   - Zoom with scroll wheel
   - Focus on markers

2. **Upload Your Own Conversation**:
   - Text input or file upload
   - Real-time classification
   - Privacy controls

3. **Export/Share**:
   - Screenshot of terrain
   - QR code to visualization
   - Print-friendly format

4. **Comparison Mode**:
   - Side-by-side conversations
   - Path overlay comparison
   - Pattern recognition

5. **Facilitator Tools**:
   - Highlight interesting patterns
   - Guided exploration mode
   - Reflection prompts

### Research Questions

- How do users interpret the terrain metaphor?
- What patterns become visible that transcripts hide?
- How do different entry points (pre-loaded vs. upload) affect engagement?
- What reflection mechanisms are most effective?
- How do multi-user interactions change the experience?

---

## Conclusion

Conversational Topography is designed as an **exploratory, reflective artifact** that stages encounters with invisible patterns in human-AI conversation. The interaction design prioritizes:

- **Discovery over instruction**: Visual affordances guide exploration
- **Reflection over evaluation**: Descriptive data invites interpretation
- **Ambiguity over certainty**: Uncertainty is visible and navigable
- **Collective over individual**: Designed for discussion and shared sensemaking

The envisioned DIS installation creates a space for **critical engagement** with how conversational AI technologies mediate relations, making visible patterns that typically remain invisible in linear transcripts.

