# Data Guide

**Complete guide** to data organization, structure, quality, and validation.

---

## Data Organization

### Directory Structure

```
public/output/              # Classified conversations (for app)
├── chatbot_arena_*.json   # 160 Chatbot Arena conversations
├── oasst-*.json           # 2 OpenAssistant conversations
└── wildchat_*.json        # 371 valid WildChat conversations (of 589 downloaded)

output/                    # Working directory for classification
conversations-raw/         # Raw conversation data
```

### Current Dataset

- **Total Classified Files**: 569 conversations (as of 2026-01-10, manifest updated)
  - **Chatbot Arena**: 333 conversations
  - **WildChat**: 186 conversations
  - **OASST**: 32 conversations
  - **Cornell Movie Dialogues**: 9 conversations (human-human)
  - **Kaggle Empathetic Dialogues**: 9 conversations (human-human)
- **New Taxonomy (GPT-5.2 + 2.0-social-role-theory)**: 538 conversations (94.6%)
  - **Chatbot Arena**: 322 with new taxonomy (96.7%)
  - **WildChat**: 184 with new taxonomy (98.9%)
  - **OASST**: 32 with new taxonomy (100%)
- **Validated Corpus (for analysis)**: 345 conversations (subset used in cluster analysis and findings)
- **Average Messages**: ~10.7 messages per conversation
- **PAD Coverage**: 100% (all messages have PAD scores)

**Note:** The validated corpus of 345 conversations refers to the subset used for cluster analysis and key findings. Additional conversations have been classified but may not yet be included in published analyses.

### Dataset Status

**Main Dataset (`public/output/`):**
- **Total Files:** 569 classified conversations (as of 2026-01-10)
- **New Taxonomy:** 538 conversations (94.6%) with GPT-5.2 + 2.0-social-role-theory
- **Validated Corpus:** 345 conversations (subset used in cluster analysis and published findings)
- **Complete (classified + PAD):** 569 (100%) ✅
- **Classification Model:** GPT-5.2 with Social Role Theory taxonomy (6+6 roles)
- **Manifest Status:** ✅ Updated - All 569 files now in manifest

**Classification Details:**
- **Classification Complete:** ✅ (2026-01-09)
- **Current Taxonomy:** 6 human roles + 6 AI roles (Social Role Theory)
- **Reduced Taxonomy Option:** 3 human roles + 3 AI roles (consolidated)
- **Previous Versions:** Archived in `archive/process/`

**WildChat Integration:**
- **Downloaded:** 589 conversations
- **Valid Files:** 371 files (JSON parseable and processable)
- **Corrupted:** 402 files (cannot be processed)
- **Status:** ✅ Classified and integrated
- **See:** `WILDCHAT_INTEGRATION.md` for workflow details

---

## Data Structure

Each conversation file contains:

```json
{
  "id": "chatbot_arena_001",
  "messages": [
    {
      "role": "user",
      "content": "...",
      "pad": {
        "pleasure": 0.5,
        "arousal": 0.3,
        "dominance": 0.4,
        "emotionalIntensity": 0.42
      }
    }
  ],
  "classification": {
    "interactionPattern": { "category": "question-answer", "confidence": 0.9 },
    "powerDynamics": { "category": "balanced", "confidence": 0.8 },
    "emotionalTone": { "category": "neutral", "confidence": 0.85 },
    "engagementStyle": { "category": "questioning", "confidence": 0.8 },
    "knowledgeExchange": { "category": "factual-info", "confidence": 0.9 },
    "conversationPurpose": { "category": "information-seeking", "confidence": 0.9 },
    "turnTaking": { "category": "balanced", "confidence": 0.8 },
    "humanRole": {
      "distribution": { "seeker": 0.6, "director": 0.3, "collaborator": 0.1 },
      "confidence": 0.85
    },
    "aiRole": {
      "distribution": { "expert": 0.4, "advisor": 0.4, "facilitator": 0.2 },
      "confidence": 0.85
    }
  },
  "classificationMetadata": {
    "model": "gpt-5.2",
    "provider": "openai",
    "timestamp": "2026-01-09T...",
    "promptVersion": "2.0.0"
  }
}
```

See `DATA_STRUCTURE.md` for detailed schema documentation.

---

## Data Quality

### Current Status

✅ **100% PAD Coverage** - All messages have PAD scores  
✅ **100% Classification Coverage** - All conversations classified  
✅ **100% Metadata** - All conversations have classification metadata  
✅ **No Critical Errors** - Validation passes with minor warnings

### Quality Metrics

- **Average Confidence**: 0.75-0.85 across dimensions
- **Schema Compliance**: 100%
- **Value Ranges**: All values within expected ranges
- **Logical Consistency**: No detected anomalies

