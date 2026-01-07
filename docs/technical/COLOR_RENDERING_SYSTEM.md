# Color Rendering System in ThreeScene

This document explains how colors are rendered in the `ThreeScene.tsx` component.

---

## Color Rendering Pipeline Overview

The color rendering system uses **different approaches** depending on the object type:

1. **Terrain**: Vertex colors + Lambert material (lighting-aware) + emissive glow
2. **Markers**: MeshBasicMaterial (flat colors, no lighting) with transparency
3. **Contours**: LineBasicMaterial (flat colors) with animated opacity
4. **Grid/Axes**: LineBasicMaterial (flat colors) with transparency
5. **Post-processing**: Bloom and RGB shift effects

---

## 1. Terrain Colors

### Color Source: `COLORS.terrain` (from constants.ts)
```typescript
terrain: {
  low: new THREE.Color(0x606060),   // Medium-dark gray
  mid: new THREE.Color(0x808080),   // Medium gray
  high: new THREE.Color(0xa0a0a0),  // Light gray
}
```

### Rendering Process

**Step 1: Vertex Color Calculation** (`createTerrainGeometry`, lines 1219-1236)
```typescript
// For each vertex in the terrain mesh:
const h = heightmap[idx]; // Height value (0-1)

// Interpolate color based on height
const color = new THREE.Color().lerpColors(
  COLORS.terrain.low,        // Start: dark gray
  h > 0.6 ? COLORS.terrain.high : COLORS.terrain.mid, // End: light or mid gray
  h * 0.85                   // Interpolation factor (higher contrast)
);

// Brighten colors by TERRAIN_BRIGHTEN multiplier (2.2x)
colors[vertIdx] = Math.min(1, color.r * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
colors[vertIdx + 1] = Math.min(1, color.g * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
colors[vertIdx + 2] = Math.min(1, color.b * LIGHTING_CONFIG.TERRAIN_BRIGHTEN);
```

**Result**: Height-based gradient from dark gray (low) to light gray (high), brightened 2.2x.

**Step 2: Material Application** (lines 512-518)
```typescript
const material = new THREE.MeshLambertMaterial({
  vertexColors: true,              // Use vertex colors (from Step 1)
  transparent: false,
  side: THREE.DoubleSide,
  emissive: new THREE.Color(0x334455),  // Emissive glow color (blue-gray)
  emissiveIntensity: 0.35                // 35% emissive intensity
});
```

**Lambert Material Behavior**:
- Vertex colors are multiplied by lighting (ambient + directional)
- Emissive color adds a constant glow (not affected by lighting)
- Final color = (vertexColor × lighting) + (emissiveColor × emissiveIntensity)

**Lighting Contributions** (lines 225-245):
- **Ambient Light**: `0x445566` at intensity `1.2` (fills shadows, blue-gray tint)
- **Directional Light 1**: `0xaaccdd` at intensity `1.0` (main light, blue-white)
- **Directional Light 2**: `0x6688aa` at intensity `0.6` (fill light, blue-gray)

**Final Terrain Color Formula**:
```
finalColor = (vertexColor × ambientLight × dirLight1 × dirLight2) + (emissiveColor × 0.35)
```

**Note**: Terrain is currently **hidden** (`terrain.visible = false`) - only contours are shown.

---

## 2. Marker Colors

### Color Source: Props or `COLORS` constants
```typescript
// Default colors from constants.ts
userMarker: '#7b68ee',        // Purple-blue (chart-1)
userMarkerGlow: '#9b88f0',    // Lighter purple-blue
assistantMarker: '#f97316',   // Orange (chart-5)
assistantMarkerGlow: '#fb923c', // Lighter orange
```

### Rendering Process (`createMarkerGroup`, lines 1278-1301)

**Step 1: Determine Marker Type**
```typescript
if (point.role === 'user') {
  markerColor = userMarker;      // '#7b68ee' (purple-blue)
  glowColor = userMarkerGlow;    // '#9b88f0' (lighter)
} else if (point.role === 'assistant') {
  markerColor = assistantMarker;     // '#f97316' (orange)
  glowColor = assistantMarkerGlow;   // '#fb923c' (lighter)
}
```

**Step 2: Apply Colors to Marker Components**

**Pole** (lines 1308-1313):
```typescript
const poleMat = new THREE.LineBasicMaterial({
  color: markerColor,      // Purple-blue or orange
  transparent: true,
  opacity: 0.6             // 60% opacity
});
```
- Uses `LineBasicMaterial` → **flat color, no lighting**

**Head (Sphere)** (lines 1322-1326):
```typescript
const headMat = new THREE.MeshBasicMaterial({
  color: glowColor,        // Lighter variant (glow color)
  transparent: true,
  opacity: 0.9             // 90% opacity
});
```
- Uses `MeshBasicMaterial` → **flat color, no lighting**

