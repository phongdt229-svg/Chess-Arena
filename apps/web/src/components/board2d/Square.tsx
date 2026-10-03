import { useGameStore } from '../../store/gameStore';
import Piece from './Piece';
import './Square.css';

interface SquareProps {
  index: number;
  piece: any | null;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
}

export default function Square({
  index,
  piece,
  isSelected,
  isLegalTarget,
  isLastMove,
  isInCheck,
}: SquareProps) {
  const { clickSquare } = useGameStore();
  const file = index % 8;
  const rank = Math.floor(index / 8);
  const isDark = (file + rank) % 2 === 1;

  const handleClick = () => {
    clickSquare(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('from'), 10);
    if (!isNaN(from)) {
      // clickSquare will handle the move logic
      clickSquare(index);
    }
  };

  const className = [
    'square',
    isDark ? 'dark' : 'light',
    isSelected && 'selected',
    isLegalTarget && 'legal-target',
    isLastMove && 'last-move',
    isInCheck && 'in-check',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {piece && <Piece piece={piece} index={index} />}
      {isLegalTarget && <div className="legal-marker" />}
    </div>
  );
}
