import { defineConfig } from 'vite';
import { resolve } from 'path';
import {
  assetFileNames,
  createResolveAliases,
  createVuePlugin,
  externalDependencies,
  terserOptions,
  treeshakeOptions,
  umdGlobals,
} from './build/vite-shared-options';

/**
 * UMD build pass.
 *
 * Runs after the ES pass and writes into the same `dist/` (hence
 * `emptyOutDir: false`). UMD is a single-file format, so it cannot share the ES
 * pass's preserved-module output and only exposes the package root — script-tag
 * consumers already have the MapLibre runtime on `window.maplibregl`.
 *
 * Declarations are emitted by the ES pass only; this pass would just duplicate
 * them.
 */
export default defineConfig({
  plugins: [createVuePlugin()],
  resolve: {
    alias: createResolveAliases(__dirname),
  },
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, './libs/index.ts'),
      name: 'VueMapLibreGL',
      fileName: () => 'index.umd.cjs',
      formats: ['umd'],
    },
    rollupOptions: {
      external: externalDependencies,
      output: {
        globals: umdGlobals,
        exports: 'named',
        assetFileNames,
        compact: true,
      },
      treeshake: treeshakeOptions,
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions,
    cssMinify: true,
    cssCodeSplit: false,
  },
  optimizeDeps: {
    include: ['vue'],
    exclude: ['maplibre-gl'],
  },
});
