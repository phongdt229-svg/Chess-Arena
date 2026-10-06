import { Link } from '../../router/router';
import { useAuthStore } from '../../store/authStore';
import StaticBoard from '../StaticBoard';
import { usePageMeta } from '../usePageMeta';
import AdSlot from '../../ads/AdSlot';
import './Home.css';

const FEATURES = [
  { icon: '🎲', title: '2D and 3D boards', text: 'Switch instantly between a clean 2D board and a 3D board you can rotate. Your game carries over.' },
  { icon: '🤖', title: 'Play the computer', text: 'Six levels from beginner to expert. The engine runs right in your browser, so there is no server to wait for.' },
  { icon: '⏱️', title: 'Tournament clocks', text: '1, 3, 5, 10 and 15 minute games, with optional increments. Run out of time and you lose, just like over the board.' },
  { icon: '📋', title: 'Import / export FEN and PGN', text: 'Paste a position or a full game to analyse it, or download your own game as a PGN file.' },
  { icon: '💾', title: 'Save and resume', text: 'Unfinished games are saved to your account automatically, so you can pick up where you left off.' },
  { icon: '📱', title: 'Works on your phone', text: 'The layout adapts to any screen and you can move pieces with a tap.' },
];

const STEPS = [
  { n: 1, title: 'Create an account', text: 'All you need is a username and a password. No email required.' },
  { n: 2, title: 'Choose how to play', text: 'Two players on one device or against the computer. Pick your colour and a clock.' },
  { n: 3, title: 'Make your first move', text: 'Click a piece, then click where it should go, or drag and drop. Legal squares light up.' },
];

const LEARN = [
  { to: '/rules', title: 'Rules of chess', text: 'How every piece moves, castling, en passant, promotion and the ways a game can end.' },
  { to: '/openings', title: 'Openings', text: 'Ten popular openings. Step through the moves and learn the main ideas for each side.' },
  { to: '/puzzles', title: 'Puzzles', text: 'Practise finding checkmate in one or two moves and track the puzzles you have solved.' },
];

export default function Home() {
  const authed = useAuthStore((s) => s.status === 'authed');
  usePageMeta(
    'Chess Arena',
    'Play chess online for free on a 2D or 3D board. Challenge the computer at six levels, use tournament clocks, save your games and learn openings.',
  );

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-text">
            <h1>Play chess right in your browser</h1>
            <p>
              2D and 3D boards, six computer levels, or a game with a friend on one device. Clocks, saved games and a
              library of rules, openings and puzzles to help you improve.
            </p>
            <div className="home-cta">
              {authed ? (
                <Link to="/play" className="site-btn primary large">
                  Play now
                </Link>
              ) : (
                <>
                  <Link to="/register" className="site-btn primary large">
                    Play for free
                  </Link>
                  <Link to="/login" className="site-btn outline large">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
            <p className="home-note">Nothing to install. Works on desktop, tablet and phone.</p>
          </div>
          <div className="home-hero-board">
            <StaticBoard
              fen="r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
              highlights={['f1', 'c4', 'f8', 'c5']}
              label="Italian Game position after four moves"
            />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="home-h2">Everything you need to play chess</h2>
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

      <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <AdSlot placement="home" />
      </div>

      <section className="home-band">
        <div className="container">
          <h2 className="home-h2">Get started in three steps</h2>
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
        <h2 className="home-h2">Learn and practise</h2>
        <div className="home-grid three">
          {LEARN.map((l) => (
            <Link key={l.to} to={l.to} className="card home-learn">
              <h3>{l.title}</h3>
              <p>{l.text}</p>
              <span className="home-more">Read more →</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <AdSlot placement="homeBottom" />
      </div>

      {!authed && (
        <section className="home-final">
          <div className="container narrow">
            <h2>Ready for your first game?</h2>
            <p>Create an account in under a minute and start playing.</p>
            <Link to="/register" className="site-btn primary large">
              Create account
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
