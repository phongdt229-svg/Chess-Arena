import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';
import './Guide.css';

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Chess Arena có mất phí không?',
    a: 'Không. Trang web không có tính năng thu phí hay quảng cáo.',
  },
  {
    q: 'Máy chơi mạnh cỡ nào?',
    a: 'Máy là engine tự viết chạy ngay trong trình duyệt, có sáu cấp. Cấp 1 và 2 đôi khi đi sai có chủ ý để người mới dễ thắng; cấp 5 và 6 tính sâu hơn và có thể nghĩ vài giây mỗi nước. Máy không mạnh bằng các engine chuyên nghiệp như Stockfish.',
  },
  {
    q: 'Có chơi online với người khác được không?',
    a: 'Hiện chưa. Bạn có thể chơi hai người trên cùng một thiết bị hoặc đấu với máy. Chơi trực tuyến với người khác nằm trong kế hoạch phát triển.',
  },
  {
    q: 'Ván cờ của tôi được lưu ở đâu?',
    a: 'Ván dang dở được lưu trong trình duyệt của bạn, gắn với tài khoản đang đăng nhập. Dữ liệu này không đồng bộ giữa các thiết bị và sẽ mất nếu bạn xoá dữ liệu trình duyệt. Muốn giữ lâu dài, hãy tải ván về dưới dạng PGN.',
  },
  {
    q: 'Tôi quên mật khẩu thì sao?',
    a: 'Hiện chưa có tính năng khôi phục mật khẩu vì tài khoản không gắn với email. Hãy lưu mật khẩu cẩn thận, hoặc dùng trình quản lý mật khẩu của trình duyệt.',
  },
  {
    q: 'Vì sao tôi không bấm vào được quân cờ?',
    a: 'Khi chơi với máy, bạn chỉ đi được lúc đến lượt mình, và bị khoá trong lúc máy đang suy nghĩ. Ván đã kết thúc hoặc hết giờ cũng không đi tiếp được. Hãy bấm New Game để bắt đầu ván mới.',
  },
  {
    q: 'Bàn 3D bị giật trên máy yếu thì làm sao?',
    a: 'Trong chế độ 3D hãy đổi Quality sang Low để tắt bóng đổ, hoặc quay lại bàn 2D bất cứ lúc nào, ván cờ vẫn giữ nguyên.',
  },
  {
    q: 'Ván hòa khi nào?',
    a: (
      <>
        Hết nước đi, luật 50 nước, lặp lại thế cờ ba lần, không đủ quân để chiếu hết hoặc hai bên thỏa thuận. Xem chi tiết ở trang{' '}
        <Link to="/rules">Luật cờ</Link>.
      </>
    ),
  },
];

export default function Guide() {
  usePageMeta('Hướng dẫn sử dụng', 'Hướng dẫn chơi trên Chess Arena: tạo ván mới, đi quân, bàn 3D, đồng hồ, nhập xuất PGN, lưu ván và các câu hỏi thường gặp.');

  return (
    <div className="container narrow prose">
      <h1 className="page-title">Hướng dẫn sử dụng</h1>
      <p className="page-lead">Mọi thao tác trong màn hình chơi, từ ván đầu tiên đến các tính năng nâng cao.</p>

      <h2>1. Bắt đầu một ván</h2>
      <p>
        Sau khi <Link to="/register">đăng ký</Link> hoặc <Link to="/login">đăng nhập</Link>, bạn vào màn hình chơi. Bấm <strong>New Game</strong> để mở
        hộp chọn:
      </p>
      <ul>
        <li><strong>Local (2 Players):</strong> hai người luân phiên đi trên cùng một thiết bị.</li>
        <li><strong>Play vs AI:</strong> đấu với máy. Chọn màu quân (Trắng, Đen hoặc ngẫu nhiên) và cấp độ từ 1 đến 6.</li>
        <li><strong>Time Control:</strong> không giới hạn hoặc đồng hồ 1, 3, 5, 10, 15 phút, một số mức có cộng thêm giây mỗi nước.</li>
      </ul>

      <h2>2. Đi quân</h2>
      <ul>
        <li>Bấm vào quân của bạn, các ô có thể đi sẽ được tô sáng, rồi bấm ô đích. Bấm lại quân đó để bỏ chọn.</li>
        <li>Có thể kéo thả quân sang ô đích trên bàn 2D.</li>
        <li>Khi Tốt tới hàng cuối, một hộp hiện ra để chọn quân phong cấp.</li>
        <li>Ô của Vua đỏ lên khi đang bị chiếu. Hai ô của nước vừa đi được tô nổi bật.</li>
      </ul>

      <h2>3. Bàn cờ 3D</h2>
      <p>
        Bấm <strong>3D View</strong> trên thanh trên cùng. Kéo chuột (hoặc vuốt) để xoay, cuộn chuột (hoặc chụm hai ngón) để phóng to thu nhỏ, nút
        <strong> Reset View</strong> đưa camera về góc nhìn mặc định. <strong>Quality</strong> chọn Low hay High (High có bóng đổ).
      </p>

      <h2>4. Các nút điều khiển</h2>
      <ul>
        <li><strong>Undo / Redo:</strong> đi lại nước vừa đi. Khi chơi với máy, mỗi lần lùi một cặp nước (của bạn và của máy).</li>
        <li><strong>Flip Board:</strong> lật bàn cờ.</li>
        <li><strong>Sound:</strong> bật tắt âm thanh đi quân, ăn quân, chiếu và kết thúc ván.</li>
        <li><strong>Import / Export:</strong> sao chép hay tải thế cờ (FEN) và ván đấu (PGN), hoặc dán để nạp một ván có sẵn.</li>
        <li><strong>Resign:</strong> xin thua ván hiện tại.</li>
      </ul>

      <h2>5. Lưu và chơi tiếp</h2>
      <p>
        Ván chưa kết thúc được tự lưu sau mỗi nước đi. Lần sau vào màn hình chơi, bạn được hỏi có muốn <strong>Resume</strong> ván cũ hay{' '}
        <strong>Start fresh</strong>.
      </p>

      <h2>Câu hỏi thường gặp</h2>
      <div className="faq">
        {FAQ.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <div className="faq-answer">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
