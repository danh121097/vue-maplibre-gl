# Composables Overview

Quick reference for all 15+ composables available in vue3-maplibre-gl.

## Map Management

| Composable | Description |
|---|---|
| `useCreateMaplibre` | Create map instance with error handling and SSR guard |
| `useMaplibre` | Simplified map state management with all map methods |

## Layer Management

| Composable | Description |
|---|---|
| `useCreateFillLayer` | Fill polygons with customizable paint/layout |
| `useCreateCircleLayer` | Point data as circles with typed property setters |
| `useCreateLineLayer` | Linear features (routes, boundaries) |
| `useCreateSymbolLayer` | Icons and text labels with 30+ property setters |
| `useCreateLayer` | Base layer composable (used internally by type-specific ones) |

## Source Management

| Composable | Description |
|---|---|
| `useCreateGeoJsonSource` | GeoJSON data source with reactive data updates |
| `useGeoJsonSource` | Simplified source management |

## Events

| Composable | Description |
|---|---|
| `useMapEventListener` | Map-level events (click, move, zoom, etc.) |
| `useLayerEventListener` | Layer-specific events with 3-arg `.on()` |
| `useGeolocateEventListener` | Geolocate control events |

## Camera Animations

| Composable | Returns | Completion |
|---|---|---|
| `useFlyTo` | `flyTo`, `flyToCenter`, `flyToZoom`, `stopFlying` | Promise (moveend) |
| `useEaseTo` | `easeTo`, `easeToCenter`, `stopEasing` | Promise (moveend) |
| `useJumpTo` | `jumpTo`, `jumpToCenter`, `jumpToZoom` | Instant |
| `useFitBounds` | `setFitBounds`, `clearBounds` | Sync |
| `useZoomTo/In/Out` | `zoomTo`, `zoomIn`, `zoomOut`, `stopZooming` | Promise (zoomend) |
| `usePanBy/To` | `panBy`, `panTo`, `stopPanning` | Promise (moveend) |
| `useRotateTo` | `rotateTo`, `stopRotating` | Promise (rotateend) |
| `useResetNorth` | `resetNorth`, `stopRotating` | Promise (moveend) |

## Controls

| Composable | Description |
|---|---|
| `useGeolocateControl` | User location tracking with events |

## Utilities

| Composable | Description |
|---|---|
| `useLogger` | Consistent debug logging (controlled via `debug` prop) |
| `useDebounce` | Debounced function execution |
| `useOptimizedComputed` | Cached computed with shallow equality |

## Factory Functions (Advanced)

These are used internally but exported for custom extensions:

```typescript
import {
  createEventListenerComposable,  // Build custom event listeners
  createCameraAnimation,          // Build custom camera animations
  createPropertySetter,           // Build typed layer property setters
  createSetStyle,                 // Build setStyle for custom layers
  LAYER_STYLE_CONFIG,             // Paint/layout key definitions
} from 'vue3-maplibre-gl';
```
