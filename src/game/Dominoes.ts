import {
  MAPWIDTH,
  MAPHEIGHT2,
  DominoType,
  DominoState,
  DOM_FPD,
  DOM_UPRIGHT,
  DOM_FRAMECHANGE_SPEED,
  DOM_TUMBLER_FRAMECHANGE_SPEED,
  DOM_FALL_SPEED,
  DOM_ASCEND_SPEED,
  DOM_DELAY_COUNT,
  DOM_STEP_DELAY_COUNT,
  DOM_STEP_SPEED_MOD,
  TILE_HEIGHT,
  EffectType,
  SoundId,
  MessageType,
} from './constants';

export interface DominoPhysicsCallbacks {
  onPlaySound(soundId: SoundId, x: number): void;
  onStartEffect(x: number, y: number, type: EffectType): void;
  onUpdateLedge(): void;
}

function create3DGrid(defaultValue: number): number[][][] {
  return Array.from({ length: MAPWIDTH }, () =>
    Array.from({ length: MAPHEIGHT2 }, () => [defaultValue, defaultValue]),
  );
}

function create2DGrid(defaultValue: number): number[][] {
  return Array.from({ length: MAPWIDTH }, () =>
    Array.from({ length: MAPHEIGHT2 }, () => defaultValue),
  );
}

export class DominoManager {
  domino: number[][][];
  domState: number[][][];
  domFrame: number[][][];
  domFrameChange: number[][][];
  domX: number[][][];
  domY: number[][][];
  domDelay: number[][][];
  rubble: number[][];
  rubbleY: number[][];

  starter = false;
  mimics = 0;
  allowedCount = 3;
  levelCompleteState = 0;
  levelCompleteMessage: MessageType | undefined = undefined;

  _ledge!: number[][];
  private _ladder!: number[][];
  private _callbacks!: DominoPhysicsCallbacks;

  constructor() {
    this.domino = create3DGrid(0);
    this.domState = create3DGrid(DominoState.Standing);
    this.domFrame = create3DGrid(DOM_UPRIGHT);
    this.domFrameChange = create3DGrid(0);
    this.domX = create3DGrid(0);
    this.domY = create3DGrid(0);
    this.domDelay = create3DGrid(0);
    this.rubble = create2DGrid(0);
    this.rubbleY = create2DGrid(0);
  }

