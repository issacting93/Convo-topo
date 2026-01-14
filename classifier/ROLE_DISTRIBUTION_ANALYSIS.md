# Role Distribution Analysis

**Date:** 2026-01-07  
**Dataset:** 165 unique conversations  
**Model:** qwen2.5:7b (Ollama)

---

## 📊 Overview

This analysis shows how roles are distributed across all 165 classified conversations.

**Two ways to look at roles:**
1. **Average Probabilities** - Average probability across all conversations (roles can overlap)
2. **Dominant Role Count** - How many conversations have each role as their top/most likely role

---

## 👤 Human Roles

### Average Probabilities
*Average probability weight across all 165 conversations*

| Role | Average | Percentage | Note |
|------|---------|------------|------|
| **Seeker** | 0.517 | **51.7%** | **Dominant** |
| Learner | 0.170 | 17.0% | |
| Sharer | 0.120 | 12.0% | |
| Collaborator | 0.102 | 10.2% | |
| Director | 0.083 | 8.3% | |
| Artist | 0.004 | 0.4% | |
| Tester | 0.004 | 0.4% | |
| Others | <0.1% | <0.1% | |

**Visual:**
```
Seeker:      ████████████████████████████████████████████████ 51.7%
Learner:     ████████ 17.0%
Sharer:      ██████ 12.0%
Collaborator:█████ 10.2%
Director:    ████ 8.3%
```

### Dominant Role Count
*How many conversations have this as their most likely human role*

| Role | Count | Percentage |
|------|-------|------------|
| **Seeker** | 122 | **73.9%** |
| Collaborator | 28 | 17.0% |
| Sharer | 15 | 9.1% |

**Key Finding:**
- 73.9% of conversations have Seeker as the dominant human role
- But average probability is only 51.7%, meaning many conversations also have probabilities on other roles (Learner, Sharer, etc.)

---

## 🤖 AI Roles

### Average Probabilities
*Average probability weight across all 165 conversations*

| Role | Average | Percentage | Note |
|------|---------|------------|------|
| **Facilitator** | 0.581 | **58.1%** | **Highly Dominant** |
| Expert | 0.105 | 10.5% | |
| Peer | 0.092 | 9.2% | |
| Affiliative | 0.063 | 6.3% | |
| Advisor | 0.059 | 5.9% | |
| Reflector | 0.057 | 5.7% | |
| Unable-to-engage | 0.015 | 1.5% | |
| Creative-partner | 0.006 | 0.6% | |
| Others | <0.1% | <0.1% | |

**Visual:**
```
Facilitator: ████████████████████████████████████████████████████ 58.1%
Expert:      █████ 10.5%
Peer:        ████ 9.2%
Affiliative: ███ 6.3%
Advisor:     ██ 5.9%
Reflector:   ██ 5.7%
```

### Dominant Role Count
*How many conversations have this as their most likely AI role*

| Role | Count | Percentage |
|------|-------|------------|
| **Facilitator** | 115 | **69.7%** |
| Peer | 22 | 13.3% |
| Affiliative | 10 | 6.1% |
| Expert | 7 | 4.2% |
| Advisor | 3 | 1.8% |
| Unable-to-engage | 2 | 1.2% |
| Reflector | 2 | 1.2% |
| Others | 4 | 2.4% |

**Key Finding:**
- 69.7% of conversations have Facilitator as the dominant AI role
- Average probability is 58.1%, meaning Facilitator appears in many conversations even when not dominant

---

## 🔗 Role Pairs (Human → AI)

*Most common combinations of human and AI roles*

| Human → AI | Count | Percentage |
|------------|-------|------------|
| **Seeker → Facilitator** | 84 | **50.9%** |
| Collaborator → Facilitator | 22 | 13.3% |
| Seeker → Peer | 16 | 9.7% |
| Sharer → Facilitator | 9 | 5.5% |
| Seeker → Expert | 7 | 4.2% |
| Seeker → Affiliative | 6 | 3.6% |
| Collaborator → Peer | 5 | 3.0% |
| Seeker → Advisor | 3 | 1.8% |
| Sharer → Affiliative | 3 | 1.8% |
| Seeker → Unable-to-engage | 2 | 1.2% |
| Others | 8 | 4.8% |

