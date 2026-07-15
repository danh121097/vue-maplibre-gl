# Composables API Reference

Vue3 MapLibre GL provides a comprehensive set of composables for building interactive maps with Vue 3 Composition API. All composables are designed with TypeScript support, reactive data binding, and comprehensive error handling.

## Map Composables

### useCreateMaplibre

The core composable for creating and managing MapLibre GL Maps with enhanced error handling and reactive state management.

#### Parameters

| Parameter  | Type                                     | Description                             |
| ---------- | ---------------------------------------- | --------------------------------------- |
| `elRef`    | `MaybeRef<HTMLElement \| undefined>`     | Reference to the HTML element container |
| `styleRef` | `MaybeRef<StyleSpecification \| string>` | Reference to the map style              |
| `props`    | `CreateMaplibreProps`                    | Configuration options for the map       |

#### CreateMaplibreProps Interface

| Property   | Type                                               | Default     | Description                          |
| ---------- | -------------------------------------------------- | ----------- | ------------------------------------ |
| `register` | `(actions: EnhancedCreateMaplibreActions) => void` | `undefined` | Callback for registering map actions |
| `debug`    | `boolean`                                          | `false`     | Enable debug logging                 |
| `onLoad`   | `(map: Map) => void`                               | `undefined` | Load success callback                |
| `onError`  | `(error: any) => void`                             | `undefined` | Error handling callback              |

#### Returns

| Property               | Type                                            | Description                  |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| `mapInstance`          | `ComputedRef<Map \| null>`                      | Reactive map instance        |
| `setCenter`            | `(center: LngLatLike) => void`                  | Set map center coordinates   |
| `setBearing`           | `(bearing: number) => void`                     | Set map bearing (rotation)   |
| `setZoom`              | `(zoom: number) => void`                        | Set map zoom level           |
| `setPitch`             | `(pitch: number) => void`                       | Set map pitch (tilt)         |
| `setStyle`             | `(style: StyleSpecification \| string) => void` | Set map style                |
| `setMaxBounds`         | `(bounds: LngLatBoundsLike) => void`            | Set maximum bounds           |
| `setMaxPitch`          | `(pitch: number) => void`                       | Set maximum pitch            |
| `setMaxZoom`           | `(zoom: number) => void`                        | Set maximum zoom             |
| `setMinPitch`          | `(pitch: number) => void`                       | Set minimum pitch            |
| `setMinZoom`           | `(zoom: number) => void`                        | Set minimum zoom             |
| `setRenderWorldCopies` | `(render: boolean) => void`                     | Set world copies rendering   |
| `isMapReady`           | `ComputedRef<boolean>`                          | Whether the map is ready     |
| `isMapLoading`         | `ComputedRef<boolean>`                          | Whether the map is loading   |
| `hasMapError`          | `ComputedRef<boolean>`                          | Whether the map has an error |
| `refreshMap`           | `() => void`                                    | Refresh the map instance     |
| `destroyMap`           | `() => void`                                    | Destroy the map instance     |

#### Example

```typescript
import { ref } from 'vue';
import { useCreateMaplibre } from 'vue3-maplibre-gl';

const mapContainer = ref<HTMLElement>();
const mapStyle = ref('https://demotiles.maplibre.org/style.json');

const { mapInstance, setCenter, setZoom, isMapReady, isMapLoading } =
  useCreateMaplibre(mapContainer, mapStyle, {
    debug: true,
    onLoad: (map) => {
      console.log('Map loaded:', map);
    },
    onError: (error) => {
      console.error('Map error:', error);
    },
  });

// Use the map instance
watch(isMapReady, (ready) => {
  if (ready) {
    setCenter([0, 0]);
    setZoom(10);
  }
});
```

### useMaplibre

A simplified composable for basic map operations and state management.

#### Parameters

| Parameter | Type               | Description           |
| --------- | ------------------ | --------------------- |
| `props`   | `UseMaplibreProps` | Configuration options |

#### Returns

| Property      | Type                       | Description              |
| ------------- | -------------------------- | ------------------------ |
| `mapInstance` | `ComputedRef<Map \| null>` | Reactive map instance    |
| `isReady`     | `ComputedRef<boolean>`     | Whether the map is ready |

#### Example

```typescript
import { useMaplibre } from 'vue3-maplibre-gl';

const { mapInstance, isReady } = useMaplibre({
  debug: true,
});
```

### useMaplibreConfig

Configures MapLibre GL's global performance settings (web worker count, parallel image requests, resource prewarming). Call it **once** at app startup (e.g. in `App.vue` or `main.ts`) — it applies to every map instance in your app, not just one map.

#### Signature

```typescript
function useMaplibreConfig(
  options?: MaplibreConfigOptions,
): MaplibreConfigActions;
```

#### Parameters (`MaplibreConfigOptions`)

| Property                   | Type      | Default | Description                                     |
| --------------------------- | --------- | ------- | ------------------------------------------------ |
| `workerCount`               | `number`  | `4`     | Number of web workers for tile loading            |
| `maxParallelImageRequests`  | `number`  | `16`    | Maximum parallel image requests                   |
| `prewarmResources`          | `boolean` | `true`  | Prewarm MapLibre resources on initialization      |
| `debug`                     | `boolean` | `false` | Enable debug logging                              |

#### Returns

| Property                 | Type          | Description                                                |
| ------------------------- | ------------- | ------------------------------------------------------------ |
| `clearPrewarmedResources` | `() => void`  | Releases prewarmed resources (called automatically on unmount) |

#### Example

```vue
<script setup>
import { useMaplibreConfig } from 'vue3-maplibre-gl';

// Call once, at the top of your root component
useMaplibreConfig({
  workerCount: 4,
  maxParallelImageRequests: 16,
  prewarmResources: true,
});
</script>
```

### useCreateImage

Adds a custom image (icon) to the map's style so it can be used by symbol layers, e.g. `'icon-image': 'my-icon'`. Handles loading images from a URL, updating them, and safely re-adding them when their size changes (MapLibre requires images to keep the same dimensions when updated).

#### Signature

```typescript
function useCreateImage(props: CreateImageProps): CreateImageActions;
```

#### Parameters (`CreateImageProps`)

| Property                          | Type                              | Description                                                  |
| ----------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `map`                                | `MaybeRef<Map \| null>`            | Map instance reference                                          |
| `id`                                 | `string`                           | Image identifier used in layer styles                           |
| `image`                              | `ImageDatas \| string`             | Image data (`HTMLImageElement`, `ImageBitmap`, `ImageData`, or raw pixel object) or a URL string to load |
| `options`                            | `Partial<StyleImageMetadata>`      | Image metadata (e.g. `pixelRatio`, `sdf`)                        |
| `forceRecreateOnDimensionChange`     | `boolean`                          | Remove+re-add on dimension change instead of trying an in-place update (default: `true`) |
| `debug`                              | `boolean`                          | Enable debug logging                                             |

#### Returns

| Property        | Type                                                       | Description                                  |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `remove`           | `() => void`                                                  | Remove the image from the map                  |
| `loadImage`        | `(imageUrl: string) => Promise<HTMLImageElement \| ImageBitmap>` | Load an image from a URL                        |
| `updateImage`      | `(newImage: ImageDatas \| string) => Promise<void>`            | Replace the current image                       |
| `refreshImage`     | `() => Promise<void>`                                          | Re-apply the current image                      |
| `hasImage`         | `() => boolean`                                                | Whether the image currently exists on the map   |
| `imageStatus`      | `Readonly<ImageStatus>`                                        | `'not-created' \| 'loading' \| 'created' \| 'updated' \| 'error'` |
| `isImageReady`     | `boolean`                                                      | Whether the image is created or updated         |
| `loadPromise`      | `Promise<void>`                                                | Resolves once the image is first added, rejects if removed or on error |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useCreateImage } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

