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
import { MessageBox, RenderMode, TextColor } from './MessageBox';
import { getImageUrl, loadMapData } from '../assets';
import type { MapData } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAPWIDTH,
  MAPHEIGHT,
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
  MessageType,
  LAST_MAP,
  TILESET_NAMES,
  MAP_SET_NAMES,
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

const PANELS_COUNT = 37;
const PANEL_WIDTH = 256;
const PANEL_HEIGHT = 32;
const ARROW_WIDTH = 32;
const ARROW_HEIGHT = 64;
const ARROW_COLUMNS = 2;
const ARROW_ROWS = 2;

const TITLE_CAM_MAX = 288;
const TITLE_CAM_SPEED = 8;

const VISIBLE_LEVELS = 6;
const LS_ENTRY_SPACING = 37;
const LS_LIST_X = 50;
const LS_LIST_Y = 524;
const LS_PANEL_X = 112;
const LS_NAME_X = 133;
const LS_NAME_Y = 536;
const LS_NUM_X = 78;
const LS_NUM_Y = 535;
const LS_TITLE_X = 333;
const LS_TITLE_Y = 485;
const LS_MAPSET_Y = 505;
const LS_LEFT_ARROW_X = 8;
const LS_RIGHT_ARROW_X = 600;
const LS_ARROW_Y = 600;
const LS_PROFILE_X = 480;
const LS_PROFILE_NAME_Y = 560;
const LS_PROFILE_TOKENS_Y = 600;
const LS_MINIMAP_X = 252;
const LS_MINIMAP_Y = 316;
const LS_MINIMAP_W = 160;
const LS_MINIMAP_H = 120;
const BABY_TILE = 8;
const BABY_HALF = 4;

