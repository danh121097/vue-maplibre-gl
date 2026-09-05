/**
 * MapLibre GL runtime re-exports.
 *
 * These live on the `vue3-maplibre-gl/maplibre` subpath rather than the package
 * root. A namespace re-export (`export * as maplibregl`) references every
 * upstream export, so keeping it at the root would pin the whole MapLibre
 * runtime surface into the module graph of any consumer that imports a single
 * component. Type-only re-exports stay at the root because they vanish at
 * compile time.
 */

// Expose the full runtime surface under a namespace to avoid collisions with
// Vue components such as Marker and Popup while still making the exact upstream
// API available from this package.
export * as maplibregl from 'maplibre-gl';

// Re-export the upstream runtime surface directly where names do not conflict
// with this package. Marker and Popup stay available via aliases below.
export {
  AJAXError,
  AttributionControl,
  BoxZoomHandler,
  CanvasSource,
  Color,
  CooperativeGesturesHandler,
  DoubleClickZoomHandler,
  DragPanHandler,
  DragRotateHandler,
  EdgeInsets,
  ErrorEvent,
  Event,
  Evented,
  Formatted,
  FormattedSection,
  FullscreenControl,
  GeoJSONSource,
  GeolocateControl,
  GlobeControl,
  Hash,
  ImageSource,
  KeyboardHandler,
  LngLat,
  LngLatBounds,
  LogoControl,
  Map,
  MapMouseEvent,
  MapTouchEvent,
  MapWheelEvent,
  MercatorCoordinate,
  NavigationControl,
  Point,
  RasterDEMTileSource,
  RasterTileSource,
  ScaleControl,
  ScrollZoomHandler,
  Style,
  TerrainControl,
  TwoFingersTouchPitchHandler,
  TwoFingersTouchRotateHandler,
  TwoFingersTouchZoomHandler,
  TwoFingersTouchZoomRotateHandler,
  VectorTileSource,
  VideoSource,
  addProtocol,
  addSourceType,
  clearPrewarmedResources,
  config,
  createTileMesh,
  getMaxParallelImageRequests,
  getRTLTextPluginStatus,
  getVersion,
  getWorkerCount,
  getWorkerUrl,
  importScriptInWorkers,
  prewarm,
  removeProtocol,
  setMaxParallelImageRequests,
  setRTLTextPlugin,
  setWorkerCount,
  setWorkerUrl,
} from 'maplibre-gl';

export { Marker as MaplibreMarker, Popup as MaplibrePopup } from 'maplibre-gl';
