import { useEffect, useRef, useState } from 'react';
import { adsEnabled, getAdsConfig, slotFor, type AdPlacement } from './config';
import { useConsentStore } from './consentStore';
import './ads.css';

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  }
}

const SCRIPT_ID = 'adsense-script';

function loadScript(client: string) {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement('script');
  s.id = SCRIPT_ID;
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(s);
}

function useMedia(query: string | null): boolean {
  const [matches, setMatches] = useState(() => (query ? window.matchMedia(query).matches : true));
  useEffect(() => {
    if (!query) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const DESKTOP_QUERY = '(min-width: 1024px)';
export const MOBILE_QUERY = '(max-width: 1023px)';
export const RAIL_QUERY = '(min-width: 1380px)';

interface AdSlotProps {
  placement: AdPlacement;
  /** Only render when this media query matches (the ad script is not touched otherwise) */
  media?: string;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
  className?: string;
}

export default function AdSlot({ placement, media, desktopOnly = false, mobileOnly = false, className = '' }: AdSlotProps) {
  const consent = useConsentStore((s) => s.consent);
  const wideEnough = useMedia(media ?? (desktopOnly ? DESKTOP_QUERY : mobileOnly ? MOBILE_QUERY : null));
  const insRef = useRef<HTMLModElement>(null);
  const config = getAdsConfig();
  const slot = slotFor(placement, config);
  const live = adsEnabled() && config.client !== null && slot !== null;
  const show = live && consent === 'granted' && wideEnough;

  useEffect(() => {
    if (!show || !config.client) return;
    loadScript(config.client);
    const ins = insRef.current;
    if (!ins || ins.getAttribute('data-adsbygoogle-status')) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.requestNonPersonalizedAds = 1;
      window.adsbygoogle.push({});
    } catch {
      // an ad blocker or a failed script must never break the page
    }
  }, [show, config.client, placement]);

  // Development preview so the layout can be reviewed before an AdSense account is connected
  if (!live && import.meta.env.DEV && wideEnough) {
    return (
      <aside className={`ad-slot ad-${placement} ${className}`} aria-label="Advertisement placeholder">
        <span className="ad-label">Advertisement</span>
        <div className="ad-placeholder">Ad slot: {placement}</div>
      </aside>
    );
  }

  if (!show || !config.client || !slot) return null;

  return (
    <aside className={`ad-slot ad-${placement} ${className}`} aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={config.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
