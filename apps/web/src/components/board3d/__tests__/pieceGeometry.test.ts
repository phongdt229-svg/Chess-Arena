import { describe, it, expect } from 'vitest';
import type { PieceType } from '@chess-arena/chess-core';
import { getPieceGeometry, getPieceMaterial, PIECE_HEIGHTS } from '../pieceGeometry';

const TYPES: PieceType[] = ['p', 'r', 'n', 'b', 'q', 'k'];

describe('pieceGeometry', () => {
  it.each(TYPES)('%s: valid mesh standing on y=0 inside its tile', (type) => {
    const g = getPieceGeometry(type);
    const pos = g.getAttribute('position');
    expect(pos.count).toBeGreaterThan(100);
    expect(g.getAttribute('normal').count).toBe(pos.count);
    expect(pos.array.every(Number.isFinite)).toBe(true);

    g.computeBoundingBox();
    const { min, max } = g.boundingBox!;
    expect(min.y).toBeGreaterThan(-0.01);
    expect(min.y).toBeLessThan(0.01);
    expect(max.y).toBeGreaterThan(PIECE_HEIGHTS[type] - 0.03);
    expect(max.y).toBeLessThan(PIECE_HEIGHTS[type] + 0.03);
    expect(Math.max(-min.x, max.x, -min.z, max.z)).toBeLessThanOrEqual(0.4);
  });

  it('heights increase pawn < rook < knight < bishop < queen < king', () => {
    const tops = TYPES.map((t) => {
      const g = getPieceGeometry(t);
      g.computeBoundingBox();
      return g.boundingBox!.max.y;
    });
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  it('knight head points towards -z (towards black)', () => {
    const g = getPieceGeometry('n');
    g.computeBoundingBox();
    expect(g.boundingBox!.min.z).toBeLessThan(-0.25);
    expect(g.boundingBox!.max.z).toBeLessThan(0.35);
  });

  it('caches geometry and material', () => {
    expect(getPieceGeometry('q')).toBe(getPieceGeometry('q'));
    expect(getPieceMaterial('w')).toBe(getPieceMaterial('w'));
    expect(getPieceMaterial('w')).not.toBe(getPieceMaterial('b'));
  });
});
