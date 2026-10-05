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

import { slideOffset } from '../Board2D';

const sqEl = (container: HTMLElement, name: string) => container.querySelector(`[data-square="${name}"]`) as HTMLElement;

const fire = (el: Element, type: string, init: Record<string, unknown> = {}) =>
  act(() => {
    // jsdom has no PointerEvent; React listens to the event name, so a MouseEvent of that type is enough
    const event = type.startsWith('key')
      ? new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init })
      : new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init });
    el.dispatchEvent(event);
  });

describe('Board2D labels and accessibility', () => {
  beforeEach(() => useGameStore.getState().newGame());

  it('shows a–h along the bottom and 1–8 down the left edge, flipped for Black', () => {
    const { container, unmount } = render();
    const files = [...container.querySelectorAll('.sq-label.file')].map((n) => n.textContent).join('');
    const ranks = [...container.querySelectorAll('.sq-label.rank')].map((n) => n.textContent).join('');
    expect(files).toBe('abcdefgh');
    expect(ranks).toBe('87654321');
    act(() => useGameStore.getState().flipBoard());
    expect([...container.querySelectorAll('.sq-label.file')].map((n) => n.textContent).join('')).toBe('hgfedcba');
    expect([...container.querySelectorAll('.sq-label.rank')].map((n) => n.textContent).join('')).toBe('12345678');
    unmount();
  });

  it('describes every square for screen readers', () => {
    const { container, unmount } = render();
    expect(sqEl(container, 'e2').getAttribute('aria-label')).toBe('e2, white pawn');
    expect(sqEl(container, 'e8').getAttribute('aria-label')).toBe('e8, black king');
    expect(sqEl(container, 'e4').getAttribute('aria-label')).toBe('e4, empty');
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="row"]')).toHaveLength(8);
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(64);
    unmount();
  });

  it('has exactly one tab stop (roving tabindex)', () => {
    const { container, unmount } = render();
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    unmount();
  });

  it('plays e2-e4 from the keyboard: arrows move focus, Enter selects and moves', () => {
    const { container, unmount } = render();
    const press = (el: Element, key: string) => fire(el, 'keydown', { key });
    const e2 = sqEl(container, 'e2');
    act(() => e2.focus());
    press(e2, 'Enter');
    expect(useGameStore.getState().selectedSquare).toBe(12);
    press(e2, 'ArrowUp');
    expect(document.activeElement).toBe(sqEl(container, 'e3'));
    press(document.activeElement!, 'ArrowUp');
    expect(document.activeElement).toBe(sqEl(container, 'e4'));
    press(document.activeElement!, ' ');
    expect(useGameStore.getState().history.map((m) => m.san)).toEqual(['e4']);
    unmount();
  });

  it('arrow keys follow the displayed orientation and stop at the edge', () => {
    const { container, unmount } = render();
    act(() => useGameStore.getState().flipBoard());
    const a1 = sqEl(container, 'a1');
    act(() => a1.focus());
    // with Black at the bottom, a1 is at the top-right: ArrowUp stays put, ArrowRight stays put, ArrowLeft goes to b1
    fire(a1, 'keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(a1);
    fire(a1, 'keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(sqEl(container, 'b1'));
    unmount();
  });

  it('announces the last move to assistive technology', () => {
    const { container, unmount } = render();
    act(() => useGameStore.getState().tryMove(12, 28));
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Last move e4.');
    unmount();
  });
});

describe('Board2D pointer drag', () => {
  beforeEach(() => useGameStore.getState().newGame());

  const dragPiece = (container: HTMLElement, from: string, to: string | null, distance = 40) => {
    const piece = sqEl(container, from).querySelector('.piece')!;
    const target = to ? sqEl(container, to) : null;
    (document as any).elementFromPoint = () => target;
    fire(piece, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
    fire(piece, 'pointermove', { clientX: 100 + distance, clientY: 100 - distance, pointerId: 1 });
    fire(piece, 'pointerup', { clientX: 100 + distance, clientY: 100 - distance, pointerId: 1 });
  };

  it('drags a pawn from e2 to e4', () => {
    const { container, unmount } = render();
    dragPiece(container, 'e2', 'e4');
    expect(useGameStore.getState().history.map((m) => m.san)).toEqual(['e4']);
    unmount();
  });

  it('a small wiggle is a click, not a drag', () => {
    const { container, unmount } = render();
    dragPiece(container, 'e2', 'e4', 2);
    expect(useGameStore.getState().history).toHaveLength(0);
    unmount();
  });

  it('dropping on the same square or outside the board keeps the piece selected and moves nothing', () => {
    const { container, unmount } = render();
    dragPiece(container, 'e2', 'e2');
    expect(useGameStore.getState().history).toHaveLength(0);
    expect(useGameStore.getState().selectedSquare).toBe(12);
    dragPiece(container, 'e2', null);
    expect(useGameStore.getState().history).toHaveLength(0);
    unmount();
  });

  it('an illegal drop does not move; a piece that cannot move is not picked up', () => {
    const { container, unmount } = render();
    dragPiece(container, 'e2', 'e5');
    expect(useGameStore.getState().history).toHaveLength(0);
    dragPiece(container, 'a1', 'a3'); // the rook is blocked by its own pawn
    expect(useGameStore.getState().history).toHaveLength(0);
    unmount();
  });

  it('can drag a capture', () => {
    const { container, unmount } = render();
    act(() => {
      useGameStore.getState().tryMove(12, 28); // e4
      useGameStore.getState().tryMove(51, 35); // d5
    });
    dragPiece(container, 'e4', 'd5');
    expect(useGameStore.getState().history.map((m) => m.san)).toEqual(['e4', 'd5', 'exd5']);
    unmount();
  });
});

describe('slideOffset', () => {
  const sq = (n: string) => n.charCodeAt(0) - 97 + (parseInt(n[1], 10) - 1) * 8;
  it('starts at the origin square, in screen units, for both orientations', () => {
    expect(slideOffset(sq('e2'), sq('e4'), 'w')).toEqual({ dx: 0, dy: 2 }); // starts two squares below the destination
    expect(slideOffset(sq('g1'), sq('f3'), 'w')).toEqual({ dx: 1, dy: 2 });
    expect(slideOffset(sq('e2'), sq('e4'), 'b')).toEqual({ dx: 0, dy: -2 }); // board flipped: starts above
    expect(slideOffset(sq('g1'), sq('f3'), 'b')).toEqual({ dx: -1, dy: -2 });
  });
});
