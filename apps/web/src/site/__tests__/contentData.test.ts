import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { OPENINGS, movetext } from '../data/openings';
import { PUZZLES } from '../data/puzzles';
import { canForceMate, forcedMateMoves, stubbornestReply } from '../puzzleSolver';

describe('openings data', () => {
  it('has unique ids and every line is legal from the start position', () => {
    expect(new Set(OPENINGS.map((o) => o.id)).size).toBe(OPENINGS.length);
    for (const o of OPENINGS) {
      const chess = new Chess();
      for (const san of o.moves) expect(() => chess.move(san), `${o.name}: ${san}`).not.toThrow();
      expect(o.moves.length).toBeGreaterThanOrEqual(6);
      expect(o.eco).toMatch(/^[A-E]\d\d$/);
    }
  });

  it('movetext round-trips through PGN loading', () => {
    for (const o of OPENINGS) {
      const chess = new Chess();
      chess.loadPgn(movetext(o.moves));
      expect(chess.history()).toEqual(o.moves);
    }
  });
});

describe('puzzle data', () => {
  it('has unique ids', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
  });

  it.each(PUZZLES)('$id: mate in $mateIn is real, minimal and has a solution', (p) => {
    const chess = new Chess(p.fen);
    expect(chess.isGameOver()).toBe(false);
    const solutions = forcedMateMoves(p.fen, p.mateIn);
    expect(solutions.length).toBeGreaterThan(0);
    if (p.mateIn === 2) expect(forcedMateMoves(p.fen, 1)).toEqual([]);
  });

  it('solver: defender cannot escape a scripted mate in 2', () => {
    const fen = '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1';
    const chess = new Chess(fen);
    chess.move('a2a7');
    const reply = stubbornestReply(chess.fen(), 1)!;
    chess.move(reply);
    expect(canForceMate(chess, 1)).toBe(true);
  });

  it('solver: rejects a first move that does not force mate', () => {
    expect(forcedMateMoves('6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', 2)).not.toContain('g1f1');
  });

  it('stalemate is not counted as mate', () => {
    // Qg6?? stalemates; solver must not list it as a mating move
    expect(forcedMateMoves('7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', 1)).not.toContain('g1g6');
  });
});
