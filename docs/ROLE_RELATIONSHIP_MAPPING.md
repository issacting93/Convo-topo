# Role Relationship Mapping: Data-Driven Analysis

**Date:** 2026-01-XX  
**Dataset:** 345 conversations  
**Analysis:** Dominant role pairs (highest probability role for each participant)

---

## Visual Structure for Canvas Diagram

### Layout Suggestion

```
LEFT SIDE (Human Roles)          →          RIGHT SIDE (AI Roles)
─────────────────────────────────────────────────────────────────

INFORMATION-ORIENTED              KNOWLEDGE-ORIENTED
├─ Seeker (78.8%) ──────────────→ Expert (82.9%) [73.3% of all]
│  └─ 272 conversations          │  └─ 286 conversations
│                                │
└─ Learner (0.3%) ──────────────→ Advisor (2.6%)
   └─ 1 conversation                └─ 9 conversations

LEADERSHIP-ORIENTED              COLLABORATIVE-ORIENTED
├─ Director (5.2%) ────────────→ Expert (4.5% of expert convs)
│  └─ 18 conversations          │
│                                ├─ Facilitator (6.1%)
│                                │  └─ 21 conversations
└─ Collaborator (9.3%) ─────────→ Peer (3.5%)
   └─ 32 conversations              └─ 12 conversations

EXPRESSION-ORIENTED              SUPPORT-ORIENTED
└─ Sharer (2.6%) ───────────────→ Reflector (1.2%)
   └─ 9 conversations               └─ 4 conversations

EVALUATION-ORIENTED              SPECIAL CASES
├─ Tester (2.3%) ───────────────→ Expert (2.1% of expert convs)
│  └─ 8 conversations          │
│                                ├─ Unable-to-Engage (2.3%)
│                                │  └─ 8 conversations
└─ Philosophical-Explorer (0.9%)  │
   └─ 3 conversations             └─ Creative-Partner (1.4%)
                                     └─ 5 conversations
```

---

## Complete Role Relationship Matrix

### All Observed Pairs (Sorted by Frequency)

| Human Role | AI Role | Count | % of All | % of Human Role | % of AI Role | Visual Weight |
|------------|---------|-------|----------|-----------------|--------------|---------------|
| **seeker** | **expert** | **253** | **73.3%** | **93.0%** | **88.5%** | ████████████████████████████████████ |
| director | expert | 13 | 3.8% | 72.2% | 4.5% | █ |
| collaborator | facilitator | 13 | 3.8% | 40.6% | 61.9% | █ |
| collaborator | expert | 12 | 3.5% | 37.5% | 4.2% | █ |
| seeker | unable-to-engage | 7 | 2.0% | 2.6% | 87.5% | █ |
| seeker | advisor | 6 | 1.7% | 2.2% | 66.7% | █ |
| tester | expert | 6 | 1.7% | 75.0% | 2.1% | █ |
| collaborator | peer | 4 | 1.2% | 12.5% | 33.3% | █ |
| seeker | facilitator | 4 | 1.2% | 1.5% | 19.0% | █ |
| director | peer | 3 | 0.9% | 16.7% | 25.0% | █ |
| sharer | reflector | 3 | 0.9% | 33.3% | 75.0% | █ |
| artist | peer | 2 | 0.6% | 100.0% | 16.7% | █ |
| sharer | facilitator | 2 | 0.6% | 22.2% | 9.5% | █ |
| collaborator | advisor | 2 | 0.6% | 6.2% | 22.2% | █ |
| director | creative-partner | 2 | 0.6% | 11.1% | 40.0% | █ |
| *[15 other pairs, each <0.6%]* | | | | | | |

**Total unique pairs:** 26  
**Total conversations:** 345

---

## Role Frequencies

### Human Roles (as Dominant Role)

