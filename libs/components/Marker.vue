<script lang="ts" setup>
import {
  computed,
  inject,
  onUpdated,
  ref,
  shallowRef,
  useAttrs,
  useSlots,
  watch,
} from 'vue';
import { MapProvideKey } from '@libs/enums';
import { useCreateMarker } from '@libs/composables';
import type { Anchor } from '@libs/types';
import type {
  LngLatLike,
  Alignment,
  PointLike,
  MarkerOptions,
  Popup,
} from 'maplibre-gl';

/**
 * Props interface for Marker component
 * Defines all configurable properties for a MapLibre GL Marker
 */
interface MarkerProps {
  /** Geographic coordinates for the marker */
  lnglat: LngLatLike;
  /** Popup to associate with the marker */
  popup: Popup;
  /** Marker configuration options */
  options: MarkerOptions;
  /** Whether the marker is draggable */
  draggable: boolean;
  /** Custom HTML element for the marker */
  element: HTMLElement | undefined;
  /** Offset from the marker's position */
  offset: PointLike | undefined;
  /** Anchor point for the marker */
  anchor: Anchor | undefined;
  /** Color of the default marker */
  color: string | undefined;
  /** Tolerance for click events */
  clickTolerance: number | undefined;
  /** Rotation angle in degrees */
  rotation: number | undefined;
  /** Rotation alignment relative to the map */
  rotationAlignment: Alignment | undefined;
  /** Pitch alignment relative to the map */
  pitchAlignment: Alignment | undefined;
  /** Scale factor for the marker */
  scale: number | undefined;
  /** Opacity when marker is occluded */
  occludedOpacity: number | undefined;
}

/**
 * Events interface for Marker component
 * Defines all events that can be emitted by the marker
 */
interface Emits {
  /** Fired when marker drag starts */
  (e: 'dragstart', ev: Event): void;
  /** Fired during marker drag */
  (e: 'drag', ev: Event): void;
  /** Fired when marker drag ends */
  (e: 'dragend', ev: Event): void;
}

defineOptions({
  inheritAttrs: false,
});

// Component props with sensible defaults
const props = withDefaults(defineProps<Partial<MarkerProps>>(), {
  options: () => ({}),
});

// Component events
const emits = defineEmits<Emits>();

// Slots for custom marker content
const slots = useSlots();
const attrs = useAttrs();

// Injected dependencies
const mapInstance = inject(MapProvideKey, shallowRef(null));
const markerElRef = ref<HTMLElement>();
const markerAttrNames = new Set<string>();

if (typeof document !== 'undefined') {
  markerElRef.value = document.createElement('div');
  syncMarkerAttrs();
}

// Computed properties for better performance
const hasCustomElement = computed(() => Boolean(slots.default));

const markerOptions = computed(() => ({
  ...props.options,
  ...(props.draggable !== undefined && { draggable: props.draggable }),
  ...(props.offset !== undefined && { offset: props.offset }),
  ...(props.anchor !== undefined && { anchor: props.anchor }),
  ...(props.color !== undefined && { color: props.color }),
  ...(props.clickTolerance !== undefined && {
    clickTolerance: props.clickTolerance,
  }),
  ...(props.rotation !== undefined && { rotation: props.rotation }),
  ...(props.rotationAlignment !== undefined && {
    rotationAlignment: props.rotationAlignment,
  }),
  ...(props.pitchAlignment !== undefined && {
    pitchAlignment: props.pitchAlignment,
  }),
  ...(props.scale !== undefined && { scale: props.scale }),
  ...(props.occludedOpacity !== undefined && {
    occludedOpacity: props.occludedOpacity,
  }),
}));

// Enhanced event handlers with error handling
const eventHandlers = {
  dragstart: (ev: Event) => {
    emits('dragstart', ev);
  },
  drag: (ev: Event) => {
    emits('drag', ev);
  },
  dragend: (ev: Event) => {
    emits('dragend', ev);
  },
};

function normalizeMarkerClass(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(normalizeMarkerClass).filter(Boolean).join(' ');
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(' ');
  }
  return '';
}

function syncMarkerAttrs() {
  const el = markerElRef.value;
  if (!el) return;

  markerAttrNames.forEach((name) => el.removeAttribute(name));
  markerAttrNames.clear();

  Object.entries(attrs).forEach(([name, value]) => {
    if (value == null || name.startsWith('on')) return;

    if (name === 'class') {
      el.className = normalizeMarkerClass(value);
      return;
    }

    if (name === 'style') {
      if (typeof value === 'string') el.setAttribute('style', value);
      return;
    }

    el.setAttribute(name, String(value));
    markerAttrNames.add(name);
  });
}

// Create marker with optimized configuration
const { setDraggable, setLngLat } = useCreateMarker({
  map: mapInstance,
  el: hasCustomElement.value ? markerElRef : undefined,
  lnglat: props.lnglat,
  popup: props.popup,
  options: markerOptions.value,
  on: eventHandlers,
});

// Reactive watchers for prop changes with error handling
watch(
  () => props.lnglat,
  (newLnglat) => {
    if (newLnglat) {
      setLngLat(newLnglat);
    }
  },
  { deep: true },
);

watch(
  () => props.draggable,
  (newDraggable) => {
    if (newDraggable !== undefined) {
      setDraggable(newDraggable);
    }
  },
);

onUpdated(syncMarkerAttrs);
</script>
<template>
  <Teleport v-if="markerElRef && hasCustomElement" :to="markerElRef">
    <slot />
  </Teleport>
</template>
