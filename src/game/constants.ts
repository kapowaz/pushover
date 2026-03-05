export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 480;
export const FPS = 35;
export const TICKS_PER_FRAME = 1000 / FPS;

export const MAPWIDTH = 22;
export const MAPHEIGHT = 15;
export const MAPHEIGHT2 = 30;
export const TILE_SIZE = 32;
export const HALF_TILE = 16;

export const FIRSTMAP = 1;
export const LAST_MAP = [100, 100, 18, 54, 100] as const;

export const CLOSED_DOOR = 7;
export const OPEN_DOOR = 11;

export enum GameScreen {
  TitleMenu = 0,
  Playing = 1,
  LevelSelect = 2,
}

export enum TitleMenu {
  Main = 0,
  Options = 1,
  NewGame = 2,
  LoadGame = 3,
  EraseGame = 4,
  EraseCheck = 5,
  LevelSelect = 6,
  LevelOptions = 7,
}

export enum MapSet {
  Original = 0,
  New = 1,
  Master = 2,
  Coop = 3,
  Custom = 4,
}

export enum LevelState {
  OpenDoor = 1,
  CloseDoor = 2,
  Playing = 3,
  OpenExit = 4,
  CloseExit = 5,
}

// Domino constants
export const DOM_TYPES = 19;
export const DOM_FPD = 13;
export const DOM_FRAMES = DOM_TYPES * DOM_FPD;
export const DOM_UPRIGHT = 6;
export const DOM_FRAMECHANGE_SPEED = 0.45;
export const DOM_TUMBLER_FRAMECHANGE_SPEED = 0.45;
export const DOM_FALL_SPEED = 5.5;
export const DOM_ASCEND_SPEED = 2.5;
export const DOM_DELAY_COUNT = 27;
export const DOM_STEP_DELAY_COUNT = 54;
export const DOM_STEP_SPEED_MOD = 1.8;
export const TILE_HEIGHT = 8.0;

export enum DominoType {
  None = 0,
  Standard = 1,
  Stopper = 2,
  Tumbler = 3,
  Bridger = 4,
  Vanisher = 5,
  Trigger = 6,
  Delay1 = 7,
  Delay2 = 8,
  Ascender = 9,
  Splitter1 = 10,
  Splitter2 = 11,
  Exploder = 12,
  Count1 = 13,
  Count2 = 14,
  Count3 = 15,
  Starter = 16,
  Rocket = 17,
  Mimic = 18,
  Antigrav = 19,
}

export enum DominoState {
  Standing = 0,
  FallLeft = 1,
  FallRight = 2,
  AscLeft = 3,
  AscRight = 4,
  Ascend = 5,
  Pickup = 6,
  Putdown = 7,
}

// GI (player) constants
export const GI_FRAMES = 280;

export enum GIState {
  Exit = -2,
  Enter = -1,
  Stand = 0,
  WalkLeft = 1,
  WalkRight = 2,
  PickupLeft = 3,
  PickupRight = 45,
  GetupLeft = 43,
  GetupRight = 44,
  HoldLeft = 4,
  HoldRight = 5,
  CarryLeft = 6,
  CarryRight = 7,
  PutdownLeft = 8,
  PutdownRight = 46,
  MoveBackLeft = 9,
  MoveBackRight = 32,
  PushWait = 10,
  PushLeft = 11,
  PushRight = 12,
  PushStopLeft = 37,
  PushStopRight = 38,
  PushAscLeft = 39,
  PushAscRight = 40,
  MoveFrontLeft = 13,
  MoveFrontRight = 33,
  WobbleLeft = 14,
  WobbleRight = 15,
  Fall = 16,
  Land = 17,
  PrefallLeft = 18,
  PrefallRight = 19,
  ClimbUp = 20,
  ClimbDown = 21,
  Climb = 22,
  Die = 23,
  UpLeft = 24,
  UpRight = 25,
  DownLeft = 26,
  DownRight = 27,
  CarryUpLeft = 28,
  CarryUpRight = 29,
  CarryDownLeft = 30,
  CarryDownRight = 31,
  Hai = 34,
  ShakeHead = 35,
  Wave = 36,
  Shrug = 41,
  CoverEars = 42,
  Flat = 47,
  CatchWait = 48,
  CatchPlayer = 49,
  Caught = 50,
  LeapLeft = 51,
  LeapRight = 52,
  LeapCatchLeft = 53,
  LeapCatchRight = 54,
}