| Role                   | Count   | Percentage | Orientation          |
| ---------------------- | ------- | ---------- | -------------------- |
| **seeker**             | **272** | **78.8%**  | Information-Oriented |
| collaborator           | 32      | 9.3%       | Leadership-Oriented  |
| director               | 18      | 5.2%       | Leadership-Oriented  |
| sharer                 | 9       | 2.6%       | Expression-Oriented  |
| tester                 | 8       | 2.3%       | Evaluation-Oriented  |
| philosophical-explorer | 3       | 0.9%       | Evaluation-Oriented  |
| artist                 | 2       | 0.6%       | Expression-Oriented  |
| learner                | 1       | 0.3%       | Information-Oriented |

### AI Roles (as Dominant Role)

| Role | Count | Percentage | Orientation |
|------|-------|------------|-------------|
| **expert** | **286** | **82.9%** | Knowledge-Oriented |
| facilitator | 21 | 6.1% | Collaborative-Oriented |
| peer | 12 | 3.5% | Collaborative-Oriented |
| advisor | 9 | 2.6% | Knowledge-Oriented |
| unable-to-engage | 8 | 2.3% | Special Case |
| creative-partner | 5 | 1.4% | Collaborative-Oriented |
| reflector | 4 | 1.2% | Support-Oriented |

---

## Key Relationship Patterns

### 1. Dominant Pattern: Information-Seeking (73.3%)

**seeker → expert** (253 conversations)

**Characteristics:**
- Classic Q&A interaction
- Human asks questions, AI provides answers
- Functional/structured positioning
- 93.0% of seeker conversations pair with expert
- 88.5% of expert conversations pair with seeker

**Visual:** Thickest arrow, central connection

---

### 2. Leadership Patterns (7.0% combined)

**director → expert** (13 conversations, 3.8%)
- Directive human, informative AI
- Task-oriented, command-driven
- 72.2% of director conversations

**collaborator → facilitator** (13 conversations, 3.8%)
- Co-building human, guiding AI
- Collaborative positioning
- 40.6% of collaborator conversations
- 61.9% of facilitator conversations

**collaborator → expert** (12 conversations, 3.5%)
- Co-building human, informative AI
- Mixed collaborative/informative

---

### 3. Expression Patterns (2.6% combined)

**sharer → reflector** (3 conversations, 0.9%)
- Personal narrative human, mirroring AI
- Relational positioning
- 33.3% of sharer conversations
- 75.0% of reflector conversations

**sharer → facilitator** (2 conversations, 0.6%)
- Personal narrative human, guiding AI

---

### 4. Evaluation Patterns (4.0% combined)

**tester → expert** (6 conversations, 1.7%)
- Testing human, informative AI
- Adversarial evaluation context
- 75.0% of tester conversations

**seeker → unable-to-engage** (7 conversations, 2.0%)
- Information-seeking human, AI breakdown
- 87.5% of unable-to-engage conversations
- Indicates AI failure scenarios

---

### 5. Rare Patterns (<1% each)

**artist → peer** (2 conversations)
- Creative human, equal partner AI
- 100.0% of artist conversations

**philosophical-explorer → [various]** (3 conversations)
- Distributed across facilitator, peer, creative-partner
- Exploratory positioning

---

## Relationship Strengths

### Strong Relationships (>50% of one role)

1. **seeker → expert**: 93.0% of seeker conversations
2. **director → expert**: 72.2% of director conversations
3. **tester → expert**: 75.0% of tester conversations
4. **collaborator → facilitator**: 40.6% of collaborator conversations
5. **sharer → reflector**: 33.3% of sharer conversations
6. **artist → peer**: 100.0% of artist conversations

### Reciprocal Strong Relationships

1. **seeker ↔ expert**: 
   - 93.0% of seekers pair with expert
   - 88.5% of experts pair with seeker
   - **Strong bidirectional relationship**

2. **collaborator ↔ facilitator**:
   - 40.6% of collaborators pair with facilitator
   - 61.9% of facilitators pair with collaborator
   - **Moderate bidirectional relationship**

3. **sharer ↔ reflector**:
   - 33.3% of sharers pair with reflector
   - 75.0% of reflectors pair with sharer
   - **Moderate bidirectional relationship**

---

## Orientation-Based Groupings

