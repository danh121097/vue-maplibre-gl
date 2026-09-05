# Migration from v5 to v6

v6 fixes a defect that made most composable state **frozen at setup time**. The fix is a breaking change to the shape of what composables return.

## The problem in v5

Composables built correct reactive state internally, then unwrapped it once in the return object:

```ts
// v5 — libs/composables/map/useCreateMarker.ts
return {
  marker: marker.value, // null at setup; the marker is created later
  markerStatus: markerStatus.value, // frozen at 'not-created'
  isMarkerCreated: isMarkerCreated.value, // frozen at false
};
```

Because the interfaces declared the _unwrapped_ type (`boolean`, not `ComputedRef<boolean>`), TypeScript never flagged it. At runtime the values never changed:

```ts
// v5 — isMarkerCreated was a plain `false`, so this never fired
const { isMarkerCreated } = useCreateMarker({ map, lnglat });
watch(
  () => isMarkerCreated,
  () => {
    /* never runs */
  },
);
```

## What changed

State fields are now returned as the reactive containers they always were. Read them with `.value` in script, or unwrapped in templates.

```ts
// v5
const { isMapReady, mapCreationStatus } = useCreateMaplibre(el, style);
if (isMapReady) {
  /* … */
}

// v6
const { isMapReady, mapCreationStatus } = useCreateMaplibre(el, style);
if (isMapReady.value) {
  /* … */
}
```

Templates need no change — Vue unwraps refs automatically:

```vue
<div v-if="isMapReady">Map is ready</div>
```

And they now work correctly, because the value actually updates.

## Affected fields

Add `.value` when reading these in script setup. Everything else — every method, every `id` string, every option — is unchanged.

| Composable                                                             | Fields now returned as `ComputedRef`                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `useCreateMaplibre`                                                    | `mapCreationStatus`, `isMapReady`, `isMapLoading`, `hasMapError` |
| `useCreateMarker`                                                      | `marker`, `markerStatus`, `isMarkerCreated`                      |
| `useCreatePopup`                                                       | `popup`, `popupStatus`, `isPopupCreated`, `isPopupOpen`          |
| `useCreateImage`                                                       | `imageStatus`, `isImageReady`                                    |
| `useCreateLayer`                                                       | `layerStatus`, `isLayerReady`                                    |
| `useCreateGeoJsonSource`                                               | `sourceStatus`, `isSourceReady`                                  |
| `useMapEventListener`, `useGeolocateEventListener`                     | `listenerStatus`, `isListenerAttached`                           |
| `useLayerEventListener`                                                | `listenerStatus`, `isListenerAttached`, `layerId`                |
| `useMapReloadEvent`                                                    | `loadStatus`, `isMapLoaded`                                      |
| `useZoomTo`, `useZoomIn`, `useZoomOut`                                 | `zoomStatus`, `isZooming`                                        |
| `useRotateTo`, `useResetNorth`, `useResetNorthPitch`, `useSnapToNorth` | `rotationStatus`, `isRotating`                                   |
| `usePanBy`, `usePanTo`                                                 | `panStatus`, `isPanning`                                         |
| `useFlyTo`                                                             | `flyStatus`, `isFlying`                                          |
| `useEaseTo`                                                            | `easeStatus`, `isEasing`                                         |
| `useJumpTo`                                                            | `jumpStatus`, `isJumping`                                        |
| `useFitScreenCoordinates`                                              | `status`, `isCoordinatesSet`, `isFitting`, `hasError`            |
| `useFitBounds`                                                         | `bounds`, `boundsStatus`, `isBoundsSet`                          |
| `useCameraForBounds`                                                   | `bbox`, `cameraStatus`, `isCameraSet`                            |

The camera-animation factory (`createCameraAnimation`) returns `animationStatus`, `isAnimating`, and `mapInstance` as refs too, so any custom animation built on it follows the same rule.

**`useMaplibre` is unaffected.** It already returned `ComputedRef`s in v5, and its status field is named `mapStatus`, not `mapCreationStatus`. Code using `useMaplibre()` needs no change.