  initialiseDominoes(): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        for (let i = 0; i < 2; i++) {
          this.domState[x][y][i] = DominoState.Standing;
          this.domFrame[x][y][i] = DOM_UPRIGHT;
          this.domFrameChange[x][y][i] = 0;
          this.domY[x][y][i] = 0;
          this.domX[x][y][i] = 0;
          this.domDelay[x][y][i] = 0;
        }
        this.rubble[x][y] = 0;
        this.rubbleY[x][y] = 0;
      }
    }
    this.starter = this.dominoPresent(DominoType.Starter);
    this.mimics = 0;
    this.allowedCount = 3;
    this.levelCompleteState = 0;
    this.levelCompleteMessage = undefined;
  }

  dominoPresent(type: DominoType): boolean {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        for (let i = 0; i < 2; i++) {
          if (this.domino[x][y][i] === type) return true;
        }
      }
    }
    return false;
  }

  updateAllowedCount(heldDominoes: number[] = []): void {
    this.allowedCount = 3;
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        for (let i = 0; i < 2; i++) {
          const state = this.domState[x][y][i];
          if (
            state === DominoState.Standing ||
            state === DominoState.Pickup ||
            state === DominoState.Putdown
          ) {
            const t = this.domino[x][y][i];
            if (t === DominoType.Count1) {
              this.allowedCount = 1;
            } else if (t === DominoType.Count2 && this.allowedCount > 1) {
              this.allowedCount = 2;
            } else if (t === DominoType.Count3 && this.allowedCount > 2) {
              this.allowedCount = 3;
            }
          }
        }
      }
    }
    for (const held of heldDominoes) {
      if (held === DominoType.Count1) {
        this.allowedCount = 1;
      } else if (held === DominoType.Count2 && this.allowedCount > 1) {
        this.allowedCount = 2;
      } else if (held === DominoType.Count3 && this.allowedCount > 2) {
        this.allowedCount = 3;
      }
    }
  }

  rebounder(x: number, y: number, layer: number): boolean {
    if (!this.starter) {
      if (this.domino[x][y][layer] === DominoType.Stopper) return true;
      if (this.domino[x][y][layer] === DominoType.Delay2 && this.domDelay[x][y][layer] === 0)
        return true;
      if (this.domino[x][y][layer] === DominoType.Count2 && this.allowedCount !== 2) return true;
      if (this.domino[x][y][layer] === DominoType.Count3 && this.allowedCount !== 3) return true;
      return false;
    } else {
      if (this.domino[x][y][layer] === DominoType.Starter) return false;
      return true;
    }
  }

  splitSplitter(x: number, y: number): void {
    this.domino[x][y][0] = DominoType.Splitter1;
    this.domFrame[x][y][0] = DOM_UPRIGHT;
    this.domFrameChange[x][y][0] = 0;
    this.domState[x][y][0] = DominoState.FallLeft;

    this.domino[x][y][1] = DominoType.Splitter1;
    this.domFrame[x][y][1] = DOM_UPRIGHT;
    this.domFrameChange[x][y][1] = 0;
    this.domState[x][y][1] = DominoState.FallRight;

    this._callbacks.onPlaySound(SoundId.Splitter, x * 32);
  }

  blowExploder(x: number, y: number, layer: number, ledge: number[][]): void {
    const l = ledge;
    const la = this._ladder;

    this._callbacks.onStartEffect(x, y - 1, EffectType.Explosion);

    this.domino[x][y][layer] = 0;
    l[x][y] = 0;
    la[x][y] = 0;
    if (x > 0 && l[x - 1][y]) la[x - 1][y] = 0;
    if (x + 1 < MAPWIDTH && l[x + 1][y]) la[x + 1][y] = 0;

    this._callbacks.onUpdateLedge();
  }

  makeRubble(x: number, y: number, color: number): void {
    let yellow = 0;
    let red = 0;

    if (color === 1 || color === 2) yellow = 1;
    if (color === 2 || color === 3) red = 1;

    if (this.rubble[x][y] === 1 || this.rubble[x][y] === 2) yellow = 1;
    if (this.rubble[x][y] === 2 || this.rubble[x][y] === 3) red = 1;

    if (yellow && red) this.rubble[x][y] = 2;
    else if (yellow) this.rubble[x][y] = 1;
    else this.rubble[x][y] = 3;

    this._callbacks.onStartEffect(x, y - 1, EffectType.Dust);
    this._callbacks.onPlaySound(SoundId.Exploder, x * 32);
  }

  private hitMimics(): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        if (this.domino[x][y][0] === DominoType.Mimic) {
          this.domState[x][y][0] =
            this.mimics === 1 ? DominoState.FallRight : DominoState.FallLeft;
        }
      }
    }
  }

  private playDominoSound(type: number, x: number): void {
    switch (type) {
      case DominoType.Tumbler:
      case DominoType.Antigrav:
        this._callbacks.onPlaySound(SoundId.Rebound, x);
        break;
      case DominoType.Trigger:
        this._callbacks.onPlaySound(SoundId.Trigger, x);
        break;
      case DominoType.Ascender:
      case DominoType.Rocket:
        this._callbacks.onPlaySound(SoundId.DominoDrop, x);
        break;
      case DominoType.Count1:
        this._callbacks.onPlaySound(SoundId.Count1, x);
        break;
      case DominoType.Count2:
        this._callbacks.onPlaySound(SoundId.Count2, x);
        break;
      case DominoType.Count3:
        this._callbacks.onPlaySound(SoundId.Count3, x);
        break;
      case DominoType.Vanisher:
        this._callbacks.onPlaySound(SoundId.Vanisher, x);
        break;
      case DominoType.Delay2:
        this._callbacks.onPlaySound(SoundId.Delay, x);
        break;
      default:
        this._callbacks.onPlaySound(SoundId.Domino, x);
        break;
    }
  }

  levelComplete(
    ledge: number[][],
    heldDominoes: number[] = [],
  ): { complete: boolean; message?: MessageType } {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        for (let i = 0; i < 2; i++) {
          if (this.domino[x][y][i]) {
            let exempt = true;
            const type = this.domino[x][y][i];

            if (
              type !== DominoType.Trigger &&
              type !== DominoType.Ascender &&
              type !== DominoType.Antigrav
            ) {
              for (let y2 = y; y2 < MAPHEIGHT2; y2++) {
                if (ledge[x][y2]) exempt = false;
              }
            }

            if (type === DominoType.Ascender) {
              for (let y2 = y; y2 >= 0; y2--) {
                if (ledge[x][y2]) exempt = false;
              }
            }

            if (type === DominoType.Trigger && this.domState[x][y][i] === DominoState.Standing) {
              exempt = false;
            }

            if (!exempt) {
              if (this.domFrame[x][y][i] === DOM_UPRIGHT && type !== DominoType.Stopper) {
                return { complete: false, message: MessageType.NotAllToppled };
              }
              if (this.domFrameChange[x][y][i] !== 0) {
                return { complete: false, message: MessageType.NotAllToppled };
              }
              for (const held of heldDominoes) {
                if (held > 0) {
                  return { complete: false, message: MessageType.StillHolding };
                }
              }
            }
          }
        }
        if (this.rubble[x][y]) {
          return { complete: false, message: MessageType.Crashed };
        }
      }
    }
    return { complete: true };
  }

  private handleFreefallLanding(
    x: number,
    y: number,
    i: number,
    ledge: number[][],
  ): boolean {
    // Check splitter
    for (let i2 = 0; i2 < 2; i2++) {
      if (
        this.domino[x][y + 1][i2] === DominoType.Splitter1 &&
        this.domState[x][y + 1][i2] === DominoState.Standing
      ) {
        this.domino[x][y][i] = 0;
        this.splitSplitter(x, y + 1);
        return true;
      }
    }

    // Falls on a domino
    for (let i2 = 0; i2 < 2; i2++) {
      if (
        this.domino[x][y + 1][i2] > 0 &&
        this.domFrame[x][y + 1][i2] > 0 &&
        this.domFrame[x][y + 1][i2] < 12
      ) {
        if (
          this.domino[x][y][i] === DominoType.Standard &&
          this.domino[x][y + 1][i2] === DominoType.Standard
        )
          this.makeRubble(x, y + 1, 1);
        else if (
          this.domino[x][y][i] === DominoType.Stopper &&
          this.domino[x][y + 1][i2] === DominoType.Stopper
        )
          this.makeRubble(x, y + 1, 3);
        else this.makeRubble(x, y + 1, 2);

        this.domino[x][y][i] = 0;
        this.domino[x][y + 1][0] = 0;
        this.domino[x][y + 1][1] = 0;
        return true;
      }
    }

    // Collision with ascending domino
    if (y > 0) {
      for (let i2 = 0; i2 < 2; i2++) {
        if (
          this.domino[x][y - 1][i2] > 0 &&
          this.domFrame[x][y - 1][i2] === DOM_UPRIGHT &&
          ledge[x][y - 1] === 0
        ) {
          if (
            this.domino[x][y][i] === DominoType.Standard &&
            this.domino[x][y - 1][i2] === DominoType.Standard
          )
            this.makeRubble(x, y, 1);
          else if (
            this.domino[x][y][i] === DominoType.Stopper &&
            this.domino[x][y - 1][i2] === DominoType.Stopper
          )
            this.makeRubble(x, y, 3);
          else this.makeRubble(x, y, 2);

          this.domino[x][y][i] = 0;
          this.domino[x][y - 1][0] = 0;
          this.domino[x][y - 1][1] = 0;
          return true;
        }
      }
    }

    // Falls on rubble
    if (this.rubble[x][y + 1]) {
      if (this.domino[x][y][i] === DominoType.Standard) this.makeRubble(x, y + 1, 1);
      else if (this.domino[x][y][i] === DominoType.Stopper) this.makeRubble(x, y + 1, 3);
      else this.makeRubble(x, y + 1, 2);

      this.domino[x][y][i] = 0;
      this.domino[x][y + 1][0] = 0;
      this.domino[x][y + 1][1] = 0;
      return true;
    }

    // Decide which layer to land on
    let landLayer: number;
    if (this.domino[x][y + 1][0] === 0) {
      landLayer = 0;
    } else if (this.domino[x][y + 1][1] === 0) {
      landLayer = 1;
    } else {
      // Both layers occupied - rubble
      this.domino[x][y][i] = 0;
      this.domino[x][y + 1][0] = 0;
      this.domino[x][y + 1][1] = 0;
      this.makeRubble(x, y, 2);
      this.makeRubble(x, y, 1);
      return true;
    }

    this.domino[x][y + 1][landLayer] = this.domino[x][y][i];
    this.domino[x][y][i] = 0;
    // Faithful to original: reads domino type (now 0) instead of domY
    this.domY[x][y + 1][landLayer] = this.domino[x][y][i] - TILE_HEIGHT - DOM_FALL_SPEED;
    this.domState[x][y + 1][landLayer] = this.domState[x][y][i];
    this.domFrame[x][y + 1][landLayer] = this.domFrame[x][y][i];
    this.domFrameChange[x][y + 1][landLayer] = this.domFrameChange[x][y][i];

    if (ledge[x][y + 1] > 0) {
      this.domY[x][y + 1][landLayer] = 0;
    }
    return false;
  }

  private handleFreefallLandingWithDelay(
    x: number,
    y: number,
    i: number,
    ledge: number[][],
  ): boolean {
    // Same as handleFreefallLanding but also copies domDelay
    for (let i2 = 0; i2 < 2; i2++) {
      if (
        this.domino[x][y + 1][i2] === DominoType.Splitter1 &&
        this.domState[x][y + 1][i2] === DominoState.Standing
      ) {
        this.domino[x][y][i] = 0;
        this.splitSplitter(x, y + 1);
        return true;
      }
    }

    for (let i2 = 0; i2 < 2; i2++) {
      if (
        this.domino[x][y + 1][i2] > 0 &&
        this.domFrame[x][y + 1][i2] > 0 &&
        this.domFrame[x][y + 1][i2] < 12
      ) {
        if (
          this.domino[x][y][i] === DominoType.Standard &&
          this.domino[x][y + 1][i2] === DominoType.Standard
        )
          this.makeRubble(x, y + 1, 1);
        else if (
          this.domino[x][y][i] === DominoType.Stopper &&
          this.domino[x][y + 1][i2] === DominoType.Stopper
        )
          this.makeRubble(x, y + 1, 3);
        else this.makeRubble(x, y + 1, 2);

        this.domino[x][y][i] = 0;
        this.domino[x][y + 1][0] = 0;
        this.domino[x][y + 1][1] = 0;
        return true;
      }
    }

    if (y > 0) {
      for (let i2 = 0; i2 < 2; i2++) {
        if (
          this.domino[x][y - 1][i2] > 0 &&
          this.domFrame[x][y - 1][i2] === DOM_UPRIGHT &&
          ledge[x][y - 1] === 0
        ) {
          if (
            this.domino[x][y][i] === DominoType.Standard &&
            this.domino[x][y - 1][i2] === DominoType.Standard
          )
            this.makeRubble(x, y, 1);
          else if (
            this.domino[x][y][i] === DominoType.Stopper &&
            this.domino[x][y - 1][i2] === DominoType.Stopper
          )
            this.makeRubble(x, y, 3);
          else this.makeRubble(x, y, 2);

          this.domino[x][y][i] = 0;
          this.domino[x][y - 1][0] = 0;
          this.domino[x][y - 1][1] = 0;
          return true;
        }
      }
    }

    if (this.rubble[x][y + 1]) {
      if (this.domino[x][y][i] === DominoType.Standard) this.makeRubble(x, y + 1, 1);
      else if (this.domino[x][y][i] === DominoType.Stopper) this.makeRubble(x, y + 1, 3);
      else this.makeRubble(x, y + 1, 2);

      this.domino[x][y][i] = 0;
      this.domino[x][y + 1][0] = 0;
      this.domino[x][y + 1][1] = 0;
      return true;
    }

    let landLayer: number;
    if (this.domino[x][y + 1][0] === 0) {
      landLayer = 0;
    } else if (this.domino[x][y + 1][1] === 0) {
      landLayer = 1;
    } else {
      this.domino[x][y][i] = 0;
      this.domino[x][y + 1][0] = 0;
      this.domino[x][y + 1][1] = 0;
      this.makeRubble(x, y, 2);
      this.makeRubble(x, y, 1);
      return true;
    }

    this.domino[x][y + 1][landLayer] = this.domino[x][y][i];
    this.domino[x][y][i] = 0;
    this.domY[x][y + 1][landLayer] = this.domino[x][y][i] - TILE_HEIGHT - DOM_FALL_SPEED;
    this.domState[x][y + 1][landLayer] = this.domState[x][y][i];
    this.domFrame[x][y + 1][landLayer] = this.domFrame[x][y][i];
    this.domFrameChange[x][y + 1][landLayer] = this.domFrameChange[x][y][i];
    this.domDelay[x][y + 1][landLayer] = this.domDelay[x][y][i];

    if (ledge[x][y + 1] > 0) {
      this.domY[x][y + 1][landLayer] = 0;
    }
    return false;
  }

  private handleKnockOver(
    x: number,
    y: number,
    i: number,
    direction: 'left' | 'right',
    knockerX: number,
    knockerY: number,
    knockerLayer: number,
    isAscender: boolean,
    ledge: number[][],
    _ladder: number[][],
    callbacks: DominoPhysicsCallbacks,
    heldDominoes: number[],
  ): void {
    const fallState =
      direction === 'right' ? DominoState.FallRight : DominoState.FallLeft;
    const ascReboundState =
      direction === 'right' ? DominoState.AscLeft : DominoState.AscRight;
    void ascReboundState;

    if (!this.rebounder(x, y, i)) {
      if (this.domino[x][y][i] === DominoType.Exploder) {
        this.blowExploder(x, y, i, ledge);
        callbacks.onPlaySound(SoundId.Exploder, x * 32);
        return;
      }
      if (this.domino[x][y][i] === DominoType.Splitter1) {
        this.domino[x][y][i] = 0;
        this.splitSplitter(x, y);
        return;
      }
      if (this.domino[x][y][i] === DominoType.Starter) {
        this.starter = false;
      }
      if (this.domino[x][y][i] === DominoType.Mimic) {
        this.mimics = direction === 'right' ? 1 : -1;
      }
    }

    if (this.rebounder(x, y, i)) {
      if (isAscender) {
        this.domState[knockerX][knockerY][knockerLayer] = ascReboundState;
      } else {
        if (direction === 'right') {
          this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallLeft;
        } else {
          this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallRight;
          this.domFrameChange[knockerX][knockerY][knockerLayer] -= DOM_FRAMECHANGE_SPEED;
        }
      }

      if (this.domino[x][y][i] === DominoType.Delay2 && this.domDelay[x][y][i] === 0 && !this.starter) {
        this.domDelay[x][y][i] = direction === 'right' ? DOM_DELAY_COUNT : -DOM_DELAY_COUNT;
      }

      // Cancel rebound checks
      if (!isAscender) {
        if (direction === 'right') {
          // Two blocks on rebounding tile
          if (this.domino[knockerX][knockerY][0] > 0 && this.domino[knockerX][knockerY][1] > 0) {
            this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallRight;
            this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
            this.domFrame[knockerX][knockerY][knockerLayer] = 10;
          }
          // Leant on from further left
          if (knockerX > 0) {
            for (let i3 = 0; i3 < 2; i3++) {
              if (
                this.domino[knockerX - 1][knockerY][i3] > 0 &&
                this.domFrame[knockerX - 1][knockerY][i3] > DOM_UPRIGHT
              ) {
                this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallRight;
                this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
                this.domFrame[knockerX][knockerY][knockerLayer] = 10;
              }
            }
          }
          if (this.domState[knockerX][knockerY][knockerLayer] === DominoState.FallLeft)
            callbacks.onPlaySound(SoundId.Rebound, x * 32);
          else if (this.domDelay[x][y][i] === DOM_DELAY_COUNT)
            callbacks.onPlaySound(SoundId.Delay, x * 32);
        } else {
          // direction === 'left'
          if (this.domino[knockerX][knockerY][0] > 0 && this.domino[knockerX][knockerY][1] > 0) {
            this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallLeft;
            this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
          }
          if (knockerX + 1 < MAPWIDTH) {
            for (let i3 = 0; i3 < 2; i3++) {
              if (
                this.domino[knockerX + 1][knockerY][i3] > 0 &&
                this.domFrame[knockerX + 1][knockerY][i3] < DOM_UPRIGHT
              ) {
                this.domState[knockerX][knockerY][knockerLayer] = DominoState.FallLeft;
                this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
              }
            }
          }
          if (this.domState[knockerX][knockerY][knockerLayer] === DominoState.FallRight)
            callbacks.onPlaySound(SoundId.Rebound, x * 32);
          else if (this.domDelay[x][y][i] === -DOM_DELAY_COUNT)
            callbacks.onPlaySound(SoundId.Delay, x * 32);
        }
      } else {
        // isAscender rebound cancel checks
        if (direction === 'right') {
          if (knockerX > 0) {
            for (let i3 = 0; i3 < 2; i3++) {
              if (
                this.domino[knockerX - 1][knockerY][i3] > 0 &&
                this.domFrame[knockerX - 1][knockerY][i3] > DOM_UPRIGHT
              ) {
                this.domState[knockerX][knockerY][knockerLayer] = DominoState.AscRight;
                this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
                break;
              }
            }
          }
          if (this.domState[knockerX][knockerY][knockerLayer] === DominoState.AscLeft)
            callbacks.onPlaySound(SoundId.Rebound, x * 32);
          else if (this.domDelay[x][y][i] === DOM_DELAY_COUNT)
            callbacks.onPlaySound(SoundId.Delay, x * 32);
        } else {
          if (knockerX + 2 < MAPWIDTH) {
            for (let i3 = 0; i3 < 2; i3++) {
              if (
                this.domino[knockerX + 1][knockerY][i3] > 0 &&
                this.domFrame[knockerX + 1][knockerY][i3] < DOM_UPRIGHT
              ) {
                this.domState[knockerX][knockerY][knockerLayer] = DominoState.AscLeft;
                this.domFrameChange[knockerX][knockerY][knockerLayer] = 0;
                break;
              }
            }
          }
          if (this.domState[knockerX][knockerY][knockerLayer] === DominoState.AscRight)
            callbacks.onPlaySound(SoundId.Rebound, x * 32);
          else if (this.domDelay[x][y][i] === -DOM_DELAY_COUNT)
            callbacks.onPlaySound(SoundId.Delay, x * 32);
        }
      }
    } else {
      // Not a rebounder - get knocked over
      if (this.domino[x][y][i] !== DominoType.Delay2 || this.domDelay[x][y][i] === 0) {
        this.playDominoSound(this.domino[x][y][i], x * 32);
        this.domState[x][y][i] = fallState;
        if (direction === 'right') {
          this.domFrameChange[x][y][i] = 0;
        } else {
          this.domFrameChange[x][y][i] = -DOM_FRAMECHANGE_SPEED;
        }
        if (
          direction === 'right' &&
          (this.domino[x][y][i] === DominoType.Count1 ||
            this.domino[x][y][i] === DominoType.Count2 ||
            this.domino[x][y][i] === DominoType.Count3)
        ) {
          this.updateAllowedCount(heldDominoes);
        }
      }
    }
  }

  processDominoes(
    ledge: number[][],
    ladder: number[][],
    callbacks: DominoPhysicsCallbacks,
    heldDominoes: number[] = [],
  ): void {
    this._ledge = ledge;
    this._ladder = ladder;
    this._callbacks = callbacks;

    let b = false;
    let completeCheck = false;
    const prevMimics = this.mimics;

    this.updateAllowedCount(heldDominoes);

    // Process rubble
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        if (this.rubble[x][y] && !ledge[x][y]) {
          this.rubbleY[x][y] += DOM_FALL_SPEED;
          if (this.rubbleY[x][y] >= 16 && y + 1 < MAPHEIGHT2) {
            if (this.rubble[x][y + 1]) {
              this.makeRubble(x, y + 1, this.rubble[x][y]);
              this.rubble[x][y] = 0;
            } else {
              for (let i = 0; i < 2; i++) {
                if (this.domino[x][y + 1][i]) {
                  if (this.domino[x][y + 1][i] === DominoType.Standard)
                    this.makeRubble(x, y, 0);
                  else if (this.domino[x][y + 1][i] === DominoType.Stopper)
                    this.makeRubble(x, y, 1);
                  else this.makeRubble(x, y, 2);
                  this.domino[x][y + 1][i] = 0;
                }
              }
              this.rubbleY[x][y + 1] = this.rubbleY[x][y] - 16 - DOM_FALL_SPEED;
              this.rubbleY[x][y] = 0;
              this.rubble[x][y + 1] = this.rubble[x][y];
              this.rubble[x][y] = 0;
              callbacks.onStartEffect(x, y, EffectType.Dust);
            }
          } else if (this.rubbleY[x][y] > 48) {
            this.rubbleY[x][y] = 0;
            this.rubble[x][y] = 0;
          }
        } else {
          this.rubbleY[x][y] = 0;
        }
      }
    }

    // Process dominoes
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        for (let i = 0; i < 2; i++) {
          if (this.domino[x][y][i]) {
            // Set ascenders to correct state
            if (this.domino[x][y][i] === DominoType.Ascender) {
              if (this.domState[x][y][i] === DominoState.FallLeft)
                this.domState[x][y][i] = DominoState.AscLeft;
              else if (this.domState[x][y][i] === DominoState.FallRight)
                this.domState[x][y][i] = DominoState.AscRight;
            }

            // Set rockets to correct state
            if (this.domino[x][y][i] === DominoType.Rocket) {
              if (
                this.domState[x][y][i] === DominoState.FallLeft ||
                this.domState[x][y][i] === DominoState.FallRight
              )
                this.domState[x][y][i] = DominoState.Ascend;
            }

            // Frame change
            if (this.domFrameChange[x][y][i] <= -1.0 && this.domFrame[x][y][i] > 0) {
              this.domFrameChange[x][y][i] += 1.0;
              this.domFrame[x][y][i]--;
            } else if (
              this.domFrameChange[x][y][i] >= 1.0 &&
              this.domFrame[x][y][i] < DOM_FPD - 1
            ) {
              this.domFrameChange[x][y][i] -= 1.0;
              this.domFrame[x][y][i]++;
            }

            switch (this.domState[x][y][i]) {
              case DominoState.Standing: {
                if (ledge[x][y] === 0) {
                  // Freefall
                  if (this.domino[x][y][i] === DominoType.Ascender) {
                    this.domState[x][y][i] = DominoState.Ascend;
                    break;
                  }

                  this.domY[x][y][i] += DOM_FALL_SPEED;
                  if (this.domY[x][y][i] >= TILE_HEIGHT && y + 1 < MAPHEIGHT2) {
                    b = this.handleFreefallLanding(x, y, i, ledge);
                    if (b) break;
                  }
                } else {
                  // On a ledge - check knock-overs

                  // From the left, fall right
                  if (x > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 1][y][i2] > 0 &&
                        this.domFrame[x - 1][y][i2] >= 9 &&
                        this.domFrame[x - 1][y][i2] < DOM_FPD - 1 &&
                        this.domState[x - 1][y][i2] === DominoState.FallRight
                      ) {
                        this.handleKnockOver(
                          x, y, i, 'right',
                          x - 1, y, i2, false,
                          ledge, ladder, callbacks, heldDominoes,
                        );
                      }
                    }
                  }

                  // Knocked by ascender from the left, fall right
                  if (x > 0 && y > 1) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 1][y - 1][i2] === DominoType.Ascender &&
                        this.domState[x - 1][y - 1][i2] === DominoState.AscRight &&
                        this.domFrame[x - 1][y - 1][i2] === 10
                      ) {
                        this.handleKnockOver(
                          x, y, i, 'right',
                          x - 1, y - 1, i2, true,
                          ledge, ladder, callbacks, heldDominoes,
                        );
                      }
                    }
                  }

                  // From the right, fall left
                  if (x + 1 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x + 1][y][i2] > 0 &&
                        this.domFrame[x + 1][y][i2] <= 3 &&
                        this.domFrame[x + 1][y][i2] > 0 &&
                        this.domState[x + 1][y][i2] === DominoState.FallLeft
                      ) {
                        this.handleKnockOver(
                          x, y, i, 'left',
                          x + 1, y, i2, false,
                          ledge, ladder, callbacks, heldDominoes,
                        );
                      }
                    }
                  }

                  // Knocked by ascender from the right, fall left
                  if (x + 1 < MAPWIDTH && y > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x + 1][y - 1][i2] === DominoType.Ascender &&
                        this.domState[x + 1][y - 1][i2] === DominoState.AscLeft &&
                        this.domFrame[x + 1][y - 1][i2] === 2
                      ) {
                        this.handleKnockOver(
                          x, y, i, 'left',
                          x + 1, y - 1, i2, true,
                          ledge, ladder, callbacks, heldDominoes,
                        );
                      }
                    }
                  }

                  // Delay count
                  if (
                    (this.domino[x][y][i] === DominoType.Delay2 ||
                      this.domino[x][y][i] === DominoType.Delay1) &&
                    this.domDelay[x][y][i] > 0
                  ) {
                    this.domDelay[x][y][i] -= 1;
                    if (this.domDelay[x][y][i] === 0) {
                      this.domState[x][y][i] = DominoState.FallRight;
                    }
                  }

                  if (
                    (this.domino[x][y][i] === DominoType.Delay2 ||
                      this.domino[x][y][i] === DominoType.Delay1) &&
                    this.domDelay[x][y][i] < 0
                  ) {
                    this.domDelay[x][y][i] += 1;
                    if (this.domDelay[x][y][i] === 0) {
                      this.domState[x][y][i] = DominoState.FallLeft;
                    }
                  }
                }
                break;
              }

              case DominoState.FallLeft: {
                // Off edge of screen
                if (x === 0 && this.domFrame[x][y][i] < DOM_UPRIGHT) {
                  this.domino[x][y][i] = 0;
                  break;
                }

                // Decrease frame
                if (
                  x + 1 < MAPWIDTH &&
                  y > 0 &&
                  ledge[x][y] &&
                  ledge[x + 1][y - 1]
                ) {
                  this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED * DOM_STEP_SPEED_MOD;
                } else {
                  if (ledge[x][y] > 0 || this.domino[x][y][i] === DominoType.Antigrav) {
                    if (x > 0) {
                      if (
                        (this.domino[x][y][i] === DominoType.Tumbler ||
                          this.domino[x][y][i] === DominoType.Antigrav) &&
                        this.domino[x - 1][y][i] === 0
                      )
                        this.domFrameChange[x][y][i] -= DOM_TUMBLER_FRAMECHANGE_SPEED;
                      else this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED;
                    } else {
                      this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED;
                    }
                  }

                  if (this.domFrame[x][y][i] > DOM_UPRIGHT) {
                    if (ledge[x][y] === 0 && this.domino[x][y][i] !== DominoType.Antigrav)
                      this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED;
                    else {
                      if (
                        this.domino[x][y][i] === DominoType.Tumbler ||
                        this.domino[x][y][i] === DominoType.Antigrav
                      )
                        this.domFrameChange[x][y][i] -= DOM_TUMBLER_FRAMECHANGE_SPEED;
                    }
                  }
                }

                // Step delay
                if (this.domFrame[x][y][i] === DOM_UPRIGHT && this.domDelay[x][y][i] !== 0) {
                  this.domState[x][y][i] = DominoState.Standing;
                  this.domFrameChange[x][y][i] = 0;
                }

                // Don't allow tumbler to rise if leant on
                if (this.domFrame[x][y][i] > DOM_UPRIGHT) {
                  if (x > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 1][y][i2] > 0 &&
                        this.domFrame[x - 1][y][i2] > DOM_UPRIGHT &&
                        (ledge[x][y] || this.domino[x][y][i] === DominoType.Antigrav)
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                        if (this.domFrame[x][y][i] < DOM_FPD - 1) this.domFrame[x][y][i]++;
                      }
                    }
                  }
                }

                // Both blocks on tile fall same way - rubble
                if (this.domFrame[x][y][i] < DOM_UPRIGHT) {
                  if (
                    this.domino[x][y][1 - i] &&
                    this.domFrame[x][y][1 - i] < DOM_UPRIGHT
                  ) {
                    if (this.domino[x][y][i] === DominoType.Standard && this.domino[x][y][1 - i])
                      this.makeRubble(x, y, 1);
                    else if (
                      this.domino[x][y][i] === DominoType.Stopper &&
                      this.domino[x][y][1 - i] === DominoType.Stopper
                    )
                      this.makeRubble(x, y, 3);
                    else this.makeRubble(x, y, 2);

                    this.domino[x][y][i] = 0;
                    this.domino[x][y][1 - i] = 0;
                  }
                }

                // Bad collision with adjacent tile - rubble
                if (x > 0) {
                  if (
                    this.domFrame[x][y][i] < 1 ||
                    (this.domFrame[x][y][i] < 3 &&
                      this.domino[x][y][i] !== DominoType.Vanisher)
                  ) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 1][y][i2] &&
                        this.domState[x - 1][y][i2] === DominoState.FallRight &&
                        this.domFrame[x - 1][y][i2] > DOM_UPRIGHT + 2
                      ) {
                        if (this.domino[x][y][i] === DominoType.Standard)
                          this.makeRubble(x, y, 1);
                        else if (this.domino[x][y][i] === DominoType.Stopper)
                          this.makeRubble(x, y, 3);
                        else this.makeRubble(x, y, 2);
                        this.domino[x][y][i] = 0;
                      }
                    }
                  }
                }

                // No ledge beneath, fall
                if (
                  ledge[x][y] === 0 &&
                  this.domino[x][y][i] !== DominoType.Antigrav &&
                  this.domFrame[x][y][i] < 12
                ) {
                  if (this.domFrame[x][y][i] < DOM_UPRIGHT)
                    this.domState[x][y][i] = DominoState.FallRight;

                  this.domY[x][y][i] += DOM_FALL_SPEED;
                  if (this.domY[x][y][i] >= TILE_HEIGHT && y + 1 < MAPHEIGHT2) {
                    b = this.handleFreefallLandingWithDelay(x, y, i, ledge);
                    if (b) break;
                  } else if (this.domY[x][y][i] >= 64) {
                    this.domino[x][y][i] = 0;
                  }
                }

                // Block obstacle checks
                if (this.domFrame[x][y][i] === 1 && x > 0) {
                  for (let i2 = 0; i2 < 2; i2++) {
                    if (this.domino[x - 1][y][i2] > 0) {
                      if (this.domino[x][y][i] === DominoType.Vanisher) {
                        this.domino[x][y][i] = 0;
                        break;
                      }
                      this.domFrameChange[x][y][i] = 0;
                    }
                  }
                }

                if (this.domFrame[x][y][i] === 1 && x > 1) {
                  for (let i2 = 0; i2 < 2; i2++) {
                    if (this.domino[x - 2][y][i2] > 0 && this.domFrame[x - 2][y][i2] >= 10) {
                      if (this.domino[x][y][i] === DominoType.Vanisher) {
                        this.domino[x][y][i] = 0;
                        break;
                      }
                      this.domFrameChange[x][y][i] = 0;
                    }
                  }
                }

                if (
                  this.domFrame[x][y][i] === 2 ||
                  (this.domFrame[x][y][i] === 3 && this.domFrameChange[x][y][i] < 0)
                ) {
                  if (x > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 1][y][i2] > 0 &&
                        this.domFrame[x - 1][y][i2] === DOM_UPRIGHT
                      ) {
                        this.domFrame[x][y][i] = 2;
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }
                }

                if (this.domFrame[x][y][i] === 2 && x > 0 && y > 0) {
                  if (ledge[x - 1][y - 1] > 0) {
                    this.domFrameChange[x][y][i] = 0;
                  }
                }

                if (this.domFrame[x][y][i] === 2 && x > 0) {
                  if (this.rubble[x - 1][y] > 0) {
                    this.domFrameChange[x][y][i] = 0;
                  }
                }

                // Have fallen flat
                if (this.domFrame[x][y][i] === 0) {
                  this.domFrameChange[x][y][i] = 0;

                  if (this.domino[x][y][i] === DominoType.Vanisher) {
                    this.domino[x][y][i] = 0;
                    break;
                  }

                  if (x > 0) {
                    // Bridger
                    if (this.domino[x][y][i] === DominoType.Bridger && x - 1 > 0) {
                      if (ledge[x - 1][y] === 0 && ledge[x - 2][y] > 0) {
                        this.domino[x][y][i] = 0;
                        ledge[x - 1][y] = 1;
                        callbacks.onUpdateLedge();
                        callbacks.onPlaySound(SoundId.Bridger, x * 32);
                      }
                    }

                    // No ledge or tumbler/antigrav - move to next tile left
                    if (
                      ledge[x - 1][y] === 0 ||
                      this.domino[x][y][i] === DominoType.Tumbler ||
                      this.domino[x][y][i] === DominoType.Antigrav
                    ) {
                      let moveTo = 0;
                      if (this.domino[x - 1][y][0] > 0) moveTo = 1;

                      this.domino[x - 1][y][moveTo] = this.domino[x][y][i];
                      this.domino[x][y][i] = 0;

                      this.domState[x - 1][y][moveTo] = DominoState.FallLeft;
                      this.domFrame[x - 1][y][moveTo] = 12;
                      this.domFrameChange[x - 1][y][moveTo] =
                        this.domFrameChange[x][y][i] - DOM_FRAMECHANGE_SPEED * 2;
                      if (
                        (this.domino[x - 1][y][moveTo] === DominoType.Tumbler ||
                          this.domino[x - 1][y][moveTo] === DominoType.Antigrav) &&
                        ledge[x - 1][y]
                      ) {
                        this.domFrameChange[x - 1][y][moveTo] = -DOM_TUMBLER_FRAMECHANGE_SPEED;
                      }
                      this.domY[x - 1][y][i] = 0;

                      // Flip splitters & delays
                      if (this.domino[x - 1][y][moveTo] === DominoType.Delay1)
                        this.domino[x - 1][y][moveTo] = DominoType.Delay2;
                      else if (this.domino[x - 1][y][moveTo] === DominoType.Delay2)
                        this.domino[x - 1][y][moveTo] = DominoType.Delay1;
                      else if (this.domino[x - 1][y][moveTo] === DominoType.Splitter1)
                        this.domino[x - 1][y][moveTo] = DominoType.Splitter2;
                      else if (this.domino[x - 1][y][moveTo] === DominoType.Splitter2)
                        this.domino[x - 1][y][moveTo] = DominoType.Splitter1;

                      // Fall sound
                      if (
                        ledge[x - 1][y] === 0 &&
                        (y + 1 >= MAPHEIGHT2 || ledge[x - 1][y + 1] === 0) &&
                        this.domino[x - 1][y][moveTo] !== DominoType.Antigrav
                      ) {
                        callbacks.onPlaySound(SoundId.DominoDrop, x * 32);
                      } else if (
                        this.domino[x - 1][y][moveTo] === DominoType.Delay1 ||
                        this.domino[x - 1][y][moveTo] === DominoType.Delay2
                      ) {
                        this.domDelay[x - 1][y][moveTo] = -DOM_STEP_DELAY_COUNT;
                      }

                      break;
                    }
                  }

                  // Trigger - check if complete
                  if (this.domino[x][y][i] === DominoType.Trigger) {
                    completeCheck = true;
                  }
                }
                break;
              }

              case DominoState.FallRight: {
                // Off edge of screen (faithful to original: x === MAPWIDTH is unreachable)
                if (x === MAPWIDTH && this.domFrame[x][y][i] > DOM_UPRIGHT) {
                  this.domino[x][y][i] = 0;
                  break;
                }

                // Increase frame
                if (
                  x > 0 &&
                  y > 0 &&
                  ledge[x][y] &&
                  ledge[x - 1][y - 1]
                ) {
                  this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED * DOM_STEP_SPEED_MOD;
                } else {
                  if (ledge[x][y] > 0 || this.domino[x][y][i] === DominoType.Antigrav) {
                    if (x + 1 < MAPWIDTH) {
                      if (
                        (this.domino[x][y][i] === DominoType.Tumbler ||
                          this.domino[x][y][i] === DominoType.Antigrav) &&
                        this.domino[x + 1][y][i] === 0
                      )
                        this.domFrameChange[x][y][i] += DOM_TUMBLER_FRAMECHANGE_SPEED;
                      else this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED;
                    } else {
                      this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED;
                    }
                  }

                  if (this.domFrame[x][y][i] < DOM_UPRIGHT) {
                    if (ledge[x][y] === 0) this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED;
                    else {
                      if (
                        this.domino[x][y][i] === DominoType.Tumbler ||
                        this.domino[x][y][i] === DominoType.Antigrav
                      )
                        this.domFrameChange[x][y][i] += DOM_TUMBLER_FRAMECHANGE_SPEED;
                    }
                  }
                }

                // Step delay
                if (this.domFrame[x][y][i] === DOM_UPRIGHT && this.domDelay[x][y][i] !== 0) {
                  this.domState[x][y][i] = DominoState.Standing;
                  this.domFrameChange[x][y][i] = 0;
                }

                // Don't allow tumbler to rise if leant on
                if (this.domFrame[x][y][i] < DOM_UPRIGHT) {
                  if (x + 1 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x + 1][y][i2] > 0 &&
                        this.domFrame[x + 1][y][i2] < DOM_UPRIGHT &&
                        (ledge[x][y] || this.domino[x][y][i] === DominoType.Antigrav)
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                        if (this.domFrame[x][y][i] > 0) this.domFrame[x][y][i]--;
                      }
                    }
                  }
                }

                // Both blocks on tile fall same way - rubble
                if (this.domFrame[x][y][i] > DOM_UPRIGHT) {
                  if (
                    this.domino[x][y][1 - i] &&
                    this.domFrame[x][y][1 - i] > DOM_UPRIGHT
                  ) {
                    if (this.domino[x][y][i] === DominoType.Standard && this.domino[x][y][1 - i])
                      this.makeRubble(x, y, 1);
                    else if (
                      this.domino[x][y][i] === DominoType.Stopper &&
                      this.domino[x][y][1 - i] === DominoType.Stopper
                    )
                      this.makeRubble(x, y, 3);
                    else this.makeRubble(x, y, 2);

                    this.domino[x][y][i] = 0;
                    this.domino[x][y][1 - i] = 0;
                  }
                }

                // No ledge beneath, fall
                if (
                  ledge[x][y] === 0 &&
                  this.domino[x][y][i] !== DominoType.Antigrav &&
                  this.domFrame[x][y][i] > 0
                ) {
                  if (this.domFrame[x][y][i] > DOM_UPRIGHT)
                    this.domState[x][y][i] = DominoState.FallLeft;

                  this.domY[x][y][i] += DOM_FALL_SPEED;
                  if (this.domY[x][y][i] >= TILE_HEIGHT && y + 1 < MAPHEIGHT2) {
                    b = this.handleFreefallLandingWithDelay(x, y, i, ledge);
                    if (b) break;
                  } else if (this.domY[x][y][i] >= 64) {
                    this.domino[x][y][i] = 0;
                  }
                }

                // Block obstacle checks
                if (this.domFrame[x][y][i] === 11 && x + 1 < MAPWIDTH) {
                  for (let i2 = 0; i2 < 2; i2++) {
                    if (this.domino[x + 1][y][i2] > 0) {
                      if (this.domino[x][y][i] === DominoType.Vanisher) {
                        this.domino[x][y][i] = 0;
                        break;
                      }
                      this.domFrameChange[x][y][i] = 0;
                    }
                  }
                }

                if (this.domFrame[x][y][i] === 11 && x + 2 < MAPWIDTH) {
                  for (let i2 = 0; i2 < 2; i2++) {
                    if (this.domino[x + 2][y][i2] > 0 && this.domFrame[x + 2][y][i2] <= 2) {
                      if (this.domino[x][y][i] === DominoType.Vanisher) {
                        this.domino[x][y][i] = 0;
                        break;
                      }
                      this.domFrameChange[x][y][i] = 0;
                    }
                  }
                }

                if (
                  this.domFrame[x][y][i] === 10 ||
                  (this.domFrame[x][y][i] === 11 && this.domFrameChange[x][y][i] > 0)
                ) {
                  if (x + 1 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x + 1][y][i2] > 0 &&
                        this.domFrame[x + 1][y][i2] === DOM_UPRIGHT
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }
                }

                if (this.domFrame[x][y][i] === 10 && x + 1 < MAPWIDTH && y > 0) {
                  if (ledge[x + 1][y - 1] > 0) {
                    this.domFrameChange[x][y][i] = 0;
                  }
                }

                if (this.domFrame[x][y][i] >= 10 && x + 1 < MAPWIDTH) {
                  if (this.rubble[x + 1][y] > 0) {
                    this.domFrameChange[x][y][i] = 0;
                    this.domFrame[x][y][i] = 10;
                  }
                }

                // Have fallen flat
                if (this.domFrame[x][y][i] === 12) {
                  this.domFrameChange[x][y][i] = 0;

                  if (this.domino[x][y][i] === DominoType.Vanisher) {
                    this.domino[x][y][i] = 0;
                    break;
                  }

                  if (x + 1 < MAPWIDTH) {
                    // Bridger
                    if (this.domino[x][y][i] === DominoType.Bridger && x + 2 < MAPWIDTH) {
                      if (ledge[x + 1][y] === 0 && ledge[x + 2][y] > 0) {
                        this.domino[x][y][i] = 0;
                        ledge[x + 1][y] = 1;
                        callbacks.onUpdateLedge();
                        callbacks.onPlaySound(SoundId.Bridger, x * 32);
                      }
                    }

                    // No ledge or tumbler/antigrav - move to next tile right
                    if (
                      ledge[x + 1][y] === 0 ||
                      this.domino[x][y][i] === DominoType.Tumbler ||
                      this.domino[x][y][i] === DominoType.Antigrav
                    ) {
                      let moveTo = 0;
                      if (this.domino[x + 1][y][0] > 0) moveTo = 1;

                      this.domino[x + 1][y][moveTo] = this.domino[x][y][i];
                      this.domino[x][y][i] = 0;

                      this.domState[x + 1][y][moveTo] = DominoState.FallRight;
                      this.domFrame[x + 1][y][moveTo] = 0;
                      this.domFrameChange[x + 1][y][moveTo] =
                        this.domFrameChange[x][y][i] + DOM_FRAMECHANGE_SPEED;
                      if (
                        (this.domino[x + 1][y][moveTo] === DominoType.Tumbler ||
                          this.domino[x + 1][y][moveTo] === DominoType.Antigrav) &&
                        ledge[x + 1][y]
                      ) {
                        this.domFrameChange[x + 1][y][moveTo] = -DOM_TUMBLER_FRAMECHANGE_SPEED;
                      }
                      this.domY[x + 1][y][moveTo] = 0;

                      // Flip splitters & delays
                      if (this.domino[x + 1][y][moveTo] === DominoType.Delay1)
                        this.domino[x + 1][y][moveTo] = DominoType.Delay2;
                      else if (this.domino[x + 1][y][moveTo] === DominoType.Delay2)
                        this.domino[x + 1][y][moveTo] = DominoType.Delay1;
                      else if (this.domino[x + 1][y][moveTo] === DominoType.Splitter1)
                        this.domino[x + 1][y][moveTo] = DominoType.Splitter2;
                      else if (this.domino[x + 1][y][moveTo] === DominoType.Splitter2)
                        this.domino[x + 1][y][moveTo] = DominoType.Splitter1;

                      // Fall sound
                      if (
                        ledge[x + 1][y] === 0 &&
                        this.domino[x + 1][y][moveTo] !== DominoType.Antigrav &&
                        (y + 1 >= MAPHEIGHT2 || ledge[x + 1][y + 1] === 0)
                      ) {
                        callbacks.onPlaySound(SoundId.DominoDrop, x * 32);
                      } else if (
                        this.domino[x + 1][y][moveTo] === DominoType.Delay1 ||
                        this.domino[x + 1][y][moveTo] === DominoType.Delay2
                      ) {
                        this.domDelay[x + 1][y][moveTo] = DOM_STEP_DELAY_COUNT;
                      }

                      break;
                    }
                  }

                  // Trigger - check if complete
                  if (this.domino[x][y][i] === DominoType.Trigger) {
                    completeCheck = true;
                  }
                }
                break;
              }

              case DominoState.AscLeft: {
                if (y > 2) {
                  if (ledge[x][y - 3] > 0)
                    this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED;

                  if (this.domFrame[x][y][i] > DOM_UPRIGHT && ledge[x][y - 3] === 0)
                    this.domFrameChange[x][y][i] -= DOM_FRAMECHANGE_SPEED;

                  if (ledge[x][y - 3] === 0) {
                    this.domY[x][y][i] -= DOM_ASCEND_SPEED;

                    for (let i2 = 0; i2 < 2; i2++) {
                      if (this.domino[x][y - 1][i2] || this.domino[x][y - 2][i2]) {
                        this.domino[x][y][i] = 0;
                        this.domino[x][y - 1][i2] = 0;
                        this.domino[x][y - 2][i2] = 0;
                        this.makeRubble(x, y - 3, 2);
                      }
                    }

                    if (this.domY[x][y][i] <= -16.0) {
                      this.domino[x][y - 1][i] = this.domino[x][y][i];
                      this.domino[x][y][i] = 0;
                      this.domY[x][y - 1][i] = this.domY[x][y][i] + 16.0;
                      this.domFrame[x][y - 1][i] = this.domFrame[x][y][i];
                      this.domFrameChange[x][y - 1][i] = this.domFrameChange[x][y][i];
                      this.domState[x][y - 1][i] = this.domState[x][y][i];
                      break;
                    }
                  } else {
                    this.domY[x][y][i] = 0;
                  }

                  // Block obstacle checks
                  if (this.domFrame[x][y][i] === 1 && x > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (this.domino[x - 1][y][i2] > 0) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  if (this.domFrame[x][y][i] === 2 && x > 0) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        y + 1 < MAPHEIGHT2 &&
                        this.domino[x - 1][y + 1][i2] > 0 &&
                        this.domFrame[x - 1][y + 1][i2] === DOM_UPRIGHT
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  if (this.domFrame[x][y][i] === 1 && x > 1) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x - 2][y][i2] > 0 &&
                        this.domFrame[x - 2][y][i2] >= 11
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  // Have fallen flat
                  if (this.domFrame[x][y][i] === 0) {
                    this.domFrameChange[x][y][i] = 0;
                    if (x > 0) {
                      if (ledge[x - 1][y - 3] === 0) {
                        this.domino[x - 1][y][i] = this.domino[x][y][i];
                        this.domino[x][y][i] = 0;
                        this.domFrame[x - 1][y][i] = 12;
                        this.domFrameChange[x - 1][y][i] = 0;
                        this.domState[x - 1][y][i] = this.domState[x][y][i];
                        this.domY[x - 1][y][i] = 0;
                        break;
                      }
                    }
                    if (ledge[x][y - 3] === 0) {
                      this.domState[x][y][i] = DominoState.AscRight;
                      break;
                    }
                  }
                } else {
                  this.domY[x][y][i] -= DOM_ASCEND_SPEED;
                  if (this.domY[x][y][i] < -48) this.domino[x][y][i] = 0;
                }
                break;
              }

              case DominoState.AscRight: {
                if (y > 2) {
                  if (ledge[x][y - 3] > 0)
                    this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED;

                  if (this.domFrame[x][y][i] < DOM_UPRIGHT && ledge[x][y - 3] === 0)
                    this.domFrameChange[x][y][i] += DOM_FRAMECHANGE_SPEED;

                  if (ledge[x][y - 3] === 0) {
                    this.domY[x][y][i] -= DOM_ASCEND_SPEED;

                    for (let i2 = 0; i2 < 2; i2++) {
                      if (this.domino[x][y - 1][i2] || this.domino[x][y - 2][i2]) {
                        this.domino[x][y][i] = 0;
                        this.domino[x][y - 1][i2] = 0;
                        this.domino[x][y - 2][i2] = 0;
                        this.makeRubble(x, y - 3, 2);
                      }
                    }

                    if (this.domY[x][y][i] <= -16.0) {
                      this.domino[x][y - 1][i] = this.domino[x][y][i];
                      this.domino[x][y][i] = 0;
                      this.domY[x][y - 1][i] = this.domY[x][y][i] + 16.0;
                      this.domFrame[x][y - 1][i] = this.domFrame[x][y][i];
                      this.domFrameChange[x][y - 1][i] = this.domFrameChange[x][y][i];
                      this.domState[x][y - 1][i] = this.domState[x][y][i];
                      break;
                    }
                  } else {
                    this.domY[x][y][i] = 0;
                  }

                  // Block obstacle checks
                  if (this.domFrame[x][y][i] === 11 && x + 1 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (this.domino[x + 1][y][i2] > 0) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  if (this.domFrame[x][y][i] === 10 && x + 1 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        y + 1 < MAPHEIGHT2 &&
                        this.domino[x + 1][y + 1][i2] > 0 &&
                        this.domFrame[x + 1][y + 1][i2] === DOM_UPRIGHT
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  if (this.domFrame[x][y][i] === 11 && x + 2 < MAPWIDTH) {
                    for (let i2 = 0; i2 < 2; i2++) {
                      if (
                        this.domino[x + 2][y][i2] > 0 &&
                        this.domFrame[x + 2][y][i2] <= 1
                      ) {
                        this.domFrameChange[x][y][i] = 0;
                      }
                    }
                  }

                  // Have fallen flat
                  if (this.domFrame[x][y][i] === 12) {
                    this.domFrameChange[x][y][i] = 0;
                    if (x + 1 < MAPWIDTH) {
                      if (ledge[x + 1][y - 3] === 0) {
                        this.domino[x + 1][y][i] = this.domino[x][y][i];
                        this.domino[x][y][i] = 0;
                        this.domFrame[x + 1][y][i] = 0;
                        this.domFrameChange[x + 1][y][i] = 0;
                        this.domState[x + 1][y][i] = this.domState[x][y][i];
                        this.domY[x + 1][y][i] = 0;
                        break;
                      }
                    }
                    if (ledge[x][y - 3] === 0) {
                      this.domState[x][y][i] = DominoState.AscLeft;
                      break;
                    }
                  }
                } else {
                  this.domY[x][y][i] -= DOM_ASCEND_SPEED;
                  if (this.domY[x][y][i] < -48) this.domino[x][y][i] = 0;
                }
                break;
              }

              case DominoState.Ascend: {
                if (y > 2) {
                  if (ledge[x][y - 3] === 0) {
                    this.domY[x][y][i] -= DOM_ASCEND_SPEED;

                    for (let i2 = 0; i2 < 2; i2++) {
                      if (this.domino[x][y - 1][i2] || this.domino[x][y - 2][i2]) {
                        this.domino[x][y][i] = 0;
                        this.domino[x][y - 1][i2] = 0;
                        this.domino[x][y - 2][i2] = 0;
                        this.makeRubble(x, y - 3, 2);
                      }
                    }

                    if (this.domY[x][y][i] <= -16) {
                      if (this.domino[x][y][i] === DominoType.Rocket) {
                        callbacks.onStartEffect(x, y - 2, EffectType.Dust);
                      }
                      this.domino[x][y - 1][i] = this.domino[x][y][i];
                      this.domino[x][y][i] = 0;
                      this.domY[x][y - 1][i] = this.domY[x][y][i] + 16;
                      this.domState[x][y - 1][i] = this.domState[x][y][i];
                      this.domFrame[x][y - 1][i] = this.domFrame[x][y][i];
                      this.domFrameChange[x][y - 1][i] = 0;
                    }
                  } else {
                    this.domY[x][y][i] = 0;

                    // Rocket - BOOM
                    if (this.domino[x][y][i] === DominoType.Rocket) {
                      callbacks.onPlaySound(SoundId.Exploder, x * 32);
                      ledge[x][y - 3] = 0;
                      ladder[x][y - 3] = 0;
                      if (x > 0 && ledge[x - 1][y - 3]) ladder[x - 1][y - 3] = 0;
                      if (x + 1 < MAPWIDTH && ledge[x + 1][y - 3]) ladder[x + 1][y - 3] = 0;
                      callbacks.onUpdateLedge();
                      callbacks.onStartEffect(x, y - 2, EffectType.Explosion);
                      this.domino[x][y][i] = 0;
                      break;
                    }

                    for (let i2 = 0; i2 < 2; i2++) {
                      // Knocked by normal domino from the left
                      if (x > 0 && y + 1 < MAPHEIGHT2) {
                        if (
                          this.domino[x - 1][y + 1][i2] > 0 &&
                          this.domino[x - 1][y + 1][i2] !== DominoType.Ascender &&
                          this.domFrame[x - 1][y + 1][i2] > DOM_UPRIGHT + 2
                        ) {
                          this.domState[x][y][i] = DominoState.AscRight;
                        }
                      }
                      // Knocked by normal domino from the right
                      if (x + 1 < MAPWIDTH && y + 1 < MAPHEIGHT2) {
                        if (
                          this.domino[x + 1][y + 1][i2] > 0 &&
                          this.domino[x + 1][y + 1][i2] !== DominoType.Ascender &&
                          this.domFrame[x + 1][y + 1][i2] < DOM_UPRIGHT - 2
                        ) {
                          this.domState[x][y][i] = DominoState.AscLeft;
                        }
                      }
                      // Other ascenders from the left
                      if (x > 0) {
                        if (
                          this.domino[x - 1][y][i2] > 0 &&
                          this.domino[x - 1][y][i2] === DominoType.Ascender &&
                          this.domFrame[x - 1][y][i2] >= 9
                        ) {
                          this.domState[x][y][i] = DominoState.AscRight;
                        }
                      }
                      // Other ascenders from the right
                      if (x + 1 < MAPWIDTH) {
                        if (
                          this.domino[x + 1][y][i2] > 0 &&
                          this.domino[x + 1][y][i2] === DominoType.Ascender &&
                          this.domFrame[x + 1][y][i2] <= 3
                        ) {
                          this.domState[x][y][i] = DominoState.AscLeft;
                        }
                      }
                    }
                  }
                } else {
                  this.domY[x][y][i] -= DOM_ASCEND_SPEED;
                  if (this.domY[x][y][i] < -48) this.domino[x][y][i] = 0;
                }
                break;
              }

              case DominoState.Pickup: {
                this.domX[x][y][i] -= 0.25;
                if (this.domX[x][y][i] < -2.25) {
                  this.domX[x][y][i] = -2.25;
                }
                this.domY[x][y][i] += 0.33;
                if (this.domY[x][y][i] > 3) this.domY[x][y][i] = 3;
                break;
              }

              case DominoState.Putdown: {
                this.domX[x][y][i] += 0.25;
                if (this.domX[x][y][i] > 0) {
                  this.domX[x][y][i] = 0;
                  this.domY[x][y][i] = 0;
                  this.domState[x][y][i] = DominoState.Standing;
                }
                this.domY[x][y][i] -= 0.33;
                if (this.domY[x][y][i] < 0) this.domY[x][y][i] = 0;
                break;
              }
            }

            if (
              this.domState[x][y][i] !== DominoState.Pickup &&
              this.domState[x][y][i] !== DominoState.Putdown
            )
              this.domX[x][y][i] = 0;
          }
        }
      }
    }

    // Hit mimics
    if (this.mimics !== 0 && prevMimics === 0) {
      this.hitMimics();
    }

    // Level complete check
    if (completeCheck) {
      if (this.levelCompleteState === 0) {
        const result = this.levelComplete(ledge, heldDominoes);
        if (result.complete) {
          this.levelCompleteState = 1;
        } else {
          this.levelCompleteState = 2;
          this.levelCompleteMessage = result.message;
        }
      }
    }
  }
}
