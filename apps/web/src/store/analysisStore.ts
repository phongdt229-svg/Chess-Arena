import { create } from 'zustand';
import { Chess } from 'chess.js';
import * as aiClient from '../ai/aiClient';
import type { Analysis } from '../ai/engine';

export interface Evaluation {
  fen: string;
  score: number; // centipawns, White's point of view
  mate: number | null;
  depth: number;
}

export interface Hint {
  fen: string;
  from: number;
  to: number;
  san: string;
}

interface AnalysisState {
  evaluation: Evaluation | null;
  hint: Hint | null;
  hintPending: boolean;
  evaluate: (fen: string) => Promise<void>;
  requestHint: (fen: string) => Promise<void>;
  clearHint: () => void;
  clearEvaluation: () => void;
}

const index = (sq: string) => sq.charCodeAt(0) - 97 + (parseInt(sq[1], 10) - 1) * 8;

let evalToken = 0;
let hintToken = 0;

function toHint(fen: string, analysis: Analysis): Hint | null {
  if (!analysis.move) return null;
  const from = analysis.move.slice(0, 2);
  const to = analysis.move.slice(2, 4);
  try {
    const san = new Chess(fen).move({ from, to, promotion: analysis.move[4] }).san;
    return { fen, from: index(from), to: index(to), san };
  } catch {
    return null;
  }
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  evaluation: null,
  hint: null,
  hintPending: false,

  evaluate: async (fen) => {
    const token = ++evalToken;
    // A running hint search shares the worker, so only restart it when nothing else needs it
    if (!get().hintPending) aiClient.cancelAnalysis();
    try {
      const a = await aiClient.requestAnalysis(fen, 4, 900);
      if (token !== evalToken) return; // a newer position was requested meanwhile
      set({ evaluation: { fen, score: a.score, mate: a.mate, depth: a.depth } });
    } catch {
      // the bar keeps its last value; analysis is best-effort
    }
  },

  requestHint: async (fen) => {
    const token = ++hintToken;
    set({ hintPending: true, hint: null });
    try {
      const a = await aiClient.requestAnalysis(fen, 5, 2000);
      if (token !== hintToken) return;
      set({ hint: toHint(fen, a), hintPending: false });
    } catch {
      if (token === hintToken) set({ hintPending: false });
    }
  },

  clearHint: () => {
    hintToken++;
    if (get().hint || get().hintPending) set({ hint: null, hintPending: false });
  },

  clearEvaluation: () => {
    evalToken++;
    if (!get().hintPending) aiClient.cancelAnalysis();
    set({ evaluation: null });
  },
}));
