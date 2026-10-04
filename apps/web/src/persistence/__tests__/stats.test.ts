import { describe, it, expect, beforeEach } from 'vitest';
import { clearStats, EMPTY_STATS, outcomeForTransition, readStats, recordGame } from '../stats';

beforeEach(() => localStorage.clear());

const snap = (status: string, plies: number, extra: Record<string, unknown> = {}) => ({
  history: new Array(plies).fill(0),
  result: { status, ...(extra.winner ? { winner: extra.winner as string } : {}) },
  gameMode: (extra.mode as 'ai' | 'local') ?? 'ai',
  playerColor: (extra.color as 'w' | 'b') ?? 'w',
});

describe('stats storage', () => {
  it('counts games per user and clears them', () => {
    expect(readStats(1)).toEqual(EMPTY_STATS);
    recordGame(1, 'ai', 'win');
    recordGame(1, 'ai', 'loss');
    recordGame(1, 'ai', 'draw');
    recordGame(1, 'local', 'draw');
    recordGame(2, 'ai', 'win');
    expect(readStats(1)).toEqual({ ai: { wins: 1, losses: 1, draws: 1 }, local: { played: 1 } });
    expect(readStats(2).ai.wins).toBe(1);
    clearStats(1);
    expect(readStats(1)).toEqual(EMPTY_STATS);
  });

  it('ignores corrupt or negative values', () => {
    localStorage.setItem('chess-arena-stats-1', '{bad');
    expect(readStats(1)).toEqual(EMPTY_STATS);
    localStorage.setItem('chess-arena-stats-1', JSON.stringify({ ai: { wins: -3, losses: 'x', draws: 2 } }));
    expect(readStats(1)).toEqual({ ai: { wins: 0, losses: 0, draws: 2 }, local: { played: 0 } });
  });
});

describe('outcomeForTransition', () => {
  it('win/loss from the human side, either colour', () => {
    expect(outcomeForTransition(snap('ongoing', 8), snap('checkmate', 9, { winner: 'w', color: 'w' }))).toEqual({ mode: 'ai', outcome: 'win' });
    expect(outcomeForTransition(snap('ongoing', 8), snap('checkmate', 9, { winner: 'b', color: 'w' }))).toEqual({ mode: 'ai', outcome: 'loss' });
    expect(outcomeForTransition(snap('ongoing', 8), snap('checkmate', 9, { winner: 'b', color: 'b' }))).toEqual({ mode: 'ai', outcome: 'win' });
  });

  it('resign, timeout and draws are counted, with no change in history length', () => {
    expect(outcomeForTransition(snap('ongoing', 6), snap('resign', 6, { winner: 'b', color: 'w' }))).toEqual({ mode: 'ai', outcome: 'loss' });
    expect(outcomeForTransition(snap('ongoing', 6), snap('timeout', 6, { winner: 'w', color: 'w' }))).toEqual({ mode: 'ai', outcome: 'win' });
    expect(outcomeForTransition(snap('ongoing', 6), snap('draw', 6))).toEqual({ mode: 'ai', outcome: 'draw' });
  });

  it('local games only count as played', () => {
    expect(outcomeForTransition(snap('ongoing', 6, { mode: 'local' }), snap('checkmate', 7, { mode: 'local', winner: 'w' }))).toEqual({ mode: 'local', outcome: 'draw' });
  });

  it('does not count imports that arrive finished, empty games, or non-transitions', () => {
    expect(outcomeForTransition(snap('ongoing', 0), snap('checkmate', 7, { winner: 'b' }))).toBeNull();
    expect(outcomeForTransition(snap('ongoing', 0), snap('resign', 0, { winner: 'b' }))).toBeNull();
    expect(outcomeForTransition(snap('checkmate', 7), snap('checkmate', 7))).toBeNull();
    expect(outcomeForTransition(snap('ongoing', 3), snap('ongoing', 4))).toBeNull();
  });
});
