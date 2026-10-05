import { useGameStore } from '../../store/gameStore';
import { useAnalysisStore } from '../../store/analysisStore';
import { useSettingsStore } from '../../store/settingsStore';
import './EvalBar.css';

// Share of the bar that belongs to White: a logistic curve, so +4 is already nearly decisive
export function whiteShare(score: number, mate: number | null): number {
  if (mate !== null) return mate > 0 || (mate === 0 && score > 0) ? 100 : 0;
  const share = 100 / (1 + Math.exp(-score / 400));
  return Math.min(97, Math.max(3, share));
}

export function evalLabel(score: number, mate: number | null): string {
  if (mate !== null) return mate === 0 ? 'Mate' : `M${Math.abs(mate)}`;
  const pawns = score / 100;
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
}

export default function EvalBar({ floating = false }: { floating?: boolean }) {
  const enabled = useSettingsStore((s) => s.showEval);
  const evaluation = useAnalysisStore((s) => s.evaluation);
  const orientation = useGameStore((s) => s.orientation);
  if (!enabled) return null;

  const share = evaluation ? whiteShare(evaluation.score, evaluation.mate) : 50;
  const label = evaluation ? evalLabel(evaluation.score, evaluation.mate) : '…';
  const whiteWinning = evaluation ? evaluation.score > 0 : true;
  const flipped = orientation === 'b'; // White is drawn at the top when Black sits at the bottom
  const text = evaluation
    ? `Evaluation ${label}, ${whiteWinning ? 'White' : 'Black'} is better`.replace(/, (White|Black) is better$/, evaluation.score === 0 ? ', equal' : ', $1 is better')
    : 'Evaluation loading';

  return (
    <div className={`eval-bar ${floating ? 'floating' : ''} ${flipped ? 'flipped' : ''}`} role="img" aria-label={text} title={text}>
      <div className="eval-white" style={{ height: `${share}%` }} />
      <span className={`eval-label ${whiteWinning ? 'on-white' : 'on-black'}`}>{label}</span>
    </div>
  );
}
