import { useGameStore } from '../../store/gameStore';
import './Piece.css';

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

interface PieceProps {
  piece: { type: string; color: string };
  index: number;
}

export default function Piece({ piece, index }: PieceProps) {
  const { selectedSquare, makeMove } = useGameStore();
  const symbol = PIECE_SYMBOLS[piece.type];
  const isWhite = piece.color === 'w';

  const handleDragStart = (e: React.DragEvent) => {
    if (selectedSquare === null) return;
    const file = index % 8;
    const rank = Math.floor(index / 8);
    const target = e.dataTransfer.target as HTMLElement;
    if (!target) return;

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`piece ${isWhite ? 'white' : 'black'}`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      {symbol}
    </div>
  );
}
