import { describe, it, expect, beforeEach } from 'vitest';
import {
  TouchController,
  PathSegmentType,
  type TouchGameState,
  type MessageBoxOption,
} from './TouchController';
import type { TouchManager, TouchPoint } from '../engine/TouchManager';
import { Player } from './Player';
import {
  MAPWIDTH,
  MAPHEIGHT2,
  Control,
  GIState,
  DominoType,
  DominoState,
  GameScreen,
  TitleMenu,
} from './constants';

function create2DGrid(w: number, h: number, val: number): number[][] {
  return Array.from({ length: w }, () => new Array(h).fill(val));
}

function create3DGrid(w: number, h: number, val: number): number[][][] {
  return Array.from({ length: w }, () =>
    Array.from({ length: h }, () => [val, val]),
  );
}

function makeGrid(ledge?: number[][], ladder?: number[][]) {
  return {
    ledge: ledge ?? create2DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    ladder: ladder ?? create2DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domino: create3DGrid(MAPWIDTH, MAPHEIGHT2, 0),
    domState: create3DGrid(MAPWIDTH, MAPHEIGHT2, DominoState.Standing),
  };
}

function makeTouchManager(
  tap: TouchPoint | null = null,
  doubleTap: TouchPoint | null = null,
  swipeDown: TouchPoint | null = null,
  doubleTapPossible = false,
): TouchManager {
  return {
    get tap() { return tap; },
    get doubleTap() { return doubleTap; },
    get swipeDown() { return swipeDown; },
    get doubleTapPossible() { return doubleTapPossible; },
    update() {},
    destroy() {},
  } as unknown as TouchManager;
}

function playingState(): TouchGameState {
  return {
    gameScreen: GameScreen.Playing,
    titleMenuState: TitleMenu.Main,
    titleCam: 0,
    titleMin: 0,
    titleMax: 3,
    titleScroll: 0,
    titleOptions: ['NEW GAME', 'LOAD GAME', 'ERASE GAME', 'OPTIONS'],
    levelSelect: 1,
    levelScroll: 1,
    mapSet: 0,
    messageBoxActive: false,
    messageBoxOptions: [],
    levelLoading: false,
  };
}

function menuState(overrides: Partial<TouchGameState> = {}): TouchGameState {
  return {
    gameScreen: GameScreen.TitleMenu,
    titleMenuState: TitleMenu.Main,
    titleCam: 0,
    titleMin: 0,
    titleMax: 3,
    titleScroll: 0,
    titleOptions: ['NEW GAME', 'LOAD GAME', 'ERASE GAME', 'OPTIONS'],
    levelSelect: 1,
    levelScroll: 1,
    mapSet: 0,
    messageBoxActive: false,
    messageBoxOptions: [],
    levelLoading: false,
    ...overrides,
  };
}

