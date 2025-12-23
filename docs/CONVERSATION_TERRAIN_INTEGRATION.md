# Conversation-to-Terrain Integration

This document explains how classified conversations are integrated into the terrain visualization system.

## Overview

Classified conversations from the OpenAI classifier are now used as terrain data sources in the TerrainGrid component. Each conversation gets its own terrain card with a unique visualization based on its classification.

## How It Works

### 1. Classification → Terrain Mapping

Each classified conversation is converted to a terrain preset with:

- **Seed**: Deterministically generated from classification categories (pattern, tone, purpose)
- **Name**: Generated from interaction pattern and emotional tone (e.g., "Casual Chat Playful")
- **Description**: Summarizes key classification dimensions and roles

### 2. Classification → Visualization Parameters

When a conversation terrain is selected, its messages are positioned on the terrain using:

- **X-axis (Communication Function)**: 
  - 0.0-0.4 = Functional (task-oriented, problem-solving)
  - 0.6-1.0 = Social (entertainment, relationship-building, self-expression)
  - Mapped from human role distribution (primary), conversation purpose, or knowledge exchange
  - See `docs/DIMENSION_MAPPING.md` for detailed mapping logic

- **Y-axis (Conversation Structure)**:
  - 0.0-0.4 = Structured (question-answer, advisory)
  - 0.6-1.0 = Emergent (collaborative, casual-chat, storytelling)
  - Mapped from AI role distribution (primary), interaction pattern, or engagement style
  - See `docs/DIMENSION_MAPPING.md` for detailed mapping logic

- **Z-axis (Affective/Evaluative Lens - PAD)**:
  - 0.0-1.0 = Emotional intensity (low = satisfaction/affiliation, high = frustration/agitation)
  - Uses PAD model: `emotionalIntensity = (1 - pleasure) * 0.6 + arousal * 0.4`
  - Stored in message `pad.emotionalIntensity` field
  - Controls marker heights (high intensity = peaks, low intensity = valleys)

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
Maps classification to functional (0) ↔ social (1) axis:
- High social: entertainment, relationship-building, self-expression
- Low social (functional): information-seeking, problem-solving
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

**Resulting Terrain:**
- Name: "Casual Chat Playful"
- Seed: 247 (deterministic hash)
- Description: "casual-chat pattern, balanced dynamics, human: sharer, ai: reflector"
- Communication Function: ~0.75 (social)
- Conversation Structure: ~0.75 (emergent)

## PAD Values and Z-Axis

PAD (Pleasure-Arousal-Dominance) values are stored in each message and control the Z-axis visualization (marker heights).

### PAD Structure

Each message includes a `pad` object:
```json
{
  "pad": {
    "pleasure": 0.5,        // 0-1, valence (low = frustration, high = satisfaction)
    "arousal": 0.3,         // 0-1, activation (low = calm, high = agitated)
    "dominance": 0.4,       // 0-1, control (low = passive, high = in control)
    "emotionalIntensity": 0.42  // (1 - pleasure) * 0.6 + arousal * 0.4
  }
}
```

### Generation

- **Rule-based**: Pattern matching (`scripts/add-pad-to-data.js`)
- **LLM-based** ✅ **Recommended**: OpenAI GPT-4o-mini API (`scripts/generate-pad-with-llm-direct.py`)
- See `docs/LLM_PAD_IMPROVEMENT_STRATEGY.md` for details

### Visualization

- High `emotionalIntensity` (frustration) → peaks (markers higher)
- Low `emotionalIntensity` (satisfaction) → valleys (markers lower)
- Creates a "landscape of affective experience" across the conversation

---

## Future Enhancements

- [ ] LLM-based PAD generation for better multilingual and context-aware analysis
- [ ] More sophisticated mapping algorithms for X/Y axes
- [ ] Color coding based on emotional tone or PAD values
- [ ] Size/height based on confidence scores
- [ ] Filtering by classification categories
- [ ] Search by conversation characteristics
- [ ] Batch visualization of multiple conversations
- [ ] PAD formula refinement (consider renaming to "emotionalFriction" or including dominance)

