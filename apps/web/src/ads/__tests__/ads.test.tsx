import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { adsEnabled, getAdsConfig } from '../config';
import { useConsentStore } from '../consentStore';
import AdSlot from '../AdSlot';
import AdConsent from '../AdConsent';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const CLIENT = 'ca-pub-1234567890123456';

function mount(node: React.ReactElement) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  act(() => root.render(node));
  return { el, unmount: () => act(() => root.unmount()) };
}

function stubMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

const configure = () => {
  vi.stubEnv('VITE_ADSENSE_CLIENT', CLIENT);
  vi.stubEnv('VITE_ADSENSE_SLOT_HOME', '1111111111');
  vi.stubEnv('VITE_ADSENSE_SLOT_CONTENT', '2222222222');
  vi.stubEnv('VITE_ADSENSE_SLOT_GAME', '3333333333');
};

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  delete window.adsbygoogle;
  useConsentStore.setState({ consent: null });
  stubMedia(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('ads config', () => {
  it('accepts valid ids and rejects malformed ones', () => {
    const ok = getAdsConfig({ VITE_ADSENSE_CLIENT: CLIENT, VITE_ADSENSE_SLOT_HOME: '1234567890' });
    expect(ok.client).toBe(CLIENT);
    expect(ok.slots.home).toBe('1234567890');
    expect(ok.slots.game).toBeNull();

    const bad = getAdsConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-xyz"><script>', VITE_ADSENSE_SLOT_HOME: '12 34' });
    expect(bad.client).toBeNull();
    expect(bad.slots.home).toBeNull();
  });

  it('is enabled only with a client id and at least one slot', () => {
    expect(adsEnabled({})).toBe(false);
    expect(adsEnabled({ VITE_ADSENSE_CLIENT: CLIENT })).toBe(false);
    expect(adsEnabled({ VITE_ADSENSE_SLOT_HOME: '1234567890' })).toBe(false);
    expect(adsEnabled({ VITE_ADSENSE_CLIENT: CLIENT, VITE_ADSENSE_SLOT_HOME: '1234567890' })).toBe(true);
  });
});

describe('consent store', () => {
  it('persists the choice', () => {
    useConsentStore.getState().setConsent('denied');
    expect(localStorage.getItem('chess-arena-ads-consent')).toBe('denied');
    useConsentStore.getState().setConsent('granted');
    expect(useConsentStore.getState().consent).toBe('granted');
  });
});

describe('AdSlot', () => {
  it('shows a labelled placeholder in development when no account is connected', () => {
    const { el, unmount } = mount(<AdSlot placement="home" />);
    expect(el.textContent).toContain('Ad slot: home');
    expect(el.querySelector('ins')).toBeNull();
    unmount();
  });

  it('renders nothing and loads no script until the visitor accepts', () => {
    configure();
    const { el, unmount } = mount(<AdSlot placement="content" />);
    expect(el.querySelector('ins')).toBeNull();
    expect(document.getElementById('adsense-script')).toBeNull();
    unmount();
  });

  it('renders nothing and loads no script after the visitor declines', () => {
    configure();
    useConsentStore.setState({ consent: 'denied' });
    const { el, unmount } = mount(<AdSlot placement="content" />);
    expect(el.querySelector('ins')).toBeNull();
    expect(document.getElementById('adsense-script')).toBeNull();
    unmount();
  });

  it('after consent: renders the unit, loads the script once and requests non-personalised ads', () => {
    configure();
    useConsentStore.setState({ consent: 'granted' });
    const first = mount(<AdSlot placement="content" />);
    const second = mount(<AdSlot placement="home" />);

    const ins = first.el.querySelector('ins.adsbygoogle')!;
    expect(ins.getAttribute('data-ad-client')).toBe(CLIENT);
    expect(ins.getAttribute('data-ad-slot')).toBe('2222222222');
    expect(second.el.querySelector('ins')!.getAttribute('data-ad-slot')).toBe('1111111111');

    const scripts = document.head.querySelectorAll('#adsense-script');
    expect(scripts).toHaveLength(1);
    expect((scripts[0] as HTMLScriptElement).src).toContain(`client=${CLIENT}`);
    expect(window.adsbygoogle!.requestNonPersonalizedAds).toBe(1);
    expect(window.adsbygoogle!.length).toBe(2);
    first.unmount();
    second.unmount();
  });

  it('skips a placement whose slot id is not configured', () => {
    vi.stubEnv('VITE_ADSENSE_CLIENT', CLIENT);
    vi.stubEnv('VITE_ADSENSE_SLOT_HOME', '1111111111');
    useConsentStore.setState({ consent: 'granted' });
    const { el, unmount } = mount(<AdSlot placement="game" />);
    expect(el.querySelector('ins')).toBeNull();
    unmount();
  });

  it('desktopOnly slots are not rendered on narrow screens', () => {
    configure();
    useConsentStore.setState({ consent: 'granted' });
    stubMedia(false);
    const { el, unmount } = mount(<AdSlot placement="game" desktopOnly />);
    expect(el.querySelector('ins')).toBeNull();
    expect(document.getElementById('adsense-script')).toBeNull();
    unmount();
  });
});

describe('AdConsent banner', () => {
  it('is hidden when ads are not configured', () => {
    const { el, unmount } = mount(<AdConsent />);
    expect(el.textContent).toBe('');
    unmount();
  });

  it('asks once, and Accept / Decline record the choice', () => {
    configure();
    const a = mount(<AdConsent />);
    const buttons = a.el.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    act(() => (buttons[1] as HTMLButtonElement).click());
    expect(useConsentStore.getState().consent).toBe('granted');
    expect(a.el.textContent).toBe('');
    a.unmount();

    useConsentStore.setState({ consent: null });
    const b = mount(<AdConsent />);
    act(() => (b.el.querySelectorAll('button')[0] as HTMLButtonElement).click());
    expect(useConsentStore.getState().consent).toBe('denied');
    b.unmount();
  });
});