useCreateImage({
  map: mapInstance,
  id: 'my-icon',
  image: '/icons/pin.png',
});
// Now usable in a symbol layer: 'icon-image': 'my-icon'
</script>
```

### useCreateMarker

Wraps MapLibre GL's `Marker` class so a DOM pin/icon can be placed on the map and moved reactively, with drag events and automatic cleanup on unmount.

#### Signature

```typescript
function useCreateMarker(props: CreateMarkerProps): CreateMarkerActions;
```

#### Parameters (`CreateMarkerProps`)

| Property   | Type                                | Description                                          |
| ------------ | -------------------------------------- | -------------------------------------------------------- |
| `map`        | `MaybeRef<Map \| null>`                | Map instance reference                                   |
| `lnglat`     | `MaybeRef<LngLatLike \| undefined>`    | Marker position, reactive                                |
| `popup`      | `MaybeRef<Popup \| null>`              | Popup to attach to the marker                            |
| `el`         | `Ref<HTMLElement \| undefined>`        | Custom DOM element to use as the marker (from a template ref) |
| `options`    | `MarkerOptions`                        | Native MapLibre `Marker` options                          |
| `on`         | `{ dragstart?, drag?, dragend? }`      | Drag event handlers                                       |
| `autoAdd`    | `boolean`                              | Automatically add the marker to the map (default: `true`) |
| `debug`      | `boolean`                              | Enable debug logging                                      |

#### Returns

| Property               | Type                                     | Description                        |
| ------------------------ | ------------------------------------------- | --------------------------------------- |
| `marker`                  | `Readonly<Marker \| null>`                  | The underlying MapLibre `Marker` instance |
| `markerStatus`            | `Readonly<MarkerStatus>`                    | `'not-created' \| 'creating' \| 'created' \| 'error' \| 'removed'` |
| `isMarkerCreated`         | `boolean`                                   | Whether the marker has been created       |
| `setLngLat`               | `(lnglat: LngLatLike) => void`              | Move the marker                           |
| `setPopup`                | `(popup?: Popup \| null) => void`           | Attach/detach a popup                      |
| `setOffset`                | `(offset: PointLike) => void`               | Set pixel offset                           |
| `setDraggable`             | `(draggable: boolean) => void`              | Toggle draggable state                     |
| `togglePopup`              | `() => void`                                | Open/close the attached popup              |
| `getElement`               | `() => HTMLElement \| null`                 | Get the marker's DOM element               |
| `setRotation`               | `(rotation: number) => void`                | Set rotation in degrees                    |
| `setRotationAlignment`      | `(alignment: Alignment) => void`            | Set rotation alignment                     |
| `setPitchAlignment`         | `(alignment: Alignment) => void`            | Set pitch alignment                        |
| `setOpacity`                | `(opacity: string, opacityWhenCovered?: string) => void` | Set opacity                    |
| `removeMarker`              | `() => void`                                | Remove the marker from the map             |
| `addMarker`                 | `() => void`                                | Add the marker back to the map             |
| `getLngLat`                 | `() => LngLatLike \| null`                  | Current position                           |
| `getPopup`                  | `() => Popup \| null`                       | Currently attached popup                   |
| `getOffset`                 | `() => PointLike`                           | Current pixel offset                       |
| `getDraggable`              | `() => boolean`                             | Whether the marker is draggable            |
| `getRotation`               | `() => number`                              | Current rotation                           |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useCreateMarker } from 'vue3-maplibre-gl';

const mapInstance = ref(null);
const position = ref([0, 0]);

const { setLngLat, setDraggable } = useCreateMarker({
  map: mapInstance,
  lnglat: position,
  options: { color: '#FF0000' },
  on: {
    dragend: () => console.log('Marker dropped'),
  },
});

setDraggable(true);
</script>
```

### useCreatePopup

Wraps MapLibre GL's `Popup` class to show HTML content or a custom DOM element at a given map location, with reactive content and position.

#### Signature

```typescript
function useCreatePopup(props: CreatePopupProps): CreatePopupActions;
```

#### Parameters (`CreatePopupProps`)

| Property     | Type                                  | Description                                   |
| -------------- | ---------------------------------------- | -------------------------------------------------- |
| `map`          | `MaybeRef<Map \| null>`                  | Map instance reference                             |
| `lnglat`       | `MaybeRef<LngLatLike \| undefined>`      | Popup position, reactive                            |
| `html`         | `MaybeRef<string \| undefined>`          | Popup HTML content, reactive                        |
| `el`           | `Ref<HTMLElement \| undefined>`          | Custom DOM element to use as content                |
| `options`      | `PopupOptions`                           | Native MapLibre `Popup` options                      |
| `show`         | `boolean`                                | Show the popup immediately once created (default: `true`) |
| `withMap`      | `boolean`                                | Attach the popup to the map (default: `true`)        |
| `autoCreate`   | `boolean`                                | Auto-create the popup when the map becomes available (default: `true`) |
| `closeOnClick` | `boolean`                                | Close popup when the map is clicked (default: `true`) |
| `closeButton`  | `boolean`                                | Show the close (×) button (default: `true`)          |
| `on`           | `{ open?, close? }`                      | Open/close event handlers                            |
| `debug`        | `boolean`                                | Enable debug logging                                 |

#### Returns

| Property           | Type                                | Description                              |
| --------------------- | -------------------------------------- | ---------------------------------------------- |
| `popup`                | `Readonly<Popup \| null>`              | The underlying MapLibre `Popup` instance        |
| `popupStatus`          | `Readonly<PopupStatus>`                | `'not-created' \| 'creating' \| 'created' \| 'open' \| 'closed' \| 'error' \| 'removed'` |
| `isPopupCreated`       | `boolean`                              | Whether the popup has been created              |
| `isPopupOpen`          | `boolean`                              | Whether the popup is currently open             |
| `setLngLat`            | `(lnglat: LngLatLike) => void`         | Move the popup                                  |
| `setOffset`             | `(offset: PointLike) => void`          | Set pixel offset                                |
| `addClassName`          | `(className: string) => void`          | Add a CSS class to the popup                    |
| `removeClassName`       | `(className: string) => void`          | Remove a CSS class                              |
| `setMaxWidth`            | `(width: string) => void`              | Set max width (CSS value)                       |
| `show`                   | `() => void`                           | Show the popup on the map                       |
| `hide`                   | `() => void`                           | Hide the popup from the map                     |
| `toggle`                 | `() => void`                           | Toggle visibility                               |
| `addToMap`               | `() => void`                           | Add popup to map without opening it             |
| `setHTMLContent`         | `(html?: string) => void`              | Update HTML content                             |
| `setDOMContent`          | `(element: HTMLElement) => void`       | Update DOM content                              |
| `setText`                | `(text: string) => void`               | Update text content (escaped)                   |
| `removePopup`            | `() => void`                           | Remove and clean up the popup                   |
| `createPopup`            | `() => void`                           | Manually (re)create the popup                   |
| `getLngLat`              | `() => LngLatLike \| null`             | Current position                                |
| `getElement`             | `() => HTMLElement \| null`            | Popup's DOM element                             |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useCreatePopup } from 'vue3-maplibre-gl';

const mapInstance = ref(null);
const position = ref([0, 0]);

const { show, hide, setHTMLContent } = useCreatePopup({
  map: mapInstance,
  lnglat: position,
  html: '<strong>Hello!</strong>',
  show: false,
});

