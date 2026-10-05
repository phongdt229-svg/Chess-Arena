import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

vi.mock('../../../ai/aiClient', () => ({ requestAnalysis: vi.fn(), cancelAnalysis: vi.fn(), requestMove: vi.fn(), cancel: vi.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import EvalBar, { evalLabel, whiteShare } from '../EvalBar';
import AnalysisPanel from '../AnalysisPanel';
import { useAnalysisStore } from '../../../store/analysisStore';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';

function mount(node: React.ReactElement) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() => root.render(node));
  return { el, unmount: () => act(() => root.unmount()) };
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
  useGameStore.getState().newGame({ mode: 'local' });
  useAnalysisStore.setState({ evaluation: null, hint: null, hintPending: false });
});

describe('whiteShare / evalLabel', () => {
  it('is 50% when equal, grows with the score and is clamped', () => {
    expect(whiteShare(0, null)).toBeCloseTo(50, 5);
    expect(whiteShare(200, null)).toBeGreaterThan(60);
    expect(whiteShare(-200, null)).toBeLessThan(40);
    expect(whiteShare(100000, null)).toBe(97);
    expect(whiteShare(-100000, null)).toBe(3);
  });

  it('mate fills the bar for the side that mates', () => {
    expect(whiteShare(30000, 2)).toBe(100);
    expect(whiteShare(-30000, -2)).toBe(0);
    expect(whiteShare(30000, 0)).toBe(100);
    expect(whiteShare(-30000, 0)).toBe(0);
  });

  it('formats pawns and mates', () => {
    expect(evalLabel(135, null)).toBe('+1.4');
    expect(evalLabel(-250, null)).toBe('-2.5');
    expect(evalLabel(0, null)).toBe('0.0');
    expect(evalLabel(30000, 3)).toBe('M3');
    expect(evalLabel(-30000, -1)).toBe('M1');
    expect(evalLabel(-30000, 0)).toBe('Mate');
  });
});

describe('EvalBar', () => {
  it('renders nothing unless the setting is on', () => {
    const { el, unmount } = mount(<EvalBar />);
    expect(el.querySelector('.eval-bar')).toBeNull();
    unmount();
  });

  it('shows the score, its height and an accessible description', () => {
    useSettingsStore.getState().update({ showEval: true });
    useAnalysisStore.setState({ evaluation: { fen: 'x', score: 300, mate: null, depth: 3 } });
    const { el, unmount } = mount(<EvalBar />);
    expect(el.querySelector('.eval-label')!.textContent).toBe('+3.0');
    expect(parseFloat((el.querySelector('.eval-white') as HTMLElement).style.height)).toBeGreaterThan(60);
    expect(el.querySelector('.eval-bar')!.getAttribute('aria-label')).toBe('Evaluation +3.0, White is better');
    unmount();
  });

  it('describes equal positions, Black advantages and the loading state', () => {
    useSettingsStore.getState().update({ showEval: true });
    const a = mount(<EvalBar />);
    expect(a.el.querySelector('.eval-bar')!.getAttribute('aria-label')).toBe('Evaluation loading');
    a.unmount();

    useAnalysisStore.setState({ evaluation: { fen: 'x', score: -450, mate: null, depth: 3 } });
    const b = mount(<EvalBar />);
    expect(b.el.querySelector('.eval-bar')!.getAttribute('aria-label')).toBe('Evaluation -4.5, Black is better');
    b.unmount();

    useAnalysisStore.setState({ evaluation: { fen: 'x', score: 0, mate: null, depth: 3 } });
    const c = mount(<EvalBar />);
    expect(c.el.querySelector('.eval-bar')!.getAttribute('aria-label')).toBe('Evaluation 0.0, equal');
    c.unmount();
  });

  it('is drawn flipped when Black is at the bottom', () => {
    useSettingsStore.getState().update({ showEval: true });
    useGameStore.getState().flipBoard();
    const { el, unmount } = mount(<EvalBar />);
    expect(el.querySelector('.eval-bar')!.className).toContain('flipped');
    unmount();
  });
});

describe('AnalysisPanel', () => {
  const find = (el: HTMLElement, text: string) => [...el.querySelectorAll('button')].find((b) => b.textContent!.includes(text)) as HTMLButtonElement;

  it('Hint is enabled on your turn and disabled while reviewing, after the game or when the computer is to move', () => {
    const { el, unmount } = mount(<AnalysisPanel />);
    expect(find(el, 'Hint').disabled).toBe(false);

    act(() => useGameStore.getState().tryMove(12, 28));
    act(() => useGameStore.getState().reviewTo(0));
    expect(find(el, 'Hint').disabled).toBe(true);
    act(() => useGameStore.getState().reviewTo(null));
    expect(find(el, 'Hint').disabled).toBe(false);

    act(() => useGameStore.getState().resign());
    expect(find(el, 'Hint').disabled).toBe(true);

    act(() => useGameStore.getState().newGame({ mode: 'ai', playerColor: 'b' })); // the computer (White) moves first
    expect(find(el, 'Hint').disabled).toBe(true);
    unmount();
  });

  it('shows the suggested move and toggles the evaluation setting', () => {
    useAnalysisStore.setState({ hint: { fen: 'x', from: 6, to: 21, san: 'Nf3' } });
    const { el, unmount } = mount(<AnalysisPanel />);
    expect(el.querySelector('.hint-line')!.textContent).toContain('Nf3');
    expect(find(el, 'Evaluation: Off')).toBeTruthy();
    act(() => find(el, 'Evaluation: Off').click());
    expect(useSettingsStore.getState().showEval).toBe(true);
    expect(find(el, 'Evaluation: On').getAttribute('aria-pressed')).toBe('true');
    unmount();
  });
});
