# File Consolidation Plan

**Date:** 2025-01-19  
**Goal:** Clean up and consolidate data files for better organization

---

## Files to Consolidate

### 1. Taxonomy Files ✅
- **taxonomy.json** - Current active file (keep)
- **taxonomy-v1.1.json** - Duplicate of taxonomy.json (archive)
- **taxonomy-v1.0.json.backup** - Old backup (archive)

**Action:** Archive old versions, keep only taxonomy.json

### 2. Large Data Files
- **personaChatMessages.json** (711KB) - Alternative data source
- **personaChatMessages.ts** - Loader for above

**Action:** Move to archive or keep if actively used (currently alternative source)

### 3. Messages File
- **messages.ts** - Core type definitions (keep - defines Message interface)

### 4. Documentation Files
- **exampleClassificationOutput.json** - Example file (keep in docs/examples/)

---

## Actions

1. ✅ Create archive directory structure
2. ✅ Archive old taxonomy versions
3. ✅ Verify taxonomy.json is the only one referenced
4. ⏳ Review personaChatMessages usage (alternative source - keep for now)
5. ✅ Move exampleClassificationOutput.json to docs/examples/
6. ✅ Create manifest file for better file discovery

---

## Archive Structure

```
docs/archive/
├── taxonomy-versions/
│   ├── taxonomy-v1.1.json
│   └── taxonomy-v1.0.json.backup
└── README.md (explains archived files)
```