show();
</script>
```

### useLayer

Registers a layer instance (e.g. from `useCreateFillLayer`) and re-exposes its actions plus richer reactive status tracking. Useful when a component needs to manage a layer created elsewhere via the `register` callback pattern.

#### Signature

```typescript
function useLayer<T extends LayerSpecification>(
  props?: LayerManagementProps,
): LayerManagementActions;
```

#### Parameters (`LayerManagementProps`)

| Property      | Type      | Default | Description                       |
| --------------- | --------- | ------- | ------------------------------------ |
| `debug`         | `boolean` | `false` | Enable debug logging                 |
| `autoCleanup`   | `boolean` | `true`  | Dispose automatically on unmount     |

#### Returns

| Property               | Type                                                                 | Description                          |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------ |
| `register`                 | `(instance: CreateLayerActions<any>, map: Map) => void`                  | Register a layer instance (pass this as the `register` callback of a `useCreate*Layer` composable) |
| `layerId`                  | `ComputedRef<string \| undefined>`                                        | Registered layer's ID                       |
| `layer`                    | `ComputedRef<LayerSpecification \| null>`                                 | Registered layer specification              |
| `layerStatus`              | `ComputedRef<LayerManagementStatus>`                                      | `'not-registered' \| 'registering' \| 'registered' \| 'error' \| 'disposed'` |
| `isLayerRegistered`        | `ComputedRef<boolean>`                                                    | Whether a layer instance is registered      |
| `isLayerReady`             | `ComputedRef<boolean>`                                                    | Whether the layer exists on the map now     |
| `getFilter`                 | `() => FilterSpecification \| void`                                       | Current filter                              |
| `getLayoutProperty`         | `(name: keyof AnyLayout) => any`                                          | Get a layout property                       |
| `getPaintProperty`          | `(name: keyof AnyPaint) => any`                                           | Get a paint property                        |
| `setBeforeId`               | `(beforeId?: string) => void`                                             | Reposition the layer                        |
| `setFilter`                 | `(filter?: FilterSpecification) => void`                                  | Update filter                               |
| `setPaintProperty`          | `(name: string, value: any, options?: StyleSetterOptions) => void`        | Update paint property                       |
| `setLayoutProperty`         | `(name: string, value: any, options?: StyleSetterOptions) => void`        | Update layout property                      |
| `setZoomRange`              | `(minzoom?: number, maxzoom?: number) => void`                            | Update zoom range                           |
| `removeLayer`               | `() => void`                                                              | Remove the layer                            |
| `setStyle`                  | `(style: AnyLayout & AnyPaint) => void`                                   | Update layer style                          |
| `dispose`                   | `() => void`                                                              | Stop tracking and release resources         |
| `refresh`                   | `() => void`                                                              | Re-register the current instance            |

#### Example

```vue
<script setup>
import { useCreateFillLayer, useLayer } from 'vue3-maplibre-gl';

const { register: registerLayerActions, isLayerReady, setStyle } = useLayer();

useCreateFillLayer({
  map: mapInstance,
  source: sourceRef,
  id: 'fill-layer',
  style: { 'fill-color': '#088' },
  register: registerLayerActions,
});
</script>
```

## Layer Composables

### useCreateLayer

The generic, low-level layer composable that `useCreateFillLayer`, `useCreateCircleLayer`, `useCreateLineLayer`, and `useCreateSymbolLayer` are all built on top of. Use it directly when you need a layer type not covered by the specific helpers, or full control over `paint`/`layout`.

#### Signature

```typescript
function useCreateLayer<Layer extends LayerSpecification>(
  cfg: CreateBaseLayerProps<Layer>,
): EnhancedLayerActions<Layer>;
```

#### Parameters (`CreateBaseLayerProps`)

| Property        | Type                                                          | Description                                  |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `map`               | `MaybeRef<Map \| null>`                                             | Map instance reference                              |
| `source`            | `MaybeRef<string \| SourceSpecification \| object \| null \| undefined>` | Source id, spec, or reactive reference          |
| `type`              | `LayerTypes`                                                        | MapLibre layer type (e.g. `'fill'`, `'line'`)       |
| `id`                | `string`                                                            | Layer id (auto-generated if omitted)                |
| `beforeId`          | `string`                                                            | Insert layer before this layer id                   |
| `filter`            | `FilterSpecification`                                               | Filter expression (default: `['all']`)              |
| `layout`            | `Layer['layout']`                                                   | Layout properties                                    |
| `paint`             | `Layer['paint']`                                                    | Paint properties                                     |
| `maxzoom`           | `number`                                                            | Maximum zoom (default: `24`)                         |
| `minzoom`           | `number`                                                            | Minimum zoom (default: `0`)                          |
| `metadata`          | `object`                                                            | Layer metadata                                       |
| `sourceLayer`       | `string`                                                            | Vector tile source layer name                        |
| `debug`             | `boolean`                                                           | Enable debug logging                                 |
| `register`          | `(actions: CreateBaseLayerActions<Layer>, map: Map) => void`       | Registration callback                                |

#### Returns

| Property            | Type                                                                             | Description                          |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `layerId`               | `string`                                                                              | Generated/provided layer id                |
| `getLayer`              | `ComputedRef<LayerSpecification \| null>`                                            | Current layer specification                |
| `removeLayer`           | `() => void`                                                                          | Remove the layer                            |
| `setBeforeId`            | `(beforeId?: string) => void`                                                         | Reposition the layer                        |
| `setFilter`              | `(filter?: FilterSpecification) => void`                                              | Update filter                               |
| `setZoomRange`            | `(minzoom?: number, maxzoom?: number) => void`                                        | Update zoom range                           |
| `setPaintProperty`        | `(name: string, value: any, options?: StyleSetterOptions) => void`                    | Update a paint property                     |
| `setLayoutProperty`       | `(name: string, value: any, options?: StyleSetterOptions) => void`                    | Update a layout property                    |
| `layerStatus`             | `Readonly<LayerStatus>`                                                               | `'not-created' \| 'creating' \| 'created' \| 'error'` |
| `isLayerReady`            | `boolean`                                                                             | Whether the layer currently exists on the map |
| `refreshLayer`            | `() => void`                                                                          | Remove and recreate the layer               |
| `updateLayer`             | `(updates: { filter?, minzoom?, maxzoom?, paint?, layout? }) => void`                | Apply several updates in one call           |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useCreateLayer } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

const { getLayer, updateLayer } = useCreateLayer({
  map: mapInstance,
  source: 'my-source',
  type: 'heatmap',
  id: 'heatmap-layer',
  paint: { 'heatmap-weight': 1 },
});

updateLayer({ paint: { 'heatmap-weight': 2 } });
</script>
```

### useCreateFillLayer

Creates and manages MapLibre GL Fill Layers with reactive updates and comprehensive event handling.

#### Parameters

| Parameter | Type                   | Description              |
| --------- | ---------------------- | ------------------------ |
| `props`   | `CreateFillLayerProps` | Fill layer configuration |

#### CreateFillLayerProps Interface

| Property      | Type                                              | Description                    |
| ------------- | ------------------------------------------------- | ------------------------------ |
| `map`         | `MaybeRef<Map \| null>`                           | Map instance reference         |
| `source`      | `MaybeRef<string \| object>`                      | Data source for the layer      |
| `style`       | `FillLayerStyle`                                  | Fill layer style configuration |
| `filter`      | `FilterSpecification`                             | Filter expression              |
| `id`          | `string`                                          | Layer identifier               |
| `maxzoom`     | `number`                                          | Maximum zoom level             |
| `minzoom`     | `number`                                          | Minimum zoom level             |
| `metadata`    | `object`                                          | Layer metadata                 |
| `sourceLayer` | `string`                                          | Source layer name              |
| `register`    | `(actions: CreateLayerActions, map: Map) => void` | Registration callback          |

#### Returns

| Property            | Type                                      | Description               |
| ------------------- | ----------------------------------------- | ------------------------- |
| `getLayer`          | `ComputedRef<LayerSpecification \| null>` | Get layer specification   |
| `setBeforeId`       | `(beforeId?: string) => void`             | Set layer insertion point |
| `setFilter`         | `(filter?: FilterSpecification) => void`  | Set layer filter          |
| `setStyle`          | `(style: FillLayerStyle) => void`         | Set layer style           |
| `setZoomRange`      | `(min: number, max: number) => void`      | Set zoom range            |
| `setLayoutProperty` | `(name: string, value: any) => void`      | Set layout property       |

