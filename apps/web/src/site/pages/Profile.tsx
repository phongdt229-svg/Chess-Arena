import { useState } from 'react';
import { Link, navigate } from '../../router/router';
import { useAuthStore } from '../../store/authStore';
import { PUZZLES } from '../data/puzzles';
import { clearSolved, readSolved } from '../puzzleProgress';
import { clearStats, readStats } from '../../persistence/stats';
import { clearSave, readSave } from '../../persistence/savedGame';
import { usePageMeta } from '../usePageMeta';
import './Profile.css';

export default function Profile() {
  usePageMeta('Hồ sơ của tôi');
  const { user, logout } = useAuthStore();
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  if (!user) return null;
  void version;
  const stats = readStats(user.id);
  const solved = readSolved(user.id).filter((id) => PUZZLES.some((p) => p.id === id)).length;
  const save = readSave(user.id);
  const aiGames = stats.ai.wins + stats.ai.losses + stats.ai.draws;
  const winRate = aiGames ? Math.round((stats.ai.wins / aiGames) * 100) : null;

  return (
    <div className="container narrow">
      <h1 className="page-title">Hồ sơ của tôi</h1>

      <section className="card profile-head">
        <div className="profile-avatar" aria-hidden="true">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h2>{user.username}</h2>
          <p>Elo {user.elo}</p>
        </div>
      </section>

      <section className="card profile-block">
        <h2>Thống kê đấu với máy</h2>
        <div className="profile-stats">
          <div><strong>{aiGames}</strong><span>Ván đã chơi</span></div>
          <div><strong>{stats.ai.wins}</strong><span>Thắng</span></div>
          <div><strong>{stats.ai.draws}</strong><span>Hòa</span></div>
          <div><strong>{stats.ai.losses}</strong><span>Thua</span></div>
          <div><strong>{winRate === null ? '—' : `${winRate}%`}</strong><span>Tỷ lệ thắng</span></div>
        </div>
        <p className="profile-muted">Đã chơi {stats.local.played} ván hai người trên một máy. Thống kê chỉ lưu trên trình duyệt này.</p>
        <button
          className="site-btn outline"
          disabled={aiGames + stats.local.played === 0}
          onClick={() => {
            clearStats(user.id);
            refresh();
          }}
        >
          Xoá thống kê
        </button>
      </section>

      <section className="card profile-block">
        <h2>Bài tập</h2>
        <p>
          Đã giải <strong>{solved}</strong>/{PUZZLES.length} bài.
        </p>
        <div className="profile-actions">
          <Link to="/puzzles" className="site-btn outline">
            Luyện tập
          </Link>
          <button
            className="site-btn outline"
            disabled={solved === 0}
            onClick={() => {
              clearSolved(user.id);
              refresh();
            }}
          >
            Làm lại từ đầu
          </button>
        </div>
      </section>

      <section className="card profile-block">
        <h2>Ván đang dở</h2>
        {save ? (
          <>
            <p>
              Bạn có một ván {save.mode === 'ai' ? `đấu với máy (cấp ${save.aiLevel})` : 'hai người'}, lưu lúc {new Date(save.savedAt).toLocaleString()}.
            </p>
            <div className="profile-actions">
              <Link to="/play" className="site-btn primary">
                Tiếp tục chơi
              </Link>
              <button
                className="site-btn outline"
                onClick={() => {
                  clearSave(user.id);
                  refresh();
                }}
              >
                Xoá ván đã lưu
              </button>
            </div>
          </>
        ) : (
          <p className="profile-muted">Chưa có ván nào được lưu.</p>
        )}
      </section>

      <section className="profile-footer">
        <Link to="/settings" className="site-btn outline">
          Cài đặt
        </Link>
        <button
          className="site-btn outline danger"
          onClick={() => {
            navigate('/');
            void logout();
          }}
        >
          Đăng xuất
        </button>
      </section>
    </div>
  );
}
