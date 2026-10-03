import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chess-core': path.resolve(__dirname, '../../packages/chess-core/src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/ai': path.resolve(__dirname, './src/ai'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
});
