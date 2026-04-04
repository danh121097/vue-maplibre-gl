import { defineNuxtPlugin } from '#app';
import {
  Maplibre,
  GeoJsonSource,
  FillLayer,
  CircleLayer,
  LineLayer,
  SymbolLayer,
  Marker,
  Popup,
  Image,
  GeolocateControls,
} from 'vue3-maplibre-gl';

/**
 * Client-only plugin that registers vue3-maplibre-gl components globally.
 * Runs only in browser — MapLibre GL requires WebGL/canvas.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const components = {
    Maplibre,
    GeoJsonSource,
    FillLayer,
    CircleLayer,
    LineLayer,
    SymbolLayer,
    Marker,
    Popup,
    Image: Image,
    GeolocateControls,
  };

  for (const [name, component] of Object.entries(components)) {
    nuxtApp.vueApp.component(name, component as any);
  }
});
