import { onUnmounted, unref, watchEffect, computed, ref } from 'vue';
import { useLogger } from '@libs/composables';
import type { MaybeRef } from 'vue';
import type { Nullable } from '@libs/types';

/**
 * Shared event listener status enum used by all event listener composables
 */
export enum EventListenerStatus {
  NotAttached = 'not-attached',
  Attached = 'attached',
  Error = 'error',
}

/**
 * Adapter functions for attaching/detaching events on different target types
 */
export interface EventListenerAdapter<TTarget> {
  attach: (target: TTarget, event: string, handler: (...args: any[]) => void) => void;
  detach: (target: TTarget, event: string, handler: (...args: any[]) => void) => void;
  /** Optional validation before attaching (e.g., hasLayer check) */
  validate?: (target: TTarget) => boolean;
}

export interface EventListenerConfig<TTarget> {
  target: MaybeRef<Nullable<TTarget>>;
  event: string;
  on: (...args: any[]) => void;
  debug?: boolean;
  once?: boolean;
  adapter: EventListenerAdapter<TTarget>;
  /** Additional reactive dependencies that trigger re-evaluation */
  extraDeps?: () => any[];
}

export interface EventListenerActions {
  removeListener: () => void;
  attachListener: () => void;
  isListenerAttached: boolean;
  listenerStatus: Readonly<EventListenerStatus>;
}

/**
 * Generic factory for creating event listener composables.
 * Handles: status tracking, watchEffect lifecycle, onUnmounted cleanup, idempotent removal.
 *
 * @param config - Event listener configuration
 * @returns Actions and state for the event listener
 */
export function createEventListenerComposable<TTarget>(
  config: EventListenerConfig<TTarget>,
): EventListenerActions {
  const { logError } = useLogger(config.debug ?? false);
  const listenerStatus = ref<EventListenerStatus>(EventListenerStatus.NotAttached);

  const targetInstance = computed(() => unref(config.target));
  const isListenerAttached = computed(
    () => listenerStatus.value === EventListenerStatus.Attached,
  );

  // Event handler with error handling and once support
  const eventHandler = (...args: any[]): void => {
    try {
      if (config.on) config.on(...args);
      if (config.once) removeListener();
    } catch (error) {
      logError('Error in event handler:', error, { event: config.event });
      listenerStatus.value = EventListenerStatus.Error;
    }
  };

  /**
   * Attaches the event listener to the target (idempotent)
   */
  function attachListener(): void {
    const target = targetInstance.value;
    if (!target) return;
    if (listenerStatus.value === EventListenerStatus.Attached) return;

    // Run optional validation (e.g., layer exists)
    if (config.adapter.validate && !config.adapter.validate(target)) return;

    try {
      config.adapter.attach(target, config.event, eventHandler);
      listenerStatus.value = EventListenerStatus.Attached;
    } catch (error) {
      listenerStatus.value = EventListenerStatus.Error;
      logError('Error attaching event listener:', error, { event: config.event });
    }
  }

  /**
   * Removes the event listener from the target (idempotent - safe to call multiple times)
   */
  function removeListener(): void {
    const target = targetInstance.value;
    if (!target) return;
    if (listenerStatus.value === EventListenerStatus.NotAttached) return;

    try {
      config.adapter.detach(target, config.event, eventHandler);
    } catch {
      // Swallow errors on detach (target may be destroyed) — RT-7 idempotent cleanup
    }
    listenerStatus.value = EventListenerStatus.NotAttached;
  }

  // Watch target changes and manage listener lifecycle
  let lastTarget: any = null;
  const stopEffect = watchEffect((onCleanUp) => {
    const target = targetInstance.value;
    // Also read extra deps to trigger re-evaluation
    config.extraDeps?.();

    if (target === lastTarget) return;
    lastTarget = target;

    if (target && listenerStatus.value === EventListenerStatus.NotAttached) {
      attachListener();
    } else if (!target && listenerStatus.value === EventListenerStatus.Attached) {
      removeListener();
    }
    onCleanUp(removeListener);
  });

  function cleanup(): void {
    stopEffect();
    removeListener();
  }

  onUnmounted(cleanup);

  return {
    removeListener,
    attachListener,
    isListenerAttached: isListenerAttached.value,
    listenerStatus: listenerStatus.value as Readonly<EventListenerStatus>,
  };
}
