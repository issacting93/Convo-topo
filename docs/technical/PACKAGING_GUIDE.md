# Packaging Guide: Conversation Engine

This guide explains how to reuse the **Conversation Analysis SDK** in other projects (e.g., a CLI tool, a VS Code extension, or a backend service).

## The Core Files
The "Engine" consists of these specific files which are now **dependency-free** (mostly pure TypeScript).

| Component | File | Dependencies |
|-----------|------|--------------|
| **SDK Entry** | `src/conversation-engine.ts` | All below |
| **PAD Engine** | `src/utils/pad.ts` | None |
| **Linguistics** | `src/utils/linguisticMarkers.ts` | None |
| **Spikes** | `src/utils/spikeDetection.ts` | None |
| **Trajectory** | `src/utils/trajectoryStatus.ts` | None |
| **Coordinates** | `src/utils/coordinates.ts` | Schema, Linguistics |
| **Taxonomy** | `src/utils/taxonomy.ts` | `src/data/taxonomy.json` |
| **Schema** | `src/schemas/conversationSchema.ts` | `zod` |

---

## Strategy A: The "Copy-Paste" (Easiest)

If you just want the logic in another app:

1.  Copy the `src/utils` folder (specifically the files listed above).
2.  Copy `src/schemas/conversationSchema.ts`.
3.  Copy `src/data/taxonomy.json`.
4.  Install `zod`:
    ```bash
    npm install zod
    ```
5.  **Done.** You can now import anything using the logic.

---

## Strategy B: The "Local Library" (Monorepo)

If you want to maintain it as a shared library:

1.  Create a new folder: `packages/conversation-engine`.
2.  Initialize a `package.json`:
    ```json
    {
      "name": "@antigravity/conversation-engine",
      "version": "1.0.0",
      "main": "dist/index.js",
      "types": "dist/index.d.ts",
      "peerDependencies": {
        "zod": "^3.0.0"
      }
    }
    ```
3.  Move the **Core Files** into this package.
4.  Set `src/conversation-engine.ts` as the `index.ts`.
5.  Use it in your app:
    ```javascript
    import { calculatePAD } from '@antigravity/conversation-engine';
    ```

---

## Strategy C: The "Git Submodule" (Shared Repo)

If you want to keep this repo as the source of truth but use it elsewhere:

1.  In your other project:
    ```bash
    git submodule add git@github.com:your-repo/cartography.git lib/cartography
    ```
2.  Configure your `tsconfig.json` to map the path:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "@engine/*": ["./lib/cartography/src/*"]
        }
      }
    }
    ```
3.  Import directly:
    ```javascript
    import { calculatePAD } from '@engine/conversation-engine';
    ```

## Example Usage

```typescript
import { calculatePAD, detectSpikes } from './conversation-engine';

// 1. Analyze a raw string
const scores = calculatePAD("I apologize, I made a mistake.");
console.log(scores.emotionalIntensity); // 0.74 (High Friction)

// 2. Detect Spikes in a sequence
const history = [0.1, 0.2, 0.8, 0.2];
const spikes = detectSpikes(history);
console.log(spikes[0].messageIndex); // 2
```
