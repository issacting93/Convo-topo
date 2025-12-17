# Terrain Comparison Guide: What to Expect

This guide shows what different conversations should look like in the terrain visualization.

## 🎯 Quick Reference: Conversation Types

### **Surface Conversations** (21 conversations)
- **Height**: Low, flat terrain (0.3-0.6 range)
- **Features**: Gentle hills, smooth terrain
- **Examples**: `conv-0.json`, `conv-1.json`, `conv-2.json`, etc.

### **Deep Conversation** (1 conversation)
- **Height**: High peaks (0.6-1.0 range)
- **Features**: Dramatic mountains, prominent peaks
- **Example**: `sample-deep-discussion.json`

---

## 📊 Detailed Comparison

### 1. **Surface vs Deep: Height Difference**

| Conversation | Topic Depth | Expected Height | Visual Result |
|-------------|-------------|----------------|---------------|
| `sample-deep-discussion.json` | **deep** | 0.6-1.0 (base: 0.8) | 🏔️ **High peaks, dramatic terrain** |
| `sample-question-answer.json` | **surface** | 0.3-0.6 (base: 0.45) | 🌄 **Low, flat terrain** |
| `conv-0.json` | **surface** | 0.3-0.6 (base: 0.45) | 🌄 **Low, flat terrain** |

**What to look for:**
- Deep conversation should have **much taller peaks** than surface conversations
- Surface conversations should appear **flatter and lower**

---

### 2. **Emotional Tone: Peak Height**

| Conversation | Emotional Tone | Emotional Intensity | Peak Multiplier | Visual Result |
|-------------|----------------|---------------------|-----------------|--------------|
| `conv-1.json` | **playful** | ~0.7 | 1.0-1.21 | ⛰️ **Slightly taller peaks** |
| `conv-0.json` | **neutral** | ~0.3 | 1.0-1.09 | 🌄 **Lower peaks** |
| `sample-deep-discussion.json` | **neutral** | ~0.3 | 1.0-1.09 | 🏔️ **High base, but less dramatic peaks** |

**What to look for:**
- Playful conversations should have **slightly taller peaks** than neutral ones
- But topic depth is still the primary factor

---

### 3. **Confidence: Terrain Variation**

| Conversation | Avg Confidence | Variation | Visual Result |
|-------------|----------------|-----------|---------------|
| `sample-question-answer.json` | ~0.85 | 0.755 | 🎯 **More defined features, sharper peaks/valleys** |
| `conv-0.json` | ~0.3 | 0.59 | 🌊 **Smoother, more uniform terrain** |
| `conv-17.json` | ~0.75 | 0.725 | 🎯 **Well-defined features** |

**What to look for:**
- High confidence = **more distinct terrain features** (sharper peaks, deeper valleys)
- Low confidence = **smoother, more uniform** terrain

---

## 🔍 Specific Examples to Compare

### **Best Contrast: Deep vs Surface**

1. **Load `sample-deep-discussion.json`**
   - Should see: **High peaks, dramatic terrain**
   - Topic depth: "deep" → base height 0.8
   - Emotional: neutral → moderate peaks
   - Confidence: ~0.7 → good variation

2. **Load `sample-question-answer.json`**
   - Should see: **Low, flat terrain**
   - Topic depth: "surface" → base height 0.45
   - Emotional: neutral → lower peaks
   - Confidence: ~0.85 → well-defined but low

3. **Compare side-by-side:**
   - Deep should be **visually much taller**
   - Surface should be **flatter and lower**

---

### **Emotional Contrast: Playful vs Neutral**

1. **Load `conv-1.json` (playful)**
   - Emotional tone: "playful" → intensity ~0.7
   - Should have: **Slightly taller peaks** than neutral

2. **Load `conv-0.json` (neutral)**
   - Emotional tone: "neutral" → intensity ~0.3
   - Should have: **Lower peaks**

3. **Compare:**
   - Playful should have **more dramatic peaks** (but still surface-level base)

---

### **Confidence Contrast: High vs Low**

1. **Load `sample-question-answer.json` (high confidence ~0.85)**
   - Should see: **Sharp, well-defined features**
   - Variation: 0.755 → more distinct peaks/valleys

2. **Load `conv-0.json` (low confidence ~0.3)**
   - Should see: **Smooth, uniform terrain**
   - Variation: 0.59 → smoother features

3. **Compare:**
   - High confidence = **more jagged, defined terrain**
   - Low confidence = **smoother, more uniform terrain**

---

## 🎨 Visual Encoding Summary

| Factor | Affects | Range | Visual Impact |
|--------|---------|-------|---------------|
| **Topic Depth** | Height range | Surface: 0.3-0.6<br>Deep: 0.6-1.0 | 🏔️ **PRIMARY** - Most visible difference |
| **Confidence** | Variation | 0.5-0.8 | 🎯 **SECONDARY** - Feature definition |
| **Emotional Intensity** | Peak multiplier | 1.0-1.3 | ⛰️ **TERTIARY** - Peak height |

---

## 🚀 How to Explore

1. **Start with the extremes:**
   - `sample-deep-discussion.json` (deep, high)
   - `sample-question-answer.json` (surface, low)

2. **Compare similar conversations:**
   - `conv-1.json` vs `conv-0.json` (playful vs neutral)
   - `conv-17.json` vs `conv-0.json` (high vs low confidence)

3. **Look for patterns:**
   - All "surface" conversations should be relatively flat
   - "Deep" conversation should stand out dramatically
   - Playful conversations should have slightly taller peaks

---

## ⚠️ What to Watch For

### **Expected Differences:**
- ✅ Deep conversation should be **visually much taller** than surface
- ✅ High confidence should show **more defined features**
- ✅ Playful tone should have **slightly taller peaks**

### **Potential Issues:**
- ⚠️ If all terrains look the same → terrain generation might not be using classification data
- ⚠️ If deep conversation isn't taller → check `getTerrainParams()` function
- ⚠️ If differences are too subtle → may need to increase height ranges

---

## 📝 Notes

- **Most conversations are "surface"** (21 out of 22) - so most will look similar
- **Only 1 "deep" conversation** - this should stand out dramatically
- **Emotional differences are subtle** - topic depth is the primary visual factor
- **Confidence affects detail** - but height range is still primary

---

## 🔧 If Differences Aren't Visible

If you can't see clear differences between conversations:

1. **Check terrain generation:**
   - Verify `getTerrainParams()` is being called
   - Check that `topicDepth`, `avgConfidence`, `emotionalIntensity` are passed to `generateHeightmap()`

2. **Increase contrast:**
   - Adjust height ranges in `terrain.ts` (make deep even higher, surface even lower)
   - Increase variation multiplier
   - Increase peak multiplier range

3. **Verify data:**
   - Check that classification data is correct
   - Verify conversations are loading properly

