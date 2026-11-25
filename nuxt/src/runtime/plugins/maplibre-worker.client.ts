import { defineNuxtPlugin } from '#app';
import { setWorkerUrl } from 'maplibre-gl';
// Vite emits the worker as its own asset and hands back its URL. MapLibre 6
// would otherwise look for the worker beside its own module file, which the
// build has moved, and fail with "Worker failed to load".
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

/**
 * Client-only plugin that tells MapLibre where its web worker is.
 * Disable with `maplibre: { worker: false }` to call `setWorkerUrl` yourself.
 */
export default defineNuxtPlugin(() => {
  setWorkerUrl(workerUrl);
});
