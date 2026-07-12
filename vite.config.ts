import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `vite` (dev server) serves this from `/`; `vite build` (used for the
// GitHub Pages demo, see .github/workflows/deploy-demo.yml) needs the
// project's Pages path as the base so asset URLs resolve correctly.
export default defineConfig(({ command }) => ({
  root: 'public',
  base: command === 'build' ? '/RubberDock/' : '/',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
}));