describe('TouchController', () => {
  describe('coordinate mapping', () => {
    it('converts canvas coordinates to grid X', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      expect(tc.canvasToGridX(0)).toBe(1);
      expect(tc.canvasToGridX(32)).toBe(2);
      expect(tc.canvasToGridX(63)).toBe(2);
      expect(tc.canvasToGridX(64)).toBe(3);
    });

    it('converts canvas coordinates to grid Y with visual offset', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      expect(tc.canvasToGridY(0)).toBe(0);
      expect(tc.canvasToGridY(5)).toBe(1);
      expect(tc.canvasToGridY(16)).toBe(1);
      expect(tc.canvasToGridY(21)).toBe(2);
      expect(tc.canvasToGridY(32)).toBe(2);
    });
  });

  describe('menu tap handling', () => {
    it('detects tap on menu item', () => {
      const tapY = 320 + 1 * 24;
      const touch = makeTouchManager({ x: 333, y: tapY });
      const tc = new TouchController(touch);
      tc.update(menuState());

      const menuTap = tc.consumeMenuTap();
      expect(menuTap).toEqual({ index: 1 });
      expect(tc.consumeMenuConfirm()).toBe(true);
    });

    it('ignores tap outside menu items', () => {
      const touch = makeTouchManager({ x: 50, y: 320 });
      const tc = new TouchController(touch);
      tc.update(menuState());

      expect(tc.consumeMenuTap()).toBeNull();
      expect(tc.consumeMenuConfirm()).toBe(false);
    });

    it('does not handle menu taps on NewGame screen', () => {
      const tapY = 320;
      const touch = makeTouchManager({ x: 333, y: tapY });
      const tc = new TouchController(touch);
      tc.update(menuState({ titleMenuState: TitleMenu.NewGame }));

      expect(tc.consumeMenuTap()).toBeNull();
    });

    it('detects tap on LoadGame submenu items', () => {
      const tapY = 320 + 1 * 24;
      const touch = makeTouchManager({ x: 333, y: tapY });
      const tc = new TouchController(touch);
      tc.update(menuState({
        titleMenuState: TitleMenu.LoadGame,
        titleOptions: ['PLAYER1', 'PLAYER2', 'BACK'],
        titleMin: 0,
        titleMax: 2,
        titleScroll: 0,
      }));

      const menuTap = tc.consumeMenuTap();
      expect(menuTap).toEqual({ index: 1 });
      expect(tc.consumeMenuConfirm()).toBe(true);
    });

    it('accounts for scroll offset in LoadGame submenu', () => {
      const tapY = 320 + 0 * 24;
      const touch = makeTouchManager({ x: 333, y: tapY });
      const tc = new TouchController(touch);
      tc.update(menuState({
        titleMenuState: TitleMenu.LoadGame,
        titleOptions: ['P1', 'P2', 'P3', 'P4', 'BACK'],
        titleMin: 0,
        titleMax: 4,
        titleScroll: 2,
      }));

      const menuTap = tc.consumeMenuTap();
      expect(menuTap).toEqual({ index: 2 });
    });

    it('detects tap on LevelOptions submenu items', () => {
      const entryY = 524 + 0 * 37 - 288;
      const touch = makeTouchManager({ x: 200, y: entryY + 10 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelOptions,
        titleCam: 288,
        titleOptions: ['BACK TO MAIN', 'QUIT'],
        titleMin: 0,
        titleMax: 1,
      }));

      const menuTap = tc.consumeMenuTap();
      expect(menuTap).toEqual({ index: 0 });
      expect(tc.consumeMenuConfirm()).toBe(true);
    });

    it('detects tap on LevelOptions arrows', () => {
      const touch = makeTouchManager({ x: 620, y: 600 - 288 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelOptions,
        titleCam: 288,
        titleOptions: ['BACK TO MAIN', 'QUIT'],
        titleMin: 0,
        titleMax: 1,
      }));

      expect(tc.consumeLevelArrow()).toBe('right');
    });
  });

  describe('level select tap handling', () => {
    it('detects tap on left arrow', () => {
      const touch = makeTouchManager({ x: 20, y: 600 - 288 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
      }));

      expect(tc.consumeLevelArrow()).toBe('left');
    });

    it('detects tap on right arrow', () => {
      const touch = makeTouchManager({ x: 620, y: 600 - 288 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
      }));

      expect(tc.consumeLevelArrow()).toBe('right');
    });

    it('detects tap on level entry to select it', () => {
      const entryY = 524 + 2 * 37 - 288;
      const touch = makeTouchManager({ x: 200, y: entryY + 10 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
        levelScroll: 1,
        levelSelect: 1,
      }));

      const levelTap = tc.consumeLevelTap();
      expect(levelTap).toEqual({ level: 3 });
    });

    it('detects tap on already-selected level as confirm', () => {
      const entryY = 524 + 0 * 37 - 288;
      const touch = makeTouchManager({ x: 200, y: entryY + 10 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
        levelScroll: 1,
        levelSelect: 1,
      }));

      expect(tc.consumeLevelTap()).toBeNull();
      expect(tc.consumeLevelConfirm()).toBe(true);
    });

    it('detects swipe down in top half as level back', () => {
      const touch = makeTouchManager(null, null, { x: 300, y: 100 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
      }));

      expect(tc.consumeLevelBack()).toBe(true);
    });

    it('ignores swipe down in bottom half of screen', () => {
      const touch = makeTouchManager(null, null, { x: 300, y: 300 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelSelect,
        titleCam: 288,
      }));

      expect(tc.consumeLevelBack()).toBe(false);
    });

    it('detects swipe down in top half on level options screen', () => {
      const touch = makeTouchManager(null, null, { x: 300, y: 100 });
      const tc = new TouchController(touch);
      tc.update(menuState({
        gameScreen: GameScreen.LevelSelect,
        titleMenuState: TitleMenu.LevelOptions,
        titleCam: 288,
      }));

      expect(tc.consumeLevelBack()).toBe(true);
    });
  });

  describe('gameplay - single tap', () => {
    let tc: TouchController;
    let player: Player;
    let grid: ReturnType<typeof makeGrid>;

    beforeEach(() => {
      player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      grid = makeGrid();
      grid.ledge[5]![10] = 1;
    });

    it('tap on player in Stand triggers push position (Up control)', () => {
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(true);
    });

    it('tap on reachable tile plans a path', () => {
      grid.ledge[6]![10] = 1;
      grid.ledge[7]![10] = 1;
      grid.ledge[8]![10] = 1;
      const canvasX = (8 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('tap on adjacent tile sets control when player is standing', () => {
      grid.ledge[6]![10] = 1;
      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('tap on unreachable tile does nothing', () => {
      const canvasX = (15 - 1) * 32 + 16;
      const canvasY = 5 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(false);
      expect(tc.isControlActive(Control.Right)).toBe(false);
    });

    it('defers self-tap when standing on a domino and double-tap is possible', () => {
      grid.domino[5]![10]![0] = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY }, null, null, true);
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(false);
      expect(tc.isControlActive(Control.Up)).toBe(false);
    });

    it('self-tap fires immediately when no domino present even with double-tap possible', () => {
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY }, null, null, true);
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(true);
    });

    it('deferred self-tap resolves to Up when double-tap window expires', () => {
      grid.domino[5]![10]![0] = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY }, null, null, true);
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(false);

      const expiredTouch = makeTouchManager(null, null, null, false);
      const tc2 = new TouchController(expiredTouch);
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).deferredSelfTap = true;
      tc2.update(playingState());

      expect(tc2.isControlHit(Control.Up)).toBe(true);
    });

    it('single tap on player sprite edge while holding does not start path', () => {
      player.GIState = GIState.HoldRight;
      player.GIDomino = DominoType.Standard;
      grid.ledge[4]![10] = 1;
      // Tap on left edge of sprite, which resolves to an adjacent grid tile
      const canvasX = (5 - 1) * 32 - 2;
      const canvasY = 10 * 16 - 10;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(false);
      expect(tc.isControlActive(Control.Right)).toBe(false);
    });

    it('single tap on player sprite top while standing triggers Up', () => {
      // Tap on the player's head area
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 - 28;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(true);
    });

    it('deferred self-tap is cancelled by a double-tap (pickup)', () => {
      grid.domino[5]![10]![0] = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY }, null, null, true);
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Up)).toBe(false);

      const dtTouch = makeTouchManager(null, { x: canvasX, y: canvasY });
      const tc2 = new TouchController(dtTouch);
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).deferredSelfTap = true;
      tc2.update(playingState());

      expect(tc2.isControlHit(Control.Fire)).toBe(true);
      expect(tc2.isControlHit(Control.Up)).toBe(false);
    });
  });

  describe('gameplay - double tap', () => {
    let tc: TouchController;
    let player: Player;
    let grid: ReturnType<typeof makeGrid>;

    beforeEach(() => {
      player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      grid = makeGrid();
      grid.ledge[5]![10] = 1;
    });

    it('double tap on player tile with domino triggers Fire (pickup)', () => {
      grid.domino[5]![10]![0] = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on player tile while holding triggers Fire (place)', () => {
      player.GIState = GIState.HoldRight;
      player.GIDomino = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on player sprite top edge while holding triggers Fire (place)', () => {
      player.GIState = GIState.HoldRight;
      player.GIDomino = DominoType.Standard;
      // Tap on the player's head: sprite top is GIY*16 - 32 = 128
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 - 28;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on player sprite left edge while holding triggers Fire (place)', () => {
      player.GIState = GIState.HoldLeft;
      player.GIDomino = DominoType.Standard;
      // Tap on left edge of sprite: sprite left is (GIX-1)*32 - 4 = 124
      const canvasX = (5 - 1) * 32 - 2;
      const canvasY = 10 * 16 - 10;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap well outside player sprite does not trigger Fire', () => {
      player.GIState = GIState.HoldRight;
      player.GIDomino = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 - 50;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(false);
    });

    it('double tap on player sprite top edge with domino triggers Fire (pickup)', () => {
      grid.domino[5]![10]![0] = DominoType.Standard;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 - 28;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on adjacent empty column triggers ledge jump', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);
    });

    it('double tap on adjacent column with slight Y offset still triggers ledge jump', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 9 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);
    });

    it('double tap on adjacent column too far vertically does not trigger ledge jump', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 6 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(false);
    });

    it('edge jump control persists through WobbleLeft state', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);

      player.GIState = GIState.WobbleLeft;
      const tc2 = new TouchController(makeTouchManager());
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).edgeJumpControl = (tc as any).edgeJumpControl;
      tc2.update(playingState());

      expect(tc2.isControlActive(Control.Left)).toBe(true);
    });

    it('edge jump control persists through WalkLeft after wobble', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      player.GIState = GIState.WalkLeft;
      const tc2 = new TouchController(makeTouchManager());
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).edgeJumpControl = (tc as any).edgeJumpControl;
      tc2.update(playingState());

      expect(tc2.isControlActive(Control.Left)).toBe(true);
    });

    it('edge jump control clears when player enters Fall state', () => {
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      player.GIState = GIState.Fall;
      const tc2 = new TouchController(makeTouchManager());
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).edgeJumpControl = (tc as any).edgeJumpControl;
      tc2.update(playingState());

      expect(tc2.isControlActive(Control.Left)).toBe(false);
    });

    it('edge jump control persists for HoldLeft through CarryLeft', () => {
      player.GIState = GIState.HoldLeft;
      grid.ledge[4]![10] = 0;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);

      player.GIState = GIState.CarryLeft;
      const tc2 = new TouchController(makeTouchManager());
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).edgeJumpControl = (tc as any).edgeJumpControl;
      tc2.update(playingState());

      expect(tc2.isControlActive(Control.Left)).toBe(true);
    });

    it('edge jump is cancelled by a new single tap', () => {
      grid.ledge[4]![10] = 0;
      grid.ledge[6]![10] = 1;
      const canvasX = (4 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);

      player.GIState = GIState.WobbleLeft;
      const newTapX = (6 - 1) * 32 + 16;
      const newTapY = 10 * 16 + 8;
      const tc2 = new TouchController(makeTouchManager({ x: newTapX, y: newTapY }));
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).edgeJumpControl = (tc as any).edgeJumpControl;
      tc2.update(playingState());

      expect((tc2 as any).edgeJumpControl).toBeNull();
    });

    it('double tap on adjacent domino initiates walk towards it', () => {
      grid.ledge[6]![10] = 1;
      grid.domino[6]![10]![0] = DominoType.Standard;
      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('fires when arriving at adjacent domino after walk-to path', () => {
      grid.ledge[6]![10] = 1;
      grid.domino[6]![10]![0] = DominoType.Standard;

      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);

      player.GIX = 6;
      const touch2 = makeTouchManager();
      const tc2 = new TouchController(touch2);
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).path = (tc as any).path;
      (tc2 as any).pathIndex = (tc as any).pathIndex;
      (tc2 as any).pathActive = (tc as any).pathActive;
      (tc2 as any).fireAtDestination = (tc as any).fireAtDestination;
      tc2.update(playingState());

      expect(tc2.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on remote domino plans path and sets fire at destination', () => {
      for (let x = 5; x <= 10; x++) grid.ledge[x]![10] = 1;
      grid.domino[10]![10]![0] = DominoType.Standard;
      const canvasX = (10 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
      expect((tc as any).fireAtDestination).toBe(true);
    });

    it('double tap on remote domino works when player is already walking', () => {
      player.GIState = GIState.WalkRight;
      for (let x = 5; x <= 10; x++) grid.ledge[x]![10] = 1;
      grid.domino[10]![10]![0] = DominoType.Standard;
      const canvasX = (10 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
      expect((tc as any).fireAtDestination).toBe(true);
    });

    it('double tap on remote domino does not trigger when player is carrying', () => {
      player.GIState = GIState.HoldRight;
      player.GIDomino = DominoType.Standard;
      for (let x = 5; x <= 10; x++) grid.ledge[x]![10] = 1;
      grid.domino[10]![10]![0] = DominoType.Standard;
      const canvasX = (10 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect((tc as any).fireAtDestination).toBe(false);
    });

    it('double tap on remote domino via ladder plans path and sets fire at destination', () => {
      for (let x = 4; x <= 6; x++) grid.ledge[x]![10] = 1;
      for (let x = 4; x <= 6; x++) grid.ledge[x]![6] = 1;
      for (let y = 6; y <= 10; y++) grid.ladder[5]![y] = 1;
      grid.domino[6]![6]![0] = DominoType.Standard;

      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 6 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect((tc as any).pathActive).toBe(true);
      expect((tc as any).fireAtDestination).toBe(true);
    });

    it('double tap on unreachable domino does nothing', () => {
      grid.ledge[15]![5] = 1;
      grid.domino[15]![5]![0] = DominoType.Standard;
      const canvasX = (15 - 1) * 32 + 16;
      const canvasY = 5 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(false);
      expect(tc.isControlActive(Control.Left)).toBe(false);
      expect((tc as any).fireAtDestination).toBe(false);
    });

    it('double tap on remote domino with slight Y offset finds nearby domino', () => {
      for (let x = 5; x <= 8; x++) grid.ledge[x]![10] = 1;
      grid.domino[8]![10]![0] = DominoType.Standard;
      const canvasX = (8 - 1) * 32 + 16;
      // Tap 1 row above the domino's grid Y (simulating tapping the top of the sprite)
      const canvasY = 9 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
      expect((tc as any).fireAtDestination).toBe(true);
    });

    it('fires when arriving at remote domino after pathfinding', () => {
      for (let x = 5; x <= 8; x++) grid.ledge[x]![10] = 1;
      grid.domino[8]![10]![0] = DominoType.Standard;

      const canvasX = (8 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
      expect((tc as any).fireAtDestination).toBe(true);

      player.GIX = 8;
      const touch2 = makeTouchManager();
      const tc2 = new TouchController(touch2);
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      (tc2 as any).path = (tc as any).path;
      (tc2 as any).pathIndex = (tc as any).pathIndex;
      (tc2 as any).pathActive = (tc as any).pathActive;
      (tc2 as any).fireAtDestination = (tc as any).fireAtDestination;
      tc2.update(playingState());

      expect(tc2.isControlHit(Control.Fire)).toBe(true);
    });

    it('double tap on tile without domino does not set fire at destination', () => {
      for (let x = 5; x <= 8; x++) grid.ledge[x]![10] = 1;
      const canvasX = (8 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager(null, { x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect((tc as any).fireAtDestination).toBe(false);
    });
  });

  describe('gameplay - PushWait', () => {
    it('tap on left tile pushes left', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.PushWait;

      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Fire)).toBe(true);
      expect(tc.isControlActive(Control.Left)).toBe(true);
    });

    it('tap on right tile pushes right', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.PushWait;

      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Fire)).toBe(true);
      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('tap elsewhere in PushWait exits (Down control)', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.PushWait;

      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const canvasX = (10 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Down)).toBe(true);
    });
  });

  describe('pathfinding', () => {
    it('finds horizontal path on same platform', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      for (let x = 3; x <= 8; x++) grid.ledge[x]![10] = 1;

      tc.planPath(3, 10, 8, 10, grid);
      const segments = (tc as any).path;

      expect(segments.length).toBe(1);
      expect(segments[0].type).toBe(PathSegmentType.WalkRight);
      expect(segments[0].targetX).toBe(8);
    });

    it('finds path via ladder between platforms', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      for (let x = 3; x <= 8; x++) grid.ledge[x]![10] = 1;
      for (let x = 3; x <= 8; x++) grid.ledge[x]![6] = 1;
      for (let y = 6; y <= 10; y++) grid.ladder[5]![y] = 1;

      tc.planPath(3, 10, 7, 6, grid);
      const segments = (tc as any).path;

      expect(segments.length).toBeGreaterThan(0);

      const climbSeg = segments.find((s: any) => s.type === PathSegmentType.ClimbUp);
      expect(climbSeg).toBeDefined();

      const lastSeg = segments[segments.length - 1];
      expect(lastSeg.targetX).toBe(7);
      expect(lastSeg.targetY).toBe(6);
    });

    it('snaps goal to nearest ledge when tapped tile is not a ledge', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      for (let x = 3; x <= 8; x++) grid.ledge[x]![10] = 1;

      tc.planPath(3, 10, 8, 12, grid);
      const segments = (tc as any).path;

      expect(segments.length).toBe(1);
      expect(segments[0].type).toBe(PathSegmentType.WalkRight);
      expect(segments[0].targetX).toBe(8);
      expect(segments[0].targetY).toBe(10);
    });

    it('does not snap when no ledge is within range', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      for (let x = 3; x <= 8; x++) grid.ledge[x]![10] = 1;

      tc.planPath(3, 10, 8, 20, grid);
      const segments = (tc as any).path;
      expect(segments.length).toBe(0);
    });

    it('returns empty path for unreachable target', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      for (let x = 3; x <= 5; x++) grid.ledge[x]![10] = 1;
      grid.ledge[10]![5] = 1;

      tc.planPath(3, 10, 10, 5, grid);
      const segments = (tc as any).path;
      expect(segments.length).toBe(0);
    });

    it('finds path via step-up', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      grid.ledge[5]![10] = 1;
      grid.ledge[6]![9] = 1;

      tc.planPath(5, 10, 6, 9, grid);
      const segments = (tc as any).path;
      expect(segments.length).toBe(1);
      expect(segments[0].type).toBe(PathSegmentType.WalkRight);
    });

    it('finds path via step-down', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();

      grid.ledge[5]![10] = 1;
      grid.ledge[4]![11] = 1;

      tc.planPath(5, 10, 4, 11, grid);
      const segments = (tc as any).path;
      expect(segments.length).toBe(1);
      expect(segments[0].type).toBe(PathSegmentType.WalkLeft);
    });
  });

  describe('walk overshoot prevention', () => {
    it('does not set right control on last tile when already walking right', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.WalkRight;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkRight, targetX: 6, targetY: 10 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(false);
    });

    it('sets right control when walking but more than 1 tile from target', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.WalkRight;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;
      grid.ledge[7]![10] = 1;

      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkRight, targetX: 7, targetY: 10 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('does not set left control on last tile when already walking left', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.WalkLeft;
      const grid = makeGrid();
      grid.ledge[4]![10] = 1;
      grid.ledge[5]![10] = 1;

      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkLeft, targetX: 4, targetY: 10 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(false);
    });

    it('sets control on last tile when player is stationary', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkRight, targetX: 6, targetY: 10 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('does not set control when carrying and on last tile', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.CarryRight;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkRight, targetX: 6, targetY: 10 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(false);
    });
  });

  describe('cancelPath', () => {
    it('clears all active and hit controls', () => {
      const touch = makeTouchManager();
      const tc = new TouchController(touch);
      const grid = makeGrid();
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;
      grid.ledge[7]![10] = 1;

      tc.setGrid(grid);
      tc.setPlayer(player);

      const tapX = (7 - 1) * 32 + 16;
      const tapY = 10 * 16 + 8;
      const tc2 = new TouchController(makeTouchManager({ x: tapX, y: tapY }));
      tc2.setGrid(grid);
      tc2.setPlayer(player);
      tc2.update(playingState());

      expect(tc2.isControlActive(Control.Right)).toBe(true);

      tc2.cancelPath();
      expect(tc2.isControlActive(Control.Right)).toBe(false);
      expect(tc2.isControlActive(Control.Left)).toBe(false);
    });
  });

  describe('gameplay - Climb state', () => {
    let tc: TouchController;
    let player: Player;
    let grid: ReturnType<typeof makeGrid>;

    beforeEach(() => {
      player = new Player(0);
      player.GIX = 5;
      player.GIY = 8;
      player.GIState = GIState.Climb;
      grid = makeGrid();
      grid.ledge[5]![8] = 1;
      grid.ledge[5]![12] = 1;
      for (let y = 8; y <= 12; y++) grid.ladder[5]![y] = 1;
    });

    it('tap on reachable tile plans a path from Climb state', () => {
      grid.ledge[6]![8] = 1;
      grid.ledge[7]![8] = 1;
      const canvasX = (7 - 1) * 32 + 16;
      const canvasY = 8 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('self-tap in Climb state gets player off the ladder', () => {
      player.GILastMoved = 1;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 8 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });

    it('self-tap in Climb state sends Left when GILastMoved is 0', () => {
      player.GILastMoved = 0;
      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 8 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Left)).toBe(true);
    });

    it('path advances correctly when player is in Climb state', () => {
      grid.ledge[6]![8] = 1;
      const touch = makeTouchManager();
      tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      (tc as any).path = [{ type: PathSegmentType.WalkRight, targetX: 6, targetY: 8 }];
      (tc as any).pathIndex = 0;
      (tc as any).pathActive = true;
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(true);
    });
  });

  describe('state guards', () => {
    it('does not process gameplay taps when level is loading', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;

      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);

      tc.update({
        ...playingState(),
        levelLoading: true,
      });

      expect(tc.isControlActive(Control.Up)).toBe(false);
    });

    it('does not process gameplay taps when message box is active', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;

      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);

      tc.update({
        ...playingState(),
        messageBoxActive: true,
      });

      expect(tc.isControlActive(Control.Up)).toBe(false);
    });

    it('does not process taps in non-actionable player states', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Fall;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;
      grid.ledge[6]![10] = 1;

      const canvasX = (6 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update(playingState());

      expect(tc.isControlActive(Control.Right)).toBe(false);
    });
  });

  describe('message box tap handling', () => {
    it('detects tap on a message box option', () => {
      const options: MessageBoxOption[] = [
        { index: 6, y: 292, text: 'CONTINUE' },
        { index: 7, y: 316, text: 'RETRY' },
        { index: 8, y: 340, text: 'QUIT' },
      ];

      const touch = makeTouchManager({ x: 320, y: 316 });
      const tc = new TouchController(touch);
      tc.update({
        ...playingState(),
        messageBoxActive: true,
        messageBoxOptions: options,
      });

      const tap = tc.consumeMessageBoxTap();
      expect(tap).toEqual({ index: 7 });
    });

    it('ignores tap outside message box options', () => {
      const options: MessageBoxOption[] = [
        { index: 6, y: 292, text: 'CONTINUE' },
        { index: 7, y: 316, text: 'RETRY' },
        { index: 8, y: 340, text: 'QUIT' },
      ];

      const touch = makeTouchManager({ x: 320, y: 200 });
      const tc = new TouchController(touch);
      tc.update({
        ...playingState(),
        messageBoxActive: true,
        messageBoxOptions: options,
      });

      expect(tc.consumeMessageBoxTap()).toBeNull();
    });

    it('does not process gameplay taps when message box is active', () => {
      const player = new Player(0);
      player.GIX = 5;
      player.GIY = 10;
      player.GIState = GIState.Stand;
      const grid = makeGrid();
      grid.ledge[5]![10] = 1;

      const canvasX = (5 - 1) * 32 + 16;
      const canvasY = 10 * 16 + 8;
      const touch = makeTouchManager({ x: canvasX, y: canvasY });
      const tc = new TouchController(touch);
      tc.setGrid(grid);
      tc.setPlayer(player);
      tc.update({
        ...playingState(),
        messageBoxActive: true,
        messageBoxOptions: [],
      });

      expect(tc.isControlActive(Control.Up)).toBe(false);
    });
  });
});
