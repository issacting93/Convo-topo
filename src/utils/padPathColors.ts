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
 * - Negative (decline): Dark grey to Dark Orange gradient
 * - Zero (neutral): Dark grey
 * - Positive (incline): Dark grey to Dark Green gradient
 */
export function getPadChangeColor(change: number): THREE.Color {
  if (change < 0) {
    // Decline: Dark grey (#555555) to Dark Orange (#cc4400) - strong contrast on white
    const t = Math.abs(change);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x555555), // Dark grey (visible on white)
      new THREE.Color(0xcc4400), // Dark Orange (strong, visible)
      t
    );
  } else if (change > 0) {
    // Incline: Dark grey (#555555) to Dark Green (#00aa00) - strong contrast on white
    const t = change;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x555555), // Dark grey (visible on white)
      new THREE.Color(0x00aa00), // Dark Green (visible, not too bright)
      t
    );
  } else {
    // Neutral: Dark grey
    return new THREE.Color(0x555555);
  }
}

/**
 * Get hex color string for a PAD change value (for SVG, optimized for white/light backgrounds)
 */
export function getPadChangeColorHex(change: number): string {
  if (change < 0) {
    // Decline: Dark grey (#555555) to Dark Orange (#cc4400) gradient
    const t = Math.abs(change);
    const r = Math.round(85 + (204 - 85) * t);  // 0x55 to 0xcc
    const g = Math.round(85 - (85 - 68) * t);   // 0x55 to 0x44
    const b = Math.round(85 - (85 - 0) * t);    // 0x55 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (change > 0) {
    // Incline: Dark grey (#555555) to Dark Green (#00aa00) gradient
    const t = change;
    const r = Math.round(85 - (85 - 0) * t);    // 0x55 to 0x00
    const g = Math.round(85 + (170 - 85) * t);  // 0x55 to 0xaa
    const b = Math.round(85 - (85 - 0) * t);    // 0x55 to 0x00
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // Neutral: Dark grey
    return '#555555';
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

