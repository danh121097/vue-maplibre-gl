import { useLogger } from '@libs/composables';
import {
  clearPrewarmedResources,
  prewarm,
  setMaxParallelImageRequests,
  setWorkerCount,
} from 'maplibre-gl';
import { onUnmounted } from 'vue';

/**
 * Configuration options for MapLibre GL performance optimization
 */
export interface MaplibreConfigOptions {
  /** Number of web workers for tile loading (default: 4) */
  workerCount?: number;
  /** Maximum parallel image requests (default: 16) */
  maxParallelImageRequests?: number;
  /** Whether to prewarm MapLibre resources on initialization (default: true) */
  prewarmResources?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Actions returned by useMaplibreConfig
 */
export interface MaplibreConfigActions {
  /** Clears prewarmed resources - call on app unmount to release memory */
  clearPrewarmedResources: () => void;
}

/**
 * Composable for configuring MapLibre GL global performance settings.
 *
 * This should be called once at the application level (e.g., in App.vue or main.ts)
 * to optimize MapLibre performance across all map instances.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMaplibreConfig } from 'vue3-maplibre-gl';
 *
 * // Initialize MapLibre with optimized settings
 * useMaplibreConfig({
 *   workerCount: 4,
 *   maxParallelImageRequests: 16,
 *   prewarmResources: true,
 * });
 * </script>
 * ```
 *
 * @param options - Configuration options for MapLibre performance
 * @returns Actions for managing MapLibre configuration
 */
export function useMaplibreConfig(
  options: MaplibreConfigOptions = {},
): MaplibreConfigActions {
  const {
    workerCount = 4,
    maxParallelImageRequests = 16,
    prewarmResources = true,
    debug = false,
  } = options;

  const { log, logError } = useLogger(debug);

  try {
    // Configure web worker count for parallel tile loading
    setWorkerCount(workerCount);
    log('MapLibre worker count set to:', workerCount);

    // Configure maximum parallel image requests
    setMaxParallelImageRequests(maxParallelImageRequests);
    log(
      'MapLibre max parallel image requests set to:',
      maxParallelImageRequests,
    );

    // Prewarm MapLibre resources for faster initial map render
    if (prewarmResources) {
      prewarm();
      log('MapLibre resources prewarmed');
    }
  } catch (error) {
    logError('Error configuring MapLibre:', error);
  }

  // Cleanup prewarmed resources on unmount
  onUnmounted(() => {
    try {
      clearPrewarmedResources();
      log('MapLibre prewarmed resources cleared');
    } catch (error) {
      logError('Error clearing prewarmed resources:', error);
    }
  });

  return {
    clearPrewarmedResources,
  };
}
