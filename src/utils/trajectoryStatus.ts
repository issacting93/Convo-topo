/**
 * Trajectory Status Engine
 * Analyzes a sequence of emotional intensity scores to determine the dramatic arc.
 */

export type TrajectoryStatus = 'STABLE' | 'ESCALATED' | 'RECOVERED' | 'CRASHED';

export interface TrajectoryAnalysis {
    drift: number;
    status: TrajectoryStatus;
    startState: number;
    endState: number;
}

/**
 * Analyze the trajectory of a conversation based on intensity scores.
 * @param intensities Array of emotional intensity scores (0-1)
 * @param variance The calculated variance/volatility of the scores
 * @returns Status analysis
 */
export function analyzeTrajectory(intensities: number[], variance: number): TrajectoryAnalysis {
    if (!intensities || intensities.length === 0) {
        return { drift: 0, status: 'STABLE', startState: 0, endState: 0 };
    }

    // DRIFT ANALYSIS: Compare End State vs Start State
    // Take average of first 3 vs last 3 (or 20% slice)
    const sliceSize = Math.max(1, Math.floor(intensities.length * 0.2));
    const startState = intensities.slice(0, sliceSize).reduce((a, b) => a + b, 0) / sliceSize;
    const endState = intensities.slice(-sliceSize).reduce((a, b) => a + b, 0) / sliceSize; // Fixed: slice(-sliceSize) takes last elements
    const drift = endState - startState;

    // DETERMINE STATUS
    let status: TrajectoryStatus = 'STABLE';

    if (variance > 0.01) {
        // High volatility - did it calm down?
        if (endState < 0.3) {
            status = 'RECOVERED'; // High drama, happy ending
        } else {
            status = 'CRASHED'; // High drama, bad ending
        }
    } else {
        // Low volatility - did it creep up?
        if (drift > 0.3) {
            status = 'ESCALATED'; // Started calm, got annoyed
        } else {
            status = 'STABLE'; // Boring (Good)
        }
    }

    return {
        drift,
        status,
        startState,
        endState
    };
}
