# Conversation-to-Terrain Integration

This document explains how classified conversations are integrated into the terrain visualization system.

## Overview

Classified conversations from the OpenAI classifier are now used as terrain data sources in the TerrainGrid component. Each conversation gets its own terrain card with a unique visualization based on its classification.

## How It Works

### 1. Classification → Terrain Mapping

Each classified conversation is converted to a terrain preset with:

- **Seed**: Deterministically generated from classification categories (pattern, tone, purpose, depth)
- **Name**: Generated from interaction pattern and emotional tone (e.g., "Casual Chat Playful")
- **Description**: Summarizes key classification dimensions and roles

### 2. Classification → Visualization Parameters

When a conversation terrain is selected, its messages are positioned on the terrain using:

- **X-axis (communicationFunction)**: 
  - 0.0-0.4 = Instrumental (task-oriented, problem-solving)
  - 0.6-1.0 = Expressive (entertainment, relationship-building, self-expression)
  - Mapped from `conversationPurpose` and `knowledgeExchange`

- **Z-axis (conversationStructure)**:
  - 0.0-0.4 = Structured (question-answer, advisory)
  - 0.6-1.0 = Emergent (collaborative, casual-chat, storytelling)
  - Mapped from `interactionPattern` and `engagementStyle`

### 3. File Structure

```
output/                    # Source classified conversations (gitignored)
  conv-0.json
  conv-1.json
  ...

public/output/             # Served to web app (committed)
  conv-0.json
  conv-1.json
  ...
```

## Usage

### Running the Classifier

```bash
# Process 20 conversations and save individually
python3 classifier-openai.py conversations-for-classifier.json classified-output.json --limit 20 --individual

# Sync to public directory for web app
./sync-output-to-public.sh
```

### In the Web App

1. **Grid View**: Shows all available terrains (presets or conversations)
2. **Toggle**: Switch between preset terrains and classified conversations
3. **Select**: Click a conversation terrain to view it in 3D
4. **Visualization**: Messages are positioned based on classification

## Mapping Functions

### `getCommunicationFunction(conversation)`
Maps classification to instrumental (0) ↔ expressive (1) axis:
- High expressive: entertainment, relationship-building, self-expression
- Low expressive: information-seeking, problem-solving
- Uses `conversationPurpose` and `knowledgeExchange`

### `getConversationStructure(conversation)`
Maps classification to structured (0) ↔ emergent (1) axis:
- High emergent: collaborative, casual-chat, storytelling
- Low emergent: question-answer, advisory
- Uses `interactionPattern` and `engagementStyle`

## Terrain Generation

Each conversation gets a unique terrain seed based on:
- Interaction pattern category
- Emotional tone category
- Conversation purpose category
- Topic depth category
- Conversation ID

This ensures:
- Same conversation = same terrain (deterministic)
- Different conversations = different terrains (varied)
- Seed range: 1-999

## Example

**Conversation Classification:**
- Pattern: `casual-chat`
- Tone: `playful`
- Purpose: `entertainment`
- Depth: `surface`

**Resulting Terrain:**
- Name: "Casual Chat Playful"
- Seed: 247 (deterministic hash)
- Description: "casual-chat pattern, balanced dynamics, surface depth, human: sharer, ai: reflector"
- Communication Function: ~0.75 (expressive)
- Conversation Structure: ~0.75 (emergent)

## Future Enhancements

- [ ] More sophisticated mapping algorithms
- [ ] Color coding based on emotional tone
- [ ] Size/height based on confidence scores
- [ ] Filtering by classification categories
- [ ] Search by conversation characteristics
- [ ] Batch visualization of multiple conversations

