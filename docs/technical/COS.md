# Cartography Operating System (COS)

**The "OS" for Conversation Analysis.**

The Cartography Operating System (COS) is the architectural philosophy that separates this project into three distinct, loosely coupled layers. This separation allows the analytic logic (the "Engine") to be used independently of the visualization (the "App").

---

## 🏗 High-Level Architecture

```mermaid
graph TD
    subgraph "Layer 1: Data (Schema)"
        RawJSON[Raw JSON] --> Schema[Conversation Schema]
        Schema --> Taxonomy[Taxonomy (Tags & Dimensions)]
    end

    subgraph "Layer 2: Logic (Engine)"
        Schema --> PAD[PAD Engine]
        Schema --> Linguistics[Linguistic Engine]
        Schema --> Trajectory[Trajectory Engine]
        PAD --> Scores[Emotional Scores]
        Linguistics --> Features[Style Features]
    end

    subgraph "Layer 3: View (Application)"
        Scores --> FlightRecorder[Flight Recorder UI]
        Features --> Terrain[Terrain View (3D)]
        Trajectory --> Seismograph[Seismograph View]
    end
```

---

## Layer 1: The Data Layer
**"The Source of Truth"**

*   **Conversation Schema** (`src/schemas/conversationSchema.ts`):
    *   A Zod-validated strict structure for conversations.
    *   Ensures massive JSON dumps are normalized before touching any logic.
*   **Taxonomy** (`src/utils/taxonomy.ts`):
    *   A definitions file for every label (e.g., "Seeker", "Expert", "Collaborative").
    *   Provides the "Vocabulary" of the OS.

## Layer 2: The Logic Layer (The Engine)
**"Pure Functional Analysis"**

This layer is **headless** and **dependency-free**. It takes Data as input and outputs Metrics.

*   **P.A.D. Engine** (`src/utils/pad.ts`):
    *   Calculates Pleasure, Arousal, and Dominance for every message.
    *   *Input:* String -> *Output:* { p: 0.5, a: 0.8, d: 0.2 }
*   **Linguistics Engine** (`src/utils/linguisticMarkers.ts`):
    *   Detects 7 dimensions of style (Politeness, Formality, etc.) using regex.
    *   *Input:* Messages[] -> *Output:* { formality: 0.8, politeness: 0.2 }
*   **Spike Detector** (`src/utils/spikeDetection.ts`):
    *   Finds sudden anomalies in time-series data.
    *   *Input:* number[] -> *Output:* Spikes[]

## Layer 3: The View Layer (The App)
**"Visualizing the Invisible"**

This layer consumes metrics and renders them. It DOES NOT calculate metrics locally if possible.

*   **Flight Recorder**:
    *   Visualizes `Spikes` and `PAD` scores as a timeline.
*   **Terrain View**:
    *   Visualizes `Linguistic Features` as 3D Coordinates (X/Y/Z).
*   **Drift View**:
    *   Visualizes `Trajectory` status over time.

---

## Design Principles

1.  **Headless First**: Any metric must be calculable in a CLI without React.
2.  **Schema Driven**: If it's not in the Schema, it doesn't exist.
3.  **Taxonomy Defined**: Labels are not hardcoded strings; they are references to the Taxonomy.
