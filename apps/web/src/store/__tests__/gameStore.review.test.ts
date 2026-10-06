import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));

import * as aiClient from '../../ai/aiClient';
import { useGameStore } from '../gameStore';

const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useGameStore.getState();

function playOpening() {
  state().newGame({ mode: 'local' });
  state().tryMove(sq('e2'), sq('e4'));
  state().tryMove(sq('e7'), sq('e5'));
  state().tryMove(sq('g1'), sq('f3'));
}

beforeEach(playOpening);

describe('review mode', () => {
  it('shows a past position without touching the live game', () => {
    const liveFen = state().fen;
    state().reviewTo(1);
    expect(state().reviewPly).toBe(1);
    expect(state().reviewView!.board[sq('e4')]).toMatchObject({ type: 'p', color: 'w' });
    expect(state().reviewView!.board[sq('e5')]).toBeNull();
    expect(state().reviewView).toMatchObject({ lastMoveFrom: sq('e2'), lastMoveTo: sq('e4') });
    expect(state().fen).toBe(liveFen);
    expect(state().history).toHaveLength(3);
    expect(state().board[sq('f3')]).toMatchObject({ type: 'n' });
  });

  it('ply 0 is the start position', () => {
    state().reviewTo(0);
    expect(state().reviewView!.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(state().reviewView!.lastMoveFrom).toBeNull();
  });

  it('returns to the live position for null or the latest ply', () => {
    state().reviewTo(1);
    state().reviewTo(null);
    expect(state().reviewPly).toBeNull();
    expect(state().reviewView).toBeNull();
    state().reviewTo(2);
    state().reviewTo(3);
    expect(state().reviewPly).toBeNull();
  });

  it('blocks moves and selection while reviewing', () => {
    state().reviewTo(1);
    state().clickSquare(sq('d7')); // Black is to move
    expect(state().selectedSquare).toBeNull();
    state().tryMove(sq('d7'), sq('d5'));
    expect(state().history).toHaveLength(3);
    state().reviewTo(null);
    state().clickSquare(sq('d7'));
    expect(state().selectedSquare).toBe(sq('d7'));
  });

  it('clears an existing selection when review starts', () => {
    state().clickSquare(sq('d7'));
    expect(state().selectedSquare).toBe(sq('d7'));
    state().reviewTo(1);
    expect(state().selectedSquare).toBeNull();
    expect(state().legalMoves).toEqual([]);
  });

  it('undo, redo, new game and imports leave review mode', () => {
    state().reviewTo(1);
    state().undo();
    expect(state().reviewPly).toBeNull();

    state().reviewTo(1);
    state().redo();
    expect(state().reviewPly).toBeNull();

    state().reviewTo(1);
    state().newGame({ mode: 'local' });
    expect(state().reviewPly).toBeNull();

    playOpening();
    state().reviewTo(1);
    expect(state().loadPGN('1. d4 d5')).toBe(true);
    expect(state().reviewPly).toBeNull();
  });

  it('ignores plies that do not exist', () => {
    state().reviewTo(-1);
    expect(state().reviewPly).toBeNull();
    state().reviewTo(99);
    expect(state().reviewPly).toBeNull();
  });
});

describe('review during an AI game', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps showing the reviewed position when the computer moves', async () => {
    vi.mocked(aiClient.requestMove).mockResolvedValue('e7e5');
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().tryMove(sq('e2'), sq('e4'));
    state().reviewTo(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(state().history).toHaveLength(2);
    expect(state().reviewPly).toBe(0);
    expect(state().reviewView!.fen).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  });
});
