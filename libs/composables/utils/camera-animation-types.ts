import type { Nullable } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, CameraOptions } from 'maplibre-gl';

/**
 * Shared animation status enum used by all camera animation composables
 */
export enum AnimationStatus {
  NotStarted = 'not-started',
  Running = 'running',
  Completed = 'completed',
  Error = 'error',
}

export interface CameraAnimationConfig {
  map: MaybeRef<Nullable<Map>>;
  debug?: boolean;
}

export interface CameraAnimationResult {
  /** Execute an animation on the map, resolving when the completion event fires */
  executeAnimation: (
    method: string,
    args: any[],
    completionEvent?: string,
    timeout?: number,
  ) => Promise<void>;
  /** Get current camera state */
  getCurrentCamera: () => CameraOptions | null;
  /** Stop any in-flight animation */
  stopAnimation: () => void;
  /** Current animation status */
  animationStatus: AnimationStatus;
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Resolved map instance (computed) */
  mapInstance: Map | null;
}
