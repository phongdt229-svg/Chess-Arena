import { describe, it, expect } from 'vitest';
import { squareToWorld, rotateCoords, indexToSquare, squareToIndex, worldToSquare } from '../coords';

describe('coords', () => {
  describe('squareToWorld', () => {
    it('should convert a1 (0) to (-3.5, 0, 3.5)', () => {
      const coords = squareToWorld(0);
      expect(coords).toEqual({ x: -3.5, y: 0, z: 3.5 });
    });

    it('should convert h8 (63) to (3.5, 0, -3.5)', () => {
      const coords = squareToWorld(63);
      expect(coords).toEqual({ x: 3.5, y: 0, z: -3.5 });
    });

    it('should convert e4 (28) to (0.5, 0, 0.5)', () => {
      const coords = squareToWorld(28);
      expect(coords).toEqual({ x: 0.5, y: 0, z: 0.5 });
    });

    it('should convert e1 (4) to (0.5, 0, 3.5)', () => {
      const coords = squareToWorld(4);
      expect(coords).toEqual({ x: 0.5, y: 0, z: 3.5 });
    });

    it('should convert e8 (60) to (0.5, 0, -3.5)', () => {
      const coords = squareToWorld(60);
      expect(coords).toEqual({ x: 0.5, y: 0, z: -3.5 });
    });
  });

  describe('rotateCoords', () => {
    it('should not change coords for white orientation', () => {
      const coords = { x: 1, y: 0, z: 2 };
      expect(rotateCoords(coords, 'w')).toEqual(coords);
    });

    it('should rotate coords 180 degrees for black orientation', () => {
      const coords = { x: 1, y: 0, z: 2 };
      expect(rotateCoords(coords, 'b')).toEqual({ x: -1, y: 0, z: -2 });
    });
  });

  describe('indexToSquare', () => {
    it('should convert 0 to a1', () => {
      expect(indexToSquare(0)).toBe('a1');
    });

    it('should convert 4 to e1', () => {
      expect(indexToSquare(4)).toBe('e1');
    });

    it('should convert 63 to h8', () => {
      expect(indexToSquare(63)).toBe('h8');
    });
  });

  describe('squareToIndex', () => {
    it('should convert a1 to 0', () => {
      expect(squareToIndex('a1')).toBe(0);
    });

    it('should convert e4 to 28', () => {
      expect(squareToIndex('e4')).toBe(28);
    });

    it('should convert h8 to 63', () => {
      expect(squareToIndex('h8')).toBe(63);
    });
  });
});

describe('worldToSquare', () => {
  it('is the inverse of squareToWorld for every square', () => {
    for (let sq = 0; sq < 64; sq++) {
      const { x, z } = squareToWorld(sq);
      expect(worldToSquare(x, z)).toBe(sq);
    }
  });

  it('accepts any point inside a square', () => {
    const { x, z } = squareToWorld(28);
    expect(worldToSquare(x + 0.49, z - 0.49)).toBe(28);
    expect(worldToSquare(x - 0.49, z + 0.49)).toBe(28);
  });

  it('returns null outside the board', () => {
    expect(worldToSquare(-4.1, 0)).toBeNull();
    expect(worldToSquare(4.1, 0)).toBeNull();
    expect(worldToSquare(0, 4.1)).toBeNull();
    expect(worldToSquare(0, -4.1)).toBeNull();
  });
});
