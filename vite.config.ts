import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js core and addons into separate chunks
          'three-core': ['three'],
          'three-addons': [
            'three/addons/postprocessing/EffectComposer.js',
            'three/addons/postprocessing/RenderPass.js',
            'three/addons/postprocessing/UnrealBloomPass.js',
            'three/addons/lines/Line2.js',
            'three/addons/lines/LineGeometry.js',
            'three/addons/lines/LineMaterial.js',
          ],
          // Split large UI library
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // Split react-window for terrain grid
          'grid-vendor': ['react-window'],
        },
      },
    },
  },
});