// GI animation frame indices
export const GIF = {
  STAND: 0,
  WALK_LS: 1,
  WALK_LE: 4,
  WALK_RS: 5,
  WALK_RE: 8,
  HOLD_L: 9,
  CARRY_LS: 10,
  CARRY_LE: 14,
  HOLD_R: 15,
  CARRY_RS: 16,
  CARRY_RE: 20,
  PICK_RS: 21,
  PICK_RE: 26,
  PICK_LS: 179,
  PICK_LE: 184,
  GETUP_LS: 27,
  GETUP_LE: 29,
  GETUP_RS: 30,
  GETUP_RE: 32,
  WOBBLE_LS: 33,
  WOBBLE_LE: 36,
  WOBBLE_RS: 37,
  WOBBLE_RE: 40,
  FALL_S: 41,
  FALL_E: 43,
  LAND_S: 44,
  LAND_S2: 45,
  LAND_E2: 48,
  LAND_E: 50,
  PREFALL_LS: 51,
  PREFALL_LS2: 55,
  PREFALL_LE2: 58,
  PREFALL_LE: 60,
  PREFALL_RS: 61,
  PREFALL_RS2: 65,
  PREFALL_RE2: 68,
  PREFALL_RE: 70,
  CLIMB_S: 71,
  CLIMB_E: 74,
  EXIT_S: 75,
  EXIT_E: 80,
  ENTER_S: 81,
  ENTER_E: 88,
  DIE_S: 89,
  DIE_E: 98,
  UP_LS: 99,
  UP_LE: 102,
  UP_RS: 103,
  UP_RE: 106,
  DOWN_LS: 107,
  DOWN_LE: 109,
  DOWN_RS: 110,
  DOWN_RE: 112,
  CARRYSTEP_LS: 113,
  CARRYSTEP_LE: 115,
  CARRYSTEP_RS: 116,
  CARRYSTEP_RE: 118,
  MOVEBACK_LS: 120,
  MOVEBACK_LE: 122,
  MOVEBACK_RS: 124,
  MOVEBACK_RE: 126,
  MOVEFRONT_LS: 127,
  MOVEFRONT_LE: 129,
  MOVEFRONT_RS: 131,
  MOVEFRONT_RE: 133,
  HAI_S: 135,
  HAI_E: 136,
  SHAKEHEAD_S: 137,
  SHAKEHEAD_E: 140,
  WAVE_S: 141,
  WAVE_E1: 142,
  WAVE_E2: 143,
  PUSHSTOP_LS: 144,
  PUSHSTOP_LE: 148,
  PUSHSTOP_RS: 149,
  PUSHSTOP_RE: 153,
  PUSH_LS: 154,
  PUSH_LE: 157,
  PUSH_RS: 158,
  PUSH_RE: 161,
  PUSHASC_LS: 162,
  PUSHASC_LE: 166,
  PUSHASC_RS: 167,
  PUSHASC_RE: 171,
  SHRUG_S: 172,
  SHRUG_E: 176,
  COVEREARS_S: 177,
  COVEREARS_E: 178,
  FLAT: 185,
  CATCH: 186,
  HOLDPRIZE: 187,
  HOLDPRIZEBLINK: 188,
  CATCHWAIT_S: 189,
  CATCHWAIT_E: 190,
  CATCHPLAYER_S: 191,
  CATCHPLAYER_E: 195,
  CAUGHT_S: 196,
  CAUGHT_E: 200,
  LEAP_LS: 201,
  LEAP_LE: 213,
  LEAP_RS: 214,
  LEAP_RE: 226,
  LEAPCATCH_LS: 227,
  LEAPCATCH_LE: 239,
  LEAPCATCH_RS: 240,
  LEAPCATCH_RE: 252,
} as const;

