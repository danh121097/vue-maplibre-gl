import type { CircleLayout, CirclePaint, FillLayout, FillPaint, LineLayout, LinePaint, SymbolLayout, SymbolPaint } from '@libs/types';

/**
 * Centralized paint/layout key definitions for all layer types.
 * Single source of truth for which CSS properties belong to paint vs layout.
 */
export const LAYER_STYLE_CONFIG = {
  circle: {
    paintKeys: [
      'circle-radius', 'circle-color', 'circle-blur', 'circle-opacity',
      'circle-translate', 'circle-translate-anchor', 'circle-pitch-scale',
      'circle-pitch-alignment', 'circle-stroke-width', 'circle-stroke-color',
      'circle-stroke-opacity',
    ] as (keyof CirclePaint)[],
    layoutKeys: ['circle-sort-key', 'visibility'] as (keyof CircleLayout)[],
  },
  fill: {
    paintKeys: [
      'fill-antialias', 'fill-opacity', 'fill-color', 'fill-outline-color',
      'fill-translate', 'fill-translate-anchor', 'fill-pattern',
    ] as (keyof FillPaint)[],
    layoutKeys: ['fill-sort-key', 'visibility'] as (keyof FillLayout)[],
  },
  line: {
    paintKeys: [
      'line-opacity', 'line-color', 'line-translate', 'line-translate-anchor',
      'line-width', 'line-gap-width', 'line-offset', 'line-blur',
      'line-dasharray', 'line-pattern', 'line-gradient',
    ] as (keyof LinePaint)[],
    layoutKeys: [
      'line-cap', 'line-join', 'line-miter-limit', 'line-round-limit',
      'line-sort-key', 'visibility',
    ] as (keyof LineLayout)[],
  },
  symbol: {
    paintKeys: [
      'icon-opacity', 'icon-color', 'icon-halo-color', 'icon-halo-width',
      'icon-halo-blur', 'icon-translate', 'icon-translate-anchor',
      'text-opacity', 'text-color', 'text-halo-color', 'text-halo-width',
      'text-halo-blur', 'text-translate', 'text-translate-anchor',
    ] as (keyof SymbolPaint)[],
    layoutKeys: [
      'symbol-placement', 'symbol-spacing', 'symbol-avoid-edges',
      'symbol-sort-key', 'symbol-z-order', 'icon-allow-overlap', 'icon-overlap',
      'icon-ignore-placement', 'icon-optional', 'icon-rotation-alignment',
      'icon-size', 'icon-text-fit', 'icon-text-fit-padding', 'icon-image',
      'icon-rotate', 'icon-padding', 'icon-keep-upright', 'icon-offset',
      'icon-anchor', 'icon-pitch-alignment', 'text-pitch-alignment',
      'text-rotation-alignment', 'text-field', 'text-font', 'text-size',
      'text-max-width', 'text-line-height', 'text-letter-spacing',
      'text-justify', 'text-radial-offset', 'text-variable-anchor',
      'text-variable-anchor-offset', 'text-anchor', 'text-max-angle',
      'text-writing-mode', 'text-rotate', 'text-padding', 'text-keep-upright',
      'text-transform', 'text-offset', 'text-allow-overlap', 'text-overlap',
      'text-ignore-placement', 'text-optional', 'visibility',
    ] as (keyof SymbolLayout)[],
  },
} as const;
