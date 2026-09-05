import { describe, it, expect, vi } from 'vitest';
import { nextTick, ref, shallowRef } from 'vue';
import { withSetup } from '../../../test-utils';
import { MapCreationStatus } from '@libs/enums';
import type { MockMap } from '../../../__tests__/mock-maplibre';

vi.mock('maplibre-gl', async (importOriginal) => {
  const { mockMaplibreModule } = await import(
    '../../../__tests__/mock-maplibre'
  );
  return mockMaplibreModule(importOriginal as () => Promise<any>);
});

const { useCreateMaplibre } = await import('../useCreateMaplibre');

function setupMap() {
  const el = shallowRef<HTMLElement | null>(null);
  const style = ref('https://example.test/style.json');
  const actions = withSetup(() => useCreateMaplibre(el, style, {}));
  return { el, actions };
}

describe('useCreateMaplibre reactivity contract', () => {
  it('exposes status as live refs, not values frozen at setup', async () => {
    const { el, actions } = setupMap();

    expect(actions.isMapReady.value).toBe(false);
    expect(actions.mapCreationStatus.value).toBe(
      MapCreationStatus.NotInitialized,
    );

    el.value = document.createElement('div');
    await nextTick();

    const map = actions.mapInstance.value as unknown as MockMap;
    expect(map).not.toBeNull();
    expect(actions.isMapLoading.value).toBe(true);
    expect(actions.isMapReady.value).toBe(false);

    map.fire('load');
    await nextTick();

    expect(actions.isMapReady.value).toBe(true);
    expect(actions.isMapLoading.value).toBe(false);
    expect(actions.mapCreationStatus.value).toBe(MapCreationStatus.Loaded);
  });

  it('flips hasMapError on the map error event', async () => {
    const { el, actions } = setupMap();

    el.value = document.createElement('div');
    await nextTick();

    expect(actions.hasMapError.value).toBe(false);

    (actions.mapInstance.value as unknown as MockMap).fire('error', {
      error: new Error('boom'),
    });
    await nextTick();

    expect(actions.hasMapError.value).toBe(true);
  });

  it('hands the register callback live refs', async () => {
    const el = shallowRef<HTMLElement | null>(null);
    const style = ref('https://example.test/style.json');
    const register = vi.fn();

    const actions = withSetup(() => useCreateMaplibre(el, style, { register }));

    expect(register).toHaveBeenCalledTimes(1);
    const registered = register.mock.calls[0][0];
    expect(registered.isMapReady.value).toBe(false);

    el.value = document.createElement('div');
    await nextTick();
    (actions.mapInstance.value as unknown as MockMap).fire('load');
    await nextTick();

    // The same object handed to register must reflect the new state
    expect(registered.isMapReady.value).toBe(true);
    expect(registered.mapCreationStatus.value).toBe(MapCreationStatus.Loaded);
  });
});
