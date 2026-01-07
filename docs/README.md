# Conversational Topography Documentation

A 3D terrain visualization of conversation patterns, where emotional intensity (PAD model), positioning dynamics, and conversation structure are represented as topographic maps.

---

## 📚 Documentation Overview

### Getting Started
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Project overview and key insights
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflow and practices
- **[FINDINGS_SUMMARY.md](FINDINGS_SUMMARY.md)** - Quick summary of research findings

### Core References
- **[TAXONOMY.md](TAXONOMY.md)** - Complete classification taxonomy (9 dimensions)
- **[AXIS_DEFINITIONS.md](AXIS_DEFINITIONS.md)** - X, Y, Z axis definitions (standardized)
- **[SOCIOLINGUISTIC_TERMS.md](SOCIOLINGUISTIC_TERMS.md)** - Key theoretical terms and concepts
- **[ROLE_METADATA.md](ROLE_METADATA.md)** - Role distribution documentation

### Research Findings
- **[RESEARCH_FINDINGS_REPORT_REFRAMED.md](RESEARCH_FINDINGS_REPORT_REFRAMED.md)** ⭐ - Comprehensive findings (with limitations)
- **[DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md](DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md)** - DIS submission guidance
- **[FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md](FIGURE_PAIRS_SAME_ROLES_DIFFERENT_CLUSTERS.md)** - Example conversation pairs
- **[RESEARCH_HYPOTHESIS_VALIDATION.md](RESEARCH_HYPOTHESIS_VALIDATION.md)** ⭐ - Hypothesis validation with examples
- **[TERRAIN_VS_CLASSIFIER_INDEPENDENCE.md](TERRAIN_VS_CLASSIFIER_INDEPENDENCE.md)** - Terrain vs. classifier analysis
- **[ANOMALY_DETECTION_THESIS.md](ANOMALY_DETECTION_THESIS.md)** - Anomaly detection findings
- **[DESTINATION_VS_JOURNEY_HYPOTHESIS.md](DESTINATION_VS_JOURNEY_HYPOTHESIS.md)** - Core hypothesis

### Guides
- **[guides/](guides/)** - Step-by-step guides
  - `CLASSIFICATION_AND_PAD_GUIDE.md` ⭐ - Complete guide for classification and PAD generation
  - `OPENAI_SETUP.md` - Setting up OpenAI API
  - `RUN_CLASSIFIER.md` - How to run classification scripts
  - `DOWNLOADING_LONG_CONVERSATIONS.md` - Guide for downloading longer conversations

### Data Documentation
- **[DATA_GUIDE.md](DATA_GUIDE.md)** ⭐ - Complete guide for data organization, structure, quality, and validation
- **[DATA_ENCODING_VERIFICATION.md](DATA_ENCODING_VERIFICATION.md)** - Verification that data matches spatial encoding
- **[WILDCHAT_INTEGRATION.md](WILDCHAT_INTEGRATION.md)** - WildChat-1M dataset integration
- **[RECLASSIFICATION_GUIDE.md](RECLASSIFICATION_GUIDE.md)** - Guide for reclassifying conversations (v1.2)

### Calculations & Dimensions
- **[calculations/](calculations/)** - Calculation and dimension documentation
  - `AXIS_VALUES_EXPLAINED.md` ⭐ - Simple guide to X, Y, Z axes
  - `CALCULATED_DIMENSIONS.md` - Reference of all calculated dimensions
  - `CALCULATION_DETAILS.md` - Step-by-step calculation methods
  - `DIMENSION_MAPPING.md` - How dimensions map to visualization
  - `METRICS_ANALYSIS.md` - Metrics analysis
  - See `calculations/README.md` for overview

### Cluster Analysis
- **[cluster-analysis/](cluster-analysis/)** - Path cluster analysis documentation
  - `COMPREHENSIVE_CLUSTER_ANALYSIS.md` ⭐ - Main analysis with 7 archetypes
  - `THEORETICAL_SYNTHESIS.md` - Theoretical grounding
  - `FEATURE_IMPORTANCE_ANALYSIS.md` ⭐ - Feature importance analysis (comprehensive)
  - `PATH_CLUSTER_ANALYSIS_KMEANS.md` - K-Means results (current)
  - `PATH_CLUSTER_ANALYSIS_HIERARCHICAL.md` - Hierarchical results (current)
  - See `cluster-analysis/README.md` for overview

### Analysis
- **[analysis/](analysis/)** - Pattern and spatial analysis
  - `CLASSIFICATION_QUALITY_SUMMARY.md` - Classification quality analysis
  - `MISCLASSIFICATION_PATTERNS_ANALYSIS.md` - Misclassification pattern analysis
  - `CLASSIFICATION_CORRECTION_FRAMEWORK.md` - Correction framework
  - `PATTERN_EMERGENCE_ANALYSIS.md` - Why different patterns emerge
  - `SPATIAL_CLUSTERING_ANALYSIS.md` - What spatial clustering reveals
  - `COMPARISON_CHATBOT_ARENA_0440_0450.md` - Conversation comparison
  - See `analysis/README.md` for overview

### Submissions
- **[submissions/](submissions/)** - Conference submission documentation
  - `DIS_SUBMISSION_FRAMING.md` ⭐ - DIS submission guidance
  - See `submissions/README.md` for overview

### Technical Documentation
- **[technical/](technical/)** - Technical specifications and implementation
  - `DATA_SOURCES.md` - Current data sources
  - `TERRAIN_VISUALIZATION_DATA_FLOW.md` - How terrain is generated
  - `CONVERSATION_TERRAIN_INTEGRATION.md` - Integration details
  - See `technical/README.md` for overview

