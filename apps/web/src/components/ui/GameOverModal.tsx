import { useGameStore } from '../../store/gameStore';
import './GameOverModal.css';

export default function GameOverModal() {
  const { result, newGame, lastOptions } = useGameStore();

  if (result.status === 'ongoing') return null;

  const getResultText = (): string => {
    if (result.status === 'checkmate') {
      return `Checkmate! ${result.winner === 'w' ? '♔ White' : '♚ Black'} wins`;
    }
    if (result.status === 'draw') {
      const reasons: Record<string, string> = {
        stalemate: 'Stalemate',
        'fifty-move': '50-move rule',
        threefold: 'Threefold repetition',
        insufficient: 'Insufficient material',
        agreement: 'Draw by agreement',
      };
      return `Draw: ${reasons[result.reason as string] || result.reason}`;
    }
    if (result.status === 'resign') {
      return `${result.winner === 'w' ? '♔ White' : '♚ Black'} wins by resignation`;
    }
    if (result.status === 'timeout') {
      return `${result.winner === 'w' ? '♔ White' : '♚ Black'} wins by timeout`;
    }
    return 'Game Over';
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2>Game Over</h2>
        <p className="result-text">{getResultText()}</p>
        <button className="btn-primary btn-large" onClick={() => newGame(lastOptions || { mode: 'local' })}>
          ♻ Play Again
        </button>
      </div>
    </div>
  );
}