**Glow Ring** (lines 1337-1342):
```typescript
const glowMat = new THREE.MeshBasicMaterial({
  color: glowColor,        // Lighter variant
  transparent: true,
  opacity: 0.8,            // 80% opacity
  side: THREE.DoubleSide
});
```
- Uses `MeshBasicMaterial` → **flat color, no lighting**

**Base (Circle)** (lines 1353-1358):
```typescript
const baseMat = new THREE.MeshBasicMaterial({
  color: markerColor,      // Base color
  transparent: true,
  opacity: 0.8,            // 80% opacity
  side: THREE.DoubleSide
});
```
- Uses `MeshBasicMaterial` → **flat color, no lighting**

**Key Point**: All marker components use **basic materials** (no lighting), so colors are rendered **exactly as specified** (with opacity applied).

---

## 3. Contour Colors

### Color Source: Props (default from `COLORS.contour`)
```typescript
contourColors = {
  minor: '#a0d080',  // Light yellow-green
  major: '#b0e090',  // Lighter yellow-green
  index: '#c0f0a0',  // Lightest yellow-green (every 10th contour)
}
```

### Rendering Process (lines 553-600)

**Step 1: Determine Contour Type**
```typescript
const isIndex = contourIdx % 10 === 0; // Every 10th is index contour
const color = isIndex 
  ? contourColors.index      // '#c0f0a0' (lightest)
  : (isMajor 
    ? contourColors.major    // '#b0e090' (lighter)
    : contourColors.minor);  // '#a0d080' (base)
```

**Step 2: Apply Color with Animated Opacity**
```typescript
const baseOpacity = isIndex ? 1.0 : (isMajor ? 0.9 : 0.85);
const material = new THREE.LineBasicMaterial({
  color: color,              // Yellow-green variant
  transparent: true,
  opacity: baseOpacity,      // 85-100% base opacity
  linewidth: isMajor ? 3 : 2
});
```

**Step 3: Animated Opacity** (lines 1057-1089)
- Opacity pulses based on elevation and time
- Creates wave-like pulsing effect
- Final opacity = `baseOpacity × (1 - amplitude + amplitude × pulse)`

**Key Point**: Contours use **LineBasicMaterial** (flat colors), with **animated opacity** for visual effect.

---

## 4. Grid and Axis Colors

### Color Source: `COLORS` constants
```typescript
grid: '#404040',        // Dark gray
gridDim: '#2a2a2a',     // Very dark gray (secondary lines)
accent: new THREE.Color('#7b68ee'), // Purple-blue (chart-1)
```

### Grid (lines 248-258)
```typescript
const gridHelper = new THREE.GridHelper(
  terrainSize * 1.4,
  28,
  COLORS.grid,          // '#404040' (dark gray)
  COLORS.gridDim        // '#2a2a2a' (very dark gray)
);
// Opacity: 0.9 (90%)
```
- Uses Three.js `GridHelper` → renders grid lines with specified colors

### Axes (lines 265-292)
```typescript
const xAxisMat = new THREE.LineBasicMaterial({
  color: COLORS.accent,     // '#7b68ee' (purple-blue)
  transparent: true,
  opacity: 0.8              // 80% opacity
});
```
- Uses `LineBasicMaterial` → flat colors

---

## 5. Path Line Colors

### Color Source: `COLORS.path`
```typescript
path: '#FDD90D',  // Yellow/gold
```

### Rendering Process (lines 672-684)
```typescript
const pathMat = new THREE.LineDashedMaterial({
  color: COLORS.path,       // '#FDD90D' (yellow/gold)
  dashSize: 0.25,
  gapSize: 0.12,
  transparent: true,
  opacity: 1.0              // 100% opacity
});
```
- Uses `LineDashedMaterial` → flat color with dashed pattern
- No lighting effects

---

## 6. Post-Processing Effects

### Bloom (lines 1118-1126)
```typescript
const bloomPass = new UnrealBloomPass(
  resolution,
  strength: 0.3,        // 30% bloom strength
  radius: 0.4,          // Bloom radius
  threshold: 0.85       // Only bright pixels (>0.85) bloom
);
```
- **Effect**: Bright areas (markers, contours) get a glow
- **Color**: Preserves original colors, adds brightness/glow

### RGB Shift (lines 1131-1136, 1160-1162)
```typescript
const rgbPass = new ShaderPass(RGBShiftShader);
rgbPass.uniforms.amount.value = 0.0;  // Initially disabled
rgbPass.uniforms.angle.value = Math.PI / 3;
```
- **Effect**: When a point is locked, RGB channels shift slightly (chromatic aberration effect)
- **Color**: Creates color separation (red, green, blue channels offset)
- **Activation**: Only when `lockedPoint !== null`, animated based on time

