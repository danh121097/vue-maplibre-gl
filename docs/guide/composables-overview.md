# Composables Overview

Comprehensive reference for all 20+ composables available in vue3-maplibre-gl v5.

## Architecture (v5)

All composables in v5 follow the **factory pattern** for code reuse and maintainability:

- **Event Listeners** (3 composables) → 1 factory (`createEventListenerComposable`)
- **Camera Animations** (7+ composables) → 1 factory (`createCameraAnimation`)
- **Layer Property Setters** (4 composables) → 1 factory (`createPropertySetter`)

**Result**: 59% code reduction with identical API surface.

## Map Management (3)

### `useCreateMaplibre(elRef, styleRef, props)`

Create and manage a MapLibre GL instance with full lifecycle support.

**Parameters**:

- `elRef: MaybeRef<HTMLElement | undefined | null>` - Container element
- `styleRef: MaybeRef<StyleSpecification | string>` - Map style URL or object
- `props?: CreateMaplibreProps` - Configuration (center, zoom, bearing, etc.)

**Returns**:

```typescript
{
  mapInstance: ComputedRef<Map | null>,
  mapCreationStatus: MapCreationStatus,
  isMapReady: boolean,
  isMapLoading: boolean,
  hasMapError: boolean,
  // Camera setters (reactive)
  setStyle, setCenter, setZoom, setBearing, setPitch,
  setMinZoom, setMaxZoom, setMinPitch, setMaxPitch,
  setMaxBounds, setRenderWorldCopies,
  // Callbacks
  register?, onLoad?, onError?
}
```

**Features**:

- SSR-safe with `isBrowser` guard
- Automatic cleanup on unmount
- Map creation status tracking
- Error handling and logging
- Optional debug logging

**Example**:

```typescript
const mapContainer = ref<HTMLElement>();
const { mapInstance, isMapReady, setCenter, setZoom } = useCreateMaplibre(
  mapContainer,
  'https://demotiles.maplibre.org/style.json',
  { center: [0, 0], zoom: 6 },
);

watch(isMapReady, () => {
  // Map is interactive, safe to use
  setCenter([100, 50]);
});
```

### `useMaplibre()`

Access the map context in child components without prop drilling.

**Returns**: Same as `useCreateMaplibre` (from injected context)

**Throws**: Error if not within `<Maplibre>` component

**Example**:

```typescript
// In any child component under Maplibre
const { mapInstance, isMapReady, setZoom } = useMaplibre();

const zoomToFit = () => {
  if (isMapReady.value) setZoom(10);
};
```

### `useMaplibreConfig(mapInstance, options)`

Reactively update map configuration options.

**Parameters**:

- `mapInstance: MaybeRef<Map | null>`
- `options: Partial<MapOptions>` - Options to update

**Returns**: `void` (configuration applied immediately)

**Example**:

```typescript
const maxZoom = ref(15);
watch(maxZoom, (newMax) => {
  useMaplibreConfig(mapInstance, { maxZoom: newMax });
});
```

## Layer Management (4)

All layer composables use the **factory pattern** for type-safe property setters.

### `useCreateFillLayer(mapInstance, sourceId, layerId?, style?)`

Create and manage fill (polygon) layers with typed paint/layout properties.

**Type Safety**: `setPaint` only accepts `FillPaint` types (compile-time validation)

**Returns**:

```typescript
{
  layerInstance: ShallowRef<Layer | null>,
  setPaint: (paint: FillPaint) => void,
  setLayout: (layout: FillLayout) => void,
  setFilter: (filter: FilterSpecification) => void,
  setOpacity: (opacity: number) => void,
  remove: () => void
}
```

**Example**:

```typescript
const { setPaint, setFilter } = useCreateFillLayer(
  mapInstance,
  'cities-source',
  'cities-layer',
);

// Reactive property updates (type-safe)
watch(
  () => selectedColor.value,
  (color) => {
    setPaint({ 'fill-color': color, 'fill-opacity': 0.8 });
  },
);

watch(
  () => selectedRegion.value,
  (region) => {
    setFilter(['==', 'region', region]);
  },
);
```

### `useCreateCircleLayer(mapInstance, sourceId, layerId?, style?)`

Create circle (point) layers with type-safe `CirclePaint` properties.

**Returns**: Same pattern as `useCreateFillLayer` (CirclePaint types)

### `useCreateLineLayer(mapInstance, sourceId, layerId?, style?)`

Create line layers with type-safe `LinePaint` properties.

