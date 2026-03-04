import { MAX_TILES, TILE_SIZE } from './constants';
import { AssetLoader } from '../engine/AssetLoader';
import { SpriteSheet } from '../engine/SpriteSheet';
import { getImageUrl } from '../assets';

const TILESET_COLS = 25;
const TILESET_ROWS = 10;
const BABY_TILE_SIZE = 8;

export class TilesetManager {
  private tiles: ImageBitmap[] = [];
  private babySheet: SpriteSheet | null = null;
  private _gameTileset = 0;
  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  get gameTileset(): number {
    return this._gameTileset;
  }

  async loadTileset(tilesetNumber: number): Promise<void> {
    this.disposeTiles();

    const img = await this.assetLoader.loadImage(
      getImageUrl(`image/tileset/${tilesetNumber}.png`),
    );

    const offscreen = new OffscreenCanvas(img.width, img.height);
    const ctx = offscreen.getContext('2d');
    if (!ctx) throw new Error('Failed to get OffscreenCanvas 2D context');
    ctx.drawImage(img, 0, 0);

    const tileCount = Math.min(MAX_TILES, TILESET_COLS * TILESET_ROWS);
    const promises: Promise<ImageBitmap>[] = [];

    for (let i = 0; i < tileCount; i++) {
      const col = i % TILESET_COLS;
      const row = Math.floor(i / TILESET_COLS);
      promises.push(
        createImageBitmap(
          offscreen,
          col * TILE_SIZE,
          row * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        ),
      );
    }

    this.tiles = await Promise.all(promises);
    this._gameTileset = tilesetNumber;
  }

  getTile(index: number): ImageBitmap {
    const tile = this.tiles[index];
    if (!tile) {
      throw new RangeError(
        `Tile index ${index} out of range (0..${this.tiles.length - 1})`,
      );
    }
    return tile;
  }

  get tileCount(): number {
    return this.tiles.length;
  }

  async loadBabyTileset(tilesetNumber: number): Promise<void> {
    this.babySheet = new SpriteSheet(
      getImageUrl(`image/tileset/baby${tilesetNumber}.png`),
      BABY_TILE_SIZE,
      BABY_TILE_SIZE,
      TILESET_COLS,
      TILESET_ROWS,
    );
    await this.babySheet.load();
  }

  getBabyTile(index: number): ImageBitmap {
    if (!this.babySheet) {
      throw new Error('Baby tileset not loaded');
    }
    return this.babySheet.getFrame(index);
  }

  private disposeTiles(): void {
    for (const tile of this.tiles) {
      tile.close();
    }
    this.tiles = [];
  }
}
