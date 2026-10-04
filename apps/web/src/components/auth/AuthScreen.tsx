import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link, navigate, useLocation } from '../../router/router';
import './AuthScreen.css';

type Tab = 'login' | 'register';

const ERROR_TEXT: Record<string, string> = {
  INVALID_CREDENTIALS: 'Sai tên đăng nhập hoặc mật khẩu.',
  USERNAME_TAKEN: 'Tên đăng nhập đã được sử dụng.',
  VALIDATION: 'Thông tin không hợp lệ.',
  NETWORK: 'Không kết nối được máy chủ. Thử lại sau.',
  SERVER_ERROR: 'Lỗi máy chủ. Thử lại sau.',
};

function validate(tab: Tab, username: string, password: string, confirm: string): string | null {
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return 'Tên đăng nhập 3–20 ký tự: chữ, số hoặc dấu gạch dưới.';
  }
  if (password.length < 8 || password.length > 72) {
    return 'Mật khẩu phải từ 8 đến 72 ký tự.';
  }
  if (tab === 'register' && password !== confirm) {
    return 'Mật khẩu nhập lại không khớp.';
  }
  return null;
}

export default function AuthScreen({ initialTab = 'login' }: { initialTab?: Tab }) {
  const { search } = useLocation();
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
        <p className="auth-subtitle">Đăng nhập để bắt đầu chơi</p>

        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'login'} className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>
            Đăng nhập
          </button>
          <button type="button" role="tab" aria-selected={tab === 'register'} className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')}>
            Đăng ký
          </button>
        </div>

        <label className="auth-field">
          Tên đăng nhập
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
          Mật khẩu
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
            Nhập lại mật khẩu
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
          {busy ? 'Đang xử lý…' : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
        <p className="auth-back">
          <Link to="/">← Về trang chủ</Link>
        </p>
      </form>
    </div>
  );
}
