export interface TimeControl {
  baseMs: number;
  incrementMs: number;
}

export interface ClockState {
  enabled: boolean;
  baseMs: number;
  incrementMs: number;
  whiteMs: number;
  blackMs: number;
}

export const NO_CLOCK: ClockState = { enabled: false, baseMs: 0, incrementMs: 0, whiteMs: 0, blackMs: 0 };

export const TIME_CONTROLS: { id: string; label: string; control: TimeControl | null }[] = [
  { id: 'none', label: 'Unlimited', control: null },
  { id: '1+0', label: '1 min', control: { baseMs: 60_000, incrementMs: 0 } },
  { id: '3+0', label: '3 min', control: { baseMs: 180_000, incrementMs: 0 } },
  { id: '3+2', label: '3 min + 2s', control: { baseMs: 180_000, incrementMs: 2_000 } },
  { id: '5+0', label: '5 min', control: { baseMs: 300_000, incrementMs: 0 } },
  { id: '10+0', label: '10 min', control: { baseMs: 600_000, incrementMs: 0 } },
  { id: '15+10', label: '15 min + 10s', control: { baseMs: 900_000, incrementMs: 10_000 } },
];

export function makeClock(control: TimeControl | null | undefined): ClockState {
  if (!control) return NO_CLOCK;
  return { enabled: true, ...control, whiteMs: control.baseMs, blackMs: control.baseMs };
}

export function formatClock(ms: number): string {
  const clamped = Math.max(0, ms);
  if (clamped < 10_000) return (Math.ceil(clamped / 100) / 10).toFixed(1);
  const total = Math.ceil(clamped / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
