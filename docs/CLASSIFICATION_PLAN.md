# Classification Plan for Additional Data

**Date:** January 2026  
**Status:** Ready to execute

---

## Overview

This document outlines the plan for classifying:
1. **200-500 additional Chatbot Arena conversations** (human-AI)
2. **20 human-human conversations** (Cornell + Kaggle)

---

## Human-Human Dialogues (20 conversations)

### Files to Classify

**Cornell Movie Dialogues (10):**
- `conversations-raw/cornell-0.json` through `cornell-9.json`

**Kaggle Empathetic Dialogues (10):**
- `conversations-raw/kaggle-emo-0.json` through `kaggle-emo-9.json`

### Classifier

**Script:** `classifier/classifier-openai-human-human.py`  
**Model:** GPT-5.2  
**Taxonomy:** Adapted Social Role Theory for human-human (symmetric roles)

**Key Differences from Human-AI Classifier:**
- Both participants can take on any role (symmetric)
- Roles: Information-Seeker, Information-Provider, Director, Collaborator, Social-Expressor, Relational-Peer
- Participant 1 and Participant 2 each get role distributions
- Power dynamics: participant1-dominant, balanced, participant2-dominant

### Command

```bash
# Classify individual files
python3 classifier/classifier-openai-human-human.py \
    conversations-raw/cornell-0.json \
    output/cornell-0.json \
    --model gpt-5.2 \
    --individual \
    --output-dir public/output
```

### Expected Output

- 20 classified conversations in `public/output/`
- Each with `classification` field using human-human taxonomy
- Metadata: `"conversationType": "human-human"`

---

## Additional Chatbot Arena Conversations (200-500)

### Selection Strategy

**Priority:** Select diverse conversations to expand dataset
- Different interaction patterns
- Various conversation lengths
- Mix of topics

**Current Status:**
- 345 conversations already classified
- ~2,000 additional Chatbot Arena conversations available
- Will classify 200-500 to expand dataset

### Classifier

**Script:** `classifier/classifier-openai-social-role-theory.py` (existing)  
**Model:** GPT-5.2  
**Taxonomy:** Social Role Theory (12 roles: 6 human + 6 AI)

### Command

```bash
# Use existing classifier
python3 classifier/classifier-openai-social-role-theory.py \
    conversations-raw/chatbot_arena_1781.json \
    output/chatbot_arena_1781.json \
    --model gpt-5.2 \
    --individual \
    --output-dir public/output
```

### Batch Processing

**Script:** `scripts/classify-additional-data.sh`

This script will:
1. Find unclassified Chatbot Arena conversations
2. Limit to 500 (or specified number)
3. Classify them using existing human-AI classifier
4. Save to `public/output/`

---

## Execution Plan

### Phase 1: Human-Human Dialogues (Quick - 20 conversations)

**Time:** ~10-15 minutes  
**Cost:** ~$0.20-1.00 (20 conversations × $0.01-0.05)

1. Test classifier on 1-2 conversations
2. Verify output format
3. Classify all 20 conversations
4. Validate results

### Phase 2: Chatbot Arena Expansion (Moderate - 200-500 conversations)

**Time:** ~2-4 hours (with rate limiting)  
**Cost:** ~$2-25 (200-500 conversations × $0.01-0.05)

1. Start with 200 conversations (validate)
2. Review sample classifications
3. Continue with remaining 300 if quality is good
4. Monitor API costs

---

## Quality Checks

### After Human-Human Classification

- [ ] All 20 conversations classified successfully
- [ ] Role distributions sum to 1.0
- [ ] Participant 1 and Participant 2 roles are distinct
- [ ] Classification makes sense for human-human dialogue

### After Chatbot Arena Classification

- [ ] Sample review: 10-20 conversations
- [ ] Check for classification errors
- [ ] Verify role distributions
- [ ] Ensure consistency with existing 345 conversations

---

## Output Structure

### Human-Human Conversations

```json
{
  "id": "cornell-0",
  "messages": [...],
  "classification": {
    "interactionPattern": {...},
    "powerDynamics": {...},
    "participant1Role": {
      "distribution": {
        "information-seeker": 0.6,
        "information-provider": 0.2,
        ...
      }
    },
    "participant2Role": {
      "distribution": {...}
    },
    ...
  },
  "classificationMetadata": {
    "conversationType": "human-human",
    "model": "gpt-5.2",
    ...
  }
}
```

### Chatbot Arena Conversations

```json
{
  "id": "chatbot_arena_1781",
  "messages": [...],
  "classification": {
    "interactionPattern": {...},
    "powerDynamics": {...},
    "humanRole": {
      "distribution": {
        "information-seeker": 0.6,
        ...
      }
    },
    "aiRole": {
      "distribution": {
        "expert-system": 0.7,
        ...
      }
    },
    ...
  },
  "classificationMetadata": {
    "conversationType": "human-ai",
    "model": "gpt-5.2",
    ...
  }
}
```

---

## Next Steps

1. **Review human-human classifier** - Ensure it's correct
2. **Test on 1-2 conversations** - Verify output
3. **Classify all 20 human-human** - Complete Phase 1
4. **Start Chatbot Arena classification** - Begin with 200
5. **Monitor and validate** - Check quality as we go
6. **Expand if needed** - Continue to 500 if quality is good

---

## Notes

- **Rate Limiting:** Scripts include sleep delays to avoid API rate limits
- **Error Handling:** Failed classifications are logged but don't stop the process
- **Cost Monitoring:** Track API costs as we classify
- **Validation:** Review samples before full classification

See `docs/AVAILABLE_DATA_FOR_CLASSIFICATION.md` for more details on available data.

