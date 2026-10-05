import { memo, type CSSProperties } from 'react';
import { useGameStore } from '../../store/gameStore';
import Piece, { type Slide } from './Piece';
import { clickSuppressed } from './dragState';
import './Square.css';

const PIECE_NAMES: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

interface SquareProps {
  index: number;
  piece: { type: string; color: string } | null;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  fileLabel?: string;
  rankLabel?: string;
  tabbable: boolean;
  slide?: Slide;
  moveKey: number;
  dragging: boolean;
  onFocusSquare: (index: number) => void;
}

function Square({
  index,
  piece,
  isSelected,
  isLegalTarget,
  isLastMove,
  isInCheck,
  fileLabel,
  rankLabel,
  tabbable,
  slide,
  moveKey,
  dragging,
  onFocusSquare,
}: SquareProps) {
  const file = index % 8;
  const rank = Math.floor(index / 8);
  const name = `${String.fromCharCode(97 + file)}${rank + 1}`;
  const isDark = (file + rank) % 2 === 1;

  const className = [
    'square',
    isDark ? 'dark' : 'light',
    isSelected && 'selected',
    isLegalTarget && 'legal-target',
    isLegalTarget && piece && 'has-piece',
    isLastMove && 'last-move',
    isInCheck && 'in-check',
  ]
    .filter(Boolean)
    .join(' ');

  const description = [
    name,
    piece ? `${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}` : 'empty',
    isSelected ? 'selected' : null,
    isLegalTarget ? 'legal move' : null,
    isInCheck ? 'king in check' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={className}
      data-square={name}
      role="gridcell"
      aria-label={description}
      aria-selected={isSelected}
      tabIndex={tabbable ? 0 : -1}
      onFocus={() => onFocusSquare(index)}
      onClick={() => {
        if (!clickSuppressed()) useGameStore.getState().clickSquare(index);
      }}
    >
      {rankLabel && <span className="sq-label rank">{rankLabel}</span>}
      {fileLabel && <span className="sq-label file">{fileLabel}</span>}
      {piece && <Piece key={slide ? `m${moveKey}` : 'still'} piece={piece} slide={slide} dragging={dragging} />}
      {isLegalTarget && !piece && <div className="legal-marker" style={{ pointerEvents: 'none' } as CSSProperties} />}
    </div>
  );
}

export default memo(Square);
