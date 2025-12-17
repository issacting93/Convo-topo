# Conversational Topography

A 3D terrain visualization of conversation patterns, where topic depth, emotional intensity, and conversation structure are represented as topographic maps.

## Features

- **Depth-based terrain generation** (0.1-1.0 scale)
  - Shallow conversations (0.1-0.4) = flat terrain
  - Medium conversations (0.4-0.7) = rolling hills
  - Deep conversations (0.7-1.0) = dramatic peaks and valleys

- **Topographic visualization**
  - Contour lines showing elevation
  - Path markers tracking conversation flow
  - 3D terrain view with camera controls

- **Classification-driven**
  - Analyzes conversation depth, tone, and structure
  - Maps patterns to terrain characteristics
  - Role-based visual encoding

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the terrain grid.

## Project Structure

```
src/
├── components/
│   ├── ThreeScene.tsx      # 3D terrain renderer
│   ├── TerrainGrid.tsx     # Grid view of all terrains
│   └── HUDOverlay.tsx      # UI controls and info
├── utils/
│   ├── terrain.ts          # Heightmap and contour generation
│   └── conversationToTerrain.ts  # Classification to terrain mapping
└── data/
    ├── terrainPresets.ts
    └── classifiedConversations.ts
```

## Documentation

- [WORKFLOW.md](WORKFLOW.md) - Development workflow
- [QUICK_START.md](QUICK_START.md) - Getting started guide
- Additional docs in `docs/` folder

## License

MIT
