# Conversational Topography

A 3D terrain visualization of conversation patterns, where emotional intensity and conversation structure are represented as topographic maps.

## Features

- **Procedural terrain generation**
  - Unique terrain for each conversation based on classification
  - Contour lines showing elevation changes
  - Varied terrain complexity and character

- **Topographic visualization**
  - Contour lines showing elevation
  - Path markers tracking conversation flow
  - 3D terrain view with camera controls

- **Classification-driven**
  - Analyzes conversation tone, structure, and interaction patterns
  - Maps patterns to terrain characteristics
  - Role-based visual encoding

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the terrain grid.

## Project Structure

```
Cartography/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   └── data/             # Data loaders
│
├── docs/                  # Documentation
│   ├── guides/           # User guides
│   ├── technical/        # Technical docs
│   └── research/         # Research/academic docs
│
├── classifier/           # Classification scripts
├── scripts/              # Utility scripts
│   ├── verification/     # Verification scripts
│   └── data/            # Data processing
│
├── data/                 # Data processing & source files
├── conversations-raw/    # Raw conversation data
├── output/               # Generated classified conversations
└── reports/              # Reports and analysis
```

## Documentation

### Getting Started
- [Quick Start Guide](docs/guides/QUICK_START.md)
- [Running the Classifier](docs/guides/RUN_CLASSIFIER.md)
- [OpenAI Setup](docs/guides/OPENAI_SETUP.md)

### Technical Documentation
- [Classifiers and Data Sources](docs/CLASSIFIERS_AND_DATA_SOURCES.md) - Complete overview of all classifiers and data sources
- [Data Structure](docs/technical/DATA_STRUCTURE.md)
- [Data Sources](docs/technical/DATA_SOURCES.md)
- [Dimension Mapping](docs/technical/DIMENSION_MAPPING.md)
- [Workflow](docs/technical/WORKFLOW.md)

### Research
- [Taxonomy](docs/research/TAXONOMY.md)
- [DIS2026 Submissions](docs/research/DIS2026_Interactivity_Submission.md)
- [Technical Specs](docs/research/DIS2026_Technical_Specs.md)

### Reports
- [Bug Report](reports/BUG_REPORT.md)
- [Classification Review](reports/DATA_CLASSIFICATION_REVIEW.md)
- [Verification Reports](reports/)

## Classification Workflow

To classify conversations:

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

## License

MIT

