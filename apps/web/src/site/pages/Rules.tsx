import StaticBoard from '../StaticBoard';
import { moveTargets } from '../chessHelpers';
import { usePageMeta } from '../usePageMeta';
import { Link } from '../../router/router';
import './Rules.css';

interface Diagram {
  name: string;
  glyph: string;
  fen: string;
  square: string;
  dots?: string[];
  text: string;
}

export const PIECE_DIAGRAMS: Diagram[] = [
  { name: 'King', glyph: '♔', fen: 'k7/8/8/8/4K3/8/8/8 w - - 0 1', square: 'e4', text: 'Moves one square in any direction: sideways, forwards, backwards or diagonally. A king can never move onto a square the opponent attacks.' },
  { name: 'Queen', glyph: '♕', fen: 'k7/8/8/8/3Q4/8/8/7K w - - 0 1', square: 'd4', text: 'The most powerful piece. It moves any number of squares along a rank, file or diagonal, as long as nothing is in the way.' },
  { name: 'Rook', glyph: '♖', fen: 'k7/8/8/8/3R4/8/8/7K w - - 0 1', square: 'd4', text: 'Moves any number of squares in a straight line along a rank or file, if the path is clear.' },
  { name: 'Bishop', glyph: '♗', fen: 'k7/8/8/8/3B4/8/8/7K w - - 0 1', square: 'd4', text: 'Moves any number of squares diagonally. Each bishop stays on the same colour of square for the whole game.' },
  { name: 'Knight', glyph: '♘', fen: 'k7/8/8/8/3N4/8/8/7K w - - 0 1', square: 'd4', text: 'Moves in an L shape: two squares in one direction and one square at a right angle. The knight is the only piece that can jump over others.' },
  { name: 'Pawn (moving and capturing)', glyph: '♙', fen: 'k7/8/8/3p1p2/4P3/8/8/7K w - - 0 1', square: 'e4', text: 'A pawn moves straight ahead one square but captures diagonally forward. Pawns can never move backwards.' },
  { name: 'Pawn (first move)', glyph: '♙', fen: 'k7/8/8/8/8/8/4P3/7K w - - 0 1', square: 'e2', text: 'On its very first move a pawn may advance either one or two squares.' },
];

export const SPECIAL: Diagram[] = [
  {
    name: 'Castling',
    glyph: '♔♖',
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    square: 'e1',
    dots: ['c1', 'g1'],
    text: 'The king moves two squares towards a rook and that rook jumps to the other side of the king. It is only allowed if neither piece has moved before, there are no pieces between them, the king is not in check and it does not pass through or land on an attacked square. The dots show the two squares the king can castle to.',
  },
  {
    name: 'En passant',
    glyph: '♙',
    fen: 'k7/8/8/3pP3/8/8/8/7K w - d6 0 1',
    square: 'e5',
    text: 'When an enemy pawn has just advanced two squares and lands next to your pawn, you may capture it as if it had moved only one square. You must do it immediately on the next move or the right is lost.',
  },
  {
    name: 'Promotion',
    glyph: '♙→♕',
    fen: 'k7/4P3/8/8/8/8/8/7K w - - 0 1',
    square: 'e7',
    text: 'A pawn that reaches the far end of the board must become a queen, rook, bishop or knight of your choice. Almost always you will choose a queen, but sometimes a knight is the winning move.',
  },
];

function Diagram({ d }: { d: Diagram }) {
  const dots = d.dots ?? moveTargets(d.fen, d.square);
  return (
    <figure className="rules-fig card">
      <div className="rules-board">
        <StaticBoard fen={d.fen} dots={dots} label={`Diagram: ${d.name}`} />
      </div>
      <figcaption>
        <h3>
          <span aria-hidden="true">{d.glyph}</span> {d.name}
        </h3>
        <p>{d.text}</p>
      </figcaption>
    </figure>
  );
}

