import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define reduced types to avoid full schema dependency issues in script
interface SimpleMessage {
    role: string;
    content: string;
}

interface SimpleConversation {
    id: string;
    messages: SimpleMessage[];
    classification?: {
        emotionalTone?: { category: string };
        engagementStyle?: { category: string };
    };
}

const DATA_DIR = path.join(__dirname, '../conversations-filtered');

function loadConversations(): SimpleConversation[] {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const conversations: SimpleConversation[] = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const data = JSON.parse(content);
            // Ensure messages exist
            if (data.messages && Array.isArray(data.messages)) {
                conversations.push(data);
            }
        } catch (err) {
            console.warn(`Failed to load ${file}:`, err);
        }
    }
    return conversations;
}

// INLINED LOGIC FROM src/utils/conversationToTerrain.ts
function calculateMessagePAD(
    message: { role: string; content: string },
    classification: any,
    _messageIndex: number,
    _totalMessages: number
): { pleasure: number; arousal: number; dominance: number; emotionalIntensity: number } {
    // Base PAD from conversation-level classification
    const convTone = classification?.emotionalTone?.category || 'neutral';
    const convEngagement = classification?.engagementStyle?.category || 'reactive';

    // Calculate base Pleasure (P) from conversation tone
    let basePleasure =
        (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
            (convTone === 'serious') ? 0.3 :
                (convTone === 'neutral') ? 0.5 : 0.5;

    // Calculate base Arousal (A) from conversation engagement  
    let baseArousal =
        (convEngagement === 'questioning') ? 0.7 : // High arousal (probing, active)
            (convEngagement === 'reactive') ? 0.3 : // Low arousal (responding passively)
                (convEngagement === 'affirming') ? 0.45 : // Moderate-low (validating, calm)
                    (convEngagement === 'exploring') ? 0.6 : // Moderate-high (curious, engaged)
                        0.5; // Default fallback

    // Message-level adjustments based on content analysis
    const content = message.content.toLowerCase();

    // Detect frustration markers (low pleasure, high arousal)
    const frustrationMarkers = [
        /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
        /\bno[,.]?\s+(that\'s|this is|it is)/i,
        /\bnot\s+(quite|right|correct|working|working properly)/i,
        /\b(doesn\'t|does not|can\'t|cannot|won\'t|will not)\s+(work|seem|appear|make sense)/i,
        /\b(issue|problem|bug)\b/i,
        /\b(actually|however|but)\s+(that|this|it)/i,
    ];
    const hasFrustration = frustrationMarkers.some(pattern => pattern.test(content));

    // Detect satisfaction markers (high pleasure)
    const satisfactionMarkers = [
        /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic)\b/i,
        /\b(thanks|thank you)\b/i,
        /\b(that|it)\s+works\b/i,
        /\byes[!.]?\s+(that\'s|exactly|perfect|correct|right)/i,
        /\bworks?\s+perfectly\b/i,
        /\bexactly\s+(what|what i|what we)/i,
        /\bthat\'s\s+it\b/i,
        /\blove\s+(it|this|that)\b/i,
    ];
    const hasSatisfaction = satisfactionMarkers.some(pattern => pattern.test(content));

    // Detect urgency/agitation (high arousal)
    const urgencyMarkers = [
        /\b(urgent|asap|as soon as possible)\b/i,
        /\b(quickly|immediately|right now)\b/i,
        /\bhelp[!.]?\s+(me|us|please)/i,
        /\bplease[!.]?\s+(help|urgent)/i,
        /\b(very|extremely|really)\s+(urgent|important|critical)/i,
        /\b(hurry|rush|fast)\b/i,
    ];
    const hasUrgency = urgencyMarkers.some(pattern => pattern.test(content));

    // Adjust PAD based on message content
    if (hasFrustration) {
        basePleasure = Math.max(0.1, basePleasure - 0.25); // Lower pleasure
        baseArousal = Math.min(1.0, baseArousal + 0.25);   // Higher arousal
    }

    if (hasSatisfaction) {
        basePleasure = Math.min(1.0, basePleasure + 0.25); // Higher pleasure
        baseArousal = Math.max(0.1, baseArousal - 0.15);   // Lower arousal (calm)
    }

    if (hasUrgency && !hasFrustration) {
        baseArousal = Math.min(1.0, baseArousal + 0.2); // Higher arousal
    }

    // Calculate Dominance (D) from message structure
    const isQuestion = content.includes('?');
    const isCommand = /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change )/i.test(content);
    const baseDominance = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);

    // Emotional intensity: High Arousal + Low Pleasure = Peaks (frustration)
    // Low Arousal + High Pleasure = Valleys (affiliation)
    const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;

    return {
        pleasure: Math.max(0, Math.min(1, basePleasure)),
        arousal: Math.max(0, Math.min(1, baseArousal)),
        dominance: Math.max(0, Math.min(1, baseDominance)),
        emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity))
    };
}

function calculateVolatility(conv: SimpleConversation): number {
    if (!conv.messages || conv.messages.length < 2) return 0;

    const intensities: number[] = [];

    conv.messages.forEach((msg, idx) => {
        // Mock classification if missing, as calculateMessagePAD handles undefined gracefully-ish
        // or we can pass minimal mock.
        // The util expects the full classification object structure, so let's mock the parts it needs.
        const pad = calculateMessagePAD(
            msg,
            conv.classification as any, // Cast to any to bypass strict type check for script
            idx,
            conv.messages.length
        );
        intensities.push(pad.emotionalIntensity);
    });

    // Calculate Variance
    const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;

    return variance;
}

function main() {
    console.log('Loading conversations...');
    const conversations = loadConversations();
    console.log(`Loaded ${conversations.length} conversations.`);

    console.log('Scanning volatility...');
    const results = conversations.map(c => ({
        id: c.id,
        volatility: calculateVolatility(c),
        messageCount: c.messages.length
    }));

    // Sort by volatility descending
    results.sort((a, b) => b.volatility - a.volatility);

    console.log('\n=== TOP 20 MOST VOLATILE CONVERSATIONS ===');
    console.log('These should be the "Crashes" (Fights, Confusion, Breakdowns)');
    console.table(results.slice(0, 20));

    console.log('\n=== BOTTOM 20 LEAST VOLATILE CONVERSATIONS ===');
    console.log('These should be "Smooth Sailing" (or boring)');
    console.table(results.slice(-20));

    // Specific check for known hallucinations or errors if we can identify them by ID?
    // For now, the user can manually inspect the IDs returned.
}

main();
