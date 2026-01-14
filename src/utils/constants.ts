import * as THREE from 'three';

// Theme colors for dark mode
// Using chart colors for variety and visual interest
export const COLORS = {
  // Background - dark theme background
  background: '#000000',  // Pure black
  terrain: {
    // Terrain palette - dark mode (deep blue-greys)
    low: new THREE.Color(0x111827),   // Very dark blue (low elevation)
    mid: new THREE.Color(0x1f2937),   // Dark blue-gray (mid elevation)
    high: new THREE.Color(0x374151),  // Mid-dark gray (high elevation)
  },
  contour: {
    // Light grey contours for visibility on dark background
    minor: '#333333',  // Dark grey for minor contours
    major: '#4b5563',  // Mid grey for major contours
    index: '#6b7280',  // Light grey for index contours
  },

  marker: '#FF8400',
  wireframe: '#ffffff',
  grid: '#333333',      // Visible grey for grid on black
  gridDim: '#1f2937',   // Darker grey for secondary grid lines
  fog: '#000000',
  accent: new THREE.Color('#a78bfa'),     // Light purple accent
  label: '#e5e7eb',      // Light text for dark background
};

/**
 * Role-based color mapping for visual encoding (Social Role Theory Taxonomy)
 * Colors represent user positioning patterns (projections), not AI capabilities
 */
export const ROLE_COLORS: Record<string, string> = {
  // Human roles (6 roles) - Social Role Theory taxonomy
  'information-seeker': '#7b68ee',   // chart-1 (purple-blue) - instrumental, low authority
  'provider': '#4ade80',             // chart-2 (green) - instrumental, low authority (seeks from AI)
  'director': '#ec4899',             // chart-4 (magenta) - instrumental, high authority
  'collaborator': '#06b6d4',         // chart-6 (cyan) - instrumental, equal authority
  'social-expressor': '#fbbf24',     // chart-3 (yellow) - expressive, low authority
  // Note: relational-peer exists for both human and AI - using same color for consistency
  'relational-peer': '#4ade80',      // chart-2 (green) - expressive, equal authority (used by both human and AI)

  // AI roles (6 roles) - Social Role Theory taxonomy
  'expert-system': '#7b68ee',        // chart-1 (purple-blue) - instrumental, high authority
  'learning-facilitator': '#06b6d4', // chart-6 (cyan) - instrumental, low authority
  'advisor': '#ec4899',              // chart-4 (magenta) - instrumental, high authority (prescriptive)
  'co-constructor': '#4ade80',       // chart-2 (green) - instrumental, equal authority
  'social-facilitator': '#fbbf24',   // chart-3 (yellow) - expressive, low authority

  // Backward compatibility: map old role names to new ones
  'seeker': '#7b68ee',               // maps to information-seeker
  'challenger': '#f97316',           // maps to director
  'sharer': '#fbbf24',               // maps to social-expressor
  'expert': '#7b68ee',               // maps to expert-system
  'facilitator': '#06b6d4',          // maps to learning-facilitator (default)
  'reflector': '#fbbf24',            // maps to social-facilitator
  'peer': '#4ade80',                 // maps to relational-peer
  'affiliative': '#7b68ee',          // maps to social-facilitator
  'learner': '#4ade80',              // maps to provider
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

