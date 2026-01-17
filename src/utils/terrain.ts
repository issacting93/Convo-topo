function noise2D(x: number, y: number, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const n00 = noise2D(x0, y0, seed);
  const n10 = noise2D(x0 + 1, y0, seed);
  const n01 = noise2D(x0, y0 + 1, seed);
  const n11 = noise2D(x0 + 1, y0 + 1, seed);

  const nx0 = n00 * (1 - smooth(fx)) + n10 * smooth(fx);
  const nx1 = n01 * (1 - smooth(fx)) + n11 * smooth(fx);

  return nx0 * (1 - smooth(fy)) + nx1 * smooth(fy);
}

function fractalNoise(x: number, y: number, octaves = 4, seed = 0) {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 100) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

export type MetricMode = 'uncertainty' | 'affect' | 'composite';

export interface TerrainParams {
  seed: number;
  avgConfidence?: number;
  emotionalIntensity?: number;
  metricMode?: MetricMode; // Which metric to visualize
}

export function generateHeightmap(
  size: number,
  seed: number,
  params?: Partial<TerrainParams>
): Float32Array {
  const data = new Float32Array(size * size);

  // Extract terrain parameters
  const avgConfidence = params?.avgConfidence ?? 0.7;
  const emotionalIntensity = params?.emotionalIntensity ?? 0.5;
  const metricMode = params?.metricMode ?? 'composite';

  // Calculate parameters based on selected metric
  let baseHeight: number;
  let heightRange: number;
  let complexityBoost: number;
  let variation: number;
  let peakBoost: number;

  switch (metricMode) {
    case 'uncertainty': {
      // Confidence/uncertainty visualization (inverted: low confidence = high elevation)
      const uncertainty = 1.0 - avgConfidence;
      baseHeight = 0.3 + (uncertainty * 0.5);
      heightRange = 0.3 + (uncertainty * 0.4);
      complexityBoost = 1.0 + (uncertainty * 0.8); // More chaotic when uncertain
      variation = 0.5 + (uncertainty * 0.4); // Rougher when uncertain
      peakBoost = 1.0;
      break;
    }

    case 'affect':
      // Affective/Evaluative Lens: PAD model visualization
      // NOTE: This terrain generation creates visual context, but marker Z-heights
      // are calculated DIRECTLY from PAD emotional intensity in ThreeScene.tsx
      // (not from terrain height). Terrain serves as visual backdrop.
      // Z-height increases with high Arousal (agitation) + low Pleasure (frustration)
      // Peaks = relational friction; Valleys = affiliation
      baseHeight = 0.3 + (emotionalIntensity * 0.5);
      heightRange = 0.3 + (emotionalIntensity * 0.4);
      complexityBoost = 1.0 + (emotionalIntensity * 0.6);
      variation = 0.7;
      peakBoost = 1.0 + (emotionalIntensity * 0.8); // Dramatic peaks for frustration/agitation
      break;

    case 'composite':
    default:
      // Default composite mode: use fixed terrain parameters
      baseHeight = 0.5;
      heightRange = 0.5;
      complexityBoost = 1.5;
      variation = 0.6;
      peakBoost = 1.2;
      break;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;

      // Multi-octave fractal noise for rich terrain detail
      // Adjust frequency based on depth for more complex terrain
      let height = fractalNoise(nx * 4 * complexityBoost, ny * 4 * complexityBoost, 6, seed);

      // Add medium detail layer
      height += fractalNoise(nx * 8, ny * 8, 4, seed + 50) * 0.5;

      // Add fine detail layer
      height += fractalNoise(nx * 16, ny * 16, 3, seed + 100) * 0.3;

      // Normalize to 0-1 range
      height = height / (1.0 + 0.5 + 0.3);

      // Apply confidence-based variation
      height = height * variation;

      // Map to depth-based height range
      // Center around baseHeight with heightRange determining spread
      height = baseHeight + (height - 0.5) * heightRange * 2.0;

      // Apply peak boost for emotional intensity
      if (height > baseHeight) {
        const peakAmount = (height - baseHeight) / (heightRange);
        height = baseHeight + peakAmount * heightRange * peakBoost;
      }

      // Clamp to valid range
      const maxAllowed = 1.2;
      data[y * size + x] = Math.max(0.1, Math.min(maxAllowed, height));
    }
  }
  return data;
}

