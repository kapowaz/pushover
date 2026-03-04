import { Renderer } from '../engine/Renderer';
import { SpriteSheet } from '../engine/SpriteSheet';
import { MAPWIDTH, MAPHEIGHT2 } from './constants';

const NUMBER_WIDTH = 16;
const NUMBER_HEIGHT = 32;
const NUMBER_COLUMNS = 22;

export class NumberDisplay {
  private spriteSheet: SpriteSheet;

  constructor() {
    this.spriteSheet = new SpriteSheet(
      '/assets/images/image/number.png',
      NUMBER_WIDTH,
      NUMBER_HEIGHT,
      NUMBER_COLUMNS,
      1,
    );
  }

  async load(): Promise<void> {
    await this.spriteSheet.load();
  }

  drawLevelCounter(
    renderer: Renderer,
    level: number,
    tokens: number,
    transparent: boolean,
  ): void {
    const draw = transparent
      ? (img: ImageBitmap, x: number, y: number) => renderer.blitAlpha(img, x, y, 160)
      : (img: ImageBitmap, x: number, y: number) => renderer.blitImage(img, x, y);

    let val = level;
    for (let i = 0; i < 3; i++) {
      draw(this.spriteSheet.getFrame(val % 10), 608 - i * NUMBER_WIDTH, 440);
      val = Math.floor(val / 10);
    }

    val = tokens;
    for (let i = 0; i < 3; i++) {
      draw(this.spriteSheet.getFrame(val % 10), 608 - i * NUMBER_WIDTH, 408);
      val = Math.floor(val / 10);
    }
  }

  drawTimer(
    renderer: Renderer,
    mins: number,
    secs: number,
    negative: boolean,
    colonVisible: boolean,
    transparent: boolean,
  ): void {
    const offset = negative ? 11 : 0;
    const draw = transparent
      ? (img: ImageBitmap, x: number, y: number) => renderer.blitAlpha(img, x, y, 160)
      : (img: ImageBitmap, x: number, y: number) => renderer.blitImage(img, x, y);

    let val = mins;
    for (let i = 0; i < 2; i++) {
      draw(this.spriteSheet.getFrame((val % 10) + offset), 32 - i * NUMBER_WIDTH, 440);
      val = Math.floor(val / 10);
    }

    if (colonVisible) {
      draw(this.spriteSheet.getFrame(10 + offset), 48, 440);
    }

    val = secs;
    for (let i = 0; i < 2; i++) {
      draw(this.spriteSheet.getFrame((val % 10) + offset), 80 - i * NUMBER_WIDTH, 440);
      val = Math.floor(val / 10);
    }
  }

  shouldBeTransparent(
    dominoPresence: (x: number, y: number) => boolean,
    playerPositions: { x: number; y: number }[],
  ): { timer: boolean; counter: boolean } {
    let timer = false;
    let counter = false;

    for (let x = 0; x <= 3; x++) {
      for (let y = MAPHEIGHT2 - 3; y < MAPHEIGHT2; y++) {
        if (dominoPresence(x, y)) timer = true;
      }
    }

    for (let x = MAPWIDTH - 4; x < MAPWIDTH; x++) {
      for (let y = MAPHEIGHT2 - 6; y < MAPHEIGHT2; y++) {
        if (dominoPresence(x, y)) counter = true;
      }
    }

    for (const pos of playerPositions) {
      if (pos.x >= 0 && pos.x <= 3 && pos.y >= MAPHEIGHT2 - 3 && pos.y < MAPHEIGHT2) {
        timer = true;
      }
      if (pos.x >= MAPWIDTH - 4 && pos.x < MAPWIDTH && pos.y >= MAPHEIGHT2 - 6 && pos.y < MAPHEIGHT2) {
        counter = true;
      }
    }

    return { timer, counter };
  }
}
