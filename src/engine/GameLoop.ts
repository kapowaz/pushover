export class GameLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly tickRate = 1000 / 35;
  private animFrameId = 0;

  constructor(
    private onUpdate: () => void,
    private onRender: () => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = 0;
    this.accumulator = 0;
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  private loop(currentTime: number): void {
    if (!this.running) return;

    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }

    const elapsed = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap elapsed to avoid spiral of death after tab-away
    this.accumulator += Math.min(elapsed, this.tickRate * 5);

    while (this.accumulator >= this.tickRate) {
      this.onUpdate();
      this.accumulator -= this.tickRate;
    }

    this.onRender();
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }
}
