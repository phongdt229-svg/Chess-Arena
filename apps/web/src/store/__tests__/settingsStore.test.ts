import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS, sanitizeSettings, useSettingsStore } from '../settingsStore';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
});

describe('sanitizeSettings', () => {
  it('keeps valid values and replaces invalid ones with defaults', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('x')).toEqual(DEFAULT_SETTINGS);
    expect(
      sanitizeSettings({ soundEnabled: false, showEval: true, defaultView: '3d', defaultMode: 'ai', defaultColor: 'b', defaultLevel: 5, defaultTime: '5+0' }),
    ).toEqual({ soundEnabled: false, showEval: true, defaultView: '3d', defaultMode: 'ai', defaultColor: 'b', defaultLevel: 5, defaultTime: '5+0' });
    expect(sanitizeSettings({ defaultLevel: 99, defaultTime: 'nope', defaultView: 'vr', defaultMode: 'online', defaultColor: 'x', soundEnabled: 'yes', showEval: 'yes' })).toEqual(
      DEFAULT_SETTINGS,
    );
  });
});

describe('settings store', () => {
  it('persists updates and validates them', () => {
    useSettingsStore.getState().update({ defaultLevel: 5, defaultView: '3d' });
    expect(useSettingsStore.getState().defaultLevel).toBe(5);
    expect(JSON.parse(localStorage.getItem('chess-arena-settings')!)).toMatchObject({ defaultLevel: 5, defaultView: '3d' });
    useSettingsStore.getState().update({ defaultLevel: 42 });
    expect(useSettingsStore.getState().defaultLevel).toBe(DEFAULT_SETTINGS.defaultLevel);
  });

  it('toggleSound flips and persists; reset restores defaults', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
    expect(JSON.parse(localStorage.getItem('chess-arena-settings')!).soundEnabled).toBe(false);
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });
});
