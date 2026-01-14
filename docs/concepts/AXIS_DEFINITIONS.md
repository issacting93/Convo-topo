# Axis Definitions: X, Y, Z

**Status:** Standardized and verified  
**Last Updated:** 2026-01-XX

---

## X-Axis: Functional ↔ Social

**Definition:** Represents the conversation's orientation (task-oriented vs. relationship-focused)

**Calculation:**
- **Primary:** Linguistic marker analysis (`calculateFunctionalSocialScore`)
- **Fallback:** Role-based positioning (challenger=0.1, seeker=0.4, collaborator=0.7, sharer=0.95)

**Theoretical Framework:** Watzlawick's content/relationship distinction

**Range:** 0.0 (Functional) ↔ 1.0 (Social)

---

## Y-Axis: Aligned ↔ Divergent (Linguistic Alignment)

**Definition:** Represents the similarity of linguistic styles between human and AI

**Calculation:**
- **Primary:** Linguistic alignment analysis (`calculateConversationAlignment`)
  - Compares 7 linguistic features: formality, politeness, certainty, structure, question-asking, inclusive language, register
  - Uses cosine similarity between human and AI feature vectors
  - Returns `1 - similarity` (0 = aligned, 1 = divergent)
- **Fallback:** Role-based positioning (expert=0.85, advisor=0.90, peer=0.15, facilitator=0.25)

**Theoretical Framework:** Communication Accommodation Theory

**Range:** 0.0 (Aligned) ↔ 1.0 (Divergent)

**Note:** "Structured ↔ Emergent" is a fallback calculation method, not a separate definition.

---

## Z-Axis: Emotional Intensity

**Definition:** Represents the emotional intensity of each message, directly mapped from the PAD model

**Calculation:**
- **Per-message:** `emotionalIntensity = (1 - pleasure) × 0.6 + arousal × 0.4`
- **Visualization:** `worldY = point.pad.emotionalIntensity × terrainHeight`
- **High intensity** (frustration/agitation) = peaks
- **Low intensity** (calm/affiliation) = valleys

**Theoretical Framework:** PAD Model (Pleasure-Arousal-Dominance)

**Range:** 0.0 (Low intensity) ↔ 1.0 (High intensity)

---

## Verification

✅ **Data matches encoding claims** - See `DATA_ENCODING_VERIFICATION.md`  
✅ **Axes are coherent** - Historical analysis archived in `archive/axis-definitions/XYZ_AXES_COHERENCE_ANALYSIS.md`  
✅ **Z-axis is semantically meaningful** - Historical analysis archived in `archive/axis-definitions/Z_AXIS_SEMANTIC_ANALYSIS.md`  
✅ **Y-axis standardized** - Historical analysis archived in `archive/axis-definitions/Y_AXIS_STANDARDIZATION.md`

---

## Related Documentation

- `DATA_ENCODING_VERIFICATION.md` - Verification that data matches encoding
- `archive/axis-definitions/` - Historical axis analysis documents (archived 2026-01-XX)