See `DATA_QUALITY_STATUS.md` for detailed status and `DATA_VALIDATION_GUIDE.md` for validation process.

---

## Data Validation

### Validation Scripts

**Comprehensive Validation:**
```bash
python3 scripts/validate-data-quality.py
# Output: reports/validation-report.json
```

**Detect Problematic Conversations:**
```bash
python3 scripts/detect-problematic-conversations.py
# Output: docs/PROBLEMATIC_CONVERSATIONS_REPORT.json
```

**Check Classification Status:**
```bash
python3 scripts/process-wildchat-conversations.py
# Reports: total, classified, PAD coverage
```

### Validation Checks

1. **Schema Compliance**: Required fields present, correct types
2. **Value Ranges**: PAD scores [0,1], confidence [0,1], etc.
3. **Logical Consistency**: Role distributions sum to ~1.0, etc.
4. **Anomaly Detection**: Unusual patterns, outliers

See `DATA_VALIDATION_GUIDE.md` for detailed validation process.

---

## Data Sources

### Chatbot Arena (241 conversations)
- **Source**: LMSYS Chatbot Arena dataset (HuggingFace)
- **Characteristics**: Diverse interaction patterns (technical, casual, advisory)
- **Message counts**: 10-18 messages per conversation
- **Note**: Dataset bias toward information-seeking (83.1%) reflects evaluation context
- **Status**: Expanded from 128 to 241 conversations (Jan 2026, 128 in validated corpus)

### OpenAssistant (OASST) (32 conversations)
- **Source**: OpenAssistant dataset
- **Characteristics**: Longer conversations (20+ messages)
- **Purpose**: Testing pattern visibility in extended interactions
- **Status**: Expanded from 2 to 32 conversations (Jan 2026)

### WildChat-1M (371 valid of 589 downloaded)
- **Source**: [allenai/WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)
- **Characteristics**: 838k organic ChatGPT conversations in the wild
- **Purpose**: Cross-dataset validation to address Chatbot Arena bias
- **Status**: ✅ Classified and integrated (371 valid files, 402 corrupted)
- **See**: `WILDCHAT_INTEGRATION.md` for details

### Other Sources
- **Cornell Movie Dialogues**: 10 raw conversations available
- **Kaggle Empathetic Dialogues**: 10 raw conversations available
- **Sample Conversations**: 7 pre-written examples

See `CONVERSATION_DATA_SOURCES.md` for more dataset information.

---

## Data Processing Pipeline

1. **Download**: Conversations retrieved from datasets
2. **Classify**: GPT-5.2 analyzes each conversation using 9-dimension taxonomy (Social Role Theory)
3. **Generate PAD**: Calculate Pleasure-Arousal-Dominance scores per message
4. **Validate**: Run validation scripts to ensure quality
5. **Generate Terrain**: Create heightmap from classification seed
6. **Generate Path**: Calculate 3D path points from role distributions and PAD scores

---

## Current Status Summary

**Last Updated:** 2026-01-09

### Overall Statistics
- ✅ **476 conversations** classified (as of 2026-01-09, manifest updated)
- ✅ **345 conversations** in validated corpus (used for cluster analysis and published findings)
- ✅ **100% PAD coverage** - All messages have PAD scores
- ✅ **GPT-5.2 classification** - Social Role Theory taxonomy (6+6 roles)
- ✅ **Clustering complete** - 7 relational positioning archetypes identified (based on 345 validated corpus)
- ✅ **Manifest updated** - All 476 files now included

### Quality Metrics
- **Average Confidence**: 0.75-0.85 across dimensions
- **Schema Compliance**: 100%
- **Value Ranges**: All values within expected ranges
- **Logical Consistency**: No detected anomalies

### Validation Status
- **Validation Script:** ✅ Working
- **Critical Errors:** 0 ✅
- **Warnings:** ~90 (low PAD diversity, high confidence scores)
- **Info Items:** ~100 (anomalies detected)

---

## Related Documentation

- **Data Structure**: `DATA_STRUCTURE.md` - Detailed schema
- **Data Organization**: `DATA_ORGANIZATION.md` - Directory structure
- **Data Quality**: `DATA_QUALITY_STATUS.md` - Current status
- **Data Validation**: `DATA_VALIDATION_GUIDE.md` - Validation process
- **Classification**: `guides/CLASSIFICATION_AND_PAD_GUIDE.md` - How to classify
- **WildChat**: `WILDCHAT_INTEGRATION.md` - WildChat dataset integration
- **Reclassification**: `RECLASSIFICATION_GUIDE.md` - v1.2 reclassification guide
- **Archived Status Reports**: `archive/status/` - Historical status snapshots

