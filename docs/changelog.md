# Changelog

## v5.0.0

Major internal refactor — zero breaking API changes.

### Architecture
- **DRY factory patterns**: Event listeners, camera animations, and layer composables consolidated via shared factories (59% LOC reduction)
- **Event listener factory**: Adapter pattern for map, layer, and geolocate events
- **Camera animation factory**: Shared promise-wrapping with opt-in timeout support
- **Layer property setter factory**: Typed generics preserving value types

### Performance
- Fixed event listener memory leak in Maplibre.vue
- Removed private `map._loaded` API — replaced with `map.isStyleLoaded()`
- Shallow equality default in `useOptimizedComputed` (reduced GC pressure)

### Type Safety
- New consumer-facing event handler types (`MapClickHandler`, `LayerClickHandler`, etc.)
- JSDoc for `Expressions` and `StyleFunction` type limitations
- Exported `EventListenerStatus`, `AnimationStatus` enums

### SSR Compatibility
- All `window.setTimeout` replaced with SSR-safe `setTimeout`
- `isBrowser` guard for map/marker/popup creation
- Works with Nuxt SSR/SSG out of the box

### Component Consistency
- All 4 layer components forward `register` callback consistently
- Verified `shallowRef` + `markRaw` for all MapLibre object storage

### Testing
- Added vitest framework with 27 unit tests for factory functions
- Test coverage for event listeners, camera animations, and layer setters

### Build
- Migrated from yarn to bun package manager
- Updated `sideEffects` for better tree-shaking
- Upgraded VitePress docs to v1.6.4

## v4.2.3

- Documentation updates for MapLibre integration

## v4.2.2

- Optimized layer and source handling with `markRaw`
