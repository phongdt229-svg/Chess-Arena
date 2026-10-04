import type { ReactElement } from 'react';
import AuthScreen from './components/auth/AuthScreen';
import GameApp from './game/GameApp';
import NotFound from './site/pages/NotFound';
import Placeholder from './site/pages/Placeholder';
import Home from './site/pages/Home';
import Rules from './site/pages/Rules';
import Guide from './site/pages/Guide';
import Terms from './site/pages/Terms';
import Privacy from './site/pages/Privacy';
import Openings from './site/pages/Openings';
import Puzzles from './site/pages/Puzzles';
import type { RouteDef } from './router/router';

export type Access = 'public' | 'auth' | 'guest';

export interface AppRoute {
  access: Access;
  layout: boolean; // wrapped in the marketing SiteLayout (the game and auth screens are full-screen)
  element: ReactElement;
}

const page = (access: Access, element: ReactElement, layout = true): AppRoute => ({ access, element, layout });

export const ROUTES: RouteDef<AppRoute>[] = [
  { path: '/', value: page('public', <Home />) },
  { path: '/rules', value: page('public', <Rules />) },
  { path: '/guide', value: page('public', <Guide />) },
  { path: '/openings', value: page('public', <Openings />) },
  { path: '/terms', value: page('public', <Terms />) },
  { path: '/privacy', value: page('public', <Privacy />) },
  { path: '/login', value: page('guest', <AuthScreen initialTab="login" />, false) },
  { path: '/register', value: page('guest', <AuthScreen initialTab="register" />, false) },
  { path: '/play', value: page('auth', <GameApp />, false) },
  { path: '/puzzles', value: page('auth', <Puzzles />) },
  { path: '/profile', value: page('auth', <Placeholder title="Hồ sơ" />) },
  { path: '/settings', value: page('auth', <Placeholder title="Cài đặt" />) },
  { path: '*', value: page('public', <NotFound />) },
];
