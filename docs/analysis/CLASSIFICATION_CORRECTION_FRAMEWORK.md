# Classification Correction Framework

**Purpose**: Systematic approach to identifying and correcting misclassified conversations
**Version**: 1.0
**Date**: 2026-01-05

---

## Quick Reference Checklist

Use this checklist when reviewing any classified conversation:

### 🔍 Pattern Detection

- [ ] **Pseudo-Problem-Solving**: 3+ questions + high emotion + low AI helpfulness?
- [ ] **Role Imbalance**: Seeker > 60% or Sharer < 5%?
- [ ] **Collaboration Missed**: Iterative feedback without Collaborator/Director role?
- [ ] **Emotional Processing**: High arousal (>0.5) + personal content?
- [ ] **Multi-Purpose**: Topic shifts or mixed functional/social content?
- [ ] **Testing/Playful**: Directive modifications or AI capability testing?
- [ ] **Philosophical**: Meaning-making without appropriate depth recognition?

### 📊 Quantitative Flags

- [ ] **Human Seeker** > 50%? → Check for Sharer/Director
- [ ] **AI Expert** > 50%? → Check for Affiliative/Facilitator
- [ ] **Arousal** > 0.5 consistently? → Check for emotional processing
- [ ] **AI responses** repetitive/unhelpful? → Purpose may not be information-seeking
- [ ] **3+ refinement cycles**? → Check for Collaborator role

### 🎯 Classification Verification

- [ ] Does **X-axis** position match Functional vs Social content ratio?
- [ ] Does **purpose** align with user persistence patterns?
- [ ] Does **interaction pattern** capture the conversation structure?
- [ ] Are **PAD values** reflected in role distributions?

---

## Step-by-Step Correction Process

### Step 1: Read Conversation Holistically

**Goal**: Understand the conversation arc without looking at classification

