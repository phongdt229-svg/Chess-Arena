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
  { name: 'Vua', glyph: '♔', fen: 'k7/8/8/8/4K3/8/8/8 w - - 0 1', square: 'e4', text: 'Đi một ô theo mọi hướng: ngang, dọc, chéo. Vua không bao giờ được đi vào ô đang bị đối phương tấn công.' },
  { name: 'Hậu', glyph: '♕', fen: 'k7/8/8/8/3Q4/8/8/7K w - - 0 1', square: 'd4', text: 'Quân mạnh nhất: đi bao nhiêu ô cũng được theo hàng ngang, cột dọc và đường chéo, miễn không bị cản.' },
  { name: 'Xe', glyph: '♖', fen: 'k7/8/8/8/3R4/8/8/7K w - - 0 1', square: 'd4', text: 'Đi thẳng theo hàng ngang hoặc cột dọc, bao nhiêu ô cũng được nếu đường không bị chặn.' },
  { name: 'Tượng', glyph: '♗', fen: 'k7/8/8/8/3B4/8/8/7K w - - 0 1', square: 'd4', text: 'Đi chéo bao nhiêu ô cũng được. Mỗi Tượng chỉ ở trên một màu ô suốt ván.' },
  { name: 'Mã', glyph: '♘', fen: 'k7/8/8/8/3N4/8/8/7K w - - 0 1', square: 'd4', text: 'Đi hình chữ L (hai ô một hướng rồi một ô vuông góc). Mã là quân duy nhất nhảy qua được quân khác.' },
  { name: 'Tốt (đi và ăn)', glyph: '♙', fen: 'k7/8/8/3p1p2/4P3/8/8/7K w - - 0 1', square: 'e4', text: 'Tốt đi thẳng một ô nhưng ăn quân theo đường chéo phía trước. Tốt không được đi lùi.' },
  { name: 'Tốt (nước đầu)', glyph: '♙', fen: 'k7/8/8/8/8/8/4P3/7K w - - 0 1', square: 'e2', text: 'Ở nước đi đầu tiên của mình, Tốt được chọn đi một hoặc hai ô.' },
];

export const SPECIAL: Diagram[] = [
  {
    name: 'Nhập thành',
    glyph: '♔♖',
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    square: 'e1',
    dots: ['c1', 'g1'],
    text: 'Vua đi hai ô về phía một Xe, Xe nhảy sang ô bên kia Vua. Chỉ được làm khi Vua và Xe đó chưa từng di chuyển, giữa hai quân không có quân nào, Vua không đang bị chiếu và không đi qua hay dừng ở ô bị tấn công. Chấm trên sơ đồ là hai ô Vua có thể nhập thành tới.',
  },
  {
    name: 'Bắt Tốt qua đường',
    glyph: '♙',
    fen: 'k7/8/8/3pP3/8/8/8/7K w - d6 0 1',
    square: 'e5',
    text: 'Khi Tốt đối phương vừa đi hai ô và đứng cạnh Tốt của bạn, bạn được ăn nó như thể nó chỉ đi một ô, nhưng phải ăn ngay ở nước kế tiếp, nếu không sẽ mất quyền.',
  },
  {
    name: 'Phong cấp',
    glyph: '♙→♕',
    fen: 'k7/4P3/8/8/8/8/8/7K w - - 0 1',
    square: 'e7',
    text: 'Tốt đi tới hàng cuối của đối phương phải đổi thành Hậu, Xe, Tượng hoặc Mã tuỳ chọn. Gần như luôn chọn Hậu, nhưng đôi khi Mã mới là nước hay.',
  },
];

