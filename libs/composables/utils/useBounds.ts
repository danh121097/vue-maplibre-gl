import { watch, ref, computed, unref } from 'vue';
import { useLogger } from '@libs/composables';
import type { Nullable, Undefinedable } from '@libs/types';
import type { ComputedRef, MaybeRef } from 'vue';
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
  setFitBounds: (
    boundsVal: LngLatBoundsLike,
    options?: FitBoundsOptions,
  ) => void;
  clearBounds: () => void;
  getCurrentBounds: () => LngLatBounds | null;
  bounds: ComputedRef<LngLatBoundsLike | undefined>;
  boundsStatus: ComputedRef<BoundsStatus>;
  isBoundsSet: ComputedRef<boolean>;
}

interface CameraForBoundsProps {
  map: MaybeRef<Nullable<Map>>;
  options?: CameraForBoundsOptions & { bounds?: LngLatBoundsLike };
  debug?: boolean;
}

interface CameraForBoundsActions {
  cameraForBounds: (
    boundsVal: LngLatBoundsLike,
    options?: CameraForBoundsOptions,
  ) => void;
  clearCamera: () => void;
  getCurrentBounds: () => LngLatBounds | null;
  bbox: ComputedRef<LngLatBoundsLike | undefined>;
  cameraStatus: ComputedRef<BoundsStatus>;
  isCameraSet: ComputedRef<boolean>;
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
    try {
      return map.getBounds();
    } catch (error) {
      logError('Error getting current bounds:', error);
      return null;
    }
  }

  function setFitBounds(
    boundsVal: LngLatBoundsLike,
    options?: FitBoundsOptions,
  ): void {
    const map = mapInstance.value;
    if (!map || !boundsVal) {
      boundsStatus.value = BoundsStatus.Error;
      return;
    }
    if (
      Array.isArray(boundsVal) &&
      boundsVal.length !== 4 &&
      boundsVal.length !== 2
    ) {
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

  // Re-fit when the map is replaced. `bounds` is only written after a
  // successful fit against a live map, so there is never a pending value
  // waiting for the first map — this is the replacement path only.
  //
  // A `watch` on the map, not a `watchEffect`: the body read `boundsStatus`,
  // which `setFitBounds` writes, so the effect was its own dependency and
  // re-fitted after every manual call.
  watch(
    mapInstance,
    (map) => {
      if (map && bounds.value && boundsStatus.value !== BoundsStatus.Setting) {
        setFitBounds(bounds.value, boundsOptions.value);
      }
    },
    { immediate: true },
  );

  return {
    setFitBounds,
    clearBounds,
    getCurrentBounds,
    bounds: computed(() => bounds.value),
    boundsStatus: computed(() => boundsStatus.value),
    isBoundsSet,
  };
}

/**
 * Composable for managing camera positioning for bounds
 */
export function useCameraForBounds(
  props: CameraForBoundsProps,
): CameraForBoundsActions {
  const { log } = useLogger(props.debug ?? false);
  const bbox = ref<LngLatBoundsLike | undefined>(props.options?.bounds);
  const cameraOptions = ref<Undefinedable<CameraForBoundsOptions>>(
    props.options,
  );
  const cameraStatus = ref<BoundsStatus>(BoundsStatus.NotSet);

  const mapInstance = computed(() => unref(props.map));
  const isCameraSet = computed(() => cameraStatus.value === BoundsStatus.Set);

  function getCurrentBounds(): LngLatBounds | null {
    const map = mapInstance.value;
    if (!map) return null;
    try {
      return map.getBounds();
    } catch (error) {
      log('Error getting current bounds:', error);
      return null;
    }
  }

  function cameraForBounds(
    boundsVal: LngLatBoundsLike,
    options?: CameraForBoundsOptions,
  ): void {
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

  // Re-apply the pending camera bounds when a map instance arrives. See the
  // note in `useFitBounds` — `cameraForBounds` writes the status this reads.
  watch(
    mapInstance,
    (map) => {
      if (map && bbox.value && cameraStatus.value !== BoundsStatus.Setting) {
        cameraForBounds(bbox.value, cameraOptions.value);
      }
    },
    { immediate: true },
  );

  return {
    cameraForBounds,
    clearCamera,
    getCurrentBounds,
    bbox: computed(() => bbox.value),
    cameraStatus: computed(() => cameraStatus.value),
    isCameraSet,
  };
}
