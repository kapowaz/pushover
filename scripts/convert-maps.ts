import { readFile, writeFile, readdir, mkdir, stat } from 'fs/promises';
import path from 'path';

const BASE = process.cwd();
const MAPWIDTH = 22;
const MAPHEIGHT = 15;
const MAPHEIGHT2 = 30;

const MAP_SETS: { src: string; dest: string }[] = [
  { src: path.join(BASE, 'Data/Map/0'), dest: path.join(BASE, 'src/assets/maps/0') },
  { src: path.join(BASE, 'Data/Map/2'), dest: path.join(BASE, 'src/assets/maps/2') },
];

class MapReader {
  private offset = 0;

  constructor(private buf: Buffer) {}

  readInt(): number {
    const value = this.buf.readUInt32LE(this.offset);
    this.offset += 4;
    return value >= 27 ? value - 1 : value;
  }

  /** Mirrors C++ `mapFile >> ch` — skips whitespace, reads one byte */
  readChar(): number {
    while (this.offset < this.buf.length) {
      const ch = this.buf[this.offset++];
      if (ch !== 0x20 && ch !== 0x09 && ch !== 0x0a && ch !== 0x0d) return ch;
    }
    throw new Error('Unexpected end of file while reading string');
  }

  readString(terminator: number): string {
    const chars: string[] = [];
    while (true) {
      const ch = this.readChar();
      if (ch === terminator) break;
      chars.push(ch === 0x5f ? ' ' : String.fromCharCode(ch)); // '_' → ' '
    }
    return chars.join('');
  }
}

function make2D(w: number, h: number): number[][] {
  return Array.from({ length: w }, () => new Array<number>(h).fill(0));
}

interface MapData {
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

/**
 * Undo CRLF corruption in binary map files.
 * Some .map files had 0x0A bytes (valid uint32 data) converted to 0x0D 0x0A
 * by a text-mode transfer, corrupting all data after the insertion point.
 */
function stripCrlf(buf: Buffer): Buffer {
  const out: number[] = [];
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d && i + 1 < buf.length && buf[i + 1] === 0x0a) {
      continue;
    }
    out.push(buf[i]);
  }
  return out.length === buf.length ? buf : Buffer.from(out);
}

function parseMap(buf: Buffer): MapData {
  const r = new MapReader(stripCrlf(buf));

  const version = r.readInt();
  const tileset = r.readInt();
  const dominoSet = version >= 8 ? r.readInt() : 1;

  let doorX = 0,
    doorY = 0;
  if (version >= 3) {
    doorX = r.readInt() + 1;
    doorY = (r.readInt() + 1) * 2;
  }

  let door2X = -1,
    door2Y = -1;
  if (version >= 9) {
    door2X = r.readInt() + 1;
    door2Y = r.readInt();
  }

  let minutes = 1,
    seconds = 0;
  if (version >= 5) {
    minutes = r.readInt();
    seconds = r.readInt();
  }

  const background = make2D(MAPWIDTH, MAPHEIGHT);
  for (let x = 0; x < MAPWIDTH - 2; x++) {
    for (let y = 0; y < MAPHEIGHT; y++) {
      background[x + 1][y] = r.readInt();
    }
  }

  const ledge = make2D(MAPWIDTH, MAPHEIGHT2);
  const domino = make2D(MAPWIDTH, MAPHEIGHT2);
  const ladder = make2D(MAPWIDTH, MAPHEIGHT2);

  if (version >= 2) {
    for (let x = 0; x < MAPWIDTH - 2; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        ledge[x + 1][y] = r.readInt();
      }
    }

    for (let x = 0; x < MAPWIDTH - 2; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        domino[x + 1][y] = r.readInt();
      }
    }

    if (version >= 4) {
      for (let x = 0; x < MAPWIDTH - 2; x++) {
        for (let y = 0; y < MAPHEIGHT2; y++) {
          ladder[x + 1][y] = r.readInt();
        }
      }
    } else {
      for (let x = 0; x < MAPWIDTH - 2; x++) {
        for (let y = 0; y < MAPHEIGHT; y++) {
          ladder[x + 1][y] = r.readInt();
        }
      }
    }
  }

  let author = '';
  let clue = '';

  if (version === 6) {
    author = r.readString(0x2d); // '-'
    clue = r.readString(0x2d);
  } else if (version >= 7) {
    author = r.readString(0x40); // '@'
    clue = r.readString(0x40);
  }

  return {
    version,
    tileset,
    dominoSet,
    door: { x: doorX, y: doorY },
    door2: { x: door2X, y: door2Y },
    time: { minutes, seconds },
    background,
    ledge,
    domino,
    ladder,
    author,
    clue,
  };
}

async function processMapSet(src: string, dest: string): Promise<number[]> {
  const exists = await stat(src).catch(() => null);
  if (!exists) {
    console.warn(`Map source not found, skipping: ${src}`);
    return [];
  }

  await mkdir(dest, { recursive: true });

  const entries = await readdir(src);
  const mapFiles = entries
    .filter((f) => f.toLowerCase().endsWith('.map'))
    .sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return numA - numB;
    });

  const mapNumbers: number[] = [];

  for (const file of mapFiles) {
    const filePath = path.join(src, file);
    const buf = await readFile(filePath);
    const mapData = parseMap(buf);
    const mapNum = parseInt(file, 10);
    mapNumbers.push(mapNum);

    const outputPath = path.join(dest, `${mapNum}.json`);
    await writeFile(outputPath, JSON.stringify(mapData, null, 2));
    console.log(`${filePath} -> ${outputPath}`);
  }

  return mapNumbers;
}

async function main() {
  const index: Record<string, number[]> = {};

  for (const { src, dest } of MAP_SETS) {
    const setId = path.basename(src);
    const maps = await processMapSet(src, dest);
    if (maps.length > 0) {
      index[setId] = maps;
    }
  }

  const indexPath = path.join(BASE, 'src/assets/maps/index.json');
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, JSON.stringify(index, null, 2));
  console.log(`Index written to ${indexPath}`);
  console.log('Map conversion complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
