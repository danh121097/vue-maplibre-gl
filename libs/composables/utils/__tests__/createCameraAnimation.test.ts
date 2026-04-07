import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { withSetup } from '../../../test-utils';
import { createCameraAnimation } from '../createCameraAnimation';

// Mock MapLibre Map
function createMockMap() {
  const listeners = new Map<string, Set<(...args: any[]) => void>>();
  return {
    on(event: string, handler: (...args: any[]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },
    off(event: string, handler: (...args: any[]) => void) {
      listeners.get(event)?.delete(handler);
    },
    once(event: string, handler: (...args: any[]) => void) {
      const wrapped = (...args: any[]) => {
        listeners.get(event)?.delete(wrapped);
        handler(...args);
      };
      this.on(event, wrapped);
    },
    fire(event: string, ...args: any[]) {
      // Copy to avoid mutation during iteration
      const handlers = [...(listeners.get(event) || [])];
      handlers.forEach((h) => h(...args));
    },
    flyTo: vi.fn(),
    easeTo: vi.fn(),
    jumpTo: vi.fn(),
    zoomTo: vi.fn(),
    stop: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    getZoom: vi.fn(() => 10),
    getBearing: vi.fn(() => 0),
    getPitch: vi.fn(() => 0),
  };
}

describe('createCameraAnimation', () => {
  it('resolves when completion event fires', async () => {
    const map = createMockMap();

    const { executeAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    const promise = executeAnimation('flyTo', [{ center: [0, 0] }], 'moveend');
    expect(map.flyTo).toHaveBeenCalledWith({ center: [0, 0] });

    // Simulate animation completion
    map.fire('moveend');
    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves immediately for instant operations (no completionEvent)', async () => {
    const map = createMockMap();

    const { executeAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    // jumpTo — no completion event (RT-14)
    await expect(
      executeAnimation('jumpTo', [{ center: [0, 0] }]),
    ).resolves.toBeUndefined();
    expect(map.jumpTo).toHaveBeenCalledWith({ center: [0, 0] });
  });

  it('rejects when map is null', async () => {
    const { executeAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(null) }),
    );

    await expect(executeAnimation('flyTo', [{}], 'moveend')).rejects.toThrow(
      'Map instance not available',
    );
  });

  it('rejects on timeout and calls map.stop() (RT-6)', async () => {
    vi.useFakeTimers();
    const map = createMockMap();

    const { executeAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    const promise = executeAnimation('flyTo', [{}], 'moveend', 100);

    // Advance past timeout
    vi.advanceTimersByTime(150);

    await expect(promise).rejects.toThrow('Animation timed out after 100ms');
    expect(map.stop).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('rejects when map fires error event', async () => {
    const map = createMockMap();

    const { executeAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    const promise = executeAnimation('flyTo', [{}], 'moveend');
    map.fire('error', new Error('Map error'));

    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  it('getCurrentCamera returns camera state', () => {
    const map = createMockMap();

    const { getCurrentCamera } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    const camera = getCurrentCamera();
    expect(camera).toEqual({
      center: { lng: 0, lat: 0 },
      zoom: 10,
      bearing: 0,
      pitch: 0,
    });
  });

  it('getCurrentCamera returns null when map is null', () => {
    const { getCurrentCamera } = withSetup(() =>
      createCameraAnimation({ map: ref(null) }),
    );

    expect(getCurrentCamera()).toBeNull();
  });

  it('stopAnimation calls map.stop()', () => {
    const map = createMockMap();

    const { stopAnimation } = withSetup(() =>
      createCameraAnimation({ map: ref(map as any) }),
    );

    stopAnimation();
    expect(map.stop).toHaveBeenCalled();
  });
});
