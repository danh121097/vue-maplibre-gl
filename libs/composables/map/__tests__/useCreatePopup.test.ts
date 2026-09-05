import { describe, it, expect } from 'vitest';
import { nextTick, ref, shallowRef } from 'vue';
import { Popup } from 'maplibre-gl';
import type { Map } from 'maplibre-gl';
import { withSetup } from '../../../test-utils';
import { MockMap } from '../../../__tests__/mock-maplibre';
import { useCreatePopup, PopupStatus } from '../useCreatePopup';

describe('useCreatePopup reactivity contract', () => {
  it('exposes the popup once a map becomes available', async () => {
    const map = shallowRef<Map | null>(null);

    // withMap is off so the assertion targets creation, not MapLibre's
    // DOM/WebGL attachment path
    const { popup, popupStatus, isPopupCreated } = withSetup(() =>
      useCreatePopup({
        map,
        html: '<p>hello</p>',
        withMap: false,
      }),
    );

    expect(popup.value).toBeNull();
    expect(isPopupCreated.value).toBe(false);
    expect(popupStatus.value).toBe(PopupStatus.NotCreated);

    map.value = new MockMap() as unknown as Map;
    await nextTick();

    expect(popup.value).toBeInstanceOf(Popup);
    expect(isPopupCreated.value).toBe(true);
    expect(popupStatus.value).toBe(PopupStatus.Created);
  });

  it('clears the popup again when the map goes away', async () => {
    const map = shallowRef<Map | null>(new MockMap() as unknown as Map);

    const { popup, isPopupCreated } = withSetup(() =>
      useCreatePopup({
        map,
        html: '<p>hello</p>',
        withMap: false,
      }),
    );

    expect(isPopupCreated.value).toBe(true);

    map.value = null;
    await nextTick();

    expect(popup.value).toBeNull();
    expect(isPopupCreated.value).toBe(false);
  });

  it('creates the popup when its content arrives after the map', async () => {
    const map = shallowRef(new MockMap() as unknown as Map);
    const html = ref('');

    const { popup, popupStatus } = withSetup(() =>
      useCreatePopup({ map, html, withMap: false }),
    );

    // Creation is gated on content, not just on the map: async html and
    // template refs are both empty while setup runs.
    expect(popup.value).toBeNull();
    expect(popupStatus.value).toBe(PopupStatus.NotCreated);

    html.value = '<b>loaded later</b>';
    await nextTick();

    expect(popup.value).toBeInstanceOf(Popup);
    expect(popupStatus.value).toBe(PopupStatus.Created);
  });
});
