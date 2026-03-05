import { Renderer } from '../engine/Renderer';
import { SpriteSheet } from '../engine/SpriteSheet';
import { getImageUrl } from '../assets';
import { GAME_WIDTH, MessageType, SoundId } from './constants';

const BORDER_TILE_SIZE = 32;
const BORDER_COLUMNS = 13;

const LETTER_WIDTH = 12;
const LETTER_HEIGHT = 14;
const LETTER_COLUMNS = 44;
const LETTER_COLORS = 3;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!r',?:-";

const TEXT_SLOTS = 9;

const enum BorderTile {
  CornerTL = 0,
  CornerBL = 1,
  CornerBR = 2,
  CornerTR = 3,
  NearCornerTop = 4,
  NearCornerBottom = 5,
  NearCornerRight = 6,
  NearCornerLeft = 7,
  EdgeTop = 8,
  EdgeBottom = 9,
  EdgeRight = 10,
  EdgeLeft = 11,
  Center = 12,
}

export const enum TextColor {
  Normal = 0,
  Highlight = 1,
  Selected = 2,
}

const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = 200;

export const enum RenderMode {
  GameAndOverlay = 1,
  OverlayOnly = 2,
}

export class MessageBox {
  private borderSheet: SpriteSheet;
  private letterSheet: SpriteSheet;
  private active = false;
  private dismissed = false;

  private messageW = 0;
  private messageH = 0;
  private messageX = 0;
  private messageY = 0;

  private messageText: string[] = new Array<string>(TEXT_SLOTS).fill('');
  private messageTextY: number[] = new Array<number>(TEXT_SLOTS).fill(0);
  private optionsStart = 0;
  private optionsSelect = 0;
  private messageType: MessageType = MessageType.Pause;
  renderMode: RenderMode = RenderMode.GameAndOverlay;

  constructor() {
    this.borderSheet = new SpriteSheet(
      getImageUrl('image/border.png'),
      BORDER_TILE_SIZE,
      BORDER_TILE_SIZE,
      BORDER_COLUMNS,
      1,
    );
    this.letterSheet = new SpriteSheet(
      getImageUrl('image/letter.png'),
      LETTER_WIDTH,
      LETTER_HEIGHT,
      LETTER_COLUMNS,
      LETTER_COLORS,
    );
  }

  async load(): Promise<void> {
    await Promise.all([this.borderSheet.load(), this.letterSheet.load()]);
  }

  get isActive(): boolean {
    return this.active;
  }

  get isDismissed(): boolean {
    return this.dismissed;
  }

  get selectedOption(): number {
    return this.optionsSelect;
  }

  get type(): MessageType {
    return this.messageType;
  }

  private setSize(w: number, h: number): void {
    this.messageW = w;
    this.messageH = h;
    this.messageX = CENTER_X - w * (BORDER_TILE_SIZE / 2);
    this.messageY = CENTER_Y - h * (BORDER_TILE_SIZE / 2);
  }

  private clearTexts(): void {
    for (let i = 0; i < TEXT_SLOTS; i++) {
      this.messageText[i] = '';
      this.messageTextY[i] = 0;
    }
  }

  private setText(index: number, text: string, yOffset: number): void {
    this.messageText[index] = text;
    this.messageTextY[index] = yOffset;
  }

