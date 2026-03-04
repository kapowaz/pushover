export class InputManager {
  private keysDown = new Set<string>();
  private keysHit = new Set<string>();
  private keysConsumed = new Set<string>();

  private readonly handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.keysDown.has(e.code)) {
      this.keysHit.add(e.code);
    }
    this.keysDown.add(e.code);
    e.preventDefault();
  };

  private readonly handleKeyUp = (e: KeyboardEvent): void => {
    this.keysDown.delete(e.code);
    this.keysConsumed.delete(e.code);
    e.preventDefault();
  };

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  keyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  keyHit(code: string): boolean {
    if (this.keysHit.has(code) && !this.keysConsumed.has(code)) {
      this.keysConsumed.add(code);
      return true;
    }
    return false;
  }

  update(): void {
    this.keysHit.clear();
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.keysDown.clear();
    this.keysHit.clear();
    this.keysConsumed.clear();
  }
}
