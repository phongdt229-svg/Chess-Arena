import { Link } from '../../router/router';
import { usePageMeta } from '../usePageMeta';
import { adsEnabled } from '../../ads/config';

export default function Privacy() {
  usePageMeta('Privacy policy', 'What data Chess Arena stores and how it is used.');
  const ads = adsEnabled();
  return (
    <div className="container narrow prose">
      <h1 className="page-title">Privacy policy</h1>
      <p className="page-lead">Last updated: 4 October 2026</p>
      <p>We only keep the data needed to let you log in and play. This is everything Chess Arena stores.</p>

      <h2>Data stored on our server</h2>
      <ul>
        <li>The <strong>username</strong> you choose, a default Elo rating and the date the account was created.</li>
        <li>Your <strong>password as a one-way hash</strong>. We do not store the original password and cannot read it.</li>
        <li><strong>Login session tokens</strong>, stored only as hashes and expiring after 30 days. A token is deleted when you log out.</li>
      </ul>
      <p>We do not ask for an email address, phone number or any other personal information.</p>

      <h2>Data stored in your browser</h2>
      <ul>
        <li>Your login session token, so you do not have to log in again.</li>
        <li>Unfinished games, statistics, puzzle progress and your preferences (sound, display mode, default settings).</li>
      </ul>
      <p>This data lives entirely on your device (localStorage) and is not sent to the server. You can remove it at any time by clearing the site data in your browser.</p>

      <h2>Cookies, tracking and third parties</h2>
      {ads ? (
        <>
          <p>
            Chess Arena shows advertising provided by Google AdSense. Only if you press <strong>Accept</strong> on the advertising notice,
            Google&apos;s ad script is loaded; it may set cookies and receive technical information such as your IP address and browser
            details to serve and measure ads. We ask Google to show non-personalised ads. If you press <strong>Decline</strong>, no ad script is
            loaded and no ad cookies are set. You can change your choice at any time in <Link to="/settings">Settings</Link> (after logging
            in). See{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
              how Google uses data from sites that use its services
            </a>
            .
          </p>
          <p>Apart from advertising, Chess Arena uses no analytics or tracking cookies and does not share your data with anyone.</p>
        </>
      ) : (
        <p>Chess Arena does not use tracking cookies, analytics or advertising, and does not share your data with third parties.</p>
      )}

      <h2>Security</h2>
      <p>Passwords are hashed with PHP&apos;s standard algorithm, session tokens are stored only as hashes, and all database queries use prepared statements. No system is perfectly secure, so please use a long password that you do not use anywhere else.</p>

      <h2>Your rights</h2>
      <p>You can log out to remove the session token from your device. Deleting your account from the server is not available in the interface yet; please contact the site operator for help. See also the <Link to="/terms">Terms of use</Link>.</p>

      <p className="legal-note">This policy describes what the application currently does. The site operator should add contact details and review it legally before publishing the site.</p>
    </div>
  );
}
