import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';

export default function Terms() {
  usePageMeta('Điều khoản sử dụng', 'Điều khoản sử dụng Chess Arena.');
  return (
    <div className="container narrow prose">
      <h1 className="page-title">Điều khoản sử dụng</h1>
      <p className="page-lead">Cập nhật lần cuối: 04/10/2026</p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>Khi tạo tài khoản hoặc sử dụng Chess Arena, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.</p>

      <h2>2. Tài khoản</h2>
      <ul>
        <li>Bạn chịu trách nhiệm giữ bí mật mật khẩu và mọi hoạt động dưới tài khoản của mình.</li>
        <li>Tên đăng nhập gồm 3 đến 20 ký tự chữ, số hoặc dấu gạch dưới. Không dùng tên mạo danh người khác hoặc có nội dung xúc phạm.</li>
        <li>Hiện chưa có tính năng khôi phục mật khẩu qua email.</li>
      </ul>

      <h2>3. Sử dụng hợp lệ</h2>
      <p>Bạn không được: cố ý làm gián đoạn hoặc tấn công dịch vụ, dò quét hay truy cập trái phép dữ liệu của người dùng khác, hoặc dùng dịch vụ vào mục đích vi phạm pháp luật.</p>

      <h2>4. Nội dung và dữ liệu ván cờ</h2>
      <p>Các ván cờ bạn chơi thuộc về bạn. Phần lớn dữ liệu ván được lưu trong trình duyệt của bạn (xem <Link to="/privacy">Chính sách bảo mật</Link>), nên có thể mất nếu bạn xoá dữ liệu trình duyệt.</p>

      <h2>5. Không bảo đảm</h2>
      <p>Dịch vụ được cung cấp &quot;nguyên trạng&quot;. Chúng tôi cố gắng để dịch vụ hoạt động ổn định nhưng không bảo đảm không gián đoạn hay không có lỗi, và không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng.</p>

      <h2>6. Thay đổi và chấm dứt</h2>
      <p>Chúng tôi có thể cập nhật điều khoản hoặc tính năng theo thời gian, và có thể khoá tài khoản vi phạm điều khoản. Việc tiếp tục sử dụng sau khi điều khoản thay đổi nghĩa là bạn chấp nhận bản mới.</p>

      <p className="legal-note">Bản điều khoản này mang tính chung cho dự án. Đơn vị vận hành cần rà soát và bổ sung thông tin pháp lý, liên hệ phù hợp trước khi công khai.</p>
    </div>
  );
}
