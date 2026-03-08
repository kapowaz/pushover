import type { TouchManager, TouchPoint } from '../engine/TouchManager';
import type { Player } from './Player';
import {
  TILE_SIZE,
  HALF_TILE,
  MAPWIDTH,
  MAPHEIGHT2,
  Control,
  GIState,
  DominoState,
  GameScreen,
  TitleMenu,
  GAME_WIDTH,
  GAME_HEIGHT,
} from './constants';

const EDGE_JUMP_STATES = new Set<GIState>([
  GIState.Stand,
  GIState.HoldLeft,
  GIState.HoldRight,
  GIState.WobbleLeft,
  GIState.WobbleRight,
  GIState.WalkLeft,
  GIState.WalkRight,
  GIState.CarryLeft,
  GIState.CarryRight,
]);

const MENU_X = 333;
const MENU_START_Y = 320;
const MENU_SPACING = 24;
const MENU_HIT_WIDTH = 200;

const LS_LIST_X = 50;
const LS_LIST_Y = 524;
const LS_ENTRY_SPACING = 37;
const LS_ENTRY_WIDTH = 320;
const LS_ENTRY_HEIGHT = 32;

const LS_LEFT_ARROW_X = 8;
const LS_RIGHT_ARROW_X = 600;
const LS_ARROW_Y = 600;
const ARROW_HIT_SIZE = 64;

const VISIBLE_LEVELS = 6;
const LEDGE_SNAP_RANGE = 4;
const LEDGE_JUMP_Y_TOLERANCE = 2;

// Sprites are rendered above their logical grid position (dominoes at y*16 - 30,
// player at y*16 - 32). This offset aligns touch Y mapping with the visual center
// of sprites so tapping on the visible portion of an object resolves to the
// correct grid row.
const TOUCH_Y_OFFSET = 11;

// Player sprite dimensions and rendering offsets relative to grid position.
// The sprite is drawn at ((GIX-1)*32 - 4, GIY*16 - 32) with size 40×44.
const GI_SPRITE_WIDTH = 40;
const GI_SPRITE_HEIGHT = 44;
const GI_SPRITE_RENDER_OFFSET_X = -4;
const GI_SPRITE_RENDER_OFFSET_Y = -32;
const PLAYER_TAP_PADDING = 6;

// Gap hit area for tapping between adjacent dominoes to enter PushWait.
// Dominos are drawn at ((x-1)*32 - 22, y*16 - 30) with sprite size 72×38.
// The visual gap between two standing dominos is centered on the tile boundary.
const GAP_HIT_HALF_WIDTH = 16;
const GAP_DOMINO_RENDER_OFFSET_Y = -30;
const GAP_DOMINO_SPRITE_HEIGHT = 38;
const GAP_HIT_VERTICAL_PADDING = 6;

export enum PathSegmentType {
  WalkLeft,
  WalkRight,
  ClimbUp,
  ClimbDown,
}

interface PathSegment {
  type: PathSegmentType;
  targetX: number;
  targetY: number;
}

export interface MessageBoxOption {
  index: number;
  y: number;
  text: string;
}

export interface TouchGameState {
  gameScreen: GameScreen;
  titleMenuState: TitleMenu;
  titleCam: number;
  titleMin: number;
  titleMax: number;
  titleScroll: number;
  titleOptions: string[];
  levelSelect: number;
  levelScroll: number;
  mapSet: number;
  messageBoxActive: boolean;
  messageBoxOptions: MessageBoxOption[];
  levelLoading: boolean;
}

interface GridAccess {
  ledge: number[][];
  ladder: number[][];
  domino: number[][][];
  domState: number[][][];
}

export class TouchController {
  private touch: TouchManager;
  private grid: GridAccess | null = null;
  private player: Player | null = null;

  private activeControls = new Set<Control>();
  private hitControls = new Set<Control>();
  private consumedHits = new Set<Control>();

  private path: PathSegment[] = [];
  private pathIndex = 0;
  private pathActive = false;
  private fireAtDestination = false;
  private edgeJumpControl: Control | null = null;
  private deferredPushWaitCancel = false;
  private deferredTapPosition: TouchPoint | null = null;
  private pushDirection: Control | null = null;

