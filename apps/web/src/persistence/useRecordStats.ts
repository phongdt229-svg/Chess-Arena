import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { outcomeForTransition, recordGame } from './stats';

export function useRecordStats(userId: number | undefined) {
  useEffect(() => {
    if (userId === undefined) return;
    return useGameStore.subscribe((next, prev) => {
      const finished = outcomeForTransition(prev, next);
      if (finished) recordGame(userId, finished.mode, finished.outcome);
    });
  }, [userId]);
}
