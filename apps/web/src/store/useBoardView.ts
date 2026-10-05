import { useGameStore } from './gameStore';

// What the boards draw: the live position, or a past one while the user is reviewing the move list
export function useBoardView() {
  const s = useGameStore();
  const v = s.reviewView;
  return {
    reviewing: v !== null,
    board: v ? v.board : s.board,
    lastMoveFrom: v ? v.lastMoveFrom : s.lastMoveFrom,
    lastMoveTo: v ? v.lastMoveTo : s.lastMoveTo,
    inCheckSquare: v ? v.inCheckSquare : s.inCheckSquare,
    selectedSquare: v ? null : s.selectedSquare,
    legalMoves: v ? [] : s.legalMoves,
  };
}
