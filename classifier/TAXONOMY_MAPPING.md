# Taxonomy Mapping: Current → Social Role Theory-Based

## Quick Reference: Role Mappings

### Current Taxonomy → Proposed Social Role Theory Taxonomy

#### Human Roles

| Current (Reduced v1.0) | Proposed (Social Role Theory) | Instrumental/Expressive | Notes |
|----------------------|------------------------------|----------------------|-------|
| `information-seeker` | `information-seeker` | **Instrumental** | Same - task-oriented information seeking |
| `social-expressor` | `social-expressor` | **Expressive** | Same - relationship-oriented expression |
| `co-constructor` | `collaborator` | **Instrumental** | Renamed for clarity, same concept |

**New roles added:**
- `provider` (Instrumental, Low Authority) - Seeks information from AI
- `director` (Instrumental, High Authority) - Commands, controls task
- `relational-peer` (Expressive, Equal) - Casual peer conversation

#### AI Roles

| Current (Reduced v1.0) | Proposed (Social Role Theory) | Instrumental/Expressive | Notes |
|----------------------|------------------------------|----------------------|-------|
| `facilitator` | **Split into two:** | | **KEY CHANGE** |
| | → `learning-facilitator` | **Instrumental** | Scaffolds learning, guides discovery |
| | → `social-facilitator` | **Expressive** | Maintains conversation, builds rapport |
| `expert-system` | `expert-system` | **Instrumental** | Same - provides direct answers |
| `relational-peer` | `relational-peer` | **Expressive** | Same - casual peer conversation |

**New roles added:**
- `advisor` (Instrumental, High Authority) - Prescribes actions, gives recommendations
- `co-constructor` (Instrumental, Equal) - Joint problem-solving with user

---

## The Key Fix: Facilitator Split

### Problem Identified in Reviews

**Current taxonomy:**
- `facilitator` = "An AI stance focused on supporting the user's process—structuring thinking, prompting reflection, and maintaining conversational flow"

**Issue:** This conflates:
- **Learning facilitation** (instrumental, task-oriented)
- **Social facilitation** (expressive, relationship-oriented)

**Evidence from reviews:**
- Casual chat conversations classified as "facilitator"
- But they're actually social bonding, not learning scaffolding

### Solution: Split into Two Roles

**Learning-Facilitator (Instrumental):**
- **Goal:** Help user discover/learn something
- **Method:** Structured questions, scaffolding understanding
- **Context:** Educational, problem-solving
- **Signals:** "What do you think would happen if...?", "Let's explore...", Socratic method
- **Terrain Position:** X ~0.3 (functional), Y ~0.8 (emergent)

**Social-Facilitator (Expressive):**
- **Goal:** Keep conversation going, build rapport
- **Method:** Casual questions, validation, interest
- **Context:** Relationship-building, casual chat
- **Signals:** "How are you?", "That's interesting!", "What do you do?"
- **Terrain Position:** X ~0.8 (social), Y ~0.7 (emergent)

---

## Terrain Position Mappings

### X-Axis: Functional ↔ Social (Instrumental ↔ Expressive)

| Role | Current X | Proposed X | Change |
|------|-----------|------------|--------|
| `information-seeker` | 0.4 | 0.3 | Slightly more functional |
| `provider` | - | 0.2 | New role, functional |
| `director` | - | 0.1 | New role, very functional |
| `collaborator` | 0.7 | 0.4 | More functional (task-oriented) |
| `social-expressor` | 0.95 | 0.95 | Same, very social |
| `relational-peer` | - | 0.85 | New role, social |
| `expert-system` | 0.1 | 0.1 | Same, very functional |
| `learning-facilitator` | 0.7 | 0.3 | **Major change** - now functional (was social) |
| `social-facilitator` | - | 0.8 | New role, social |
| `advisor` | - | 0.2 | New role, functional |
| `co-constructor` | - | 0.4 | New role, functional |
| `relational-peer` (AI) | 0.95 | 0.85 | Slightly less social |

### Y-Axis: Structured ↔ Emergent (Authority Level)

| Role | Current Y | Proposed Y | Change |
|------|-----------|------------|--------|
| `expert-system` | 0.1 | 0.1 | Same, high authority |
| `advisor` | - | 0.2 | New role, high authority |
| `learning-facilitator` | 0.7 | 0.8 | Slightly more emergent |
| `social-facilitator` | - | 0.7 | New role, emergent |
| `co-constructor` | - | 0.5 | New role, equal authority |
| `relational-peer` (AI) | 0.95 | 0.6 | More balanced (was very emergent) |

---

## Example Classifications

### Example 1: Casual Chat (Currently Misclassified)

**Conversation:**
- User: "hi ! i work as a gourmet cook ."
- AI: "cool , i'm currently studying and enjoy going fishing in my spare time ."

**Current Classification:**
- AI Role: `facilitator` (0.8 confidence) ❌

**Proposed Classification:**
- AI Role: `social-facilitator` (0.7) or `relational-peer` (0.3) ✅
- **Reason:** Expressive role, relationship-building, not task-oriented

### Example 2: Learning Scaffolding (Currently Correct)

**Conversation:**
- User: "How do I learn Python?"
- AI: "What programming experience do you have? Let's start there and build up."

**Current Classification:**
- AI Role: `facilitator` (0.8 confidence) ✅

**Proposed Classification:**
- AI Role: `learning-facilitator` (0.8) ✅
- **Reason:** Instrumental role, scaffolds learning, task-oriented

### Example 3: Direct Information (Currently Correct)

**Conversation:**
- User: "What is Python?"
- AI: "Python is a high-level programming language known for its simplicity..."

**Current Classification:**
- AI Role: `expert-system` (0.9 confidence) ✅

**Proposed Classification:**
- AI Role: `expert-system` (0.9) ✅
- **Reason:** Instrumental, high authority, direct answers

---

## Migration Strategy

### Option 1: Gradual Migration

1. **Add new roles** alongside old ones
2. **Classify with both** taxonomies
3. **Compare results** to validate
4. **Switch over** once validated

### Option 2: Direct Replacement

1. **Update taxonomy** definition
2. **Update classifier prompt** with social role theory framework
3. **Reclassify sample** (20-30 conversations)
4. **Validate** against manual reviews
5. **Full reclassification** if successful

### Option 3: Hybrid Approach

1. **Keep current taxonomy** for existing data
2. **Use new taxonomy** for new classifications
3. **Create mapping** between old and new
4. **Gradually migrate** as needed

---

## Benefits Summary

✅ **Solves classification problem:** Distinguishes learning vs social facilitation  
✅ **Theoretically grounded:** Based on established social role theory  
✅ **Maps to terrain:** Instrumental/Expressive aligns with Functional/Social axis  
✅ **Clearer definitions:** Each role has distinct purpose and signals  
✅ **Better few-shot examples:** Can show clear distinctions  
✅ **Addresses review findings:** Casual chat won't be misclassified as learning facilitator

---

## Next Steps

1. **Review this mapping** - Does it make sense?
2. **Decide on role count** - 6+6 or 4+4 roles?
3. **Create updated taxonomy.json** with new definitions
4. **Update classifier prompt** with social role theory framework
5. **Test on sample conversations** (especially the misclassified ones)
6. **Validate against manual reviews**

