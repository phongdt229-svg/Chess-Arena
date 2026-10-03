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
  const { selectSquare, makeMove } = useGameStore();
  const file = index % 8;
  const rank = Math.floor(index / 8);
  const isDark = (file + rank) % 2 === 1;

  const handleClick = () => {
    selectSquare(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const uci = e.dataTransfer.getData('uci');
    if (uci) {
      makeMove(uci);
    }
  };

  const className = ['square', isDark ? 'dark' : 'light', isSelected && 'selected', isLegalTarget && 'legal-target', isLastMove && 'last-move', isInCheck && 'in-check']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} onClick={handleClick} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {piece && <Piece piece={piece} index={index} />}
      {isLegalTarget && <div className="legal-marker" />}
    </div>
  );
}