#### Example

```typescript
import { ref } from 'vue';
import { useCreateFillLayer } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);
const sourceRef = ref('my-source');

const { getLayer, setStyle, setFilter } = useCreateFillLayer({
  map: mapInstance,
  source: sourceRef,
  id: 'fill-layer',
  style: {
    'fill-color': '#088',
    'fill-opacity': 0.8,
  },
  filter: ['==', 'type', 'polygon'],
  register: (actions, map) => {
    console.log('Fill layer registered:', actions);
  },
});

// Update layer style
setStyle({
  'fill-color': '#ff0000',
  'fill-opacity': 0.6,
});

// Update layer filter
setFilter(['==', 'category', 'important']);
```

### useCreateCircleLayer

Creates and manages MapLibre GL Circle Layers for point data visualization.

#### Parameters

Similar to `useCreateFillLayer` but with `CircleLayerStyle` for styling.

#### Example

```typescript
import { useCreateCircleLayer } from 'vue3-maplibre-gl';

const { getLayer, setStyle } = useCreateCircleLayer({
  map: mapInstance,
  source: sourceRef,
  id: 'circle-layer',
  style: {
    'circle-radius': 6,
    'circle-color': '#007cbf',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
  },
});
```

### useCreateLineLayer

Creates and manages MapLibre GL Line Layers for linear features.

#### Parameters

Similar to `useCreateFillLayer` but with `LineLayerStyle` for styling.

#### Example

```typescript
import { useCreateLineLayer } from 'vue3-maplibre-gl';

const { getLayer, setStyle } = useCreateLineLayer({
  map: mapInstance,
  source: sourceRef,
  id: 'line-layer',
  style: {
    'line-color': '#007cbf',
    'line-width': 3,
    'line-opacity': 0.8,
  },
});
```

### useCreateSymbolLayer

Creates and manages MapLibre GL Symbol Layers for icons and text.

#### Parameters

Similar to `useCreateFillLayer` but with `SymbolLayerStyle` for styling.

#### Example

```typescript
import { useCreateSymbolLayer } from 'vue3-maplibre-gl';

const { getLayer, setStyle } = useCreateSymbolLayer({
  map: mapInstance,
  source: sourceRef,
  id: 'symbol-layer',
  style: {
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Regular'],
    'text-size': 12,
    'text-color': '#333',
  },
});
```

## Source Composables

### useCreateGeoJsonSource

Creates and manages MapLibre GL GeoJSON Sources with reactive data updates and comprehensive error handling.

#### Parameters

| Parameter | Type                       | Description                  |
| --------- | -------------------------- | ---------------------------- |
| `props`   | `CreateGeoJsonSourceProps` | GeoJSON source configuration |

#### CreateGeoJsonSourceProps Interface

| Property   | Type                                                      | Description               |
| ---------- | --------------------------------------------------------- | ------------------------- |
| `map`      | `MaybeRef<Map \| null>`                                   | Map instance reference    |
| `id`       | `string`                                                  | Source identifier         |
| `data`     | `GeoJSONSourceSpecification['data']`                      | GeoJSON data              |
| `options`  | `Partial<GeoJSONSourceSpecification>`                     | Additional source options |
| `debug`    | `boolean`                                                 | Enable debug logging      |
| `register` | `(actions: CreateGeoJsonSourceActions, map: Map) => void` | Registration callback     |

#### Returns

| Property        | Type                                                 | Description             |
| --------------- | ---------------------------------------------------- | ----------------------- |
| `sourceId`      | `string`                                             | Source identifier       |
| `getSource`     | `ShallowRef<GeoJSONSource \| null>`                  | Get source instance     |
| `setData`       | `(data: GeoJSONSourceSpecification['data']) => void` | Update source data      |
| `removeSource`  | `() => void`                                         | Remove source from map  |
| `refreshSource` | `() => void`                                         | Refresh source          |
| `sourceStatus`  | `Readonly<SourceStatus>`                             | Source status           |
| `isSourceReady` | `boolean`                                            | Whether source is ready |

#### Example

```typescript
import { ref } from 'vue';
import { useCreateGeoJsonSource } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);
const geoJsonData = ref({
  type: 'FeatureCollection',
  features: [],
});

const { sourceId, getSource, setData, isSourceReady } = useCreateGeoJsonSource({
  map: mapInstance,
  id: 'my-geojson-source',
  data: geoJsonData.value,
  options: {
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  },
  debug: true,
  register: (actions, map) => {
    console.log('GeoJSON source registered:', actions);
  },
});

// Update source data
const newData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
      properties: {
        name: 'Sample Point',
      },
    },
  ],
};

setData(newData);
```

### useGeoJsonSource

A simplified composable for managing GeoJSON source instances with enhanced error handling.

#### Parameters

| Parameter | Type                    | Description           |
| --------- | ----------------------- | --------------------- |
| `props`   | `UseGeoJsonSourceProps` | Configuration options |

#### Returns

| Property        | Type                                                 | Description             |
| --------------- | ---------------------------------------------------- | ----------------------- |
| `sourceId`      | `ComputedRef<string \| undefined>`                   | Source identifier       |
| `getSource`     | `ComputedRef<GeoJSONSource \| null>`                 | Get source instance     |
| `setData`       | `(data: GeoJSONSourceSpecification['data']) => void` | Update source data      |
| `refreshSource` | `() => void`                                         | Refresh source          |
| `isSourceReady` | `ComputedRef<boolean>`                               | Whether source is ready |
| `sourceStatus`  | `ComputedRef<GeoJsonSourceStatus>`                   | Source status           |

#### Example

```typescript
import { useGeoJsonSource } from 'vue3-maplibre-gl';

const { sourceId, getSource, setData, isSourceReady, register } =
  useGeoJsonSource({
    debug: true,
    autoRefresh: true,
  });

// Register with a source instance
register(sourceActions);
```

## Control Composables

### useGeolocateControl

Creates and manages MapLibre GL Geolocate Controls with comprehensive event handling.

#### Parameters

| Parameter | Type                       | Description                     |
| --------- | -------------------------- | ------------------------------- |
| `props`   | `UseGeolocateControlProps` | Geolocate control configuration |

#### UseGeolocateControlProps Interface

| Property   | Type                      | Description             |
| ---------- | ------------------------- | ----------------------- |
| `map`      | `MaybeRef<Map \| null>`   | Map instance reference  |
| `position` | `ControlPosition`         | Control position on map |
| `options`  | `GeolocateControlOptions` | Control options         |
| `debug`    | `boolean`                 | Enable debug logging    |

#### Returns

| Property      | Type                                   | Description                      |
| ------------- | -------------------------------------- | -------------------------------- |
| `control`     | `ShallowRef<GeolocateControl \| null>` | Control instance                 |
| `trigger`     | `() => boolean`                        | Trigger geolocation              |
| `isActive`    | `ComputedRef<boolean>`                 | Whether control is active        |
| `isSupported` | `ComputedRef<boolean>`                 | Whether geolocation is supported |

#### Example

```typescript
import { ref } from 'vue';
import { useGeolocateControl } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);

const { control, trigger, isActive, isSupported } = useGeolocateControl({
  map: mapInstance,
  position: 'top-right',
  options: {
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: true,
  },
  debug: true,
});

// Manually trigger geolocation
if (isSupported.value) {
  trigger();
}
```

## Event Composables

### useMapEventListener

Provides reactive event handling for MapLibre GL map events with automatic cleanup.

#### Parameters

| Parameter | Type                       | Description                  |
| --------- | -------------------------- | ---------------------------- |
| `props`   | `UseMapEventListenerProps` | Event listener configuration |

#### UseMapEventListenerProps Interface

