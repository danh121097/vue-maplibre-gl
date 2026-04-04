import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImports,
} from '@nuxt/kit';

export interface ModuleOptions {
  /** Auto-import vue3-maplibre-gl CSS (default: true) */
  css?: boolean;
  /** Prefix for auto-imported composables (default: none) */
  prefix?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-maplibre-gl',
    configKey: 'maplibre',
    description: 'Nuxt module for vue3-maplibre-gl with auto-import, SSR support, and full TypeScript',
    links: {
      documentation: 'https://github.com/danh121097/vue-maplibre-gl',
      repository: 'https://github.com/danh121097/vue-maplibre-gl',
    },
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    css: true,
    prefix: '',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Auto-import CSS
    if (options.css) {
      nuxt.options.css.push('vue3-maplibre-gl/dist/style.css');
    }

    // Transpile vue3-maplibre-gl for SSR
    nuxt.options.build.transpile.push('vue3-maplibre-gl');

    // Exclude maplibre-gl from SSR bundle (requires WebGL)
    nuxt.options.vite.optimizeDeps ??= {};
    nuxt.options.vite.optimizeDeps.exclude ??= [];
    if (!nuxt.options.vite.optimizeDeps.exclude.includes('maplibre-gl')) {
      nuxt.options.vite.optimizeDeps.exclude.push('maplibre-gl');
    }

    // Add client-only plugin that registers components
    addPlugin({
      src: resolve('./runtime/plugins/maplibre-gl.client'),
      mode: 'client',
    });

    // Auto-import composables
    const composables = [
      'useCreateMaplibre', 'useMaplibre',
      'useCreateFillLayer', 'useCreateCircleLayer', 'useCreateLineLayer', 'useCreateSymbolLayer',
      'useCreateGeoJsonSource', 'useGeoJsonSource',
      'useMapEventListener', 'useLayerEventListener', 'useGeolocateEventListener',
      'useFlyTo', 'useEaseTo', 'useJumpTo',
      'useFitBounds', 'useCameraForBounds',
      'useZoomTo', 'useZoomIn', 'useZoomOut',
      'usePanBy', 'usePanTo',
      'useRotateTo', 'useResetNorth', 'useResetNorthPitch', 'useSnapToNorth',
    ];

    addImports(
      composables.map((name) => ({
        name,
        as: options.prefix ? `${options.prefix}${name}` : name,
        from: 'vue3-maplibre-gl',
      })),
    );
  },
});
