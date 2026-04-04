import type { MapMouseEvent, MapTouchEvent, MapWheelEvent } from 'maplibre-gl';
import type { GeolocateSuccess, GeolocationPositionError } from './index';

// Map event handlers — consumer-facing types for event listener callbacks
export type MapClickHandler = (e: MapMouseEvent) => void;
export type MapMoveHandler = (e: Event) => void;
export type MapZoomHandler = (e: Event) => void;
export type MapTouchHandler = (e: MapTouchEvent) => void;
export type MapWheelHandler = (e: MapWheelEvent) => void;

// Layer event handlers
export type LayerClickHandler = (e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => void;
export type LayerMouseHandler = (e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => void;

// Geolocate event handlers
export type GeolocateHandler = (e: GeolocateSuccess) => void;
export type GeolocateErrorHandler = (e: GeolocationPositionError) => void;
