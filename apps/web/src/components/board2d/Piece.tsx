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
  const symbol = PIECE_SYMBOLS[piece.type];
  const isWhite = piece.color === 'w';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('from', index.toString());
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
