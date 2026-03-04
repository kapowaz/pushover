export class SpriteSheet {
  private frames: ImageBitmap[] = [];

  constructor(
    private src: string,
    private frameWidth: number,
    private frameHeight: number,
    private columns: number,
    private rows: number,
  ) {}

  async load(): Promise<void> {
    const img = await this.loadImage(this.src);
    const offscreen = new OffscreenCanvas(img.width, img.height);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get OffscreenCanvas 2D context');
    }
    ctx.drawImage(img, 0, 0);

    const promises: Promise<ImageBitmap>[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        promises.push(
          createImageBitmap(
            offscreen,
            col * this.frameWidth,
            row * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
          ),
        );
      }
    }

    this.frames = await Promise.all(promises);
  }

  getFrame(index: number): ImageBitmap {
    const frame = this.frames[index];
    if (!frame) {
      throw new RangeError(
        `Frame index ${index} out of range (0..${this.frames.length - 1})`,
      );
    }
    return frame;
  }

  getFrameAt(col: number, row: number): ImageBitmap {
    return this.getFrame(row * this.columns + col);
  }

  get totalFrames(): number {
    return this.columns * this.rows;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (_e) => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }
}
