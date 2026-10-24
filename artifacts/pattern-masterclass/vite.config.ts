import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = Number(process.env.PORT || 5173);
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-runtime-error-modal')
            .then((m) => (m.default || m)())
            .catch(() => null),
          await import('@replit/vite-plugin-cartographer')
            .then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            )
            .catch(() => null),
          await import('@replit/vite-plugin-dev-banner')
            .then((m) => m.devBanner())
            .catch(() => null),
        ].filter(Boolean)
      : []),
  ],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@workspace/api-client-react': path.resolve(import.meta.dirname, '../../lib/api-client-react/src/index.ts'),
      '@workspace/api-zod': path.resolve(import.meta.dirname, '../../lib/api-zod/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('wouter')) {
              return 'vendor-react';
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('lucide-react') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx')
            ) {
              return 'vendor-ui';
            }
            if (
              id.includes('@blocknote') ||
              id.includes('@mantine') ||
              id.includes('prosemirror')
            ) {
              return 'vendor-blocknote';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'vendor-state';
            }
          }
        },
      },
    },
  },
  server: {
    port,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
  },
});
// Vite config reloaded

