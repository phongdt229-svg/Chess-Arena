import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));

import { useGameStore } from '../gameStore';
import { formatClock, makeClock, NO_CLOCK } from '../clock';

const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useGameStore.getState();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('clock helpers', () => {
  it('formats minutes, seconds and tenths', () => {
    expect(formatClock(300_000)).toBe('5:00');
    expect(formatClock(61_000)).toBe('1:01');
    expect(formatClock(9_950)).toBe('10.0');
    expect(formatClock(9_400)).toBe('9.4');
    expect(formatClock(-5)).toBe('0.0');
  });

  it('makeClock(null) is disabled', () => {
    expect(makeClock(null)).toEqual(NO_CLOCK);
    expect(makeClock({ baseMs: 1000, incrementMs: 0 })).toMatchObject({ enabled: true, whiteMs: 1000, blackMs: 1000 });
  });
});

describe('game clock', () => {
  it('does not tick for games without a clock', () => {
    state().newGame({ mode: 'local' });
    vi.advanceTimersByTime(5000);
    state().tickClock();
    expect(state().clock.enabled).toBe(false);
  });

  it('does not run until both sides have moved', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 60_000, incrementMs: 0 } });
    vi.advanceTimersByTime(5000);
    state().tickClock();
    expect(state().clock.whiteMs).toBe(60_000);

    state().tryMove(sq('e2'), sq('e4'));
    vi.advanceTimersByTime(5000);
    state().tickClock();
    expect(state().clock).toMatchObject({ whiteMs: 60_000, blackMs: 60_000 });
  });

  it('counts down the side to move after two plies', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 60_000, incrementMs: 0 } });
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    vi.advanceTimersByTime(3000);
    state().tickClock();
    expect(state().clock.whiteMs).toBe(57_000);
    expect(state().clock.blackMs).toBe(60_000);
  });

  it('adds the increment to the side that moved (from ply 3)', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 60_000, incrementMs: 2000 } });
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    expect(state().clock).toMatchObject({ whiteMs: 60_000, blackMs: 60_000 });
    state().tryMove(sq('g1'), sq('f3'));
    expect(state().clock.whiteMs).toBe(62_000);
  });

  it('flags the side that runs out of time', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 1000, incrementMs: 0 } });
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    vi.advanceTimersByTime(1500);
    state().tickClock();
    expect(state().result).toEqual({ status: 'timeout', winner: 'b' });
    expect(state().clock.whiteMs).toBe(0);
  });

  it('stops after the game ends', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 60_000, incrementMs: 0 } });
    state().tryMove(sq('e2'), sq('e4'));
    state().tryMove(sq('e7'), sq('e5'));
    state().resign();
    vi.advanceTimersByTime(5000);
    state().tickClock();
    expect(state().clock.whiteMs).toBe(60_000);
  });

  it('keeps the time control for Play Again', () => {
    state().newGame({ mode: 'local', timeControl: { baseMs: 180_000, incrementMs: 2000 } });
    expect(state().lastOptions?.timeControl).toEqual({ baseMs: 180_000, incrementMs: 2000 });
  });
});
