import { describe, it, expect, vi, afterEach } from 'vitest';
import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
import type { App, Component, ComputedRef } from 'vue';
import type { MapOptions } from 'maplibre-gl';
import type { MockMap } from '../../__tests__/mock-maplibre';

vi.mock('maplibre-gl', async (importOriginal) => {
  const { mockMaplibreModule } = await import('../../__tests__/mock-maplibre');
  return mockMaplibreModule(importOriginal as () => Promise<any>);
});

// Cast to the base `Component` type: the SFC's own prop types expand
// `MapOptions` deeply enough to blow vue-tsc's instantiation budget in `h()`.
const Maplibre = (await import('../Maplibre.vue')).default as Component;

const STYLE = 'https://example.test/style.json';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
});

/**
 * Mounts `<Maplibre>` with reactive options and waits for the map to exist.
 * `@vue/test-utils` is not a dependency, so the app is driven directly.
 */
async function mountMaplibre(options: Partial<MapOptions>) {
  const props = reactive({ options });
  let map: ComputedRef<MockMap | null> | null = null;

  app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(Maplibre, {
            options: props.options,
            register: (actions: any) => {
              // `mapInstance` is a live ref, so it resolves once the map exists
              map = actions.mapInstance;
            },
          });
      },
    }),
  );
  app.mount(document.createElement('div'));

  // Container ref → map creation both settle on the microtask queue
  await nextTick();
  await nextTick();
  await nextTick();

  return { props, getMap: () => map?.value as MockMap };
}

describe('<Maplibre> option watchers', () => {
  it('creates the map once the container is mounted', async () => {
    const { getMap } = await mountMaplibre({
      style: STYLE,
      center: [0, 0],
      zoom: 1,
    });
    expect(getMap()).toBeTruthy();
  });

  it('moves the map when :options.center changes after mount', async () => {
    const { props, getMap } = await mountMaplibre({
      style: STYLE,
      center: [0, 0],
      zoom: 1,
    });
    const map = getMap();
    map.setCenter.mockClear();

    props.options = { ...props.options, center: [12, 34] };
    await nextTick();
    await nextTick();

    expect(map.setCenter).toHaveBeenCalledWith([12, 34]);
  });

  it('applies zoom changes after mount', async () => {
    const { props, getMap } = await mountMaplibre({
      style: STYLE,
      center: [0, 0],
      zoom: 1,
    });
    const map = getMap();
    map.setZoom.mockClear();

    props.options = { ...props.options, zoom: 7 };
    await nextTick();
    await nextTick();

    expect(map.setZoom).toHaveBeenCalledWith(7);
  });
});
