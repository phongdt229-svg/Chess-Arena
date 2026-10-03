import { useGameStore } from '../../store/gameStore';
import './PromotionDialog.css';

interface PromotionDialogProps {
  promotion: { from: number; to: number };
}

export default function PromotionDialog({ promotion }: PromotionDialogProps) {
  const { choosePromotion } = useGameStore();

  const pieces = ['q', 'r', 'b', 'n'] as const;
  const names = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

  return (
    <div className="promotion-overlay">
      <div className="promotion-dialog">
        <h2>Promote pawn to:</h2>
        <div className="promotion-options">
          {pieces.map((piece) => (
            <button
              key={piece}
              className="promotion-btn"
              onClick={() => choosePromotion(piece)}
              title={names[piece]}
            >
              {piece.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
