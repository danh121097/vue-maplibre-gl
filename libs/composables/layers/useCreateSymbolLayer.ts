import { computed } from 'vue';
import { useCreateLayer, useLogger } from '@libs/composables';
import { filterStylePropertiesByKeys } from '@libs/helpers';
import { LAYER_STYLE_CONFIG } from './layer-style-config';
import { createSetStyle, createSetVisibility, createPropertySetter } from './create-layer-property-setters';
import type { CreateLayerActions, Nullable, SymbolLayerStyle } from '@libs/types';
import type { MaybeRef } from 'vue';
import type { Map, SourceSpecification, FilterSpecification, SymbolLayerSpecification, StyleSetterOptions } from 'maplibre-gl';

type Layer = SymbolLayerSpecification;
const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.symbol;

interface CreateSymbolLayerProps {
  map: MaybeRef<Nullable<Map>>;
  source: MaybeRef<string | SourceSpecification | object | null>;
  id?: string;
  beforeId?: string;
  filter?: FilterSpecification;
  style?: SymbolLayerStyle;
  maxzoom?: number;
  minzoom?: number;
  metadata?: object;
  sourceLayer?: string;
  debug?: boolean;
  register?: (actions: CreateLayerActions<Layer>, map: Map) => void;
}

interface SymbolLayerActions extends CreateLayerActions<Layer> {
  setStyle: (styleVal?: SymbolLayerStyle) => void;
  setIconOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setIconColor: (color: string, options?: StyleSetterOptions) => void;
  setIconHaloColor: (color: string, options?: StyleSetterOptions) => void;
  setIconHaloWidth: (width: number, options?: StyleSetterOptions) => void;
  setIconHaloBlur: (blur: number, options?: StyleSetterOptions) => void;
  setIconImage: (image: string, options?: StyleSetterOptions) => void;
  setIconSize: (size: number | string, options?: StyleSetterOptions) => void;
  setIconRotate: (rotation: number, options?: StyleSetterOptions) => void;
  setIconOffset: (offset: [number, number], options?: StyleSetterOptions) => void;
  setIconAnchor: (anchor: string, options?: StyleSetterOptions) => void;
  setTextOpacity: (opacity: number, options?: StyleSetterOptions) => void;
  setTextColor: (color: string, options?: StyleSetterOptions) => void;
  setTextHaloColor: (color: string, options?: StyleSetterOptions) => void;
  setTextHaloWidth: (width: number, options?: StyleSetterOptions) => void;
  setTextHaloBlur: (blur: number, options?: StyleSetterOptions) => void;
  setTextField: (field: string, options?: StyleSetterOptions) => void;
  setTextFont: (font: string[], options?: StyleSetterOptions) => void;
  setTextSize: (size: number | string, options?: StyleSetterOptions) => void;
  setTextRotate: (rotation: number, options?: StyleSetterOptions) => void;
  setTextOffset: (offset: [number, number], options?: StyleSetterOptions) => void;
  setTextAnchor: (anchor: string, options?: StyleSetterOptions) => void;
  setVisibility: (visibility: 'visible' | 'none', options?: StyleSetterOptions) => void;
  setSortKey: (sortKey: number, options?: StyleSetterOptions) => void;
}

