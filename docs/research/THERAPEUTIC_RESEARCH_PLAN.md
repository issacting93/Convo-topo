# Plan: Conversational Topography as a Research Tool for Therapeutic Communication Patterns

## Overview
Adapt Conversational Topography to study therapeutic communication patterns while maintaining its research/analytic artifact framing. This version focuses on **research use** with trained professionals, not clinical intervention.

---

## Phase 1: Data Model Extensions

### 1.1 Add Therapeutic Communication Dimensions

**File:** `src/utils/therapeuticClassification.ts`

```typescript
// Extend existing classification with therapeutic-specific dimensions
export interface TherapeuticClassification extends ClassifiedConversation {
  therapeuticDimensions?: {
    // Therapeutic alliance indicators
    allianceStrength?: {
      category: 'strong' | 'moderate' | 'weak' | 'rupture';
      confidence: number;
      evidence: string[];
    };
    
    // Therapeutic interventions
    interventionType?: {
      category: 'exploratory' | 'directive' | 'supportive' | 'interpretive' | 'collaborative';
      confidence: number;
      evidence: string[];
    };
    
    // Client engagement patterns
    clientEngagement?: {
      category: 'active' | 'receptive' | 'resistant' | 'withdrawn';
      confidence: number;
      evidence: string[];
    };
    
    // Emotional regulation indicators
    emotionalRegulation?: {
      category: 'regulated' | 'dysregulated' | 'processing' | 'avoidant';
      confidence: number;
      evidence: string[];
    };
    
    // Therapeutic process markers
    processMarkers?: {
      insight?: number; // 0-1 scale
      resistance?: number;
      collaboration?: number;
      emotionalDepth?: number;
    };
  };
}

// Therapeutic role mappings
export const THERAPEUTIC_ROLES = {
  client: {
    'explorer': 'Actively exploring thoughts/feelings',
    'narrator': 'Sharing experiences/stories',
    'questioner': 'Asking for clarification/guidance',
    'resistant': 'Pushing back or avoiding topics',
    'collaborator': 'Working together on goals',
  },
  therapist: {
    'facilitator': 'Guiding exploration',
    'interpreter': 'Providing insights/reframing',
    'supporter': 'Offering validation/empathy',
    'director': 'Providing structure/guidance',
    'collaborator': 'Co-creating understanding',
  }
} as const;
```

### 1.2 Extend Message Interface

**File:** `src/data/messages.ts`

```typescript
export interface TherapeuticMessage extends Message {
  // Therapeutic-specific metadata
  therapeuticContext?: {
    sessionNumber?: number;
    sessionPhase?: 'opening' | 'working' | 'closing';
    topicFocus?: string[];
    interventionPresent?: boolean;
  };
  
  // Emotional markers
  emotionalMarkers?: {
    valence?: number; // -1 (negative) to 1 (positive)
    arousal?: number; // 0 (calm) to 1 (high arousal)
    regulation?: number; // 0 (dysregulated) to 1 (regulated)
  };
  
  // Therapeutic process indicators
  processIndicators?: {
    insight?: boolean;
    resistance?: boolean;
    alliance?: number; // 0-1
  };
}
```

---

## Phase 2: Visualization Adaptations

### 2.1 Add Therapeutic Metric Lenses

**File:** `src/utils/terrain.ts`

