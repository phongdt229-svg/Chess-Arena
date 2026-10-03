import { useGameStore } from '../../store/gameStore';
import './MoveHistory.css';

export default function MoveHistory() {
  const { engine } = useGameStore();

  if (!engine) return null;

  const moves = engine.getMoveHistory();

  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="moves-list">
        {moves.length === 0 ? (
          <p className="no-moves">No moves yet</p>
        ) : (
          <div className="moves-grid">
            {moves.map((move, index) => (
              <div key={index} className="move-item">
                <span className="move-number">{Math.floor(index / 2) + 1}.</span>
                <span className={index % 2 === 0 ? 'white-move' : 'black-move'}>{move}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
