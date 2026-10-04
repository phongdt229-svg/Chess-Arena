import type { ReactElement } from 'react';
import AuthScreen from './components/auth/AuthScreen';
import GameApp from './game/GameApp';
import NotFound from './site/pages/NotFound';
import Placeholder from './site/pages/Placeholder';
import Home from './site/pages/Home';
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
  { path: '/rules', value: page('public', <Placeholder title="Luật cờ" />) },
  { path: '/guide', value: page('public', <Placeholder title="Hướng dẫn" />) },
  { path: '/openings', value: page('public', <Placeholder title="Khai cuộc" />) },
  { path: '/terms', value: page('public', <Placeholder title="Điều khoản" />) },
  { path: '/privacy', value: page('public', <Placeholder title="Bảo mật" />) },
  { path: '/login', value: page('guest', <AuthScreen initialTab="login" />, false) },
  { path: '/register', value: page('guest', <AuthScreen initialTab="register" />, false) },
  { path: '/play', value: page('auth', <GameApp />, false) },
  { path: '/puzzles', value: page('auth', <Placeholder title="Bài tập" />) },
  { path: '/profile', value: page('auth', <Placeholder title="Hồ sơ" />) },
  { path: '/settings', value: page('auth', <Placeholder title="Cài đặt" />) },
  { path: '*', value: page('public', <NotFound />) },
];
