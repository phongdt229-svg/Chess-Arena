import { useEffect, type ReactElement } from 'react';
import SiteLayout from './site/SiteLayout';
import { ROUTES, type Access } from './routes';
import { matchRoute, navigate, safeNext, useLocation } from './router/router';
import { useAuthStore } from './store/authStore';

// Decides what a visitor may see for a route; redirects happen in an effect so render stays pure
export function redirectFor(access: Access, status: 'loading' | 'anon' | 'authed', path: string, next: string | null): string | null {
  if (access === 'auth' && status === 'anon') return `/login?next=${encodeURIComponent(path)}`;
  if (access === 'guest' && status === 'authed') return safeNext(next);
  return null;
}

function Gate({ access, children }: { access: Access; children: ReactElement }) {
  const { pathname, search } = useLocation();
  const status = useAuthStore((s) => s.status);
  const target = redirectFor(access, status, pathname + (search.size ? `?${search}` : ''), search.get('next'));

  useEffect(() => {
    if (target) navigate(target, { replace: true });
  }, [target]);

  if (target) return null;
  if (status === 'loading' && access !== 'public') return <div className="auth-loading">Loading…</div>;
  return children;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const { pathname } = useLocation();

  useEffect(() => {
    void init();
  }, [init]);

  const route = matchRoute(pathname, ROUTES)!;
  const content = <Gate access={route.access}>{route.element}</Gate>;
  return route.layout ? <SiteLayout>{content}</SiteLayout> : content;
}
