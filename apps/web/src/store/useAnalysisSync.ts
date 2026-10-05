import { useEffect } from 'react';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
import { useAnalysisStore } from './analysisStore';

// Keeps the evaluation bar and hint in step with the position on the board
export function useAnalysisSync() {
  const displayFen = useGameStore((s) => s.reviewView?.fen ?? s.fen);
  const showEval = useSettingsStore((s) => s.showEval);

  // leaving the game screen drops the bar and any suggestion so other pages never show stale data
  useEffect(
    () => () => {
      const analysis = useAnalysisStore.getState();
      analysis.clearHint();
      analysis.clearEvaluation();
    },
    [],
  );

  useEffect(() => {
    const analysis = useAnalysisStore.getState();
    analysis.clearHint(); // a hint is only valid for the position it was computed for
    if (!showEval) {
      analysis.clearEvaluation();
      return;
    }
    const timer = setTimeout(() => void useAnalysisStore.getState().evaluate(displayFen), 250);
    return () => clearTimeout(timer);
  }, [displayFen, showEval]);
}