```typescript
export type TherapeuticMetricMode = 
  | 'alliance'      // Therapeutic alliance strength
  | 'engagement'     // Client engagement level
  | 'regulation'     // Emotional regulation
  | 'intervention'  // Intervention presence/type
  | 'process'       // Therapeutic process markers
  | MetricMode;     // Keep existing modes

export interface TherapeuticTerrainParams extends TerrainParams {
  allianceStrength?: number;      // 0-1
  clientEngagement?: number;      // 0-1
  emotionalRegulation?: number; // 0-1
  interventionIntensity?: number; // 0-1
  processDepth?: number;          // 0-1
  therapeuticMetricMode?: TherapeuticMetricMode;
}

export function generateTherapeuticHeightmap(
  size: number,
  seed: number,
  params?: Partial<TherapeuticTerrainParams>
): Float32Array {
  const data = new Float32Array(size * size);
  const metricMode = params?.therapeuticMetricMode ?? 'alliance';
  
  let baseHeight: number;
  let heightRange: number;
  let complexityBoost: number;
  
  switch (metricMode) {
    case 'alliance':
      // Stronger alliance = higher, more stable terrain
      const alliance = params?.allianceStrength ?? 0.5;
      baseHeight = 0.4 + (alliance * 0.4); // 0.4 to 0.8
      heightRange = 0.2 + (alliance * 0.3); // More stable for strong alliance
      complexityBoost = 1.0 + ((1 - alliance) * 0.5); // Less complex when alliance strong
      break;
      
    case 'engagement':
      // Higher engagement = more dynamic terrain
      const engagement = params?.clientEngagement ?? 0.5;
      baseHeight = 0.3 + (engagement * 0.5);
      heightRange = 0.3 + (engagement * 0.4);
      complexityBoost = 1.0 + (engagement * 0.8);
      break;
      
    case 'regulation':
      // Better regulation = smoother terrain
      const regulation = params?.emotionalRegulation ?? 0.5;
      baseHeight = 0.3 + (regulation * 0.5);
      heightRange = 0.2 + ((1 - regulation) * 0.4); // Rougher when dysregulated
      complexityBoost = 1.0 + ((1 - regulation) * 0.6);
      break;
      
    case 'intervention':
      // Intervention presence = distinct features
      const intervention = params?.interventionIntensity ?? 0.5;
      baseHeight = 0.3 + (intervention * 0.4);
      heightRange = 0.3 + (intervention * 0.3);
      complexityBoost = 1.0 + (intervention * 0.5);
      break;
      
    case 'process':
      // Process depth = terrain complexity
      const process = params?.processDepth ?? 0.5;
      baseHeight = 0.3 + (process * 0.5);
      heightRange = 0.3 + (process * 0.4);
      complexityBoost = 1.0 + (process * 0.8);
      break;
      
    default:
      // Fall back to existing metric modes
      return generateHeightmap(size, seed, params);
  }
  
  // Generate terrain using fractal noise (similar to existing implementation)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      
      let height = fractalNoise(
        nx * 4 * complexityBoost, 
        ny * 4 * complexityBoost, 
        6, 
        seed
      );
      
      height += fractalNoise(nx * 8, ny * 8, 4, seed + 50) * 0.5;
      height = height / (1.0 + 0.5);
      height = height * 0.7;
      height = baseHeight + (height - 0.5) * heightRange * 2.0;
      
      data[y * size + x] = Math.max(0.1, Math.min(1.0, height));
    }
  }
  
  return data;
}
```

### 2.2 Update HUD for Therapeutic Metrics

**File:** `src/components/TherapeuticHUDOverlay.tsx`

```typescript
// Add therapeutic metric mode selector
const THERAPEUTIC_METRIC_MODES: TherapeuticMetricMode[] = [
  'alliance',
  'engagement', 
  'regulation',
  'intervention',
  'process',
  'depth',      // Keep existing
  'uncertainty',
  'affect',
  'composite'
];

// In the metric lens section:
<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 6 }}>
    THERAPEUTIC METRIC LENS
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
    {THERAPEUTIC_METRIC_MODES.map((mode) => (
      <button
        key={mode}
        onClick={() => onTherapeuticMetricModeChange(mode)}
        style={{
          padding: '4px 8px',
          background: therapeuticMetricMode === mode
            ? 'rgba(74, 170, 204, 0.3)'
            : 'rgba(74, 170, 204, 0.08)',
          // ... rest of button styling
        }}
      >
        {mode.toUpperCase()}
      </button>
    ))}
  </div>
  <div style={{ fontSize: '11px', opacity: 0.4, marginTop: 4 }}>
    {therapeuticMetricMode === 'alliance' && 'Therapeutic alliance strength'}
    {therapeuticMetricMode === 'engagement' && 'Client engagement level'}
    {therapeuticMetricMode === 'regulation' && 'Emotional regulation state'}
    {therapeuticMetricMode === 'intervention' && 'Therapeutic intervention presence'}
    {therapeuticMetricMode === 'process' && 'Therapeutic process markers'}
    {/* ... existing descriptions */}
  </div>
</div>
```

---

## Phase 3: Research Data Collection

### 3.1 Research Session Tracking

**File:** `src/utils/researchSession.ts`

