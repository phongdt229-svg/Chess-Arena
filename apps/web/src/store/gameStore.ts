import { create } from 'zustand';
import { GameEngine } from '@chess-arena/chess-core';
import type { Move, GameResult, Color, Piece } from '@chess-arena/chess-core';
import * as aiClient from '../ai/aiClient';
import { evaluateFen } from '../ai/engine';
import { NO_CLOCK, makeClock, type ClockState, type TimeControl } from './clock';

export interface NewGameOptions {
  mode?: 'local' | 'ai';
  playerColor?: Color;
  aiLevel?: number;
  timeControl?: TimeControl | null;
}

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
  playerColor: Color;
  aiLevel: number;
  aiThinking: boolean;
  lastOptions: NewGameOptions | null;
  clock: ClockState;
}

interface GameActions extends GameState {
  newGame: (options?: NewGameOptions) => void;
  tickClock: () => void;
  clickSquare: (sq: number) => void;
  tryMove: (from: number, to: number, promotion?: string) => void;
  choosePromotion: (promotion: 'q' | 'r' | 'b' | 'n') => void;
  cancelPromotion: () => void;
  undo: () => void;
  redo: () => void;
  flipBoard: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  loadFEN: (fen: string) => boolean;
  loadPGN: (pgn: string) => boolean;
  getPGN: () => string;
  resign: () => void;
  offerDraw: () => boolean;
  maybeAiMove: () => Promise<void>;
}

let engine: GameEngine | null = null;
let aiRequestId = 0;
let lastTickAt = Date.now();

const cancelAi = () => {
  aiRequestId++;
  aiClient.cancel();
};

const otherColor = (c: Color): Color => (c === 'w' ? 'b' : 'w');

// Increment goes to the side that just moved, from the third ply on (clock starts once both sides moved)
const clockAfterMove = (clock: ClockState, mover: Color, plies: number): ClockState => {
  if (!clock.enabled || clock.incrementMs === 0 || plies <= 2) return clock;
  const key = mover === 'w' ? 'whiteMs' : 'blackMs';
  return { ...clock, [key]: clock[key] + clock.incrementMs };
};

// Replace the running game with an imported one, keeping view preferences; imports are always local games
function adoptImportedGame(
  candidate: GameEngine,
  set: (partial: Partial<GameActions>) => void,
  get: () => GameActions,
) {
  cancelAi();
  engine = candidate;
  const { viewMode, orientation } = get();
  const synced = syncState(createInitialState(), candidate);
  const last = synced.history?.[synced.history.length - 1];
  lastTickAt = Date.now();
  set({
    ...createInitialState(),
    ...synced,
    viewMode,
    orientation,
    lastMoveFrom: last ? last.from : null,
    lastMoveTo: last ? last.to : null,
  });
}