/**
 * Generate a heightmap where height reflects temporal persistence:
 * regions revisited by messages (path points) become taller, with optional
 * decay over time and small lens-driven modulation.
 */

export type LineSegment = [{ x: number, y: number }, { x: number, y: number }];

export function marchingSquares(heightmap: Float32Array, size: number, threshold: number): LineSegment[] {
  const lines: LineSegment[] = [];
  const step = 1;

  for (let y = 0; y < size - step; y += step) {
    for (let x = 0; x < size - step; x += step) {
      const h00 = heightmap[y * size + x];
      const h10 = heightmap[y * size + x + step];
      const h01 = heightmap[(y + step) * size + x];
      const h11 = heightmap[(y + step) * size + x + step];

      let caseIndex = 0;
      if (h00 >= threshold) caseIndex |= 1;
      if (h10 >= threshold) caseIndex |= 2;
      if (h11 >= threshold) caseIndex |= 4;
      if (h01 >= threshold) caseIndex |= 8;

      if (caseIndex === 0 || caseIndex === 15) continue;

      const lerp = (h1: number, h2: number) => {
        if (Math.abs(h2 - h1) < 0.0001) return 0.5;
        return (threshold - h1) / (h2 - h1);
      };

      const top = { x: x + lerp(h00, h10) * step, y: y };
      const bottom = { x: x + lerp(h01, h11) * step, y: y + step };
      const left = { x: x, y: y + lerp(h00, h01) * step };
      const right = { x: x + step, y: y + lerp(h10, h11) * step };

      const segments: LineSegment[] = [];
      switch (caseIndex) {
        case 1: case 14: segments.push([top, left]); break;
        case 2: case 13: segments.push([top, right]); break;
        case 3: case 12: segments.push([left, right]); break;
        case 4: case 11: segments.push([right, bottom]); break;
        case 5: segments.push([top, right], [left, bottom]); break;
        case 6: case 9: segments.push([top, bottom]); break;
        case 7: case 8: segments.push([left, bottom]); break;
        case 10: segments.push([top, left], [right, bottom]); break;
      }

      segments.forEach(seg => lines.push(seg));
    }
  }

  return lines;
}

export interface Contour {
  elevation: number;
  isMajor: boolean;
  lines: LineSegment[];
}

export function generateContours(
  heightmap: Float32Array,
  size: number,
  numContours = 10
): Contour[] {
  const contours: Contour[] = [];
  const minHeight = 0.1;
  const maxHeight = 0.9;

  for (let i = 0; i <= numContours; i++) {
    const threshold = minHeight + (maxHeight - minHeight) * (i / numContours);
    const isMajor = i % 5 === 0;
    const lines = marchingSquares(heightmap, size, threshold);

    if (lines.length > 0) {
      contours.push({
        elevation: threshold,
        isMajor,
        lines
      });
    }
  }

  return contours;
}

export interface PathPoint {
  x: number;
  y: number;
  height: number;
  padHeight?: number; // PAD-based height override for Z-axis
  index: number;
  communicationFunction: number;
  conversationStructure: number;
  role: 'user' | 'assistant';
  content: string;
  // Role-based visual encoding
  humanRole?: string;  // Dominant human role for this message
  aiRole?: string;     // Dominant AI role for this message
  roleConfidence?: number; // Confidence in role assignment

  // PAD (Pleasure-Arousal-Dominance) scores for affective/evaluative lens
  pad?: {
    pleasure: number;    // 0-1, low = frustration, high = satisfaction
    arousal: number;     // 0-1, low = calm, high = agitation
    dominance: number;   // 0-1, low = passive, high = control
    emotionalIntensity: number; // Derived: (1 - pleasure) * 0.6 + arousal * 0.4
  };
}

import { calculateMessageAlignmentScores } from './linguisticMarkers';

/**
 * Analyze a message to extract features for drift calculation
 * Note: Alignment scores are calculated at the conversation level,
 * not per-message, so we use alignment scores calculated incrementally
 */