### Functional/Structured Relationships (77.1%)

**Information-Oriented Human → Knowledge-Oriented AI:**
- seeker → expert (73.3%)
- seeker → advisor (1.7%)
- learner → expert (0.3%)
- seeker → unable-to-engage (2.0%)

**Leadership-Oriented Human → Knowledge-Oriented AI:**
- director → expert (3.8%)

**Total:** 266 conversations (77.1%)

---

### Collaborative/Relational Relationships (9.0%)

**Leadership-Oriented Human → Collaborative-Oriented AI:**
- collaborator → facilitator (3.8%)
- collaborator → peer (1.2%)
- director → peer (0.9%)

**Expression-Oriented Human → Support-Oriented AI:**
- sharer → reflector (0.9%)
- sharer → facilitator (0.6%)

**Expression-Oriented Human → Collaborative-Oriented AI:**
- artist → peer (0.6%)

**Total:** 31 conversations (9.0%)

---

### Evaluation/Testing Relationships (4.0%)

**Evaluation-Oriented Human → Knowledge-Oriented AI:**
- tester → expert (1.7%)

**Information-Oriented Human → Special Case AI:**
- seeker → unable-to-engage (2.0%)
- tester → unable-to-engage (0.3%)

**Total:** 14 conversations (4.0%)

---

### Creative/Exploratory Relationships (2.0%)

**Leadership-Oriented Human → Creative AI:**
- director → creative-partner (0.6%)

**Expression-Oriented Human → Creative AI:**
- sharer → creative-partner (0.3%)

**Evaluation-Oriented Human → Creative AI:**
- philosophical-explorer → creative-partner (0.3%)
- philosophical-explorer → facilitator (0.3%)
- philosophical-explorer → peer (0.3%)

**Total:** 7 conversations (2.0%)

---

## Visual Mapping Guidelines

### For Canvas Diagram

**1. Node Sizing:**
- Size nodes by frequency (count)
- Largest: seeker (272), expert (286)
- Medium: collaborator (32), facilitator (21)
- Small: artist (2), learner (1)

**2. Edge Thickness:**
- Thickest: seeker → expert (253 conversations)
- Medium: director → expert, collaborator → facilitator (13 each)
- Thin: All others (<10 conversations)

**3. Color Coding:**
- **Blue**: Information-Oriented → Knowledge-Oriented (functional)
- **Green**: Leadership-Oriented → Collaborative-Oriented (collaborative)
- **Purple**: Expression-Oriented → Support-Oriented (relational)
- **Orange**: Evaluation-Oriented → Knowledge-Oriented (testing)
- **Red**: Any → unable-to-engage (breakdown)

**4. Grouping:**
- Group by orientation (Information, Leadership, Expression, Evaluation)
- Show clear separation between functional and relational patterns

**5. Annotations:**
- Label edges with count and percentage
- Highlight dominant pattern (seeker → expert)
- Show rare but interesting patterns (artist → peer, sharer → reflector)

---

## Key Insights from the Mapping

### 1. Extreme Skew Toward Information-Seeking

**73.3% of all conversations** follow seeker → expert pattern.

**What this reveals:**
- Evaluation context (Chatbot Arena) dominates
- Most interactions are task-oriented, not relational
- Clear asymmetry: human seeks, AI provides

### 2. Relational Patterns Are Rare but Distinct

**Only 9.0% of conversations** show collaborative/relational patterns:
- collaborator → facilitator (3.8%)
- sharer → reflector (0.9%)
- artist → peer (0.6%)

**What this reveals:**
- Relational work exists but is secondary
- These patterns are experientially distinct from functional patterns
- Visualization makes these rare patterns visible

### 3. AI Breakdowns Are Visible

**2.3% of conversations** show unable-to-engage:
- seeker → unable-to-engage (2.0%)
- tester → unable-to-engage (0.3%)

**What this reveals:**
- Terrain can detect AI failures
- Breakdowns create distinct relational patterns
- Anomaly detection capability

### 4. Role Diversity Exists but is Limited

