import type { PathPoint } from './terrain';
import * as THREE from 'three';

/**
 * Calculate the change in PAD emotional intensity between two points
 * Returns a value from -1 (steep decline) to +1 (steep incline)
 */
export function calculatePadChange(
  current: PathPoint,
  next: PathPoint
): number {
  const currentIntensity = current.pad?.emotionalIntensity ?? current.padHeight ?? current.height;
  const nextIntensity = next.pad?.emotionalIntensity ?? next.padHeight ?? next.height;
  
  const change = nextIntensity - currentIntensity;
  // Normalize to -1 to +1 range (assuming max change is around 0.5)
  return Math.max(-1, Math.min(1, change * 2));
}

/**
 * Get color for a PAD change value (optimized for white background visibility)
 * - Negative (decline): Very dark grey to Very dark orange gradient
 * - Zero (neutral): Very dark grey
 * - Positive (incline): Very dark grey to Very dark green gradient
 */
export function getPadChangeColor(change: number): THREE.Color {
  if (change < 0) {
    // Decline: Very dark grey (#333333) to Very dark orange (#993300) - maximum contrast on white
    const t = Math.abs(change);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x333333), // Very dark grey
      new THREE.Color(0x993300), // Very dark orange/red-brown
      t
    );
  } else if (change > 0) {
    // Incline: Very dark grey (#333333) to Very dark green (#006600) - maximum contrast on white
    const t = change;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x333333), // Very dark grey
      new THREE.Color(0x006600), // Very dark green
      t
    );
  } else {
    // Neutral: Very dark grey
    return new THREE.Color(0x333333);
  }
}

/**
 * Get hex color string for a PAD change value (for SVG, optimized for white/light backgrounds)
 */
export function getPadChangeColorHex(change: number): string {
  if (change < 0) {
    // Decline: Very dark grey (#333333) to Very dark orange (#993300) gradient
    const t = Math.abs(change);
    const r = Math.round(51 + (153 - 51) * t);  // 0x33 to 0x99
    const g = Math.round(51 - (51 - 51) * t);   // 0x33 to 0x33
    const b = Math.round(51 - (51 - 0) * t);    // 0x33 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (change > 0) {
    // Incline: Very dark grey (#333333) to Very dark green (#006600) gradient
    const t = change;
    const r = Math.round(51 - (51 - 0) * t);    // 0x33 to 0x00
    const g = Math.round(51 + (102 - 51) * t);  // 0x33 to 0x66
    const b = Math.round(51 - (51 - 0) * t);    // 0x33 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // Neutral: Very dark grey
    return '#333333';
  }
}

/**
 * Calculate PAD changes for all segments in a path
 */
export function calculatePathPadChanges(points: PathPoint[]): number[] {
  const changes: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    changes.push(calculatePadChange(points[i], points[i + 1]));
  }
  return changes;
}

