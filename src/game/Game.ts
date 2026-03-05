import { Renderer } from '../engine/Renderer';
import { InputManager } from '../engine/InputManager';
import { AudioManager } from '../engine/AudioManager';
import { GameLoop } from '../engine/GameLoop';
import { AssetLoader } from '../engine/AssetLoader';
import { SpriteSheet } from '../engine/SpriteSheet';
import { MapManager } from './MapManager';
import { TilesetManager } from './TilesetManager';
import { DominoManager } from './Dominoes';
import { Player, type ProcessContext } from './Player';
import { SoundManager } from './Sounds';
import { MusicManager } from './MusicManager';
import { EffectsManager } from './Effects';
import { GameTimer } from './Timer';
import { ProfileManager } from './Profiles';
import { NumberDisplay } from './Numbers';
import { getImageUrl } from '../assets';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAPWIDTH,
  MAPHEIGHT2,
  TILE_SIZE,
  HALF_TILE,
  CLOSED_DOOR,
  OPEN_DOOR,
  MapSet,
  GameScreen,
  LevelState,
  GIState,
  GIF,
  GI_FRAMES,
  DOM_FPD,
  DOM_TYPES,
  SoundId,
  Control,
  MESSAGE_DELAY,
  LAST_MAP,
} from './constants';

const DOMINO_SPRITE_WIDTH = 72;
const DOMINO_SPRITE_HEIGHT = 38;
const LADDER_DOMINO_WIDTH = 26;
const LADDER_DOMINO_HEIGHT = 37;
const RUBBLE_SIZE = 32;
const GI_FRAME_WIDTH = 40;
const GI_FRAME_HEIGHT = 44;
const GI_COSTUMES = 3;
const LADDER_DOMINO_COUNT = 19;
const RUBBLE_FRAME_COUNT = 3;
const FADE_SPEED = 48;

const CONVEYOR_TILE_SIZE = 32;
const CONVEYOR_FRAMES = 4;
const CONVEYOR_TILE_COUNT = 16;
const CONVEYOR_Y = 153;
const CONVEYOR_START_TILE = 2;

const DOMINO_FONT_CHAR_WIDTH = 32;
const DOMINO_FONT_CHAR_HEIGHT = 35;
const DOMINO_FONT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-+?';

const TITLE_MESSAGES = [
  'PUSHOVER web by +ishisoft',
  'original game copyright 1992 RED RAT and OCEAN',
  'CODING AND GRAPHICS - craig forrester',
  'ADDITIONAL GRAPHICS - jim riley',
  'ADDITIONAL CODING - rob emery',
  'WEB CONVERSION - ?ben darlow',
  'ORIGINAL CONCEPT - chas partington',
  'ORIGINAL PUZZLES - harry nadler, helen elcock, avril rigby, don rigby, chris waterworth',
  'MUSIC + SFX - jonathan dunn, dean evans, keith tinman',
  'THANKS TO - the people at www.retroremakes.com',
];

const TITLE_SCROLL_SPEED = 2;
const TITLE_MESSAGE_Y = 128;
const TITLE_MESSAGE_RESET_X = 600;
const TITLE_MESSAGE_END_MARGIN = 40;

export class Game {
  private renderer: Renderer;
  private input: InputManager;
  private audio: AudioManager;
  private loop: GameLoop;
  private assets: AssetLoader;

  private map: MapManager;
  private tileset: TilesetManager;
  private dominoes: DominoManager;
  private players: Player[] = [];
  private sounds: SoundManager;
  private music: MusicManager;
  private effects: EffectsManager;
  private timer: GameTimer;
  private profiles: ProfileManager;
  private numbers: NumberDisplay;

  private levelState: LevelState = LevelState.OpenDoor;
  private currentMap = 1;
  private mapSet = MapSet.Original;
  private giOut = 1;
  private renderFirst: Player | null = null;
  private messageDelay = 0;
  private messageDelayStyle = 0;
  private screenFade = 255;
  private paused = false;
  private levelLoading = false;

  private gameScreen: GameScreen = GameScreen.TitleMenu;
  private titleBackdrop!: HTMLImageElement;
  private titleFront!: HTMLImageElement;
  private titleFront2!: HTMLImageElement;
  private conveyorSheet!: SpriteSheet;
  private dominoFontImage!: HTMLImageElement;
  private muteIcon!: HTMLImageElement;
  private conveyorFrame = 0;
  private conveyorTick = false;
  private titleMessageX = GAME_WIDTH;
  private titleMessageNum = 0;

