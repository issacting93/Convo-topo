import * as THREE from 'three';

export const TerrainFresnelShader = {
    uniforms: {
        uBaseColor: { value: new THREE.Color(0xffffff) },
        uRimColor: { value: new THREE.Color(0xffffff) },
        uFresnelPower: { value: 2.0 },
        uBaseOpacity: { value: 0.1 },
        uRimOpacity: { value: 0.8 },
    },
    vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uRimColor;
    uniform float uFresnelPower;
    uniform float uBaseOpacity;
    uniform float uRimOpacity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Calculate Fresnel term
      float fresnel = dot(viewDir, normal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, uFresnelPower);

      // Mix base color and rim color
      vec3 color = mix(uBaseColor, uRimColor, fresnel);
      
      // Calculate opacity
      float opacity = mix(uBaseOpacity, uRimOpacity, fresnel);

      gl_FragColor = vec4(color, opacity);
    }
  `
};
