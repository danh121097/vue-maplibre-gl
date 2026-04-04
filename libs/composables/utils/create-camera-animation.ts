import { ref, computed, unref, onUnmounted } from 'vue';
import { useLogger } from '@libs/composables';
import {
  AnimationStatus,
  type CameraAnimationConfig,
  type CameraAnimationResult,
} from './camera-animation-types';
import type { CameraOptions } from 'maplibre-gl';

/**
 * Generic factory for creating camera animation composables.
 * Handles: map validation, promise wrapping, completion events, timeout, status tracking, cleanup.
 *
 * @param config - Camera animation configuration
 * @returns Shared animation utilities
 */
export function createCameraAnimation(
  config: CameraAnimationConfig,
): CameraAnimationResult {
  const { logError } = useLogger(config.debug ?? false);
  const animationStatus = ref<AnimationStatus>(AnimationStatus.NotStarted);

  const mapInstance = computed(() => unref(config.map));
  const isAnimating = computed(() => animationStatus.value === AnimationStatus.Running);

  /**
   * Execute a map camera method, wrapping it in a Promise that resolves on a completion event.
   *
   * @param method - Map method name to call (e.g., 'flyTo', 'easeTo', 'zoomTo')
   * @param args - Arguments to pass to the map method
   * @param completionEvent - Event to listen for completion (e.g., 'moveend', 'zoomend'). If omitted, resolves immediately (instant operations like jumpTo).
   * @param timeout - Optional timeout in ms. On timeout: calls map.stop(), cleans up listener, rejects. Default: no timeout (backward compat).
   */
  function executeAnimation(
    method: string,
    args: any[],
    completionEvent?: string,
    timeout?: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const map = mapInstance.value;
      if (!map) {
        reject(new Error('Map instance not available'));
        return;
      }

      animationStatus.value = AnimationStatus.Running;

      try {
        // No completion event = instant operation (e.g., jumpTo)
        if (!completionEvent) {
          (map as any)[method](...args);
          animationStatus.value = AnimationStatus.Completed;
          resolve();
          return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          map.off(completionEvent as any, onComplete);
          map.off('error', onError);
        };

        const onComplete = () => {
          cleanup();
          animationStatus.value = AnimationStatus.Completed;
          resolve();
        };

        const onError = (error: any) => {
          cleanup();
          animationStatus.value = AnimationStatus.Error;
          reject(error);
        };

        map.once(completionEvent as any, onComplete);
        map.once('error', onError);

        // Opt-in timeout — RT-6: call map.stop() before rejecting
        if (timeout && timeout > 0) {
          timeoutId = setTimeout(() => {
            try {
              map.stop();
            } catch {
              // map may be destroyed
            }
            cleanup();
            animationStatus.value = AnimationStatus.Error;
            reject(new Error(`Animation timed out after ${timeout}ms`));
          }, timeout);
        }

        // Call the map method
        (map as any)[method](...args);
      } catch (error) {
        animationStatus.value = AnimationStatus.Error;
        logError(`Error executing ${method} animation:`, error);
        reject(error);
      }
    });
  }

  function getCurrentCamera(): CameraOptions | null {
    const map = mapInstance.value;
    if (!map) return null;
    try {
      return {
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      };
    } catch (error) {
      logError('Error getting current camera state:', error);
      return null;
    }
  }

  function stopAnimation(): void {
    const map = mapInstance.value;
    if (!map) return;
    try {
      map.stop();
      animationStatus.value = AnimationStatus.Completed;
    } catch (error) {
      logError('Error stopping animation:', error);
    }
  }

  onUnmounted(() => {
    stopAnimation();
    animationStatus.value = AnimationStatus.NotStarted;
  });

  return {
    executeAnimation,
    getCurrentCamera,
    stopAnimation,
    animationStatus: animationStatus.value as AnimationStatus,
    isAnimating: isAnimating.value,
    mapInstance: mapInstance.value,
  };
}