  private pendingMenuTap: { index: number } | null = null;
  private pendingLevelTap: { level: number } | null = null;
  private pendingLevelArrow: 'left' | 'right' | null = null;
  private pendingLevelConfirm = false;
  private pendingMenuConfirm = false;
  private pendingMessageBoxTap: { index: number } | null = null;
  private pendingLevelBack = false;

  constructor(touch: TouchManager) {
    this.touch = touch;
  }

  setGrid(grid: GridAccess): void {
    this.grid = grid;
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  isControlActive(control: Control): boolean {
    return this.activeControls.has(control);
  }

  isControlHit(control: Control): boolean {
    if (this.hitControls.has(control) && !this.consumedHits.has(control)) {
      this.consumedHits.add(control);
      return true;
    }
    return false;
  }

  cancelPath(): void {
    this.path = [];
    this.pathIndex = 0;
    this.pathActive = false;
    this.fireAtDestination = false;
    this.edgeJumpControl = null;
    this.deferredPushWaitCancel = false;
    this.deferredTapPosition = null;
    this.pushDirection = null;
    this.activeControls.clear();
    this.hitControls.clear();
    this.consumedHits.clear();
  }

  consumeMenuTap(): { index: number } | null {
    const tap = this.pendingMenuTap;
    this.pendingMenuTap = null;
    return tap;
  }

  consumeMenuConfirm(): boolean {
    const v = this.pendingMenuConfirm;
    this.pendingMenuConfirm = false;
    return v;
  }

  consumeLevelTap(): { level: number } | null {
    const tap = this.pendingLevelTap;
    this.pendingLevelTap = null;
    return tap;
  }

  consumeLevelArrow(): 'left' | 'right' | null {
    const a = this.pendingLevelArrow;
    this.pendingLevelArrow = null;
    return a;
  }

  consumeLevelConfirm(): boolean {
    const v = this.pendingLevelConfirm;
    this.pendingLevelConfirm = false;
    return v;
  }

  consumeMessageBoxTap(): { index: number } | null {
    const tap = this.pendingMessageBoxTap;
    this.pendingMessageBoxTap = null;
    return tap;
  }

  consumeLevelBack(): boolean {
    const v = this.pendingLevelBack;
    this.pendingLevelBack = false;
    return v;
  }

  update(state: TouchGameState): void {
    this.activeControls.clear();
    this.hitControls.clear();
    this.consumedHits.clear();

    const tap = this.touch.tap;
    const doubleTap = this.touch.doubleTap;
    const swipeDown = this.touch.swipeDown;

    if (state.levelLoading) {
      return;
    }

    if (state.messageBoxActive) {
      this.handleMessageBoxTap(tap, state);
      return;
    }

    if (state.gameScreen === GameScreen.TitleMenu) {
      this.handleMenuTap(tap, state);
      return;
    }

    if (state.gameScreen === GameScreen.LevelSelect) {
      if (swipeDown && swipeDown.y < GAME_HEIGHT / 2) {
        this.pendingLevelBack = true;
        return;
      }
      if (state.titleMenuState === TitleMenu.LevelOptions) {
        this.handleLevelOptionsTap(tap, state);
      } else {
        this.handleLevelSelectTap(tap, state);
      }
      return;
    }

    if (state.gameScreen === GameScreen.Playing) {
      this.handleGameplayInput(tap, doubleTap);
    }
  }

  private handleMenuTap(tap: TouchPoint | null, state: TouchGameState): void {
    if (!tap) return;

    if (state.titleMenuState === TitleMenu.NewGame) return;

    const isScrollable =
      state.titleMenuState === TitleMenu.LoadGame ||
      state.titleMenuState === TitleMenu.EraseGame;

    if (isScrollable) {
      const maxVisible = 5;
      for (let screenPos = 0; screenPos < maxVisible; screenPos++) {
        const itemIndex = screenPos + state.titleScroll;
        if (itemIndex > state.titleMax) break;

        const text = state.titleOptions[itemIndex];
        if (!text || !text.trim()) continue;

        const itemY = MENU_START_Y + screenPos * MENU_SPACING - state.titleCam;
        if (
          tap.x >= MENU_X - MENU_HIT_WIDTH / 2 &&
          tap.x <= MENU_X + MENU_HIT_WIDTH / 2 &&
          tap.y >= itemY - MENU_SPACING / 2 &&
          tap.y < itemY + MENU_SPACING / 2
        ) {
          this.pendingMenuTap = { index: itemIndex };
          this.pendingMenuConfirm = true;
          return;
        }
      }
    } else {
      for (let i = state.titleMin; i <= state.titleMax; i++) {
        const text = state.titleOptions[i];
        if (!text || !text.trim()) continue;

        const itemY = MENU_START_Y + i * MENU_SPACING - state.titleCam;
        if (
          tap.x >= MENU_X - MENU_HIT_WIDTH / 2 &&
          tap.x <= MENU_X + MENU_HIT_WIDTH / 2 &&
          tap.y >= itemY - MENU_SPACING / 2 &&
          tap.y < itemY + MENU_SPACING / 2
        ) {
          this.pendingMenuTap = { index: i };
          this.pendingMenuConfirm = true;
          return;
        }
      }
    }
  }

  private handleLevelOptionsTap(tap: TouchPoint | null, state: TouchGameState): void {
    if (!tap) return;

    const leftArrowY = LS_ARROW_Y - state.titleCam;
    if (
      tap.x >= LS_LEFT_ARROW_X &&
      tap.x <= LS_LEFT_ARROW_X + ARROW_HIT_SIZE &&
      tap.y >= leftArrowY &&
      tap.y <= leftArrowY + ARROW_HIT_SIZE
    ) {
      this.pendingLevelArrow = 'left';
      return;
    }

    if (
      tap.x >= LS_RIGHT_ARROW_X &&
      tap.x <= LS_RIGHT_ARROW_X + ARROW_HIT_SIZE &&
      tap.y >= leftArrowY &&
      tap.y <= leftArrowY + ARROW_HIT_SIZE
    ) {
      this.pendingLevelArrow = 'right';
      return;
    }

    for (let i = 0; i <= state.titleMax; i++) {
      const text = state.titleOptions[i];
      if (!text || !text.trim()) continue;

      const offset = i > 1 ? 32 : 0;
      const entryY = LS_LIST_Y + i * LS_ENTRY_SPACING + offset - state.titleCam;

      if (
        tap.x >= LS_LIST_X &&
        tap.x <= LS_LIST_X + LS_ENTRY_WIDTH &&
        tap.y >= entryY &&
        tap.y <= entryY + LS_ENTRY_HEIGHT
      ) {
        this.pendingMenuTap = { index: i };
        this.pendingMenuConfirm = true;
        return;
      }
    }
  }

  private handleMessageBoxTap(tap: TouchPoint | null, state: TouchGameState): void {
    if (!tap || state.messageBoxOptions.length === 0) return;

    const MSG_HIT_WIDTH = 200;
    const MSG_HIT_HEIGHT = 20;
    const centerX = GAME_WIDTH / 2;

    for (const opt of state.messageBoxOptions) {
      if (
        tap.x >= centerX - MSG_HIT_WIDTH / 2 &&
        tap.x <= centerX + MSG_HIT_WIDTH / 2 &&
        tap.y >= opt.y - MSG_HIT_HEIGHT / 2 &&
        tap.y < opt.y + MSG_HIT_HEIGHT / 2
      ) {
        this.pendingMessageBoxTap = { index: opt.index };
        return;
      }
    }
  }

  private handleLevelSelectTap(tap: TouchPoint | null, state: TouchGameState): void {
    if (!tap) return;

    const leftArrowY = LS_ARROW_Y - state.titleCam;
    if (
      tap.x >= LS_LEFT_ARROW_X &&
      tap.x <= LS_LEFT_ARROW_X + ARROW_HIT_SIZE &&
      tap.y >= leftArrowY &&
      tap.y <= leftArrowY + ARROW_HIT_SIZE
    ) {
      this.pendingLevelArrow = 'left';
      return;
    }

    if (
      tap.x >= LS_RIGHT_ARROW_X &&
      tap.x <= LS_RIGHT_ARROW_X + ARROW_HIT_SIZE &&
      tap.y >= leftArrowY &&
      tap.y <= leftArrowY + ARROW_HIT_SIZE
    ) {
      this.pendingLevelArrow = 'right';
      return;
    }

    for (let i = 0; i < VISIBLE_LEVELS; i++) {
      const levelNum = i + state.levelScroll;
      const entryY = LS_LIST_Y + i * LS_ENTRY_SPACING - state.titleCam;

      if (
        tap.x >= LS_LIST_X &&
        tap.x <= LS_LIST_X + LS_ENTRY_WIDTH &&
        tap.y >= entryY &&
        tap.y <= entryY + LS_ENTRY_HEIGHT
      ) {
        if (levelNum === state.levelSelect) {
          this.pendingLevelConfirm = true;
        } else {
          this.pendingLevelTap = { level: levelNum };
        }
        return;
      }
    }
  }

  private handleGameplayInput(
    tap: TouchPoint | null,
    doubleTap: TouchPoint | null,
  ): void {
    const player = this.player;
    const grid = this.grid;
    if (!player || !grid) return;

    if (doubleTap) {
      this.deferredPushWaitCancel = false;
      this.deferredTapPosition = null;
      this.handleDoubleTap(doubleTap, player, grid);
      return;
    }

    if (this.deferredPushWaitCancel && !this.touch.doubleTapPossible) {
      this.deferredPushWaitCancel = false;
      if (player.GIState === GIState.PushWait && this.deferredTapPosition) {
        const behindDir = this.detectBehindDominoTap(this.deferredTapPosition, player, grid);
        if (behindDir !== null) {
          this.deferredTapPosition = null;
          this.pushDirection = behindDir;
          this.activeControls.add(behindDir);
          return;
        }
      }
      this.deferredTapPosition = null;
      this.cancelPath();
      this.pushDirection = null;
      this.hitControls.add(Control.Down);
      this.activeControls.add(Control.Down);
      return;
    }

    if (tap) {
      this.edgeJumpControl = null;
      this.handleSingleTap(tap, player, grid);
      return;
    }

    if (this.edgeJumpControl !== null) {
      this.continueEdgeJump(player);
      return;
    }

    if (this.pathActive) {
      this.advancePath(player, grid);
    }
  }

  private continueEdgeJump(player: Player): void {
    if (EDGE_JUMP_STATES.has(player.GIState)) {
      this.activeControls.add(this.edgeJumpControl!);
    } else {
      this.edgeJumpControl = null;
    }
  }

  private isPlayerSpriteTap(pos: TouchPoint, player: Player): boolean {
    const spriteX = (player.GIX - 1) * TILE_SIZE + GI_SPRITE_RENDER_OFFSET_X + player.GIXOffset;
    const spriteY = player.GIY * HALF_TILE + GI_SPRITE_RENDER_OFFSET_Y + player.GIYOffset;

    return (
      pos.x >= spriteX - PLAYER_TAP_PADDING &&
      pos.x < spriteX + GI_SPRITE_WIDTH + PLAYER_TAP_PADDING &&
      pos.y >= spriteY - PLAYER_TAP_PADDING &&
      pos.y < spriteY + GI_SPRITE_HEIGHT + PLAYER_TAP_PADDING
    );
  }

  private detectGapTap(
    pos: TouchPoint,
    player: Player,
    grid: GridAccess,
  ): Control | null {
    const py = player.GIY;
    const gapTop = py * HALF_TILE + GAP_DOMINO_RENDER_OFFSET_Y - GAP_HIT_VERTICAL_PADDING;
    const gapBottom = gapTop + GAP_DOMINO_SPRITE_HEIGHT + GAP_HIT_VERTICAL_PADDING * 2;

    if (pos.y < gapTop || pos.y >= gapBottom) return null;

    const leftBoundary = (player.GIX - 1) * TILE_SIZE;
    if (
      pos.x >= leftBoundary - GAP_HIT_HALF_WIDTH &&
      pos.x < leftBoundary + GAP_HIT_HALF_WIDTH &&
      this.hasDominoAt(grid, player.GIX - 1, py)
    ) {
      return Control.Left;
    }

    const rightBoundary = player.GIX * TILE_SIZE;
    if (
      pos.x >= rightBoundary - GAP_HIT_HALF_WIDTH &&
      pos.x < rightBoundary + GAP_HIT_HALF_WIDTH &&
      this.hasDominoAt(grid, player.GIX + 1, py)
    ) {
      return Control.Right;
    }

    return null;
  }

  private detectBehindDominoTap(
    pos: TouchPoint,
    player: Player,
    grid: GridAccess,
  ): Control | null {
    const py = player.GIY;
    const domTop = py * HALF_TILE + GAP_DOMINO_RENDER_OFFSET_Y - GAP_HIT_VERTICAL_PADDING;
    const domBottom = domTop + GAP_DOMINO_SPRITE_HEIGHT + GAP_HIT_VERTICAL_PADDING * 2;
    if (pos.y < domTop || pos.y >= domBottom) return null;

    const behindX = player.GILastMoved === 0 ? player.GIX + 1 : player.GIX;
    const newDir = player.GILastMoved === 0 ? Control.Right : Control.Left;

    const tileX = this.canvasToGridX(pos.x);
    if (tileX === behindX && this.hasDominoAt(grid, behindX, py)) {
      return newDir;
    }

    return null;
  }

  private isStationary(player: Player): boolean {
    return (
      player.GIState === GIState.Stand ||
      player.GIState === GIState.HoldLeft ||
      player.GIState === GIState.HoldRight ||
      player.GIState === GIState.Climb
    );
  }

  private handleDoubleTap(
    pos: TouchPoint,
    player: Player,
    grid: GridAccess,
  ): void {
    const tileX = this.canvasToGridX(pos.x);
    const tileY = this.canvasToGridY(pos.y);
    const py = player.GIY;

    if (player.GIState === GIState.PushWait) {
      this.deferredPushWaitCancel = false;
      if (this.isPlayerSpriteTap(pos, player) && this.pushDirection) {
        const dir = this.pushDirection;
        this.cancelPath();
        this.hitControls.add(Control.Fire);
        this.activeControls.add(Control.Fire);
        this.activeControls.add(dir);
        return;
      }
      this.cancelPath();
      this.pushDirection = null;
      this.hitControls.add(Control.Down);
      this.activeControls.add(Control.Down);
      return;
    }

    if (player.GIState === GIState.Stand) {
      if (this.isAdjacentLedgeJump(tileX, tileY, player, grid)) {
        this.cancelPath();
        this.initiateEdgeJump(tileX, player, grid);
        return;
      }
    }

    if (player.GIState === GIState.HoldLeft || player.GIState === GIState.HoldRight) {
      if (this.isPlayerSpriteTap(pos, player)) {
        this.cancelPath();
        this.hitControls.add(Control.Fire);
        this.activeControls.add(Control.Fire);
        return;
      }

      if (this.isAdjacentLedgeJump(tileX, tileY, player, grid)) {
        this.cancelPath();
        this.initiateEdgeJump(tileX, player, grid);
        return;
      }
    }

    if (player.GIDomino === 0) {
      const dominoPos = this.findDominoNearTap(tileX, tileY, grid);
      if (dominoPos && !(dominoPos.x === player.GIX && dominoPos.y === py)) {
        this.cancelPath();
        this.planPath(player.GIX, py, dominoPos.x, dominoPos.y, grid);
        if (this.path.length > 0) {
          this.pathActive = true;
          this.pathIndex = 0;
          this.fireAtDestination = true;
          this.advancePath(player, grid);
        }
        return;
      }
    }
  }

  private handleSingleTap(
    pos: TouchPoint,
    player: Player,
    grid: GridAccess,
  ): void {
    const tileX = this.canvasToGridX(pos.x);
    const tileY = this.canvasToGridY(pos.y);

    if (player.GIState === GIState.PushWait) {
      if (this.isPlayerSpriteTap(pos, player) && this.touch.doubleTapPossible) {
        this.deferredPushWaitCancel = true;
        this.deferredTapPosition = pos;
        return;
      }
      const behindDir = this.detectBehindDominoTap(pos, player, grid);
      if (behindDir !== null) {
        this.pushDirection = behindDir;
        this.activeControls.add(behindDir);
        return;
      }
      this.cancelPath();
      this.pushDirection = null;
      this.hitControls.add(Control.Down);
      this.activeControls.add(Control.Down);
      return;
    }

    if (
      player.GIState !== GIState.Stand &&
      player.GIState !== GIState.HoldLeft &&
      player.GIState !== GIState.HoldRight &&
      player.GIState !== GIState.Climb
    ) {
      return;
    }

    if (player.GIState === GIState.Stand && this.hasDominoAt(grid, player.GIX, player.GIY)) {
      const gapDir = this.detectGapTap(pos, player, grid);
      if (gapDir !== null) {
        this.cancelPath();
        this.pushDirection = gapDir;
        this.hitControls.add(Control.Up);
        this.activeControls.add(Control.Up);
        this.activeControls.add(gapDir);
        return;
      }
    }

    if (this.isPlayerSpriteTap(pos, player)) {
      if (player.GIState === GIState.Stand) {
        if (!this.hasDominoAt(grid, player.GIX, player.GIY)) {
          this.cancelPath();
          this.hitControls.add(Control.Up);
          this.activeControls.add(Control.Up);
        }
        return;
      }
      if (player.GIState === GIState.HoldLeft || player.GIState === GIState.HoldRight) {
        return;
      }
      if (player.GIState === GIState.Climb) {
        this.cancelPath();
        this.activeControls.add(player.GILastMoved ? Control.Right : Control.Left);
        return;
      }
    }

    this.cancelPath();
    this.planPath(player.GIX, player.GIY, tileX, tileY, grid);
    if (this.path.length > 0) {
      this.pathActive = true;
      this.pathIndex = 0;
      this.advancePath(player, grid);
    }
  }

  private advancePath(player: Player, grid: GridAccess): void {
    if (this.pathIndex >= this.path.length) {
      if (this.fireAtDestination) {
        this.fireAtDestination = false;
        this.pathActive = false;
        this.path = [];
        this.pathIndex = 0;
        this.activeControls.clear();
        this.hitControls.add(Control.Fire);
        this.activeControls.add(Control.Fire);
        return;
      }
      this.cancelPath();
      return;
    }

    if (
      player.GIState !== GIState.Stand &&
      player.GIState !== GIState.WalkLeft &&
      player.GIState !== GIState.WalkRight &&
      player.GIState !== GIState.ClimbUp &&
      player.GIState !== GIState.ClimbDown &&
      player.GIState !== GIState.Climb &&
      player.GIState !== GIState.UpLeft &&
      player.GIState !== GIState.UpRight &&
      player.GIState !== GIState.DownLeft &&
      player.GIState !== GIState.DownRight &&
      player.GIState !== GIState.HoldLeft &&
      player.GIState !== GIState.HoldRight &&
      player.GIState !== GIState.CarryLeft &&
      player.GIState !== GIState.CarryRight &&
      player.GIState !== GIState.CarryUpLeft &&
      player.GIState !== GIState.CarryUpRight &&
      player.GIState !== GIState.CarryDownLeft &&
      player.GIState !== GIState.CarryDownRight
    ) {
      this.cancelPath();
      return;
    }

    const seg = this.path[this.pathIndex]!;

    if (player.GIX === seg.targetX && player.GIY === seg.targetY) {
      this.pathIndex++;
      this.advancePath(player, grid);
      return;
    }

    this.activeControls.clear();

    switch (seg.type) {
      case PathSegmentType.WalkLeft:
        if (player.GIX > seg.targetX) {
          if (player.GIX > seg.targetX + 1 || this.isStationary(player)) {
            this.activeControls.add(Control.Left);
          }
        } else {
          this.pathIndex++;
          this.advancePath(player, grid);
        }
        break;

      case PathSegmentType.WalkRight:
        if (player.GIX < seg.targetX) {
          if (player.GIX < seg.targetX - 1 || this.isStationary(player)) {
            this.activeControls.add(Control.Right);
          }
        } else {
          this.pathIndex++;
          this.advancePath(player, grid);
        }
        break;

      case PathSegmentType.ClimbUp:
        if (player.GIY > seg.targetY) {
          this.activeControls.add(Control.Up);
        } else {
          this.pathIndex++;
          this.advancePath(player, grid);
        }
        break;

      case PathSegmentType.ClimbDown:
        if (player.GIY < seg.targetY) {
          this.activeControls.add(Control.Down);
        } else {
          this.pathIndex++;
          this.advancePath(player, grid);
        }
        break;
    }
  }

  planPath(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
    grid: GridAccess,
  ): void {
    this.path = [];
    this.pathIndex = 0;
    this.pathActive = false;

    if (goalX < 1 || goalX >= MAPWIDTH - 1 || goalY < 0 || goalY >= MAPHEIGHT2) return;

    if (!grid.ledge[goalX]?.[goalY]) {
      const snapped = this.snapToNearestLedge(goalX, goalY, grid);
      if (!snapped) return;
      goalY = snapped;
    }

    if (startX === goalX && startY === goalY) return;

    const result = this.bfs(startX, startY, goalX, goalY, grid);
    if (result) {
      this.path = result;
    }
  }

  private snapToNearestLedge(x: number, y: number, grid: GridAccess): number | null {
    for (let dist = 1; dist <= LEDGE_SNAP_RANGE; dist++) {
      if (y + dist < MAPHEIGHT2 && grid.ledge[x]?.[y + dist]) {
        return y + dist;
      }
      if (y - dist >= 0 && grid.ledge[x]?.[y - dist]) {
        return y - dist;
      }
    }
    return null;
  }

  private bfs(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
    grid: GridAccess,
  ): PathSegment[] | null {
    interface Node {
      x: number;
      y: number;
    }

    const key = (x: number, y: number) => `${x},${y}`;
    const visited = new Set<string>();
    const parent = new Map<string, { from: Node; type: PathSegmentType }>();
    const queue: Node[] = [{ x: startX, y: startY }];
    visited.add(key(startX, startY));

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.x === goalX && current.y === goalY) {
        return this.reconstructPath(startX, startY, goalX, goalY, parent);
      }

      if (grid.ledge[current.x]?.[current.y]) {
        if (current.x - 1 >= 1) {
          const leftKey = key(current.x - 1, current.y);
          if (!visited.has(leftKey) && grid.ledge[current.x - 1]?.[current.y]) {
            visited.add(leftKey);
            parent.set(leftKey, { from: current, type: PathSegmentType.WalkLeft });
            queue.push({ x: current.x - 1, y: current.y });
          }

          if (grid.ledge[current.x - 1]?.[current.y - 1] && !grid.ledge[current.x - 1]?.[current.y]) {
            const upLeftKey = key(current.x - 1, current.y - 1);
            if (!visited.has(upLeftKey)) {
              visited.add(upLeftKey);
              parent.set(upLeftKey, { from: current, type: PathSegmentType.WalkLeft });
              queue.push({ x: current.x - 1, y: current.y - 1 });
            }
          }

          if (
            !grid.ledge[current.x - 1]?.[current.y] &&
            grid.ledge[current.x - 1]?.[current.y + 1]
          ) {
            const downLeftKey = key(current.x - 1, current.y + 1);
            if (!visited.has(downLeftKey)) {
              visited.add(downLeftKey);
              parent.set(downLeftKey, { from: current, type: PathSegmentType.WalkLeft });
              queue.push({ x: current.x - 1, y: current.y + 1 });
            }
          }
        }

        if (current.x + 1 < MAPWIDTH - 1) {
          const rightKey = key(current.x + 1, current.y);
          if (!visited.has(rightKey) && grid.ledge[current.x + 1]?.[current.y]) {
            visited.add(rightKey);
            parent.set(rightKey, { from: current, type: PathSegmentType.WalkRight });
            queue.push({ x: current.x + 1, y: current.y });
          }

          if (grid.ledge[current.x + 1]?.[current.y - 1] && !grid.ledge[current.x + 1]?.[current.y]) {
            const upRightKey = key(current.x + 1, current.y - 1);
            if (!visited.has(upRightKey)) {
              visited.add(upRightKey);
              parent.set(upRightKey, { from: current, type: PathSegmentType.WalkRight });
              queue.push({ x: current.x + 1, y: current.y - 1 });
            }
          }

          if (
            !grid.ledge[current.x + 1]?.[current.y] &&
            grid.ledge[current.x + 1]?.[current.y + 1]
          ) {
            const downRightKey = key(current.x + 1, current.y + 1);
            if (!visited.has(downRightKey)) {
              visited.add(downRightKey);
              parent.set(downRightKey, { from: current, type: PathSegmentType.WalkRight });
              queue.push({ x: current.x + 1, y: current.y + 1 });
            }
          }
        }

        if (grid.ladder[current.x]?.[current.y - 1]) {
          let topY = current.y - 1;
          while (topY > 0 && grid.ladder[current.x]?.[topY - 1] && !grid.ledge[current.x]?.[topY]) {
            topY--;
          }
          if (grid.ledge[current.x]?.[topY]) {
            const topKey = key(current.x, topY);
            if (!visited.has(topKey)) {
              visited.add(topKey);
              parent.set(topKey, { from: current, type: PathSegmentType.ClimbUp });
              queue.push({ x: current.x, y: topY });
            }
          }
        }

        if (grid.ladder[current.x]?.[current.y + 1]) {
          let bottomY = current.y + 1;
          while (
            bottomY < MAPHEIGHT2 - 1 &&
            grid.ladder[current.x]?.[bottomY + 1] &&
            !grid.ledge[current.x]?.[bottomY]
          ) {
            bottomY++;
          }
          if (grid.ledge[current.x]?.[bottomY]) {
            const bottomKey = key(current.x, bottomY);
            if (!visited.has(bottomKey)) {
              visited.add(bottomKey);
              parent.set(bottomKey, { from: current, type: PathSegmentType.ClimbDown });
              queue.push({ x: current.x, y: bottomY });
            }
          }
        }
      }
    }

