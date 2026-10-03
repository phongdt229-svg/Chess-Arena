import { useGameStore } from '../../store/gameStore';
import Square from './Square';
import PromotionDialog from './PromotionDialog';
import './Board2D.css';

export default function Board2D() {
  const {
    board,
    selectedSquare,
    legalMoves,
    lastMoveFrom,
    lastMoveTo,
    inCheckSquare,
    orientation,
    pendingPromotion,
  } = useGameStore();

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      let squareIndex = rank * 8 + file;

      if (orientation === 'b') {
        squareIndex = (7 - rank) * 8 + (7 - file);
      }

      squares.push(squareIndex);
    }
  }

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const isLastMoveSquare = (sq: number) => lastMoveFrom === sq || lastMoveTo === sq;

  return (
    <div className="board-2d">
      <div className="board-grid">
        {squares.map((sq) => (
          <Square
            key={sq}
            index={sq}
            piece={board[sq]}
            isSelected={sq === selectedSquare}
            isLegalTarget={isLegalTarget(sq)}
            isLastMove={isLastMoveSquare(sq)}
            isInCheck={sq === inCheckSquare}
          />
        ))}
      </div>

      {pendingPromotion && <PromotionDialog promotion={pendingPromotion} />}
    </div>
  );
}
