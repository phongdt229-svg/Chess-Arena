import { create } from 'zustand';
import * as authClient from '../auth/authClient';
import type { AuthUser } from '../auth/authClient';

const TOKEN_KEY = 'chess-arena-token';

type AuthStatus = 'loading' | 'anon' | 'authed';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  error: string | null;
  errorDetail: string | null;
  busy: boolean;
  init: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable: session lasts until reload
  }
}

const errorCode = (err: unknown) => (err instanceof authClient.AuthError ? err.code : 'SERVER_ERROR');
const errorDetail = (err: unknown) => (err instanceof authClient.AuthError ? err.detail ?? null : null);

export const useAuthStore = create<AuthState>((set, get) => {
  const submit = async (
    action: typeof authClient.login,
    username: string,
    password: string,
  ): Promise<boolean> => {
    set({ busy: true, error: null, errorDetail: null });
    try {
      const { token, user } = await action(username, password);
      writeToken(token);
      set({ status: 'authed', user, token, busy: false });
      return true;
    } catch (err) {
      set({ error: errorCode(err), errorDetail: errorDetail(err), busy: false });
      return false;
    }
  };

  return {
    status: 'loading',
    user: null,
    token: null,
    error: null,
    errorDetail: null,
    busy: false,

    init: async () => {
      const token = readToken();
      if (!token) {
        set({ status: 'anon', user: null, token: null });
        return;
      }
      try {
        const { user } = await authClient.me(token);
        set({ status: 'authed', user, token });
      } catch (err) {
        const expired = err instanceof authClient.AuthError && err.status === 401;
        if (expired) writeToken(null);
        set({
          status: 'anon',
          user: null,
          token: null,
          error: expired ? null : errorCode(err),
        });
      }
    },

    login: (username, password) => submit(authClient.login, username, password),
    register: (username, password) => submit(authClient.register, username, password),

    logout: async () => {
      const { token } = get();
      writeToken(null);
      set({ status: 'anon', user: null, token: null, error: null });
      if (token) {
        try {
          await authClient.logout(token);
        } catch {
          // token is already dropped locally; server copy expires on its own
        }
      }
    },

    clearError: () => set({ error: null, errorDetail: null }),
  };
});
