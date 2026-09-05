/**
 * Options shared by the two library build passes.
 *
 * The ES pass (`vite.config.ts`) emits preserved modules so consumers can
 * tree-shake at file granularity; the UMD pass (`vite.config.umd.ts`) emits a
 * single self-contained bundle. Rollup cannot do both in one pass — UMD is a
 * code-splitting-free format and preserved modules are code splitting — so the
 * pieces both passes need live here rather than being duplicated.
 */
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import type { PluginOption } from 'vite';
import type { PreRenderedAsset, PreRenderedChunk } from 'rollup';

/** Dependencies the consumer supplies; never bundled into the output. */
export const externalDependencies = ['vue', 'maplibre-gl'];

/** Global names for the UMD build's externals. */
export const umdGlobals = {
  vue: 'Vue',
  'maplibre-gl': 'maplibregl',
} as const;

/**
 * Path aliases used across `libs/`.
 * @param projectRoot - Absolute path to the repository root.
 */
export function createResolveAliases(projectRoot: string) {
  return {
    '@libs': resolve(projectRoot, './libs'),
    '@libs/composables': resolve(projectRoot, './libs/composables'),
    '@libs/enums': resolve(projectRoot, './libs/enums'),
    '@libs/types': resolve(projectRoot, './libs/types'),
    '@libs/components': resolve(projectRoot, './libs/components'),
    '@libs/helpers': resolve(projectRoot, './libs/helpers'),
  };
}

/** The Vue SFC plugin, configured identically for both passes. */
export function createVuePlugin(): PluginOption {
  return vue({
    template: {
      compilerOptions: {
        // Enable hoisting for better performance
        hoistStatic: true,
        // Cache inline component props
        cacheHandlers: true,
      },
    },
  });
}

/**
 * Emit every CSS asset as `style.css`. Vite requires a single asset naming
 * pattern across all outputs, so both passes use this one.
 */
export const assetFileNames = (assetInfo: PreRenderedAsset): string => {
  if (assetInfo.names?.some((name) => name.endsWith('.css'))) {
    return 'style.css';
  }
  return '[name].[ext]';
};

/**
 * Terser settings shared by both passes.
 *
 * `drop_console` stays off on purpose: `useLogger` is the library's only
 * logging path and it is pure `console.*` behind `if (debug)` guards, so
 * stripping console calls would make the documented `debug` prop a no-op.
 */
export const terserOptions = {
  compress: {
    drop_console: false,
    drop_debugger: true,
    passes: 2, // Multiple passes for better compression
    // Remove unused code
    dead_code: true,
    // Optimize conditionals
    conditionals: true,
    evaluate: true,
    // Optimize loops
    loops: true,
    // Optimize comparisons
    comparisons: true,
    // Optimize sequences
    sequences: true,
    // Optimize properties
    properties: true,
    // Optimize join consecutive var statements
    join_vars: true,
    // Collapse single-use vars
    collapse_vars: true,
    // Reduce variables to constants when possible
    reduce_vars: true,
    // Optimize if-return and if-continue
    if_return: true,
    // Inline simple functions
    inline: 2,
    // Optimize typeof
    typeofs: true,
    // Optimize booleans
    booleans: true,
  },
  mangle: {
    safari10: true,
  },
  format: {
    comments: false, // Remove comments
  },
};

/**
 * Mirrors `package.json`'s `"sideEffects": ["*.css"]` for Rollup: stylesheets —
 * including Vue SFC `<style>` blocks, which arrive as `?type=style` requests —
 * carry side effects, every JavaScript module does not. A blanket `false` here
 * would contradict the manifest and let Rollup drop real style imports.
 */
const STYLE_MODULE_ID = /\.(css|scss|sass|less|styl)(\?|$)|[?&]type=style/;

export const moduleSideEffects = (id: string): boolean =>
  STYLE_MODULE_ID.test(id);

/** Tree-shaking settings shared by both passes. */
export const treeshakeOptions = {
  moduleSideEffects,
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
};

/**
 * File names for preserved modules.
 *
 * Rollup names a bundled third-party module by its `node_modules/…` path. npm
 * strips every `node_modules` directory from a published tarball, so such files
 * would silently vanish on install and the package would fail to resolve them.
 * Emit them under `vendor/` instead.
 */
export const preservedModuleFileNames = (chunkInfo: PreRenderedChunk): string =>
  `${chunkInfo.name.replace(/(^|\/)node_modules\//g, '$1vendor/')}.js`;
