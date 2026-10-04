import { useGameStore } from '../../store/gameStore';
import './PromotionDialog.css';

const OPTIONS = [
  { type: 'q', symbol: '♕', name: 'Queen' },
  { type: 'r', symbol: '♖', name: 'Rook' },
  { type: 'b', symbol: '♗', name: 'Bishop' },
  { type: 'n', symbol: '♘', name: 'Knight' },
] as const;

export default function PromotionDialog() {
  const { pendingPromotion, choosePromotion, cancelPromotion } = useGameStore();
  if (!pendingPromotion) return null;

  return (
    <div className="promotion-overlay" onClick={cancelPromotion}>
      <div className="promotion-dialog" role="dialog" aria-label="Promote pawn" onClick={(e) => e.stopPropagation()}>
        <h2>Promote pawn to:</h2>
        <div className="promotion-options">
          {OPTIONS.map(({ type, symbol, name }) => (
            <button key={type} className="promotion-btn" onClick={() => choosePromotion(type)} title={name} aria-label={name}>
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
