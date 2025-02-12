import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';  

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        webview: './projects/webview-ui/src/main.tsx'
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
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'projects/shared/src')
    }
  }
})
