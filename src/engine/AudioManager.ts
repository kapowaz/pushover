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
  private musicSource: MediaElementAudioSourceNode | null = null;
  private musicGain: GainNode;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private muted = localStorage.getItem('pushover_muted') === 'true';
  private pendingPlayback = false;
  private resumeController: AbortController | null = null;

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
    if (!this.soundEnabled || this.muted) return -1;

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
      this.musicElement.onerror = null;
      this.musicElement.pause();
      this.musicElement.src = '';
      this.musicElement = null;
    }

    if (this.musicSource) {
      this.musicSource.disconnect();
      this.musicSource = null;
    }

    const el = new Audio(url);
    el.loop = true;
    el.onerror = () => {
      console.warn(`Failed to load music: ${url}`);
      if (this.musicElement === el) {
        this.musicElement = null;
      }
    };

    try {
      this.musicSource = this.ctx.createMediaElementSource(el);
      this.musicSource.connect(this.musicGain);
      this.musicElement = el;
    } catch {
      console.warn(`Failed to create media source for: ${url}`);
      this.musicSource = null;
      this.musicElement = null;
    }
  }

  playMusic(): void {
    if (!this.musicEnabled || !this.musicElement) return;

    this.musicGain.gain.value = this.muted ? 0 : 1;

    if (this.ctx.state === 'suspended') {
      this.pendingPlayback = true;
      this.waitForInteraction();
      return;
    }

    this.pendingPlayback = false;
    void this.musicElement.play();
  }

  private waitForInteraction(): void {
    if (this.resumeController) return;
    this.resumeController = new AbortController();
    const { signal } = this.resumeController;

    const handler = () => {
      this.resumeController?.abort();
      this.resumeController = null;

      void this.ctx.resume().then(() => {
        if (this.pendingPlayback && this.musicElement && this.musicEnabled) {
          this.pendingPlayback = false;
          void this.musicElement.play();
        }
      });
    };

    for (const event of ['click', 'keydown', 'touchstart', 'pointerdown']) {
      document.addEventListener(event, handler, { signal });
    }
  }

  stopMusic(fadeMs?: number): void {
    this.pendingPlayback = false;
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
        this.musicGain.gain.value = this.muted ? 0 : 1;
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
    localStorage.setItem('pushover_muted', String(this.muted));
    this.musicGain.gain.value = this.muted ? 0 : 1;
    if (this.muted) {
      for (const [, active] of this.activeSounds) {
        active.gain.gain.value = 0;
      }
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

  isSoundPlaying(channelId: number): boolean {
    return this.activeSounds.has(channelId);
  }
}
