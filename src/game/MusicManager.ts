import { AudioManager } from '../engine/AudioManager';
import { getMusicUrl } from '../assets';

export class MusicManager {
  private currentZone = -1;

  constructor(private audio: AudioManager) {}

  requestMusic(zone: number): void {
    if (zone === this.currentZone) return;

    this.currentZone = zone;
    const url = getMusicUrl(zone);
    if (!url) return;
    this.audio.loadMusic(url);
    this.audio.playMusic();
  }

  stop(fadeMs?: number): void {
    this.currentZone = -1;
    this.audio.stopMusic(fadeMs);
  }
}
