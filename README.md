# Conversational Cartography: A Cognitive Tool for Mapping Human–AI Interaction

**Conversational Cartography is a computational cognitive tool that externalizes human–AI conversations into spatial form, transforming ephemeral dialogue into navigable 3D terrains that support perception, comparison, and reasoning.**

Rather than treating conversations as logs to be read or datasets to be aggregated, this project treats dialogue as a **relational process** whose structure can be made visible through external representation. Each conversation becomes a procedurally generated landscape whose topography encodes affective intensity, conversational stance, and interaction flow.

## Theoretical Grounding: Cognitive Tools Research

This approach is grounded in research on **cognitive tools** (e.g., Judy Fan and colleagues), which shows that external representations—such as drawings, diagrams, and visualizations—do not merely communicate information but **extend human cognition** by making latent structure visible and manipulable. Conversational Cartography applies this principle to human–AI interaction, externalizing conversational dynamics that are difficult to grasp through text or statistics alone.

### Key Theoretical Frameworks

**Distributed Cognition (Edwin Hutchins)**
- Treats cognition as spread across people, artifacts, and environments
- Terrain maps function as external artifacts that encode cognitive dynamics of dialogue
- Tools become part of the reasoning system itself, not just aids

**Extended Mind Theory (Andy Clark & David Chalmers)**
- Cognition "extends" into the world via tools and external representations
- Conversational Cartography externalizes dialogue interpretation into visualizations that participate in thinking
- The boundary of mind isn't limited to neural processes

**Cognitive Artifacts (Donald Norman)**
- External representations designed to augment human cognitive performance
- Terrain landscapes reshape what can be thought about conversation patterns
- Artifacts structure information externally to support memory, reasoning, and decision-making

**Cognitive Tools and Representations (Judy Fan et al.)**
- Drawing and diagrams make abstract information visible and communicable
- External representation is cognitive extension that enables new forms of understanding
- Conversational Cartography materially structures dialogue features for perception and reasoning

**Spatial Cognition (Nora Newcombe)**
- Spatial representation shapes how people think about relationships, memory, and context
- Terrain metaphors leverage spatial reasoning capabilities
- Navigation through conversational landscapes supports pattern recognition

## Core Concept: Conversations as Externalized Cognitive Artifacts

Cognitive tools research demonstrates that people think *with* representations, not just *about* them. Drawing, for example, allows people to externalize abstract relationships, notice patterns, and reason more effectively than through internal cognition alone.

Conversational Cartography applies the same logic to dialogue. Instead of asking researchers to infer patterns by reading transcripts or scanning tables, the system externalizes conversational dynamics into spatial form, allowing users to:

* **Walk through a conversation** as a continuous landscape
* **Perceive affective and relational patterns** as terrain features (e.g., peaks of emotional intensity, valleys of calm)
* **Compare conversations side-by-side** as distinct "worlds"
* **Cluster conversations spatially** based on shared interactional characteristics

The terrain is not a metaphorical illustration but a **computational encoding** that integrates magnitude (height), continuity (surface), and temporality (path) into a single perceptual object.

## Methodological Framing: Visualization as Cognitive Extension

Following cognitive tools theory, Conversational Cartography is designed as a **research instrument**, not a presentation layer. Its purpose is to:

* Off-load cognitive work from memory and interpretation into perceptible structure
* Support pattern recognition across complex, multidimensional conversational data
* Enable both close reading (individual conversations) and distant reading (large corpora)
* Generate new research questions through exploratory interaction

By turning conversations into external artifacts that can be navigated, compared, and revisited, the system extends researchers' ability to reason about human–AI interaction beyond what is possible through text or charts alone.

## Technical Implementation

### The Multi-Modal Pipeline

**1. Data Collection & Classification**
- LLM-based classification using OpenAI GPT-4o-mini
- 9-dimensional analysis: interaction pattern, power dynamics, emotional tone, engagement style, knowledge exchange, conversation purpose, turn-taking, human role distribution, AI role distribution
- PAD (Pleasure-Arousal-Dominance) scores for each message

**2. Linguistic Feature Extraction**
- Observable linguistic markers: imperatives, modality, hedges, inclusive language, humility markers
- Stance analysis provides quantitative grounding for qualitative classifications
- Reproducible, text-based measurements

**3. Dimensional Mapping**

**X-Axis: Communication Function** (Functional ↔ Social)
- Based on human role distribution (challenger → seeker → collaborator → sharer)
- Fallback: conversation purpose

**Y-Axis: Linguistic Alignment** (Aligned ↔ Divergent)
- Primary: Linguistic marker analysis comparing human vs LLM features
- Measures convergence/divergence of linguistic style using Communication Accommodation Theory
- Fallback: AI role distribution or interaction pattern

