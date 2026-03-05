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
      levelsComplete: [1, 0, 0, 0, 0],
      tokens: 0,
      helpDisplayed: new Array<boolean>(11).fill(false),
      prizeGot: [
        new Array<boolean>(10).fill(false),
        new Array<boolean>(10).fill(false),
      ],
      costume: 0,
      costumesUnlocked: 0,
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

  collectPrize(mapSet: number, prizeIndex: number): void {
    const profile = this.active;
    if (!profile) return;
    if (!profile.prizeGot) {
      profile.prizeGot = [
        new Array<boolean>(10).fill(false),
        new Array<boolean>(10).fill(false),
      ];
    }
    if (mapSet < 2 && prizeIndex >= 0 && prizeIndex < 10) {
      profile.prizeGot[mapSet]![prizeIndex] = true;
    }
    this.save();
  }

  hasPrize(mapSet: number, prizeIndex: number): boolean {
    const profile = this.active;
    if (!profile?.prizeGot) return false;
    return profile.prizeGot[mapSet]?.[prizeIndex] ?? false;
  }

  prizeCount(): number {
    const profile = this.active;
    if (!profile?.prizeGot) return 0;
    let count = 0;
    for (const set of profile.prizeGot) {
      if (set) {
        for (const got of set) {
          if (got) count++;
        }
      }
    }
    return count;
  }

  unlockCostume(): void {
    const profile = this.active;
    if (!profile) return;
    profile.costumesUnlocked = (profile.costumesUnlocked ?? 0) + 1;
    this.save();
  }

  getCostume(): number {
    return this.active?.costume ?? 0;
  }

  setCostume(costume: number): void {
    const profile = this.active;
    if (!profile) return;
    profile.costume = costume;
    this.save();
  }

  getAll(): ProfileData[] {
    return this.profiles;
  }
}