function analyzeMessage(
  message: { role: 'user' | 'assistant'; content: string }
): {
  hasQuestion: boolean;
  length: number;
  expressiveScore: number;
  alignmentScore: number;
} {
  const content = message.content.toLowerCase();
  const hasQuestion = content.includes('?');
  const length = message.content.length;

  // Expressive indicators: personal pronouns, emotional words, casual language
  // TODO: Centralize this in linguisticMarkers.ts as well if needed in future
  const expressiveWords = ['i', 'my', 'me', 'feel', 'like', 'love', 'hate', 'wow', 'awesome', 'cool', 'nice', 'great', 'amazing', 'wonderful'];
  const expressiveCount = expressiveWords.filter(word => content.includes(word)).length;
  const hasContractions = content.includes("'");
  const expressiveScore = Math.min(1, (expressiveCount * 0.2) + (hasContractions ? 0.3 : 0) + (length > 50 ? 0.2 : 0));

  // Alignment score will be calculated separately for all messages
  // For now, return a placeholder (will be replaced by actual alignment scores)
  const alignmentScore = 0.5;

  return { hasQuestion, length, expressiveScore, alignmentScore };
}

/**
 * Generate 2D path points for minimap preview (without heightmap)
 * This is a lightweight version for preview cards
 */
export function generate2DPathPoints(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
  }>
): Array<{ x: number; y: number; role: 'user' | 'assistant' }> {
  const points: Array<{ x: number; y: number; role: 'user' | 'assistant' }> = [];

  if (messages.length === 0) return points;

  // All conversations start at the center (0.5, 0.5)
  const startX = 0.5;
  const startY = 0.5;

  // Analyze all messages
  const messageAnalyses = messages.map(msg => analyzeMessage(msg));

  // Calculate alignment scores incrementally (up to each message point)
  const alignmentScores = calculateMessageAlignmentScores(
    messages.map(msg => ({ role: msg.role, content: msg.content }))
  );

  // Update message analyses with actual alignment scores
  messageAnalyses.forEach((analysis, i) => {
    analysis.alignmentScore = alignmentScores[i];
  });

  // Calculate conversation-level target
  const targetX = 0.1 + messages[0].communicationFunction * 0.8;
  const targetY = 0.1 + messages[0].conversationStructure * 0.8;

  // Track cumulative position
  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const analysis = messageAnalyses[i];
    const progress = i / Math.max(messages.length - 1, 1);

    // Calculate drift (same logic as full path points)
    // Scale drift factor based on conversation length for better spacing
    const conversationLength = messages.length;
    const lengthScale = Math.min(1.5, 1.0 + (conversationLength - 10) / 50); // Scale up for longer conversations
    // Normalize drift by conversation length to prevent overshoot
    // We want the total drift over all messages to approximate the distance to target (plus some variation)
    // Dynamic progress factor: slight acceleration in middle
    const progressFactor = 1.0 + Math.sin(progress * Math.PI) * 0.5;
    const stepSize = 1.0 / Math.max(conversationLength, 1);

    // Message-level drift based on content
    const messageDriftX = (analysis.expressiveScore - 0.5) * 0.5 * lengthScale;
    const messageDriftY = (analysis.alignmentScore - 0.5) * 0.5 * lengthScale;

    // Apply normalized drift step
    const driftX = (targetX - startX) * stepSize * progressFactor + (messageDriftX * stepSize * 5.0);
    const driftY = (targetY - startY) * stepSize * progressFactor + (messageDriftY * stepSize * 5.0);

    currentX += driftX;
    currentY += driftY;

    // Clamp to safe range (slightly expanded for longer conversations)
    const margin = conversationLength > 30 ? 0.03 : 0.05;
    currentX = Math.max(margin, Math.min(1.0 - margin, currentX));
    currentY = Math.max(margin, Math.min(1.0 - margin, currentY));

    points.push({
      x: currentX,
      y: currentY,
      role: message.role
    });
  }

  return points;
}

import { toVisualizationSpace } from './coordinates';

export interface PathCoordinate {
  x: number;
  y: number;
  index: number;
  communicationFunction: number;
  conversationStructure: number;
  role: 'user' | 'assistant';
  content: string;
  humanRole?: string;
  aiRole?: string;
  roleConfidence?: number;
  pad?: {
    pleasure: number;
    arousal: number;
    dominance: number;
    emotionalIntensity: number;
  };
  analysis: {
    expressiveScore: number;
    alignmentScore: number;
  };
}

/**
 * Generate 2D path coordinates based on conversation dynamics.
 * Does NOT sample heightmap.
 */
