import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  resolve: {
    alias: {
      // sample/CustomReleaseNotes.tsx はアプリにそのまま写せるよう、パッケージ名で import している
      '@twuw-b/dev-tools': resolve(__dirname, '../src/index.ts'),
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3000,
  },
});
