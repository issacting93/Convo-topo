# How to Explore Different Terrains

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app in your browser**

3. **Select different conversations** from the grid to see different terrains

---

## 🎯 Best Conversations to Compare

### **1. Extreme Height Difference**

**Deep Conversation (High Terrain):**
- Select: **`sample-deep-discussion.json`**
- Should see: **High peaks, dramatic mountains**
- Why: Topic depth = "deep" → base height 0.8 (highest)

**Surface Conversation (Low Terrain):**
- Select: **`sample-question-answer.json`**
- Should see: **Low, flat terrain**
- Why: Topic depth = "surface" → base height 0.45 (lowest)

**Compare:** The deep conversation should be **visually much taller** than the surface one.

---

### **2. Emotional Tone Difference**

**Playful Conversation:**
- Select: **`conv-1.json`** or **`conv-17.json`**
- Should see: **Slightly taller peaks** (but still surface-level base)
- Why: Emotional tone = "playful" → higher emotional intensity → taller peaks

**Neutral Conversation:**
- Select: **`conv-0.json`** or **`sample-question-answer.json`**
- Should see: **Lower peaks**
- Why: Emotional tone = "neutral" → lower emotional intensity

**Compare:** Playful conversations should have **slightly more dramatic peaks**, but the difference is subtle.

---

### **3. Confidence Difference**

**High Confidence:**
- Select: **`sample-question-answer.json`**
- Should see: **Sharp, well-defined features** (peaks and valleys)
- Why: Avg confidence ~0.85 → variation 0.755 → more distinct features

**Low Confidence:**
- Select: **`conv-0.json`**
- Should see: **Smooth, uniform terrain**
- Why: Avg confidence ~0.3 → variation 0.59 → smoother features

**Compare:** High confidence = **more jagged terrain**, low confidence = **smoother terrain**.

---

## 📊 Conversation Summary

| ID | Topic Depth | Emotional Tone | Avg Confidence | What to Expect |
|----|-------------|----------------|----------------|---------------|
| `sample-deep-discussion` | **deep** | neutral | ~0.7 | 🏔️ **Highest terrain** - dramatic peaks |
| `sample-question-answer` | surface | neutral | ~0.85 | 🌄 **Low but well-defined** - sharp features |
| `conv-0` | surface | neutral | ~0.3 | 🌊 **Low and smooth** - uniform terrain |
| `conv-1` | surface | **playful** | ~0.7 | ⛰️ **Low with taller peaks** - playful peaks |
| `conv-17` | surface | **playful** | ~0.75 | ⛰️ **Low with taller peaks** - well-defined playful |

---

## 🔍 What to Look For

### **Height Differences (Primary)**
- ✅ **Deep conversation** should be **visually much taller** than surface
- ✅ **Surface conversations** should all be relatively **flat and low**

### **Feature Definition (Secondary)**
- ✅ **High confidence** conversations should have **sharper peaks and deeper valleys**
- ✅ **Low confidence** conversations should be **smoother and more uniform**

### **Peak Height (Tertiary)**
- ✅ **Playful conversations** should have **slightly taller peaks** than neutral
- ⚠️ **Difference is subtle** - topic depth is still the primary factor

---

## 🎨 Visual Guide

### **Surface Conversations (Most Common)**
- **Height**: Low (0.3-0.6 range)
- **Appearance**: Flat, gentle hills
- **Examples**: `conv-0` through `conv-19`, `sample-question-answer`

### **Deep Conversation (Rare)**
- **Height**: High (0.6-1.0 range)
- **Appearance**: Dramatic mountains, prominent peaks
- **Example**: `sample-deep-discussion`

### **Playful vs Neutral**
- **Playful**: Slightly taller peaks (but still surface-level base)
- **Neutral**: Lower peaks
- **Difference**: Subtle, but noticeable when comparing side-by-side

---

## 🐛 Troubleshooting

### **If all terrains look the same:**

1. **Check browser console** for errors
2. **Verify files are loading:**
   - Open browser DevTools → Network tab
   - Look for `/output/conv-*.json` requests
   - Should see 200 status codes

3. **Check terrain generation:**
   - Verify `getTerrainParams()` is being called
   - Check that classification data is being used

### **If deep conversation isn't taller:**

1. **Check classification data:**
   ```bash
   jq '.classification.topicDepth.category' public/output/sample-deep-discussion.json
   ```
   Should return: `"deep"`

2. **Check terrain params:**
   - Deep should have base height 0.8
   - Surface should have base height 0.45

### **If differences are too subtle:**

The height ranges might need to be increased. Check `src/utils/terrain.ts`:
- Deep: `{ min: 0.6, max: 1.0, base: 0.8 }`
- Surface: `{ min: 0.3, max: 0.6, base: 0.45 }`

If needed, we can increase the contrast.

---

## 📝 Notes

- **Most conversations (21/22) are "surface"** - so most will look similar
- **Only 1 "deep" conversation** - this should stand out dramatically
- **Emotional differences are subtle** - topic depth is the primary visual factor
- **Confidence affects detail** - but height range is still primary

---

## 🎯 Recommended Exploration Order

1. **Start with extremes:**
   - `sample-deep-discussion.json` (deep, high)
   - `sample-question-answer.json` (surface, low)

2. **Compare similar conversations:**
   - `conv-1.json` vs `conv-0.json` (playful vs neutral)
   - `conv-17.json` vs `conv-0.json` (high vs low confidence)

3. **Explore patterns:**
   - Try different surface conversations - they should be similar
   - The deep conversation should stand out dramatically

---

## 🚀 Next Steps

After exploring, you might want to:
1. **Generate more diverse conversations** (more "deep", "moderate" examples)
2. **Increase terrain contrast** (make differences more visible)
3. **Add visual indicators** (show topic depth, confidence in UI)
4. **Create comparison view** (side-by-side terrain comparison)

