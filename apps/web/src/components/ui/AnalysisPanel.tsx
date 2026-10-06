import { useGameStore } from '../../store/gameStore';
import { useAnalysisStore } from '../../store/analysisStore';
import { useSettingsStore } from '../../store/settingsStore';

// Hint and evaluation controls; rendered inside the controls panel
export default function AnalysisPanel() {
  const { fen, result, aiThinking, gameMode, playerColor, reviewPly, reviewView } = useGameStore();
  const { hint, hintPending, requestHint } = useAnalysisStore();
  const { showEval, update } = useSettingsStore();

  const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const humanToMove = gameMode !== 'ai' || turn === playerColor;
  const canHint = result.status === 'ongoing' && reviewPly === null && !aiThinking && humanToMove && !hintPending;

  return (
    <>
      <button className="btn-block btn-secondary" onClick={() => void requestHint(reviewView?.fen ?? fen)} disabled={!canHint}>
        {hintPending ? '💡 Thinking…' : '💡 Hint'}
      </button>
      {hint && (
        <p className="hint-line" role="status">
          Suggested move: <strong>{hint.san}</strong>
        </p>
      )}
      <button className="btn-block btn-secondary" onClick={() => update({ showEval: !showEval })} aria-pressed={showEval}>
        {showEval ? '📊 Evaluation: On' : '📊 Evaluation: Off'}
      </button>
    </>
  );
}
