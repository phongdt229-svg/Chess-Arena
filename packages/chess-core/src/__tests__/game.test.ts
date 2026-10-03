import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../game';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = GameEngine.create();
  });

  describe('basic position', () => {
    it('should start at initial position', () => {
      const expectedFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(engine.getFEN()).toBe(expectedFEN);
    });

    it('should have white to move', () => {
      expect(engine.getCurrentTurn()).toBe('w');
    });

    it('should have 20 legal moves from starting position', () => {
      const moves = engine.legalMoves();
      expect(moves).toHaveLength(20);
    });
  });

  describe('makeMove', () => {
    it('should make a legal move', () => {
      const move = engine.makeMove('e2e4');
      expect(move).not.toBeNull();
      expect(move?.san).toBe('e4');
      expect(engine.getCurrentTurn()).toBe('b');
    });

    it('should return null for illegal move', () => {
      const move = engine.makeMove('e1e3');
      expect(move).toBeNull();
    });
  });

  describe('undo', () => {
    it('should undo a move', () => {
      engine.makeMove('e2e4');
      const undone = engine.undo();
      expect(undone).not.toBeNull();
      expect(engine.getCurrentTurn()).toBe('w');
      expect(engine.getMoveHistory()).toHaveLength(0);
    });
  });

  describe('game result', () => {
    it('should detect checkmate', () => {
      // Fool's mate: f3 e5 g4 Qh5#
      engine.makeMove('f2f3');
      engine.makeMove('e7e5');
      engine.makeMove('g2g4');
      engine.makeMove('d8h4');

      const result = engine.getGameResult();
      expect(result.status).toBe('checkmate');
      expect(result).toHaveProperty('winner', 'b');
    });

    it('should detect stalemate', () => {
      engine.loadFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      const result = engine.getGameResult();
      expect(result.status).toBe('draw');
      expect(result).toHaveProperty('reason', 'stalemate');
    });

    it('should detect ongoing game', () => {
      const result = engine.getGameResult();
      expect(result.status).toBe('ongoing');
    });
  });

  describe('FEN', () => {
    it('should load and export FEN correctly', () => {
      const testFEN = 'rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 2';
      engine.loadFEN(testFEN);
      expect(engine.getFEN()).toBe(testFEN);
    });
  });

  describe('PGN', () => {
    it('should load and export PGN', () => {
      const pgn = '1. e4 e5 2. Nf3 Nc6';
      engine.loadPGN(pgn);
      expect(engine.getMoveHistory()).toHaveLength(4);
    });
  });
});