// GI animation speeds
export const GI_WALK_FRAMECHANGE = 0.4;
export const GI_CARRY_FRAMECHANGE = 0.6;
export const GI_PICK_FRAMECHANGE = 0.33;
export const GI_GETUP_FRAMECHANGE = 1;
export const GI_WOBBLE_FRAMECHANGE = 0.5;
export const GI_WOBBLE_ITERATIONS = 1;
export const GI_FALL_FRAMECHANGE = 0.4;
export const GI_LAND_FRAMECHANGE = 0.6;
export const GI_LAND_ITERATIONS = 1;
export const GI_PREFALL_FRAMECHANGE = 0.8;
export const GI_PREFALL_ITERATIONS = 1;
export const GI_PREFALL_DROPPOINT_L = 53;
export const GI_PREFALL_DROPPOINT_R = 63;
export const GI_CLIMB_FRAMECHANGE = 0.4;
export const GI_EXIT_FRAMECHANGE = 0.5;
export const GI_ENTER_FRAMECHANGE = 0.5;
export const GI_DIE_FRAMECHANGE = 0.3;
export const GI_UP_FRAMECHANGE = 0.5;
export const GI_DOWN_FRAMECHANGE = 0.5;
export const GI_CARRYSTEP_FRAMECHANGE = 0.5;
export const GI_MOVEBACK_FRAMECHANGE = 0.66;
export const GI_MOVEFRONT_FRAMECHANGE = 0.66;
export const GI_HAI_FRAMECHANGE = 0.25;
export const GI_HAI_ITERATIONS = 6;
export const GI_HAI_WAITTIME = 120;
export const GI_SHAKEHEAD_FRAMECHANGE = 0.2;
export const GI_SHAKEHEAD_ITERATIONS = 1;
export const GI_WAVE_FRAMECHANGE = 0.25;
export const GI_WAVE_ITERATIONS = 1;
export const GI_PUSH_FRAMECHANGE = 0.25;
export const GI_PUSH_PUSHPOINT_L = 156;
export const GI_PUSH_PUSHPOINT_R = 159;
export const GI_PUSHSTOP_PUSHPOINT_L = 146;
export const GI_PUSHSTOP_PUSHPOINT_R = 151;
export const GI_PUSHASC_PUSHPOINT_L = 163;
export const GI_PUSHASC_PUSHPOINT_R = 168;
export const GI_SHRUG_FRAMECHANGE = 0.25;
export const GI_COVEREARS_FRAMECHANGE = 0.25;
export const GI_CATCHWAIT_FRAMECHANGE = 0.25;
export const GI_CATCHPLAYER_FRAMECHANGE = 0.25;
export const GI_CAUGHT_FRAMECHANGE = 0.25;
export const GI_LEAP_FRAMECHANGE = 0.34;
export const GI_LEAPCATCH_FRAMECHANGE = 0.34;

export const GI_WALK_SPEED = 3.5;
export const GI_CARRY_SPEED = 3.5;
export const GI_CLIMB_SPEED = 3;
export const GI_DEATH_TILES = 8;

// Controller mapping
export enum Control {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
  Fire = 4,
}

// Effect constants
export const EFF_FRAMES = 16;

export enum EffectType {
  Explosion = 0,
  Dust = 1,
}

