import { computed } from 'vue';
import { useCreateLayer, useLogger } from '@libs/composables';
import { filterStylePropertiesByKeys } from '@libs/helpers';
import { LAYER_STYLE_CONFIG } from './layerStyleConfig';
import { createSetStyle, createSetVisibility, createPropertySetter } from './createLayerPropertySetters';
import type { CreateLayerActions, Nullable, FillLayerStyle } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, SourceSpecification, FilterSpecification, FillLayerSpecification, StyleSetterOptions } from 'maplibre-gl';

type Layer = FillLayerSpecification;
const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.fill;

interface CreateFillLayerProps {
  map: MaybeRef<Nullable<Map>>;
  source: MaybeRef<string | SourceSpecification | object | null>;
  id?: string;
  beforeId?: string;
  filter?: FilterSpecification;
  style?: FillLayerStyle;
  maxzoom?: number;
  minzoom?: number;
  metadata?: object;
  sourceLayer?: string;
  debug?: boolean;
  register?: (actions: CreateLayerActions<Layer>, map: Map) => void;
}

interface FillLayerActions extends CreateLayerActions<Layer> {
  setStyle: (styleVal?: FillLayerStyle) => void;
  setOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setColor: (color: string, options?: StyleSetterOptions) => void;
  setOutlineColor: (color: string, options?: StyleSetterOptions) => void;
  setPattern: (pattern: string, options?: StyleSetterOptions) => void;
  setAntialias: (antialias: boolean, options?: StyleSetterOptions) => void;
  setVisibility: (visibility: 'visible' | 'none', options?: StyleSetterOptions) => void;
  setSortKey: (sortKey: number, options?: StyleSetterOptions) => void;
}

export function useCreateFillLayer(props: CreateFillLayerProps): FillLayerActions {
  const { logError } = useLogger(props.debug ?? false);

  const styleConfig = computed(() => {
    const style = props.style || {};
    return {
      paint: filterStylePropertiesByKeys(style, paintKeys as any),
      layout: filterStylePropertiesByKeys(style, layoutKeys as any),
    };
  });

  const { setLayoutProperty, setPaintProperty, ...actions } = useCreateLayer<Layer>({
    map: props.map, source: props.source, type: 'fill', id: props.id,
    beforeId: props.beforeId, filter: props.filter,
    layout: styleConfig.value.layout as any, paint: styleConfig.value.paint as any,
    maxzoom: props.maxzoom, minzoom: props.minzoom, metadata: props.metadata,
    sourceLayer: props.sourceLayer, debug: props.debug,
    register: (actions, map) => {
      props.register?.({ ...actions, setStyle, setOpacity, setColor, setOutlineColor, setPattern, setAntialias, setVisibility, setSortKey } as FillLayerActions, map);
    },
  });

  const setStyle = createSetStyle<FillLayerStyle>(setPaintProperty, setLayoutProperty, paintKeys, layoutKeys, logError);
  const setVisibility = createSetVisibility(setLayoutProperty, logError);
  const setOpacity = createPropertySetter<number>(setPaintProperty, 'fill-opacity', logError);
  const setColor = createPropertySetter<string>(setPaintProperty, 'fill-color', logError);
  const setOutlineColor = createPropertySetter<string>(setPaintProperty, 'fill-outline-color', logError);
  const setPattern = createPropertySetter<string>(setPaintProperty, 'fill-pattern', logError);
  const setAntialias = createPropertySetter<boolean>(setPaintProperty, 'fill-antialias', logError);
  const setSortKey = createPropertySetter<number>(setLayoutProperty, 'fill-sort-key', logError);

  return { ...actions, setStyle, setLayoutProperty, setPaintProperty, setOpacity, setColor, setOutlineColor, setPattern, setAntialias, setVisibility, setSortKey };
}
