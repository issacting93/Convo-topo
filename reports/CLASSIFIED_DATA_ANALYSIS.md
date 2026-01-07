================================================================================
CLASSIFIED DATA DEEP DIVE ANALYSIS
================================================================================
Generated: 2026-01-01T22:18:42.071775

================================================================================
1. DATA COMPLETENESS
================================================================================
Total conversations: 160
With classification: 160 (100.0%)
With messages: 160 (100.0%)
With PAD data: 160 (100.0%)
Complete classifications: 158 (98.8%)

Missing dimensions:
  - topicDepth: 2 conversations

Unknown dimensions:

Missing PAD: 0 conversations
Missing humanRole: 0 conversations
Missing aiRole: 0 conversations
Missing both roles: 0 conversations

================================================================================
2. CLASSIFIER PERFORMANCE
================================================================================
Conversations without metadata: 0
Average processing time: 35796ms
Median processing time: 31329ms

By Provider:
  unknown:
    Total: 103
    Complete: 103 (100.0%)
    Incomplete: 0
    Missing PAD: 0
    Avg confidence: 0.833
    Models: {'unknown': 103}
  openai:
    Total: 37
    Complete: 35 (94.6%)
    Incomplete: 2
    Missing PAD: 0
    Avg confidence: 0.831
    Models: {'gpt-4': 35, 'gpt-4o-mini': 2}
  openassistant:
    Total: 20
    Complete: 20 (100.0%)
    Incomplete: 0
    Missing PAD: 0
    Avg confidence: 0.830
    Models: {'unknown': 20}

By Model:
  unknown: 123 conversations (100.0% complete)
  gpt-4: 35 conversations (100.0% complete)
  gpt-4o-mini: 2 conversations (0.0% complete)

================================================================================
3. CLASSIFICATION DISTRIBUTIONS
================================================================================

interactionPattern:
  question-answer: 80 (50.0%)
  storytelling: 64 (40.0%)
  casual-chat: 8 (5.0%)
  advisory: 8 (5.0%)

powerDynamics:
  human-led: 147 (91.9%)
  balanced: 9 (5.6%)
  ai-led: 4 (2.5%)

emotionalTone:
  neutral: 106 (66.2%)
  supportive: 21 (13.1%)
  professional: 12 (7.5%)
  playful: 11 (6.9%)
  serious: 9 (5.6%)
  empathetic: 1 (0.6%)

engagementStyle:
  questioning: 69 (43.1%)
  exploring: 62 (38.8%)
  reactive: 27 (16.9%)
  affirming: 2 (1.2%)

knowledgeExchange:
  factual-info: 91 (56.9%)
  skill-sharing: 33 (20.6%)
  opinion-exchange: 15 (9.4%)
  experience-sharing: 11 (6.9%)
  personal-sharing: 9 (5.6%)
  storytelling: 1 (0.6%)

conversationPurpose:
  information-seeking: 131 (81.9%)
  entertainment: 8 (5.0%)
  problem-solving: 8 (5.0%)
  self-expression: 7 (4.4%)
  relationship-building: 6 (3.8%)

topicDepth:
  surface: 104 (65.0%)
  deep: 27 (16.9%)
  moderate: 27 (16.9%)

turnTaking:
  balanced: 113 (70.6%)
  user-dominant: 46 (28.7%)
  assistant-dominant: 1 (0.6%)

Human Role Distribution (average probabilities):
  seeker: 0.674
  learner: 0.172
  director: 0.055
  collaborator: 0.033
  sharer: 0.045
  challenger: 0.022

AI Role Distribution (average probabilities):
  expert: 0.613
  advisor: 0.247
  facilitator: 0.061
  reflector: 0.031
  peer: 0.017
  affiliative: 0.030

================================================================================
4. PAD (PLEASURE-AROUSAL-DOMINANCE) ANALYSIS
================================================================================
Conversations with PAD: 160
Total messages: 1893
Messages with PAD: 1893
PAD coverage: 100.0%

Pleasure:
  Mean: 0.591
  Median: 0.600
  Range: [0.100, 0.900]
  StdDev: 0.141
Arousal:
  Mean: 0.400
  Median: 0.400
  Range: [0.100, 0.800]
  StdDev: 0.111
Dominance:
  Mean: 0.469
  Median: 0.500
  Range: [0.100, 0.800]
  StdDev: 0.092
Emotional_intensity:
  Mean: 0.405
  Median: 0.400
  Range: [0.100, 0.740]
  StdDev: 0.086

================================================================================
5. MESSAGE STATISTICS
================================================================================
Average messages per conversation: 11.8
Median messages per conversation: 12.0
Message count range: [10, 24]

Conversations by length:
  medium: 98
  short: 61
  long: 1

Role distribution:
  assistant: 995
  user: 898

Average message length: 323 characters

================================================================================
6. DATA QUALITY ISSUES
================================================================================
✅ No major data quality issues detected

================================================================================
END OF REPORT
================================================================================