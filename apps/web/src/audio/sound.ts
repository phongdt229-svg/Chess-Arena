export type SoundKind = 'move' | 'capture' | 'check' | 'end';

interface SoundSnapshot {
  history: { san?: string; captured?: string }[];
  result: { status: string };
}

// Decide which sound (if any) a store update should trigger
export function soundForTransition(prev: SoundSnapshot, next: SoundSnapshot): SoundKind | null {
  const wasOngoing = prev.result.status === 'ongoing';
  if (wasOngoing && next.result.status !== 'ongoing') return 'end';

  const added = next.history.length - prev.history.length;
  if (added < 1 || added > 2) return null; // new game, undo, or a bulk load
  const last = next.history[next.history.length - 1];
  if (last.san?.includes('+')) return 'check';
  if (last.captured || last.san?.includes('x')) return 'capture';
  return 'move';
}

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, type: OscillatorType, from: number, to: number, start: number, dur: number, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(c: AudioContext, start: number, dur: number, gain: number) {
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  const g = c.createGain();
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(g).connect(c.destination);
  src.start(start);
}

export function playSound(kind: SoundKind): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime;
  switch (kind) {
    case 'move':
      tone(c, 'triangle', 240, 110, t, 0.09, 0.3);
      break;
    case 'capture':
      tone(c, 'triangle', 170, 70, t, 0.13, 0.4);
      noise(c, t, 0.07, 0.25);
      break;
    case 'check':
      tone(c, 'sine', 880, 880, t, 0.1, 0.25);
      tone(c, 'sine', 660, 660, t + 0.11, 0.14, 0.25);
      break;
    case 'end':
      [523, 392, 262].forEach((f, i) => tone(c, 'sine', f, f, t + i * 0.16, 0.22, 0.28));
      break;
  }
}
