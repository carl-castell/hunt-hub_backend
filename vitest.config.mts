import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/tests/unit/**/*.test.ts',
      'src/tests/integration/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'src/db/seed.ts', 'src/db/enable-extensions.ts'],
    },
    env: {
      DB_PROVIDER: 'local',
      LOCAL_DATABASE_URL: 'postgresql://app:app@localhost:5434/appdb_test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
});
