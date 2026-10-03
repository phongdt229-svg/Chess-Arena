import { describe, it, expect } from 'vitest';
import { GameEngine } from '../game';

describe('Perft Tests', () => {
  describe('starting position', () => {
    it('perft depth 1 should have 20 moves', () => {
      const engine = GameEngine.create();
      expect(engine.perft(1)).toBe(20);
    });

    it('perft depth 2 should have 400 positions', () => {
      const engine = GameEngine.create();
      expect(engine.perft(2)).toBe(400);
    });

    it('perft depth 3 should have 8,902 positions', () => {
      const engine = GameEngine.create();
      expect(engine.perft(3)).toBe(8902);
    });

    it('perft depth 4 should have 197,281 positions', () => {
      const engine = GameEngine.create();
      expect(engine.perft(4)).toBe(197281);
    });
  });

  describe('Kiwipete position', () => {
    // r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1
    const KIWIPETE =
      'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';

    it('perft depth 1 should have 48 moves', () => {
      const engine = GameEngine.create(KIWIPETE);
      expect(engine.perft(1)).toBe(48);
    });

    it('perft depth 2 should have 2,039 positions', () => {
      const engine = GameEngine.create(KIWIPETE);
      expect(engine.perft(2)).toBe(2039);
    });

    it('perft depth 3 should have 97,862 positions', () => {
      const engine = GameEngine.create(KIWIPETE);
      expect(engine.perft(3)).toBe(97862);
    });
  });

  describe('position 3', () => {
    // 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1
    const POSITION_3 = '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1';

    it('perft depth 1 should have 14 moves', () => {
      const engine = GameEngine.create(POSITION_3);
      expect(engine.perft(1)).toBe(14);
    });

    it('perft depth 2 should have 191 positions', () => {
      const engine = GameEngine.create(POSITION_3);
      expect(engine.perft(2)).toBe(191);
    });

    it('perft depth 3 should have 2,812 positions', () => {
      const engine = GameEngine.create(POSITION_3);
      expect(engine.perft(3)).toBe(2812);
    });

    it('perft depth 4 should have 43,238 positions', () => {
      const engine = GameEngine.create(POSITION_3);
      expect(engine.perft(4)).toBe(43238);
    });
  });

  describe('position 4 - checks', () => {
    // r3k2r/Pppp1ppp/1b3nb1/nP2p3/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1
    const POSITION_4 =
      'r3k2r/Pppp1ppp/1b3nb1/nP2p3/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1';

    it('perft depth 1 should have 6 moves', () => {
      const engine = GameEngine.create(POSITION_4);
      expect(engine.perft(1)).toBe(6);
    });

    it('perft depth 2 should have 273 positions', () => {
      const engine = GameEngine.create(POSITION_4);
      expect(engine.perft(2)).toBe(273);
    });

    it('perft depth 3 should have 8,528 positions', () => {
      const engine = GameEngine.create(POSITION_4);
      expect(engine.perft(3)).toBe(8528);
    });
  });

  describe('position 5 - castling edge cases', () => {
    // rnbqkb1r/pp1p1ppp/2n2n2/2p1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1
    const POSITION_5 =
      'rnbqkb1r/pp1p1ppp/2n2n2/2p1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1';

    it('perft depth 1 should have 38 moves', () => {
      const engine = GameEngine.create(POSITION_5);
      expect(engine.perft(1)).toBe(38);
    });

    it('perft depth 2 should have 1,046 positions', () => {
      const engine = GameEngine.create(POSITION_5);
      expect(engine.perft(2)).toBe(1046);
    });
  });

  describe('position 6 - en passant', () => {
    // r3k2r/p1pp1ppp/bp6/n1B1P3/P7/2N5/1PPP1PPP/R2QKB1R b KQkq - 0 1
    const POSITION_6 =
      'r3k2r/p1pp1ppp/bp6/n1B1P3/P7/2N5/1PPP1PPP/R2QKB1R b KQkq - 0 1';

    it('perft depth 1 should have 29 moves', () => {
      const engine = GameEngine.create(POSITION_6);
      expect(engine.perft(1)).toBe(29);
    });

    it('perft depth 2 should have 1,174 positions', () => {
      const engine = GameEngine.create(POSITION_6);
      expect(engine.perft(2)).toBe(1174);
    });
  });
});