```typescript
export interface ResearchSession {
  sessionId: string;
  timestamp: Date;
  participantId: string; // Anonymized
  conversationId: string;
  
  // Research metadata
  researchContext: {
    studyName: string;
    condition?: string; // e.g., 'experimental', 'control'
    sessionNumber: number;
    therapistId?: string; // Anonymized
  };
  
  // Interaction data
  interactions: {
    metricModeSelections: TherapeuticMetricMode[];
    timeSpentPerMode: Record<TherapeuticMetricMode, number>;
    pointsSelected: number[];
    annotations?: string[]; // Researcher notes
  };
  
  // Export settings
  exportSettings: {
    includeFullTranscript: boolean;
    includeClassification: boolean;
    includeVisualization: boolean;
    anonymize: boolean;
  };
}

export function createResearchSession(
  conversation: TherapeuticClassification,
  researchContext: ResearchSession['researchContext']
): ResearchSession {
  return {
    sessionId: generateSessionId(),
    timestamp: new Date(),
    participantId: anonymizeId(researchContext.participantId),
    conversationId: conversation.id,
    researchContext,
    interactions: {
      metricModeSelections: [],
      timeSpentPerMode: {} as Record<TherapeuticMetricMode, number>,
      pointsSelected: [],
    },
    exportSettings: {
      includeFullTranscript: true,
      includeClassification: true,
      includeVisualization: true,
      anonymize: true,
    },
  };
}

export function exportResearchData(session: ResearchSession): string {
  // Export anonymized data for research
  const exportData = {
    sessionId: session.sessionId,
    timestamp: session.timestamp.toISOString(),
    participantId: session.participantId,
    researchContext: session.researchContext,
    interactions: session.interactions,
    // Only include data based on exportSettings
  };
  
  return JSON.stringify(exportData, null, 2);
}
```

### 3.2 Anonymization Utilities

**File:** `src/utils/anonymization.ts`

```typescript
import crypto from 'crypto';

export function anonymizeId(originalId: string): string {
  // Create consistent hash for participant tracking without revealing identity
  return crypto
    .createHash('sha256')
    .update(originalId + 'research-salt')
    .digest('hex')
    .substring(0, 16);
}

export function anonymizeText(text: string): string {
  // Remove PII while preserving therapeutic patterns
  // Replace names, locations, specific dates, etc.
  let anonymized = text;
  
  // Pattern-based anonymization (simplified - would need more robust implementation)
  anonymized = anonymized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
  anonymized = anonymized.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]');
  anonymized = anonymized.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]');
  
  return anonymized;
}

export function shouldAnonymize(exportSettings: ResearchSession['exportSettings']): boolean {
  return exportSettings.anonymize;
}
```

---

## Phase 4: Therapeutic Communication Classifier

### 4.1 LLM Prompt for Therapeutic Classification

**File:** `src/data/therapeuticPrompt.ts`

```typescript
export const THERAPEUTIC_CLASSIFICATION_PROMPT = `You are a research assistant analyzing therapeutic communication patterns for academic research.

## RULES
- Focus on observable interactional patterns, not psychological diagnosis
- Use evidence from the conversation only
- Provide confidence scores (0.0-1.0)
- Include evidence quotes (≤20 words each)
- This is for RESEARCH purposes, not clinical assessment

## TASK
Classify the therapeutic conversation across these dimensions:

### 1. THERAPEUTIC ALLIANCE
Categories: strong | moderate | weak | rupture
- Strong: Clear collaboration, trust, mutual understanding
- Moderate: Some connection but room for improvement
- Weak: Limited connection, difficulty establishing rapport
- Rupture: Clear breakdown in therapeutic relationship

### 2. INTERVENTION TYPE
Categories: exploratory | directive | supportive | interpretive | collaborative
- Exploratory: Open-ended questions, reflection
- Directive: Providing structure, homework, guidance
- Supportive: Validation, empathy, encouragement
- Interpretive: Reframing, insight provision
- Collaborative: Co-creating understanding, shared decision-making

### 3. CLIENT ENGAGEMENT
Categories: active | receptive | resistant | withdrawn
- Active: Initiating, asking questions, sharing openly
- Receptive: Listening, considering, responding thoughtfully
- Resistant: Pushing back, avoiding, challenging
- Withdrawn: Minimal response, disengaged

### 4. EMOTIONAL REGULATION
Categories: regulated | dysregulated | processing | avoidant
- Regulated: Managing emotions effectively
- Dysregulated: Overwhelmed, unable to manage
- Processing: Working through difficult emotions
- Avoidant: Avoiding emotional content

