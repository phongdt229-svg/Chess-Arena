import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import StaticBoard from '../StaticBoard';
import { OPENINGS, movetext } from '../data/openings';
import { navigate } from '../../router/router';
import { usePageMeta } from '../usePageMeta';
import AdSlot from '../../ads/AdSlot';
import './Openings.css';

export default function Openings() {
  usePageMeta('Chess openings', 'Ten popular chess openings: step through the moves, learn the ideas for White and Black and try them on the board.');
  const [openingId, setOpeningId] = useState(OPENINGS[0].id);
  const opening = OPENINGS.find((o) => o.id === openingId)!;
  const [step, setStep] = useState(opening.moves.length);

  const select = (id: string) => {
    setOpeningId(id);
    setStep(OPENINGS.find((o) => o.id === id)!.moves.length);
  };

  const view = useMemo(() => {
    const chess = new Chess();
    let last: { from: string; to: string } | undefined;
    for (const san of opening.moves.slice(0, step)) {
      const m = chess.move(san);
      last = { from: m.from, to: m.to };
    }
    return { fen: chess.fen(), highlights: last ? [last.from, last.to] : [] };
  }, [opening, step]);

  const max = opening.moves.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1));
      if (e.key === 'ArrowRight') setStep((s) => Math.min(max, s + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [max]);

  const tryIt = () => navigate(`/play?pgn=${encodeURIComponent(movetext(opening.moves.slice(0, step)))}`);

  return (
    <div className="container">
      <h1 className="page-title">Chess openings</h1>
      <p className="page-lead">The first moves shape the whole game. Pick an opening, step through its moves and try it on the board.</p>

      <div className="openings-layout">
        <nav className="openings-list" aria-label="List of openings">
          {OPENINGS.map((o) => (
            <button key={o.id} className={`openings-item ${o.id === openingId ? 'active' : ''}`} onClick={() => select(o.id)} aria-pressed={o.id === openingId}>
              <span className="openings-name">{o.name}</span>
              <span className="openings-eco">{o.eco}</span>
            </button>
          ))}
        </nav>

        <section className="openings-detail card" aria-live="polite">
          <div className="openings-board">
            <StaticBoard fen={view.fen} highlights={view.highlights} label={`${opening.name} after ${step} moves`} />
            <div className="openings-controls">
              <button onClick={() => setStep(0)} disabled={step === 0} aria-label="Back to the start">⏮</button>
              <button onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Previous move">◀</button>
              <span>
                {step}/{max}
              </span>
              <button onClick={() => setStep(step + 1)} disabled={step === max} aria-label="Next move">▶</button>
              <button onClick={() => setStep(max)} disabled={step === max} aria-label="Jump to the last move">⏭</button>
            </div>
          </div>

          <div className="openings-info">
            <h2>{opening.name}</h2>
            <p className="openings-tags">
              <span>ECO {opening.eco}</span>
              <span>{opening.style}</span>
            </p>
            <ol className="openings-moves" aria-label="Moves">
              {opening.moves.map((san, i) => (
                <li key={i} className={i + 1 === step ? 'current' : ''}>
                  <button onClick={() => setStep(i + 1)}>
                    {i % 2 === 0 ? `${i / 2 + 1}. ` : ''}
                    {san}
                  </button>
                </li>
              ))}
            </ol>
            <p>{opening.summary}</p>
            <dl>
              <dt>White&apos;s ideas</dt>
              <dd>{opening.white}</dd>
              <dt>Black&apos;s ideas</dt>
              <dd>{opening.black}</dd>
            </dl>
            <button className="site-btn primary" onClick={tryIt}>
              Try this on the board
            </button>
          </div>
        </section>
      </div>

      <AdSlot placement="content" />
    </div>
  );
}
