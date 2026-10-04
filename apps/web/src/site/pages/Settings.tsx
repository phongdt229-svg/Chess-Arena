import { TIME_CONTROLS } from '../../store/clock';
import { useSettingsStore } from '../../store/settingsStore';
import { usePageMeta } from '../usePageMeta';
import './Settings.css';

const LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'];

export default function Settings() {
  usePageMeta('Settings', 'Adjust sound, display mode and the defaults used when you start a new game.');
  const s = useSettingsStore();

  return (
    <div className="container narrow">
      <h1 className="page-title">Settings</h1>
      <p className="page-lead">Your choices are saved in this browser and apply to every account you use on it.</p>

      <section className="card settings-card">
        <h2>Chung</h2>
        <label className="settings-row">
          <span>
            <strong>Âm thanh</strong>
            <small>Sounds for moves, captures, check and the end of a game.</small>
          </span>
          <input type="checkbox" checked={s.soundEnabled} onChange={() => s.toggleSound()} aria-label="Enable sound" />
        </label>
        <label className="settings-row">
          <span>
            <strong>Board when you start playing</strong>
            <small>The 3D board needs a more powerful device than the 2D board.</small>
          </span>
          <select value={s.defaultView} onChange={(e) => s.update({ defaultView: e.target.value as '2d' | '3d' })}>
            <option value="2d">2D</option>
            <option value="3d">3D</option>
          </select>
        </label>
      </section>

      <section className="card settings-card">
        <h2>New game defaults</h2>
        <label className="settings-row">
          <span>
            <strong>Mode</strong>
          </span>
          <select value={s.defaultMode} onChange={(e) => s.update({ defaultMode: e.target.value as 'local' | 'ai' })}>
            <option value="local">Local (2 Players)</option>
            <option value="ai">Play vs AI</option>
          </select>
        </label>
        <label className="settings-row">
          <span>
            <strong>Your colour against the computer</strong>
          </span>
          <select value={s.defaultColor} onChange={(e) => s.update({ defaultColor: e.target.value as 'w' | 'b' | 'random' })}>
            <option value="random">Random</option>
            <option value="w">White</option>
            <option value="b">Black</option>
          </select>
        </label>
        <label className="settings-row">
          <span>
            <strong>Computer level</strong>
          </span>
          <select value={s.defaultLevel} onChange={(e) => s.update({ defaultLevel: Number(e.target.value) })}>
            {LEVELS.map((name, i) => (
              <option key={name} value={i + 1}>
                {i + 1} · {name}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-row">
          <span>
            <strong>Clock</strong>
          </span>
          <select value={s.defaultTime} onChange={(e) => s.update({ defaultTime: e.target.value })}>
            {TIME_CONTROLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <button className="site-btn outline" onClick={s.reset}>
        Restore defaults
      </button>
    </div>
  );
}