**Visual:**
```
Seeker → Facilitator:       █████████████████████████ 50.9%
Collaborator → Facilitator: ██████ 13.3%
Seeker → Peer:              ████ 9.7%
Sharer → Facilitator:       ██ 5.5%
Seeker → Expert:            ██ 4.2%
```

**Key Findings:**
1. **50.9%** of conversations follow the **Seeker → Facilitator** pattern
2. **69.7%** involve **Facilitator** as AI role (84 + 22 + 9 + 1 = 116 conversations)
3. **73.9%** involve **Seeker** as human role (122 conversations)
4. Only **4.2%** use **Expert** as AI role (vs. 10.5% average probability)

---

## 📈 Key Insights

### 1. Facilitator is Highly Prominent
- **58.1%** average probability (highest of all AI roles)
- **69.7%** of conversations have Facilitator as dominant role
- Consistent with dataset's relationship-building focus (63.4%)

### 2. Seeker is Most Common Human Role
- **51.7%** average probability
- **73.9%** have Seeker as dominant role
- Less concentrated than in Chatbot Arena (73.5% average, likely higher dominance)

### 3. Role Diversity
- **Human roles:** 5 roles with >5% average probability
- **AI roles:** 6 roles with >5% average probability
- More diverse than typical task-oriented datasets

### 4. Most Common Pattern
- **Seeker → Facilitator:** 50.9% of conversations
- This is the "typical" conversational pattern for this dataset
- Consistent with casual, relationship-building conversations

---

## 🔄 Comparison with Chatbot Arena

| Metric | This Dataset | Chatbot Arena | Difference |
|--------|-------------|---------------|------------|
| **Human: Seeker** | 51.7% (avg) | 73.5% (avg) | ↓ 22% |
| **Human: Seeker** | 73.9% (dominant) | ~78% (dominant) | ↓ 4% |
| **AI: Facilitator** | 58.1% (avg) | 41.0% (avg) | ↑ 17% |
| **AI: Facilitator** | 69.7% (dominant) | ~20% (dominant) | ↑ 50% |
| **AI: Expert** | 10.5% (avg) | 34.0% (avg) | ↓ 24% |
| **AI: Expert** | 4.2% (dominant) | ~35% (dominant) | ↓ 31% |
| **Most Common Pair** | Seeker→Facilitator (50.9%) | Seeker→Expert (~35%) | Different pattern |

**Key Differences:**
1. **This dataset uses Facilitator much more** (58% vs. 41%)
2. **This dataset uses Expert much less** (10% vs. 34%)
3. **This dataset has more role diversity** (more spread across roles)
4. **Different dominant pattern** (Seeker→Facilitator vs. Seeker→Expert)

**Why?**
- This dataset: Movie dialogues + empathetic dialogues = relationship-building, conversational
- Chatbot Arena: Evaluation context = task-oriented, information-seeking
- **Dataset source shapes role distributions significantly**

---

## 💡 Interpretation

### What the Distributions Mean

**Average Probabilities:**
- Shows how roles are weighted across all conversations
- Roles can overlap (conversation can have 60% Seeker, 30% Learner, 10% Sharer)
- Lower numbers indicate role diversity or uncertainty

**Dominant Role Count:**
- Shows how many conversations have each role as "most likely"
- Clearer for understanding primary patterns
- Higher numbers indicate more consistent patterns

### Why Facilitator is So Common

1. **Dataset type:** Conversation dialogues focus on relationship-building (63.4%)
2. **Facilitator role:** Supports conversation flow, relationship development
3. **Less task-oriented:** Expert role (10%) is less common than in task-oriented datasets (34%)
4. **Consistent pattern:** Facilitator pairs well with Seeker in casual conversations

---

## 📊 Summary Table

| Role Type | Most Common | Average | Dominant Count | Dominant % |
|-----------|-------------|---------|----------------|------------|
| **Human** | Seeker | 51.7% | 122 | 73.9% |
| **AI** | Facilitator | 58.1% | 115 | 69.7% |
| **Pair** | Seeker→Facilitator | - | 84 | 50.9% |

---

**Location:** Full analysis in `COMPLETE_ANALYSIS_REPORT.md`

