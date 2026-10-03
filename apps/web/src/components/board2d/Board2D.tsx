import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameEngine } from '@chess-arena/chess-core';
import Square from './Square';
import PromotionDialog from './PromotionDialog';
import './Board2D.css';

export default function Board2D() {
  const { engine, selectedSquare, legalMoves, lastMove, orientation, pendingPromotion } =
    useGameStore();
  const [board, setBoard] = useState<(any | null)[]>(Array(64).fill(null));

  useEffect(() => {
    if (!engine) return;

    const fen = engine.getFEN();
    const parts = fen.split(' ');
    const boardStr = parts[0];

    const newBoard: (any | null)[] = Array(64).fill(null);
    let squareIndex = 0;

    for (const char of boardStr) {
      if (char === '/') continue;
      if (!isNaN(Number(char))) {
        squareIndex += Number(char);
      } else {
        const isWhite = char === char.toUpperCase();
        const type = char.toLowerCase();
        newBoard[squareIndex] = { type, color: isWhite ? 'w' : 'b' };
        squareIndex++;
      }
    }

    setBoard(newBoard);
  }, [engine]);

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      let squareIndex = rank * 8 + file;

      if (orientation === 'b') {
        squareIndex = (7 - rank) * 8 + (7 - file);
      }

      squares.push(squareIndex);
    }
  }

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const isLastMoveSquare = (sq: number) => lastMove?.from === sq || lastMove?.to === sq;

  return (
    <div className="board-2d">
      <div className="board-grid">
        {squares.map((sq) => (
          <Square
            key={sq}
            index={sq}
            piece={board[sq]}
            isSelected={sq === selectedSquare}
            isLegalTarget={isLegalTarget(sq)}
            isLastMove={isLastMoveSquare(sq)}
            isInCheck={false}
          />
        ))}
      </div>

      {pendingPromotion && <PromotionDialog promotion={pendingPromotion} />}
    </div>
  );
}