    return null;
  }

  private reconstructPath(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
    parent: Map<string, { from: { x: number; y: number }; type: PathSegmentType }>,
  ): PathSegment[] {
    const key = (x: number, y: number) => `${x},${y}`;
    const segments: PathSegment[] = [];
    let cx = goalX;
    let cy = goalY;

    while (cx !== startX || cy !== startY) {
      const info = parent.get(key(cx, cy));
      if (!info) return [];
      segments.unshift({ type: info.type, targetX: cx, targetY: cy });
      cx = info.from.x;
      cy = info.from.y;
    }

    return this.mergeSegments(segments);
  }

  private mergeSegments(segments: PathSegment[]): PathSegment[] {
    if (segments.length === 0) return [];

    const merged: PathSegment[] = [];
    let current = { ...segments[0]! };

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i]!;
      if (
        (seg.type === PathSegmentType.WalkLeft && current.type === PathSegmentType.WalkLeft) ||
        (seg.type === PathSegmentType.WalkRight && current.type === PathSegmentType.WalkRight)
      ) {
        current.targetX = seg.targetX;
        current.targetY = seg.targetY;
      } else {
        merged.push(current);
        current = { ...seg };
      }
    }
    merged.push(current);
    return merged;
  }

  private isAdjacentLedgeJump(
    tileX: number,
    tileY: number,
    player: Player,
    grid: GridAccess,
  ): boolean {
    const px = player.GIX;
    const py = player.GIY;

    if (Math.abs(tileY - py) > LEDGE_JUMP_Y_TOLERANCE) return false;

    if (tileX === px - 1 || tileX === px + 1) {
      if (!grid.ledge[tileX]?.[py] && grid.ledge[px]?.[py]) {
        return true;
      }
    }
    return false;
  }

  private initiateEdgeJump(
    tileX: number,
    player: Player,
    _grid: GridAccess,
  ): void {
    this.cancelPath();
    const control = tileX < player.GIX ? Control.Left : Control.Right;
    this.edgeJumpControl = control;
    this.activeControls.add(control);
  }

  private findDominoNearTap(
    tileX: number,
    tileY: number,
    grid: GridAccess,
  ): { x: number; y: number } | null {
    if (this.hasDominoAt(grid, tileX, tileY)) return { x: tileX, y: tileY };
    if (this.hasDominoAt(grid, tileX, tileY - 1)) return { x: tileX, y: tileY - 1 };
    if (this.hasDominoAt(grid, tileX, tileY + 1)) return { x: tileX, y: tileY + 1 };
    return null;
  }

  private hasDominoAt(grid: GridAccess, x: number, y: number): boolean {
    const col = grid.domino[x];
    if (!col) return false;
    const cell = col[y];
    if (!cell) return false;
    for (let i = 0; i < 2; i++) {
      if (
        cell[i] &&
        (grid.domState[x]?.[y]?.[i] === DominoState.Standing ||
          grid.domState[x]?.[y]?.[i] === DominoState.Pickup)
      ) {
        return true;
      }
    }
    return false;
  }

  canvasToGridX(canvasX: number): number {
    return Math.floor(canvasX / TILE_SIZE) + 1;
  }

  canvasToGridY(canvasY: number): number {
    return Math.floor((canvasY + TOUCH_Y_OFFSET) / HALF_TILE);
  }
}
