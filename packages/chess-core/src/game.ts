import { Chess, type Move as ChessJsMove } from 'chess.js';
import type { Color, Move, GameResult, Square } from './types';

export class GameEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  static create(fen?: string): GameEngine {
    return new GameEngine(fen);
  }

  getFEN(): string {
    return this.chess.fen();
  }

  loadFEN(fen: string): void {
    this.chess.load(fen);
  }

  loadPGN(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  toPGN(): string {
    return this.chess.pgn();
  }

  getCurrentTurn(): Color {
    return this.chess.turn();
  }

  isInCheck(): boolean {
    return this.chess.isCheck();
  }

  isInCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isInStalemate(): boolean {
    return this.chess.isStalemate();
  }

  isInDraw(): boolean {
    return this.chess.isDraw();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  legalMoves(from?: string): Move[] {
    const moves = from ? this.chess.moves({ square: from as any, verbose: true }) : this.chess.moves({ verbose: true });
    return moves.map((m) => this.convertMove(m));
  }

  makeMove(uci: string): Move | null {
    try {
      const move = this.chess.move(uci, { strict: false });
      if (!move) return null;
      return this.convertMove(move);
    } catch {
      return null;
    }
  }

  undo(): Move | null {
    const move = this.chess.undo();
    return move ? this.convertMove(move) : null;
  }

  reset(): void {
    this.chess.reset();
  }

  getMoveHistory(): string[] {
    return this.chess.history();
  }

  hasInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  getHalfmoveClock(): number {
    const fen = this.chess.fen();
    const parts = fen.split(' ');
    return parseInt(parts[4], 10);
  }

  getGameResult(): GameResult {
    if (!this.chess.isGameOver()) {
      return { status: 'ongoing' };
    }

    if (this.chess.isCheckmate()) {
      const winner = this.chess.turn() === 'w' ? 'b' : 'w';
      return { status: 'checkmate', winner };
    }

    if (this.chess.isStalemate()) {
      return { status: 'draw', reason: 'stalemate' };
    }

    if (this.getHalfmoveClock() >= 100) {
      return { status: 'draw', reason: 'fifty-move' };
    }

    if (this.isThreefoldRepetition()) {
      return { status: 'draw', reason: 'threefold' };
    }

    if (this.hasInsufficientMaterial()) {
      return { status: 'draw', reason: 'insufficient' };
    }

    return { status: 'ongoing' };
  }

  perft(depth: number): number {
    return this.chess.perft(depth);
  }

  private convertMove(move: ChessJsMove): Move {
    const fromIndex = this.squareToIndex(move.from);
    const toIndex = this.squareToIndex(move.to);

    let flags: Move['flags'] = 'normal';
    if (move.isCapture()) flags = 'capture';
    if (move.isEnPassant()) flags = 'enpassant';
    if (move.isKingsideCastle()) flags = 'castleK';
    if (move.isQueensideCastle()) flags = 'castleQ';
    if (move.isPromotion()) flags = 'promotion';
    if (move.isBigPawn()) flags = 'double';

    return {
      from: fromIndex,
      to: toIndex,
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion,
      flags,
      san: move.san,
    };
  }

  private squareToIndex(square: string): Square {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1], 10) - 1;
    return rank * 8 + file;
  }
}
