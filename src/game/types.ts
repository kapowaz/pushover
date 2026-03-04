import { MAPWIDTH, MAPHEIGHT, MAPHEIGHT2 } from './constants';

export interface MapData {
  version: number;
  tileset: number;
  dominoSet: number;
  door: { x: number; y: number };
  door2: { x: number; y: number };
  time: { minutes: number; seconds: number };
  background: number[][];
  ledge: number[][];
  domino: number[][];
  ladder: number[][];
  author: string;
  clue: string;
}

export interface MapIndex {
  mapSets: {
    [key: string]: number[];
  };
}

export type Grid<T> = T[][];

export function createGrid<T>(width: number, height: number, defaultValue: T): Grid<T> {
  return Array.from({ length: width }, () => Array.from({ length: height }, () => defaultValue));
}

export function createMapGrid<T>(defaultValue: T): Grid<T> {
  return createGrid(MAPWIDTH, MAPHEIGHT2, defaultValue);
}

export function createBackgroundGrid<T>(defaultValue: T): Grid<T> {
  return createGrid(MAPWIDTH, MAPHEIGHT, defaultValue);
}

export interface DominoLayer {
  type: Grid<number>;
  state: Grid<number>;
  frame: Grid<number>;
  frameChange: Grid<number>;
  x: Grid<number>;
  y: Grid<number>;
  delay: Grid<number>;
}

export function createDominoLayer(): DominoLayer {
  return {
    type: createMapGrid(0),
    state: createMapGrid(0),
    frame: createMapGrid(0),
    frameChange: createMapGrid(0),
    x: createMapGrid(0),
    y: createMapGrid(0),
    delay: createMapGrid(0),
  };
}

export interface PlayerConfig {
  playerNum: number;
  upKey: string;
  downKey: string;
  leftKey: string;
  rightKey: string;
  fireKey: string;
}

export interface ProfileData {
  name: string;
  levelsComplete: number[];
  tokens: number;
  helpDisplayed: boolean[];
}