export default function Rules() {
  usePageMeta('Rules of chess', 'Learn the rules of chess from scratch: how each piece moves, castling, en passant, promotion, checkmate and the ways a game can be drawn.');

  return (
    <div className="container prose">
      <h1 className="page-title">Rules of chess</h1>
      <p className="page-lead">Everything you need to play a proper game. The dots on each diagram are the squares that piece can move to.</p>

      <h2>The goal</h2>
      <p>
        Two players, White and Black, take turns to move, with White going first. The aim is to <strong>checkmate</strong> the opponent&apos;s
        king: the king is under attack (in check) and has no way to escape. On every move you must make sure your own king is not left in
        check.
      </p>

      <h2>The board and starting position</h2>
      <div className="rules-start card">
        <div className="rules-board small">
          <StaticBoard fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" label="The starting position" />
        </div>
        <ul>
          <li>The board has 8 × 8 = 64 squares, alternately light and dark. The square at White&apos;s right-hand corner is always light.</li>
          <li>Files are lettered a to h and ranks are numbered 1 to 8, so e4 is the square on file e, rank 4.</li>
          <li>Each side starts with 16 pieces: 1 king, 1 queen, 2 rooks, 2 bishops, 2 knights and 8 pawns.</li>
          <li>Queens start on their own colour: the white queen on a light square and the black queen on a dark square.</li>
        </ul>
      </div>

      <h2>How the pieces move</h2>
      <div className="rules-grid">
        {PIECE_DIAGRAMS.map((d) => (
          <Diagram key={d.name} d={d} />
        ))}
      </div>
      <p>
        Every piece captures by moving onto an enemy piece&apos;s square, which removes it from the board. No piece may move onto a square
        occupied by a piece of its own colour.
      </p>

      <h2>Special moves</h2>
      <div className="rules-grid">
        {SPECIAL.map((d) => (
          <Diagram key={d.name} d={d} />
        ))}
      </div>

      <h2>Check, checkmate and stalemate</h2>
      <div className="rules-grid">
        <figure className="rules-fig card">
          <div className="rules-board">
            <StaticBoard fen="rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3" highlights={['h4']} label="Fool's mate" />
          </div>
          <figcaption>
            <h3>Checkmate</h3>
            <p>
              The black queen on h4 checks the white king and every escape is covered. This is the shortest possible game, over after
              White&apos;s second move.
            </p>
          </figcaption>
        </figure>
        <figure className="rules-fig card">
          <div className="rules-board">
            <StaticBoard fen="7k/5Q2/6K1/8/8/8/8/8 b - - 0 1" label="Stalemate" />
          </div>
          <figcaption>
            <h3>Stalemate (a draw)</h3>
            <p>It is Black&apos;s turn. The black king is not in check but has no legal move, so the game is drawn even though White is far ahead.</p>
          </figcaption>
        </figure>
      </div>

      <h2>Ways to draw</h2>
      <ul>
        <li><strong>Stalemate:</strong> the player to move is not in check but has no legal move.</li>
        <li><strong>Fifty-move rule:</strong> fifty moves by each side pass with no capture and no pawn move.</li>
        <li><strong>Threefold repetition:</strong> the same position, with the same player to move, occurs three times.</li>
        <li><strong>Insufficient material:</strong> neither side can possibly checkmate, for example king versus king, or king and a single knight or bishop versus king.</li>
        <li><strong>Agreement:</strong> both players agree to a draw.</li>
      </ul>

      <h2>Piece values</h2>
      <p>These numbers are only a rough guide to help you judge trades:</p>
      <table className="rules-table">
        <thead>
          <tr>
            <th>Piece</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>♙ Pawn</td><td>1</td></tr>
          <tr><td>♘ Knight</td><td>3</td></tr>
          <tr><td>♗ Bishop</td><td>3</td></tr>
          <tr><td>♖ Rook</td><td>5</td></tr>
          <tr><td>♕ Queen</td><td>9</td></tr>
          <tr><td>♔ King</td><td>priceless, it can never be captured</td></tr>
        </tbody>
      </table>

      <h2>Writing moves down</h2>
      <p>
        The usual method is algebraic notation: the first letter of the piece (K king, Q queen, R rook, B bishop, N knight, nothing for a
        pawn) followed by the destination square.
      </p>
      <ul>
        <li><code>e4</code>: a pawn moves to e4. <code>Nf3</code>: a knight moves to f3.</li>
        <li><code>x</code> means a capture (<code>Bxc6</code>), <code>+</code> means check and <code>#</code> means checkmate.</li>
        <li><code>O-O</code> is castling kingside, <code>O-O-O</code> is castling queenside and <code>e8=Q</code> is promotion to a queen.</li>
      </ul>

      <p>
        Ready to try it? <Link to="/play">Start playing</Link> or look at some popular <Link to="/openings">openings</Link>.
      </p>
    </div>
  );
}
