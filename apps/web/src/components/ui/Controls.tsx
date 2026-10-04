import { useGameStore } from '../../store/gameStore';
import MoveHistory from './MoveHistory';
import GameStatus from './GameStatus';
import ClockPanel from './ClockPanel';
import './Controls.css';

interface ControlsProps {
  onNewGameClick?: () => void;
}

export default function Controls({ onNewGameClick }: ControlsProps) {
  const { undo, redo, flipBoard, history, redoStack } = useGameStore();

  return (
    <div className="controls">
      <ClockPanel />
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
        <button className="btn-block btn-primary" onClick={onNewGameClick}>
          ♻ New Game
        </button>
      </div>

      <MoveHistory />
    </div>
  );
}
