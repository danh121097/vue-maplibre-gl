import { watchEffect, ref, computed, unref, onUnmounted } from 'vue';
import { useLogger } from '@libs/composables';
import { createCameraAnimation } from './create-camera-animation';
import type { Nullable, Undefinedable } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, AnimationOptions, CameraOptions } from 'maplibre-gl';

export enum ZoomStatus {
  NotStarted = 'not-started',
  Zooming = 'zooming',
  Completed = 'completed',
  Error = 'error',
}

interface ZoomToProps { map: MaybeRef<Nullable<Map>>; zoom?: number; options?: AnimationOptions; debug?: boolean; autoZoom?: boolean; }
interface ZoomToActions {
  zoomTo: (zoom: number, options?: AnimationOptions) => Promise<void>;
  stopZooming: () => void;
  getCurrentZoom: () => number | null;
  getCurrentCamera: () => CameraOptions | null;
  validateZoomLevel: (zoom: number) => boolean;
  zoomStatus: Readonly<ZoomStatus>;
  isZooming: boolean;
}
interface ZoomInProps { map: MaybeRef<Nullable<Map>>; options?: AnimationOptions; debug?: boolean; autoZoom?: boolean; }
interface ZoomInActions {
  zoomIn: (options?: AnimationOptions) => Promise<void>;
  stopZooming: () => void;
  getCurrentZoom: () => number | null;
  getCurrentCamera: () => CameraOptions | null;
  zoomStatus: Readonly<ZoomStatus>;
  isZooming: boolean;
}
interface ZoomOutProps { map: MaybeRef<Nullable<Map>>; options?: AnimationOptions; debug?: boolean; autoZoom?: boolean; }
interface ZoomOutActions {
  zoomOut: (options?: AnimationOptions) => Promise<void>;
  stopZooming: () => void;
  getCurrentZoom: () => number | null;
  getCurrentCamera: () => CameraOptions | null;
  zoomStatus: Readonly<ZoomStatus>;
  isZooming: boolean;
}

// --- Shared helpers ---

function validateZoomLevel(zoom: number): boolean {
  return typeof zoom === 'number' && !isNaN(zoom) && zoom >= 0 && zoom <= 24;
}

function makeGetCurrentZoom(mapInstance: { value: Map | null }, logError: (...a: any[]) => void) {
  return (): number | null => {
    const map = mapInstance.value;
    if (!map) return null;
    try { return map.getZoom(); }
    catch (error) { logError('Error getting current zoom:', error); return null; }
  };
}

// --- useZoomTo ---

