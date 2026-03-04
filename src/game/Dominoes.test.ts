import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DominoManager } from './Dominoes';
import {
  DominoType,
  DominoState,
  DOM_UPRIGHT,
  MAPWIDTH,
  MAPHEIGHT2,
  MessageType,
} from './constants';

function makeLedge(): number[][] {
  return Array.from({ length: MAPWIDTH }, () => new Array(MAPHEIGHT2).fill(0));
}

function makeLadder(): number[][] {
  return Array.from({ length: MAPWIDTH }, () => new Array(MAPHEIGHT2).fill(0));
}

function makeCallbacks() {
  return {
    onPlaySound: vi.fn(),
    onStartEffect: vi.fn(),
    onUpdateLedge: vi.fn(),
  };
}

describe('DominoManager', () => {
  let dm: DominoManager;
  let ledge: number[][];
  let ladder: number[][];
  let callbacks: ReturnType<typeof makeCallbacks>;

  beforeEach(() => {
    dm = new DominoManager();
    ledge = makeLedge();
    ladder = makeLadder();
    callbacks = makeCallbacks();
  });

  describe('initialiseDominoes', () => {
    it('resets domino state arrays to defaults', () => {
      dm.domino[5][10][0] = DominoType.Standard;
      dm.domState[5][10][0] = DominoState.FallRight;
      dm.domFrame[5][10][0] = 10;
      dm.domFrameChange[5][10][0] = 0.5;
      dm.domY[5][10][0] = 3;
      dm.domX[5][10][0] = 2;
      dm.domDelay[5][10][0] = 5;

      dm.initialiseDominoes();

      expect(dm.domState[5][10][0]).toBe(DominoState.Standing);
      expect(dm.domFrame[5][10][0]).toBe(DOM_UPRIGHT);
      expect(dm.domFrameChange[5][10][0]).toBe(0);
      expect(dm.domY[5][10][0]).toBe(0);
      expect(dm.domX[5][10][0]).toBe(0);
      expect(dm.domDelay[5][10][0]).toBe(0);
    });

    it('resets rubble', () => {
      dm.rubble[5][10] = 2;
      dm.rubbleY[5][10] = 4;

      dm.initialiseDominoes();

      expect(dm.rubble[5][10]).toBe(0);
      expect(dm.rubbleY[5][10]).toBe(0);
    });

    it('resets mimics and allowedCount', () => {
      dm.mimics = 1;
      dm.allowedCount = 1;
      dm.levelCompleteState = 2;

      dm.initialiseDominoes();

      expect(dm.mimics).toBe(0);
      expect(dm.allowedCount).toBe(3);
      expect(dm.levelCompleteState).toBe(0);
    });
  });

  describe('standard domino falling right', () => {
    it('frame advances past upright when in FallRight state', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;
      ledge[x + 1][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;
      dm.domFrameChange[x][y][0] = 0;

      for (let tick = 0; tick < 20; tick++) {
        dm.processDominoes(ledge, ladder, callbacks);
      }

      expect(dm.domFrame[x][y][0]).toBeGreaterThan(DOM_UPRIGHT);
    });

    it('reaches fully fallen frame (12) after enough ticks', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;
      ledge[x + 1][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;

      for (let tick = 0; tick < 30; tick++) {
        dm.processDominoes(ledge, ladder, callbacks);
      }

      expect(dm.domino[x][y][0]).toBe(DominoType.Standard);
      expect(dm.domFrame[x][y][0]).toBe(12);
    });
  });

  describe('stopper', () => {
    it('does not fall when hit by adjacent falling domino', () => {
      const y = 10;
      for (let x = 3; x <= 7; x++) ledge[x][y] = 1;

      dm.domino[4][y][0] = DominoType.Standard;
      dm.domState[4][y][0] = DominoState.FallRight;
      dm.domFrame[4][y][0] = DOM_UPRIGHT;
      dm.domFrameChange[4][y][0] = 0;

      dm.domino[5][y][0] = DominoType.Stopper;
      dm.domState[5][y][0] = DominoState.Standing;
      dm.domFrame[5][y][0] = DOM_UPRIGHT;

      for (let tick = 0; tick < 30; tick++) {
        dm.processDominoes(ledge, ladder, callbacks);
      }

      expect(dm.domState[5][y][0]).toBe(DominoState.Standing);
      expect(dm.domFrame[5][y][0]).toBe(DOM_UPRIGHT);
    });
  });

  describe('splitter', () => {
    it('splits into two halves going opposite directions', () => {
      const x = 5;
      const y = 10;

      dm.domino[x][y][0] = DominoType.Splitter1;
      dm.domState[x][y][0] = DominoState.Standing;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;

      (dm as any)._ladder = ladder;
      (dm as any)._callbacks = callbacks;

      dm.splitSplitter(x, y);

      expect(dm.domino[x][y][0]).toBe(DominoType.Splitter1);
      expect(dm.domState[x][y][0]).toBe(DominoState.FallLeft);
      expect(dm.domFrame[x][y][0]).toBe(DOM_UPRIGHT);

      expect(dm.domino[x][y][1]).toBe(DominoType.Splitter1);
      expect(dm.domState[x][y][1]).toBe(DominoState.FallRight);
      expect(dm.domFrame[x][y][1]).toBe(DOM_UPRIGHT);

      expect(callbacks.onPlaySound).toHaveBeenCalled();
    });
  });

  describe('exploder', () => {
    it('destroys ledge and ladder at position', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;
      ladder[x][y] = 1;
      dm.domino[x][y][0] = DominoType.Exploder;

      (dm as any)._ladder = ladder;
      (dm as any)._callbacks = callbacks;

      dm.blowExploder(x, y, 0, ledge);

      expect(dm.domino[x][y][0]).toBe(0);
      expect(ledge[x][y]).toBe(0);
      expect(ladder[x][y]).toBe(0);
      expect(callbacks.onStartEffect).toHaveBeenCalled();
      expect(callbacks.onUpdateLedge).toHaveBeenCalled();
    });
  });

  describe('vanisher', () => {
    it('disappears when fully fallen right (frame 12)', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;
      ledge[x + 1][y] = 1;

      dm.domino[x][y][0] = DominoType.Vanisher;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = 12;
      dm.domFrameChange[x][y][0] = 0;

      dm.processDominoes(ledge, ladder, callbacks);

      expect(dm.domino[x][y][0]).toBe(0);
    });

    it('disappears when fully fallen left (frame 0)', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;
      ledge[x - 1][y] = 1;

      dm.domino[x][y][0] = DominoType.Vanisher;
      dm.domState[x][y][0] = DominoState.FallLeft;
      dm.domFrame[x][y][0] = 0;
      dm.domFrameChange[x][y][0] = 0;

      dm.processDominoes(ledge, ladder, callbacks);

      expect(dm.domino[x][y][0]).toBe(0);
    });
  });

  describe('levelComplete', () => {
    it('returns true when all dominoes are toppled', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = 12;
      dm.domFrameChange[x][y][0] = 0;

      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(true);
    });

    it('returns false if a non-stopper is still upright', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.Standing;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;
      dm.domFrameChange[x][y][0] = 0;

      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(false);
      expect(result.message).toBe(MessageType.NotAllToppled);
    });

    it('returns false if domino is still animating (frameChange != 0)', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = 10;
      dm.domFrameChange[x][y][0] = 0.5;

      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(false);
      expect(result.message).toBe(MessageType.NotAllToppled);
    });

    it('stopper at upright does not prevent completion', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;

      dm.domino[x][y][0] = DominoType.Stopper;
      dm.domState[x][y][0] = DominoState.Standing;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;
      dm.domFrameChange[x][y][0] = 0;

      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(true);
    });

    it('returns false if player is still holding dominoes', () => {
      const x = 5;
      const y = 10;
      ledge[x][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = 12;
      dm.domFrameChange[x][y][0] = 0;

      const result = dm.levelComplete(ledge, [DominoType.Standard]);
      expect(result.complete).toBe(false);
      expect(result.message).toBe(MessageType.StillHolding);
    });

    it('returns false if rubble exists', () => {
      dm.rubble[5][10] = 1;

      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(false);
      expect(result.message).toBe(MessageType.Crashed);
    });

    it('returns true when no dominoes exist', () => {
      const result = dm.levelComplete(ledge);
      expect(result.complete).toBe(true);
    });
  });

  describe('rebounder', () => {
    it('returns true for stopper when no starter', () => {
      dm.domino[5][10][0] = DominoType.Stopper;
      dm.starter = false;
      expect(dm.rebounder(5, 10, 0)).toBe(true);
    });

    it('returns false for standard domino when no starter', () => {
      dm.domino[5][10][0] = DominoType.Standard;
      dm.starter = false;
      expect(dm.rebounder(5, 10, 0)).toBe(false);
    });

    it('returns true for non-starter when starter is present', () => {
      dm.domino[5][10][0] = DominoType.Standard;
      dm.starter = true;
      expect(dm.rebounder(5, 10, 0)).toBe(true);
    });

    it('returns false for starter domino when starter is present', () => {
      dm.domino[5][10][0] = DominoType.Starter;
      dm.starter = true;
      expect(dm.rebounder(5, 10, 0)).toBe(false);
    });

    it('returns true for unfired delay2 when no starter', () => {
      dm.domino[5][10][0] = DominoType.Delay2;
      dm.domDelay[5][10][0] = 0;
      dm.starter = false;
      expect(dm.rebounder(5, 10, 0)).toBe(true);
    });

    it('returns false for already-fired delay2 when no starter', () => {
      dm.domino[5][10][0] = DominoType.Delay2;
      dm.domDelay[5][10][0] = 10;
      dm.starter = false;
      expect(dm.rebounder(5, 10, 0)).toBe(false);
    });
  });

  describe('chain reaction', () => {
    it('knocks over adjacent domino when frame reaches 9', () => {
      const x = 5;
      const y = 10;
      for (let i = 3; i <= 8; i++) ledge[i][y] = 1;

      dm.domino[x][y][0] = DominoType.Standard;
      dm.domState[x][y][0] = DominoState.FallRight;
      dm.domFrame[x][y][0] = DOM_UPRIGHT;
      dm.domFrameChange[x][y][0] = 0;

      dm.domino[x + 1][y][0] = DominoType.Standard;
      dm.domState[x + 1][y][0] = DominoState.Standing;
      dm.domFrame[x + 1][y][0] = DOM_UPRIGHT;

      for (let tick = 0; tick < 20; tick++) {
        dm.processDominoes(ledge, ladder, callbacks);
      }

      expect(dm.domState[x + 1][y][0]).not.toBe(DominoState.Standing);
    });

    it('chain propagates through multiple dominoes', () => {
      const y = 10;
      for (let x = 3; x <= 10; x++) ledge[x][y] = 1;

      dm.domino[5][y][0] = DominoType.Standard;
      dm.domState[5][y][0] = DominoState.FallRight;
      dm.domFrame[5][y][0] = DOM_UPRIGHT;

      dm.domino[6][y][0] = DominoType.Standard;
      dm.domState[6][y][0] = DominoState.Standing;
      dm.domFrame[6][y][0] = DOM_UPRIGHT;

      dm.domino[7][y][0] = DominoType.Standard;
      dm.domState[7][y][0] = DominoState.Standing;
      dm.domFrame[7][y][0] = DOM_UPRIGHT;

      for (let tick = 0; tick < 30; tick++) {
        dm.processDominoes(ledge, ladder, callbacks);
      }

      expect(dm.domState[6][y][0]).not.toBe(DominoState.Standing);
      expect(dm.domState[7][y][0]).not.toBe(DominoState.Standing);
    });
  });
});
