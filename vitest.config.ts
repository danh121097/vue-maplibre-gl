import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@libs': resolve(__dirname, './libs'),
      '@libs/composables': resolve(__dirname, './libs/composables'),
      '@libs/enums': resolve(__dirname, './libs/enums'),
      '@libs/types': resolve(__dirname, './libs/types'),
      '@libs/components': resolve(__dirname, './libs/components'),
      '@libs/helpers': resolve(__dirname, './libs/helpers'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
