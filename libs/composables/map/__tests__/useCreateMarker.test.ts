import { describe, it, expect } from 'vitest';
import { nextTick, shallowRef } from 'vue';
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
});
