import { describe, it, expect } from 'vitest';
import { nextTick, shallowRef } from 'vue';
import type { FillLayerSpecification, Map } from 'maplibre-gl';
import { withSetup } from '../../../test-utils';
import { MockMap } from '../../../__tests__/mock-maplibre';
import { useCreateLayer, LayerStatus } from '../useCreateLayer';

describe('useCreateLayer reactivity contract', () => {
  it('reports the layer as ready only once it is on the map', async () => {
    const map = new MockMap();
    map.addSource('test-source', { type: 'geojson' });

    const source = shallowRef<string | null>(null);
    const { layerStatus, isLayerReady, getLayer } = withSetup(() =>
      useCreateLayer<FillLayerSpecification>({
        map: shallowRef(map as unknown as Map),
        id: 'test-layer',
        source,
        type: 'fill',
      }),
    );

    expect(isLayerReady.value).toBe(false);
    expect(layerStatus.value).toBe(LayerStatus.NotCreated);
    expect(getLayer.value).toBeNull();

    source.value = 'test-source';
    await nextTick();

    expect(map.layerIds()).toContain('test-layer');
    expect(layerStatus.value).toBe(LayerStatus.Created);
    expect(isLayerReady.value).toBe(true);
    expect(getLayer.value).not.toBeNull();
  });

  it('clears the layer again when the source goes away', async () => {
    const map = new MockMap();
    map.addSource('test-source', { type: 'geojson' });

    const source = shallowRef<string | null>(null);
    const { isLayerReady } = withSetup(() =>
      useCreateLayer<FillLayerSpecification>({
        map: shallowRef(map as unknown as Map),
        id: 'removable-layer',
        source,
        type: 'fill',
      }),
    );

    source.value = 'test-source';
    await nextTick();
    expect(isLayerReady.value).toBe(true);

    source.value = null;
    await nextTick();

    expect(map.layerIds()).not.toContain('removable-layer');
    expect(isLayerReady.value).toBe(false);
  });
});
