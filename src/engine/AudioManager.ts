import { GAME_WIDTH } from '../game/constants';

interface ActiveSound {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export class AudioManager {
  private ctx: AudioContext;
  private buffers = new Map<number, AudioBuffer>();
  private activeSounds = new Map<number, ActiveSound>();
  private nextChannel = 0;
  private musicElement: HTMLAudioElement | null = null;
  private musicGain: GainNode;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private muted = false;

  constructor() {
    this.ctx = new AudioContext();
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
  }

  async loadSound(id: number, url: string): Promise<void> {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !contentType.startsWith('audio/')) {
      console.warn(`Sound not available: ${url}`);
      return;
    }
    try {
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
    } catch {
      console.warn(`Failed to decode audio: ${url}`);
    }
  }

  playSound(id: number, panX?: number): number {
    if (!this.soundEnabled) return -1;

    const buffer = this.buffers.get(id);
    if (!buffer) return -1;

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gain = this.ctx.createGain();

    if (panX !== undefined) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = (panX / GAME_WIDTH) * 2 - 1;
      source.connect(panner);
      panner.connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(this.ctx.destination);

    const channel = this.nextChannel++;
    this.activeSounds.set(channel, { source, gain });

    source.onended = () => {
      this.activeSounds.delete(channel);
    };

    source.start();
    return channel;
  }

  stopSound(channelId: number): void {
    const active = this.activeSounds.get(channelId);
    if (active) {
      active.source.stop();
      this.activeSounds.delete(channelId);
    }
  }

  loadMusic(url: string): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.src = '';
    }
    const el = new Audio(url);
    el.loop = true;
    el.onerror = () => {
      console.warn(`Failed to load music: ${url}`);
      this.musicElement = null;
    };

    try {
      const mediaSource = this.ctx.createMediaElementSource(el);
      mediaSource.connect(this.musicGain);
      this.musicElement = el;
    } catch {
      console.warn(`Failed to create media source for: ${url}`);
      this.musicElement = null;
    }
  }

  playMusic(): void {
    if (!this.musicEnabled || !this.musicElement) return;

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    this.musicGain.gain.value = 1;
    void this.musicElement.play();
  }

  stopMusic(fadeMs?: number): void {
    if (!this.musicElement) return;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (!fadeMs || fadeMs <= 0) {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
      return;
    }

    const stepMs = 16;
    const steps = Math.ceil(fadeMs / stepMs);
    const decrement = this.musicGain.gain.value / steps;
    let remaining = steps;

    this.fadeInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        if (this.musicElement) {
          this.musicElement.pause();
          this.musicElement.currentTime = 0;
        }
        this.musicGain.gain.value = 1;
      } else {
        this.musicGain.gain.value = Math.max(0, decrement * remaining);
      }
    }, stepMs);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      for (const [channelId] of this.activeSounds) {
        this.stopSound(channelId);
      }
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.setSoundEnabled(!this.muted);
    this.setMusicEnabled(!this.muted);
    if (!this.muted) {
      this.playMusic();
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  get isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  get isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}
