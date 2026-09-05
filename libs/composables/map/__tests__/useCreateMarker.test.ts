import { describe, it, expect } from 'vitest';
import { nextTick, ref, shallowRef } from 'vue';
import { Marker } from 'maplibre-gl';
import type { Map } from 'maplibre-gl';
import { withSetup } from '../../../test-utils';
import { MockMap } from '../../../__tests__/mock-maplibre';
import { useCreateMarker, MarkerStatus } from '../useCreateMarker';

describe('useCreateMarker reactivity contract', () => {
  it('exposes the marker once a map becomes available', async () => {
    const map = shallowRef<Map | null>(null);

    // autoAdd is off so the assertion targets creation, not MapLibre's
    // DOM/WebGL attachment path
    const { marker, markerStatus, isMarkerCreated } = withSetup(() =>
      useCreateMarker({ map, lnglat: [10, 20], autoAdd: false }),
    );

    expect(marker.value).toBeNull();
    expect(isMarkerCreated.value).toBe(false);
    expect(markerStatus.value).toBe(MarkerStatus.NotCreated);

    map.value = new MockMap() as unknown as Map;
    await nextTick();

    expect(marker.value).toBeInstanceOf(Marker);
    expect(isMarkerCreated.value).toBe(true);
    expect(markerStatus.value).toBe(MarkerStatus.Created);
  });

  it('rebuilds the marker on the new map when the map is replaced', async () => {
    const map = shallowRef<Map | null>(new MockMap() as unknown as Map);

    const { marker, markerStatus } = withSetup(() =>
      useCreateMarker({ map, lnglat: [10, 20], autoAdd: false }),
    );

    const first = marker.value;
    expect(first).toBeInstanceOf(Marker);

    map.value = new MockMap() as unknown as Map;
    await nextTick();

    expect(marker.value).toBeInstanceOf(Marker);
    expect(marker.value).not.toBe(first);
    expect(markerStatus.value).toBe(MarkerStatus.Created);
  });

  it('clears the marker again when the map goes away', async () => {
    const map = shallowRef<Map | null>(new MockMap() as unknown as Map);

    const { marker, isMarkerCreated } = withSetup(() =>
      useCreateMarker({ map, lnglat: [10, 20], autoAdd: false }),
    );

    expect(isMarkerCreated.value).toBe(true);

    map.value = null;
    await nextTick();

    expect(marker.value).toBeNull();
    expect(isMarkerCreated.value).toBe(false);
  });

  it('rebuilds with the custom element when a template ref resolves late', async () => {
    const map = shallowRef(new MockMap() as unknown as Map);
    const el = ref<HTMLElement | undefined>(undefined);

    const { marker } = withSetup(() =>
      useCreateMarker({ map, el, autoAdd: false }),
    );

    // The map is present at setup, so the marker is built with MapLibre's
    // default pin. A template ref is undefined until the component mounts.
    expect(marker.value?.getElement().id).toBe('');

    const custom = document.createElement('div');
    custom.id = 'custom-pin';
    el.value = custom;
    await nextTick();

    expect(marker.value?.getElement().id).toBe('custom-pin');
  });
});
