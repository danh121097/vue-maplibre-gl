import { computed } from 'vue';
import { useCreateLayer, useLogger } from '@libs/composables';
import { filterStylePropertiesByKeys } from '@libs/helpers';
import { LAYER_STYLE_CONFIG } from './layer-style-config';
import { createSetStyle, createSetVisibility, createPropertySetter } from './create-layer-property-setters';
import type { CreateLayerActions, Nullable, LineLayerStyle } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, SourceSpecification, FilterSpecification, LineLayerSpecification, StyleSetterOptions } from 'maplibre-gl';

type Layer = LineLayerSpecification;
const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.line;

interface CreateLineLayerProps {
  map: MaybeRef<Nullable<Map>>;
  source: MaybeRef<string | SourceSpecification | object | null>;
  id?: string;
  beforeId?: string;
  filter?: FilterSpecification;
  style?: LineLayerStyle;
  maxzoom?: number;
  minzoom?: number;
  metadata?: object;
  sourceLayer?: string;
  debug?: boolean;
  register?: (actions: CreateLayerActions<Layer>, map: Map) => void;
}

interface LineLayerActions extends CreateLayerActions<Layer> {
  setStyle: (styleVal?: LineLayerStyle) => void;
  setOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setColor: (color: string, options?: StyleSetterOptions) => void;
  setWidth: (width: number | string, options?: StyleSetterOptions) => void;
  setGapWidth: (gapWidth: number, options?: StyleSetterOptions) => void;
  setOffset: (offset: number, options?: StyleSetterOptions) => void;
  setBlur: (blur: number, options?: StyleSetterOptions) => void;
  setDashArray: (dashArray: number[], options?: StyleSetterOptions) => void;
  setPattern: (pattern: string, options?: StyleSetterOptions) => void;
  setGradient: (gradient: string, options?: StyleSetterOptions) => void;
  setCap: (cap: 'butt' | 'round' | 'square', options?: StyleSetterOptions) => void;
  setJoin: (join: 'bevel' | 'round' | 'miter', options?: StyleSetterOptions) => void;
  setVisibility: (visibility: 'visible' | 'none', options?: StyleSetterOptions) => void;
  setSortKey: (sortKey: number, options?: StyleSetterOptions) => void;
}

export function useCreateLineLayer(props: CreateLineLayerProps): LineLayerActions {
  const { logError } = useLogger(props.debug ?? false);

  const styleConfig = computed(() => {
    const style = props.style || {};
    return {
      paint: filterStylePropertiesByKeys(style, paintKeys as any),
      layout: filterStylePropertiesByKeys(style, layoutKeys as any),
    };
  });

  const { setLayoutProperty, setPaintProperty, ...actions } = useCreateLayer<Layer>({
    map: props.map, source: props.source, type: 'line', id: props.id,
    beforeId: props.beforeId, filter: props.filter,
    layout: styleConfig.value.layout as any, paint: styleConfig.value.paint as any,
    maxzoom: props.maxzoom, minzoom: props.minzoom, metadata: props.metadata,
    sourceLayer: props.sourceLayer, debug: props.debug,
    register: (actions, map) => {
      props.register?.({ ...actions, setStyle, setOpacity, setColor, setWidth, setGapWidth, setOffset, setBlur, setDashArray, setPattern, setGradient, setCap, setJoin, setVisibility, setSortKey } as LineLayerActions, map);
    },
  });

  const setStyle = createSetStyle<LineLayerStyle>(setPaintProperty, setLayoutProperty, paintKeys, layoutKeys, logError);
  const setVisibility = createSetVisibility(setLayoutProperty, logError);
  const setOpacity = createPropertySetter<number>(setPaintProperty, 'line-opacity', logError);
  const setColor = createPropertySetter<string>(setPaintProperty, 'line-color', logError);
  const setWidth = createPropertySetter<number | string>(setPaintProperty, 'line-width', logError);
  const setGapWidth = createPropertySetter<number>(setPaintProperty, 'line-gap-width', logError);
  const setOffset = createPropertySetter<number>(setPaintProperty, 'line-offset', logError);
  const setBlur = createPropertySetter<number>(setPaintProperty, 'line-blur', logError);
  const setDashArray = createPropertySetter<number[]>(setPaintProperty, 'line-dasharray', logError);
  const setPattern = createPropertySetter<string>(setPaintProperty, 'line-pattern', logError);
  const setGradient = createPropertySetter<string>(setPaintProperty, 'line-gradient', logError);
  const setCap = createPropertySetter<'butt' | 'round' | 'square'>(setLayoutProperty, 'line-cap', logError);
  const setJoin = createPropertySetter<'bevel' | 'round' | 'miter'>(setLayoutProperty, 'line-join', logError);
  const setSortKey = createPropertySetter<number>(setLayoutProperty, 'line-sort-key', logError);

  return { ...actions, setStyle, setLayoutProperty, setPaintProperty, setOpacity, setColor, setWidth, setGapWidth, setOffset, setBlur, setDashArray, setPattern, setGradient, setCap, setJoin, setVisibility, setSortKey };
}
