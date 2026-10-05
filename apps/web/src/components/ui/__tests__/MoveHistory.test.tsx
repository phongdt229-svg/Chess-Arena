import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import MoveHistory from '../MoveHistory';
import ReviewBadge from '../ReviewBadge';
import { useGameStore } from '../../../store/gameStore';

vi.mock('../../../ai/aiClient', () => ({ requestMove: vi.fn(), cancel: vi.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function mount() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() =>
    root.render(
      <>
        <MoveHistory />
        <ReviewBadge />
      </>,
    ),
  );
  return { el, unmount: () => act(() => root.unmount()) };
}

const click = (el: Element) => act(() => (el as HTMLElement).click());
const label = (el: HTMLElement, name: string) => el.querySelector(`[aria-label="${name}"]`) as HTMLButtonElement;

beforeEach(() => {
  const s = useGameStore.getState();
  s.newGame({ mode: 'local' });
  s.tryMove(12, 28); // e4
  s.tryMove(52, 36); // e5
  s.tryMove(6, 21); // Nf3
});

describe('MoveHistory', () => {
  it('lists moves in numbered rows', () => {
    const { el, unmount } = mount();
    expect(el.querySelectorAll('.move-row')).toHaveLength(2);
    expect([...el.querySelectorAll('.move-btn')].map((b) => b.textContent)).toEqual(['e4', 'e5', 'Nf3']);
    expect(el.querySelector('.move-number')!.textContent).toBe('1.');
    unmount();
  });

  it('clicking a move reviews that position, marks it, and shows the badge', () => {
    const { el, unmount } = mount();
    click(el.querySelectorAll('.move-btn')[0]);
    expect(useGameStore.getState().reviewPly).toBe(1);
    expect(el.querySelector('[aria-current="true"]')!.textContent).toBe('e4');
    expect(el.querySelector('.review-badge')!.textContent).toContain('move 1 of 3');
    click(el.querySelector('.review-badge button')!);
    expect(useGameStore.getState().reviewPly).toBeNull();
    expect(el.querySelector('.review-badge')).toBeNull();
    unmount();
  });

  it('clicking the newest move stays on the live game', () => {
    const { el, unmount } = mount();
    click(el.querySelectorAll('.move-btn')[2]);
    expect(useGameStore.getState().reviewPly).toBeNull();
    expect(el.querySelector('[aria-current="true"]')!.textContent).toBe('Nf3');
    unmount();
  });

  it('navigation buttons step through the game and are disabled at the ends', () => {
    const { el, unmount } = mount();
    expect(label(el, 'Next move').disabled).toBe(true);
    expect(label(el, 'Latest position').disabled).toBe(true);
    click(label(el, 'Previous move'));
    expect(useGameStore.getState().reviewPly).toBe(2);
    click(label(el, 'Previous move'));
    click(label(el, 'Previous move'));
    expect(useGameStore.getState().reviewPly).toBe(0);
    expect(label(el, 'Previous move').disabled).toBe(true);
    expect(label(el, 'First position').disabled).toBe(true);
    click(label(el, 'Next move'));
    expect(useGameStore.getState().reviewPly).toBe(1);
    click(label(el, 'Latest position'));
    expect(useGameStore.getState().reviewPly).toBeNull();
    click(label(el, 'First position'));
    expect(useGameStore.getState().reviewPly).toBe(0);
    unmount();
  });

  it('stepping forward past the last move returns to the live game', () => {
    const { el, unmount } = mount();
    click(label(el, 'Previous move'));
    click(label(el, 'Next move'));
    expect(useGameStore.getState().reviewPly).toBeNull();
    unmount();
  });
});
