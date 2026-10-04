import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { clearSave, writeSave } from './savedGame';

function persist(userId: number) {
  const { history, result, serializeGame } = useGameStore.getState();
  if (history.length === 0 || result.status !== 'ongoing') {
    clearSave(userId);
    return;
  }
  const save = serializeGame();
  if (save) writeSave(userId, save);
}

// Saves on every move/result/mode change, and once more when the page is hidden so the clock is current
export function useAutoSave(userId: number | undefined, enabled: boolean) {
  useEffect(() => {
    if (userId === undefined || !enabled) return;

    const unsubscribe = useGameStore.subscribe((next, prev) => {
      if (
        next.history !== prev.history ||
        next.result !== prev.result ||
        next.gameMode !== prev.gameMode ||
        next.orientation !== prev.orientation
      ) {
        persist(userId);
      }
    });
    const onHide = () => persist(userId);
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      unsubscribe();
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [userId, enabled]);
}