// Sound indices (0-based)
export enum SoundId {
  OpenDoor = 0,
  CloseDoor = 1,
  Hai = 2,
  Fall = 3,
  Hup = 4,
  LevelComplete = 5,
  DominoDrop = 6,
  GISmile = 7,
  Land = 8,
  Rebound = 9,
  Trigger = 10,
  Domino = 11,
  TryAgain = 12,
  Bridger = 13,
  Splitter = 14,
  Exploder = 15,
  Count1 = 16,
  Count2 = 17,
  Count3 = 18,
  Beep1 = 19,
  Beep2 = 20,
  Vanisher = 21,
  Delay = 22,
  Catch = 23,
}

export const TOTAL_SOUNDS = 24;

// Message types
export const MESSAGE_DELAY = 60;

export enum MessageType {
  Pause = 1,
  NotAllToppled = 2,
  StillHolding = 3,
  Crashed = 4,
  Died = 5,
  TooSlow = 6,
  TokenGain = 7,
  Prize = 8,
  CostumeUnlock = 9,
}

export const PRIZE_LEVELS = [11, 22, 33, 44, 55, 66, 77, 88, 99, 100] as const;

export const PRIZE_MESSAGES_ORIGINAL = [
  "THEY'RE WELL TASTY!",
  "CAN YOU BELIEVE IT?",
  'THREE CHEERS FOR SNACK FOOD!',
  'MADE IN A PARALLEL DIMENSION!',
  "THEY'RE NOT CURLY.",
  "THEY'RE BETTER THAN CHUCK NORRIS.",
  "THEY'RE MADE FROM POTATOES!",
  "SHAME THEY'RE ALL THE SAME FLAVOUR.",
  'DID YOU EXPECT ANYTHING ELSE?',
  "THEY'RE SO GOOD IT HURTS!",
] as const;

export const PRIZE_MESSAGES_NEW = [
  'THE PACKET COLOUR CHANGED!',
  "THEY'RE A DELICACY IN MANY COUNTRIES!",
  'SHOULD KEEP G.I. FED FOR A BIT.',
  'CONTAINS 6 E NUMBERS!',
  'KEEP UP THE GOOD WORK!',
  "PO-TA-TOES! BOIL 'EM, MASH 'EM, ETC!",
  'FOIL PACKED FOR FRESHNESS!',
  "ALL THAT SALT CAN'T BE GOOD FOR YOU!",
  'THEY NEED A MASCOT. A DOG IN A SUIT!',
  'MOST DEFINITELY NOT FLOATY LIGHT.',
] as const;

// Max tiles for tileset
export const MAX_TILES = 250;

// Tileset names
export const TILESET_NAMES = [
  '',
  'TOXIC CITY',
  'AZTEC',
  'SPACE',
  'ELECTRO',
  'GREEK',
  'CASTLE',
  'MECHANIC',
  'DUNGEON',
  'JAPANESE',
  'LAB',
  '!AZTEC',
  'UNDERWATER',
  '!ELECTRO',
  'ICE CAVE',
  '!CASTLE',
  'MUSICAL',
  '!DUNGEON',
  'SKY TEMPLE',
  'MASTER TOXIC CITY',
  'MASTER AZTEC',
  'MASTER SPACE',
  'MASTER ELECTRO',
  'MASTER GREEK',
  'MASTER CASTLE',
  'MASTER MECHANIC',
  'MASTER DUNGEON',
  'MASTER JAPANESE',
  'MASTER LAB',
  'MASTER !AZTEC',
  'MASTER UNDERWATER',
  'MASTER !ELECTRO',
  'MASTER ICE CAVE',
  'MASTER !CASTLE',
  'MASTER MUSICAL',
  'MASTER !DUNGEON',
  'MASTER SKY TEMPLE',
] as const;

export const MAP_SET_NAMES = [
  'ORIGINAL PUZZLES',
  'NEW PUZZLES',
  'MASTER PUZZLES',
  'CO-OPERATIVE PUZZLES',
  'CUSTOM PUZZLES',
] as const;
