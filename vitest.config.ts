import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
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
    coverage: {
      provider: 'v8',
      include: ['libs/**/*.ts'],
      exclude: ['libs/**/__tests__/**', 'libs/test-utils.ts'],
      reporter: ['text-summary', 'json-summary'],
      /**
       * A ratchet, not a target. Every number below is the coverage the file
       * actually had when the gate went in, so the suite can only get better —
       * a change that drops coverage on a covered file fails the run.
       *
       * The per-file entries are the modules with real tests. The top-level
       * numbers are the floor for `libs/` as a whole, which is low because most
       * layer, camera and control composables still have no tests at all.
       *
       * Raising a number after adding tests is expected. Lowering one needs a
       * reason in the commit message.
       */
      thresholds: {
        statements: 30,
        branches: 24,
        functions: 26,
        lines: 31,

        'libs/composables/event/createEventListenerComposable.ts': {
          statements: 87,
          branches: 71,
          functions: 90,
          lines: 89,
        },
        'libs/composables/event/useMapReloadEvent.ts': {
          statements: 53,
          branches: 50,
          functions: 56,
          lines: 56,
        },
        'libs/composables/layers/createLayerPropertySetters.ts': {
          statements: 90,
          branches: 84,
          functions: 100,
          lines: 94,
        },
        'libs/composables/layers/useCreateLayer.ts': {
          statements: 48,
          branches: 41,
          functions: 52,
          lines: 50,
        },
        'libs/composables/map/useCreateImage.ts': {
          statements: 64,
          branches: 43,
          functions: 84,
          lines: 65,
        },
        'libs/composables/map/useCreateMaplibre.ts': {
          statements: 40,
          branches: 26,
          functions: 55,
          lines: 43,
        },
        'libs/composables/map/useCreateMarker.ts': {
          statements: 37,
          branches: 37,
          functions: 42,
          lines: 40,
        },
        'libs/composables/map/useCreatePopup.ts': {
          statements: 39,
          branches: 42,
          functions: 45,
          lines: 41,
        },
        'libs/composables/map/useMaplibre.ts': {
          statements: 35,
          branches: 36,
          functions: 14,
          lines: 35,
        },
        'libs/composables/sources/useCreateGeoJsonSource.ts': {
          statements: 56,
          branches: 51,
          functions: 61,
          lines: 62,
        },
        'libs/composables/utils/createCameraAnimation.ts': {
          statements: 82,
          branches: 93,
          functions: 76,
          lines: 83,
        },
        'libs/composables/utils/useFitScreenCoordinates.ts': {
          statements: 62,
          branches: 50,
          functions: 64,
          lines: 65,
        },
        'libs/helpers/index.ts': {
          statements: 30,
          branches: 31,
          functions: 40,
          lines: 30,
        },
      },
    },
  },
});
