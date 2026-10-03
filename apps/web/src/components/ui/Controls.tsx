import { useGameStore } from '../../store/gameStore';
import MoveHistory from './MoveHistory';
import GameStatus from './GameStatus';
import './Controls.css';

export default function Controls() {
  const { engine, undo, redo, flipBoard, newGame } = useGameStore();

  if (!engine) {
    return (
      <div className="controls">
        <div className="control-panel">
          <button className="btn-block btn-primary" onClick={() => newGame({ mode: 'local' })}>
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="controls">
      <GameStatus />

      <div className="control-panel">
        <button className="btn-block btn-secondary" onClick={undo}>
          ↶ Undo
        </button>
        <button className="btn-block btn-secondary" onClick={redo}>
          ↷ Redo
        </button>
        <button className="btn-block btn-secondary" onClick={flipBoard}>
          ⟲ Flip Board
        </button>
        <button className="btn-block btn-primary" onClick={() => newGame({ mode: 'local' })}>
          ♻ New Game
        </button>
      </div>

      <MoveHistory />
    </div>
  );
}
