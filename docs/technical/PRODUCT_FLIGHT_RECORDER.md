# Product Spec: The LLM Flight Recorder

**Concept:** A forensics tool for analyzing LLM interaction failures.
**Metaphor:** "The Seismograph" (Timeline of Volatility) vs. "The Map" (Static Terrain).

---

## 1. The Evidence (Why this is needed)
We examined the raw data and found that **aggregate stats hide catastrophic failures**. A conversation can have a "Pattern: Question-Answer" label but actually be a 10-turn spiral of confusion.

**Exhibit A: The "Apology Loop" (chatbot_arena_29637.json)**
*   **Event:** User asks for change for 41p.
*   **Failure:** AI fails math, apologizes. User corrects. AI fails again, apologizes.
*   **Transcript:**
    *   *"I apologize for the mistake..."*
    *   *"I apologize if my previous response was not helpful..."*
    *   *"I apologize for the mistake... Here is a corrected version..."* (Still wrong)
*   **The Signal:** A repetitive spike in "Arousal" (Urgency) and collapse in "Dominance" (Submission).
*   **Current Viz:** Just a messy spiral in the 3D map.
*   **Flight Recorder:** A red "Conflict" zone on the timeline.

**Exhibit B: The "Logical Collapse" (chatbot_arena_30957.json)**
*   **Event:** User challenges "Is 2 greater than 3?"
*   **Failure:** AI initially defends, then collapses.
*   **Transcript:** *"I apologize for the confusion. You are correct. 2 is not greater than 3..."*
*   **The Signal:** Sharp PAD Volatility shift (0.0003 → 0.0150).

---

## 2. The Product: "The Seismograph"

Instead of a 3D landscape, we offer a **Temporal Analysis Dashboard**.

### Key Metrics
1.  **Volatility Index (The "Shake")**
    *   Measures the variance in Emotional Intensity between messages.
    *   *Low:* Routine transactions.
    *   *High:* Arguments, confusion, hallucinations.
2.  **Dominance Collapse (The "Submit")**
    *   Detects rapid drops in AI Dominance scores (e.g., 0.7 → 0.2).
    *   Indicates the AI has been "broken" or "cornered" by the user.
3.  **Apology Density**
    *   Percent of messages containing "apology", "confusion", "mistake".
    *   A direct proxy for interaction failure.

### The Visualization
*   **X-Axis:** Time (Message Index).
*   **Y-Axis:** Emotional Intensity (PAD).
*   **Visuals:**
    *   **Smooth Green Line:** Healthy Flow.
    *   **Jagged Red Spikes:** "Incidents".
    *   **Markers:** Auto-flag specific moments ("Apology Loop Detected", "Dominance Collapse").

## 3. Use Case: "Evaluation Forensics"
*   **User:** LLM Engineer / Prompt Engineer.
*   **Goal:** "Why did the model fail on the Math benchmark?"
*   **Action:** Don't read 1000 transcripts. Look at the **Seismograph**.
*   **Insight:** "Oh, look, every time the user asks about Geometry, we see a Dominance Collapse in turn 3."

## 4. Next Steps
1.  **Build the "Volatility Scanner":** A script to compute the variance of every conversation.
2.  **Sort & Search:** Allow sorting conversations by "Most Volatile" (The 50x outliers).
3.  **The Viewer:** A 2D chart component showing the PAD trajectory over time.