export function useCreateSymbolLayer(props: CreateSymbolLayerProps): SymbolLayerActions {
  const { logError } = useLogger(props.debug ?? false);

  const styleConfig = computed(() => {
    const style = props.style || {};
    return {
      paint: filterStylePropertiesByKeys(style, paintKeys as any),
      layout: filterStylePropertiesByKeys(style, layoutKeys as any),
    };
  });

  const { setLayoutProperty, setPaintProperty, ...actions } = useCreateLayer<Layer>({
    map: props.map, source: props.source, type: 'symbol', id: props.id,
    beforeId: props.beforeId, filter: props.filter,
    layout: styleConfig.value.layout as any, paint: styleConfig.value.paint as any,
    maxzoom: props.maxzoom, minzoom: props.minzoom, metadata: props.metadata,
    sourceLayer: props.sourceLayer, debug: props.debug,
    register: (actions, map) => {
      props.register?.({
        ...actions, setStyle, setIconOpacity, setIconColor, setIconHaloColor,
        setIconHaloWidth, setIconHaloBlur, setIconImage, setIconSize, setIconRotate,
        setIconOffset, setIconAnchor, setTextOpacity, setTextColor, setTextHaloColor,
        setTextHaloWidth, setTextHaloBlur, setTextField, setTextFont, setTextSize,
        setTextRotate, setTextOffset, setTextAnchor, setVisibility, setSortKey,
      } as SymbolLayerActions, map);
    },
  });

  const setStyle = createSetStyle<SymbolLayerStyle>(setPaintProperty, setLayoutProperty, paintKeys, layoutKeys, logError);
  const setVisibility = createSetVisibility(setLayoutProperty, logError);

  // Icon paint properties
  const setIconOpacity = createPropertySetter<number>(setPaintProperty, 'icon-opacity', logError);
  const setIconColor = createPropertySetter<string>(setPaintProperty, 'icon-color', logError);
  const setIconHaloColor = createPropertySetter<string>(setPaintProperty, 'icon-halo-color', logError);
  const setIconHaloWidth = createPropertySetter<number>(setPaintProperty, 'icon-halo-width', logError);
  const setIconHaloBlur = createPropertySetter<number>(setPaintProperty, 'icon-halo-blur', logError);

  // Icon layout properties
  const setIconImage = createPropertySetter<string>(setLayoutProperty, 'icon-image', logError);
  const setIconSize = createPropertySetter<number | string>(setLayoutProperty, 'icon-size', logError);
  const setIconRotate = createPropertySetter<number>(setLayoutProperty, 'icon-rotate', logError);
  const setIconOffset = createPropertySetter<[number, number]>(setLayoutProperty, 'icon-offset', logError);
  const setIconAnchor = createPropertySetter<string>(setLayoutProperty, 'icon-anchor', logError);

  // Text paint properties
  const setTextOpacity = createPropertySetter<number>(setPaintProperty, 'text-opacity', logError);
  const setTextColor = createPropertySetter<string>(setPaintProperty, 'text-color', logError);
  const setTextHaloColor = createPropertySetter<string>(setPaintProperty, 'text-halo-color', logError);
  const setTextHaloWidth = createPropertySetter<number>(setPaintProperty, 'text-halo-width', logError);
  const setTextHaloBlur = createPropertySetter<number>(setPaintProperty, 'text-halo-blur', logError);

  // Text layout properties
  const setTextField = createPropertySetter<string>(setLayoutProperty, 'text-field', logError);
  const setTextFont = createPropertySetter<string[]>(setLayoutProperty, 'text-font', logError);
  const setTextSize = createPropertySetter<number | string>(setLayoutProperty, 'text-size', logError);
  const setTextRotate = createPropertySetter<number>(setLayoutProperty, 'text-rotate', logError);
  const setTextOffset = createPropertySetter<[number, number]>(setLayoutProperty, 'text-offset', logError);
  const setTextAnchor = createPropertySetter<string>(setLayoutProperty, 'text-anchor', logError);

  // Common
  const setSortKey = createPropertySetter<number>(setLayoutProperty, 'symbol-sort-key', logError);

  return {
    ...actions, setStyle, setLayoutProperty, setPaintProperty,
    setIconOpacity, setIconColor, setIconHaloColor, setIconHaloWidth, setIconHaloBlur,
    setIconImage, setIconSize, setIconRotate, setIconOffset, setIconAnchor,
    setTextOpacity, setTextColor, setTextHaloColor, setTextHaloWidth, setTextHaloBlur,
    setTextField, setTextFont, setTextSize, setTextRotate, setTextOffset, setTextAnchor,
    setVisibility, setSortKey,
  };
}