## Component `register` payloads changed too

The object handed to a component's `register` prop or `@register` event comes straight from the composable above, so the same fields are now refs there.

| Component                                                      | Payload source           | Now refs                                                                                    |
| -------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| `<Maplibre>`                                                   | `useCreateMaplibre`      | `mapCreationStatus`, `isMapReady`, `isMapLoading`, `hasMapError`, `mapInstance`             |
| `<GeoJsonSource>`                                              | `useCreateGeoJsonSource` | `sourceStatus`, `isSourceReady`, plus `isSourceRegistered`, `lastDataUpdate`, `isDataValid` |
| `<FillLayer>`, `<LineLayer>`, `<CircleLayer>`, `<SymbolLayer>` | `useCreateLayer`         | `layerStatus`, `isLayerReady`                                                               |

```ts
// v5
<Maplibre :register="(actions) => { if (actions.isMapReady) … }" />

// v6
<Maplibre :register="(actions) => { if (actions.isMapReady.value) … }" />
```

`<GeolocateControls>`' `@register` is unaffected — it emits the `GeolocateControl` instance itself.

`<Maplibre>`'s payload no longer carries the component's own copies of `isMapReady` / `isMapLoading` / `hasMapError`. Those never reached the `Loading` state, so the payload previously mixed two disagreeing status sources; all four fields now come from `useCreateMaplibre`.

### Template refs are the exception

`defineExpose` runs its object through `proxyRefs`, so a template ref gets **unwrapped** values. Do not add `.value` there:

```vue
<GeoJsonSource ref="src" … />

<script setup>
const src = ref();
// still a plain boolean in v6 — no `.value`
watchEffect(() => console.log(src.value?.isSourceReady));
</script>
```

So: `.value` for `register` / `@register` payloads and for composables called directly; no `.value` for template refs or in templates.

### Why there is no deprecation cycle

A deprecated "snapshot" getter alongside the ref cannot work: the whole defect is that a snapshot never updates. Keeping one would preserve the bug under a different name, so v6 is a clean break.

## Stylesheets are no longer bundled together

`vue3-maplibre-gl/dist/style.css` used to `@import` MapLibre's own stylesheet, so a single import covered both. That shipped a 69 kB copy of upstream CSS inside this package — duplicated for the many apps that already follow MapLibre's documented setup and import it themselves.

In v6 the package ships only its own rules (the `.maplibre-container` layout), and MapLibre's stylesheet is imported the way MapLibre documents it:

```ts
// v5
import 'vue3-maplibre-gl/dist/style.css';

// v6
import 'maplibre-gl/dist/maplibre-gl.css';
import 'vue3-maplibre-gl/dist/style.css';
```

Miss the first line and the map renders without controls, attribution, or popup styling.

The Nuxt module handles this for you: `maplibre: { css: true }` (the default) now injects both stylesheets.

## MapLibre runtime exports moved to a subpath

The package root re-exported MapLibre's entire runtime — the `maplibregl` namespace plus `Map`, `NavigationControl`, `addProtocol` and some fifty more. A namespace re-export references every upstream export, so importing a single component from the root pinned the whole MapLibre runtime into the module graph.

Those runtime values now live on `vue3-maplibre-gl/maplibre`:

```ts
// v5
import { NavigationControl, maplibregl } from 'vue3-maplibre-gl';

// v6
import { NavigationControl, maplibregl } from 'vue3-maplibre-gl/maplibre';
```

Importing them straight from `maplibre-gl` works just as well and is one hop shorter — the subpath exists so the re-exports stay available, not because it is the preferred source.

**Type-only imports are unaffected.** Every MapLibre _type_ (`Map`, `MapMouseEvent`, `MapOptions`, `LngLatLike`, …) is still exported from the package root, because types vanish at compile time and cost nothing:

```ts
import type { Map, MapMouseEvent } from 'vue3-maplibre-gl'; // unchanged
```

The subpath is ESM-only, and the UMD build exposes the root only. If you reach these names through `require()` or a script tag, take them from MapLibre itself — `require('maplibre-gl')`, or `window.maplibregl`, which the UMD setup already loads.

