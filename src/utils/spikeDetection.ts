/**
 * Spike Detection Engine
 * Identifies sudden jumps in emotional intensity within a sequence.
 */

export interface Spike {
    messageIndex: number;
    intensity: number;
    spike: number;        // Increase from previous message
    context: {
        before: number;     // Intensity before spike
        after: number;      // Intensity after spike
    };
}

/**
 * Detect spikes in emotional intensity sequence.
 * A spike is defined as an increase in intensity greater than the threshold.
 * 
 * @param intensities Array of intensity scores (0-1)
 * @param threshold Minimum jump to qualify as a spike (default 0.2)
 * @returns Array of detected spikes
 */
export function detectSpikes(
    intensities: number[],
    threshold: number = 0.2
): Spike[] {
    if (!intensities || intensities.length < 2) {
        return [];
    }

    const spikes: Spike[] = [];

    for (let i = 1; i < intensities.length; i++) {
        const current = intensities[i];
        const previous = intensities[i - 1];
        const diff = current - previous;

        if (diff > threshold) {
            spikes.push({
                messageIndex: i,
                intensity: current,
                spike: Number(diff.toFixed(3)),
                context: {
                    before: previous,
                    after: current
                }
            });
        }
    }

    return spikes;
}
