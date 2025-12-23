# Conversation Classification → Visualization Workflow

## Overview

This document outlines the end-to-end workflow for analyzing conversations with the classifier and visualizing them in the terrain interface.

## Step 1: Prepare Input Data

Format your conversations as JSON:

```json
[
  {
    "id": "conv-001",
    "messages": [
      {"role": "user", "content": "What is machine learning?"},
      {"role": "assistant", "content": "Machine learning is..."}
    ]
  }
]
```

Or use existing PersonaChat format from `src/data/personaChatMessages.json`.

## Step 2: Run Classification

### Option A: Full Classification (Recommended for visualization)

```bash
# Python
python classifier-v1.1.py src/data/personaChatMessages.json classified-conversations.json

# TypeScript
npx ts-node classifier-v1.1.ts src/data/personaChatMessages.json classified-conversations.json
```

### Option B: Windowed Classification (For role drift analysis)

```bash
python classifier-v1.1.py src/data/personaChatMessages.json classified-conversations.json --windowed
```

This produces:
- Full conversation classifications (9 dimensions)
- Windowed classifications showing role evolution
- Confidence scores and evidence quotes

### Output Format

```json
{
  "id": "conv-001",
  "messages": [...],
  "classification": {
    "interactionPattern": {"category": "question-answer", "confidence": 0.85, ...},
    "powerDynamics": {"category": "human-led", "confidence": 0.8, ...},
    "humanRole": {
      "distribution": {"seeker": 0.6, "learner": 0.2, ...},
      "confidence": 0.75
    },
    "aiRole": {
      "distribution": {"expert": 0.7, "advisor": 0.2, ...},
      "confidence": 0.8
    },
    ...
  },
  "windowedClassifications": [...]
}
```

## Step 3: Map Classification to Visualization Parameters

### Current System (Simple Metrics)

The visualization currently uses:
- **X-axis (communicationFunction)**: 0 = functional, 1 = social
- **Z-axis (conversationStructure)**: 0 = structured, 1 = emergent
- **Y-axis (height)**: Based on terrain heightmap

### Proposed: Rich Classification Mapping

Create a mapping utility that translates classification results to visualization parameters:

```typescript
// src/utils/classificationToVisualization.ts

interface ClassificationResult {
  interactionPattern: { category: string; confidence: number };
  powerDynamics: { category: string; confidence: number };
  emotionalTone: { category: string; confidence: number };
  humanRole: { distribution: Record<string, number> };
  aiRole: { distribution: Record<string, number> };
  // ... other dimensions
}

interface VisualizationParams {
  x: number;  // Communication function (functional ↔ social)
  z: number;  // Conversation structure (structured ↔ emergent)
  y: number;  // Height/elevation
  color?: string;  // Based on role or emotional tone
  size?: number;   // Based on confidence or message length
}

function mapClassificationToVisualization(
  classification: ClassificationResult
): VisualizationParams {
  // X-axis: Functional ↔ Social
  // Based on conversationPurpose and knowledgeExchange
  const x = calculateCommunicationFunction(classification);
  
  // Z-axis: Structured ↔ Emergent  
  // Based on interactionPattern and turnTaking
  const z = calculateConversationStructure(classification);
  
  // Y-axis: Elevation/Height
  // Based on topicDepth and powerDynamics
  const y = calculateElevation(classification);
  
  return { x, z, y };
}

function calculateCommunicationFunction(c: ClassificationResult): number {
  // Information-seeking, problem-solving → more functional (low)
  // Entertainment, relationship-building → more social (high)
  const purpose = c.conversationPurpose.category;
  const knowledge = c.knowledgeExchange.category;
  
  if (purpose === 'information-seeking' || purpose === 'problem-solving') {
    return 0.2 + (knowledge === 'factual-info' ? 0.1 : 0.2);
  }
  if (purpose === 'relationship-building' || purpose === 'entertainment') {
    return 0.7 + (knowledge === 'personal-sharing' ? 0.2 : 0.1);
  }
  return 0.5;
}

function calculateConversationStructure(c: ClassificationResult): number {
  // Question-answer, advisory → structured (low)
  // Collaborative, casual-chat → emergent (high)
  const pattern = c.interactionPattern.category;
  const turns = c.turnTaking.category;
  
  if (pattern === 'question-answer' || pattern === 'advisory') {
    return 0.2;
  }
  if (pattern === 'collaborative' || pattern === 'casual-chat') {
    return 0.8;
  }
  return 0.5;
}

function calculateElevation(c: ClassificationResult): number {
  // Higher elevation based on power dynamics and emotional intensity
  const power = c.powerDynamics.category;
  
  let elevation = 0.5;
  // Elevation based on power dynamics and other factors
  if (power === 'human-led') elevation += 0.2;
  
  return Math.min(1.0, elevation);
}
```

### Alternative: Role-Based Mapping

Use role distributions directly for more nuanced visualization:

