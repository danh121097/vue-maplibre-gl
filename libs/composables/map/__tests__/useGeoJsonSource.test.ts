import { describe, it, expect, vi } from 'vitest';
import { computed, shallowRef } from 'vue';
import type { CreateGeoJsonSourceActions } from '@libs/composables';
import { withSetup } from '../../../test-utils';
import { useGeoJsonSource } from '../useGeoJsonSource';

const EMPTY_FC = { type: 'FeatureCollection', features: [] } as const;

describe('useGeoJsonSource', () => {
  it("hands back the registered source's setData promise", () => {
    const applied = Promise.resolve();
    const instance = {
      sourceId: 'registered',
      getSource: shallowRef(null),
      setData: vi.fn(() => applied),
      removeSource: vi.fn(),
      refreshSource: vi.fn(),
      sourceStatus: computed(() => 'created'),
      isSourceReady: computed(() => true),
    } as unknown as CreateGeoJsonSourceActions;

    const { register, setData } = withSetup(() => useGeoJsonSource());
    register(instance);

    expect(setData(EMPTY_FC as any)).toBe(applied);
    expect(instance.setData).toHaveBeenCalledWith(EMPTY_FC);
  });
});
