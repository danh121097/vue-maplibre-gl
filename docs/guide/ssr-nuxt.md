# SSR / Nuxt

vue3-maplibre-gl v5 is SSR-safe out of the box. Map creation is guarded with `isBrowser` checks and all `window.*` references have been removed.

## Nuxt Usage

Wrap map components in `<ClientOnly>` since MapLibre GL requires WebGL (browser-only):

```vue
<template>
  <ClientOnly>
    <Maplibre :options="mapOptions" style="height: 500px">
      <GeoJsonSource :data="geoData">
        <FillLayer :style="fillStyle" />
      </GeoJsonSource>
    </Maplibre>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { Maplibre, GeoJsonSource, FillLayer } from 'vue3-maplibre-gl';
import 'vue3-maplibre-gl/dist/style.css';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

const geoData = ref({ type: 'FeatureCollection', features: [] });
const fillStyle = ref({ 'fill-color': '#088', 'fill-opacity': 0.8 });
</script>
```

## Nuxt Config

If you encounter SSR build errors with maplibre-gl, add it to `noExternal`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      exclude: ['maplibre-gl'],
    },
  },
  // Transpile the library for SSR
  build: {
    transpile: ['vue3-maplibre-gl'],
  },
});
```

## How It Works

The library uses a simple `isBrowser` guard:

```typescript
// Exported from vue3-maplibre-gl
export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';
```

This guard is checked before:
- Map creation (`useCreateMaplibre`)
- Marker creation (`useCreateMarker`)
- Popup creation (`useCreatePopup`)

During SSR, these composables return early without creating DOM elements or WebGL contexts.

## Vue SPA (Non-Nuxt)

No special configuration needed. The library works normally in Vue SPA mode since `isBrowser` is always `true` in the browser.
