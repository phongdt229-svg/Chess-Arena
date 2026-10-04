import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));

import { useGameStore } from '../gameStore';

const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useGameStore.getState();
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

beforeEach(() => state().newGame({ mode: 'local' }));

describe('FEN import', () => {
  it('loads a valid FEN and returns true', () => {
    expect(state().loadFEN('8/P6k/8/8/8/8/8/K7 w - - 0 1')).toBe(true);
    expect(state().board[sq('a7')]).toMatchObject({ type: 'p', color: 'w' });
    expect(state().history).toHaveLength(0);
  });

  it('rejects an invalid FEN and leaves the game untouched', () => {
    state().tryMove(sq('e2'), sq('e4'));
    const before = state().fen;
    expect(state().loadFEN('not a fen')).toBe(false);
    expect(state().loadFEN('')).toBe(false);
    expect(state().fen).toBe(before);
    expect(state().history).toHaveLength(1);
  });

  it('keeps the view mode and board orientation', () => {
    state().setViewMode('3d');
    state().flipBoard();
    expect(state().loadFEN(START)).toBe(true);
    expect(state().viewMode).toBe('3d');
    expect(state().orientation).toBe('b');
  });

  it('turns an AI game into a local one', () => {
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().loadFEN(START);
    expect(state().gameMode).toBe('local');
    expect(state().aiThinking).toBe(false);
  });
});

describe('PGN import / export', () => {
  const play = () => {
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    state().tryMove(sq('g1'), sq('f3'));
  };

  it('exports the moves played', () => {
    play();
    expect(state().getPGN()).toContain('1. e4 e5 2. Nf3');
  });

  it('round-trips a game through PGN', () => {
    play();
    const pgn = state().getPGN();
    const fen = state().fen;

    state().newGame({ mode: 'local' });
    expect(state().loadPGN(pgn)).toBe(true);
    expect(state().fen).toBe(fen);
    expect(state().history.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3']);
    expect(state().lastMoveFrom).toBe(sq('g1'));
    expect(state().lastMoveTo).toBe(sq('f3'));
    expect(state().redoStack).toHaveLength(0);
  });

  it('rejects garbage and illegal moves without touching the current game', () => {
    play();
    const fen = state().fen;
    expect(state().loadPGN('')).toBe(false);
    expect(state().loadPGN('hello world')).toBe(false);
    expect(state().loadPGN('1. e5 e4')).toBe(false);
    expect(state().fen).toBe(fen);
    expect(state().history).toHaveLength(3);
  });

  it('a finished game imported from PGN reports its result', () => {
    expect(state().loadPGN('1. f3 e5 2. g4 Qh4#')).toBe(true);
    expect(state().result).toEqual({ status: 'checkmate', winner: 'b' });
  });
});
