import { computed } from 'vue';
import { useCreateLayer, useLogger } from '@libs/composables';
import { filterStylePropertiesByKeys } from '@libs/helpers';
import { LAYER_STYLE_CONFIG } from './layerStyleConfig';
import { createSetStyle, createSetVisibility, createPropertySetter } from './createLayerPropertySetters';
import type { CreateLayerActions, Nullable, CircleLayerStyle } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, SourceSpecification, FilterSpecification, CircleLayerSpecification, StyleSetterOptions } from 'maplibre-gl';

type Layer = CircleLayerSpecification;
const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;

interface CreateCircleLayerProps {
  map: MaybeRef<Nullable<Map>>;
  source: MaybeRef<string | SourceSpecification | object | null>;
  id?: string;
  beforeId?: string;
  filter?: FilterSpecification;
  style?: CircleLayerStyle;
  maxzoom?: number;
  minzoom?: number;
  metadata?: object;
  sourceLayer?: string;
  debug?: boolean;
  register?: (actions: CreateLayerActions<Layer>, map: Map) => void;
}

interface CircleLayerActions extends CreateLayerActions<Layer> {
  setStyle: (styleVal?: CircleLayerStyle) => void;
  setRadius: (radius: number | string, options?: StyleSetterOptions) => void;
  setColor: (color: string, options?: StyleSetterOptions) => void;
  setOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setStrokeWidth: (width: number, options?: StyleSetterOptions) => void;
  setStrokeColor: (color: string, options?: StyleSetterOptions) => void;
  setStrokeOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setVisibility: (visibility: 'visible' | 'none', options?: StyleSetterOptions) => void;
}

export function useCreateCircleLayer(props: CreateCircleLayerProps): CircleLayerActions {
  const { logError } = useLogger(props.debug ?? false);

  const styleConfig = computed(() => {
    const style = props.style || {};
    return {
      paint: filterStylePropertiesByKeys(style, paintKeys as any),
      layout: filterStylePropertiesByKeys(style, layoutKeys as any),
    };
  });

  const { setLayoutProperty, setPaintProperty, ...actions } = useCreateLayer<Layer>({
    map: props.map, source: props.source, type: 'circle', id: props.id,
    beforeId: props.beforeId, filter: props.filter,
    layout: styleConfig.value.layout as any, paint: styleConfig.value.paint as any,
    maxzoom: props.maxzoom, minzoom: props.minzoom, metadata: props.metadata,
    sourceLayer: props.sourceLayer,
    register: (actions, map) => {
      props.register?.({ ...actions, setStyle, setRadius, setColor, setOpacity, setStrokeWidth, setStrokeColor, setStrokeOpacity, setVisibility } as CircleLayerActions, map);
    },
  });

  const setStyle = createSetStyle<CircleLayerStyle>(setPaintProperty, setLayoutProperty, paintKeys, layoutKeys, logError);
  const setVisibility = createSetVisibility(setLayoutProperty, logError);
  const setRadius = createPropertySetter<number | string>(setPaintProperty, 'circle-radius', logError);
  const setColor = createPropertySetter<string>(setPaintProperty, 'circle-color', logError);
  const setOpacity = createPropertySetter<number>(setPaintProperty, 'circle-opacity', logError);
  const setStrokeWidth = createPropertySetter<number>(setPaintProperty, 'circle-stroke-width', logError);
  const setStrokeColor = createPropertySetter<string>(setPaintProperty, 'circle-stroke-color', logError);
  const setStrokeOpacity = createPropertySetter<number>(setPaintProperty, 'circle-stroke-opacity', logError);

  return { ...actions, setStyle, setLayoutProperty, setPaintProperty, setRadius, setColor, setOpacity, setStrokeWidth, setStrokeColor, setStrokeOpacity, setVisibility };
}
