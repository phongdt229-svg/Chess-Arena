export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  mateIn: 1 | 2;
  theme: string;
}

// Every puzzle is verified by tests: mateIn is the true minimal depth with at least one solving first move
export const PUZZLES: Puzzle[] = [
  { id: 'm1-back-rank', title: 'Back rank', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', mateIn: 1, theme: 'The king is boxed in by its own pawns.' },
  { id: 'm1-rook-ending', title: 'King and rook', fen: '4k3/8/4K3/8/8/8/8/R7 w - - 0 1', mateIn: 1, theme: 'The king covers the escape squares and the rook checks on the back rank.' },
  { id: 'm1-queen-corner', title: 'Queen in the corner', fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', mateIn: 1, theme: 'The king supports the queen to mate in the corner.' },
  { id: 'm1-capture', title: 'Capture with mate', fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', mateIn: 1, theme: 'The rook takes the defender on the d-file and gives mate at the same time.' },
  { id: 'm1-smothered', title: 'Smothered mate', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', mateIn: 1, theme: 'The king is hemmed in by its own pieces. A single knight is enough.' },
  { id: 'm1-scholar', title: 'Scholar’s mate', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', mateIn: 1, theme: 'Queen and bishop both aim at f7.' },
  { id: 'm1-fools', title: 'The shortest mate', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', mateIn: 1, theme: 'You play Black. White has opened the diagonal for your queen.' },
  { id: 'm2-ladder', title: 'Two-rook ladder', fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', mateIn: 2, theme: 'Two rooks take turns pushing the king to the edge.' },
  { id: 'm2-block', title: 'Forcing a block', fen: '6k1/5ppp/3r4/Q7/5N2/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Check so the defender must interpose, then capture the blocker.' },
  { id: 'm2-bishop', title: 'Rook and knight assist', fen: '6k1/5ppp/8/8/R2B4/5N1b/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Check on the back rank forces the black bishop to interpose.' },
  { id: 'm2-quiet', title: 'The quiet move', fen: '1n4k1/5ppp/8/5N1Q/8/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'No check yet, but two mating threats at once.' },
  { id: 'm2-queen-trap', title: 'Queen against queen', fen: '6k1/5ppp/8/8/3Qq3/8/B4PPP/6K1 w - - 0 1', mateIn: 2, theme: 'Black’s queen can only block, and is captured at once.' },
  { id: 'm2-double-rook', title: 'Doubled rooks', fen: '6k1/2r2ppp/1R6/8/R7/8/5PPP/6K1 w - - 0 1', mateIn: 2, theme: 'One rook is sacrificed to open the way for the other.' },
];
