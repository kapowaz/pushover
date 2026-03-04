import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Player, ProcessContext } from './Player';
import {
  MAPWIDTH,
  MAPHEIGHT,
  MAPHEIGHT2,
  DOM_UPRIGHT,
  GIState,
  GIF,
  Control,
  DominoType,
  DominoState,
  LevelState,
} from './constants';

function create2DGrid(w: number, h: number, val: number): number[][] {
  return Array.from({ length: w }, () => new Array(h).fill(val));
}

function create3DGrid(w: number, h: number, val: number): number[][][] {
  return Array.from({ length: w }, () =>
    Array.from({ length: h }, () => [val, val]),
  );
}

function makeContext(
  pressedControls: Control[] = [],
  overrides: Partial<ProcessContext> = {},
): ProcessContext {
  const pressed = new Set(pressedControls);

  return {
    contHit: vi.fn((c: Control) => pressed.has(c)),
    contDown: vi.fn((c: Control) => pressed.has(c)),
    ledge: create2DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    ladder: create2DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domino: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domState: create3DGrid(MAPWIDTH, MAPHEIGHT2, DominoState.Standing),
    domFrame: create3DGrid(MAPWIDTH, MAPHEIGHT2, DOM_UPRIGHT),
    domFrameChange: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domDelay: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domX: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domY: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    rubble: create2DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    background: create2DGrid(MAPWIDTH, MAPHEIGHT, 0),
    levelState: LevelState.Playing,
    levelCompleteState: 0,
    starter: false,
    mimics: 0,
    GIOut: 1,
    renderFirst: null,
    messageDelay: 0,
    messageDelayStyle: 0,
    otherPlayer: null,
    playSound: vi.fn().mockReturnValue(0),
    stopSound: vi.fn(),
    isSoundPlaying: vi.fn().mockReturnValue(false),
    saveTokenState: vi.fn(),
    blowExploder: vi.fn(),
    rebounder: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player(0);
  });

  describe('initial state', () => {
    it('starts in Stand state', () => {
      expect(player.GIState).toBe(GIState.Stand);
      expect(player.GIFrame).toBe(GIF.STAND);
    });

    it('starts enabled', () => {
      expect(player.enabled).toBe(true);
    });

    it('starts with no held domino', () => {
      expect(player.GIDomino).toBe(0);
    });
  });

  describe('setControls', () => {
    it('scheme 0 sets arrow keys and KeyZ', () => {
      player.setControls(0);
      expect(player.upKey).toBe('ArrowUp');
      expect(player.downKey).toBe('ArrowDown');
      expect(player.leftKey).toBe('ArrowLeft');
      expect(player.rightKey).toBe('ArrowRight');
      expect(player.fireKey).toBe('KeyZ');
    });

    it('scheme 1 sets GVBN and KeyZ', () => {
      player.setControls(1);
      expect(player.upKey).toBe('KeyG');
      expect(player.downKey).toBe('KeyB');
      expect(player.leftKey).toBe('KeyV');
      expect(player.rightKey).toBe('KeyN');
      expect(player.fireKey).toBe('KeyZ');
    });

    it('scheme 2 sets arrows and Slash', () => {
      player.setControls(2);
      expect(player.upKey).toBe('ArrowUp');
      expect(player.fireKey).toBe('Slash');
    });

    it('scheme 3 disables controls (all Home)', () => {
      player.setControls(3);
      expect(player.upKey).toBe('Home');
      expect(player.downKey).toBe('Home');
      expect(player.leftKey).toBe('Home');
      expect(player.rightKey).toBe('Home');
      expect(player.fireKey).toBe('Home');
    });
  });

  describe('walking', () => {
    it('walking left changes state to WalkLeft', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Left]);
      ctx.ledge[5][10] = 1;
      ctx.ledge[4][10] = 1;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.WalkLeft);
      expect(player.GIFrame).toBe(GIF.WALK_LS);
      expect(player.GILastMoved).toBe(0);
    });

    it('walking right changes state to WalkRight', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Right]);
      ctx.ledge[5][10] = 1;
      ctx.ledge[6][10] = 1;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.WalkRight);
      expect(player.GIFrame).toBe(GIF.WALK_RS);
      expect(player.GILastMoved).toBe(1);
    });
  });

  describe('falling', () => {
    it('falls when no ledge below', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext();
      // ledge[5][10] = 0 (default) → no ledge

      player.process(ctx);

      expect(player.GIState).toBe(GIState.Fall);
      expect(player.GIFrame).toBe(GIF.FALL_S);
      expect(ctx.playSound).toHaveBeenCalled();
    });
  });

  describe('picking up dominoes', () => {
    it('picks up a non-trigger/starter domino', () => {
      player.GIX = 5;
      player.GIY = 10;
      player.GILastMoved = 1;

      const ctx = makeContext([Control.Fire]);
      ctx.ledge[5][10] = 1;
      ctx.domino[5][10][0] = DominoType.Standard;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = DOM_UPRIGHT;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.PickupRight);
      expect(ctx.domState[5][10][0]).toBe(DominoState.Pickup);
      expect(ctx.playSound).toHaveBeenCalled();
    });

    it('picks up left when GILastMoved is 0', () => {
      player.GIX = 5;
      player.GIY = 10;
      player.GILastMoved = 0;

      const ctx = makeContext([Control.Fire]);
      ctx.ledge[5][10] = 1;
      ctx.domino[5][10][0] = DominoType.Standard;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = DOM_UPRIGHT;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.PickupLeft);
    });

    it('cannot pick up trigger domino (shakes head)', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Fire]);
      ctx.ledge[5][10] = 1;
      ctx.domino[5][10][0] = DominoType.Trigger;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = DOM_UPRIGHT;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.ShakeHead);
      expect(player.GIFrame).toBe(GIF.SHAKEHEAD_S);
    });

    it('cannot pick up starter domino (shakes head)', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Fire]);
      ctx.ledge[5][10] = 1;
      ctx.domino[5][10][0] = DominoType.Starter;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = DOM_UPRIGHT;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.ShakeHead);
    });
  });

  describe('climbing', () => {
    it('climbs ladder when up pressed and ladder exists', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Up]);
      ctx.ledge[5][10] = 1;
      ctx.ladder[5][9] = 1;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.ClimbUp);
      expect(player.GIFrame).toBe(GIF.CLIMB_S);
    });

    it('climbs down when down pressed and ladder exists below', () => {
      player.GIX = 5;
      player.GIY = 10;

      const ctx = makeContext([Control.Down]);
      ctx.ledge[5][10] = 1;
      ctx.ladder[5][11] = 1;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.ClimbDown);
      expect(player.GIFrame).toBe(GIF.CLIMB_S);
    });
  });

  describe('notValidForPush', () => {
    it('returns false (valid) when setup is correct', () => {
      const ctx = makeContext();
      const x = 5;
      const y = 10;

      ctx.domino[x][y][0] = DominoType.Standard;
      ctx.domState[x][y][0] = DominoState.Standing;
      ctx.domFrame[x][y][0] = DOM_UPRIGHT;

      ctx.domino[x + 1][y][0] = DominoType.Standard;
      ctx.domState[x + 1][y][0] = DominoState.Standing;
      ctx.domFrame[x + 1][y][0] = DOM_UPRIGHT;

      ctx.ledge[x][y] = 1;
      ctx.ledge[x + 1][y] = 1;

      const result = (player as any).notValidForPush(x, y, ctx);
      expect(result).toBe(false);
    });

    it('returns true when no standing dominoes exist', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      ctx.ledge[6][10] = 1;

      const result = (player as any).notValidForPush(5, 10, ctx);
      expect(result).toBe(true);
    });

    it('returns true when ledge is missing', () => {
      const ctx = makeContext();
      ctx.domino[5][10][0] = DominoType.Standard;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.ledge[5][10] = 0;
      ctx.ledge[6][10] = 1;

      const result = (player as any).notValidForPush(5, 10, ctx);
      expect(result).toBe(true);
    });

    it('returns true when ledge exists above (step)', () => {
      const ctx = makeContext();
      ctx.domino[5][10][0] = DominoType.Standard;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domino[6][10][0] = DominoType.Standard;
      ctx.domState[6][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = DOM_UPRIGHT;
      ctx.domFrame[6][10][0] = DOM_UPRIGHT;
      ctx.ledge[5][10] = 1;
      ctx.ledge[6][10] = 1;
      ctx.ledge[5][9] = 1;

      const result = (player as any).notValidForPush(5, 10, ctx);
      expect(result).toBe(true);
    });

    it('returns true when a domino is already falling', () => {
      const ctx = makeContext();
      ctx.domino[5][10][0] = DominoType.Standard;
      ctx.domState[5][10][0] = DominoState.Standing;
      ctx.domFrame[5][10][0] = 8; // past upright (falling right)
      ctx.domino[6][10][0] = DominoType.Standard;
      ctx.domState[6][10][0] = DominoState.Standing;
      ctx.domFrame[6][10][0] = DOM_UPRIGHT;
      ctx.ledge[5][10] = 1;
      ctx.ledge[6][10] = 1;

      const result = (player as any).notValidForPush(5, 10, ctx);
      expect(result).toBe(true);
    });
  });

  describe('putDownOK', () => {
    it('returns true when tile is valid for placement', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(true);
    });

    it('returns false when no ledge exists', () => {
      const ctx = makeContext();

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(false);
    });

    it('returns false when a domino already occupies the tile', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      ctx.domino[5][10][0] = DominoType.Standard;

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(false);
    });

    it('returns false when rubble exists at the tile', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      ctx.rubble[5][10] = 1;

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(false);
    });

    it('returns false when adjacent domino is leaning onto the tile', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      ctx.domino[4][10][0] = DominoType.Standard;
      ctx.domFrame[4][10][0] = 10; // past upright, leaning right

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(false);
    });

    it('returns false for non-vanisher on a door tile', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      const bgY = Math.floor((10 - 1) / 2);
      ctx.background[5][bgY] = 7; // CLOSED_DOOR

      const result = (player as any).putDownOK(5, 10, DominoType.Standard, ctx);
      expect(result).toBe(false);
    });

    it('returns true for vanisher on a door tile', () => {
      const ctx = makeContext();
      ctx.ledge[5][10] = 1;
      const bgY = Math.floor((10 - 1) / 2);
      ctx.background[5][bgY] = 7; // CLOSED_DOOR

      const result = (player as any).putDownOK(5, 10, DominoType.Vanisher, ctx);
      expect(result).toBe(true);
    });
  });

  describe('disabled player', () => {
    it('does not process when disabled', () => {
      player.GIX = 5;
      player.GIY = 10;
      player.enabled = false;

      const ctx = makeContext([Control.Left]);
      ctx.ledge[5][10] = 1;
      ctx.ledge[4][10] = 1;

      player.process(ctx);

      expect(player.GIState).toBe(GIState.Stand);
    });
  });
});