| Property  | Type                      | Description              |
| --------- | ------------------------- | ------------------------ |
| `map`     | `MaybeRef<Map \| null>`   | Map instance reference   |
| `event`   | `MapEventType`            | Event type to listen for |
| `handler` | `(event: any) => void`    | Event handler function   |
| `options` | `AddEventListenerOptions` | Event listener options   |

#### Example

```typescript
import { ref } from 'vue';
import { useMapEventListener } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);

// Listen for map click events
useMapEventListener({
  map: mapInstance,
  event: 'click',
  handler: (event) => {
    console.log('Map clicked at:', event.lngLat);
  },
});

// Listen for map zoom events
useMapEventListener({
  map: mapInstance,
  event: 'zoom',
  handler: (event) => {
    console.log('Map zoom level:', event.target.getZoom());
  },
});
```

### useLayerEventListener

Provides reactive event handling for MapLibre GL layer events with automatic cleanup.

#### Parameters

| Parameter | Type                         | Description                        |
| --------- | ---------------------------- | ---------------------------------- |
| `props`   | `UseLayerEventListenerProps` | Layer event listener configuration |

#### UseLayerEventListenerProps Interface

| Property  | Type                    | Description              |
| --------- | ----------------------- | ------------------------ |
| `map`     | `MaybeRef<Map \| null>` | Map instance reference   |
| `layerId` | `string`                | Layer identifier         |
| `event`   | `MapLayerEventType`     | Event type to listen for |
| `handler` | `(event: any) => void`  | Event handler function   |

#### Example

```typescript
import { ref } from 'vue';
import { useLayerEventListener } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);

// Listen for layer click events
useLayerEventListener({
  map: mapInstance,
  layerId: 'my-layer',
  event: 'click',
  handler: (event) => {
    console.log('Layer clicked:', event.features[0]);
  },
});

// Listen for layer hover events
useLayerEventListener({
  map: mapInstance,
  layerId: 'my-layer',
  event: 'mouseenter',
  handler: (event) => {
    console.log('Mouse entered layer:', event.features[0]);
  },
});
```

### useGeolocateEventListener

Listens to events from a `GeolocateControl` instance (e.g. `geolocate`, `trackuserlocationstart`, `error`), the geolocate-specific counterpart to `useMapEventListener`.

#### Signature

```typescript
function useGeolocateEventListener(
  props: GeolocateEventListenerProps,
): EventListenerActions;
```

#### Parameters

| Property     | Type                                                            | Description                          |
| -------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| `geolocate`    | `MaybeRef<GeolocateControl \| null>`                                  | Geolocate control instance (from `useGeolocateControl`) |
| `event`        | `keyof GeolocateEventTypes`                                          | Event name, e.g. `'geolocate'`, `'error'`  |
| `on`           | `(event) => void`                                                     | Event handler                              |
| `once`         | `boolean`                                                             | Listen only once                           |
| `debug`        | `boolean`                                                             | Enable debug logging                       |

#### Returns

Same shape as `useMapEventListener`/`useLayerEventListener` — an `EventListenerActions` object exposing listener status and a way to detach the listener.

#### Example

```vue
<script setup>
import { useGeolocateControl, useGeolocateEventListener } from 'vue3-maplibre-gl';

const { control } = useGeolocateControl({ map: mapInstance });

useGeolocateEventListener({
  geolocate: control,
  event: 'geolocate',
  on: (position) => {
    console.log('User located at:', position.coords);
  },
});
</script>
```

### useMapReloadEvent

Low-level building block that tracks the map's `load`/`styledata`/`styledataloading` events and fires `onLoad`/`onUnload` callbacks whenever the style is (re)loaded — including on style switches, not just the initial load. Many other composables (like `useCreateLayer`) use this internally to recreate their layers/sources after a style change.

#### Signature

```typescript
function useMapReloadEvent(props: MapReloadEventProps): MapReloadEventActions;
```

#### Parameters (`MapReloadEventProps`)

| Property               | Type                                              | Description                                   |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------- |
| `map`                    | `MaybeRef<Map \| null>`                                 | Map instance reference                              |
| `callbacks.onLoad`        | `(map: Map) => void`                                    | Called when the style finishes (re)loading           |
| `callbacks.onUnload`      | `(map: Map) => void`                                    | Called when the style starts reloading (optional)     |
| `callbacks.onError`       | `(error: any) => void`                                  | Called on handler errors (optional)                    |
| `debug`                  | `boolean`                                               | Enable debug logging                                |
| `autoTriggerOnMount`      | `boolean`                                               | Fire `onLoad` immediately if the style is already loaded (default: `true`) |

#### Returns

| Property        | Type                          | Description                                       |
| ----------------- | -------------------------------- | ------------------------------------------------------ |
| `clear`             | `() => void`                     | Remove all listeners                                    |
| `forceLoad`         | `() => void`                     | Manually trigger the load callback                       |
| `forceUnload`       | `() => void`                     | Manually trigger the unload callback                     |
| `isMapLoaded`       | `boolean`                        | Whether the style is currently loaded                    |
| `loadStatus`        | `Readonly<MapReloadEventStatus>` | `'not-loaded' \| 'loading' \| 'loaded' \| 'error'`        |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useMapReloadEvent } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

useMapReloadEvent({
  map: mapInstance,
  callbacks: {
    onLoad: (map) => console.log('Style (re)loaded'),
    onUnload: (map) => console.log('Style is being replaced'),
  },
});
</script>
```

## Camera Composables

Composables for moving the map's camera (panning, rotating, zooming, and fitting to bounds). All of them return a promise-based action plus a status enum you can watch (`'not-started' | '...ing' | 'completed' | 'error'`), and all accept either a `props` object (recommended) or the legacy `(map, options)` call signature for backward compatibility. They all clean up in-flight animations automatically on unmount.

### usePanBy / usePanTo

Pans the map by a pixel offset (`usePanBy`) or to a specific coordinate (`usePanTo`), with animation.

#### Signature

```typescript
function usePanBy(props: PanByProps): PanByActions;
function usePanTo(props: PanToProps): PanToActions;
```

#### Parameters

| Property   | Type                      | Description                              |
| ------------ | ---------------------------- | --------------------------------------------- |
| `map`        | `MaybeRef<Map \| null>`      | Map instance reference                        |
| `offset`     | `PointLike` (`usePanBy` only)  | Pixel offset `[x, y]`                        |
| `lnglat`     | `LngLatLike` (`usePanTo` only) | Target coordinate                             |
| `options`    | `AnimationOptions`            | Animation options (duration, easing, etc.)    |
| `autoPan`    | `boolean`                     | Auto-pan once offset/lnglat and map are set (default: `true`) |
| `debug`      | `boolean`                     | Enable debug logging                          |

#### Returns

| Property                | Type                                                       | Description                                 |
| -------------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| `panBy` / `panTo`            | `(target, options?) => Promise<void>`                            | Executes the pan, resolves on `moveend`               |
| `stopPanning`                | `() => void`                                                     | Stops the in-progress pan                             |
| `getCurrentCamera`            | `() => CameraOptions \| null`                                    | Current `{ center, zoom, bearing, pitch }`             |
| `validatePanOffset` / `validatePanTarget` | `(value) => boolean`                                | Validates the offset/coordinate shape                 |
| `panStatus`                    | `Readonly<PanStatus>`                                            | `'not-started' \| 'panning' \| 'completed' \| 'error'` |
| `isPanning`                     | `boolean`                                                        | Whether a pan is in progress                           |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { usePanBy, usePanTo } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

const { panBy } = usePanBy({ map: mapInstance, autoPan: false });
const { panTo } = usePanTo({ map: mapInstance, autoPan: false });

await panBy([100, 0], { duration: 500 });
await panTo([106.7, 10.8], { duration: 1000 });
</script>
```

### useRotateTo / useSnapToNorth / useResetNorth / useResetNorthPitch

