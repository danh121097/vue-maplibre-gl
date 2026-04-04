import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { withSetup } from '../../../test-utils';
import {
  createEventListenerComposable,
  EventListenerStatus,
} from '../create-event-listener-composable';

// Mock target that mimics Evented interface (Map, GeolocateControl)
function createMockTarget() {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();
  return {
    on(event: string, handler: (...args: any[]) => void) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
    },
    off(event: string, handler: (...args: any[]) => void) {
      handlers.get(event)?.delete(handler);
    },
    fire(event: string, ...args: any[]) {
      handlers.get(event)?.forEach((h) => h(...args));
    },
    getHandlerCount(event: string) {
      return handlers.get(event)?.size ?? 0;
    },
  };
}

describe('createEventListenerComposable', () => {
  it('attaches listener when target is available', () => {
    const target = createMockTarget();
    const handler = vi.fn();

    withSetup(() => {
      const result = createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
        },
      });
      expect(result.listenerStatus).toBe(EventListenerStatus.Attached);
    });

    expect(target.getHandlerCount('click')).toBe(1);
  });

  it('does not attach when target is null', () => {
    const handler = vi.fn();

    withSetup(() => {
      const result = createEventListenerComposable({
        target: ref(null),
        event: 'click',
        on: handler,
        adapter: {
          attach: vi.fn(),
          detach: vi.fn(),
        },
      });
      expect(result.listenerStatus).toBe(EventListenerStatus.NotAttached);
    });
  });

  it('calls handler when event fires', () => {
    const target = createMockTarget();
    const handler = vi.fn();

    withSetup(() => {
      createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
        },
      });
    });

    target.fire('click', { type: 'click' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removeListener is idempotent (RT-7)', () => {
    const target = createMockTarget();
    const handler = vi.fn();

    withSetup(() => {
      const { removeListener } = createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
        },
      });

      removeListener();
      removeListener(); // Second call should not throw
      expect(target.getHandlerCount('click')).toBe(0);
    });
  });

  it('respects once option', () => {
    const target = createMockTarget();
    const handler = vi.fn();

    withSetup(() => {
      createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        once: true,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
        },
      });
    });

    target.fire('click', { type: 'click' });
    expect(handler).toHaveBeenCalledTimes(1);
    // After once, listener should be removed
    expect(target.getHandlerCount('click')).toBe(0);
  });

  it('skips attach when validate returns false', () => {
    const target = createMockTarget();
    const handler = vi.fn();

    withSetup(() => {
      const result = createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
          validate: () => false,
        },
      });
      expect(result.listenerStatus).toBe(EventListenerStatus.NotAttached);
    });

    expect(target.getHandlerCount('click')).toBe(0);
  });

  it('handles error in event handler gracefully', () => {
    const target = createMockTarget();
    const handler = vi.fn(() => {
      throw new Error('Handler error');
    });

    withSetup(() => {
      createEventListenerComposable({
        target: ref(target),
        event: 'click',
        on: handler,
        adapter: {
          attach: (t, e, h) => t.on(e, h),
          detach: (t, e, h) => t.off(e, h),
        },
      });
    });

    // Should not throw
    target.fire('click', {});
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
