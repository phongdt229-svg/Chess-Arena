import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useBoardView } from '../../store/useBoardView';
import ReviewBadge from '../ui/ReviewBadge';
import Square from './Square';
import { PIECE_SYMBOLS, type Slide } from './Piece';
import { suppressNextClick } from './dragState';
import './Board2D.css';

const DRAG_THRESHOLD_PX = 6;

const nameToIndex = (name: string) => name.charCodeAt(0) - 97 + (parseInt(name[1], 10) - 1) * 8;

// Start offset (in squares) of a moving piece, relative to its destination as drawn for this orientation
export function slideOffset(from: number, to: number, orientation: 'w' | 'b'): Slide {
  const [ff, fr, tf, tr] = [from % 8, Math.floor(from / 8), to % 8, Math.floor(to / 8)];
  return orientation === 'w' ? { dx: ff - tf, dy: tr - fr } : { dx: tf - ff, dy: fr - tr };
}

interface DragView {
  from: number;
  x: number;
  y: number;
  size: number;
}

export default function Board2D() {
  const { orientation, history, result, clickSquare } = useGameStore();
  const { board, selectedSquare, legalMoves, lastMoveFrom, lastMoveTo, inCheckSquare, reviewing } = useBoardView();
  const gridRef = useRef<HTMLDivElement>(null);
  const mountLength = useRef(history.length);
  const pending = useRef<{ from: number; x: number; y: number; id: number } | null>(null);
  const [focusSq, setFocusSq] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragView | null>(null);

  // Squares in display order, top row first
  const order = useMemo(() => {
    const list: number[] = [];
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        list.push(orientation === 'w' ? rank * 8 + file : (7 - rank) * 8 + (7 - file));
      }
    }
    return list;
  }, [orientation]);

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const animateMove = !reviewing && lastMoveFrom !== null && lastMoveTo !== null && history.length > mountLength.current;
  const slide = animateMove ? slideOffset(lastMoveFrom!, lastMoveTo!, orientation) : undefined;
  const tabbableSquare = focusSq ?? selectedSquare ?? order[0];

  const focusSquare = (index: number) => {
    setFocusSq(index);
    gridRef.current?.querySelector<HTMLElement>(`[data-square="${String.fromCharCode(97 + (index % 8))}${Math.floor(index / 8) + 1}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = (document.activeElement as HTMLElement | null)?.dataset?.square;
    if (!current) return;
    const idx = nameToIndex(current);
    const pos = order.indexOf(idx);
    const row = Math.floor(pos / 8);
    const col = pos % 8;
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[e.key]) {
      e.preventDefault();
      const nr = Math.min(7, Math.max(0, row + moves[e.key][0]));
      const nc = Math.min(7, Math.max(0, col + moves[e.key][1]));
      focusSquare(order[nr * 8 + nc]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      clickSquare(idx);
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const squareEl = (e.target as HTMLElement).closest<HTMLElement>('[data-square]');
    if (!squareEl || !(e.target as HTMLElement).closest('.piece')) return;
    pending.current = { from: nameToIndex(squareEl.dataset.square!), x: e.clientX, y: e.clientY, id: e.pointerId };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pending.current;
    if (!p || p.id !== e.pointerId) return;
    if (!drag) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_THRESHOLD_PX) return;
      const store = useGameStore.getState();
      if (store.selectedSquare !== p.from) store.clickSquare(p.from);
      if (useGameStore.getState().selectedSquare !== p.from) {
        pending.current = null; // this piece cannot be moved right now
        return;
      }
      (e.currentTarget as HTMLElement & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(e.pointerId);
      const size = (e.target as HTMLElement).closest<HTMLElement>('[data-square]')?.getBoundingClientRect().width ?? 60;
      setDrag({ from: p.from, x: e.clientX, y: e.clientY, size });
    } else {
      setDrag({ ...drag, x: e.clientX, y: e.clientY });
    }
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const p = pending.current;
    pending.current = null;
    if (!p || !drag) return;
    suppressNextClick();
    if (!cancelled) {
      const target = document.elementFromPoint?.(e.clientX, e.clientY)?.closest<HTMLElement>('[data-square]');
      if (target) {
        const to = nameToIndex(target.dataset.square!);
        if (to !== p.from) clickSquare(to);
      }
    }
    setDrag(null);
  };

  const lastSan = history[history.length - 1]?.san;
  const announcement = [
    lastSan ? `Last move ${lastSan}.` : '',
    inCheckSquare !== null ? 'Check.' : '',
    result.status !== 'ongoing' ? 'Game over.' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const dragged = drag ? board[drag.from] : null;

  return (
    <div className="board-2d-wrap">
    <div className={`board-2d ${reviewing ? 'reviewing' : ''}`}>
      <div
        ref={gridRef}
        className="board-grid"
        role="grid"
        aria-label="Chess board"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
      >
        {Array.from({ length: 8 }, (_, row) => (
          <div key={row} role="row" className="board-row">
            {order.slice(row * 8, row * 8 + 8).map((sq, col) => (
              <Square
                key={sq}
                index={sq}
                piece={board[sq]}
                isSelected={sq === selectedSquare}
                isLegalTarget={isLegalTarget(sq)}
                isLastMove={lastMoveFrom === sq || lastMoveTo === sq}
                isInCheck={sq === inCheckSquare}
                rankLabel={col === 0 ? String(Math.floor(sq / 8) + 1) : undefined}
                fileLabel={row === 7 ? String.fromCharCode(97 + (sq % 8)) : undefined}
                tabbable={sq === tabbableSquare}
                slide={sq === lastMoveTo ? slide : undefined}
                moveKey={history.length}
                dragging={drag?.from === sq}
                onFocusSquare={setFocusSq}
              />
            ))}
          </div>
        ))}
      </div>

      {drag && dragged && (
        <div className={`drag-ghost piece ${dragged.color === 'w' ? 'white' : 'black'}`} style={{ left: drag.x, top: drag.y, fontSize: drag.size * 0.78 }} aria-hidden="true">
          {PIECE_SYMBOLS[dragged.type]}
        </div>
      )}

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
      <ReviewBadge inline />
    </div>
  );
}
