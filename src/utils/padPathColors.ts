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
 * Get color for a PAD change value (optimized for 3D scene visibility)
 * - Negative (decline): Light grey to Bright Orange gradient
 * - Zero (neutral): Light grey
 * - Positive (incline): Light grey to Bright Lime Green gradient
 */
export function getPadChangeColor(change: number): THREE.Color {
  if (change < 0) {
    // Decline: Light grey (#b0b0b0) to Bright Orange (#ff6600) - more vibrant
    const t = Math.abs(change);
    return new THREE.Color().lerpColors(
      new THREE.Color(0xb0b0b0), // Light grey (brighter for visibility)
      new THREE.Color(0xff6600), // Bright Orange (more vivid)
      t
    );
  } else if (change > 0) {
    // Incline: Light grey (#b0b0b0) to Bright Lime Green (#00ff00) - more vibrant
    const t = change;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xb0b0b0), // Light grey (brighter for visibility)
      new THREE.Color(0x00ff00), // Bright Lime Green (pure, vibrant)
      t
    );
  } else {
    // Neutral: Light grey
    return new THREE.Color(0xb0b0b0);
  }
}

/**
 * Get hex color string for a PAD change value (for SVG, optimized for white/light backgrounds)
 */
export function getPadChangeColorHex(change: number): string {
  if (change < 0) {
    // Decline: Light grey (#b0b0b0) to Bright Orange (#ff6600) gradient
    const t = Math.abs(change);
    const r = Math.round(176 + (255 - 176) * t); // 0xb0 to 0xff
    const g = Math.round(176 - (176 - 102) * t); // 0xb0 to 0x66
    const b = Math.round(176 - (176 - 0) * t);   // 0xb0 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (change > 0) {
    // Incline: Light grey (#b0b0b0) to Bright Lime Green (#00ff00) gradient
    const t = change;
    const r = Math.round(176 - (176 - 0) * t);   // 0xb0 to 0x00
    const g = Math.round(176 + (255 - 176) * t); // 0xb0 to 0xff
    const b = Math.round(176 - (176 - 0) * t);   // 0xb0 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // Neutral: Light grey
    return '#b0b0b0';
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

