# Calculation and Dimension Documentation

This directory contains all documentation related to how dimensions are calculated and mapped to the visualization.

---

## Main Documents

### **[AXIS_VALUES_EXPLAINED.md](AXIS_VALUES_EXPLAINED.md)** ⭐ **Start Here**
Simple guide explaining what the X, Y, Z axes mean and how to read conversation positions.

### **[CALCULATED_DIMENSIONS.md](CALCULATED_DIMENSIONS.md)**
Reference listing all calculated dimensions (not LLM-generated) and their calculation methods.

### **[CALCULATION_DETAILS.md](CALCULATION_DETAILS.md)**
Step-by-step explanations of how each calculated dimension is computed, including formulas, examples, and edge cases.

### **[DIMENSION_MAPPING.md](DIMENSION_MAPPING.md)**
How classification dimensions map to visualization coordinates (X, Y, Z axes).

### **[METRICS_ANALYSIS.md](METRICS_ANALYSIS.md)**
Analysis of metrics and dimensions, including statistical properties and interpretations.

---

## Core Dimensions

### X-Axis: Functional ↔ Social (0.0 ↔ 1.0)
- **Primary**: Linguistic marker analysis (task vs. social language)
- **Fallback**: Role-based positioning
- **See**: `CALCULATION_DETAILS.md` for detailed formulas

### Y-Axis: Aligned ↔ Divergent (0.0 ↔ 1.0)
- **Definition**: Linguistic alignment - how similar/different human and AI language styles are
- **Primary**: Linguistic alignment analysis (cosine similarity of 7 features: formality, politeness, certainty, structure, question-asking, inclusive language, register)
- **Fallback**: When messages unavailable, approximated from AI role distribution
- **See**: `CALCULATION_DETAILS.md` for detailed formulas

### Z-Axis: Emotional Intensity (0.0 ↔ 1.0)
- **Primary**: PAD emotional intensity: `(1 - pleasure) × 0.6 + arousal × 0.4`
- **Fallback**: Classification-based approximation
- **See**: `CALCULATION_DETAILS.md` for detailed formulas

---

## PAD (Pleasure-Arousal-Dominance)

PAD scores are calculated per message:
- **Pleasure** (0-1): Low = frustration, High = satisfaction
- **Arousal** (0-1): Low = calm, High = agitated
- **Dominance** (0-1): Low = passive, High = in control
- **Emotional Intensity**: `(1 - pleasure) × 0.6 + arousal × 0.4`

See `CALCULATION_DETAILS.md` for detailed PAD calculation methods.

---

## Related Documentation

- **Technical**: `../technical/` - Implementation details
- **Data**: `../DATA_GUIDE.md` - Data structure and organization
- **Classification**: `../guides/CLASSIFICATION_AND_PAD_GUIDE.md` - How to generate PAD

