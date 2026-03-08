/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { TouchManager } from './TouchManager';

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 640,
    height: 480,
    right: 640,
    bottom: 480,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  return canvas;
}

function pointerEvent(
  type: string,
  clientX: number,
  clientY: number,
): PointerEvent {
  return new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
  });
}

describe('TouchManager', () => {
  let canvas: HTMLCanvasElement;
  let touch: TouchManager;

  afterEach(() => {
    touch?.destroy();
  });

  it('reports no tap/doubleTap initially', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);
    expect(touch.tap).toBeNull();
    expect(touch.doubleTap).toBeNull();
  });

  it('emits a single tap immediately on pointer up', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(100);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    expect(touch.tap).toEqual({ x: 100, y: 200 });
    expect(touch.doubleTap).toBeNull();
  });

  it('clears tap after update()', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(100);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    expect(touch.tap).not.toBeNull();

    touch.update();
    expect(touch.tap).toBeNull();
  });

  it('detects double tap when two taps occur within the time window', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    // First tap emits immediately
    expect(touch.tap).toEqual({ x: 100, y: 200 });

    canvas.dispatchEvent(pointerEvent('pointerdown', 102, 198));
    canvas.dispatchEvent(pointerEvent('pointerup', 102, 198));

    // Double-tap cancels the pending single tap
    expect(touch.doubleTap).not.toBeNull();
    expect(touch.tap).toBeNull();
  });

  it('does not detect double tap when taps are too far apart in time', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValueOnce(100)
      .mockReturnValueOnce(500);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    expect(touch.doubleTap).toBeNull();
    expect(touch.tap).not.toBeNull();
  });

  it('does not detect double tap when taps are too far apart in distance', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValueOnce(100)
      .mockReturnValueOnce(200);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    canvas.dispatchEvent(pointerEvent('pointerdown', 150, 250));
    canvas.dispatchEvent(pointerEvent('pointerup', 150, 250));

    expect(touch.doubleTap).toBeNull();
    expect(touch.tap).not.toBeNull();
  });

  it('ignores tap when pointer moves too far (drag)', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointermove', 200, 300));
    canvas.dispatchEvent(pointerEvent('pointerup', 200, 300));

    expect(touch.tap).toBeNull();
  });

  it('detects swipe down when pointer moves downward enough', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 300, 100));
    canvas.dispatchEvent(pointerEvent('pointermove', 305, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 305, 200));

    expect(touch.swipeDown).toEqual({ x: 300, y: 100 });
    expect(touch.tap).toBeNull();
  });

  it('does not detect swipe down for horizontal drag', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointermove', 250, 210));
    canvas.dispatchEvent(pointerEvent('pointerup', 250, 210));

    expect(touch.swipeDown).toBeNull();
  });

  it('does not detect swipe down for upward swipe', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 300, 300));
    canvas.dispatchEvent(pointerEvent('pointermove', 305, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 305, 200));

    expect(touch.swipeDown).toBeNull();
  });

  it('clears swipeDown after update()', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 300, 100));
    canvas.dispatchEvent(pointerEvent('pointermove', 305, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 305, 200));
    expect(touch.swipeDown).not.toBeNull();

    touch.update();
    expect(touch.swipeDown).toBeNull();
  });

  it('scales coordinates when canvas is CSS-scaled', () => {
    canvas = createCanvas();
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 320,
      height: 240,
      right: 320,
      bottom: 240,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    touch = new TouchManager(canvas);

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(100);

    canvas.dispatchEvent(pointerEvent('pointerdown', 160, 120));
    canvas.dispatchEvent(pointerEvent('pointerup', 160, 120));

    expect(touch.tap).toEqual({ x: 320, y: 240 });
  });

  it('ignores taps outside the canvas bounds', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', -10, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', -10, 200));

    expect(touch.tap).toBeNull();
  });

  it('resets on pointer cancel', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    expect(touch.tap).toBeNull();
  });

  it('destroy removes event listeners', () => {
    canvas = createCanvas();
    touch = new TouchManager(canvas);
    touch.destroy();

    canvas.dispatchEvent(pointerEvent('pointerdown', 100, 200));
    canvas.dispatchEvent(pointerEvent('pointerup', 100, 200));

    expect(touch.tap).toBeNull();
  });
});
