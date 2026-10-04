import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Board2D from '../Board2D';
import { useGameStore } from '../../../store/gameStore';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function render() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Board2D />));
  return { container, unmount: () => act(() => root.unmount()) };
}

const clickSquareEl = (container: HTMLElement, sq: number, target: 'square' | 'piece') => {
  const el = container.querySelectorAll('.square')[
    // grid is rendered rank 8 -> 1 for white: row = 7 - rank
    (7 - Math.floor(sq / 8)) * 8 + (sq % 8)
  ] as HTMLElement;
  const node = target === 'piece' ? (el.querySelector('.piece') as HTMLElement) : el;
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
};

describe('Board2D clicks', () => {
  beforeEach(() => useGameStore.getState().newGame());

  it('selects a piece when the piece itself is clicked', () => {
    const { container, unmount } = render();
    clickSquareEl(container, 12, 'piece'); // e2 pawn
    expect(useGameStore.getState().selectedSquare).toBe(12);
    unmount();
  });

  it('plays e2-e4 by clicking the pawn then the target square', () => {
    const { container, unmount } = render();
    clickSquareEl(container, 12, 'piece');
    clickSquareEl(container, 28, 'square');
    expect(useGameStore.getState().history).toHaveLength(1);
    unmount();
  });

  it('captures by clicking the enemy piece on a legal target', () => {
    const { container, unmount } = render();
    for (const [from, to, target] of [
      [12, 28, 'square'], // e4
      [51, 35, 'square'], // d5
    ] as const) {
      clickSquareEl(container, from, 'piece');
      clickSquareEl(container, to, target);
    }
    clickSquareEl(container, 28, 'piece'); // select e4 pawn
    clickSquareEl(container, 35, 'piece'); // click d5 pawn (capture)
    expect(useGameStore.getState().history).toHaveLength(3);
    unmount();
  });
});