### 5. PROCESS MARKERS (0-1 scale)
- insight: Client demonstrates new understanding
- resistance: Client pushes back or avoids
- collaboration: Working together effectively
- emotionalDepth: Engaging with deep emotional content

## OUTPUT FORMAT
{
  "allianceStrength": {
    "category": "strong",
    "confidence": 0.85,
    "evidence": ["..."],
    "rationale": "..."
  },
  "interventionType": { ... },
  "clientEngagement": { ... },
  "emotionalRegulation": { ... },
  "processMarkers": {
    "insight": 0.7,
    "resistance": 0.2,
    "collaboration": 0.8,
    "emotionalDepth": 0.6
  }
}

## CONVERSATION TO ANALYZE:
`;
```

### 4.2 Classification Integration

**File:** `classifier/therapeutic-classifier.py`

```python
#!/usr/bin/env python3
"""
Therapeutic Communication Pattern Classifier
For research use only - not for clinical assessment
"""

import json
import sys
from pathlib import Path
import anthropic

THERAPEUTIC_PROMPT = """...""" # (from therapeuticPrompt.ts)

def classify_therapeutic_conversation(conversation: dict) -> dict:
    """
    Classify a therapeutic conversation for research purposes.
    
    Args:
        conversation: Dict with 'messages' array
        
    Returns:
        Classification result with therapeutic dimensions
    """
    client = anthropic.Anthropic()
    
    messages_text = format_conversation_for_analysis(conversation['messages'])
    full_prompt = THERAPEUTIC_PROMPT + messages_text
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[{"role": "user", "content": full_prompt}]
    )
    
    # Parse JSON response
    classification = json.loads(response.content[0].text)
    
    # Add research disclaimer
    classification['researchUseOnly'] = True
    classification['timestamp'] = datetime.now().isoformat()
    
    return classification

def format_conversation_for_analysis(messages: list) -> str:
    """Format messages for LLM analysis."""
    formatted = []
    for msg in messages:
        role = "Client" if msg['role'] == 'user' else "Therapist"
        formatted.append(f"{role}: {msg['content']}")
    return "\n\n".join(formatted)

if __name__ == "__main__":
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    
    with open(input_file) as f:
        conversation = json.load(f)
    
    classification = classify_therapeutic_conversation(conversation)
    
    with open(output_file, 'w') as f:
        json.dump(classification, f, indent=2)
    
    print(f"Classification complete: {output_file}")
```

---

## Phase 5: Research Interface Features

### 5.1 Session Comparison View

**File:** `src/components/SessionComparison.tsx`

```typescript
interface SessionComparisonProps {
  sessions: ResearchSession[];
  onSelectSession: (sessionId: string) => void;
}

export function SessionComparison({ sessions, onSelectSession }: SessionComparisonProps) {
  // Compare therapeutic patterns across sessions
  const compareMetrics = (sessions: ResearchSession[]) => {
    return {
      allianceTrend: calculateTrend(sessions, 'allianceStrength'),
      engagementTrend: calculateTrend(sessions, 'clientEngagement'),
      regulationTrend: calculateTrend(sessions, 'emotionalRegulation'),
    };
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h3>Session Comparison</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {sessions.map((session, idx) => (
          <div
            key={session.sessionId}
            onClick={() => onSelectSession(session.sessionId)}
            style={{
              border: '1px solid rgba(74, 170, 204, 0.3)',
              padding: 12,
              cursor: 'pointer',
            }}
          >
            <div>Session {idx + 1}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              {new Date(session.timestamp).toLocaleDateString()}
            </div>
            {/* Show key metrics */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.2 Research Annotations

**File:** `src/components/ResearchAnnotations.tsx`

```typescript
interface ResearchAnnotation {
  id: string;
  pointIndex: number;
  text: string;
  category: 'observation' | 'hypothesis' | 'question' | 'note';
  timestamp: Date;
}

