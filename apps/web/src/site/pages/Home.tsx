import { Link } from '../../router/router';
import { useAuthStore } from '../../store/authStore';
import StaticBoard from '../StaticBoard';
import { usePageMeta } from '../usePageMeta';
import './Home.css';

const FEATURES = [
  { icon: '🎲', title: 'Bàn cờ 2D và 3D', text: 'Chuyển tức thì giữa bàn 2D gọn gàng và bàn 3D xoay được, ván cờ đang chơi không bị mất.' },
  { icon: '🤖', title: 'Chơi với máy', text: 'Sáu cấp độ từ người mới đến khó, máy tính chạy ngay trên trình duyệt của bạn, không cần chờ máy chủ.' },
  { icon: '⏱️', title: 'Đồng hồ thi đấu', text: 'Các mức 1, 3, 5, 10, 15 phút, có cộng thêm giây. Hết giờ là thua như cờ thật.' },
  { icon: '📋', title: 'Nhập / xuất FEN, PGN', text: 'Dán thế cờ hay ván đấu có sẵn để phân tích, hoặc tải ván của bạn về dưới dạng PGN.' },
  { icon: '💾', title: 'Lưu và chơi tiếp', text: 'Ván dang dở được tự lưu theo tài khoản, lần sau mở web là chơi tiếp được ngay.' },
  { icon: '📱', title: 'Dùng được trên điện thoại', text: 'Giao diện tự co giãn theo màn hình, thao tác chạm để chọn và đi quân.' },
];

const STEPS = [
  { n: 1, title: 'Tạo tài khoản', text: 'Chỉ cần tên đăng nhập và mật khẩu, không cần email.' },
  { n: 2, title: 'Chọn cách chơi', text: 'Hai người trên một máy hoặc đấu với máy, chọn màu quân và đồng hồ.' },
  { n: 3, title: 'Bắt đầu đi quân', text: 'Bấm chọn quân rồi bấm ô đến, hoặc kéo thả. Ô hợp lệ được tô sáng.' },
];

const LEARN = [
  { to: '/rules', title: 'Luật cờ vua', text: 'Cách đi từng quân, nhập thành, bắt tốt qua đường, phong cấp và các cách kết thúc ván.' },
  { to: '/openings', title: 'Khai cuộc', text: 'Mười khai cuộc phổ biến, xem từng nước đi và ý tưởng chính của mỗi bên.' },
  { to: '/puzzles', title: 'Bài tập cờ thế', text: 'Luyện tìm nước chiếu hết trong một hoặc hai nước. Theo dõi số bài đã giải.' },
];

export default function Home() {
  const authed = useAuthStore((s) => s.status === 'authed');
  usePageMeta(
    'Chess Arena',
    'Chơi cờ vua trực tuyến miễn phí với bàn cờ 2D và 3D, đấu với máy sáu cấp độ, đồng hồ thi đấu, lưu ván và học khai cuộc.',
  );

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-text">
            <h1>Chơi cờ vua ngay trên trình duyệt</h1>
            <p>
              Bàn cờ 2D và 3D, đấu với máy sáu cấp độ hoặc cùng bạn bè trên một máy. Có đồng hồ, lưu ván và kho kiến thức để
              học luật, khai cuộc và giải bài tập.
            </p>
            <div className="home-cta">
              {authed ? (
                <Link to="/play" className="site-btn primary large">
                  Vào chơi
                </Link>
              ) : (
                <>
                  <Link to="/register" className="site-btn primary large">
                    Chơi ngay, miễn phí
                  </Link>
                  <Link to="/login" className="site-btn outline large">
                    Tôi đã có tài khoản
                  </Link>
                </>
              )}
            </div>
            <p className="home-note">Không cần cài đặt. Chạy trên máy tính, máy tính bảng và điện thoại.</p>
          </div>
          <div className="home-hero-board">
            <StaticBoard
              fen="r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
              highlights={['f1', 'c4', 'f8', 'c5']}
              label="Thế cờ Khai cuộc Ý sau bốn nước"
            />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="home-h2">Mọi thứ bạn cần để chơi cờ</h2>
        <div className="home-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="card home-feature">
              <div className="home-icon" aria-hidden="true">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-band">
        <div className="container">
          <h2 className="home-h2">Bắt đầu trong ba bước</h2>
          <ol className="home-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="card">
                <span className="home-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container">
        <h2 className="home-h2">Học và luyện tập</h2>
        <div className="home-grid three">
          {LEARN.map((l) => (
            <Link key={l.to} to={l.to} className="card home-learn">
              <h3>{l.title}</h3>
              <p>{l.text}</p>
              <span className="home-more">Xem thêm →</span>
            </Link>
          ))}
        </div>
      </section>

      {!authed && (
        <section className="home-final">
          <div className="container narrow">
            <h2>Sẵn sàng cho ván đầu tiên?</h2>
            <p>Tạo tài khoản trong chưa đầy một phút và vào bàn cờ ngay.</p>
            <Link to="/register" className="site-btn primary large">
              Tạo tài khoản
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