export function generatePathCoordinates(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
    humanRole?: string;
    aiRole?: string;
    roleConfidence?: number;
    pad?: {
      pleasure: number;
      arousal: number;
      dominance: number;
      emotionalIntensity: number;
    };
  }>,
  count: number = 0 // Optional override for point count
): PathCoordinate[] {
  const points: PathCoordinate[] = [];

  // Use actual message count if count not specified or 0
  const pointCount = count || messages.length;
  if (pointCount === 0) return points;

  // All conversations start at the center (0.5, 0.5) - the origin point
  const startX = 0.5;
  const startY = 0.5;

  // Analyze all messages to calculate cumulative drift
  const messageAnalyses = messages.map(msg => analyzeMessage(msg));

  // Calculate alignment scores incrementally (up to each message point)
  const alignmentScores = calculateMessageAlignmentScores(
    messages.map(msg => ({ role: msg.role, content: msg.content }))
  );

  // Update message analyses with actual alignment scores
  messageAnalyses.forEach((analysis, i) => {
    analysis.alignmentScore = alignmentScores[i];
  });

  // Calculate conversation-level target based on classification
  // This is where the conversation "wants" to drift toward
  const targetX = toVisualizationSpace(messages[0].communicationFunction);
  const targetY = toVisualizationSpace(messages[0].conversationStructure);

  // Track cumulative position (starts at origin, drifts toward target)
  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < pointCount; i++) {
    const message = messages[i % messages.length];
    const analysis = messageAnalyses[i % messageAnalyses.length];
    const progress = i / Math.max(pointCount - 1, 1); // 0 to 1

    // Calculate drift per message
    // drift is influenced by:
    // 1. Message characteristics (expressive/structured scores)
    // 2. Conversation target (where classification says it should go)
    // 3. Temporal progression (more drift as conversation progresses)

    // Scale drift factor based on conversation length for better spacing with longer conversations
    const conversationLength = messages.length;
    const lengthScale = Math.min(1.5, 1.0 + (conversationLength - 10) / 50); // Scale up for longer conversations

    // Normalize drift by conversation length to prevent overshoot
    // We want the total drift over all messages to approximate the distance to target (plus some variation)
    // Dynamic progress factor: slight acceleration in middle
    const progressFactor = 1.0 + Math.sin(progress * Math.PI) * 0.5;
    const stepSize = 1.0 / Math.max(conversationLength, 1);

    // Message-level drift based on content
    const messageDriftX = (analysis.expressiveScore - 0.5) * 0.5 * lengthScale;
    const messageDriftY = (analysis.alignmentScore - 0.5) * 0.5 * lengthScale;

    // Apply normalized drift step
    // Base drift (to target) + Message content drift (local variation)
    const driftX = (targetX - startX) * stepSize * progressFactor + (messageDriftX * stepSize * 5.0);
    const driftY = (targetY - startY) * stepSize * progressFactor + (messageDriftY * stepSize * 5.0);

    // Update position (cumulative drift)
    currentX += driftX;
    currentY += driftY;

    // Clamp to safe range (slightly expanded for longer conversations)
    const margin = conversationLength > 30 ? 0.03 : 0.05;
    currentX = Math.max(margin, Math.min(1.0 - margin, currentX));
    currentY = Math.max(margin, Math.min(1.0 - margin, currentY));

    points.push({
      x: currentX,
      y: currentY,
      index: i,
      communicationFunction: message.communicationFunction,
      conversationStructure: message.conversationStructure,
      role: message.role,
      content: message.content,
      humanRole: message.humanRole,
      aiRole: message.aiRole,
      roleConfidence: message.roleConfidence,
      pad: message.pad,
      analysis // Store analysis for later use
    });
  }
  return points;
}

