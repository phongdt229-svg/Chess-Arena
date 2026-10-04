import { useState, type ReactNode } from 'react';
import { Link, useLocation } from '../router/router';
import { useAuthStore } from '../store/authStore';
import './site.css';

const NAV = [
  { to: '/rules', label: 'Luật cờ' },
  { to: '/guide', label: 'Hướng dẫn' },
  { to: '/openings', label: 'Khai cuộc' },
  { to: '/puzzles', label: 'Bài tập' },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { status, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const authed = status === 'authed';

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo" onClick={close}>
            ♟ Chess Arena
          </Link>

          <button
            className="site-menu-btn"
            aria-label="Mở menu"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>

          <nav id="site-nav" className={`site-nav ${open ? 'open' : ''}`} aria-label="Điều hướng chính">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={close} aria-current={pathname === item.to ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <span className="site-nav-spacer" />
            {authed ? (
              <>
                <Link to="/profile" onClick={close} className="site-user">
                  {user?.username}
                </Link>
                <Link to="/settings" onClick={close}>
                  Cài đặt
                </Link>
                <Link to="/play" className="site-btn primary" onClick={close}>
                  Vào chơi
                </Link>
                <button
                  className="site-btn ghost"
                  onClick={() => {
                    close();
                    void logout();
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              status !== 'loading' && (
                <>
                  <Link to="/login" onClick={close}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="site-btn primary" onClick={close}>
                    Đăng ký
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>© {new Date().getFullYear()} Chess Arena</span>
          <nav aria-label="Liên kết chân trang">
            <Link to="/rules">Luật cờ</Link>
            <Link to="/guide">Hướng dẫn</Link>
            <Link to="/terms">Điều khoản</Link>
            <Link to="/privacy">Bảo mật</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