function Diagram({ d }: { d: Diagram }) {
  const dots = d.dots ?? moveTargets(d.fen, d.square);
  return (
    <figure className="rules-fig card">
      <div className="rules-board">
        <StaticBoard fen={d.fen} dots={dots} label={`Sơ đồ: ${d.name}`} />
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
  usePageMeta('Luật cờ vua', 'Học luật cờ vua từ đầu: cách đi từng quân, nhập thành, bắt Tốt qua đường, phong cấp, chiếu hết và các cách hòa.');

  return (
    <div className="container prose">
      <h1 className="page-title">Luật cờ vua</h1>
      <p className="page-lead">Mọi điều cần biết để chơi một ván cờ đúng luật. Các chấm trên sơ đồ là những ô quân đó có thể đi tới.</p>

      <h2>Mục tiêu</h2>
      <p>
        Hai bên, Trắng và Đen, thay phiên nhau đi, Trắng đi trước. Mục tiêu là <strong>chiếu hết</strong> Vua đối phương: Vua đang bị tấn công
        (bị chiếu) và không có cách nào thoát. Mỗi nước đi bạn phải làm sao để Vua của mình không bị chiếu.
      </p>

      <h2>Bàn cờ và thế bắt đầu</h2>
      <div className="rules-start card">
        <div className="rules-board small">
          <StaticBoard fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" label="Thế cờ ban đầu" />
        </div>
        <ul>
          <li>Bàn cờ có 8 × 8 = 64 ô xen kẽ sáng tối. Ô ở góc phải phía người cầm quân Trắng luôn là ô sáng.</li>
          <li>Cột đánh chữ a đến h, hàng đánh số 1 đến 8. Ví dụ ô e4 là cột e, hàng 4.</li>
          <li>Mỗi bên có 16 quân: 1 Vua, 1 Hậu, 2 Xe, 2 Tượng, 2 Mã và 8 Tốt.</li>
          <li>Hậu đứng trên ô cùng màu với nó: Hậu trắng trên ô sáng, Hậu đen trên ô tối.</li>
        </ul>
      </div>

      <h2>Cách đi từng quân</h2>
      <div className="rules-grid">
        {PIECE_DIAGRAMS.map((d) => (
          <Diagram key={d.name} d={d} />
        ))}
      </div>
      <p>Quân nào cũng ăn quân đối phương bằng cách đi tới ô đó, quân bị ăn bị loại khỏi bàn. Không quân nào được đi vào ô có quân cùng phe.</p>

      <h2>Các nước đi đặc biệt</h2>
      <div className="rules-grid">
        {SPECIAL.map((d) => (
          <Diagram key={d.name} d={d} />
        ))}
      </div>

      <h2>Chiếu, chiếu hết và hết nước đi</h2>
      <div className="rules-grid">
        <figure className="rules-fig card">
          <div className="rules-board">
            <StaticBoard fen="rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3" highlights={['h4']} label="Chiếu hết kiểu Tốt" />
          </div>
          <figcaption>
            <h3>Chiếu hết</h3>
            <p>Hậu đen ở h4 chiếu Vua trắng, mọi đường thoát đều bị chặn. Đây là ván cờ ngắn nhất có thể xảy ra, kết thúc sau hai nước của Trắng.</p>
          </figcaption>
        </figure>
        <figure className="rules-fig card">
          <div className="rules-board">
            <StaticBoard fen="7k/5Q2/6K1/8/8/8/8/8 b - - 0 1" label="Hết nước đi (hòa)" />
          </div>
          <figcaption>
            <h3>Hết nước đi (hòa)</h3>
            <p>Đến lượt Đen, Vua đen không bị chiếu nhưng không còn nước đi hợp lệ nào. Ván cờ hòa dù Trắng đang hơn hẳn.</p>
          </figcaption>
        </figure>
      </div>

      <h2>Các cách hòa</h2>
      <ul>
        <li><strong>Hết nước đi (pat):</strong> bên đến lượt không bị chiếu nhưng không có nước nào hợp lệ.</li>
        <li><strong>Luật 50 nước:</strong> 50 nước liên tiếp của mỗi bên không có nước ăn quân và không đi Tốt.</li>
        <li><strong>Lặp lại thế cờ ba lần:</strong> cùng một thế, cùng lượt đi, xuất hiện ba lần.</li>
        <li><strong>Không đủ quân để chiếu hết:</strong> ví dụ Vua đấu Vua, hoặc Vua và một Mã hay một Tượng đấu Vua.</li>
        <li><strong>Thỏa thuận:</strong> hai bên cùng đồng ý hòa.</li>
      </ul>

      <h2>Giá trị quân cờ</h2>
      <p>Con số chỉ mang tính ước lượng, giúp bạn cân nhắc khi đổi quân:</p>
      <table className="rules-table">
        <thead>
          <tr>
            <th>Quân</th>
            <th>Giá trị</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>♙ Tốt</td><td>1</td></tr>
          <tr><td>♘ Mã</td><td>3</td></tr>
          <tr><td>♗ Tượng</td><td>3</td></tr>
          <tr><td>♖ Xe</td><td>5</td></tr>
          <tr><td>♕ Hậu</td><td>9</td></tr>
          <tr><td>♔ Vua</td><td>vô giá, không thể bị ăn</td></tr>
        </tbody>
      </table>

      <h2>Ghi chép nước đi</h2>
      <p>Cách ghi phổ biến là ký hiệu đại số: chữ cái đầu tên quân (K Vua, Q Hậu, R Xe, B Tượng, N Mã, Tốt không ghi chữ) cùng ô đến.</p>
      <ul>
        <li><code>e4</code>: Tốt đi tới e4. <code>Nf3</code>: Mã đi tới f3.</li>
        <li><code>x</code> là ăn quân (<code>Bxc6</code>), <code>+</code> là chiếu, <code>#</code> là chiếu hết.</li>
        <li><code>O-O</code> nhập thành cánh Vua, <code>O-O-O</code> nhập thành cánh Hậu, <code>e8=Q</code> là phong Hậu.</li>
      </ul>

      <p>
        Muốn thử ngay? <Link to="/play">Vào chơi</Link> hoặc xem các <Link to="/openings">khai cuộc</Link> phổ biến.
      </p>
    </div>
  );
}
