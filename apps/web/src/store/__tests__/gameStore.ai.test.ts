import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Chess } from 'chess.js';

vi.mock('../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));

import * as aiClient from '../../ai/aiClient';
import { useGameStore } from '../gameStore';

const requestMove = vi.mocked(aiClient.requestMove);
const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useGameStore.getState();
const settle = (ms = 1000) => vi.advanceTimersByTimeAsync(ms);

function firstLegalMove(fen: string) {
  const m = new Chess(fen).moves({ verbose: true })[0];
  return `${m.from}${m.to}${m.promotion ?? ''}`;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  requestMove.mockImplementation(async (fen) => firstLegalMove(fen));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AI game flow', () => {
  it('answers the player move with an AI move', async () => {
    state().newGame({ mode: 'ai', playerColor: 'w', aiLevel: 3 });
    state().tryMove(sq('e2'), sq('e4'));
    await settle();
    expect(state().history).toHaveLength(2);
    expect(state().aiThinking).toBe(false);
    expect(requestMove).toHaveBeenCalledTimes(1);
  });

  it('AI (white) moves first when the player takes black, and the board is flipped', async () => {
    state().newGame({ mode: 'ai', playerColor: 'b' });
    expect(state().orientation).toBe('b');
    await settle();
    expect(state().history).toHaveLength(1);
    expect(state().fen.split(' ')[1]).toBe('b');
  });

  it('blocks clicks while the AI is thinking', async () => {
    let release!: (uci: string) => void;
    requestMove.mockImplementation(() => new Promise<string>((r) => (release = r)));
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().tryMove(sq('e2'), sq('e4'));
    await settle(400);
    expect(state().aiThinking).toBe(true);

    state().clickSquare(sq('d7'));
    expect(state().selectedSquare).toBeNull();
    release('e7e5');
    await settle(10);
    expect(state().aiThinking).toBe(false);
  });

  it('ignores a stale AI answer after a new game starts', async () => {
    let release!: (uci: string) => void;
    requestMove.mockImplementation(() => new Promise<string>((r) => (release = r)));
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().tryMove(sq('e2'), sq('e4'));
    await settle(400);

    requestMove.mockImplementation(async (fen) => firstLegalMove(fen));
    state().newGame({ mode: 'local' });
    release('e7e5');
    await settle(10);
    expect(state().history).toHaveLength(0);
    expect(state().fen.split(' ')[0]).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  });

  it('undo rewinds to the player turn (2 plies) and redo replays both', async () => {
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().tryMove(sq('e2'), sq('e4'));
    await settle();
    expect(state().history).toHaveLength(2);

    state().undo();
    expect(state().history).toHaveLength(0);
    expect(state().redoStack).toHaveLength(2);
    expect(state().fen.split(' ')[1]).toBe('w');

    state().redo();
    expect(state().history).toHaveLength(2);
    expect(state().redoStack).toHaveLength(0);
    expect(state().fen.split(' ')[1]).toBe('w');
  });

  it('resigning while the AI is to move makes the human the loser', async () => {
    let release!: (uci: string) => void;
    requestMove.mockImplementation(() => new Promise<string>((r) => (release = r)));
    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().tryMove(sq('e2'), sq('e4'));
    await settle(400);

    state().resign();
    expect(state().result).toEqual({ status: 'resign', winner: 'b' });
    release('e7e5');
    await settle(10);
    expect(state().history).toHaveLength(1); // late AI move is discarded
  });

  it('AI accepts a draw in an equal position but declines when it is clearly better', () => {
    state().newGame({ mode: 'ai', playerColor: 'w' });
    expect(state().offerDraw()).toBe(true);
    expect(state().result).toEqual({ status: 'draw', reason: 'agreement' });

    state().newGame({ mode: 'ai', playerColor: 'w' });
    state().loadFEN('4k3/8/8/8/8/8/3q4/4K3 w - - 0 1');
    useGameStore.setState({ gameMode: 'ai', playerColor: 'w' });
    expect(state().offerDraw()).toBe(false);
    expect(state().result.status).toBe('ongoing');
  });
});

describe('Promotion', () => {
  beforeEach(() => {
    state().newGame({ mode: 'local' });
    state().loadFEN('8/P6k/8/8/8/8/8/K7 w - - 0 1');
    state().tryMove(sq('a1'), sq('b1'));
    state().tryMove(sq('h7'), sq('g7'));
  });

  it('asks which piece, then promotes without undoing the previous move', () => {
    state().clickSquare(sq('a7'));
    state().clickSquare(sq('a8'));
    expect(state().pendingPromotion).toEqual({ from: sq('a7'), to: sq('a8') });
    expect(state().history).toHaveLength(2);

    state().choosePromotion('q');
    expect(state().pendingPromotion).toBeNull();
    expect(state().history).toHaveLength(3);
    expect(state().board[sq('a8')]).toMatchObject({ type: 'q', color: 'w' });
    expect(state().board[sq('b1')]).toMatchObject({ type: 'k', color: 'w' });
  });

  it('under-promotion to a knight works', () => {
    state().clickSquare(sq('a7'));
    state().clickSquare(sq('a8'));
    state().choosePromotion('n');
    expect(state().board[sq('a8')]).toMatchObject({ type: 'n' });
  });

  it('cancelling leaves the position untouched', () => {
    state().clickSquare(sq('a7'));
    state().clickSquare(sq('a8'));
    state().cancelPromotion();
    expect(state().pendingPromotion).toBeNull();
    expect(state().history).toHaveLength(2);
    expect(state().board[sq('a7')]).toMatchObject({ type: 'p' });
  });
});

describe('Finished games are frozen', () => {
  it('no moves after resign or timeout, and the result is not overwritten', () => {
    state().newGame({ mode: 'local' });
    state().tryMove(sq('e2'), sq('e4'));
    state().resign();
    state().tryMove(sq('e7'), sq('e5'));
    state().clickSquare(sq('d7'));
    expect(state().history).toHaveLength(1);
    expect(state().selectedSquare).toBeNull();
    expect(state().result.status).toBe('resign');
  });
});
