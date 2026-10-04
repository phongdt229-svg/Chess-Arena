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
  usePageMeta('My profile');
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
      <h1 className="page-title">My profile</h1>

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
        <h2>Results against the computer</h2>
        <div className="profile-stats">
          <div><strong>{aiGames}</strong><span>Games played</span></div>
          <div><strong>{stats.ai.wins}</strong><span>Wins</span></div>
          <div><strong>{stats.ai.draws}</strong><span>Draws</span></div>
          <div><strong>{stats.ai.losses}</strong><span>Losses</span></div>
          <div><strong>{winRate === null ? '—' : `${winRate}%`}</strong><span>Win rate</span></div>
        </div>
        <p className="profile-muted">You have played {stats.local.played} two-player {stats.local.played === 1 ? 'game' : 'games'} on one device. Statistics are stored in this browser only.</p>
        <button
          className="site-btn outline"
          disabled={aiGames + stats.local.played === 0}
          onClick={() => {
            clearStats(user.id);
            refresh();
          }}
        >
          Clear statistics
        </button>
      </section>

      <section className="card profile-block">
        <h2>Puzzles</h2>
        <p>
          Solved <strong>{solved}</strong> of {PUZZLES.length}.
        </p>
        <div className="profile-actions">
          <Link to="/puzzles" className="site-btn outline">
            Practise
          </Link>
          <button
            className="site-btn outline"
            disabled={solved === 0}
            onClick={() => {
              clearSolved(user.id);
              refresh();
            }}
          >
            Start over
          </button>
        </div>
      </section>

      <section className="card profile-block">
        <h2>Unfinished game</h2>
        {save ? (
          <>
            <p>
              You have a {save.mode === 'ai' ? `game against the computer (level ${save.aiLevel})` : 'two-player game'} saved on {new Date(save.savedAt).toLocaleString()}.
            </p>
            <div className="profile-actions">
              <Link to="/play" className="site-btn primary">
                Resume game
              </Link>
              <button
                className="site-btn outline"
                onClick={() => {
                  clearSave(user.id);
                  refresh();
                }}
              >
                Delete saved game
              </button>
            </div>
          </>
        ) : (
          <p className="profile-muted">No game is saved.</p>
        )}
      </section>

      <section className="profile-footer">
        <Link to="/settings" className="site-btn outline">
          Settings
        </Link>
        <button
          className="site-btn outline danger"
          onClick={() => {
            navigate('/');
            void logout();
          }}
        >
          Log out
        </button>
      </section>
    </div>
  );
}
