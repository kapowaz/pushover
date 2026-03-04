import { AudioManager } from '../engine/AudioManager';
import { DominoType, SoundId, TOTAL_SOUNDS } from './constants';
import { getSoundUrl } from '../assets';

export class SoundManager {
  constructor(private audio: AudioManager) {}

  async loadAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < TOTAL_SOUNDS; i++) {
      const url = getSoundUrl(i + 1);
      if (url) {
        promises.push(this.audio.loadSound(i, url));
      }
    }
    await Promise.all(promises);
  }

  playSound(id: SoundId, x: number): void {
    this.audio.playSound(id, x);
  }

  playDominoSound(dominoType: number, x: number): void {
    const soundId = dominoTypeToSound(dominoType);
    this.audio.playSound(soundId, x);
  }
}

function dominoTypeToSound(dominoType: number): SoundId {
  switch (dominoType) {
    case DominoType.Tumbler:
    case DominoType.Antigrav:
      return SoundId.Rebound;
    case DominoType.Trigger:
      return SoundId.Trigger;
    case DominoType.Ascender:
    case DominoType.Rocket:
      return SoundId.DominoDrop;
    case DominoType.Count1:
      return SoundId.Count1;
    case DominoType.Count2:
      return SoundId.Count2;
    case DominoType.Count3:
      return SoundId.Count3;
    case DominoType.Vanisher:
      return SoundId.Vanisher;
    case DominoType.Delay2:
      return SoundId.Delay;
    default:
      return SoundId.Domino;
  }
}
