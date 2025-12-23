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
 * Get color for a PAD change value (optimized for white/light backgrounds)
 * - Negative (decline): Grey to Reddish Orange gradient
 * - Zero (neutral): Grey
 * - Positive (incline): Grey to Lime Green gradient
 */
export function getPadChangeColor(change: number): THREE.Color {
  if (change < 0) {
    // Decline: Grey (#808080) to Reddish Orange (#ff5722)
    const t = Math.abs(change);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x808080), // Grey
      new THREE.Color(0xff5722), // Reddish Orange
      t
    );
  } else if (change > 0) {
    // Incline: Grey (#808080) to Lime Green (#32cd32)
    const t = change;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x808080), // Grey
      new THREE.Color(0x32cd32), // Lime Green
      t
    );
  } else {
    // Neutral: Grey
    return new THREE.Color(0x808080);
  }
}

/**
 * Get hex color string for a PAD change value (for SVG, optimized for white/light backgrounds)
 */
export function getPadChangeColorHex(change: number): string {
  if (change < 0) {
    // Decline: Grey (#808080) to Reddish Orange (#ff5722) gradient
    const t = Math.abs(change);
    const r = Math.round(128 + (255 - 128) * t); // 0x80 to 0xff
    const g = Math.round(128 - (128 - 87) * t);  // 0x80 to 0x57
    const b = Math.round(128 - (128 - 34) * t);  // 0x80 to 0x22
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (change > 0) {
    // Incline: Grey (#808080) to Lime Green (#32cd32) gradient
    const t = change;
    const r = Math.round(128 - (128 - 50) * t);  // 0x80 to 0x32
    const g = Math.round(128 + (205 - 128) * t); // 0x80 to 0xcd
    const b = Math.round(128 - (128 - 50) * t);  // 0x80 to 0x32
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // Neutral: Grey
    return '#808080';
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

