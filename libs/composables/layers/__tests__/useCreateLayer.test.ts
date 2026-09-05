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

describe('useCreateLayer source resolution', () => {
  it('accepts an object that carries the source id', async () => {
    const map = new MockMap();
    map.addSource('object-source', { type: 'geojson' });

    const { layerStatus } = withSetup(() =>
      useCreateLayer<FillLayerSpecification>({
        map: shallowRef(map as unknown as Map),
        id: 'object-layer',
        source: shallowRef({ id: 'object-source' }),
        type: 'fill',
      }),
    );

    map.fire('load', { type: 'load', target: map });
    await nextTick();

    expect(map.layerIds()).toContain('object-layer');
    expect(layerStatus.value).toBe(LayerStatus.Created);
  });

  it('errors on a bare source specification instead of adding a layer', async () => {
    const map = new MockMap();

    // A layer references its source by id. An inline specification carries no
    // id, so it used to resolve to '' — which then failed the source-exists
    // check with a message naming an empty source. Fail on the real cause.
    const { layerStatus } = withSetup(() =>
      useCreateLayer<FillLayerSpecification>({
        map: shallowRef(map as unknown as Map),
        id: 'spec-layer',
        source: shallowRef({
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        }),
        type: 'fill',
      }),
    );

    map.fire('load', { type: 'load', target: map });
    await nextTick();

    expect(layerStatus.value).toBe(LayerStatus.Error);
    expect(map.layerIds()).not.toContain('spec-layer');
  });

  it('errors when the named source is not on the map', async () => {
    const map = new MockMap();

    const { layerStatus } = withSetup(() =>
      useCreateLayer<FillLayerSpecification>({
        map: shallowRef(map as unknown as Map),
        id: 'orphan-layer',
        source: shallowRef('never-added'),
        type: 'fill',
      }),
    );

    map.fire('load', { type: 'load', target: map });
    await nextTick();

    expect(layerStatus.value).toBe(LayerStatus.Error);
    expect(map.layerIds()).not.toContain('orphan-layer');
  });
});
