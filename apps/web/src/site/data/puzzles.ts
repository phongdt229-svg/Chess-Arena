export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  mateIn: 1 | 2;
  theme: string;
}

// Every puzzle is verified by tests: mateIn is the true minimal depth with at least one solving first move
export const PUZZLES: Puzzle[] = [
  { id: 'm1-back-rank', title: 'Hàng cuối', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', mateIn: 1, theme: 'Vua bị chính các Tốt của mình chặn đường thoát.' },
  { id: 'm1-rook-ending', title: 'Vua và Xe', fen: '4k3/8/4K3/8/8/8/8/R7 w - - 0 1', mateIn: 1, theme: 'Vua giữ các ô thoát, Xe chiếu ở hàng cuối.' },
  { id: 'm1-queen-corner', title: 'Hậu vào góc', fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', mateIn: 1, theme: 'Vua yểm trợ Hậu chiếu hết trong góc.' },
  { id: 'm1-capture', title: 'Ăn quân chiếu hết', fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', mateIn: 1, theme: 'Xe ăn quân canh cột d và chiếu hết cùng lúc.' },
  { id: 'm1-smothered', title: 'Chiếu hết ngộp', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', mateIn: 1, theme: 'Vua bị chính quân mình bao quanh, chỉ cần một con Mã.' },
  { id: 'm1-scholar', title: 'Chiếu hết kẻ mới', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', mateIn: 1, theme: 'Hậu và Tượng cùng nhắm vào ô f7.' },
  { id: 'm1-fools', title: 'Chiếu hết ngắn nhất', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', mateIn: 1, theme: 'Bạn cầm quân Đen. Trắng đã mở đường cho Hậu.' },
  { id: 'm2-ladder', title: 'Bậc thang hai Xe', fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', mateIn: 2, theme: 'Hai Xe luân phiên đẩy Vua ra mép bàn.' },
  { id: 'm2-block', title: 'Buộc chặn quân', fen: '6k1/5ppp/3r4/Q7/5N2/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Chiếu để đối phương phải chặn bằng quân của mình rồi ăn nó.' },
  { id: 'm2-bishop', title: 'Xe và Mã trợ chiến', fen: '6k1/5ppp/8/8/R2B4/5N1b/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Chiếu ở hàng cuối, Tượng đen buộc phải chặn.' },
  { id: 'm2-quiet', title: 'Nước đi tĩnh', fen: '1n4k1/5ppp/8/5N1Q/8/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Không chiếu ngay nhưng đe doạ hai đòn chiếu hết cùng lúc.' },
  { id: 'm2-queen-trap', title: 'Hậu ép Hậu', fen: '6k1/5ppp/8/8/3Qq3/8/B4PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Hậu đen chỉ còn cách chặn, và bị bắt ngay.' },
  { id: 'm2-double-rook', title: 'Hai Xe hàng cuối', fen: '6k1/2r2ppp/1R6/8/R7/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Một Xe hy sinh để mở đường cho Xe còn lại.' },
];