export function ResearchAnnotations({ 
  annotations, 
  onAddAnnotation 
}: {
  annotations: ResearchAnnotation[];
  onAddAnnotation: (annotation: Omit<ResearchAnnotation, 'id' | 'timestamp'>) => void;
}) {
  return (
    <div style={{ padding: 12, background: 'rgba(10, 20, 30, 0.85)' }}>
      <div style={{ fontSize: '12px', marginBottom: 8 }}>RESEARCH ANNOTATIONS</div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {annotations.map(ann => (
          <div key={ann.id} style={{ marginBottom: 8, fontSize: '10px' }}>
            <div style={{ opacity: 0.6 }}>{ann.category}</div>
            <div>{ann.text}</div>
            <div style={{ opacity: 0.4, fontSize: '8px' }}>
              Point {ann.pointIndex} • {ann.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onAddAnnotation({ /* ... */ })}>
        + Add Annotation
      </button>
    </div>
  );
}
```

---

## Phase 6: Ethics & Privacy

### 6.1 Consent Management

**File:** `src/components/ResearchConsent.tsx`

```typescript
export function ResearchConsent({ onConsent }: { onConsent: (consented: boolean) => void }) {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <h2>Research Participation Consent</h2>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Purpose</h3>
        <p>This tool is for research on therapeutic communication patterns. 
        It is NOT a clinical assessment tool.</p>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Data Use</h3>
        <ul>
          <li>Your conversation data will be anonymized</li>
          <li>Data will be used for research purposes only</li>
          <li>You can withdraw consent at any time</li>
          <li>No clinical decisions will be made based on this tool</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Risks & Benefits</h3>
        <p><strong>Risks:</strong> Minimal - this is a research tool, not treatment</p>
        <p><strong>Benefits:</strong> Contributes to understanding therapeutic communication</p>
      </div>
      
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => onConsent(true)}>I Consent</button>
        <button onClick={() => onConsent(false)}>I Do Not Consent</button>
      </div>
    </div>
  );
}
```

### 6.2 Data Export with Privacy Controls

**File:** `src/utils/researchExport.ts`

```typescript
export function exportResearchData(
  session: ResearchSession,
  conversation: TherapeuticClassification,
  settings: ResearchSession['exportSettings']
): Blob {
  const exportData: any = {
    sessionId: session.sessionId,
    timestamp: session.timestamp,
    participantId: session.participantId, // Already anonymized
    researchContext: session.researchContext,
    interactions: session.interactions,
  };
  
  if (settings.includeFullTranscript) {
    exportData.messages = settings.anonymize
      ? conversation.messages.map(m => ({
          ...m,
          content: anonymizeText(m.content)
        }))
      : conversation.messages;
  }
  
  if (settings.includeClassification) {
    exportData.classification = conversation.classification;
  }
  
  if (settings.includeVisualization) {
    exportData.visualization = {
      pathPoints: session.interactions.pointsSelected,
      metricModes: session.interactions.metricModeSelections,
    };
  }
  
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
}
```

---

## Phase 7: Implementation Checklist

### Research Infrastructure
- [ ] Set up IRB/ethics approval process
- [ ] Create data management plan
- [ ] Implement anonymization pipeline
- [ ] Set up secure data storage
- [ ] Create consent management system

### Code Implementation
- [ ] Extend classification schema with therapeutic dimensions
- [ ] Create therapeutic metric lenses
- [ ] Build research session tracking
- [ ] Implement annotation system
- [ ] Add session comparison view
- [ ] Create data export functionality

### Validation
- [ ] Test with sample therapeutic conversations
- [ ] Validate classification accuracy
- [ ] Test anonymization effectiveness
- [ ] Review with therapeutic communication researchers
- [ ] Pilot test with research participants

### Documentation
- [ ] Research protocol documentation
- [ ] Data dictionary
- [ ] User guide for researchers
- [ ] Ethics documentation
- [ ] Publication-ready methodology section

---

## Key Principles

1. **Research Use Only**: Clear disclaimers that this is not for clinical assessment
2. **Privacy First**: Anonymization and secure data handling
3. **Ethical Design**: Informed consent, data minimization, participant control
4. **Transparency**: Open about limitations and interpretive nature
5. **Professional Oversight**: Requires trained researchers, not direct client use

---

## Next Steps

1. **Phase 1-2**: Core data model and visualization (2-3 weeks)
2. **Phase 3-4**: Research infrastructure and classification (3-4 weeks)
3. **Phase 5**: Interface features (2 weeks)
4. **Phase 6**: Ethics and privacy (ongoing)
5. **Phase 7**: Validation and testing (4-6 weeks)

**Total Timeline**: 3-4 months for full research-ready implementation

