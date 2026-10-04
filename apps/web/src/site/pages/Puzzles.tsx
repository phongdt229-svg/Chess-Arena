import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board2D from '../../components/board2d/Board2D';
import PromotionDialog from '../../components/board2d/PromotionDialog';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { PUZZLES, type Puzzle } from '../data/puzzles';
import { forcedMateMoves, stubbornestReply } from '../puzzleSolver';
import { markSolved, readSolved } from '../puzzleProgress';
import { usePageMeta } from '../usePageMeta';
import AdSlot from '../../ads/AdSlot';
import './Puzzles.css';

type Status = 'solving' | 'wrong' | 'solved';

const squareName = (i: number) => `${String.fromCharCode(97 + (i % 8))}${Math.floor(i / 8) + 1}`;
const squareIndex = (sq: string) => sq.charCodeAt(0) - 97 + (parseInt(sq[1], 10) - 1) * 8;

function PuzzleBoard({ puzzle, onSolved, onNext }: { puzzle: Puzzle; onSolved: () => void; onNext: (() => void) | null }) {
  const [status, setStatus] = useState<Status>('solving');
  const [hintShown, setHintShown] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const state = useRef({ remaining: puzzle.mateIn, good: new Set<string>(), busy: false, scripted: false });
  const timers = useRef<number[]>([]);
  const turn = puzzle.fen.split(' ')[1] === 'b' ? 'Black' : 'White';

  useEffect(() => {
    const store = useGameStore;
    store.getState().newGame({ mode: 'local' });
    store.getState().loadFEN(puzzle.fen);
    if (store.getState().orientation !== (puzzle.fen.split(' ')[1] as 'w' | 'b')) store.getState().flipBoard();

    const s = state.current;
    s.remaining = puzzle.mateIn;
    s.good = new Set(forcedMateMoves(puzzle.fen, puzzle.mateIn));
    s.busy = false;
    s.scripted = false;
    setStatus('solving');
    setHintShown(false);
    setAnswer(null);

    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

    const unsubscribe = store.subscribe((next, prev) => {
      if (next.history.length <= prev.history.length) return;
      if (s.scripted) {
        s.scripted = false;
        return;
      }
      const move = next.history[next.history.length - 1];
      const uci = `${squareName(move.from)}${squareName(move.to)}${move.promotion ?? ''}`;

      if (s.busy || next.result.status === 'resign') {
        later(() => store.getState().undo(), 0);
        return;
      }

      if (next.result.status === 'checkmate') {
        setStatus('solved');
        onSolved();
        return;
      }

      if (s.good.has(uci)) {
        s.remaining -= 1;
        s.busy = true;
        later(() => {
          const reply = stubbornestReply(store.getState().fen, s.remaining);
          if (!reply) return;
          s.scripted = true;
          store.getState().tryMove(squareIndex(reply.slice(0, 2)), squareIndex(reply.slice(2, 4)), reply[4]);
          s.good = new Set(forcedMateMoves(store.getState().fen, s.remaining));
          s.busy = false;
        }, 450);
      } else {
        s.busy = true;
        setStatus('wrong');
        later(() => {
          store.getState().undo();
          s.busy = false;
          setStatus('solving');
        }, 800);
      }
    });

    return () => {
      unsubscribe();
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
    // onSolved is stable per puzzle from the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  const showHint = () => {
    const first = [...state.current.good][0];
    if (!first) return;
    const from = squareIndex(first.slice(0, 2));
    const st = useGameStore.getState();
    if (st.selectedSquare !== from) st.clickSquare(from);
    setHintShown(true);
  };

  const showAnswer = () => {
    const first = [...state.current.good][0];
    if (!first) return;
    const chess = new Chess(useGameStore.getState().fen);
    const san = chess.move({ from: first.slice(0, 2), to: first.slice(2, 4), promotion: first[4] }).san;
    setAnswer(san);
  };

  const reset = () => {
    useGameStore.getState().newGame({ mode: 'local' });
    useGameStore.getState().loadFEN(puzzle.fen);
    if (useGameStore.getState().orientation !== (puzzle.fen.split(' ')[1] as 'w' | 'b')) useGameStore.getState().flipBoard();
    const s = state.current;
    s.remaining = puzzle.mateIn;
    s.good = new Set(forcedMateMoves(puzzle.fen, puzzle.mateIn));
    s.busy = false;
    s.scripted = false;
    setStatus('solving');
    setAnswer(null);
    setHintShown(false);
  };

  return (
    <div className="puzzle-play">
      <div className="puzzle-board">
        <Board2D />
        <PromotionDialog />
      </div>
      <div className="puzzle-panel card">
        <h2>{puzzle.title}</h2>
        <p className="puzzle-goal">
          {turn} to move and checkmate in <strong>{puzzle.mateIn} {puzzle.mateIn === 1 ? 'move' : 'moves'}</strong>.
        </p>
        <p className="puzzle-theme">{puzzle.theme}</p>

        <div className={`puzzle-status ${status}`} role="status">
          {status === 'solving' && 'Find your move.'}
          {status === 'wrong' && 'Not quite, try another move.'}
          {status === 'solved' && 'Correct, checkmate!'}
        </div>
        {answer && status !== 'solved' && (
          <p className="puzzle-answer">
            First move: <strong>{answer}</strong>
          </p>
        )}

        <div className="puzzle-actions">
          <button className="site-btn outline" onClick={showHint} disabled={status === 'solved'}>
            {hintShown ? 'Show hint again' : 'Hint'}
          </button>
          <button className="site-btn outline" onClick={showAnswer} disabled={status === 'solved'}>
            Show answer
          </button>
          <button className="site-btn outline" onClick={reset}>
            Reset
          </button>
          {status === 'solved' && onNext && (
            <button className="site-btn primary" onClick={onNext}>
              Next puzzle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Puzzles() {
  usePageMeta('Chess puzzles', 'Practise finding checkmate in one or two moves on an interactive board and track the puzzles you have solved.');
  const userId = useAuthStore((s) => s.user?.id);
  const [solved, setSolved] = useState<string[]>(() => (userId !== undefined ? readSolved(userId) : []));
  const [index, setIndex] = useState(() => {
    const done = userId !== undefined ? readSolved(userId) : [];
    const firstOpen = PUZZLES.findIndex((p) => !done.includes(p.id));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const puzzle = PUZZLES[index];

  const onSolved = useMemo(
    () => () => {
      if (userId !== undefined) setSolved(markSolved(userId, puzzle.id));
    },
    [userId, puzzle.id],
  );
  const onNext = index < PUZZLES.length - 1 ? () => setIndex(index + 1) : null;

  return (
    <div className="container">
      <h1 className="page-title">Chess puzzles</h1>
      <p className="page-lead">
        Solved {solved.length} of {PUZZLES.length}. Click a piece, then click its destination, just like a normal game.
      </p>

      <div className="puzzles-layout">
        <nav className="puzzles-list" aria-label="List of puzzles">
          {PUZZLES.map((p, i) => (
            <button key={p.id} className={`puzzles-item ${i === index ? 'active' : ''} ${solved.includes(p.id) ? 'done' : ''}`} onClick={() => setIndex(i)} aria-current={i === index ? 'true' : undefined}>
              <span className="puzzles-check" aria-label={solved.includes(p.id) ? 'Solved' : 'Not solved'}>
                {solved.includes(p.id) ? '✓' : i + 1}
              </span>
              <span className="puzzles-title">{p.title}</span>
              <span className="puzzles-mate">Mate in {p.mateIn}</span>
            </button>
          ))}
        </nav>

        <PuzzleBoard key={puzzle.id} puzzle={puzzle} onSolved={onSolved} onNext={onNext} />
      </div>

      <AdSlot placement="content" />
    </div>
  );
}
