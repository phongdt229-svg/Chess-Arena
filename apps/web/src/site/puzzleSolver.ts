import { Chess } from 'chess.js';

const uci = (m: { from: string; to: string; promotion?: string }) => `${m.from}${m.to}${m.promotion ?? ''}`;

// Can the side to move force checkmate within `n` of its own moves?
export function canForceMate(chess: Chess, n: number): boolean {
  if (n < 1) return false;
  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    let mates: boolean;
    if (chess.isCheckmate()) {
      mates = true;
    } else if (n === 1 || chess.isGameOver()) {
      mates = false;
    } else {
      mates = true;
      for (const reply of chess.moves({ verbose: true })) {
        chess.move(reply);
        const ok = canForceMate(chess, n - 1);
        chess.undo();
        if (!ok) {
          mates = false;
          break;
        }
      }
    }
    chess.undo();
    if (mates) return true;
  }
  return false;
}

// All first moves (UCI) after which the side to move mates within `n` moves
export function forcedMateMoves(fen: string, n: number): string[] {
  const chess = new Chess(fen);
  const result: string[] = [];
  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    let mates: boolean;
    if (chess.isCheckmate()) {
      mates = true;
    } else if (n === 1 || chess.isGameOver()) {
      mates = false;
    } else {
      mates = chess.moves({ verbose: true }).every((reply) => {
        chess.move(reply);
        const ok = canForceMate(chess, n - 1);
        chess.undo();
        return ok;
      });
    }
    chess.undo();
    if (mates) result.push(uci(move));
  }
  return result;
}

// The defender's most stubborn reply: the one that delays mate the longest
export function stubbornestReply(fen: string, mateWithin: number): string | null {
  const chess = new Chess(fen);
  let best: { move: string; depth: number } | null = null;
  for (const reply of chess.moves({ verbose: true })) {
    chess.move(reply);
    let depth = 1;
    if (!chess.isCheckmate()) {
      depth = mateWithin + 1;
      for (let d = 1; d <= mateWithin; d++) {
        if (canForceMate(chess, d)) {
          depth = d;
          break;
        }
      }
    }
    chess.undo();
    if (!best || depth > best.depth) best = { move: uci(reply), depth };
  }
  return best?.move ?? null;
}
