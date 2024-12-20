import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        webview: './webview-ui/main.tsx'
      },
      external: ['vscode'],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]'
      },
    },
    outDir: 'dist/webview',
    target: 'node16',
  }
})
