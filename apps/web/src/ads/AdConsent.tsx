import { Link } from '../router/router';
import { adsEnabled } from './config';
import { useConsentStore } from './consentStore';
import './ads.css';

export default function AdConsent() {
  const { consent, setConsent } = useConsentStore();
  if (!adsEnabled() || consent !== null) return null;

  return (
    <div className="ad-consent" role="dialog" aria-label="Advertising choices">
      <p>
        Chess Arena is free thanks to ads from Google AdSense, which use cookies. If you decline, no ad scripts are loaded. Read our{' '}
        <Link to="/privacy">privacy policy</Link>.
      </p>
      <div className="ad-consent-actions">
        <button className="ad-consent-decline" onClick={() => setConsent('denied')}>
          Decline
        </button>
        <button className="ad-consent-accept" onClick={() => setConsent('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