  show(type: MessageType, tokens = 0, _negative = false): void {
    this.messageType = type;
    this.active = true;
    this.dismissed = false;
    this.renderMode = RenderMode.GameAndOverlay;
    this.clearTexts();

    switch (type) {
      case MessageType.TokenGain:
        this.setSize(13, 4);
        this.setText(0, 'CONGRATULATIONS', 0);
        this.setText(1, 'YOU COMPLETED THE PUZZLE', 32);
        this.setText(2, 'YOU GAIN A TOKEN', 48);
        this.optionsStart = 0;
        this.optionsSelect = 0;
        break;

      case MessageType.TooSlow:
        this.setSize(13, 8);
        this.setText(0, 'YOU COMPLETED THE PUZZLE', 0);
        this.setText(1, 'HOWEVER YOU DID NOT DO IT', 16);
        this.setText(2, 'FAST ENOUGH!', 32);
        if (tokens > 0) {
          this.setText(3, `YOU HAVE ${tokens} TOKENS LEFT.`, 64);
          this.setText(4, 'YOU CAN USE A TOKEN TO', 80);
          this.setText(5, 'GO TO NEXT LEVEL', 96);
          this.setText(6, 'USE TOKEN', 120);
          this.optionsStart = 6;
        } else {
          this.optionsStart = 7;
        }
        this.setText(7, 'REPLAY PUZZLE', 144);
        this.setText(8, 'QUIT', 168);
        this.optionsSelect = 7;
        break;

      case MessageType.NotAllToppled:
        this.setSize(13, 8);
        this.setText(0, 'YOU FAILED', 0);
        this.setText(1, 'NOT ALL DOMINOES HAVE', 16);
        this.setText(2, 'TOPPLED', 32);
        this.configureFailureOptions(tokens);
        break;

      case MessageType.StillHolding:
        this.setSize(13, 8);
        this.setText(0, 'YOU FAILED', 0);
        this.setText(1, 'YOU ARE STILL HOLDING', 16);
        this.setText(2, 'A DOMINO', 32);
        this.configureFailureOptions(tokens);
        break;

      case MessageType.Crashed:
        this.setSize(13, 8);
        this.setText(0, 'YOU FAILED', 0);
        this.setText(1, 'SOME DOMINOES HAVE', 16);
        this.setText(2, 'CRASHED', 32);
        this.configureFailureOptions(tokens);
        break;

      case MessageType.Died:
        this.setSize(13, 8);
        this.setText(0, 'YOU FAILED', 0);
        this.setText(2, 'YOU DIED', 32);
        this.setText(7, 'REPLAY PUZZLE', 144);
        this.setText(8, 'QUIT', 168);
        this.optionsStart = 7;
        this.optionsSelect = 7;
        break;

      case MessageType.Pause:
        this.setSize(18, 12);
        this.setText(0, 'PAUSED', 0);
        this.setText(4, 'ARRANGE THE DOMINOES SO THAT YOU CAN TOPPLE', 50);
        this.setText(5, 'THEM ALL OVER. THE TRIGGER MUST FALL LAST.', 66);
        this.setText(6, 'CONTINUE', 252);
        this.setText(7, 'RETRY', 276);
        this.setText(8, 'QUIT', 300);
        this.optionsStart = 6;
        this.optionsSelect = 6;
        break;
    }
  }

  private configureFailureOptions(tokens: number): void {
    if (tokens > 0) {
      this.setText(3, `YOU HAVE ${tokens} TOKENS LEFT.`, 64);
      this.setText(4, 'YOU CAN USE A TOKEN TO', 80);
      this.setText(5, 'RESET TO BEFORE THE PUSH', 96);
      this.setText(6, 'USE TOKEN', 120);
      this.optionsStart = 6;
    } else {
      this.optionsStart = 7;
    }
    this.setText(7, 'REPLAY PUZZLE', 144);
    this.setText(8, 'QUIT', 168);
    this.optionsSelect = 7;
  }

  hide(): void {
    this.active = false;
    this.dismissed = false;
  }