**26 unique role pairs** observed, but:
- Top 4 pairs account for 84.4% of conversations
- Remaining 22 pairs account for 15.6%
- Most pairs are rare (<1%)

**What this reveals:**
- Role taxonomy captures diversity
- But evaluation context limits expression of diversity
- Visualization reveals both common and rare patterns

---

## Data-Driven Canvas Structure

### Recommended Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    ROLE RELATIONSHIP MAP                    │
│                    (345 conversations)                      │
└─────────────────────────────────────────────────────────────┘

HUMAN ROLES (Left)                    AI ROLES (Right)
──────────────────                    ──────────────────

[Information-Oriented]                [Knowledge-Oriented]
  Seeker (272) ────────────────→ Expert (286)
    │                              │
    ├─→ Advisor (6)                │
    ├─→ Facilitator (4)             │
    └─→ Unable-to-Engage (7)        │
                                    │
  Learner (1) ──────────────────→   │

[Leadership-Oriented]                [Collaborative-Oriented]
  Director (18) ────────────────→   │
    │                              │
    └─→ Expert (13)                 │
    └─→ Peer (3)                    │
    └─→ Creative-Partner (2)        │
                                    │
  Collaborator (32) ─────────────→ Facilitator (21)
    │                              │
    ├─→ Expert (12)                  │
    ├─→ Peer (4)                    │
    └─→ Advisor (2)                  │
                                    │
                                    Peer (12)
                                    │
                                    Creative-Partner (5)

[Expression-Oriented]                [Support-Oriented]
  Sharer (9) ──────────────────→ Reflector (4)
    │                              │
    ├─→ Facilitator (2)            │
    └─→ Expert (1)                  │
                                    │
  Artist (2) ───────────────────→   │

[Evaluation-Oriented]                [Special Cases]
  Tester (8) ──────────────────→   │
    │                              │
    └─→ Expert (6)                  │
    └─→ Unable-to-Engage (1)        │
                                    │
  Philosophical-Explorer (3) ────→  │
    │                              │
    ├─→ Facilitator (1)             │
    ├─→ Peer (1)                    │
    └─→ Creative-Partner (1)        │
                                    │
                                    Unable-to-Engage (8)
```

---

## Edge Weights (for Visual Thickness)

| Edge | Weight | Visual Thickness |
|------|--------|------------------|
| seeker → expert | 253 | ████████████████████████████████████ (thickest) |
| director → expert | 13 | ████ |
| collaborator → facilitator | 13 | ████ |
| collaborator → expert | 12 | ████ |
| seeker → unable-to-engage | 7 | ██ |
| seeker → advisor | 6 | ██ |
| tester → expert | 6 | ██ |
| All others | <5 | █ (thin) |

---

## Color Scheme Recommendation

### By Relationship Type

**Functional (Blue tones):**
- seeker → expert
- director → expert
- seeker → advisor
- learner → expert

**Collaborative (Green tones):**
- collaborator → facilitator
- collaborator → peer
- director → peer
- artist → peer

**Relational (Purple tones):**
- sharer → reflector
- sharer → facilitator

**Testing/Evaluation (Orange tones):**
- tester → expert
- tester → unable-to-engage

**Breakdown/Anomaly (Red tones):**
- seeker → unable-to-engage
- Any → unable-to-engage

---

## Summary Statistics

**Total Conversations:** 345  
**Unique Role Pairs:** 26  
**Most Common Pair:** seeker → expert (73.3%)  
**Top 4 Pairs:** Account for 84.4% of conversations  
**Rare Pairs (<1%):** 22 pairs, account for 15.6%

**Human Role Diversity:**
- 8 unique human roles observed
- 78.8% are seeker (low diversity)

**AI Role Diversity:**
- 7 unique AI roles observed
- 82.9% are expert (low diversity)

**Relationship Diversity:**
- 26 unique pairs
- High concentration in top pairs
- Long tail of rare relationships

---

**Generated:** 2026-01-XX  
**Data Source:** `public/output/*.json` (345 conversations)

