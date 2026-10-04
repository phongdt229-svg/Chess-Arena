import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';
import './Guide.css';

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Does Chess Arena cost anything?',
    a: 'No. The site has no payments and no ads.',
  },
  {
    q: 'How strong is the computer?',
    a: 'It is a custom engine that runs inside your browser, with six levels. Levels 1 and 2 sometimes make deliberate mistakes so beginners can win; levels 5 and 6 search deeper and may think for a few seconds per move. It is not as strong as professional engines such as Stockfish.',
  },
  {
    q: 'Can I play online against other people?',
    a: 'Not yet. You can play two players on one device or play the computer. Online play against other people is planned.',
  },
  {
    q: 'Where are my games saved?',
    a: 'Unfinished games are saved in your browser, tied to the account you are logged in with. They are not synced between devices and are lost if you clear your browser data. To keep a game for good, download it as a PGN file.',
  },
  {
    q: 'What if I forget my password?',
    a: 'There is no password recovery yet because accounts are not linked to an email address. Keep your password safe, or use your browser\'s password manager.',
  },
  {
    q: 'Why can I not move my pieces?',
    a: 'Against the computer you can only move on your own turn, and the board is locked while the computer is thinking. You also cannot move once the game has ended or time has run out. Press New Game to start again.',
  },
  {
    q: 'The 3D board is slow on my device. What can I do?',
    a: 'In 3D mode set Quality to Low to turn off shadows, or switch back to the 2D board at any time. Your game stays exactly as it is.',
  },
  {
    q: 'When is a game drawn?',
    a: (
      <>
        By stalemate, the fifty-move rule, threefold repetition, insufficient material or agreement. See the <Link to="/rules">Rules</Link> page
        for details.
      </>
    ),
  },
];

export default function Guide() {
  usePageMeta('Guide', 'A guide to playing on Chess Arena: starting a game, moving pieces, the 3D board, clocks, PGN import and export, saved games and common questions.');

  return (
    <div className="container narrow prose">
      <h1 className="page-title">How to use Chess Arena</h1>
      <p className="page-lead">Every control on the game screen, from your first game to the advanced features.</p>

      <h2>1. Start a game</h2>
      <p>
        After you <Link to="/register">sign up</Link> or <Link to="/login">log in</Link> you land on the game screen. Press <strong>New Game</strong> to
        open the options:
      </p>
      <ul>
        <li><strong>Local (2 Players):</strong> two people take turns on the same device.</li>
        <li><strong>Play vs AI:</strong> play the computer. Choose your colour (White, Black or random) and a level from 1 to 6.</li>
        <li><strong>Time Control:</strong> unlimited, or a clock of 1, 3, 5, 10 or 15 minutes. Some options add a few seconds after every move.</li>
      </ul>

      <h2>2. Move your pieces</h2>
      <ul>
        <li>Click one of your pieces and the squares it can go to light up, then click the destination. Click the piece again to deselect it.</li>
        <li>On the 2D board you can also drag a piece to its destination.</li>
        <li>When a pawn reaches the last rank, a dialog asks which piece to promote to.</li>
        <li>The king&apos;s square turns red when it is in check, and the two squares of the last move are highlighted.</li>
      </ul>

      <h2>3. The 3D board</h2>
      <p>
        Press <strong>3D View</strong> in the top bar. Drag (or swipe) to rotate, scroll (or pinch) to zoom, and press <strong>Reset View</strong> to
        return the camera to its default angle. <strong>Quality</strong> switches between Low and High (High adds shadows).
      </p>

      <h2>4. Controls</h2>
      <ul>
        <li><strong>Undo / Redo:</strong> take back or replay moves. Against the computer each press steps a pair of moves (yours and the computer&apos;s).</li>
        <li><strong>Flip Board:</strong> turn the board around.</li>
        <li><strong>Sound:</strong> turn move, capture, check and game-over sounds on or off.</li>
        <li><strong>Import / Export:</strong> copy or download a position (FEN) or a game (PGN), or paste one to load it.</li>
        <li><strong>Resign:</strong> give up the current game.</li>
      </ul>

      <h2>5. Save and resume</h2>
      <p>
        Games that are not finished are saved automatically after every move. Next time you open the game screen you are asked whether to{' '}
        <strong>Resume</strong> the old game or <strong>Start fresh</strong>.
      </p>

      <h2>Frequently asked questions</h2>
      <div className="faq">
        {FAQ.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <div className="faq-answer">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
