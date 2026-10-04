import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';

export default function Terms() {
  usePageMeta('Terms of use', 'The terms of use for Chess Arena.');
  return (
    <div className="container narrow prose">
      <h1 className="page-title">Terms of use</h1>
      <p className="page-lead">Last updated: 4 October 2026</p>

      <h2>1. Accepting these terms</h2>
      <p>By creating an account or using Chess Arena you agree to these terms. If you do not agree, please do not use the service.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You are responsible for keeping your password secret and for everything that happens under your account.</li>
        <li>A username is 3 to 20 characters of letters, digits or underscores. Do not choose a name that impersonates someone else or is abusive.</li>
        <li>There is currently no password recovery by email.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You must not disrupt or attack the service, probe or access other users&apos; data without permission, or use the service for anything unlawful.</p>

      <h2>4. Your games and data</h2>
      <p>The games you play belong to you. Most game data is stored in your own browser (see the <Link to="/privacy">Privacy policy</Link>), so it can be lost if you clear your browser data.</p>

      <h2>5. No warranty</h2>
      <p>The service is provided &quot;as is&quot;. We try to keep it running smoothly but cannot guarantee it will be uninterrupted or error-free, and we are not liable for indirect damages arising from its use.</p>

      <h2>6. Changes and termination</h2>
      <p>We may update these terms or the features of the service from time to time, and may suspend accounts that break the terms. Continuing to use the service after a change means you accept the new terms.</p>

      <p className="legal-note">These terms are a general template for the project. The site operator should review them and add the legal and contact details that apply before publishing the site.</p>
    </div>
  );
}