**Questions**:
1. What does the user seem to *really* want? (Not what they're asking)
2. Is the user getting what they came for?
3. What role is the user playing? (Beyond just "asking questions")
4. How is the AI responding? (Helper, partner, wall to talk at?)

**Red Flags**:
- User continues despite getting answers (suggests other goal)
- Questions become more personal/emotional (shift toward social)
- AI gives same type of response repeatedly (suggests mismatch)

### Step 2: Analyze PAD Values

**Goal**: Emotional trajectory informs purpose and roles

**Check**:
```
Average Arousal > 0.5? → Emotional engagement
Average Pleasure < 0.5? → Negative emotions (anxiety, frustration, sadness)
Dominance fluctuation > 0.2? → Power dynamic shifts
Emotional Intensity > 0.5? → High stakes, personal investment
```

**Corrections**:
- High arousal + personal content → Add Sharer role (15-30%)
- High emotional intensity → Add Affiliative AI role (15-25%)
- Low dominance → Check if user is vulnerable/seeking support

### Step 3: Count Interaction Patterns

**Goal**: Quantify structure to detect patterns

**Count**:
```python
questions = [turns where user asks "?"]
feedback_statements = ["improve", "better", "issues", "wrong", "fix"]
personal_disclosures = ["I feel", "my", personal pronouns + emotions]
directive_commands = ["rewrite", "change", "add", "make it"]
refinement_cycles = [AI response → User critique → AI revision]
```

**Decision Rules**:

| Pattern | Trigger | Correction |
|---------|---------|------------|
| **Pseudo-Problem-Solving** | questions ≥ 3 AND avg_arousal > 0.5 AND AI_specificity < 0.4 | Purpose: "emotional-processing"<br>X-axis: +0.10-0.15 |
| **Collaboration** | feedback_statements ≥ 2 AND refinement_cycles ≥ 2 | Human: +30% Collaborator/Director<br>AI: +25% Learner |
| **Testing/Exploration** | directive_commands ≥ 3 OR capability_questions ≥ 2 | Human: +35% Director/Tester<br>Purpose: "capability-exploration" |
| **Emotional Sharing** | personal_disclosures ≥ 3 AND avg_arousal > 0.5 | Human: +30% Sharer<br>AI: +20% Affiliative |

### Step 4: Verify Role Distributions

**Goal**: Ensure roles match actual behaviors

**Human Role Guidelines**:

| Role | Behavioral Indicators | Typical % Range |
|------|----------------------|------------------|
| **Seeker** | Asks questions, requests information | 20-40% |
| **Sharer** | Personal disclosure, "I feel/think", vulnerability | 10-35% |
| **Learner** | Asks follow-ups, "explain", "how does" | 15-30% |
| **Director** | Commands, "do X", "change Y", high dominance | 10-40% |
| **Collaborator** | Feedback, builds on AI ideas, "what if we" | 10-30% |
| **Challenger** | Disagrees, "but", tests AI logic | 5-25% |

**AI Role Guidelines**:

| Role | Behavioral Indicators | Typical % Range |
|------|----------------------|------------------|
| **Expert** | Explains, defines, authoritative tone | 20-45% |
| **Advisor** | Suggests, recommends, "you could" | 15-35% |
| **Facilitator** | Asks questions, guides exploration | 10-30% |
| **Reflector** | Mirrors, summarizes, validates | 10-25% |
| **Peer** | Casual, conversational, shares opinions | 5-25% |
| **Affiliative** | Empathizes, "I understand", emotional validation | 10-30% |

**Red Flag Distributions**:
- ❌ Any single role > 70% (too extreme)
- ❌ Seeker > 50% without Sharer (missing emotional context)
- ❌ Expert > 50% without Affiliative (missing emotional support)
- ❌ 0% in role that seems obviously present

### Step 5: Calculate Corrected X-Axis

**Goal**: Position conversation on Functional↔Social spectrum

**Formula**:
```
functional_score = 0
social_score = 0

# Content analysis
functional_score += (task_words * 0.15)  # "how to", "calculate", "steps"
functional_score += (information_requests * 0.20)  # Factual questions
functional_score += (technical_terms * 0.10)  # Domain-specific vocabulary

social_score += (emotional_words * 0.15)  # "feel", "think", "believe"
social_score += (personal_pronouns * 0.20)  # "I", "my", "me"
social_score += (avg_arousal * 0.25)  # Emotional engagement

# Role-based adjustment
functional_score += (expert_role + advisor_role) * 0.15
social_score += (sharer_role + affiliative_role) * 0.15

# Purpose adjustment
if purpose == "entertainment" or "self-expression":
    social_score += 0.15
if purpose == "information-seeking" or "problem-solving":
    functional_score += 0.10

# Normalize to 0-1 scale
total = functional_score + social_score
x_axis = functional_score / total  # 0 = Social, 1 = Functional
```

**Adjustment Guidelines**:
- High personal disclosure → X should be 0.45-0.65 (mixed)
- Pure technical Q&A → X should be 0.30-0.45 (functional-leaning)
- Philosophical dialogue → X should be 0.50-0.70 (social-leaning)
- Emotional processing → X should be 0.55-0.75 (social)

### Step 6: Assign Corrected Purpose

**Goal**: Identify primary and secondary purposes

**Purpose Decision Tree**:

```
START
  │
  ├─ Entertainment/creative content requested?
  │   ├─ YES → Purpose: "entertainment"
  │   └─ NO → Continue
  │
  ├─ Personal feelings/experiences shared (3+ instances)?
  │   ├─ YES → Purpose: "self-expression" or "emotional-processing"
  │   └─ NO → Continue
  │
  ├─ Questions asked (3+) AND AI provides useful answers?
  │   ├─ YES → Purpose: "information-seeking"
  │   └─ NO → Continue
  │
  ├─ Questions asked (3+) BUT AI answers unhelpful?
  │   ├─ YES + High arousal → Purpose: "emotional-processing"
  │   └─ YES + Low arousal → Purpose: "exploration" or "AI-testing"
  │
  ├─ Iterative feedback/refinement (2+ cycles)?
  │   ├─ YES → Purpose: "collaborative-problem-solving"
  │   └─ NO → Continue
  │
  ├─ Philosophical/meaning-making language?
  │   ├─ YES → Purpose: "philosophical-dialogue"
  │   └─ NO → Purpose: "general-conversation"
```

**Multi-Purpose Detection**:
- If ≥2 distinct topics: Segment conversation OR label "multi-purpose"
- If purpose shifts mid-conversation: Use dominant purpose + note shift
- If 50/50 split: Use hybrid label (e.g., "info-seeking + emotional-processing")

### Step 7: Document Correction

**Format**:
```markdown
## Correction: [conversation_id]

### Original Classification
- Purpose: [original]
- Human Roles: [distribution]
- AI Roles: [distribution]
- X-axis: [value]

### Issues Identified
1. [Pattern name]: [Evidence]
2. [Specific metric]: [Issue]

### Corrected Classification
- Purpose: [new] (was: [old])
- Human Roles: [new distribution] (changes: +X% Role, -Y% Role)
- AI Roles: [new distribution] (changes: ...)
- X-axis: [new value] (Δ = +0.XX)

### Rationale
[2-3 sentence explanation of why correction was made]

### Impact
- Cluster: [old] → [new] (if changed)
- Positioning: [description of spatial shift]
```

---

## Common Misclassification Patterns

### Pattern A: Seeker-Heavy Imbalance

**Symptoms**:
- Human Seeker > 60%
- Human Sharer < 10%
- User asks questions but shares personal context

**Cause**: Question marks trigger automatic Seeker classification

**Fix**:
```python
if seeker_role > 0.5 and personal_disclosure_count >= 2:
    sharer_role = min(0.35, personal_disclosure_count * 0.1)
    seeker_role = 1 - sharer_role - (learner + director + collaborator + challenger)
```

**Example**: chatbot_arena_16515 (Medical advice with vulnerable sharing)

### Pattern B: Expert-Heavy Imbalance

**Symptoms**:
- AI Expert > 60%
- AI Affiliative = 0%
- User shows high emotional intensity

**Cause**: Informational content triggers Expert, ignores emotional context

**Fix**:
```python
if expert_role > 0.5 and avg_user_arousal > 0.5:
    affiliative_role = min(0.3, avg_user_arousal * 0.4)
    expert_role = 1 - affiliative_role - (advisor + facilitator + reflector + peer)
```

**Example**: Medical, relationship, or personal problem discussions

### Pattern C: Collaboration Blindness

**Symptoms**:
- User provides feedback/critique
- AI acknowledges and revises
- Collaborator role = 0%
- Director role = 0%

**Cause**: Feedback not recognized as collaborative signal

**Fix**:
```python
feedback_keywords = ["improve", "better", "issues", "problems", "wrong", "change", "fix"]
refinement_count = count_refinement_cycles(conversation)

if any(keyword in user_messages) and refinement_count >= 2:
    human_collaborator_role += 0.25
    human_director_role += 0.15
    ai_learner_role += 0.20
```

**Example**: chatbot_arena_29587 (River crossing puzzle refinement)

### Pattern D: Pseudo-Problem-Solving

**Symptoms**:
- 3+ questions from user
- AI provides generic/repetitive advice
- User continues anyway
- High emotional intensity

**Cause**: Q&A format assumes information-seeking, misses emotional processing

**Fix**:
```python
if question_count >= 3 and ai_helpfulness < 0.4 and avg_arousal > 0.5:
    purpose = "emotional-processing" (not "information-seeking")
    human_sharer_role += 0.25
    ai_affiliative_role += 0.20
    x_axis += 0.12  # Shift toward Social
```

**Example**: User venting about relationship through questions

### Pattern E: Testing/Capability Exploration

**Symptoms**:
- Directive language ("do X", "rewrite as Y")
- Multiple refinements of same task
- Questions about AI's abilities
- Low stakes/playful tone

**Cause**: Commands misinterpreted as simple requests

**Fix**:
```python
directive_count = count_directives(conversation)  # "rewrite", "change", "add"
capability_questions = count_meta_questions(conversation)  # "can you", "do you"

if directive_count >= 3 or capability_questions >= 2:
    purpose_secondary = "AI-testing"
    human_director_role += 0.30
    human_tester_role = 0.20  # New role
```

**Example**: chatbot_arena_0440 (Iterative joke refinement)

---

## Automated Detection Scripts

### Script 1: Pseudo-Problem-Solving Detector

```python
def detect_pseudo_problem_solving(conversation):
    """
    Detects conversations where emotional processing is disguised as questions
    """
    questions = [turn for turn in conversation if is_question(turn['content'])]
    question_count = len(questions)

    # Calculate AI helpfulness
    ai_responses = [turn for turn in conversation if turn['role'] == 'assistant']
    ai_specificity = measure_specificity(ai_responses)  # 0-1 scale
    ai_repetition = measure_repetition(ai_responses)  # 0-1 scale
    ai_helpfulness = (ai_specificity - ai_repetition) / 2

    # Calculate emotional engagement
    user_turns = [turn for turn in conversation if turn['role'] == 'user']
    avg_arousal = mean([turn['pad']['arousal'] for turn in user_turns])
    avg_intensity = mean([turn['pad']['emotionalIntensity'] for turn in user_turns])

    # Detection logic
    if question_count >= 3 and ai_helpfulness < 0.4 and avg_arousal > 0.5:
        confidence = min(0.9, (question_count / 5) * (avg_arousal / 0.5) * (0.4 / ai_helpfulness))
        return {
            'detected': True,
            'confidence': confidence,
            'evidence': {
                'question_count': question_count,
                'ai_helpfulness': ai_helpfulness,
                'avg_arousal': avg_arousal,
                'avg_intensity': avg_intensity
            },
            'correction': {
                'purpose': 'emotional-processing',
                'human_sharer_role': '+25%',
                'ai_affiliative_role': '+20%',
                'x_axis_adjustment': '+0.12'
            }
        }

    return {'detected': False}
```

### Script 2: Collaboration Detector

```python
def detect_collaboration(conversation):
    """
    Detects iterative collaborative refinement patterns
    """
    feedback_keywords = [
        'improve', 'better', 'issues', 'problems', 'wrong',
        'change', 'fix', 'modify', 'adjust', 'revise'
    ]

    directive_keywords = [
        'rewrite', 'redo', 'try again', 'make it',
        'add', 'remove', 'include', 'exclude'
    ]

    # Count feedback and directives
    user_turns = [turn['content'].lower() for turn in conversation if turn['role'] == 'user']
    feedback_count = sum(1 for turn in user_turns if any(kw in turn for kw in feedback_keywords))
    directive_count = sum(1 for turn in user_turns if any(kw in turn for kw in directive_keywords))

    # Count refinement cycles
    refinement_cycles = count_refinement_patterns(conversation)

    # Detection logic
    if (feedback_count >= 2 or directive_count >= 3) and refinement_cycles >= 2:
        confidence = min(0.95, (feedback_count + directive_count) / 8 + refinement_cycles / 5)
        return {
            'detected': True,
            'confidence': confidence,
            'evidence': {
                'feedback_count': feedback_count,
                'directive_count': directive_count,
                'refinement_cycles': refinement_cycles
            },
            'correction': {
                'purpose': 'collaborative-problem-solving',
                'human_collaborator_role': '+25%',
                'human_director_role': '+15%',
                'ai_learner_role': '+20%'
            }
        }

    return {'detected': False}

def count_refinement_patterns(conversation):
    """
    Counts AI_response → User_critique → AI_revision cycles
    """
    cycles = 0
    for i in range(2, len(conversation)):
        if (conversation[i-2]['role'] == 'assistant' and
            conversation[i-1]['role'] == 'user' and
            conversation[i]['role'] == 'assistant'):

            # Check if user turn contains critique/feedback
            user_content = conversation[i-1]['content'].lower()
            critique_markers = ['issue', 'problem', 'wrong', 'better', 'improve']
            if any(marker in user_content for marker in critique_markers):
                cycles += 1

    return cycles
```

### Script 3: Role Rebalancer

```python
def rebalance_roles(conversation, current_classification):
    """
    Adjusts role distributions based on content analysis
    """
    corrections = {}

    # Extract metrics
    user_turns = [turn for turn in conversation if turn['role'] == 'user']
    questions = count_questions(user_turns)
    personal_disclosures = count_personal_disclosure(user_turns)
    avg_arousal = mean([turn['pad']['arousal'] for turn in user_turns])

    # Human role corrections
    human_roles = current_classification['humanRole']['distribution']

    # Seeker-Sharer rebalancing
    if human_roles.get('seeker', 0) > 0.5 and personal_disclosures >= 2:
        sharer_boost = min(0.30, personal_disclosures * 0.08 + avg_arousal * 0.20)
        corrections['human_sharer'] = sharer_boost
        corrections['human_seeker'] = -sharer_boost

    # Director detection
    directives = count_directives(user_turns)
    if directives >= 3 and human_roles.get('director', 0) < 0.1:
        director_boost = min(0.35, directives * 0.08)
        corrections['human_director'] = director_boost
        corrections['human_seeker'] = corrections.get('human_seeker', 0) - director_boost / 2
        corrections['human_learner'] = corrections.get('human_learner', 0) - director_boost / 2

    # AI role corrections
    ai_roles = current_classification['aiRole']['distribution']

    # Affiliative boost for emotional content
    if avg_arousal > 0.5 and ai_roles.get('affiliative', 0) < 0.15:
        affiliative_boost = min(0.25, (avg_arousal - 0.5) * 0.5)
        corrections['ai_affiliative'] = affiliative_boost
        corrections['ai_expert'] = -affiliative_boost * 0.6
        corrections['ai_advisor'] = -affiliative_boost * 0.4

    return corrections
```

### Script 4: X-Axis Calculator

```python
def calculate_corrected_x_axis(conversation, current_classification):
    """
    Calculates Functional↔Social positioning (X-axis)
    0.0 = Fully Social, 1.0 = Fully Functional
    """
    functional_score = 0
    social_score = 0

    # Content-based scoring
    user_turns = [turn for turn in conversation if turn['role'] == 'user']
    all_turns = [turn for turn in conversation]

    # Functional indicators
    task_words = count_keywords(all_turns, ['how to', 'calculate', 'steps', 'method', 'process'])
    technical_terms = count_technical_vocabulary(all_turns)
    information_requests = count_factual_questions(user_turns)

    functional_score += task_words * 0.15
    functional_score += technical_terms * 0.10
    functional_score += information_requests * 0.20

    # Social indicators
    emotional_words = count_keywords(all_turns, ['feel', 'think', 'believe', 'love', 'hate', 'hope'])
    personal_pronouns = count_keywords(user_turns, ['I', 'my', 'me', 'mine'])
    avg_arousal = mean([turn['pad']['arousal'] for turn in user_turns])

    social_score += emotional_words * 0.15
    social_score += personal_pronouns * 0.20
    social_score += avg_arousal * 0.25

    # Role-based adjustment
    human_roles = current_classification['humanRole']['distribution']
    ai_roles = current_classification['aiRole']['distribution']

    functional_score += (ai_roles.get('expert', 0) + ai_roles.get('advisor', 0)) * 0.15
    social_score += (human_roles.get('sharer', 0) + ai_roles.get('affiliative', 0)) * 0.15

    # Purpose-based adjustment
    purpose = current_classification['conversationPurpose']['category']
    if purpose in ['entertainment', 'self-expression', 'relationship-building']:
        social_score += 0.15
    elif purpose in ['information-seeking', 'problem-solving']:
        functional_score += 0.10

    # Normalize to 0-1 scale (inverted so 0=Social, 1=Functional)
    total = functional_score + social_score
    if total == 0:
        return 0.5  # Neutral default

    x_axis = functional_score / total

    return {
        'x_axis': x_axis,
        'functional_score': functional_score,
        'social_score': social_score,
        'confidence': min(0.9, total / 2.0)  # Higher total = higher confidence
    }
```

---

## Usage Guide

### When to Use This Framework

**Always use for**:
- Conversations flagged by automated detectors
- Random quality checks (10% of classifications)
- Edge cases or ambiguous conversations
- User-reported misclassifications

**How to apply**:

1. Run automated detection scripts
2. If any flags raised → Full manual review using Steps 1-7
3. Document corrections in standard format
4. Re-calculate spatial coordinates
5. Update classification in database

### Batch Processing

For large-scale reprocessing:

```python
def batch_correction_pipeline(conversations):
    corrections = []

    for conv in conversations:
        # Run detectors
        pseudo = detect_pseudo_problem_solving(conv)
        collab = detect_collaboration(conv)
        rebalance = rebalance_roles(conv, conv['classification'])
        x_axis = calculate_corrected_x_axis(conv, conv['classification'])

        # Aggregate corrections
        if pseudo['detected'] or collab['detected'] or len(rebalance) > 0:
            correction = {
                'conversation_id': conv['id'],
                'detections': {
                    'pseudo_problem_solving': pseudo,
                    'collaboration': collab,
                    'role_rebalancing': rebalance,
                    'x_axis_recalc': x_axis
                },
                'requires_review': True
            }
            corrections.append(correction)

    return corrections
```

---

## Quality Metrics

Track correction effectiveness:

```python
# Before correction
before = {
    'seeker_avg': 0.45,
    'sharer_avg': 0.06,
    'x_axis_avg': 0.42
}

# After correction
after = {
    'seeker_avg': 0.28,
    'sharer_avg': 0.18,
    'x_axis_avg': 0.50
}

# Improvement
improvement = {
    'seeker_balance': (0.45 - 0.28) / 0.45 * 100,  # 37.8% reduction
    'sharer_increase': (0.18 - 0.06) / 0.06 * 100,  # 200% increase
    'x_axis_shift': 0.50 - 0.42  # +0.08 toward balance
}
```

---

## Future Enhancements

1. **Machine Learning Validation**:
   - Train classifier on manually corrected conversations
   - A/B test original vs. corrected classifications
   - Measure which predicts human judgment better

2. **Conversation Segmentation**:
   - Auto-detect topic shifts
   - Classify segments independently
   - Aggregate weighted results

3. **Temporal Dynamics**:
   - Track role changes through conversation
   - Detect purpose evolution
   - Generate "conversation arc" visualizations

4. **Extended Taxonomy**:
   - Add missing human roles (Teacher, Philosopher, Artist, Tester)
   - Add missing AI roles (Learner, Creative-Partner, Unable-to-Engage)
   - Create sub-categories for purposes

---

## Resources

- **Pattern Analysis**: [MISCLASSIFICATION_PATTERNS_ANALYSIS.md](./MISCLASSIFICATION_PATTERNS_ANALYSIS.md)
- **Original Classifier**: `/classifier/classifier-openai.py`
- **PAD Values Guide**: `/docs/calculations/AXIS_VALUES_EXPLAINED.md`
- **Spatial Coordinates**: `/docs/calculations/CALCULATED_DIMENSIONS.md`
