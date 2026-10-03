import { Chess } from 'chess.js';

export interface EngineOptions {
  depth: number;
  randomness: number; // 0-100, chance to play suboptimal move
  timeMs?: number; // max time in ms
}

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const PIECE_SQUARE_TABLES: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15,
    20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10,
    5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
    -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0,
    0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0,
    -5, 0, 0, 5, 5, 5, 5, 0, 0, -10, 0, 5, 5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
    -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10,
    20, 30, 10, 0, 0, 10, 30, 20, 30, 40, 30, 20, 20, 30, 40, 30,
  ],
};

function getPieceSquareBonus(piece: string, square: number, isWhite: boolean): number {
  const table = PIECE_SQUARE_TABLES[piece.toLowerCase()];
  if (!table) return 0;
  const idx = isWhite ? square : 63 - square;
  return table[idx] || 0;
}

function evaluatePosition(chess: Chess): number {
  const board = chess.board();
  let score = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const idx = rank * 8 + file;
      const pieceValue = PIECE_VALUES[piece.type] || 0;
      const psTable = getPieceSquareBonus(piece.type, idx, isWhite);
      const positionScore = pieceValue + psTable;

      score += isWhite ? positionScore : -positionScore;
    }
  }

  // Checkmate detection
  if (chess.isCheckmate()) {
    const turn = chess.turn();
    return turn === 'w' ? -30000 : 30000;
  }

  return score;
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  startTime: number,
  timeLimit: number
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  // Check time limit
  if (Date.now() - startTime > timeLimit) {
    return evaluatePosition(chess);
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return evaluatePosition(chess);
  }

  // Sort moves: captures first, promotions first
  moves.sort((a: any, b: any) => {
    const aScore = (b.captured ? PIECE_VALUES[b.captured] : 0) + (b.promotion ? 1000 : 0);
    const bScore = (a.captured ? PIECE_VALUES[a.captured] : 0) + (a.promotion ? 1000 : 0);
    return aScore - bScore;
  });

  let maxEval = -Infinity;

  for (const move of moves) {
    chess.move(move as any);
    const evaluation = -negamax(chess, depth - 1, -beta, -alpha, !isMaximizing, startTime, timeLimit);
    chess.undo();

    maxEval = Math.max(maxEval, evaluation);
    alpha = Math.max(alpha, evaluation);

    if (alpha >= beta) break; // Beta cutoff
  }

  return maxEval;
}

export function findBestMove(fen: string, options: EngineOptions): string {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return ''; // No legal moves

  const startTime = Date.now();
  const timeLimit = options.timeMs || 1000;

  // Score each move
  const scoredMoves = moves.map((move: any) => {
    chess.move(move);
    const score = -negamax(chess, options.depth - 1, -Infinity, Infinity, false, startTime, timeLimit);
    chess.undo();
    return { move, score };
  });

  // Handle randomness
  if (options.randomness > 0 && Math.random() < options.randomness / 100) {
    // Play random move among top moves
    const sorted = scoredMoves.sort((a: any, b: any) => b.score - a.score);
    const threshold = sorted[0].score - 100; // Within 1 pawn
    const suboptimalMoves = sorted.filter((m: any) => m.score >= threshold);
    const random = suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
    return `${random.move.from}${random.move.to}${random.move.promotion || ''}`;
  }

  // Play best move
  const best = scoredMoves.reduce((a: any, b: any) => (a.score > b.score ? a : b));
  return `${best.move.from}${best.move.to}${best.move.promotion || ''}`;
}
