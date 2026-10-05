import { create } from 'zustand';
import { TIME_CONTROLS } from './clock';

const SETTINGS_KEY = 'chess-arena-settings';
const LEGACY_SOUND_KEY = 'chess-arena-sound';

export interface Settings {
  soundEnabled: boolean;
  showEval: boolean;
  defaultView: '2d' | '3d';
  defaultMode: 'local' | 'ai';
  defaultColor: 'w' | 'b' | 'random';
  defaultLevel: number;
  defaultTime: string;
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  showEval: false,
  defaultView: '2d',
  defaultMode: 'local',
  defaultColor: 'random',
  defaultLevel: 3,
  defaultTime: 'none',
};

// Accepts anything read from storage and keeps only valid fields, so a corrupt entry cannot break the app
export function sanitizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    soundEnabled: typeof r.soundEnabled === 'boolean' ? r.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    showEval: typeof r.showEval === 'boolean' ? r.showEval : DEFAULT_SETTINGS.showEval,
    defaultView: r.defaultView === '3d' ? '3d' : '2d',
    defaultMode: r.defaultMode === 'ai' ? 'ai' : 'local',
    defaultColor: r.defaultColor === 'w' || r.defaultColor === 'b' ? r.defaultColor : 'random',
    defaultLevel:
      typeof r.defaultLevel === 'number' && Number.isInteger(r.defaultLevel) && r.defaultLevel >= 1 && r.defaultLevel <= 6
        ? r.defaultLevel
        : DEFAULT_SETTINGS.defaultLevel,
    defaultTime: TIME_CONTROLS.some((t) => t.id === r.defaultTime) ? (r.defaultTime as string) : DEFAULT_SETTINGS.defaultTime,
  };
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return sanitizeSettings(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_SOUND_KEY);
    return { ...DEFAULT_SETTINGS, soundEnabled: legacy !== 'off' };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function save(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // the preference lasts for this session only
  }
}

interface SettingsState extends Settings {
  toggleSound: () => void;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const pick = (s: SettingsState): Settings => ({
  soundEnabled: s.soundEnabled,
  showEval: s.showEval,
  defaultView: s.defaultView,
  defaultMode: s.defaultMode,
  defaultColor: s.defaultColor,
  defaultLevel: s.defaultLevel,
  defaultTime: s.defaultTime,
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...load(),
  toggleSound: () => get().update({ soundEnabled: !get().soundEnabled }),
  update: (patch) => {
    set(sanitizeSettings({ ...pick(get()), ...patch }));
    save(pick(get()));
  },
  reset: () => {
    set(DEFAULT_SETTINGS);
    save(DEFAULT_SETTINGS);
  },
}));
