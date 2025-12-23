# Conversational Topography Documentation

A 3D terrain visualization of conversation patterns, where emotional intensity (PAD model), positioning dynamics, and conversation structure are represented as topographic maps.

---

## 📚 Documentation Overview

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide for developers
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflow and practices

### Core References
- **[TAXONOMY.md](TAXONOMY.md)** - Complete classification taxonomy (9 dimensions)
- **[SOCIOLINGUISTIC_TERMS.md](SOCIOLINGUISTIC_TERMS.md)** - Key theoretical terms and concepts

### Technical Documentation
- **[TERRAIN_VISUALIZATION_DATA_FLOW.md](TERRAIN_VISUALIZATION_DATA_FLOW.md)** - How terrain is generated from conversations
- **[CONVERSATION_TERRAIN_INTEGRATION.md](CONVERSATION_TERRAIN_INTEGRATION.md)** - Integration details
- **[DIMENSION_MAPPING.md](DIMENSION_MAPPING.md)** - How dimensions map to visualization
- **[VALUE_EXPLANATION.md](VALUE_EXPLANATION.md)** - What the values mean
- **[METRICS_ANALYSIS.md](METRICS_ANALYSIS.md)** - Analysis of metrics and dimensions
- **[ROLE_METADATA.md](ROLE_METADATA.md)** - Role distribution documentation
- **[API_OPTIONS.md](API_OPTIONS.md)** - API configuration options

### Deep Dive Analysis
- **[DEEP_DIVE_INDEX.md](DEEP_DIVE_INDEX.md)** - Navigation guide for deep dive documentation ⭐ **Start here**
- **[DEEP_DIVE_SUMMARY.md](DEEP_DIVE_SUMMARY.md)** - Executive summary of path-PAD relationships
- **[DEEP_DIVE_PATH_PAD_ANALYSIS.md](DEEP_DIVE_PATH_PAD_ANALYSIS.md)** - Comprehensive technical analysis
- **[DEEP_DIVE_EXAMPLES.md](DEEP_DIVE_EXAMPLES.md)** - Concrete examples with real conversation data
- **[DEEP_DIVE_CODE_VERIFICATION.md](DEEP_DIVE_CODE_VERIFICATION.md)** - Code verification and formula corrections
- **[PATH_CONVERSATION_PAD_RELATIONSHIP.md](PATH_CONVERSATION_PAD_RELATIONSHIP.md)** - Overview of the three core relationships
- **[PATH_ROLE_RELATIONSHIP.md](PATH_ROLE_RELATIONSHIP.md)** - Detailed role-position mapping analysis

### Data & Classification
- **[CLASSIFIERS_AND_DATA_SOURCES.md](CLASSIFIERS_AND_DATA_SOURCES.md)** - Complete guide to classifiers and data sources
- **[CONVERSATION_DATA_SOURCES.md](CONVERSATION_DATA_SOURCES.md)** - External data source suggestions
- **[QUICK_REFERENCE_CLASSIFIERS.md](QUICK_REFERENCE_CLASSIFIERS.md)** - Quick reference for running classifiers
- **[DATA_ORGANIZATION.md](DATA_ORGANIZATION.md)** - How data is organized
- **[DATA_STRUCTURE.md](DATA_STRUCTURE.md)** - Detailed data structure documentation

### Guides
- **[guides/](guides/)** - Step-by-step guides
  - `OPENAI_SETUP.md` - Setting up OpenAI API
  - `RUN_CLASSIFIER.md` - How to run classification scripts

### Research Documentation
- **[research/](research/)** - Academic and research materials
  - `DOCUMENTATION_INDEX.md` - Navigation guide for research docs
  - `DIS2026_Interactivity_Submission_Revised.md` - Conference submission
  - `USER_EXPERIENCE_AND_INTERACTION.md` - UX documentation
  - `CRITICAL_COMPUTING_AND_DESIGN_THEORY.md` - Theoretical framework

### Technical Details
- **[technical/](technical/)** - Technical specifications
  - `DATA_SOURCES.md` - Current data sources

### Archived Materials
- **[archive/](archive/)** - Archived documentation and reports

---

## 🎯 Key Features

- **Affective/Evaluative Lens (Z-axis)**
  - Uses PAD model (Pleasure-Arousal-Dominance) to visualize emotional agitation
  - Peaks represent frustration/friction, valleys represent affiliation
  - Reveals emotional evaluation of AI performance

- **Topographic visualization**
  - Contour lines showing elevation
  - Path markers tracking conversation flow
  - 3D terrain view with camera controls
  - Dark theme optimized for visibility

- **Classification-driven**
  - 9 classification dimensions
  - Maps conversation patterns to terrain characteristics
  - Role-based visual encoding

---

## 📖 Recommended Reading Order

1. **New to the project?** Start with [QUICK_START.md](QUICK_START.md)
2. **Understanding classifications?** Read [TAXONOMY.md](TAXONOMY.md)
3. **Working with terrain?** See [TERRAIN_VISUALIZATION_DATA_FLOW.md](TERRAIN_VISUALIZATION_DATA_FLOW.md)
4. **Running classifiers?** Check [CLASSIFIERS_AND_DATA_SOURCES.md](CLASSIFIERS_AND_DATA_SOURCES.md)
5. **Understanding path visualization?** See [DEEP_DIVE_INDEX.md](DEEP_DIVE_INDEX.md) for comprehensive analysis
6. **Research/academic?** See [research/DOCUMENTATION_INDEX.md](research/DOCUMENTATION_INDEX.md)

---

## 🔄 Recent Changes

### Analysis & Documentation
- **Added:** Comprehensive deep dive analysis of path-PAD relationships (83 conversations analyzed)
- **Added:** Code verification document ensuring documentation matches implementation
- **Added:** Detailed examples showing role calculations and path trajectory patterns
- **Updated:** All mathematical formulations verified against actual code

### Visualization Features
- **Enhanced:** Terrain cards now show message count, dominant roles, PAD summary, and top classification dimensions
- **Added:** Interactive minimap with clickable points to jump to messages
- **Added:** Camera view controls (default/side/top) in right panel
- **Added:** Timeline with play button for animation in right panel
- **Added:** Comprehensive settings modal with all controls
- **Removed:** Chromatic aberration filter (was causing blur)
- **Improved:** Font sizes in cards (minimum 12px for better readability)

### Technical Changes
- **Removed:** Topic depth dimension (9 dimensions now)
- **Updated:** Z-axis now uses Affective/Evaluative Lens (PAD model)
- **Removed:** Theme toggle (dark mode only)
- **Improved:** Documentation organization and consolidation

---

## 📝 Note

This documentation is actively maintained. If you find outdated information, please update it or file an issue.
