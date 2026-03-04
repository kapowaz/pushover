/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest';
import { InputManager } from './InputManager';

describe('InputManager', () => {
  let input: InputManager;

  afterEach(() => {
    input?.destroy();
  });

  it('keyDown returns false for unpressed keys', () => {
    input = new InputManager();
    expect(input.keyDown('ArrowLeft')).toBe(false);
  });

  it('keyDown returns true when key is pressed', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyDown('ArrowLeft')).toBe(true);
  });

  it('keyDown returns false after key is released', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyDown('ArrowLeft')).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
    expect(input.keyDown('ArrowLeft')).toBe(false);
  });

  it('keyHit returns true once after press, then false', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyHit('ArrowLeft')).toBe(true);
    expect(input.keyHit('ArrowLeft')).toBe(false);
  });

  it('keyHit returns false after update clears hits', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    input.update();
    expect(input.keyHit('ArrowLeft')).toBe(false);
  });

  it('unconsumed keyHit is lost after update', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    // Don't consume the hit
    input.update();
    expect(input.keyHit('ArrowLeft')).toBe(false);
  });

  it('tracks multiple keys independently', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(input.keyDown('ArrowLeft')).toBe(true);
    expect(input.keyDown('ArrowRight')).toBe(true);
    expect(input.keyDown('ArrowUp')).toBe(false);
  });

  it('keyHit works independently per key', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(input.keyHit('ArrowLeft')).toBe(true);
    expect(input.keyHit('ArrowRight')).toBe(true);
    expect(input.keyHit('ArrowLeft')).toBe(false);
    expect(input.keyHit('ArrowRight')).toBe(false);
  });

  it('destroy removes listeners and clears state', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyDown('ArrowLeft')).toBe(true);

    input.destroy();
    expect(input.keyDown('ArrowLeft')).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(input.keyDown('ArrowRight')).toBe(false);
  });

  it('repeated keydown does not re-trigger keyHit', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyHit('ArrowLeft')).toBe(true);

    // Holding key: another keydown while still down
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    input.update();
    expect(input.keyHit('ArrowLeft')).toBe(false);
  });

  it('keyHit works again after release and re-press', () => {
    input = new InputManager();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyHit('ArrowLeft')).toBe(true);
    input.update();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(input.keyHit('ArrowLeft')).toBe(true);
  });
});
