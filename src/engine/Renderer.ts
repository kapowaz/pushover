export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.ctx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  blit(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
  ): void {
    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  blitImage(image: CanvasImageSource, dx: number, dy: number): void {
    this.ctx.drawImage(image, dx, dy);
  }

  blitAlpha(image: CanvasImageSource, dx: number, dy: number, alpha: number): void {
    const saved = this.ctx.globalAlpha;
    this.ctx.globalAlpha = alpha / 255;
    this.ctx.drawImage(image, dx, dy);
    this.ctx.globalAlpha = saved;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  createOffscreen(width: number, height: number): OffscreenCanvas {
    return new OffscreenCanvas(width, height);
  }
}
