// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default', // import Logo from './logo.svg' (default export)
        ref: true, // permite forwardRef en SVGs
        svgo: false, // no optimiza/modifica los SVGs
        titleProp: true, // permite pasar <Logo title="..." />
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "/src/styles/_variables.scss" as *;\n`,
      },
    },
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      '@': '/src', // import X from '@/components/X'
      '@utils': '/utils',
    },
  },
});