---

## Color Rendering Summary

| Element | Material Type | Lighting | Color Source | Opacity |
|---------|--------------|----------|--------------|---------|
| **Terrain** | `MeshLambertMaterial` | ✅ Yes (ambient + 2 directional) | Vertex colors (height-based gradient) | N/A (not transparent) |
| **Marker Pole** | `LineBasicMaterial` | ❌ No | `markerColor` (props or constants) | 0.6 |
| **Marker Head** | `MeshBasicMaterial` | ❌ No | `glowColor` (props or constants) | 0.9 |
| **Marker Glow** | `MeshBasicMaterial` | ❌ No | `glowColor` (props or constants) | 0.8 (animated) |
| **Marker Base** | `MeshBasicMaterial` | ❌ No | `markerColor` (props or constants) | 0.8 |
| **Contours** | `LineBasicMaterial` | ❌ No | `contourColors` (props) | 0.85-1.0 (animated) |
| **Grid** | `GridHelper` | ❌ No | `COLORS.grid` / `COLORS.gridDim` | 0.9 |
| **Axes** | `LineBasicMaterial` | ❌ No | `COLORS.accent` | 0.8 |
| **Path Line** | `LineDashedMaterial` | ❌ No | `COLORS.path` | 1.0 |

---

## Key Design Decisions

### 1. Terrain Uses Vertex Colors + Lighting
- **Why**: Creates realistic depth perception
- **How**: Height-based gradient, multiplied by lighting, plus emissive glow
- **Result**: 3D appearance with shadows and highlights

### 2. Markers Use Flat Colors (No Lighting)
- **Why**: Ensures consistent color appearance regardless of lighting angle
- **How**: `MeshBasicMaterial` and `LineBasicMaterial` ignore lighting
- **Result**: Markers always appear in their intended colors (purple-blue for user, orange for assistant)

### 3. Contours Use Flat Colors with Animated Opacity
- **Why**: Pulsing effect helps visualize terrain elevation
- **How**: `LineBasicMaterial` with time-based opacity animation
- **Result**: Contours pulse based on elevation, creating wave-like effect

### 4. Post-Processing Adds Visual Effects
- **Bloom**: Adds glow to bright areas (markers, contours)
- **RGB Shift**: Creates chromatic aberration when point is locked (focus effect)
- **Result**: Enhanced visual feedback for interaction

---

## Color Constants Reference

All colors are defined in `src/utils/constants.ts`:

```typescript
export const COLORS = {
  background: '#030213',              // Dark background
  terrain: {
    low: new THREE.Color(0x606060),   // Medium-dark gray
    mid: new THREE.Color(0x808080),   // Medium gray
    high: new THREE.Color(0xa0a0a0),  // Light gray
  },
  contour: {
    minor: '#a0d080',                 // Light yellow-green
    major: '#b0e090',                 // Lighter yellow-green
    index: '#c0f0a0',                 // Lightest yellow-green
  },
  grid: '#404040',                    // Dark gray
  gridDim: '#2a2a2a',                 // Very dark gray
  path: '#FDD90D',                    // Yellow/gold
  userMarker: '#7b68ee',              // Purple-blue (chart-1)
  userMarkerGlow: '#9b88f0',          // Lighter purple-blue
  assistantMarker: '#f97316',         // Orange (chart-5)
  assistantMarkerGlow: '#fb923c',     // Lighter orange
  accent: new THREE.Color('#7b68ee'), // Purple-blue (chart-1)
  fog: '#050810',                     // Dark blue-black
};
```

---

## Customization

Colors can be customized via props:

1. **Marker Colors**: Pass `markerColors` prop to `ThreeScene`
   ```typescript
   markerColors={{
     user: '#custom-color',
     userGlow: '#custom-glow',
     assistant: '#custom-color',
     assistantGlow: '#custom-glow'
   }}
   ```

2. **Contour Colors**: Pass `contourColors` prop to `ThreeScene`
   ```typescript
   contourColors={{
     minor: '#custom-color',
     major: '#custom-color',
     index: '#custom-color'
   }}
   ```

3. **Default Colors**: Modify `COLORS` object in `src/utils/constants.ts`

---

## Performance Considerations

1. **Vertex Colors**: Terrain uses vertex colors for efficient rendering (no texture lookups)
2. **Basic Materials**: Markers and contours use basic materials (no lighting calculations = faster)
3. **Post-Processing**: Bloom uses reduced resolution (`BLOOM_RESOLUTION_DIVISOR: 2`) for performance
4. **Opacity Animation**: Contour opacity animation is throttled (`CONTOUR_ANIMATION_THROTTLE: 2`) to reduce updates

