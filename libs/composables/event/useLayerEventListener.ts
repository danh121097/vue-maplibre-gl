import { unref, computed } from 'vue';
import { hasLayer } from '@libs/helpers';
import {
  createEventListenerComposable,
  EventListenerStatus as BaseStatus,
  type EventListenerActions,
} from './create-event-listener-composable';
import type { Nullable } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, MapLayerEventType, LayerSpecification } from 'maplibre-gl';

// Re-export with original name for backward compatibility
export { BaseStatus as LayerEventListenerStatus };

interface LayerEventListenerProps<T extends keyof MapLayerEventType> {
  map: MaybeRef<Nullable<Map>>;
  layer: MaybeRef<Nullable<LayerSpecification | string>>;
  event: keyof MapLayerEventType;
  on: (e: MapLayerEventType[T]) => void;
  debug?: boolean;
  once?: boolean;
}

interface LayerEventListenerActions extends EventListenerActions {
  layerId: string | null;
}

/**
 * Composable for managing MapLibre GL Layer Event Listeners
 * Uses 3-arg form: map.on(event, layerId, handler)
 */
export function useLayerEventListener<T extends keyof MapLayerEventType>(
  props: LayerEventListenerProps<T>,
): LayerEventListenerActions {
  const layerInstance = computed(() => unref(props.layer));
  const layerId = computed(() => {
    const layer = layerInstance.value;
    return layer ? (typeof layer === 'string' ? layer : layer.id) : null;
  });

  const result = createEventListenerComposable<Map>({
    target: props.map,
    event: props.event as string,
    on: props.on,
    debug: props.debug,
    once: props.once,
    // Re-evaluate when layer changes
    extraDeps: () => [layerInstance.value],
    adapter: {
      attach: (map, event, handler) => {
        const id = layerId.value;
        if (id) map.on(event as T, id, handler as any);
      },
      detach: (map, event, handler) => {
        const id = layerId.value;
        if (id) map.off(event as T, id, handler as any);
      },
      validate: (map) => {
        const id = layerId.value;
        return !!id && hasLayer(map, id);
      },
    },
  });

  return {
    ...result,
    layerId: layerId.value,
  };
}
