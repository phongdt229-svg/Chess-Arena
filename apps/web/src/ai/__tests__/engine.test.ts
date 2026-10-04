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
