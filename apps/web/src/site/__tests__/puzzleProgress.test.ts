import { describe, it, expect, beforeEach } from 'vitest';
import { clearSolved, markSolved, readSolved } from '../puzzleProgress';

beforeEach(() => localStorage.clear());

describe('puzzleProgress', () => {
  it('records each puzzle once, per user', () => {
    expect(readSolved(1)).toEqual([]);
    markSolved(1, 'a');
    markSolved(1, 'a');
    markSolved(1, 'b');
    markSolved(2, 'c');
    expect(readSolved(1)).toEqual(['a', 'b']);
    expect(readSolved(2)).toEqual(['c']);
    clearSolved(1);
    expect(readSolved(1)).toEqual([]);
    expect(readSolved(2)).toEqual(['c']);
  });

  it('survives corrupt storage', () => {
    localStorage.setItem('chess-arena-puzzles-1', '{oops');
    expect(readSolved(1)).toEqual([]);
    localStorage.setItem('chess-arena-puzzles-1', JSON.stringify({ not: 'an array' }));
    expect(readSolved(1)).toEqual([]);
    localStorage.setItem('chess-arena-puzzles-1', JSON.stringify(['ok', 5, null]));
    expect(readSolved(1)).toEqual(['ok']);
  });
});
