import { AudioManager } from '../engine/AudioManager';

export class MusicManager {
  private currentZone = -1;

  constructor(private audio: AudioManager) {}

  requestMusic(zone: number): void {
    if (zone === this.currentZone) return;

    this.currentZone = zone;
    this.audio.loadMusic(`/assets/music/${zone}.ogg`);
    this.audio.playMusic();
  }

  stop(fadeMs?: number): void {
    this.currentZone = -1;
    this.audio.stopMusic(fadeMs);
  }
}
