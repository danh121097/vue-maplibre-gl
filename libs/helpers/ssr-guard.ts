/**
 * Check if running in browser environment.
 * Returns false during SSR (Node.js).
 */
export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';
