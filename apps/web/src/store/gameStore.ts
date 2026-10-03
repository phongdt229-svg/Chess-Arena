import { create } from 'zustand';
import { GameEngine } from '@chess-arena/chess-core';
import type { Move, GameResult, Color } from '@chess-arena/chess-core';

interface GameState {
  engine: GameEngine | null;
  selectedSquare: number | null;
  legalMoves: Move[];
  lastMove: Move | null;
  pendingPromotion: { from: number; to: number } | null;
  orientation: Color;
  viewMode: '2d' | '3d';
  gameMode: 'local' | 'ai';
  history: Move[];
  redoStack: Move[];
  result: GameResult;
}

interface GameActions {
  newGame: (options: { mode: 'local' | 'ai'; aiLevel?: number }) => void;
  selectSquare: (sq: number) => void;
  makeMove: (uci: string) => boolean;
  choosePromotion: (promotion: 'q' | 'r' | 'b' | 'n') => void;
  undo: () => void;
  redo: () => void;
  flipBoard: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  loadFEN: (fen: string) => void;
  resign: () => void;
  offerDraw: () => void;
  gameState: GameState;
}

const INITIAL_STATE: GameState = {
  engine: null,
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  pendingPromotion: null,
  orientation: 'w',
  viewMode: '2d',
  gameMode: 'local',
  history: [],
  redoStack: [],
  result: { status: 'ongoing' },
};

export const useGameStore = create<GameActions>((set, get) => ({
  ...INITIAL_STATE,

  newGame: (options) => {
    const engine = GameEngine.create();
    set({
      engine,
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      pendingPromotion: null,
      orientation: 'w',
      gameMode: options.mode,
      history: [],
      redoStack: [],
      result: { status: 'ongoing' },
    });
  },

  selectSquare: (sq) => {
    const { engine, selectedSquare, pendingPromotion } = get();
    if (!engine || pendingPromotion) return;

    if (selectedSquare === sq) {
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    const piece = engine.legalMoves().find((m) => m.from === sq);
    if (piece) {
      const moves = engine.legalMoves(indexToSquare(sq));
      set({ selectedSquare: sq, legalMoves: moves });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  makeMove: (uci: string) => {
    const { engine } = get();
    if (!engine) return false;

    const move = engine.makeMove(uci);
    if (!move) return false;

    const result = engine.getGameResult();
    if (move.promotion) {
      set({
        pendingPromotion: { from: move.from, to: move.to },
        selectedSquare: null,
        legalMoves: [],
      });
      return true;
    }

    set({
      lastMove: move,
      selectedSquare: null,
      legalMoves: [],
      result,
      redoStack: [],
    });
    return true;
  },

  choosePromotion: (promotion) => {
    const { engine, pendingPromotion } = get();
    if (!engine || !pendingPromotion) return;

    engine.undo();
    const uci = `${indexToSquare(pendingPromotion.from)}${indexToSquare(pendingPromotion.to)}${promotion}`;
    const move = engine.makeMove(uci);

    if (move) {
      const result = engine.getGameResult();
      set({
        lastMove: move,
        pendingPromotion: null,
        result,
        redoStack: [],
      });
    }
  },

  undo: () => {
    const { engine } = get();
    if (!engine) return;

    const move = engine.undo();
    if (move) {
      set({
        lastMove: null,
        result: { status: 'ongoing' },
        redoStack: [move, ...get().redoStack],
      });
    }
  },

  redo: () => {
    const { engine, redoStack } = get();
    if (!engine || redoStack.length === 0) return;

    const move = redoStack[0];
    const uci = `${indexToSquare(move.from)}${indexToSquare(move.to)}`;
    engine.makeMove(uci);

    const result = engine.getGameResult();
    set({
      lastMove: move,
      result,
      redoStack: redoStack.slice(1),
    });
  },

  flipBoard: () => {
    const { orientation } = get();
    set({ orientation: orientation === 'w' ? 'b' : 'w' });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  loadFEN: (fen) => {
    const { engine } = get();
    if (!engine) return;

    engine.loadFEN(fen);
    set({
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      result: { status: 'ongoing' },
      redoStack: [],
      history: [],
    });
  },

  resign: () => {
    const { engine } = get();
    if (!engine) return;

    const turn = engine.getCurrentTurn();
    const winner = turn === 'w' ? 'b' : 'w';
    set({ result: { status: 'resign', winner: winner as Color } });
  },

  offerDraw: () => {
    set({ result: { status: 'draw', reason: 'agreement' } });
  },
}));

function indexToSquare(index: number): string {
  const file = String.fromCharCode(97 + (index % 8));
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
}