export function generatePathPoints(
  heightmap: Float32Array,
  size: number,
  count: number,
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
    humanRole?: string;
    aiRole?: string;
    roleConfidence?: number;
    pad?: {
      pleasure: number;
      arousal: number;
      dominance: number;
      emotionalIntensity: number;
    };
  }>,
  options?: { authorityScore?: number }
): PathPoint[] {
  // 1. Generate geometry
  const coords = generatePathCoordinates(messages, count);

  // 2. Sample heightmap
  return coords.map(pt => {
    const tx = Math.floor(pt.x * (size - 1));
    const ty = Math.floor(pt.y * (size - 1));
    // Safe lookup
    const idx = ty * size + tx;
    const height = (idx >= 0 && idx < heightmap.length) ? heightmap[idx] : 0;

    // Calculate PAD-based height if PAD data is available
    // emotionalIntensity drives Z-height: high = frustration peaks, low = affiliation valleys
    // Fallback: If no PAD data (e.g. human/raw datasets), use expressiveScore as a proxy for intensity
    let padHeight = pt.pad?.emotionalIntensity ?? (pt.analysis.expressiveScore * 0.8);

    // Override: Use User Authority Score if provided (Vertical Stratification)
    if (options?.authorityScore !== undefined) {
      padHeight = options.authorityScore;
    }

    // Destructure to remove 'analysis' from final object if not needed in PathPoint, 
    // or just pass it locally. PathPoint interface doesn't have 'analysis', so we exclude it.
    const { analysis, ...rest } = pt;

    return {
      ...rest,
      height,
      padHeight
    };
  });
}

export function getHeightAt(
  heightmap: Float32Array,
  size: number,
  x: number,
  y: number
): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);

  if (xi < 0 || xi >= size - 1 || yi < 0 || yi >= size - 1) {
    return 0;
  }

  const fx = x - xi;
  const fy = y - yi;

  const h00 = heightmap[yi * size + xi];
  const h10 = heightmap[yi * size + xi + 1];
  const h01 = heightmap[(yi + 1) * size + xi];
  const h11 = heightmap[(yi + 1) * size + xi + 1];

  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;

  return h0 * (1 - fy) + h1 * fy;
}

/**
 * Generate a density-based heightmap from a collection of paths.
 * Used for the global cluster visualization and potentially single-view context.
 */
export function generateDensityHeightmap(
  size: number,
  paths: { points: { x: number; y: number; pad?: { emotionalIntensity: number }; padHeight?: number }[] }[],
  options?: {
    useAuthorityForDensity?: boolean; // If true, uses Authority Score. If false/undefined, uses Emotional Intensity.
    intensityScale?: number;
  }
): Float32Array {
  const densityMap = new Float32Array(size * size).fill(0);
  const countMap = new Float32Array(size * size).fill(0);
  // const intensityScale = options?.intensityScale ?? 0.8; // Unused for now

  paths.forEach(({ points }) => {
    points.forEach(pt => {
      // Determine intensity value for Z-accumulation
      let intensity = 0;

      if (options?.useAuthorityForDensity && pt.padHeight !== undefined) {
        // If explicitly requested to use Authority (and it's stored in padHeight by caller), use it.
        intensity = pt.padHeight;
      } else {
        // Default: Emotional Intensity (Previous Heatmap Logic)
        // Fallback to expressiveScore if PAD not available
        // Note: casting to any to access analysis if needed, or check pad presence
        intensity = pt.pad?.emotionalIntensity ?? ((pt as any).analysis?.expressiveScore ? (pt as any).analysis.expressiveScore * 0.8 : 0.5);
      }

      const gridX = Math.floor(pt.x * (size - 1));
      const gridY = Math.floor(pt.y * (size - 1));
      const idx = gridY * size + gridX;

      if (idx >= 0 && idx < densityMap.length) {
        densityMap[idx] += intensity;
        countMap[idx] += 1;
      }

      // Gaussian spread
      const radius = 2;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = gridX + dx;
          const ny = gridY + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            const nidx = ny * size + nx;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const weight = Math.exp(-(dist * dist) / (2 * radius * radius));
            densityMap[nidx] += intensity * weight * 0.5;
            countMap[nidx] += weight * 0.5;
          }
        }
      }
    });
  });

  // Normalize
  for (let i = 0; i < densityMap.length; i++) {
    if (countMap[i] > 0) densityMap[i] /= countMap[i];
  }

  // Smooth
  const smoothed = new Float32Array(densityMap);
  const smoothRadius = 1;
  for (let y = smoothRadius; y < size - smoothRadius; y++) {
    for (let x = smoothRadius; x < size - smoothRadius; x++) {
      let sum = 0, count = 0;
      for (let dy = -smoothRadius; dy <= smoothRadius; dy++) {
        for (let dx = -smoothRadius; dx <= smoothRadius; dx++) {
          sum += densityMap[(y + dy) * size + (x + dx)];
          count++;
        }
      }
      smoothed[y * size + x] = sum / count;
    }
  }

  return smoothed;
}
