import { create } from 'zustand';

const KEY = 'chess-arena-ads-consent';

export type Consent = 'granted' | 'denied' | null;

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

interface ConsentState {
  consent: Consent;
  setConsent: (value: 'granted' | 'denied') => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  consent: read(),
  setConsent: (value) => {
    set({ consent: value });
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // the choice lasts for this visit only
    }
  },
}));
