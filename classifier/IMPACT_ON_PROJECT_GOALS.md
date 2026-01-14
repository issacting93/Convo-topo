# Impact of Classification Findings on Project Goals

**Date:** 2026-01-07  
**Issue:** Local model (qwen2.5:7b) shows 83.1% `facilitator` vs OpenAI's 36% `expert-system`  
**Critical Impact:** This undermines the core research goals of Conversational Cartography

---

## 🔴 The Core Problem for Project Goals

### What Conversational Cartography is Trying to Do

1. **Externalize conversations into 3D spatial terrains** - making conversations navigable and visual
2. **Support pattern recognition** - helping researchers understand conversational dynamics
3. **Create a "cognitive tool"** - extending human cognition through visualization
4. **Map multi-dimensional conversational features** including AI roles

### How Classifications Feed Into Visualization

**AI Role Distribution → Y-Axis Mapping (Conversation Structure)**

From `src/utils/coordinates.ts` lines 112-119:
```typescript
if (c.aiRole?.distribution) {
    const aiRole = c.aiRole.distribution;
    const isExpert = (aiRole['expert'] || 0) + (aiRole['advisor'] || 0);
    const isPeer = (aiRole['peer'] || 0) + (aiRole['facilitator'] || 0);

    if (isExpert > isPeer) return 0.75;  // Expert = top (structured/emergent)
    if (isPeer > isExpert) return 0.25;  // Facilitator = bottom (aligned/structured)
}
```

**The Y-axis represents:** Structured ↔ Emergent
- **Expert/Advisor** → Top (~0.75) = Structured/authoritative
- **Facilitator/Peer** → Bottom (~0.25) = Emergent/collaborative

---

## 💥 Direct Impact on Project Goals

### 1. **Spatial Positioning is Systematically Wrong**

**If local model misclassifies:**
- **83%** classified as `facilitator` → Y = 0.25 (bottom)
- **Should be** `expert` → Y = 0.75 (top)

**Result:** 83% of conversations appear on the **wrong side** of the Y-axis.

**Impact:** The terrain maps are **fundamentally distorted**. Conversations that should cluster at the top (expert-driven, structured) are clustering at the bottom (facilitator-driven, emergent).

---

### 2. **Pattern Recognition Fails**

The project goal is to **"support pattern recognition across complex, multidimensional conversational data."**

**With wrong classifications:**
- Spatial clusters reflect classification errors, not actual patterns
- Similar conversations (both expert-driven) appear in different locations
- Different conversations (expert vs facilitator) appear similar
- Pattern discovery becomes impossible or misleading

**Example:**
- Two conversations where AI provides authoritative answers (should both be `expert`)
- Local model classifies one as `facilitator`, one as `expert`
- They appear at Y=0.25 and Y=0.75 - completely separate
- Researcher thinks they're different patterns, but they're actually the same

---

### 3. **Research Validity is Compromised**

The project is a **"cognitive technology for studying human–AI interaction."**

**If classifications are systematically biased:**
- Research findings about conversational dynamics are invalid
- Comparisons between conversation types are meaningless
- Clustering analysis reveals model errors, not conversational patterns
- The visualization becomes a **"beautiful lie"** - it looks right but encodes wrong information

**This undermines the entire research contribution.**

---

### 4. **Terrain Generation is Based on Wrong Data**

**Path Trajectory Calculation** (from `src/utils/terrain.ts` lines 408-411):
```typescript
// Calculate conversation-level target based on classification
const targetX = 0.1 + messages[0].communicationFunction * 0.8;
const targetY = 0.1 + messages[0].conversationStructure * 0.8;
```

**If `conversationStructure` (Y-axis) is wrong:**
- Paths drift toward **wrong target positions**
- Visual trajectories don't reflect actual conversational dynamics
- The "drift" from origin to target shows classification error, not conversational flow

---

### 5. **Cognitive Extension Fails**

The project goal is to **"extend human cognition"** by making conversational patterns visible.

**With wrong classifications:**
- The visualization **extends misunderstanding**, not understanding
- Researchers "think with" the visualization, but it encodes false patterns
- The cognitive tool becomes a **cognitive trap** - it's easier to trust the visualization than verify the underlying data

**This is the opposite of the project's goal.**

---

## 📊 Quantifying the Impact

### Spatial Distortion

