import { create } from 'zustand';

const SOUND_KEY = 'chess-arena-sound';

function readSound(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

interface SettingsState {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: readSound(),
  toggleSound: () => {
    const next = !get().soundEnabled;
    set({ soundEnabled: next });
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      // preference lasts for this session only
    }
  },
}));