## Tree-shaking now works

The published build used `manualChunks`, an application code-splitting tool. In a library it collapsed the whole package into two chunks that the entry imported eagerly, so a bundler could never drop either one — `import { Marker }` pulled 179 kB raw / 28.5 kB gzip regardless of what you used.

v6 ships preserved modules: one output file per source file. The same import now emits **12.3 kB raw / 2.8 kB gzip**, with no layer, source, camera, or MapLibre-runtime code in the output. No code change is needed on your side.

Two side effects worth knowing:

- The `vue3-maplibre-gl/components` and `vue3-maplibre-gl/composables` subpaths, which pointed at files the build never emitted, now resolve.
- Sourcemaps are no longer published (the package dropped from 1.7 MB to roughly 0.7 MB). Build from the repository if you need to step through library source.

## Prop watchers compare by reference, not deeply

Eight watchers ran with `deep: true` in v5. On `<GeoJsonSource>` that meant Vue walked every feature, geometry and coordinate pair of the `data` collection to build reactive dependencies, and re-walked them on every invalidation — before the debounce even applied, because the debounce delays the callback, not the traversal.

v6 watches identity on `<GeoJsonSource>` (`data`), the four layer components (`filter`, `style`, `maxzoom`, `minzoom`, `beforeId`, `visible`), `<Marker>` and `<Popup>` (`lnglat`), and `<Image>` (`images`).

**Replace the value instead of mutating it in place:**

```vue
<!-- Works in v6 -->
<GeoJsonSource :data="features" />
<script setup>
// new object identity — the source updates
features.value = {
  ...features.value,
  features: [...features.value.features, next],
};
</script>
```

In-place mutation never updated the source, in v5 either:

```vue
<script setup>
// No-op in v5 and in v6 — use refreshSource() from the register payload
features.value.features.push(next); // same object identity
</script>
```

v5 walked the entire `FeatureCollection` to notice that push and then discarded the result, because the callback's first line compares `newData === oldData` and a deep watch over an unchanged reference passes the same object as both. v6 simply stops paying for the traversal. The layer components are the same story: their callbacks compared each field with `!==`, so an in-place mutation of `style` woke the watcher and was then thrown away.

## `<Maplibre>` compares `:options` per field

`mapOptions` was a memoised computed that ran `JSON.stringify` over the merged options — including a full style specification, which can be hundreds of kB — on every read, from a getter that also wrote its own cache refs. It is a plain `computed` in v6.

The practical consequence: `<Maplibre>` reacts to each option field by reference. `center` and `maxBounds` are still compared by value, so rebuilding an inline `:options` literal on every parent render does not re-issue those commands. **`style` is compared by reference** — passing an inline style _object_ literal now re-applies the style on every parent render. Hoist it to a stable constant, or pass a style URL string:

```vue
<script setup>
// Stable identity across renders
const MAP_OPTIONS = { style: 'https://…/style.json', center: [0, 0], zoom: 4 };
</script>

<template>
  <Maplibre :options="MAP_OPTIONS" />
</template>
```

## Five `computed` helpers were removed

`useThrottledComputed`, `useBatchedComputed` and `useComputedWithCleanup` scheduled timers, mutated arrays and ran user cleanup callbacks from inside a `computed` getter. A Vue `computed` getter is lazy and cached: it may not run when you expect, may run during SSR, and must be pure. All three were unsound as written and none of them were used inside the library. They are gone in v6 — build the equivalent with `watch` plus a `ref`, where side effects belong.

`useOptimizedComputed` and `useMemoized` are gone as well, for a different reason: nothing in the library used either of them, and neither earned its place. `useOptimizedComputed` gated a `computed` behind an equality check that ran inside the getter — and its `cacheDuration` option never worked, because the implementation invalidated itself on every read. Rewriting it around a watcher fixed the purity problem but inverted the point of the helper: the getter then ran once per dependency write instead of once per read, which is strictly worse than a plain `computed` under write-heavy loads.

