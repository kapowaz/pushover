import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';

export interface TouchPoint {
  x: number;
  y: number;
}

const DOUBLE_TAP_WINDOW_MS = 200;
const DOUBLE_TAP_DISTANCE = 20;
const TAP_MOVE_THRESHOLD = 10;
const SWIPE_MIN_DISTANCE = 50;
const SWIPE_DIRECTION_RATIO = 1.5;

export class TouchManager {
  private canvas: HTMLCanvasElement;

  private pendingTap: TouchPoint | null = null;
  private pendingDoubleTap: TouchPoint | null = null;
  private pendingSwipeDown: TouchPoint | null = null;

  private candidateTap: TouchPoint | null = null;
  private candidateTapTime = 0;

  private pointerDownPos: TouchPoint | null = null;
  private pointerMoved = false;

  private readonly handlePointerDown = (e: PointerEvent): void => {
    e.preventDefault();
    const pos = this.toCanvasCoords(e);
    if (!pos) return;

    this.pointerDownPos = pos;
    this.pointerMoved = false;
  };

  private readonly handlePointerMove = (e: PointerEvent): void => {
    if (!this.pointerDownPos) return;
    e.preventDefault();

    const pos = this.toCanvasCoords(e);
    if (!pos) return;

    const dx = pos.x - this.pointerDownPos.x;
    const dy = pos.y - this.pointerDownPos.y;
    if (Math.sqrt(dx * dx + dy * dy) > TAP_MOVE_THRESHOLD) {
      this.pointerMoved = true;
    }
  };

  private readonly handlePointerUp = (e: PointerEvent): void => {
    e.preventDefault();
    if (!this.pointerDownPos) {
      return;
    }

    const pos = this.toCanvasCoords(e);
    if (!pos) {
      this.pointerDownPos = null;
      return;
    }

    if (this.pointerMoved) {
      const dx = pos.x - this.pointerDownPos.x;
      const dy = pos.y - this.pointerDownPos.y;
      if (
        dy > SWIPE_MIN_DISTANCE &&
        Math.abs(dy) > Math.abs(dx) * SWIPE_DIRECTION_RATIO
      ) {
        this.pendingSwipeDown = this.pointerDownPos;
      }
      this.pointerDownPos = null;
      return;
    }

    const now = performance.now();
    if (
      this.candidateTap &&
      now - this.candidateTapTime < DOUBLE_TAP_WINDOW_MS &&
      this.distance(pos, this.candidateTap) < DOUBLE_TAP_DISTANCE
    ) {
      this.pendingDoubleTap = pos;
      this.pendingTap = null;
      this.candidateTap = null;
      this.candidateTapTime = 0;
    } else {
      this.candidateTap = pos;
      this.candidateTapTime = now;
      this.pendingTap = pos;
    }

    this.pointerDownPos = null;
  };

  private readonly handlePointerCancel = (): void => {
    this.pointerDownPos = null;
    this.pointerMoved = false;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointercancel', this.handlePointerCancel);
  }

  get tap(): TouchPoint | null {
    return this.pendingTap;
  }

  get doubleTap(): TouchPoint | null {
    return this.pendingDoubleTap;
  }

  get swipeDown(): TouchPoint | null {
    return this.pendingSwipeDown;
  }

  get doubleTapPossible(): boolean {
    return this.candidateTap !== null;
  }

  private toCanvasCoords(e: PointerEvent): TouchPoint | null {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const x = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);

    if (x < 0 || x >= GAME_WIDTH || y < 0 || y >= GAME_HEIGHT) return null;
    return { x, y };
  }

  private distance(a: TouchPoint, b: TouchPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  update(): void {
    this.pendingTap = null;
    this.pendingDoubleTap = null;
    this.pendingSwipeDown = null;

    if (this.candidateTap) {
      const elapsed = performance.now() - this.candidateTapTime;
      if (elapsed >= DOUBLE_TAP_WINDOW_MS) {
        this.candidateTap = null;
        this.candidateTapTime = 0;
      }
    }
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel);
  }
}
