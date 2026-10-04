import type { Color } from '@chess-arena/chess-core';
import type { ClockState } from '../store/clock';

export interface SavedGame {
  v: 1;
  pgn: string;
  fen: string;
  mode: 'local' | 'ai';
  playerColor: Color;
  aiLevel: number;
  orientation: Color;
  clock: ClockState;
  savedAt: number;
}

const keyFor = (userId: number) => `chess-arena-save-${userId}`;

const isColor = (v: unknown): v is Color => v === 'w' || v === 'b';

function isSavedGame(v: any): v is SavedGame {
  return (
    v &&
    v.v === 1 &&
    typeof v.pgn === 'string' &&
    typeof v.fen === 'string' &&
    (v.mode === 'local' || v.mode === 'ai') &&
    isColor(v.playerColor) &&
    isColor(v.orientation) &&
    Number.isInteger(v.aiLevel) &&
    v.aiLevel >= 1 &&
    v.aiLevel <= 6 &&
    v.clock &&
    typeof v.clock.enabled === 'boolean' &&
    Number.isFinite(v.clock.whiteMs) &&
    Number.isFinite(v.clock.blackMs) &&
    Number.isFinite(v.clock.baseMs) &&
    Number.isFinite(v.clock.incrementMs)
  );
}

export function readSave(userId: number): SavedGame | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isSavedGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSave(userId: number, game: SavedGame): void {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(game));
  } catch {
    // storage full or unavailable: the game simply will not be resumable
  }
}

export function clearSave(userId: number): void {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // nothing to clean up
  }
}
