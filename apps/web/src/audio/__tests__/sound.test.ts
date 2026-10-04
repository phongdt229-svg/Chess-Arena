import { describe, it, expect } from 'vitest';
import { soundForTransition } from '../sound';

const ongoing = { status: 'ongoing' };
const h = (...sans: string[]) => sans.map((san) => ({ san }));

describe('soundForTransition', () => {
  it('plain move', () => {
    expect(soundForTransition({ history: h(), result: ongoing }, { history: h('e4'), result: ongoing })).toBe('move');
  });

  it('capture, via san or captured flag', () => {
    expect(soundForTransition({ history: h('e4', 'd5'), result: ongoing }, { history: h('e4', 'd5', 'exd5'), result: ongoing })).toBe('capture');
    const next = { history: [{ san: 'Nf3', captured: 'p' }], result: ongoing };
    expect(soundForTransition({ history: [], result: ongoing }, next)).toBe('capture');
  });

  it('check beats capture', () => {
    expect(soundForTransition({ history: h('e4'), result: ongoing }, { history: h('e4', 'Qxf7+'), result: ongoing })).toBe('check');
  });

  it('game end beats everything else, including mate', () => {
    expect(
      soundForTransition({ history: h('f3'), result: ongoing }, { history: h('f3', 'Qh4#'), result: { status: 'checkmate' } }),
    ).toBe('end');
    expect(soundForTransition({ history: h('f3'), result: ongoing }, { history: h('f3'), result: { status: 'resign' } })).toBe('end');
  });

  it('is silent for undo, new game, bulk loads and unrelated updates', () => {
    expect(soundForTransition({ history: h('e4', 'e5'), result: ongoing }, { history: h('e4'), result: ongoing })).toBeNull();
    expect(soundForTransition({ history: h('e4', 'e5'), result: ongoing }, { history: h(), result: ongoing })).toBeNull();
    expect(soundForTransition({ history: h(), result: ongoing }, { history: h('a', 'b', 'c', 'd'), result: ongoing })).toBeNull();
    expect(soundForTransition({ history: h('e4'), result: ongoing }, { history: h('e4'), result: ongoing })).toBeNull();
  });

  it('two plies in one update (redo with AI) still make one sound', () => {
    expect(soundForTransition({ history: h(), result: ongoing }, { history: h('e4', 'e5'), result: ongoing })).toBe('move');
  });
});
