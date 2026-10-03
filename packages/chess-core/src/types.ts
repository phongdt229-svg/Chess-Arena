export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square = number; // 0..63

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface Position {
  board: (Piece | null)[];
  turn: Color;
  castling: CastlingRights;
  enPassant: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export interface Move {
  from: Square;
  to: Square;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  flags: 'normal' | 'capture' | 'double' | 'enpassant' | 'castleK' | 'castleQ' | 'promotion';
  san?: string;
}

export type GameResult =
  | { status: 'ongoing' }
  | { status: 'checkmate'; winner: Color }
  | { status: 'draw'; reason: 'stalemate' | 'fifty-move' | 'threefold' | 'insufficient' | 'agreement' }
  | { status: 'timeout' | 'resign'; winner: Color };

export interface GameState {
  fen: string;
  history: string[]; // UCI moves
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: Move | null;
  result: GameResult;
  pendingPromotion: { from: Square; to: Square } | null;
}