  /**
   * Process input and return the selected option index when dismissed,
   * or null if the message box is still active.
   */
  update(
    contHit: (code: string) => boolean,
    playSound: (id: SoundId, x: number) => void,
  ): number | null {
    if (!this.active || this.dismissed) return null;

    if (contHit('ArrowUp') || contHit('KeyW')) {
      if (this.optionsStart > 0 && this.optionsSelect > this.optionsStart) {
        this.optionsSelect--;
        playSound(SoundId.Beep1, CENTER_X);
      }
    }

    if (contHit('ArrowDown') || contHit('KeyS')) {
      if (this.optionsStart > 0 && this.optionsSelect < TEXT_SLOTS - 1) {
        this.optionsSelect++;
        playSound(SoundId.Beep1, CENTER_X);
      }
    }

    if (contHit('KeyP') && this.messageType === MessageType.Pause) {
      this.optionsSelect = this.optionsStart;
      this.dismissed = true;
      playSound(SoundId.Beep2, CENTER_X);
      return this.optionsSelect;
    }

    if (contHit('KeyZ') || contHit('Enter') || contHit('Space')) {
      this.dismissed = true;
      playSound(SoundId.Beep2, CENTER_X);
      return this.optionsSelect;
    }

    return null;
  }

  draw(renderer: Renderer): void {
    if (!this.active) return;

    this.drawBorder(renderer);
    this.drawTexts(renderer);
  }

  drawBitmapText(
    renderer: Renderer,
    x: number,
    y: number,
    text: string,
    color: TextColor = TextColor.Normal,
    centre = true,
    alpha = 255,
  ): void {
    if (centre) {
      x -= text.length * (LETTER_WIDTH / 2);
    }

    for (let i = 0; i < text.length; i++) {
      const charIndex = LETTERS.indexOf(text[i]!);
      if (charIndex >= 0) {
        const frameIndex = color * LETTER_COLUMNS + charIndex;
        if (alpha < 255) {
          renderer.blitAlpha(this.letterSheet.getFrame(frameIndex), x + i * LETTER_WIDTH, y, alpha);
        } else {
          renderer.blitImage(this.letterSheet.getFrame(frameIndex), x + i * LETTER_WIDTH, y);
        }
      }
    }
  }

  private drawBorder(renderer: Renderer): void {
    for (let x = 0; x < this.messageW; x++) {
      for (let y = 0; y < this.messageH; y++) {
        let tile: BorderTile = BorderTile.Center;

        if (y === 0) tile = BorderTile.EdgeTop;
        if (y === this.messageH - 1) tile = BorderTile.EdgeBottom;
        if (x === this.messageW - 1) tile = BorderTile.EdgeRight;
        if (x === 0) tile = BorderTile.EdgeLeft;

        if (x === 1 && y === 0) tile = BorderTile.NearCornerTop;
        if (x === this.messageW - 2 && y === this.messageH - 1)
          tile = BorderTile.NearCornerBottom;
        if (x === this.messageW - 1 && y === 1) tile = BorderTile.NearCornerRight;
        if (x === 0 && y === this.messageH - 2) tile = BorderTile.NearCornerLeft;

        if (x === 0 && y === 0) tile = BorderTile.CornerTL;
        if (x === 0 && y === this.messageH - 1) tile = BorderTile.CornerBL;
        if (x === this.messageW - 1 && y === 0) tile = BorderTile.CornerTR;
        if (x === this.messageW - 1 && y === this.messageH - 1) tile = BorderTile.CornerBR;

        renderer.blitImage(
          this.borderSheet.getFrame(tile),
          this.messageX + x * BORDER_TILE_SIZE,
          this.messageY + y * BORDER_TILE_SIZE,
        );
      }
    }
  }

  private drawTexts(renderer: Renderer): void {
    for (let i = 0; i < TEXT_SLOTS; i++) {
      const text = this.messageText[i]!;
      if (!text) continue;

      let color: TextColor = TextColor.Normal;
      if (i >= this.optionsStart && this.optionsStart > 0) {
        color = TextColor.Highlight;
        if (i === this.optionsSelect) {
          color = TextColor.Selected;
        }
      }

      this.drawBitmapText(
        renderer,
        CENTER_X,
        this.messageY + this.messageTextY[i]! + BORDER_TILE_SIZE,
        text,
        color,
      );
    }
  }
}
