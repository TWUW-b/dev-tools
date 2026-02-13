import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/api/**/*.test.ts'],
    testTimeout: 10000,
    fileParallelism: false, // 共有DB（SQLite）のためファイル間は直列実行
  },
});