Use a plain `computed` instead. If you specifically need to suppress notifications on equal values, gate a `shallowRef` from a `watch`:

```ts
const state = shallowRef(source.value);
watch(source, (value) => {
  if (!isEqual(value, state.value)) state.value = value;
});
```

For `useMemoized`, any small memoise helper (or `lodash.memoize`) does the same job.

## `MarkerStatus.Removed` and `PopupStatus.Removed` were removed

Both enums carried a `Removed` member that was assigned and then immediately
overwritten with `NotCreated` in the same teardown path, so no consumer could
ever observe it. Watching for it meant watching for a state the library never
published.

A removed marker is exactly a marker that has not been created — the map watcher
recreates one from `NotCreated` — so the two are the same state and now have one
name:

```ts
// v5: never fired, because NotCreated always won the race
watch(markerStatus, (s) => {
  if (s === MarkerStatus.Removed) teardown();
});

// v6
watch(markerStatus, (s) => {
  if (s === MarkerStatus.NotCreated) teardown();
});
```

The same applies to `PopupStatus`. Every other member of both enums is
unchanged.

## `useCreateMaplibre().checkInitMap` was removed

`checkInitMap` guarded initialisation on the presence of a `center` or `bounds`,
but nothing ever called it: the `watchEffect` that creates the map called
`initMap` directly. Routing initialisation through the guard would have been a
regression rather than a fix — a map with neither option is valid, and MapLibre
defaults it to `[0, 0]` at zoom 0.

Call `initMap()` if you were reaching for it, and apply your own precondition
first if you need one:

```ts
const { initMap } = useCreateMaplibre(props);

if (props.options?.center) initMap();
```

## Other fixes in v6

These need no code change on your side.

### `<Maplibre>` now reacts to `:options`

`Maplibre.vue` called its own `cleanup()` in `onBeforeMount`, stopping all 11 prop watchers before the component ever mounted. Updates to `:options` — `center`, `zoom`, `bearing`, `pitch`, `style`, `maxBounds`, `maxPitch`, `maxZoom`, `minPitch`, `minZoom`, `renderWorldCopies` — were silently dropped for the component's entire lifetime.

```vue
<!-- Works in v6; did nothing after the first render in v5 -->
<Maplibre :options="{ style, center, zoom }" />
```

### `<Image>` no longer leaks map images

`useCreateImage` was called from an async callback, outside any setup scope, so its cleanup hook never registered and `map.removeImage()` never ran. `<Image>` now owns an explicit `effectScope` per batch and disposes it on reload and unmount.

If you call `useCreateImage` yourself outside a component's `setup()`, wrap it in an `effectScope` and stop that scope when you are done:

```ts
const scope = effectScope();
const image = scope.run(() => useCreateImage({ map, id, image: src }))!;
// later
scope.stop(); // removes the image from the map
```

Cleanup now runs on `onScopeDispose` rather than `onUnmounted`, so a component's `setup()` still cleans up on unmount exactly as before. If the scope is stopped while an image URL is still loading, the load is discarded rather than added to the map.

`useCreateMarker` and `useCreatePopup` also dispose on `onScopeDispose` now, so a detached `effectScope` releases them too. `useCreateLayer` and `useCreateGeoJsonSource` still clean up via `onUnmounted` only — call those inside a component's `setup()`.

### `<Image>` gained an `error` event

Because a failed load no longer surfaces as an `unhandledrejection`, and `<Image>`'s own logging is gated behind `debug`, a broken image URL would otherwise be completely silent. `<Image>` now emits `error` with the failure and the image id:

```vue
<Image
  :images="icons"
  @error="(err, id) => console.warn(`icon ${id} failed`, err)"
/>
```

`id` is omitted for batch-level failures. This is an emit only, not a prop — a matching `onError` prop would fire twice.

### `loadPromise` no longer rejects on teardown

`useCreateImage().loadPromise` was rejected unconditionally whenever the image was removed, including on a normal unmount, producing an `unhandledrejection` for consumers who never awaited it. Disposal now settles the promise as resolved; genuine load failures still reject.
