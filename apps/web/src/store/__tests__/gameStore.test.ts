import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState?.() || {});
  });

  describe('newGame', () => {
    it('should initialize a new game with default state', () => {
      const { newGame } = useGameStore.getState();
      newGame();

      const state = useGameStore.getState();
      expect(state.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(state.board).toHaveLength(64);
      expect(state.history).toHaveLength(0);
      expect(state.result.status).toBe('ongoing');
    });

    it('should clear redo stack on new game', () => {
      const { newGame } = useGameStore.getState();
      newGame();
      expect(useGameStore.getState().redoStack).toHaveLength(0);
    });
  });

  describe('clickSquare and tryMove', () => {
    beforeEach(() => {
      const { newGame } = useGameStore.getState();
      newGame();
    });

    it('should select a square with legal moves', () => {
      const { clickSquare } = useGameStore.getState();
      clickSquare(12); // e2

      const state = useGameStore.getState();
      expect(state.selectedSquare).toBe(12);
      expect(state.legalMoves.length).toBeGreaterThan(0);
    });

    it('should make a legal move (e2e4)', () => {
      const { clickSquare } = useGameStore.getState();

      // e2 = rank 1, file 4 = 1*8 + 4 = 12
      clickSquare(12);
      // e4 = rank 3, file 4 = 3*8 + 4 = 28
      clickSquare(28);

      const state = useGameStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].san).toBe('e4');
      expect(state.lastMoveFrom).toBe(12);
      expect(state.lastMoveTo).toBe(28);
    });

    it('should deselect when clicking same square', () => {
      const { clickSquare } = useGameStore.getState();
      clickSquare(12);
      expect(useGameStore.getState().selectedSquare).toBe(12);

      clickSquare(12);
      expect(useGameStore.getState().selectedSquare).toBeNull();
    });

    it('should reject illegal moves', () => {
      const { clickSquare } = useGameStore.getState();

      // Try to move from e1 (king)
      clickSquare(4); // e1
      const moves = useGameStore.getState().legalMoves;

      // King on e1 has no legal moves at start
      expect(moves).toHaveLength(0);
    });
  });

  describe('promotion', () => {
    it('should support loading FEN with pawn on 7th rank', () => {
      const { newGame, loadFEN } = useGameStore.getState();
      newGame();

      // Load a position with pawn ready to promote
      loadFEN('4k3/4P3/8/8/8/8/4K3/8 w - - 0 1');

      const state = useGameStore.getState();
      expect(state.fen).toBe('4k3/4P3/8/8/8/8/4K3/8 w - - 0 1');
      expect(state.board[52]?.type).toBe('p');
    });
  });

  describe('undo', () => {
    it('should undo the last move', () => {
      const { newGame, clickSquare, undo } = useGameStore.getState();
      newGame();

      clickSquare(12); // e2
      clickSquare(28); // e4
      expect(useGameStore.getState().history).toHaveLength(1);

      undo();
      const state = useGameStore.getState();
      expect(state.history).toHaveLength(0);
      expect(state.redoStack).toHaveLength(1);
    });

    it('should clear redo stack when making a new move', () => {
      const { newGame, clickSquare, undo } = useGameStore.getState();
      newGame();

      clickSquare(12);
      clickSquare(28);
      undo();

      // Now make a different move
      clickSquare(12);
      clickSquare(28);

      const state = useGameStore.getState();
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('check detection', () => {
    it('should detect when king is in check', () => {
      const { newGame, loadFEN } = useGameStore.getState();
      newGame();

      // Position where white king is in check
      // "4k3/8/8/8/8/8/r3K3/8 w - - 0 1" has white king on e2
      loadFEN('4k3/8/8/8/8/8/r3K3/8 w - - 0 1');

      const state = useGameStore.getState();
      expect(state.inCheckSquare).toBe(12); // white king on e2 (rank 1, file 4 = 1*8+4 = 12)
    });

    it('should clear check status when no longer in check', () => {
      const { newGame, loadFEN } = useGameStore.getState();
      newGame();

      // Normal position, no check
      loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

      const state = useGameStore.getState();
      expect(state.inCheckSquare).toBeNull();
    });
  });

  describe('game result detection', () => {
    it('should detect checkmate (Fool\'s mate)', () => {
      const { newGame, loadFEN } = useGameStore.getState();
      newGame();

      // Load fool's mate position
      loadFEN('rnbqkbnr/pppp1ppp/8/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');

      const state = useGameStore.getState();
      expect(state.result.status).toBe('checkmate');
      if (state.result.status === 'checkmate') {
        expect(state.result.winner).toBe('b');
      }
    });

    it('should detect game over from FEN', () => {
      const { newGame, loadFEN } = useGameStore.getState();
      newGame();

      // Load stalemate position
      loadFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

      const state = useGameStore.getState();
      expect(state.result.status).toBe('draw');
      if (state.result.status === 'draw') {
        expect(state.result.reason).toBe('stalemate');
      }
    });
  });

  describe('board state', () => {
    it('should update board on move', () => {
      const { newGame, clickSquare } = useGameStore.getState();
      newGame();

      const stateBefore = useGameStore.getState();
      const e2Before = stateBefore.board[12];
      expect(e2Before?.type).toBe('p'); // pawn on e2

      clickSquare(12); // e2
      clickSquare(28); // e4

      const stateAfter = useGameStore.getState();
      const e2After = stateAfter.board[12];
      const e4After = stateAfter.board[28];

      expect(e2After).toBeNull(); // e2 should be empty
      expect(e4After?.type).toBe('p'); // e4 should have the pawn
    });
  });
});
