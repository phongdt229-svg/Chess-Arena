import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { playSound, soundForTransition } from './sound';

export function useGameSounds() {
  useEffect(
    () =>
      useGameStore.subscribe((next, prev) => {
        if (!useSettingsStore.getState().soundEnabled) return;
        const kind = soundForTransition(prev, next);
        if (kind) playSound(kind);
      }),
    [],
  );
}
