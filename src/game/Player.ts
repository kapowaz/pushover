import {
  MAPWIDTH,
  MAPHEIGHT2,
  CLOSED_DOOR,
  OPEN_DOOR,
  DOM_FPD,
  DOM_UPRIGHT,
  DOM_FALL_SPEED,
  DOM_DELAY_COUNT,
  MESSAGE_DELAY,
  GI_WALK_FRAMECHANGE,
  GI_CARRY_FRAMECHANGE,
  GI_PICK_FRAMECHANGE,
  GI_GETUP_FRAMECHANGE,
  GI_WOBBLE_FRAMECHANGE,
  GI_WOBBLE_ITERATIONS,
  GI_FALL_FRAMECHANGE,
  GI_LAND_FRAMECHANGE,
  GI_LAND_ITERATIONS,
  GI_PREFALL_FRAMECHANGE,
  GI_PREFALL_ITERATIONS,
  GI_PREFALL_DROPPOINT_L,
  GI_PREFALL_DROPPOINT_R,
  GI_CLIMB_FRAMECHANGE,
  GI_EXIT_FRAMECHANGE,
  GI_ENTER_FRAMECHANGE,
  GI_DIE_FRAMECHANGE,
  GI_UP_FRAMECHANGE,
  GI_DOWN_FRAMECHANGE,
  GI_CARRYSTEP_FRAMECHANGE,
  GI_MOVEBACK_FRAMECHANGE,
  GI_MOVEFRONT_FRAMECHANGE,
  GI_HAI_FRAMECHANGE,
  GI_HAI_ITERATIONS,
  GI_HAI_WAITTIME,
  GI_SHAKEHEAD_FRAMECHANGE,
  GI_SHAKEHEAD_ITERATIONS,
  GI_WAVE_FRAMECHANGE,
  GI_WAVE_ITERATIONS,
  GI_PUSH_FRAMECHANGE,
  GI_PUSH_PUSHPOINT_L,
  GI_PUSH_PUSHPOINT_R,
  GI_PUSHSTOP_PUSHPOINT_L,
  GI_PUSHSTOP_PUSHPOINT_R,
  GI_PUSHASC_PUSHPOINT_L,
  GI_PUSHASC_PUSHPOINT_R,
  GI_SHRUG_FRAMECHANGE,
  GI_COVEREARS_FRAMECHANGE,
  GI_CATCHWAIT_FRAMECHANGE,
  GI_CATCHPLAYER_FRAMECHANGE,
  GI_CAUGHT_FRAMECHANGE,
  GI_LEAP_FRAMECHANGE,
  GI_LEAPCATCH_FRAMECHANGE,
  GI_WALK_SPEED,
  GI_CARRY_SPEED,
  GI_CLIMB_SPEED,
  GI_DEATH_TILES,
  GIState,
  GIF,
  Control,
  DominoType,
  DominoState,
  SoundId,
  LevelState,
  MessageType,
} from './constants';
import type { Renderer } from '../engine/Renderer';
import type { SpriteSheet } from '../engine/SpriteSheet';

export interface ProcessContext {
  contHit(control: Control): boolean;
  contDown(control: Control): boolean;

  ledge: number[][];
  ladder: number[][];
  domino: number[][][];
  domState: number[][][];
  domFrame: number[][][];
  domFrameChange: number[][][];
  domDelay: number[][][];
  domX: number[][][];
  domY: number[][][];
  rubble: number[][];
  background: number[][];

  levelState: LevelState;
  levelCompleteState: number;
  starter: boolean;
  mimics: number;
  GIOut: number;
  renderFirst: Player | null;
  messageDelay: number;
  messageDelayStyle: number;

  otherPlayer: Player | null;

  playSound(id: SoundId, x: number): number;
  stopSound(channel: number): void;
  isSoundPlaying(channel: number): boolean;
  saveTokenState(): void;
  blowExploder(x: number, y: number, layer: number): void;
  rebounder(x: number, y: number, layer: number): boolean;
}

export class Player {
  playerNum: number;
  GIX = 0;
  GIY = 0;
  GIXOffset = 0;
  GIYOffset = 0;
  GIDomino = 0;
  GILastMoved = 1;
  GIPushesRemain = 3;
  GIShrugNeeded = false;
  pickupLayer = 0;
  currentCostume = 0;
  GIState: GIState = GIState.Stand;
  GIFrame: number = GIF.STAND;
  GIFrameChange = 0;
  GIFallTiles = 0;
  GIFallChannel = -1;
  GIHaiCount = 0;
  GIWaved = false;
  GIIterationsLeft = 0;
  upKey = 'ArrowUp';
  downKey = 'ArrowDown';
  leftKey = 'ArrowLeft';
  rightKey = 'ArrowRight';
  fireKeys = ['KeyZ', 'Space'];
  enabled = true;
  tokenGIX = 0;
  tokenGIY = 0;

  constructor(num: number) {
    this.playerNum = num;
  }

  setControls(scheme: number): void {
    switch (scheme) {
      case 0:
        this.upKey = 'ArrowUp';
        this.downKey = 'ArrowDown';
        this.leftKey = 'ArrowLeft';
        this.rightKey = 'ArrowRight';
        this.fireKeys = ['KeyZ', 'Space'];
        break;
      case 1:
        this.upKey = 'KeyG';
        this.downKey = 'KeyB';
        this.leftKey = 'KeyV';
        this.rightKey = 'KeyN';
        this.fireKeys = ['KeyZ', 'Space'];
        break;
      case 2:
        this.upKey = 'ArrowUp';
        this.downKey = 'ArrowDown';
        this.leftKey = 'ArrowLeft';
        this.rightKey = 'ArrowRight';
        this.fireKeys = ['Slash', 'Space'];
        break;
      case 3:
        this.upKey = 'Home';
        this.downKey = 'Home';
        this.leftKey = 'Home';
        this.rightKey = 'Home';
        this.fireKeys = ['Home'];
        break;
    }
  }

  private notValidForPush(x: number, y: number, ctx: ProcessContext): boolean {
    if (ctx.domino[x][y][0] === 0 || ctx.domState[x][y][0] !== DominoState.Standing)
      if (ctx.domino[x + 1][y][0] === 0 || ctx.domState[x + 1][y][0] !== DominoState.Standing)
        return true;
    if (ctx.ledge[x][y] === 0 || ctx.ledge[x + 1][y] === 0) return true;
    if (
      (ctx.domino[x][y][0] === DominoType.Splitter1 || ctx.domino[x][y][0] === 0) &&
      (ctx.domino[x + 1][y][0] === DominoType.Splitter1 || ctx.domino[x + 1][y][0] === 0)
    )
      return true;
    if (ctx.ledge[x + 1][y - 1] || ctx.ledge[x][y - 1]) return true;
    for (let i = 0; i < 2; i++) {
      if (
        (ctx.domino[x][y][i] > 0 && ctx.domFrame[x][y][i] > DOM_UPRIGHT) ||
        (ctx.domino[x + 1][y][i] > 0 && ctx.domFrame[x + 1][y][i] < DOM_UPRIGHT)
      )
        return true;
    }
    return false;
  }

  private putDownOK(x: number, y: number, domType: number, ctx: ProcessContext): boolean {
    if (ctx.ledge[x][y] === 0) return false;
    for (let i = 0; i < 2; i++) {
      if (ctx.domino[x][y][i] > 0) return false;
      if (x > 0)
        if (ctx.domino[x - 1][y][i] && ctx.domFrame[x - 1][y][i] > DOM_UPRIGHT) return false;
      if (x + 1 < MAPWIDTH)
        if (ctx.domino[x + 1][y][i] && ctx.domFrame[x + 1][y][i] < DOM_UPRIGHT) return false;
      if (ctx.rubble[x][y]) return false;
    }
    const bgY = Math.floor((y - 1) / 2);
    if (
      ctx.background[x][bgY] >= CLOSED_DOOR &&
      ctx.background[x][bgY] <= OPEN_DOOR &&
      domType !== DominoType.Vanisher
    )
      return false;
    return true;
  }

  private dropHeldDomino(ctx: ProcessContext): void {
    let putLayer = 0;
    if (ctx.domino[this.GIX][this.GIY][0]) putLayer = 1;

    ctx.domino[this.GIX][this.GIY][putLayer] = this.GIDomino;
    ctx.domState[this.GIX][this.GIY][putLayer] = DominoState.Standing;
    if (ctx.domino[this.GIX][this.GIY][putLayer] === DominoType.Ascender)
      ctx.domState[this.GIX][this.GIY][putLayer] = DominoState.Ascend;
    ctx.domFrame[this.GIX][this.GIY][putLayer] = DOM_UPRIGHT;
    ctx.domFrameChange[this.GIX][this.GIY][putLayer] = 0;
    ctx.domY[this.GIX][this.GIY][putLayer] = 0;
    this.GIDomino = 0;
    ctx.playSound(SoundId.DominoDrop, this.GIX * 32);
  }

  private playPushSound(domType: number, x: number, ctx: ProcessContext): void {
    switch (domType) {
      case DominoType.Trigger:
        ctx.playSound(SoundId.Trigger, x);
        break;
      case DominoType.Ascender:
      case DominoType.Rocket:
        ctx.playSound(SoundId.DominoDrop, x);
        break;
      case DominoType.Antigrav:
      case DominoType.Tumbler:
        ctx.playSound(SoundId.Rebound, x);
        break;
      case DominoType.Delay2:
        if (!ctx.starter) ctx.playSound(SoundId.Delay, x);
        break;
      case DominoType.Vanisher:
        ctx.playSound(SoundId.Vanisher, x);
        break;
      case DominoType.Exploder:
        ctx.playSound(SoundId.Exploder, x);
        break;
      case DominoType.Count1:
        ctx.playSound(SoundId.Count1, x);
        break;
      case DominoType.Count2:
        ctx.playSound(SoundId.Count2, x);
        break;
      case DominoType.Count3:
        ctx.playSound(SoundId.Count3, x);
        break;
    }
  }