**Local Model Results:**
- 83.1% `facilitator` → Y = 0.25 (bottom-left quadrant)
- 0.6% `expert` → Y = 0.75 (top-left quadrant)

**OpenAI Results (presumed accurate):**
- 60% `facilitator` → Y = 0.25
- 36% `expert` → Y = 0.75

**Distortion:**
- **~36% of conversations** are positioned on the wrong side of the Y-axis
- Spatial clusters will be **fundamentally different** between local and OpenAI classifications
- Clustering algorithms will find different patterns
- Comparison studies become impossible

---

## 🎯 Why This Matters for the Project

### The Project's Core Contribution

From README.md:
> "The contribution is not simply a new visualization technique, but a **new way of thinking with conversations**: treating dialogue as something that can be mapped, traversed, and examined as an external cognitive object."

**If the mappings are wrong:**
- The "new way of thinking" is based on false foundations
- The visualization doesn't actually reveal conversational patterns
- The cognitive extension is broken
- The contribution becomes questionable

### The Research Question

The project asks: **"How do conversations position themselves spatially? What patterns emerge when we externalize conversational dynamics?"**

**With wrong classifications:**
- The patterns that "emerge" are artifacts of classification errors
- The answer to the research question is: **"They position themselves based on which model classified them, not based on their actual conversational dynamics."**

This undermines the entire research question.

---

## 🔧 What This Means for Next Steps

### Option 1: Fix the Classifications (Recommended)

**If you want the project to achieve its goals:**
- Don't accept the local model's bias
- Either fix the local model, use OpenAI, or validate with manual review
- The visualization is only as good as the data that feeds it

**Without accurate classifications, the entire visualization becomes a beautiful but misleading artifact.**

### Option 2: Acknowledge the Limitation

**If you can't fix it:**
- Document that classifications are model-dependent
- Use local model results with explicit caveats
- Treat patterns as "patterns in how qwen2.5:7b classifies conversations," not "patterns in conversations themselves"

**This changes the research contribution from "conversational cartography" to "visualizing LLM classification artifacts."**

### Option 3: Make Classification Transparency Part of the Contribution

**If you embrace the finding:**
- The project could become: "How do different models see conversations differently?"
- Compare visualizations from local vs OpenAI classifications side-by-side
- This reveals something about **models** rather than **conversations**, but it's still interesting

**This pivots the research question but maintains scientific rigor.**

---

## 🎓 Philosophical Reflection

### The "Dead End" as a Finding

This isn't just a technical problem—it's a **methodological discovery**:

**The act of classification shapes what patterns you can see.** Different models produce different spatial maps, which means:

1. **The terrain is not an objective representation** - it's a representation filtered through a classification model
2. **Pattern recognition depends on the classifier** - what patterns you find depend on which model you use
3. **The cognitive tool is inherently subjective** - it extends cognition, but cognition filtered through model perspectives

**This could be a valuable finding for the field:**
- It reveals that visualization always encodes assumptions
- It shows how model choice shapes research outcomes
- It demonstrates the importance of transparency in AI-assisted research

---

## ✅ Recommended Action

**For the project to achieve its stated goals, you must:**

1. **Establish ground truth** - Manual review of 20-30 conversations
2. **Determine which model is more accurate** - Compare local vs OpenAI against human judgments
3. **Fix the classification pipeline** - Use the more accurate model (or fix the local model if possible)
4. **Re-classify with accurate model** - Generate new terrains from correct classifications
5. **Or pivot the research** - If accuracy isn't achievable, make "model comparison" the contribution

**The visualization is secondary to the data quality. Without accurate classifications, the entire project becomes a demonstration of visualization techniques applied to noisy data, not a cognitive tool for understanding conversations.**

---

## 📝 Conclusion

**The classification findings directly undermine the core goals of Conversational Cartography:**

- ❌ Spatial positioning is wrong
- ❌ Pattern recognition fails
- ❌ Research validity is compromised  
- ❌ Cognitive extension becomes cognitive misdirection
- ❌ The contribution becomes questionable

**However, this could be reframed as a valuable finding:**
- The visualization reveals how model choice shapes what patterns are visible
- Different classifiers produce fundamentally different maps
- Classification is not neutral—it shapes the research questions that can be asked

**The "dead end" might actually be the beginning of a more honest research contribution: showing how AI-assisted analysis shapes what we can see, not just showing patterns in conversations themselves.**

