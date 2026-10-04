import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <div className="container not-found">
      <div className="code">404</div>
      <h1 className="page-title">Page not found</h1>
      <p className="page-lead">This address does not exist or has been moved.</p>
      <Link to="/" className="site-btn primary large">
        Back to home
      </Link>
    </div>
  );
}
