import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';

export default function Privacy() {
  usePageMeta('Chính sách bảo mật', 'Chess Arena lưu những dữ liệu nào và dùng chúng ra sao.');
  return (
    <div className="container narrow prose">
      <h1 className="page-title">Chính sách bảo mật</h1>
      <p className="page-lead">Cập nhật lần cuối: 04/10/2026</p>
      <p>Chúng tôi chỉ lưu những dữ liệu cần thiết để bạn đăng nhập và chơi. Dưới đây là toàn bộ dữ liệu mà Chess Arena lưu.</p>

      <h2>Dữ liệu lưu trên máy chủ</h2>
      <ul>
        <li><strong>Tên đăng nhập</strong> bạn chọn, điểm Elo mặc định và thời điểm tạo tài khoản.</li>
        <li><strong>Mật khẩu dưới dạng băm một chiều</strong> (password hash). Chúng tôi không lưu mật khẩu gốc và không thể xem lại nó.</li>
        <li><strong>Mã phiên đăng nhập</strong>, lưu dưới dạng băm, hết hạn sau 30 ngày. Mã bị xoá khi bạn đăng xuất.</li>
      </ul>
      <p>Chúng tôi không yêu cầu email, số điện thoại hay thông tin cá nhân nào khác.</p>

      <h2>Dữ liệu lưu trong trình duyệt của bạn</h2>
      <ul>
        <li>Mã phiên đăng nhập để bạn không phải đăng nhập lại.</li>
        <li>Ván cờ dang dở, thống kê, tiến độ bài tập và các tuỳ chọn (âm thanh, chế độ hiển thị, cài đặt mặc định).</li>
      </ul>
      <p>Những dữ liệu này nằm hoàn toàn trên thiết bị của bạn (localStorage) và không được gửi lên máy chủ. Bạn có thể xoá chúng bất cứ lúc nào bằng cách xoá dữ liệu trang web trong trình duyệt.</p>

      <h2>Cookie, theo dõi và bên thứ ba</h2>
      <p>Chess Arena không dùng cookie theo dõi, không có công cụ phân tích hay quảng cáo, và không chia sẻ dữ liệu của bạn với bên thứ ba.</p>

      <h2>Bảo mật</h2>
      <p>Mật khẩu được băm bằng thuật toán chuẩn của PHP, mã phiên chỉ lưu dạng băm, và mọi truy vấn cơ sở dữ liệu dùng câu lệnh tham số hoá. Không hệ thống nào an toàn tuyệt đối, vì vậy hãy dùng mật khẩu riêng, đủ dài cho Chess Arena.</p>

      <h2>Quyền của bạn</h2>
      <p>Bạn có thể đăng xuất để xoá mã phiên khỏi thiết bị. Việc xoá hẳn tài khoản trên máy chủ hiện chưa có trong giao diện; hãy liên hệ đơn vị vận hành trang web để được hỗ trợ. Xem thêm <Link to="/terms">Điều khoản sử dụng</Link>.</p>

      <p className="legal-note">Bản chính sách này mô tả đúng hành vi hiện tại của ứng dụng. Đơn vị vận hành cần bổ sung thông tin liên hệ và rà soát pháp lý trước khi công khai.</p>
    </div>
  );
}
