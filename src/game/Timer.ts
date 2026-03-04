export class GameTimer {
  mins = 0;
  secs = 0;
  negative = false;
  private countTicks = 0;
  private lastTime = 0;

  init(minutes: number, seconds: number): void {
    this.mins = minutes;
    this.secs = seconds;
    this.negative = false;
    this.countTicks = 0;
    this.lastTime = performance.now();
  }

  update(): void {
    const now = performance.now();
    this.countTicks += now - this.lastTime;
    this.lastTime = now;

    if (this.countTicks >= 1000) {
      this.countTicks -= 1000;

      if (!this.negative) {
        this.secs--;
        if (this.secs < 0) {
          this.mins--;
          this.secs = 59;
          if (this.mins < 0) {
            this.mins = 0;
            this.secs = 0;
            this.negative = true;
          }
        }
      } else {
        this.secs++;
        if (this.secs > 59) {
          this.mins++;
          this.secs = 0;
        }
      }
    }
  }

  get colonVisible(): boolean {
    return this.countTicks <= 500;
  }
}
