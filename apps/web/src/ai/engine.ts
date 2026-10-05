import { Chess, type Move } from 'chess.js';

export interface EngineOptions {
  depth: number;
  randomness: number; // 0-100, chance to play suboptimal move
  timeMs?: number; // max time in ms
}

const MATE_SCORE = 30000;

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
    return turn === 'w' ? -MATE_SCORE : MATE_SCORE;
  }

  return score;
}

// Score from the point of view of the side to move (negamax convention)
function evaluateForSideToMove(chess: Chess, depth: number): number {
  if (chess.isCheckmate()) return -(MATE_SCORE + depth); // sooner mates score higher
  if (chess.isGameOver()) return 0;
  return chess.turn() === 'w' ? evaluatePosition(chess) : -evaluatePosition(chess);
}

export function evaluateFen(fen: string): number {
  return evaluatePosition(new Chess(fen));
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
    return evaluateForSideToMove(chess, depth);
  }

  if (Date.now() - startTime > timeLimit) {
    return evaluateForSideToMove(chess, depth);
  }

  const moves = chess.moves({ verbose: true });

  // Sort moves: captures first, promotions first
  moves.sort((a: Move, b: Move) => {
    const aScore = (b.captured ? PIECE_VALUES[b.captured] : 0) + (b.promotion ? 1000 : 0);
    const bScore = (a.captured ? PIECE_VALUES[a.captured] : 0) + (a.promotion ? 1000 : 0);
    return aScore - bScore;
  });

  let maxEval = -Infinity;

  for (const move of moves) {
    chess.move(move);
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
  const scoredMoves = moves.map((move: Move) => {
    chess.move(move);
    const score = -negamax(chess, options.depth - 1, -Infinity, Infinity, false, startTime, timeLimit);
    chess.undo();
    return { move, score };
  });

  // Handle randomness
  if (options.randomness > 0 && Math.random() < options.randomness / 100) {
    // Play random move among top moves
    const sorted = scoredMoves.sort((a, b) => b.score - a.score);
    const threshold = sorted[0].score - 100; // Within 1 pawn
    const suboptimalMoves = sorted.filter((m) => m.score >= threshold);
    const random = suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
    return `${random.move.from}${random.move.to}${random.move.promotion || ''}`;
  }

  // Play best move
  const best = scoredMoves.reduce((a, b) => (a.score > b.score ? a : b));
  return `${best.move.from}${best.move.to}${best.move.promotion || ''}`;
}

export interface Analysis {
  move: string; // best move in UCI, '' when the game is over
  score: number; // centipawns from White's point of view (mate scores are about ±30000)
  mate: number | null; // signed moves to mate (positive: White mates), 0 when the side to move is already mated
  depth: number; // deepest fully searched depth
}

class SearchTimeout extends Error {}

function orderedMoves(chess: Chess) {
  const moves = chess.moves({ verbose: true });
  const value = (m: Move) => (m.captured ? PIECE_VALUES[m.captured] : 0) + (m.promotion ? 1000 : 0);
  return moves.sort((a, b) => value(b) - value(a));
}

// Alpha-beta that gives up (by throwing) once the deadline passes, so a half-finished depth can be discarded
function abortableSearch(chess: Chess, depth: number, alpha: number, beta: number, clock: { deadline: number; nodes: number }): number {
  if ((++clock.nodes & 255) === 0 && Date.now() > clock.deadline) throw new SearchTimeout();
  if (depth === 0 || chess.isGameOver()) return evaluateForSideToMove(chess, depth);

  let best = -Infinity;
  for (const move of orderedMoves(chess)) {
    chess.move(move);
    const value = -abortableSearch(chess, depth - 1, -beta, -alpha, clock);
    chess.undo();
    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function matesFrom(score: number, searchedDepth: number): number | null {
  if (Math.abs(score) < MATE_SCORE) return null;
  const remaining = Math.abs(score) - MATE_SCORE; // depth left when the mate was found
  const plies = Math.max(1, searchedDepth - remaining);
  return Math.sign(score) * Math.ceil(plies / 2);
}

// Iterative deepening: always reports the deepest depth that finished inside the time budget
export function analyse(fen: string, options: { maxDepth: number; timeMs: number }): Analysis {
  const root = new Chess(fen);
  const whiteToMove = root.turn() === 'w';
  const toWhite = (score: number) => (whiteToMove ? score : -score);

  if (root.isCheckmate()) return { move: '', score: toWhite(-MATE_SCORE), mate: 0, depth: 0 };
  if (root.isGameOver()) return { move: '', score: 0, mate: null, depth: 0 };

  const clock = { deadline: Date.now() + options.timeMs, nodes: 0 };
  let result: Analysis | null = null;
  let rootOrder = orderedMoves(root).map((m) => `${m.from}${m.to}${m.promotion ?? ''}`);

  for (let depth = 1; depth <= options.maxDepth; depth++) {
    const chess = new Chess(fen);
    const byUci = new Map<string, Move>(chess.moves({ verbose: true }).map((m) => [`${m.from}${m.to}${m.promotion ?? ''}`, m]));
    let best: { uci: string; score: number } | null = null;
    let alpha = -Infinity;
    try {
      for (const uci of rootOrder) {
        chess.move(byUci.get(uci)!);
        const score = -abortableSearch(chess, depth - 1, -Infinity, -alpha, clock);
        chess.undo();
        if (!best || score > best.score) best = { uci, score };
        alpha = Math.max(alpha, score);
      }
    } catch (e) {
      if (e instanceof SearchTimeout) break;
      throw e;
    }
    if (!best) break;
    result = { move: best.uci, score: toWhite(best.score), mate: matesFrom(toWhite(best.score), depth), depth };
    rootOrder = [best.uci, ...rootOrder.filter((u) => u !== best!.uci)]; // search the previous best first next time
    if (matesFrom(best.score, depth) !== null) break; // a forced mate cannot be improved by looking deeper
  }

  // Not even depth 1 finished (absurdly short budget): fall back to any legal move
  return result ?? { move: rootOrder[0], score: 0, mate: null, depth: 0 };
}