export function useZoomTo(props: ZoomToProps): ZoomToActions;
export function useZoomTo(map: MaybeRef<Nullable<Map>>, options?: AnimationOptions & { zoom: number }): { zoomTo: (zoomVal: number, options?: AnimationOptions) => void };
export function useZoomTo(
  mapOrProps: MaybeRef<Nullable<Map>> | ZoomToProps,
  legacyOptions?: AnimationOptions & { zoom: number },
): ZoomToActions | { zoomTo: (zoomVal: number, options?: AnimationOptions) => void } {
  const isLegacyAPI = legacyOptions !== undefined || !('map' in (mapOrProps as any));
  const props: ZoomToProps = isLegacyAPI
    ? { map: mapOrProps as MaybeRef<Nullable<Map>>, zoom: legacyOptions?.zoom, options: legacyOptions, debug: false, autoZoom: true }
    : (mapOrProps as ZoomToProps);

  const { logError } = useLogger(props.debug ?? false);
  const zoom = ref<number | undefined>(props.zoom);
  const animationOptions = ref<Undefinedable<AnimationOptions>>(props.options);
  const zoomStatus = ref<ZoomStatus>(ZoomStatus.NotStarted);
  const mapInstance = computed(() => unref(props.map));
  const isZooming = computed(() => zoomStatus.value === ZoomStatus.Zooming);

  const { executeAnimation, getCurrentCamera, stopAnimation } =
    createCameraAnimation({ map: props.map, debug: props.debug });
  const getCurrentZoom = makeGetCurrentZoom(mapInstance, logError);

  function zoomTo(zoomVal: number, options?: AnimationOptions): Promise<void> {
    if (!validateZoomLevel(zoomVal)) {
      zoomStatus.value = ZoomStatus.Error;
      return Promise.reject(new Error('Invalid zoom level'));
    }
    zoom.value = zoomVal;
    if (options) animationOptions.value = options;
    const finalOptions = options || animationOptions.value;
    zoomStatus.value = ZoomStatus.Zooming;

    if (!finalOptions) {
      // Immediate zoom without animation
      return executeAnimation('zoomTo', [zoomVal])
        .then(() => { zoomStatus.value = ZoomStatus.Completed; })
        .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
    }

    return executeAnimation('zoomTo', [zoomVal, finalOptions], 'zoomend')
      .then(() => { zoomStatus.value = ZoomStatus.Completed; })
      .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
  }

  function stopZooming(): void { stopAnimation(); zoomStatus.value = ZoomStatus.Completed; }

  watchEffect(() => {
    const map = mapInstance.value;
    if (map && zoom.value !== undefined && props.autoZoom !== false && zoomStatus.value === ZoomStatus.NotStarted) {
      zoomTo(zoom.value, animationOptions.value).catch((error) => { logError('Error in watchEffect zoomTo:', error); });
    }
  });

  onUnmounted(() => { zoomStatus.value = ZoomStatus.Completed; });

  if (isLegacyAPI) {
    return { zoomTo: (zoomVal: number, options?: AnimationOptions) => { zoomTo(zoomVal, options).catch((e) => logError('Error in legacy zoomTo:', e)); } };
  }

  return { zoomTo, stopZooming, getCurrentZoom, getCurrentCamera, validateZoomLevel, zoomStatus: zoomStatus.value as Readonly<ZoomStatus>, isZooming: isZooming.value };
}

// --- useZoomIn ---

export function useZoomIn(props: ZoomInProps): ZoomInActions;
export function useZoomIn(map: MaybeRef<Nullable<Map>>, options?: AnimationOptions): { zoomIn: (options?: AnimationOptions) => void };
export function useZoomIn(
  mapOrProps: MaybeRef<Nullable<Map>> | ZoomInProps,
  legacyOptions?: AnimationOptions,
): ZoomInActions | { zoomIn: (options?: AnimationOptions) => void } {
  const isLegacyAPI = legacyOptions !== undefined || !('map' in (mapOrProps as any));
  const props: ZoomInProps = isLegacyAPI
    ? { map: mapOrProps as MaybeRef<Nullable<Map>>, options: legacyOptions, debug: false, autoZoom: true }
    : (mapOrProps as ZoomInProps);

  const { logError } = useLogger(props.debug ?? false);
  const animationOptions = ref<Undefinedable<AnimationOptions>>(props.options);
  const zoomStatus = ref<ZoomStatus>(ZoomStatus.NotStarted);
  const mapInstance = computed(() => unref(props.map));
  const isZooming = computed(() => zoomStatus.value === ZoomStatus.Zooming);

  const { executeAnimation, getCurrentCamera, stopAnimation } =
    createCameraAnimation({ map: props.map, debug: props.debug });
  const getCurrentZoom = makeGetCurrentZoom(mapInstance, logError);

  function zoomIn(options?: AnimationOptions): Promise<void> {
    if (options) animationOptions.value = options;
    const finalOptions = options || animationOptions.value;
    zoomStatus.value = ZoomStatus.Zooming;

    if (!finalOptions) {
      return executeAnimation('zoomIn', [])
        .then(() => { zoomStatus.value = ZoomStatus.Completed; })
        .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
    }

    return executeAnimation('zoomIn', [finalOptions], 'zoomend')
      .then(() => { zoomStatus.value = ZoomStatus.Completed; })
      .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
  }

  function stopZooming(): void { stopAnimation(); zoomStatus.value = ZoomStatus.Completed; }

  watchEffect(() => {
    const map = mapInstance.value;
    if (map && props.autoZoom !== false && zoomStatus.value === ZoomStatus.NotStarted) {
      zoomIn(animationOptions.value).catch((error) => { logError('Error in watchEffect zoomIn:', error); });
    }
  });

  onUnmounted(() => { zoomStatus.value = ZoomStatus.Completed; });

  if (isLegacyAPI) {
    return { zoomIn: (options?: AnimationOptions) => { zoomIn(options).catch((e) => logError('Error in legacy zoomIn:', e)); } };
  }

  return { zoomIn, stopZooming, getCurrentZoom, getCurrentCamera, zoomStatus: zoomStatus.value as Readonly<ZoomStatus>, isZooming: isZooming.value };
}

