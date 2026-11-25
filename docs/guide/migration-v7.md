# Migration from v6 to v7

v7 moves this package to MapLibre GL JS 6. The peer range is now `maplibre-gl` `^6.4.1`; MapLibre 5 is no longer supported.

The main reason is security. MapLibre 5's attribution control inserts HTML that comes from the map style and tile sources, and a crafted attribution string can run script in your page without the user clicking anything ([GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579)). The fix exists only in MapLibre 6.4.1 and later. A range that still allowed MapLibre 5 would also allow the vulnerable versions, so v7 supports MapLibre 6 only. Supporting both would not have worked anyway: several types this package re-exports exist in only one of the two majors.

## Upgrade checklist

1. Upgrade both packages together:

   ```bash
   npm install vue3-maplibre-gl@^7 maplibre-gl@^6.4.1
   ```

2. Point MapLibre at its worker. See [the next section](#set-the-worker-url): without this step the map stays blank.
3. Check your browser support. MapLibre 6 needs WebGL2 and ships ES2022 code. In practice that means Safari and iOS 16.4 or later, Chrome 94 or later, and Firefox 93 or later.
4. Work through the breaking changes below. Most apps only touch `styleimagemissing` and the renamed event types.

## Set the worker URL

MapLibre 6 loads its web worker from a file next to its own module. A bundler moves that module, so the worker is not found. The map then stays blank with "Worker failed to load" in the console. A passing build does not catch this; it only shows at runtime.

Set the worker URL once, in your app's entry file, before the first map is created. With Vite:

```ts
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);
```

For webpack and other bundlers, see [Installation](/guide/installation#point-maplibre-at-its-worker).

With the Nuxt module, `nuxt-maplibre-gl` 3 sets the worker URL for you. See [SSR / Nuxt](/guide/ssr-nuxt#worker-url).

## Breaking changes in this package

### ES modules only

MapLibre 6 ships ES modules only. It has no CommonJS entry and no `window.maplibregl` script build. This package's UMD build depended on both, so it is gone:

- `dist/index.umd.cjs` is no longer published.
- The `require` export condition is removed, and `main` now points at `dist/index.js`.
- There is no script-tag setup. Import both packages through a bundler.

Imports through a bundler (`import { Maplibre } from 'vue3-maplibre-gl'`) work exactly as before.

### `styleimagemissing` no longer supplies images

In MapLibre 6 the `styleimagemissing` event only notifies. Adding the image from a listener no longer satisfies the request that raised it. Supply missing images through the new `missingStyleImageResolver` prop on `<Maplibre>` instead. The option has the same name on `useCreateMaplibre`. This package installs the resolver as soon as the map is created, so the first render is covered. The resolver may be async, and it must add the image before it settles.

<!-- snippet-skip: illustrates the v6 pattern MapLibre 6 no longer honours -->

```vue
<!-- v6 -->
<Maplibre :options="options" @styleimagemissing="onMissing" />

<script setup>
async function onMissing(e) {
  const map = e.target;
  const { data } = await map.loadImage(`/icons/${e.id}.png`);
  map.addImage(e.id, data);
}
</script>
```

```vue
<!-- v7 -->
<template>
  <Maplibre
    :options="{ style: 'https://demotiles.maplibre.org/style.json' }"
    :missing-style-image-resolver="resolveImage"
    :register="onRegister"
  />
</template>

<script setup lang="ts">
import { Maplibre } from 'vue3-maplibre-gl';
import type { MaplibreActions } from 'vue3-maplibre-gl';

let actions: MaplibreActions | undefined;
function onRegister(registered: MaplibreActions) {
  actions = registered;
}

async function resolveImage(id: string) {
  const map = actions?.mapInstance.value;
  if (!map) return;
  const { data } = await map.loadImage(`/icons/${id}.png`);
  if (!map.hasImage(id)) map.addImage(id, data);
}
</script>
```

The resolver can also be changed later through the `setMissingStyleImageResolver` action. Pass `null` to clear it. `@styleimagemissing` still fires, but now only for images that are still missing after the resolver ran.

### Event changes

MapLibre 6 dropped one event and renamed some payload types. `<Maplibre>`'s emits follow it.

| v6                                                                  | v7                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@tiledataloading`                                                  | Removed, because MapLibre no longer fires it. Use `@dataloading` or `@sourcedataloading` |
| `MapDataEvent` (`data`, `dataloading`, `dataabort`)                 | `MapSourceDataEvent \| MapStyleDataEvent`; `dataabort` is `MapSourceDataEvent`           |
| `MapLibreZoomEvent` (`boxzoomstart`, `boxzoomend`, `boxzoomcancel`) | `MapBoxZoomEvent`                                                                        |
| `MapLibreEvent<…>` for move, zoom, rotate, drag and pitch events    | `MapMovementEvent`                                                                       |

<!-- snippet-skip: names types MapLibre 6 no longer exports -->

```ts
// v6
import type { MapDataEvent, MapLibreZoomEvent } from 'vue3-maplibre-gl';
```

```ts
// v7
import type {
  MapBoxZoomEvent,
  MapMovementEvent,
  MapSourceDataEvent,
  MapStyleDataEvent,
} from 'vue3-maplibre-gl';
```

MapLibre 6 events are class instances. Check an event's `type` field rather than using `instanceof`.

### Re-exported types and values

Removed from the package root, because MapLibre 6 no longer exports them: `MapDataEvent`, `MapLibreZoomEvent`, `Config`, `CompleteMapOptions`, `ErrorLike` and `SpriteOnDemandStyleImage`.

`Color`, `Formatted` and `FormattedSection` are type-only in MapLibre 6. They are still exported as types from the root, but are no longer runtime values on `vue3-maplibre-gl/maplibre`.

Added:

- `GPUInitializationError`, a runtime value on `vue3-maplibre-gl/maplibre`;
- the types `MapBoxZoomEvent`, `MapMovementEvent`, `MapStyleLoadEvent` and `MissingStyleImageResolver`, exported from the root.

### `useMaplibre().isEasing` was removed

MapLibre 6's `Map` no longer has `isEasing()`. `isMoving()`, `isZooming()` and `isRotating()` are still on `useMaplibre()`. `useEaseTo`'s own `isEasing` ref is unaffected.

### `setData` returns a promise

MapLibre 6's `GeoJSONSource.setData` takes one argument and returns a promise that resolves once its worker has applied the data. It replaces v5's `waitForCompletion` flag and its `this` return value. The `setData` from `useCreateGeoJsonSource` and `useGeoJsonSource` now returns that promise, so you can wait for the data to be on the map:

```ts
import { shallowRef } from 'vue';
import type { Map } from 'maplibre-gl';
import { useCreateGeoJsonSource } from 'vue3-maplibre-gl';

const map = shallowRef<Map | null>(null);
const { setData } = useCreateGeoJsonSource({
  map,
  data: { type: 'FeatureCollection', features: [] },
});

await setData({ type: 'FeatureCollection', features: [] });
// The new features are in the source now
```

Code that ignores the return value keeps working. The promise does not reject: MapLibre reports a failed update through the map's `error` event. It resolves at once when the source is not on the map yet; the data is then used when the source is created. `<GeoJsonSource>`'s exposed `setData` still returns nothing.

## Unchanged, but worth checking

### Attribution control

`attributionControl` has always reached MapLibre through `:options`, and it still does. MapLibre 6.4.1 and later sanitise attribution HTML, so you can keep the default control. To hide it or add your own credit:

```ts
import type { MapOptions } from 'vue3-maplibre-gl';

const hidden: Partial<MapOptions> = { attributionControl: false };
const custom: Partial<MapOptions> = {
  attributionControl: { compact: true, customAttribution: '© My data' },
};
```

MapLibre reads the option once, when the map is created. Changing it afterwards has no effect.

### No WebGL2

On a device without WebGL2, MapLibre 6's `Map` constructor throws a `GPUInitializationError`. `<Maplibre>` catches it and renders its `#error` slot. The error also reaches `onMapError`, or the `onError` option of `useCreateMaplibre`. To tell this case apart from others, check `error instanceof GPUInitializationError`, importing the class from `vue3-maplibre-gl/maplibre`.

## MapLibre 6 changes that reach your code

These come from MapLibre itself. This package passes them through unchanged. See MapLibre's [v5 to v6 migration guide](https://github.com/maplibre/maplibre-gl-js/blob/main/docs/guides/v5-to-v6-migration-guide.md) and [changelog](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md) for the full list.

- **Nested GeoJSON properties.** Objects and arrays in feature properties now come back from events and `queryRenderedFeatures` as real objects, not JSON strings. Remove any `JSON.parse` on them; it now throws.
- **Default import.** `import maplibregl from 'maplibre-gl'` no longer works. Use named imports, or `import * as maplibregl from 'maplibre-gl'`.
- **Property names are typed.** `map.setPaintProperty` and `map.setLayoutProperty`, and their getters, accept only known property names. A `string` variable has to be narrowed. The setters on this package's layer composables still take any string.
- **`zoomLevelsToOverscale` defaults to 4.** This changes some label placement and `queryRenderedFeatures` results. To restore the old behaviour, pass `zoomLevelsToOverscale: undefined` in `:options`.
- **Rendering.** Icons no longer scale with their offset, and light position transitions are interpolated spherically. The new `line-layer-opacity` and `fill-layer-opacity` paint properties fade a whole layer without overlap artefacts.
- **Style validation.** MapLibre 6 uses style spec 26. Legacy filter syntax mixed with expressions now logs a warning instead of failing the whole style.
- **`map.transform` was removed.** Use the map's public camera API instead.
