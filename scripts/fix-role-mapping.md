# Fix Role Mapping - Action Plan

## Problem
The `mapOldRoleToNew()` function in `conversationToTerrain.ts` doesn't handle all the role names found in the data, causing unmapped roles to pass through unchanged.

## Unmapped Roles Found

### Human Roles
- `co-construct`, `co-constructive`, `co-constructer` → Should map to `collaborator` (typos of co-constructor)
- `artist` → Map to `social-expressor` (creative expression)
- `philosophical-explorer` → Map to `collaborator` or `social-expressor` (exploratory)
- `teacher-evaluator` → Map to `director` (evaluative, high authority)
- `tester` → Map to `director` (testing, evaluative)
- `story-builder` → Map to `social-expressor` (narrative, expressive)
- `meta-commentator` → Map to `collaborator` (reflective, equal authority)
- `social-explorer` → Map to `social-expressor` (social, exploratory)

### AI Roles
- `learner` → Map to `co-constructor` (equal partnership)
- `creative-partner` → Map to `co-constructor` (collaborative creativity)
- `unable-to-engage` → Keep as-is or map to special category (breakdown)
- `content-provider` → Map to `expert-system` (provides information)
- `meta-commentator` → Map to `social-facilitator` (reflective)

## Proposed Mapping Updates

```typescript
// Add to humanMap:
'co-construct': 'collaborator',  // Typo
'co-constructive': 'collaborator',  // Typo
'co-constructer': 'collaborator',  // Typo
'artist': 'social-expressor',
'philosophical-explorer': 'social-expressor',
'teacher-evaluator': 'director',
'tester': 'director',
'story-builder': 'social-expressor',
'meta-commentator': 'collaborator',
'social-explorer': 'social-expressor',

// Add to aiMap:
'learner': 'co-constructor',
'creative-partner': 'co-constructor',
'unable-to-engage': 'unable-to-engage',  // Keep as-is (special case)
'content-provider': 'expert-system',
'meta-commentator': 'social-facilitator',
```

## Further Issue: 6+6 vs 3+3 Taxonomy

The current mapping produces 6+6 roles, but documentation and validation assumes 3+3.

**Current output after mapping:**
- Human: information-seeker, provider, director, collaborator, social-expressor, relational-peer (6)
- AI: expert-system, learning-facilitator, advisor, co-constructor, social-facilitator, relational-peer (6)

**Reduced taxonomy (3+3):**
- Human: information-seeker, co-constructor, social-expressor (3)
- AI: expert-system, facilitator, relational-peer (3)

**Recommendation:** Apply BOTH mappings:
1. Old names → Full taxonomy (6+6)
2. Full taxonomy → Reduced taxonomy (3+3)

This gives us:
- Consistent naming (no typos)
- Consolidated roles (better statistical power)
- Matches documentation

## Implementation

### Option A: Update conversationToTerrain.ts (Quick Fix)
```typescript
export function mapOldRoleToNew(role: string, roleType: 'human' | 'ai'): string {
  // ... existing code with additions ...
}

export function mapToReducedTaxonomy(role: string, roleType: 'human' | 'ai'): string {
  if (roleType === 'human') {
    const reducedMap = {
      'information-seeker': 'information-seeker',
      'provider': 'information-seeker',
      'director': 'information-seeker',
      'collaborator': 'co-constructor',
      'social-expressor': 'social-expressor',
      'relational-peer': 'social-expressor',
    };
    return reducedMap[role] || role;
  } else {
    const reducedMap = {
      'expert-system': 'expert-system',
      'advisor': 'expert-system',
      'learning-facilitator': 'facilitator',
      'social-facilitator': 'facilitator',
      'co-constructor': 'facilitator',
      'relational-peer': 'relational-peer',
    };
    return reducedMap[role] || role;
  }
}
```

### Option B: Reclassify all conversations (Proper Fix)
- Run classification script again with updated taxonomy
- Ensures consistent role assignments from source
- More time-consuming but cleaner

## Recommendation

**Quick win:** Option A - Update mapping in frontend
1. Add missing role mappings
2. Apply reduced taxonomy mapping
3. Visualizations immediately show correct 3+3 roles

**Follow-up:** Fix corrupted WildChat files and reclassify if needed

## Next Step

Update `src/utils/conversationToTerrain.ts` with comprehensive mapping.