Rotates the map's bearing. `useRotateTo` rotates to an arbitrary bearing; `useSnapToNorth`, `useResetNorth`, and `useResetNorthPitch` are shortcuts around MapLibre's `snapToNorth()`, `resetNorth()`, and `resetNorthPitch()`.

#### Signature

```typescript
function useRotateTo(props: RotateToProps): RotateToActions;
function useSnapToNorth(props: SnapToNorthProps): SnapToNorthActions;
function useResetNorth(props: ResetNorthProps): ResetNorthActions;
function useResetNorthPitch(props: ResetNorthPitchProps): ResetNorthPitchActions;
```

#### Parameters

| Property   | Type                     | Description                                            |
| ------------ | -------------------------- | ------------------------------------------------------------ |
| `map`        | `MaybeRef<Map \| null>`    | Map instance reference                                        |
| `bearing`    | `number` (`useRotateTo` only) | Target bearing in degrees                                     |
| `options`    | `AnimationOptions`          | Animation options                                              |
| `autoRotate` / `autoReset` / `autoSnap` | `boolean` | Auto-run once the map/bearing is ready (default: `true`)      |
| `debug`      | `boolean`                   | Enable debug logging                                           |

#### Returns

| Property                              | Type                                          | Description                             |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `rotateTo` / `snapToNorth` / `resetNorth` / `resetNorthPitch` | `(value?, options?) => Promise<void>`             | Executes the rotation                     |
| `stopRotating`                             | `() => void`                                       | Stops the in-progress rotation             |
| `getCurrentBearing`                        | `() => number \| null`                             | Current bearing                            |
| `getCurrentPitch` (`useResetNorthPitch` only) | `() => number \| null`                          | Current pitch                              |
| `getCurrentCamera`                         | `() => CameraOptions \| null`                      | Current camera state                       |
| `validateBearing` (`useRotateTo` only)      | `(bearing: number) => boolean`                     | Validates a bearing value                  |
| `rotationStatus`                            | `Readonly<RotationStatus>`                         | `'not-started' \| 'rotating' \| 'completed' \| 'error'` |
| `isRotating`                                 | `boolean`                                          | Whether a rotation is in progress          |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useRotateTo, useResetNorth } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

const { rotateTo } = useRotateTo({ map: mapInstance, autoRotate: false });
const { resetNorth } = useResetNorth({ map: mapInstance, autoReset: false });

await rotateTo(45, { duration: 500 });
await resetNorth({ duration: 500 });
</script>
```

### useZoomIn / useZoomOut / useZoomTo

Animates the map's zoom level: `useZoomIn`/`useZoomOut` change by one level, `useZoomTo` zooms to an exact level.

#### Signature

```typescript
function useZoomIn(props: ZoomInProps): ZoomInActions;
function useZoomOut(props: ZoomOutProps): ZoomOutActions;
function useZoomTo(props: ZoomToProps): ZoomToActions;
```

#### Parameters

| Property   | Type                   | Description                                          |
| ------------ | ------------------------- | ----------------------------------------------------------- |
| `map`        | `MaybeRef<Map \| null>`   | Map instance reference                                        |
| `zoom`       | `number` (`useZoomTo` only) | Target zoom level (0-24)                                      |
| `options`    | `AnimationOptions`         | Animation options                                              |
| `autoZoom`    | `boolean`                   | Auto-run once the map (and zoom, for `useZoomTo`) is ready (default: `true`) |
| `debug`      | `boolean`                   | Enable debug logging                                           |

#### Returns

| Property                          | Type                                     | Description                             |
| ------------------------------------ | --------------------------------------------- | --------------------------------------------- |
| `zoomIn` / `zoomOut` / `zoomTo`        | `(value?, options?) => Promise<void>`           | Executes the zoom, resolves on `zoomend`         |
| `stopZooming`                          | `() => void`                                    | Stops the in-progress zoom                       |
| `getCurrentZoom`                       | `() => number \| null`                          | Current zoom level                               |
| `getCurrentCamera`                     | `() => CameraOptions \| null`                   | Current camera state                             |
| `validateZoomLevel` (`useZoomTo` only)  | `(zoom: number) => boolean`                     | Validates a zoom value (0-24)                    |
| `zoomStatus`                            | `Readonly<ZoomStatus>`                          | `'not-started' \| 'zooming' \| 'completed' \| 'error'` |
| `isZooming`                              | `boolean`                                       | Whether a zoom is in progress                    |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useZoomIn, useZoomOut, useZoomTo } from 'vue3-maplibre-gl';

const mapInstance = ref(null);

const { zoomIn } = useZoomIn({ map: mapInstance, autoZoom: false });
const { zoomOut } = useZoomOut({ map: mapInstance, autoZoom: false });
const { zoomTo } = useZoomTo({ map: mapInstance, autoZoom: false });

await zoomIn({ duration: 300 });
await zoomOut({ duration: 300 });
await zoomTo(14, { duration: 500 });
</script>
```

### useFitBounds / useCameraForBounds

`useFitBounds` moves and zooms the map so a bounding box fits in view (wraps `map.fitBounds()`). `useCameraForBounds` only *calculates* the camera options for a bounding box without moving the map (wraps `map.cameraForBounds()`) — useful when you want to inspect or tweak the result before applying it.

#### Signature

```typescript
function useFitBounds(props: FitBoundsProps): FitBoundsActions;
function useCameraForBounds(props: CameraForBoundsProps): CameraForBoundsActions;
```

#### Parameters

| Property   | Type                                                    | Description                        |
| ------------ | ------------------------------------------------------------ | ---------------------------------------- |
| `map`        | `MaybeRef<Map \| null>`                                       | Map instance reference                    |
| `options`    | `FitBoundsOptions` (`useFitBounds`) / `CameraForBoundsOptions & { bounds? }` (`useCameraForBounds`) | Fit/camera options, e.g. `padding` |
| `debug`      | `boolean`                                                     | Enable debug logging                      |

#### Returns

**`useFitBounds`**

| Property         | Type                                                            | Description                    |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| `setFitBounds`       | `(bounds: LngLatBoundsLike, options?: FitBoundsOptions) => void`      | Fits the map to the given bounds      |
| `clearBounds`         | `() => void`                                                          | Resets internal bounds state          |
| `getCurrentBounds`     | `() => LngLatBounds \| null`                                          | Current map bounds                    |
| `bounds`                | `LngLatBoundsLike \| undefined`                                       | Last bounds applied                   |
| `boundsStatus`           | `Readonly<BoundsStatus>`                                              | `'not-set' \| 'setting' \| 'set' \| 'error'` |
| `isBoundsSet`             | `boolean`                                                             | Whether bounds are currently set      |

**`useCameraForBounds`**

| Property         | Type                                                                     | Description                    |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------ |
| `cameraForBounds`     | `(bounds: LngLatBoundsLike, options?: CameraForBoundsOptions) => void`           | Calculates camera options for bounds  |
| `clearCamera`          | `() => void`                                                                    | Resets internal state                |
| `getCurrentBounds`      | `() => LngLatBounds \| null`                                                    | Current map bounds                    |
| `bbox`                    | `LngLatBoundsLike \| undefined`                                                 | Last bounding box used                |
| `cameraStatus`             | `Readonly<BoundsStatus>`                                                        | `'not-set' \| 'setting' \| 'set' \| 'error'` |
| `isCameraSet`               | `boolean`                                                                       | Whether a camera was computed         |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useFitBounds } from 'vue3-maplibre-gl';

const mapInstance = ref(null);
const { setFitBounds } = useFitBounds({ map: mapInstance });

