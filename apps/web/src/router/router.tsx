import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

const NAV_EVENT = 'app:navigate';

function snapshot(): string {
  return window.location.pathname + window.location.search;
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (to === snapshot()) return;
  if (options.replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.dispatchEvent(new Event(NAV_EVENT));
  window.scrollTo(0, 0);
}

export interface Location {
  pathname: string;
  search: URLSearchParams;
}

export function parseLocation(url: string): Location {
  const [path, query = ''] = url.split('?');
  const pathname = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return { pathname: pathname || '/', search: new URLSearchParams(query) };
}

export function useLocation(): Location {
  const url = useSyncExternalStore(subscribe, snapshot, () => '/');
  return parseLocation(url);
}

export interface RouteDef<T> {
  path: string;
  value: T;
}

// Exact-path matching; the first match wins and `*` matches anything
export function matchRoute<T>(pathname: string, routes: RouteDef<T>[]): T | null {
  for (const r of routes) {
    if (r.path === '*' || r.path === pathname) return r.value;
  }
  return null;
}

// Only same-site relative paths may be used as a post-login destination
export function safeNext(next: string | null | undefined, fallback = '/play'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  return next;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
