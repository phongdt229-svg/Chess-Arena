import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import StaticBoard from '../StaticBoard';
import { OPENINGS, movetext } from '../data/openings';
import { navigate } from '../../router/router';
import { usePageMeta } from '../usePageMeta';
import './Openings.css';

export default function Openings() {
  usePageMeta('Khai cuộc cờ vua', 'Mười khai cuộc cờ vua phổ biến: xem từng nước đi, ý tưởng cho Trắng và Đen, và thử ngay trên bàn cờ.');
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
      <h1 className="page-title">Khai cuộc cờ vua</h1>
      <p className="page-lead">Những nước đầu tiên quyết định hướng đi của cả ván. Chọn một khai cuộc, duyệt từng nước và thử trên bàn cờ.</p>

      <div className="openings-layout">
        <nav className="openings-list" aria-label="Danh sách khai cuộc">
          {OPENINGS.map((o) => (
            <button key={o.id} className={`openings-item ${o.id === openingId ? 'active' : ''}`} onClick={() => select(o.id)} aria-pressed={o.id === openingId}>
              <span className="openings-name">{o.name}</span>
              <span className="openings-eco">{o.eco}</span>
            </button>
          ))}
        </nav>

        <section className="openings-detail card" aria-live="polite">
          <div className="openings-board">
            <StaticBoard fen={view.fen} highlights={view.highlights} label={`${opening.name} sau ${step} nước`} />
            <div className="openings-controls">
              <button onClick={() => setStep(0)} disabled={step === 0} aria-label="Về thế ban đầu">⏮</button>
              <button onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Nước trước">◀</button>
              <span>
                {step}/{max}
              </span>
              <button onClick={() => setStep(step + 1)} disabled={step === max} aria-label="Nước sau">▶</button>
              <button onClick={() => setStep(max)} disabled={step === max} aria-label="Đến nước cuối">⏭</button>
            </div>
          </div>

          <div className="openings-info">
            <h2>{opening.name}</h2>
            <p className="openings-tags">
              <span>ECO {opening.eco}</span>
              <span>{opening.style}</span>
            </p>
            <ol className="openings-moves" aria-label="Các nước đi">
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
              <dt>Ý tưởng của Trắng</dt>
              <dd>{opening.white}</dd>
              <dt>Ý tưởng của Đen</dt>
              <dd>{opening.black}</dd>
            </dl>
            <button className="site-btn primary" onClick={tryIt}>
              Thử thế này trên bàn cờ
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
