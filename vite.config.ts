import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  server: {
    // In unified mode, Vite runs as middleware, so no proxy needed
    middlewareMode: true,
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
});

