import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));

import { clearSave, readSave, writeSave, type SavedGame } from '../savedGame';
import { NO_CLOCK } from '../../store/clock';
import { useGameStore } from '../../store/gameStore';

const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useGameStore.getState();

const sample: SavedGame = {
  v: 1,
  pgn: '1. e4 e5',
  fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  mode: 'local',
  playerColor: 'w',
  aiLevel: 3,
  orientation: 'w',
  clock: NO_CLOCK,
  savedAt: 1,
};

beforeEach(() => localStorage.clear());

describe('savedGame storage', () => {
  it('round-trips per user and keeps users separate', () => {
    writeSave(1, sample);
    writeSave(2, { ...sample, aiLevel: 5 });
    expect(readSave(1)).toEqual(sample);
    expect(readSave(2)?.aiLevel).toBe(5);
    clearSave(1);
    expect(readSave(1)).toBeNull();
    expect(readSave(2)).not.toBeNull();
  });

  it('ignores corrupt or tampered entries', () => {
    localStorage.setItem('chess-arena-save-1', '{not json');
    expect(readSave(1)).toBeNull();
    localStorage.setItem('chess-arena-save-1', JSON.stringify({ ...sample, aiLevel: 99 }));
    expect(readSave(1)).toBeNull();
    localStorage.setItem('chess-arena-save-1', JSON.stringify({ ...sample, mode: 'online' }));
    expect(readSave(1)).toBeNull();
    localStorage.setItem('chess-arena-save-1', JSON.stringify({ v: 2 }));
    expect(readSave(1)).toBeNull();
  });
});

describe('serialize / restore', () => {
  it('restores moves, clock, colours and the AI settings', () => {
    state().newGame({ mode: 'ai', playerColor: 'b', aiLevel: 4, timeControl: { baseMs: 300_000, incrementMs: 2000 } });
    state().loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    state().newGame({ mode: 'local' });
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    useGameStore.setState({ gameMode: 'local', playerColor: 'w', aiLevel: 4, clock: { ...NO_CLOCK, enabled: true, baseMs: 300_000, incrementMs: 2000, whiteMs: 250_000, blackMs: 280_000 } });

    const save = state().serializeGame()!;
    expect(JSON.parse(JSON.stringify(save))).toEqual(save);

    state().newGame({ mode: 'local' });
    expect(state().history).toHaveLength(0);

    expect(state().restoreGame(save)).toBe(true);
    expect(state().fen).toBe(save.fen);
    expect(state().history.map((m) => m.san)).toEqual(['e4', 'e5']);
    expect(state().clock).toMatchObject({ whiteMs: 250_000, blackMs: 280_000, incrementMs: 2000 });
    expect(state().aiLevel).toBe(4);
    expect(state().lastOptions?.timeControl).toEqual({ baseMs: 300_000, incrementMs: 2000 });
  });

  it('falls back to the FEN when the PGN does not match', () => {
    expect(state().restoreGame({ ...sample, pgn: 'garbage' })).toBe(true);
    expect(state().fen).toBe(sample.fen);
    expect(state().history).toHaveLength(0);
  });

  it('refuses a save whose FEN is invalid', () => {
    state().newGame({ mode: 'local' });
    expect(state().restoreGame({ ...sample, pgn: '', fen: 'nope' })).toBe(false);
    expect(state().history).toHaveLength(0);
  });

  it('resumes the right orientation for a player on black vs AI', () => {
    expect(state().restoreGame({ ...sample, mode: 'ai', playerColor: 'b', orientation: 'b' })).toBe(true);
    expect(state().orientation).toBe('b');
    expect(state().gameMode).toBe('ai');
    expect(state().playerColor).toBe('b');
  });
});
