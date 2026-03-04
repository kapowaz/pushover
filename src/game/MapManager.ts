import {
  MAPWIDTH,
  MAPHEIGHT,
  MAPHEIGHT2,
  TILE_SIZE,
  HALF_TILE,
  CLOSED_DOOR,
  OPEN_DOOR,
} from './constants';
import { MapData, Grid, createMapGrid, createBackgroundGrid } from './types';
import { AssetLoader } from '../engine/AssetLoader';
import { Renderer } from '../engine/Renderer';
import { TilesetManager } from './TilesetManager';

export class MapManager {
  background: Grid<number> = createBackgroundGrid(0);
  ledge: Grid<number> = createMapGrid(0);
  ladder: Grid<number> = createMapGrid(0);

  doorX = 0;
  doorY = 0;
  door2X = 0;
  door2Y = 0;

  currentMap = 0;
  mapSet = 0;

  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  async loadMap(mapSet: number, mapNumber: number): Promise<MapData> {
    const data = await this.assetLoader.loadJSON<MapData>(
      `/assets/maps/${mapSet}/${mapNumber}.json`,
    );

    this.background = createBackgroundGrid(0);
    this.ledge = createMapGrid(0);
    this.ladder = createMapGrid(0);

    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT; y++) {
        this.background[x][y] = data.background[x]?.[y] ?? 0;
      }
      for (let y = 0; y < MAPHEIGHT2; y++) {
        this.ledge[x][y] = data.ledge[x]?.[y] ?? 0;
        this.ladder[x][y] = data.ladder[x]?.[y] ?? 0;
      }
    }

    this.doorX = data.door.x;
    this.doorY = data.door.y;

    if (data.door2.x >= 0 && data.door2.y >= 0) {
      this.door2X = data.door2.x;
      this.door2Y = data.door2.y;
    } else {
      this.findExitDoor();
    }

    this.currentMap = mapNumber;
    this.mapSet = mapSet;

    this.updateLedge();

    return data;
  }

  /**
   * When no explicit exit door is set, scan background tiles for a second
   * CLOSED_DOOR tile that differs from the entry door position.
   */
  private findExitDoor(): void {
    const entryBgY = (this.doorY - 1) >> 1;

    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT; y++) {
        const tile = this.background[x][y];
        if (
          tile >= CLOSED_DOOR &&
          tile <= OPEN_DOOR &&
          !(x === this.doorX && y === entryBgY)
        ) {
          this.door2X = x;
          this.door2Y = y * 2 + 2;
          return;
        }
      }
    }

    this.door2X = this.doorX;
    this.door2Y = this.doorY;
  }

  /**
   * Recalculate ledge tile variants based on horizontal adjacency.
   * A ledge cell becomes: left-end (1), middle (2), right-end (3), or single (4).
   */
  updateLedge(): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        if (this.ledge[x][y] === 0) continue;

        const hasLeft = x > 0 && this.ledge[x - 1][y] !== 0;
        const hasRight = x < MAPWIDTH - 1 && this.ledge[x + 1][y] !== 0;

        if (hasLeft && hasRight) {
          this.ledge[x][y] = 2;
        } else if (hasLeft) {
          this.ledge[x][y] = 3;
        } else if (hasRight) {
          this.ledge[x][y] = 1;
        } else {
          this.ledge[x][y] = 4;
        }
      }
    }
  }

  drawBackground(renderer: Renderer, tileset: TilesetManager): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT; y++) {
        const bg = this.background[x][y];
        if (bg > 0) {
          renderer.blitImage(
            tileset.getTile(bg - 1),
            (x - 1) * TILE_SIZE,
            y * TILE_SIZE,
          );
        }
      }
    }
  }

  drawLedgeShadows(
    renderer: Renderer,
    tileset: TilesetManager,
    shadowOffset: number = 10,
  ): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        const ledgeVal = this.ledge[x][y];
        if (ledgeVal > 0) {
          renderer.blitImage(
            tileset.getTile(ledgeVal + shadowOffset),
            (x - 1) * TILE_SIZE,
            y * HALF_TILE,
          );
        }
      }
    }
  }

  /**
   * Draw ledge tiles for a single row.
   * Called row-by-row so the Game class can interleave domino rendering.
   */
  drawLedgeRow(renderer: Renderer, tileset: TilesetManager, y: number): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      const ledgeVal = this.ledge[x][y];
      if (ledgeVal > 0) {
        renderer.blitImage(
          tileset.getTile(ledgeVal - 1),
          (x - 1) * TILE_SIZE,
          y * HALF_TILE,
        );
      }
    }
  }

  drawLadders(renderer: Renderer, tileset: TilesetManager): void {
    for (let x = 0; x < MAPWIDTH; x++) {
      for (let y = 0; y < MAPHEIGHT2; y++) {
        const ladderVal = this.ladder[x][y];
        if (ladderVal > 0) {
          renderer.blitImage(
            tileset.getTile(ladderVal - 1),
            (x - 1) * TILE_SIZE,
            y * HALF_TILE,
          );
        }
      }
    }
  }

  /**
   * Full map draw without domino interleaving.
   * For use when no domino layer needs depth-sorted rendering.
   */
  drawMap(renderer: Renderer, tileset: TilesetManager): void {
    this.drawBackground(renderer, tileset);
    this.drawLedgeShadows(renderer, tileset);

    for (let y = 0; y < MAPHEIGHT2; y++) {
      this.drawLedgeRow(renderer, tileset, y);
    }

    this.drawLadders(renderer, tileset);
  }

  /**
   * Draw map layers with a per-row callback for domino/rubble interleaving.
   * The callback receives the current row index so dominoes at that depth
   * can be rendered between ledge rows.
   */
  drawMapInterleaved(
    renderer: Renderer,
    tileset: TilesetManager,
    onRow: (y: number) => void,
  ): void {
    this.drawBackground(renderer, tileset);
    this.drawLedgeShadows(renderer, tileset);

    for (let y = 0; y < MAPHEIGHT2; y++) {
      this.drawLedgeRow(renderer, tileset, y);
      onRow(y);
    }

    this.drawLadders(renderer, tileset);
  }
}
