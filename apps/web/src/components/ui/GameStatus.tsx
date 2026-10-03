import { useGameStore } from '../../store/gameStore';
import './GameStatus.css';

export default function GameStatus() {
  const { engine, result } = useGameStore();

  if (!engine) return null;

  const turn = engine.getCurrentTurn();

  return (
    <div className="game-status">
      <div className="status-box">
        <div className="status-label">To Move</div>
        <div className="status-value">{turn === 'w' ? '♔ White' : '♚ Black'}</div>
      </div>

      {result.status !== 'ongoing' && (
        <div className="status-box result">
          <div className="status-label">Result</div>
          <div className="status-value">
            {result.status === 'checkmate' && `Checkmate! ${result.winner === 'w' ? 'White' : 'Black'} wins`}
            {result.status === 'draw' && `Draw (${result.reason})`}
            {result.status === 'resign' && `${result.winner === 'w' ? 'White' : 'Black'} wins by resignation`}
          </div>
        </div>
      )}

      <div className="fen-display">
        <div className="fen-label">FEN</div>
        <div className="fen-value">{engine.getFEN()}</div>
      </div>
    </div>
  );
}
