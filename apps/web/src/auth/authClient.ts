export interface AuthUser {
  id: number;
  username: string;
  elo: number;
}

export class AuthError extends Error {
  constructor(public code: string, public status: number, public detail?: string) {
    super(code);
  }
}

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api';

async function call<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new AuthError('NETWORK', 0);
  }

  let body: { ok?: boolean; data?: T; error?: string; detail?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }
  if (!body) throw new AuthError('API_UNAVAILABLE', res.status, `HTTP ${res.status}`);
  if (!res.ok || !body.ok) {
    throw new AuthError(body.error ?? 'SERVER_ERROR', res.status, (body as { detail?: string }).detail);
  }
  return body.data as T;
}

export function register(username: string, password: string) {
  return call<{ token: string; user: AuthUser }>('/auth/register.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return call<{ token: string; user: AuthUser }>('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function me(token: string) {
  return call<{ user: AuthUser }>('/auth/me.php', { method: 'GET' }, token);
}

export function logout(token: string) {
  return call<Record<string, never>>('/auth/logout.php', { method: 'POST', body: '{}' }, token);
}
