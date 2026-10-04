import { Chess } from 'chess.js';

// Squares a piece on `square` can legally move to in `fen` (used for rule diagrams)
export function moveTargets(fen: string, square: string): string[] {
  const chess = new Chess(fen);
  return chess.moves({ square: square as any, verbose: true }).map((m) => m.to);
}

export function fenAfter(startFen: string | undefined, sanMoves: string[]): { fen: string; from?: string; to?: string } {
  const chess = new Chess(startFen);
  let last: { from: string; to: string } | undefined;
  for (const san of sanMoves) {
    const m = chess.move(san);
    last = { from: m.from, to: m.to };
  }
  return { fen: chess.fen(), ...last };
}
