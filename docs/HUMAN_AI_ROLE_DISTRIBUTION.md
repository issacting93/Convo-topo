# Human-AI Role Distribution Analysis

## Dataset Overview
- **Total conversations:** 345
- **Conversations with role data:** 345 (100%)

## Key Findings

### 1. Extreme Skew Toward Information-Seeking

**Human Roles:**
- **Seeker: 89.3%** (308 conversations) - Dominant role
- Director: 7.8% (27 conversations)
- Learner: 1.2% (4 conversations)
- Sharer: 0.9% (3 conversations)
- Collaborator: 0.6% (2 conversations)
- Challenger: 0.3% (1 conversation)

**AI Roles:**
- **Expert: 84.6%** (292 conversations) - Dominant role
- Advisor: 8.7% (30 conversations)
- Affiliative: 2.6% (9 conversations)
- Peer: 2.6% (9 conversations)
- Facilitator: 0.9% (3 conversations)
- Reflector: 0.6% (2 conversations)

### 2. Dominant Pattern: Seeker → Expert

**81.2% of conversations** follow the pattern: **Seeker → Expert**

This is the classic information-seeking interaction:
- Human asks questions (seeker)
- AI provides answers (expert)

### 3. Average Probability Distribution

**Human Roles (average probability across all conversations):**
- Seeker: 0.688 (68.8%)
- Learner: 0.120 (12.0%)
- Director: 0.114 (11.4%)
- Collaborator: 0.033 (3.3%)
- Sharer: 0.031 (3.1%)
- Challenger: 0.018 (1.8%)

**AI Roles (average probability across all conversations):**
- Expert: 0.646 (64.6%)
- Advisor: 0.204 (20.4%)
- Facilitator: 0.053 (5.3%)
- Affiliative: 0.039 (3.9%)
- Peer: 0.040 (4.0%)
- Reflector: 0.026 (2.6%)

## Role Combinations

| Human → AI | Count | Percentage |
|------------|-------|------------|
| **seeker → expert** | **280** | **81.2%** |
| seeker → advisor | 21 | 6.1% |
| director → expert | 10 | 2.9% |
| director → peer | 8 | 2.3% |
| director → affiliative | 5 | 1.4% |
| learner → advisor | 4 | 1.2% |
| seeker → affiliative | 4 | 1.2% |
| director → advisor | 4 | 1.2% |
| Other combinations | 9 | 2.6% |

## Interpretation

### What This Reveals

1. **Dataset Bias Confirmed:**
   - 89.3% seeker role confirms Chatbot Arena's evaluation context
   - Users are testing models, not genuinely seeking help
   - Creates a very specific relational pattern

2. **Relational Positioning:**
   - Overwhelmingly **functional/structured** (seeker/expert)
   - Very few **relational/emergent** patterns (sharer, collaborator, peer)
   - Almost no **challenging** dynamics (challenger role: 0.3%)

3. **Power Dynamics:**
   - Clear **asymmetry**: Human seeks, AI provides
   - Very few **balanced** interactions (collaborator, peer)
   - AI rarely takes **directive** role (director: 0%)

4. **Missing Patterns:**
   - No human "expert" role (humans don't teach AI in this dataset)
   - No AI "seeker" role (AI doesn't ask questions)
   - Very few "challenger" interactions (no pushback/critique)

## Critical Design Implications

### For DIS Submission

**This distribution is revealing, not limiting:**

1. **Shows evaluation context:**
   - The 89.3% seeker role reveals how evaluation contexts shape relational positioning
   - The visualization makes visible what evaluation contexts produce

2. **Reveals what's missing:**
   - The absence of relational/emergent patterns reveals what evaluation contexts exclude
   - The lack of challenging dynamics shows what becomes invisible

3. **Demonstrates encoding choices:**
   - The role taxonomy makes certain patterns visible (seeker/expert)
   - Other patterns (collaboration, challenge) become rare or invisible

4. **Validates spatial clustering:**
   - The 81.2% seeker→expert pattern explains why most conversations cluster in functional/structured space
   - The small clusters (3.8%) are the rare relational/emergent patterns

## Comparison with Cluster Analysis

The role distribution aligns with cluster findings:

- **Cluster 1 (StraightPath):** 87.2% - Matches seeker→expert pattern
- **Cluster 2 (Valley):** Low emotional intensity - Still seeker→expert but with different emotional pattern
- **Small clusters (SocialEmergent, MeanderingPath):** The rare relational patterns (sharer, collaborator, peer)

## Recommendations

### For Analysis:
1. **Acknowledge the bias explicitly:**
   - "89.3% seeker role reflects Chatbot Arena's evaluation context"
   - "This is not a limitation but reveals how evaluation contexts shape relational positioning"

2. **Foreground the rare patterns:**
   - The 2.6% relational patterns (sharer, collaborator, peer) are particularly interesting
   - They reveal what becomes visible when evaluation contexts are disrupted

3. **Use for critical design:**
   - The extreme skew is perfect for critical design
   - Shows how evaluation contexts produce particular relational configurations
   - Reveals what becomes invisible in evaluation contexts

### For Future Work:
1. **Collect diverse conversations:**
   - More relational/emergent patterns
   - More challenging dynamics
   - More collaborative interactions

2. **Compare contexts:**
   - Chatbot Arena (evaluation) vs. WildChat (organic)
   - See if role distributions differ across contexts

3. **Human annotation:**
   - Compare AI role classification with human perception
   - Reveal differences in how AI and humans interpret roles

## Conclusion

The role distribution reveals:
- **Extreme skew** toward information-seeking (89.3% seeker)
- **Dominant pattern** of seeker→expert (81.2%)
- **Missing patterns** of relational/emergent interactions
- **Evaluation context** shaping relational positioning

For critical design, this is perfect: **the distribution reveals how evaluation contexts produce particular relational configurations, making visible what becomes invisible in typical evaluation settings.**

