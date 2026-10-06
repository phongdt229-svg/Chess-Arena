import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import './MoveHistory.css';

export default function MoveHistory() {
  const history = useGameStore((s) => s.history);
  const reviewPly = useGameStore((s) => s.reviewPly);
  const reviewTo = useGameStore((s) => s.reviewTo);
  const listRef = useRef<HTMLDivElement>(null);

  const total = history.length;
  const current = reviewPly ?? total; // the position being shown, in half-moves

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[aria-current="true"]');
    if (active?.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    else list.scrollTop = list.scrollHeight;
  }, [total, reviewPly]);

  const go = (ply: number) => reviewTo(ply >= total ? null : ply);

  const cell = (index: number) => {
    const move = history[index];
    if (!move) return <span className="move-empty" />;
    return (
      <button
        key={index}
        className={`move-btn ${index % 2 === 0 ? 'white-move' : 'black-move'}`}
        aria-current={current === index + 1 ? 'true' : undefined}
        onClick={() => go(index + 1)}
      >
        {move.san || `${move.from}-${move.to}`}
      </button>
    );
  };

  return (
    <div className="move-history">
      <div className="move-history-head">
        <h3>Move History</h3>
        <div className="move-nav" role="group" aria-label="Browse moves">
          <button onClick={() => go(0)} disabled={total === 0 || current === 0} aria-label="First position" title="Start position">⏮</button>
          <button onClick={() => go(current - 1)} disabled={current === 0} aria-label="Previous move" title="Previous move">◀</button>
          <button onClick={() => go(current + 1)} disabled={current >= total} aria-label="Next move" title="Next move">▶</button>
          <button onClick={() => reviewTo(null)} disabled={current >= total} aria-label="Latest position" title="Back to the live game">⏭</button>
        </div>
      </div>

      <div className="moves-list" ref={listRef}>
        {total === 0 ? (
          <p className="no-moves">No moves yet</p>
        ) : (
          <div className="moves-grid">
            {Array.from({ length: Math.ceil(total / 2) }, (_, row) => (
              <div key={row} className="move-row">
                <span className="move-number">{row + 1}.</span>
                {cell(row * 2)}
                {cell(row * 2 + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
