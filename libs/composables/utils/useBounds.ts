import { watchEffect, ref, computed, unref } from 'vue';
import { useLogger } from '@libs/composables';
import type { Nullable, Undefinedable } from '@libs/types';
import type { MaybeRef } from 'vue';
import type {
  Map,
  LngLatBoundsLike,
  FitBoundsOptions,
  CameraForBoundsOptions,
  LngLatBounds,
} from 'maplibre-gl';

export enum BoundsStatus {
  NotSet = 'not-set',
  Setting = 'setting',
  Set = 'set',
  Error = 'error',
}

interface FitBoundsProps {
  map: MaybeRef<Nullable<Map>>;
  options?: FitBoundsOptions;
  debug?: boolean;
}

interface FitBoundsActions {
  setFitBounds: (boundsVal: LngLatBoundsLike, options?: FitBoundsOptions) => void;
  clearBounds: () => void;
  getCurrentBounds: () => LngLatBounds | null;
  bounds: LngLatBoundsLike | undefined;
  boundsStatus: Readonly<BoundsStatus>;
  isBoundsSet: boolean;
}

interface CameraForBoundsProps {
  map: MaybeRef<Nullable<Map>>;
  options?: CameraForBoundsOptions & { bounds?: LngLatBoundsLike };
  debug?: boolean;
}

interface CameraForBoundsActions {
  cameraForBounds: (boundsVal: LngLatBoundsLike, options?: CameraForBoundsOptions) => void;
  clearCamera: () => void;
  getCurrentBounds: () => LngLatBounds | null;
  bbox: LngLatBoundsLike | undefined;
  cameraStatus: Readonly<BoundsStatus>;
  isCameraSet: boolean;
}

/**
 * Composable for managing map bounds fitting
 */
export function useFitBounds(props: FitBoundsProps): FitBoundsActions {
  const { logError } = useLogger(props.debug ?? false);
  const bounds = ref<LngLatBoundsLike>();
  const boundsOptions = ref<Undefinedable<FitBoundsOptions>>(props.options);
  const boundsStatus = ref<BoundsStatus>(BoundsStatus.NotSet);

  const mapInstance = computed(() => unref(props.map));
  const isBoundsSet = computed(() => boundsStatus.value === BoundsStatus.Set);

  function getCurrentBounds(): LngLatBounds | null {
    const map = mapInstance.value;
    if (!map) return null;
    try { return map.getBounds(); }
    catch (error) { logError('Error getting current bounds:', error); return null; }
  }

  function setFitBounds(boundsVal: LngLatBoundsLike, options?: FitBoundsOptions): void {
    const map = mapInstance.value;
    if (!map || !boundsVal) {
      boundsStatus.value = BoundsStatus.Error;
      return;
    }
    if (Array.isArray(boundsVal) && boundsVal.length !== 4 && boundsVal.length !== 2) {
      boundsStatus.value = BoundsStatus.Error;
      return;
    }

    boundsStatus.value = BoundsStatus.Setting;
    try {
      bounds.value = boundsVal;
      if (options) boundsOptions.value = options;
      map.fitBounds(boundsVal, boundsOptions.value);
      boundsStatus.value = BoundsStatus.Set;
    } catch (error) {
      boundsStatus.value = BoundsStatus.Error;
      logError('Error setting map bounds:', error, { bounds: boundsVal });
    }
  }

  function clearBounds(): void {
    bounds.value = undefined;
    boundsStatus.value = BoundsStatus.NotSet;
  }

  watchEffect(() => {
    const map = mapInstance.value;
    if (map && bounds.value && boundsStatus.value !== BoundsStatus.Setting) {
      setFitBounds(bounds.value, boundsOptions.value);
    }
  });

  return {
    setFitBounds,
    clearBounds,
    getCurrentBounds,
    bounds: bounds.value,
    boundsStatus: boundsStatus.value as Readonly<BoundsStatus>,
    isBoundsSet: isBoundsSet.value,
  };
}

/**
 * Composable for managing camera positioning for bounds
 */
export function useCameraForBounds(props: CameraForBoundsProps): CameraForBoundsActions {
  const { log } = useLogger(props.debug ?? false);
  const bbox = ref<LngLatBoundsLike | undefined>(props.options?.bounds);
  const cameraOptions = ref<Undefinedable<CameraForBoundsOptions>>(props.options);
  const cameraStatus = ref<BoundsStatus>(BoundsStatus.NotSet);

  const mapInstance = computed(() => unref(props.map));
  const isCameraSet = computed(() => cameraStatus.value === BoundsStatus.Set);

  function getCurrentBounds(): LngLatBounds | null {
    const map = mapInstance.value;
    if (!map) return null;
    try { return map.getBounds(); }
    catch (error) { log('Error getting current bounds:', error); return null; }
  }

  function cameraForBounds(boundsVal: LngLatBoundsLike, options?: CameraForBoundsOptions): void {
    const map = mapInstance.value;
    if (!map || !boundsVal) {
      cameraStatus.value = BoundsStatus.Error;
      return;
    }

    cameraStatus.value = BoundsStatus.Setting;
    try {
      bbox.value = boundsVal;
      if (options) cameraOptions.value = options;
      map.cameraForBounds(boundsVal, cameraOptions.value);
      cameraStatus.value = BoundsStatus.Set;
    } catch (error) {
      cameraStatus.value = BoundsStatus.Error;
      log('Error setting camera for bounds:', error, { bounds: boundsVal });
    }
  }

  function clearCamera(): void {
    bbox.value = undefined;
    cameraStatus.value = BoundsStatus.NotSet;
  }

  watchEffect(() => {
    const map = mapInstance.value;
    if (map && bbox.value && cameraStatus.value !== BoundsStatus.Setting) {
      cameraForBounds(bbox.value, cameraOptions.value);
    }
  });

  return {
    cameraForBounds,
    clearCamera,
    getCurrentBounds,
    bbox: bbox.value,
    cameraStatus: cameraStatus.value as Readonly<BoundsStatus>,
    isCameraSet: isCameraSet.value,
  };
}
