import { describe, it, expect, vi } from 'vitest';
import {
  createSetStyle,
  createSetVisibility,
  createPropertySetter,
} from '../createLayerPropertySetters';
import { LAYER_STYLE_CONFIG } from '../layerStyleConfig';

describe('createSetStyle', () => {
  it('dispatches paint keys to setPaintProperty', () => {
    const setPaint = vi.fn();
    const setLayout = vi.fn();
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;

    const setStyle = createSetStyle(setPaint, setLayout, paintKeys, layoutKeys, vi.fn());

    setStyle({ 'circle-color': '#ff0000', 'circle-radius': 5 } as any);

    expect(setPaint).toHaveBeenCalledWith('circle-color', '#ff0000', { validate: false });
    expect(setPaint).toHaveBeenCalledWith('circle-radius', 5, { validate: false });
    expect(setLayout).not.toHaveBeenCalled();
  });

  it('dispatches layout keys to setLayoutProperty', () => {
    const setPaint = vi.fn();
    const setLayout = vi.fn();
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;

    const setStyle = createSetStyle(setPaint, setLayout, paintKeys, layoutKeys, vi.fn());

    setStyle({ visibility: 'none' } as any);

    expect(setLayout).toHaveBeenCalledWith('visibility', 'none', { validate: false });
    expect(setPaint).not.toHaveBeenCalled();
  });

  it('skips undefined values', () => {
    const setPaint = vi.fn();
    const setLayout = vi.fn();
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;

    const setStyle = createSetStyle(setPaint, setLayout, paintKeys, layoutKeys, vi.fn());

    setStyle({ 'circle-color': undefined } as any);

    expect(setPaint).not.toHaveBeenCalled();
  });

  it('handles empty style object', () => {
    const setPaint = vi.fn();
    const setLayout = vi.fn();
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.fill;

    const setStyle = createSetStyle(setPaint, setLayout, paintKeys, layoutKeys, vi.fn());

    setStyle({} as any);
    expect(setPaint).not.toHaveBeenCalled();
    expect(setLayout).not.toHaveBeenCalled();
  });

  it('logs error on exception', () => {
    const setPaint = vi.fn(() => { throw new Error('test'); });
    const logError = vi.fn();
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;

    const setStyle = createSetStyle(setPaint, vi.fn(), paintKeys, layoutKeys, logError);

    setStyle({ 'circle-color': 'red' } as any);
    expect(logError).toHaveBeenCalled();
  });
});

describe('createSetVisibility', () => {
  it('sets visibility via setLayoutProperty', () => {
    const setLayout = vi.fn();
    const setVisibility = createSetVisibility(setLayout, vi.fn());

    setVisibility('visible');
    expect(setLayout).toHaveBeenCalledWith('visibility', 'visible', { validate: true });

    setVisibility('none', { validate: false });
    expect(setLayout).toHaveBeenCalledWith('visibility', 'none', { validate: false });
  });
});

describe('createPropertySetter', () => {
  it('creates a typed setter that calls setFn correctly', () => {
    const setFn = vi.fn();
    const setRadius = createPropertySetter<number>(setFn, 'circle-radius', vi.fn());

    setRadius(10);
    expect(setFn).toHaveBeenCalledWith('circle-radius', 10, { validate: true });
  });

  it('passes custom options', () => {
    const setFn = vi.fn();
    const setColor = createPropertySetter<string>(setFn, 'circle-color', vi.fn());

    setColor('#fff', { validate: false });
    expect(setFn).toHaveBeenCalledWith('circle-color', '#fff', { validate: false });
  });

  it('logs error on exception', () => {
    const setFn = vi.fn(() => { throw new Error('test'); });
    const logError = vi.fn();
    const setter = createPropertySetter<number>(setFn, 'circle-radius', logError);

    setter(5);
    expect(logError).toHaveBeenCalledWith('Error setting circle-radius:', expect.any(Error));
  });
});

describe('LAYER_STYLE_CONFIG', () => {
  it('has all 4 layer types defined', () => {
    expect(LAYER_STYLE_CONFIG).toHaveProperty('circle');
    expect(LAYER_STYLE_CONFIG).toHaveProperty('fill');
    expect(LAYER_STYLE_CONFIG).toHaveProperty('line');
    expect(LAYER_STYLE_CONFIG).toHaveProperty('symbol');
  });

  it('circle has expected paint and layout keys', () => {
    const { paintKeys, layoutKeys } = LAYER_STYLE_CONFIG.circle;
    expect(paintKeys).toContain('circle-color');
    expect(paintKeys).toContain('circle-radius');
    expect(layoutKeys).toContain('visibility');
  });

  it('symbol has the most keys (icon + text)', () => {
    const { paintKeys: circlePaint } = LAYER_STYLE_CONFIG.circle;
    const { paintKeys: symbolPaint, layoutKeys: symbolLayout } = LAYER_STYLE_CONFIG.symbol;
    expect(symbolPaint.length + symbolLayout.length).toBeGreaterThan(circlePaint.length);
  });
});
