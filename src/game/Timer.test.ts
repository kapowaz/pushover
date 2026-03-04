import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameTimer } from './Timer';

describe('GameTimer', () => {
  let timer: GameTimer;
  let perfSpy: ReturnType<typeof vi.spyOn>;
  let mockTime: number;

  beforeEach(() => {
    timer = new GameTimer();
    mockTime = 0;
    perfSpy = vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
  });

  afterEach(() => {
    perfSpy.mockRestore();
  });

  it('has correct initial state after init', () => {
    timer.init(5, 30);
    expect(timer.mins).toBe(5);
    expect(timer.secs).toBe(30);
    expect(timer.negative).toBe(false);
  });

  it('counts down by one second', () => {
    timer.init(5, 30);
    mockTime = 1000;
    timer.update();
    expect(timer.mins).toBe(5);
    expect(timer.secs).toBe(29);
    expect(timer.negative).toBe(false);
  });

  it('rolls minutes when seconds reach zero', () => {
    timer.init(5, 0);
    mockTime = 1000;
    timer.update();
    expect(timer.mins).toBe(4);
    expect(timer.secs).toBe(59);
  });

  it('does not decrement within the same second', () => {
    timer.init(5, 30);
    mockTime = 500;
    timer.update();
    expect(timer.mins).toBe(5);
    expect(timer.secs).toBe(30);
  });

  it('goes negative when reaching 0:00', () => {
    timer.init(0, 1);
    mockTime = 1000;
    timer.update();
    expect(timer.mins).toBe(0);
    expect(timer.secs).toBe(0);
    expect(timer.negative).toBe(false);

    mockTime = 2000;
    timer.update();
    expect(timer.negative).toBe(true);
    expect(timer.mins).toBe(0);
    expect(timer.secs).toBe(0);
  });

  it('counts up when negative', () => {
    timer.init(0, 1);
    mockTime = 1000;
    timer.update();
    mockTime = 2000;
    timer.update();
    expect(timer.negative).toBe(true);

    mockTime = 3000;
    timer.update();
    expect(timer.mins).toBe(0);
    expect(timer.secs).toBe(1);
    expect(timer.negative).toBe(true);
  });

  it('rolls minutes up when counting negative past 59 seconds', () => {
    timer.init(0, 1);
    mockTime = 1000;
    timer.update();
    mockTime = 2000;
    timer.update();

    for (let i = 0; i < 60; i++) {
      mockTime = 3000 + i * 1000;
      timer.update();
    }
    expect(timer.mins).toBe(1);
    expect(timer.secs).toBe(0);
    expect(timer.negative).toBe(true);
  });

  it('colonVisible is true when countTicks <= 500', () => {
    timer.init(5, 30);
    expect(timer.colonVisible).toBe(true);

    mockTime = 300;
    timer.update();
    expect(timer.colonVisible).toBe(true);
  });

  it('colonVisible is false when countTicks > 500', () => {
    timer.init(5, 30);
    mockTime = 700;
    timer.update();
    expect(timer.colonVisible).toBe(false);
  });

  it('colonVisible resets after full second elapses', () => {
    timer.init(5, 30);
    mockTime = 700;
    timer.update();
    expect(timer.colonVisible).toBe(false);

    mockTime = 1100;
    timer.update();
    // countTicks: 700 + 400 = 1100, then -1000 = 100
    expect(timer.colonVisible).toBe(true);
  });
});
