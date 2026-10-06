import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../auth/authClient', () => {
  class AuthError extends Error {
    constructor(public code: string, public status: number, public detail?: string) {
      super(code);
    }
  }
  return {
    AuthError,
    register: vi.fn(),
    login: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  };
});

import * as authClient from '../../auth/authClient';
import { useAuthStore } from '../authStore';

const mocked = vi.mocked(authClient);
const user = { id: 1, username: 'alice', elo: 1200 };
const TOKEN_KEY = 'chess-arena-token';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useAuthStore.setState({ status: 'loading', user: null, token: null, error: null, busy: false });
});

describe('authStore', () => {
  it('init without a token goes anonymous', async () => {
    await useAuthStore.getState().init();
    expect(useAuthStore.getState().status).toBe('anon');
    expect(mocked.me).not.toHaveBeenCalled();
  });

  it('init with a valid token becomes authed', async () => {
    localStorage.setItem(TOKEN_KEY, 't');
    mocked.me.mockResolvedValue({ user });
    await useAuthStore.getState().init();
    expect(useAuthStore.getState().status).toBe('authed');
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('init with an expired token (401) clears it and goes anonymous', async () => {
    localStorage.setItem(TOKEN_KEY, 't');
    mocked.me.mockRejectedValue(new authClient.AuthError('UNAUTHORIZED', 401));
    await useAuthStore.getState().init();
    expect(useAuthStore.getState().status).toBe('anon');
    expect(useAuthStore.getState().error).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('init keeps the token when the network fails', async () => {
    localStorage.setItem(TOKEN_KEY, 't');
    mocked.me.mockRejectedValue(new authClient.AuthError('NETWORK', 0));
    await useAuthStore.getState().init();
    expect(useAuthStore.getState().status).toBe('anon');
    expect(useAuthStore.getState().error).toBe('NETWORK');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('t');
  });

  it('login stores the token and authenticates', async () => {
    mocked.login.mockResolvedValue({ token: 'abc', user });
    const ok = await useAuthStore.getState().login('alice', 'password1');
    expect(ok).toBe(true);
    expect(useAuthStore.getState().status).toBe('authed');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc');
  });

  it('login failure exposes the error code', async () => {
    mocked.login.mockRejectedValue(new authClient.AuthError('INVALID_CREDENTIALS', 401));
    const ok = await useAuthStore.getState().login('alice', 'wrong-pass');
    expect(ok).toBe(false);
    expect(useAuthStore.getState().status).not.toBe('authed');
    expect(useAuthStore.getState().error).toBe('INVALID_CREDENTIALS');
    expect(useAuthStore.getState().busy).toBe(false);
  });

  it('register authenticates and reports a taken username', async () => {
    mocked.register.mockResolvedValueOnce({ token: 'abc', user });
    expect(await useAuthStore.getState().register('alice', 'password1')).toBe(true);

    mocked.register.mockRejectedValueOnce(new authClient.AuthError('USERNAME_TAKEN', 409));
    expect(await useAuthStore.getState().register('alice', 'password1')).toBe(false);
    expect(useAuthStore.getState().error).toBe('USERNAME_TAKEN');
  });

  it('logout clears local state even if the server call fails', async () => {
    mocked.login.mockResolvedValue({ token: 'abc', user });
    await useAuthStore.getState().login('alice', 'password1');
    mocked.logout.mockRejectedValue(new authClient.AuthError('NETWORK', 0));

    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().status).toBe('anon');
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(mocked.logout).toHaveBeenCalledWith('abc');
  });

  it('exposes the server detail so setup problems are visible, and clears it on the next attempt', async () => {
    mocked.register.mockRejectedValueOnce(new authClient.AuthError('DB_UNAVAILABLE', 500, 'PDOException: Access denied'));
    await useAuthStore.getState().register('alice', 'password1');
    expect(useAuthStore.getState().error).toBe('DB_UNAVAILABLE');
    expect(useAuthStore.getState().errorDetail).toBe('PDOException: Access denied');

    mocked.register.mockRejectedValueOnce(new authClient.AuthError('API_UNAVAILABLE', 403, 'HTTP 403'));
    await useAuthStore.getState().register('alice', 'password1');
    expect(useAuthStore.getState().errorDetail).toBe('HTTP 403');

    mocked.register.mockResolvedValueOnce({ token: 'abc', user });
    await useAuthStore.getState().register('alice', 'password1');
    expect(useAuthStore.getState().errorDetail).toBeNull();
  });
});
