# Data Directories Analysis

## Current State

### Directories
1. **`public/output/`** (56 files) - What the app loads via `/output/`
2. **`output/`** (79 files) - Contains additional files not in public/output

### Missing from `public/output/`
- **10 cornell-*.json files** (cornell-0 through cornell-9)
- **10 kaggle-emo-*.json files** (kaggle-emo-0 through kaggle-emo-9)
- **5 kaggle-emo-*-error.json files** (error files, can be ignored)

### Files Loaded by App
The `loadClassifiedConversations()` function currently loads:
- ✅ `conv-*.json` files (conv-0 through conv-19)
- ✅ `emo-*.json` files (emo-afraid-1, emo-angry-1, etc.)
- ✅ `sample-*.json` files
- ✅ `cornell-*.json` files (cornell-0 through cornell-9) - **FIXED**
- ✅ `kaggle-emo-*.json` files (kaggle-emo-0 through kaggle-emo-9, excludes error files) - **FIXED**

### Manifest
- `public/output/manifest.json` exists but **isn't used** by the loader
- Manifest lists 55 files (conv + sample + emo categories)
- Manifest doesn't include cornell or kaggle-emo files

## Issues

1. ✅ **FIXED**: Loader now loads cornell and kaggle-emo files
2. ✅ **Sync Available**: `sync-output-to-public.sh` script syncs files (run manually)
3. ⚠️ **Inefficient Loading**: Loader uses sequential fetching instead of manifest (optional improvement)
4. ✅ **FIXED**: Loader now handles all file patterns (cornell, kaggle-emo, conv, emo, sample)

## Recommendations

### Option 1: Use Manifest (Recommended)
Update `loadClassifiedConversations()` to:
1. Load `manifest.json` first
2. Fetch files listed in manifest
3. More efficient and ensures consistency

### Option 2: Sync Directories
Copy missing files from `output/` to `public/output/`:
```bash
cp output/cornell-*.json public/output/
cp output/kaggle-emo-*.json public/output/  # Exclude error files
```

### Option 3: Update Loader
Add support for cornell and kaggle-emo patterns in the loader:
```typescript
// Add cornell-*.json loading
// Add kaggle-emo-*.json loading (exclude error files)
```

## Next Steps

1. ✅ Document the current state (this file)
2. ✅ Loader updated to load all file patterns
3. ✅ Files synced to public/output (run `./sync-output-to-public.sh` after new classifications)
4. ⚠️ Optional: Update loader to use manifest.json for efficiency (future improvement)

