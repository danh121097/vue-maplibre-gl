import { describe, it, expect, vi } from 'vitest';
import { nextTick, shallowRef } from 'vue';
import type { Map } from 'maplibre-gl';
import { withSetup } from '../../../test-utils';
import { MockMap } from '../../../__tests__/mock-maplibre';
import {
  useCreateGeoJsonSource,
  SourceStatus,
} from '../useCreateGeoJsonSource';

const EMPTY_FC = { type: 'FeatureCollection', features: [] } as const;

/** Drives the map through the events that make a source reach `Created`. */
function settleSource(map: MockMap, sourceId: string) {
  map.fire('load');
  map.fire('sourcedata', { sourceId, isSourceLoaded: true });
}

describe('useCreateGeoJsonSource reactivity contract', () => {
  it('reports the source as ready only after it is added and loaded', async () => {
    const map = new MockMap();
    const { sourceId, sourceStatus, isSourceReady } = withSetup(() =>
      useCreateGeoJsonSource({
        map: shallowRef(map as unknown as Map),
        id: 'test-source',
        data: EMPTY_FC as any,
      }),
    );

    expect(isSourceReady.value).toBe(false);
    expect(sourceStatus.value).toBe(SourceStatus.NotCreated);

    settleSource(map, sourceId);
    await nextTick();

    expect(map.sourceIds()).toContain('test-source');
    expect(sourceStatus.value).toBe(SourceStatus.Created);
    expect(isSourceReady.value).toBe(true);
  });

  it('hands the register callback refs that reflect later state', async () => {
    const map = new MockMap();
    const register = vi.fn();

    const { sourceId } = withSetup(() =>
      useCreateGeoJsonSource({
        map: shallowRef(map as unknown as Map),
        id: 'registered-source',
        data: EMPTY_FC as any,
        register,
      }),
    );

    settleSource(map, sourceId);
    await nextTick();

    expect(register).toHaveBeenCalledTimes(1);
    const actions = register.mock.calls[0][0];
    expect(actions.isSourceReady.value).toBe(true);
    expect(actions.sourceStatus.value).toBe(SourceStatus.Created);
  });
});
