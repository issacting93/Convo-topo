import * as THREE from 'three';

export const COLORS = {
  background: '#0a0a0a',
  terrain: {
    // Brightened terrain palette for visibility
    low: new THREE.Color(0x2a2a2a),
    mid: new THREE.Color(0x4d4d33),
    high: new THREE.Color(0x7a7a44),
  },
  contour: {
    minor: '#c8d432',
    major: '#d4e040',
    index: '#e8f050', // Every 5th major line
  },
  wireframe: '#1a1a1a',
  grid: '#2a2a1a',
  gridDim: '#1a1a0a',
  marker: '#44ff66',
  markerGlow: '#66ff88',
  path: '#44ff66',
  pathGlow: '#22ff44',
  fog: '#050505',
  accent: '#c8d432',
  label: '#c8d432',
};

/**
 * Role-based color mapping for visual encoding
 * Colors represent user positioning patterns (projections), not AI capabilities
 */
export const ROLE_COLORS: Record<string, string> = {
  // Human roles (user projections)
  'director': '#ff6b6b',      // Red - instructor/leader
  'challenger': '#ff8e53',    // Orange - evaluator
  'seeker': '#4ecdc4',        // Cyan - dependent/inquirer
  'learner': '#45b7d1',       // Blue - dependent/student
  'sharer': '#96ceb4',        // Green - confidant
  'collaborator': '#ffeaa7',  // Yellow - collaborator
  
  // AI roles (how user positioned AI)
  'expert': '#a29bfe',        // Purple - authority
  'advisor': '#6c5ce7',       // Deep purple - guidance
  'facilitator': '#fd79a8',   // Pink - helper
  'reflector': '#fdcb6e',     // Gold - mirror
  'peer': '#55efc4',         // Teal - equal
  'affiliative': '#81ecec',  // Light cyan - friend
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

