import { SpriteSheet } from '../engine/SpriteSheet';
import { Renderer } from '../engine/Renderer';
import { MAPWIDTH, MAPHEIGHT2, EFF_FRAMES, EffectType } from './constants';
import { getImageUrl } from '../assets';

const EFFECT_SIZE = 32;

export class EffectsManager {
  private effects: number[][];
  private spriteSheet: SpriteSheet;

  constructor() {
    this.effects = Array.from({ length: MAPWIDTH }, () =>
      new Array<number>(MAPHEIGHT2).fill(0),
    );
    this.spriteSheet = new SpriteSheet(
      getImageUrl('image/effect.png'),
      EFFECT_SIZE,
      EFFECT_SIZE,
      EFF_FRAMES,
      1,
    );
  }

  async loadImages(): Promise<void> {
    await this.spriteSheet.load();
  }

  startEffect(x: number, y: number, style: EffectType): void {
    this.effects[x][y] = style * 8 + 1;
  }

  process(): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        if (this.effects[x][y]) {
          this.effects[x][y] += 0.66;
          if (Math.floor(this.effects[x][y] - 0.5) % 8 === 0) {
            this.effects[x][y] = 0;
          }
        }
      }
    }
  }

  draw(renderer: Renderer): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        if (this.effects[x][y]) {
          const frameIndex = Math.floor(this.effects[x][y]) - 1;
          if (frameIndex >= 0 && frameIndex < EFF_FRAMES) {
            renderer.blitImage(
              this.spriteSheet.getFrame(frameIndex),
              (x - 1) * EFFECT_SIZE,
              y * 16,
            );
          }
        }
      }
    }
  }

  reset(): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        this.effects[x][y] = 0;
      }
    }
  }
}