  private giSpriteSheet!: SpriteSheet;
  private dominoSheet!: SpriteSheet;
  private ladderDominoes: ImageBitmap[] = [];
  private rubbleFrames: ImageBitmap[] = [];
  private currentDominoSet = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.audio = new AudioManager();
    this.assets = new AssetLoader();

    this.map = new MapManager();
    this.tileset = new TilesetManager(this.assets);
    this.dominoes = new DominoManager();
    this.sounds = new SoundManager(this.audio);
    this.music = new MusicManager(this.audio);
    this.effects = new EffectsManager();
    this.timer = new GameTimer();
    this.profiles = new ProfileManager();
    this.numbers = new NumberDisplay();

    this.loop = new GameLoop(
      () => {
        this.update();
        this.input.update();
      },
      () => this.render(),
    );
  }

  async start(): Promise<void> {
    await this.loadAssets();

    this.profiles.load();
    if (this.profiles.getAll().length === 0) {
      this.profiles.create('Player');
      this.profiles.setActive(0);
    } else {
      this.profiles.setActive(0);
    }

    this.gameScreen = GameScreen.TitleMenu;
    this.music.requestMusic(100);
    this.loop.start();
  }

  private async loadAssets(): Promise<void> {
    this.giSpriteSheet = new SpriteSheet(
      getImageUrl('image/gi.png'),
      GI_FRAME_WIDTH,
      GI_FRAME_HEIGHT,
      GI_FRAMES,
      GI_COSTUMES,
    );

    this.conveyorSheet = new SpriteSheet(
      getImageUrl('image/title/conveyor.png'),
      CONVEYOR_TILE_SIZE,
      CONVEYOR_TILE_SIZE,
      1,
      CONVEYOR_FRAMES,
    );

    const [, , , , , backdrop, front, front2, dominoFont, muteIcon] = await Promise.all([
      this.giSpriteSheet.load(),
      this.numbers.load(),
      this.effects.loadImages(),
      this.sounds.loadAll(),
      this.conveyorSheet.load(),
      this.assets.loadImage(getImageUrl('image/title/backdrop.png')),
      this.assets.loadImage(getImageUrl('image/title/front.png')),
      this.assets.loadImage(getImageUrl('image/title/front2.png')),
      this.assets.loadImage(getImageUrl('image/title/domino-font.png')),
      this.assets.loadImage(getImageUrl('image/mute.png')),
    ]);

    this.titleBackdrop = backdrop;
    this.titleFront = front;
    this.titleFront2 = front2;
    this.dominoFontImage = dominoFont;
    this.muteIcon = muteIcon;
  }

  private async loadDominoSprites(dominoSet: number): Promise<void> {
    if (dominoSet === this.currentDominoSet && this.dominoSheet) return;
    this.currentDominoSet = dominoSet;

    this.dominoSheet = new SpriteSheet(
      getImageUrl(`image/domino/${dominoSet}/domino.png`),
      DOMINO_SPRITE_WIDTH,
      DOMINO_SPRITE_HEIGHT,
      DOM_FPD,
      DOM_TYPES,
    );

    const [, ladImg, rubImg] = await Promise.all([
      this.dominoSheet.load(),
      this.assets.loadImage(getImageUrl(`image/domino/${dominoSet}/ladder.png`)),
      this.assets.loadImage(getImageUrl(`image/domino/${dominoSet}/rubble.png`)),
    ]);

    const ladCanvas = new OffscreenCanvas(ladImg.width, ladImg.height);
    const ladCtx = ladCanvas.getContext('2d')!;
    ladCtx.drawImage(ladImg, 0, 0);

    const ladPromises: Promise<ImageBitmap>[] = [];
    for (let i = 0; i < LADDER_DOMINO_COUNT; i++) {
      ladPromises.push(
        createImageBitmap(
          ladCanvas,
          i * LADDER_DOMINO_WIDTH,
          0,
          LADDER_DOMINO_WIDTH,
          LADDER_DOMINO_HEIGHT,
        ),
      );
    }
    this.ladderDominoes = await Promise.all(ladPromises);

    const rubCanvas = new OffscreenCanvas(rubImg.width, rubImg.height);
    const rubCtx = rubCanvas.getContext('2d')!;
    rubCtx.drawImage(rubImg, 0, 0);

    const rubPromises: Promise<ImageBitmap>[] = [];
    for (let i = 0; i < RUBBLE_FRAME_COUNT; i++) {
      rubPromises.push(createImageBitmap(rubCanvas, i * RUBBLE_SIZE, 0, RUBBLE_SIZE, RUBBLE_SIZE));
    }
    this.rubbleFrames = await Promise.all(rubPromises);
  }

  private async loadLevelData(mapNum: number): Promise<void> {
    this.currentMap = mapNum;

    const mapData = await this.map.loadMap(this.mapSet, mapNum);

    if (mapData.tileset !== this.tileset.gameTileset) {
      await this.tileset.loadTileset(mapData.tileset);
    }

    await this.loadDominoSprites(mapData.dominoSet);

    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        this.dominoes.domino[x]![y]![0] = mapData.domino[x]?.[y] ?? 0;
        this.dominoes.domino[x]![y]![1] = 0;
      }
    }
    this.dominoes.initialiseDominoes();
    this.dominoes.updateAllowedCount([]);

    const p = new Player(0);
    p.GIX = this.map.doorX;
    p.GIY = this.map.doorY;
    p.GIState = GIState.Exit;
    p.GIFrame = GIF.EXIT_S;
    p.currentCostume = 0;
    p.GIDomino = 0;
    p.GIPushesRemain = this.dominoes.allowedCount;
    p.GIWaved = false;
    p.GIShrugNeeded = false;
    p.GIXOffset = HALF_TILE;
    p.enabled = true;
    this.players = [p];

    this.giOut = 1;
    this.renderFirst = null;

    this.timer.init(mapData.time.minutes, mapData.time.seconds);
    this.music.requestMusic(mapData.tileset);

    this.levelState = LevelState.OpenDoor;
    this.screenFade = 255;
    this.messageDelay = 0;
    this.messageDelayStyle = 0;
    this.paused = false;

    this.effects.reset();

    this.sounds.playSound(SoundId.OpenDoor, this.map.doorX * TILE_SIZE);
  }

  private triggerLevelLoad(mapNum: number): void {
    if (this.levelLoading) return;
    this.levelLoading = true;
    this.loop.stop();
    void this.loadLevelData(mapNum)
      .then(() => {
        this.levelLoading = false;
        this.loop.start();
      })
      .catch((err) => {
        console.error('Failed to load level:', err);
        this.levelLoading = false;
      });
  }

  // --- Update ---

  private update(): void {
    if (this.input.keyHit('KeyM')) {
      this.audio.toggleMute();
    }

    if (this.levelLoading) return;

    if (this.gameScreen === GameScreen.TitleMenu) {
      this.updateTitleMenu();
      return;
    }

    if (this.screenFade > 0) {
      this.screenFade -= FADE_SPEED;
      if (this.screenFade < 0) this.screenFade = 0;
    }

    if (this.input.keyHit('Escape')) {
      this.paused = !this.paused;
    }
    if (this.paused) return;

    this.processDoors();
    this.effects.process();

    const heldDominoes = this.players.map((pl) => pl.GIDomino);
    this.dominoes.processDominoes(
      this.map.ledge,
      this.map.ladder,
      {
        onPlaySound: (id, x) => this.sounds.playSound(id, x),
        onStartEffect: (x, y, type) => this.effects.startEffect(x, y, type),
        onUpdateLedge: () => this.map.updateLedge(),
      },
      heldDominoes,
    );

    if (this.isPlayState()) {
      for (const player of this.players) {
        player.process(this.createProcessContext(player));
      }
    }

    if (this.levelState === LevelState.Playing || this.levelState === LevelState.OpenExit) {
      this.timer.update();
    }

    if (this.dominoes.levelCompleteState === 1 && this.levelState === LevelState.Playing) {
      this.levelState = LevelState.OpenExit;
      this.sounds.playSound(SoundId.OpenDoor, this.map.door2X * TILE_SIZE);
    }

    if (
      this.dominoes.levelCompleteState === 2 &&
      this.levelState === LevelState.Playing &&
      this.messageDelay === 0
    ) {
      for (const player of this.players) {
        player.GIShrugNeeded = true;
      }
      this.messageDelay = MESSAGE_DELAY;
    }

    if (this.messageDelay > 0) {
      this.messageDelay--;
      if (this.messageDelay === 0) {
        this.triggerLevelLoad(this.currentMap);
      }
    }
  }

  // --- Render ---

  private render(): void {
    if (this.levelLoading) return;

    this.renderer.clear();

    if (this.gameScreen === GameScreen.TitleMenu) {
      this.renderTitleMenu();
      return;
    }

    this.map.drawBackground(this.renderer, this.tileset);
    this.map.drawLedgeShadows(this.renderer, this.tileset);

    for (let y = 0; y < MAPHEIGHT2; y++) {
      this.map.drawLedgeRow(this.renderer, this.tileset, y);
      this.drawDominoRow(y);
      this.drawRubbleRow(y);
    }

    const ordered = this.getOrderedPlayers();

    for (const player of ordered) {
      player.draw(this.renderer, this.giSpriteSheet, this.dominoSheet, this.ladderDominoes, false);
    }

    this.map.drawLadders(this.renderer, this.tileset);

    for (const player of ordered) {
      player.draw(this.renderer, this.giSpriteSheet, this.dominoSheet, this.ladderDominoes, true);
    }

    this.effects.draw(this.renderer);
    this.drawHUD();

    if (this.screenFade > 0) {
      const ctx = this.renderer.getContext();
      ctx.fillStyle = `rgba(0, 0, 0, ${this.screenFade / 255})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  private drawDominoRow(y: number): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      const col = this.dominoes.domino[x];
      if (!col) continue;
      const cell = col[y];
      if (!cell) continue;

      for (let i = 0; i < 2; i++) {
        const type = cell[i];
        if (type === undefined || type <= 0) continue;

        const frameCol = this.dominoes.domFrame[x];
        const frameCell = frameCol?.[y];
        const frame = Math.floor(frameCell?.[i] ?? 0);
        const frameIndex = (type - 1) * DOM_FPD + frame;

        if (frameIndex >= 0 && frameIndex < this.dominoSheet.totalFrames) {
          const dxCol = this.dominoes.domX[x];
          const dyCol = this.dominoes.domY[x];
          const drawX = (x - 1) * TILE_SIZE - 22 + Math.trunc(dxCol?.[y]?.[i] ?? 0);
          const drawY = y * HALF_TILE - 30 + Math.trunc(dyCol?.[y]?.[i] ?? 0);
          this.renderer.blitImage(this.dominoSheet.getFrame(frameIndex), drawX, drawY);
        }
      }
    }
  }

  private drawRubbleRow(y: number): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      const rubbleType = this.dominoes.rubble[x]?.[y];
      if (rubbleType === undefined || rubbleType <= 0) continue;
      if (rubbleType > this.rubbleFrames.length) continue;

      const rubbleFrame = this.rubbleFrames[rubbleType - 1];
      if (!rubbleFrame) continue;

      const drawX = (x - 1) * TILE_SIZE;
      const drawY = y * HALF_TILE - TILE_SIZE + Math.trunc(this.dominoes.rubbleY[x]?.[y] ?? 0);
      this.renderer.blitImage(rubbleFrame, drawX, drawY);
    }
  }

  private drawHUD(): void {
    const dominoPresence = (x: number, y: number): boolean => {
      if (x < 0 || x >= MAPWIDTH || y < 0 || y >= MAPHEIGHT2) return false;
      const col = this.dominoes.domino[x];
      const cell = col?.[y];
      return (cell?.[0] ?? 0) > 0 || (cell?.[1] ?? 0) > 0;
    };

    const playerPositions = this.players
      .filter((pl) => pl.enabled)
      .map((pl) => ({ x: pl.GIX, y: pl.GIY }));

    const { timer, counter } = this.numbers.shouldBeTransparent(dominoPresence, playerPositions);

    this.numbers.drawTimer(
      this.renderer,
      this.timer.mins,
      this.timer.secs,
      this.timer.negative,
      this.timer.colonVisible,
      timer,
    );

    this.numbers.drawLevelCounter(
      this.renderer,
      this.currentMap,
      this.profiles.active?.tokens ?? 0,
      counter,
    );

    if (this.audio.isMuted) {
      this.renderer.blitImage(this.muteIcon, 16, 8);
    }
  }

  // --- Title menu ---

  private updateTitleMenu(): void {
    if (this.input.keyHit('Enter') || this.input.keyHit('Space')) {
      this.startGame();
      return;
    }

    this.conveyorTick = !this.conveyorTick;
    if (this.conveyorTick) {
      this.conveyorFrame = (this.conveyorFrame + 1) % CONVEYOR_FRAMES;
    }

    this.titleMessageX -= TITLE_SCROLL_SPEED;
    const msg = TITLE_MESSAGES[this.titleMessageNum] ?? '';
    if (this.titleMessageX < TITLE_MESSAGE_END_MARGIN + msg.length * -DOMINO_FONT_CHAR_WIDTH) {
      this.titleMessageX = TITLE_MESSAGE_RESET_X;
      this.titleMessageNum = (this.titleMessageNum + 1) % TITLE_MESSAGES.length;
    }
  }

  private renderTitleMenu(): void {
    this.renderer.blitImage(this.titleBackdrop, 0, 0);
    this.renderer.blitImage(this.titleFront2, 0, 0);

    const conveyorBitmap = this.conveyorSheet.getFrame(this.conveyorFrame);
    for (let i = 0; i < CONVEYOR_TILE_COUNT; i++) {
      this.renderer.blitImage(
        conveyorBitmap,
        (i + CONVEYOR_START_TILE) * CONVEYOR_TILE_SIZE,
        CONVEYOR_Y,
      );
    }

    this.drawDominoText(
      TITLE_MESSAGES[this.titleMessageNum] ?? '',
      this.titleMessageX,
      TITLE_MESSAGE_Y,
    );

    this.renderer.blitImage(this.titleFront, 0, 0);

    const ctx = this.renderer.getContext();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PRESS ENTER TO START', GAME_WIDTH / 2 + 1, 381);

    ctx.fillStyle = '#f0e0a0';
    ctx.fillText('PRESS ENTER TO START', GAME_WIDTH / 2, 380);
  }

  private drawDominoText(text: string, x: number, y: number): void {
    for (let i = 0; i < text.length; i++) {
      const charIndex = DOMINO_FONT_CHARS.indexOf(text[i]!);
      if (charIndex >= 0) {
        this.renderer.blit(
          this.dominoFontImage,
          charIndex * DOMINO_FONT_CHAR_WIDTH,
          0,
          DOMINO_FONT_CHAR_WIDTH,
          DOMINO_FONT_CHAR_HEIGHT,
          x + i * DOMINO_FONT_CHAR_WIDTH,
          y,
        );
      }
    }
  }

  private startGame(): void {
    this.levelLoading = true;
    this.gameScreen = GameScreen.Playing;
    void this.loadLevelData(1)
      .then(() => {
        this.levelLoading = false;
      })
      .catch((err) => {
        console.error('Failed to start game:', err);
        this.levelLoading = false;
      });
  }

  // --- Door animation ---

  private processDoors(): void {
    switch (this.levelState) {
      case LevelState.OpenDoor: {
        const bgY = (this.map.doorY - 1) >> 1;
        const bgCol = this.map.background[this.map.doorX];
        if (!bgCol) break;
        const tile = bgCol[bgY] ?? CLOSED_DOOR;
        if (tile < OPEN_DOOR) {
          bgCol[bgY] = tile + 1;
        } else {
          this.levelState = LevelState.CloseDoor;
        }
        break;
      }

      case LevelState.CloseDoor: {
        const allExited = this.players.every((pl) => pl.GIState !== GIState.Exit);
        if (allExited) {
          const bgY = (this.map.doorY - 1) >> 1;
          const bgCol = this.map.background[this.map.doorX];
          if (!bgCol) break;
          const tile = bgCol[bgY] ?? CLOSED_DOOR;
          if (tile > CLOSED_DOOR) {
            bgCol[bgY] = tile - 1;
          } else {
            this.sounds.playSound(SoundId.CloseDoor, this.map.doorX * TILE_SIZE);
            this.levelState = LevelState.Playing;
          }
        }
        break;
      }

      case LevelState.OpenExit: {
        const bgY = (this.map.door2Y - 1) >> 1;
        const bgCol = this.map.background[this.map.door2X];
        if (!bgCol) break;
        const tile = bgCol[bgY] ?? CLOSED_DOOR;
        if (tile < OPEN_DOOR) {
          bgCol[bgY] = tile + 1;
        }
        break;
      }

      case LevelState.CloseExit: {
        const bgY = (this.map.door2Y - 1) >> 1;
        const bgCol = this.map.background[this.map.door2X];
        if (!bgCol) break;
        const tile = bgCol[bgY] ?? CLOSED_DOOR;
        if (tile > CLOSED_DOOR) {
          bgCol[bgY] = tile - 1;
        } else {
          this.sounds.playSound(SoundId.CloseDoor, this.map.door2X * TILE_SIZE);
          this.currentMap++;
          const lastMap = LAST_MAP[this.mapSet];
          if (lastMap !== undefined && this.currentMap > lastMap) {
            this.currentMap = 1;
          }
          this.triggerLevelLoad(this.currentMap);
        }
        break;
      }
    }
  }

  // --- Player context ---

  private getPlayerKeys(player: Player, control: Control): string[] {
    switch (control) {
      case Control.Up:
        return [player.upKey];
      case Control.Down:
        return [player.downKey];
      case Control.Left:
        return [player.leftKey];
      case Control.Right:
        return [player.rightKey];
      case Control.Fire:
        return player.fireKeys;
    }
  }

  private createProcessContext(player: Player): ProcessContext {
    const other = this.players.find((pl) => pl !== player) ?? null;

    const context: ProcessContext = Object.defineProperties(
      {
        contHit: (control: Control) =>
          this.getPlayerKeys(player, control).some((k) => this.input.keyHit(k)),
        contDown: (control: Control) =>
          this.getPlayerKeys(player, control).some((k) => this.input.keyDown(k)),

        ledge: this.map.ledge,
        ladder: this.map.ladder,
        domino: this.dominoes.domino,
        domState: this.dominoes.domState,
        domFrame: this.dominoes.domFrame,
        domFrameChange: this.dominoes.domFrameChange,
        domDelay: this.dominoes.domDelay,
        domX: this.dominoes.domX,
        domY: this.dominoes.domY,
        rubble: this.dominoes.rubble,
        background: this.map.background,

        otherPlayer: other,

        playSound: (id: SoundId, x: number) => this.audio.playSound(id, x),
        stopSound: (channel: number) => this.audio.stopSound(channel),
        isSoundPlaying: () => true,

        saveTokenState: () => {
          // Will be used for token scoring with level select screen
        },

        blowExploder: (x: number, y: number, layer: number) => {
          this.dominoes.blowExploder(x, y, layer, this.map.ledge);
        },

        rebounder: (x: number, y: number, layer: number) => this.dominoes.rebounder(x, y, layer),
      } as unknown as ProcessContext,
      {
        levelState: {
          get: () => this.levelState,
          set: (v: LevelState) => {
            this.levelState = v;
          },
          enumerable: true,
          configurable: true,
        },
        levelCompleteState: {
          get: () => this.dominoes.levelCompleteState,
          enumerable: true,
          configurable: true,
        },
        starter: {
          get: () => this.dominoes.starter,
          set: (v: boolean) => {
            this.dominoes.starter = v;
          },
          enumerable: true,
          configurable: true,
        },
        mimics: {
          get: () => this.dominoes.mimics,
          set: (v: number) => {
            this.dominoes.mimics = v;
          },
          enumerable: true,
          configurable: true,
        },
        GIOut: {
          get: () => this.giOut,
          set: (v: number) => {
            this.giOut = v;
          },
          enumerable: true,
          configurable: true,
        },
        renderFirst: {
          get: () => this.renderFirst,
          set: (v: Player | null) => {
            this.renderFirst = v;
          },
          enumerable: true,
          configurable: true,
        },
        messageDelay: {
          get: () => this.messageDelay,
          set: (v: number) => {
            this.messageDelay = v;
          },
          enumerable: true,
          configurable: true,
        },
        messageDelayStyle: {
          get: () => this.messageDelayStyle,
          set: (v: number) => {
            this.messageDelayStyle = v;
          },
          enumerable: true,
          configurable: true,
        },
      },
    );

    return context;
  }

  // --- Helpers ---

  private getOrderedPlayers(): Player[] {
    if (this.renderFirst && this.players.includes(this.renderFirst)) {
      return [this.renderFirst, ...this.players.filter((pl) => pl !== this.renderFirst)];
    }
    return [...this.players];
  }

  private isPlayState(): boolean {
    return (
      this.levelState === LevelState.OpenDoor ||
      this.levelState === LevelState.CloseDoor ||
      this.levelState === LevelState.Playing ||
      this.levelState === LevelState.OpenExit
    );
  }
}
