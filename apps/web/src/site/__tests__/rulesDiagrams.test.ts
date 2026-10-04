import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { PIECE_DIAGRAMS, SPECIAL } from '../pages/Rules';
import { moveTargets } from '../chessHelpers';

const EXPECTED_TARGETS: Record<string, number> = {
  Vua: 8,
  Hậu: 27,
  Xe: 14,
  Tượng: 13,
  Mã: 8,
  'Tốt (đi và ăn)': 3,
  'Tốt (nước đầu)': 2,
};

describe('rule diagrams show correct moves', () => {
  it.each(PIECE_DIAGRAMS)('$name: expected number of target squares', (d) => {
    expect(moveTargets(d.fen, d.square)).toHaveLength(EXPECTED_TARGETS[d.name]);
  });

  it('every diagram FEN is a valid position', () => {
    for (const d of [...PIECE_DIAGRAMS, ...SPECIAL]) expect(() => new Chess(d.fen)).not.toThrow();
  });

  it('castling dots are real castling moves', () => {
    const castle = SPECIAL.find((d) => d.name === 'Nhập thành')!;
    const targets = moveTargets(castle.fen, castle.square);
    for (const sq of castle.dots!) expect(targets).toContain(sq);
    const moves = new Chess(castle.fen).moves({ square: 'e1' as any });
    expect(moves).toEqual(expect.arrayContaining(['O-O', 'O-O-O']));
  });

  it('en passant and promotion diagrams offer the special move', () => {
    const ep = SPECIAL.find((d) => d.name.startsWith('Bắt Tốt'))!;
    expect(moveTargets(ep.fen, ep.square)).toContain('d6');
    const promo = SPECIAL.find((d) => d.name === 'Phong cấp')!;
    expect(moveTargets(promo.fen, promo.square)).toContain('e8');
  });

  it('mate and stalemate illustrations are what they claim', () => {
    expect(new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3').isCheckmate()).toBe(true);
    expect(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').isStalemate()).toBe(true);
  });
});
