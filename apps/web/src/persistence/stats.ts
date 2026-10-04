export interface Stats {
  ai: { wins: number; losses: number; draws: number };
  local: { played: number };
}

export type Outcome = 'win' | 'loss' | 'draw';

export const EMPTY_STATS: Stats = { ai: { wins: 0, losses: 0, draws: 0 }, local: { played: 0 } };

const keyFor = (userId: number) => `chess-arena-stats-${userId}`;

const count = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : 0);

export function readStats(userId: number): Stats {
  try {
    const raw = JSON.parse(localStorage.getItem(keyFor(userId)) ?? 'null');
    if (!raw || typeof raw !== 'object') return EMPTY_STATS;
    return {
      ai: { wins: count(raw.ai?.wins), losses: count(raw.ai?.losses), draws: count(raw.ai?.draws) },
      local: { played: count(raw.local?.played) },
    };
  } catch {
    return EMPTY_STATS;
  }
}

// vs-AI games are recorded from the human's side; local games are only counted
export function recordGame(userId: number, mode: 'ai' | 'local', outcome: Outcome): Stats {
  const stats = readStats(userId);
  const next: Stats =
    mode === 'ai'
      ? {
          ...stats,
          ai: {
            wins: stats.ai.wins + (outcome === 'win' ? 1 : 0),
            losses: stats.ai.losses + (outcome === 'loss' ? 1 : 0),
            draws: stats.ai.draws + (outcome === 'draw' ? 1 : 0),
          },
        }
      : { ...stats, local: { played: stats.local.played + 1 } };
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    // stats are best-effort
  }
  return next;
}

export function clearStats(userId: number): void {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // nothing to clear
  }
}

interface Snapshot {
  history: unknown[];
  result: { status: string; winner?: string };
  gameMode: 'local' | 'ai';
  playerColor: 'w' | 'b';
}

// Decides whether a store update is "a game just finished" and from whose side. Imports that arrive
// already finished (many plies appear at once) and games with no moves are not counted.
export function outcomeForTransition(prev: Snapshot, next: Snapshot): { mode: 'ai' | 'local'; outcome: Outcome } | null {
  if (prev.result.status !== 'ongoing' || next.result.status === 'ongoing') return null;
  if (next.history.length === 0 || next.history.length - prev.history.length > 2) return null;
  if (next.gameMode === 'local') return { mode: 'local', outcome: 'draw' };
  const winner = next.result.winner;
  return { mode: 'ai', outcome: !winner ? 'draw' : winner === next.playerColor ? 'win' : 'loss' };
}
