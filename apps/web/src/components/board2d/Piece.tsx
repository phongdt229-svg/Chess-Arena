import type { CSSProperties } from 'react';
import './Piece.css';

export const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

export interface Slide {
  dx: number; // start offset in squares, relative to the destination square
  dy: number;
}

interface PieceProps {
  piece: { type: string; color: string };
  slide?: Slide;
  dragging?: boolean;
}

export default function Piece({ piece, slide, dragging }: PieceProps) {
  const style = slide ? ({ '--dx': slide.dx, '--dy': slide.dy } as CSSProperties) : undefined;
  return (
    <div className={`piece ${piece.color === 'w' ? 'white' : 'black'} ${slide ? 'slide' : ''} ${dragging ? 'dragging' : ''}`} style={style}>
      {PIECE_SYMBOLS[piece.type]}
    </div>
  );
}
