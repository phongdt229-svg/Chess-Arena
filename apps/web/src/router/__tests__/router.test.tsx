import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Link, matchRoute, navigate, parseLocation, safeNext, useLocation } from '../router';
import { redirectFor } from '../../App';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

describe('parseLocation', () => {
  it('splits path and query, trims trailing slashes', () => {
    const l = parseLocation('/login/?next=%2Fplay');
    expect(l.pathname).toBe('/login');
    expect(l.search.get('next')).toBe('/play');
    expect(parseLocation('/').pathname).toBe('/');
    expect(parseLocation('').pathname).toBe('/');
  });
});

describe('matchRoute', () => {
  const routes = [
    { path: '/', value: 'home' },
    { path: '/rules', value: 'rules' },
    { path: '*', value: 'nf' },
  ];
  it('matches exactly, falls back to *', () => {
    expect(matchRoute('/', routes)).toBe('home');
    expect(matchRoute('/rules', routes)).toBe('rules');
    expect(matchRoute('/rules/x', routes)).toBe('nf');
    expect(matchRoute('/nope', routes)).toBe('nf');
  });
});

describe('safeNext (open-redirect guard)', () => {
  it('accepts same-site paths only', () => {
    expect(safeNext('/play?pgn=1.+e4')).toBe('/play?pgn=1.+e4');
    expect(safeNext(null)).toBe('/play');
    expect(safeNext('https://evil.example')).toBe('/play');
    expect(safeNext('//evil.example')).toBe('/play');
    expect(safeNext('/\\evil.example')).toBe('/play');
    expect(safeNext('javascript:alert(1)')).toBe('/play');
  });
});

describe('redirectFor (access control)', () => {
  it('sends anonymous visitors of protected pages to login, remembering where they were', () => {
    expect(redirectFor('auth', 'anon', '/play?pgn=x', null)).toBe('/login?next=%2Fplay%3Fpgn%3Dx');
  });
  it('lets logged-in users through and waits while loading', () => {
    expect(redirectFor('auth', 'authed', '/play', null)).toBeNull();
    expect(redirectFor('auth', 'loading', '/play', null)).toBeNull();
  });
  it('bounces logged-in users off guest pages, honouring a safe next', () => {
    expect(redirectFor('guest', 'authed', '/login', '/puzzles')).toBe('/puzzles');
    expect(redirectFor('guest', 'authed', '/login', 'https://evil.example')).toBe('/play');
    expect(redirectFor('guest', 'anon', '/login', null)).toBeNull();
  });
  it('never redirects public pages', () => {
    for (const s of ['loading', 'anon', 'authed'] as const) expect(redirectFor('public', s, '/', null)).toBeNull();
  });
});

describe('navigation', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'));

  function Probe() {
    const { pathname, search } = useLocation();
    return (
      <div>
        <span id="where">{pathname + (search.size ? `?${search}` : '')}</span>
        <Link to="/rules">rules</Link>
      </div>
    );
  }

  const mount = () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const root = createRoot(el);
    act(() => root.render(<Probe />));
    return { el, unmount: () => act(() => root.unmount()) };
  };

  it('navigate updates the URL and subscribers; back button is honoured', () => {
    const { el, unmount } = mount();
    expect(el.querySelector('#where')!.textContent).toBe('/');
    act(() => navigate('/guide?x=1'));
    expect(el.querySelector('#where')!.textContent).toBe('/guide?x=1');
    act(() => {
      window.history.back();
    });
    unmount();
  });

  it('Link navigates on plain click but not on ctrl/meta click', () => {
    const { el, unmount } = mount();
    const a = el.querySelector('a')!;
    act(() => a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true, button: 0 })));
    expect(el.querySelector('#where')!.textContent).toBe('/');
    act(() => a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })));
    expect(el.querySelector('#where')!.textContent).toBe('/rules');
    unmount();
  });
});