  private applyPushLeft(ctx: ProcessContext): void {
    const x = this.GIX;
    const y = this.GIY;
    const domType = ctx.domino[x][y][0];

    switch (domType) {
      case DominoType.Ascender:
        ctx.domState[x][y][0] = DominoState.AscLeft;
        break;
      case DominoType.Rocket:
        ctx.domState[x][y][0] = DominoState.Ascend;
        break;
      case DominoType.Stopper:
        break;
      case DominoType.Exploder:
        ctx.blowExploder(x, y, 0);
        break;
      case DominoType.Delay2:
        if (!ctx.starter) ctx.domDelay[x][y][0] = -DOM_DELAY_COUNT;
        break;
      case DominoType.Mimic:
        ctx.mimics = -1;
        break;
      default:
        if (!ctx.rebounder(x, y, 0) || domType === DominoType.Delay2)
          ctx.domState[x][y][0] = DominoState.FallLeft;
    }
    if (domType === DominoType.Starter) ctx.starter = false;
  }

  private applyPushRight(ctx: ProcessContext): void {
    const x = this.GIX + 1;
    const y = this.GIY;
    const domType = ctx.domino[x][y][0];

    switch (domType) {
      case DominoType.Ascender:
        ctx.domState[x][y][0] = DominoState.AscRight;
        break;
      case DominoType.Rocket:
        ctx.domState[x][y][0] = DominoState.Ascend;
        break;
      case DominoType.Stopper:
        break;
      case DominoType.Exploder:
        ctx.blowExploder(x, y, 0);
        break;
      case DominoType.Delay2:
        if (!ctx.starter) ctx.domDelay[x][y][0] = DOM_DELAY_COUNT;
        break;
      case DominoType.Mimic:
        ctx.mimics = 1;
        break;
      default:
        if (!ctx.rebounder(x, y, 0) || domType === DominoType.Delay2)
          ctx.domState[x][y][0] = DominoState.FallRight;
    }
    if (domType === DominoType.Starter) ctx.starter = false;
  }