setFitBounds(
  [
    [-74.0, 40.7], // Southwest
    [-73.9, 40.8], // Northeast
  ],
  { padding: 20, duration: 1000 },
);
</script>
```

### useFitScreenCoordinates

Fits the map to a rectangle defined by **screen pixel** coordinates (rather than geographic bounds) — wraps `map.fitScreenCoordinates()`. Handy for "draw a box on screen to zoom into it" UI.

#### Signature

```typescript
function useFitScreenCoordinates(
  props: FitScreenCoordinatesProps,
): FitScreenCoordinatesActions;
```

#### Parameters (`FitScreenCoordinatesProps`)

| Property           | Type                                     | Description                                |
| --------------------- | --------------------------------------------- | ------------------------------------------------ |
| `map`                   | `MaybeRef<Map \| null>`                        | Map instance reference                             |
| `defaultOptions`         | `Omit<FitBoundsOptions, 'bearing'>`            | Default fit options                                |
| `defaultBearing`          | `number`                                       | Default bearing to use if none is passed           |
| `autoCleanup`              | `boolean`                                      | Clear coordinates on unmount (default: `true`)     |
| `debug`                     | `boolean`                                      | Enable debug logging                               |

#### Returns

| Property               | Type                                                                                       | Description                       |
| ------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `fitScreenCoordinates`      | `(p0: PointLike, p1: PointLike, options?, bearing?) => void`                                     | Fits the map to the pixel rectangle       |
| `clearCoordinates`           | `() => void`                                                                                     | Clears the current selection              |
| `status`                       | `Readonly<FitScreenCoordinatesStatus>`                                                           | `'not-set' \| 'setting' \| 'set' \| 'error'` |
| `isCoordinatesSet`               | `boolean`                                                                                       | Whether both points are set               |
| `isFitting`                        | `boolean`                                                                                       | Whether the fit is in progress            |
| `hasError`                          | `boolean`                                                                                       | Whether the last fit failed               |

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useFitScreenCoordinates } from 'vue3-maplibre-gl';

const mapInstance = ref(null);
const { fitScreenCoordinates } = useFitScreenCoordinates({ map: mapInstance });

// User drew a selection box from (50,50) to (300,300) pixels
fitScreenCoordinates([50, 50], [300, 300]);
</script>
```

## Utility Composables

### useFlyTo

Provides smooth animated transitions to new map positions with customizable easing and duration.

#### Parameters

| Parameter | Type            | Description                    |
| --------- | --------------- | ------------------------------ |
| `props`   | `UseFlyToProps` | Fly-to animation configuration |

#### UseFlyToProps Interface

| Property  | Type                    | Description            |
| --------- | ----------------------- | ---------------------- |
| `map`     | `MaybeRef<Map \| null>` | Map instance reference |
| `options` | `FlyToOptions`          | Animation options      |

#### Returns

| Property   | Type                              | Description                 |
| ---------- | --------------------------------- | --------------------------- |
| `flyTo`    | `(options: FlyToOptions) => void` | Execute fly-to animation    |
| `isFlying` | `ComputedRef<boolean>`            | Whether animation is active |

#### Example

```typescript
import { ref } from 'vue';
import { useFlyTo } from 'vue3-maplibre-gl';

const mapInstance = ref<Map | null>(null);

const { flyTo, isFlying } = useFlyTo({
  map: mapInstance,
});

// Fly to a new location
flyTo({
  center: [0, 0],
  zoom: 10,
  duration: 2000,
  essential: true,
});

// Check if animation is active
watch(isFlying, (flying) => {
  console.log('Animation active:', flying);
});
```

### useEaseTo

Provides smooth animated transitions with easing functions for map camera changes.

#### Parameters

| Parameter | Type             | Description                     |
| --------- | ---------------- | ------------------------------- |
| `props`   | `UseEaseToProps` | Ease-to animation configuration |

#### Returns

| Property   | Type                               | Description                 |
| ---------- | ---------------------------------- | --------------------------- |
| `easeTo`   | `(options: EaseToOptions) => void` | Execute ease-to animation   |
| `isEasing` | `ComputedRef<boolean>`             | Whether animation is active |

#### Example

```typescript
import { useEaseTo } from 'vue3-maplibre-gl';

const { easeTo, isEasing } = useEaseTo({
  map: mapInstance,
});

// Ease to a new position
easeTo({
  center: [0, 0],
  zoom: 12,
  bearing: 45,
  pitch: 30,
  duration: 1000,
});
```

### useJumpTo

Provides instant map position changes without animation.

#### Parameters

| Parameter | Type             | Description           |
| --------- | ---------------- | --------------------- |
| `props`   | `UseJumpToProps` | Jump-to configuration |

#### Returns

| Property | Type                               | Description                     |
| -------- | ---------------------------------- | ------------------------------- |
| `jumpTo` | `(options: CameraOptions) => void` | Execute instant position change |

#### Example

```typescript
import { useJumpTo } from 'vue3-maplibre-gl';

const { jumpTo } = useJumpTo({
  map: mapInstance,
});

// Jump to a new position instantly
jumpTo({
  center: [0, 0],
  zoom: 15,
  bearing: 0,
  pitch: 0,
});
```

### useLogger

Provides consistent logging functionality with debug level control.

#### Parameters

| Parameter | Type      | Description                     |
| --------- | --------- | ------------------------------- |
| `debug`   | `boolean` | Whether to enable debug logging |

#### Returns

| Property   | Type                                        | Description         |
| ---------- | ------------------------------------------- | ------------------- |
| `log`      | `(message: string, ...args: any[]) => void` | Log debug message   |
| `logError` | `(message: string, ...args: any[]) => void` | Log error message   |
| `logWarn`  | `(message: string, ...args: any[]) => void` | Log warning message |

#### Example

```typescript
import { useLogger } from 'vue3-maplibre-gl';

const { log, logError, logWarn } = useLogger(true);

// Log debug information
log('Map initialized successfully');

// Log errors
logError('Failed to load map style:', error);

// Log warnings
logWarn('Deprecated API usage detected');
```

## Performance Composables

Generic, map-agnostic helpers for debouncing and optimizing reactive computations. Useful when a map event (e.g. `move`, `mousemove`) fires faster than you want to react to it.

### useDebounce

Wraps a plain function so it only runs after a delay of no further calls (or on a leading/trailing edge, lodash-`debounce` style). Great for wrapping expensive handlers on high-frequency map events like `move` or `mousemove`.

#### Signature

```typescript
function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  options?: DebounceOptions,
): DebouncedFunction<T>;
```

#### Parameters (`DebounceOptions`)

| Property   | Type      | Default | Description                                    |
| ------------ | --------- | ------- | -------------------------------------------------- |
| `delay`      | `number`  | `300`   | Delay in milliseconds                               |
| `leading`    | `boolean` | `false` | Invoke on the leading edge of the delay              |
| `trailing`   | `boolean` | `true`  | Invoke on the trailing edge of the delay              |
| `maxWait`    | `number`  | —       | Force invocation after this many ms even if still being called |
| `debug`      | `boolean` | `false` | Enable debug logging                                |

#### Returns

A `DebouncedFunction<T>` — call it like the original function; it also exposes:

| Property   | Type            | Description                          |
| ------------ | ------------------ | ------------------------------------------ |
| `cancel`      | `() => void`         | Cancel any pending invocation               |
| `flush`         | `() => ReturnType<T> \| undefined` | Invoke immediately if one is pending |
| `pending`         | `() => boolean`      | Whether an invocation is pending            |

#### Example

```vue
<script setup>
import { useDebounce } from 'vue3-maplibre-gl';

const logMove = useDebounce((center) => {
  console.log('Map moved to:', center);
}, { delay: 300 });

// call logMove(center) inside a 'move' handler — it only logs 300ms after moves stop
</script>
```

### useDebouncedRef

Creates a ref pair: write to the "immediate" ref instantly, read a "debounced" ref that only updates after the delay. Useful for search inputs or sliders tied to map operations.

#### Signature

