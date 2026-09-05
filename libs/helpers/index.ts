export { isBrowser } from './ssr-guard';

/**
 * Flatten a Vue `class` binding value (string | array | object) into a list of
 * class tokens. Used to forward fallthrough `class` onto the element MapLibre
 * owns, since Teleport-root components can't inherit attributes automatically.
 */
export function normalizeClassTokens(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(normalizeClassTokens);
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => enabled)
      .map(([token]) => token);
  }
  return [];
}
import { getVersion } from 'maplibre-gl';
import type { LngLatLike, Map } from 'maplibre-gl';

/** Monotonic within the module instance, which is what makes ids collision-free. */
let generatedIdCount = 0;

/**
 * Returns `id` when the caller supplied one, otherwise mints a fallback id for
 * a layer or source.
 *
 * These ids only have to be unique among the layers and sources of the maps on
 * one page, so a module-scoped counter is sufficient and the timestamp is there
 * purely to keep ids readable across reloads. The name predates dropping the
 * `nanoid` dependency, which was declared under devDependencies yet imported at
 * runtime — correct only for as long as it stayed bundled.
 */
export function getNanoid(id?: string): string {
  if (id) return id;
  return `vml-${Date.now().toString(36)}-${(generatedIdCount++).toString(36)}`;
}

export function getMainVersion(): number {
  return parseInt(getVersion().split('.')[0], 10);
}

export function hasSource(map: Map, sourceId: string): boolean {
  return !!map.style && !!map.getSource(sourceId);
}

export function hasLayer(map: Map, sourceId: string): boolean {
  return !!map.style && !!map.getLayer(sourceId);
}

export function lngLatLikeHasValue(lngLatLike?: LngLatLike): boolean {
  if (lngLatLike) {
    if (Array.isArray(lngLatLike)) {
      return (
        lngLatLike.length >= 2 &&
        lngLatLike[0] !== undefined &&
        lngLatLike[1] !== undefined
      );
    }

    if (typeof lngLatLike === 'object') {
      if ('lat' in lngLatLike && ('lng' in lngLatLike || 'lon' in lngLatLike)) {
        const { lat } = lngLatLike;
        const lng = 'lng' in lngLatLike ? lngLatLike.lng : undefined;
        const lon = 'lon' in lngLatLike ? lngLatLike.lon : undefined;
        return (lng !== undefined || lon !== undefined) && lat !== undefined;
      }
    }
  }

  return false;
}

export function filterStylePropertiesByKeys<T extends Record<string, any>>(
  style: Record<string, any>,
  keys: (keyof T)[],
): T {
  return Object.fromEntries(
    Object.entries(style).filter(([key]) => keys.includes(key as keyof T)),
  ) as T;
}