**Z-Axis: Emotional Intensity**
- Formula: `(1 - Pleasure) × 0.6 + Arousal × 0.4`
- Peaks = frustration/agitation, valleys = affiliation/calm

**4. Procedural Terrain Generation**
- Deterministic Perlin noise-based heightmaps
- Seed derived from conversation classification
- Path overlay showing conversation flow
- 128×128 resolution for real-time rendering

**5. Interactive Visualization**
- **Three.js**: WebGL-based 3D rendering
- **React**: Component-based architecture
- **Zustand + Zod**: Type-safe state management with runtime validation
- **Flight Recorder**: Real-time anomaly detection and "black box" visualization of conversation crashes.
- **Engine Mode**: A reusable, headless SDK for analyzing conversation metrics in any Node/TS project.

### Visualization Modes

1. **Terrain View**: Navigate individual conversations in 3D space
2. **Grid View**: Browse all conversations as thumbnail terrains
3. **Spatial Clustering**: 2D/3D scatter plots showing conversation similarity
4. **Terrain Comparison**: Side-by-side analysis of multiple conversations
5. **PAD Timeline**: Emotional trajectory over conversation turns
6. **Relational Drift**: How conversation dynamics shift over time

## 📦 Engine Mode (SDK)

This repository includes a standalone Conversation Analysis Engine that can be used in other projects (Backends, CLIs, VS Code Extensions).

**Features:**
- P.A.D. Emotion Analysis
- Linguistic Style Matching
- Trajectory & Spike Detection
- Type-Safe Conversation Schema

**Usage (as Submodule):**
1. Add as submodule: `git submodule add ...`
2. Import from SDK:
```typescript
import { calculatePAD, detectSpikes } from './lib/cartography/src/conversation-engine';
```

See [Packaging Guide](docs/technical/PACKAGING_GUIDE.md) for full integration details.

## Why This Matters

As human–AI conversations become longer, more relational, and more consequential, traditional analytic methods struggle to capture their **multidimensional, temporal, and affective nature**. Conversational Cartography proposes that spatial representations—grounded in cognitive tools research—can make these hidden dynamics legible.

The contribution is not simply a new visualization technique, but a **new way of thinking with conversations**: treating dialogue as something that can be mapped, traversed, and examined as an external cognitive object.

In this sense, Conversational Cartography is not just a visualization system—it is a **cognitive technology for studying human–AI interaction**.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 to explore the terrain grid.

## Project Structure

```
Cartography/
├── src/                    # Source code
│   ├── components/        # React components (ThreeScene, HUDOverlay, etc.)
│   ├── pages/            # Visualization modes
│   ├── utils/            # Terrain generation, linguistic analysis
│   ├── schemas/          # Zod validation schemas
│   ├── store/            # Zustand global state
│   └── data/             # Data loaders
│
├── docs/                  # Documentation
│   ├── guides/           # User guides
│   ├── technical/        # Technical documentation
│   └── research/         # Research/academic documentation
│
├── classifier/           # LLM-based classification scripts
├── scripts/              # Data processing utilities
├── data/                 # Raw conversation sources
├── public/output/        # Classified conversation JSONs
└── reports/              # Analysis reports
```

## Documentation

### Getting Started
- [Quick Start Guide](docs/guides/QUICK_START.md)
- [Running the Classifier](docs/guides/RUN_CLASSIFIER.md)
- [OpenAI Setup](docs/guides/OPENAI_SETUP.md)

### Technical Documentation
- [Classifiers and Data Sources](docs/CLASSIFIERS_AND_DATA_SOURCES.md)
- [Data Structure](docs/technical/DATA_STRUCTURE.md)
- [Dimension Mapping](docs/technical/DIMENSION_MAPPING.md)
- [Workflow](docs/technical/WORKFLOW.md)

### Research
- [Taxonomy](docs/research/TAXONOMY.md)
- [DIS2026 Submissions](docs/research/DIS2026_Interactivity_Submission.md)
- [Technical Specs](docs/research/DIS2026_Technical_Specs.md)

## Classification Workflow

To classify new conversations:

```bash
cd classifier
export OPENAI_API_KEY=your-key-here
./classify.sh
```

See [classifier/README.md](classifier/README.md) for details.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Research Applications

**For Researchers**:
- Analyze large corpora of human–AI interactions
- Identify patterns in conversational roles and dynamics
- Compare different AI systems or conversation types
- Generate hypotheses about effective conversation design

**For AI Developers**:
- Understand how different prompts/models affect conversation structure
- Debug problematic interaction patterns
- Design for specific conversational goals
- Evaluate conversation quality beyond simple metrics

**For Interaction Designers**:
- Visualize user experience across conversation types
- Identify where users experience frustration (emotional peaks)
- Design interventions for specific conversational contexts

## License

MIT
