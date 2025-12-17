# Why Two Output Directories?

## The Two Directories

1. **`output/`** - Source directory (where classifier saves files)
2. **`public/output/`** - Web-accessible directory (where app reads files)

---

## Why This Setup?

### **`output/` - Source Directory**
- **Purpose**: Where the Python classifier saves classified conversations
- **Git status**: **Ignored** (not committed to git) - see `.gitignore`
- **Why ignored**: Contains generated data that can be recreated
- **Location**: Root of project

### **`public/output/` - Web Directory**
- **Purpose**: Where the web app can access files via HTTP
- **Git status**: **Committed** (included in git)
- **Why needed**: Vite (the build tool) serves files from `public/` at the root URL
- **Location**: `public/output/`
- **URL**: Files are accessible at `/output/conv-*.json` in the browser

---

## How It Works

### **Step 1: Classifier Writes to `output/`**
```bash
python3 classifier-openai.py conversations.json output.json --limit 20 --individual
```
This creates files in `output/`:
```
output/
  conv-0.json
  conv-1.json
  ...
```

### **Step 2: Sync to `public/output/`**
```bash
./sync-output-to-public.sh
```
This copies files to `public/output/`:
```
public/output/
  conv-0.json  (copy of output/conv-0.json)
  conv-1.json  (copy of output/conv-1.json)
  ...
```

### **Step 3: Web App Reads from `public/output/`**
The app fetches files via HTTP:
```typescript
fetch('/output/conv-0.json')  // Vite serves from public/output/conv-0.json
```

---

## Why Not Just One Directory?

### **Option 1: Only `output/` (Current Source)**
❌ **Problem**: Vite doesn't serve files from arbitrary directories
- Vite only serves files from `public/` directory
- Files in `output/` wouldn't be accessible to the web app

### **Option 2: Only `public/output/`**
❌ **Problem**: Would commit generated data to git
- Classified conversations are generated data
- Should be gitignored (can be recreated)
- But `public/` files are typically committed

### **Option 3: Current Setup (Both)**
✅ **Solution**: Best of both worlds
- `output/` is gitignored (source of truth, not committed)
- `public/output/` is committed (web-accessible, can be shared)
- Clear separation of concerns

---

## The Sync Process

There's a sync script (`sync-output-to-public.sh`) that copies files:

```bash
#!/bin/bash
# Copy all JSON files from output/ to public/output/
cp output/*.json public/output/
```

**When to run:**
- After running the classifier
- When you want to update the web app with new conversations

---

## Current Status

✅ **Both directories are in sync** (22 files in each)
- `output/` has 22 files (source)
- `public/output/` has 22 files (web-accessible)

---

## Could We Simplify?

### **Option A: Auto-sync on Classifier Run**
We could modify the classifier to also write to `public/output/`:
```python
# In classifier-openai.py
if save_individual and output_dir:
    # Write to output/
    output_file = output_dir / f"{safe_id}.json"
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    # Also write to public/output/
    public_file = Path("public/output") / f"{safe_id}.json"
    public_file.parent.mkdir(parents=True, exist_ok=True)
    with open(public_file, 'w') as f:
        json.dump(result, f, indent=2)
```

### **Option B: Use a Build Step**
We could add a build step that syncs automatically:
```json
// package.json
{
  "scripts": {
    "sync-output": "./sync-output-to-public.sh",
    "dev": "npm run sync-output && vite",
    "build": "npm run sync-output && vite build"
  }
}
```

### **Option C: Keep Current Setup**
✅ **Current approach is fine** - just need to remember to sync manually

---

## Summary

| Directory | Purpose | Git Status | Served by Vite? |
|-----------|---------|------------|-----------------|
| `output/` | Source (classifier writes here) | ❌ Ignored | ❌ No |
| `public/output/` | Web-accessible (app reads here) | ✅ Committed | ✅ Yes |

**Why two?**
- `output/` = source of truth (gitignored, generated data)
- `public/output/` = web-accessible (committed, served by Vite)
- Need to sync manually (or use sync script)

**Current status:** ✅ Both are in sync (22 files each)

---

## Quick Reference

**To sync after running classifier:**
```bash
./sync-output-to-public.sh
```

**Or manually:**
```bash
cp output/*.json public/output/
```