### Research Documentation
- **[research/](research/)** - Academic and research materials
  - `DOCUMENTATION_INDEX.md` - Navigation guide
  - See `research/README.md` for overview

### Archive
- **[archive/](archive/)** - Archived documentation
  - `hypothesis/` - Historical hypothesis validation files (VERIFIED_HYPOTHESIS_AND_NARRATIVE, THESIS_VALIDATION_TWO_CONVERSATIONS)
  - `axis-definitions/` - Superseded axis definition files (Y_AXIS_STANDARDIZATION, Z_AXIS_SEMANTIC_ANALYSIS, XYZ_AXES_COHERENCE_ANALYSIS)
  - `cluster-analysis/` - Archived feature importance files (FEATURE_IMPORTANCE_HIERARCHICAL, FEATURE_IMPORTANCE_KMEANS)
  - `examples/` - Archived role example files (COLLABORATOR_EXAMPLES, DIRECTOR_EXAMPLES)
  - `research/` - Archived research files (RESEARCH_DEMONSTRATION_CONVERSATIONS)
  - `status/` - Historical status reports (DATA_STATUS_REPORT, RECLASSIFICATION_COMPLETE)
  - `wildchat/` - Archived WildChat workflow files (WILDCHAT_IMMEDIATE_NEXT_STEPS, WILDCHAT_POST_CLASSIFICATION_WORKFLOW)
  - `organization/` - Historical organization files (DOCUMENTATION_CLEANUP_ANALYSIS, DOCUMENTATION_ORGANIZATION_2025, NEXT_STEPS_ACTION_PLAN)
  - `pad-reviews/` - Old PAD review files
  - `findings/` - Superseded findings reports
  - `old-analysis/` - Outdated analysis files

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

1. **New to the project?** Start with [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
2. **Understanding classifications?** Read [TAXONOMY.md](TAXONOMY.md)
3. **Understanding axes?** See [AXIS_DEFINITIONS.md](AXIS_DEFINITIONS.md)
4. **Research findings?** See [FINDINGS_SUMMARY.md](FINDINGS_SUMMARY.md) then [RESEARCH_FINDINGS_REPORT_REFRAMED.md](RESEARCH_FINDINGS_REPORT_REFRAMED.md)
5. **Running classifiers?** Check [guides/CLASSIFICATION_AND_PAD_GUIDE.md](guides/CLASSIFICATION_AND_PAD_GUIDE.md)
6. **Understanding data?** See [DATA_GUIDE.md](DATA_GUIDE.md)
7. **Working with terrain?** See [technical/TERRAIN_VISUALIZATION_DATA_FLOW.md](technical/TERRAIN_VISUALIZATION_DATA_FLOW.md)
8. **Cluster analysis?** Start with [cluster-analysis/COMPREHENSIVE_CLUSTER_ANALYSIS.md](cluster-analysis/COMPREHENSIVE_CLUSTER_ANALYSIS.md)
9. **DIS submission?** See [DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md](DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md) for guidance

---

## 🔄 Recent Changes

### Documentation Cleanup (2026-01-XX)
- **Archived:** Feature importance files (FEATURE_IMPORTANCE_HIERARCHICAL, FEATURE_IMPORTANCE_KMEANS) → `archive/cluster-analysis/`
- **Archived:** Axis analysis files (Y_AXIS_STANDARDIZATION, Z_AXIS_SEMANTIC_ANALYSIS, XYZ_AXES_COHERENCE_ANALYSIS) → `archive/axis-definitions/`
- **Removed:** Duplicate path cluster analysis files from root (kept in `cluster-analysis/` subfolder)
- **Archived:** Status/organization files (DOCUMENTATION_ORGANIZATION_2025, NEXT_STEPS_ACTION_PLAN) → `archive/`
- **Consolidated:** Axis definitions into `AXIS_DEFINITIONS.md`
- **Created:** `FINDINGS_SUMMARY.md` for quick reference
- **Updated:** README with current structure
- **Result:** ~25% reduction in root documentation files

### Documentation Cleanup (2026-01-XX)
- **Consolidated:** WildChat workflow files into `WILDCHAT_INTEGRATION.md`
- **Consolidated:** Role examples into `ROLE_DISTINCTIONS_EXAMPLES.md`
- **Consolidated:** Hypothesis validation into `RESEARCH_HYPOTHESIS_VALIDATION.md`
- **Consolidated:** Status information into `DATA_GUIDE.md`
- **Archived:** 10 redundant files to `archive/` subdirectories
- **Result:** Reduced from 43 to 33 files (24% reduction)

### Reclassification (2026-01-XX)
- **Completed:** v1.2 reclassification of 340 conversations
- **Status:** Documented in `DATA_GUIDE.md` (archived completion summary in `archive/status/`)
- **Updated:** Cluster analysis with reclassified data

### Research Findings (2026-01-XX)
- **Added:** `RESEARCH_FINDINGS_REPORT_REFRAMED.md` - Findings with limitations acknowledged
- **Added:** `DOCUMENT_PURPOSE_AND_DIS_GUIDANCE.md` - DIS submission guidance
- **Clarified:** Document purposes (research docs vs. submission materials)

### Cluster Analysis (2025-01-03)
- **Added:** Comprehensive path cluster analysis identifying 7 relational positioning archetypes
- **Added:** Theoretical synthesis connecting clusters to Watzlawick's relational communication theory
- **Key Finding:** 81.8% of feature importance comes from trajectory characteristics (when clustering on trajectory features)
- **Added:** Cluster separation metrics, sensitivity analysis, and manual validation reports

---

## 📝 Note

This documentation is actively maintained. If you find outdated information, please update it or file an issue.
