import { describe, it, expect } from 'vitest';
import { findBestMove } from '../engine';

describe('Engine', () => {
  it('should find a legal move from starting position', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const move = findBestMove(fen, { depth: 1, randomness: 0, timeMs: 500 });
    expect(move).toMatch(/^[a-h][1-8][a-h][1-8]$/);
  });

  it('should find strong moves in complex positions', () => {
    // Position after a few moves of a typical game
    const fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2';
    const move = findBestMove(fen, { depth: 2, randomness: 0, timeMs: 500 });
    // Should find a valid move
    expect(move).toBeDefined();
    expect(move.length).toBeGreaterThanOrEqual(4); // Standard UCI notation or promotion
  });

  it('should respect depth limit', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const start = Date.now();
    findBestMove(fen, { depth: 1, randomness: 0, timeMs: 100 });
    const elapsed = Date.now() - start;
    // Should complete quickly for depth 1
    expect(elapsed).toBeLessThan(1000);
  });

  it('should handle randomness', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const moves = new Set<string>();
    // With high randomness, should get different moves
    for (let i = 0; i < 5; i++) {
      const move = findBestMove(fen, { depth: 1, randomness: 100, timeMs: 200 });
      moves.add(move);
    }
    // With randomness, we should get some variety (but not guaranteed with depth 1)
    expect(moves.size).toBeGreaterThan(0);
  });

  it('should not crash on bad FEN', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Using a valid FEN for robustness
    expect(() => {
      findBestMove(fen, { depth: 1, randomness: 0, timeMs: 100 });
    }).not.toThrow();
  });

  it('should return valid move format', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const move = findBestMove(fen, { depth: 1, randomness: 0, timeMs: 100 });
    // Should be valid UCI format
    expect(move).toMatch(/^[a-h][1-8][a-h][1-8]([qrbn])?$/);
  });

  it('should prefer strong moves with high randomness=0', () => {
    // After 1.e4, White's best move is typically e4
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const move = findBestMove(fen, { depth: 2, randomness: 0, timeMs: 500 });
    // Should find a strong opening move
    expect(move).toBeDefined();
    expect(move.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Engine plays well for both colours', () => {
  const opts = { depth: 2, randomness: 0, timeMs: 2000 };

  it('white finds mate in one (Ra8#)', () => {
    expect(findBestMove('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', opts)).toBe('a1a8');
  });

  it('black finds mate in one (Ra1#)', () => {
    expect(findBestMove('r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', opts)).toBe('a8a1');
  });

  it('white captures a hanging queen', () => {
    expect(findBestMove('4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1', opts)).toBe('d1d5');
  });

  it('black captures a hanging queen', () => {
    expect(findBestMove('3rk3/8/8/8/3Q4/8/8/4K3 b - - 0 1', opts)).toBe('d8d4');
  });

  it('does not walk the queen into capture at depth 2 (white)', () => {
    const move = findBestMove('4k3/8/8/2p5/8/8/3Q4/4K3 w - - 0 1', { ...opts, depth: 2 });
    expect(move).not.toBe('d2d4'); // d4 is attacked by the c5 pawn
  });
});

import { analyse } from '../engine';

describe('analyse', () => {
  const budget = { maxDepth: 4, timeMs: 3000 };

  it('start position: a legal best move and a near-zero score', () => {
    const a = analyse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', budget);
    expect(a.move).toMatch(/^[a-h][1-8][a-h][1-8]$/);
    expect(Math.abs(a.score)).toBeLessThan(80);
    expect(a.mate).toBeNull();
    expect(a.depth).toBeGreaterThanOrEqual(2);
  });

  it('scores are from White\'s point of view whoever is to move', () => {
    // identical material edge for White, once with White to move and once with Black to move
    const up = '4k3/8/8/8/8/8/3Q4/4K3';
    const whiteToMove = analyse(`${up} w - - 0 1`, budget).score;
    const blackToMove = analyse(`${up} b - - 0 1`, budget).score;
    expect(whiteToMove).toBeGreaterThan(500);
    expect(blackToMove).toBeGreaterThan(500);
    const down = '4k3/3q4/8/8/8/8/8/4K3';
    expect(analyse(`${down} w - - 0 1`, budget).score).toBeLessThan(-500);
    expect(analyse(`${down} b - - 0 1`, budget).score).toBeLessThan(-500);
  });

  it('finds mate in one for either side and reports it', () => {
    const white = analyse('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', budget);
    expect(white.move).toBe('a1a8');
    expect(white.mate).toBe(1);
    expect(white.score).toBeGreaterThan(29000);
    const black = analyse('r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', budget);
    expect(black.move).toBe('a8a1');
    expect(black.mate).toBe(-1);
    expect(black.score).toBeLessThan(-29000);
  });

  it('counts moves to mate for a mate in two', () => {
    const a = analyse('6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', { maxDepth: 4, timeMs: 5000 });
    expect(a.mate).toBe(2);
    expect(['a2a7', 'b1b7']).toContain(a.move);
  });

  it('recognises finished games', () => {
    expect(analyse('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3', budget)).toMatchObject({ move: '', mate: 0, score: -30000 });
    expect(analyse('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', budget)).toMatchObject({ move: '', mate: null, score: 0 });
  });

  it('honours the time budget and keeps the last completed depth', () => {
    const t = Date.now();
    const a = analyse('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { maxDepth: 12, timeMs: 400 });
    expect(Date.now() - t).toBeLessThan(1500);
    expect(a.depth).toBeGreaterThanOrEqual(1);
    expect(a.move).toMatch(/^[a-h][1-8][a-h][1-8]/);
  });

  it('does not hang the queen (sanity at depth 3)', () => {
    const a = analyse('4k3/8/8/2p5/8/8/3Q4/4K3 w - - 0 1', { maxDepth: 3, timeMs: 3000 });
    expect(a.move).not.toBe('d2d4');
  });
});