  process(ctx: ProcessContext): void {
    if (!this.enabled) return;

    if (this.GIFrameChange >= 1) {
      this.GIFrameChange -= 1;
      this.GIFrame++;
    }
    if (this.GIFrameChange <= -1) {
      this.GIFrameChange += 1;
      this.GIFrame--;
    }

    if (this.GIState !== GIState.Stand) {
      this.GIHaiCount = 0;
    }

    switch (this.GIState) {
      case GIState.Exit: {
        this.GIFrameChange += GI_EXIT_FRAMECHANGE;
        if (this.GIFrame > GIF.EXIT_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
        }
        break;
      }

      case GIState.Enter: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_ENTER_FRAMECHANGE;
        if (this.GIFrame > GIF.ENTER_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
          ctx.GIOut--;
          if (ctx.GIOut === 0) {
            ctx.levelState = LevelState.CloseExit;
          }
          this.enabled = false;
        }
        break;
      }

      case GIState.Stand: {
        this.GIFrame = GIF.STAND;
        this.GIFrameChange = 0;
        this.GIXOffset = 0;
        this.GIYOffset = 0;

        // Prepare to catch (2-player)
        if (ctx.GIOut === 2 && ctx.otherPlayer) {
          if (ctx.otherPlayer.GIState === GIState.Fall) {
            if (ctx.otherPlayer.GIX === this.GIX && ctx.otherPlayer.GIY < this.GIY) {
              let blocked = false;
              for (let y = this.GIY - 1; y > ctx.otherPlayer.GIY; y--) {
                if (ctx.ledge[this.GIX][y]) blocked = true;
              }
              if (!blocked) {
                this.GIState = GIState.CatchWait;
                this.GIFrame = GIF.CATCHWAIT_S;
                this.GIFrameChange = 0;
              }
            }
          }
        }

        // Walk left
        if (ctx.contDown(Control.Left)) {
          this.GIState = GIState.WalkLeft;
          this.GIFrame = GIF.WALK_LS;
          this.GILastMoved = 0;

          if (ctx.ledge[this.GIX - 1][this.GIY] === 0) {
            this.GIState = GIState.WobbleLeft;
            this.GIFrame = GIF.WOBBLE_LS;
            this.GIIterationsLeft = GI_WOBBLE_ITERATIONS;

            if (ctx.ledge[this.GIX - 1][this.GIY + 1]) {
              this.GIState = GIState.DownLeft;
              this.GIFrame = GIF.DOWN_LS;
              this.GIXOffset = -8;
              this.GIFrameChange = 0;
            }

            if (ctx.GIOut === 2 && ctx.otherPlayer) {
              if (
                ctx.otherPlayer.GIX === this.GIX - 2 &&
                ctx.otherPlayer.GIY === this.GIY &&
                ctx.otherPlayer.GIState === GIState.Stand
              ) {
                this.GIState = GIState.LeapLeft;
                this.GIFrame = GIF.LEAP_LS;
                this.GIFrameChange = 0;
                ctx.renderFirst = ctx.otherPlayer;
                ctx.otherPlayer.GIState = GIState.LeapCatchRight;
                ctx.otherPlayer.GIFrame = GIF.LEAPCATCH_RS;
                this.GIFrameChange = 0;
                ctx.playSound(SoundId.Hup, this.GIX * 32);
              }
            }
          }

          if (ctx.ledge[this.GIX - 1][this.GIY - 1]) {
            this.GIState = GIState.UpLeft;
            this.GIFrame = GIF.UP_LS;
            this.GIXOffset = 0;
            this.GIFrameChange = 0;
          }
        }

        // Walk right
        if (ctx.contDown(Control.Right)) {
          this.GIState = GIState.WalkRight;
          this.GIFrame = GIF.WALK_RS;
          this.GILastMoved = 1;

          if (ctx.ledge[this.GIX + 1][this.GIY] === 0) {
            this.GIState = GIState.WobbleRight;
            this.GIFrame = GIF.WOBBLE_RS;
            this.GIIterationsLeft = GI_WOBBLE_ITERATIONS;

            if (ctx.ledge[this.GIX + 1][this.GIY + 1]) {
              this.GIState = GIState.DownRight;
              this.GIFrame = GIF.DOWN_RS;
              this.GIXOffset = 8;
              this.GIFrameChange = 0;
            }

            if (ctx.GIOut === 2 && ctx.otherPlayer) {
              if (
                ctx.otherPlayer.GIX === this.GIX + 2 &&
                ctx.otherPlayer.GIY === this.GIY &&
                ctx.otherPlayer.GIState === GIState.Stand
              ) {
                this.GIState = GIState.LeapRight;
                this.GIFrame = GIF.LEAP_RS;
                this.GIFrameChange = 0;
                ctx.renderFirst = ctx.otherPlayer;
                ctx.otherPlayer.GIState = GIState.LeapCatchLeft;
                ctx.otherPlayer.GIFrame = GIF.LEAPCATCH_LS;
                this.GIFrameChange = 0;
                ctx.playSound(SoundId.Hup, this.GIX * 32);
              }
            }
          }

          if (ctx.ledge[this.GIX + 1][this.GIY - 1]) {
            this.GIState = GIState.UpRight;
            this.GIFrame = GIF.UP_RS;
            this.GIXOffset = 0;
            this.GIFrameChange = 0;
          }
        }

        // Pick up domino
        for (let i = 0; i < 2; i++) {
          if (
            ctx.contDown(Control.Fire) &&
            ctx.domino[this.GIX][this.GIY][i] > 0 &&
            (ctx.domState[this.GIX][this.GIY][i] === DominoState.Standing ||
              ((ctx.domino[this.GIX][this.GIY][i] === DominoType.Tumbler ||
                ctx.domino[this.GIX][this.GIY][i] === DominoType.Antigrav) &&
                ctx.domFrame[this.GIX][this.GIY][i] === DOM_UPRIGHT))
          ) {
            if (
              ctx.domino[this.GIX][this.GIY][i] !== DominoType.Trigger &&
              ctx.domino[this.GIX][this.GIY][i] !== DominoType.Starter
            ) {
              if (!this.GILastMoved) {
                this.GIState = GIState.PickupLeft;
                this.GIFrame = GIF.PICK_LS;
              } else {
                this.GIState = GIState.PickupRight;
                this.GIFrame = GIF.PICK_RS;
              }
              ctx.playSound(SoundId.Hup, this.GIX * 32);
              ctx.domState[this.GIX][this.GIY][i] = DominoState.Pickup;
              ctx.domFrame[this.GIX][this.GIY][i] = DOM_UPRIGHT;
              ctx.domFrameChange[this.GIX][this.GIY][i] = 0;
              this.pickupLayer = i;
            } else {
              this.GIState = GIState.ShakeHead;
              this.GIFrame = GIF.SHAKEHEAD_S;
              this.GIIterationsLeft = GI_SHAKEHEAD_ITERATIONS;
            }
          }
        }

        if (this.GIState === GIState.PickupLeft || this.GIState === GIState.PickupRight) break;

        // No ledge - fall
        if (!ctx.ledge[this.GIX][this.GIY]) {
          this.GIState = GIState.Fall;
          this.GIFrame = GIF.FALL_S;
          this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
          break;
        }

        // Climb down
        if (ctx.contDown(Control.Down)) {
          if (ctx.ladder[this.GIX][this.GIY + 1]) {
            this.GIState = GIState.ClimbDown;
            this.GIFrame = GIF.CLIMB_S;
            break;
          }
        }

        // Climb up / enter door / push position
        if (ctx.contDown(Control.Up)) {
          // Enter exit door
          if (
            ctx.levelState === LevelState.OpenExit &&
            ctx.background[this.GIX][Math.floor((this.GIY - 1) / 2)] === OPEN_DOOR
          ) {
            let allowed = true;
            for (let i = 0; i < 2; i++) {
              if (
                ctx.domino[this.GIX][this.GIY][i] &&
                ctx.domFrame[this.GIX][this.GIY][i] <= DOM_UPRIGHT
              )
                allowed = false;
              if (this.GIX > 0)
                if (
                  ctx.domino[this.GIX - 1][this.GIY][i] &&
                  ctx.domFrame[this.GIX - 1][this.GIY][i] >= 9
                )
                  allowed = false;
            }
            if (allowed) {
              ctx.playSound(SoundId.LevelComplete, this.GIX * 32);
              this.GIState = GIState.Enter;
              this.GIFrame = GIF.ENTER_S;
              break;
            }
          }

          // Climb up
          if (ctx.ladder[this.GIX][this.GIY - 1]) {
            this.GIState = GIState.ClimbUp;
            this.GIFrame = GIF.CLIMB_S;
          } else {
            // Move to push position
            if (!this.GILastMoved) {
              this.GIX--;
              this.GIState = GIState.MoveBackLeft;
              this.GIFrame = GIF.MOVEBACK_LS;
            } else {
              this.GIState = GIState.MoveBackRight;
              this.GIFrame = GIF.MOVEBACK_RS;
            }
            this.GIXOffset = 16;

            if (this.notValidForPush(this.GIX, this.GIY, ctx)) {
              if (!this.GILastMoved) {
                this.GIX++;
                this.GILastMoved = 0;
                this.GIState = GIState.MoveBackRight;
                this.GIFrame = GIF.MOVEBACK_RS;
              } else {
                this.GIX--;
                this.GIState = GIState.MoveBackLeft;
                this.GIFrame = GIF.MOVEBACK_LS;
              }

              if (this.notValidForPush(this.GIX, this.GIY, ctx)) {
                this.GIState = GIState.Stand;
                this.GIFrame = GIF.STAND;
                this.GIFrameChange = 0;
                this.GIXOffset = 0;
                if (this.GILastMoved) {
                  this.GIX++;
                }
              }
            }
          }
        }

        // Wave
        if (
          this.GIState === GIState.Stand &&
          this.GIWaved === false &&
          ctx.levelCompleteState === 1
        ) {
          this.GIWaved = true;
          this.GIFrameChange = 0;
          this.GIState = GIState.Wave;
          this.GIFrame = GIF.WAVE_S;
          this.GIIterationsLeft = GI_WAVE_ITERATIONS;
          ctx.playSound(SoundId.GISmile, this.GIX * 32);
        }

        // Shrug
        if (this.GIState === GIState.Stand && this.GIShrugNeeded === true) {
          this.GIShrugNeeded = false;
          this.GIFrameChange = 0;
          this.GIState = GIState.Shrug;
          this.GIFrame = GIF.SHRUG_S;
          ctx.playSound(SoundId.TryAgain, this.GIX * 32);
        }

        // Cover ears
        if (
          ctx.GIOut === 1 &&
          this.GIState === GIState.Stand &&
          ctx.domino[this.GIX][this.GIY][0] === DominoType.Exploder &&
          !ctx.contDown(Control.Down) &&
          !ctx.contDown(Control.Up)
        ) {
          this.GIFrameChange = 0;
          this.GIState = GIState.CoverEars;
          this.GIFrame = GIF.COVEREARS_S;
        }

        // Hai count
        if (ctx.GIOut === 1 && this.GIState === GIState.Stand) {
          this.GIHaiCount++;
          if (this.GIHaiCount >= GI_HAI_WAITTIME) {
            this.GIState = GIState.Hai;
            this.GIFrame = GIF.HAI_S;
            this.GIIterationsLeft = GI_HAI_ITERATIONS;
            ctx.playSound(SoundId.Hai, this.GIX * 32);
          }
        }

        break;
      }

      case GIState.Hai: {
        this.GIFrameChange += GI_HAI_FRAMECHANGE;
        if (this.GIFrame > GIF.HAI_E) {
          if (this.GIIterationsLeft) {
            this.GIFrame = GIF.HAI_S;
            this.GIIterationsLeft--;
          } else {
            this.GIState = GIState.Stand;
            this.GIFrame = GIF.STAND;
          }
        }

        if (ctx.GIOut === 2 && ctx.otherPlayer) {
          if (ctx.otherPlayer.GIState === GIState.Fall) {
            if (ctx.otherPlayer.GIX === this.GIX && ctx.otherPlayer.GIY < this.GIY) {
              this.GIState = GIState.CatchWait;
              this.GIFrame = GIF.CATCHWAIT_S;
              this.GIFrameChange = 0;
            }
          }
        }

        if (
          ctx.contDown(Control.Up) ||
          ctx.contDown(Control.Down) ||
          ctx.contDown(Control.Left) ||
          ctx.contDown(Control.Right) ||
          ctx.contDown(Control.Fire) ||
          ctx.ledge[this.GIX][this.GIY] === 0
        ) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.Wave: {
        this.GIFrameChange += GI_WAVE_FRAMECHANGE;
        if (this.GIFrame > GIF.WAVE_E1 && this.GIIterationsLeft) {
          this.GIFrame = GIF.WAVE_S;
          this.GIIterationsLeft--;
        }
        if (this.GIFrame > GIF.WAVE_E2) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }

        if (ctx.GIOut === 2 && ctx.otherPlayer) {
          if (ctx.otherPlayer.GIState === GIState.Fall) {
            if (ctx.otherPlayer.GIX === this.GIX && ctx.otherPlayer.GIY < this.GIY) {
              this.GIState = GIState.CatchWait;
              this.GIFrame = GIF.CATCHWAIT_S;
              this.GIFrameChange = 0;
            }
          }
        }

        if (ctx.ledge[this.GIX][this.GIY] === 0) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.Shrug: {
        this.GIFrameChange += GI_SHRUG_FRAMECHANGE;
        if (this.GIFrame > GIF.SHRUG_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        if (ctx.ledge[this.GIX][this.GIY] === 0) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.CoverEars: {
        if (this.GIFrame < GIF.COVEREARS_E) this.GIFrameChange += GI_COVEREARS_FRAMECHANGE;

        if (ctx.GIOut === 2 && ctx.otherPlayer) {
          if (ctx.otherPlayer.GIState === GIState.Fall) {
            if (ctx.otherPlayer.GIX === this.GIX && ctx.otherPlayer.GIY < this.GIY) {
              this.GIState = GIState.CatchWait;
              this.GIFrame = GIF.CATCHWAIT_S;
              this.GIFrameChange = 0;
            }
          }
        }

        if (
          ctx.contDown(Control.Up) ||
          ctx.contDown(Control.Down) ||
          ctx.contDown(Control.Left) ||
          ctx.contDown(Control.Right) ||
          ctx.contDown(Control.Fire) ||
          ctx.ledge[this.GIX][this.GIY] === 0
        ) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.ShakeHead: {
        this.GIFrameChange += GI_SHAKEHEAD_FRAMECHANGE;
        if (this.GIFrame > GIF.SHAKEHEAD_E) {
          if (this.GIIterationsLeft) {
            this.GIFrame = GIF.SHAKEHEAD_S;
            this.GIIterationsLeft--;
          } else {
            this.GIState = GIState.Stand;
            this.GIFrame = GIF.STAND;
          }
        }
        if (ctx.ledge[this.GIX][this.GIY] === 0) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.WalkLeft: {
        this.GIFrameChange += GI_WALK_FRAMECHANGE;
        if (this.GIFrame > GIF.WALK_LE) this.GIFrame = GIF.WALK_LS;

        this.GIXOffset -= GI_WALK_SPEED;

        if (ctx.ledge[this.GIX - 1][this.GIY] === 0 && this.GIXOffset <= -20) {
          this.GIYOffset += DOM_FALL_SPEED;
        } else {
          this.GIYOffset = 0;
        }

        if (this.GIXOffset <= -32) {
          this.GIX--;
          this.GIXOffset += 32;

          if (ctx.ledge[this.GIX][this.GIY] > 0) {
            if (!ctx.contDown(Control.Left)) {
              this.GIState = GIState.Stand;
              this.GIFrame = GIF.STAND;
              this.GIFrameChange = 0;
              this.GIXOffset = 0;
            } else {
              if (ctx.ledge[this.GIX - 1][this.GIY] === 0) {
                this.GIState = GIState.WobbleLeft;
                this.GIFrame = GIF.WOBBLE_LS;
                this.GIIterationsLeft = GI_WOBBLE_ITERATIONS;

                if (ctx.ledge[this.GIX - 1][this.GIY + 1]) {
                  this.GIState = GIState.DownLeft;
                  this.GIFrame = GIF.DOWN_LS;
                  this.GIXOffset = -8;
                  this.GIFrameChange = 0;
                }

                if (ctx.GIOut === 2 && ctx.otherPlayer) {
                  if (
                    ctx.otherPlayer.GIX === this.GIX - 2 &&
                    ctx.otherPlayer.GIY === this.GIY &&
                    ctx.otherPlayer.GIState === GIState.Stand
                  ) {
                    this.GIState = GIState.LeapLeft;
                    this.GIFrame = GIF.LEAP_LS;
                    this.GIFrameChange = 0;
                    ctx.renderFirst = ctx.otherPlayer;
                    ctx.otherPlayer.GIState = GIState.LeapCatchRight;
                    ctx.otherPlayer.GIFrame = GIF.LEAPCATCH_RS;
                    this.GIFrameChange = 0;
                    ctx.playSound(SoundId.Hup, this.GIX * 32);
                  }
                }
              }

              if (ctx.ledge[this.GIX - 1][this.GIY - 1]) {
                this.GIState = GIState.UpLeft;
                this.GIFrame = GIF.UP_LS;
                this.GIXOffset = 0;
                this.GIFrameChange = 0;
              }
            }
          } else {
            this.GIState = GIState.Fall;
            this.GIFrame = GIF.FALL_S;
            this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
          }
        }
        break;
      }

      case GIState.WalkRight: {
        this.GIFrameChange += GI_WALK_FRAMECHANGE;
        if (this.GIFrame > GIF.WALK_RE) this.GIFrame = GIF.WALK_RS;

        this.GIXOffset += GI_WALK_SPEED;

        if (ctx.ledge[this.GIX + 1][this.GIY] === 0 && this.GIXOffset >= 20) {
          this.GIYOffset += DOM_FALL_SPEED;
        } else {
          this.GIYOffset = 0;
        }

        if (this.GIXOffset >= 32) {
          this.GIX++;
          this.GIXOffset -= 32;

          if (ctx.ledge[this.GIX][this.GIY] > 0) {
            if (!ctx.contDown(Control.Right)) {
              this.GIState = GIState.Stand;
              this.GIFrame = GIF.STAND;
              this.GIFrameChange = 0;
              this.GIXOffset = 0;
            } else {
              if (ctx.ledge[this.GIX + 1][this.GIY] === 0) {
                this.GIState = GIState.WobbleRight;
                this.GIFrame = GIF.WOBBLE_RS;
                this.GIIterationsLeft = GI_WOBBLE_ITERATIONS;

                if (ctx.ledge[this.GIX + 1][this.GIY + 1]) {
                  this.GIState = GIState.DownRight;
                  this.GIFrame = GIF.DOWN_RS;
                  this.GIXOffset = 8;
                  this.GIFrameChange = 0;
                }

                if (ctx.GIOut === 2 && ctx.otherPlayer) {
                  if (
                    ctx.otherPlayer.GIX === this.GIX + 2 &&
                    ctx.otherPlayer.GIY === this.GIY &&
                    ctx.otherPlayer.GIState === GIState.Stand
                  ) {
                    this.GIState = GIState.LeapRight;
                    this.GIFrame = GIF.LEAP_RS;
                    this.GIFrameChange = 0;
                    ctx.renderFirst = ctx.otherPlayer;
                    ctx.otherPlayer.GIState = GIState.LeapCatchLeft;
                    ctx.otherPlayer.GIFrame = GIF.LEAPCATCH_LS;
                    this.GIFrameChange = 0;
                    ctx.playSound(SoundId.Hup, this.GIX * 32);
                  }
                }
              }

              if (ctx.ledge[this.GIX + 1][this.GIY - 1]) {
                this.GIState = GIState.UpRight;
                this.GIFrame = GIF.UP_RS;
                this.GIXOffset = 0;
                this.GIFrameChange = 0;
              }
            }
          } else {
            this.GIState = GIState.Fall;
            this.GIFrame = GIF.FALL_S;
            this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
          }
        }
        break;
      }

      case GIState.PickupLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PICK_FRAMECHANGE;
        if (this.GIFrame > GIF.PICK_LE) {
          this.GIState = GIState.GetupLeft;
          this.GIFrame = GIF.GETUP_LS;

          this.GIDomino = ctx.domino[this.GIX][this.GIY][this.pickupLayer];
          if (this.GIDomino === DominoType.Delay1) this.GIDomino = DominoType.Delay2;
          ctx.domino[this.GIX][this.GIY][this.pickupLayer] = 0;
          ctx.domDelay[this.GIX][this.GIY][this.pickupLayer] = 0;

          if (this.GIDomino === 0) this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.PickupRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PICK_FRAMECHANGE;
        if (this.GIFrame > GIF.PICK_RE) {
          this.GIState = GIState.GetupRight;
          this.GIFrame = GIF.GETUP_RS;

          this.GIDomino = ctx.domino[this.GIX][this.GIY][this.pickupLayer];
          if (this.GIDomino === DominoType.Delay1) this.GIDomino = DominoType.Delay2;
          ctx.domino[this.GIX][this.GIY][this.pickupLayer] = 0;
          ctx.domDelay[this.GIX][this.GIY][this.pickupLayer] = 0;

          if (this.GIDomino === 0) this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.GetupLeft: {
        this.GIFrameChange += GI_GETUP_FRAMECHANGE;
        if (this.GIFrame > GIF.GETUP_LE) {
          this.GIState = GIState.HoldLeft;
          this.GIFrame = GIF.HOLD_L;
        }
        break;
      }

      case GIState.GetupRight: {
        this.GIFrameChange += GI_GETUP_FRAMECHANGE;
        if (this.GIFrame > GIF.GETUP_RE) {
          this.GIState = GIState.HoldRight;
          this.GIFrame = GIF.HOLD_R;
        }
        break;
      }

      case GIState.HoldLeft: {
        this.GIFrame = GIF.HOLD_L;
        this.GIFrameChange = 0;
        this.GIXOffset = 0;

        if (ctx.contDown(Control.Left)) {
          this.GIState = GIState.CarryLeft;
          this.GIFrame = GIF.CARRY_LS;
          this.GILastMoved = 0;

          if (ctx.ledge[this.GIX - 1][this.GIY - 1]) {
            this.GIState = GIState.CarryUpLeft;
            this.GIFrame = GIF.CARRYSTEP_LS;
          }
          if (ctx.ledge[this.GIX - 1][this.GIY] === 0 && ctx.ledge[this.GIX - 1][this.GIY + 1]) {
            this.GIState = GIState.CarryDownLeft;
            this.GIFrame = GIF.CARRYSTEP_LS;
          }
        }

        if (ctx.contDown(Control.Right)) {
          this.GIState = GIState.CarryRight;
          this.GIFrame = GIF.CARRY_RS;
          this.GILastMoved = 1;

          if (ctx.ledge[this.GIX + 1][this.GIY - 1]) {
            this.GIState = GIState.CarryUpRight;
            this.GIFrame = GIF.CARRYSTEP_RS;
          }
          if (ctx.ledge[this.GIX + 1][this.GIY] === 0 && ctx.ledge[this.GIX + 1][this.GIY + 1]) {
            this.GIState = GIState.CarryDownRight;
            this.GIFrame = GIF.CARRYSTEP_RS;
          }
        }

        if (ctx.contDown(Control.Down) && ctx.ladder[this.GIX][this.GIY + 1]) {
          this.GIState = GIState.ClimbDown;
          this.GIFrame = GIF.CLIMB_S;
          break;
        }
        if (ctx.contDown(Control.Up) && ctx.ladder[this.GIX][this.GIY - 1]) {
          this.GIState = GIState.ClimbUp;
          this.GIFrame = GIF.CLIMB_S;
          break;
        }

        if (ctx.contDown(Control.Fire) && this.putDownOK(this.GIX, this.GIY, this.GIDomino, ctx)) {
          if (!this.GILastMoved) {
            this.GIState = GIState.PutdownLeft;
            this.GIFrame = GIF.PICK_LE - 2;
          } else {
            this.GIState = GIState.PutdownRight;
            this.GIFrame = GIF.PICK_RE - 2;
          }
          ctx.domino[this.GIX][this.GIY][0] = this.GIDomino;
          ctx.domState[this.GIX][this.GIY][0] = DominoState.Putdown;
          ctx.domFrame[this.GIX][this.GIY][0] = DOM_UPRIGHT;
          ctx.domFrameChange[this.GIX][this.GIY][0] = 0;
          ctx.domY[this.GIX][this.GIY][0] = 3;
          ctx.domX[this.GIX][this.GIY][0] = -2.25;
          this.GIDomino = 0;
        }

        if (!ctx.ledge[this.GIX][this.GIY]) {
          this.GIState = GIState.Fall;
          this.GIFrame = GIF.FALL_S;
          this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
          this.dropHeldDomino(ctx);
        }
        break;
      }

      case GIState.HoldRight: {
        this.GIFrame = GIF.HOLD_R;
        this.GIFrameChange = 0;
        this.GIXOffset = 0;

        if (ctx.contDown(Control.Left)) {
          this.GIState = GIState.CarryLeft;
          this.GIFrame = GIF.CARRY_LS;
          this.GILastMoved = 0;

          if (ctx.ledge[this.GIX - 1][this.GIY - 1]) {
            this.GIState = GIState.CarryUpLeft;
            this.GIFrame = GIF.CARRYSTEP_LS;
          }
          if (ctx.ledge[this.GIX - 1][this.GIY] === 0 && ctx.ledge[this.GIX - 1][this.GIY + 1]) {
            this.GIState = GIState.CarryDownLeft;
            this.GIFrame = GIF.CARRYSTEP_LS;
          }
        }

        if (ctx.contDown(Control.Right)) {
          this.GIState = GIState.CarryRight;
          this.GIFrame = GIF.CARRY_RS;
          this.GILastMoved = 1;

          if (ctx.ledge[this.GIX + 1][this.GIY - 1]) {
            this.GIState = GIState.CarryUpRight;
            this.GIFrame = GIF.CARRYSTEP_RS;
          }
          if (ctx.ledge[this.GIX + 1][this.GIY] === 0 && ctx.ledge[this.GIX + 1][this.GIY + 1]) {
            this.GIState = GIState.CarryDownRight;
            this.GIFrame = GIF.CARRYSTEP_RS;
          }
        }

        if (ctx.contDown(Control.Down) && ctx.ladder[this.GIX][this.GIY + 1]) {
          this.GIState = GIState.ClimbDown;
          this.GIFrame = GIF.CLIMB_S;
          break;
        }
        if (ctx.contDown(Control.Up) && ctx.ladder[this.GIX][this.GIY - 1]) {
          this.GIState = GIState.ClimbUp;
          this.GIFrame = GIF.CLIMB_S;
          break;
        }

        if (ctx.contDown(Control.Fire) && this.putDownOK(this.GIX, this.GIY, this.GIDomino, ctx)) {
          if (!this.GILastMoved) {
            this.GIState = GIState.PutdownLeft;
            this.GIFrame = GIF.PICK_LE;
          } else {
            this.GIState = GIState.PutdownRight;
            this.GIFrame = GIF.PICK_RE;
          }
          ctx.domino[this.GIX][this.GIY][0] = this.GIDomino;
          ctx.domState[this.GIX][this.GIY][0] = DominoState.Putdown;
          ctx.domFrame[this.GIX][this.GIY][0] = DOM_UPRIGHT;
          ctx.domFrameChange[this.GIX][this.GIY][0] = 0;
          ctx.domY[this.GIX][this.GIY][0] = 3;
          ctx.domX[this.GIX][this.GIY][0] = -2.25;
          this.GIDomino = 0;
        }

        if (!ctx.ledge[this.GIX][this.GIY]) {
          this.GIState = GIState.Fall;
          this.GIFrame = GIF.FALL_S;
          this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
          this.dropHeldDomino(ctx);
        }
        break;
      }

      case GIState.CarryLeft: {
        this.GIFrameChange += GI_CARRY_FRAMECHANGE;
        if (this.GIFrame > GIF.CARRY_LE) this.GIFrame = GIF.CARRY_LS;

        this.GIXOffset -= GI_CARRY_SPEED;
        if (this.GIXOffset <= -32) {
          this.GIX--;
          this.GIXOffset += 32;

          if (!ctx.contDown(Control.Left)) {
            this.GIState = GIState.HoldLeft;
          } else {
            if (ctx.ledge[this.GIX - 1][this.GIY - 1]) {
              this.GIState = GIState.CarryUpLeft;
              this.GIFrame = GIF.CARRYSTEP_LS;
            }
            if (
              ctx.ledge[this.GIX - 1][this.GIY] === 0 &&
              ctx.ledge[this.GIX - 1][this.GIY + 1]
            ) {
              this.GIState = GIState.CarryDownLeft;
              this.GIFrame = GIF.CARRYSTEP_LS;
            }
          }

          if (ctx.ledge[this.GIX][this.GIY] === 0) {
            this.GIState = GIState.PrefallRight;
            this.GIFrame = GIF.PREFALL_RS;
            this.GIIterationsLeft = GI_PREFALL_ITERATIONS;
          }
        }
        break;
      }

      case GIState.CarryRight: {
        this.GIFrameChange += GI_CARRY_FRAMECHANGE;
        if (this.GIFrame > GIF.CARRY_RE) this.GIFrame = GIF.CARRY_RS;

        this.GIXOffset += GI_CARRY_SPEED;
        if (this.GIXOffset >= 32) {
          this.GIX++;
          this.GIXOffset -= 32;

          if (!ctx.contDown(Control.Right)) {
            this.GIState = GIState.HoldRight;
          } else {
            if (ctx.ledge[this.GIX + 1][this.GIY - 1]) {
              this.GIState = GIState.CarryUpRight;
              this.GIFrame = GIF.CARRYSTEP_RS;
            }
            if (
              ctx.ledge[this.GIX + 1][this.GIY] === 0 &&
              ctx.ledge[this.GIX + 1][this.GIY + 1]
            ) {
              this.GIState = GIState.CarryDownRight;
              this.GIFrame = GIF.CARRYSTEP_RS;
            }
          }

          if (ctx.ledge[this.GIX][this.GIY] === 0) {
            this.GIState = GIState.PrefallLeft;
            this.GIFrame = GIF.PREFALL_LS;
            this.GIIterationsLeft = GI_PREFALL_ITERATIONS;
          }
        }
        break;
      }

      case GIState.PutdownLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange -= GI_PICK_FRAMECHANGE;
        if (this.GIFrame < GIF.PICK_LS) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
        }
        break;
      }

      case GIState.PutdownRight: {
        ctx.renderFirst = this;
        this.GIFrameChange -= GI_PICK_FRAMECHANGE;
        if (this.GIFrame < GIF.PICK_RS) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
        }
        break;
      }

      case GIState.MoveBackLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_MOVEBACK_FRAMECHANGE;
        if (this.GIFrame > GIF.MOVEBACK_LE) {
          this.GIState = GIState.PushWait;
          if (this.GILastMoved) {
            this.GIFrame = GIF.PUSH_RS;
            this.GIFrameChange = 0;
            if (
              ctx.domino[this.GIX + 1][this.GIY][0] === 0 ||
              ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Splitter1 ||
              ctx.domFrame[this.GIX + 1][this.GIY][0] !== DOM_UPRIGHT
            ) {
              this.GIFrame = GIF.PUSH_LS;
              this.GILastMoved = 0;
            }
          } else {
            this.GIFrame = GIF.PUSH_LS;
            this.GIFrameChange = 0;
            if (
              ctx.domino[this.GIX][this.GIY][0] === 0 ||
              ctx.domino[this.GIX][this.GIY][0] === DominoType.Splitter1 ||
              ctx.domFrame[this.GIX][this.GIY][0] !== DOM_UPRIGHT
            ) {
              this.GIFrame = GIF.PUSH_RS;
              this.GILastMoved = 1;
            }
          }
        }
        break;
      }

      case GIState.MoveBackRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_MOVEBACK_FRAMECHANGE;
        if (this.GIFrame > GIF.MOVEBACK_RE) {
          this.GIState = GIState.PushWait;
          if (this.GILastMoved) {
            this.GIFrame = GIF.PUSH_RS;
            this.GIFrameChange = 0;
            if (
              ctx.domino[this.GIX + 1][this.GIY][0] === 0 ||
              ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Splitter1 ||
              ctx.domFrame[this.GIX + 1][this.GIY][0] !== DOM_UPRIGHT
            ) {
              this.GIFrame = GIF.PUSH_LS;
              this.GILastMoved = 0;
            }
          } else {
            this.GIFrame = GIF.PUSH_LS;
            this.GIFrameChange = 0;
            if (
              ctx.domino[this.GIX][this.GIY][0] === 0 ||
              ctx.domino[this.GIX][this.GIY][0] === DominoType.Splitter1 ||
              ctx.domFrame[this.GIX][this.GIY][0] !== DOM_UPRIGHT
            ) {
              this.GIFrame = GIF.PUSH_RS;
              this.GILastMoved = 1;
            }
          }
        }
        break;
      }

      case GIState.PushWait: {
        ctx.renderFirst = this;
        this.GIFrameChange = 0;

        if (ctx.ledge[this.GIX][this.GIY] === 0) {
          this.GIState = GIState.Stand;
          break;
        }
        if (ctx.ledge[this.GIX + 1][this.GIY] === 0) {
          this.GIState = GIState.Stand;
          this.GIX++;
          break;
        }

        // Get flattened
        if (
          (ctx.domino[this.GIX][this.GIY][0] &&
            ctx.domFrame[this.GIX][this.GIY][0] > DOM_UPRIGHT) ||
          (ctx.domino[this.GIX + 1][this.GIY][0] &&
            ctx.domFrame[this.GIX + 1][this.GIY][0] < DOM_UPRIGHT)
        ) {
          this.GIState = GIState.Flat;
          ctx.messageDelay = MESSAGE_DELAY;
          ctx.messageDelayStyle = MessageType.Died;
          break;
        }

        // Face left
        if (
          ctx.contDown(Control.Left) &&
          ctx.ledge[this.GIX][this.GIY] &&
          ctx.domino[this.GIX][this.GIY][0] &&
          ctx.domFrame[this.GIX][this.GIY][0] === DOM_UPRIGHT &&
          ctx.domino[this.GIX][this.GIY][0] !== DominoType.Splitter1
        ) {
          this.GIFrame = GIF.PUSH_LS;
          this.GILastMoved = 0;
        }

        // Face right
        if (
          ctx.contDown(Control.Right) &&
          ctx.ledge[this.GIX + 1][this.GIY] &&
          ctx.domino[this.GIX + 1][this.GIY][0] &&
          ctx.domFrame[this.GIX + 1][this.GIY][0] === DOM_UPRIGHT &&
          ctx.domino[this.GIX][this.GIY][0] !== DominoType.Splitter1
        ) {
          this.GIFrame = GIF.PUSH_RS;
          this.GILastMoved = 1;
        }

        // Check not facing a splitter (left)
        if (!this.GILastMoved) {
          if (ctx.domino[this.GIX][this.GIY][0] === DominoType.Splitter1) {
            this.GIFrame = GIF.PUSH_RS;
            this.GILastMoved = 1;
          }
        }

        // Check not facing a splitter (right)
        if (this.GILastMoved) {
          if (ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Splitter1) {
            this.GIFrame = GIF.PUSH_LS;
            this.GILastMoved = 0;
          }
        }

        // Move to front
        if (ctx.contDown(Control.Down)) {
          if (this.GILastMoved) {
            this.GIState = GIState.MoveFrontRight;
            this.GIFrame = GIF.MOVEFRONT_RS;
          } else {
            this.GIState = GIState.MoveFrontLeft;
            this.GIFrame = GIF.MOVEFRONT_LS;
          }
        }

        // Push
        if (ctx.contDown(Control.Fire) && this.GIPushesRemain > 0) {
          if (!this.GILastMoved && ctx.contDown(Control.Left)) {
            ctx.saveTokenState();
            this.GIState = GIState.PushLeft;
            this.GIFrame = GIF.PUSH_LS;
            this.GIPushesRemain--;

            if (ctx.rebounder(this.GIX, this.GIY, 0)) {
              this.GIState = GIState.PushStopLeft;
              this.GIFrame = GIF.PUSHSTOP_LS;
            } else if (
              ctx.domino[this.GIX][this.GIY][0] === DominoType.Ascender ||
              ctx.domino[this.GIX][this.GIY][0] === DominoType.Rocket
            ) {
              this.GIState = GIState.PushAscLeft;
              this.GIFrame = GIF.PUSHASC_LS;
            }
          } else if (this.GILastMoved && ctx.contDown(Control.Right)) {
            ctx.saveTokenState();
            this.GIState = GIState.PushRight;
            this.GIFrame = GIF.PUSH_RS;
            this.GIPushesRemain--;

            if (ctx.rebounder(this.GIX + 1, this.GIY, 0)) {
              this.GIState = GIState.PushStopRight;
              this.GIFrame = GIF.PUSHSTOP_RS;
            } else if (
              ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Ascender ||
              ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Rocket
            ) {
              this.GIState = GIState.PushAscRight;
              this.GIFrame = GIF.PUSHASC_RS;
            }
          }
        }
        break;
      }

      case GIState.PushLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSH_PUSHPOINT_L &&
          ctx.domState[this.GIX][this.GIY][0] === DominoState.Standing
        ) {
          this.playPushSound(ctx.domino[this.GIX][this.GIY][0], this.GIX * 32, ctx);
          this.applyPushLeft(ctx);
        }

        if (this.GIFrame > GIF.PUSH_LE) {
          this.GIState = GIState.MoveFrontLeft;
          this.GIFrame = GIF.MOVEFRONT_LS;
        }
        break;
      }

      case GIState.PushRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSH_PUSHPOINT_R &&
          ctx.domState[this.GIX + 1][this.GIY][0] === DominoState.Standing
        ) {
          this.playPushSound(ctx.domino[this.GIX + 1][this.GIY][0], this.GIX * 32, ctx);
          this.applyPushRight(ctx);
        }

