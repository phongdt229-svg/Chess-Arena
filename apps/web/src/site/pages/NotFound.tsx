import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';

export default function NotFound() {
  usePageMeta('Không tìm thấy trang');
  return (
    <div className="container not-found">
      <div className="code">404</div>
      <h1 className="page-title">Không tìm thấy trang</h1>
      <p className="page-lead">Đường dẫn này không tồn tại hoặc đã được chuyển đi.</p>
      <Link to="/" className="site-btn primary large">
        Về trang chủ
      </Link>
    </div>
  );
}
