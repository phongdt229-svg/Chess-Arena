import type { SavedGame } from '../../persistence/savedGame';
import './NewGameDialog.css';

interface ResumeDialogProps {
  save: SavedGame;
  onResume: () => void;
  onDiscard: () => void;
}

export default function ResumeDialog({ save, onResume, onDiscard }: ResumeDialogProps) {
  const moves = Math.ceil((save.pgn.match(/\d+\./g) ?? []).length);
  const when = new Date(save.savedAt).toLocaleString();

  return (
    <div className="dialog-overlay">
      <div className="dialog-content" role="dialog" aria-label="Resume game">
        <h2>Resume your game?</h2>
        <p>
          You have an unfinished {save.mode === 'ai' ? `game against the AI (level ${save.aiLevel})` : 'local game'}
          {moves > 0 ? ` with ${moves} move${moves === 1 ? '' : 's'}` : ''}, saved {when}.
        </p>
        <div className="dialog-actions">
          <button onClick={onDiscard} className="btn-cancel">
            Start fresh
          </button>
          <button onClick={onResume} className="btn-start">
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
