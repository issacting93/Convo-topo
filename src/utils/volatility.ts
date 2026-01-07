import { Conversation } from '../schemas/conversationSchema';
import { calculatePAD } from './pad';
import { analyzeTrajectory, TrajectoryStatus } from './trajectoryStatus';

export interface VolatilityMetrics {
    volatility: number;
    intensities: number[];
    meanIntensity: number;
    peakIntensity: number;
    valleyIntensity: number;
    drift: number;
    status: TrajectoryStatus;
}

/**
 * Filter content to reduce false positives from code
 */
function preprocessContent(content: string): string {
    // 1. Remove Code Blocks
    let clean = content.replace(/```[\s\S]*?```/g, '');

    // 2. Remove Inline Code
    clean = clean.replace(/`[^`]*`/g, '');

    return clean.trim();
}

/**
 * Calculate volatility and intensity metrics for a conversation
 */
export function calculateVolatility(conv: Conversation): VolatilityMetrics {
    const messages = conv.messages || [];
    if (messages.length < 2) {
        return {
            volatility: 0,
            intensities: [],
            meanIntensity: 0,
            peakIntensity: 0,
            valleyIntensity: 0,
            drift: 0,
            status: 'STABLE'
        };
    }

    const intensities: number[] = [];

    messages.forEach((msg) => {
        // PRE-PROCESSING: Strip code blocks before analysis
        const cleanContent = preprocessContent(msg.content);

        // HEURISTIC: Skip extremely short messages unless they contain strong emotion keywords
        // This helps filter out "Yes", "No", "Thanks" noise
        const isShort = cleanContent.length < 50;
        const hasEmotion = /\b(sorry|apolog|wrong|fail|error|bad|good|great|love|hate)\b/i.test(cleanContent);

        // If it's code-heavy (was stripped to nothing) or short-neutral, dampen the signal
        const isNoise = cleanContent.length === 0 || (isShort && !hasEmotion);

        // Use shared PAD engine
        const pad = calculatePAD(cleanContent, {
            tone: conv.classification?.emotionalTone?.category,
            engagement: conv.classification?.engagementStyle?.category
        });

        // If noise, force neutral intensity (0.1 is baseline calm)
        intensities.push(isNoise ? 0.1 : pad.emotionalIntensity);
    });

    // Calculate Mean
    const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;

    // Calculate Variance (Volatility)
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;

    // Find Peak and Valley
    const peak = Math.max(...intensities);
    const valley = Math.min(...intensities);

    // Analyze Trajectory (Drift & Status)
    const trajectory = analyzeTrajectory(intensities, variance);

    return {
        volatility: variance,
        intensities,
        meanIntensity: mean,
        peakIntensity: peak,
        valleyIntensity: valley,
        drift: trajectory.drift,
        status: trajectory.status
    };
}
