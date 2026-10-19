import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // CRITICAL CLIENT SPECIFICATION: 90% per each file
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        perFile: true,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'prisma/**',
        'scripts/**',
        '**/*.d.ts',
        'tests/**',
        'src/types/**',
        '*.config.*',
        '**/*.config.*',
        'src/lib/prisma.ts',
        'src/app/layout.tsx',
      ],
    },
  },
});