```typescript
function useDebouncedRef<T>(
  initialValue: T,
  delay?: number,
): [Ref<T>, Ref<T>, () => void, () => void];
```

#### Parameters

| Parameter       | Type     | Default | Description                    |
| ----------------- | -------- | ------- | ----------------------------------- |
| `initialValue`      | `T`      | —       | Initial value for both refs           |
| `delay`               | `number` | `300`   | Debounce delay in milliseconds        |

#### Returns

A tuple `[debouncedRef, immediateRef, flush, cancel]`:

| Index | Name             | Type         | Description                              |
| ------- | ------------------ | -------------- | ---------------------------------------------- |
| `0`       | `debouncedRef`        | `Ref<T>`         | Updates `delay` ms after `immediateRef` settles  |
| `1`        | `immediateRef`         | `Ref<T>`         | Updates instantly when you write to it            |
| `2`         | `flush`                  | `() => void`       | Immediately sync `debouncedRef` to the latest value |
| `3`          | `cancel`                  | `() => void`       | Cancel the pending update                          |

#### Example

```vue
<script setup>
import { useDebouncedRef } from 'vue3-maplibre-gl';

const [debouncedZoom, zoom] = useDebouncedRef(10, 250);

// zoom.value = 12  → updates immediately
// debouncedZoom.value → updates 250ms later, good for triggering expensive layer updates
</script>
```

### useDebouncedWatch

Combines Vue's `watch` with debouncing — the callback only fires `delay` ms after the watched source stops changing.

#### Signature

```typescript
function useDebouncedWatch<T>(
  source: WatchSource<T>,
  callback: (value: T, oldValue: T | undefined) => void,
  options?: DebounceOptions & { immediate?: boolean; deep?: boolean; flush?: 'pre' | 'post' | 'sync' },
): () => void;
```

#### Parameters

| Parameter   | Type                                              | Description                                  |
| ------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `source`        | `WatchSource<T>`                                       | Same as the first argument to Vue's `watch`            |
| `callback`         | `(value: T, oldValue: T \| undefined) => void`           | Debounced watch callback                                 |
| `options`             | `DebounceOptions & { immediate?, deep?, flush? }`          | Debounce options plus standard `watch` options            |

#### Returns

`() => void` — stops both the watcher and any pending debounced call.

#### Example

```vue
<script setup>
import { ref } from 'vue';
import { useDebouncedWatch } from 'vue3-maplibre-gl';

const searchQuery = ref('');

useDebouncedWatch(searchQuery, (query) => {
  console.log('Searching for:', query);
}, { delay: 400 });
</script>
```

### useOptimizedComputed

A `computed()` replacement that skips recomputing its consumers when the new value is equal to the old one (shallow comparison by default), avoiding needless re-renders. Optionally supports a time-based cache.

#### Signature

```typescript
function useOptimizedComputed<T>(
  getter: () => T,
  options?: OptimizedComputedOptions<T>,
): ComputedRef<T>;
```

#### Parameters (`OptimizedComputedOptions`)

| Property     | Type                          | Default | Description                                      |
| -------------- | -------------------------------- | ------- | ------------------------------------------------------ |
| `deepEqual`      | `boolean`                          | `false` | Use `JSON.stringify` deep comparison instead of shallow  |
| `equalityFn`        | `(a: T, b: T) => boolean`            | —       | Custom equality function                                 |
| `cacheDuration`        | `number`                             | —       | Skip recomputation for this many ms after each compute    |

#### Returns

`ComputedRef<T>` — a normal Vue computed ref.

#### Example

```vue
<script setup>
import { useOptimizedComputed } from 'vue3-maplibre-gl';

const visibleFeatures = useOptimizedComputed(
  () => map.value?.queryRenderedFeatures() ?? [],
  { deepEqual: true },
);
</script>
```

### useBatchedComputed

A `computed()` variant that batches rapid successive value changes and only commits the latest one once `batchSize` updates have accumulated or `batchDelay` ms have passed — useful for high-frequency sources like `mousemove`.

#### Signature

```typescript
function useBatchedComputed<T>(
  getter: () => T,
  batchSize?: number,
  batchDelay?: number,
): ComputedRef<T>;
```

#### Parameters

| Parameter     | Type         | Default | Description                             |
| --------------- | -------------- | ------- | --------------------------------------------- |
| `getter`          | `() => T`        | —       | Computation to run                              |
| `batchSize`         | `number`         | `5`     | Number of updates to accumulate before committing |
| `batchDelay`          | `number`         | `16`    | Max delay in ms before committing a partial batch |

#### Returns

`ComputedRef<T>`.

#### Example

```vue
<script setup>
import { useBatchedComputed } from 'vue3-maplibre-gl';

const cursorPosition = useBatchedComputed(() => currentPixel.value, 5, 16);
</script>
```

### useComputedWithCleanup

A `computed()` variant that runs a `cleanup` callback on the *previous* value whenever the computed value changes — useful when the computed value holds a resource that needs disposing (e.g. an event listener or a MapLibre `Marker`).

#### Signature

```typescript
function useComputedWithCleanup<T>(
  getter: () => T,
  cleanup: (oldValue: T) => void,
): ComputedRef<T>;
```

#### Parameters

| Parameter   | Type                      | Description                          |
| ------------- | ---------------------------- | ------------------------------------------ |
| `getter`        | `() => T`                       | Computation to run                          |
| `cleanup`          | `(oldValue: T) => void`           | Called with the previous value when it changes |

#### Returns

`ComputedRef<T>`.

#### Example

```vue
<script setup>
import { useComputedWithCleanup } from 'vue3-maplibre-gl';

const activeMarker = useComputedWithCleanup(
  () => createMarkerFor(selectedId.value),
  (oldMarker) => oldMarker?.remove(),
);
</script>
```

### useMemoized

Wraps a plain function with a size-bounded cache keyed by its arguments (JSON-stringified by default). Not tied to Vue reactivity — use for pure, expensive computations called repeatedly with the same inputs.

#### Signature

```typescript
function useMemoized<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyFn?: (...args: TArgs) => string,
  maxCacheSize?: number,
): (...args: TArgs) => TReturn;
```

#### Parameters

| Parameter     | Type                                | Default                        | Description                          |
| --------------- | -------------------------------------- | --------------------------------- | ------------------------------------------ |
| `fn`              | `(...args: TArgs) => TReturn`             | —                                  | Function to memoize                          |
| `keyFn`             | `(...args: TArgs) => string`                | `(...args) => JSON.stringify(args)` | Cache key generator                          |
| `maxCacheSize`        | `number`                                      | `100`                              | Max cached entries (oldest evicted first)     |

#### Returns

A memoized version of `fn` with the same signature.

#### Example

```vue
<script setup>
import { useMemoized } from 'vue3-maplibre-gl';

const expensiveDistance = useMemoized(
  (a, b) => computeGreatCircleDistance(a, b),
);
</script>
```

### useThrottledComputed

A `computed()` for numeric values that ignores changes smaller than `threshold` and debounces larger changes by `debounceMs`. Useful for smoothing a rapidly-changing number (e.g. zoom level) before displaying it.

#### Signature

```typescript
function useThrottledComputed<T extends number>(
  getter: () => T,
  threshold?: number,
  debounceMs?: number,
): ComputedRef<T>;
```

#### Parameters

| Parameter     | Type       | Default | Description                                |
| --------------- | ------------ | ------- | ------------------------------------------------ |
| `getter`          | `() => T`      | —       | Numeric computation to run                          |
| `threshold`         | `number`         | `0.01`  | Minimum change required to update                    |
| `debounceMs`          | `number`         | `100`   | Delay in ms before committing a qualifying change    |

#### Returns

`ComputedRef<T>`.

#### Example

```vue
<script setup>
import { useThrottledComputed } from 'vue3-maplibre-gl';

const displayedZoom = useThrottledComputed(() => rawZoom.value, 0.1, 100);
</script>
```
