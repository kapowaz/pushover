import { Renderer } from '../engine/Renderer';
import { SpriteSheet } from '../engine/SpriteSheet';
import { getImageUrl } from '../assets';
import { MessageBox, TextColor } from './MessageBox';

const BUBBLE_TILE = 32;
const BUBBLE_HEIGHT = 96;
const ICON_WIDTH = 32;
const ICON_HEIGHT = 48;
const ACTIVE_TIME = 250;
const FADE_IN_SPEED = 50;
const FADE_OUT_SPEED = 30;
const MAX_ALPHA = 192;

export const enum HelpId {
  ScreenModeChange = 0,
  Stopper = 1,
  Tumbler = 2,
  Bridger = 3,
  Vanisher = 4,
  Trigger = 5,
  Delay = 6,
  Ascender = 7,
  Splitter = 8,
  Exploder = 9,
  Counters = 10,
  General1 = 11,
  General2 = 12,
  General3 = 13,
  General4 = 14,
  General5 = 15,
  General6 = 16,
  General7 = 17,
  General8 = 18,
  General9 = 19,
  General10 = 20,
  MultiTriggers = 21,
}

const enum IconId {
  Question = 0,
  Standard = 1,
  Stopper = 2,
  Tumbler = 3,
  Bridger = 4,
  Vanisher = 5,
  Trigger = 6,
  Delay = 7,
  Ascender = 8,
  Splitter = 9,
  Exploder = 10,
  Counters = 11,
  Exclaim = 12,
  MultiTriggers = 13,
}

interface HelpDef {
  icon: IconId;
  lines: [string, string, string];
}

const HELP_DEFS: Record<number, HelpDef> = {
  [HelpId.ScreenModeChange]: {
    icon: IconId.Exclaim,
    lines: ['GRAPHICS MODE WILL TAKE', 'EFFECT THE NEXT TIME YOU', 'START PUSHOVER.'],
  },
  [HelpId.General1]: {
    icon: IconId.Question,
    lines: ['PRESS H AT ANY TIME', 'TO DISPLAY THE PREVIOUS', 'HELP MESSAGE AGAIN.'],
  },
  [HelpId.General2]: {
    icon: IconId.Question,
    lines: ['SOUND AND GRAPHICS', 'OPTIONS CAN BE CHANGED', 'FROM THE MAIN MENU.'],
  },
  [HelpId.General3]: {
    icon: IconId.Question,
    lines: ['STUCK ON A PUZZLE? WAIT FOR THE', 'LEVEL TIME TO RUN OUT AND A CLUE', 'WILL BE SHOWN ON THE PAUSE MENU.'],
  },
  [HelpId.General4]: {
    icon: IconId.Question,
    lines: ['ON THE LEVEL SELECT SCREEN YOU', 'CAN USE THE 1-0 KEYS TO SKIP', 'QUICKLY TO LEVELS 10-100.'],
  },
  [HelpId.General5]: {
    icon: IconId.Question,
    lines: ['PERSEVERE THROUGH THE PUZZLES', 'AND THERE COULD BE SOME', 'POINTLESS BUT FUN REWARDS!'],
  },
  [HelpId.General6]: {
    icon: IconId.Question,
    lines: ['EVEN IF YOU COMPLETE A PUZZLE,', 'YOU WILL STILL FAIL IF G.I.ANT', "CAN'T REACH THE EXIT IN TIME."],
  },
  [HelpId.General7]: {
    icon: IconId.Question,
    lines: ['THERE IS MORE THAN', 'ONE WAY TO START A', 'CHAIN OF DOMINOES.'],
  },
  [HelpId.General8]: {
    icon: IconId.Question,
    lines: ['USE THE EDITOR TO MAKE YOUR OWN', 'LEVELS AND THEY COULD BE INCLUDED', 'IN THE NEXT VERSION OF THE GAME!'],
  },
  [HelpId.General9]: {
    icon: IconId.Question,
    lines: ['SOME PUZZLES CAN BE MADE A', 'LOT SIMPLER IF YOU FIND AN', 'ALTERNATIVE SOLUTION.'],
  },
  [HelpId.General10]: {
    icon: IconId.Question,
    lines: ['THIS IS THE LAST HELP MESSAGE FOR NOW.', '', '          ENJOY PLAYING!!'],
  },
  [HelpId.Stopper]: {
    icon: IconId.Stopper,
    lines: ['STOPPERS CAN BE PICKED UP AND', "MOVED, BUT CAN'T BE KNOCKED OVER.", 'THEY DO NOT NEED TO BE TOPPLED.'],
  },
  [HelpId.Tumbler]: {
    icon: IconId.Tumbler,
    lines: ['TUMBLERS WILL ROLL ALONG LEDGES', 'UNTIL STOPPED OR REBOUNDED BY', 'ANOTHER DOMINO.'],
  },
  [HelpId.Bridger]: {
    icon: IconId.Bridger,
    lines: ['KNOCK A BRIDGER INTO A GAP', 'TO FILL IT IN AND ALLOW', 'G.I.ANT TO WALK ACROSS.'],
  },
  [HelpId.Vanisher]: {
    icon: IconId.Vanisher,
    lines: ['VANISHERS DISAPPEAR WHEN THEY ARE', 'KNOCKED OVER. UNLIKE OTHER BLOCKS,', 'VANISHERS CAN BE PLACED IN FRONT OF DOORS.'],
  },
  [HelpId.Trigger]: {
    icon: IconId.Trigger,
    lines: ['THE AIM OF THE GAME IS TO KNOCK', 'ALL OF THE DOMINOES OVER. THE', 'TRIGGER MUST BE LAST TO FALL.'],
  },
  [HelpId.Delay]: {
    icon: IconId.Delay,
    lines: ['DELAYS PAUSE FOR A SHORT TIME BEFORE', 'FALLING OVER. IN THIS TIME THEY WILL', 'REBOUND OTHER BLOCKS LIKE STOPPERS DO.'],
  },
  [HelpId.Ascender]: {
    icon: IconId.Ascender,
    lines: ['WHEN HIT, ASCENDERS', 'DEFY GRAVITY AND', 'FALL UPWARDS.'],
  },
  [HelpId.Splitter]: {
    icon: IconId.Splitter,
    lines: ['DROP A BLOCK ONTO THE TOP OF A', 'SPLITTER AND IT DIVIDES IN TWO,', 'KNOCKING OVER THE BLOCKS TO EITHER SIDE.'],
  },
  [HelpId.Exploder]: {
    icon: IconId.Exploder,
    lines: ['WHEN HIT, AN EXPLODER WILL', 'LEAVE A GAP IN THE FLOOR', 'WHERE IT WAS STANDING.'],
  },
  [HelpId.Counters]: {
    icon: IconId.Counters,
    lines: ['COUNTER-STOPPERS CAN ONLY BE', 'KNOCKED OVER IN THE ORDER SHOWN', 'BY THE NUMBER OF YELLOW STRIPES.'],
  },
  [HelpId.MultiTriggers]: {
    icon: IconId.MultiTriggers,
    lines: ['WHEN THERE IS MORE THAN ONE TRIGGER', 'IN A LEVEL, THEY MUST ALL BE', 'KNOCKED OVER AT THE SAME TIME.'],
  },
};