**Returns**: Same pattern as `useCreateFillLayer` (LinePaint types)

### `useCreateSymbolLayer(mapInstance, sourceId, layerId?, style?)`

Create symbol (text/icon) layers with type-safe `SymbolPaint` properties.

**Returns**: Same pattern as `useCreateFillLayer` (SymbolPaint types)

### `useLayer<T extends LayerSpecification>(mapInstance, sourceId, config)`

Generic layer composable for advanced use cases.

**Type Parameter**: `T` - Layer specification type (enables generic type preservation)

**Example**:

```typescript
const { setPaint } = useLayer<CircleLayerSpecification>(
  mapInstance,
  'source-id',
  { type: 'circle', id: 'layer-id' },
);
```

## Source Management (2)

### `useCreateGeoJsonSource(map, sourceId, data, options?)`

Create and manage GeoJSON data sources with reactive updates.

**Returns**:

```typescript
{
  sourceInstance: ShallowRef<GeoJSONSource | null>,
  setData: (data: GeoJSON.Feature[] | GeoJSON.FeatureCollection) => void,
  updateFeature: (featureId: any, properties: any) => void,
  getFeatures: () => Feature[] | undefined,
  queryFeatures: (bbox?: LngLatBoundsLike) => Feature[] | undefined
}
```

**Example**:

```typescript
const { setData } = useCreateGeoJsonSource(
  mapInstance,
  'cities-source',
  citiesGeoJSON,
);

// Update data reactively
watch(
  () => filters.region,
  (region) => {
    const filtered = allCities.filter((c) => c.properties.region === region);
    setData({ type: 'FeatureCollection', features: filtered });
  },
);
```

### `useGeoJsonSource()`

Access GeoJSON source from context (for child components).

**Returns**: Source instance and methods (same as `useCreateGeoJsonSource`)

## Event Listeners (3)

All event listeners use the **factory pattern** with adapter pattern for different targets.

### `useMapEventListener(event, handler, options?)`

Listen to map-level events with automatic attach/detach.

**Event Types**: All MapLibre map events

- Mouse: `click`, `dblclick`, `mousemove`, `mouseup`, `mousedown`, `mouseout`, `mouseover`, `contextmenu`
- Movement: `movestart`, `move`, `moveend`, `zoomstart`, `zoom`, `zoomend`, `dragstart`, `drag`, `dragend`
- Rotation: `rotatestart`, `rotate`, `rotateend`, `pitchstart`, `pitch`, `pitchend`
- Data: `data`, `tiledataloading`, `sourcedata`, `styledata`
- Other: `wheel`, `load`, `error`, `idle`, `render`, `remove`, `terrain`

**Handler Type**: `(e: MapMouseEvent) => void` (or appropriate event type)

**Returns**:

```typescript
{
  removeListener: () => void,
  attachListener: () => void,
  isListenerAttached: boolean,
  listenerStatus: EventListenerStatus
}
```

**Example**:

```typescript
const handleMapClick = (e: MapMouseEvent) => {
  console.log('Clicked at', e.lngLat);
};

const { isListenerAttached } = useMapEventListener('click', handleMapClick, {
  map: mapInstance,
});

// Listener automatically attached and cleaned up
```

### `useLayerEventListener<T extends keyof MapLayerEventType>(event, handler, options?)`

Listen to layer-specific events with feature information.

**Handler Type**: `(e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => void`

**Returns**: Same as `useMapEventListener`

**Example**:

```typescript
const handleLayerClick = (e: MapMouseEvent & { features?: Feature[] }) => {
  e.features?.forEach((feature) => {
    console.log('Clicked feature:', feature.properties);
  });
};

const { isListenerAttached } = useLayerEventListener(
  'click',
  handleLayerClick,
  {
    map: mapInstance,
    layerId: 'my-layer',
  },
);
```

### `useGeolocateEventListener(event, handler, options?)`

Listen to geolocation control events.

**Event Types**: `geolocate`, `error`, `outofmaxbounds`, `trackuserlocationstart`, `trackuserlocationend`

**Handler Type**: `(e: GeolocateSuccess | GeolocationPositionError) => void`

**Returns**: Same as `useMapEventListener`

## Camera Animations (7+)

All camera animations use the **factory pattern** with promise-wrapping for `async/await` support.

### `useFlyTo(map, options?)`

Smooth flight animation to a new location.

**Returns**:

