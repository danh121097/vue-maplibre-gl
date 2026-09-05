import { describe, it, expect } from 'vitest';
import { getNanoid } from '../index';

describe('getNanoid', () => {
  it('returns the caller-supplied id unchanged', () => {
    expect(getNanoid('my-layer')).toBe('my-layer');
  });

  it('mints a distinct id on every call without one', () => {
    // These ids name layers and sources on a live map, so a repeat would make
    // one silently overwrite another. The generator is a module-scoped
    // counter precisely because a timestamp alone collides within a
    // millisecond.
    const ids = Array.from({ length: 500 }, () => getNanoid());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('produces a string usable as a MapLibre layer or source id', () => {
    expect(getNanoid()).toMatch(/^vml-[0-9a-z]+-[0-9a-z]+$/);
  });
});