export class HelpSystem {
  private bubbleSheet: SpriteSheet;
  private iconsSheet: SpriteSheet;

  private helpDelay = 0;
  private helpAlpha = 0;
  private helpActive = 0;
  private helpIcon = 0;
  private helpWidth = 0;
  private helpX = 0;
  private helpY = 0;
  private helpInverse = false;
  private helpText: [string, string, string] = ['', '', ''];

  constructor() {
    this.bubbleSheet = new SpriteSheet(
      getImageUrl('image/help/bubble.png'),
      BUBBLE_TILE,
      BUBBLE_HEIGHT,
      4,
      1,
    );
    this.iconsSheet = new SpriteSheet(
      getImageUrl('image/help/icons.png'),
      ICON_WIDTH,
      ICON_HEIGHT,
      20,
      1,
    );
  }

  async load(): Promise<void> {
    await Promise.all([this.bubbleSheet.load(), this.iconsSheet.load()]);
  }

  setHelp(id: number, delay: number, inverse = false): void {
    const def = HELP_DEFS[id];
    if (!def) return;

    this.helpIcon = def.icon;
    this.helpText = [...def.lines];

    let biggest = 0;
    for (const line of this.helpText) {
      if (line.length > biggest) biggest = line.length;
    }

    this.helpDelay = delay;
    this.helpWidth = Math.ceil((biggest * 12 + 96) / BUBBLE_TILE);
    this.helpX = 632 - this.helpWidth * BUBBLE_TILE;
    this.helpActive = ACTIVE_TIME;
    this.helpAlpha = 0;

    this.helpInverse = inverse;
    this.helpY = inverse ? 368 : 0;
  }

  process(hKeyHit: boolean): void {
    if (this.helpDelay > 0) {
      this.helpDelay--;
      return;
    }

    if (this.helpWidth === 0) return;

    if (this.helpActive > 0) {
      this.helpAlpha = Math.min(this.helpAlpha + FADE_IN_SPEED, MAX_ALPHA);
      this.helpActive--;
      if (hKeyHit) this.helpActive = 0;
    } else {
      this.helpAlpha = Math.max(this.helpAlpha - FADE_OUT_SPEED, 0);
      if (hKeyHit) this.helpActive = ACTIVE_TIME;
    }
  }

  draw(renderer: Renderer, msgBox: MessageBox): void {
    if (this.helpWidth === 0 || this.helpAlpha <= 0) return;

    renderer.blitAlpha(this.bubbleSheet.getFrame(0), this.helpX, this.helpY, this.helpAlpha);
    for (let i = 1; i < this.helpWidth - 1; i++) {
      renderer.blitAlpha(
        this.bubbleSheet.getFrame(1),
        this.helpX + i * BUBBLE_TILE,
        this.helpY,
        this.helpAlpha,
      );
    }

    if (this.helpInverse) {
      renderer.blitAlpha(
        this.bubbleSheet.getFrame(3),
        this.helpX + (this.helpWidth - 1) * BUBBLE_TILE,
        this.helpY + 16,
        this.helpAlpha,
      );
    } else {
      renderer.blitAlpha(
        this.bubbleSheet.getFrame(2),
        this.helpX + (this.helpWidth - 1) * BUBBLE_TILE,
        this.helpY,
        this.helpAlpha,
      );
    }

    renderer.blitAlpha(
      this.iconsSheet.getFrame(this.helpIcon),
      this.helpX + 16,
      this.helpY + 32,
      this.helpAlpha,
    );

    for (let i = 0; i < 3; i++) {
      msgBox.drawBitmapText(
        renderer,
        this.helpX + 64,
        this.helpY + 32 + i * 16,
        this.helpText[i]!,
        TextColor.Highlight,
        false,
        this.helpAlpha,
      );
    }
  }
}
