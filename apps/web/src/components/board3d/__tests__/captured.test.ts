import { describe, it, expect } from 'vitest';
import type { Move } from '@chess-arena/chess-core';
import { capturedGhostFor } from '../captured';

const mv = (over: Partial<Move>): Move => ({ from: 0, to: 0, piece: 'p', flags: 'normal', ...over });
const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;

describe('capturedGhostFor', () => {
  it('white captures: the ghost is a black piece on the destination square', () => {
    const history = [mv({}), mv({}), mv({ to: sq('d5'), captured: 'p', flags: 'capture' })];
    expect(capturedGhostFor(2, history, 'b')).toEqual({ id: 3, square: sq('d5'), type: 'p', color: 'b' });
  });

  it('black captures: the ghost is a white piece', () => {
    const history = [mv({}), mv({ to: sq('e4'), captured: 'n', flags: 'capture' })];
    expect(capturedGhostFor(1, history, 'w')).toEqual({ id: 2, square: sq('e4'), type: 'n', color: 'w' });
  });

  it('en passant removes the pawn behind the destination square', () => {
    const white = [mv({ to: sq('d6'), captured: 'p', flags: 'enpassant' })];
    expect(capturedGhostFor(0, white, 'b')!.square).toBe(sq('d5'));
    const black = [mv({ to: sq('d3'), captured: 'p', flags: 'enpassant' })];
    expect(capturedGhostFor(0, black, 'w')!.square).toBe(sq('d4'));
  });

  it('is null without a capture, for undo, new games and bulk loads', () => {
    expect(capturedGhostFor(0, [mv({})], 'b')).toBeNull();
    const cap = mv({ captured: 'q', flags: 'capture' });
    expect(capturedGhostFor(3, [cap, cap], 'w')).toBeNull(); // undo (history shrank)
    expect(capturedGhostFor(1, [cap], 'b')).toBeNull(); // nothing new
    expect(capturedGhostFor(0, [cap, cap, cap, cap, cap], 'w')).toBeNull(); // import
  });
});
