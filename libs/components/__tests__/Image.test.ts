import { describe, it, expect, vi, afterEach } from 'vitest';
import { createApp, defineComponent, h, provide, shallowRef } from 'vue';
import type { App, Component } from 'vue';
import type { Map } from 'maplibre-gl';
import { MapProvideKey } from '@libs/enums';
import { MockMap } from '../../__tests__/mock-maplibre';

const ImageComponent = (await import('../Image.vue')).default as Component;

const BAD_URL = 'https://example.test/missing.png';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
});

/** Lets the microtask queue and any pending timers drain. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Mounts `<Image>` with a map provided, the way `<Maplibre>` does. */
function mountImage(map: MockMap, images: unknown[], onError: () => void) {
  app = createApp(
    defineComponent({
      setup() {
        provide(MapProvideKey, shallowRef(map as unknown as Map));
        return () => h(ImageComponent, { images, onError });
      },
    }),
  );
  app.mount(document.createElement('div'));
}

describe('<Image> error reporting', () => {
  it('reports a failed image load to the consumer', async () => {
    const map = new MockMap();
    map.failingUrls.add(BAD_URL);
    const onError = vi.fn();

    mountImage(map, [{ id: 'missing-icon', image: BAD_URL }], onError);
    await flush();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][1]).toBe('missing-icon');
    expect(map.imageIds()).not.toContain('missing-icon');
  });

  it('stays quiet when every image loads', async () => {
    const map = new MockMap();
    const onError = vi.fn();

    mountImage(
      map,
      [{ id: 'good-icon', image: 'https://example.test/ok.png' }],
      onError,
    );
    await flush();

    expect(onError).not.toHaveBeenCalled();
    expect(map.imageIds()).toContain('good-icon');
  });
});
