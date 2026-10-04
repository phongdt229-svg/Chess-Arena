import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link, navigate, useLocation } from '../../router/router';
import { usePageMeta } from '../../site/usePageMeta';
import './AuthScreen.css';

type Tab = 'login' | 'register';

const ERROR_TEXT: Record<string, string> = {
  INVALID_CREDENTIALS: 'Wrong username or password.',
  USERNAME_TAKEN: 'That username is already taken.',
  VALIDATION: 'Invalid details.',
  NETWORK: 'Could not reach the server. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

function validate(tab: Tab, username: string, password: string, confirm: string): string | null {
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return 'Username must be 3–20 characters: letters, digits or underscores.';
  }
  if (password.length < 8 || password.length > 72) {
    return 'Password must be 8 to 72 characters.';
  }
  if (tab === 'register' && password !== confirm) {
    return 'Passwords do not match.';
  }
  return null;
}

export default function AuthScreen({ initialTab = 'login' }: { initialTab?: Tab }) {
  const { search } = useLocation();
  usePageMeta(initialTab === 'register' ? 'Sign up' : 'Log in');
  const { login, register, busy, error, clearError } = useAuthStore();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const switchTab = (next: Tab) => {
    setTab(next);
    navigate(`/${next}${search.toString() ? `?${search}` : ''}`, { replace: true });
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const problem = validate(tab, username, password, confirm);
    setLocalError(problem);
    if (problem) return;
    // On success the guest-route gate in App redirects to ?next=, so nothing else to do here
    await (tab === 'login' ? login : register)(username, password);
  };

  const message = localError ?? (error ? ERROR_TEXT[error] ?? ERROR_TEXT.SERVER_ERROR : null);

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-title">
          <Link to="/" className="auth-home">
            ♟ Chess Arena
          </Link>
        </h1>
        <p className="auth-subtitle">Log in to start playing</p>

        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'login'} className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>
            Log in
          </button>
          <button type="button" role="tab" aria-selected={tab === 'register'} className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')}>
            Sign up
          </button>
        </div>

        <label className="auth-field">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
          />
        </label>

        <label className="auth-field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            maxLength={72}
          />
        </label>

        {tab === 'register' && (
          <label className="auth-field">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              maxLength={72}
            />
          </label>
        )}

        {message && (
          <div className="auth-error" role="alert">
            {message}
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
        </button>
        <p className="auth-back">
          <Link to="/">← Back to home</Link>
        </p>
      </form>
    </div>
  );
}
