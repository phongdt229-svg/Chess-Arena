import { useGameStore } from '../../store/gameStore';
import MoveHistory from './MoveHistory';
import GameStatus from './GameStatus';
import './Controls.css';

export default function Controls() {
  const { undo, redo, flipBoard, newGame, history, redoStack } = useGameStore();

  return (
    <div className="controls">
      <GameStatus />

      <div className="control-panel">
        <button className="btn-block btn-secondary" onClick={undo} disabled={history.length === 0}>
          ↶ Undo
        </button>
        <button className="btn-block btn-secondary" onClick={redo} disabled={redoStack.length === 0}>
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
