<script lang="ts" setup>
import {
  inject,
  ref,
  useSlots,
  useAttrs,
  watch,
  watchEffect,
  computed,
  shallowRef,
} from 'vue';
import { MapProvideKey } from '@libs/enums';
import { useCreatePopup } from '@libs/composables';
import { isBrowser, normalizeClassTokens } from '@libs/helpers';
import type { LngLatLike, PopupOptions } from 'maplibre-gl';

// The Teleport root can't inherit fallthrough attributes; we forward `class`
// onto the detached content element instead (see below).
defineOptions({ inheritAttrs: false });

/**
 * Props interface for Popup component
 * Defines all configurable properties for a MapLibre GL Popup
 */
interface PopupProps {
  /** CSS class name for the popup */
  className: string;
  /** Geographic coordinates for the popup */
  lnglat: LngLatLike;
  /** Whether the popup is visible */
  show: boolean;
  /** Whether to attach popup to the map */
  withMap: boolean;
  /** Popup configuration options */
  options: PopupOptions;
  /** HTML content for the popup */
  html: string;
  /** Maximum width of the popup */
  maxWidth?: string;
  /** Whether to show close button */
  closeButton?: boolean;
  /** Whether to close on map click */
  closeOnClick?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
}

/**
 * Events interface for Popup component
 * Defines all events that can be emitted by the popup
 */
interface Emits {
  /** Fired when popup is closed */
  (event: 'close'): void;
  /** Fired when popup is opened */
  (event: 'open'): void;
  /** Fired when show state changes (for v-model support) */
  (event: 'update:show', show: boolean): void;
}

// Component props with sensible defaults
const props = withDefaults(defineProps<Partial<PopupProps>>(), {
  show: true,
  withMap: true,
  closeButton: true,
  closeOnClick: true,
  closeOnEscape: true,
});

// Component events
const emits = defineEmits<Emits>();

// Slots for custom popup content
const slots = useSlots();

// Injected dependencies
const mapInstance = inject(MapProvideKey, shallowRef(null));
const popupElRef = ref<HTMLElement>();

if (Boolean(slots.default?.()) && isBrowser) {
  const contentEl = document.createElement('div');
  contentEl.className = 'maplibregl-popup-content-inner';
  popupElRef.value = contentEl;
}

// Forward the fallthrough `class` onto the detached content element (additively,
// preserving the base class above). Without this, classes passed to <Popup class>
// would be dropped because the Teleport root has no element to inherit them.
const attrs = useAttrs();
let forwardedClasses: string[] = [];
watchEffect(() => {
  const el = popupElRef.value;
  if (!el) return;
  const nextClasses: string[] = normalizeClassTokens(attrs.class);
  forwardedClasses
    .filter((token) => !nextClasses.includes(token))
    .forEach((token) => el.classList.remove(token));
  nextClasses.forEach((token) => el.classList.add(token));
  forwardedClasses = nextClasses;
});

// Computed properties for better performance
const popupOptions = computed(() => ({
  ...props.options,
  className: props.className,
  maxWidth: props.maxWidth,
  closeButton: props.closeButton,
  closeOnClick: props.closeOnClick,
  closeOnEscape: props.closeOnEscape,
}));

// Enhanced event handlers with error handling
const eventHandlers = {
  open: () => {
    emits('open');
    emits('update:show', true);
  },
  close: () => {
    emits('close');
    emits('update:show', false);
  },
};

// Create popup with optimized configuration
const { setLngLat, show, hide } = useCreatePopup({
  map: mapInstance,
  el: popupElRef,
  lnglat: props.lnglat,
  html: props.html,
  show: props.show,
  withMap: props.withMap,
  options: popupOptions.value,
  on: eventHandlers,
});

// Reactive watchers for prop changes with error handling
watch(
  () => props.show,
  (isShow) => {
    if (isShow) show();
    else hide();
  },
);

// Reference watch: pass a new coordinate value to move the popup. Mutating
// the existing `lnglat` array or object in place no longer triggers an update.
watch(
  () => props.lnglat,
  (newLnglat) => {
    if (newLnglat) {
      setLngLat(newLnglat);
    }
  },
);
</script>
<template>
  <Teleport v-if="popupElRef" :to="popupElRef">
    <slot />
  </Teleport>
</template>
