import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
        '@verdescan/shared': path.resolve(import.meta.dirname ?? '.', 'packages/shared/src/index.ts'),
        '@verdescan/kb': path.resolve(import.meta.dirname ?? '.', 'packages/kb/src/index.ts'),
        '@verdescan/functions': path.resolve(import.meta.dirname ?? '.', 'functions/src/index.ts'),
        '@verdescan/eval': path.resolve(import.meta.dirname ?? '.', 'packages/eval/src/runner.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // Used by `npm start` on Render: bind to all interfaces and accept the *.onrender.com host.
    preview: {
      host: true,
      allowedHosts: true,
    },
  };
});
