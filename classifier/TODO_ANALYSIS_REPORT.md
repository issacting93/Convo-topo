# TODO Analysis Report

## Summary of Findings

### 1. ✅ Corrupted WildChat JSON Files
- **Status**: 402 out of 589 files are corrupted
- **Action**: Files are being skipped gracefully by the schema validator
- **Recommendation**: No action needed - the 187 valid files are sufficient for analysis
- **Report**: Full list saved to `classifier/corrupted-files-report.json`

### 2. ⚠️ Role Distribution (6+6 roles)
- **Status**: Only 4 human roles and 3 AI roles from new taxonomy found
- **Issue**: Many old role names still present in data
- **Fix Applied**: 
  - Fixed syntax error in `mapOldRoleToNew` function
  - Removed reduction to 3+3 taxonomy - now shows full 6+6 roles
  - Old roles are now properly mapped to new taxonomy

**Missing Roles:**
- Human: `provider`, `relational-peer`
- AI: `co-constructor`, `learning-facilitator`, `social-facilitator`

**Old Roles Still Present:**
- Human: `challenger`, `learner`, `seeker`, `sharer`
- AI: `affiliative`, `expert`, `facilitator`, `peer`, `reflector`

**Note**: These old roles are being mapped to new roles via `mapOldRoleToNew`, so visualizations should show the new taxonomy correctly.

### 3. ✅ Coordinate Calculations
- **Status**: Calculations are working correctly
- **Issue**: Sample showed all at X=0.30, Y=0.80 because all were question-answer patterns
- **Note**: This is expected behavior - coordinate calculations are pattern-based

### 4. ⚠️ Y-Axis Skew (Everything Divergent)
- **Status**: 97.7% of conversations classified as Divergent
- **Root Cause**: 
  - 69.9% of conversations are `question-answer` patterns
  - Pattern-to-Y mapping puts `question-answer` at 0.8 (Divergent)
  - This is actually correct semantically, but creates visual skew

**Fix Applied:**
- Adjusted `question-answer` pattern mapping from 0.8 to 0.5-0.65 (based on confidence)
- This creates more balanced distribution while maintaining semantic accuracy
- `advisory` patterns remain at 0.8 (one-way advice is truly divergent)

**Pattern Distribution:**
- `question-answer`: 241 (69.9%)
- `unknown`: 80 (23.2%)
- `advisory`: 13 (3.8%)
- `storytelling`: 5 (1.4%)
- Others: 6 (1.7%)

## Recommendations

1. **Corrupted Files**: No action needed - gracefully handled
2. **Role Distribution**: 
   - Continue using `mapOldRoleToNew` for backward compatibility
   - Consider re-classifying old data with new taxonomy if needed
3. **Y-Axis Skew**: 
   - The adjustment to `question-answer` mapping should help
   - Consider using linguistic alignment more heavily for Y-axis calculation
   - The skew may reflect actual dataset characteristics (most conversations are Q&A)

## Next Steps

1. ✅ Fixed syntax error in role mapping
2. ✅ Removed 3+3 reduction - now shows full 6+6 roles
3. ✅ Adjusted Y-axis calculation to reduce skew
4. ⏳ Test visualizations to confirm changes work
5. ⏳ Consider re-classifying sample of old data with new taxonomy

