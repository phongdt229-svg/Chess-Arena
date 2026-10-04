import { Chess } from 'chess.js';
import './StaticBoard.css';

const GLYPH: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };

interface StaticBoardProps {
  fen: string;
  orientation?: 'w' | 'b';
  dots?: string[]; // squares marked with a dot, e.g. ['e4']
  highlights?: string[]; // squares tinted as the last move
  label?: string;
  className?: string;
}

// Read-only board for illustrations; interactive play lives in Board2D/Board3D
export default function StaticBoard({ fen, orientation = 'w', dots = [], highlights = [], label, className = '' }: StaticBoardProps) {
  let board;
  try {
    board = new Chess(fen).board();
  } catch {
    return null;
  }

  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const ranks = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className={`static-board ${className}`} role="img" aria-label={label ?? 'Bàn cờ minh hoạ'}>
      {ranks.map((r) =>
        files.map((f) => {
          const name = `${String.fromCharCode(97 + f)}${8 - r}`;
          const piece = board[r][f];
          const dark = (r + f) % 2 === 1;
          return (
            <div key={name} className={`sb-sq ${dark ? 'dark' : 'light'} ${highlights.includes(name) ? 'hl' : ''}`}>
              {piece && <span className={`sb-piece ${piece.color === 'w' ? 'white' : 'black'}`}>{GLYPH[piece.type]}</span>}
              {dots.includes(name) && <span className={`sb-dot ${piece ? 'capture' : ''}`} />}
            </div>
          );
        }),
      )}
    </div>
  );
}