// --- useZoomOut ---

export function useZoomOut(props: ZoomOutProps): ZoomOutActions;
export function useZoomOut(map: MaybeRef<Nullable<Map>>, options?: AnimationOptions): { zoomOut: (options?: AnimationOptions) => void };
export function useZoomOut(
  mapOrProps: MaybeRef<Nullable<Map>> | ZoomOutProps,
  legacyOptions?: AnimationOptions,
): ZoomOutActions | { zoomOut: (options?: AnimationOptions) => void } {
  const isLegacyAPI = legacyOptions !== undefined || !('map' in (mapOrProps as any));
  const props: ZoomOutProps = isLegacyAPI
    ? { map: mapOrProps as MaybeRef<Nullable<Map>>, options: legacyOptions, debug: false, autoZoom: true }
    : (mapOrProps as ZoomOutProps);

  const { logError } = useLogger(props.debug ?? false);
  const animationOptions = ref<Undefinedable<AnimationOptions>>(props.options);
  const zoomStatus = ref<ZoomStatus>(ZoomStatus.NotStarted);
  const mapInstance = computed(() => unref(props.map));
  const isZooming = computed(() => zoomStatus.value === ZoomStatus.Zooming);

  const { executeAnimation, getCurrentCamera, stopAnimation } =
    createCameraAnimation({ map: props.map, debug: props.debug });
  const getCurrentZoom = makeGetCurrentZoom(mapInstance, logError);

  function zoomOut(options?: AnimationOptions): Promise<void> {
    if (options) animationOptions.value = options;
    const finalOptions = options || animationOptions.value;
    zoomStatus.value = ZoomStatus.Zooming;

    if (!finalOptions) {
      return executeAnimation('zoomOut', [])
        .then(() => { zoomStatus.value = ZoomStatus.Completed; })
        .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
    }

    return executeAnimation('zoomOut', [finalOptions], 'zoomend')
      .then(() => { zoomStatus.value = ZoomStatus.Completed; })
      .catch((error) => { zoomStatus.value = ZoomStatus.Error; throw error; });
  }

  function stopZooming(): void { stopAnimation(); zoomStatus.value = ZoomStatus.Completed; }

  watchEffect(() => {
    const map = mapInstance.value;
    if (map && props.autoZoom !== false && zoomStatus.value === ZoomStatus.NotStarted) {
      zoomOut(animationOptions.value).catch((error) => { logError('Error in watchEffect zoomOut:', error); });
    }
  });

  onUnmounted(() => { zoomStatus.value = ZoomStatus.Completed; });

  if (isLegacyAPI) {
    return { zoomOut: (options?: AnimationOptions) => { zoomOut(options).catch((e) => logError('Error in legacy zoomOut:', e)); } };
  }

  return { zoomOut, stopZooming, getCurrentZoom, getCurrentCamera, zoomStatus: zoomStatus.value as Readonly<ZoomStatus>, isZooming: isZooming.value };
}
