import type { Color, Move, PieceType } from '@chess-arena/chess-core';

export interface CapturedGhost {
  id: number; // history length when the capture happened, unique per move
  square: number;
  type: PieceType;
  color: Color;
}

// Describes the piece removed by the move that was just played, or null if the update was not a single new move
export function capturedGhostFor(prevLength: number, history: Move[], sideToMove: Color): CapturedGhost | null {
  const added = history.length - prevLength;
  if (added < 1 || added > 2) return null; // new game, undo or a bulk load
  const last = history[history.length - 1];
  if (!last.captured) return null;

  const mover: Color = sideToMove === 'w' ? 'b' : 'w';
  const square = last.flags === 'enpassant' ? last.to + (mover === 'w' ? -8 : 8) : last.to;
  return { id: history.length, square, type: last.captured, color: mover === 'w' ? 'b' : 'w' };
}