```typescript
{
  flyTo: (target: Partial<CameraOptions>) => Promise<void>,
  isAnimating: boolean,
  animationStatus: AnimationStatus
}
```

**Completes on**: `moveend` event or timeout (optional)

**Example**:

```typescript
const { flyTo, isAnimating } = useFlyTo(mapInstance);

const handleFlyTo = async () => {
  try {
    await flyTo({ center: [100, 50], zoom: 10 });
    console.log('Animation complete');
  } catch (error) {
    console.error('Animation failed:', error);
  }
};
```

### `useEaseTo(map, options?)`

Smooth easing animation (similar to flyTo but different curve).

**Returns**: Same as `useFlyTo`

**Completes on**: `moveend` event or timeout

### `useJumpTo(map, options?)`

Instant camera jump (no animation).

**Returns**: Same as `useFlyTo`

**Completes on**: Immediately (synchronous)

### `useFitBounds(map, options?)`

Zoom/pan to fit bounds with animation.

**Returns**: Same as `useFlyTo`

**Example**:

```typescript
const { fitBounds } = useFitBounds(mapInstance);
await fitBounds(
  [
    [-74, 40],
    [-73, 41],
  ],
  { padding: 50 },
);
```

### `useCameraForBounds(map, options?)`

Calculate optimal camera position for bounds (without animating).

**Returns**: Synchronous camera options

### `useZoomTo(map, options?)`

Animate to specific zoom level.

**Returns**: `{ zoomTo: (zoom: number) => Promise<void>, ... }`

### `useZoomIn / useZoomOut(map, options?)`

Step zoom up/down (+/- 1 level).

**Returns**: `{ zoomIn / zoomOut: () => Promise<void>, ... }`

### `usePanBy / usePanTo(map, options?)`

Pan map by offset or to location.

**Returns**: `{ panBy / panTo: (offset/lnglat) => Promise<void>, ... }`

### `useRotateTo(map, options?)`

Rotate map to bearing.

**Returns**: `{ rotateTo: (bearing: number) => Promise<void>, ... }`

### `useResetNorth(map, options?)`

Reset bearing to north (0°).

**Returns**: `{ resetNorth: () => Promise<void>, ... }`

### `useResetNorthPitch(map, options?)`

Reset bearing to north and pitch to 0°.

**Returns**: `{ resetNorthPitch: () => Promise<void>, ... }`

### `useSnapToNorth(map, options?)`

Snap to nearest north angle (0°, 90°, 180°, 270°).

**Returns**: `{ snapToNorth: () => Promise<void>, ... }`

## Controls (1)

### `useGeolocateControl(mapInstance, options?)`

Programmatic access to geolocation control.

**Returns**:

```typescript
{
  geolocateInstance: ShallowRef<GeolocateControl | null>,
  trigger: () => void,
  startTracking: () => void,
  stopTracking: () => void
}
```

## Utility Composables

### `useCreateMarker(map, lnglat, options?)`

Create markers programmatically.

**Returns**: `{ markerInstance: ShallowRef<Marker | null>, setLngLat, remove }`

### `useCreatePopup(map, options?)`

Create popups programmatically.

**Returns**: `{ popupInstance: ShallowRef<Popup | null>, setLngLat, show, hide }`

### `useCreateImage(map, id, url, coordinates?)`

Add images to map for image layers.

**Returns**: `{ imageInstance: ShallowRef<HTMLImageElement | null>, updateUrl, updateCoordinates }`

## Best Practices

1. **Always check map ready state** before operations
2. **Use watch/watchEffect** for reactive updates
3. **Handle promises** from animations with try/catch
4. **Clean up listeners** (automatic via composables)
5. **Use type-safe layer composables** for compile-time validation

| Composable            | Description                        |
| --------------------- | ---------------------------------- |
| `useGeolocateControl` | User location tracking with events |

## Utilities

| Composable             | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `useLogger`            | Consistent debug logging (controlled via `debug` prop) |
| `useDebounce`          | Debounced function execution                           |
| `useOptimizedComputed` | Cached computed with shallow equality                  |

## Factory Functions (Advanced)

These are used internally but exported for custom extensions:

```typescript
import {
  createEventListenerComposable, // Build custom event listeners
  createCameraAnimation, // Build custom camera animations
  createPropertySetter, // Build typed layer property setters
  createSetStyle, // Build setStyle for custom layers
  LAYER_STYLE_CONFIG, // Paint/layout key definitions
} from 'vue3-maplibre-gl';
```