        if (this.GIFrame > GIF.PUSH_RE) {
          this.GIState = GIState.MoveFrontRight;
          this.GIFrame = GIF.MOVEFRONT_RS;
        }
        break;
      }

      case GIState.PushStopLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSHSTOP_PUSHPOINT_L &&
          ctx.domState[this.GIX][this.GIY][0] === DominoState.Standing &&
          ctx.domDelay[this.GIX][this.GIY][0] === 0
        ) {
          if (ctx.domino[this.GIX][this.GIY][0] === DominoType.Delay2) {
            if (!ctx.starter) ctx.playSound(SoundId.Delay, this.GIX * 32);
          }
          if (ctx.domino[this.GIX][this.GIY][0] === DominoType.Delay2) {
            if (!ctx.starter) ctx.domDelay[this.GIX][this.GIY][0] = -DOM_DELAY_COUNT;
          }
        }

        if (this.GIFrame > GIF.PUSHSTOP_LE) {
          this.GIState = GIState.MoveFrontLeft;
          this.GIFrame = GIF.MOVEFRONT_LS;
        }
        break;
      }

      case GIState.PushStopRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSHSTOP_PUSHPOINT_R &&
          ctx.domState[this.GIX + 1][this.GIY][0] === DominoState.Standing &&
          ctx.domDelay[this.GIX + 1][this.GIY][0] === 0
        ) {
          if (ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Delay2) {
            if (!ctx.starter) ctx.playSound(SoundId.Delay, this.GIX * 32);
          }
          if (ctx.domino[this.GIX + 1][this.GIY][0] === DominoType.Delay2) {
            if (!ctx.starter) ctx.domDelay[this.GIX + 1][this.GIY][0] = DOM_DELAY_COUNT;
          }
        }

        if (this.GIFrame > GIF.PUSHSTOP_RE) {
          this.GIState = GIState.MoveFrontRight;
          this.GIFrame = GIF.MOVEFRONT_RS;
        }
        break;
      }

      case GIState.PushAscLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSHASC_PUSHPOINT_L &&
          ctx.domState[this.GIX][this.GIY][0] === DominoState.Standing
        ) {
          const domType = ctx.domino[this.GIX][this.GIY][0];
          if (domType === DominoType.Ascender || domType === DominoType.Rocket)
            ctx.playSound(SoundId.DominoDrop, this.GIX * 32);
          if (domType === DominoType.Ascender) ctx.domState[this.GIX][this.GIY][0] = DominoState.AscLeft;
          if (domType === DominoType.Rocket) ctx.domState[this.GIX][this.GIY][0] = DominoState.Ascend;
        }

        if (this.GIFrame > GIF.PUSHASC_LE) {
          this.GIState = GIState.MoveFrontLeft;
          this.GIFrame = GIF.MOVEFRONT_LS;
        }
        break;
      }

      case GIState.PushAscRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_PUSH_FRAMECHANGE;

        if (
          this.GIFrame === GI_PUSHASC_PUSHPOINT_R &&
          ctx.domState[this.GIX + 1][this.GIY][0] === DominoState.Standing
        ) {
          const domType = ctx.domino[this.GIX + 1][this.GIY][0];
          if (domType === DominoType.Ascender || domType === DominoType.Rocket)
            ctx.playSound(SoundId.DominoDrop, this.GIX * 32);
          if (domType === DominoType.Ascender) ctx.domState[this.GIX + 1][this.GIY][0] = DominoState.AscRight;
          if (domType === DominoType.Rocket) ctx.domState[this.GIX + 1][this.GIY][0] = DominoState.Ascend;
        }

        if (this.GIFrame > GIF.PUSHASC_RE) {
          this.GIState = GIState.MoveFrontRight;
          this.GIFrame = GIF.MOVEFRONT_RS;
        }
        break;
      }

      case GIState.MoveFrontRight: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_MOVEFRONT_FRAMECHANGE;
        if (this.GIFrame > GIF.MOVEFRONT_RE) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
          this.GIX++;
        }
        break;
      }

      case GIState.MoveFrontLeft: {
        ctx.renderFirst = this;
        this.GIFrameChange += GI_MOVEBACK_FRAMECHANGE;
        if (this.GIFrame > GIF.MOVEFRONT_LE) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
        }
        break;
      }

      case GIState.WobbleLeft: {
        this.GIFrameChange += GI_WOBBLE_FRAMECHANGE;
        if (this.GIFrame > GIF.WOBBLE_LE) {
          if (this.GIIterationsLeft) {
            this.GIIterationsLeft--;
            this.GIFrame = GIF.WOBBLE_LS;
          } else {
            if (ctx.contDown(Control.Left)) {
              this.GIState = GIState.WalkLeft;
              this.GIFrame = GIF.WALK_LS;
              this.GILastMoved = 0;
            } else {
              this.GIState = GIState.Stand;
              this.GIFrame = GIF.STAND;
              this.GIFrameChange = 0;
              this.GIXOffset = 0;
            }
          }
        }
        break;
      }

      case GIState.WobbleRight: {
        this.GIFrameChange += GI_WOBBLE_FRAMECHANGE;
        if (this.GIFrame > GIF.WOBBLE_RE) {
          if (this.GIIterationsLeft) {
            this.GIIterationsLeft--;
            this.GIFrame = GIF.WOBBLE_RS;
          } else {
            if (ctx.contDown(Control.Right)) {
              this.GIState = GIState.WalkRight;
              this.GIFrame = GIF.WALK_RS;
              this.GILastMoved = 0;
            } else {
              this.GIState = GIState.Stand;
              this.GIFrame = GIF.STAND;
              this.GIFrameChange = 0;
              this.GIXOffset = 0;
            }
          }
        }
        break;
      }

      case GIState.Fall: {
        this.GIFrameChange += GI_FALL_FRAMECHANGE;
        if (this.GIFrame > GIF.FALL_E) this.GIFrame = GIF.FALL_S;

        this.GIYOffset += DOM_FALL_SPEED;
        if (this.GIYOffset >= 16) {
          this.GIYOffset -= 16;
          this.GIY++;
          this.GIFallTiles++;

          // Get caught (2-player)
          if (ctx.GIOut === 2 && ctx.otherPlayer) {
            if (ctx.otherPlayer.GIState === GIState.CatchWait) {
              if (ctx.otherPlayer.GIY === this.GIY) {
                this.GIYOffset = 0;
                this.GIState = GIState.Caught;
                this.GIFrame = GIF.CAUGHT_S;
                this.GIFrameChange = 0;
                this.GIFallTiles = 0;
                if (ctx.isSoundPlaying(this.GIFallChannel)) {
                  ctx.stopSound(this.GIFallChannel);
                }
                ctx.otherPlayer.GIState = GIState.CatchPlayer;
                ctx.otherPlayer.GIFrame = GIF.CATCHPLAYER_S;
                ctx.otherPlayer.GIFrameChange = 0;
                ctx.renderFirst = ctx.otherPlayer;
                ctx.playSound(SoundId.Catch, this.GIX * 32);
                break;
              }
            }
          }

          // Land
          if (this.GIY < MAPHEIGHT2) {
            if (ctx.ledge[this.GIX][this.GIY] > 0) {
              if (this.GIFallTiles >= GI_DEATH_TILES) {
                this.GIState = GIState.Die;
                this.GIFrame = GIF.DIE_S;
                this.GIFallTiles = 0;
                ctx.messageDelay = MESSAGE_DELAY;
                ctx.messageDelayStyle = MessageType.Died;
              } else {
                this.GIState = GIState.Land;
                this.GIFrame = GIF.LAND_S;
                this.GIIterationsLeft = GI_LAND_ITERATIONS;
                this.GIFallTiles = 0;
              }
              if (ctx.isSoundPlaying(this.GIFallChannel)) {
                ctx.stopSound(this.GIFallChannel);
                ctx.playSound(SoundId.Land, this.GIX * 32);
              }
            }
          } else {
            if (ctx.messageDelayStyle === 0) {
              ctx.messageDelay = MESSAGE_DELAY;
              ctx.messageDelayStyle = MessageType.Died;
            }
          }
        }
        break;
      }

      case GIState.Land: {
        this.GIFrameChange += GI_LAND_FRAMECHANGE;
        this.GIYOffset = 0;

        if (this.GIIterationsLeft && this.GIFrame > GIF.LAND_E2) {
          this.GIFrame = GIF.LAND_S2;
          this.GIIterationsLeft--;
        }
        if (this.GIFrame > GIF.LAND_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
        }
        break;
      }

      case GIState.PrefallLeft: {
        this.GIFrameChange += GI_PREFALL_FRAMECHANGE;

        if (this.GIFrame === GI_PREFALL_DROPPOINT_L && this.GIDomino > 0) {
          let layer = 0;
          if (ctx.domino[this.GIX][this.GIY][0] > 0) layer = 1;

          ctx.domino[this.GIX][this.GIY][layer] = this.GIDomino;
          ctx.domState[this.GIX][this.GIY][layer] = DominoState.Standing;
          if (ctx.domino[this.GIX][this.GIY][layer] === DominoType.Ascender)
            ctx.domState[this.GIX][this.GIY][layer] = DominoState.Ascend;
          ctx.domFrame[this.GIX][this.GIY][layer] = DOM_UPRIGHT;
          ctx.domFrameChange[this.GIX][this.GIY][layer] = 0;
          ctx.domY[this.GIX][this.GIY][layer] = 0;
          this.GIDomino = 0;
          ctx.playSound(SoundId.DominoDrop, this.GIX * 32);
        }

        if (this.GIIterationsLeft && this.GIFrame > GIF.PREFALL_LE2) {
          this.GIFrame = GIF.PREFALL_LS2;
          this.GIIterationsLeft--;
        }
        if (this.GIFrame > GIF.PREFALL_LE) {
          this.GIState = GIState.Fall;
          this.GIFrame = GIF.FALL_S;
          this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
        }
        break;
      }

      case GIState.PrefallRight: {
        this.GIFrameChange += GI_PREFALL_FRAMECHANGE;

        if (this.GIFrame === GI_PREFALL_DROPPOINT_R && this.GIDomino > 0) {
          ctx.domino[this.GIX][this.GIY][0] = this.GIDomino;
          ctx.domState[this.GIX][this.GIY][0] = DominoState.Standing;
          if (ctx.domino[this.GIX][this.GIY][0] === DominoType.Ascender)
            ctx.domState[this.GIX][this.GIY][0] = DominoState.Ascend;
          ctx.domFrame[this.GIX][this.GIY][0] = DOM_UPRIGHT;
          ctx.domFrameChange[this.GIX][this.GIY][0] = 0;
          ctx.domY[this.GIX][this.GIY][0] = 0;
          this.GIDomino = 0;
          ctx.playSound(SoundId.DominoDrop, this.GIX * 32);
        }

        if (this.GIIterationsLeft && this.GIFrame > GIF.PREFALL_RE2) {
          this.GIFrame = GIF.PREFALL_RS2;
          this.GIIterationsLeft--;
        }
        if (this.GIFrame > GIF.PREFALL_RE) {
          this.GIState = GIState.Fall;
          this.GIFrame = GIF.FALL_S;
          this.GIFallChannel = ctx.playSound(SoundId.Fall, this.GIX * 32);
        }
        break;
      }

      case GIState.ClimbUp: {
        this.GIFrameChange += GI_CLIMB_FRAMECHANGE;
        if (this.GIFrame > GIF.CLIMB_E) this.GIFrame = GIF.CLIMB_S;

        this.GIYOffset -= GI_CLIMB_SPEED;
        if (this.GIYOffset < -16) {
          this.GIYOffset += 16;
          this.GIY--;

          if (ctx.ledge[this.GIX][this.GIY]) {
            this.GIState = GIState.Climb;
            this.GIFrame = GIF.CLIMB_S;
          }

          if (ctx.contDown(Control.Down)) {
            this.GIState = GIState.ClimbDown;
            this.GIFrame = GIF.CLIMB_S;
          } else {
            if (!ctx.ladder[this.GIX][this.GIY - 1]) {
              this.GIYOffset = 0;
              if (this.GIDomino === 0) {
                this.GIState = GIState.Stand;
                this.GIFrame = GIF.STAND;
                this.GIFrameChange = 0;
                this.GIXOffset = 0;
              } else {
                if (!this.GILastMoved) {
                  this.GIState = GIState.HoldLeft;
                  this.GIFrame = GIF.HOLD_L;
                } else {
                  this.GIState = GIState.HoldRight;
                  this.GIFrame = GIF.HOLD_R;
                }
              }
            }
          }
        }
        break;
      }

      case GIState.ClimbDown: {
        this.GIFrameChange -= GI_CLIMB_FRAMECHANGE;
        if (this.GIFrame < GIF.CLIMB_S) this.GIFrame = GIF.CLIMB_E;

        this.GIYOffset += GI_CLIMB_SPEED;
        if (this.GIYOffset > 16) {
          this.GIYOffset -= 16;
          this.GIY++;

          if (ctx.ledge[this.GIX][this.GIY]) {
            this.GIState = GIState.Climb;
            this.GIFrame = GIF.CLIMB_S;
          }

          if (
            ctx.ladder[this.GIX][this.GIY + 2] === 0 &&
            ctx.ledge[this.GIX][this.GIY + 1] === 0 &&
            ctx.ledge[this.GIX][this.GIY + 2]
          ) {
            this.GIState = GIState.Climb;
            this.GIFrame = GIF.CLIMB_S;
          }

          if (ctx.contDown(Control.Up)) {
            this.GIState = GIState.ClimbUp;
            this.GIFrame = GIF.CLIMB_S;
            this.GIFrameChange = 0;
          } else {
            if (!ctx.ladder[this.GIX][this.GIY + 1]) {
              this.GIYOffset = 0;
              if (this.GIDomino === 0) {
                this.GIState = GIState.Stand;
                this.GIFrame = GIF.STAND;
                this.GIFrameChange = 0;
                this.GIXOffset = 0;
              } else {
                if (!this.GILastMoved) {
                  this.GIState = GIState.HoldLeft;
                  this.GIFrame = GIF.HOLD_L;
                } else {
                  this.GIState = GIState.HoldRight;
                  this.GIFrame = GIF.HOLD_R;
                }
              }
            }
          }
        }
        break;
      }

      case GIState.Climb: {
        this.GIFrame = GIF.CLIMB_S;
        this.GIFrameChange = 0;

        if (
          (ctx.contDown(Control.Left) ||
            ctx.contDown(Control.Right) ||
            ctx.contDown(Control.Fire)) &&
          ctx.ledge[this.GIX][this.GIY]
        ) {
          if (this.GIDomino === 0) {
            this.GIState = GIState.Stand;
            this.GIFrame = GIF.STAND;
            this.GIFrameChange = 0;
            this.GIXOffset = 0;
          } else {
            if (!this.GILastMoved) {
              this.GIState = GIState.HoldLeft;
              this.GIFrame = GIF.HOLD_L;
            } else {
              this.GIState = GIState.HoldRight;
              this.GIFrame = GIF.HOLD_R;
            }
          }
        }

        if (ctx.contDown(Control.Up)) {
          this.GIState = GIState.ClimbUp;
          this.GIFrame = GIF.CLIMB_S;
        }
        if (ctx.contDown(Control.Down)) {
          this.GIState = GIState.ClimbDown;
          this.GIFrame = GIF.CLIMB_S;

          if (
            ctx.ladder[this.GIX][this.GIY + 2] === 0 &&
            ctx.ledge[this.GIX][this.GIY + 1] === 0 &&
            ctx.ledge[this.GIX][this.GIY + 2]
          ) {
            this.GIState = GIState.Climb;
            this.GIFrame = GIF.CLIMB_S;
          }
        }
        break;
      }

      case GIState.Die: {
        this.GIYOffset = 0;
        this.GIFrameChange += GI_DIE_FRAMECHANGE;
        if (this.GIFrame > GIF.DIE_E) this.GIFrame = GIF.DIE_E;
        break;
      }

      case GIState.UpLeft: {
        this.GIFrameChange += GI_UP_FRAMECHANGE;
        if (this.GIFrame > GIF.UP_LE) this.GIFrame = GIF.UP_LE;

        this.GIXOffset -= 4;
        this.GIYOffset -= 2;
        if (this.GIXOffset <= -32) {
          this.GIX--;
          this.GIY--;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
          this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.UpRight: {
        this.GIFrameChange += GI_UP_FRAMECHANGE;
        if (this.GIFrame > GIF.UP_RE) this.GIFrame = GIF.UP_RE;

        this.GIXOffset += 4;
        this.GIYOffset -= 2;
        if (this.GIXOffset >= 32) {
          this.GIX++;
          this.GIY--;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
          this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.DownLeft: {
        this.GIFrameChange += GI_DOWN_FRAMECHANGE;
        if (this.GIFrame > GIF.DOWN_LE) this.GIFrame = GIF.DOWN_LE;

        this.GIXOffset -= 3;
        this.GIYOffset += 3;
        if (this.GIYOffset >= 16) {
          this.GIX--;
          this.GIY++;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
          this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.DownRight: {
        this.GIFrameChange += GI_DOWN_FRAMECHANGE;
        if (this.GIFrame > GIF.DOWN_RE) this.GIFrame = GIF.DOWN_RE;

        this.GIXOffset += 3;
        this.GIYOffset += 3;
        if (this.GIYOffset >= 16) {
          this.GIX++;
          this.GIY++;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
          this.GIState = GIState.Stand;
        }
        break;
      }

      case GIState.CarryUpLeft: {
        this.GIFrameChange += GI_CARRYSTEP_FRAMECHANGE;

        this.GIXOffset -= 4;
        if (this.GIFrame <= GIF.CARRYSTEP_LS + 2) this.GIYOffset -= 3;
        else this.GIYOffset += 2;

        if (this.GIXOffset <= -32) {
          this.GIXOffset = -32;
          if (this.GIFrame > GIF.CARRYSTEP_LE) {
            this.GIX--;
            this.GIY--;
            this.GIXOffset = 0;
            this.GIYOffset = 0;
            this.GIFrameChange = 0;
            this.GIState = GIState.HoldLeft;
            this.GIFrame = GIF.CARRYSTEP_LE;
          }
        }
        if (this.GIFrame > GIF.CARRYSTEP_LE) this.GIFrame = GIF.CARRYSTEP_LE;
        break;
      }

      case GIState.CarryUpRight: {
        this.GIFrameChange += GI_CARRYSTEP_FRAMECHANGE;

        this.GIXOffset += 4;
        if (this.GIFrame <= GIF.CARRYSTEP_RS + 2) this.GIYOffset -= 3;
        else this.GIYOffset += 2;

        if (this.GIXOffset >= 32) {
          this.GIXOffset = 32;
          if (this.GIFrame > GIF.CARRYSTEP_RE) {
            this.GIX++;
            this.GIY--;
            this.GIXOffset = 0;
            this.GIYOffset = 0;
            this.GIFrameChange = 0;
            this.GIState = GIState.HoldRight;
            this.GIFrame = GIF.CARRYSTEP_RE;
          }
        }
        if (this.GIFrame > GIF.CARRYSTEP_RE) this.GIFrame = GIF.CARRYSTEP_RE;
        break;
      }

      case GIState.CarryDownLeft: {
        this.GIFrameChange += GI_CARRYSTEP_FRAMECHANGE;

        this.GIXOffset -= 4;
        if (this.GIFrame <= GIF.CARRYSTEP_LS + 1) this.GIYOffset -= 0.5;
        else this.GIYOffset += 3;

        if (this.GIXOffset <= -32) {
          this.GIXOffset = -32;
          if (this.GIFrame > GIF.CARRYSTEP_LE) {
            this.GIX--;
            this.GIY++;
            this.GIXOffset = 0;
            this.GIYOffset = 0;
            this.GIFrameChange = 0;
            this.GIState = GIState.HoldLeft;
            this.GIFrame = GIF.CARRYSTEP_LE;
          }
        }
        if (this.GIFrame > GIF.CARRYSTEP_LE) this.GIFrame = GIF.CARRYSTEP_LE;
        break;
      }

      case GIState.CarryDownRight: {
        this.GIFrameChange += GI_CARRYSTEP_FRAMECHANGE;

        this.GIXOffset += 4;
        if (this.GIFrame <= GIF.CARRYSTEP_RS + 1) this.GIYOffset -= 0.5;
        else this.GIYOffset += 3;

        if (this.GIXOffset >= 32) {
          this.GIXOffset = 32;
          if (this.GIFrame > GIF.CARRYSTEP_RE) {
            this.GIX++;
            this.GIY++;
            this.GIXOffset = 0;
            this.GIYOffset = 0;
            this.GIFrameChange = 0;
            this.GIState = GIState.HoldRight;
            this.GIFrame = GIF.CARRYSTEP_RE;
          }
        }
        if (this.GIFrame > GIF.CARRYSTEP_RE) this.GIFrame = GIF.CARRYSTEP_RE;
        break;
      }

      case GIState.Flat: {
        this.GIFrame = GIF.FLAT;
        break;
      }

      case GIState.CatchWait: {
        this.GIFrameChange += GI_CATCHWAIT_FRAMECHANGE;
        if (this.GIFrame > GIF.CATCHWAIT_E) this.GIFrame = GIF.CATCHWAIT_E;

        if (
          ctx.contDown(Control.Up) ||
          ctx.contDown(Control.Down) ||
          ctx.contDown(Control.Left) ||
          ctx.contDown(Control.Right) ||
          ctx.contDown(Control.Fire) ||
          ctx.ledge[this.GIX][this.GIY] === 0
        ) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
        }
        break;
      }

      case GIState.CatchPlayer: {
        this.GIFrameChange += GI_CATCHPLAYER_FRAMECHANGE;
        if (this.GIFrame > GIF.CATCHPLAYER_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
        }
        break;
      }

      case GIState.Caught: {
        this.GIFrameChange += GI_CAUGHT_FRAMECHANGE;
        if (this.GIFrame > GIF.CAUGHT_E) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
        }
        break;
      }

      case GIState.LeapLeft: {
        this.GIFrameChange += GI_LEAP_FRAMECHANGE;

        if (this.GIFrameChange >= 1 && this.GIFrame === GIF.LEAP_LS + 7)
          ctx.playSound(SoundId.Catch, this.GIX * 32);

        if (this.GIFrame >= GIF.LEAP_LS + 3 && this.GIFrame <= GIF.LEAP_LS + 7)
          this.GIXOffset -= 3;

        if (this.GIFrame === GIF.LEAP_LS + 3) this.GIYOffset -= 1;
        if (this.GIFrame === GIF.LEAP_LS + 5) this.GIYOffset += 1;
        if (this.GIFrame === GIF.LEAP_LS + 6) this.GIYOffset += 2;
        if (this.GIFrame === GIF.LEAP_LS + 7) this.GIYOffset += 3;

        if (this.GIFrame >= GIF.LEAP_LS + 9) {
          this.GIXOffset -= 1;
          this.GIYOffset -= 1;
        }

        if (this.GIFrame > GIF.LEAP_LE) {
          this.GIX -= 2;
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
        }
        break;
      }

      case GIState.LeapRight: {
        this.GIFrameChange += GI_LEAP_FRAMECHANGE;

        if (this.GIFrameChange >= 1 && this.GIFrame === GIF.LEAP_RS + 7)
          ctx.playSound(SoundId.Catch, this.GIX * 32);

        if (this.GIFrame >= GIF.LEAP_RS + 3 && this.GIFrame <= GIF.LEAP_RS + 7)
          this.GIXOffset += 3;

        if (this.GIFrame === GIF.LEAP_RS + 3) this.GIYOffset -= 1;
        if (this.GIFrame === GIF.LEAP_RS + 5) this.GIYOffset += 1;
        if (this.GIFrame === GIF.LEAP_RS + 6) this.GIYOffset += 2;
        if (this.GIFrame === GIF.LEAP_RS + 7) this.GIYOffset += 3;

        if (this.GIFrame >= GIF.LEAP_RS + 9) {
          this.GIXOffset += 1;
          this.GIYOffset -= 1;
        }

        if (this.GIFrame > GIF.LEAP_RE) {
          this.GIX += 2;
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
          this.GIXOffset = 0;
          this.GIYOffset = 0;
        }
        break;
      }

      case GIState.LeapCatchLeft: {
        this.GIFrameChange += GI_LEAPCATCH_FRAMECHANGE;
        if (this.GIFrame > GIF.LEAPCATCH_LE) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
        }
        break;
      }

      case GIState.LeapCatchRight: {
        this.GIFrameChange += GI_LEAPCATCH_FRAMECHANGE;
        if (this.GIFrame > GIF.LEAPCATCH_RE) {
          this.GIState = GIState.Stand;
          this.GIFrame = GIF.STAND;
          this.GIFrameChange = 0;
        }
        break;
      }
    }
  }

  draw(
    renderer: Renderer,
    giSheet: SpriteSheet,
    dominoSheet: SpriteSheet,
    ladderDominoes: ImageBitmap[],
    postLadder: boolean,
  ): void {
    if (!this.enabled) return;

    if (!postLadder) {
      if (this.GIDomino > 0) {
        const domDrawType = this.GIDomino;
        let domDrawYOffset = 0;

        if (
          this.GIState === GIState.HoldRight ||
          this.GIState === GIState.CarryRight ||
          this.GIState === GIState.CarryUpRight ||
          this.GIState === GIState.CarryDownRight ||
          this.GIState === GIState.GetupRight
        ) {
          if (this.GIFrame === GIF.CARRYSTEP_RS + 1) domDrawYOffset = -2;
          if (this.GIFrame === GIF.CARRYSTEP_RS + 2) domDrawYOffset = 2;
          if (this.GIFrame === GIF.GETUP_RS) domDrawYOffset = 3;
          if (this.GIFrame === GIF.GETUP_RS + 1) domDrawYOffset = 2;
          if (this.GIFrame === GIF.GETUP_RS + 2) domDrawYOffset = 1;

          const ox = Math.trunc(this.GIXOffset);
          const oy = Math.trunc(this.GIYOffset);
          if (domDrawType !== DominoType.Ascender) {
            renderer.blitImage(
              dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + (DOM_UPRIGHT - 2)),
              (this.GIX - 1) * 32 - 8 + ox,
              this.GIY * 16 - 36 + oy + domDrawYOffset,
            );
          } else {
            renderer.blitImage(
              dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + (DOM_UPRIGHT + 2)),
              (this.GIX - 1) * 32 - 24 + ox,
              this.GIY * 16 - 32 + oy + domDrawYOffset,
            );
          }
        } else if (
          this.GIState === GIState.HoldLeft ||
          this.GIState === GIState.CarryLeft ||
          this.GIState === GIState.CarryUpLeft ||
          this.GIState === GIState.CarryDownLeft ||
          this.GIState === GIState.GetupLeft
        ) {
          if (this.GIFrame === GIF.CARRYSTEP_LS + 1) domDrawYOffset = -2;
          if (this.GIFrame === GIF.CARRYSTEP_LS + 2) domDrawYOffset = 2;
          if (this.GIFrame === GIF.GETUP_LS) domDrawYOffset = 3;
          if (this.GIFrame === GIF.GETUP_LS + 1) domDrawYOffset = 2;
          if (this.GIFrame === GIF.GETUP_LS + 2) domDrawYOffset = 1;

          const ox = Math.trunc(this.GIXOffset);
          const oy = Math.trunc(this.GIYOffset);
          if (domDrawType !== DominoType.Ascender) {
            renderer.blitImage(
              dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + (DOM_UPRIGHT + 2)),
              (this.GIX - 1) * 32 - 30 + ox,
              this.GIY * 16 - 36 + oy + domDrawYOffset,
            );
          } else {
            renderer.blitImage(
              dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + (DOM_UPRIGHT - 2)),
              (this.GIX - 1) * 32 - 16 + ox,
              this.GIY * 16 - 34 + oy + domDrawYOffset,
            );
          }
        } else if (
          this.GIState === GIState.PrefallLeft &&
          this.GIFrame <= GI_PREFALL_DROPPOINT_L
        ) {
          renderer.blitImage(
            dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + DOM_UPRIGHT),
            (this.GIX - 1) * 32 - 20 + Math.trunc(this.GIXOffset),
            this.GIY * 16 - 32,
          );
        } else if (
          this.GIState === GIState.PrefallRight &&
          this.GIFrame <= GI_PREFALL_DROPPOINT_R
        ) {
          renderer.blitImage(
            dominoSheet.getFrame((domDrawType - 1) * DOM_FPD + DOM_UPRIGHT),
            (this.GIX - 1) * 32 - 20 + Math.trunc(this.GIXOffset),
            this.GIY * 16 - 32,
          );
        }
      }
    }

    const px = Math.trunc((this.GIX - 1) * 32 - 4 + this.GIXOffset);
    const py = Math.trunc(this.GIY * 16 - 32 + this.GIYOffset);

    if (
      this.GIState === GIState.ClimbUp ||
      this.GIState === GIState.ClimbDown ||
      this.GIState === GIState.Climb
    ) {
      if (postLadder) {
        renderer.blitImage(giSheet.getFrameAt(this.GIFrame, this.currentCostume), px, py);

        if (this.GIDomino > 0) {
          const domDrawType = this.GIDomino;
          renderer.blitImage(
            ladderDominoes[domDrawType - 1],
            Math.trunc((this.GIX - 1) * 32 - 6 + this.GIXOffset),
            Math.trunc(this.GIY * 16 - 30 + this.GIYOffset),
          );
        }
      }
    } else if (!postLadder) {
      renderer.blitImage(giSheet.getFrameAt(this.GIFrame, this.currentCostume), px, py);
    }
  }
}
