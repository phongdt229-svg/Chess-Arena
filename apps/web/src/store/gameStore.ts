import { create } from 'zustand';
import { GameEngine } from '@chess-arena/chess-core';
import type { Move, GameResult, Color, Piece } from '@chess-arena/chess-core';

interface GameState {
  fen: string;
  board: (Piece | null)[];
  selectedSquare: number | null;
  legalMoves: Move[];
  lastMoveFrom: number | null;
  lastMoveTo: number | null;
  inCheckSquare: number | null;
  pendingPromotion: { from: number; to: number } | null;
  history: Move[];
  redoStack: Move[];
  result: GameResult;
  orientation: Color;
  viewMode: '2d' | '3d';
  gameMode: 'local' | 'ai';
}

interface GameActions extends GameState {
  newGame: (options?: { mode?: 'local' | 'ai'; aiLevel?: number }) => void;
  clickSquare: (sq: number) => void;
  tryMove: (from: number, to: number, promotion?: string) => void;
  choosePromotion: (promotion: 'q' | 'r' | 'b' | 'n') => void;
  cancelPromotion: () => void;
  undo: () => void;
  redo: () => void;
  flipBoard: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  loadFEN: (fen: string) => void;
  resign: () => void;
  offerDraw: () => void;
}

let engine: GameEngine | null = null;

const createInitialState = (): GameState => ({
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  board: Array(64).fill(null),
  selectedSquare: null,
  legalMoves: [],
  lastMoveFrom: null,
  lastMoveTo: null,
  inCheckSquare: null,
  pendingPromotion: null,
  history: [],
  redoStack: [],
  result: { status: 'ongoing' },
  orientation: 'w',
  viewMode: '2d',
  gameMode: 'local',
});

const syncState = (state: GameState, eng: GameEngine): Partial<GameState> => {
  const fen = eng.getFEN();
  const board = eng.getBoard();
  const history = (eng.getHistory(true) as Move[]) || [];
  const inCheck = eng.isInCheck();
  const inCheckSq = inCheck ? eng.getKingSquare(eng.getCurrentTurn()) : null;

  return {
    fen,
    board,
    history,
    inCheckSquare: inCheckSq as number | null,
    result: eng.getGameResult(),
  };
};

export const useGameStore = create<GameActions>((set, get) => ({
  ...createInitialState(),

  newGame: (options = {}) => {
    const { mode = 'local' } = options;
    engine = GameEngine.create();
    const state = createInitialState();
    set({
      ...state,
      ...syncState(state, engine),
      gameMode: mode,
    });
  },

  clickSquare: (sq) => {
    const state = get();
    if (!engine || state.pendingPromotion) return;

    const { selectedSquare, legalMoves } = state;

    if (selectedSquare === sq) {
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    const isLegalTarget = legalMoves.some((m) => m.to === sq);
    if (selectedSquare !== null && isLegalTarget) {
      const move = legalMoves.find((m) => m.to === sq);
      if (move && move.promotion) {
        set({ pendingPromotion: { from: selectedSquare, to: sq } });
        return;
      }
      get().tryMove(selectedSquare, sq);
      return;
    }

    const hasLegalMoves = engine.legalMoves(indexToSquare(sq)).length > 0;
    if (hasLegalMoves) {
      const moves = engine.legalMoves(indexToSquare(sq));
      set({ selectedSquare: sq, legalMoves: moves });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  tryMove: (from, to, promotion) => {
    if (!engine) return;

    const uci = promotion ? `${indexToSquare(from)}${indexToSquare(to)}${promotion}` : `${indexToSquare(from)}${indexToSquare(to)}`;
    const move = engine.makeMove(uci);

    if (!move) return;

    set({
      ...syncState(get(), engine),
      lastMoveFrom: from,
      lastMoveTo: to,
      selectedSquare: null,
      legalMoves: [],
      redoStack: [],
    });
  },

  choosePromotion: (promotion) => {
    const state = get();
    if (!engine || !state.pendingPromotion) return;

    engine.undo();
    get().tryMove(state.pendingPromotion.from, state.pendingPromotion.to, promotion);
    set({ pendingPromotion: null });
  },

  cancelPromotion: () => {
    set({ pendingPromotion: null });
  },

  undo: () => {
    if (!engine) return;

    const move = engine.undo();
    if (!move) return;

    const state = get();
    set({
      ...syncState(state, engine),
      lastMoveFrom: null,
      lastMoveTo: null,
      selectedSquare: null,
      legalMoves: [],
      redoStack: [move, ...state.redoStack],
    });
  },

  redo: () => {
    const state = get();
    if (!engine || state.redoStack.length === 0) return;

    const move = state.redoStack[0];
    const uci = `${indexToSquare(move.from)}${indexToSquare(move.to)}${move.promotion || ''}`;
    engine.makeMove(uci);

    set({
      ...syncState(state, engine),
      lastMoveFrom: move.from,
      lastMoveTo: move.to,
      redoStack: state.redoStack.slice(1),
    });
  },

  flipBoard: () => {
    const state = get();
    set({ orientation: state.orientation === 'w' ? 'b' : 'w' });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  loadFEN: (fen) => {
    if (!engine) return;

    engine.loadFEN(fen);
    const state = createInitialState();
    set({
      ...state,
      ...syncState(state, engine),
    });
  },

  resign: () => {
    const state = get();
    if (!engine) return;

    const turn = engine.getCurrentTurn();
    const winner = turn === 'w' ? 'b' : 'w';
    set({ result: { status: 'resign', winner } });
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
