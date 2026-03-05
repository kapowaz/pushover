import { ProfileData } from './types';

const STORAGE_KEY = 'pushover_profiles';

export class ProfileManager {
  private profiles: ProfileData[] = [];
  private activeIndex = -1;

  load(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.profiles = JSON.parse(saved) as ProfileData[];
    }
  }

  save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
  }

  get active(): ProfileData | null {
    return this.activeIndex >= 0 ? (this.profiles[this.activeIndex] ?? null) : null;
  }

  setActive(index: number): void {
    this.activeIndex = index;
  }

  create(name: string): void {
    this.profiles.push({
      name,
      levelsComplete: [1, 1, 1, 1, 1],
      tokens: 0,
      helpDisplayed: new Array<boolean>(11).fill(false),
    });
    this.save();
  }

  remove(index: number): void {
    this.profiles.splice(index, 1);
    if (this.activeIndex === index) {
      this.activeIndex = -1;
    } else if (this.activeIndex > index) {
      this.activeIndex--;
    }
    this.save();
  }

  addToken(): void {
    const profile = this.active;
    if (profile) {
      profile.tokens++;
      this.save();
    }
  }

  useToken(): boolean {
    const profile = this.active;
    if (profile && profile.tokens > 0) {
      profile.tokens--;
      this.save();
      return true;
    }
    return false;
  }

  markLevelComplete(mapSet: number, level: number): void {
    const profile = this.active;
    if (!profile) return;
    if ((profile.levelsComplete[mapSet] ?? 0) <= level) {
      profile.levelsComplete[mapSet] = level + 1;
      this.save();
    }
  }

  getAll(): ProfileData[] {
    return this.profiles;
  }
}
