import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../conversations-filtered');

// COPY of usage logic to ensure we debug the exact logic
// We will inline the calculateMessagePAD function to instrument it with logs
function instrumentedCalculatePAD(
    message: { role: string; content: string },
    classification: any
) {
    const debugLog: string[] = [];

    // Base PAD from conversation-level classification
    const convTone = classification?.emotionalTone?.category || 'neutral';
    const convEngagement = classification?.engagementStyle?.category || 'reactive';

    debugLog.push(`Base Tone: ${convTone}, Base Engagement: ${convEngagement}`);

    // Calculate base Pleasure (P)
    let basePleasure =
        (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
            (convTone === 'serious') ? 0.3 :
                (convTone === 'neutral') ? 0.5 : 0.5;

    // Calculate base Arousal (A)
    let baseArousal =
        (convEngagement === 'questioning') ? 0.7 :
            (convEngagement === 'reactive') ? 0.3 :
                (convEngagement === 'affirming') ? 0.45 :
                    (convEngagement === 'exploring') ? 0.6 :
                        0.5;

    debugLog.push(`Initial Base -> P: ${basePleasure}, A: ${baseArousal}`);

    // Message-level adjustments
    const content = message.content.toLowerCase();

    // Clean content like we do in volatility.ts
    let clean = content.replace(/```[\s\S]*?```/g, '[CODE]');
    clean = clean.replace(/`[^`]*`/g, '[INLINE]');

    const frustrationMarkers = [
        /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
        /\bno[,.]?\s+(that\'s|this is|it is)/i,
        /\bnot\s+(quite|right|correct|working|working properly)/i,
        /\b(doesn\'t|does not|can\'t|cannot|won\'t|will not)\s+(work|seem|appear|make sense)/i,
        /\b(issue|problem|bug)\b/i,
        /\b(actually|however|but)\s+(that|this|it)/i,
    ];
    const hasFrustration = frustrationMarkers.some(pattern => pattern.test(clean));
    if (hasFrustration) debugLog.push(`[MATCH] Frustration Marker`);

    const satisfactionMarkers = [
        /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic)\b/i,
        /\b(thanks|thank you)\b/i,
        /\b(that|it)\s+works\b/i,
        /\byes[!.]?\s+(that\'s|exactly|perfect|correct|right)/i,
        /\bworks?\s+perfectly\b/i,
    ];
    const hasSatisfaction = satisfactionMarkers.some(pattern => pattern.test(clean));
    if (hasSatisfaction) debugLog.push(`[MATCH] Satisfaction Marker`);

    const urgencyMarkers = [
        /\b(urgent|asap|as soon as possible)\b/i,
        /\b(quickly|immediately|right now)\b/i,
        /\bhelp[!.]?\s+(me|us|please)/i,
        /\b(very|extremely|really)\s+(urgent|important|critical)/i,
        /\b(sorry|apolog|apologize)\b/i // checking if apologize is here?
    ];
    const hasUrgency = urgencyMarkers.some(pattern => pattern.test(clean));

    // Specific check for explicit apology which is a huge signal
    const hasApology = /\b(sorry|apolog|apologize)\b/i.test(clean);
    if (hasApology) {
        debugLog.push(`[MATCH] Explicit Apology`);
        // Apology is often High Arousal (Urgency to fix) + Low Dominance
    }
    if (hasUrgency) debugLog.push(`[MATCH] Urgency Marker`);

    // Adjust PAD
    if (hasFrustration) {
        basePleasure = Math.max(0.1, basePleasure - 0.25);
        baseArousal = Math.min(1.0, baseArousal + 0.25);
        debugLog.push(`-> Applied Frustration Modifiers`);
    }
    if (hasApology) {
        // Manual boost for apology if not covered
        baseArousal = Math.min(1.0, baseArousal + 0.1);
        basePleasure = Math.max(0.2, basePleasure - 0.1);
        debugLog.push(`-> Applied Apology Modifiers`);
    }

    if (hasSatisfaction) {
        basePleasure = Math.min(1.0, basePleasure + 0.25);
        baseArousal = Math.max(0.1, baseArousal - 0.15);
        debugLog.push(`-> Applied Satisfaction Modifiers`);
    }

    const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;

    return {
        finalP: basePleasure,
        finalA: baseArousal,
        intensity: emotionalIntensity,
        logs: debugLog
    };
}

const targetId = process.argv[2] || 'chatbot_arena_29637'; // Default to the Apology Loop one

function inspect() {
    const filePath = path.join(DATA_DIR, `${targetId}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${targetId}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`\n=== INSPECTING: ${targetId} ===`);
    console.log(`Tone: ${data.classification?.emotionalTone?.category}`);
    console.log('------------------------------------------------');

    data.messages.forEach((msg: any, i: number) => {
        const result = instrumentedCalculatePAD(msg, data.classification);

        console.log(`\n[MSG ${i}] [${msg.role.toUpperCase()}]`);
        console.log(`"${msg.content.slice(0, 100).replace(/\n/g, ' ')}..."`);
        result.logs.forEach(l => console.log(`  > ${l}`));
        console.log(`  > RESULT: P=${result.finalP.toFixed(2)} A=${result.finalA.toFixed(2)} -> INTENSITY=${result.intensity.toFixed(2)}`);
    });
}

inspect();
