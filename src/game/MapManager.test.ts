import { describe, it, expect, beforeEach } from 'vitest';
import { MapManager } from './MapManager';
import { MAPWIDTH } from './constants';

describe('MapManager', () => {
  let mgr: MapManager;

  beforeEach(() => {
    mgr = new MapManager();
  });

  describe('updateLedge', () => {
    it('single ledge tile becomes variant 4', () => {
      mgr.ledge[5][10] = 1;
      mgr.updateLedge();
      expect(mgr.ledge[5][10]).toBe(4);
    });

    it('left end of ledge becomes variant 1', () => {
      mgr.ledge[5][10] = 1;
      mgr.ledge[6][10] = 1;
      mgr.ledge[7][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[5][10]).toBe(1);
    });

    it('middle of ledge becomes variant 2', () => {
      mgr.ledge[5][10] = 1;
      mgr.ledge[6][10] = 1;
      mgr.ledge[7][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[6][10]).toBe(2);
    });

    it('right end of ledge becomes variant 3', () => {
      mgr.ledge[5][10] = 1;
      mgr.ledge[6][10] = 1;
      mgr.ledge[7][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[7][10]).toBe(3);
    });

    it('no ledge stays 0', () => {
      mgr.updateLedge();
      expect(mgr.ledge[3][10]).toBe(0);
    });

    it('two adjacent tiles get left-end and right-end', () => {
      mgr.ledge[5][10] = 1;
      mgr.ledge[6][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[5][10]).toBe(1);
      expect(mgr.ledge[6][10]).toBe(3);
    });

    it('handles ledge at map boundaries', () => {
      mgr.ledge[0][10] = 1;
      mgr.ledge[1][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[0][10]).toBe(1);
      expect(mgr.ledge[1][10]).toBe(3);
    });

    it('handles ledge at right edge', () => {
      mgr.ledge[MAPWIDTH - 2][10] = 1;
      mgr.ledge[MAPWIDTH - 1][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[MAPWIDTH - 2][10]).toBe(1);
      expect(mgr.ledge[MAPWIDTH - 1][10]).toBe(3);
    });

    it('single tile at map edge becomes variant 4', () => {
      mgr.ledge[0][10] = 1;
      mgr.updateLedge();
      expect(mgr.ledge[0][10]).toBe(4);
    });

    it('separate ledge groups are independent', () => {
      mgr.ledge[3][10] = 1;
      mgr.ledge[4][10] = 1;
      // gap at 5
      mgr.ledge[6][10] = 1;
      mgr.ledge[7][10] = 1;
      mgr.ledge[8][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[3][10]).toBe(1);
      expect(mgr.ledge[4][10]).toBe(3);
      expect(mgr.ledge[5][10]).toBe(0);
      expect(mgr.ledge[6][10]).toBe(1);
      expect(mgr.ledge[7][10]).toBe(2);
      expect(mgr.ledge[8][10]).toBe(3);
    });

    it('processes all rows independently', () => {
      mgr.ledge[5][8] = 1;
      mgr.ledge[5][10] = 1;
      mgr.ledge[6][10] = 1;

      mgr.updateLedge();

      expect(mgr.ledge[5][8]).toBe(4);
      expect(mgr.ledge[5][10]).toBe(1);
      expect(mgr.ledge[6][10]).toBe(3);
    });
  });
});
