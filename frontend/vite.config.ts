import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 5000,
    allowedHosts: [
      'dashboard-pgcomp.app.ic.ufba.br',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separa bibliotecas do Radix
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // Separa as validações e formulários (Zod + Hook Form)
          if (id.includes('zod') || id.includes('react-hook-form')) {
            return 'vendor-forms';
          }
          // Separa ícones (Lucide costuma ser grande se o tree-shaking falhar)
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
});
