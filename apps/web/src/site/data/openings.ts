export interface Opening {
  id: string;
  name: string;
  eco: string;
  moves: string[]; // SAN, starting from the initial position
  style: string;
  summary: string;
  white: string;
  black: string;
}

export const OPENINGS: Opening[] = [
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    style: 'Classical, rich in ideas',
    summary: 'One of the oldest openings. White’s bishop pressures the knight that defends the e5 pawn.',
    white: 'Develop quickly, castle early, then prepare c3 and d4 to take the centre.',
    black: 'Defend e5, develop knight and bishop, castle safely and then counter-attack in the centre.',
  },
  {
    id: 'italian',
    name: 'Italian Game',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4'],
    style: 'Easy to learn, natural development',
    summary: 'Both bishops aim at f7/f2. A great choice for beginners because the ideas are simple and clear.',
    white: 'Prepare c3 and d4 to build a strong centre, or play slowly with d3.',
    black: 'Develop symmetrically, answer d4 with exd4 and keep the position balanced.',
  },
  {
    id: 'sicilian',
    name: 'Sicilian Defence',
    eco: 'B20',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    style: 'Sharp counter-attacking play',
    summary: 'The most popular reply to 1.e4 at the top level. Black unbalances the position from move one to play for a win.',
    white: 'Usually attacks Black’s king, using extra space and faster development.',
    black: 'Uses the open c-file to counter-attack on the queenside and accepts a complicated fight.',
  },
  {
    id: 'french',
    name: 'French Defence',
    eco: 'C00',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7'],
    style: 'Solid, pawn-structure battles',
    summary: 'Black builds a sturdy pawn chain and strikes at the centre later. Black’s light-squared bishop is often the problem piece.',
    white: 'Has more space and aims for an attack on the kingside.',
    black: 'Undermines White’s centre with c5 and f6 and looks for play on the queenside.',
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defence',
    eco: 'B10',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'],
    style: 'Rock solid',
    summary: 'Like the French, but Black’s light-squared bishop gets out early. A healthy pawn structure with little risk.',
    white: 'Keeps a space advantage and tries to pressure Black’s knight and bishop.',
    black: 'Trades the central pawn, develops the bishop outside the pawn chain and then settles the position.',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defence',
    eco: 'B01',
    moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6'],
    style: 'Direct and easy to remember',
    summary: 'Black recaptures the pawn at once with the queen. The early queen move gives White a lead in development, but the position is simple to play.',
    white: 'Develops with tempo by chasing the black queen.',
    black: 'Keeps the queen safe and develops the remaining pieces quickly.',
  },
  {
    id: 'queens-gambit',
    name: 'Queen’s Gambit',
    eco: 'D06',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
    style: 'Strategic, central control',
    summary: 'White offers the c-pawn to deflect Black’s d-pawn from the centre. White almost always regains the pawn.',
    white: 'Builds a pawn centre with d and e pawns and develops bishop and knight to plan.',
    black: 'Holds the d-pawn with e6, develops solidly, then breaks with c5 or takes on c4.',
  },
  {
    id: 'kings-indian',
    name: 'King’s Indian Defence',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'],
    style: 'Hypermodern, attacking',
    summary: 'Black lets White build a big centre and then attacks it from a distance. The g7 bishop is the key piece.',
    white: 'Gains space on the queenside with c5 or attacks in the centre.',
    black: 'Counter-attacks with e5 or c5; many games end in a kingside attack.',
  },
  {
    id: 'english',
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'd5', 'cxd5', 'Nxd5'],
    style: 'Flexible, keeps options open',
    summary: 'White controls the centre with pieces from the flank instead of pawns, and can transpose into many different systems.',
    white: 'Develops the bishop to g2, controls d5 and keeps many choices.',
    black: 'Can reply like a Sicilian with colours reversed.',
  },
  {
    id: 'london',
    name: 'London System',
    eco: 'D02',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'c5', 'c3', 'Nc6'],
    style: 'Easy to play, little theory',
    summary: 'White sets up the same formation whatever Black does, so there is very little to memorise.',
    white: 'Brings the dark-squared bishop out before playing e3, then Nbd2 and Bd3.',
    black: 'Counter-attacks with c5, Qb6 against b2, or a solid Slav-style structure.',
  },
];

export function movetext(moves: string[]): string {
  return moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m)).join(' ');
}