```typescript
function mapRoleDistributionToVisualization(
  humanRole: Record<string, number>,
  aiRole: Record<string, number>
): VisualizationParams {
  // X-axis: Based on human role distribution
  // Director + Challenger → more functional
  // Sharer + Collaborator → more social
  const x = 
    (humanRole.director || 0) * 0.2 +
    (humanRole.challenger || 0) * 0.3 +
    (humanRole.sharer || 0) * 0.8 +
    (humanRole.collaborator || 0) * 0.7 +
    (humanRole.seeker || 0) * 0.4 +
    (humanRole.learner || 0) * 0.5;
  
  // Z-axis: Based on AI role distribution
  // Expert + Advisor → structured (prescriptive)
  // Peer + Facilitator → emergent (exploratory)
  const z =
    (aiRole.expert || 0) * 0.3 +
    (aiRole.advisor || 0) * 0.2 +
    (aiRole.facilitator || 0) * 0.7 +
    (aiRole.peer || 0) * 0.8 +
    (aiRole.reflector || 0) * 0.6 +
    (aiRole.affiliative || 0) * 0.5;
  
  // Y-axis: Power dynamics from role interaction
  const humanControl = (humanRole.director || 0) + (humanRole.challenger || 0);
  const aiAuthority = (aiRole.expert || 0) + (aiRole.advisor || 0);
  const y = 0.3 + (humanControl * 0.3) + (aiAuthority * 0.2);
  
  return { x, z, y };
}
```

## Step 4: Integrate with Visualization

### Update Message Interface

Extend the Message interface to include classification data:

```typescript
// src/data/messages.ts

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  communicationFunction: number;
  conversationStructure: number;
  // Add classification data (optional)
  classification?: {
    humanRole?: { distribution: Record<string, number> };
    aiRole?: { distribution: Record<string, number> };
    emotionalTone?: { category: string };
    // ... other dimensions as needed
  };
}
```

### Update Terrain Generation

Modify `generatePathPoints` to use classification data when available:

```typescript
// src/utils/terrain.ts

export function generatePathPoints(
  heightmap: Float32Array,
  size: number,
  count: number,
  messages: Message[]
): PathPoint[] {
  // If messages have classification, use it
  // Otherwise fall back to communicationFunction/conversationStructure
  return messages.map((msg, i) => {
    const x = msg.classification 
      ? mapClassificationToVisualization(msg.classification).x
      : msg.communicationFunction;
      
    const z = msg.classification
      ? mapClassificationToVisualization(msg.classification).z
      : msg.conversationStructure;
    
    // ... rest of path point generation
  });
}
```

## Step 5: Post-Processing Pipeline

Create a script to transform classified conversations into visualization-ready format:

```typescript
// scripts/prepareVisualizationData.ts

import { readFileSync, writeFileSync } from 'fs';
import { mapClassificationToVisualization } from '../src/utils/classificationToVisualization';

interface ClassifiedConversation {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  classification: ClassificationResult;
}

function prepareForVisualization(
  classifiedPath: string,
  outputPath: string
) {
  const conversations: ClassifiedConversation[] = JSON.parse(
    readFileSync(classifiedPath, 'utf-8')
  );
  
  const visualizationReady = conversations.map(conv => ({
    id: conv.id,
    messages: conv.messages.map((msg, idx) => ({
      role: msg.role,
      content: msg.content,
      // Map conversation-level classification to message-level
      // (or use windowed classifications for message-specific roles)
      communicationFunction: calculateMessageCF(conv, idx),
      conversationStructure: calculateMessageCS(conv, idx),
      classification: {
        // Extract relevant classification data
        humanRole: conv.classification.humanRole,
        aiRole: conv.classification.aiRole,
        emotionalTone: conv.classification.emotionalTone,
      }
    }))
  }));
  
  writeFileSync(outputPath, JSON.stringify(visualizationReady, null, 2));
}
```

## Recommended Approach

### Phase 1: Quick Integration (Current System + Classification Metadata)

1. Run classifier on existing PersonaChat data
2. Store classification results alongside messages
3. Keep current `communicationFunction`/`conversationStructure` for positioning
4. Use classification for:
   - Category filtering (already done)
   - Color coding based on roles
   - UI labels showing dominant roles

### Phase 2: Rich Mapping (Classification-Driven Positioning)

1. Implement `mapClassificationToVisualization` functions
2. Use classification dimensions to calculate X/Z positions
3. Add role distribution visualization in UI
4. Enable windowed classification view (role drift over time)

### Phase 3: Advanced Features

1. Multi-terrain comparison (same conversation on different terrains)
2. Role evolution animation (using windowed classifications)
3. Confidence-based filtering
4. Evidence quote display on hover

## Quick Start Commands

```bash
# 1. Classify conversations
python classifier-v1.1.py src/data/personaChatMessages.json classified.json

# 2. (Optional) Prepare visualization data
# Create scripts/prepareVisualizationData.ts and run:
npx ts-node scripts/prepareVisualizationData.ts classified.json src/data/classifiedMessages.json

# 3. Update visualization to use classified data
# Modify src/data/personaChatMessages.ts to import classified data

# 4. Run visualization
npm run dev
```

## Questions to Consider

1. **Message-level vs Conversation-level**: Should each message get its own classification, or use conversation-level classification for all messages?

2. **Windowed vs Full**: Use windowed classifications to show role evolution, or full conversation classification for simplicity?

3. **Mapping Strategy**: Use role distributions directly, or derive simpler metrics (communicationFunction/conversationStructure) from classifications?

4. **Performance**: Classification adds metadata - ensure it doesn't slow down rendering (cache classifications, lazy load).

