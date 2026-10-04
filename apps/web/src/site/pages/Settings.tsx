import { TIME_CONTROLS } from '../../store/clock';
import { useSettingsStore } from '../../store/settingsStore';
import { usePageMeta } from '../usePageMeta';
import './Settings.css';

const LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'];

export default function Settings() {
  usePageMeta('Cài đặt', 'Tuỳ chỉnh âm thanh, chế độ hiển thị và các lựa chọn mặc định khi bắt đầu ván mới.');
  const s = useSettingsStore();

  return (
    <div className="container narrow">
      <h1 className="page-title">Cài đặt</h1>
      <p className="page-lead">Các lựa chọn được lưu trên trình duyệt này và áp dụng cho cả khi bạn đổi tài khoản.</p>

      <section className="card settings-card">
        <h2>Chung</h2>
        <label className="settings-row">
          <span>
            <strong>Âm thanh</strong>
            <small>Tiếng đi quân, ăn quân, chiếu và kết thúc ván.</small>
          </span>
          <input type="checkbox" checked={s.soundEnabled} onChange={() => s.toggleSound()} aria-label="Bật âm thanh" />
        </label>
        <label className="settings-row">
          <span>
            <strong>Bàn cờ khi vào chơi</strong>
            <small>Bàn 3D cần máy mạnh hơn bàn 2D.</small>
          </span>
          <select value={s.defaultView} onChange={(e) => s.update({ defaultView: e.target.value as '2d' | '3d' })}>
            <option value="2d">2D</option>
            <option value="3d">3D</option>
          </select>
        </label>
      </section>

      <section className="card settings-card">
        <h2>Ván mới (mặc định)</h2>
        <label className="settings-row">
          <span>
            <strong>Chế độ</strong>
          </span>
          <select value={s.defaultMode} onChange={(e) => s.update({ defaultMode: e.target.value as 'local' | 'ai' })}>
            <option value="local">Local (2 Players)</option>
            <option value="ai">Play vs AI</option>
          </select>
        </label>
        <label className="settings-row">
          <span>
            <strong>Màu quân khi đấu với máy</strong>
          </span>
          <select value={s.defaultColor} onChange={(e) => s.update({ defaultColor: e.target.value as 'w' | 'b' | 'random' })}>
            <option value="random">Ngẫu nhiên</option>
            <option value="w">Trắng</option>
            <option value="b">Đen</option>
          </select>
        </label>
        <label className="settings-row">
          <span>
            <strong>Cấp độ máy</strong>
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
            <strong>Đồng hồ</strong>
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
        Khôi phục mặc định
      </button>
    </div>
  );
}
