import { createApp, defineComponent } from 'vue';

/**
 * Helper to run composable code inside a Vue component setup context.
 * Required because composables use onUnmounted, watchEffect, etc.
 */
export function withSetup<T>(composable: () => T): T {
  let result: T;
  const app = createApp(
    defineComponent({
      setup() {
        result = composable();
        return () => null;
      },
    }),
  );
  app.mount(document.createElement('div'));
  return result!;
}
