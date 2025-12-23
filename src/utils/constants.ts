import * as THREE from 'three';

// Theme colors for dark mode
// Using chart colors for variety and visual interest
export const COLORS = {
  // Background - dark theme background
  background: '#fefefe',  // Pure black (change to any hex color you prefer)
  terrain: {
    // Terrain palette - brighter, higher contrast grays for visibility on dark background
    low: new THREE.Color(0x606060),   // Medium-dark gray (brighter)
    mid: new THREE.Color(0x808080),   // Medium gray (brighter)
    high: new THREE.Color(0xa0a0a0),  // Light gray (brighter, higher contrast)
  },
  contour: {
    // Very dark grey contours for visibility on light background
    minor: '#303030',  // Very dark grey for minor contours
    major: '#202020',  // Darker grey for major contours
    index: '#101010',  // Darkest grey for index contours
  },

  marker: '#FF8400',
  wireframe: '#000000',
  grid: '#000000',      // Dark gray for visibility on dark background
  gridDim: '#000000',   // Very dark gray for secondary grid lines
  fog: '#000000',
  accent: new THREE.Color('#000000'),     // chart-1 as primary accent
  label: '#000000',      // Light text for dark background
};

/**
 * Role-based color mapping for visual encoding
 * Colors represent user positioning patterns (projections), not AI capabilities
 */
export const ROLE_COLORS: Record<string, string> = {
  // Human roles (user projections) - using chart colors
  'director': '#ec4899',      // chart-4 (magenta) - instructor/leader
  'challenger': '#f97316',    // chart-5 (orange) - evaluator
  'seeker': '#7b68ee',        // chart-1 (purple-blue) - dependent/inquirer
  'learner': '#4ade80',       // chart-2 (green) - dependent/student
  'sharer': '#fbbf24',        // chart-3 (yellow) - confidant
  'collaborator': '#7b68ee',  // chart-1 variant - collaborator
  
  // AI roles (how user positioned AI) - using chart colors
  'expert': '#7b68ee',        // chart-1 (purple-blue) - authority
  'advisor': '#4ade80',       // chart-2 (green) - guidance
  'facilitator': '#ec4899',   // chart-4 (magenta) - helper
  'reflector': '#fbbf24',     // chart-3 (yellow) - mirror
  'peer': '#4ade80',          // chart-2 (green) - equal
  'affiliative': '#7b68ee',   // chart-1 (purple-blue) - friend
};

/**
 * Get color for a role (human or AI)
 */
export function getColorForRole(role: string | undefined): string {
  if (!role) return COLORS.marker;
  return ROLE_COLORS[role] || COLORS.marker;
}

export const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0 },
    angle: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    
    void main() {
      vec2 offset = amount * vec2(cos(angle), sin(angle));
      
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

export const RGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 },
    angle: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    
    void main() {
      vec2 offset = vec2(cos(angle), sin(angle)) * amount;
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cga = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    }
  `
};

