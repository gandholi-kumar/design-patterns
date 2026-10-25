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
      '@tanstack/react-query': path.resolve(import.meta.dirname, 'src/lib/tanstack-query-shim.ts'),
      react: path.resolve(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.resolve(import.meta.dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query', 'zod'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
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
      allow: [
        path.resolve(import.meta.dirname),
        path.resolve(import.meta.dirname, '../../lib'),
        path.resolve(import.meta.dirname, '../../node_modules'),
      ],
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
  },
});
// Vite config reloaded

