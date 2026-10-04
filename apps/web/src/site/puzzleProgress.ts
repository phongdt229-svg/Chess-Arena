const keyFor = (userId: number) => `chess-arena-puzzles-${userId}`;

export function readSolved(userId: number): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markSolved(userId: number, puzzleId: string): string[] {
  const solved = readSolved(userId);
  if (solved.includes(puzzleId)) return solved;
  const next = [...solved, puzzleId];
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    // progress simply is not remembered
  }
  return next;
}

export function clearSolved(userId: number): void {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // nothing to clear
  }
}
