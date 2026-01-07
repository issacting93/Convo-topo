# Data Guide

**Complete guide** to data organization, structure, quality, and validation.

---

## Data Organization

### Directory Structure

```
public/output/              # Classified conversations (for app)
├── chatbot_arena_*.json   # 128 Chatbot Arena conversations
├── oasst-*.json           # 32 OpenAssistant conversations
└── wildchat-*.json        # 589 WildChat conversations (integration in progress)

output/                    # Working directory for classification
conversations-raw/         # Raw conversation data
```

### Current Dataset

- **Total Classified**: 379 conversations (as of 2026-01-XX)
  - **Chatbot Arena**: 128 conversations
  - **OpenAssistant (OASST)**: 32 conversations
  - **WildChat**: Additional conversations integrated
- **Average Messages**: ~10.7 messages per conversation
- **PAD Coverage**: 100% (all messages have PAD scores)

### Dataset Status

**Main Dataset (`public/output/`):**
- **Total Files:** 379+ conversations
- **Complete (classified + PAD):** 379 (100%) ✅
- **v1.2 Classifications:** 339 conversations (98.3%) ✅
- **With corrections applied:** 339 conversations (98.3%) ✅

**Reclassification Status:**
- **v1.2 Reclassification:** ✅ Complete (2026-01-XX)
- **Success Rate:** 98.6% (340 of 345 conversations)
- **New Taxonomy:** 10 human roles, 9 AI roles, 8 purposes
- **Post-Processing Corrections:** Applied to 339 conversations
- **Backup:** `public/output-backup-v1.1/` (original v1.1 classifications)

**WildChat Integration:**
- **Downloaded:** 589 conversations
- **Readable:** 187 files (JSON parses correctly)
- **Malformed:** 402 files (cannot be processed)
- **Status:** Classification and PAD generation in progress
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
    "model": "gpt-4",
    "provider": "openai",
    "timestamp": "2025-01-03T...",
    "promptVersion": "1.1.0"
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

### Chatbot Arena (128 conversations)
- **Source**: LMSYS Chatbot Arena dataset (HuggingFace)
- **Characteristics**: Diverse interaction patterns (technical, casual, advisory)
- **Message counts**: 10-18 messages per conversation
- **Note**: Dataset bias toward information-seeking (83.1%) reflects evaluation context

### OpenAssistant (OASST) (32 conversations)
- **Source**: OpenAssistant dataset
- **Characteristics**: Longer conversations (20+ messages)
- **Purpose**: Testing pattern visibility in extended interactions

### WildChat-1M (589 conversations downloaded)
- **Source**: [allenai/WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)
- **Characteristics**: 838k organic ChatGPT conversations in the wild
- **Purpose**: Cross-dataset validation to address Chatbot Arena bias
- **Status**: Downloaded, classification and PAD generation in progress
- **See**: `WILDCHAT_INTEGRATION.md` for details

### Other Sources
- **Cornell Movie Dialogues**: 10 raw conversations available
- **Kaggle Empathetic Dialogues**: 10 raw conversations available
- **Sample Conversations**: 7 pre-written examples

See `CONVERSATION_DATA_SOURCES.md` for more dataset information.

---

## Data Processing Pipeline

1. **Download**: Conversations retrieved from datasets
2. **Classify**: GPT-4o-mini analyzes each conversation using 9-dimension taxonomy
3. **Generate PAD**: Calculate Pleasure-Arousal-Dominance scores per message
4. **Validate**: Run validation scripts to ensure quality
5. **Generate Terrain**: Create heightmap from classification seed
6. **Generate Path**: Calculate 3D path points from role distributions and PAD scores

---

## Current Status Summary

**Last Updated:** 2026-01-XX

### Overall Statistics
- ✅ **379 conversations** fully classified and processed
- ✅ **100% PAD coverage** - All messages have PAD scores
- ✅ **98.3% v1.2 classifications** - Enhanced taxonomy with corrections
- ✅ **Clustering complete** - 7 relational positioning archetypes identified

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