const scheduleAi = (delayMs: number) => {
  setTimeout(() => {
    const st = useGameStore.getState();
    if (st.gameMode === 'ai' && st.result.status === 'ongoing') void st.maybeAiMove();
  }, delayMs);
};

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
  playerColor: 'w',
  aiLevel: 3,
  aiThinking: false,
  lastOptions: null,
  clock: NO_CLOCK,
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
    const { mode = 'local', playerColor = 'w', aiLevel = 3, timeControl = null } = options;
    cancelAi();

    engine = GameEngine.create();
    const state = createInitialState();
    const newState = {
      ...state,
      ...syncState(state, engine),
      gameMode: mode,
      playerColor: playerColor,
      aiLevel: aiLevel,
      orientation: playerColor,
      lastOptions: { mode, playerColor, aiLevel, timeControl },
      clock: makeClock(timeControl),
    };
    lastTickAt = Date.now();
    set(newState);

    if (mode === 'ai' && playerColor === 'b') scheduleAi(500);
  },

  clickSquare: (sq) => {
    const state = get();
    if (!engine || state.pendingPromotion || state.aiThinking) return;

    // In AI mode, only allow moves by the player
    if (state.gameMode === 'ai' && engine.getCurrentTurn() !== state.playerColor) return;

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

    const synced = syncState(get(), engine);
    set({
      ...synced,
      lastMoveFrom: from,
      lastMoveTo: to,
      selectedSquare: null,
      legalMoves: [],
      redoStack: [],
      clock: clockAfterMove(get().clock, otherColor(engine.getCurrentTurn()), synced.history?.length ?? 0),
    });

    scheduleAi(300);
  },

  choosePromotion: (promotion) => {
    const state = get();
    if (!engine || !state.pendingPromotion) return;

    const { from, to } = state.pendingPromotion;
    set({ pendingPromotion: null });
    get().tryMove(from, to, promotion);
  },

  cancelPromotion: () => {
    set({ pendingPromotion: null });
  },

  undo: () => {
    if (!engine) return;
    cancelAi();

    const state = get();
    const undone: Move[] = [];
    let move = engine.undo();
    while (move) {
      undone.push(move);
      if (state.gameMode !== 'ai' || engine.getCurrentTurn() === state.playerColor) break;
      move = engine.undo();
    }
    if (undone.length === 0) return;

    set({
      ...syncState(state, engine),
      lastMoveFrom: null,
      lastMoveTo: null,
      selectedSquare: null,
      legalMoves: [],
      pendingPromotion: null,
      redoStack: [...undone.reverse(), ...state.redoStack],
      aiThinking: false,
    });
    scheduleAi(300);
  },

  redo: () => {
    const state = get();
    if (!engine || state.redoStack.length === 0) return;
    cancelAi();

    let stack = state.redoStack;
    let last = stack[0];
    do {
      last = stack[0];
      engine.makeMove(`${indexToSquare(last.from)}${indexToSquare(last.to)}${last.promotion || ''}`);
      stack = stack.slice(1);
    } while (state.gameMode === 'ai' && stack.length > 0 && engine.getCurrentTurn() !== state.playerColor);

    set({
      ...syncState(state, engine),
      lastMoveFrom: last.from,
      lastMoveTo: last.to,
      selectedSquare: null,
      legalMoves: [],
      redoStack: stack,
      aiThinking: false,
    });
    scheduleAi(300);
  },

  flipBoard: () => {
    const state = get();
    set({ orientation: state.orientation === 'w' ? 'b' : 'w' });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  loadFEN: (fen) => {
    const candidate = GameEngine.create();
    try {
      candidate.loadFEN(fen.trim());
    } catch {
      return false;
    }
    adoptImportedGame(candidate, set, get);
    return true;
  },

  loadPGN: (pgn) => {
    const candidate = GameEngine.create();
    if (!pgn.trim() || !candidate.loadPGN(pgn)) return false;
    adoptImportedGame(candidate, set, get);
    return true;
  },

  getPGN: () => (engine ? engine.toPGN() : ''),

  resign: () => {
    const state = get();
    if (!engine || state.result.status !== 'ongoing') return;
    cancelAi();

    const loser = state.gameMode === 'ai' ? state.playerColor : engine.getCurrentTurn();
    set({
      result: { status: 'resign', winner: loser === 'w' ? 'b' : 'w' },
      aiThinking: false,
      pendingPromotion: null,
      selectedSquare: null,
      legalMoves: [],
    });
  },

  offerDraw: () => {
    const state = get();
    if (!engine || state.result.status !== 'ongoing') return false;

    if (state.gameMode === 'ai') {
      const white = evaluateFen(engine.getFEN());
      const aiScore = state.playerColor === 'w' ? -white : white;
      if (aiScore > 50) return false; // the engine declines when it stands better than half a pawn
    }

    cancelAi();
    set({
      result: { status: 'draw', reason: 'agreement' },
      aiThinking: false,
      pendingPromotion: null,
      selectedSquare: null,
      legalMoves: [],
    });
    return true;
  },

  tickClock: () => {
    const now = Date.now();
    const elapsed = now - lastTickAt;
    lastTickAt = now;

    const state = get();
    const { clock } = state;
    if (!engine || !clock.enabled || state.result.status !== 'ongoing' || state.history.length < 2) return;

    const turn = engine.getCurrentTurn();
    const key = turn === 'w' ? 'whiteMs' : 'blackMs';
    const remaining = clock[key] - elapsed;
    if (remaining > 0) {
      set({ clock: { ...clock, [key]: remaining } });
      return;
    }

    cancelAi();
    set({
      clock: { ...clock, [key]: 0 },
      result: { status: 'timeout', winner: otherColor(turn) },
      aiThinking: false,
      pendingPromotion: null,
      selectedSquare: null,
      legalMoves: [],
    });
  },

  maybeAiMove: async () => {
    const state = get();
    if (!engine || state.gameMode !== 'ai' || state.result.status !== 'ongoing' || state.aiThinking) return;

    const turn = engine.getCurrentTurn();
    if (turn === state.playerColor) return; // It's player's turn

    set({ aiThinking: true });
    const currentRequestId = ++aiRequestId;

    try {
      const uci = await aiClient.requestMove(engine.getFEN(), state.aiLevel);
      if (!uci || currentRequestId !== aiRequestId) return; // Request was cancelled or superseded

      if (!engine) return;
      const move = engine.makeMove(uci);
      if (!move) {
        set({ aiThinking: false });
        return;
      }

      const synced = syncState(state, engine);
      set({
        ...synced,
        lastMoveFrom: move.from,
        lastMoveTo: move.to,
        selectedSquare: null,
        legalMoves: [],
        redoStack: [],
        aiThinking: false,
        clock: clockAfterMove(get().clock, otherColor(engine.getCurrentTurn()), synced.history?.length ?? 0),
      });
    } catch (err) {
      console.error('AI move failed:', err);
      set({ aiThinking: false });
    }
  },
}));

function indexToSquare(index: number): string {
  const file = String.fromCharCode(97 + (index % 8));
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
}
