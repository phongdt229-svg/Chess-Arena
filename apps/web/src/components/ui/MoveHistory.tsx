import { useGameStore } from '../../store/gameStore';
import './MoveHistory.css';

export default function MoveHistory() {
  const { history } = useGameStore();

  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="moves-list">
        {history.length === 0 ? (
          <p className="no-moves">No moves yet</p>
        ) : (
          <div className="moves-grid">
            {history.map((move, index) => (
              <div key={index} className="move-item">
                {index % 2 === 0 && (
                  <span className="move-number">{Math.floor(index / 2) + 1}.</span>
                )}
                <span className={index % 2 === 0 ? 'white-move' : 'black-move'}>
                  {move.san || `${move.from}-${move.to}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
