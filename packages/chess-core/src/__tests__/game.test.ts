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

  describe('getBoard', () => {
    it('should return 64-element board', () => {
      const board = engine.getBoard();
      expect(board).toHaveLength(64);
    });

    it('should parse starting position correctly', () => {
      const board = engine.getBoard();
      // Rank 0 (index 0-7): a1-h1 should have white pieces
      expect(board[0]).toEqual({ type: 'r', color: 'w' }); // a1
      expect(board[4]).toEqual({ type: 'k', color: 'w' }); // e1
      // Rank 7 (index 56-63): a8-h8 should have black pieces
      expect(board[56]).toEqual({ type: 'r', color: 'b' }); // a8
      expect(board[60]).toEqual({ type: 'k', color: 'b' }); // e8
    });
  });

  describe('getHistory', () => {
    it('should return empty array initially', () => {
      const history = engine.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should track moves in verbose format', () => {
      engine.makeMove('e2e4');
      engine.makeMove('e7e5');
      const history = engine.getHistory(true) as any[];
      expect(history).toHaveLength(2);
      expect(history[0].san).toBe('e4');
      expect(history[1].san).toBe('e5');
    });
  });

  describe('getKingSquare', () => {
    it('should find white king at starting position', () => {
      const sq = engine.getKingSquare('w');
      expect(sq).toBe(4); // e1 = rank 0, file 4
    });

    it('should find black king at starting position', () => {
      const sq = engine.getKingSquare('b');
      expect(sq).toBe(60); // e8 = rank 7, file 4
    });

    it('should track king after movement', () => {
      engine.makeMove('e2e4');
      engine.makeMove('e7e5');
      engine.makeMove('f1e2');
      const sq = engine.getKingSquare('w');
      expect(sq).toBe(4); // King hasn't moved
    });
  });
});
