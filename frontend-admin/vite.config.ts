import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis', 
  },
  optimizeDeps: {
    include: ['crypto-browserify', 'stream-browserify', 'buffer', 'util'],
  },
  build: {
    rollupOptions: {
      external: ['crypto', 'stream', 'buffer', 'util'],
    },
  },
});
