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

**This applies to `useCreateImage` only.** Every other creation composable — `useCreateMarker`, `useCreatePopup`, `useCreateLayer`, `useCreateGeoJsonSource` — still cleans up via `onUnmounted`, so a detached `effectScope` will not dispose them. Call those inside a component's `setup()`.

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
