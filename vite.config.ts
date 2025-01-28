import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';  
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared')
    }
  }
})
