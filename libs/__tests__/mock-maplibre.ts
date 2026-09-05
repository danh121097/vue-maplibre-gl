import { vi } from 'vitest';

/**
 * Minimal stand-in for `maplibre-gl`'s `Map`.
 *
 * MapLibre needs a real WebGL context, which happy-dom does not provide, so
 * tests that exercise map lifecycle swap the class out for this one. It covers
 * the event bus plus the setters and queries the library actually calls.
 */
export class MockMap {
  options: Record<string, any>;
  /** Truthy so the library's `hasSource` / `hasLayer` guards pass. */
  style: Record<string, unknown> = {};
  private listeners = new Map<string, Set<(...args: any[]) => void>>();
  private images = new Map<string, unknown>();
  private sources = new Map<string, unknown>();
  private layers = new Map<string, unknown>();
  private isLoaded = false;

  setCenter = vi.fn();
  setZoom = vi.fn();
  setBearing = vi.fn();
  setPitch = vi.fn();
  setStyle = vi.fn();
  setMaxBounds = vi.fn();
  setMaxPitch = vi.fn();
  setMaxZoom = vi.fn();
  setMinPitch = vi.fn();
  setMinZoom = vi.fn();
  setRenderWorldCopies = vi.fn();
  remove = vi.fn();

  constructor(options: Record<string, any> = {}) {
    this.options = options;
  }

  on(event: string, handler: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return this;
  }

  off(event: string, handler: (...args: any[]) => void): this {
    this.listeners.get(event)?.delete(handler);
    return this;
  }

  once(event: string, handler: (...args: any[]) => void): this {
    const wrapped = (...args: any[]) => {
      this.off(event, wrapped);
      handler(...args);
    };
    return this.on(event, wrapped);
  }

  /** Test helper — dispatches an event to every attached handler. */
  fire(event: string, ...args: any[]): void {
    if (event === 'load') this.isLoaded = true;
    [...(this.listeners.get(event) ?? [])].forEach((handler) =>
      handler(...args),
    );
  }

  /** Test helper — how many handlers are attached for an event. */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  loaded(): boolean {
    return this.isLoaded;
  }

  isStyleLoaded(): boolean {
    return this.isLoaded;
  }

  getCenter() {
    return { lng: 0, lat: 0 };
  }
  getZoom() {
    return 1;
  }
  getBearing() {
    return 0;
  }
  getPitch() {
    return 0;
  }

  // --- image API ---
  hasImage(id: string): boolean {
    return this.images.has(id);
  }

  addImage(id: string, image: unknown): void {
    this.images.set(id, image);
  }

  updateImage(id: string, image: unknown): void {
    this.images.set(id, image);
  }

  removeImage(id: string): void {
    this.images.delete(id);
  }

  /** Test helper — URLs added here make `loadImage` reject. */
  failingUrls = new Set<string>();

  async loadImage(url: string): Promise<{ data: unknown }> {
    if (this.failingUrls.has(url)) {
      throw new Error(`404 ${url}`);
    }
    return { data: { width: 1, height: 1, url } };
  }

  /** Test helper — ids currently registered on the map. */
  imageIds(): string[] {
    return [...this.images.keys()];
  }

  // --- source API ---
  addSource(id: string, spec: unknown): void {
    this.sources.set(id, { id, ...(spec as object), setData: vi.fn() });
  }

  getSource(id: string): unknown {
    return this.sources.get(id);
  }

  removeSource(id: string): void {
    this.sources.delete(id);
  }

  /** Test helper — source ids currently on the map. */
  sourceIds(): string[] {
    return [...this.sources.keys()];
  }

  // --- layer API ---
  addLayer(spec: { id: string }): void {
    this.layers.set(spec.id, spec);
  }

  getLayer(id: string): unknown {
    return this.layers.get(id);
  }

  removeLayer(id: string): void {
    this.layers.delete(id);
  }

  /** Test helper — layer ids currently on the map. */
  layerIds(): string[] {
    return [...this.layers.keys()];
  }
}

/**
 * `vi.mock` factory that keeps every real maplibre-gl export except `Map`.
 * The library reads `getVersion()` from the real module, so a blanket mock
 * would break unrelated helpers.
 */
export async function mockMaplibreModule(
  importOriginal: () => Promise<Record<string, any>>,
): Promise<Record<string, any>> {
  const actual = await importOriginal();
  return { ...actual, Map: MockMap };
}