const TITLE_MESSAGES = [
  'PUSHOVER for WEB',
  'based on PUSHOVER 2 by +ishisoft',
  'original game copyright 1992 RED RAT and OCEAN',
  'CODING AND GRAPHICS - craig forrester',
  'ADDITIONAL GRAPHICS - jim riley',
  'ADDITIONAL CODING - rob emery',
  'WEB CONVERSION - ?ben darlow',
  'ORIGINAL CONCEPT - chas partington',
  'ORIGINAL PUZZLES - harry nadler, helen elcock, avril rigby, don rigby, chris waterworth',
  'MUSIC + SFX - jonathan dunn, dean evans, keith tinman',
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
  private messageBox: MessageBox;

  private levelState: LevelState = LevelState.OpenDoor;
  private currentMap = 1;
  private mapSet = MapSet.Original;
  private giOut = 1;
  private renderFirst: Player | null = null;
  private messageDelay = 0;
  private messageDelayStyle = 0;
  private screenFade = 255;
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

  private panelsSheet!: SpriteSheet;
  private panelFrameImage!: HTMLImageElement;
  private arrowsSheet!: SpriteSheet;
  private titleCam = 0;
  private levelSelect = 1;
  private levelScroll = 1;
  private levelScrollControl = 0;
  private levelTilesets: number[] = [];
  private miniMapBitmap: ImageBitmap | null = null;
  private miniMapLoading = false;
  private miniMapLevel = -1;
  private miniMapDesiredLevel = -1;
  private arrow1X = 0;
  private arrow2X = 0;

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
    this.messageBox = new MessageBox();

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
    void this.loadLevelTilesets();
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

    this.panelsSheet = new SpriteSheet(
      getImageUrl('image/title/panels.png'),
      PANEL_WIDTH,
      PANEL_HEIGHT,
      1,
      PANELS_COUNT,
    );

    this.arrowsSheet = new SpriteSheet(
      getImageUrl('image/title/arrows.png'),
      ARROW_WIDTH,
      ARROW_HEIGHT,
      ARROW_COLUMNS,
      ARROW_ROWS,
    );

    const [, , , , , , , , backdrop, front, front2, dominoFont, muteIcon, panelFrame] =
      await Promise.all([
        this.giSpriteSheet.load(),
        this.numbers.load(),
        this.effects.loadImages(),
        this.sounds.loadAll(),
        this.conveyorSheet.load(),
        this.messageBox.load(),
        this.panelsSheet.load(),
        this.arrowsSheet.load(),
        this.assets.loadImage(getImageUrl('image/title/backdrop.png')),
        this.assets.loadImage(getImageUrl('image/title/front.png')),
        this.assets.loadImage(getImageUrl('image/title/front2.png')),
        this.assets.loadImage(getImageUrl('image/title/domino-font.png')),
        this.assets.loadImage(getImageUrl('image/mute.png')),
        this.assets.loadImage(getImageUrl('image/title/panel-frame.png')),
      ]);

    this.titleBackdrop = backdrop;
    this.titleFront = front;
    this.titleFront2 = front2;
    this.dominoFontImage = dominoFont;
    this.muteIcon = muteIcon;
    this.panelFrameImage = panelFrame;
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
    this.messageBox.hide();

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

    if (this.gameScreen === GameScreen.TitleMenu || this.gameScreen === GameScreen.LevelSelect) {
      this.updateTitleScene();
      return;
    }

    if (this.messageBox.isActive) {
      this.updateMessageBox();
      return;
    }

    if (this.screenFade > 0) {
      this.screenFade -= FADE_SPEED;
      if (this.screenFade < 0) this.screenFade = 0;
    }

    if (this.input.keyHit('Escape') || this.input.keyHit('KeyP')) {
      this.showMessage(MessageType.Pause);
      return;
    }

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
      this.messageDelayStyle = this.dominoes.levelCompleteMessage ?? MessageType.NotAllToppled;
      this.messageDelay = MESSAGE_DELAY;
    }

    if (this.messageDelay > 0) {
      this.messageDelay--;
      if (this.messageDelay === 0) {
        this.showMessage(this.messageDelayStyle as MessageType);
      }
    }
  }

  private showMessage(type: MessageType): void {
    const tokens = this.profiles.active?.tokens ?? 0;
    this.messageBox.show(type, tokens, this.timer.negative);
  }

  private updateMessageBox(): void {
    const result = this.messageBox.update(
      (code) => this.input.keyHit(code),
      (id, x) => this.sounds.playSound(id, x),
    );

    if (result === null) return;

    const type = this.messageBox.type;
    this.messageBox.hide();

    switch (type) {
      case MessageType.Pause:
        this.handlePauseResult(result);
        break;

      case MessageType.TokenGain:
        this.profiles.addToken();
        this.proceedToNextLevel();
        break;

      case MessageType.TooSlow:
        this.handleFailureResult(result, true);
        break;

      case MessageType.NotAllToppled:
      case MessageType.StillHolding:
      case MessageType.Crashed:
      case MessageType.Died:
        this.handleFailureResult(result, false);
        break;
    }
  }

  private handlePauseResult(option: number): void {
    switch (option) {
      case 6: // Continue
        break;
      case 7: // Retry
        this.triggerLevelLoad(this.currentMap);
        break;
      case 8: // Quit
        this.returnToTitle();
        break;
    }
  }

  private handleFailureResult(option: number, isTooSlow: boolean): void {
    switch (option) {
      case 6: // Use Token
        this.profiles.useToken();
        if (isTooSlow) {
          this.proceedToNextLevel();
        } else {
          this.triggerLevelLoad(this.currentMap);
        }
        break;
      case 7: // Replay
        this.triggerLevelLoad(this.currentMap);
        break;
      case 8: // Quit
        this.returnToTitle();
        break;
    }
  }

  private proceedToNextLevel(): void {
    this.profiles.markLevelComplete(this.mapSet, this.currentMap);

    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    if (this.currentMap >= lastMap) {
      this.returnToTitle();
      return;
    }

    this.currentMap++;
    this.triggerLevelLoad(this.currentMap);
  }

  private returnToTitle(): void {
    this.gameScreen = GameScreen.LevelSelect;
    this.screenFade = 255;
    this.titleCam = TITLE_CAM_MAX;
    this.music.requestMusic(100);

    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    this.levelSelect = Math.max(1, Math.min(this.currentMap, lastMap));
    this.levelScroll = Math.max(1, this.levelSelect - 1);
    if (this.levelScroll > lastMap - VISIBLE_LEVELS + 1) {
      this.levelScroll = Math.max(1, lastMap - VISIBLE_LEVELS + 1);
    }

    this.requestMiniMap(this.levelSelect);
  }

  // --- Render ---

  private render(): void {
    if (this.levelLoading) return;

    this.renderer.clear();

    if (this.gameScreen === GameScreen.TitleMenu || this.gameScreen === GameScreen.LevelSelect) {
      this.renderTitleScene();
      this.drawMuteIcon();
      return;
    }

    if (this.messageBox.isActive && this.messageBox.renderMode === RenderMode.OverlayOnly) {
      this.messageBox.draw(this.renderer);
      this.drawMuteIcon();
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

    if (this.messageBox.isActive) {
      this.messageBox.draw(this.renderer);
    }

    this.drawMuteIcon();

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

  }

  private drawMuteIcon(): void {
    if (this.audio.isMuted) {
      this.renderer.blitImage(this.muteIcon, 16, 8);
    }
  }

  // --- Title & Level Select ---

  private updateTitleScene(): void {
    const targetCam = this.gameScreen === GameScreen.LevelSelect ? TITLE_CAM_MAX : 0;
    if (this.titleCam < targetCam) {
      this.titleCam = Math.min(this.titleCam + TITLE_CAM_SPEED, targetCam);
    } else if (this.titleCam > targetCam) {
      this.titleCam = Math.max(this.titleCam - TITLE_CAM_SPEED, targetCam);
    }

    if (this.screenFade > 0) {
      this.screenFade -= FADE_SPEED;
      if (this.screenFade < 0) this.screenFade = 0;
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

    if (this.arrow1X > 0) this.arrow1X--;
    if (this.arrow2X > 0) this.arrow2X--;

    if (this.gameScreen === GameScreen.TitleMenu) {
      if (this.input.keyHit('Enter') || this.input.keyHit('Space')) {
        this.switchToLevelSelect();
      }
    } else {
      this.updateLevelSelectInput();
    }
  }

  private updateLevelSelectInput(): void {
    if (this.titleCam < TITLE_CAM_MAX) return;

    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    const completed = this.profiles.active?.levelsComplete[this.mapSet] ?? 1;

    if (this.input.keyHit('Escape')) {
      this.gameScreen = GameScreen.TitleMenu;
      this.sounds.playSound(SoundId.Beep2, GAME_WIDTH / 2);
      this.arrow1X = 7;
      return;
    }

    if (this.input.keyDown('ArrowUp') || this.input.keyDown('KeyW')) {
      if (this.levelScrollControl > 0) this.levelScrollControl = 0;
      this.levelScrollControl--;
    } else if (this.input.keyDown('ArrowDown') || this.input.keyDown('KeyS')) {
      if (this.levelScrollControl < 0) this.levelScrollControl = 0;
      this.levelScrollControl++;
    } else {
      this.levelScrollControl = 0;
    }

    if (this.levelScrollControl === -1 || this.levelScrollControl < -10) {
      if (this.levelScrollControl === -1) {
        this.sounds.playSound(SoundId.Beep1, GAME_WIDTH / 2);
      }
      this.levelSelect--;
      if (this.levelSelect < 1) this.levelSelect = lastMap;
      this.requestMiniMap(this.levelSelect);
    }

    if (this.levelScrollControl === 1 || this.levelScrollControl > 10) {
      if (this.levelScrollControl === 1) {
        this.sounds.playSound(SoundId.Beep1, GAME_WIDTH / 2);
      }
      this.levelSelect++;
      if (this.levelSelect > lastMap) this.levelSelect = 1;
      this.requestMiniMap(this.levelSelect);
    }

    for (let i = 1; i <= 9; i++) {
      if (this.input.keyHit(`Digit${i}`)) {
        this.levelSelect = Math.min(i * 10, lastMap);
        this.requestMiniMap(this.levelSelect);
        this.sounds.playSound(SoundId.Beep1, GAME_WIDTH / 2);
      }
    }
    if (this.input.keyHit('Digit0')) {
      this.levelSelect = lastMap;
      this.requestMiniMap(this.levelSelect);
      this.sounds.playSound(SoundId.Beep1, GAME_WIDTH / 2);
    }

    if (this.levelSelect - 1 < this.levelScroll) {
      this.levelScroll = Math.max(1, this.levelSelect - 1);
    }
    if (this.levelSelect - 4 > this.levelScroll) {
      this.levelScroll = this.levelSelect - 4;
      if (this.levelScroll > lastMap - VISIBLE_LEVELS + 1) {
        this.levelScroll = Math.max(1, lastMap - VISIBLE_LEVELS + 1);
      }
    }

    if (this.input.keyHit('Enter') || this.input.keyHit('Space') || this.input.keyHit('KeyZ')) {
      if (this.levelSelect <= completed) {
        const tileset = this.levelTilesets[this.levelSelect - 1] ?? 0;
        if (tileset > 0) {
          this.sounds.playSound(SoundId.Beep2, GAME_WIDTH / 2);
          this.startLevel(this.levelSelect);
        }
      }
    }
  }

  private switchToLevelSelect(): void {
    this.gameScreen = GameScreen.LevelSelect;
    this.sounds.playSound(SoundId.Beep2, GAME_WIDTH / 2);

    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    const profile = this.profiles.active;

    if (profile) {
      const completed = profile.levelsComplete[this.mapSet] ?? 1;
      this.levelSelect = Math.max(1, Math.min(completed, lastMap));
    } else {
      this.levelSelect = 1;
    }

    this.levelScroll = Math.max(1, this.levelSelect - 1);
    if (this.levelScroll > lastMap - VISIBLE_LEVELS + 1) {
      this.levelScroll = Math.max(1, lastMap - VISIBLE_LEVELS + 1);
    }
    this.levelScrollControl = 0;

    this.requestMiniMap(this.levelSelect);
  }

  private renderTitleScene(): void {
    this.renderer.blitImage(this.titleBackdrop, 0, Math.round(this.titleCam * -0.5));
    this.renderer.blitImage(this.titleFront2, 0, -this.titleCam);

    const conveyorBitmap = this.conveyorSheet.getFrame(this.conveyorFrame);
    for (let i = 0; i < CONVEYOR_TILE_COUNT; i++) {
      this.renderer.blitImage(
        conveyorBitmap,
        (i + CONVEYOR_START_TILE) * CONVEYOR_TILE_SIZE,
        CONVEYOR_Y - this.titleCam,
      );
    }

    this.drawDominoText(
      TITLE_MESSAGES[this.titleMessageNum] ?? '',
      this.titleMessageX,
      TITLE_MESSAGE_Y - this.titleCam,
    );

    this.renderer.blitImage(this.titleFront, 0, -this.titleCam);

    if (this.titleCam < TITLE_CAM_MAX) {
      const ctx = this.renderer.getContext();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('PRESS ENTER TO START', GAME_WIDTH / 2 + 1, 381 - this.titleCam);
      ctx.fillStyle = '#f0e0a0';
      ctx.fillText('PRESS ENTER TO START', GAME_WIDTH / 2, 380 - this.titleCam);
    }

    if (this.titleCam > 0) {
      this.renderLevelSelectUI();
    }

    if (this.screenFade > 0) {
      const ctx = this.renderer.getContext();
      ctx.fillStyle = `rgba(0, 0, 0, ${this.screenFade / 255})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  private renderLevelSelectUI(): void {
    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    const completed = this.profiles.active?.levelsComplete[this.mapSet] ?? 1;

    for (let i = 0; i < VISIBLE_LEVELS; i++) {
      const levelNum = i + this.levelScroll;
      if (levelNum < 1 || levelNum > lastMap) continue;

      const entryY = LS_LIST_Y + i * LS_ENTRY_SPACING - this.titleCam;

      this.renderer.blitImage(this.panelFrameImage, LS_LIST_X, entryY);

      const tileset = this.levelTilesets[levelNum - 1] ?? 0;
      if (tileset > 0 && levelNum <= completed) {
        this.renderer.blitImage(this.panelsSheet.getFrame(tileset), LS_PANEL_X, entryY + 2);
        const name = TILESET_NAMES[tileset] ?? '';
        this.drawTextWithShadow(
          LS_NAME_X,
          LS_NAME_Y + i * LS_ENTRY_SPACING - this.titleCam,
          name,
          false,
        );
      } else {
        this.renderer.blitImage(this.panelsSheet.getFrame(0), LS_PANEL_X, entryY + 2);
      }

      const isSelected = this.levelSelect === levelNum;
      this.messageBox.drawBitmapText(
        this.renderer,
        LS_NUM_X,
        LS_NUM_Y + i * LS_ENTRY_SPACING - this.titleCam,
        `${levelNum}`,
        isSelected ? TextColor.Selected : TextColor.Normal,
        true,
      );
    }

    if (this.miniMapBitmap) {
      const tileset = this.levelTilesets[this.levelSelect - 1] ?? 0;
      if (tileset > 0 && this.levelSelect <= completed) {
        this.renderer.blitImage(this.miniMapBitmap, LS_MINIMAP_X, LS_MINIMAP_Y - this.titleCam);
      }
    }

    this.drawTextWithShadow(LS_TITLE_X, LS_TITLE_Y - this.titleCam, 'LEVEL SELECT', true);

    const mapSetName = MAP_SET_NAMES[this.mapSet] ?? '';
    this.drawTextWithShadow(LS_TITLE_X, LS_MAPSET_Y - this.titleCam, mapSetName, true);

    this.renderer.blitImage(
      this.arrowsSheet.getFrameAt(0, 0),
      LS_LEFT_ARROW_X - this.arrow1X,
      LS_ARROW_Y - this.titleCam,
    );
    this.renderer.blitImage(
      this.arrowsSheet.getFrameAt(1, 1),
      LS_RIGHT_ARROW_X + this.arrow2X,
      LS_ARROW_Y - this.titleCam,
    );

    const profile = this.profiles.active;
    if (profile) {
      this.messageBox.drawBitmapText(
        this.renderer,
        LS_PROFILE_X,
        LS_PROFILE_NAME_Y - this.titleCam,
        profile.name.toUpperCase(),
        TextColor.Normal,
        true,
      );
      this.messageBox.drawBitmapText(
        this.renderer,
        LS_PROFILE_X,
        LS_PROFILE_TOKENS_Y - this.titleCam,
        `TOKENS: ${profile.tokens}`,
        TextColor.Normal,
        true,
      );
    }
  }

  private drawTextWithShadow(x: number, y: number, text: string, centre: boolean): void {
    this.messageBox.drawBitmapText(
      this.renderer, x + 1, y + 1, text, TextColor.Normal, centre,
    );
    this.messageBox.drawBitmapText(
      this.renderer, x, y, text, TextColor.Highlight, centre,
    );
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

  private startLevel(mapNum: number): void {
    this.levelLoading = true;
    this.gameScreen = GameScreen.Playing;
    void this.loadLevelData(mapNum)
      .then(() => {
        this.levelLoading = false;
      })
      .catch((err) => {
        console.error('Failed to start level:', err);
        this.levelLoading = false;
      });
  }

  private async loadLevelTilesets(): Promise<void> {
    const lastMap = LAST_MAP[this.mapSet] ?? 100;
    this.levelTilesets = new Array(lastMap).fill(0) as number[];

    const promises: Promise<void>[] = [];
    for (let i = 1; i <= lastMap; i++) {
      const idx = i;
      promises.push(
        loadMapData<{ tileset: number }>(this.mapSet, idx)
          .then((data) => {
            this.levelTilesets[idx - 1] = data.tileset;
          })
          .catch(() => {
            /* map not available */
          }),
      );
    }

    await Promise.all(promises);
  }

  private requestMiniMap(level: number): void {
    this.miniMapDesiredLevel = level;
    if (!this.miniMapLoading) {
      void this.loadMiniMapPreview();
    }
  }

  private async loadMiniMapPreview(): Promise<void> {
    this.miniMapLoading = true;

    while (this.miniMapDesiredLevel !== this.miniMapLevel) {
      const level = this.miniMapDesiredLevel;
      this.miniMapLevel = level;

      try {
        const mapData = await loadMapData<MapData>(this.mapSet, level);
        await this.tileset.loadBabyTileset(mapData.tileset);

        const canvas = new OffscreenCanvas(LS_MINIMAP_W, LS_MINIMAP_H);
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, LS_MINIMAP_W, LS_MINIMAP_H);

        const ledgeVariant: number[][] = [];
        for (let x = 0; x < MAPWIDTH; x++) {
          ledgeVariant[x] = [];
          for (let y = 0; y < MAPHEIGHT2; y++) {
            const val = mapData.ledge[x]?.[y] ?? 0;
            if (val === 0) {
              ledgeVariant[x]![y] = 0;
              continue;
            }
            const hasLeft = x > 0 && (mapData.ledge[x - 1]?.[y] ?? 0) !== 0;
            const hasRight = x < MAPWIDTH - 1 && (mapData.ledge[x + 1]?.[y] ?? 0) !== 0;
            if (hasLeft && hasRight) ledgeVariant[x]![y] = 2;
            else if (hasLeft) ledgeVariant[x]![y] = 3;
            else if (hasRight) ledgeVariant[x]![y] = 1;
            else ledgeVariant[x]![y] = 4;
          }
        }

        for (let x = 1; x < MAPWIDTH - 1; x++) {
          for (let y = 0; y < MAPHEIGHT; y++) {
            const bg = mapData.background[x]?.[y] ?? 0;
            if (bg > 0) {
              ctx.drawImage(
                this.tileset.getBabyTile(bg - 1),
                (x - 1) * BABY_TILE,
                y * BABY_TILE,
              );
            }
          }
        }

        for (let x = 1; x < MAPWIDTH - 1; x++) {
          for (let y = MAPHEIGHT2 - 1; y >= 0; y--) {
            const variant = ledgeVariant[x]?.[y] ?? 0;
            if (variant > 0) {
              const px = (x - 1) * BABY_TILE;
              const py = y * BABY_HALF;
              ctx.drawImage(this.tileset.getBabyTile(variant + 10), px, py);
              ctx.drawImage(this.tileset.getBabyTile(variant - 1), px, py);
            }
          }
        }

        for (let x = 1; x < MAPWIDTH - 1; x++) {
          for (let y = 0; y < MAPHEIGHT2; y++) {
            const ladder = mapData.ladder[x]?.[y] ?? 0;
            if (ladder > 0) {
              ctx.drawImage(
                this.tileset.getBabyTile(ladder - 1),
                (x - 1) * BABY_TILE,
                y * BABY_HALF,
              );
            }
          }
        }

        this.miniMapBitmap?.close();
        this.miniMapBitmap = await createImageBitmap(canvas);
      } catch (e) {
        console.error('Failed to load mini-map preview:', e);
        this.miniMapBitmap?.close();
        this.miniMapBitmap = null;
        break;
      }
    }

    this.miniMapLoading = false;
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
          if (this.timer.negative) {
            this.showMessage(MessageType.TooSlow);
          } else {
            this.showMessage(MessageType.TokenGain);
          }
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
