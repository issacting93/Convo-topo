/**
 * PAD (Pleasure-Arousal-Dominance) Sentiment Engine
 * 
 * A heuristic-based system for measuring "Interaction Friction" and "Emotional Intensity"
 * in text. It does not measure "true emotion" but rather the "explicit markers" of
 * conflict, urgency, and satisfaction.
 */

export interface PADScores {
    pleasure: number;   // 0.0 (Frustrated) -> 1.0 (Satisfied)
    arousal: number;    // 0.0 (Sleepy) -> 1.0 (Urgent/Panic)
    dominance: number;  // 0.0 (Submissive) -> 1.0 (Commanding)
    emotionalIntensity: number; // Combined Friction Metric (0-1)
}

export interface PADContext {
    tone?: string;       // e.g. 'neutral', 'playful', 'serious'
    engagement?: string; // e.g. 'reactive', 'challenging'
}

// Regex Markers
const MARKERS = {
    frustration: [
        /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
        /\bno[,.]?\s+(that\'s|this is|it is)/i,
        /\bnot\s+(quite|right|correct|working|working properly)/i,
        /\b(doesn\'t|does not|can\'t|cannot|won\'t|will not)\s+(work|seem|appear|make sense)/i,
        /\b(issue|problem|bug)\b/i,
        /\b(actually|however|but)\s+(that|this|it)/i,
    ],
    satisfaction: [
        /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic)\b/i,
        /\b(thanks|thank you)\b/i,
        /\b(that|it)\s+works\b/i,
        /\byes[!.]?\s+(that\'s|exactly|perfect|correct|right)/i,
        /\bworks?\s+perfectly\b/i,
        /\bexactly\s+(what|what i|what we)/i,
        /\bthat\'s\s+it\b/i,
        /\blove\s+(it|this|that)\b/i,
    ],
    urgency: [
        /\b(urgent|asap|as soon as possible)\b/i,
        /\b(quickly|immediately|right now)\b/i,
        /\bhelp[!.]?\s+(me|us|please)/i,
        /\bplease[!.]?\s+(help|urgent)/i,
        /\b(very|extremely|really)\s+(urgent|important|critical)/i,
        /\b(hurry|rush|fast)\b/i,
    ],
    apology: [
        /\b(sorry|apolog|apologize)\b/i
    ],
    commands: [
        /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change )/i
    ]
};

/**
 * Calculate PAD scores for a given text segment
 */
export function calculatePAD(text: string, context: PADContext = {}): PADScores {
    // 1. Establish Baselines
    const tone = context.tone || 'neutral';
    const engagement = context.engagement || 'reactive';

    let p = 0.5; // Default Pleasure
    let a = 0.5; // Default Arousal

    // Baseline P (Tone)
    if (['playful', 'supportive', 'empathetic'].includes(tone)) p = 0.8;
    else if (tone === 'serious') p = 0.3;

    // Baseline A (Engagement)
    if (engagement === 'questioning' || engagement === 'challenging') a = 0.7;
    else if (engagement === 'reactive') a = 0.3;
    else if (engagement === 'exploring') a = 0.6;

    // 2. Text Analysis
    const clean = text.toLowerCase();

    const hasFrustration = MARKERS.frustration.some(m => m.test(clean));
    const hasSatisfaction = MARKERS.satisfaction.some(m => m.test(clean));
    const hasUrgency = MARKERS.urgency.some(m => m.test(clean));
    const hasApology = MARKERS.apology.some(m => m.test(clean));

    // 3. Apply Modifiers
    if (hasFrustration) {
        p = Math.max(0.1, p - 0.25);
        a = Math.min(1.0, a + 0.25);
    }

    if (hasSatisfaction) {
        p = Math.min(1.0, p + 0.25);
        a = Math.max(0.1, a - 0.15);
    }

    if (hasApology) {
        // Apology = High Friction/Submission
        p = Math.max(0.2, p - 0.1);
        a = Math.min(1.0, a + 0.1);
    }

    if (hasUrgency && !hasFrustration) {
        a = Math.min(1.0, a + 0.2);
    }

    // 4. Calculate Dominance (Structural)
    // Questions = Low (Seeking), Commands = High (Directing)
    const isQuestion = clean.includes('?');
    const isCommand = MARKERS.commands.some(m => m.test(clean));
    let d = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);

    // Apologies significantly lower dominance
    if (hasApology) d = Math.max(0.1, d - 0.4);

    // 5. Calculate Emotional Intensity (Friction Index)
    // High Intensity = Low Pleasure + High Arousal
    const intensity = (1 - p) * 0.6 + a * 0.4;

    return {
        pleasure: parseFloat(Math.max(0, Math.min(1, p)).toFixed(3)),
        arousal: parseFloat(Math.max(0, Math.min(1, a)).toFixed(3)),
        dominance: parseFloat(Math.max(0, Math.min(1, d)).toFixed(3)),
        emotionalIntensity: parseFloat(Math.max(0, Math.min(1, intensity)).toFixed(3))
    };
}
