# Migration from v4 to v5

v5 is a major internal refactor with **zero breaking API changes**. All existing imports, components, and composables work unchanged.

## What Changed

### Architecture

v5 consolidates duplicated code via factory patterns:

- **Event listeners**: 3 composables share one factory (`createEventListenerComposable`)
- **Camera animations**: 7 composables share one factory (`createCameraAnimation`)
- **Layer composables**: 4 composables share one factory (`createPropertySetter`)

**Result**: 59% LOC reduction (5,432 → 2,208 LOC) with identical API surface.

### Performance Fixes

- **Memory leak fixed**: Event listener cleanup functions now explicitly captured in `Maplibre.vue`
- **Private API removed**: `map._loaded` replaced with public `map.isStyleLoaded()`
- **GC pressure reduced**: `useOptimizedComputed` uses shallow equality by default (JSON.stringify only with `deepEqual: true`)

### SSR Compatibility

- All `window.setTimeout` replaced with `setTimeout` (SSR-safe)
- `isBrowser` guard added to map/marker/popup creation
- Works with Nuxt SSR/SSG — wrap map components in `<ClientOnly>`

### New Exports

```typescript
// Event handler types for consumers
import type {
  MapClickHandler,
  LayerClickHandler,
  GeolocateHandler,
} from 'vue3-maplibre-gl';

// Factory utilities (advanced usage)
import {
  EventListenerStatus,
  AnimationStatus,
  createEventListenerComposable,
  createCameraAnimation,
  LAYER_STYLE_CONFIG,
} from 'vue3-maplibre-gl';

// SSR guard
import { isBrowser } from 'vue3-maplibre-gl';
```

### Package Manager

Recommended package manager changed from yarn to **bun**:

```bash
bun add vue3-maplibre-gl
```

### Animation Timeout (Opt-in)

Camera animation factories now support optional timeout to prevent hanging promises:

```typescript
const { flyTo } = useFlyTo({ map: mapInstance });
// Timeout is opt-in — existing behavior (no timeout) is default
```

## Upgrade Steps

1. Update the package:
   ```bash
   bun add vue3-maplibre-gl@latest
   ```

2. **No code changes required** — all v4 APIs work unchanged.

3. Optional: Use new event handler types for better TypeScript DX.

## Testing Your Upgrade

```bash
bun run type-check  # Verify types
bun run build       # Verify build
bun run test        # Run tests
```
