import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['assets/ts/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
