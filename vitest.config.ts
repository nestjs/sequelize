import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    decorators: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    globals: true,
    fileParallelism: false,
  },
});
