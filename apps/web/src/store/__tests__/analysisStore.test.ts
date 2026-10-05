import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../ai/aiClient', () => ({
  requestAnalysis: vi.fn(),
  cancelAnalysis: vi.fn(),
  requestMove: vi.fn(),
  cancel: vi.fn(),
}));

import * as aiClient from '../../ai/aiClient';
import { useAnalysisStore } from '../analysisStore';

const requestAnalysis = vi.mocked(aiClient.requestAnalysis);
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const sq = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;
const state = () => useAnalysisStore.getState();

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

beforeEach(() => {
  vi.clearAllMocks();
  state().clearHint();
  state().clearEvaluation();
});

describe('evaluation', () => {
  it('stores the score for the analysed position', async () => {
    requestAnalysis.mockResolvedValue({ move: 'e2e4', score: 35, mate: null, depth: 3 });
    await state().evaluate(START);
    expect(state().evaluation).toEqual({ fen: START, score: 35, mate: null, depth: 3 });
    expect(requestAnalysis).toHaveBeenCalledWith(START, 4, 900);
  });

  it('ignores an answer that arrives after a newer request', async () => {
    const slow = deferred<any>();
    requestAnalysis.mockReturnValueOnce(slow.promise);
    requestAnalysis.mockResolvedValueOnce({ move: 'a', score: 111, mate: null, depth: 2 });
    const first = state().evaluate('fen-one');
    await state().evaluate('fen-two');
    slow.resolve({ move: 'b', score: -999, mate: null, depth: 2 });
    await first;
    expect(state().evaluation).toMatchObject({ fen: 'fen-two', score: 111 });
  });

  it('keeps the previous value when analysis fails', async () => {
    requestAnalysis.mockResolvedValueOnce({ move: 'e2e4', score: 20, mate: null, depth: 2 });
    await state().evaluate(START);
    requestAnalysis.mockRejectedValueOnce(new Error('worker died'));
    await state().evaluate('another');
    expect(state().evaluation!.score).toBe(20);
  });

  it('clearEvaluation drops the value and stops the worker', async () => {
    requestAnalysis.mockResolvedValue({ move: 'e2e4', score: 20, mate: null, depth: 2 });
    await state().evaluate(START);
    state().clearEvaluation();
    expect(state().evaluation).toBeNull();
    expect(aiClient.cancelAnalysis).toHaveBeenCalled();
  });
});

describe('hint', () => {
  it('turns the best move into squares and SAN', async () => {
    requestAnalysis.mockResolvedValue({ move: 'g1f3', score: 30, mate: null, depth: 4 });
    await state().requestHint(START);
    expect(state().hint).toEqual({ fen: START, from: sq('g1'), to: sq('f3'), san: 'Nf3' });
    expect(state().hintPending).toBe(false);
    expect(requestAnalysis).toHaveBeenCalledWith(START, 5, 2000);
  });

  it('shows a pending state, and clearing it makes a late answer harmless', async () => {
    const slow = deferred<any>();
    requestAnalysis.mockReturnValueOnce(slow.promise);
    const pending = state().requestHint(START);
    expect(state().hintPending).toBe(true);
    state().clearHint();
    expect(state().hintPending).toBe(false);
    slow.resolve({ move: 'e2e4', score: 0, mate: null, depth: 4 });
    await pending;
    expect(state().hint).toBeNull();
  });

  it('gives no hint for a finished game or an unusable answer', async () => {
    requestAnalysis.mockResolvedValueOnce({ move: '', score: 0, mate: null, depth: 0 });
    await state().requestHint(START);
    expect(state().hint).toBeNull();
    requestAnalysis.mockResolvedValueOnce({ move: 'e2e5', score: 0, mate: null, depth: 1 }); // illegal for this position
    await state().requestHint(START);
    expect(state().hint).toBeNull();
    expect(state().hintPending).toBe(false);
  });

  it('includes the promotion piece in the SAN', async () => {
    requestAnalysis.mockResolvedValue({ move: 'a7a8q', score: 900, mate: null, depth: 3 });
    await state().requestHint('8/P6k/8/8/8/8/8/K7 w - - 0 1');
    expect(state().hint!.san).toBe('a8=Q');
  });

  it('a failing worker clears the pending flag', async () => {
    requestAnalysis.mockRejectedValueOnce(new Error('boom'));
    await state().requestHint(START);
    expect(state().hintPending).toBe(false);
    expect(state().hint).toBeNull();
  });
});
