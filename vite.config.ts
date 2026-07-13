import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Source-driven Tailwind v4 (clean SaaS theme in src/index.css). The build now
// compiles Tailwind from `@import "tailwindcss"` + `@theme` tokens instead of
// shipping the old 150KB pre-compiled cyberpunk stylesheet.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  // Dev server runs on :3000 because the FastAPI CORS allow-list includes
  // http://localhost:3000 (not the Vite default 5173). See backend config.py.
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Split heavy vendor libs into their own chunk so the app entry stays
    // under the 500 kB warning threshold and the vendor chunk caches well.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
          'query-vendor': ['@tanstack/react-query'],
          motion: ['framer-motion'],
          router: ['wouter'],
        },
      },
    },
  },
});